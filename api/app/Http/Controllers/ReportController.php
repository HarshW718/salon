<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Middleweb_Controller;
use PDF;
use DB;
use File;

class ReportController extends Middleweb_Controller {

    public function invoiceReport(Request $request) {
        
        
        $startDate = "'$request->startDate_filter 00:00:00'";
        $endDate = "'$request->endDate_filter 23:59:59'";
        $whereData='user_company_id ='.$this->ExpToken["parent_id"].' AND invoice_date >='.$startDate.' AND invoice_date <='.$endDate;

        
        $whereData .= " AND (incash !='' || pin !='' || credit !='' || invoice !='' || gift !='')";


        if(isset($request->status) && !empty($request->status) || $request->status == 0 && $request->status !=null){
            $whereData.=' AND is_received ='.$request->status;
        }
        if(isset($request->peymentMethod) && !empty($request->peymentMethod)){
            if($request->peymentMethod == 1){
            $whereData.=' AND incash !=""';
            }else if($request->peymentMethod == 2){
            $whereData.=' AND pin !=""';
            }else if($request->peymentMethod == 3){
                $whereData.=' AND credit !=""';
            }else if($request->peymentMethod == 4){
                $whereData.=' AND invoice !=""';
            }else if($request->peymentMethod == 5){
                $whereData.=' AND gift !=""';
            }    
        }
        
          
        $incash = "IFNULL((SELECT sum(amount) FROM invoice_payment WHERE invoice_id=invoice.id AND payment_method=1),0.00) as incash,";

        $pin = "IFNULL((SELECT sum(amount) FROM invoice_payment WHERE invoice_id=invoice.id AND payment_method=2),0.00) as pin,";

        $credit = "IFNULL((SELECT sum(amount) FROM invoice_payment WHERE invoice_id=invoice.id AND payment_method=3),0.00) as credit,";

        $invoice_pay = "IFNULL((SELECT sum(amount) FROM invoice_payment WHERE invoice_id=invoice.id AND payment_method=4),0.00) as invoice,";

        $gift = "IFNULL((SELECT sum(amount)*(-1) FROM invoice_payment WHERE invoice_id=invoice.id AND payment_method=5),0.00) as gift";

        $invoiceData = DB::select( DB::raw("select a.* from (select invoice.user_company_id,invoice.invoice_date,invoice.id,invoice.total_invoice_amount,invoice.is_received,invoice.is_received_date,IFNULL(invoice.comment,'') as comment,invoice.to_pay_id,DATE_FORMAT(invoice.invoice_date,'%d-%m-%Y') as invoiceDate,IFNULL((SELECT CONCAT(firstname,lastname) from customers WHERE id=invoice.customer_id),'') as customerName,IFNULL((SELECT name from users WHERE id=invoice.to_pay_id),'') as associate,CONCAT(DATE_FORMAT(invoice.invoice_date,'%Y'),' ',invoice.id) as number,
        ".$incash."
        ".$pin." 
        ".$credit." 
        ".$invoice_pay."
        ".$gift." 
        from invoice ) as a where ".$whereData."  order by a.invoice_date desc"));
       
        if($request->which_one == 'create_report'){
            $response = array(
                "invoiceList" => $invoiceData,
                "pdf" => 0
            );
            return response()->json($response);
        }else if($request->which_one == 'create_pdf'){
            $response = $this->invoiceReportPDF($invoiceData);
            return response()->json($response);
        }
                
    }

    public function invoiceReportPDF($data) {

      $dynamic_tr = "";
      $invoice_received = "";
      $total_invoice_amount = 0;
      $total_incash = 0;
      $total_pin = 0;
      $total_credit = 0;
      $total_invoice = 0;
      $total_gift = 0;
      foreach($data as $single_data){
        if($single_data->invoice != 0){
            if($single_data->is_received != 0){
                $invoice_received = ' (Received) '.date("d-m-Y", strtotime($single_data->is_received_date));
            }else{
                $invoice_received = ' (Not Received)';
            }
             
        }else{
            $invoice_received = '';
        }

        $recivedDate = '-';
        if($single_data->is_received_date){
          $recivedDate = $single_data->is_received_date;
        }
        
        $dynamic_tr .= "<tr>
            <td>".date("d-m-Y", strtotime($single_data->invoice_date))."</td>
            <td>".$single_data->number."</td>
            <td>".$single_data->customerName."</td>
            <td>₹ ".number_format((float)$single_data->total_invoice_amount, 2, '.', '')."</td>
            <td>₹ ".number_format((float)$single_data->incash, 2, '.', '')."</td>
            <td>₹ ".number_format((float)$single_data->pin, 2, '.', '')."</td>
            <td>₹ ".number_format((float)$single_data->credit, 2, '.', '')."</td>
            <td>₹ ".number_format((float)$single_data->invoice, 2, '.', '').$invoice_received."</td>
            <td>₹ ".number_format((float)$single_data->gift, 2, '.', '')."</td>
            <td>".$single_data->comment."</td>
            <td>".$single_data->associate."</td>
            <td>".$recivedDate."</td>
      </tr>";

      $total_invoice_amount += $single_data->total_invoice_amount;
      $total_incash += $single_data->incash;
      $total_pin += $single_data->pin;
      $total_credit += $single_data->credit;
      $total_invoice += $single_data->invoice;
      $total_gift += $single_data->gift;


      }

        $total_tr = "<tr>
            <td><strong>TOTAL</strong></td>
            <td></td>
            <td></td>
            <td><strong>₹ ".number_format((float)$total_invoice_amount, 2, '.', '')."</strong></td>
            <td><strong>₹ ".number_format((float)$total_incash, 2, '.', '')."</strong></td>
            <td><strong>₹ ".number_format((float)$total_pin, 2, '.', '')."</strong></td>
            <td><strong>₹ ".number_format((float)$total_credit, 2, '.', '')."</strong></td>
            <td><strong>₹ ".number_format((float)$total_invoice, 2, '.', '')."</strong></td>
            <td><strong>₹ ".number_format((float)$total_gift, 2, '.', '')."</strong></td>
            <td></td>
            <td></td>
        </tr>";

      $style = "table {
        font-family: arial, sans-serif;
        border-collapse: collapse;
        width: 100%;
      }
      
      td, th {
        border: 1px solid #dddddd;
        text-align: left;
        padding: 8px;
      }
      
      tr:nth-child(even) {
        background-color: #dddddd;
      }";
      $title = "All invoices";
      $html =  "<!DOCTYPE html>
        <html>
        <head>
        <style>
        ".$style."
        </style>
        </head>
        <body>
        <h2>".$title."</h2>
        <table>
          <tr>
            <th>Date</th>
            <th>Number</th>
            <th>Customer</th>
            <th>Total</th>
            <th>In cash</th>
            <th>Pin</th>
            <th>Credit</th>
            <th>Invoice</th>
            <th>Gift Cert</th>
            <th>Note</th>
            <th>Associate</th>
            <th>Received date</th>
          </tr>
          ".$dynamic_tr.$total_tr."
        </table>
        
        </body>
        </html>
        ";

            $upload_path = str_replace("api", "uploads/pdf/", base_path());
            $pdf_name = date('mdYHis') . uniqid() . 'invoiceReport.pdf';
            PDF::loadHTML($html)->setPaper('a4', 'landscape')->setWarnings(false)->save($upload_path . $pdf_name);
            $response = array(
                "invoiceList" => 0,
                "pdf_name" => $pdf_name,
                "href" => "http://" . $_SERVER['SERVER_NAME'] . "/salon/"."uploads/pdf/".$pdf_name
            );
            return $response;
        
            }

