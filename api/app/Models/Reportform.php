<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use DB;


class Reportform extends Model
{
    protected $fillable = ['id', 'user_company_id','title', 'fileds', 'created_at','updated_at','created_by','updated_by'];
   
    protected $table = "report_form";

    public static function dtFormList($params = array()) {
        
        $where='';
        $where="where id !='' AND user_company_id=".$params['user_company_id'];
            
        if (isset($params['search']) && !empty($params['search'])) {
            
            if(strtolower($params['search']) == 'consent form'){
                $type = 1;
             }else if(strtolower($params['search']) == 'treatment form'){
                $type = 2;
             }else if(strtolower($params['search']) == 'medical form'){
                $type = 3;
             }else{
                $type = $params['search'];
             }

            $where .=" and (title like '%".$params['search']."%' or type like '%".$type."%')";
        }
        
        return $invoicesQry = DB::select( DB::raw("SELECT q. * from (SELECT *,(CASE  WHEN type = '1' THEN 'Reminder' WHEN type = '2' THEN 'Confirmation' WHEN type = '3' THEN 'Change' END) as typename  from  report_form) as q ".$where." order by {$params['sort_by']} {$params['sort_order']} limit {$params['start']},{$params['limit']} "));
       
    }


    public static function dtFormListCount($params = array()) {
        
        $where='';
        $where="where id !='' AND user_company_id=".$params['user_company_id'];
        if (isset($params['search']) && !empty($params['search'])) {
            
            if(strtolower($params['search']) == 'consent form'){
                $type = 1;
             }else if(strtolower($params['search']) == 'treatment form'){
                $type = 2;
             }else if(strtolower($params['search']) == 'medical form'){
                $type = 3;
             }else{
                $type = $params['search'];
             }

            $where .=" and (title like '%".$params['search']."%' or type like '%".$type."%')";
        }
        
        $totalcountQry = DB::select( DB::raw("SELECT count(id) as totalRecord from (select *,(CASE  WHEN type = '1' THEN 'Consent Form' WHEN type = '2' THEN 'Treatment Form' WHEN type = '3' THEN 'Medical Form' END) as typename from report_form) as q  ".$where));
        
        return $totalcount = $totalcountQry[0]->totalRecord;
    }

    public static function dtFormSubList($params = array()) {
        
        $where='';
        $where="where id !='' AND user_company_id=".$params['user_company_id'];
            
        if (isset($params['search']) && !empty($params['search'])) {
            
            $where .=" and (title like '%".$params['search']."%' or title_value like '%".$params['search']."%')";
        }
        
        return $invoicesQry = DB::select( DB::raw("SELECT q. * from (SELECT *  from  form_subs) as q ".$where." order by {$params['sort_by']} {$params['sort_order']} limit {$params['start']},{$params['limit']} "));
       
    }


    public static function dtFormSubListCount($params = array()) {
        
        $where='';
        $where="where id !='' AND user_company_id=".$params['user_company_id'];

        if (isset($params['search']) && !empty($params['search'])) {
            
            $where .=" and (title like '%".$params['search']."%' or title_value like '%".$params['search']."%')";
        }
        
        $totalcountQry = DB::select( DB::raw("SELECT count(id) as totalRecord from (select * from form_subs) as q  ".$where));
        
        return $totalcount = $totalcountQry[0]->totalRecord;
    }

  


}
