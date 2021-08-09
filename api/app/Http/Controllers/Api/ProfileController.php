<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Validator;
use App\Models\Profile;
use App\Models\Common;
use Image;

class ProfileController extends Controller
{
    /*-------------------- Update profile function for user --------------------*/
    public function updateProfile(Request $request) {
        $validator = Validator::make($request->all(), [
            'name' => 'required',
        ]);  
        if ($validator->fails()) {
            $err_msg = $validator->messages()->first();
            $response['error'] = true;
            $response['message'] = $err_msg;
            return response($response)->header('Content-Type', 'json');
        }
        $user_id = $request->get('user_id');
        $check = Profile::check_valid_user($user_id);
        if($check > 0) {
            $response = Profile::update_profile($user_id,$request);
        } else {
            return response(['error'=>false,'message'=>'User not found in application'])->header('Content-Type', 'json');
        }
        return $response;
    }

     /*-------------------- Reset passsword function for user --------------------*/
     public function resetPassword(Request $request) {
         
        $validator = Validator::make($request->all(), [
            'old_password' => 'required',
            'new_password' => 'required',
        ]);  
        if ($validator->fails()) {
            $err_msg = $validator->messages()->first();
            $response['error'] = true;
            $response['message'] = $err_msg;
            return response($response)->header('Content-Type', 'json');
        }
        $user_id = $request->get('user_id');
        $response = Profile::reset_password($user_id,$request);
        return $response;
    }

    /*------ This is using for update profile details------*/
    public function updateProfileDetails(Request $request) {
        $validator = Validator::make($request->all(), [
            'name' => 'required',
            'club_name' => 'required',
        ]);  
        if ($validator->fails()) {
            $err_msg = $validator->messages()->first();
            $response['error'] = true;
            $response['message'] = $err_msg;
            return response($response)->header('Content-Type', 'json');
        }
        $user_id = $request->get('user_id');
        $response = Profile::update_profile_details($user_id,$request);
        return $response;
    }

    /*------ This is using for getting profile details------*/
    public function propfileDetails(Request $request) {
        $user_id = $request->get('user_id');
        $response = Profile::profile_details($user_id);
        return $response;
    }

    public function changeEmail(Request $request) {
        try {
            $validator = Validator::make($request->all(), [
                'old_email' => 'required|email',
                'new_email' => 'required|email',
            ]);  
            if ($validator->fails()) {
                $err_msg = $validator->messages()->first();
                $response['error'] = true;
                $response['message'] = $err_msg;
                return response($response);
            }
            $user_id = $request->get('user_id');
            $result = Profile::change_email($user_id,$request);
            if($result == 1){
                $response['error'] = true;
                $response['message'] = 'Old Email is wrong';
            }
            if($result == 2){
                $response['error'] = true;
                $response['message'] = 'Email changed failed';
            }
            if($result == 4){
                $response['error'] = true;
                $response['message'] = 'New email is same as old email.';
            }
            if($result == 0){
                $response['error'] = false;
                $response['message'] = 'Email changed successfully. We have send Verification Code on your new email.';
                /* $response['message'] = 'Email changed successfully.'; */
            }
            
            return response($response);
        }catch (\Exception $e) {
            $response['error'] = true;
            $response['message'] = $e->getMessage();
            return response($response);
        }
    }
}
