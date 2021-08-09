<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
class Users_extra_working_hours extends Model
{
    protected $fillable = ['id', 'user_id', 'dayindex','date','from_time','to_time','created_by','updated_by','updated_at','created_at'];
    
    protected $table = 'users_extra_working_hours';

    public function user_services()
    {
        return $this->hasMany('App\Models\UserServices','user_id','user_id');

    }
    
}
