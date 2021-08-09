<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SmptDetails;
use App\Http\Controllers\Middleweb_Controller;

class SmptdetailsController extends Middleweb_Controller
{

    public function index()
    {
        $smpt_detail = SmptDetails::where('user_company_id',$this->ExpToken["parent_id"])->orderBy('id', 'DESC')->first();
        $response = array(
            "success" => true,
            "data" => $smpt_detail,
        );
        return response()->json($response);
    }



    public function update(Request $request)
    {


        $smpt_detail = isset($request->id) ? SmptDetails::find($request->id) : new SmptDetails();
        $smpt_detail->mail_host = $request->mail_host;
        $smpt_detail->mail_port = $request->mail_port;
        $smpt_detail->mail_username = $request->mail_username;
        $smpt_detail->mail_password = $request->mail_password;
        $smpt_detail->created_by = $this->ExpToken["user_id"];
        $smpt_detail->updated_by = $this->ExpToken["user_id"];
        $smpt_detail->user_company_id = $this->ExpToken["parent_id"];
        $smpt_detail->save();
        $response = array(
            "success" => true,
            "message" => "SmptDetails update successfully.",
        );

        return response()->json($response);
    }
}
