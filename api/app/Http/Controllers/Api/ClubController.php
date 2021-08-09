<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Validator;
use App\Models\Club;

class ClubController extends Controller
{
    /*------ Function for create age group hours for club ---------*/
    public function createHoursRule(Request $request) {
        $user_id = $request->get('user_id');
        $validator = Validator::make($request->all(), [
            'birth_year' => 'required|integer|min:4',
            'join_year' => 'required|integer|min:4',
            'hours' => 'required|integer',
        ]);  
        if ($validator->fails()) {
            $err_msg = $validator->messages()->first();
            return response(['error'=>true,'message'=>$err_msg])->header('Content-Type', 'json');
        }
        $response = Club::create_hours_rule($user_id,$request);
        return $response;
    }

    /*------ Function for delete age group hours for club ---------*/
    public function deleteHoursRule(Request $request) {
        $user_id = $request->get('user_id');
        $validator = Validator::make($request->all(), [
            'rule_id' => 'required|integer',
        ]);  
        if ($validator->fails()) {
            $err_msg = $validator->messages()->first();
            return response(['error'=>true,'message'=>$err_msg])->header('Content-Type', 'json');
        }
        $response = Club::delete_hours_rule($user_id,$request);
        return $response;
    }
    
    /*------ Function for update age group hours for club ---------*/
    public function updateHoursRule(Request $request) {
        $user_id = $request->get('user_id');
        $validator = Validator::make($request->all(), [
            'rule_id' => 'required|integer',
            'birth_year' => 'required|integer|min:4',
            'join_year' => 'required|integer|min:4',
            'hours' => 'required|integer',
        ]);  
        if ($validator->fails()) {
            $err_msg = $validator->messages()->first();
            return response(['error'=>true,'message'=>$err_msg])->header('Content-Type', 'json');
        }
        $response = Club::update_hours_rule($user_id,$request);
        return $response;
    }

    /*------ Function for get age group hours list for club ---------*/
    public function clubHoursRuleList(Request $request) {
        $user_id = $request->get('user_id');
        $response = Club::club_hours_rule_list($user_id);
        return $response;
    }
}
