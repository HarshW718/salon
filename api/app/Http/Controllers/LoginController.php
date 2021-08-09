<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Users;
use App\Models\User_role;
use App\Models\Common;
use DB;
use Config;
use App\Models\Email;
use App\Models\Sync_allow;
use App\Models\Companydetails;
use App\Models\Sync_cron;
use App\Models\Products;
use App\Models\Services;
use App\Models\Reportform;
use App\Models\Form_ans;
use App\Models\Emailtemplate;
use App\Models\AppointmentStatusColor;
use App\Models\Appointments;
use App\Models\Customers;
use App\Models\SendMail;
use App\Google;
use Socialite;
//require_once('./google-calendar-api.php');
use App\Classes\GoogleCalendarApi;

class LoginController extends Controller {
    
    public function sendMail() {
        
        $userSendMailData=Users::sendMailUser();
        for($i=0;$i<count($userSendMailData);$i++){
            $id = $userSendMailData[$i]->id;
            $subject =$userSendMailData[$i]->sub;
            $body = $userSendMailData[$i]->bodyData;
            $to = $userSendMailData[$i]->to_email;
            $attachment = $userSendMailData[$i]->attachment;
            $a=Email::send_email($subject, $body, $to, $attachment);
            Users::deleteMailUser($id);
        }
    }
    
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->scopes(['https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/calendar'])->with(["access_type" => "offline", "prompt" => "consent select_account"])->redirect();
    }

    // public function handleGoogleCallback()
    // {
    //     try {
  
    //         $user = Socialite::driver('google')->stateless()->user();
    //         print_r($user);
    //         $url_events = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';

    //         $curlPost = array('summary' => 'testing event');
    //        /*  if($all_day == 1) {
    //             $curlPost['start'] = array('date' => $event_time['event_date']);
    //             $curlPost['end'] = array('date' => $event_time['event_date']);
    //         }
    //         else {
                
    //         } */
    //         //$timezone_offset_minutes = 330;  
    //         //$timezone_name = timezone_name_from_abbr("", $timezone_offset_minutes*60, false);
    //         //echo __DIR__.'./google-calendar-api.php'; die;
    //         echo $user->token; 
    //         $event = [];
    //         //$event = $_POST['event_details'];
    //         $event['event_time'] = array(
    //          'start_time'=>'2020-02-28T16:46:00',
    //          'end_time'=>'2020-02-29T16:47:00',
    //         'event_date'=> ''
    //         );

    //       /*   Array
    //         (
    //             [start_time] => 2020-02-28T16:46:00
    //             [end_time] => 2020-02-29T16:47:00
    //             [event_date] => 
    //         ) */
           
    //         $capi = new GoogleCalendarApi();
        
    //         // Get user calendar timezone
    //         $user_timezone = $capi->GetUserCalendarTimezone($user->token);
    //     echo $user_timezone;
    //         // Create event on primary calendar
    //      /*    echo $event['all_day'];
    //         echo $event['event_time'];  */
    //         $event_id = $capi->CreateCalendarEvent('primary', 'testing event', 0, $event['event_time'], $user_timezone, $user->token);
            
    //         echo json_encode([ 'event_id' => $event_id ]);
    //        /*  echo '<br/>';
    //         $curlPost['start'] = array('dateTime' => '2020-02-28T16:46:00', 'timeZone' => "America/Toronto");
    //         $curlPost['end'] = array('dateTime' => '2020-02-29T16:47:00', 'timeZone' => "America/Toronto");
    //         $curlPost['attendees'] = array(
    //             array('email' => 'vijayg.@gmail.com'),
    //             array('email' => ''),
    //         );
    //         $ch = curl_init();		
    //         curl_setopt($ch, CURLOPT_URL, $url_events);		
    //         curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);		
    //         curl_setopt($ch, CURLOPT_POST, 1);		
    //         curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
    //         curl_setopt($ch, CURLOPT_HTTPHEADER, array('Authorization: Bearer '. $user->token, 'Content-Type: application/json'));	
    //         curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($curlPost));	
    //         $data = json_decode(curl_exec($ch), true);
    //         $http_code = curl_getinfo($ch,CURLINFO_HTTP_CODE);	
    //         echo $http_code; die;	 */
    //         if($http_code != 200) 
    //             throw new Exception('Error : Failed to create event');

    //         return $data['id'];
    //         die;
    //         //$finduser = User::where('google_id', $user->id)->first();
   
    //         if($finduser){
   
    //             Auth::login($finduser);
  
    //             //return return redirect('/home');
   
    //         }else{
    //             $newUser = User::create([
    //                 'name' => $user->name,
    //                 'email' => $user->email,
    //                 'google_id'=> $user->id
    //             ]);
  
    //             Auth::login($newUser);
   
    //             return redirect()->back();
    //         }
  
    //     } catch (Exception $e) {
    //         return redirect('auth/google');
    //     }
    // }

    public function checkUserLogin(Request $request) {
        //$user = Socialite::driver('google')->stateless()->user();
        $email = $request->get('email');
        $password = $request->get('password');
        $userData=Users::getUser($request);
        
        if(!empty($userData) && $userData[0]['is_active'] == 1){
           $user_id=$userData[0]['id'];
            if(!empty($userData[0]['auth_token'])){
                $auth_token=$userData[0]['auth_token'];
            }else {
                $auth_token= Users::authtokenGenerate('users','auth_token');
                $updateArray['auth_token'] =$auth_token;
                DB::table('users')->Where('id', '=', $user_id)->update($updateArray);
            }
            $user_role = User_role::where('user_id',$user_id)->get();
            if($user_role->isEmpty()) {
                $user_role = [];
            }
            $menu = Common::menu($user_role); 
            $responce['error'] = false;
            $responce['data'] = array('name'=>$userData[0]['name'],'email'=>$userData[0]['email'],'first_name'=>$userData[0]['first_name'],'last_name'=>$userData[0]['last_name'],'id'=>$userData[0]['id'],'auth_token'=>$auth_token,'role_id'=>$userData[0]['role_id'],'menu'=>$menu,'is_sync_google'=>$userData[0]['is_sync_google']);
            $responce['message'] = "Login successfully.";
        }else if (!empty($userData) && $userData[0]['is_active'] == 0) {
            $responce['error'] = true;
            $responce['message'] = "Your account not activated. Please check your activation account mail";
        }else {
            $responce['error'] = true;
            $responce['message'] = "Email or Password doesn't match";
        }
        return json_encode($responce);
    }
    
    public function addUser(Request $request) {
        $check_validate = $request->validate([
            'email' => 'unique:users,email',
        ]);
        $userData = Users::where('company_name',$request->get('company_name'))->where('parent_id',0)->get()->toarray();
        if(!empty($userData)){
            $responce['error'] = true;
            $responce['message'] = "Company name already exists in the system";
        }else {
            
            $insertUser=[];
            $insertUser['password']=md5($request->get('password'));
            $insertUser['first_name']=$request->get('first_name');
            $insertUser['last_name']=$request->get('last_name');
            $insertUser['company_name']=$request->get('company_name');
            $insertUser['name']=$request->get('name');
            $insertUser['email']=$request->get('email');
            $insertUser['role_id']=1;
            $customer_insert = Users::create($insertUser);
            $customer_id = $customer_insert->id;
            if($customer_id){
                $activationUrl = Config::get('constants.activationUrl').'login/active/'.base64_encode($request->get('email'));
                $body = "Dear " . $request->get('name') . " <br/><br/>";
                $body .= "Your company account has been set up , Please click on link ";
                $body .= "<a href='".$activationUrl."'>Click here</a>";
                $body .= "<br/>Url : " . $activationUrl . "";
                $body .= "<br/>Email : " . $request->get('email') . "";

                $body .= "<br/><b>Thanks <br /> Salon Team</b>";
                $mailData = [];
                $mailData['to_email'] = $request->get('email');
                $mailData['bodyData'] = $body;
                $mailData['user_id'] = $customer_id;
                $mailData['user_company_id'] = $customer_id;
                $mailData['sub'] = 'Account verification - Salon';
                Users::saveMail($mailData);
                $responce['error'] = false;
                $responce['message'] = "Thanks! Your company has been created successfully! Please check your inbox for email address verification.";
            }else {
                $responce['error'] = true;
                $responce['message'] = "An error occured while performing operation";
            }
        }
        
        return json_encode($responce);
    }
    
    public function checkActiveUser(Request $request){
        
        $email=base64_decode($request->get('id'));
        $userData = Users::where('email',$email)->get()->toarray();
        $appointment_status_color_new_admin = array(
            ['appointment_status_id' =>1 ,'admin_id'=>$userData[0]["id"],'status_color'=>'#0c0c13'],
            ['appointment_status_id' =>2 ,'admin_id'=>$userData[0]["id"],'status_color'=>'#3fcc14'],
            ['appointment_status_id' =>3 ,'admin_id'=>$userData[0]["id"],'status_color'=>'#2af0c4'],
            ['appointment_status_id' =>4 ,'admin_id'=>$userData[0]["id"],'status_color'=>'#b32400'],
            ['appointment_status_id' =>5 ,'admin_id'=>$userData[0]["id"],'status_color'=>'#cc0000'],
            ['appointment_status_id' =>6 ,'admin_id'=>$userData[0]["id"],'status_color'=>'#cc3399'],
            ['appointment_status_id' =>7 ,'admin_id'=>$userData[0]["id"],'status_color'=>'#b3f0ff']
        );
        
        if(!empty($userData)){
            
            if($userData[0]['is_active']==0){
                $user_status = Users::find($userData[0]["id"]);
                $user_status->is_active = 1;
                $user_status->role_id = 1;
                $user_status->updated_at = date('Y-m-d H:i:s');
                if($user_status->save()){
                    $insertUserCompany=[];
                    $insertUserCompany['company_name']=$userData[0]['company_name'];
                    $insertUserCompany['email']=$userData[0]['email'];
                    $insertUserCompany['user_company_id']=$userData[0]['id'];
                    $company_insert = Companydetails::create($insertUserCompany);
                    User_role::deleteRole($userData[0]["id"]);
                    $insertArray = [];
                    $user_role=['0','1','2','3','4','5'];
                    foreach ($user_role as $value) {
                            $insertArray = ['role_id' => 1, 'menu_id' => $value, 'user_id' => $userData[0]["id"], 'created_by' => $userData[0]["id"],'updated_by'=>$userData[0]["id"]];
                            User_role::saveRole($insertArray);
                            
                    }
                    AppointmentStatusColor::insert($appointment_status_color_new_admin);
                    $responce['error'] = false;
                    $responce['message'] = "Your account has been activated successfully. You can now login.";
                }else {
                    $responce['error'] = true;
                    $responce['message'] = "An error occured while performing operation. Please again click on activation url";
                }
            }else if($userData[0]['is_active']==1){
                
                $responce['error'] = false;
                $responce['message'] = "Your account already activated. Please login.";
            }
            
        }else {
            $responce['error'] = true;
            $responce['message'] = "Your activation url not exist in the system";
        }
        
        return json_encode($responce);
    }
    public function syncAllow(Request $request){
        
        $syncFromToData = Sync_allow::where('from_user_company_id',$request->get('fromId'))->where('to_user_company_id',$request->get('toId'))->get()->toarray();
    
        $syncToFromData = Sync_allow::where('from_user_company_id',$request->get('toId'))->where('to_user_company_id',$request->get('fromId'))->get()->toarray();
       
        $sync_from_cron=Sync_cron::where('from_user_company_id',$request->get('fromId'))->get()->toarray();
        
        $sync_to_cron=Sync_cron::where('from_user_company_id',$request->get('toId'))->get()->toarray();
        $insertCron=[];
        $insertCron['is_run']=1;
        $insertCron['created_at']=date('Y-m-d H:i:s');
        $insertCron['updated_at']=date('Y-m-d H:i:s', strtotime('+10 minutes'));
        $insertCron['created_by']=$request->get('toId');
        $insertCron['updated_by']=$request->get('toId');
        
        if(empty($sync_from_cron)){
            $insertCron['from_user_company_id']=$request->get('fromId');
            Sync_cron::create($insertCron);
        }
        if(empty($sync_to_cron)){
            $insertCron['from_user_company_id']=$request->get('toId');
            Sync_cron::create($insertCron);
        }
         if(!empty($syncFromToData) && $syncFromToData[0]['is_allow_from_to']==1){
            $fromId=$request->get('fromId');
            $toId=$request->get('toId');
            $sync = Sync_allow::find($syncFromToData[0]['id']);
            $sync->is_allow_from_to = 2;
            $sync->updated_by = $toId;
            $sync->updated_at = date('Y-m-d H:i:s');
            if($sync->save()){
                $prams=['fromId'=>$fromId,'toId'=>$toId];
                $this->syncAllData($prams);
                $responce['error'] = false;
                $responce['message'] = "Data SYNC successfully. Please check your masters data.";
                
            }else {
                $responce['error'] = true;
                $responce['message'] = "An error occured while performing operation. Please click on again in mail url";
            }
            return json_encode($responce);
            
        }else if(!empty($syncToFromData) && $syncToFromData[0]['is_allow_to_from']==1){
             
            $fromId=$request->get('toId');
            $toId=$request->get('fromId');
            $sync = Sync_allow::find($syncToFromData[0]['id']);
            $sync->is_allow_to_from = 2;
            $sync->updated_by = $toId;
            $sync->updated_at = date('Y-m-d H:i:s');
            if($sync->save()){
                $prams=['fromId'=>$fromId,'toId'=>$toId];
                $this->syncAllData($prams);
                $responce['error'] = false;
                $responce['message'] = "Data SYNC successfully. Please check your masters data.";
            }else {
                $responce['error'] = true;
                $responce['message'] = "An error occured while performing operation. Please click on again in mail url";
            }
            
            return json_encode($responce);
            
         } else if((!empty($syncFromToData) && $syncFromToData[0]['is_allow_from_to']==2)){
             
            $fromId=$request->get('toId');
            $toId=$request->get('fromId');
            $prams=['fromId'=>$fromId,'toId'=>$toId];
            $this->syncAllData($prams);
            $responce['error'] = false;
            $responce['btn'] = 2;
            $responce['message'] = "Your data sync. Do you want to deined request?";
            return json_encode($responce);
            
         }else if((!empty($syncToFromData) && $syncToFromData[0]['is_allow_to_from']==2)){
            
                $fromId=$request->get('toId');
                $toId=$request->get('fromId');
                $prams=['fromId'=>$toId,'toId'=>$fromId];
                $this->syncAllData($prams);
                $responce['error'] = false;
                $responce['btn'] = 2;
                $responce['message'] = "Your data sync. Do you want to deined request?";
                return json_encode($responce);
                
         }
         else if((!empty($syncFromToData) && $syncFromToData[0]['is_allow_from_to']==3) || (!empty($syncToFromData) && $syncToFromData[0]['is_allow_to_from']==3) ){
            $responce['error'] = 'info';
            $responce['message'] = "Your request already denied. Do you want to sync request?";
            $responce['btn'] = 2;
            return json_encode($responce);
        }
        
    }
    
    public function syncNotAllow(Request $request){
        
        $syncFromToData = Sync_allow::where('from_user_company_id',$request->get('fromId'))->where('to_user_company_id',$request->get('toId'))->get()->toarray();
        $syncToFromData = Sync_allow::where('from_user_company_id',$request->get('toId'))->where('to_user_company_id',$request->get('fromId'))->get()->toarray();
        if(!empty($syncFromToData) && $syncFromToData[0]['is_allow_from_to']==1){
            $fromId=$request->get('fromId');
            $toId=$request->get('toId');
            $sync = Sync_allow::find($syncFromToData[0]['id']);
            $sync->is_allow_from_to = 3;
            $sync->updated_by = $toId;
            $sync->updated_at = date('Y-m-d H:i:s');
            if($sync->save()){
                $responce['error'] = false;
                $responce['message'] = "Your request has been denied";
                return json_encode($responce);
            }else {
                $responce['error'] = true;
                $responce['message'] = "An error occured while performing operation. Please click on again in mail url";
                return json_encode($responce);
            }
            
        }else if(!empty ($syncToFromData) && $syncToFromData[0]['is_allow_to_from']==1){
            
            $fromId=$request->get('toId');
            $toId=$request->get('fromId');
            $sync = Sync_allow::find($syncToFromData[0]['id']);
            $sync->is_allow_to_from = 3;
            $sync->updated_by = $toId;
            $sync->updated_at = date('Y-m-d H:i:s');
            if($sync->save()){
                $responce['error'] = false;
                $responce['message'] = "Your request has been denied";
                return json_encode($responce);
            }else {
                $responce['error'] = true;
                $responce['message'] = "An error occured while performing operation. Please click on again in mail url";
                return json_encode($responce);
            }
            
        }else if((!empty($syncFromToData) && $syncFromToData[0]['is_allow_from_to']==2) || (!empty ($syncToFromData) && $syncToFromData[0]['is_allow_to_from']==2)){
            //----1 = denied request
            $responce['error'] = 'info';
            $responce['btn'] = 1;
            $responce['message'] = "You are already sync with this company  Do you want to deined request?";
            return json_encode($responce);
                
        }
        if((!empty($syncFromToData) && $syncFromToData[0]['is_allow_from_to']==3) || (!empty ($syncToFromData) && $syncToFromData[0]['is_allow_to_from']==3)){
            //----2 = Sync request
            $responce['error'] = 'info';
            $responce['btn'] = 2;
            $responce['message'] = "You request already denied with this company. Do you want to Sync data?";
            return json_encode($responce);
        }
    }
    
    public function syncAllData($prams){
        
        Products::syncProductCompany($prams); 
        Products::syncProductCategory($prams); 
        Products::syncTax($prams);
        Products::syncProduct($prams);
        Services::syncServiceCat($prams);
        Services::syncService($prams);
        
    }
    
    public function autoSync(Request $request){
        echo "<pre>";
        echo $date=date('Y-m-d H:i:s');
        $cronData=Sync_cron::where('is_run',1)->where('updated_at','<=',$date)->get()->toarray();
        print_r($cronData);
        if(!empty($cronData)){
            
            for($i=0;$i<count($cronData);$i++){
                
                $sync_allow=Sync_allow::where('from_user_company_id',$cronData[$i]['from_user_company_id'])->orwhere('to_user_company_id',$cronData[$i]['from_user_company_id'])->get()->toarray();
               
                //print_r($sync_allow); 
                
                for($s=0;$s<count($sync_allow);$s++){
                    
                    if($sync_allow[$s]['from_user_company_id']==$cronData[$i]['from_user_company_id'] && $sync_allow[$s]['is_allow_from_to']==2){
                        
                        $prams=['fromId'=>$sync_allow[$s]['from_user_company_id'],'toId'=>$sync_allow[$s]['to_user_company_id']];
                        echo "to from ";  
                       
                        $this->syncAllData($prams);
                       
                    }else if($sync_allow[$s]['to_user_company_id']==$cronData[$i]['from_user_company_id'] && $sync_allow[$s]['is_allow_to_from']==2){
                        $prams=['fromId'=>$sync_allow[$s]['to_user_company_id'],'toId'=>$sync_allow[$s]['from_user_company_id']];
                        
                        echo "to from ";  
                        
                        $this->syncAllData($prams);
                        
                    }else {
                        
                        echo "else";
                        
                    }
                    
                }
                 
                 $update_sync_cron=Sync_cron::find($cronData[$i]['id']);
                 $update_sync_cron->is_run=0;
                 $update_sync_cron->updated_at=date('Y-m-d H:i:s');
                 $update_sync_cron->save();
                 
            }
            
        }
        
    }
    
    public function deniedRequest(Request $request){
        
        $syncFromToData = Sync_allow::where('from_user_company_id',$request->get('fromId'))->where('to_user_company_id',$request->get('toId'))->get()->toarray();
        
        $syncToFromData = Sync_allow::where('from_user_company_id',$request->get('toId'))->where('to_user_company_id',$request->get('fromId'))->get()->toarray();
        
        if(!empty($syncFromToData) && $syncFromToData[0]['is_allow_from_to']==2){
            
            $fromId=$request->get('fromId');
            $toId=$request->get('toId');
            
            $sync = Sync_allow::find($syncFromToData[0]['id']);
            
            $sync->is_allow_from_to = 3;
            $sync->updated_by = $toId;
            $sync->updated_at = date('Y-m-d H:i:s');
            if($sync->save()){
                
                $responce['error'] = false;
                $responce['message'] = "Your request has been denied";
                return json_encode($responce);
                
            }else {
                
                $responce['error'] = true;
                $responce['message'] = "An error occured while performing operation. Please click on again in mail url";
                return json_encode($responce);
            }
            
        }else if(!empty ($syncToFromData) && $syncToFromData[0]['is_allow_to_from']==2){
            
            $fromId=$request->get('toId');
            $toId=$request->get('fromId');
            $sync = Sync_allow::find($syncToFromData[0]['id']);
            
            $sync->is_allow_to_from = 3;
            $sync->updated_by = $toId;
            $sync->updated_at = date('Y-m-d H:i:s');
            if($sync->save()){
                
                $responce['error'] = false;
                $responce['message'] = "Your request has been denied";
                return json_encode($responce);
                
            }else {
                
                $responce['error'] = true;
                $responce['message'] = "An error occured while performing operation. Please click on again in mail url";
                return json_encode($responce);
                
            }
        }
    }
    
    public function syncRequest(Request $request){
        
        $syncFromToData = Sync_allow::where('from_user_company_id',$request->get('fromId'))->where('to_user_company_id',$request->get('toId'))->get()->toarray();
        
        $syncToFromData = Sync_allow::where('from_user_company_id',$request->get('toId'))->where('to_user_company_id',$request->get('fromId'))->get()->toarray();
        
        if(!empty($syncFromToData) && $syncFromToData[0]['is_allow_from_to']==3){
            
            $fromId=$request->get('fromId');
            $toId=$request->get('toId');
            
            $sync = Sync_allow::find($syncFromToData[0]['id']);
            
            $sync->is_allow_from_to = 2;
            $sync->updated_by = $toId;
            $sync->updated_at = date('Y-m-d H:i:s');
            if($sync->save()){
                
                $responce['error'] = false;
                $responce['message'] = "Your request has been sycn";
                return json_encode($responce);
                
            }else {
                
                $responce['error'] = true;
                $responce['message'] = "An error occured while performing operation. Please click on again in mail url";
                return json_encode($responce);
            }
            
        }else if(!empty ($syncToFromData) && $syncToFromData[0]['is_allow_to_from']==3){
            
            $fromId=$request->get('toId');
            $toId=$request->get('fromId');
            $sync = Sync_allow::find($syncToFromData[0]['id']);
            
            $sync->is_allow_to_from = 2;
            $sync->updated_by = $toId;
            $sync->updated_at = date('Y-m-d H:i:s');
            if($sync->save()){
                
                $responce['error'] = false;
                $responce['message'] = "Your request has been sycn";
                return json_encode($responce);
                
            }else {
                
                $responce['error'] = true;
                $responce['message'] = "An error occured while performing operation. Please click on again in mail url";
                return json_encode($responce);
                
            }
        }
    }
    
    public function forgotPassword(Request $request){
        
        $user_detail = Users::where('email',$request->email)->get()->toarray();
        
        if(!empty($user_detail)){
            $unique_id = uniqid();
            $user = Users::find($user_detail[0]['id']);
            $user->password_reset_token = $unique_id;
            $user->save();
            $activationUrl = Config::get('constants.activationUrl').'login/resetpassword/'.base64_encode($request->email).'/'.$unique_id;
            $body = "Dear " . $user_detail[0]['name'] . " <br/><br/>";
            $body .= "You recently requested password reset for your Salon™ account. Please click the button below to reset it. ";
            $body .="<br>";
            $body .= "<a href='".$activationUrl."'>Reset Password </a>    ";
            
            $body .= "<br/>Url : " . $activationUrl . "";
           
            $body .= "<br/><b>Thanks <br /> Salon Team</b>";
            $mailData = [];
            $mailData['to_email'] = $request->email;
            $mailData['bodyData'] = $body;
            $mailData['user_id'] = $user_detail[0]['id'];
            $mailData['user_company_id'] = $user_detail[0]['id'];
            $mailData['sub'] = 'Password reset from - Salon';
            Users::saveMail($mailData);

            
            $responce['error'] = false;
            $responce['message'] = "Thanks! Password reset link was sent to your email. Please follow instructions in your mailbox.";
        }else {
            $responce['error'] = true;
            $responce['message'] = "Your mail id not exist in the system.";
           
        }
        return json_encode($responce);
    }
    
    public function setNewPassword(Request $request){
        
        $email=base64_decode($request->email);
        $user_detail = Users::where('email',$email)->get()->toarray();
        if(!empty($user_detail)){
            $user= Users::find($user_detail[0]['id']);
            $user->password = md5($request->new_password);
            $user->password_reset_token = '';
            $user->updated_by=$user_detail[0]['id'];
            $user->updated_at=date('Y-m-d H:i:s');
            if($user->save()){
                $responce['error'] = false;
                $responce['message'] = "Password reset successfully. Please login";
            }else {
                $responce['error'] = true;
                $responce['message'] = "An error occured while performing operation.";
                
            }
        }else {
            $responce['error'] = true;
            $responce['message'] = "Your request not exist in the system. Please try again";
        }
        
        return json_encode($responce);
    }
    public function getFormHtml(Request $request){
       
        if( $request->customer_id !=0 && $request->company_id !=0 ){
            $formans = DB::table('form_ans')
            ->join('report_form', 'form_ans.form_id', '=', 'report_form.id')
            ->where('form_ans.form_id', $request->form_id)
            ->where('form_ans.customer_id',$request->customer_id)
            ->where('form_ans.app_id',$request->app_id)
            ->select('form_ans.*', 'report_form.title','report_form.description')
            ->get()->toarray();
        }else{
            //In else condition $request->app_id  is form_ans.id
            $form_ans_id = $request->app_id;
            $formans = DB::table('form_ans')
            ->join('report_form', 'form_ans.form_id', '=', 'report_form.id')
            ->where('form_ans.id',$form_ans_id)
            ->select('form_ans.*', 'report_form.title','report_form.description')
            ->get()->toarray();
        }
        




        if(!empty($formans)){
            $responce['data']=$formans;
            $responce['error'] = false;

        }else{
            $reportData=Reportform::where('id',$request->form_id)->get()->toarray();
            if(!empty($reportData)){
                $responce['data']=$reportData;
                $responce['error'] = false;
            }else {
                $responce['message']='Form not available in the system';
                $responce['error'] = true;
            }
        }
        
        return json_encode($responce);
        
    }
    
    public function saveFormAns(Request $request){
        
        $insertDta=[];
        $insertDta['fileds']=$request->fileds;
        $insertDta['user_company_id']=$request->user_company_id;
        $insertDta['customer_id']=$request->customer_id;
        $insertDta['form_id']=$request->form_id;
        $insertDta['sign']= isset($request->sign) && !empty($request->sign)?$request->sign:'';
        $insertDta['app_id']=$request->app_id;
        $insertDta['created_by']=$request->user_company_id;
        $insertDta['updated_by']=$request->user_company_id;
        $insertDta['form_ans_date']= $request->form_ans_date ; //  date('Y-m-d H:i:s');
        $insertDta['created_at']=date('Y-m-d H:i:s');
        $insertDta['updated_at']=date('Y-m-d H:i:s');
        $form_ans=Form_ans::create($insertDta);
        $form_ans_id = $form_ans->id;
        
        if($form_ans_id){
            
            $responce['error'] = false;
            $responce['message'] = "Your form save successfully!";
            
        }else {
            
            $responce['error'] = true;
            $responce['message'] = "An error occured while performing operation. Please try again";
            
        }
        
        return json_encode($responce);
        
    }
    public function updateFormAns(Request $request){
        
        
        $insertDta=[];
        $insertDta['fileds']=$request->fileds;
        $insertDta['user_company_id']=$request->user_company_id;
        $insertDta['customer_id']=$request->customer_id;
        $insertDta['form_id']=$request->form_id;
        $insertDta['app_id']=$request->app_id;
        
        if(isset($request->sign) && $request->sign != ''){
            $insertDta['sign']=$request->sign;
        }
        if(isset($request->ans_given_by) && $request->ans_given_by == 'customer'){
            $insertDta['ans_by_customer']=1;
        }
        
        // $insertDta['created_by']=$request->customer_id;
        // $insertDta['updated_by']=$request->customer_id;
        $insertDta['created_at']=date('Y-m-d H:i:s');
        $insertDta['updated_at']=date('Y-m-d H:i:s');
        $insertDta['form_ans_date']= $request->form_ans_date ;
        $form_ans=Form_ans::where('id',$request->id)->update($insertDta);
        $responce['error'] = false;
        $responce['message'] = "Your form updated successfully!";
        
        return json_encode($responce);
        
    }
   

    public function appointmentReminderMail(){
        
        $reminder_template =  Emailtemplate::find(8);
        $before_days = date('Y-m-d',strtotime(date("Y-m-d") . "+".$reminder_template->send_time." days"));
        //echo $before_days;
        $days = $reminder_template->send_time;
        $appointments = Appointments::where('appointment_date',$before_days)->where('customer_id','!=',0)->where('appointment_status_id','!=',5)->where('is_reminder_send','!=',1)->get()->toArray();
        $d1 = strtotime($before_days);
         //print_r($appointments);
         //die;
        //echo $days;
        foreach($appointments as $appointment){
            $d2 = strtotime($appointment['appointment_date']); 
            $diff = round(abs($d1 - $d2)/86400); 
            //echo $diff;
            if($diff == 0 || $diff >= $days) {
               // echo "condition";
                $appointment_customer = Customers::where('id',$appointment['customer_id'])->first()->toArray();
                $service  =  Services::find($appointment['service_id']);
                $reminder_template = Emailtemplate::where('type',1)->first();

                $body_template = $reminder_template->mail_content;
                $email = $appointment_customer["email"];
                $sub = "Remind your appointment.";
                $companyData     = Common::mailData('company_details', ['user_company_id' => $appointment['user_company_id']]);
                $company_data    = $companyData[0];
                $imageUrl        = Config::get('constants.displayImageUrl');
                $company_logo    =  empty($companyData) ? '' : $imageUrl . 'company_logo/' . $companyData[0]->company_logo;
                $company_name    = empty($companyData) ? '' : $company_data->company_name;
                $company_number  = empty($companyData) ? '' : $company_data->mobile;
                $company_email   = empty($companyData) ? '' : $company_data->email;
                $company_address = empty($companyData) ? '' : $company_data->address;
                $worker_details   =  empty($appointment["worker_id"]) ? [] : Users::find($appointment["worker_id"]);
                    $certificatenumber =   empty($worker_details) ? '' : $worker_details->certificate_number;
                    $worker_name =   empty($worker_details) ? '' : $worker_details->name;
                    $worker_email =   empty($worker_details) ? '' : $worker_details->email;
                    $customer_firstname = empty($appointment_customer["firstname"]) ? '' : $appointment_customer["firstname"];
                    $customer_lastname = empty($appointment_customer["lastname"]) ? '' : $appointment_customer["lastname"];
                    $customer_address = empty($customer_details) ? '' : $appointment_customer["address"]."<br>".$appointment_customer["postal_code"]." ".$appointment_customer["city"];
                    $customer_dob = $appointment_customer["dob"];
                    $customer_gender = $appointment_customer["gender"];
                    $customer_mobile = $appointment_customer["mobile"];

                $replaceParams = array(
                    '[[company-logo]]' => $company_logo,
                    '[[company-name]]' => $company_name,
                    '[[company-number]]' => $company_number,
                    '[[company-email]]' => $company_email,
                    '[[company-address]]' => $company_address,
                    '[[certificate-number]]' => $certificatenumber,
                    '[[staff-name]]' => $worker_name,
                    '[[staff-email]]' => $worker_email,
                    '[[login-url]]' => '',
                    '[[staff-password]]' => '',
                    '[[time]]' => '',
                    '[[date]]' => '',
        
                    '[[customer-firstname]]' => $customer_firstname,
                    '[[customer-lastname]]' => $customer_lastname,
                    '[[customer-address]]' => '',
                    '[[customer-birthdate]]' => '',
                    '[[customer-number]]' => '',
                    '[[gender]]' => '',
        
                    '[[invoice-number]]' => '',
                    '[[invoice-date]]' =>  '',
                    '[[invoice-amount]]' => '',
                    '[[appointment-date-time]]' => date('d-M-Y', strtotime($appointment["appointment_date"]))." ".$appointment["start_time"],
                    '[[service-duration]]' => $this->hour_min($service->duration),
                    '[[service-name]]'=>$service->name,
                    '[[invoice-treatment-date]]' => ''
                );
                $mail_content = Common::replaceMailData($replaceParams, $body_template);
                $sendmail = new SendMail();
                $sendmail->sub = $sub;
                $sendmail->to_email = $email;
                $sendmail->bodyData = $mail_content;
                $sendmail->user_company_id = $appointment['user_company_id'];
                $sendmail->save();
                $appointment_update = Appointments::find($appointment["id"]);
                $appointment_update->is_reminder_send = 1;
                $appointment_update->save();
            } 
        }
    }

    public function hour_min($minutes)
    { // Total
        if ($minutes <= 0) return '00 Hours 00 Minutes';
        else
            return sprintf("%02d", floor($minutes / 60)) . ' Hours ' . sprintf("%02d", str_pad(($minutes % 60), 2, "0", STR_PAD_LEFT)) . " Minutes";
    }


    public function checkResetPasswordToken(Request $request){

        
        $email=base64_decode($request->id);
        $uid=$request->uid;
        $user_detail = Users::where('password_reset_token',$uid)->where('email',$email)->get()->toarray();
        $responce['user_data'] = $user_detail;
        return json_encode($responce);

    }

    public function sendConfirmationEmail(Request $request) {
        $request = $request->all();
        $id = $request['id'];
       
        $appointments = Appointments::select('*')->where('id',$id)->orderBy('id', 'DESC')->get()->toArray();
       
        // $appointment_services = Appointments::select('service_id')->where('customer_id',$appointments[0]['customer_id'])->orderBy('id', 'DESC')->get()->toArray();
        //print_r($appointment_services); die;
       // print_r($appointments); 
       // echo '<br/><br/><br/><br/><br/><br/>';
        $sub = "Appointments details";
        $companyData     = Common::mailData('company_details', ['user_company_id' => $appointments[0]['user_company_id']]);
        //print_r($companyData); die;
        $appointment_customer = Customers::where('id',$appointments[0]['customer_id'])->get()->toArray();
        $appointment_customer = $appointment_customer[0];
       
        $company_data    = $companyData[0];

        $consentFrmLinks = [];
        $treatmentFrmLinks = [];
        $medicalFrmLinks = [];

        foreach ($appointments as $key => $value) {
            $service_id[] = $value["service_id"];
        }
        
        $services = Services::whereIn('id', $service_id)->where('user_company_id', $appointments[0]['user_company_id'])->get()->toArray();
        //print_r($company_data); die;

        if(isset($appointment["consent_frm_id"])){

            if($appointment['is_consentFormChk'] && $appointment["consent_frm_id"]){
                $link = $siteUrl.'login/reportform/'.$companyId.'/'.$appointment["consent_frm_id"].'/'.$customerId.'/'.$single_appointment_id->id;
                array_push($consentFrmLinks,$link);
                // $report_form_consent = Reportform::find($appointment["consent_frm_id"]);
                // $insertDta_consent=[];
                // $insertDta_consent['user_company_id']=$companyId;
                // $insertDta_consent['customer_id']=$customerId;
                // $insertDta_consent['form_id']=$appointment["consent_frm_id"];
                // $insertDta_consent['fileds'] = $report_form_consent->fileds;
                // $insertDta_consent['app_id']=$single_appointment_id->id;
                // $insertDta_consent['created_by']=$companyId;
                // $insertDta_consent['updated_by']=$companyId;
                // $insertDta_consent['created_at']=date('Y-m-d H:i:s');
                // $insertDta_consent['updated_at']=date('Y-m-d H:i:s');
                // $form_ans=Form_ans::create($insertDta_consent);

            }
        }
        
        if(isset($appointments["treatment_frm_id"])){
            if($appointments['is_treatmentFormChk'] && $appointments["treatment_frm_id"]){
                $link1 = $siteUrl.'login/reportform/'.$companyId.'/'.$appointments["treatment_frm_id"].'/'.$customerId.'/'.$single_appointment_id->id;
                array_push($treatmentFrmLinks,$link1);
            }
        }

        if(isset($appointments["medical_frm_id"])){
            if($appointments['is_medicalFormChk'] && $appointments["medical_frm_id"]){
                $link2 = $siteUrl.'login/reportform/'.$companyId.'/'.$appointments["medical_frm_id"].'/'.$customerId.'/'.$single_appointment_id->id;
                array_push($medicalFrmLinks,$link2);
                // $report_form_medical = Reportform::find($appointment["medical_frm_id"]);
                // $insertDta_medical=[];
                // $insertDta_medical['user_company_id']=$companyId;
                // $insertDta_medical['customer_id']=$customerId;
                // $insertDta_medical['form_id']=$appointment["medical_frm_id"];
                // $insertDta_medical['fileds'] = $report_form_medical->fileds;
                // $insertDta_medical['app_id']=$single_appointment_id->id;
                // $insertDta_medical['created_by']=$companyId;
                // $insertDta_medical['updated_by']=$companyId;
                // $insertDta_medical['created_at']=date('Y-m-d H:i:s');
                // $insertDta_medical['updated_at']=date('Y-m-d H:i:s');
                // $form_ans=Form_ans::create($insertDta_medical);
            }
        }
         $appointment_details_top = '<table style="width:100%;">
        <tbody>
            <tr>
                <td></td>
            </tr>';
        $appointment_details_down = '</tbody></table>';
        $appointment_details = "<tr><td><span style='padding:5px;'>Dear " . $appointment_customer["firstname"] . " " . $appointment_customer["lastname"] . ",</span></td></tr>";
        $appointment_details .= "<tr><td><span style='padding:5px;'>Your appointment has been created for below service.</span></td></tr>";
        foreach ($services as $service) {

            $appointment_details .= "<tr><td><span style='padding:5px;'>".$service["name"] . ", Duration :: " . $this->hour_min($service["duration"]) . "</span></td></tr>";
        }
        if(count($consentFrmLinks)>0){
            $appointment_details .= "<tr><td><span style='padding:5px;'><b>Consent Form :<b>";
            foreach ($consentFrmLinks as $key => $value) {
                $key = $key+1;
                $appointment_details.='<a href="'.$value.'">Form-'.$key.'</a>&nbsp;&nbsp;';
            }
            $appointment_details .= "</span></td></tr>";
        }

        if(count($treatmentFrmLinks)>0){
            $appointment_details .= "<tr><td><span style='padding:5px;'><b>Treatment Form :<b>";
            foreach ($treatmentFrmLinks as $key => $value) {
                $key = $key+1;
                $appointment_details.='<a href="'.$value.'">Form-'.$key.'</a>&nbsp;&nbsp;';
            }
            $appointment_details .= "</span></td></tr>";
        }
        if(count($medicalFrmLinks)>0){
            $appointment_details .= "<tr><td><span style='padding:5px;'><b>Medical Form :<b>";
            foreach ($medicalFrmLinks as $key => $value) {
                $key = $key+1;
                $appointment_details.='<a href="'.$value.'">Form-'.$key.'</a>&nbsp;&nbsp;';
            }
            $appointment_details .= "</span></td></tr>";
        }
        $appointment_details .= "<tr><td><span style='padding:5px;'>your appointment date is " . date('d-M-Y', strtotime($appointments[0]["appointment_date"]))." ".$appointments[0]["start_time"] ." (".date('D', strtotime($appointments[0]["appointment_date"])).")" . ".</span></td></tr>";
        $appointment_details .= "<tr><td><span style='padding:5px;'>Thanks<br>Salon Team.</span></td></tr>";
        
        $appointment_info = $appointment_details_top . $appointment_details . $appointment_details_down;
        $imageUrl        = Config::get('constants.displayImageUrl');
        $company_logo    =  empty($companyData) ? '' : $imageUrl . 'company_logo/' . $companyData[0]->company_logo;
        $company_name    = empty($companyData) ? '' : $company_data->company_name;
        $company_number  = empty($companyData) ? '' : $company_data->mobile;
        $company_email   = empty($companyData) ? '' : $company_data->email;
        $company_address = empty($companyData) ? '' : $company_data->address;
        $worker_details   =  empty($appointments[0]["worker_id"]) ? [] : Users::find($appointments[0]["worker_id"]);
        $certificatenumber =   empty($worker_details) ? '' : $worker_details->certificate_number;
        $worker_name =   empty($worker_details) ? '' : $worker_details->name;
        $worker_email =   empty($worker_details) ? '' : $worker_details->email;
        $customer_firstname = empty($appointment_customer["firstname"]) ? '' : $appointment_customer["firstname"];
        $customer_lastname = empty($appointment_customer["lastname"]) ? '' : $appointment_customer["lastname"];
        $customer_address = empty($customer_details) ? '' : $appointment_customer["address"]."<br>".$appointment_customer["postal_code"]." ".$appointment_customer["city"];
        $customer_dob = $appointment_customer["dob"];
        $customer_gender = $appointment_customer["gender"];
        $customer_mobile = $appointment_customer["mobile"];
        $replaceParams = array(
            '[[company-logo]]' => $company_logo,
            '[[company-name]]' => $company_name,
            '[[company-number]]' => $company_number,
            '[[company-email]]' => $company_email,
            '[[company-address]]' => $company_address,
            '[[certificate-number]]' => $certificatenumber,
            '[[staff-name]]' => $worker_name,
            '[[staff-email]]' => $worker_email,
            '[[login-url]]' => '',
            '[[staff-password]]' => '',
            '[[time]]' => '',
            '[[date]]' => '',

            '[[customer-firstname]]' => $customer_firstname,
            '[[customer-lastname]]' => $customer_lastname,
            '[[customer-address]]' => $customer_address,
            '[[customer-birthdate]]' => $customer_dob,
            '[[customer-number]]' => $customer_mobile,
            '[[gender]]' => $customer_gender,


            '[[invoice-number]]' => '',
            '[[invoice-date]]' =>  '',
            '[[invoice-amount]]' => '',
            '[[appointment-confirmation-message]]' => $appointment_info,
            '[[invoice-treatment-date]]' => '',
            '[[appointment-date-time]]' =>  date('d-M-Y', strtotime($appointments[0]["appointment_date"]))." ".$appointments[0]["start_time"] ." (".date('D', strtotime($appointments[0]["appointment_date"])).")"
        );
        $confirmation_template = Emailtemplate::where('type',2)->where('user_company_id', $appointments[0]['user_company_id'])->first();
        //echo $confirmation_template; die;
        $body_template = $confirmation_template->mail_content;
        $mail_content = Common::replaceMailData($replaceParams, $body_template);
        $sendmail = new SendMail();
        $sendmail->sub = $sub;
        $sendmail->to_email = $appointment_customer["email"];
        $sendmail->bodyData = $mail_content;
        $sendmail->user_company_id = $appointments[0]['user_company_id'];
        $sendMail = $sendmail->save();
        if($sendMail) {
            $response = array(
                "success" => true,
                "message" => "Mail sent successfully.",
            );
    
            return response()->json($response);
        } else {
            $response = array(
                "success" => false,
                "message" => "Mail send failed successfully.",
            );
    
            return response()->json($response);
        }
    }

    public function googleLogin(Googl $googl, User $user, Request $request)
   {
        $client = $googl->client();
        if ($request->has('code')) {

            $client->authenticate($request->get('code'));
            $token = $client->getAccessToken();

            $plus = new \Google_Service_Plus($client);

            $google_user = $plus->people->get('me');

            $id = $google_user['id'];

            $email = $google_user['emails'][0]['value'];
            $first_name = $google_user['name']['givenName'];
            $last_name = $google_user['name']['familyName'];

            $has_user = $user->where('email', '=', $email)->first();

            if (!$has_user) {
                //not yet registered
                $user->email = $email;
                $user->first_name = $first_name;
                $user->last_name = $last_name;
                $user->token = json_encode($token);
                $user->save();
                $user_id = $user->id;

                //create primary calendar
                $calendar = new Calendar;
                $calendar->user_id = $user_id;
                $calendar->title = 'Primary Calendar';
                $calendar->calendar_id = 'primary';
                $calendar->sync_token = '';
                $calendar->save();
            } else {
                $user_id = $has_user->id;
            }

            session([
                'user' => [
                    'id' => $user_id,
                    'email' => $email,
                    'first_name' => $first_name,
                    'last_name' => $last_name,
                    'token' => $token
                ]
            ]);

            return redirect('/dashboard')
                ->with('message', ['type' => 'success', 'text' => 'You are now logged in.']);

        } else {
            $auth_url = $client->createAuthUrl();
            return redirect($auth_url);
        }
   }

   public function testworker() {
       $start_time = '2020-05-08 07:40:00';
       date_default_timezone_set("Asia/Calcutta");
       echo date("c", strtotime($start_time)); die;

    //$request_data = $request->all();
    $appointments = Appointments::with([
        'service.service_category',
        'appointment_status_color' => function ($query) {
            $query->where('admin_id', 1); //you may use any condition here or manual select operation
            // $query->select(); //select operation
        },
        'appointment_status_color.appointment_status',
        'customer',
        'worker.user_services',
       // 'invoice.invoice_tax',
        'invoice_data'
    ])->where('user_company_id', 1)->where('worker_id', 48)->where('is_deleted', 0)->orderBy('id', 'DESC')->get();
    $companyId = 1;
    
    foreach($appointments as $key=>$value) {
        $appointment = $value;
        //print_r($appointment);
        //print_r(json_encode($appointment)); die;
        $consentFrmLinks = [];
        $treatmentFrmLinks = [];
        $medicalFrmLinks = [];
        //echo $appointment["service_id"]; die;
        /* $data = Services::select('id')->where('id', $appointment["service_id"])->get()->toArray();
        $service_id = array_column($data[0], 'id'); */
        /* print_r($service_id); 
         die; */
         //echo  $appointment["service_id"]; die;
        $myString = $appointment["service_id"];
        $myArray = explode(',', $myString);
        $services = Services::whereIn('id', $myArray)->where('user_company_id', 1)->get()->toArray();
        //print_r($services); die;
        //print_r($services); die;
        $customerId = $appointment["customer_id"];
        $siteUrl = Config::get('constants.activationUrl');
        if(isset($appointment["consent_frm_id"])){

            if($appointment["consent_frm_id"]){
                $link = $siteUrl.'login/reportform/'.$companyId.'/'.$appointment["consent_frm_id"].'/'.$customerId.'/'.$appointment["id"];
                array_push($consentFrmLinks,$link);
            }
        }
        if(isset($appointment["treatment_frm_id"])){
            if($appointment["treatment_frm_id"]){
                $link1 = $siteUrl.'login/reportform/'.$companyId.'/'.$appointment["treatment_frm_id"].'/'.$customerId.'/'.$appointment["id"];
                array_push($treatmentFrmLinks,$link1);
            }
        }
        if(isset($appointment["medical_frm_id"])){
            if($appointment["medical_frm_id"]){
                $link2 = $siteUrl.'login/reportform/'.$companyId.'/'.$appointment["medical_frm_id"].'/'.$customerId.'/'.$appointment["id"];
                array_push($medicalFrmLinks,$link2);
            }
        }
        
        /* echo '<pre>';
        print_r($appointment);
        echo '<br/>';
        echo 'new appointment start here'; */
      /*   foreach ($services as $service) {
echo $service["name"];
            $appointment_details_calendar .= "<tr><td><span style='padding:5px;'>".$service["name"] . ", Duration :: " . $this->hour_min($service["duration"]) . "</span></td></tr>";
        } */
        $customer = Customers::find($appointment["customer_id"]);
       /*  print_r();
        die; */
         $appointment_details_top_calendar = '<table style="width:100%;">
        <tbody>
            <tr>
                <td></td>
            </tr>';
        $appointment_details_down_calendar = '</tbody></table>';
        $appointment_details_calendar = "<tr><td><span style='padding:5px;'>Customer Name: " . $customer->firstname . " " . $customer->lastname . ",</span></td></tr>";
        $appointment_details_calendar .= "<tr><td><span style='padding:5px;'>Appointment has been created for below service.</span></td></tr>";
        foreach ($services as $service) {

            $appointment_details_calendar .= "<tr><td><span style='padding:5px;'>".$service["name"] . ", Duration :: " . $this->hour_min($service["duration"]) . "</span></td></tr>";
        }
        if(count($consentFrmLinks)>0){
            $appointment_details_calendar .= "<tr><td><span style='padding:5px;'><b>Consent Form :<b>";
            foreach ($consentFrmLinks as $key => $value) {
                $key = $key+1;
                $appointment_details_calendar.='<a href="'.$value.'">Form-'.$key.'</a>&nbsp;&nbsp;';
            }
            $appointment_details_calendar .= "</span></td></tr>";
        }

        if(count($treatmentFrmLinks)>0){
            $appointment_details_calendar .= "<tr><td><span style='padding:5px;'><b>Treatment Form :<b>";
            foreach ($treatmentFrmLinks as $key => $value) {
                $key = $key+1;
                $appointment_details_calendar.='<a href="'.$value.'">Form-'.$key.'</a>&nbsp;&nbsp;';
            }
            $appointment_details_calendar .= "</span></td></tr>";
        }
        if(count($medicalFrmLinks)>0){
            $appointment_details_calendar .= "<tr><td><span style='padding:5px;'><b>Medical Form :<b>";
            foreach ($medicalFrmLinks as $key => $value) {
                $key = $key+1;
                $appointment_details_calendar.='<a href="'.$value.'">Form-'.$key.'</a>&nbsp;&nbsp;';
            }
            $appointment_details_calendar .= "</span></td></tr>";
        }
        $appointment_details_calendar .= "<tr><td><span style='padding:5px;'>your appointment date is " . date('d-M-Y', strtotime($appointment["appointment_date"]))." ".$appointment["start_time"] ." (".date('D', strtotime($appointment["appointment_date"])).")" . ".</span></td></tr>";
        $appointment_details_calendar .= "<tr><td><span style='padding:5px;'>Thanks<br>Salon Team.</span></td></tr>";
        
        echo $appointment_info_calendar = $appointment_details_top_calendar . $appointment_details_calendar . $appointment_details_down_calendar; die; 
    }
   /*  $appointment_details_top_calendar = '<table style="width:100%;">
        <tbody>
            <tr>
                <td></td>
            </tr>';
        $appointment_details_down_calendar = '</tbody></table>';
        $appointment_details_calendar = "<tr><td><span style='padding:5px;'>Customer Name: " . $appointment_customer["firstname"] . " " . $appointment_customer["lastname"] . ",</span></td></tr>";
        $appointment_details_calendar .= "<tr><td><span style='padding:5px;'>Appointment has been created for below service.</span></td></tr>";
        foreach ($services as $service) {

            $appointment_details_calendar .= "<tr><td><span style='padding:5px;'>".$service["name"] . ", Duration :: " . $this->hour_min($service["duration"]) . "</span></td></tr>";
        }
        if(count($consentFrmLinks)>0){
            $appointment_details_calendar .= "<tr><td><span style='padding:5px;'><b>Consent Form :<b>";
            foreach ($consentFrmLinks as $key => $value) {
                $key = $key+1;
                $appointment_details_calendar.='<a href="'.$value.'">Form-'.$key.'</a>&nbsp;&nbsp;';
            }
            $appointment_details_calendar .= "</span></td></tr>";
        }

        if(count($treatmentFrmLinks)>0){
            $appointment_details_calendar .= "<tr><td><span style='padding:5px;'><b>Treatment Form :<b>";
            foreach ($treatmentFrmLinks as $key => $value) {
                $key = $key+1;
                $appointment_details_calendar.='<a href="'.$value.'">Form-'.$key.'</a>&nbsp;&nbsp;';
            }
            $appointment_details_calendar .= "</span></td></tr>";
        }
        if(count($medicalFrmLinks)>0){
            $appointment_details_calendar .= "<tr><td><span style='padding:5px;'><b>Medical Form :<b>";
            foreach ($medicalFrmLinks as $key => $value) {
                $key = $key+1;
                $appointment_details_calendar.='<a href="'.$value.'">Form-'.$key.'</a>&nbsp;&nbsp;';
            }
            $appointment_details_calendar .= "</span></td></tr>";
        }
        $appointment_details_calendar .= "<tr><td><span style='padding:5px;'>your appointment date is " . date('d-M-Y', strtotime($appointment["appointment_date"]))." ".$appointment["start_time"] ." (".date('D', strtotime($appointment["appointment_date"])).")" . ".</span></td></tr>";
        $appointment_details_calendar .= "<tr><td><span style='padding:5px;'>Thanks<br>Salon Team.</span></td></tr>";
        
        $appointment_info_calendar = $appointment_details_top_calendar . $appointment_details_calendar . $appointment_details_down_calendar;
                    */
        
       
        
    /* $response = array(
        "success" => true,
        "data" => $appointments,
    );
    return response()->json($response); */
    }

}
