<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Services;
use App\Models\ServicesCategories;
use App\Models\Customers;
use App\Models\Sync_cron;
use App\Models\Tax;
use App\Models\Appointments;
use App\Http\Controllers\Middleweb_Controller;
use Illuminate\Support\Facades\DB;

class ServicesController extends Middleweb_Controller
{


    public function index()
    {

        $services = Services::with('service_tax', 'service_category')->where('user_company_id', $this->ExpToken["parent_id"])->orderBy('id', 'DESC')->get();
        $services_array = Services::with('service_category')->where('user_company_id', $this->ExpToken["parent_id"])->orderBy('id', 'DESC')->get()->toArray();
        $response = array(
            "success" => true,
            "data" => $services,
            "data_array" => $services_array,
        );
        return json_encode($response);
    }

    public function list_service_male()
    {

        $services = Services::with('service_tax', 'service_category')->where('user_company_id', $this->ExpToken["parent_id"])->orderBy('id', 'DESC')
        ->where('gender_id',1)->get();
        $services_array = Services::with('service_category')->where('user_company_id', $this->ExpToken["parent_id"])->orderBy('id', 'DESC')->get()->toArray();
        $response = array(
            "success" => true,
            "data" => $services,
            "data_array" => $services_array,
        );
        return json_encode($response);
    }

    public function list_service_female()
    {

        $services = Services::with('service_tax', 'service_category')->where('user_company_id', $this->ExpToken["parent_id"])->orderBy('id', 'DESC')
        ->where('gender_id',2)->get();
        $services_array = Services::with('service_category')->where('user_company_id', $this->ExpToken["parent_id"])->orderBy('id', 'DESC')->get()->toArray();
        $response = array(
            "success" => true,
            "data" => $services,
            "data_array" => $services_array,
        );
        return json_encode($response);
    }


    public function single_service($service_id)
    {

        $services = Services::where('id', $service_id)->where('user_company_id', $this->ExpToken["parent_id"])->orderBy('id', 'DESC')->get();
        $response = array(
            "success" => true,
            "data" => $services,
        );
        return json_encode($response);
    }



    public function store(Request $request)
    {
        $check_validate = $request->validate([
            'name' =>  'required',
            'display_name' =>  'required',
            'category_id' => 'required',
            'sales_price' => 'required',
            'membership_price' => 'required'
        ]);
        $insert_data = $request->all();

        $gender_value = ServicesCategories::where('id',$request->category_id)->value('gender');
        $service_category_name = ServicesCategories::where('id',$request->category_id)->value('name');
        //$insert_data['buffer_duration'] = $request->buffer_time == 1 ? $request->buffer_duration : 0;
        $insert_data['user_company_id'] = $this->ExpToken["parent_id"];
        $insert_data['prestatie_code'] = $request->prestatie_code;
        $insert_data['created_by'] = $this->ExpToken["user_id"];
        $insert_data['updated_by'] = $this->ExpToken["user_id"];
        $result = Services::create($insert_data);
        $sync_cron=Sync_cron::where('from_user_company_id',$this->ExpToken["parent_id"])->get()->toarray();

        if(empty($sync_cron)){

            $insertCron=[];
            $insertCron['from_user_company_id']=$this->ExpToken["parent_id"];
            $insertCron['is_run']=1;
            $insertCron['created_at']=date('Y-m-d H:i:s');
            $insertCron['updated_at']=date('Y-m-d H:i:s', strtotime('+1 minutes'));
            $insertCron['created_by']=$this->ExpToken["user_id"];
            $insertCron['updated_by']=$this->ExpToken["user_id"];
            Sync_cron::create($insertCron);

        }else {

            $sync_cron = Sync_cron::find($sync_cron[0]['id']);
            $sync_cron->is_run = 1;
            $sync_cron->updated_at = date('Y-m-d H:i:s', strtotime('+1 minutes'));
            $sync_cron->updated_by = $this->ExpToken["user_id"];
            $sync_cron->save();
        }
        if($result)
        {
            $last_row = DB::table('services')->latest()->first();
            $services1 = Services::find($last_row->id);
            $services1->gender_id = $gender_value;
            // $services1->display_name = $request->display_name;
            $services1->membership_price = $request->membership_price;

            $services1->save();

        }

        $response = array(
            "success" => true,
            "message" => "Service add successfully.",
            "data" => $services1
        );
        return response()->json($response);


    }

