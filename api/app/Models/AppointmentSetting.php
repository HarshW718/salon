<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use DB;


class AppointmentSetting extends Model
{
    protected $table = 'appointment_setting'; 
    
    protected $fillable = ['id', 'time_slot_duration', 'start_time', 'end_time', 'first_day','time_line','display','user_id','created_ar','updated_at'];
}
