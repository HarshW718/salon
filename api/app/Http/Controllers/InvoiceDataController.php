<?php

namespace App\Http\Controllers;

use App\Models\InvoiceData;
use App\Http\Controllers\Middleweb_Controller;
use DB;
class InvoiceDataController extends Middleweb_Controller
{

    
    public function gift_list()
    {
        $gift_list = InvoiceData::where('user_company_id',$this->ExpToken["parent_id"])->where('gift_used',0)->where('which_one','gift')->orderBy('id', 'DESC')->get();
         return response()->json($gift_list);
    }
    public function all_gifts()
    {
        $gift_list = InvoiceData::leftJoin('invoice', function($join) {
                    $join->on('invoice_data.invoice_id', '=', 'invoice.id');
                })->leftJoin('users', function($join) {
                    $join->on('invoice.customer_id', '=', 'users.id');
                })->leftJoin('company_details', function($join) {
                    $join->on('invoice.user_company_id', '=', 'company_details.user_company_id');
                })->select('invoice_data.*','invoice.invoice_date','invoice.customer_id','company_details.company_name',DB::raw('if(invoice.customer_id=0,company_details.company_name,users.first_name) as soldOn'))->where('invoice_data.user_company_id',$this->ExpToken["parent_id"])->where('which_one','gift')->get()->toarray();
         $response = array(
            "success" => true,
            "gift_list" => $gift_list
        );
        return response()->json($response);
    }
    
}
