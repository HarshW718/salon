<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Customers;
use App\Models\Images;
use App\Models\Invoice;
use App\Models\CustomerCoupons;
use App\Models\Appointments;
use App\Http\Controllers\Middleweb_Controller;
use Postcode;
use DB;

class CustomersController extends Middleweb_Controller
{

    public function index(){


        $customer = Customers::where('is_active',1)->where('user_company_id',$this->ExpToken["parent_id"])->orderBy('id', 'desc')->get();

        $response = array(
            "data" => $customer,

        );
        return response()->json($response);

    }


    public function store(Request $request)
    {
        $check_validate = $request->validate([
            'firstname' => 'required',
            // 'lastname' => 'required',
            //'email' => ['required', 'string'],
            'mobile' => 'required',
            'gender' => 'required',
        ]);

        $insert_data = $request->all();
        $insert_data['is_active'] = 1;
        $insert_data['user_company_id'] = $this->ExpToken["parent_id"];
        $insert_data['created_by'] = $this->ExpToken["user_id"];
        $insert_data['updated_by'] = $this->ExpToken["user_id"];
        $customer_insert = Customers::create($insert_data);
        $customer = Customers::find($customer_insert->id);
        $response = array(
            "success" => true,
            "message" => "Customer add successfully.",
            "customer" => $customer
        );
        return response()->json($response);
    }

    public function update(Request $request)
    {
        $check_validate = $request->validate([
            'firstname' => 'required',
            // 'lastname' => 'required',
            //'email' => 'required',
            'mobile' => 'required',
            'gender' => 'required',

        ]);
        $customer = Customers::find($request->id);
        $customer->user_company_id = $this->ExpToken["parent_id"];
        $customer->firstname = $request->firstname;
        $customer->lastname = $request->lastname;
        $customer->gender = $request->gender;
        $customer->mobile = $request->mobile;
        $customer->landline = $request->landline;
        $customer->email = $request->email;
        $customer->postal_code = $request->postal_code;
        $customer->house_no = $request->house_no;
        $customer->house_letter = $request->house_letter;
        $customer->address = $request->address;
        $customer->city = $request->city;
        $customer->dob = $request->dob;
        if (isset($request->care_account_no)) {
            $customer->care_account_no = $request->care_account_no;
        }
        if (isset($request->is_news_letter)) {
            $customer->is_news_letter = ($request->is_news_letter) ? 1 : 0;
        }
        if (isset($request->comments)) {
            $customer->comments = $request->comments;
        }
        $customer->created_by = $this->ExpToken["user_id"];
        $customer->updated_by = $this->ExpToken["user_id"];
        $customer->save();
        $response = array(
            "success" => true,
            "message" => "Customer update successfully.",
            "customer" => $customer
        );
        return response()->json($response);
    }

    public function destroy(Request $request)
    {


        $appointment_count = Appointments::where('customer_id',$request->id)->count();
        if($appointment_count > 0){
            $response = array(
                "success" => false,
                "message" => "First delete customer appointments !!",
            );
        }else{
            $customer = Customers::find($request->id);
            $customer->delete();
            $response = array(
                "success" => true,
                "message" => "Customer delete successfully.",
            );
        }

        return response()->json($response);
    }
    public function archiveAll(Request $request)
    {
        $ids = $request->all();
        $customer = Customers::whereIn('id', $ids)->where('user_company_id', $this->ExpToken["parent_id"])->update(['is_active' => 0]);
        $response = array(
            "success" => true,
            "message" => "Selected Customers archive successfully.",
        );
        return response()->json($response);
    }

    public function removeFromArchiveAll(Request $request)
    {

        $ids = $request->all();
        $customer = Customers::whereIn('id', $ids)->where('user_company_id', $this->ExpToken["parent_id"])->update(['is_active' => 1]);
        $response = array(
            "success" => true,
            "message" => "Selected Customers remove from archive successfully.",
        );
        return response()->json($response);
    }

    public function destroyAll(Request $request)
    {

        $ids = $request->all();
        $appointment_count = Appointments::whereIn('customer_id', $ids)->count();
        if($appointment_count > 0){
            $response = array(
                "success" => false,
                "message" => "First delete customers appointments !!",
            );
        }else{
            $customer = Customers::whereIn('id', $ids)->where('user_company_id', $this->ExpToken["parent_id"])->delete();
            $response = array(
                "success" => true,
                "message" => "Selected Customers delete successfully.",
            );
        }
        return response()->json($response);
    }

    public function dt_list_customers(Request $request)
    {


        $limit = $request->get('length');
        $start = $request->get('start');
        $draw = $request->get('draw');
        $sort_by = $t1 = $request->get('column_name');
        $sort_order = $request->get('order');
        $search = $request->get('search');
        $is_active = $request->get('is_active');
        $params = array('limit' => $limit, 'start' => $start, 'sort_by' => $sort_by, 'sort_order' => $sort_order, 'search' => $search, 'is_active' => $is_active, 'user_company_id' => $this->ExpToken["parent_id"]);
        $categories = Customers::customer_list($params);
        $categories_count = Customers::customer_listCount($params);

        $response = array(
            'success' => true,
            "data" => $categories,
            "draw" => $draw,
            "recordsFiltered" => $categories_count,
            "recordsTotal" => $categories_count
        );
        return response()->json($response);
    }

