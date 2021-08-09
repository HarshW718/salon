<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InvoiceCoupons extends Model
{
    protected $table = 'invoice_coupons';
    protected $fillable = ['id', 'user_company_id','invoice_id', 'customer_id','customer_coupon_id','hmt_used','created_by','updated_by','created_at','updated_at'];

    // public function service_tax()
    // {
    //     return $this->hasOne('App\Models\Tax','id','tax_id');
    // }
  

  
}
?>
