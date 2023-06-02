<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Invoice;
use App\Models\Appointments;
use App\Models\InvoiceData;
use App\Models\InvoiceCoupons;
use App\Models\InvoiceTax;
use App\Models\Tax;
use App\Models\InvoiceTemplate;
use App\Models\AppointmentLog;
use App\Models\Common;
use App\Models\Users;
use App\Models\Products;
use App\Member;
use App\Models\Customers;
use App\Models\CustomerCoupons;
use App\Models\CouponsServices;
use App\Models\Paymentmethod;
use App\Models\SendMail;
use App\Models\Coupons;
use Illuminate\Support\Facades\Config;
use App\Http\Controllers\Middleweb_Controller;
use PDF;
use Illuminate\Support\Facades\DB;

class InvoiceController extends Middleweb_Controller
{

    public function invoice_number()
    {

        $prifix = DB::select(DB::raw("SELECT * FROM prefix_master WHERE   user_company_id=" . $this->ExpToken["parent_id"] . ""));
        $last_row = Invoice::where('user_company_id', $this->ExpToken["parent_id"])->where('invoice_prefix', substr($prifix[0]->prefix_title, 0, -1))->orderBy('invoice_no', 'DESC')->first();

        $responce = array(
            'status' => true,
            'last_row' => $last_row,
            'prifix' => $prifix
        );

        return response()->json($responce);
    }


