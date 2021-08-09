<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use DB;

class Users extends Model
{ 
    protected $fillable = ['id', 'name','company_name', 'first_name','email','mobile','email_verified_at','password','remember_token','created_at','updated_at','last_name','discription','certificate_number','is_active','created_by','updated_by','parent_id'];
    
    protected $table = 'users';

    public function user_working_hour()
    {
        return $this->hasMany('App\Models\Users_working_hours','user_id','id');
    }


    public function user_extra_working_hour()
    {
        return $this->hasMany('App\Models\Users_extra_working_hours','user_id','id');
    }


    public function user_services()
    {
        return $this->hasMany('App\Models\UserServices','user_id','id');
    }
    
   
    public static function addStaff($request, $current_login,$parent_id,$company_name) {
        
        $user = new Users;
        $user->name = $request->get('name');
        $user->password = md5($request->get('password'));
        $user->first_name = $request->get('first_name');
        $user->last_name = $request->get('last_name');
        $user->company_name = $company_name;
        $user->email = $request->get('email');
        $user->mobile = $request->get('mobile');
        $user->role_id = $request->get('role');
        $user->is_sync_google = $request->get('is_sync_google')==1?1:0;
        $user->discription = $request->get('discription')!=''?$request->get('discription'):'';
        $user->is_active = $request->get('is_active')==1?1:0;
        $user->certificate_number =$request->get('certificate_number')!=''?$request->get('certificate_number'):'';
        $user->parent_id = $parent_id;
        $user->created_by = $current_login;
        $user->updated_by = $current_login;
        $user->created_at = date('Y-m-d H:i:s');
        $user->updated_at = date('Y-m-d H:i:s');
       
        if ($user->save()) {
            return $user;
        }
        
    }
    
    public static function getStaffDetails($id){
        
        return Users::select('id','name', 'first_name','email','mobile','password','last_name','discription','certificate_number','is_active','is_sync_google','parent_id')->where('id',$id)->get()->toArray();
        
    }
    
    public static function getUser($data){
        
        return Users::select('id','name', 'first_name','email','mobile','auth_token','last_name','is_active','role_id','is_sync_google')->where('email',$data['email'])->where('password',md5($data['password']))->get()->toArray();
        
    }

    public static function getGoogleLoginUser($email){
        
        return Users::select('id','name', 'first_name','email','mobile','auth_token','last_name','is_active','role_id','is_sync_google')->where('email',$email)->get()->toArray();
        
    }

    public static function updateUserGoogleToken($email){
        
        return Users::select('id','name', 'first_name','email','mobile','auth_token','last_name','is_active','role_id','is_sync_google')->where('email',$email)->get()->toArray();
        
    }
    
    public static function get_active_staff_list($user_id,$parent_id){
        
        return Users::select('id','name', 'first_name','email','mobile','auth_token','last_name','parent_id','is_active',DB::raw("(CASE WHEN id=".$user_id." THEN 1 ELSE 0 END ) as auth"),DB::raw("(select count(id) from user_services WHERE user_services.user_id=users.id) as total_services"),DB::raw("IFNULL((select CASE WHEN role_id=1 THEN 'Admin' WHEN role_id=2 THEN 'Worker' WHEN role_id=3 THEN 'Accountant' WHEN role_id=4 THEN 'Receptional' ELSE '-' END  from user_role WHERE user_role.user_id=users.id limit 1),'-') as role"))->where([['is_active','=',1],['parent_id','=',$parent_id]])->orwhere('id',$user_id)->orderBy('id', 'DESC')->get()->toArray(); 
        
    }
    
    public static function get_inActive_staff_list($user_id,$parent_id){
        
        return Users::select('id','name', 'first_name','email','mobile','auth_token','last_name','is_active','parent_id',DB::raw("(select count(id) from user_services WHERE user_services.user_id=users.id) as total_services"),DB::raw("IFNULL((select CASE WHEN role_id=1 THEN 'Admin' WHEN role_id=2 THEN 'Worker' WHEN role_id=3 THEN 'Accountant' WHEN role_id=4 THEN 'Receptional' ELSE '-' END  from user_role WHERE user_role.user_id=users.id limit 1),'-') as role"))->where([['is_active','=',0],['id','!=',$user_id],['parent_id','=',$parent_id]])->orderBy('id', 'DESC')->get()->toArray();
        
    }
    
    public static function authtokenGenerate($table,$column) {
        
        do {
            $token = md5(rand(6, 1000000000));
        } while (static::checkTokenAvailable($token,$table,$column) > 0);
        return $token;
        
    }
    public static function checkTokenAvailable($token,$table,$column){
        
        $data =  DB::table($table)->select('id')->where($column, $token)->get();
        $a= collect($data)->map(function($x){ return (array) $x; })->toArray();
        return count($a);
    }
    
     public static function editStaff($request){
       
        $user = Users::find($request->get('id'));
        $user->name = $request->get('name');
        $user->first_name = $request->get('first_name');
        $user->last_name = $request->get('last_name');
        $user->email = $request->get('email');
        $user->mobile = $request->get('mobile');
        $user->discription = $request->get('discription')!=''?$request->get('discription'):'';
        $user->is_active = $request->get('is_active')==1?1:0;
        $user->is_sync_google = $request->get('is_sync_google')==1?1:0;
        $user->certificate_number =$request->get('certificate_number')!=''?$request->get('certificate_number'):'';
        $user->updated_by =$request->created_by;
        $user->created_at = date('Y-m-d H:i:s');
        $user->updated_at = date('Y-m-d H:i:s');
        $user->save();
        return $user;
    }
    
    public static function getEmail($id){
        
        return Users::select('email','password')->where('id',$id)->get()->toArray();
    }
    
    public static function saveMail($data){
        
        DB::table('send_mail')->insertGetId($data);
    }
    
    public static function sendMailUser(){
        
       return DB::table('send_mail')->select('*')->orderby('id','desc')->limit(1)->get()->toArray();
    }
    
    public static function deleteMailUser($id){
        
        DB::table('send_mail')->where('id', $id)->delete();
    }
}
