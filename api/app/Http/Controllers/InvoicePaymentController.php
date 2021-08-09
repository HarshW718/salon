<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\InvoicePayment;
use App\Models\Invoice;
use App\Models\GiftUsed;
use App\Models\Appointments;
use App\Models\AppointmentLog;
use App\Models\CashCounter;
use App\Http\Controllers\Middleweb_Controller;
use App\Models\InvoiceData;

class InvoicePaymentController extends Middleweb_Controller
{
    public function store(Request $request)
    {
        $payment_table = $request->table_data;
        $gift_used = $request->gift_received;
        $paid_amount = 0;
        $is_any_nvoice_payment = 0;
        foreach ($payment_table as $key => $value) {

            if ($value["amount"] == 0) {
                    $method = 1;
            }else{
                if ($value["method"] == 'cash') {
                    $method = 1;

                    $cashcounter = CashCounter::where('user_company_id',$this->ExpToken["parent_id"])->orderBy('id', 'desc')->first();
                    if(empty($cashcounter)){
                        $current_cash = 0;
                    }else{
                        $current_cash = $cashcounter->current_cash;
                    }

                    $for_invoice_no = Invoice::where('id', $request->invoice_id)->get()->first();
                    $cash_counter = new CashCounter();
                    $cash_counter->user_company_id = $this->ExpToken["parent_id"];
                    $cash_counter->invoice_no = $for_invoice_no->final_invoice_no;
                    $cash_counter->status = 1;
                    $cash_counter->amount = $value["amount"];
                    $cash_counter->current_cash = $current_cash + $value["amount"];
                    $cash_counter->payment_date = date('Y-m-d H:i:s');
                    $cash_counter->note = "Cash from invoice generation";
                    $cash_counter->created_by = $this->ExpToken["user_id"];
                    $cash_counter->updated_by = $this->ExpToken["user_id"];
                    $cash_counter->created_at = date('Y-m-d H:i:s');
                    $cash_counter->updated_at = date('Y-m-d H:i:s');
                    $cash_counter->save();

                } else if ($value["method"] == 'pin') {
                    $method = 2;
                } else if ($value["method"] == 'credit_card') {
                    $method = 3;
                } else if ($value["method"] == 'invoice') {
                    $method = 4;
                } else if ($value["method"] == 'gift_certificate') {
                    $method = 5;
                } else if ($value["method"] == 'coupon') {
                    $method = 6;
                } else if ($value["method"] == 'paypal') {
                    $method = 7;
                }
            }
            $save_payment[$key]['user_company_id'] = $this->ExpToken["parent_id"];
            $save_payment[$key]['invoice_id'] = $request->invoice_id;
            $save_payment[$key]['payment_method'] = $method;
            $save_payment[$key]['amount'] = $value["amount"];
            $save_payment[$key]['payment_date'] = date('Y-m-d h:i');
            $save_payment[$key]['created_by'] = $this->ExpToken["parent_id"];



        }
        if (count($gift_used) > 0) {

            foreach ($gift_used as $key => $value) {
                $save_used_gift[$key]['user_company_id'] = $this->ExpToken["parent_id"];
                $save_used_gift[$key]['invoice_id'] = $request->invoice_id;
                $save_used_gift[$key]['gift_id'] = $value["id"];
                $invoice_payment_gift = InvoiceData::find($value["id"]);
                $invoice_payment_gift->gift_used = 1;
                $invoice_payment_gift->save();

            }

            GiftUsed::insert($save_used_gift);
        }
        $invoice_payment = InvoicePayment::where('invoice_id', $request->invoice_id)->delete();
        $invoice_payment = InvoicePayment::insert($save_payment);
        $payment_happend = InvoicePayment::where('invoice_id', $request->invoice_id)->get();
        foreach ($payment_happend as $key => $value) {
            $paid_amount = ($paid_amount + $value["amount"]);
            if ($value["payment_method"] == 4) {
                $is_any_nvoice_payment = 1;
            }
        }

        $invoice_after_payment = Invoice::where('id', $request->invoice_id)->get()->first();

        if ($invoice_after_payment->total_invoice_amount == $paid_amount) {
            $new_invoice = Invoice::find($request->invoice_id);
            if ($is_any_nvoice_payment == 1) {
                $new_invoice->is_received = 0;
            } else {
                $new_invoice->is_received = 1;
            }
            $new_invoice->is_total_amount_paid = 1;
            $new_invoice->save();
        }
        if ($invoice_payment) {
            $invoice_data = InvoiceData::where('user_company_id', $this->ExpToken["parent_id"])->where('invoice_id', $request->invoice_id)->get();
            foreach ($invoice_data as $single_invoice) {
                if ($single_invoice->appointment_id != 0) {
                    $appointment = Appointments::find($single_invoice->appointment_id);
                    $appointment->appointment_status_id = 4;
                    $appointment->save();
                    $check_appointment = AppointmentLog::where('appointment_id', $single_invoice->appointment_id)->where('appointment_status', 4)->get()->toArray();
                    if (count($check_appointment) == 0) {
                    $apppointment_log = new AppointmentLog();
                    $apppointment_log->appointment_id = $appointment->id;
                    $apppointment_log->appointment_status = 4;
                    $apppointment_log->log_date_time = date("Y-m-d H:i:s");
                    $apppointment_log->is_email = ($request->is_email == true) ? 1 : 0;
                    $apppointment_log->is_sms = ($request->is_email == false) ? 1 : 0;
                    $apppointment_log->user_company_id = $this->ExpToken["parent_id"];
                    $apppointment_log->created_by = $this->ExpToken["user_id"];
                    $apppointment_log->updated_by = $this->ExpToken["user_id"];
                    $apppointment_log->save();
                    }

                }
            }
        }

        $response = array(
            "success" => true,
            "message" => "Done",
        );
        return response()->json($response);
    }

    public function get_payment_by_invoice_id($invoice_id)
    {
        $invoice_payment = InvoicePayment::where('invoice_id',$invoice_id)->get();
        $response = array(
            "success" => true,
            "data" => $invoice_payment,
        );
        return response()->json($response);
    }

}