        public function invoiceReportPDFDelete($pdf_name) {  
            
            $file_path = str_replace("api", "uploads/pdf/", base_path());
            if(File::exists($file_path.$pdf_name)) {
                File::delete($file_path.$pdf_name);
                $response = array(
                    "msg" => 'delete successfully !!',
                );
                return response()->json($response);
            }
            
        }





    public function totalReport(Request $request) {
        

       
        $whereData='';
        $startDate = "'$request->startDate_filter 00:00:00'";
        $endDate = "'$request->endDate_filter 23:59:59'";
        $whereData='invoice.user_company_id ='.$this->ExpToken["parent_id"];
        $whereData .=' AND invoice_payment.payment_method IS NOT NULL AND invoice_payment.payment_method!=5 AND invoice.invoice_date >='.$startDate.'AND invoice.invoice_date <='.$endDate;
        if(isset($request->employee) && !empty($request->employee)){
            $whereData.=' AND invoice.to_pay_id ='.$request->employee;
        }
        $invoiceData = DB::select( DB::raw("SELECT invoice_payment.payment_method,sum(invoice_payment.amount) as totalAmount,count(invoice_payment.invoice_id) as totalItem,(CASE
        WHEN invoice_payment.payment_method = 1 THEN 'In Cash'
        WHEN invoice_payment.payment_method = 2 THEN 'Pin'
        WHEN invoice_payment.payment_method = 3 THEN 'Credit card' 
        WHEN invoice_payment.payment_method = 4 THEN 'Invoice'
        WHEN invoice_payment.payment_method = 6 THEN 'Coupon Card'
        END) as paymentType  FROM `invoice` left join invoice_payment ON invoice_payment.invoice_id=invoice.id where ".$whereData." GROUP BY invoice_payment.payment_method"));
        $whereRevenuData='';
        $whereRevenuData .=' WHERE invoice.user_company_id ='.$this->ExpToken["parent_id"];
        $whereRevenuData .=' AND invoice_data.which_one!="" AND invoice.invoice_date >='.$startDate.'AND invoice.invoice_date <='.$endDate;
        if(isset($request->employee) && !empty($request->employee)){
            $whereRevenuData.=' AND invoice.to_pay_id ='.$request->employee;
        }
        $revenueData = DB::select( DB::raw(" SELECT a.*,IFNULL(ROUND(a.amount-(a.amount/(1+(a.tax/100))),2),0) as withouttax FROM ( SELECT invoice_data.which_one,sum(single_row_total) as amount,invoice_data.data_id, count(invoice_data.data_id) as totalItem,
        (CASE
        WHEN invoice_data.which_one='service' THEN (select name from services WHERE id=invoice_data.data_id)
        WHEN invoice_data.which_one='product' THEN (select name from products WHERE id=invoice_data.data_id)
        WHEN invoice_data.which_one='coupon' THEN (select description from coupons WHERE id=invoice_data.data_id)
        WHEN invoice_data.which_one='gift' THEN invoice_data.description
        END) as nameofType
        ,(select tax_value from taxs WHERE id=invoice_data.tax_id) as tax
        FROM invoice LEFT JOIN invoice_data ON invoice_data.invoice_id=invoice.id  
        ".$whereRevenuData."
        GROUP BY invoice_data.which_one,invoice_data.data_id) as a"));
       

        $whereGroupByTaxProduct='';
        $whereGroupByTaxProduct .=' WHERE invoice.user_company_id ='.$this->ExpToken["parent_id"];
        $whereGroupByTaxProduct .=' AND invoice_data.which_one!="" AND invoice.invoice_date >='.$startDate.'AND invoice.invoice_date <='.$endDate;
        if(isset($request->employee) && !empty($request->employee)){
            $whereGroupByTaxProduct.=' AND invoice.to_pay_id ='.$request->employee;
        }

        

        $groupByTaxProduct = DB::select( DB::raw("SELECT taxs.*,IFNULL(abc.tax_no, 0) as tax_no  , IFNULL(abc.tax_amount, 0) as tax_amount FROM taxs LEFT JOIN
        (SELECT invoice_data.tax_id,count(invoice_data.id) as tax_no,sum(invoice_data.single_row_total) as tax_amount FROM invoice_data WHERE invoice_id in (SELECT id FROM invoice ".$whereGroupByTaxProduct." ) AND which_one = 'product' GROUP BY invoice_data.tax_id) abc
        ON taxs.id = abc.tax_id WHERE taxs.user_company_id = ".$this->ExpToken["parent_id"]));


        $whereGroupByTaxService='';
        $whereGroupByTaxService .=' WHERE invoice.user_company_id ='.$this->ExpToken["parent_id"];
        $whereGroupByTaxService .=' AND invoice_data.which_one!="" AND invoice.invoice_date >='.$startDate.'AND invoice.invoice_date <='.$endDate;
        if(isset($request->employee) && !empty($request->employee)){
            $whereGroupByTaxService.=' AND invoice.to_pay_id ='.$request->employee;
        }

        $groupByTaxService = DB::select( DB::raw( "SELECT taxs.*,IFNULL(abc.tax_no, 0) as tax_no  , IFNULL(abc.tax_amount, 0) as tax_amount FROM taxs LEFT JOIN
        (SELECT invoice_data.tax_id,count(invoice_data.id) as tax_no,sum(invoice_data.single_row_total) as tax_amount FROM invoice_data WHERE invoice_id in (SELECT id FROM invoice ".$whereGroupByTaxService." ) AND which_one = 'service' GROUP BY invoice_data.tax_id) abc
        ON taxs.id = abc.tax_id WHERE taxs.user_company_id = ".$this->ExpToken["parent_id"]));


        



        if($request->which_one == 'create_report'){
            $response = array(
                "totalPaymentMethod" => $invoiceData,
                "revenueData" => $revenueData,
                "productByTax" => $groupByTaxProduct,
                "servicceByTax" => $groupByTaxService,
                "pdf" => 0
            );
            
            return response()->json($response);
           
        }else if($request->which_one == 'create_pdf'){
            $response = $this->totalReportPDF($invoiceData,$revenueData,$groupByTaxProduct,$groupByTaxService);
            return response()->json($response);
        }


    }
    public function totalReportPDF($invoiceData,$revenueData,$groupByTaxProduct,$groupByTaxService) {


        // print_r($groupByTaxProduct);
        // die;
        $revenue_dynamic_tr = "";
        $revenue_total = 0;
        foreach($revenueData as $single_revenue){
          $revenue_dynamic_tr .= "<tr>
              <td>(".$single_revenue->totalItem.")".$single_revenue->nameofType."</td>
              <td>₹ ".number_format((float)$single_revenue->amount, 2, '.', '')."</td>
                </tr>";
                $revenue_total += $single_revenue->amount;
        }
       $revenue_total_tr = "<tr>
              <td><strong>TOTAL</strong></td>
              <td><strong>₹ ".number_format((float)$revenue_total, 2, '.', '')."</strong></td>
          </tr>";



          $revenue_without_tax_dynamic_tr = "";
          $revenue_without_tax_total = 0;
          foreach($revenueData as $single_revenue_without_tax){
            if($single_revenue_without_tax->withouttax > 0){
                $revenue_without_tax_dynamic_tr .= "<tr>
                <td>(".$single_revenue_without_tax->totalItem.")".$single_revenue_without_tax->nameofType."</td>
                <td>₹ ".number_format((float)$single_revenue_without_tax->withouttax, 2, '.', '')."</td>
                  </tr>";
                  $revenue_without_tax_total += $single_revenue_without_tax->withouttax;
            }
          }
         $revenue_without_tax_total_tr = "<tr>
                <td><strong>TOTAL</strong></td>
                <td><strong>₹ ".number_format((float)$revenue_without_tax_total, 2, '.', '')."</strong></td>
            </tr>";

  

          $receipt_dynamic_tr = "";
          $receipt_total = 0;
          foreach($invoiceData as $single_receipt){
            $receipt_dynamic_tr .= "<tr>
                <td>(".$single_receipt->totalItem.")".$single_receipt->paymentType."</td>
                <td>₹ ".number_format((float)$single_receipt->totalAmount, 2, '.', '')."</td>
                  </tr>";
                  $receipt_total += $single_receipt->totalAmount;
          }
         $receipt_total_tr = "<tr>
                <td><strong>TOTAL</strong></td>
                <td><strong>₹ ".number_format((float)$receipt_total, 2, '.', '')."</strong></td>
            </tr>";


        $product_by_tax_dynamic_tr = "";
        $product_by_tax_total = 0;
        foreach($groupByTaxProduct as $single_product_by_tax){
          $product_by_tax_dynamic_tr .= "<tr>
              <td>(".$single_product_by_tax->tax_no.")".$single_product_by_tax->name."(".$single_product_by_tax->tax_value."%)</td>
              <td>₹ ".number_format((float)$single_product_by_tax->tax_amount, 2, '.', '')."</td>
                </tr>";
                $product_by_tax_total += $single_product_by_tax->tax_amount;
        }
       $product_by_tax_total_tr = "<tr>
              <td><strong>TOTAL</strong></td>
              <td><strong>₹ ".number_format((float)$product_by_tax_total, 2, '.', '')."</strong></td>
          </tr>";

          $service_by_tax_dynamic_tr = "";
          $service_by_tax_total = 0;
          foreach($groupByTaxService as $single_service_by_tax){
            $service_by_tax_dynamic_tr .= "<tr>
                <td>(".$single_service_by_tax->tax_no.")".$single_service_by_tax->name."(".$single_service_by_tax->tax_value."%)</td>
                <td>₹ ".number_format((float)$single_service_by_tax->tax_amount, 2, '.', '')."</td>
                  </tr>";
                  $service_by_tax_total += $single_service_by_tax->tax_amount;
          }
         $service_by_tax_total_tr = "<tr>
                <td><strong>TOTAL</strong></td>
                <td><strong>₹ ".number_format((float)$service_by_tax_total, 2, '.', '')."</strong></td>
            </tr>";




        $style = "table {
          font-family: arial, sans-serif;
          border-collapse: collapse;
          width: 100%;
        }
        
        td, th {
          border: 1px solid #dddddd;
          text-align: left;
          padding: 8px;
        }
        
        tr:nth-child(even) {
          background-color: #dddddd;
        }";
        $revenue_title = "Revenue";
        $receipts_title = "Receipts";
        $revenue_without_tax_title = "VAT per group";
        $product_by_tax_title = "Product Group By Tax";
        $service_by_tax_title = "Group By Tax Services";
        $html =  "<!DOCTYPE html>
          <html>
          <head>
          <style>
          ".$style."
          </style>
          </head>
          <body>
          <h2>".$revenue_title."</h2>
          <table>
            <tr>
              <th colspan='2'><strong>REVENUE</strong></th>
            </tr>
            ".$revenue_dynamic_tr.$revenue_total_tr."
          </table>
          <h2>".$receipts_title."</h2>
          <table>
            <tr>
              <th colspan='2'><strong>RECEIPT</strong></th>
            </tr>
            ".$receipt_dynamic_tr.$receipt_total_tr."
          </table>
          <h2>".$revenue_without_tax_title."</h2>
          <table>
            <tr>
              <th colspan='2'><strong>".$revenue_without_tax_title."</strong></th>
            </tr>
            ".$revenue_without_tax_dynamic_tr.$revenue_without_tax_total_tr."
          </table>
          <h2>".$product_by_tax_title."</h2>
          <table>
            <tr>
              <th colspan='2'><strong>".$product_by_tax_title."</strong></th>
            </tr>
            ".$product_by_tax_dynamic_tr.$product_by_tax_total_tr."
          </table>
          <h2>".$service_by_tax_title."</h2>
          <table>
            <tr>
              <th colspan='2'><strong>".$service_by_tax_title."</strong></th>
            </tr>
            ".$service_by_tax_dynamic_tr.$service_by_tax_total_tr."
          </table>
          </body>
          </html>
          ";

            $upload_path = str_replace("api", "uploads/pdf/", base_path());
            $pdf_name = date('mdYHis') . uniqid() . 'totalReport.pdf';
            PDF::loadHTML($html)->setPaper('a4', 'landscape')->setWarnings(false)->save($upload_path . $pdf_name);
        
            $response = array(
                "invoiceList" => 0,
                "pdf_name" => $pdf_name,
                "href" => "http://" . $_SERVER['SERVER_NAME'] . "/salon/"."uploads/pdf/".$pdf_name
            );
            return $response;
    }

    public function totalReportPDFDelete($pdf_name) {  
            
        $file_path = str_replace("api", "uploads/pdf/", base_path());
        if(File::exists($file_path.$pdf_name)) {
            File::delete($file_path.$pdf_name);
            $response = array(
                "msg" => 'delete successfully !!',
            );
            return response()->json($response);
        }
        
    }

    public function salesReport(Request $request) {
        $startDate = "'$request->startDate_filter 00:00:00'";
        $endDate = "'$request->endDate_filter 23:59:59'";
        $whereData='';
        $whereData .='products_categories.user_company_id ='.$this->ExpToken["parent_id"];
        $whereScData='';
        $whereScData .='services_categories.user_company_id ='.$this->ExpToken["parent_id"];
        $whereProductData='';
        $whereProductData .='products.user_company_id ='.$this->ExpToken["parent_id"].' AND invoice_data.which_one ="product" AND invoice_data.user_company_id='.$this->ExpToken["parent_id"].' AND invoice.user_company_id='.$this->ExpToken["parent_id"].' AND invoice.invoice_date >='.$startDate.' AND invoice.invoice_date <='.$endDate;
        if(isset($request->status) && !empty($request->status) || $request->status == 0 && $request->status !=null){
            $whereProductData .= ' AND invoice.is_received ='.$request->status;
        }
        $whereServiceData='';
        $whereServiceData .='services.user_company_id ='.$this->ExpToken["parent_id"].' AND invoice_data.which_one ="service" AND invoice_data.user_company_id='.$this->ExpToken["parent_id"].' AND invoice.user_company_id='.$this->ExpToken["parent_id"].' AND invoice.invoice_date >='.$startDate.' AND invoice.invoice_date <='.$endDate;
        if(isset($request->status) && !empty($request->status) || $request->status == 0 && $request->status !=null){
            $whereServiceData .= ' AND invoice.is_received ='.$request->status;
        }
        $product_categories=DB::select( DB::raw("SELECT products_categories.id,products_categories.name from products_categories WHERE ".$whereData));
         
        $products=DB::select( DB::raw("SELECT c.*,f.*,ROUND((c.amount*100)/f.totalCatAmount,2) as totalPer,ROUND((c.withouttaxAmount*100)/f.totalCatAmountWithoutTax,2) as totalPerWithoutTax FROM (SELECT a.*,round((a.amount/a.totalItem),2) as singleAmount,ROUND(a.amount/(1+(a.tax_value/100)),2) as withouttaxAmount, ROUND(a.amount/(1+(a.tax_value/100))/a.totalitem,2) as withoutTaxSingleAmount FROM (SELECT products.id,taxs.tax_value,products.name,products.category_id,sum(invoice_data.single_row_total) as amount,count(invoice_data.data_id) as totalItem FROM products INNER JOIN taxs ON taxs.id=products.tax_id  INNER JOIN invoice_data ON invoice_data.data_id=products.id INNER JOIN invoice ON invoice.id=invoice_data.invoice_id WHERE $whereProductData group by invoice_data.data_id ) as a ) as c left join (SELECT category_id,SUM(b.amount) as totalCatAmount,sum(b.withouttaxAmount) as totalCatAmountWithoutTax FROM (SELECT a.*,round((a.amount/a.totalItem),2) as singleAmount,ROUND(a.amount/(1+(a.tax_value/100)),2) as withouttaxAmount, ROUND(a.amount/(1+(a.tax_value/100))/a.totalitem,2) as withoutTaxSingleAmount FROM (SELECT products.id,taxs.tax_value,products.name,products.category_id,sum(invoice_data.single_row_total) as amount,count(invoice_data.data_id) as totalItem FROM products INNER JOIN taxs ON taxs.id=products.tax_id INNER JOIN invoice_data ON invoice_data.data_id=products.id INNER JOIN invoice ON invoice.id=invoice_data.invoice_id WHERE $whereProductData group by invoice_data.data_id ) as a) as b GROUP BY category_id ) as f ON c.category_id=f.category_id"));
        $services_categories=DB::select( DB::raw("SELECT services_categories.id,services_categories.name from services_categories WHERE ".$whereScData));
        $services=DB::select( DB::raw("SELECT services.id,services.name,services.category_id,sum(invoice_data.single_row_total) as amount,count(invoice_data.data_id) as totalItem, invoice_data.single_row_total as singleAmount FROM services INNER JOIN invoice_data ON invoice_data.data_id=services.id INNER JOIN invoice ON invoice.id=invoice_data.invoice_id WHERE ".$whereServiceData." group by invoice_data.data_id "));
        
        
        
        if($request->which_one == 'create_report'){
            $response = array(
                "success" => true,
                "product_categories" => $product_categories,
                "products" => $products,
                "service_categories" => $services_categories,
                "services" => $services,
                "pdf" => 0
            );
            
            return response()->json($response);
           
        }else if($request->which_one == 'create_pdf'){
            $response = $this->salesReportPDF($product_categories,$products,$services_categories,$services,$request->displayIncludeVat);
            return response()->json($response);
        }


    }

    public function salesReportPDF($product_categories,$products,$services_categories,$services,$include_vat) {
    
        $product_dynamic_tr = "";
        $total_sale_by_cat = 0;
        foreach($product_categories as $single_category){
        
          $category_id = $single_category->id;
          $product_dynamic_tr .= "<tr style='background-color: #dddddd;'>
              <th colspan='5'>".$single_category->name."</th>
                </tr>";
          $products_by_cat = array_filter($products,function($single_product) use ($category_id){
            return ($category_id == $single_product->category_id);
          });
          if(count($products_by_cat)>0){
            foreach($products_by_cat as $single_product_by_cat){

              if($include_vat == 1){
                $amount = $single_product_by_cat->amount;
                $singleAmount = $single_product_by_cat->singleAmount;
              }else{
                $amount = $single_product_by_cat->withouttaxAmount;
                $singleAmount = $single_product_by_cat->withoutTaxSingleAmount;
              }
             
              $product_dynamic_tr .= "<tr>
              <td>".$single_product_by_cat->name."</td>
              <td>₹ ".number_format((float)$amount, 2, '.', '') ."</td>
              <td>".$single_product_by_cat->totalItem."</td>
              <td>₹ ".number_format((float)$singleAmount, 2, '.', '') ."</td>
              <td>".$single_product_by_cat->totalPer."%</td>
              </tr>";
  
              $total_sale_by_cat += $amount;
            }
            $product_dynamic_tr .= "<tr>
              <td></td>
              <td><strong>₹ ".number_format((float)$total_sale_by_cat, 2, '.', '')."</strong></td>
              <td></td>
              <td></td>
              <td></td>
              </tr>";
          }
         
        }
          
        $service_dynamic_tr = "";
        $total_sale_by_cat = 0;
        foreach($services_categories as $single_category){
        
          $category_id = $single_category->id;
          $service_dynamic_tr .= "<tr style='background-color: #dddddd;'>
              <th colspan='5'>".$single_category->name."</th>
                </tr>";
          $services_by_cat = array_filter($services,function($single_service) use ($category_id){
            return ($category_id == $single_service->category_id);
          });
          if(count($services_by_cat)>0){
            foreach($services_by_cat as $single_service_by_cat){

              $service_dynamic_tr .= "<tr>
              <td>".$single_service_by_cat->name."</td>
              <td>₹ ".number_format((float)$single_service_by_cat->amount, 2, '.', '') ."</td>
              <td>".$single_service_by_cat->totalItem."</td>
              <td>₹ ".number_format((float)$single_service_by_cat->singleAmount, 2, '.', '') ."</td>
              </tr>";
  
              $total_sale_by_cat += $single_service_by_cat->amount;
            }
            $service_dynamic_tr .= "<tr>
              <td></td>
              <td><strong>₹ ".number_format((float)$total_sale_by_cat, 2, '.', '')."</strong></td>
              <td></td>
              <td></td>
             
              </tr>";
          }
         
        }

        $style = "table {
          font-family: arial, sans-serif;
          border-collapse: collapse;
          width: 100%;
        }
        
        td, th {
          border: 1px solid #dddddd;
          text-align: left;
          padding: 8px;
        }
        
       ";




        $title = "Sales Report";
        $subtitle = ($include_vat == 1) ? "Exclusive of VAT" : "Include VAT";
        if(count($products) > 0){
          $product_table = "<h2>".$title." For Product (".$subtitle.")</h2>
          <table>
            <tr>
              <th>Products</th>
              <th>Sale</th>
              <th>Number</th>
              <th>Gem.</th>
              <th>% of Total</th>
              
            </tr>
            ".$product_dynamic_tr."
          </table>";
        }else{
          $product_table = '';
        }
        
        if(count($services) > 0){
        $service_table = "<h2>".$title." For Services (".$subtitle.")</h2>
        <table>
          <tr>
            <th>Services</th>
            <th>Sale</th>
            <th>Number</th>
            <th>Gem.</th>
          </tr>
          ".$service_dynamic_tr."
        </table>";
        }else{
          $service_table = '';
        }

        $html =  "<!DOCTYPE html>
          <html>
          <head>
          <style>
          ".$style."
          </style>
          </head>
          <body>".$product_table.$service_table."
          
          </body>
          </html>
          ";
  
              $upload_path = str_replace("api", "uploads/pdf/", base_path());
              $pdf_name = date('mdYHis') . uniqid() . 'salesReport.pdf';
              PDF::loadHTML($html)->setPaper('a4', 'landscape')->setWarnings(false)->save($upload_path . $pdf_name);
          
              $response = array(
                  "invoiceList" => 0,
                  "pdf_name" => $pdf_name,
                  "href" => "http://" . $_SERVER['SERVER_NAME'] . "/salon/"."uploads/pdf/".$pdf_name
              );
              return $response;


    }

    public function salesReportPDFDelete($pdf_name) {  
            
        $file_path = str_replace("api", "uploads/pdf/", base_path());
        if(File::exists($file_path.$pdf_name)) {
            File::delete($file_path.$pdf_name);
            $response = array(
                "msg" => 'delete successfully !!',
            );
            return response()->json($response);
        }
        
    }
   
}
