<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use DB;

use Config;
use Twilio;
use App\Models\Email;
class Common extends Model {


    public static function authtokenGenerate($table,$column) {
        do {
            $token = md5(rand(6, 1000000000));
        } while (static::checkTokenAvailable($token,$table,$column) > 0);
        return $token;
    }

    public static function tokenGenerate($table,$column) {
        do {
            $token = rand(100000, 999999);
        } while (static::checkTokenAvailable($token,$table,$column) > 0);
        return $token;
    }

    public static function leaguetokenGenerate($table,$column,$fix) {
//        do {
//            $token = md5($fix);
//        } while (Common::checkTokenAvailable($token,$table,$column) > 0);
        $token = md5($fix);
        return $token;
    }

    public static function checkTokenAvailable($token,$table,$column){

        $data =  DB::table($table)->select('user_id')->where($column, $token)->get();
        $a = collect($data)->map(function($x){ return (array) $x; })->toArray();
        return count($a);
    }


    public static function sendOtp($phone,$otp){
        try {
            $message= Twilio::message('+'.$phone, "Your SES BETMATES verification code is " . $otp . ".");
            } catch (Exception $e) {
            $responce['error'] = true;
            $responce['message'] = $e->getMessage();
            //return $responce;
        }
    }

    public static function insert($table='',$data = array()){

        $insert = DB::table($table)->insertGetId($data);
        if (isset($insert)) {
            return $insert;
        } else {
            return false;
        }
    }

    public static function updates($table='',$warray = array(),$data = array()) {

        $updated = DB::table($table)->where($warray)->update($data);
        if (isset($updated)) {
            return $updated;
        } else {
            return true;
        }

    }

    public static function getOne($table='',$checkarray=array()){
        if(empty($checkarray)) {
            $result = DB::table($table)->select('*')->get();
       } else {
            $result = DB::table($table)->select('*')->where($checkarray)->get();
        }
        $result = collect($result)->map(function($x){ return (array) $x; })->toArray();
        return $result;
    }

    public static function getOneColumn($table='',$checkarray=array(),$getvalue){
        if(empty($checkarray)) {
            $result = DB::table($table)->select($getvalue)->get();
        } else {
            $result = DB::table($table)->select($getvalue)->where($checkarray)->get();
        }
        $result = collect($result)->map(function($x){ return (array) $x; })->toArray();
        return $result;
        /* $result = DB::select( DB::raw("SELECT ".$getvalue." FROM {$table}"));
       $result = collect($result)->map(function($x){ return (array) $x; })->toArray();
       print_r($result); */
        //return $result;
    }

    public static function getListColumn($table='',$checkarray=array(),$getvalue){
        if(empty($checkarray)) {
            $result = DB::table($table)->select($getvalue)->get();
        } else {
            $result = DB::table($table)->select($getvalue)->where($checkarray)->get();
        }
        return $result;
        /* $result = DB::select( DB::raw("SELECT ".$getvalue." FROM {$table}"));
       $result = collect($result)->map(function($x){ return (array) $x; })->toArray();
       print_r($result); */
        //return $result;
    }

