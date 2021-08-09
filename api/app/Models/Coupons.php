<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use DB;


class Coupons extends Model
{
    
    protected $fillable = ['id' ,'user_company_id', 'description','sale_price','tax_id','services','validity','where_from','created_by','updated_by', 'created_at', 'updated_at',];

    protected $casts = [
        'services' => 'array',
    ];
  
    public static function coupon_list($params = array()) {
        $where='';
	    $where="where coupons.id !='' AND user_company_id=".$params['user_company_id']." AND where_from=0";
        if (isset($params['search']) && !empty($params['search'])) {
             $where .=" and (coupons.description like '%".$params['search']."%' or coupons.sale_price like '%".$params['search']."%' or coupons.created_at like '%".$params['search']."%' or users.email like '%".$params['search']."%') ";
        }

        return $invoicesQry = DB::select( DB::raw("SELECT coupons.*, users.email FROM `coupons` LEFT JOIN users on coupons.created_by = users.id ".$where." order by {$params['sort_by']} {$params['sort_order']} limit {$params['start']},{$params['limit']} "));
       
    }


    public static function coupon_listCount($params = array()) {
        $where='';
        $where="where coupons.id !='' AND user_company_id=".$params['user_company_id']." AND where_from=0";
        if (isset($params['search']) && !empty($params['search'])) {
             $where .=" and (coupons.description like '%".$params['search']."%' or coupons.sale_price like '%".$params['search']."%' or coupons.created_at like '%".$params['search']."%' or users.email like '%".$params['search']."%') ";
        }
        
        $totalcountQry = DB::select( DB::raw("SELECT count(coupons.id) as totalRecord FROM `coupons` LEFT JOIN users on coupons.created_by = users.id ".$where));
	    return $totalcount = $totalcountQry[0]->totalRecord;
    }

    
}
