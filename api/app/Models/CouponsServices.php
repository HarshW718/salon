<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CouponsServices extends Model
{
    
    protected $fillable = ['id','user_company_id', 'coupon_id', 'service_id', 'no_of_services','where_from'];

    public function coupon_detail()
    {
        return $this->hasOne('App\Models\Coupons', 'id','coupon_id');
    }
  
}
