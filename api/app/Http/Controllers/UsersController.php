<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Middleweb_Controller;
use Illuminate\Http\Request;
use App\Models\Users;
use App\Models\User_role;
use App\Models\UserServices;
use App\Models\Users_working_hours;
use App\Models\Users_extra_working_hours;
use App\Models\Common;
use App\Models\Emailtemplate;
use App\Models\Placeholder;
use Illuminate\Support\Facades\Config;
use DB;

class UsersController extends Middleweb_Controller

{

    public function addStaff(Request $request)
    {

        $validatedData = $request->validate([
            'name' => 'required',
            'first_name' => 'required',
            'last_name' => 'required',
            'email' => ['required', 'string', 'max:255', 'unique:users'],
            'mobile' => 'required',
            'password' => 'required'
        ]);

       $current_login = $this->ExpToken["user_id"];
       $parent_id = $this->ExpToken["parent_id"];
       $company_name = $this->ExpToken["company_name"];
       $userData = Users::addStaff($request, $current_login,$parent_id,$company_name);
        $error = 0;
        $roleFlag = 0;
        if ($request->get('role') != '') {
            $roleFlag = 1;
        }
        $user = $userData->id;
        $input = $request->all();
        $insertArrayCustomer = ['role_id' => $input['role'], 'menu_id' => 1, 'user_id' => $user, 'created_by' => $current_login];
        User_role::saveRole($insertArrayCustomer);
        $insertArray = [];
        foreach ($input['user_role'] as $key => $row) {
            if ($row['ng_name'] == 1 && $row['menu_id'] != 1) {
                $insertArray = ['role_id' => $input['role'], 'menu_id' => $row['menu_id'], 'user_id' => $user, 'created_by' => $current_login];
                User_role::saveRole($insertArray);
            }
        }
        $emailTemplate=Emailtemplate::where('user_company_id',$this->ExpToken["parent_id"])->where('type',10)->get()->toarray();
        $loginUrl = Config::get('constants.loginUrl');
        $body='';
        if(!empty($emailTemplate)){
            $sub=$emailTemplate[0]['title'];
            $body=$emailTemplate[0]['mail_content'];
            $companyData=Common::mailData('company_details',['user_company_id'=>$this->ExpToken["parent_id"]]);
            $workerData = Common::mailData('users',['id'=>$user]);
            if(!empty($companyData)){
                $imageUrl = Config::get('constants.displayImageUrl');
                $companyLogo=$imageUrl.'company_logo/'.$companyData[0]->company_logo;
                $companyName=$companyData[0]->company_name;
                $companyNumber=$companyData[0]->mobile;
                $companyEmail=$companyData[0]->email;
                $companyAddress=$companyData[0]->address;
            }else {
                $companyLogo='';
                $companyName='';
                $companyNumber='';
                $companyEmail='';
                $companyAddress='';
            }
            if(!empty($workerData)){
                $certificatenumber=$workerData[0]->certificate_number;
                $workerName=$workerData[0]->name;
                $workerEmail=$workerData[0]->email;
                $workerPassword=$request->get('password');
            }else {
                $certificatenumber='';
                $workerName='';
                $workerPassword='';
                $workerEmail='';
            }
            $paramsList=Placeholder::select('name')->get()->toarray();
            $replaceParams=[];
            foreach($paramsList as $key=>$value){
                if($value['name']=='[[company-logo]]'){
                    $replaceParams[$value['name']]=$companyLogo;
                }else if($value['name']=='[[company-name]]'){
                    $replaceParams[$value['name']]=$companyName;
                }else if($value['name']=='[[company-number]]'){
                    $replaceParams[$value['name']]=$companyNumber;
                }else if($value['name']=='[[company-email]]'){
                    $replaceParams[$value['name']]=$companyEmail;
                }else if($value['name']=='[[company-address]]'){
                    $replaceParams[$value['name']]=$companyAddress;
                }else if($value['name']=='[[certificate-number]]'){
                    $replaceParams[$value['name']]=$certificatenumber;
                }else if($value['name']=='[[staff-name]]'){
                    $replaceParams[$value['name']]=$workerName;
                }else if($value['name']=='[[staff-email]]'){
                    $replaceParams[$value['name']]=$workerEmail;
                }else if($value['name']=='[[login-url]]'){
                    $replaceParams[$value['name']]=$loginUrl;
                }else if($value['name']=='[[staff-password]]'){
                    $replaceParams[$value['name']]=$workerPassword;
                }else {
                    $replaceParams[$value['name']]='';
                }
            }
            $body=Common::replaceMailData($replaceParams,$body);
        }else {
            $sub='Account details - Salon';
            $body .= "Dear " . $request->get('name') . " <br/><br/>";
            $body .= "Admin has set up your account for Salon crm, Please find the login details below.";
            $body .= "<br/>Url : " . $loginUrl . "";
            $body .= "<br/>Email : " . $request->get('email') . "";
            $body .= "<br/>Password : " . $request->get('password') . "";
            $body .= "<br/><b>Thanks <br /> Salon Team</b>";
            
        }
        $mailData = [];
        $mailData['to_email'] = $request->get('email');
        $mailData['bodyData'] = $body;
        $mailData['user_id'] = $user;
        $mailData['user_company_id'] = $this->ExpToken["parent_id"];
        $mailData['sub'] = 'Account details - Salon';
        Users::saveMail($mailData);
        if ($userData) {
            $response['message'] = 'User added successfully';
            $response['error'] = FALSE;
        } else {
            $response['message'] = 'An error occured while performing operation';
            $response['error'] = FALSE;
        }
        echo json_encode($response);
    }

