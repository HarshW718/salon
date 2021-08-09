<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sync_product_log extends Model
{
    
    protected $fillable = ['id', 'name', 'master_product_id', 'from_user_company_id', 'to_user_company_id', 'updated_by', 'created_by'];
  
    
}