    public function store(Request $request)
    {
        $table_data = $request->table_data;



        $invoice_tax = $request->invoice_tax;
        $invoice = ($request->id == 0) ? new Invoice() : Invoice::find($request->id);
        $invoice->user_company_id = $this->ExpToken["parent_id"];
        $invoice->customer_id = isset($request->customer) ? $request->customer['id'] : 0;
        $invoice->to_pay_id = $request->to_pay_id;
        $invoice->total_invoice_amount = $request->total_invoice_amount;
        $invoice->comment = $request->comments;
        $invoice->invoice_date = $request->invoice_date;
        $invoice->treatment_date = $request->treatment_date;
        $invoice->invoice_prefix = $request->invoice_prefix;
        $invoice->final_invoice_no = $request->invoice_prefix . $request->invoice_no;
        $invoice->invoice_no = $request->invoice_no;
        $invoice->created_by = $this->ExpToken["user_id"];
        $invoice->updated_by = $this->ExpToken["user_id"];
        $resultInvoice = $invoice->save();
        if ($request->id != 0) {
            $invoice_coupon = InvoiceCoupons::where('invoice_id', $request->id)->groupBy('customer_coupon_id')->get()->toArray();
            InvoiceData::where('invoice_id', $request->id)->delete();
            InvoiceTax::where('invoice_id', $request->id)->delete();
            InvoiceCoupons::where('invoice_id', $request->id)->delete();
        }

        foreach ($invoice_tax as $key => $value) {
            $invoice_tax[$key]['user_company_id'] = $this->ExpToken["parent_id"];
            $invoice_tax[$key]['invoice_id'] = $invoice->id;
            $invoice_tax[$key]['tax_id'] = $value['taxid'];
            $invoice_tax[$key]['tax_amount'] = $value['total_amount_of_this_tax'];
            unset($invoice_tax[$key]['taxid']);
            unset($invoice_tax[$key]['total_amount_of_this_tax']);
        }

        foreach ($table_data as $key => $value) {
            //unset($table_data[$key]['prestatie_code']);
            unset($table_data[$key]['dt_open']);
            if (isset($value['is_check'])) {
                if ($value['is_check'] == 1) {
                    $check_appointment = AppointmentLog::where('appointment_id', $value['appointment_id'])->where('appointment_status', 3)->get()->toArray();
                    if (count($check_appointment) == 0) {
                        $apppointment_log = new AppointmentLog();
                        $apppointment_log->appointment_id = $value['appointment_id'];
                        $apppointment_log->appointment_status = 3;
                        $apppointment_log->user_company_id = $this->ExpToken["parent_id"];
                        $apppointment_log->cancel_reason = ($request->appointment_status == 5) ? $request->cancel_reason : 0;
                        $apppointment_log->log_date_time = date("Y-m-d H:i:s");
                        $apppointment_log->is_email = ($request->is_email == true) ? 1 : 0;
                        $apppointment_log->is_sms = ($request->is_email == false) ? 1 : 0;
                        $apppointment_log->created_by = $this->ExpToken["user_id"];
                        $apppointment_log->updated_by = $this->ExpToken["user_id"];
                        $apppointment_log->save();
                        if ($apppointment_log->id != 0) {
                            $apppointment = Appointments::find($value['appointment_id']);
                            if ($apppointment) {
                                $apppointment->appointment_status_id = 3;
                                $apppointment->updated_by = $this->ExpToken["user_id"];
                                $apppointment->save();
                            }
                        }
                    }



                    if ($value['which_one'] == "Membership") {
                        if ($table_data[$key]['prestatie_code'] == "") {
                            $table_data[$key]['prestatie_code'] = "-";
                            $table_data[$key]['service_treatment_date'] = "";
                        }
                        $insert_coupon_service = array();
                        $new_coupon_or_existing_coupon = 0;
                        if ($value['id'] == 0) {
                            $insert_data_service = $value['new_coupon_data'];
                            $new_coupon_or_existing_coupon = 1;
                            $insert_data_service['user_company_id'] = $this->ExpToken["parent_id"];
                            $insert_data_service['created_by'] = $this->ExpToken["user_id"];
                            $insert_data_service['updated_by'] = $this->ExpToken["user_id"];
                            $insert_data_service['where_from'] = 1; // 'cashdesk';

                            $coupon = Coupons::create($insert_data_service);

                            if ($coupon->id != 0) {
                                foreach ($insert_data_service['services'] as $key1 => $service_value) {

                                    $insert_coupon_service[$key1]['coupon_id'] = $coupon->id;
                                    $insert_coupon_service[$key1]['user_company_id'] = $this->ExpToken["parent_id"];
                                    $insert_coupon_service[$key1]['service_id'] = $key1;
                                    $insert_coupon_service[$key1]['no_of_services'] = $service_value['no_of_services'];
                                    $insert_coupon_service[$key1]['where_from'] = 1; // 'cashdesk';
                                }
                                CouponsServices::insert($insert_coupon_service);
                            }
                            $value['id'] = $coupon->id;
                            unset($value['new_coupon_data']);
                        }




                        $services_for_this_coupon = CouponsServices::with('coupon_detail')->where('coupon_id', $value['id'])->get()->toArray();

                        foreach ($services_for_this_coupon as $single_service) {

                            $last_customer_coupon_id = CustomerCoupons::select('id')->where('user_company_id', $this->ExpToken["parent_id"])->orderBy('id', 'DESC')->first();
                            if (isset($last_customer_coupon_id->id)) {
                                $lastCustomerCouponId = $last_customer_coupon_id->id;
                            } else {
                                $lastCustomerCouponId = 1;
                            }

                            $customer_coupons = new CustomerCoupons();
                            $customer_coupons->user_company_id = $this->ExpToken["parent_id"];
                            $customer_coupons->invoice_id = $invoice->id;
                            $customer_coupons->customer_id = isset($request->customer) ? $request->customer['id'] : 0;
                            $customer_coupons->service_id = $single_service["service_id"];
                            $customer_coupons->coupon_id = $single_service["coupon_id"];

                            $customer_coupons->cc_number = ('MM' . $lastCustomerCouponId . $single_service["coupon_id"] . $request->customer['id'] . $invoice->id . $single_service["service_id"]);

                            $customer_coupons->no_of_services = $single_service["no_of_services"];
                            $customer_coupons->where_from = $new_coupon_or_existing_coupon;
                            $customer_coupons->from_date  = isset($value['coupon_start_date']) ? $value['coupon_start_date'] : 0;
                            $customer_coupons->to_date = isset($value['coupon_end_date']) ? $value['coupon_end_date'] : 0;
                            $customer_coupons->created_by = $this->ExpToken["user_id"];
                            $customer_coupons->updated_by = $this->ExpToken["user_id"];
                            $result = $customer_coupons->save();


                            $customer = Customers::find($request->customer['id']);
                            $customer->membership_id = 'yes';
                            $customer->save();

                            // $responce = array(
                            //     'membership'=>1,
                            //     'data' => 'This Customer Has Now Membership'
                            // );

                            // return response()->json('get');

                        }
                    }



                    $table_data[$key]['user_company_id'] = $this->ExpToken["parent_id"];
                    $table_data[$key]['invoice_id'] = $invoice->id;
                    $table_data[$key]['customer_id'] = isset($request->customer) ? $request->customer['id'] : 0;
                    $table_data[$key]['appointment_id'] = $value['appointment_id'];
                    $table_data[$key]['worker_id'] = isset($value['worker_id']) ? $value['worker_id'] : 0;

                    $table_data[$key]['is_check'] = $value['is_check'];
                    $table_data[$key]['single_row_comment'] = isset($value['single_row_comment']) ? $value['single_row_comment'] : '';
                    if (isset($value['is_disabled'])) {
                        $table_data[$key]['is_disabled'] = $value['is_disabled'];
                    } else {
                        $table_data[$key]['is_disabled'] = 0;
                    }
                    $table_data[$key]['data_id'] = $value['id'];
                    $table_data[$key]['description'] = $value['name'];
                    $table_data[$key]['data_before_discount'] = json_encode($value['data_before_discount']);

                    $table_data[$key]['coupon_start_date'] = isset($value['coupon_start_date']) ? $value['coupon_start_date'] : 0;
                    $table_data[$key]['coupon_end_date'] = isset($value['coupon_end_date']) ? $value['coupon_end_date'] : 0;



                    if (isset($value['coupon']) && ($value['discount_apply'] == 3)) {


                        $coupon_id = $value['coupon']['id'];
                        $hmt_used = 0;
                        $table_invoice_coupons[$key]['user_company_id'] = $this->ExpToken["parent_id"];
                        $table_invoice_coupons[$key]['invoice_id'] = $invoice->id;
                        $table_invoice_coupons[$key]['customer_id'] = isset($request->customer) ? $request->customer['id'] : 0;
                        $table_invoice_coupons[$key]['customer_coupon_id'] = $value['coupon']['id'];
                        $table_invoice_coupons[$key]['hmt_used'] = $value['quantity'];
                        $table_invoice_coupons[$key]['created_by'] = $this->ExpToken["user_id"];
                        $table_invoice_coupons[$key]['updated_by'] = $this->ExpToken["user_id"];
                        $table_data[$key]['coupon_id'] = $coupon_id;
                    } else {
                        $table_data[$key]['coupon_id'] =  0;
                    }

                    if ($value['which_one'] == "product") {
                        $table_data[$key]['service_treatment_date'] = "";
                        unset($table_data[$key]['stock']);
                    }
                    if ($value['which_one'] == "coupon") {
                        unset($table_data[$key]['new_coupon_data']);
                    }
                    unset($table_data[$key]['display_sale_price']);
                    unset($table_data[$key]['coupon']);
                    unset($table_data[$key]['name']);
                    unset($table_data[$key]['id']);
                }
            }

            if (!isset($table_data[$key]['service_treatment_date'])) {
                $table_data[$key]['service_treatment_date'] = "";
            }
        }

        $insert_data = array_filter($table_data, function ($single_data) {
            if ($single_data["is_check"] == 1) {
                return true;
            }
        });

        $id_before_insert = InvoiceCoupons::select('id')->where('user_company_id', $this->ExpToken["parent_id"])->orderBy('id', 'DESC')->first();
        InvoiceData::insert($insert_data);
        InvoiceTax::insert($invoice_tax);

        if (isset($table_invoice_coupons)) {
            InvoiceCoupons::insert($table_invoice_coupons);
        }


        // code change by vijay gohil 17-08-2020
        if ($request->id == 0 && $id_before_insert) {
            $invoice_coupon = InvoiceCoupons::where('id', '>', $id_before_insert->id)->groupBy('customer_coupon_id')->get()->toArray();
            foreach ($invoice_coupon as $coupon) {
                $invoice_htm_used = InvoiceCoupons::where('customer_coupon_id', $coupon['customer_coupon_id'])->sum('hmt_used');
                $customer_coupon = CustomerCoupons::find($coupon['customer_coupon_id']);
                if ($customer_coupon->no_of_services == $invoice_htm_used) {
                    $customer_coupon->in_use = 1;
                } else {
                    $customer_coupon->in_use = 0;
                }
                $customer_coupon->hmt_used = isset($invoice_htm_used) ? $invoice_htm_used : 0;
                $customer_coupon->save();
            }
        }

        $new_invoice = Invoice::find($invoice->id);
        $new_invoice->is_received = 1;
        $new_invoice->is_total_amount_paid = 1;
        $new_invoice->save();


        if (isset($request->customer)) {
            $customer = Customers::find($request->customer['id']);
            $customer->updated_at = date('Y-m-d H:i:s');
            $customer->save();
        }
        $customer1 = Customers::find($request->customer['id']);
        $member = DB::select("select * from member where customer_id = " . $customer1->id);
        if ($customer1->membership_id == 1 && $request->total_invoice_amount == 0) {
            if ($member == NULL) {
                $member_services = new Member();
                $member_services->customer_id = $customer1->id;
                $member_services->coupon_id = 1;
                $member_services->service_remaining = 5;
                $member_services->invoice_id = $invoice->id;
                $member_services->gender_id = $request->id;
                $member_services->save();
            } else {
                DB::update("update member set service_remaining = service_remaining - 1 where customer_id = " . $customer1->id);
            }
        }




        //change status of deleted appointments from check out page
        /*$deleteServiceAppointments = $request->removedExistingServiceAppointmentIds;
        if(count($deleteServiceAppointments) > 0){
            $datas = Appointments::whereIn('id', $deleteServiceAppointments)->get();
            foreach ($datas as $d) {
                $d->appointment_status_id = 4;
                $d->save();
            }
        }*/




        return response()->json($invoice->id);
        // return response()->json($responce);

    }

