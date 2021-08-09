<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use DB;


class ServicesCategories extends Model
{
    protected $fillable = ['id', 'name','user_company_id', 'type', 'color','no_of_appointment','created_by','updated_by','created_at','updated_at'];
   
    protected $table = "services_categories";

    public function services()
    {
        return $this->hasMany('App\Models\Services','category_id');
    }
   
    public static function category_list($params = array()) {
        $where='';
	    $where="where id !='' AND user_company_id=".$params['user_company_id'];
        if (isset($params['search']) && !empty($params['search'])) {
             
             if(strtolower($params['search']) == 'machine'){
                $type = 1;
             }else if(strtolower($params['search']) == 'service'){
                $type = 2;
             }else{
                $type = $params['search'];
             }
             
             $where .=" and (name like '%".$params['search']."%' or type like '%".$type."%' or no_of_appointment like '%".$params['search']."%')";
        }
        return $invoicesQry = DB::select( DB::raw("SELECT * from  services_categories ".$where." order by {$params['sort_by']} {$params['sort_order']} limit {$params['start']},{$params['limit']} "));
       
    }


    public static function category_listCount($params = array()) {
        $where='';
	    $where="where id !='' AND user_company_id=".$params['user_company_id'];
        if (isset($params['search']) && !empty($params['search'])) {
            if(strtolower($params['search']) == 'machine'){
                $type = 1;
             }else if(strtolower($params['search']) == 'service'){
                $type = 2;
             }else{
                $type = $params['search'];
             }
            $where .=" and (name like '%".$params['search']."%' or type like '%".$type."%' or no_of_appointment like '%".$params['search']."%')";
        }
        $totalcountQry = DB::select( DB::raw("SELECT count(id) as totalRecord from services_categories ".$where));
	    return $totalcount = $totalcountQry[0]->totalRecord;
    }

    public static function getNewCategory($id) {
        return DB::select( DB::raw("select * from services_categories WHERE id=".$id));
    }


}
