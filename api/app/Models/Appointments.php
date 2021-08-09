<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use DB;


class Appointments extends Model
{

    protected $fillable = ['id', 'customer_id', 'worker_id', 'service_id','coupon_id', 'comments', 'appointment_date', 'start_time', 'end_time','appointment_status_id', 'is_sms', 'is_email', 'created_by', 'updated_by', 'created_at', 'updated_at'];


    public function service()
    {
        return $this->hasOne('App\Models\Services', 'id','service_id');
    }

    public function appointment_status_color()
    {
        return $this->hasOne('App\Models\AppointmentStatusColor', 'appointment_status_id','appointment_status_id');
    }


    // public function appointment_status()
    // {
    //     return $this->hasOne('App\Models\AppointmentStatus', 'id','appointment_status_id');
    // }


    public function customer() 
    {
        return $this->hasOne('App\Models\Customers', 'id','customer_id');
    }

    public function worker() 
    {
        return $this->hasOne('App\Models\Users', 'id','worker_id');
    }

    public function appointments_log()
    {   
        return $this->hasMany('App\Models\AppointmentLog','appointment_id','id');
    }

    public function created_by()
    {
        return $this->hasOne('App\Models\Users', 'id','created_by');

    }

    public function invoice_data()
    {
        return $this->hasOne('App\Models\InvoiceData', 'appointment_id','id');

    }
}
