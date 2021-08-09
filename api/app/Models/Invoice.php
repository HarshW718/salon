<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    protected $table = 'invoice';
    
    protected $fillable = ['id','user_company_id', 'customer_id','walk_in_customer_id','to_pay_id', 'worker_id','appointment_id','invoice_date','treatment_date','total_invoice_amount','is_total_amount_paid','invoice_prefix','final_invoice_no','is_received','comment', 'created_by','updated_by','created_at', 'updated_at' ];

    
    public function invoice_tax()
    {
        return $this->hasMany('App\Models\InvoiceTax','invoice_id','id');

    }

    public function invoice_data()
    {
        return $this->hasMany('App\Models\InvoiceData','invoice_id','id');

    }

    public function customer_coupon()
    {
        return $this->hasMany('App\Models\CustomerCoupons','invoice_id','id');

    }

    public function customer() 
    {
        return $this->hasOne('App\Models\Customers', 'id','customer_id');
    }

  
}
?>
