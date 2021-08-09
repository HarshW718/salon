<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Validator;
use App\Models\User;
use App\Models\Common;
use Hash;

class UserController extends Controller
{
    /*-------------------- User Signup Function --------------------*/
    public function signup(Request $request) {
        $validator = Validator::make($request->all(), [
            'name' => 'required',
            'username' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:8|regex:/^.*(?=.{3,})(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[\d\X]).*$/',
            'club_name' => 'required',
        ]);  
        if ($validator->fails()) {
            $err_msg = $validator->messages()->first();
            $response['error'] = true;
            $response['message'] = $err_msg;
            return response($response)->header('Content-Type', 'json');
        }
        /*-------------------- Check for dublicate username --------------------*/
        $checkValue = User::validate_signup($request);
        if(empty($checkValue)) {
            /*-------------------- Add User --------------------*/
            $addUser = User::add_user($request);
            return $addUser;
        } else {
            return $checkValue;
        }
    }

    /*-------------------- Login function --------------------*/
    public function login(Request $request) {
        $loginUser = User::login_user($request);
        return $loginUser;
    }

    /*-------------------- Verify user email function --------------------*/
    public function verifyEmail(Request $request) {
        
        $validator = Validator::make($request->all(), [
            'code' => 'required',
        ]);  
        if ($validator->fails()) {
            $err_msg = $validator->messages()->first();
            $response['error'] = true;
            $response['message'] = $err_msg;
            return response($response)->header('Content-Type', 'json');
        }
        $code = $request->get('code');
        $check_code_time = User::code_time_check($code);
        /*-------------------- Check code and email match --------------------*/
        $checkDatas = User::checkCode($code);
        if(empty($checkDatas)) {
            $response['error'] = true;
            $response['data'] = '';
            $response['message'] = "Invalid code.";
        } else {
            $verify = User::verifyAccount($checkDatas[0]['user_id']);
            if (!empty($checkDatas[0]['auth_token']) && $checkDatas[0]['auth_token'] != NULL) {
                $auth_token = $checkDatas[0]['auth_token'];
            } else {
                $auth_token = Common::authtokenGenerate('users', 'auth_token');
            }
            $checkDatas[0]['auth_token'] = $auth_token;
            $updateTokenArray = array('auth_token' => $auth_token,'user_id'=>$checkDatas[0]['user_id']);
            $updateAuthToken = User::updateAuthToken($updateTokenArray);
                if(empty($verify)) {
                    $response['error'] = false;
                    $response['data'] = $checkDatas[0];
                    $response['message'] = 'Verified succesfully';
                } else {
                    $response['error'] = false;
                    $response['data'] = '';
                    $response['message'] = $verify;
                }
        }
        return response($response)->header('Content-Type', 'json');
    }

    /*-------------------- Forgot Password Function --------------------*/
    public function forgotPassword(Request $request) {
        $validator = Validator::make($request->all(), [
            'username' => 'required',
        ]);  
        if ($validator->fails()) {
            $err_msg = $validator->messages()->first();
            $response['error'] = true;
            $response['message'] = $err_msg;
            return response($response)->header('Content-Type', 'json');
        }
        $username = $request['username'];
        $response =  User::forgot_password($username);
        return $response;
    }

    /*-------------------- Resend code function --------------------*/
    public function resendCode(Request $request) {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);  
        if ($validator->fails()) {
            $err_msg = $validator->messages()->first();
            $response['error'] = true;
            $response['message'] = $err_msg;
            return response($response)->header('Content-Type', 'json');
        }
        $email = $request['email'];
        $response = User::resend_code($request);
        return $response;
    }

    public function password() {
        echo Hash::make('Test@125');
    }

    public function businessHoursList(Request $request) {
        $user_id = $request->get('user_id');
        $response = User::business_hours_list($user_id,$request);
        return $response;
    }
}