    public function delete_invoice(Request $request)
    {
        $invoice_id = $request->id;
        $product_row = DB::table('invoice_data')->where('invoice_id', $invoice_id)->where('which_one', 'product')->get();
        $service_row = DB::table('invoice_data')->where('invoice_id', $invoice_id)->where('which_one', 'service')->get();
        foreach ($product_row as $value) {
            $product_id = $value->data_id;
            $product_quantity = $value->quantity;
            $product = Products::find($product_id);
            $product->stocke = $product->stocke + $product_quantity;
            $product->save();
        }
        DB::table('invoice_payment')->where('invoice_id', $invoice_id)->delete();
        DB::table('invoice_data')->where('invoice_id', $invoice_id)->delete();
        DB::table('invoice')->where('id', $invoice_id)->delete();
        //   Invoice::find($invoice_id)->delete();
        // $invoice_payment_id->delete();

        $response = array(
            "success" => true,
            "message" => "Invoice Is Deleted successfully.",
        );
        return response()->json($response);
    }

    public function delete_membership(Request $request)
    {
        $member_id = $request->id;
        $member = CustomerCoupons::find($member_id);
        $member->delete();
        $cust_id = $member->customer_id;
        $customer = Customers::find($cust_id);
        $customer->membership_id = 'no';
        $customer->save();
        $response = array(
            "success" => true,
            "message" => "Member delete successfully.",
        );
        return response()->json($response);
    }




