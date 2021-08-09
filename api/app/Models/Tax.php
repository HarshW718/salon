<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use DB;


class Tax extends Model
{
    protected $table = 'taxs';
    protected $fillable = ['id', 'name','user_company_id', 'created_at', 'updated_at', 'tax_value' ];

    public static function tax_list($params = array()) {
        $where='';
	    $where="where id !='' AND user_company_id=".$params['user_company_id'];
        $query = ProductsCategories::query();
        if (isset($params['search']) && !empty($params['search'])) {
             $where .=" and (name like '%".$params['search']."%' or tax_value like '%".$params['search']."%') ";
        }
        return $invoicesQry = DB::select( DB::raw("SELECT * from  taxs ".$where." order by {$params['sort_by']} {$params['sort_order']} limit {$params['start']},{$params['limit']} "));
        
    }


    public static function tax_listCount($params = array()) {
        $where='';
	$where="where id !='' AND user_company_id=".$params['user_company_id'];
        if (isset($params['search']) && !empty($params['search'])) {
            $where .=" and (name like '%".$params['search']."%') ";
        }
        $totalcountQry = DB::select( DB::raw("SELECT count(id) as totalRecord from taxs ".$where));
	    return $totalcount = $totalcountQry[0]->totalRecord;
    }

    public static function getNewTax($id) {
        return DB::select( DB::raw("select * from taxs WHERE id=".$id));
    }
  
}
