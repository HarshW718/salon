<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use DB;


class AppointmentStatusColor extends Model
{
    protected $table = 'appointment_status_color'; 
    
    protected $fillable = ['id', 'appointment_status_id', 'admin_id','status_color','created_by','updated_by', 'created_at', 'updated_at'];


    public function appointment_status()
    {
        return $this->hasOne('App\Models\AppointmentStatus','id','appointment_status_id');
    }
}