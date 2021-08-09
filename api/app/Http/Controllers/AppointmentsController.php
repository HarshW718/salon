<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Appointments;
use App\Models\Services;
use App\Models\AppointmentLog;
use App\Models\Customers; 
use App\Models\Invoice;
use App\Models\InvoiceData;
use App\Models\SendMail;
use App\Models\Emailtemplate;
use App\Models\Common;
use App\Models\Users;
use App\Models\Form_ans;
use App\Models\Reportform;

use App\Http\Controllers\Middleweb_Controller;
use Config;
use DB;
use App\Classes\GoogleCalendarApi;
use App\Google;
use Socialite;

class AppointmentsController extends Middleweb_Controller
{

    public function index(Request $request)
    {

        $request_data = $request->all();
        $date = ($request_data["date"] != 0) ? $request_data["date"] : date("Y-m-d");
        $appointments = Appointments::with([
            'service.service_category',
            'appointment_status_color' => function ($query) {
                $query->where('admin_id', $this->ExpToken["parent_id"]); //you may use any condition here or manual select operation
                // $query->select(); //select operation
            },
            'appointment_status_color.appointment_status',
            'customer',
            'worker.user_services',
            //'invoice.invoice_tax',
            'invoice_data'
        ])->where('user_company_id', $this->ExpToken["parent_id"])->where('appointment_date', $date)->where('is_deleted', 0)->orderBy('id', 'DESC')->get();

        $response = array(
            "success" => true,
            "data" => $appointments,
        );
        return response()->json($response);
    }


    public function check_for_same_appointment(Request $request)
    {

        $request_data = $request->all();
        $data = Services::select('id')->where('user_company_id', $this->ExpToken["parent_id"])->where('category_id', $request_data["service_cat_id"])->get()->toArray();
        $service_id = array_column($data, 'id');
        $start_time = $request_data["starttime"];

        $break_start_time = explode(":",  $start_time);
        $hour = floor(($request_data["duration"] + (int) $break_start_time[1]) / 60);
        $minute = (strlen(($request_data["duration"] + (int) $break_start_time[1]) % 60) < 2) ? '0' . (($request_data["duration"] + (int) $break_start_time[1]) % 60) : (($request_data["duration"] + (int) $break_start_time[1]) % 60);
        $end_time_hour = (strlen((int) $break_start_time[0]    + $hour) < 2) ? "0" . ((int) $break_start_time[0]  + $hour) : ((int) $break_start_time[0] + $hour);
        $newappointments["end_time"] =  date("H:i:s", strtotime($end_time_hour . ":" . $minute));
        $chek_this_time = $newappointments["end_time"];

        $service_before_end_time =  Appointments::whereIn('service_id', $service_id)->where('user_company_id', $this->ExpToken["parent_id"])->where('appointment_date', date('Y-m-d', strtotime($request_data["appointment_date"])))->where('start_time', '<', $chek_this_time)->where('is_deleted', 0)->count();

        $service_before_start_time =  Appointments::whereIn('service_id', $service_id)->where('user_company_id', $this->ExpToken["parent_id"])->where('appointment_date', date('Y-m-d', strtotime($request_data["appointment_date"])))->where('end_time', '<=', $start_time)->where('is_deleted', 0)->count();
        $service_bw_start_and_end = $service_before_end_time - $service_before_start_time;


        $response = array(
            "success" => true,
            "data" => $service_bw_start_and_end,
        );
        return response()->json($response);
        exit();
    }



    public function appointments_by_worker(Request $request)
    {

        $request_data = $request->all();
        $appointments = Appointments::with([
            'service.service_category',
            'appointment_status_color' => function ($query) {
                $query->where('admin_id', $this->ExpToken["parent_id"]); //you may use any condition here or manual select operation
                // $query->select(); //select operation
            },
            'appointment_status_color.appointment_status',
            'customer',
            'worker.user_services',
           // 'invoice.invoice_tax',
            'invoice_data'
        ])->where('user_company_id', $this->ExpToken["parent_id"])->where('worker_id', $request_data["worker_id"])->where('is_deleted', 0)->whereBetween('appointment_date', [$request_data["firstday_of_week"], $request_data["lastday_of_week"]])->orderBy('id', 'DESC')->get();

        $response = array(
            "success" => true,
            "data" => $appointments,
        );
        return response()->json($response);
    }



    public function appointments_by_customer_for_update_page(Request $request){

        $request_data = $request->all();
        $appointments = Appointments::with([
            'appointments_log',
            'service.service_category',
            'appointment_status_color' => function ($query) {
                $query->where('admin_id', $this->ExpToken["parent_id"]); //you may use any condition here or manual select operation
                // $query->select(); //select operation
            },
            'appointment_status_color.appointment_status',
            'customer',
            'worker.user_services',
            //'invoice.invoice_tax',
            'invoice_data',
        ])->where('user_company_id', $this->ExpToken["parent_id"])->where('customer_id', $request_data["customer_id"])->where('walk_in_customer_id', 0)->where('is_deleted', 0)->orderBy('appointment_date', 'DESC')->get();

        $response = array(
            "success" => true,
            "data" => $appointments,
        );
        return response()->json($response);
    }


    public function appointments_by_customer(Request $request)
    {

        $request_data = $request->all();
        $appointment_date =  $request_data["appointment_date"];
        if($request_data["appointment_status_id"] == 4){
            $appointments = Appointments::with([
                'service.service_category',
                'appointment_status_color' => function ($query) {
                    $query->where('admin_id', $this->ExpToken["parent_id"]); //you may use any condition here or manual select operation
                    // $query->select(); //select operation
                },
                'appointment_status_color.appointment_status',
                'customer',
                'worker.user_services',
                'invoice_data'
            ])->where('user_company_id', $this->ExpToken["parent_id"])->where('id', $request_data["appointment_id"])->where('walk_in_customer_id', 0)->where('is_deleted', 0)->where(function ($query) use ($appointment_date) {
                if($appointment_date != 0){
                    $query->where('appointment_date', '=', $appointment_date);
                }
            })->orderBy('appointment_date', 'DESC')->get();
        }else{
            $appointments = Appointments::with([
                'service.service_category',
                'appointment_status_color' => function ($query) {
                    $query->where('admin_id', $this->ExpToken["parent_id"]); //you may use any condition here or manual select operation
                    // $query->select(); //select operation
                },
                'appointment_status_color.appointment_status',
                'customer',
                'worker.user_services',
                //'invoice.invoice_tax',
                'invoice_data'
            ])->where('user_company_id', $this->ExpToken["parent_id"])->where('appointment_status_id', '!=',5)->where('appointment_status_id', '!=',4)->where('customer_id', $request_data["customer_id"])->where('customer_status', 0)->where('walk_in_customer_id', 0)->where('is_deleted', 0)->where(function ($query) use ($appointment_date) {
                if($appointment_date != 0){
                    $query->where('appointment_date', '=', $appointment_date);
                }
            })->orderBy('appointment_date', 'DESC')->get();

        }
        
        $response = array(
            "success" => true,
            "data" => $appointments,
        );
        return response()->json($response);
    }

    public function appointments_by_walking_customer(Request $request)
    {

        $request_data = $request->all();
        $appointment_date =  $request_data["appointment_date"];
       
        if($request_data["appointment_status_id"] == 4){
            $appointments = Appointments::with([
                'service.service_category',
                'appointment_status_color' => function ($query) {
                    $query->where('admin_id', $this->ExpToken["parent_id"]); 
                    //you may use any condition here or manual select operation
                    // $query->select(); //select operation
                },
                'appointment_status_color.appointment_status',
                'customer',
                'worker.user_services',
                //'invoice.invoice_tax',
                'invoice_data'
            ])->where('user_company_id', $this->ExpToken["parent_id"])->where('id', $request_data["appointment_id"])->where('customer_id', 0)->where('customer_status', 1)->where('is_deleted', 0)->where(function ($query) use ($appointment_date) {
                if($appointment_date != 0){
                    $query->where('appointment_date', '=', $appointment_date);
                }
            })->orderBy('appointment_date', 'DESC')->get();
        }else{
            $appointments = Appointments::with([
                'service.service_category',
                'appointment_status_color' => function ($query) {
                    $query->where('admin_id', $this->ExpToken["parent_id"]); 
                    //you may use any condition here or manual select operation
                    // $query->select(); //select operation
                },
                'appointment_status_color.appointment_status',
                'customer',
                'worker.user_services',
                //'invoice.invoice_tax',
                'invoice_data'
            ])->where('user_company_id', $this->ExpToken["parent_id"])->where('appointment_status_id', '!=',5)->where('appointment_status_id', '!=',4)->where('customer_id', 0)->where('customer_status', 1)->where('walk_in_customer_id', $request_data["walk_in_customer_id"])->where('is_deleted', 0)->where(function ($query) use ($appointment_date) {
                if($appointment_date != 0){
                    $query->where('appointment_date', '=', $appointment_date);
                }
            })->orderBy('appointment_date', 'DESC')->get();
        }

        $response = array(
            "success" => true,
            "data" => $appointments,
        );
        return response()->json($response);
    }


