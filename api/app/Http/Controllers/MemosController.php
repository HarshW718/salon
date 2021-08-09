<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Memos;
use App\Http\Controllers\Middleweb_Controller;
use DB;
class MemosController extends Middleweb_Controller
{
    public function store(Request $request){

        $memo = ($request->id != 0) ? Memos::find($request->id) : new Memos();
        $memo->user_company_id = $this->ExpToken["parent_id"];
        $memo->customer_id = $request->customer_id;
        $memo->title = $request->title;
        $memo->note = $request->note;
        $memo->created_by = $this->ExpToken["parent_id"];
        if($request->id != 0){
        $memo->updated_by = $this->ExpToken["parent_id"];
        }
        $memo->save();
        $message = ($request->id != 0) ? "Memo update successfully." : "Memo add successfully.";
        $response = array(
            "success" => true,
            "message" => $message,
        );
        return response()->json($response);
       

    }


    public function memosByCustomerId($customer_id){

        $memos = Memos::where('customer_id',$customer_id)->orderBy('created_at','desc')->get();
        $response = array(
            "success" => true,
            "data" => $memos,
        );
        return response()->json($response);
       
    }

    public function deleteMemo(Request $request){

        $memos = Memos::find($request->id);
        $memos->delete();
        $response = array(
            "success" => true,
            "message" => "Memo delete successfully.",
        );
        return response()->json($response);
       
    }



}
