<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use DB;


class AppointmentLog extends Model
{
    protected $table = 'appointment_log'; 
    
    protected $fillable = ['id', 'appointment_id', 'appointment_status',  'cancel_reason','log_date_time','is_email','is_sms', 'created_by','updated_by','created_at', 'updated_at'];

    public function appointment_status_data()
    {
        return $this->hasOne('App\Models\AppointmentStatus','id','appointment_status');
    }

    public function changes_by()
    {
        return $this->hasOne('App\Models\Users','id','updated_by'); 
    }


}