    public function appointment_list_customers1(Request $request)
    {
        $search = $request->search;

        $params = array('search' => $search, 'is_active' => 1, 'user_company_id' => $this->ExpToken["parent_id"]);
        $customers = Customers::customer_list_for_appointment($params);
        $response = array(
            'success' => true,
            "data" => $customers,

        );
        return response()->json($response);
    }



    public function appointment_list_customers(Request $request)
    {
        $search = $request->search;

        $params = array('search' => $search, 'is_active' => 1, 'user_company_id' => $this->ExpToken["parent_id"]);
        $customers = Customers::customer_list_for_appointment($params);

        $coupon_data = array();
        foreach ($customers as $value) {

            $invoice_data = CustomerCoupons::with('service', 'coupon_detail')->where('user_company_id', $this->ExpToken["parent_id"])->where('customer_id', $value->id)->where('to_date', '>', date("Y-m-d"))->where('in_use', 0)->orderBy('id', 'desc')->get()->toArray();
            $value->coupon = $invoice_data;
        }

        $response = array(
            'success' => true,
            "data" => $customers,

        );
        return response()->json($response);
    }



    public function upload_csv(Request $request)
    {

        $data_csv = $request->all();
        $data_csv = array_filter($data_csv);
        $line_into_array = array();
        $exist_name = array();
        $final_data = array();
        foreach ($data_csv as $key => $value) {
            $line_into_array[$key] = explode(",", $value);
            if ($key > 0) {
                if (count($line_into_array[$key]) == 14) {
                    if (Customers::whereRaw('LOWER(`email`) LIKE ? ', [trim(strtolower($line_into_array[$key][5])) . '%'])->count() > 0) { } else {
                        if (Customers::whereRaw('(`mobile`) LIKE ? ', [trim(strtolower($line_into_array[$key][3])) . '%'])->count() > 0) { } else {

                            if (trim($line_into_array[$key][0]) != "" && trim($line_into_array[$key][1]) != "" && trim($line_into_array[$key][2]) != "" &&  trim($line_into_array[$key][3]) != "" &&  trim($line_into_array[$key][5]) != "") {
                                $final_data[$key]['user_company_id'] = $this->ExpToken["parent_id"];
                                $final_data[$key]['firstname'] = $line_into_array[$key][0];
                                $final_data[$key]['lastname'] = $line_into_array[$key][1];
                                $final_data[$key]['gender'] = $line_into_array[$key][2];
                                $final_data[$key]['mobile'] = $line_into_array[$key][3];
                                $final_data[$key]['landline'] = $line_into_array[$key][4];
                                $final_data[$key]['email'] = $line_into_array[$key][5];
                                $final_data[$key]['postal_code'] = $line_into_array[$key][6];
                                $final_data[$key]['house_no'] = $line_into_array[$key][7];
                                $final_data[$key]['house_letter'] = $line_into_array[$key][8];
                                $final_data[$key]['address'] = $line_into_array[$key][9];
                                $final_data[$key]['city'] = $line_into_array[$key][10];
                                $final_data[$key]['dob'] = $line_into_array[$key][11];
                                $final_data[$key]['care_account_no'] = $line_into_array[$key][12];
                                $final_data[$key]['comments'] = $line_into_array[$key][13];
                                $final_data[$key]['is_active'] = 1;
                                $final_data[$key]['created_by'] = $this->ExpToken["user_id"];
                                $final_data[$key]['updated_by'] = $this->ExpToken["user_id"];
                                $final_data[$key]['created_at'] = date("Y-m-d h:i:s");
                                $final_data[$key]['updated_at'] = date("Y-m-d h:i:s");
                            }
                        }
                    }
                } else {
                    $response = array(
                        "success" => false,
                        "message" => "Comma(,) not allowed in any field !!",
                    );
                    return response()->json($response);
                    exit();
                }
            }
        }

        Customers::insert($final_data);
        $response = array(
            "success" => true,
            "message" => "Customers add successfully.",
        );
        return response()->json($response);
    }




    public function customerImage(Request $request)
    {
        $file = $request->file('file');
        $upload_path = str_replace("api", "uploads", base_path());
        $image_name = date('mdYHis') . uniqid() . $file->getClientOriginalName();
        $file->move($upload_path, $image_name);
        $image = new Images();
        $image->image_name = $image_name;
        $image->user_company_id = $this->ExpToken["parent_id"];
        $image->customer_id = $request->id;
        $image->save();
        $answer = array('answer' => 'File transfer completed');
        $json = json_encode($answer);
        echo $json;
    }

