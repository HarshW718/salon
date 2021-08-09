<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CashdeskInvoice;
use App\Models\Paymentmethod;
use App\Models\CashCounter;
use App\Models\Common;
use App\Http\Controllers\Middleweb_Controller;
use Config;
use DB;

class CashdeskInvoiceController extends Middleweb_Controller
{

    public function index()
    {
        
        $cashdeskInvoice = CashdeskInvoice::where('user_company_id',$this->ExpToken["parent_id"])->select('*')->get()->toArray();
        
        if(!empty($cashdeskInvoice)){
            $newtempate_description=$this->replaceData($cashdeskInvoice[0]['tempate_description']);
            $cashdeskInvoice[0]['newtempate_description']=$newtempate_description;
            $response = array(
                "success" => false,
                "data" => $cashdeskInvoice,
            );
        }else {
            $response = array(
                "success" => true,
                "data" => $cashdeskInvoice,
            );
        }
        return response()->json($response);
    }
    public function replaceData($data)
    {
        $companyData = Common::mailData('company_details', ['user_company_id' => $this->ExpToken["parent_id"]]);
        $company_data    = $companyData[0];
        $imageUrl        = Config::get('constants.displayImageUrl');
        $company_logo    =  empty($companyData) ? '' : $imageUrl . 'company_logo/' . $companyData[0]->company_logo;

        $company_name    = empty($companyData) ? '' : $company_data->company_name;
        $company_number  = empty($companyData) ? '' : $company_data->mobile;
        $company_email   = empty($companyData) ? '' : $company_data->email;
        $company_address = empty($companyData) ? '' : $company_data->address;
        if (strpos($data, '[[company-name]]') !== false) {
            $data = str_replace("[[company-name]]", $company_name, $data);
        }
        if (strpos($data, '[[company-logo]]') !== false) {
             $data = str_replace("[[company-logo]]", '<img src="'.$company_logo.'">', $data);
        }
        if (strpos($data, '[[company-number]]') !== false) {
            $data = str_replace("[[company-number]]", $company_number, $data);
        }
        if (strpos($data, '[[company-email]]') !== false) {
            $data = str_replace("[[company-email]]", $company_email, $data);
        }
        if (strpos($data, '[[company-address]]') !== false) {
            $data = str_replace("[[company-address]]", $company_address, $data);
        }
        if (strpos($data, '[[certificate-number]]') !== false) {
            $data = str_replace("[[certificate-number]]", '123456', $data);
        }
        if (strpos($data, '[[customer-firstname]]') !== false) {
            $data = str_replace("[[customer-firstname]]", 'Sara', $data);
        }
        if (strpos($data, '[[customer-lastname]]') !== false) {
            $data = str_replace("[[customer-lastname]]", 'P', $data);
        }
        if (strpos($data, '[[customer-address]]') !== false) {
            $data = str_replace("[[customer-address]]", '123 Place', $data);
        }
        if (strpos($data, '[[customer-number]]') !== false) {
            $data = str_replace("[[customer-number]]", '123456789', $data);
        }
        if (strpos($data, '[[invoice-number]]') !== false) {
            $data = str_replace("[[invoice-number]]", '123456789', $data);
        }
        if (strpos($data, '[[invoice-date]]') !== false) {
            $data = str_replace("[[invoice-date]]", date('Y-m-d'), $data);
        }
        if (strpos($data, '[[customer-birthdate]]') !== false) {
            $data = str_replace("[[customer-birthdate]]", date('Y-m-d'), $data);
        }
        if (strpos($data, '[[invoice-amount]]') !== false) {
            $data = str_replace("[[invoice-amount]]", '123.23', $data);
        }
        if (strpos($data, '[[item-details]]') !== false) {
            $tableData=' <table id="invoiceMdlTbl" border="0" cellpadding="1" cellspacing="1" style="width: 100%;">
        <tbody>
            <tr>
                <td width="15%"><strong style="padding:5px;font-size:small;">Date</strong></td>
                
                <td><strong style="padding:5px;font-size:small;">Item</strong></td>
                <td><strong style="padding:5px;font-size:small;"></strong></td>
                <td><strong style="padding:5px;font-size:small;"></strong></td>
                <td><strong style="padding:5px;font-size:small;"></strong></td>
                <td><strong style="padding:5px;font-size:small;"></strong></td>
                <td style="text-align:right;padding:5px;font-size: small;"><strong>Total</strong></td>
            </tr>
            <tr>
                <td style="padding:5px;">28-08-2020</td>
                <td style="padding:5px;">-</td>
                <td style="padding:5px;">1 x Nails polish </td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td style="text-align: right;">₹60</td>
            </tr>
        </tbody>
    </table><br>
    <table id="tblTax1" border="0" cellpadding="1" cellspacing="1" style="width: 30%;float: right; clear: both;margin-bottom: 10px; border-color:#ccc;">
        <tbody>
            <tr>
                <td><strong style="padding:5px;font-size:small;">BTW</strong></td>
                <td style="text-align:right;padding:5px;font-size: small;"><strong>Amount</strong></td>
            </tr>
            <tr>
                <td style="padding:5px;"><span style="padding:2px;">Laag 10 %</span></td>
                <td style="text-align: right;padding:2px;">₹5.45</td>
            </tr>
        </tbody>
    </table><br>
    <table id="tblTax" border="0" cellpadding="1" cellspacing="1" style="width: 30%;float: right; clear: both; margin-bottom: 10px; border-color:#ccc;">
        <tbody>
            <tr>
                <td><strong style="padding:5px;font-size:small;">Betaalmethod</strong></td>
                <td style="text-align:right;padding:5px;font-size: small;"><strong>Amount</strong></td>
            </tr>
            <tr>
                <td style="padding:5px;"><span style="padding:2px;">In cash</span></td>
                <td style="text-align: right;padding:2px;">₹60.00</td>
            </tr>
        </tbody>
    </table><br>
    <table border="0" cellpadding="1" cellspacing="1" style="width: 30%;float:right; clear: both;margin-bottom: 10px; border-color:#ccc;">
        <tbody>
            <tr>
                <td><strong style="padding:5px;font-size:small;">Total Amount</strong></td>
                <td style="text-align:right;padding:5px;font-size: small;"><strong>₹60</strong></td>
            </tr>
        </tbody>
    </table>';
            $data = str_replace("[[item-details]]", $tableData, $data);
        }
        
        return $data;
    }
    public function store(Request $request)
    {
        
        $template=[];
        $template['tempate_description'] = $request->get('tempate_description');
        $template['template_type'] = $request->get('template_type');
        $template['user_company_id'] = $this->ExpToken["parent_id"];
        $template['created_by'] = $this->ExpToken["user_id"];
        $template['updated_by'] = $this->ExpToken["user_id"];
        $template['created_at'] = date('Y-m-d H:i:s');
        $template['updated_at'] = date('Y-m-d H:i:s');
        $template_insert = CashdeskInvoice::create($template);
        $template_id = $template_insert->id;
        if($template_id){
            $response = array(
                "success" => false,
                "message" => "Tempate added successfully.",
            );
        }else {
            $response = array(
                "success" => true,
                "message" => "Tempate not added successfully.",
            );
        }
        return response()->json($response);
        
    }
    public function update(Request $request)
    {
        $invoice = CashdeskInvoice::find($request->get('id'));
        $invoice->tempate_description = $request->get('tempate_description');
        $invoice->user_company_id = $this->ExpToken["parent_id"];
        $invoice->updated_by = $this->ExpToken["user_id"];
        $invoice->updated_at = date('Y-m-d H:i:s');
        if($invoice->save()){
             $response = array(
                "success" => false,
                "message" => "Template updated successfully.",
            );
        }else {
            $response = array(
                "success" => true,
                "message" => "Error from database",
            );
        }
        return response()->json($response);
    }
    public function preview(Request $request)
    {
        if($request->get('id')){
            $invoice = CashdeskInvoice::find($request->get('id'));
            $invoice->tempate_description = $request->get('tempate_description');
            $invoice->invoice_title = $request->get('invoice_title');
            $invoice->user_company_id = $this->ExpToken["parent_id"];
            $invoice->updated_by = $this->ExpToken["user_id"];
            $invoice->updated_at = date('Y-m-d H:i:s');
            if($invoice->save()){
                 $response = array(
                    "success" => false,
                    "message" => "Template updated successfully.",
                );
            }else {
                $response = array(
                    "success" => true,
                    "message" => "Error from database",
                );
            }
        }else {
            $invoice = CashdeskInvoice::where('template_type',1)->where('user_company_id',$this->ExpToken["parent_id"])->select('*')->get()->toarray();
           
            if(!empty($invoice)){
                $invoice = CashdeskInvoice::find($invoice[0]['id']);
                $invoice->tempate_description = $request->get('tempate_description');
                $invoice->invoice_title = $request->get('invoice_title');
                $invoice->updated_by = $this->ExpToken["user_id"];
                $invoice->updated_at = date('Y-m-d H:i:s');
                $template_id=$invoice->save();
            }else {
                $template=[];
                $template['tempate_description'] = $request->get('tempate_description');
                $template['template_type'] = $request->get('template_type');
                $template['invoice_title'] = $request->get('invoice_title');
                $template['user_company_id'] = $this->ExpToken["parent_id"];
                $template['created_by'] = $this->ExpToken["user_id"];
                $template['updated_by'] = $this->ExpToken["user_id"];
                $template['created_at'] = date('Y-m-d H:i:s');
                $template['updated_at'] = date('Y-m-d H:i:s');
                $template_insert = CashdeskInvoice::create($template);
                $template_id = $template_insert->id;
            }
            if($template_id){
                $response = array(
                    "success" => false,
                    "message" => "Template added successfully.",
                );
            }else {
                $response = array(
                    "success" => true,
                    "message" => "Template not added successfully.",
                );
            } 
        }
        
        return response()->json($response);
    }
    public function payment_method($setting_or_payment_page){
        
        if($setting_or_payment_page == 0){
            //if $setting_or_payment_page == 0 this is for setting page
            $payment_method = Paymentmethod::whereNotIn('id', [6])->get();
        }else{
            //if $setting_or_payment_page == 1 this is for payment page
            $payment_method = Paymentmethod::where('is_check',1)->whereNotIn('id', [6])->get();
        }
        
        
        $response = array(
            "success" => true,
            "data" => $payment_method,
        );
        return response()->json($response);
    }


