<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\InvoicePassword;
use App\Http\Controllers\Middleweb_Controller;

class InvoicePasswordController extends Middleweb_Controller
{
    public function getInvoicePassword(Request $request){
       $data = InvoicePassword::where('user_company_id',$this->ExpToken["parent_id"])->first();
       $response = array(
                'success' => true,
                "data" => $data
                );
        return response()->json($response);
    }

    public function saveInvoicePassword(Request $request){
        
        $invoice_password = isset($request->id) ? InvoicePassword::find($request->id) : new InvoicePassword();
        $invoice_password->invoice_password = $request->invoice_password;
        $invoice_password->user_company_id = $this->ExpToken["parent_id"];
        $invoice_password->created_by = $this->ExpToken["parent_id"];
        $invoice_password->updated_by = $this->ExpToken["parent_id"];
        $invoice_password->save();
        if(isset($request->id)){
            $message = "Password update successfully.";
        }else{
            $message = "Password add successfully.";
        }
        $response = array(
            "success" => true,
            "message" => $message,
        );
        return response()->json($response);
     }
    
    
}