    public function appointments_by_walking_customer1(Request $request)
    {

        $request_data = $request->all();
        $appointment_date =  $request_data["appointment_date"];
        $appointments = Appointments::with([
            'service.service_category',
            'appointment_status_color' => function ($query) {
                $query->where('admin_id', $this->ExpToken["parent_id"]); 
                //you may use any condition here or manual select operation
                // $query->select(); //select operation
            },
            'appointment_status_color.appointment_status',
            'customer',
            'worker.user_services',
            //'invoice.invoice_tax',
            'invoice_data'
        ])->where('user_company_id', $this->ExpToken["parent_id"])->where('appointment_status_id', '!=',5)->where('customer_id', 0)->where('customer_status', 1)->where('walk_in_customer_id', $request_data["walk_in_customer_id"])->where('is_deleted', 0)->where(function ($query) use ($appointment_date) {
            if($appointment_date != 0){
                $query->where('appointment_date', '=', $appointment_date);
            }
        })->orderBy('appointment_date', 'DESC')->get();


        $check_invoice =  Invoice::where('customer_id',$request_data["walk_in_customer_id"])->where(DB::raw("(STR_TO_DATE(invoice_date,'%Y-%m-%d'))"),$appointment_date)->get()->first();

        if($check_invoice == null){
       
        $invoice =  new Invoice();
        $invoice->user_company_id = $this->ExpToken["parent_id"];
        $invoice->walk_in_customer_id = $request_data["walk_in_customer_id"];
        $invoice->customer_id = 0;
        $invoice->total_invoice_amount = 0;
        $invoice->comment = '';
        $invoice->invoice_date = $appointment_date;
        $invoice->created_by = $this->ExpToken["user_id"];
        $invoice->updated_by = $this->ExpToken["user_id"];
        $invoice->save();
        $_invoice_id = $invoice->id;
        }else{
        $_invoice_id = $check_invoice->id;
        }

        foreach ($appointments->toArray() as $key => $value) {
            
            $invoice_data = InvoiceData::where('appointment_id',$value['id'])->get()->first(); 

            if(!isset($invoice_data->id)){
            $table_data[$key]['user_company_id'] = $this->ExpToken["parent_id"];
            $table_data[$key]['invoice_id'] = $_invoice_id;
            $table_data[$key]['which_one'] = 'service';
            $table_data[$key]['appointment_id'] = $value['id'];
            $table_data[$key]['worker_id'] = isset($value['worker_id']) ? $value['worker_id'] : 0;
            $table_data[$key]['single_row_comment'] = isset($value['single_row_comment']) ? $value['single_row_comment'] : ''; 

            if (isset($value['is_disabled'])) {
                $table_data[$key]['is_disabled'] = $value['is_disabled'];

            }else{
                $table_data[$key]['is_disabled'] = 0;

            }

            $table_data[$key]['data_id'] = $value['service_id'];
            $table_data[$key]['single_row_total'] = $value['service']['sales_price'];
            $table_data[$key]['calculation_sale_price'] = $value['service']['sales_price'];
            $table_data[$key]['description'] = $value['service']['name'];
            $table_data[$key]['is_check'] = 1;
            $table_data[$key]['quantity'] = 1;
            $table_data[$key]['tax_id'] = $value['service']['tax_id'];
            

            unset($table_data[$key]['display_sale_price']);
            unset($table_data[$key]['name']);
            unset($table_data[$key]['id']);
            InvoiceData::insert($table_data[$key]);
                
            }

        }

        $response = array(
            "success" => true,
            "data" => $appointments,
        );
        return response()->json($response);
    }


