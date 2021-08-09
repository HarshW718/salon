<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use DB;


class InvoiceTemplate extends Model
{
    protected $table = 'invoice_template';
    
    protected $fillable = ['id','user_company_id', 'template_type','invoice_title', 'tempate_description','user_id','created_by','updated_by','created_at','updated_at'];
  
}
?>