    public function update_payment_method(Request $request){
        if($request->user_company_id != $this->ExpToken["parent_id"]){
            $response = array(
                "success" => false,
                "message" => "You are not authorized to change payment method !!",
            );
        }else{
            $payment_method = Paymentmethod::find($request->id);
            $payment_method->is_check = ($request->is_check == true) ? 1 : 0;
            $payment_method->save();
            $response = array(
                "success" => true,
                "message" => 'Payment method update successfully.',
            );
        }
        return response()->json($response);
    }




    public function CashCounterIn(Request $request){

     
       $cashcounter = CashCounter::where('user_company_id',$this->ExpToken["parent_id"])->orderBy('id', 'desc')->first();
        if(empty($cashcounter)){
            $current_cash = 0;
        }else{
            $current_cash = $cashcounter->current_cash;
        }
        if($request->status == 1){
         $status = 1;
        }else{
            $status = 0;
        }
        $cash_counter = new CashCounter();
        $cash_counter->user_company_id = $this->ExpToken["parent_id"];
        $cash_counter->status = $status;
        $cash_counter->amount = $request->amount;
        if($status == 1){
            $cash_counter->current_cash = $current_cash + $request->amount; 
        }else{
            $cash_counter->current_cash = $current_cash  - $request->amount; 
        }  
        $cash_counter->payment_date = date('Y-m-d H:i:s');
        $cash_counter->note = $request->small_note;
        $cash_counter->created_by = $this->ExpToken["user_id"];
        $cash_counter->updated_by = $this->ExpToken["user_id"];
        $cash_counter->created_at = date('Y-m-d H:i:s');
        $cash_counter->updated_at = date('Y-m-d H:i:s');
        $cash_counter->save();
        $response = array(
            "success" => true,
            "message" => ($status == 1) ? 'Cash-in add successfully.' : 'Cash-out add successfully.',
        );
    
        return response()->json($response);
    }

    public function CashCounter(Request $request){
        
   
        $limit = $request->get('length');
        $start = $request->get('start');
        $draw = $request->get('draw');
        $sort_by  = $request->get('column_name');
        $sort_order = $request->get('order');
        $search = $request->get('search');
        $current_date = $request->get('current_date');
        $start_date = $request->get('start_date');
        $end_date = $request->get('end_date');

        
       
        $params = array('limit' => $limit, 'start' => $start, 'sort_by' => $sort_by, 'sort_order' => $sort_order, 'search' => $search,'user_company_id' => $this->ExpToken["parent_id"],'current_date'=>$current_date,'start_date'=>$start_date,'end_date'=>$end_date);
       
        $categories = CashCounter::cash_counter_list($params);
        $categories_count = CashCounter::cash_counter_listCount($params);
        $response = array(
            'success' => true,
            "data" => $categories,
            "draw" => $draw,
            "recordsFiltered" => $categories_count,
            "recordsTotal" => $categories_count
        );
        return response()->json($response);

    }

}