    public function store(Request $request)
    {   
        /* $appointment = $request->all();
        //print_r($appointment);
        $user=Users::find(48);
        //echo $user->google_token;
        //print_r($user); die;
       
        $url = 'https://www.googleapis.com/oauth2/v4/token';			
		
		$curlPost = 'client_id=967454501547-5ppgtuckjjm89grbe76o3uo295m5toko.apps.googleusercontent.com&redirect_uri=http://localhost/salon&client_secret=GB9s5MNdVR4-Vq0HLLpZPVSK&refresh_token='. $user->google_token . '&grant_type=refresh_token';
		$ch = curl_init();		
		curl_setopt($ch, CURLOPT_URL, $url);		
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);		
		curl_setopt($ch, CURLOPT_POST, 1);		
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
		curl_setopt($ch, CURLOPT_POSTFIELDS, $curlPost);	
        $data = json_decode(curl_exec($ch), true);
        //echo $data['access_token'];
        echo $http_code = curl_getinfo($ch,CURLINFO_HTTP_CODE);
        $capi = new GoogleCalendarApi();
        $user_timezone = $capi->GetUserCalendarTimezone($data['access_token']);
        date_default_timezone_set($user_timezone);
        $event['event_time'] = array(
            'start_time'=>date("c", strtotime($appointment["appointment_date"])),
            'end_time'=>date("c", strtotime($appointment["appointment_date"])),
        'event_date'=> ''
        );
        //die;
        $event_id = $capi->CreateCalendarEvent('primary', 'Appointment', 'test', 0, $event['event_time'], $user_timezone, $data['access_token']);   */
        /* $update_appointment = Appointments::find($appointment["id"]);
        $update_appointment->event_cal_id = $event_id;
        $updateAppointment = $update_appointment->save(); */
        //print_r($request->); die;
            /*      $event['event_time'] = array(
             'start_time'=>'2020-02-28T16:46:00',
             'end_time'=>'2020-02-29T16:47:00',
            'event_date'=> ''
            );
        $appointment = $request->all();
        
        $capi = new GoogleCalendarApi();
        $user_timezone = $capi->GetUserCalendarTimezone($appointment['accesstoken']);
        //echo $user_timezone; die;
        $event_id = $capi->CreateCalendarEvent('primary', 'testing event', 0, $event['event_time'], $user_timezone, $appointment['accesstoken']);
            
            echo json_encode([ 'event_id' => $event_id ]); */
               /*   $capi = new GoogleCalendarApi();
        
            // Get user calendar timezone
            $user_timezone = $capi->GetUserCalendarTimezone($user->token);
        echo $user_timezone;
            // Create event on primary calendar
         /*    echo $event['all_day'];
            echo $event['event_time'];  
            $event_id = $capi->CreateCalendarEvent('primary', 'testing event', 0, $event['event_time'], $user_timezone, $user->token);
            
            echo json_encode([ 'event_id' => $event_id ]); */
         if(isset($request->customer['id'])){
            if($request->customer['id'] != 0){
                $check_validate = $request->validate([
                    'customer.firstname' => 'required',
                    'customer.lastname' => 'required',
                    'customer.email' => 'required',
                    'customer.mobile' => 'required',
                    //'email' => 'required|unique:customers,email,'.$request->get('id').',id',
                    //'mobile' => 'required|regex:/[0-9]{10}/|unique:customers,mobile,'.$request->get('id').',id',
                    'customer.gender' => 'required',
                ]);
    
            }
         }else{
            $check_validate = $request->validate([
                'customer.firstname' => 'required',
                'customer.lastname' => 'required',
                'customer.email' => 'required',
                'customer.mobile' => 'required',
                //'email' => 'required|unique:customers,email,'.$request->get('id').',id',
                //'mobile' => 'required|regex:/[0-9]{10}/|unique:customers,mobile,'.$request->get('id').',id',
                'customer.gender' => 'required',
            ]);

         }
        

    
//         
//         //echo date('Y-m-d\TH:i:sP');
//         //echo date('Y-m-d H:i:s', strtotime(str_replace('-','/', $appointment["appointment_date"]))); 
//        /*  echo $date1 =  date('Y-m-d H:i:s', strtotime($appointment["appointment_date"])); 
//        echo $date = date('Y-m-d H:i:s',$date1 );  */
//        //echo date('Y-m-d H:i:s', strtotime($appointment["appointment_date"]));
//         /* $datetime= date("c", strtotime($date));
// echo $datetime; */
//         echo  ; die;
//         //echo date('Y-m-d H:i:s', strtotime(str_replace('-','/', $appointment["appointment_date"])));
//         //echo date('Y-m-d H:i:s', strtotime($appointment["appointment_date"])); die;
//         echo $appointment["appointment_date"];
       
        $appointment = $request->all();
        //print_r($appointment); die;
        $newappointments = array();
        $newappointment_log = array();
        $appointment_customer = $appointment["customer"];
        $appointment_services = $appointment["services"];        
        $appointment_paid = isset($appointment["paid_appointment"]) ? $appointment["paid_appointment"] : 'unpaid'; 
        $appointment_id_before_insert = Appointments::select('id')->where('user_company_id', $this->ExpToken["parent_id"])->orderBy('id', 'DESC')->first();
        if (isset($appointment_customer["id"])) {
            $check_appointment = Appointments::where('customer_id', $appointment_customer["id"])->where('user_company_id', $this->ExpToken["parent_id"])->get()->count();
            if ($check_appointment > 0) {
                if($appointment_paid == 'paid'){
                    $appointment_status_id = 4;
                }else{
                    $appointment_status_id = 1;
                }
            } else {
                if($appointment_paid == 'paid'){
                    $appointment_status_id = 4;
                }else{
                    $appointment_status_id = 7;
                }
                
            }
            $customer_id = $appointment_customer["id"];
            if($customer_id != 0){
            $customer = Customers::find($appointment_customer["id"]);
            $customer->user_company_id = $appointment_customer["user_company_id"];
            $customer->firstname = $appointment_customer["firstname"];
            $customer->lastname = $appointment_customer["lastname"];
            $customer->gender = $appointment_customer["gender"];
            $customer->mobile = $appointment_customer["mobile"];
            $customer->landline = isset($appointment_customer["landline"]) ? $appointment_customer["landline"] : '';
            $customer->email = $appointment_customer["email"];
            $customer->postal_code = $appointment_customer["postal_code"];
            $customer->house_no = $appointment_customer["house_no"];
            $customer->house_letter = $appointment_customer["house_letter"];
            $customer->address = $appointment_customer["address"];
            $customer->city = $appointment_customer["city"];
            $customer->dob = $appointment_customer["dob"];
            $customer->created_by = $this->ExpToken["user_id"];
            $customer->updated_by = $this->ExpToken["user_id"];
            $customer->save();

            }
            
        } else {
           
            $appointment_customer['is_active'] = 1;
            $appointment_customer['created_by'] = $this->ExpToken["user_id"];
            $appointment_customer['updated_by'] = $this->ExpToken["user_id"];
            $appointment_customer['user_company_id'] = $this->ExpToken["parent_id"];

            $customer_insert = Customers::create($appointment_customer);
            $customer_id = $customer_insert->id;
            if($appointment_paid == 'paid'){
                $appointment_status_id = 4;
            }else{
                $appointment_status_id = 7;
            }
            
        }

        if($customer_id == 0){
            $walk_in_appointment =   Appointments::where('customer_status',1)->orderBy('id', 'DESC')->first();
        }
        

        foreach ($appointment_services as $key => $value) {

            $service_id[] = $value["id"];
           
            if($customer_id == 0){
                $newappointments[$key]["customer_id"] = 0;
                $newappointments[$key]["walk_in_customer_id"] = (($walk_in_appointment == null) ?1:($walk_in_appointment->walk_in_customer_id + 1));
                $newappointments[$key]["customer_status"] = 1;
            }else{
                $newappointments[$key]["customer_id"] = $customer_id;
                $newappointments[$key]["walk_in_customer_id"] = 0;
                $newappointments[$key]["customer_status"] = 0;
            }
            
            $newappointments[$key]["user_company_id"] = $this->ExpToken["parent_id"];
             
            
            if(isset($value["worker_id"])){
                $newappointments[$key]["worker_id"] = $value["worker_id"];
            }else{
                $newappointments[$key]["worker_id"] = $appointment["worker_id"];
            }
            
            
            $newappointments[$key]["service_id"] = $value["id"];
            
            if(isset($value["coupon"])){
                if(count($value["coupon"]) > 0){
                    $newappointments[$key]["coupon_id"] = $value['coupon'][0]['id'];
                }else{
                    $newappointments[$key]["coupon_id"] = 0;
                }
            }else{
                $newappointments[$key]["coupon_id"] = 0;
            }
            
            $newappointments[$key]["comments"] = isset($appointment["comment"]) ? $appointment["comment"] : '';
            $newappointments[$key]["appointment_date"] = $appointment["appointment_date"];
            $newappointments[$key]["appointment_status_id"] =  $appointment_status_id;
            $newappointments[$key]["service_duration"] = $value["duration"];
            $start_time = $appointment["start_time"];
            if ($key == 0) {
                $newappointments[$key]["start_time"] =  $start_time; //date("H:i:s", $start_time);
                $break_start_time = explode(":",  $start_time);
                $hour[$key] = floor(($value["duration"] + (int) $break_start_time[1]) / 60);
                $minute[$key] = (strlen(($value["duration"] + (int) $break_start_time[1]) % 60) < 2) ? '0' . (($value["duration"] + (int) $break_start_time[1]) % 60) : (($value["duration"] + (int) $break_start_time[1]) % 60);
                $end_time_hour[$key] = (strlen((int) $break_start_time[0]    + $hour[$key]) < 2) ? "0" . ((int) $break_start_time[0]  + $hour[$key]) : ((int) $break_start_time[0] + $hour[$key]);
                $newappointments[$key]["end_time"] = date("H:i:s", strtotime($end_time_hour[$key] . ":" . $minute[$key]));
                $prev_service_end_time = $newappointments[$key]["end_time"];
                $prev_service_end_time_calc = ((int) $break_start_time[0] + $hour[$key]) . ":" . $minute[$key];
            } else {
                $newappointments[$key]["start_time"] = $prev_service_end_time;
                $break_priv_time = explode(":",  $prev_service_end_time_calc);
                $hour[$key] = floor(($value["duration"] + (int) $break_priv_time[1]) / 60);
                $minute[$key] = (strlen(($value["duration"] + (int) $break_priv_time[1]) % 60) < 2) ? '0' . (($value["duration"] + (int) $break_priv_time[1]) % 60) : (($value["duration"] + (int) $break_priv_time[1]) % 60);
                $end_time_hour[$key] = (strlen($break_priv_time[0] + $hour[$key]) < 2) ? "0" . ((int) $break_priv_time[0] + $hour[$key]) : ($break_priv_time[0] + $hour[$key]);
                $newappointments[$key]["end_time"] = date("H:i:s", strtotime($end_time_hour[$key] . ":" . $minute[$key]));
                $prev_service_end_time = $newappointments[$key]["end_time"];
                $prev_service_end_time_calc = ($break_priv_time[0] + $hour[$key]) . ":" . $minute[$key];
            }


            $newappointments[$key]["is_sms"] = isset($appointment["is_sms"]) ? (($appointment["is_sms"] == true) ? 1 : 0) : 0;
            $newappointments[$key]["is_email"] = isset($appointment["is_email"]) ? (($appointment["is_email"] == true) ? 1 : 0) : 0;
            $newappointments[$key]["created_by"] = $this->ExpToken["user_id"];
            $newappointments[$key]["updated_by"] = $this->ExpToken["user_id"];
            $newappointments[$key]["treatment_frm_id"] = isset($appointment["treatment_frm_id"]) ? $appointment["treatment_frm_id"] : 0;
            $newappointments[$key]["consent_frm_id"] = isset($appointment["consent_frm_id"]) ? $appointment["consent_frm_id"] : 0;
            $newappointments[$key]["medical_frm_id"] = isset( $appointment["medical_frm_id"]) ?  $appointment["medical_frm_id"] : 0;
            $appointment_details_top_calendar = '<table style="width:100%;">
            <tbody>
                <tr>
                    <td></td>
                </tr>';
            $appointment_details_down_calendar = '</tbody></table>';
            $appointment_details_calendar = "<tr><td><span style='padding:5px;'>Customer Name: " . $appointment_customer["firstname"] . " " . $appointment_customer["lastname"] . ",</span></td></tr>";
            $appointment_details_calendar .= "<tr><td><span style='padding:5px;'>Phone: " . $appointment_customer["mobile"] . ",</span></td></tr>";
            $appointment_details_calendar .= "<tr><td><span style='padding:5px;'>Appointment has been created for below service.</span></td></tr>";
            $service_detail = Services::where('id', $newappointments[$key]["service_id"])->where('user_company_id', $this->ExpToken["parent_id"])->get()->toArray();
            //print_r($service_detail);
            $appointment_details_calendar .= "<tr><td><span style='padding:5px;'>".$service_detail[0]["name"] . ", Duration :: " . $this->hour_min($service_detail[0]["duration"]) . "</span></td></tr>";
            $appointment_details_calendar .= "<tr><td><span style='padding:5px;'>your appointment date is " . date('d-M-Y', strtotime($appointment["appointment_date"]))." ".$appointment["start_time"] ." (".date('D', strtotime($appointment["appointment_date"])).")" . ".</span></td></tr>";
            $appointment_details_calendar .= "<tr><td><span style='padding:5px;'>Thanks<br>Salon Team.</span></td></tr>";
            
            $appointment_info_calendar = $appointment_details_top_calendar . $appointment_details_calendar . $appointment_details_down_calendar;
            $worker_detail = Users::find($newappointments[$key]["worker_id"]);
            if($worker_detail->google_token && $worker_detail->google_token!== "") {
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
                    //echo "here enter";
                    //echo date('Y-m-d', strtotime($appointment["appointment_date"]));
                $appointment_start_time = date('Y-m-d', strtotime($appointment["appointment_date"])).' '.$newappointments[$key]["start_time"];
                $appointment_end_time = date('Y-m-d', strtotime($appointment["appointment_date"])).' '.$newappointments[$key]["end_time"];
                    $capi = new GoogleCalendarApi();
                    $user_timezone = $capi->GetUserCalendarTimezone($data['access_token']);
                    date_default_timezone_set($user_timezone);
                    $event['event_time'] = array(
                        'start_time'=>date("c", strtotime($appointment_start_time)),
                        'end_time'=>date("c", strtotime($appointment_end_time)),
                    'event_date'=> ''
                    );

                    $eventTitle = "Appointment : ".$service_detail[0]["name"].", ".$appointment_customer["firstname"]." ".$appointment_customer["lastname"].", ".$appointment_customer["mobile"];
                    
                    $event_id = $capi->CreateCalendarEvent('primary', $eventTitle, $appointment_info_calendar, 0, $event['event_time'], $user_timezone, $data['access_token']);
                    $newappointments[$key]['event_cal_id'] = $event_id; 
                    //echo "eventid".$event_id."";
                }
            }
        }

        $services = Services::whereIn('id', $service_id)->where('user_company_id', $this->ExpToken["parent_id"])->get()->toArray();
        Appointments::insert($newappointments);

        if(isset($appointment_id_before_insert->id)){
            $appointment_ids_after_insert = Appointments::select('id')->where('id', '>', $appointment_id_before_insert->id)->get();

            $appointments_after_insert_ids = Appointments::where('id', '>', $appointment_id_before_insert->id)->get();

        }else{
            $appointment_ids_after_insert = Appointments::select('id')->get();
            $appointments_after_insert_ids = Appointments::get();
        }
        

