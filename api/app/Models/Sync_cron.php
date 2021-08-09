<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sync_cron extends Model
{
    
    protected $fillable = ['id', 'from_user_company_id', 'is_run', 'is_allow', 'created_at', 'updated_at', 'created_by','updated_by' ];
  
    
}
