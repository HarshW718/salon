<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AppointmentLog;
use App\Models\Appointments;
use App\Models\Customers;  
use App\Models\Services;
use App\Models\Emailtemplate;
use App\Models\Common;
use App\Models\Users;
use App\Models\SendMail;
use Config;
use App\Http\Controllers\Middleweb_Controller;
use App\Classes\GoogleCalendarApi;
use App\Google;
use Socialite;

class AppointmentLogController extends Middleweb_Controller
{

    public function index($appointment_id)
    {
        $appointment_log_list = AppointmentLog::with('appointment_status_data','changes_by')->where('appointment_id',$appointment_id)->orderBy('id', 'ASC')->get();
        $response = array(
            "success" => true,
            "data" => $appointment_log_list,
        );
        return response()->json($response);
    }

    public function store(Request $request)
    {
       $apppointment_log = new AppointmentLog();
       $apppointment_log->appointment_id = $request->appointment_id;
       $apppointment_log->appointment_status = $request->appointment_status;
       $apppointment_log->user_company_id = $this->ExpToken["parent_id"];
       $apppointment_log->cancel_reason = ($request->appointment_status==5) ? $request->cancel_reason : 0;
       $apppointment_log->log_date_time = date("Y-m-d H:i:s");
       $apppointment_log->is_email = ($request->is_email == true) ? 1 : 0 ;
       $apppointment_log->is_sms = ($request->is_email == false) ? 1 : 0 ;
       $apppointment_log->created_by = $this->ExpToken["user_id"];
       $apppointment_log->updated_by = $this->ExpToken["user_id"];
       $apppointment_log->save();

       if($apppointment_log->id != 0){
        $apppointment = Appointments::find($request->appointment_id);
        $apppointment->appointment_status_id = $request->appointment_status;
        $apppointment->updated_by = $this->ExpToken["user_id"];
        $apppointment->save();
        $worker_detail = Users::find($apppointment->worker_id);
        //print_r($worker_detail);
        if($worker_detail->google_token && $worker_detail->google_token !== "") {
            $url = 'https://www.googleapis.com/oauth2/v4/token';
            $curlPost = 'client_id=967454501547-5ppgtuckjjm89grbe76o3uo295m5toko.apps.googleusercontent.com&redirect_uri=http://localhost/salon&client_secret=GB9s5MNdVR4-Vq0HLLpZPVSK&refresh_token='. $worker_detail->google_token . '&grant_type=refresh_token';
            $ch = curl_init();		
            curl_setopt($ch, CURLOPT_URL, $url);		
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);		
            curl_setopt($ch, CURLOPT_POST, 1);		
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $curlPost);	
            $data = json_decode(curl_exec($ch), true);
            //echo $data['access_token'];
            $http_code = curl_getinfo($ch,CURLINFO_HTTP_CODE);
            if($http_code === 200) {
                $capi = new GoogleCalendarApi();
                //$access_token = 'GOOGLE-ACCESS-TOKEN';
                
                // deleting event on the primary calendar
                $calendar_id = 'primary';
                
                // Event on primary calendar
                $event_id = $apppointment->event_cal_id;
                
                $capi->DeleteCalendarEvent($event_id, $calendar_id, $data['access_token']);
            }
            $update_appointment = Appointments::find($request->appointment_id);
            //print_r($update_appointment); die;
            $update_appointment->event_cal_id = "";
            $updateAppointment = $update_appointment->save();
        }
        switch ($request->cancel_reason) {
            case 1:  // 1 = Cancellation
                $type = 4;
                $sub = "Appointments Cancelled.";
                $reason = "Your appointment has been <strong>Cancelled</strong> for below service.";
            break;

            case 2: // 2 = Cancellation not on time
                $type = 6;
                $sub = "Appointments Cancellation not on time.";
                $reason = "Your appointment has been <strong>Cancelled</strong> for below service due to not on time.";
            break;

            case 3: // 3 = No-show Cancellation
                $type = 5;
                $sub = "Appointments No-show Cancellation.";
                $reason = "Your appointment has been <strong>Cancelled</strong> for below service no-show cancellation.";
            break;
            
          
        }