        foreach ($appointment_ids_after_insert as $key => $single_appointment_id) {
            $newappointment_log[$key]['appointment_id'] = $single_appointment_id->id;
            $newappointment_log[$key]['appointment_status'] = $appointment_status_id;
            $newappointment_log[$key]['log_date_time'] = date("Y-m-d H:i:s");
            $newappointment_log[$key]["created_by"] = $this->ExpToken["user_id"];
            $newappointment_log[$key]["updated_by"] = $this->ExpToken["user_id"];
            $newappointment_log[$key]["user_company_id"] = $this->ExpToken["parent_id"];
        }
        AppointmentLog::insert($newappointment_log);
        $consentFrmLinks = [];
        $treatmentFrmLinks = [];
        $medicalFrmLinks = [];
        $companyId = $this->ExpToken["parent_id"];
        $customerId =  $customer_id;
        $siteUrl = Config::get('constants.activationUrl');
        
        foreach ($appointment_ids_after_insert as $key => $single_appointment_id) {
            

            if(isset($appointment["consent_frm_id"])){

                if($appointment['is_consentFormChk'] && $appointment["consent_frm_id"]){
                    $link = $siteUrl.'login/reportform/'.$companyId.'/'.$appointment["consent_frm_id"].'/'.$customerId.'/'.$single_appointment_id->id;
                    array_push($consentFrmLinks,$link);
                    $report_form_consent = Reportform::find($appointment["consent_frm_id"]);
                    $insertDta_consent=[];
                    $insertDta_consent['user_company_id']=$companyId;
                    $insertDta_consent['customer_id']=$customerId;
                    $insertDta_consent['form_id']=$appointment["consent_frm_id"];
                    $insertDta_consent['fileds'] = $report_form_consent->fileds;
                    $insertDta_consent['app_id']=$single_appointment_id->id;
                    $insertDta_consent['created_by']=$companyId;
                    $insertDta_consent['updated_by']=$companyId;
                    $insertDta_consent['created_at']=date('Y-m-d H:i:s');
                    $insertDta_consent['updated_at']=date('Y-m-d H:i:s');
                    $form_ans=Form_ans::create($insertDta_consent);

                }
            }
            
            if(isset($appointment["treatment_frm_id"])){
            if($appointment['is_treatmentFormChk'] && $appointment["treatment_frm_id"]){
                $link1 = $siteUrl.'login/reportform/'.$companyId.'/'.$appointment["treatment_frm_id"].'/'.$customerId.'/'.$single_appointment_id->id;
                array_push($treatmentFrmLinks,$link1);
            }
            }

        if(isset($appointment["medical_frm_id"])){
            if($appointment['is_medicalFormChk'] && $appointment["medical_frm_id"]){
                $link2 = $siteUrl.'login/reportform/'.$companyId.'/'.$appointment["medical_frm_id"].'/'.$customerId.'/'.$single_appointment_id->id;
                array_push($medicalFrmLinks,$link2);
                $report_form_medical = Reportform::find($appointment["medical_frm_id"]);
                $insertDta_medical=[];
                $insertDta_medical['user_company_id']=$companyId;
                $insertDta_medical['customer_id']=$customerId;
                $insertDta_medical['form_id']=$appointment["medical_frm_id"];
                $insertDta_medical['fileds'] = $report_form_medical->fileds;
                $insertDta_medical['app_id']=$single_appointment_id->id;
                $insertDta_medical['created_by']=$companyId;
                $insertDta_medical['updated_by']=$companyId;
                $insertDta_medical['created_at']=date('Y-m-d H:i:s');
                $insertDta_medical['updated_at']=date('Y-m-d H:i:s');
                $form_ans=Form_ans::create($insertDta_medical);
            }
        }
        }
        
        
           
        //echo json_encode([ 'event_id' => $event_id ]);
        $appointment_details_top_calendar = '<table style="width:100%;">
        <tbody>
            <tr>
                <td></td>
            </tr>';
        $appointment_details_down_calendar = '</tbody></table>';
        $appointment_details_calendar = "<tr><td><span style='padding:5px;'>Customer Name: " . $appointment_customer["firstname"] . " " . $appointment_customer["lastname"] . ",</span></td></tr>";
        $appointment_details_calendar .= "<tr><td><span style='padding:5px;'>Appointment has been created for below service.</span></td></tr>";
        foreach ($services as $service) {

            $appointment_details_calendar .= "<tr><td><span style='padding:5px;'>".$service["name"] . ", Duration :: " . $this->hour_min($service["duration"]) . "</span></td></tr>";
        }
        if(count($consentFrmLinks)>0){
            $appointment_details_calendar .= "<tr><td><span style='padding:5px;'><b>Consent Form :<b>";
            foreach ($consentFrmLinks as $key => $value) {
                $key = $key+1;
                $appointment_details_calendar.='<a href="'.$value.'">Form-'.$key.'</a>&nbsp;&nbsp;';
            }
            $appointment_details_calendar .= "</span></td></tr>";
        }

        if(count($treatmentFrmLinks)>0){
            $appointment_details_calendar .= "<tr><td><span style='padding:5px;'><b>Treatment Form :<b>";
            foreach ($treatmentFrmLinks as $key => $value) {
                $key = $key+1;
                $appointment_details_calendar.='<a href="'.$value.'">Form-'.$key.'</a>&nbsp;&nbsp;';
            }
            $appointment_details_calendar .= "</span></td></tr>";
        }
        if(count($medicalFrmLinks)>0){
            $appointment_details_calendar .= "<tr><td><span style='padding:5px;'><b>Medical Form :<b>";
            foreach ($medicalFrmLinks as $key => $value) {
                $key = $key+1;
                $appointment_details_calendar.='<a href="'.$value.'">Form-'.$key.'</a>&nbsp;&nbsp;';
            }
            $appointment_details_calendar .= "</span></td></tr>";
        }
        $appointment_details_calendar .= "<tr><td><span style='padding:5px;'>your appointment date is " . date('d-M-Y', strtotime($appointment["appointment_date"]))." ".$appointment["start_time"] ." (".date('D', strtotime($appointment["appointment_date"])).")" . ".</span></td></tr>";
        $appointment_details_calendar .= "<tr><td><span style='padding:5px;'>Thanks<br>Salon Team.</span></td></tr>";
        
