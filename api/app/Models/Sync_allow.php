<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sync_allow extends Model
{
    
    protected $fillable = ['id', 'from_user_company_id', 'to_user_company_id', 'is_allow_from_to','is_allow_to_from', 'created_by', 'updated_by', 'created_at','updated_at' ];
  
    
}
