<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User_role extends Model
{
    protected $fillable = ['id', 'menu_id', 'role_id','user_id','created_by','updated_by','created_at','updated_at'];
    protected $table = 'user_role';
    
    public static function saveRole($insertData) {
        $user_role = new User_role;
        $user_role->menu_id = $insertData['menu_id'];
        $user_role->role_id = $insertData['role_id'];
        $user_role->user_id = $insertData['user_id'];
        $user_role->created_by =$insertData['created_by'];
        $user_role->updated_by =$insertData['created_by'];
        $user_role->created_at = date('Y-m-d H:i:s');
        $user_role->updated_at = date('Y-m-d H:i:s');
        if ($user_role->save()) {
            return $user_role;
        }
    }
    public static function deleteRole($id){
        $user_role = User_role::where('user_id',$id);
        $user_role->delete();
        return $user_role;
    }
    public static function getStaffRoles($id){
        return User_role::select('menu_id', 'role_id')->where('user_id',$id)->get()->toArray();
    }
    
}
