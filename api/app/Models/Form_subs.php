<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Form_subs extends Model
{
    
    protected $fillable = ['id', 'title', 'title_value', 'user_company_id', 'created_at', 'updated_at', 'created_by','updated_by' ];
}