    public function getStaffDetails(Request $request)
    {
        $staff_id = $request->get('id');
        $created_by = $this->ExpToken["user_id"];
        $staffData = Users::getStaffDetails($staff_id);
        $staffSercies = UserServices::where('user_id', $staff_id)->get();
        $staffRoles = User_role::getStaffRoles($staff_id);
        $staffTime = Users_working_hours::getStaffTimes($staff_id);

        $userMenu = Common::userMenu($staffRoles);
        if (!empty($staffData)) {
            $response['data'] = $staffData;
            $response['services'] = $staffSercies;
            $response['time'] = $staffTime;
            $response['roles'] = $staffRoles;
            $response['userMenu'] = $userMenu;
            $response['error'] = FALSE;
        } else {
            $response['data'] = [];
            $response['error'] = TRUE;
        }
        echo json_encode($response);
    }


    public function singleUserInfo($user_id)
    {
        $user = Users::where('id', $user_id)->get();
        $response = array(
            "success" => true,
            "data" => $user,
        );
        return json_encode($response);
    }

    public function getStaffList(Request $request)
    {
        $user_id = $this->ExpToken["user_id"];
        $parent_id = $this->ExpToken["parent_id"];
        $activeStaffData = Users::get_active_staff_list($user_id,$parent_id);
        $inActiveStaffData = Users::get_inActive_staff_list($user_id,$parent_id);
        $response['activeData'] = $activeStaffData;
        $response['inActiveData'] = $inActiveStaffData;
        echo json_encode($response);
    }