    public function is_received_update(Request $request)
    {
        $new_invoice = Invoice::find($request->id);
        $new_invoice->is_received = ($request->is_received == 1) ? 0 : 1;
        $new_invoice->is_received_date = $request->is_received_date;
        if ($new_invoice->is_received == 0) {
            $new_invoice->is_received_date = null;
        }
        $new_invoice->save();

        $responce = array(
            'status' => true,
            'message' => "Invoice update successfully.",
            'invoice' => $new_invoice
        );
        return response()->json($responce);
    }


    public function single_invoice($invoice_id)
    {

        $invoice = Invoice::with([
            'invoice_tax.service_tax',
            'invoice_data',
            'customer',

        ])->where('user_company_id', $this->ExpToken["parent_id"])->where('id', $invoice_id)->first();

        $responce = array(
            'status' => true,
            'data' => $invoice
        );
        return response()->json($responce);
    }



    public function single_invoice_adjust($invoice_id)
    {

        $invoice = Invoice::with([
            'invoice_tax.service_tax',
            'invoice_data',
            'customer',
        ])->where('user_company_id', $this->ExpToken["parent_id"])->where('id', $invoice_id)->first();
        if (isset($invoice->customer->id)) {
            $available_coupon = CustomerCoupons::with('service', 'coupon_detail')->where('user_company_id', $this->ExpToken["parent_id"])->where('customer_id', $invoice->customer->id)->where('to_date', '>', date("Y-m-d"))->where('in_use', 0)->orderBy('id', 'desc')->get()->toArray();
        }
        if (isset($available_coupon)) {
            if (count($available_coupon) > 0) {
                $invoice->customer->coupon = $available_coupon;
            }
        }
        $responce = array(
            'status' => true,
            'data' => $invoice
        );
        return response()->json($responce);
    }


