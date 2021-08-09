<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Memos extends Model
{
    protected $table = 'memos';
    protected $fillable = ['id', 'user_company_id','customer_id','title','text','created_by','updated_by','created_at','updated_at'];

  
}
?>