    public function update(Request $request)
    {
        $check_validate = $request->validate([
            'name' => 'required',
            'display_name' => 'required',
            'category_id' => 'required',
            'sales_price' => 'required',
            //'duration' => 'required',
            //'tax_id' => 'required',
        ]);
        $service = Services::find($request->id);
        $gender_value = ServicesCategories::where('id',$request->category_id)->value('gender');

        $service->name = $request->name;
        $service->display_name = $request->display_name;
        $service->gender_id = $gender_value;
        $service->category_id = $request->category_id;
        $service->tax_id = $request->tax_id;
        //$service->buffer_time = $request->buffer_time;
        //$service->buffer_duration = $request->buffer_time == 1 ? $request->buffer_duration : 0;
        $service->sales_price = $request->sales_price;
        $service->membership_price = $request->membership_price;
        //$service->duration = $request->duration;
        //$service->prestatie_code = $request->prestatie_code;
        $service->user_company_id = $this->ExpToken["parent_id"];
        $service->created_by = $this->ExpToken["user_id"];
        $service->updated_by = $this->ExpToken["user_id"];
        $service->save();
        $response = array(
            "success" => true,
            "message" => "Service update successfully.",
        );
        return response()->json($response);
    }

    public function destroy(Request $request)
    {

        $appointment_count = Appointments::where('service_id',$request->id)->count();
        if($appointment_count > 0){
            $response = array(
                "success" => false,
                "message" => "First delete service related appointments !!",
            );
        }else{
            $service = Services::find($request->id);
            $service->delete();
            $response = array(
                "success" => true,
                "message" => "Service delete successfully.",
            );
        }

        return response()->json($response);
    }


    public function search_service(Request $request)
    {

        if ($request->search_service != '') {
            $services = Services::with('service_tax', 'service_category')->where('user_company_id', $this->ExpToken["parent_id"])->where('name', 'like', '%' . $request->search_service . '%')->orWhere('display_name', 'like', '%' . $request->search_service . '%')->orWhere('sales_price', 'like', '%' . $request->search_service . '%')->orWhere('membership_price', 'like', '%' . $request->search_service . '%')->get();
        } else {
            $services = Services::where('user_company_id', $this->ExpToken["parent_id"])->orderBy('id', 'DESC')->get();
        }
        $response = array(
            "success" => true,
            "data" => $services,
        );
        return json_encode($response);
    }

    public function search_service_work_detail(Request $request)
    {


        if ($request->search_service != '') {
            $services =  Services::where('user_company_id', $this->ExpToken["parent_id"])->where('name', 'like', '%' . $request->search_service . '%')->orWhere('sales_price', 'like', '%' . $request->search_service . '%')->orWhere('duration', 'like', '%' . $request->search_service . '%')->get();
        } else {
            $services = Services::where('user_company_id', $this->ExpToken["parent_id"])->orderBy('id', 'DESC')->get();
        }

        $category_id = array_unique(array_column($services->toArray(), 'category_id'));
        $service_categories = ServicesCategories::whereIn('id', $category_id)->orderBy('id', 'DESC')->get();

        $response = array(
            "success" => true,
            "services" => $services,
            "service_categories" => $service_categories
        );

        return json_encode($response);
    }

    public function servics_and_categories_ForCoupon(Request $request)
    {

        $service_and_taxid = $request->all();
        if (count($service_and_taxid['service_ids']) > 0 && $service_and_taxid['tax_id'] != 0) {
            $services = Services::with('service_tax')->where('user_company_id', $this->ExpToken["parent_id"])->whereNotIn('id', $service_and_taxid['service_ids'])->where('tax_id', $service_and_taxid['tax_id'])->orderBy('id', 'DESC')->get();
        } else {
            $services = Services::with('service_tax')->where('user_company_id', $this->ExpToken["parent_id"])->orderBy('id', 'DESC')->get();
        }

        $category_id = array_unique(array_column($services->toArray(), 'category_id'));
        $service_categories = ServicesCategories::where('user_company_id', $this->ExpToken["parent_id"])->whereIn('id', $category_id)->orderBy('id', 'DESC')->get();

        $response = array(
            "success" => true,
            "services" => $services,
            "service_categories" => $service_categories
        );

        return json_encode($response);
    }


    public function search_service_ForCoupon(Request $request)
    {
        $search_data = $request->all();
        if (count($search_data['search']) != 0) {

            if ((count($search_data['ids']) > 0) &&  $search_data['taxid'] != 0) {
                $services = Services::with('service_tax')->where('user_company_id', $this->ExpToken["parent_id"])->whereNotIn('id', $search_data['ids'])->where('tax_id', $search_data['taxid'])->whereRaw("(name like '%" . $search_data['search']['search_service'] . "%' or sales_price like '%" . $search_data['search']['search_service'] . "%')")->get();
            } else {

                $services = Services::with('service_tax')->where('user_company_id', $this->ExpToken["parent_id"])->whereRaw("(name like '%" . $search_data['search']['search_service'] . "%' or sales_price like '%" . $search_data['search']['search_service'] . "%')")->get();
            }
        } else {
            $services = Services::with('service_tax')->where('user_company_id', $this->ExpToken["parent_id"])->whereNotIn('id', $search_data['ids'])->orderBy('id', 'DESC')->get();
        }
        $response = array(
            "success" => true,
            "data" => $services,
        );
        return json_encode($response);
    }

