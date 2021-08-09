<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Reportform;
use App\Models\Form_subs;
use App\Http\Controllers\Middleweb_Controller;
use DB;
use Config;
class ReportformController extends Middleweb_Controller
{

   
    public function dtFormList(Request $request)
    {
       
        $limit = $request->get('length');
        $start = $request->get('start');
        $draw = $request->get('draw');
        $sort_by = $t1 = $request->get('column_name');
        $sort_order = $request->get('order');
        $search = $request->get('search');
        $params = array('limit' => $limit, 'start' => $start, 'sort_by' => $sort_by, 'sort_order' => $sort_order, 'search' => $search, 'user_company_id' => $this->ExpToken["parent_id"]);
        $categories = Reportform::dtFormList($params);
        $categories_count = Reportform::dtFormListCount($params);
        $response = array(
            'success' => true,
            "data" => $categories,
            "draw" => $draw,
            "recordsFiltered" => $categories_count,
            "recordsTotal" => $categories_count
        );
        return response()->json($response);
    }

    public function dtFormAnsList(Request $request)
    {
       
        $customer_id = $request->get('customer_id');
        $formAnsList = DB::table('form_ans')
                       ->join('report_form', 'form_ans.form_id', '=', 'report_form.id')
                       ->join('appointments', 'form_ans.app_id', '=', 'appointments.id')
                       ->join('users', 'users.id', '=', 'appointments.worker_id')
                       ->join('services', 'appointments.service_id', '=', 'services.id')
                       ->where('form_ans.user_company_id', $this->ExpToken["parent_id"])
                       ->where('form_ans.customer_id',$customer_id)
                       ->orderBy('form_ans.created_at', 'desc')
                       ->orderBy('report_form.created_at', 'desc')  
                       ->select('form_ans.*', 'report_form.type','users.name','report_form.title','services.name As service_name')
                       ->get();


      $formAnsListZero = DB::table('form_ans')
                       ->join('report_form', 'form_ans.form_id', '=', 'report_form.id')
                       ->join('users', 'users.id', '=', 'form_ans.created_by')
                       ->where('form_ans.user_company_id', $this->ExpToken["parent_id"])
                       ->where('form_ans.customer_id',$customer_id)
                       ->where('form_ans.app_id',0)
                       ->orderBy('form_ans.created_at', 'desc')
                       ->orderBy('report_form.created_at', 'desc')                       
                       ->select('form_ans.*', 'report_form.type','users.name','report_form.title')
                       ->get(); 
        $array_data = [
            'form_ans_list' =>$formAnsList,
            'form_ans_list_zero' =>$formAnsListZero,
        ];
        return response()->json($array_data);
    }
    
    public function saveReportForm(Request $request) {
        
        $report_form = isset($request->id) ? Reportform::find($request->id) : new Reportform();

        $report_form->title = $request->title;
        $report_form->type = $request->type;
        $report_form->fileds = json_encode($request->fileds);
        $report_form->description = $request->description;

        $report_form->user_company_id = $this->ExpToken["parent_id"];
        if (isset($request->id)) {
            $report_form->updated_by = $this->ExpToken["user_id"];
        } else {
            $report_form->created_by = $this->ExpToken["user_id"];
            $report_form->updated_by = $this->ExpToken["user_id"];
        }
        if ($report_form->save()) {
            if (isset($request->id)) {
                $message = 'Form updated successfully';
            } else {
                $message = 'Form saved successfully';
            }
            $response = array(
                "error" => false,
                "message" => $message,
            );
        } else {
            $response = array(
                "error" => true,
                "message" => 'An error occured while performing operation',
            );
        }
        return response()->json($response);
    }

    public function getReportForm(Request $request){
        $templateData = DB::table('report_form')->where('id',$request->id)->get()->toarray();
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
        $template = Reportform::find($request->id);
        $template->delete();
        $response = array(
            "success" => true,
            "message" => "Form delete successfully.",
        );
        return response()->json($response);
    }
    public function getAllInvoice(){
        $paymentMethodList = DB::table('payment_method')->get();
        $response = array(
            "success" => true,
            "data" => $paymentMethodList
        );
        return response()->json($response);
    }

    public function dtFormSubList(Request $request)
    {
        $limit = $request->get('length');
        $start = $request->get('start');
        $draw = $request->get('draw');
        $sort_by = $t1 = $request->get('column_name');
        $sort_order = $request->get('order');
        $search = $request->get('search');
        $params = array('limit' => $limit, 'start' => $start, 'sort_by' => $sort_by, 'sort_order' => $sort_order, 'search' => $search, 'user_company_id' => $this->ExpToken["parent_id"]);
        $categories = Reportform::dtFormSubList($params);
        $categories_count = Reportform::dtFormSubListCount($params);
        $response = array(
            'success' => true,
            "data" => $categories,
            "draw" => $draw,
            "recordsFiltered" => $categories_count,
            "recordsTotal" => $categories_count
        );
        return response()->json($response);
    }
    public function saveFormSub(Request $request)
    {
        $check_validate = $request->validate([
            'title' => ['required', 'string', 'unique:form_subs'],
            'title_value' => ['required'],
            
        ]);
        $form_subs = new Form_subs();
        $form_subs->title = $request->title;
        $form_subs->title_value = $request->title_value;
        $form_subs->user_company_id = $this->ExpToken["parent_id"];
        $form_subs->created_by = $this->ExpToken["user_id"];
        $form_subs->updated_by = $this->ExpToken["user_id"];
        $form_subs->save();
        $response = array(
            "success" => true,
            "message" => "Shortcut added successfully.",
        );

        return response()->json($response);
    }