    public function create_invoice($invoice_id, $data_id)
    {

        $invoice = Invoice::with([
            'invoice_tax.service_tax',
            'invoice_data' => function ($query) use ($data_id) {
                if ($data_id != 0) {
                    $query->where('appointment_id', $data_id);
                }
            },
            'customer'
        ])->where('user_company_id', $this->ExpToken["parent_id"])->where('id', $invoice_id)->first();



        $customer = (empty($invoice->toArray()["customer"]) == 1) ? array() : $invoice->toArray()["customer"];
        $invioce_template = InvoiceTemplate::where('user_company_id', $this->ExpToken["parent_id"])->first();
        if (empty($invioce_template)) {
            $responce = array(
                'status' => false,
                'message' => "Template not available"
            );
            return response()->json($responce);
            exit();
        }

        $body = $invioce_template->tempate_description;
        $total_amount = 0;
        $total_gst = 0;
        $item_details = '';
        $item_details_middle = '';
        $item_details_middle1 = '';
        $item_details_middle2 = '';
        $item_details_top = '<table id="invoiceMdlTbl"  border="0" cellpadding="1" cellspacing="1" style="width: 100%;">
        <tbody>
            <tr>
                <td><strong style="padding:5px;font-size:12px;">Date</strong></td>
                <td><strong style="padding:5px;font-size:12px;">Item</strong></td>
                <td style="text-align:center;padding:5px;font-size: 12px;"><strong>Total</strong></td>
            </tr>';
        $item_details_down = '</tbody></table>';

        foreach ($invoice->invoice_data as $single_invoice) {
            $single_service_tax = Tax::find($single_invoice["tax_id"]);
            $appointment_data = Appointments::find($single_invoice["appointment_id"]);
            if ($single_invoice['discount_apply'] == 1) {
                $item_total_price = ($single_invoice['quantity'] * $single_invoice['calculation_sale_price'] - $single_invoice['discount_amount']);
            } else if ($single_invoice['discount_apply'] == 2) {
                $item_total_price = ($single_invoice['quantity'] * $single_invoice['calculation_sale_price'] - ($single_invoice['calculation_sale_price'] * $single_invoice['discount_percentage'] / 100));
            } else {
                $item_total_price = ($single_invoice['quantity'] * $single_invoice['calculation_sale_price']);
            }
            $prestatie_code = "-";
            if ($single_invoice['prestatie_code']) {
                $prestatie_code = $single_invoice['prestatie_code'];
            }

            $total_amount += $item_total_price;
            // $total_gst = $total_amount * 18 / 118;
            $single_row_comment = ($single_invoice['single_row_comment'] == null) ? '' : " (" . $single_invoice['single_row_comment'] . ")";
            //$item_details_middle .=  "<tr><td style='padding:5px;'>".date("d-m-Y",strtotime($single_invoice['service_treatment_date']))."</td><td style='padding:5px;'>".$prestatie_code."</td><td style='padding:5px;'>" . $single_invoice['description'] . $single_row_comment . "</td><td style='padding:5px;'>"  . $single_invoice['quantity'] . "</td><td style='padding:5px;'>₹ "  . $single_invoice['calculation_sale_price'] . "</td><td style='padding:5px;'>" . $single_invoice['discount_amount'] . "</td><td style='padding:5px;'>" . $single_service_tax->tax_value . "  % </td><td style='text-align:right;padding:5px;'>₹ " . $item_total_price . "</td></tr>";
            //echo  $single_invoice['discount_amount'];exit;
            $discount = "";
            if ($single_invoice['discount_amount'] > 0) {
                $discount = "(korting : " . $single_invoice['discount_amount'] . ")";
            }
            $treatment_date_display = "-";
            if ($single_invoice['service_treatment_date'] && $single_invoice['service_treatment_date'] != "0000-00-00 00:00:00") {
                $treatment_date_display = date("d-m-Y", strtotime($single_invoice['service_treatment_date']));
            }
            $display_name = '';
            if ($single_invoice['display_name'] == '-') {
                $display_name = $single_invoice['description'];
            } else {
                $display_name = $single_invoice['display_name'];
            }
            //<td style='padding:5px;'>" . $single_invoice['discount_amount'] . "</td>
            $item_details_middle .=  "
                <tr>
                    <td style='padding:5px;font-size:10px;font-weight:bold;'>" . $treatment_date_display . "</td>
                    <td style='padding:5px;font-size:10px;font-weight:bold;'>" . $single_invoice['quantity'] . " x " . $display_name . $single_row_comment . " " . $discount . "</td>
                    <td style='text-align: right;font-size:10px;font-weight:bold;padding:5px;'>₹" . $item_total_price . "</td>
                </tr>";
            if ($data_id != 0) {

                $single_tax_amount = $single_invoice['calculation_sale_price'] - ($single_invoice['calculation_sale_price'] / (1 + ($single_service_tax->tax_value / 100)));

                $single_tax_name = $single_service_tax->name;

                $single_tax_value = $single_service_tax->tax_value;

                $single_tax_total = number_format(($single_invoice['quantity'] * $single_tax_amount), 2);



                // $item_details_middle .=  "<tr><td></td><td style='text-align: right;'>" . $single_service_tax->name . " " . $single_service_tax->tax_value .   " % ::  ₹" . number_format(($single_invoice['quantity'] * $single_tax_amount), 2)  . "</td></tr>";
            }
            if ($data_id != 0) {
                $service_comment =  "<tr><td colspan='2' style='text-align:left;padding:5px'> <strong>Service Comment</strong> :: " . $appointment_data->comments  . "</td></tr>";
            }
        }

        if ($invoice->comment != null) {
            $item_details_middle .=  "<tr><td colspan='2' style='text-align:left;padding:5px'> <strong>Invoice Comment</strong> :: " . $invoice->comment  . "</td></tr>";
        }
        $item_details_middle .=  isset($service_comment) ? $service_comment : '';

        $item_details_top1 = '<br><table id="tblTax1" border="0" cellpadding="1" cellspacing="1" style="width: 30%;float: right; clear: both;margin-bottom: 10px; border-color:#ccc;" >
        <tbody>';
        $item_details_down1 = '</tbody></table>';
        if ($data_id == 0) {
            foreach ($invoice->invoice_tax as $single_tax) {
                if ($single_tax["tax_amount"] > 0) {

                    $item_details_middle1 .=  "<tr><td style='padding:5px;'><span style='padding:2px;'>" . $single_tax["service_tax"]["name"] . " " . $single_tax['tax_value'] .   " %</span></td><td style='text-align: right;padding:2px;'>₹" . $single_tax["tax_amount"]  . "</td></tr>";
                }
            }
        } else {
            $item_details_middle1 .=  "<tr><td ><span style='padding:2px;'>" . $single_tax_name . " " . $single_tax_value .   " %</span></td><td style='text-align: right;padding:2px;'>₹" . $single_tax_total  . "</td></tr>";
        }
        if ($data_id == 0) {
            $item_details_top2 = '<br><br><div><table id="tblTax1" border="0" cellpadding="1" cellspacing="1" style="width: 30%;float: right; clear: both;margin-bottom: 10px; border-color:#ccc;">
        <tbody>
            <tr>
                <td><strong style="padding:5px;font-size:12px;">Pay Method</strong></td>
                <td style="text-align:right;padding:5px;font-size: 12px;"><strong>Amount</strong></td>
            </tr>';
            $item_details_down2 = '</tbody></table>';

            $item_details_top4 = '<table id="tblTax1" border="0" cellpadding="1" cellspacing="1" style="width: 30%;float: left;margin-bottom: 10px; border-color:#ccc;">
            <tbody>
                <tr>
                    <td><strong style="padding:5px;font-size:12px;">BANK DETAILS</strong></td>
                </tr>
                <tr>
                    <td><strong style="padding:5px;font-size:12px;">BHAKTI PATEL MAKEUP STUDIO SALON</strong></td>
                </tr>
                <tr>
                    <td><strong style="padding:5px;font-size:12px;">HDFC0005198</strong></td>
                </tr>
                <tr>
                    <td><strong style="padding:5px;font-size:12px;">ACCOUNT NO-50200063879302 </strong></td>
                </tr>
                <tr>
                    <td><strong style="padding:5px;font-size:12px;">Branch: NEW GOTA </strong></td>
                </tr>
                <tr>
                    <td><strong style="padding:5px;font-size:12px;">Account Type: CURRENT </strong></td>
                </tr>

                ';
            $item_details_down4 = '</tbody></table></div>';


            if ($invoice->is_total_amount_paid == 1) {
                $paymentList = Paymentmethod::leftJoin('invoice_payment', function ($join) {
                    $join->on('invoice_payment.payment_method', '=', 'payment_method.id');
                })->select('payment_method.id', DB::Raw('IFNULL(SUM(invoice_payment.amount),"0.00") as amount'))->where('invoice_payment.user_company_id', $this->ExpToken["parent_id"])->where('invoice_payment.invoice_id', $invoice_id)->groupBy('invoice_payment.payment_method')->get()->toarray();
                foreach ($paymentList as $payment_method) {
                    if ($payment_method["id"] == 1) {
                        $payment_name = 'In cash';
                    } else if ($payment_method["id"] == 2) {
                        $payment_name = 'Pin';
                    } else if ($payment_method["id"] == 3) {
                        $payment_name = 'Credit card';
                    } else if ($payment_method["id"] == 4) {
                        $payment_name = 'Invoice';
                    } else if ($payment_method["id"] == 5) {
                        $payment_name = 'Gift certificate';
                    } else if ($payment_method["id"] == 6) {
                        $payment_name = 'Coupon Card';
                    }
                    if ($data_id == 0) {

                        if ($payment_method["amount"] > 0) {
                            $item_details_middle2 .=  "<tr><td style='padding:5px;'><span style='padding:2px;font-size:12px;'>" . $payment_name .   "</span></td><td style='text-align: right;font-size:12px;padding:2px;'>₹" . $payment_method["amount"]  . "</td></tr>";
                        }
                    }
                }
            } else {
                $paymentList = array();
            }
        } else {
            $item_details_top2 = '';
            $item_details_down2 = '';
            $item_details_middle2 = '';
            $paymentList = array();
        }
        $cgst_amount = $total_amount * 9 / 100;
        $cgst_amount = number_format($cgst_amount, 2);
        $sgst_amount = $total_amount * 9 / 100;
        $sgst_amount = number_format($sgst_amount, 2);
        $total_amount = number_format(floatval($total_amount), 2);
        // $grand_total = round($total_amount + $cgst_amount + $sgst_amount, 2);
        $grand_total = round($total_amount + $cgst_amount + $sgst_amount, 2);

        $item_details_top3 = '<br><table id="tblTax1" border="0" cellpadding="1" cellspacing="1" style="width: 30%;float: right; clear: both;margin-bottom: 10px; border-color:#ccc;">
        <tbody>
            <tr>
                <td><strong style="padding:5px;font-size:12px;">Sub Total</strong></td>
                <td style="text-align:right;padding:5px;font-size: 12px;"><strong>₹' . $total_amount . '</strong></td>
            </tr>
            <tr>
                <td><strong style="padding:5px;font-size:12px;">Add: CGST @9%</strong></td>
                <td style="text-align:right;padding:5px;font-size: 12px;"><strong>₹' . $cgst_amount . '</strong></td>
            </tr>
            <tr>
                <td><strong style="padding:5px;font-size:12px;">Add: SGST @9%</strong></td>
                <td style="text-align:right;padding:5px;font-size: 12px;"><strong>₹' . $sgst_amount . '</strong></td>
            </tr>
            <tr>
                <td><strong style="padding:5px;font-size:12px;">Grand Total </strong></td>
                <td style="text-align:right;padding:5px;font-size: 12px;"><strong>₹' .  number_format($grand_total, 2)   . '</strong></td>
            </tr>

            ';
        $item_details_down3 = '</tbody></table>';



        $item_details = $item_details_top . $item_details_middle . $item_details_down . $item_details_top1 . $item_details_middle1 . $item_details_down1 .  $item_details_top3 . $item_details_down3 . $item_details_top2 . $item_details_middle2 . $item_details_down2 . $item_details_top4 . $item_details_down4;


        $companyData     = Common::mailData('company_details', ['user_company_id' => $this->ExpToken["parent_id"]]);
        $company_data    = $companyData[0];
        $imageUrl        = Config::get('constants.imageUrl');
        $company_logo    =  empty($companyData) ? '' : 'assets/images/' . $companyData[0]->company_logo;
        $company_name    = empty($companyData) ? '' : $company_data->company_name;
        $company_number  = empty($companyData) ? '' : $company_data->mobile;
        $company_email   = empty($companyData) ? '' : $company_data->email;
        $company_address = empty($companyData) ? '' : $company_data->address;
        $worker_details   =  empty($invoice->to_pay_id) ? [] : Users::find($invoice->to_pay_id);
        $certificatenumber =   empty($worker_details) ? '' :
            implode("<br>", explode(",", $worker_details->certificate_number));
        $worker_name =   empty($worker_details) ? '' : $worker_details->name;
        $worker_email =   empty($worker_details) ? '' : $worker_details->email;
        $customer_details =  empty($invoice->customer_id) ? [] : Customers::find($invoice->customer_id);
        $customer_firstname = empty($customer_details) ? '' : $customer_details->firstname;
        $customer_lastname = empty($customer_details) ? '' : $customer_details->lastname;
        $customer_address = empty($customer_details) ? '' : $customer_details->postal_code . "," . $customer_details->address . "<br>" . $customer_details->city;
        $customer_dob = empty($customer_details) ? '' : $customer_details->dob;
        $customer_gender = empty($customer_details) ? '' : $customer_details->gender;
        $customer_mobile = empty($customer_details) ? '' : $customer_details->mobile;

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

            '[[customer-firstname]]' => ($invoice->customer_id == 0) ? 'Walk' : $customer_firstname,
            '[[customer-lastname]]' => ($invoice->customer_id == 0) ? 'In Customer' : $customer_lastname,
            '[[customer-address]]' => $customer_address,
            '[[customer-birthdate]]' => ($invoice->customer_id == 0) ? '--:--:--' : $customer_dob,
            '[[customer-number]]' => $customer_mobile,
            '[[gender]]' => $customer_gender,


            '[[invoice-number]]' => $invoice->final_invoice_no,
            '[[invoice-date]]' =>  date('d/m/Y', strtotime($invoice->invoice_date)),
            '[[invoice-amount]]' => $total_amount,
            '[[item-details]]' => $item_details,
            '[[invoice-treatment-date]]' => date('d/m/Y', strtotime($invoice->treatment_date))
        );