    public static function checkFcmToken($fcmData){
        $user_id=$fcmData['user_id'];
        $fcm_token=$fcmData['fcm_token'];
        $requestfrom=$fcmData['requestfrom'];
        // return 0 mean insert date. return 1 mean update date
        $fcmData=DB::table('bet_fcm_token')->select('*')->where('fcm_token',$fcm_token)->first(); $userFcmData=DB::table('bet_fcm_token')->select('*')->where('user_id',$user_id)->where('fcm_token',$fcm_token)->first();

        if(!empty($userFcmData)){

           // already avaialbe with user so only update
            if(!empty($fcmData)){
                $del = DB::table('bet_fcm_token')->where('fcm_token', '=', $fcm_token)->delete();
                if($del){
                    $insertArray=array('user_id'=>$user_id,'fcm_token'=>$fcm_token,'requestfrom'=>$requestfrom,'created_at'=>date('Y-m-d H:i:s'),'updated_at'=>date('Y-m-d H:i:s'),'int_created_at'=>time(),'int_updated_at'=>time(),'created_by'=>$user_id);
                    $in = DB::table('bet_fcm_token')->insertGetId($insertArray);
                     return 0;
                 }
            }

        }else {
            // not available with user
            // so check only FCM token with other user
             if(!empty($fcmData)){
                 //delete in other user
                 $del = DB::table('bet_fcm_token')->where('fcm_token', '=', $fcm_token)->delete();
                 if($del){
                    $insertArray=array('user_id'=>$user_id,'fcm_token'=>$fcm_token,'requestfrom'=>$requestfrom,'created_at'=>date('Y-m-d H:i:s'),'updated_at'=>date('Y-m-d H:i:s'),'int_created_at'=>time(),'int_updated_at'=>time(),'created_by'=>$user_id);
                    $in = DB::table('bet_fcm_token')->insertGetId($insertArray);
                     return 0;
                 }
             }else {
                 // -- insert with user
                 $insertArray=array('user_id'=>$user_id,'fcm_token'=>$fcm_token,'requestfrom'=>$requestfrom,'created_at'=>date('Y-m-d H:i:s'),'updated_at'=>date('Y-m-d H:i:s'),'int_created_at'=>time(),'int_updated_at'=>time(),'created_by'=>$user_id);
                  $in = DB::table('bet_fcm_token')->insertGetId($insertArray);
                 return 0;
             }
        }
    }

    public static function UploadProfileImages($data, $ProfileImage){

        $file = $ProfileImage->getClientOriginalName();
        $tmpName = $ProfileImage->getPathName();
        $profile = "profile.png";
        $filename = time(). '_' . $profile;
        $destinationPath =  Config::get('constants.FILE_UPLOAD_PATH');
        if ($ProfileImage->move($destinationPath, $filename)) {
            $ProfileImageName = $filename;
        } else {
            $ProfileImageName = '';
        }
        return $ProfileImageName;
    }
    public static function UploadAgeImages($ProfileImage){

        $file = $ProfileImage->getClientOriginalName();
        $tmpName = $ProfileImage->getPathName();
        $profile = "age.png";
        $filename = time().rand().'_' . $profile;
        $destinationPath =  Config::get('constants.FILE_UPLOAD_PATH');
        if ($ProfileImage->move($destinationPath, $filename)) {
            $ProfileImageName = $filename;
        } else {
            $ProfileImageName = '';
        }
        return $ProfileImageName;
    }

    public static function deletes($table, $warray){

        $del = DB::table($table)->where($warray)->delete();
        return $del;
    }

    public static function sendMail($emailsubject, $body, $to){
        Email::send_email($emailsubject, $body, $to);
    }

    public static function paymentdetails($user_id) {
        $result = DB::table('bet_strp_details')->select('bet_users.email','bet_strp_details.*')
                    ->rightJoin('bet_users', 'bet_users.user_id', 'bet_strp_details.user_id')
                    ->where('bet_users.user_id',$user_id)
                    ->get();
        return collect($result)->map(function($x){ return (array) $x; })->toArray();
    }

    public static function UploadLeagueImages($ProfileImage){

        $file = $ProfileImage->getClientOriginalName();

        $tmpName = $ProfileImage->getPathName();
        $image_extension = $ProfileImage->getClientOriginalExtension();
        if($image_extension=='PNG' || $image_extension=='png' || $image_extension=='jpg' || $image_extension=='JPG' || $image_extension=='GIF' || $image_extension=='gif'  || $image_extension=='jpeg' || $image_extension=='JPEG' || $image_extension=='TIFF' || $image_extension=='TIF' ){
            $league = "league.".$image_extension;
            $filename = time(). '_' . $league;
            $destinationPath =  Config::get('constants.FILE_UPLOAD_PATH')."league/";
            if ($ProfileImage->move($destinationPath, $filename)) {
                $ProfileImageName = $filename;
            } else {
                $ProfileImageName = '';
            }
        }else{
            $ProfileImageName='exe_error';
        }
        return $ProfileImageName;
    }

