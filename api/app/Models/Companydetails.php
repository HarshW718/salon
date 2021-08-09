<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Companydetails extends Model
{
    protected $table = "company_details";
    protected $fillable = ['id', 'user_company_id', 'company_name', 'company_logo','website','email',   'mobile', 'address','postal_code', 'residence','chamber_of_commerce','were_going','btw','created_at','updated_at','created_by','updated_by' ];
  
  
}
