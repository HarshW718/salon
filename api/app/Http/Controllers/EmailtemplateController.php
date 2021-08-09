<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Emailtemplate;
use App\Models\Common;
use App\Http\Controllers\Middleweb_Controller;
use Config;

class EmailtemplateController extends Middleweb_Controller
{

    public function index()
    {

        $service_category = ServicesCategories::where('user_company_id',$this->ExpToken["parent_id"])->orderBy('id', 'DESC')->get();
        $response = array(
            "success" => true,
            "data" => $service_category,
        );
        return response()->json($response);
    }




    public function emailList(Request $request)
    {

        $limit = $request->get('length');
        $start = $request->get('start');
        $draw = $request->get('draw');
        $sort_by = $t1 = $request->get('column_name');
        $sort_order = $request->get('order');
        $search = $request->get('search');
        $params = array('limit' => $limit, 'start' => $start, 'sort_by' => $sort_by, 'sort_order' => $sort_order, 'search' => $search, 'user_company_id' => $this->ExpToken["parent_id"]);
        $categories = Emailtemplate::email_list($params);
        $categories_count = Emailtemplate::email_listCount($params);

        $response = array(
            'success' => true,
            "data" => $categories,
            "draw" => $draw,
            "recordsFiltered" => $categories_count,
            "recordsTotal" => $categories_count
        );
        return response()->json($response);
    }
    
    public function saveEmailTemplate(Request $request){
        
        if(isset($request->id)){
            
            $templateData = Emailtemplate::where('type',$request->type)->where('id','!=',$request->id)->where('user_company_id',$this->ExpToken["parent_id"])->get()->toarray();
            
        }else {
            
            $templateData = Emailtemplate::where('type',$request->type)->where('user_company_id',$this->ExpToken["parent_id"])->get()->toarray();
        }
        
        
        if(empty($templateData)){
             $email_template = isset($request->id) ? Emailtemplate::find($request->id) : new Emailtemplate();
            
            $email_template->name = $request->name;
            $email_template->type = $request->type;
            $email_template->send_time = isset($request->send_time) ? $request->send_time : 0;
            $email_template->mail_content = $request->mail_content;
            $email_template->is_active = $request->is_active;
            $email_template->user_company_id = $this->ExpToken["parent_id"];
            $email_template->created_by = $this->ExpToken["user_id"];
            $email_template->updated_by = $this->ExpToken["user_id"];

            if($email_template->save()){
                if(isset($request->id)){
                    
                   $message='Template updated successfully';
                }else {
                    $message='Template saved successfully';
                }
                $response = array(
                    "success" => false,
                    "message" => $message,
                );

            }else {

                $response = array(
                    "success" => true,
                    "message" => 'An error occured while performing operation',
                );
            }
        }else {
            $templatetype=[1=>'Reminder',2=>'Confirmation',3=>'Change',4=>'Cancellation',5=>'No-Show cancellation',6=>'Cancellation not on time',7=>'Invoice Reminder',8=>'Invoice',9=>'Intake form',10=>'Invitation for staff'];
            $templateName=$templatetype[$request->type];
            $response = array(
                "success" => true,
                "message" => 'You have already created {{'.$templateName.'}} type email template.',
            );
        }
        
        return response()->json($response);
    
    }
    
    public function getEmailTemplate(Request $request){
        
        $templateData = Emailtemplate::where('id',$request->id)->get()->toarray();
        if(!empty($templateData)){
            $newemail_temp=$this->replaceData($templateData[0]['mail_content']);
            $templateData[0]['newtempate_description']=$newemail_temp;
            $response = array(
                "success" => false,
                "data" => $templateData,
            );
            
        }else {
            
            $response = array(
                "success" => true,
                "message" => 'Template date not exists in the system',
            );
        }
        return response()->json($response);
    }
    
    public function destroy(Request $request)
    {
        
        $template = Emailtemplate::find($request->id);
        $template->delete();
        $response = array(
            "success" => true,
            "message" => "Template delete successfully.",
        );
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

        if (strpos($data, '[[appointment-date-time]]') !== false) {
            $data = str_replace("[[appointment-date-time]]", '22/07/2019', $data);
        }

        if (strpos($data, '[[staff-name]]') !== false) {
            $data = str_replace("[[staff-name]]", 'David Rany', $data);
        }

        if (strpos($data, '[[service-name]]') !== false) {
            $data = str_replace("[[service-name]]", 'Hair-cut', $data);
        }

        if (strpos($data, '[[service-duration]]') !== false) {
            $data = str_replace("[[service-duration]]", '1hour 20min', $data);
        }

        if (strpos($data, '[[login-url]]') !== false) {
            $data = str_replace("[[login-url]]", 'salon.com', $data);
        }

        if (strpos($data, '[[staff-email]]') !== false) {
            $data = str_replace("[[staff-email]]", 'david@gmail.com', $data);
        }

        if (strpos($data, '[[staff-password]]') !== false) {
            $data = str_replace("[[staff-password]]", '123456', $data);
        }

        

        

        

        

        


        if (strpos($data, '[[item-details]]') !== false) {
            $tableData='<table class="table table-hover" id="sample-table-1"><thead><tr> <th class="left">Description</th><th class="right">Amount</th> </tr>  </thead> <tbody><tr ><td class="left">1*item</td><td class="right">₹ 123</td></tr></tbody></table>';
            $data = str_replace("[[item-details]]", $tableData, $data);
        }
        
        return $data;
    }


}
