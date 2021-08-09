<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use DB;


class BlockTime extends Model
{
    protected $table = "block_time";
    
    protected $fillable = ['id', 'worker_id', 'type', 'description','start_time','end_time','created_by','updated_by','created_at', 'updated_at' ];
  

  
}
