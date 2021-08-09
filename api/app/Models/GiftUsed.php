<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;



class GiftUsed extends Model
{
    protected $table = 'gift_used';
    protected $fillable = ['id','invoice_id', 'gift_id', 'amount'];  
}
?>