   public static function getOneColumnRaw($table='',$checkarray=array(),$getvalue){
        if(empty($checkarray)) {
            $result = DB::select( DB::raw("SELECT {$getvalue} FROM {$table} where {$checkarray}"));
        } else {
            $result = DB::select( DB::raw("SELECT {$getvalue} FROM {$table} where {$checkarray}"));
        }
        $result = collect($result)->map(function($x){ return (array) $x; })->toArray();
        return $result;
        /* $result = DB::select( DB::raw("SELECT ".$getvalue." FROM {$table}"));
       $result = collect($result)->map(function($x){ return (array) $x; })->toArray();
       print_r($result); */
        //return $result;
    }

    public static function getdatetime() {
	    $utc_str = gmdate("M d Y H:i:s", time());
	    $datearr = array('date'=>gmdate("Y-m-d"),'timestamp'=>strtotime($utc_str),'datetime'=>gmdate("Y-m-d H:i:s"));
	    return $datearr;
    }

    public static function eventWeekId($eventid = '') {
	$weekDatas = DB::select( DB::raw("SELECT week_id from bet_weeks where event_id = {$eventid}"));
	return $weekDatas;
    }
 public static function getCurrentWeek($event_id){

        $result = DB::table('bet_events')->select('current_week_id')->where(['event_id'=>$event_id])->get();
        $result = collect($result)->map(function($x){ return (array) $x; })->toArray();
        if(!empty($result)){
            return $result[0]['current_week_id'];
        }else {
            return 0;
        }
    }
    public static function badgeCount($user_id){
        $result = DB::table('bet_notifications')->select(DB::raw("count(notifications_id) as totalCount"))->where(['user_id'=>$user_id,'is_read'=>0])->get();
        return $result[0]->totalCount;
    }
    public static function send_notifiction($data,$match_week_id='') {
        if(isset($data['title'])){
            $title=$data['title'];
        }else {
           $title ='Sweeps';
        }
        $getvalue = ["fcm_token","requestfrom"];
        $checkArray=array('user_id'=>$data['from_user_id']);
        $getFcmToken = Common::getOneColumn('bet_fcm_token', $checkArray, $getvalue);
        $week_id=0;
        if($match_week_id!=0 && $match_week_id!='')
        {
            $week_id=$match_week_id;
        }

        for($i=0;$i<count($getFcmToken);$i++){
            if($getFcmToken[$i]['requestfrom']==1){
                $json_data = [
                    "to" => $getFcmToken[$i]['fcm_token'],
                    "notification" => [
                    "body" =>$data['msg'],
                    "title" => $title,
                    "type"=>$data['type'],
                    "id"=>$data['to_id'],
                    "badge"=>$data['badge'],
                    "week_id"=>$week_id,
                    "notify_id"=>$data['notify_id'],
                    "sound"=>"default"
                    ],
                ];
            }else {
                $json_data = [
                    "to" => $getFcmToken[$i]['fcm_token'],
                    "notification" => [
                    "body" =>$data['msg'],
                    "title" => $title,
                     "sound"=>"default"

                    ],
                    "data"=>[
                        "type"=>$data['type'],
                        "id"=>$data['to_id'],
                        "badge"=>1,
                        "week_id"=>$week_id,
                        "notify_id"=>$data['notify_id']
                    ]
                ];
            }
            $data11 = json_encode($json_data);
            //FCM API end-point
            $url1 = Config::get('constants.FCMURL');
            //api_key in Firebase Console -> Project Settings -> CLOUD MESSAGING -> Server key

            //header with content_type api key
            $headers1 = array(
            'Content-Type:application/json',
            'Authorization:key='.Config::get('constants.SERVER_KEY_NOTFY')
            );
            //CURL request to route notification to FCM connection server (provided by Google)
            $ch1 = curl_init();
            curl_setopt($ch1, CURLOPT_URL, $url1);
            curl_setopt($ch1, CURLOPT_POST, true);
            curl_setopt($ch1, CURLOPT_HTTPHEADER, $headers1);
            curl_setopt($ch1, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch1, CURLOPT_SSL_VERIFYHOST, 0);
            curl_setopt($ch1, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch1, CURLOPT_POSTFIELDS, $data11);
            $result1 = curl_exec($ch1);
        }
    }

