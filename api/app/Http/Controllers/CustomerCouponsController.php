<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CustomerCoupons;
use App\Http\Controllers\Middleweb_Controller;
use DB;

class CustomerCouponsController extends Middleweb_Controller
{

    public function single_coupon(Request $request)
    {
        $coupons = CustomerCoupons::with('service', 'coupon_detail')->where('user_company_id', $this->ExpToken["parent_id"])->where('id', $request->coupon_id)->where('service_id', $request->service_id)->where('customer_id', $request->customer_id)->first();
        $response = array(
            "success" => true,
            "data" => $coupons,
        );
        return response()->json($response);
    }



    public function used_coupon_list(Request $request)
    {

        $limit = $request->get('length');
        $start = $request->get('start');
        $draw = $request->get('draw');
        $sort_by  = $request->get('column_name');
        $sort_order = $request->get('order');
        $search = $request->get('search');
        $valid_or_invalid = $request->get('valid_or_invalid');
        $params = array('limit' => $limit, 'start' => $start, 'sort_by' => $sort_by, 'sort_order' => $sort_order, 'search' => $search, 'valid_or_invalid' => $valid_or_invalid, 'user_company_id' => $this->ExpToken["parent_id"]);
        $sold_coupons = CustomerCoupons::use_coupon_list($params);
        $sold_coupons_count = CustomerCoupons::use_coupon_listCount($params);
       
        $response = array(
            'success' => true,
            "data" => $sold_coupons,
            "draw" => $draw,
            "recordsFiltered" => $sold_coupons_count,
            "recordsTotal" => $sold_coupons_count
        );
        return response()->json($response);
    }


    public function coupons_by_customer_id(Request $request)
    {
        $coupons = CustomerCoupons::with('service', 'coupon_detail')->where('user_company_id', $this->ExpToken["parent_id"])->where('customer_id', $request->customer_id)->where('to_date', '>', date("Y-m-d"))->where('in_use', 0)->orderBy('id', 'desc')->get();
        $response = array(
            'success' => true,
            "data" => $coupons,
        );
        return response()->json($response);
    }
}