        $body = Common::replaceMailData($replaceParams, $body);
        $responce = array(
            'status' => true,
            'message' => "Template not available",
            'body' => $body,
            'customer' => $customer,
            'invoice' => $invoice,
            'payment_list' => $paymentList
        );
        return response()->json($responce);
    }



    public function save_invoice_email(Request $request)
    {

        $data = $this->create_invoice($request->invoice_id, 0);
        $upload_path = str_replace("api", "uploads/pdf/", base_path());
        $pdf_name = date('mdYHis') . uniqid() . 'invoice.pdf';
        $template_body = $data->original["body"];
        if ($request->send_as_pdf == 1) {

            PDF::loadHTML($data->original["body"])->setPaper('a4', 'landscape')->setWarnings(false)->save($upload_path . $pdf_name);
        }
        $sendmail = new SendMail();
        $sendmail->invoice_id = $request->invoice_id;
        $sendmail->sub = "Invoice";
        $sendmail->to_email = $request->customer_email;
        $sendmail->attachment = ($request->send_as_pdf == 1) ? $pdf_name : '';
        $sendmail->bodyData = $template_body;
        $sendmail->user_company_id = $this->ExpToken["parent_id"];
        $sendmail->save();

        $responce = array(
            'status' => true,
            'message' => "Email sen successfully.",
        );
        return response()->json($responce);
    }
}