        if($apppointment->customer_id != 0 && $apppointment_log->is_email == 1){
            $customer = Customers::find($apppointment->customer_id);
            $service = Services::find($apppointment->service_id);
            $email = $customer->email;

        $confirmation_template = Emailtemplate::where('type',$type)->where('user_company_id', $this->ExpToken["parent_id"])->first();
        $body_template = $confirmation_template->mail_content;
        $companyData     = Common::mailData('company_details', ['user_company_id' => $this->ExpToken["parent_id"]]);
        $company_data    = $companyData[0];
        $imageUrl        = Config::get('constants.displayImageUrl');
        $company_logo    =  empty($companyData) ? '' : $imageUrl . 'company_logo/' . $companyData[0]->company_logo;
        $company_name    = empty($companyData) ? '' : $company_data->company_name;
        $company_number  = empty($companyData) ? '' : $company_data->mobile;
        $company_email   = empty($companyData) ? '' : $company_data->email;
        $company_address = empty($companyData) ? '' : $company_data->address;
        $worker_details   =  empty($apppointment->worker_id) ? [] : Users::find($apppointment->worker_id);
         $certificatenumber =   empty($worker_details) ? '' : $worker_details->certificate_number;
          $worker_name =   empty($worker_details) ? '' : $worker_details->name;
         $worker_email =   empty($worker_details) ? '' : $worker_details->email;
         $customer_firstname = empty($customer->firstname) ? '' : $customer->firstname;
         $customer_lastname = empty($customer->lastname) ? '' : $customer->lastname;
        
         $replaceParams = array(
            '[[company-logo]]' => $company_logo,
            '[[company-name]]' => $company_name,
            '[[company-number]]' => $company_number,
            '[[company-email]]' => $company_email,
            '[[company-address]]' => $company_address,
            '[[certificate-number]]' => $certificatenumber,
            '[[staff-name]]' => $worker_name,
            '[[staff-email]]' => $worker_email,
            '[[login-url]]' => '',
            '[[staff-password]]' => '',
            '[[time]]' => '',
            '[[date]]' => '',

            '[[customer-firstname]]' => $customer_firstname,
            '[[customer-lastname]]' => $customer_lastname,
            '[[customer-address]]' => '',
            '[[customer-birthdate]]' => '',
            '[[customer-number]]' => '',
            '[[gender]]' => '',

            '[[invoice-number]]' => '',
            '[[invoice-date]]' =>  '',
            '[[invoice-amount]]' => '',
            '[[appointment-date-time]]' => date('d-M-Y', strtotime($apppointment->appointment_date))." ".$apppointment->start_time,
            '[[service-duration]]' => $this->hour_min($service->duration),
            '[[service-name]]'=>$service->name,
            '[[invoice-treatment-date]]' => ''
        );

        $mail_content = Common::replaceMailData($replaceParams, $body_template);
        $sendmail = new SendMail();
        $sendmail->sub = $sub;
        $sendmail->to_email = $email;
        $sendmail->bodyData = $mail_content;
        $sendmail->user_company_id = $this->ExpToken["parent_id"];
        $sendmail->save();

    }

       }
        $response = array(
            "success" => true,
            "message" => "Appointment log add successfully.",
        );

        return response()->json($response);
    }
    public function hour_min($minutes)
    { // Total
        if ($minutes <= 0) return '00 Hours 00 Minutes';
        else
            return sprintf("%02d", floor($minutes / 60)) . ' Hours ' . sprintf("%02d", str_pad(($minutes % 60), 2, "0", STR_PAD_LEFT)) . " Minutes";
    }

    public function update(Request $request)
    {
        $appointment_status = $request->all();
        foreach ($appointment_status as $status) {
            $appointment_status = AppointmentLog::find($status["id"]);
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
