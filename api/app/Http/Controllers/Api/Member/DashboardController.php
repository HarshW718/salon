<?php

namespace App\Http\Controllers\Api\Member;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\MemberDashboard;

class DashboardController extends Controller
{
    public function dashboarDetails(Request $request) {
        try {
            $user_id = $request->get('user_id');
            $total_work_hours = MemberDashboard::total_hours_member_work($user_id);
            $total_done_hours = MemberDashboard::total_hours_member_done($user_id);
            $data = array('work_hours'=>$total_work_hours,'done_hours'=>$total_done_hours);
            $response = array('error'=>false,'data'=>$data);
            return response($response);
        }catch (\Exception $e) {
            $response['error'] = true;
            $response['message'] = $e->getMessage();
            return response($response);
        }
    }
}
