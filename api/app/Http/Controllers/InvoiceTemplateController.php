<?php

namespace App\Http\Controllers;

use App\Models\InvoiceTemplate;
use App\Http\Controllers\Middleweb_Controller;

class InvoiceTemplateController extends Middleweb_Controller
{
    public function invoice_template()
    {
     $invioce_template = InvoiceTemplate::where('id',2)->first();
     return response()->json($invioce_template);
    }
    
}