    public function editStaff(Request $request)
    {
        $created_by = $this->ExpToken["user_id"];
        $validatedData = $request->validate([
            'name' => 'required',
            'first_name' => 'required',
            'last_name' => 'required',
            'email' => 'unique:users,email,' . $request->get('id') . ',id',
            'mobile' => 'required',
            'password' => 'required'
        ]);
        $mailFlag = 0;
        $userOldData = Users::getEmail($request->get('id'));
        if (!empty($userOldData)) {
            if ($userOldData[0]['email'] != $request->get('email')) {
                $mailFlag = 1;
            }
        }
        $request->created_by = $created_by;
        $request->updated_by = $created_by;
        $userData = Users::editStaff($request);
        if ($mailFlag == 1) {
            $loginUrl = Config::get('constants.loginUrl');
            $body = "Dear " . $request->get('name') . " <br/><br/>";
            $body .= "Admin has set up your account for Salon crm, Please find the login details below.";
            $body .= "<br/>Url : " . $loginUrl . "";
            $body .= "<br/>Email : " . $request->get('email') . "";
            $body .= "<br/><b>Thanks <br /> Salon Team</b>";
            $mailData = [];
            $mailData['to_email'] = $request->get('email');
            $mailData['bodyData'] = $body;
            $mailData['user_id'] = $request->get('id');
            $mailData['user_company_id'] = $this->ExpToken["parent_id"];
            $mailData['sub'] = 'Account details - Salon';
            Users::saveMail($mailData);
        }

        if ($userData) {
            $response['message'] = 'User updated successfully';
            $response['error'] = FALSE;
        } else {
            $response['message'] = 'An error occured while performing operation';
            $response['error'] = FALSE;
        }
        echo json_encode($response);
    }
    public function edit_auth_user(Request $request)
    {
        $created_by = $this->ExpToken["user_id"];
        $user = $request->get('id');
        $userData = $request->get('usersdata');
        if ($userData['role'] != 0) {
            $roleFlag = 1;
            User_role::deleteRole($userData['id']);
        }
        $input = $request->all();
        $insertArray = [];
        foreach ($input['user_role'] as $key => $row) {
            if ($row['ng_name'] == 1) {
                $insertArray = ['role_id' => $input['usersdata']['role'], 'menu_id' => $row['menu_id'], 'user_id' => $input['usersdata']['id'], 'created_by' => $created_by];
                User_role::saveRole($insertArray);
                Users::where('id', $input['usersdata']['id'])->update(['auth_token' => '', 'role_id' => $input['usersdata']['role']]);
            }
        }
        $roleFlag = 1;
        if ($roleFlag) {
            $response['message'] = 'User updated successfully';
            $response['error'] = FALSE;
        } else {
            $response['message'] = 'An error occured while performing operation';
            $response['error'] = FALSE;
        }
        echo json_encode($response);
    }
    public function addWorkingTime(Request $request)
    {
        
        $created_by = $this->ExpToken["user_id"];
        $data = $request->all();
        
        if (!empty($data['user_id'])) {
            Users_working_hours::deleteWorkingTime($data['user_id']);
        }
        for ($i = 0; $i < count($data['data']); $i++) {
            for ($j = 0; $j < count($data['data'][$i]['timeSlot']); $j++) {
                if((empty($data['data'][$i]['timeSlot'][$j]['is_check']) && ($data['data'][$i]['timeSlot'][$j]['from_time']=='')) || ($data['data'][$i]['timeSlot'][$j]['is_check'] ==1 && ($data['data'][$i]['timeSlot'][$j]['from_time']==''))){
                    $fromTime='07:00:00';
                    $totime='07:00:00';
                }else {
                    if (strpos($data['data'][$i]['timeSlot'][$j]['from_time'], 'T') !== false) {
                        $fromTime='07:00:00';
                        $totime='07:00:00';
                    }else if($data['data'][$i]['timeSlot'][$j]['from_time']!='') {
                        $fromTime=date("H:i:s", strtotime($data['data'][$i]['timeSlot'][$j]['from_time']));
                        $totime=date("H:i:s", strtotime($data['data'][$i]['timeSlot'][$j]['to_time']));
                    }
                    
                }
                $insertArray = [];
                $insertArray['user_id'] = $data['user_id'];
                $insertArray['dayname'] = $data['data'][$i]['dayname'];
                $insertArray['dayindex'] = $i;
                $insertArray['is_check'] = $data['data'][$i]['timeSlot'][$j]['is_check'];
                $insertArray['from_time'] =$fromTime;
                $insertArray['from_obj'] = isset($data['data'][$i]['timeSlot'][$j]['from_obj']) ? $data['data'][$i]['timeSlot'][$j]['from_obj'] : '';
                $insertArray['to_time'] = $totime;
                $insertArray['created_by'] = $created_by;
                $insertArray['updated_by'] = $created_by;
                Users_working_hours::saveWorkingTime($insertArray);
            }
        }
        $response['message'] = 'Working time updated';
        $response['error'] = FALSE;
        echo json_encode($response);
    }

