<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CustomerCoupons;
use App\Models\Customers;
class MemberController extends Controller
{
  function index($id)
  {
    $customer_coupon = CustomerCoupons::where("customer_id",$id)->get();
    $response = array(
      "success" => true,
      "data" => $customer_coupon,
  );
  return response()->json($response);
  }

  function Delete_customer_membership($id)
  {
    $customer = Customers::find($id);
    $customer->membership_id = 0;
    $customer->save();
    
    $customer_coupon = CustomerCoupons::where('customer_id',$id);
    $customer_coupon->delete();
    $response = array(
      "success" => true,
      "data" => $customer_coupon
    );
    return response()->json($response);
  }
}
