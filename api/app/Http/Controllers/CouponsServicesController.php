<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Images; 
use App\Models\CouponsServices; 
use App\Http\Controllers\Middleweb_Controller;

class CouponsServicesController extends Middleweb_Controller
{
    public function services_by_coupon(Request $request)
    {

        $coupon_ids = $request->all();
        $services = CouponsServices::with('coupon_detail')->whereIn('coupon_id', $coupon_ids)->get()->toArray();
        $response = array(
            "success" => true,
            "data" => $services,
        );
        return json_encode($response);
    }


    public function single_coupon(Request $request)
    {

        $coupon_ids = $request->all();
        $services = CouponsServices::with('coupon_detail')->whereIn('coupon_id', $coupon_ids)->get()->toArray();
        $response = array(
            "success" => true,
            "data" => $services,
        );
        return json_encode($response);
    }

}