    public function destroy(Request $request)
    {
        $staff = Users::find($request->id);
        $staff->delete();
        $response = array(
            "success" => true,
            "message" => "Staff delete successfully.",
        );
        return response()->json($response);
    }


    public function worker_list($worker_id)
    {
        
        $worker_list = ($worker_id == 0) ? Users::with('user_working_hour','user_extra_working_hour','user_services')->where('parent_id', $this->ExpToken["parent_id"])->where('role_id', 2)->where('is_active', 1)->orderBy('id', 'DESC')->get()->toArray() : Users::with('user_working_hour','user_extra_working_hour','user_services')->where('role_id', 2)->where('is_active', 1)->where('id', $worker_id)->orderBy('id', 'DESC')->get()->toArray();

        if($this->ExpToken["role_id"] == 2){
            $all_workers = Users::where('role_id', 2)->where('is_active', 1)->where('parent_id', $this->ExpToken["parent_id"])->where('id', $worker_id)->orderBy('id', 'DESC')->get()->toArray();
        }else{
            $all_workers = Users::where('role_id', 2)->where('is_active', 1)->where('parent_id', $this->ExpToken["parent_id"])->orderBy('id', 'DESC')->get()->toArray();
        }
        $extra_working_hours = ($worker_id == 0) ? Users_extra_working_hours::with('user_services')->get()->toArray() : Users_extra_working_hours::with('user_services')->where('user_id',$worker_id)->get()->toArray();
        $new_workers = array();
        foreach ($worker_list as $key => $value) {
            $new_workers[$key]["id"] = $value["id"];
            $new_workers[$key]["title"] = $value["name"];
            $new_workers[$key]["user_services"] = $value["user_services"];
            if (count($value['user_working_hour']) > 0) {
                foreach ($value['user_working_hour'] as $hour) {
                    $new_workers[$key]['businessHours'][] = array(
                        'dow' => [$hour["dayindex"]],
                        'start' => $hour["from_time"],
                        'end' => $hour["to_time"],
                    );
                }
            }  
            if(count($value['user_extra_working_hour']) > 0) {
                foreach ($value['user_extra_working_hour'] as $extrahour) {
                    $new_workers[$key]['businessHours'][] = array(
                        'dow' => [$extrahour["dayindex"]],
                        'start' => $extrahour["from_time"],
                        'end' => $extrahour["to_time"],
                    );
                }
            }
            if(count($value['user_working_hour']) == 0 && count($value['user_extra_working_hour']) == 0)
            {
                $new_workers[$key]['businessHours'][] = array(
                        'dow' => [0,1,2,3,4,5,6],
                        'start' => "07:00:00",
                        'end' => "07:00:00",
                );
            }
        }
        $response = array(
            "success" => true,
            "data" => $new_workers,
            "all_worker" => $all_workers,
            'extra_working_hour' => $extra_working_hours,
        );
        return json_encode($response);
       
    }
    
    public function resetPassword(Request $request){
        $user_details = isset($request->id) ? Users::find($request->id) : new Users();
        $user_details->password = md5($request->new_password);
        $user_details->updated_by = $this->ExpToken["user_id"];
        $user_details->updated_at = date('Y-m-d H:i:s');
        if($user_details->save()){
            $response = array(
                "error" => false,
                "message" => "Password reset successfully.",
            );
            
        }else {
            
            $response = array(
                "error" => true,
                "message" => "An error occured while performing operation",
            );
            
        }
        return json_encode($response);
         
    }
}
