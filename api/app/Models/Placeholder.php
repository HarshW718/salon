<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use DB;


class Placeholder extends Model
{
    protected $fillable = ['id', 'name','type', 'description', 'testvalue','created_at','updated_at'];
   
    protected $table = "placeholders";


}
