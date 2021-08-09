<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use DB;


class Customers extends Model
{
     
    protected $fillable = ['id','user_company_id', 'firstname', 'lastname', 'gender', 'mobile', 'landline','email', 'postal_code', 'house_no','house_letter', 'address', 'city','dob','care_account_no','comments','is_active', 'created_by','updated_by','created_at','updated_at' ];
   
    
    public static function customer_list($params = array()) {

        $where='';
        if($params['is_active'] != 1){
            $where="where id !='' and is_active=0 AND user_company_id=".$params['user_company_id'];
        }else{
            $where="where id !='' and is_active=1 AND user_company_id=".$params['user_company_id'];
        }
        
        $query = Customers::query();
        if (isset($params['search']) && !empty($params['search'])) {
             $where .=" and (firstname like '%".$params['search']."%' or lastname like '%".$params['search']."%' or gender like '%".$params['search']."%' or mobile like '%".$params['search']."%' or email like '%".$params['search']."%' or dob like '%".$params['search']."%') or DATE_FORMAT(dob,'%b %d %Y') like '%".$params['search']."%' or DATE_FORMAT(created_at,'%b %d %Y') like '%".$params['search']."%' or DATE_FORMAT(updated_at,'%b %d %Y') like '%".$params['search']."%'";
        
            }
        return $invoicesQry = DB::select( DB::raw("SELECT * from customers ".$where." order by {$params['sort_by']} {$params['sort_order']} limit {$params['start']},{$params['limit']} "));
       
    }
    public static function customer_listCount($params = array()) {
    $where='';
    if($params['is_active'] != 1){
        $where="where id !='' and is_active=0 AND user_company_id=".$params['user_company_id'];
    }else{
        $where="where id !='' and is_active=1 AND user_company_id=".$params['user_company_id'];
    }
        if (isset($params['search']) && !empty($params['search'])) {
            $where .=" and (firstname like '%".$params['search']."%' or lastname like '%".$params['search']."%' or gender like '%".$params['search']."%' or mobile like '%".$params['search']."%' or email like '%".$params['search']."%' or dob like '%".$params['search']."%') ";
        }
    $totalcountQry = DB::select( DB::raw("SELECT count(id) as totalRecord from customers ".$where.""));
    return $totalcount = $totalcountQry[0]->totalRecord;
    
    }


    public static function customer_list_for_appointment($params = array()) {
       
        $where='';
        if($params['is_active'] != 1){
            $where="where id !='' and is_active=0 AND user_company_id=".$params['user_company_id'];
        }else{
            $where="where id !='' and is_active=1 AND user_company_id=".$params['user_company_id'];
        }
        
        $query = Customers::query();
        if (isset($params['search']) && !empty($params['search'])) {
            
             $where .=" and (firstname like '%".$params['search']."%' or lastname like '%".$params['search']."%' or mobile like '%".$params['search']."%' or email like '%".$params['search']."%' or postal_code like '%".$params['search']."%' or DATE_FORMAT(dob,'%d-%m-%Y') like '%".$params['search']."%') ";
        
            }

        return $invoicesQry = DB::select( DB::raw("SELECT *, CONCAT(`firstname`,' ',`lastname`) as full_name,mobile,postal_code,DATE_FORMAT(dob,'%d-%m-%Y') as birthday from customers ".$where.""));
       
    }
   
}
