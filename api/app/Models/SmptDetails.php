<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SmptDetails extends Model
{
    protected $table = "smpt_details";
    protected $fillable = ['id', 'mail_host', 'mail_port', 'mail_username','mail_password','user_id',   'created_by', 'updated_by','created_at', 'updated_at' ];
  
  
}
