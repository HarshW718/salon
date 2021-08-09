<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;



class Form_ans extends Model
{
    protected $fillable = ['id', 'user_company_id','customer_id', 'fileds', 'form_id','sign','app_id','created_by','updated_by','created_at','updated_at'];
     protected $table = "form_ans";
}
