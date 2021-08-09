<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Users_extra_working_hours;
use App\Http\Controllers\Middleweb_Controller;
class UsersExtraWorkingHoursController extends Middleweb_Controller
{
    public function store(Request $request)
    {

        $users_extra_working_hours = new Users_extra_working_hours();
        $users_extra_working_hours->user_id = $request->worker_id;
        $users_extra_working_hours->dayindex = $request->dayindex;
        $users_extra_working_hours->date = $request->date;
        $users_extra_working_hours->from_time = $request->start_time;
        $users_extra_working_hours->to_time = $request->end_time;
        $users_extra_working_hours->created_by = $this->ExpToken["user_id"];
        $users_extra_working_hours->updated_by = $this->ExpToken["user_id"];
        $users_extra_working_hours->save();

         $response = array(
            "success" => true,
            "message" => "Extra working hours add successfully.",
        );
        return response()->json($response);
    }
    public function destroy(Request $request){
        $users_extra_working_hours = Users_extra_working_hours::find($request->extra_working_hour_id);
        $users_extra_working_hours->delete();
        $response = array(
            "success" => true,
            "message" => "Extra working hours delete successfully.",
        );
        return response()->json($response);
    }

    public function drag_extra_time(Request $request)
    {
        $users_extra_working_hours = Users_extra_working_hours::find($request->id);
        $users_extra_working_hours->user_id = $request->worker_id;
        $users_extra_working_hours->dayindex = $request->dayindex;
        $users_extra_working_hours->date = $request->date;
        $users_extra_working_hours->from_time = $request->start_time;
        $users_extra_working_hours->to_time = $request->end_time;
        $users_extra_working_hours->created_by = $this->ExpToken["user_id"];
        $users_extra_working_hours->updated_by = $this->ExpToken["user_id"];
        $users_extra_working_hours->save();

         $response = array(
            "success" => true,
            "message" => "Extra working hours update successfully.",
        );
        return response()->json($response);
    }

  
  
  
  
  
  
  
  
  
  
   
}
