<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Images extends Model
{
    
    protected $fillable = ['id', 'image_name', 'customer_id', 'created_by','updated_by','created_at', 'updated_at' ];
}
