<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use DB;


class CashCounter extends Model
{
    protected $fillable = ['id','user_company_id', 'status', 'amount','current_cash','payment_date','note', 'created_by','updated_by','created_at', 'updated_at' ];
   
    protected $table = "cash_counter";




    public static function cash_counter_list($params = array()) {

        $date = strtotime($params['current_date']);
        $current_date = date('Y-m-d', $date);

        $where='';
        $where_date = '';
       
        if(isset($params["start_date"]) && $params["start_date"] != '' && isset($params["end_date"]) && $params["end_date"] != ''){
            $where_date = " AND DATE_FORMAT(payment_date,'%Y-%m-%d') >='".$params["start_date"]."' AND DATE_FORMAT(payment_date,'%Y-%m-%d') <='".$params["end_date"]."'";
        }
        
       
        $where="where user_company_id=".$params['user_company_id'].$where_date;
       

        if (isset($params['search']) && !empty($params['search'])) {
             $where .=" and (note like '%".$params['search']."%') or (invoice_no like '%".$params['search']."%') or (current_cash like '%".$params['search']."%') or (amount like '%".$params['search']."%') or DATE_FORMAT(payment_date,'%d-%m-%Y') like '%".$params['search']."%'"; 
        }

        return $invoicesQry = DB::select( DB::raw("SELECT * FROM `cash_counter` ".$where." order by id desc limit {$params['start']},{$params['limit']} "));
       
    }


    public static function cash_counter_listCount($params = array()) {
        $date = strtotime($params['current_date']);
        $current_date = date('Y-m-d', $date);
        $where='';
        $where_date = '';
       
        if(isset($params["start_date"]) && $params["start_date"] != '' && isset($params["end_date"]) && $params["end_date"] != ''){
            $where_date = " AND DATE_FORMAT(payment_date,'%Y-%m-%d') >='".$params["start_date"]."' AND DATE_FORMAT(payment_date,'%Y-%m-%d') <='".$params["end_date"]."'";
        }
        
        $where="where user_company_id=".$params['user_company_id'].$where_date;

        if (isset($params['search']) && !empty($params['search'])) {
            $where .=" and (note like '%".$params['search']."%') or (invoice_no like '%".$params['search']."%') or (current_cash like '%".$params['search']."%') or (amount like '%".$params['search']."%') or DATE_FORMAT(payment_date,'%d-%m-%Y') like '%".$params['search']."%'"; 
       }
        
        $totalcountQry = DB::select(DB::raw("SELECT count(id) as totalRecord FROM `cash_counter` ".$where));
	    return $totalcount = $totalcountQry[0]->totalRecord;
    }
    

}