        $appointment_info_calendar = $appointment_details_top_calendar . $appointment_details_calendar . $appointment_details_down_calendar;
                   
        
        if($customer_id != 0){
            if (isset($appointment["is_email"])) {
                if ($appointment["is_email"] == true) {
    
                    $confirmation_template = Emailtemplate::where('type',2)->where('user_company_id', $this->ExpToken["parent_id"])->first();
                    $body_template = $confirmation_template->mail_content;
                    $email = $appointment_customer["email"];
                    $sub = "Appointments details";
                    $appointment_details_top = '<table style="width:100%;">
                    <tbody>
                        <tr>
                            <td></td>
                        </tr>';
                    $appointment_details_down = '</tbody></table>';
                    $appointment_details = "<tr><td><span style='padding:5px;'>Dear " . $appointment_customer["firstname"] . " " . $appointment_customer["lastname"] . ",</span></td></tr>";
                    $appointment_details .= "<tr><td><span style='padding:5px;'>Your appointment has been created for below service.</span></td></tr>";
                    foreach ($services as $service) {
    
                        $appointment_details .= "<tr><td><span style='padding:5px;'>".$service["name"] . ", Duration :: " . $this->hour_min($service["duration"]) . "</span></td></tr>";
                    }
                    if(count($consentFrmLinks)>0){
                        $appointment_details .= "<tr><td><span style='padding:5px;'><b>Consent Form :<b>";
                        foreach ($consentFrmLinks as $key => $value) {
                            $key = $key+1;
                            $appointment_details.='<a href="'.$value.'">Form-'.$key.'</a>&nbsp;&nbsp;';
                        }
                        $appointment_details .= "</span></td></tr>";
                    }
    
                    if(count($treatmentFrmLinks)>0){
                        $appointment_details .= "<tr><td><span style='padding:5px;'><b>Treatment Form :<b>";
                        foreach ($treatmentFrmLinks as $key => $value) {
                            $key = $key+1;
                            $appointment_details.='<a href="'.$value.'">Form-'.$key.'</a>&nbsp;&nbsp;';
                        }
                        $appointment_details .= "</span></td></tr>";
                    }
                    if(count($medicalFrmLinks)>0){
                        $appointment_details .= "<tr><td><span style='padding:5px;'><b>Medical Form :<b>";
                        foreach ($medicalFrmLinks as $key => $value) {
                            $key = $key+1;
                            $appointment_details.='<a href="'.$value.'">Form-'.$key.'</a>&nbsp;&nbsp;';
                        }
                        $appointment_details .= "</span></td></tr>";
                    }
                    $appointment_details .= "<tr><td><span style='padding:5px;'>your appointment date is " . date('d-M-Y', strtotime($appointment["appointment_date"]))." ".$appointment["start_time"] ." (".date('D', strtotime($appointment["appointment_date"])).")" . ".</span></td></tr>";
                    $appointment_details .= "<tr><td><span style='padding:5px;'>Thanks<br>Salon Team.</span></td></tr>";
                   
                    $appointment_info = $appointment_details_top . $appointment_details . $appointment_details_down;
                   
                    $companyData     = Common::mailData('company_details', ['user_company_id' => $this->ExpToken["parent_id"]]);
                    $company_data    = $companyData[0];
                    $imageUrl        = Config::get('constants.displayImageUrl');
                    $company_logo    =  empty($companyData) ? '' : $imageUrl . 'company_logo/' . $companyData[0]->company_logo;
                    $company_name    = empty($companyData) ? '' : $company_data->company_name;
                    $company_number  = empty($companyData) ? '' : $company_data->mobile;
                    $company_email   = empty($companyData) ? '' : $company_data->email;
                    $company_address = empty($companyData) ? '' : $company_data->address;
                    $worker_details   =  empty($appointment["worker_id"]) ? [] : Users::find($appointment["worker_id"]);
                     $certificatenumber =   empty($worker_details) ? '' : $worker_details->certificate_number;
                      $worker_name =   empty($worker_details) ? '' : $worker_details->name;
                     $worker_email =   empty($worker_details) ? '' : $worker_details->email;
                     $customer_firstname = empty($appointment_customer["firstname"]) ? '' : $appointment_customer["firstname"];
                     $customer_lastname = empty($appointment_customer["lastname"]) ? '' : $appointment_customer["lastname"];
                     $customer_address = empty($customer_details) ? '' : $appointment_customer["address"]."<br>".$appointment_customer["postal_code"]." ".$appointment_customer["city"];
                     $customer_dob = $appointment_customer["dob"];
                     $customer_gender = $appointment_customer["gender"];
                     $customer_mobile = $appointment_customer["mobile"];

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
                        '[[customer-address]]' => $customer_address,
                        '[[customer-birthdate]]' => $customer_dob,
                        '[[customer-number]]' => $customer_mobile,
                        '[[gender]]' => $customer_gender,
            
            
                        '[[invoice-number]]' => '',
                        '[[invoice-date]]' =>  '',
                        '[[invoice-amount]]' => '',
                        '[[appointment-confirmation-message]]' => $appointment_info,
                        '[[invoice-treatment-date]]' => '',
                        '[[appointment-date-time]]' =>  date('d-M-Y', strtotime($appointment["appointment_date"]))." ".$appointment["start_time"] ." (".date('D', strtotime($appointment["appointment_date"])).")"
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
        }
        /* if(isset($appointment['accesstoken']) && $appointment['accesstoken'] !== "" && $appointment['is_sync_google'] && $appointment['is_sync_google'] === 1) {
            
            $event['event_time'] = array(
                'start_time'=>date("c", strtotime($appointment["appointment_date"])),
                'end_time'=>date("c", strtotime($appointment["appointment_date"])),
               'event_date'=> ''
               );
            $capi = new GoogleCalendarApi();
        
            $user_timezone = $capi->GetUserCalendarTimezone($appointment['accesstoken']);
            //echo $user_timezone; die;
            $event_id = $capi->CreateCalendarEvent('primary', 'Appointment', $appointment_info_calendar, 0, $event['event_time'], $user_timezone, $appointment['accesstoken']);     
        } */
      
        $response = array(
            "success" => true,
            "message" => "Appointment add successfully.",
            "appointments" => $appointments_after_insert_ids->toArray()
        );
        return response()->json($response);
    }


    public function update(Request $request)
    {

        if(isset($request->customer['id'])){

            if($request->customer['id'] != 0){
           
                $check_validate = $request->validate([
                    'customer.firstname' => 'required',
                    'customer.lastname' => 'required',
                    'customer.email' => 'required',
                    'customer.mobile' => 'required',
                    //'email' => 'required|unique:customers,email,'.$request->get('id').',id',
                    //'mobile' => 'required|regex:/[0-9]{10}/|unique:customers,mobile,'.$request->get('id').',id',
                    'customer.gender' => 'required',
                ]);
    
            }
        }else{

            $check_validate = $request->validate([
                'customer.firstname' => 'required',
                'customer.lastname' => 'required',
                'customer.email' => 'required',
                'customer.mobile' => 'required',
                //'email' => 'required|unique:customers,email,'.$request->get('id').',id',
                //'mobile' => 'required|regex:/[0-9]{10}/|unique:customers,mobile,'.$request->get('id').',id',
                'customer.gender' => 'required',
            ]);

        }
        
        $appointment = $request->all();
        $newappointments = array();
        $newappointment_log = array();
        $appointment_customer = $appointment["customer"];
        $appointment_services = $appointment["services"];
       
        if (isset($appointment_customer["id"])) {

            $check_appointment = Appointments::where('customer_id', $appointment_customer["id"])->where('user_company_id', $this->ExpToken["parent_id"])->get()->count();
            if ($check_appointment > 0) {
                $appointment_status_id = 1;
            } else {
                $appointment_status_id = 7;
            }
            $customer_id = $appointment_customer["id"];
            if($customer_id != 0){
            $customer = Customers::find($appointment_customer["id"]);
            $customer->user_company_id = $appointment_customer["user_company_id"];
            $customer->firstname = $appointment_customer["firstname"];
            $customer->lastname = $appointment_customer["lastname"];
            $customer->gender = $appointment_customer["gender"];
            $customer->mobile = $appointment_customer["mobile"];
            $customer->landline = isset($appointment_customer["landline"]) ? $appointment_customer["landline"] : '';
            $customer->email = $appointment_customer["email"];
            $customer->postal_code = $appointment_customer["postal_code"];
            $customer->house_no = $appointment_customer["house_no"];
            $customer->house_letter = $appointment_customer["house_letter"];
            $customer->address = $appointment_customer["address"];
            $customer->city = $appointment_customer["city"];
            $customer->dob = $appointment_customer["dob"];
            $customer->created_by = $this->ExpToken["user_id"];
            $customer->updated_by = $this->ExpToken["user_id"];
            $customer->save();
            }
        } else {
            $appointment_customer['is_active'] = 1;
            $appointment_customer['created_by'] = $this->ExpToken["user_id"];
            $appointment_customer['updated_by'] = $this->ExpToken["user_id"];
            $appointment_customer['user_company_id'] = $this->ExpToken["parent_id"];
            $customer_insert = Customers::create($appointment_customer);
            $customer_id = $customer_insert->id;
            $appointment_status_id = 7;
        }
        if($customer_id == 0){
            $walk_in_appointment =   Appointments::where('customer_status',1)->orderBy('id', 'DESC')->first();
        }

        $new_appointment = Appointments::find($request->id);
        $new_appointment->service_id = $request->services["id"];
        $new_appointment->user_company_id = $this->ExpToken["parent_id"];
        $new_appointment->appointment_status_id = $appointment_status_id;
        $new_appointment->service_duration = $request->services["duration"];
        
        if($customer_id == 0){
            $new_appointment->customer_id = 0;
            $new_appointment->walk_in_customer_id = (($walk_in_appointment == null) ? 1:($walk_in_appointment->walk_in_customer_id + 1));
            $new_appointment->customer_status = 1;
        }else{
            $new_appointment->customer_id = $customer_id;
            $new_appointment->walk_in_customer_id = 0;
            $new_appointment->customer_status = 0;
        }
        $break_start_time = explode(":",  $request->start_time);
        $hour = floor(($request->services["duration"] + (int) $break_start_time[1]) / 60);
        $minute = (strlen(($request->services["duration"] + (int) $break_start_time[1]) % 60) < 2) ? '0' . (($request->services["duration"] + (int) $break_start_time[1]) % 60) : (($request->services["duration"] + (int) $break_start_time[1]) % 60);
        $end_time_hour = (strlen((int) $break_start_time[0]    + $hour) < 2) ? "0" . ((int) $break_start_time[0]  + $hour) : ((int) $break_start_time[0] + $hour);
        $new_appointment->end_time =  date("H:i:s", strtotime($end_time_hour . ":" . $minute));
        $new_appointment->treatment_frm_id = isset($appointment["treatment_frm_id"]) ? $appointment["treatment_frm_id"] : 0;
        $new_appointment->consent_frm_id = isset($appointment["consent_frm_id"]) ? $appointment["consent_frm_id"] : 0;
        $new_appointment->medical_frm_id = isset( $appointment["medical_frm_id"]) ?  $appointment["medical_frm_id"] : 0;
        $new_appointment->comments = isset($appointment["comment"]) ? $appointment["comment"] : '';
        $new_appointment->save();
         $appointment_details_top_calendar = '<table style="width:100%;">
        <tbody>
            <tr>
                <td></td>
            </tr>';
        $appointment_details_down_calendar = '</tbody></table>';
        $appointment_details_calendar = "<tr><td><span style='padding:5px;'>Customer Name: " . $appointment_customer["firstname"] . " " . $appointment_customer["lastname"] . ",</span></td></tr>";
        $appointment_details_calendar .= "<tr><td><span style='padding:5px;'>Appointment has been created for below service.</span></td></tr>";
        $service_detail = Services::where('id', $request->services["id"])->where('user_company_id', $this->ExpToken["parent_id"])->get()->toArray();
        //print_r($service_detail);
        $appointment_details_calendar .= "<tr><td><span style='padding:5px;'>".$service_detail[0]["name"] . ", Duration :: " . $this->hour_min($service_detail[0]["duration"]) . "</span></td></tr>";
        $appointment_details_calendar .= "<tr><td><span style='padding:5px;'>your appointment date is " . date('d-M-Y', strtotime($appointment["appointment_date"]))." ".$appointment["start_time"] ." (".date('D', strtotime($appointment["appointment_date"])).")" . ".</span></td></tr>";
        $appointment_details_calendar .= "<tr><td><span style='padding:5px;'>Thanks<br>Salon Team.</span></td></tr>";
        
        $appointment_info_calendar = $appointment_details_top_calendar . $appointment_details_calendar . $appointment_details_down_calendar;
        $worker_detail = Users::find($appointment['worker_id']);
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
                $appointment_info_calendar = $appointment_details_top_calendar . $appointment_details_calendar . $appointment_details_down_calendar;
                $appointment_start_time = $appointment["appointment_date"].' '.$appointment["start_time"];
                $appointment_end_time = $appointment["appointment_date"].' '.date("H:i:s", strtotime($end_time_hour . ":" . $minute));
                $capi = new GoogleCalendarApi();
                $user_timezone = $capi->GetUserCalendarTimezone($data['access_token']);
                date_default_timezone_set($user_timezone);
                $event['event_time'] = array(
                    'start_time'=>date("c", strtotime($appointment_start_time)),
                    'end_time'=>date("c", strtotime($appointment_end_time)),
                'event_date'=> ''
                );
                
                $event_id = $capi->UpdateCalendarEvent($new_appointment->event_cal_id,'primary', 'Appointment', $appointment_info_calendar, 0, $event['event_time'], $user_timezone, $data['access_token']);
            }
        }
        $response = array(
            "success" => true,
            "message" => "Appointment update successfully."
        );
        return response()->json($response);
    }

    public function hour_min($minutes)
    { // Total
        if ($minutes <= 0) return '00 Hours 00 Minutes';
        else
            return sprintf("%02d", floor($minutes / 60)) . ' Hours ' . sprintf("%02d", str_pad(($minutes % 60), 2, "0", STR_PAD_LEFT)) . " Minutes";
    }

    public function drag_blocktime(Request $request)
    {
        $appointment = Appointments::find($request->id);
        $appointment->user_company_id = $this->ExpToken["parent_id"];
        $appointment->worker_id = $request->worker_id;
        $appointment->is_email = ($request->is_email == true) ? 1 : 0;
        $appointment->start_time = $request->start_time;
        $appointment->end_time = $request->end_time;
        $appointment->appointment_date = $request->appointment_date;
        $appointment->save();
        
        $response = array(
            "success" => true,
            "message" => "Block time update successfully.",
        );
        return response()->json($response);
    }

    public function drag_appointment(Request $request)
    {


       
        $appointment = Appointments::find($request->id);
        $old_workerId = $appointment->worker_id;
        $event_cal_id_old = $appointment->event_cal_id;
        $appointment->user_company_id = $this->ExpToken["parent_id"];
        $appointment->worker_id = $request->worker_id;
        $appointment->is_email = ($request->is_email == true) ? 1 : 0;
        $appointment->start_time = $request->start_time;
        $appointment->appointment_date = $request->appointment_date;
        $break_start_time = explode(":",  $request->start_time);
        $hour = floor(($request->service_duration + (int) $break_start_time[1]) / 60);
        $minute = (strlen(($request->service_duration + (int) $break_start_time[1]) % 60) < 2) ? '0' . (($request->service_duration + (int) $break_start_time[1]) % 60) : (($request->service_duration + (int) $break_start_time[1]) % 60);
        $end_time_hour = (strlen((int) $break_start_time[0]    + $hour) < 2) ? "0" . ((int) $break_start_time[0]  + $hour) : ((int) $break_start_time[0] + $hour);
        $appointment->end_time =  date("H:i:s", strtotime($end_time_hour . ":" . $minute));
        $appointment->save();
        $appointment_details_top_calendar = '<table style="width:100%;">
        <tbody>
            <tr>
                <td></td>
            </tr>';
        $appointment_details_down_calendar = '</tbody></table>';
        $appointment_details_calendar = "<tr><td><span style='padding:5px;'>Customer Name: " . $request->customer['firstname'] . " " . $request->customer["lastname"] . ",</span></td></tr>";
        $appointment_details_calendar .= "<tr><td><span style='padding:5px;'>Appointment has been created for below service.</span></td></tr>";
        $service_detail = Services::where('id', $appointment["service_id"])->where('user_company_id', $this->ExpToken["parent_id"])->get()->toArray();
        //print_r($service_detail);
        $appointment_details_calendar .= "<tr><td><span style='padding:5px;'>".$service_detail[0]["name"] . ", Duration :: " . $this->hour_min($service_detail[0]["duration"]) . "</span></td></tr>";
        $appointment_details_calendar .= "<tr><td><span style='padding:5px;'>your appointment date is " . date('d-M-Y', strtotime($request->appointment_date))." ".$request->start_time ." (".date('D', strtotime($request->appointment_date)).")" . ".</span></td></tr>";
        $appointment_details_calendar .= "<tr><td><span style='padding:5px;'>Thanks<br>Salon Team.</span></td></tr>";
        
        $worker_detail = Users::find($appointment["worker_id"]);
        $new_workerId = $worker_detail->id;
        if($worker_detail->google_token && $worker_detail->google_token !== "") {
            if($new_workerId ==  $old_workerId){//drop in same worker
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
                    $appointment_info_calendar = $appointment_details_top_calendar . $appointment_details_calendar . $appointment_details_down_calendar;
                    $appointment_start_time = $request->appointment_date.' '.$request->start_time;
                    $appointment_end_time = $request->appointment_date.' '.date("H:i:s", strtotime($end_time_hour . ":" . $minute));
                    $capi = new GoogleCalendarApi();
                    $user_timezone = $capi->GetUserCalendarTimezone($data['access_token']);
                    date_default_timezone_set($user_timezone);
                    $event['event_time'] = array(
                        'start_time'=>date("c", strtotime($appointment_start_time)),
                        'end_time'=>date("c", strtotime($appointment_end_time)),
                    'event_date'=> ''
                    );
                    
                    $event_id = $capi->UpdateCalendarEvent($appointment->event_cal_id,'primary', 'Appointment', $appointment_info_calendar, 0, $event['event_time'], $user_timezone, $data['access_token']);
                }
            }else{//drop in another worker
                //store in google calender for new worker
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
                    $appointment_info_calendar = $appointment_details_top_calendar . $appointment_details_calendar . $appointment_details_down_calendar;
                    //echo "here enter";
                    //echo date('Y-m-d', strtotime($appointment["appointment_date"]));
                $appointment_start_time = $request->appointment_date.' '.$request->start_time;
                    $appointment_end_time = $request->appointment_date.' '.date("H:i:s", strtotime($end_time_hour . ":" . $minute));
                    $capi = new GoogleCalendarApi();
                    $user_timezone = $capi->GetUserCalendarTimezone($data['access_token']);
                    date_default_timezone_set($user_timezone);
                    $event['event_time'] = array(
                        'start_time'=>date("c", strtotime($appointment_start_time)),
                        'end_time'=>date("c", strtotime($appointment_end_time)),
                    'event_date'=> ''
                    );
                    $service_detail = Services::where('id', $request->service_id)->where('user_company_id', $this->ExpToken["parent_id"])->get()->toArray();
                    $appointment_customer = $request->customer;
                    $eventTitle = "Appointment : ".$service_detail[0]["name"].", ".$appointment_customer["firstname"]." ".$appointment_customer["lastname"].", ".$appointment_customer["mobile"];
                    
                    $event_id = $capi->CreateCalendarEvent('primary', $eventTitle, $appointment_info_calendar, 0, $event['event_time'], $user_timezone, $data['access_token']);
                    //echo "eventid".$event_id."";
                    $appointment1 = Appointments::find($request->id);
                    $appointment1->event_cal_id = $event_id;
                    $appointment1->save();
                }

                //remove from old worker calender
                $worker_detailOld = Users::find($old_workerId);
                if($worker_detailOld->google_token && $worker_detailOld->google_token !== "") {
                    $url = 'https://www.googleapis.com/oauth2/v4/token';
                    $curlPost = 'client_id=967454501547-5ppgtuckjjm89grbe76o3uo295m5toko.apps.googleusercontent.com&redirect_uri=http://localhost/salon&client_secret=GB9s5MNdVR4-Vq0HLLpZPVSK&refresh_token='. $worker_detailOld->google_token . '&grant_type=refresh_token';
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
                        $event_id = $event_cal_id_old;
                        
                        $capi->DeleteCalendarEvent($event_id, $calendar_id, $data['access_token']);
                    }
                }

            }
        }
        if (isset($request->is_email)) {
            if ($appointment["is_email"] == true) {
                
                $email = $request->customer['email'];
                $sub = "Appointments details changed";
                $confirmation_template = Emailtemplate::where('type',3)->where('user_company_id', $this->ExpToken["parent_id"])->first();
                $body_template = $confirmation_template->mail_content;
               
                $companyData     = Common::mailData('company_details', ['user_company_id' => $this->ExpToken["parent_id"]]);
                $company_data    = $companyData[0];
                $imageUrl        = Config::get('constants.displayImageUrl');
                $company_logo    =  empty($companyData) ? '' : $imageUrl . 'company_logo/' . $companyData[0]->company_logo;
                $company_name    = empty($companyData) ? '' : $company_data->company_name;
                $company_number  = empty($companyData) ? '' : $company_data->mobile;
                $company_email   = empty($companyData) ? '' : $company_data->email;
                $company_address = empty($companyData) ? '' : $company_data->address;
                $worker_details   =  empty($appointment["worker_id"]) ? [] : Users::find($appointment["worker_id"]);
                 $certificatenumber =   empty($worker_details) ? '' : $worker_details->certificate_number;
                  $worker_name =   empty($worker_details) ? '' : $worker_details->name;
                 $worker_email =   empty($worker_details) ? '' : $worker_details->email;
                 $customer_firstname = empty($request->customer['firstname']) ? '' : $request->customer['firstname'];
                 $customer_lastname = empty($request->customer["lastname"]) ? '' : $request->customer["lastname"];
                

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
                    '[[appointment-date-time]]' => date('d-M-Y', strtotime($request->appointment_date))." ".$request->start_time." (".date('D', strtotime($request->appointment_date)).")",

                    '[[service-duration]]' => $this->hour_min($request->service['duration']),
                    '[[service-name]]'=>$request->service['name'],
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
            "message" => "Appointment update successfully.",
        );
        return response()->json($response);
    }


    public function adjust_appointment(Request $request)
    {
        $appointment = Appointments::find($request->id);
        $appointment->is_email = ($request->is_email == true) ? 1 : 0;
        $appointment->start_time = $request->start_time;
        $appointment->end_time =   $request->end_time;
        $appointment->service_duration = $request->service_duration;
        $appointment->user_company_id = $this->ExpToken["parent_id"];
        $appointment->save();
        if (isset($request->is_email)) {
            if ($appointment["is_email"] == true) {

                $email = $request->customer['email'];
                $sub = "Appointments details changed";
                $confirmation_template = Emailtemplate::where('type',3)->where('user_company_id', $this->ExpToken["parent_id"])->first();
                $body_template = $confirmation_template->mail_content;
                $companyData     = Common::mailData('company_details', ['user_company_id' => $this->ExpToken["parent_id"]]);
                $company_data    = $companyData[0];
                $imageUrl        = Config::get('constants.displayImageUrl');
                $company_logo    =  empty($companyData) ? '' : $imageUrl . 'company_logo/' . $companyData[0]->company_logo;
                $company_name    = empty($companyData) ? '' : $company_data->company_name;
                $company_number  = empty($companyData) ? '' : $company_data->mobile;
                $company_email   = empty($companyData) ? '' : $company_data->email;
                $company_address = empty($companyData) ? '' : $company_data->address;
                $worker_details   =  empty($appointment["worker_id"]) ? [] : Users::find($appointment["worker_id"]);
                 $certificatenumber =   empty($worker_details) ? '' : $worker_details->certificate_number;
                  $worker_name =   empty($worker_details) ? '' : $worker_details->name;
                 $worker_email =   empty($worker_details) ? '' : $worker_details->email;
                 $customer_firstname = empty($request->customer['firstname']) ? '' : $request->customer['firstname'];
                 $customer_lastname = empty($request->customer["lastname"]) ? '' : $request->customer["lastname"];
                

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
                    '[[appointment-date-time]]' => date('d-M-Y', strtotime($request->appointment_date))." ".$request->start_time." (".date('D', strtotime($request->appointment_date)).")",
                    '[[service-duration]]' => $this->hour_min($request->service['duration']),
                    '[[service-name]]'=>$request->service['name'],
                    '[[invoice-treatment-date]]' => '',
                    
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
            "message" => "Appointment update successfully.",
        );
        return response()->json($response);
    }

    public function save_change_service(Request $request)
    {
        $appointment = Appointments::find($request->appointment_id);
        $appointment->service_id = $request->service["id"];
        $appointment->user_company_id = $this->ExpToken["parent_id"];
        $break_start_time = explode(":",  $request->start_time);
        $hour = floor(($request->service["duration"] + (int) $break_start_time[1]) / 60);
        $minute = (strlen(($request->service["duration"] + (int) $break_start_time[1]) % 60) < 2) ? '0' . (($request->service["duration"] + (int) $break_start_time[1]) % 60) : (($request->service["duration"] + (int) $break_start_time[1]) % 60);
        $end_time_hour = (strlen((int) $break_start_time[0]    + $hour) < 2) ? "0" . ((int) $break_start_time[0]  + $hour) : ((int) $break_start_time[0] + $hour);
        $appointment->end_time =  date("H:i:s", strtotime($end_time_hour . ":" . $minute));
        $appointment->save();
        $newappointment_log['appointment_id'] = $request->appointment_id;
        $newappointment_log['appointment_status'] = $request->appointment_id;
        $newappointment_log['log_date_time'] = date("Y-m-d h:i");
        $newappointment_log["created_by"] = $this->ExpToken["user_id"];
        $newappointment_log["updated_by"] = $this->ExpToken["user_id"];
        $newappointment_log["user_company_id"] = $this->ExpToken["parent_id"];
        $response = array(
            "success" => true,
            "message" => "Appointment update successfully.",
        );
        return response()->json($response);
    }


    public function save_change_customer(Request $request)
    {
        $appointment = Appointments::find($request->appointment_id);
        $appointment->customer_id = $request->customer_id;
        $appointment->user_company_id = $this->ExpToken["parent_id"];
        $appointment->save();
        $response = array(
            "success" => true,
            "message" => "Appointment update successfully.",
        );
        return response()->json($response);
    }

    public function save_appointment_comment(Request $request)
    {
        $appointment = Appointments::find($request->appointment_id);
        $appointment->comments = $request->comments;
        $appointment->user_company_id = $this->ExpToken["parent_id"];
        $appointment->save();
        $response = array(
            "success" => true,
            "message" => "Comment update successfully.",
        );
        return response()->json($response);
    }

    public function uncheck_appointment(Request $request)
    {
        $appointment = Appointments::find($request->appointment_id);
        $appointment->appointment_status_id = $request->appointment_status_id;
        $appointment->user_company_id = $this->ExpToken["parent_id"];
        $appointment->save();
        $response = array(
            "success" => true,
            "message" => "Appointment update successfully.",
        );
        return response()->json($response);
    }

    public function store_block_time(Request $request)
    {
        $block_time = new Appointments();
        $block_time->worker_id = $request->worker_id;
        $block_time->user_company_id = $this->ExpToken["parent_id"];
        $block_time->block_time_type = $request->block_time_type;
        $block_time->block_time_description = $request->block_time_description;
        $block_time->start_time = $request->start_time;
        $block_time->end_time = $request->end_time;
        $block_time->appointment_date = $request->block_date;
        $block_time->created_by = $this->ExpToken["user_id"];
        $block_time->updated_by = $this->ExpToken["user_id"];
        $block_time->save();
        $response = array(
            "success" => true,
            "message" => "Block time add successfully.",
        );
        return response()->json($response);
    }


    public function update_block_time(Request $request)
    {
        $block_time = Appointments::find($request->id);
        $block_time->user_company_id = $this->ExpToken["parent_id"];
        $block_time->worker_id = $request->worker_id;
        $block_time->block_time_type = $request->block_time_type;
        $block_time->block_time_description = $request->block_time_description;
        $block_time->start_time = $request->start_time;
        $block_time->end_time = $request->end_time;
        $block_time->appointment_date = $request->appointment_date;
        $block_time->created_by = $this->ExpToken["user_id"];
        $block_time->updated_by = $this->ExpToken["user_id"];
        $block_time->save();
        $response = array(
            "success" => true,
            "message" => "Block time update successfully.",
        );
        return response()->json($response);
    }


    public function destroy(Request $request)
    {

        $appointments = Appointments::find($request->id);
        $appointments->is_deleted = 1;
        $appointments->user_company_id = $this->ExpToken["parent_id"];
        $appointments->created_by = $this->ExpToken["user_id"];
        $appointments->updated_by = $this->ExpToken["user_id"];
        $appointments->save();
        $worker_detail = Users::find($appointments->worker_id);
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
                $event_id = $appointments->event_cal_id;
                
                $capi->DeleteCalendarEvent($event_id, $calendar_id, $data['access_token']);
            }
            $update_appointment = Appointments::find($appointments->id);
            //print_r($update_appointment); die;
            $update_appointment->event_cal_id = "";
            $updateAppointment = $update_appointment->save();
        }
        $response = array(
            "success" => true,
            "message" => "Appointment delete successfully.",
        );

        return response()->json($response);
    }


    public function saveEmailMedicalConsent(Request $request){
        $companyId = $this->ExpToken["parent_id"];
        //$siteUrl = Config::get('constants.activationUrl');
        //$siteUrl = 'http://' . $_SERVER['HTTP_HOST'] . '/salon/#!/';
        $siteUrl = "http://45.79.23.192/salon/#!/";
        $appointment_customer = Customers::find($request->customer_id)->toArray();
        
        
        // $link = $siteUrl.'login/reportform/'.$companyId.'/'.$request->form_id.'/'.$request->customer_id.'/'.$request->app_id;
       
        if($request->app_id != 0){
            $link = $siteUrl.'login/reportform/'.$companyId.'/'.$request->form_id.'/'.$request->customer_id.'/'.$request->app_id;
        }else{
            $link = $siteUrl.'login/reportform/0/'.$request->form_id.'/0/'.$request->id.'?admin';
        }
        
        $form_name = ($request->type == 1) ? 'consent' : 'medical';
        $form_details = '<a href="'.$link.'">Form-'.$form_name.'</a>&nbsp;&nbsp;';
        $sendmail = new SendMail();
        $sendmail->sub = (($request->type == 1) ? 'Consent':'Medical')."Form";
        $sendmail->to_email = $appointment_customer["email"];
        $sendmail->bodyData = $form_details;
        $sendmail->user_company_id = $this->ExpToken["parent_id"];
        $sendmail->save();


        $response = array(
            "success" => true,
            "message" => "Mail send successfully.",
        );

        return response()->json($response);








        // $companyData     = Common::mailData('company_details', ['user_company_id' => $this->ExpToken["parent_id"]]);
        // $company_data    = $companyData[0];
        // $imageUrl        = Config::get('constants.displayImageUrl');
        // $company_logo    =  empty($companyData) ? '' : $imageUrl . 'company_logo/' . $companyData[0]->company_logo;
        // $company_name    = empty($companyData) ? '' : $company_data->company_name;
        // $company_number  = empty($companyData) ? '' : $company_data->mobile;
        // $company_email   = empty($companyData) ? '' : $company_data->email;
        // $company_address = empty($companyData) ? '' : $company_data->address;
        // $worker_details   =  empty($appointment["worker_id"]) ? [] : Users::find($appointment["worker_id"]);
        //  $certificatenumber =   empty($worker_details) ? '' : $worker_details->certificate_number;
        //   $worker_name =   empty($worker_details) ? '' : $worker_details->name;
        //  $worker_email =   empty($worker_details) ? '' : $worker_details->email;
        //  $customer_firstname = empty($appointment_customer["firstname"]) ? '' : $appointment_customer["firstname"];
        //  $customer_lastname = empty($appointment_customer["lastname"]) ? '' : $appointment_customer["lastname"];
        //  $customer_address = empty($customer_details) ? '' : $appointment_customer["address"]."<br>".$appointment_customer["postal_code"]." ".$appointment_customer["city"];
        //  $customer_dob = $appointment_customer["dob"];
        //  $customer_gender = $appointment_customer["gender"];
        //  $customer_mobile = $appointment_customer["mobile"];

        //  $replaceParams = array(
        //     '[[company-logo]]' => $company_logo,
        //     '[[company-name]]' => $company_name,
        //     '[[company-number]]' => $company_number,
        //     '[[company-email]]' => $company_email,
        //     '[[company-address]]' => $company_address,
        //     '[[certificate-number]]' => $certificatenumber,
        //     '[[staff-name]]' => $worker_name,
        //     '[[staff-email]]' => $worker_email,
        //     '[[login-url]]' => '',
        //     '[[staff-password]]' => '',
        //     '[[time]]' => '',
        //     '[[date]]' => '',

        //     '[[customer-firstname]]' => $customer_firstname,
        //     '[[customer-lastname]]' => $customer_lastname,
        //     '[[customer-address]]' => $customer_address,
        //     '[[customer-birthdate]]' => $customer_dob,
        //     '[[customer-number]]' => $customer_mobile,
        //     '[[gender]]' => $customer_gender,


        //     '[[invoice-number]]' => '',
        //     '[[invoice-date]]' =>  '',
        //     '[[invoice-amount]]' => '',
        //     '[[appointment-confirmation-message]]' => $appointment_info,
        //     '[[invoice-treatment-date]]' => ''
        // );


        // $mail_content = Common::replaceMailData($replaceParams, $body_template);
       




    }


    public function sendConfirmationEmail() {
        /* $confirmation_template = Emailtemplate::where('type',2)->where('user_company_id', $this->ExpToken["parent_id"])->first();
        $body_template = $confirmation_template->mail_content;
        $email = $appointment_customer["email"];
        $sub = "Appointments details";
        $appointment_details_top = '<table style="width:100%;">
        <tbody>
            <tr>
                <td></td>
            </tr>';
        $appointment_details_down = '</tbody></table>';
        $appointment_details = "<tr><td><span style='padding:5px;'>Dear " . $appointment_customer["firstname"] . " " . $appointment_customer["lastname"] . ",</span></td></tr>";
        $appointment_details .= "<tr><td><span style='padding:5px;'>Your appointment has been created for below service.</span></td></tr>";
        foreach ($services as $service) {

            $appointment_details .= "<tr><td><span style='padding:5px;'>".$service["name"] . ", Duration :: " . $this->hour_min($service["duration"]) . "</span></td></tr>";
        }
        if(count($consentFrmLinks)>0){
            $appointment_details .= "<tr><td><span style='padding:5px;'><b>Consent Form :<b>";
            foreach ($consentFrmLinks as $key => $value) {
                $key = $key+1;
                $appointment_details.='<a href="'.$value.'">Form-'.$key.'</a>&nbsp;&nbsp;';
            }
            $appointment_details .= "</span></td></tr>";
        }

        if(count($treatmentFrmLinks)>0){
            $appointment_details .= "<tr><td><span style='padding:5px;'><b>Treatment Form :<b>";
            foreach ($treatmentFrmLinks as $key => $value) {
                $key = $key+1;
                $appointment_details.='<a href="'.$value.'">Form-'.$key.'</a>&nbsp;&nbsp;';
            }
            $appointment_details .= "</span></td></tr>";
        }
        if(count($medicalFrmLinks)>0){
            $appointment_details .= "<tr><td><span style='padding:5px;'><b>Medical Form :<b>";
            foreach ($medicalFrmLinks as $key => $value) {
                $key = $key+1;
                $appointment_details.='<a href="'.$value.'">Form-'.$key.'</a>&nbsp;&nbsp;';
            }
            $appointment_details .= "</span></td></tr>";
        }
        $appointment_details .= "<tr><td><span style='padding:5px;'>your appointment date is " . date('d-M-Y', strtotime($appointment["appointment_date"]))." ".$appointment["start_time"] ." (".date('D', strtotime($appointment["appointment_date"])).")" . ".</span></td></tr>";
        $appointment_details .= "<tr><td><span style='padding:5px;'>Thanks<br>Salon Team.</span></td></tr>";
        
        $appointment_info = $appointment_details_top . $appointment_details . $appointment_details_down;
        
        $companyData     = Common::mailData('company_details', ['user_company_id' => $this->ExpToken["parent_id"]]);
        $company_data    = $companyData[0];
        $imageUrl        = Config::get('constants.displayImageUrl');
        $company_logo    =  empty($companyData) ? '' : $imageUrl . 'company_logo/' . $companyData[0]->company_logo;
        $company_name    = empty($companyData) ? '' : $company_data->company_name;
        $company_number  = empty($companyData) ? '' : $company_data->mobile;
        $company_email   = empty($companyData) ? '' : $company_data->email;
        $company_address = empty($companyData) ? '' : $company_data->address;
        $worker_details   =  empty($appointment["worker_id"]) ? [] : Users::find($appointment["worker_id"]);
        $certificatenumber =   empty($worker_details) ? '' : $worker_details->certificate_number;
        $worker_name =   empty($worker_details) ? '' : $worker_details->name;
        $worker_email =   empty($worker_details) ? '' : $worker_details->email;
        $customer_firstname = empty($appointment_customer["firstname"]) ? '' : $appointment_customer["firstname"];
        $customer_lastname = empty($appointment_customer["lastname"]) ? '' : $appointment_customer["lastname"];
        $customer_address = empty($customer_details) ? '' : $appointment_customer["address"]."<br>".$appointment_customer["postal_code"]." ".$appointment_customer["city"];
        $customer_dob = $appointment_customer["dob"];
        $customer_gender = $appointment_customer["gender"];
        $customer_mobile = $appointment_customer["mobile"];

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
        '[[customer-address]]' => $customer_address,
        '[[customer-birthdate]]' => $customer_dob,
        '[[customer-number]]' => $customer_mobile,
        '[[gender]]' => $customer_gender,


        '[[invoice-number]]' => '',
        '[[invoice-date]]' =>  '',
        '[[invoice-amount]]' => '',
        '[[appointment-confirmation-message]]' => $appointment_info,
        '[[invoice-treatment-date]]' => '',
        '[[appointment-date-time]]' =>  date('d-M-Y', strtotime($appointment["appointment_date"]))." ".$appointment["start_time"] ." (".date('D', strtotime($appointment["appointment_date"])).")"
        );


        $mail_content = Common::replaceMailData($replaceParams, $body_template);
        $sendmail = new SendMail();
        $sendmail->sub = $sub;
        $sendmail->to_email = $email;
        $sendmail->bodyData = $mail_content;
        $sendmail->user_company_id = $this->ExpToken["parent_id"];
        $sendmail->save(); */
    }

    public function handleGoogleCallback()
    { //echo "hello"; die;
        try {
  
            $user = Socialite::driver('google')->stateless()->user();
            //echo $user->email;
           //print_r($user); die;
            // //$user['token'];
            // echo $user->token;
            // die;
            // echo $user['accesstoken'];
            $email = $user->email;
            $google_token = $user->refreshToken;
            //$password = $request->get('password');
            
            $userData=Users::getGoogleLoginUser($email);
           /*  $user_appointments = $capi->calendarList('primary', $google_token); */
            //print_r($user_appointments);
            //$calendar_id = [];
            /* foreach($user_appointments['items'] as $key=>$value) {
                //echo $value['id'].'<br/>';
                //array_push($calendar_id)
                //print_r($value);
                array_push($calendar_id,$value['id']);
            } */

            //print_r($calendar_id);
            //echo count($calendar_id); die;
            if(!empty($userData) && $userData[0]['is_active'] == 1){
                //$updateGoogleToken=Users::updateUserGoogleToken($email);
                $user=Users::find($userData[0]['id']);
                
                $user->google_token = $google_token;
                $user->save();
                if($google_token !== "") {
                    $responce['error'] = false;
                    $responce['message'] = "Google calendar sync successfully";
                    return json_encode($responce);
                } else {
                    $responce['error'] = true;
                    $responce['message'] = "Google calendar sync failed";
                    return json_encode($responce);
                }
            }else if (!empty($userData) && $userData[0]['is_active'] == 0) {
                $responce['error'] = true;
                $responce['message'] = "User is not active";
                return json_encode($responce);
            }else {
                $responce['error'] = true;
                $responce['message'] = "User not found";
                return json_encode($responce);
            }
        } catch (Exception $e) {
            return redirect('auth/google');
        }
    }

    public function update_service_from_topay(Request $request){
        $request_data = $request->all();

        $update_appointment = Appointments::find($request_data['appointment_id']);

        $update_appointment->updated_by = $this->ExpToken["user_id"];
        $update_appointment->updated_at = date('Y-m-d H:i:s');
        $update_appointment->service_id = $request_data['service_id'];
        $updateAppointment = $update_appointment->save();

        $response = array(
            "success" => true,
            "message" => "Appointment updated successfully.",
        );
        return response()->json($response);

    }
    public function getAppointmentById(Request $request){
        $appointment_id = $request->segment(3);
        if($appointment_id){
            $data = Appointments::find($appointment_id);
            $response = array(
                "success" => true,
                "data" => $data,
            );
        }else{
            $response = array(
                "success" => false,
                "message" => "Unable to get data",
            );
        }
        return response()->json($response);

    }
}
