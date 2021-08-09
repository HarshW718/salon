<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Coupons;
use App\Models\CouponsServices;
use App\Models\CustomerCoupons;
use App\Models\Companies;
use App\Models\Tax;
use App\Models\InvoiceData;
use App\Http\Controllers\Middleweb_Controller;

class CouponsController extends Middleweb_Controller
{

    public function index()
    {
        $coupons = Coupons::where('user_company_id',$this->ExpToken["parent_id"])->orderBy('id', 'DESC')->get();
        $response = array(
            "success" => true,
            "data" => $coupons,
        );
        return response()->json($response);
    }

    public function single_coupon(Request $request)
    {

        $coupons = Coupons::where('user_company_id',$this->ExpToken["parent_id"])->where('id',$request->coupon_id)->where('validity','>',0)->first(); 

        $coupons_validate = InvoiceData::where('user_company_id',$this->ExpToken["parent_id"])->where('data_id',$request->coupon_id)->where('customer_id',$request->customer_id)->first(); 
       
        $services = CouponsServices::with('coupon_detail')->where('coupon_id', $request->coupon_id)->where('service_id', $request->service_id)->first();

        $coupons->no_of_services = $services->no_of_services;
        $coupons->coupon_used = $coupons_validate->coupon_used;
        $coupons->invoice_data_id = $coupons_validate->id;
        
        $response = array(
            "success" => true,
            "data" => $coupons,
        );
        return response()->json($response);
    }



    public function coupons_by_id(Request $request)
    {

        $coupon_ids = $request->all();
        $services = Coupons::where('user_company_id',$this->ExpToken["parent_id"])->whereIn('id',$coupon_ids)->where('validity','>',0)->first(); 
        $response = array(
            "success" => true,
            "data" => $services,
        );
        return json_encode($response);

    }

    public function store(Request $request)
    {
        $insert_coupon_service = array();
        $insert_data = $request->all();
        $insert_data['user_company_id'] = $this->ExpToken["parent_id"];
        $insert_data['created_by'] = $this->ExpToken["user_id"];
        $insert_data['updated_by'] = $this->ExpToken["user_id"];
        $insert_data['where_from'] = 0; // 'master';
        $coupon = Coupons::create($insert_data);
        if ($coupon->id != 0) {
            foreach ($insert_data['services'] as $key => $value) {

                $insert_coupon_service[$key]['coupon_id'] = $coupon->id;
                $insert_coupon_service[$key]['user_company_id'] = $this->ExpToken["parent_id"];
                $insert_coupon_service[$key]['service_id'] = $key;
                $insert_coupon_service[$key]['no_of_services'] = $value['no_of_services'];
                $insert_coupon_service[$key]['where_from'] = 0; // 'master';
            }
            CouponsServices::insert($insert_coupon_service);
            
            
            
            $response = array(
                "success" => true,
                "message" => "Coupon add successfully.",
            );
            return response()->json($response);
        }
    }

    public function update(Request $request)
    {
        $insert_coupon_service = array();
        $coupon = Coupons::find($request->id);
        $coupon->user_company_id = $this->ExpToken["parent_id"];
        $coupon->description = $request->description;
        $coupon->sale_price = $request->sale_price;
        $coupon->tax_id = $request->tax_id;
        $coupon->services = $request->services;
        $coupon->validity = $request->validity;
        $coupon->created_by = $this->ExpToken["user_id"];
        $coupon->updated_by = $this->ExpToken["user_id"];
        $coupon->save();
        foreach ($request->services as $key => $value) {
            $insert_coupon_service[$key]['coupon_id'] = $request->id;
            $insert_coupon_service[$key]['service_id'] = $key;
            $insert_coupon_service[$key]['no_of_services'] = $value['no_of_services'];
        }
        CouponsServices::where('coupon_id', $request->id)->delete();
        CouponsServices::insert($insert_coupon_service);
        $response = array(
            "success" => true,
            "message" => "Coupon update successfully.",
        );
        return response()->json($response);
    }

    public function destroy(Request $request)
    {
        $no_of_coupon_used = CustomerCoupons::where('coupon_id', $request->id)->count();
        if($no_of_coupon_used > 0){
            $response = array(
                "success" => false,
                "message" => "Coupon in used can't delete !!",
            );
        }else{
            CouponsServices::where('coupon_id', $request->id)->delete();
            $coupon = Coupons::find($request->id);
            $coupon->delete();
            $response = array(
                "success" => true,
                "message" => "Coupon delete successfully.",
            );
        }
        return response()->json($response);
    }

    public function coupons_list(Request $request)
    {

        $limit = $request->get('length');
        $start = $request->get('start');
        $draw = $request->get('draw');
        $sort_by  = $request->get('column_name');
        $sort_order = $request->get('order');
        $search = $request->get('search');
        $params = array('limit' => $limit, 'start' => $start, 'sort_by' => $sort_by, 'sort_order' => $sort_order, 'search' => $search,'user_company_id' => $this->ExpToken["parent_id"]);
        $categories = Coupons::coupon_list($params);
        $categories_count = Coupons::coupon_listCount($params);
        $response = array(
            'success' => true,
            "data" => $categories,
            "draw" => $draw,
            "recordsFiltered" => $categories_count,
            "recordsTotal" => $categories_count
        );
        return response()->json($response);
    }

