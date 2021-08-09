<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use DB;


class AppointmentServices extends Model
{
    protected $table = 'appointment_services'; 
    
    protected $fillable = ['id', 'appointment_id','worker_id','service_id','duration','created_by','updated_by', 'created_at', 'updated_at',];
}