    public function servics_ForCouponatEdit(Request $request)
    {
        $service_id = $request->all();
        $services = Services::with('service_tax')->where('user_company_id', $this->ExpToken["parent_id"])->whereIn('id', $service_id)->orderBy('id', 'DESC')->get();
        $response = array(
            "success" => true,
            "services" => $services,
        );

        return json_encode($response);
    }



    public function upload_csv(Request $request)
    {

        $data_csv = $request->all();
        $data_csv = array_filter($data_csv);
        if (count($data_csv) >= 2) {
            foreach ($data_csv as $key => $value) {
                $line_into_array[$key] = explode(",", $value);
                if ($key > 0 && $value != '') {
                    if (count($line_into_array[$key]) == 6) {
                        if (Services::whereRaw('LOWER(`name`) = "' . trim(strtolower($line_into_array[$key][1])) . '"')->count() > 0) {
                            $response = array(
                                "success" => false,
                                "message" => "Service with name " . $line_into_array[$key][1] . " alredy exist in your list !!",
                            );
                            return response()->json($response);
                            exit();
                        } else {
                            if (trim($line_into_array[$key][0]) != "" && trim($line_into_array[$key][1]) != "" && trim($line_into_array[$key][2]) != "" &&  trim($line_into_array[$key][4]) != "" &&  trim($line_into_array[$key][5]) != "") {

                                if (ServicesCategories::whereRaw('LOWER(`name`) = "' . trim(strtolower($line_into_array[$key][0])) . '"')->count() > 0) {
$service_category = ServicesCategories::whereRaw('LOWER(`name`) = "' . trim(strtolower($line_into_array[$key][0])) . '" and user_company_id="'.$this->ExpToken["parent_id"].'"')->first()->toArray();
                                    $line_into_array[$key][0] = $service_category['id'];
                                    $final_data[$key]['category_id'] = $line_into_array[$key][0];
                                } else {
                                    $response = array(
                                        "success" => false,
                                        "message" => "Service category with name " . $line_into_array[$key][0] . " not exist in your list ,First add category !!",
                                    );
                                    return response()->json($response);
                                    exit();
                                }

                                if (Tax::whereRaw('LOWER(`name`) = "' . trim(strtolower($line_into_array[$key][5])) . '"')->count() > 0) {
                                    $tax = Tax::whereRaw('LOWER(`name`) = "' . trim(strtolower($line_into_array[$key][5])) . '"')->first()->toArray();
                                    $line_into_array[$key][5] = $tax['id'];
                                    $final_data[$key]['tax_id'] = $line_into_array[$key][5];
                                } else {
                                    $response = array(
                                        "success" => false,
                                        "message" => "Tax with name " . $line_into_array[$key][5] . " not exist in your list ,First add tax !!",
                                    );
                                    return response()->json($response);
                                    exit();
                                }
                                $final_data[$key]['name'] = $line_into_array[$key][1];
                                $final_data[$key]['duration'] = $line_into_array[$key][2];
                                if ($line_into_array[$key][3] != '') {
                                    $final_data[$key]['buffer_time'] = 1;
                                    $final_data[$key]['buffer_duration'] = $line_into_array[$key][3];
                                } else {
                                    $final_data[$key]['buffer_time'] = 0;
                                    $final_data[$key]['buffer_duration'] = 0;
                                }

                                $final_data[$key]['sales_price'] = $line_into_array[$key][4];
                                $final_data[$key]['user_company_id'] = $this->ExpToken["parent_id"];
                            } else {

                                $response = array(
                                    "success" => false,
                                    "message" => "Missing required field, It may be name,category,type,supplier,sale price or tax !!",
                                );
                                return response()->json($response);
                                exit();
                            }
                        }
                    } else {
                        $response = array(
                            "success" => false,
                            "message" => "Comma(,) not allowed in any cell !!",
                        );
                        return response()->json($response);
                        exit();
                    }
                }
            }
        } else {

            $response = array(
                "success" => false,
                "message" => "No data found recheck your file !!",
            );
            return response()->json($response);
            exit();
        }

        Services::insert($final_data);
        $response = array(
            "success" => true,
            "message" => "Services add successfully.",
        );
        return response()->json($response);
    }
}
