<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use DB;


class Smstemplate extends Model
{
    protected $fillable = ['id', 'user_company_id','type', 'name', 'title','description','mail_content','is_active','send_time','created_at','updated_at','created_by','updated_by'];
   
    protected $table = "sms_template";

    public static function sms_list($params = array()) {
        
        $where='';
        $where="where id !='' AND user_company_id=".$params['user_company_id'];
            
        if (isset($params['search']) && !empty($params['search'])) {
            
            $where .=" and (name like '%".$params['search']."%' or typename like '%".$params['search']."%')";
        }
        
        return $invoicesQry = DB::select( DB::raw("SELECT q. * from (SELECT *, (CASE  WHEN type = '1' THEN 'Reminder' WHEN type = '2' THEN 'Confirmation' WHEN type = '3' THEN 'Change' WHEN type = '4' THEN 'Cancellation'  WHEN type = '5' THEN 'No-Show cancellation' WHEN type = '6' THEN 'Cancellation not on time' WHEN type = '7' THEN 'Invoice Reminder'  WHEN type = '8' THEN 'Invoice' WHEN type = '9' THEN 'Intake form' END) as typename  from  sms_template) as q ".$where." order by {$params['sort_by']} {$params['sort_order']} limit {$params['start']},{$params['limit']} "));
       
    }


    public static function sms_listCount($params = array()) {
        
        $where='';
        $where="where id !='' AND user_company_id=".$params['user_company_id'];
        if (isset($params['search']) && !empty($params['search'])) {
            $where .=" and (name like '%".$params['search']."%' or typename like '%".$params['search']."%')";
        }
        
        $totalcountQry = DB::select( DB::raw("SELECT count(id) as totalRecord from (select *,(CASE  WHEN type = '1' THEN 'Reminder' WHEN type = '2' THEN 'Confirmation' WHEN type = '3' THEN 'Change' WHEN type = '4' THEN 'Cancellation'  WHEN type = '5' THEN 'No-Show cancellation' WHEN type = '6' THEN 'Cancellation not on time' WHEN type = '7' THEN 'Invoice Reminder'  WHEN type = '8' THEN 'Invoice' WHEN type = '9' THEN 'Intake form' END) as typename from sms_template) as q  ".$where));
        
        return $totalcount = $totalcountQry[0]->totalRecord;
    }

  


}
