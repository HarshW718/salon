<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use DB;


class CashdeskInvoice extends Model
{
    protected $table = 'invoice_template'; 
    
    protected $fillable = ['id', 'template_type', 'tempate_description','user_id','user_company_id','created_by','updated_by','created_at','updated_at'];
}
