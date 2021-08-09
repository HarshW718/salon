<?php

namespace App\Http\Controllers\Member;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Member\Activity;

class ActivityController extends Controller
{
    public function eventAccept(Request $request) {
        try {
            $update_id = $request['update_id'];
            $status = $request['update_status']; 
            if(empty($update_id)) {
                $response['error'] = false;
                $response['message'] = "Invalid Request";
                return response($response);
            }
            $user_id = $request->get('user_id');
            $result = Activity::event_accept($user_id,$update_id,$status);
            
            if($result) {
                $response['error'] = false;
                $response['message'] = "Success";
              } else {
                $response['error'] = true;
                $response['message'] = "Failed";
              }
            return response($response);
          }catch (\Exception $e) {
            $response['error'] = true;
            $response['message'] = $e->getMessage();
            return response($response);
          }
    }
}
