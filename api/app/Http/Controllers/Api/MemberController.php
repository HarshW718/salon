<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Validator;
use App\Models\Member;

class MemberController extends Controller
{
    /*-------------------- Function for create member for club --------------------*/
    public function createMember(Request $request) {
        $validator = Validator::make($request->all(), [
            'name' => 'required',
            'username' => 'required',
            'email' => 'required|email',
            'dob' => 'required',
            'doj' => 'required',
            'hours' => 'required',
        ]);  
        if ($validator->fails()) {
            $err_msg = $validator->messages()->first();
            return response(['error'=>true,'message'=>$err_msg])->header('Content-Type', 'json');
        }
        $user_id = $request->get('user_id');
        $response = Member::create_member($user_id,$request);
        return $response;
    }

    /*-------------------- Function for get member list for club --------------------*/
    public function memberList(Request $request) {
        $user_id = $request->get('user_id');
        $response = Member::member_list($user_id);
        return $response;
    }

    /*-------------------- Function for update member for club --------------------*/
    public function updateMember(Request $request) {
        $validator = Validator::make($request->all(), [
            'name' => 'required',
            'username' => 'required',
            'dob' => 'required',
            'hours' => 'required',
            'member_id' => 'required',
        ]);  
        if ($validator->fails()) {
            $err_msg = $validator->messages()->first();
            return response(['error'=>true,'message'=>$err_msg])->header('Content-Type', 'json');
        }
        $user_id = $request->get('user_id');
        $response = Member::update_member($user_id,$request);
        return $response;
    }

    /*-------------------- Function for delete member for club --------------------*/
    public function deleteMember(Request $request) {
        $validator = Validator::make($request->all(), [
            'member_id' => 'required',
        ]);  
        if ($validator->fails()) {
            $err_msg = $validator->messages()->first();
            return response(['error'=>true,'message'=>$err_msg])->header('Content-Type', 'json');
        }
        $user_id = $request->get('user_id');
        $response = Member::delete_member($request);
        return $response;
    }

    public function login(Request $request) {
        $loginMember = Member::login_member($request);
        return $loginMember;
    }

    public function getHours(Request $request) {
        $user_id = $request->get('user_id');
        $response = Member::get_hours($request,$user_id);
        return $response;
    }
}
