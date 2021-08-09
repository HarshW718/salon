<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Smstemplate;
use App\Http\Controllers\Middleweb_Controller;

class SmstemplateController extends Middleweb_Controller
{

    public function smsList(Request $request)
    {

        $limit = $request->get('length');
        $start = $request->get('start');
        $draw = $request->get('draw');
        $sort_by = $t1 = $request->get('column_name');
        $sort_order = $request->get('order');
        $search = $request->get('search');
        $params = array('limit' => $limit, 'start' => $start, 'sort_by' => $sort_by, 'sort_order' => $sort_order, 'search' => $search, 'user_company_id' => $this->ExpToken["parent_id"]);
        $categories = Smstemplate::sms_list($params);
        $categories_count = Smstemplate::sms_listCount($params);

        $response = array(
            'success' => true,
            "data" => $categories,
            "draw" => $draw,
            "recordsFiltered" => $categories_count,
            "recordsTotal" => $categories_count
        );
        return response()->json($response);
    }
    
    public function saveSmsTemplate(Request $request){
        
        if(isset($request->id)){
            
            $templateData = Smstemplate::where('type',$request->type)->where('id','!=',$request->id)->where('user_company_id',$this->ExpToken["parent_id"])->get()->toarray();
            
        }else {
            
            $templateData = Smstemplate::where('type',$request->type)->where('user_company_id',$this->ExpToken["parent_id"])->get()->toarray();
        }
        
        
        if(empty($templateData)){
            
             $sms_template = isset($request->id) ? Smstemplate::find($request->id) : new Smstemplate();
            
            $sms_template->name = $request->name;
            $sms_template->type = $request->type;
            $sms_template->sms_content = $request->sms_content;
            $sms_template->is_active = $request->is_active;
            $sms_template->user_company_id = $this->ExpToken["parent_id"];
            $sms_template->created_by = $this->ExpToken["user_id"];
            $sms_template->updated_by = $this->ExpToken["user_id"];

            if($sms_template->save()){
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
            $templatetype=[1=>'Reminder',2=>'Confirmation',3=>'Change'];
            $templateName=$templatetype[$request->type];
            $response = array(
                "success" => true,
                "message" => 'You have already created {{'.$templateName.'}} type sms template.',
            );
        }
        
        return response()->json($response);
    
    }
    
    public function getSmsTemplate(Request $request){
        
        $templateData = Smstemplate::where('id',$request->id)->get()->toarray();
        if(!empty($templateData)){
            
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
        
        $template = Smstemplate::find($request->id);
        $template->delete();
        $response = array(
            "success" => true,
            "message" => "Template delete successfully.",
        );
        return response()->json($response);
        
    }


}
