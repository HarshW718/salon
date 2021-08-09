<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use DB;


class Cashdesk extends Model
{
    protected $fillable = ['id','user_company_id', 'customer_id', 'worker_id','appointment_id','invoice_date','comment', 'created_by','updated_by','created_at', 'updated_at' ];
   
    protected $table = "invoice";
    
    public function customers()
    {
        return $this->hasOne('App\Models\Customers','id','customer_id');
    }

}
