<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Cashdesk;
use App\Models\Paymentmethod;
use App\Http\Controllers\Middleweb_Controller;
use DB;

class CasedeskController extends Middleweb_Controller {

    public function index(Request $request) {

        if($request->get('page') == 'bank_transfer'){
            $payment_method = [4];
        }else if($request->get('page') == 'cashdesk_main'){
            $payment_method = [1,2,3,4,5,6];
            // $payment_method = [1,2,3,4,5];
        }
        $invoiceFromDate=$request->get('date').' 00:00:00';
        $invoiceToDate=$request->get('date_end').' 23:59:59';
        $cash = '<i class=\"fa fa-money pointer\" title=\"Cash\">';
        $pin = '<i class=\"fa fa-credit-card pointer\" title=\"Pin\">';
        $creditCard = '<i class=\"fa fa-cc-mastercard pointer\" title=\"Credit card\">';
        $invoice = '<i class=\"fa fa fa-file-text pointer\" title=\"Invoice\">';
        $gift = '<i class=\"fa fa-gift pointer\" title=\"Gift\">';
        $coupon = '<i class=\"fa fa-tag pointer\" title=\"Coupon card\">';

        $invoiceList = Cashdesk::leftJoin('customers', function($join) {
                    $join->on('customers.id', '=', 'invoice.customer_id');
                })->leftJoin('invoice_payment', function($join) {
                    $join->on('invoice_payment.invoice_id', '=', 'invoice.id');
                    
                })->select('invoice.is_received',DB::Raw('DATE_FORMAT(invoice.is_received_date, "%d-%m-%Y") as is_received_date'),'invoice.id', 'customers.firstname', 'customers.lastname', DB::Raw('(CASE WHEN customers.firstname IS NOT NULL 
       THEN concat(customers.firstname," ",customers.lastname)
       ELSE "Walk in customer"
END) AS customerName'), DB::Raw('IFNULL(SUM(invoice_payment.amount),"0.00") as amount'), DB::Raw("IFNULL(group_concat(DISTINCT 
    CASE
    WHEN (invoice_payment.payment_method = 1 AND invoice_payment.amount > 0) THEN '{$cash}'
    WHEN invoice_payment.payment_method = 2 THEN '{$pin}'
    WHEN invoice_payment.payment_method = 3 THEN '{$creditCard}'
    WHEN invoice_payment.payment_method = 4 THEN '{$invoice}'
    WHEN invoice_payment.payment_method = 5 THEN '{$gift}'
    WHEN invoice_payment.payment_method = 6 THEN '{$coupon}'
   
    END
  ORDER BY 1 SEPARATOR ' '),'') as paymethod"))->whereIn('invoice_payment.payment_method',$payment_method)->where('invoice.invoice_date','>=', $invoiceFromDate)->where('invoice.invoice_date','<=', $invoiceToDate)->where('invoice.user_company_id', $this->ExpToken["parent_id"])->orderBy('invoice.id', 'asc')->groupBy('invoice.id')->get()->toarray();



         $paymentList = Paymentmethod::leftJoin('invoice_payment', function($join) {
                    $join->on('invoice_payment.payment_method', '=', 'payment_method.id');
                    })->leftJoin('invoice', function($join) {
                        $join->on('invoice_payment.invoice_id', '=', 'invoice.id');
                    })->select('payment_method.id', DB::Raw('IFNULL(SUM(invoice_payment.amount),"0.00") as amount'))->where('invoice.user_company_id', $this->ExpToken["parent_id"])->where('invoice.invoice_date','>=', $invoiceFromDate)->where('invoice.invoice_date','<=', $invoiceToDate)->where('invoice.user_company_id', $this->ExpToken["parent_id"])->groupBy('invoice_payment.payment_method')->get()->toarray();
        
         $cashOut = DB::table('cash_counter')
                        ->where('created_at','>=',$invoiceFromDate)
                        ->where('created_at','<=',$invoiceToDate)
                        ->where('status','=',0)
                        ->sum('amount');

