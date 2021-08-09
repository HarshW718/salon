<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\UserServices;
use App\Http\Controllers\Middleweb_Controller;
class UserServicesController extends Middleweb_Controller
{
    //
    public function update_service(Request $request) {
        $user_service = new UserServices();
        $user_service::where('user_id', $request->user_id)->delete(); 
        foreach ($request->selected_services as $key => $value){ 
            $user_service1 = new UserServices();
            if($value != '' ){ 
                $user_service1->user_id = $request->user_id;
                $user_service1->service_category_id = 0;
                $user_service1->service_id = $key;
                $user_service1->save();
            }
            }
            $response = array(
                "success" => true,
                "message" => "Service update successfully.",
            );
            return response()->json($response);
        
       
    }
}
