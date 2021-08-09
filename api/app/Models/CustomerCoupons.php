<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use DB;


class CustomerCoupons extends Model
{
    
    protected $table = "customer_coupons";
    protected $fillable = ['id' ,'user_company_id', 'customer_id','service_id', 'coupon_id','no_of_services','hmt_used','from_date','to_date','in_use','created_by','updated_by', 'created_at', 'updated_at'];

    public function service()
    {
        return $this->hasOne('App\Models\Services', 'id','service_id');
    }
    public function coupon_detail()
    {
        return $this->hasOne('App\Models\Coupons', 'id','coupon_id');
    }

    public function customer()
    {
        return $this->hasOne('App\Models\Customers', 'id','customer_id');
    }
   
    public static function use_coupon_list($params = array()) {
        $where='';
        
        if($params['valid_or_invalid'] == 'valid'){
            $where="WHERE c_c.to_date > CURRENT_DATE AND c_c.in_use = 0 AND c_c.where_from = 0 AND c_c.user_company_id=".$params['user_company_id'];
        }else if ($params['valid_or_invalid'] == 'invalid'){
            $where="WHERE c_c.to_date < CURRENT_DATE AND c_c.in_use = 1 AND c_c.where_from = 0 AND c_c.user_company_id=".$params['user_company_id'];
        }
       
       
       
       
        if (isset($params['search']) && !empty($params['search'])) {
             $where .=" and (coupons.description like '%".$params['search']."%' or c_c.cc_number like '%".$params['search']."%' or CONCAT(customers.firstname,' ',customers.lastname) like '%".$params['search']."%' or DATE_FORMAT(c_c.created_at,'%d-%m-%Y') like '%".$params['search']."%' or DATE_FORMAT(c_c.to_date,'%d-%m-%Y') like '%".$params['search']."%' or DATE_FORMAT(c_c.from_date,'%d-%m-%Y') like '%".$params['search']."%') ";
        }
        
        return $invoicesQry = DB::select( DB::raw("SELECT c_c.id,c_c.created_at,coupons.description,CONCAT(customers.firstname,' ',customers.lastname) as full_name,c_c.cc_number,c_c.from_date,c_c.to_date,c_c.in_use,c_c.where_from,c_c.hmt_used,c_c.no_of_services FROM customer_coupons as c_c
        LEFT JOIN coupons ON coupons.id = c_c.coupon_id
        LEFT JOIN customers ON customers.id = c_c.customer_id ".$where." ORDER BY {$params['sort_by']} {$params['sort_order']} limit {$params['start']},{$params['limit']} "));
       
    }


    public static function use_coupon_listCount($params = array()) {
        $where='';
        if($params['valid_or_invalid'] == 'valid'){
            $where="WHERE c_c.to_date > CURRENT_DATE AND c_c.in_use = 0 AND c_c.where_from = 0 AND c_c.user_company_id=".$params['user_company_id'];
        }else if ($params['valid_or_invalid'] == 'invalid'){
            $where="WHERE c_c.to_date < CURRENT_DATE AND c_c.in_use = 1 AND c_c.where_from = 0 AND c_c.user_company_id=".$params['user_company_id'];
        }
        if (isset($params['search']) && !empty($params['search'])) {
            $where .=" and (coupons.description like '%".$params['search']."%' or c_c.cc_number like '%".$params['search']."%' or CONCAT(customers.firstname,' ',customers.lastname) like '%".$params['search']."%' or DATE_FORMAT(c_c.created_at,'%d-%m-%Y') like '%".$params['search']."%' or DATE_FORMAT(c_c.to_date,'%d-%m-%Y') like '%".$params['search']."%' or DATE_FORMAT(c_c.from_date,'%d-%m-%Y') like '%".$params['search']."%') ";
       }
        
        $totalcountQry = DB::select( DB::raw("SELECT count(c_c.id) as totalRecord FROM customer_coupons as c_c
        LEFT JOIN coupons ON coupons.id = c_c.coupon_id
        LEFT JOIN customers ON customers.id = c_c.customer_id ".$where));
       
       
        return $totalcount = $totalcountQry[0]->totalRecord;
    }

    
}
