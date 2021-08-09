<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AppointmentStatus;
use App\Http\Controllers\Middleweb_Controller;

class AppointmentStatusController extends Middleweb_Controller
{

    public function index()
    {

        $appointment_status = AppointmentStatus::orderBy('id', 'ASC')->get();
        $response = array(
            "success" => true,
            "data" => $appointment_status,
        );
        return response()->json($response);
    }


    public function update(Request $request)
    {

        $appointment_status = $request->all();
        foreach ($appointment_status as $status) {
            $appointment_status = AppointmentStatus::find($status["id"]);
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
