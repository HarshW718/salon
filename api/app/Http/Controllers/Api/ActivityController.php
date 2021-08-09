<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Validator;
use App\Models\Activity;

class ActivityController extends Controller
{
    /*--------function for get event list for club--------*/
    public function eventList(Request $request) {
        $user_id = $request->get('user_id');
        $response = Activity::event_list_new($user_id);
        return $response;
    }

    /*--------function for update event details--------*/
    public function updateEvent(Request $request) {
        $user_id = $request->get('user_id');
        $response = Activity::update_event($request,$user_id);
        return $response;
    }

    /*--------function for remove event--------*/
    public function removeEvent(Request $request) {
        $user_id = $request->get('user_id');
        $validator = Validator::make($request->all(), [
            'event_id' => 'required',
        ]); 
        if ($validator->fails()) {
            $err_msg = $validator->messages()->first();
            return response(['error'=>true,'message'=>$err_msg])->header('Content-Type', 'json');
        } 
        $response = Activity::remove_event($request);
        return $response;
    }

    /*--------function for update event status (Active or Deactive)--------*/
    public function updateEventStatus(Request $request) {
        $user_id = $request->get('user_id');
        $validator = Validator::make($request->all(), [
            'event_id' => 'required',
        ]); 
        if ($validator->fails()) {
            $err_msg = $validator->messages()->first();
            return response(['error'=>true,'message'=>$err_msg])->header('Content-Type', 'json');
        } 
        $response = Activity::update_event_status($request,$user_id);
        return $response;
    }

    /*--------function for add material--------*/
    public function addMaterial(Request $request) {
        $user_id = $request->get('user_id');
        $validator = Validator::make($request->all(), [
            'event_id' => 'required',
            'instrument' => 'required',
            'qty' => 'required',
            'hours' => 'required',
        ]); 
        if ($validator->fails()) {
            $err_msg = $validator->messages()->first();
            return response(['error'=>true,'message'=>$err_msg])->header('Content-Type', 'json');
        } 

        $response = Activity::add_material($user_id,$request);
        return $response;
    }

    /*--------function for create event for club--------*/
    public function createEvent(Request $request) {
        $user_id = $request->get('user_id');
        
        $response = Activity::create_event($user_id,$request);
        return $response;
    }

    public function activity_list_year(Request $request) {
        $user_id = $request->get('user_id');
        $response = Activity::activity_list_year($user_id);
        return $response;
    }

    public function MemberActivityList(Request $request) {
        $user_id = $request->get('user_id');
        $response = Activity::member_activity_list($user_id);
        return $response;
    }

    public function eventDetail(Request $request) {
        $user_id = $request->get('user_id');
        $event_id = $request['event_id'];
        $response = Activity::event_details($user_id,$event_id);
        return $response;
    }

    public function copyEvent(Request $request) {
        $user_id = $request->get('user_id');
        $event_id = $request['event_id'];
        $response = Activity::copy_event($user_id,$event_id);
        return $response;
    }

    public function workingStatusList(Request $request) {
        try {
            $user_id = $request->get('user_id');
            $response = Activity::working_status_list($user_id); 
            return $response;
        }catch (\Exception $e) {
            $response['error'] = true;
            $response['message'] = $e->getMessage();
            return response($response);
        }
    }

    public function updateWorkingStatus(Request $request) {
        try {
            $user_id = $request->get('user_id');
            $response = Activity::update_working_status($request); 
            return $response;
        } catch (\Exception $e) {
            $response['error'] = true;
            $response['message'] = $e->getMessage();
            return response($response);
        }
    }

    public function memberWorkingList(Request $request) {
        try {
            $user_id = $request->get('user_id');
            $response =  Activity::member_working_list($user_id); 
            return $response;
        } catch (\Exception $e) {
            $response['error'] = true;
            $response['message'] = $e->getMessage();
            return response($response);
        }
    }

    /* public function updateEvent(Request $request) {
        try {
            $user_id = $request->get('user_id');
            $response =  Activity::member_working_list($user_id); 
            return $response;
        } catch (\Exception $e) {
            $response['error'] = true;
            $response['message'] = $e->getMessage();
            return response($response);
        }
    } */
}
