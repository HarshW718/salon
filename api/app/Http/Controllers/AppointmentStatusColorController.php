<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AppointmentStatusColor;
use App\Http\Controllers\Middleweb_Controller;

class AppointmentStatusColorController extends Middleweb_Controller
{

    public function index()
    {

        $appointment_status_color = AppointmentStatusColor::with('appointment_status')->where('admin_id',$this->ExpToken["parent_id"])->orderBy('id', 'ASC')->get()->toArray();

        $response = array(
            "success" => true,
            "data" => $appointment_status_color,
        );
        return response()->json($response);
    }


    public function update(Request $request)
    {

        $appointment_status = $request->all();
        foreach ($appointment_status as $status) {
            $appointment_status = AppointmentStatusColor::find($status["id"]);
            $appointment_status->status_color = $status["status_color"];
            $appointment_status->save();
        }
        $response = array(
            "success" => true,
            "message" => "Appointment status update successfully.",
        );
        return response()->json($response);
    }    
}

