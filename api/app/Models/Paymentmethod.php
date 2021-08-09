<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Paymentmethod extends Model
{
    protected $fillable = ['id', 'user_company_id', 'method', 'payment_icon', 'is_check'];
   
    protected $table = "payment_method";


}
