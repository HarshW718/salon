<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use DB;


class AppointmentStatus extends Model
{
    protected $table = 'appointment_status'; 
    
    protected $fillable = ['id', 'status_name', 'status_color', 'created_at', 'updated_at'];
}