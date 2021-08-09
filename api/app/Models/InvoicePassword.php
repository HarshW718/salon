<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InvoicePassword extends Model
{
    protected $table = 'invoice_password';
    protected $fillable = ['id', 'user_company_id','invoice_password', 'created_by','updated_by','created_at','updated_at'];
}
?>
