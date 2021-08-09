<?php

namespace App\Http\Controllers\Api\Club;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\ClubDashboard;

class DashboardController extends Controller
{
    public function getDashboardDetails(Request $request) { 

        try {
            $user_id = $request->get('user_id');
            $total_member = ClubDashboard::total_members($user_id);
            $total_open_hours = ClubDashboard::total_hours_member_allot($user_id);
            $total_done_hours = ClubDashboard::total_hours_member_done($user_id);
            $upcoming_events = ClubDashboard::upcoming_events($user_id);
            $open_hours = abs($total_open_hours - $total_done_hours);
            $done_hours = $total_done_hours;
            $data = array('total_members'=>$total_member,'open_hours'=>$open_hours,'done_hours'=>$done_hours,'upcoming_events'=>$upcoming_events);
            $response = array('error'=>false,'data'=>$data);
            return response($response);
        }catch (\Exception $e) {
            $response['error'] = true;
            $response['message'] = $e->getMessage();
            return response($response);
        }
    }
}
