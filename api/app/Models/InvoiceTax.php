<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InvoiceTax extends Model
{
    protected $table = 'invoice_tax';
    protected $fillable = ['id', 'user_company_id','invoice_id', 'tax_id','tax_value','tax_amount'];

    public function service_tax()
    {
        return $this->hasOne('App\Models\Tax','id','tax_id');
    }
  

  
}
?>
