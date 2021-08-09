<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InvoiceData extends Model
{
    protected $table = 'invoice_data';
    protected $fillable = ['id','user_company_id', 'invoice_id','appointment_id', 'which_one','data_id','description','display_name','calculation_sale_price','tax_id','quantity','discount_apply','discount_percentage','discount_amount','single_row_total','single_row_comment', 'created_by','updated_by','created_at', 'updated_at' ];

  public function appointment(){

    return $this->belongsTo('App\Models\Appointments');


   // return $this->belongsTo('App\User');
  }
}
?>
