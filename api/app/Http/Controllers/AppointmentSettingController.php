<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AppointmentSetting; 
use App\Http\Controllers\Middleweb_Controller;

class AppointmentSettingController extends Middleweb_Controller
{

    public function index()
    {
    $appointment_setting_count = AppointmentSetting::where('user_id',$this->ExpToken["parent_id"])->get()->count();
        if($appointment_setting_count > 0){
            $appointment_setting = AppointmentSetting::where('user_id',$this->ExpToken["parent_id"])->get()->first();
        }else{
            $appointment_setting = [];
        }
        $response = array(
            "success" => true,
            "data" => $appointment_setting,
        );
        return response()->json($response);
    }

    public function store(Request $request)
    {
        $appointment_setting = new AppointmentSetting();
        $appointment_setting->time_slot_duration = $request->time_slot_duration;
        $appointment_setting->start_time = $request->start_time;
        $appointment_setting->end_time = $request->end_time;
        $appointment_setting->first_day = $request->first_day;
        $appointment_setting->time_line = $request->time_line;
        $appointment_setting->display_cancel_appointment = $request->display_cancel_appointment;
        $appointment_setting->display = json_encode($request->display);
        $appointment_setting->user_id = $this->ExpToken["user_id"];
        $appointment_setting->save();
        $response = array(
            "success" => true,
            "message" => "Appointment setting add successfully.",
        );

        return response()->json($response);
    }

    public function update(Request $request)
    {
            $appointment_setting = AppointmentSetting::find($request->id);
            $appointment_setting->time_slot_duration = $request->time_slot_duration;
            $appointment_setting->start_time = $request->start_time;
            $appointment_setting->end_time = $request->end_time;
            $appointment_setting->first_day = $request->first_day;
            $appointment_setting->time_line = $request->time_line;
            $appointment_setting->display_cancel_appointment = $request->display_cancel_appointment;
            $appointment_setting->display = json_encode($request->display);
            $appointment_setting->user_id = $this->ExpToken["user_id"];
            $appointment_setting->save();
            $response = array(
                "success" => true,
                "message" => "Appointment setting update successfully.",
            );

        return response()->json($response);
    }
}