    public function checkPostalCode_Address(Request $request)
    {
        if ($request->postal_code != '') {
            $address = Postcode::fetchAddress($request->postal_code, $request->house_no);
            if (gettype($address) != 'array') {
                $response = array(
                    "success" => true,
                    "data" => $address->toArray(),
                );
            } else {

                $response = array(
                    "success" => false,
                    "message" => $address['message'],
                );
            }
        } else {
            $response = array(
                "success" => false,
                "message" => 'Postal code required',
            );
        }

        return response()->json($response);
    }

    public function voucherList($customer_id)
    {
        $voucher_list = Invoice::leftJoin('invoice_data', function ($join) {
            $join->on('invoice.id', '=', 'invoice_data.invoice_id');
        })->leftJoin('services', function ($join) {
            $join->on('invoice_data.data_id', '=', 'services.id');
            $join->where('invoice_data.which_one', '=', 'service');
        })->leftJoin('products', function ($join) {
            $join->on('invoice_data.data_id', '=', 'products.id');
            $join->where('invoice_data.which_one', '=', 'product');
        })->leftJoin('company_details', function ($join) {
            $join->on('invoice.user_company_id', '=', 'company_details.user_company_id');
        })->leftJoin('users', function ($join) {
            $join->on('invoice_data.worker_id', '=', 'users.id');
        })->select('invoice.final_invoice_no','invoice.id', 'invoice.invoice_date', DB::raw('CONCAT(DATE_FORMAT(invoice.invoice_date,"%Y")," ",invoice.id) as invoiceNumber'), 'invoice.total_invoice_amount', 'invoice_data.data_id', DB::RAW('IFNULL(services.name,"") as serviceName'), DB::RAW('IFNULL(products.name,"") as productName'), 'invoice_data.which_one', 'invoice_data.single_row_total', 'company_details.company_name', 'users.name', DB::RAW('if(invoice_data.worker_id=0,company_details.company_name,users.name) as workerName'), 'invoice_data.description', 'invoice_data.gift_used')->where('invoice.customer_id', $customer_id)->orderBy('invoice.created_at', 'desc')->get()->toarray();
        $response = array(
            "success" => true,
            "voucher_list" => $voucher_list
        );

        return response()->json($response);
    }

    public function appHistoryList($customer_id)
    {

        $app_history_list = Invoice::leftJoin('invoice_data', function ($join) {
            $join->on('invoice.id', '=', 'invoice_data.invoice_id');
        })->select('invoice.id', DB::raw('COUNT(invoice_data.invoice_id) as total'), 'invoice_data.which_one')->where('invoice.customer_id', $customer_id)->groupBy('invoice_data.which_one')->orderBy('invoice.created_at', 'desc')->get()->toarray();

        $customerData = Customers::where('customers.id', $customer_id)->select('customers.created_at', DB::raw('(select appointment_date from appointments WHERE appointments.customer_id=' . $customer_id . ' order by appointments.id DESC LIMIT 1) as lastApp'))->get()->toarray();

        $valid_coupon_count = CustomerCoupons::where('user_company_id',$this->ExpToken["parent_id"])->where('customer_id',$customer_id)->where('in_use',0)->where('where_from',0)->where('to_date','>=',date('Y-m-d'))->count();
        $date1 = date_create($customerData[0]['created_at']);
        $date2 = date_create(date('Y-m-d'));
        $diff = date_diff($date1, $date2);

        $date3 = date_create($customerData[0]['lastApp']);
        $date4 = date_create(date('Y-m-d'));
        $diff1 = date_diff($date3, $date4);

        if ($diff->m > 0) {
            $since = $diff->m . ' month ago';
        } else if ($diff->d > 0) {
            $since = $diff->d . ' day ago';
        } else if ($diff->h > 0) {
            $since = $diff->h . ' hours ago';
        }

        if ($diff1->m > 0) {
            $lastApp = $diff1->m . ' month ago';
        } else if ($diff1->d > 0) {
            $lastApp = $diff1->d . ' day ago';
        } else if ($diff1->h > 0) {
            $lastApp = $diff1->h . ' hours ago';
        } else {
            $lastApp = 'No any';
        }

        $customer = ['since' => $since, 'lastApp' => $lastApp];
        $response = array(
            "success" => false,
            "customerData" => $customer,
            "app_history_list" => $app_history_list,
            "remaining_coupon" => $valid_coupon_count
        );
        return response()->json($response);
    }

    public function couponList($customer_id)
    {
        $valid_coupon_list = CustomerCoupons::where('user_company_id',$this->ExpToken["parent_id"])->where('customer_id',$customer_id)->where('in_use',0)->where('to_date','>=',date('Y-m-d'))->orderBy('created_at', 'desc')->get();

        $response = array(
            "success" => true,
            "coupon_list" => $valid_coupon_list,
        );

        return response()->json($response);

    }


}
