<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Admin;

class AdminController extends Controller
{
    public function createAdmin(Request $request) {
        $user_id = $request->get('user_id');
        $response = Admin::create_admin($user_id,$request);
        return $response;
    }

    public function getAdminList(Request $request) {
        $user_id = $request->get('user_id');
        $response = Admin::get_admin_list($user_id,$request);
        return $response;
    }

    public function deleteAdmin(Request $request) {
        $user_id = $request->get('user_id');
        $response = Admin::delete_admin($request);
        return $response;
    }
}
