<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InvoicePayment extends Model
{
    protected $table = 'invoice_payment';
    protected $fillable = ['id','user_company_id','invoice_id', 'payment_method', 'amount','invoice_date', 'created_by','updated_by','created_at', 'updated_at' ];
}
?>