    public function updateFormSub(Request $request)
    {
        $check_validate = $request->validate([
            'title' => 'required|unique:form_subs,title,' . $request->get('id') . ',id',
            'title_value' => ['required'],
        ]);
        $form_subs = Form_subs::find($request->id);
        $form_subs->title = $request->title;
        $form_subs->title_value = $request->title_value;
        $form_subs->user_company_id = $this->ExpToken["parent_id"];
        $form_subs->created_by = $this->ExpToken["user_id"];
        $form_subs->updated_by = $this->ExpToken["user_id"];
        $form_subs->save();
        $response = array(
            "success" => true,
            "message" => "Shortcut updated successfully.",
        );

        return response()->json($response);
    }

    public function deleteFormSub(Request $request)
    {
        $form_subs = Form_subs::find($request->id);
        $form_subs->delete();
        $response = array(
            "success" => true,
            "message" => "Deleted successfully.",
        );
        return response()->json($response);
    }

    public function saveCanvasData(Request $request) {
        $insertData = $request->all();
        $path =  public_path().'/pedicure_images/';
        $canvasImgName= $insertData['customer_id'].'_'.strtotime(date('Y-m-d H:i:s'));
        $img = $request->canvas_img;
        $img = str_replace('data:image/png;base64,', '', $img);
        $img = str_replace(' ', '+', $img);
        $data = base64_decode($img);
        $file = $path.$canvasImgName.'.png';
        $success = file_put_contents($file, $data);
        
        if($insertData['is_uploaded'] == 'true'){
            $image = $insertData['sketch_img'];  // your base64 encoded
            $image = str_replace('data:image/jpeg;base64,', '', $image);
            $image = str_replace(' ', '+', $image);
            $imageName = 'sketch_img_'.strtotime(date('Y-m-d H:i:s')).'.'.'jpg';
            \File::put($path. '/' . $imageName, base64_decode($image));
            $insertData['sketch_img'] = $imageName;
        }

        $insertData['canvas_img'] = $canvasImgName.'.png';
        $insertData['user_company_id'] = $this->ExpToken["parent_id"];
        $insertData['pedicure_report_date'] = $insertData['pedicure_report_date']; // date('Y-m-d H:i:s');
        $insertData['created_at'] = date('Y-m-d H:i:s');
        $insertData['updated_at'] = date('Y-m-d H:i:s');
        $insertData['created_by'] = $this->ExpToken["user_id"];
        $insertData['updated_by'] = $this->ExpToken["user_id"];
        $save = DB::table('pedicure_report')->insert($insertData);
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

    public function deleteCanvasData(Request $request) {
        $data = $request->all();
        $getOne = DB::table('pedicure_report')->where('id',$data['id'])->first();
        $path =  public_path().'/pedicure_images/';
        if (file_exists($path.$getOne->canvas_img)) {
            unlink($path.$getOne->canvas_img);
        }
        if (file_exists($path.$getOne->sketch_img)) {
            unlink($path.$getOne->sketch_img);
        }
        $del = DB::table('pedicure_report')->where('id',$data['id'])->delete();
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
    public function updateCanvasData(Request $request) {
        $updateData = $request->all();
        $getOne = DB::table('pedicure_report')->where('id',$updateData['id'])->first();
        $path =  public_path().'/pedicure_images/';
        if($updateData['is_uploaded'] == 'true'){
            if (strpos($updateData['sketch_img'], 'data:image/jpeg') !== false) {
                if (file_exists($path.$getOne->sketch_img)) {
                    unlink($path.$getOne->sketch_img);
                }
                $image = $updateData['sketch_img'];  // your base64 encoded
                $image = str_replace('data:image/jpeg;base64,', '', $image);
                $image = str_replace(' ', '+', $image);
                $imageName = 'sketch_img_'.strtotime(date('Y-m-d H:i:s')).'.'.'jpg';
                \File::put($path. '/' . $imageName, base64_decode($image));
                $updateData['sketch_img'] = $imageName;
            }else{
                if (strpos($updateData['sketch_img'], '/') !== false) {
                    unset($updateData['sketch_img']);
                }
            }
        }
        if($updateData['is_uploaded'] == 'false' && $updateData['is_tablet']){
            if (strpos($updateData['sketch_img'], '/') !== false) {
                unset($updateData['sketch_img']);
            }
        }
        unset($updateData['is_tablet']);
        
        //removeOld canvas
        if (file_exists($path.$getOne->canvas_img)) {
            unlink($path.$getOne->canvas_img);
        }  
        $canvasImgName= $updateData['customer_id'].'_'.strtotime(date('Y-m-d H:i:s'));
        $img = $request->canvas_img;
        $img = str_replace('data:image/png;base64,', '', $img);
        $img = str_replace(' ', '+', $img);
        $data = base64_decode($img);
        $file = $path.$canvasImgName.'.png';
        $success = file_put_contents($file, $data);
        
        $id = $updateData['id'];
        unset($updateData['id']);
        $updateData['canvas_img'] = $canvasImgName.'.png';
        $updateData['updated_at'] = date('Y-m-d H:i:s');
        $updateData['updated_by'] = $this->ExpToken["user_id"];
        $update = DB::table('pedicure_report')->where('id',$id)->update($updateData);
        if($update){
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

    public function getCanvasById($id) {
        $data = DB::table('pedicure_report')->where('id',$id)->first();
        $data->canvas_img = Config::get('constants.displayImageUrl').'api/public/pedicure_images/'.$data->canvas_img;
        if($data->is_uploaded == "true"){
            $data->sketch_img = Config::get('constants.displayImageUrl').'api/public/pedicure_images/'.$data->sketch_img;
        }

        if($data){
            $response = array(
                'success' => true,
                "data" => $data
            );
        }else{
            $response = array(
                'success' => true,
                "data" => []
            );
        }
        return response()->json($response);
    } 
    public function getCanvasAll(Request $request) {
        $params = $request->all();
        $customerId = $params[0];
        $data = DB::table('pedicure_report')
           // ->join('services', 'services.id', '=', 'pedicure_report.service_id')
            ->where('pedicure_report.customer_id',$customerId)
            ->orderBy('pedicure_report.created_at','desc')
            //->select('pedicure_report.*', 'services.name as service_name')
            ->get();
        if($data){
            $response = array(
                'success' => true,
                "data" => $data
            );
        }else{
            $response = array(
                'success' => true,
                "data" => []
            );
        }
        return response()->json($response);
    } 


   public function addConsentForm(Request $request){


    $report_form = Reportform::find($request->form_id);
    $insertData['user_company_id'] = $this->ExpToken["parent_id"];
    $insertData['customer_id'] = $request->customer_id;
    $insertData['form_id'] = $request->form_id;
    $insertData['form_ans_date'] = $request->date;
    $insertData['app_id'] = 0;
    $insertData['fileds'] = $report_form->fileds;
    $insertData['created_at'] = date('Y-m-d H:i:s');
    $insertData['updated_at'] = date('Y-m-d H:i:s');
    $insertData['created_by'] = $this->ExpToken["user_id"];
    $insertData['updated_by'] = $this->ExpToken["user_id"];
    DB::table('form_ans')->insert($insertData);
    $response = array(
        "success" => true,
        "message" => "Data save successfully.",
    );
    return response()->json($response);
   }


    public function getCanvasReport(Request $request) {
        $params = $request->all();
        $customerId = $params[0];
        $data = DB::table('pedicure_report')->select('allergies','note')->where('pedicure_report.customer_id',$customerId)->orderBy('id','DESC')->limit(1)->get()->toarray();
        

        if($data){
            $response = array(
                'success' => true,
                "data" => $data
            );
        }else{
            $response = array(
                'success' => true,
                "data" => []
            );
        }
        return response()->json($response);
    } 

    public function getCanvasReportList(Request $request) {
        $params = $request->all();
        $customerId = $params[0];
        $data = DB::table('pedicure_report')->select('allergies','note')->where('pedicure_report.customer_id',$customerId)->orderBy('id','DESC')->limit(1)->get()->toarray();
        

        if($data){
            $response = array(
                'success' => true,
                "data" => $data
            );
        }else{
            $response = array(
                'success' => true,
                "data" => []
            );
        }
        return response()->json($response);
    }

    public function customerMedicalReport($customerId)
    {  
        $data = DB::table('pedicure_report')->select('allergies','note')->where('pedicure_report.customer_id',$customerId)->orderBy('id','DESC')->limit(3)->get()->toarray();
        

        if($data){
            $response = array(
                'success' => true,
                "data" => $data
            );
        }else{
            $response = array(
                'success' => true,
                "data" => []
            );
        }
        return response()->json($response);
    }

    public function getMedicalReportDesc(Request $request)
    {  
        $params = $request->all();
        $customerId = $params[0];
        $data = DB::table('pedicure_report')->select('form_subs')->where('pedicure_report.customer_id',$customerId)->orderBy('id','DESC')->limit(1)->get()->toarray();
        

        if($data){
            $response = array(
                'success' => true,
                "data" => $data
            );
        }else{
            $response = array(
                'success' => true,
                "data" => []
            );
        }
        return response()->json($response);
    }
}