    public function upload_csv(Request $request)
    {
        $data_csv = $request->all();
        $line_into_array = array();
        $exist_name = array();
        $final_data = array();
        foreach ($data_csv as $key => $value) {
            $line_into_array[$key] = explode(",", $value);
            if ($key > 0) {
                if (count($line_into_array[$key]) == 12) {
                    if (Coupons::whereRaw('LOWER(`name`) LIKE ? ', [trim(strtolower($line_into_array[$key][4])) . '%'])->count() > 0) { } else {
                        if (trim($line_into_array[$key][0]) != "" && trim($line_into_array[$key][1]) != "" && trim($line_into_array[$key][4]) != "" &&  trim($line_into_array[$key][6]) != "" &&  trim($line_into_array[$key][7]) != "" &&  trim($line_into_array[$key][8]) != "" &&  trim($line_into_array[$key][10]) != "") {
                            if (CouponsCategories::whereRaw('LOWER(`name`) LIKE ? ', [trim(strtolower($line_into_array[$key][0])) . '%'])->count() > 0) {
                                $product_category = CouponsCategories::whereRaw('LOWER(`name`) LIKE ? ', [trim(strtolower($line_into_array[$key][0])) . '%'])->first()->toArray();
                                $line_into_array[$key][0] = $product_category['id'];
                                $final_data[$key]['category_id'] = $line_into_array[$key][0];
                            } else {
                                $insert_data['name'] = $line_into_array[$key][0];
                                $insert_data['created_by'] = $this->ExpToken["user_id"];
                                $insert_data['updated_by'] = $this->ExpToken["user_id"];
                                $product_category = CouponsCategories::create($insert_data);
                                $line_into_array[$key][0] = $product_category->id;
                                $final_data[$key]['category_id'] = $line_into_array[$key][0];
                            }

                            if (Companies::whereRaw('LOWER(`name`) LIKE ? ', [trim(strtolower($line_into_array[$key][8])) . '%'])->count() > 0) {
                                $product_company = Companies::whereRaw('LOWER(`name`) LIKE ? ', [trim(strtolower($line_into_array[$key][8])) . '%'])->first()->toArray();
                                $line_into_array[$key][8] = $product_company['id'];
                                $final_data[$key]['company_id'] = $line_into_array[$key][8];
                            } else {
                                $insert_data['name'] = $line_into_array[$key][8];
                                $insert_data['created_by'] = $this->ExpToken["user_id"];
                                $insert_data['updated_by'] = $this->ExpToken["user_id"];
                                $product_company = Companies::create($insert_data);
                                $line_into_array[$key][8] = $product_company->id;
                                $final_data[$key]['company_id'] = $line_into_array[$key][8];
                            }
                            if ($line_into_array[$key][7] != "") {
                                if (Tax::whereRaw('LOWER(`name`) LIKE ? ', [trim(strtolower($line_into_array[$key][7])) . '%'])->count() > 0) {
                                    $product_tax = Tax::whereRaw('LOWER(`name`) LIKE ? ', [trim(strtolower($line_into_array[$key][7])) . '%'])->first()->toArray();
                                    $line_into_array[$key][7] = $product_tax['id'];
                                    $final_data[$key]['tax_id'] = $line_into_array[$key][7];
                                } else {
                                    $insert_data['name'] = $line_into_array[$key][7];
                                    $insert_data['value'] = $line_into_array[$key][7];
                                    $insert_data['created_by'] = $this->ExpToken["user_id"];
                                    $insert_data['updated_by'] = $this->ExpToken["user_id"];
                                    $product_tax = Tax::create($insert_data);
                                    $line_into_array[$key][7] = $product_tax->id;
                                    $final_data[$key]['tax_id'] = $line_into_array[$key][7];
                                }
                            }
                            $final_data[$key]['user_company_id'] = $this->ExpToken["parent_id"];
                            $final_data[$key]['type'] = trim(strtolower($line_into_array[$key][1])) == 'salon' ? 1 : 2;
                            $final_data[$key]['ean'] = $line_into_array[$key][2];
                            $final_data[$key]['sku'] = $line_into_array[$key][3];
                            $final_data[$key]['name'] = $line_into_array[$key][4];
                            $final_data[$key]['purchase_price'] = $line_into_array[$key][5];
                            $final_data[$key]['sale_price'] = $line_into_array[$key][6];
                            $final_data[$key]['stocke'] = $line_into_array[$key][9];
                            $final_data[$key]['min_stocke'] = $line_into_array[$key][10];
                            $final_data[$key]['created_by'] = $this->ExpToken["user_id"];
                            $final_data[$key]['updated_by'] = $this->ExpToken["user_id"];
                            
                        }
                    }
                }
            }
        }

        Coupons::insert($final_data);
        $response = array(
            "success" => true,
            "message" => "Coupons add successfully.",
        );
        return response()->json($response);
    }
}