    public static function menu($user_role) {

        $menu = [['menu_id'=>'1','menu_url'=>'#!/app/pages/customers','redirect_url'=>'app.pages.customers','icon_name'=>'fa fa-address-card-o','menu_name'=>'Customers','show_menu'=>'true','ng_name'=>false,'permit_user'=>false],['menu_id'=>'2','menu_url'=>'#!/app/pages/cashdesk_main','redirect_url'=>'app.pages.cashdesk_main','icon_name'=>'fa fa-usd','menu_name'=>'Cash Desk','show_menu'=>'true','ng_name'=>false,'permit_user'=>false],['menu_id'=>'3','icon_name'=>'fa fa-bar-chart','menu_url'=>'#!/app/pages/report','redirect_url'=>'app.pages.report','menu_name'=>'Reports','show_menu'=>'true','ng_name'=>false,'permit_user'=>false],['menu_id'=>'4','menu_url'=>'#!/app/pages/management','redirect_url'=>'app.pages.managemanet','icon_name'=>'fa fa-gear','menu_name'=>'Management','show_menu'=>'true','ng_name'=>false,'permit_user'=>false]] ;

            foreach($user_role as $value) {
               /*  if(in_array($value->menu_id, array_column($menu, 'menu_id'))) {
                   // search value in the array
                   $menu['menu_id']
                }  */
                $key = array_search($value->menu_id, array_column($menu, 'menu_id'));
                $menu[$key]['permit_user'] = true;
            }
        return $menu;
    }

    public static function userMenu($user_role) {

        $menu = [['menu_id'=>'1','menu_url'=>'#!/app/pages/customers','redirect_url'=>'app.pages.customers','icon_name'=>'fa fa-address-card-o','menu_name'=>'Customers','show_menu'=>'true','ng_name'=>false,'permit_user'=>false],['menu_id'=>'2','menu_url'=>'#!/app/pages/cashdesk','redirect_url'=>'app.pages.cashdesk','icon_name'=>'fa fa-usd','menu_name'=>'Cash Desk','show_menu'=>'true','ng_name'=>false,'permit_user'=>false],['menu_id'=>'3','icon_name'=>'fa fa-bar-chart','menu_url'=>'Reports','redirect_url'=>'app.pages.reports','menu_name'=>'Reports','show_menu'=>'true','ng_name'=>false,'permit_user'=>false],['menu_id'=>'4','menu_url'=>'#!/app/pages/management','redirect_url'=>'app.pages.managemanet','icon_name'=>'fa fa-gear','menu_name'=>'Management','show_menu'=>'true','ng_name'=>false,'permit_user'=>false]] ;

            foreach($user_role as $value) {
               /*  if(in_array($value->menu_id, array_column($menu, 'menu_id'))) {
                   // search value in the array
                   $menu['menu_id']
                }  */
                $key = array_search($value['menu_id'], array_column($menu, 'menu_id'));
                $menu[$key]['ng_name'] = true;
}
        return $menu;
    }

    public static function mailData($table,$warray){

        return DB::table($table)->where($warray)->get()->toarray();

    }
    public static function replaceMailData($replaceParams,$body){


        foreach($replaceParams as $parms => $value){
             if (strpos($body, $parms) !== false) {
                if($parms=='[[company-logo]]'){
                     $body = str_replace($parms,'<img src="'.$replaceParams[$parms].'">', $body);
                }else {
                    $body = str_replace($parms, $replaceParams[$parms], $body);
                }

            }
        }
        return $body;


    }
}
