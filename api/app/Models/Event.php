<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use DB;

class Event extends Model {
    
    public static function event_list($params = array()) {
	$where='';
	$where="where id !=''";
        if (isset($params['search']) && !empty($params['search'])) {
	    $where .=" and (event_name like '%".$params['search']."%' or new_event_start_date like '%".$params['search']."%' or new_event_end_date like '%".$params['search']."%')";
	}
        $totalcountQry = DB::select( DB::raw("SELECT count(q.id) as totalRecord from (select * from services_categories ) as q ".$where));
        $totalcount = $totalcountQry[0]->totalRecord;
        $invoicesQry = DB::select( DB::raw("SELECT q.* from (select * from services_categories ) as q ".$where." order by {$params['sort_by']} {$params['sort_order']} limit {$params['start']},{$params['limit']} "));
        $invoices = $invoicesQry;
            if (isset($invoices)) {
                return array('data' => $invoices, 'count' => $totalcount);
            } else {
                return false;
            }
        }
}
