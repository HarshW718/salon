<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SendMail extends Model
{
    protected $table = "send_mail";
    protected $fillable = ['id', 'sub', 'to_email', 'bodyData','user_id','created_at', 'updated_at' ];
  
  
}