        $response = array(
            "success" => true,
            "invoiceList" => $invoiceList,
            "paymentList"=>$paymentList,
            "cashOutAmout"=>$cashOut,
           
        );
        return response()->json($response);
    }
    public function paymentMethod(Request $request){
        $paymentList = Paymentmethod::get()->toarray();
        $response = array(
            "success" => false,
            "data"=>$paymentList
           
        );
        return response()->json($response);
    }
    public function addPrefix(Request $request){
        $insertData = $request->all();
        $insertData['user_company_id'] = $this->ExpToken["parent_id"];
        $insertData['created_at'] = date('Y-m-d H:i:s');
        $insertData['updated_at'] = date('Y-m-d H:i:s');
        $insertData['created_by'] = $this->ExpToken["parent_id"];
        $insertData['updated_by'] = $this->ExpToken["parent_id"];

        $save = DB::table('prefix_master')->insert($insertData);
        if($save){
            $response = array(
                "success" => true,
                "message" => "Data save successfully.",
            );
        }else{
            $response = array(
                "success" => false,
                "message" => "Unable to save data.",
            );
        }
        return response()->json($response);
    }
    public function updatePrefix(Request $request){
        $updateData = $request->all();
        $updateData['updated_at'] = date('Y-m-d H:i:s');
        $updateData['updated_by'] = $this->ExpToken["parent_id"];
        $id = $updateData['id'];
        unset($updateData['id']);
        
        $save = DB::table('prefix_master')->where('id',$id)->update($updateData);
        if($save){
            $response = array(
                "success" => true,
                "message" => "Data updated successfully.",
            );
        }else{
            $response = array(
                "success" => false,
                "message" => "Unable to update data.",
            );
        }
        return response()->json($response);
    }
    public function getPrefix(Request $request){
        $data = DB::table('prefix_master')->where('user_company_id',$this->ExpToken["parent_id"])->first();
        
        if($data){
            $response = array(
                'success' => true,
                "data" => $data
            );
        }else{
            $response = array(
                'success' => true,
                "data" => null
            );
        }
        return response()->json($response);
    }

    public function deleteePrefix(Request $request) {
        $data = $request->all();
        $del = DB::table('prefix_master')->where('id',$data['id'])->delete();
        if($del){
            $response = array(
                "success" => true,
                "message" => "Data delete successfully.",
            );
        }else{
            $response = array(
                "success" => false,
                "message" => "Unable to delete data.",
            );
        }
        return response()->json($response);
         
    } 


    public function unpaid_invoice_total_by_customerid($customer_id) {

        $cash = '<i class=\"fa fa-money pointer\" title=\"Cash\">';
        $pin = '<i class=\"fa fa-credit-card pointer\" title=\"Pin\">';
        $creditCard = '<i class=\"fa fa-cc-mastercard pointer\" title=\"Credit card\">';
        $invoice = '<i class=\"fa fa fa-file-text pointer\" title=\"Invoice\">';
        $gift = '<i class=\"fa fa-gift pointer\" title=\"Gift\">';
        $coupon = '<i class=\"fa fa-tag pointer\" title=\"Coupon card\">';

        $invoiceList = Cashdesk::leftJoin('customers', function($join) {
                    $join->on('customers.id', '=', 'invoice.customer_id');
                })->leftJoin('invoice_payment', function($join) {
                    $join->on('invoice_payment.invoice_id', '=', 'invoice.id');
                    
                })->select('invoice.is_received','invoice.id', 'customers.firstname', 'customers.lastname', DB::Raw('(CASE WHEN customers.firstname IS NOT NULL 
       THEN concat(customers.firstname," ",customers.lastname)
       ELSE "Walk in customer"
END) AS customerName'), DB::Raw('IFNULL(SUM(invoice_payment.amount),"0.00") as amount'), DB::Raw("IFNULL(group_concat(DISTINCT 
    CASE
    WHEN (invoice_payment.payment_method = 1 AND invoice_payment.amount > 0) THEN '{$cash}'
    WHEN invoice_payment.payment_method = 2 THEN '{$pin}'
    WHEN invoice_payment.payment_method = 3 THEN '{$creditCard}'
    WHEN invoice_payment.payment_method = 4 THEN '{$invoice}'
    WHEN invoice_payment.payment_method = 5 THEN '{$gift}'
    WHEN invoice_payment.payment_method = 6 THEN '{$coupon}'
   
    END
  ORDER BY 1 SEPARATOR ' '),'') as paymethod"))->where('invoice.is_received',0)->where('invoice.customer_id',$customer_id)->where('invoice_payment.payment_method',4)->where('invoice.user_company_id', $this->ExpToken["parent_id"])->orderBy('invoice.id', 'asc')->groupBy('invoice.id')->get()->toarray();

  
        $response = array(
            "success" => true,
            "unpaidList" => $invoiceList,
        );
        return response()->json($response);
    }





}
