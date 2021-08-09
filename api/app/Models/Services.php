<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use DB;

class Services extends Model
{

    protected $fillable = ['id', 'name','display_name','user_company_id', 'category_id', 'tax_id', 'contact_time', 'buffer_time', 'buffer_duration', 'sales_price', 'duration', 'created_by','updated_by' ];



    public function service_category()
    {
        return $this->hasOne('App\Models\ServicesCategories','id','category_id');
    }

    public function service_tax()
    {
        return $this->hasOne('App\Models\Tax','id','tax_id');
    }

    public static function syncServiceCat($data){

        $masterCatData = DB::select( DB::raw("SELECT *,id as master_id FROM services_categories where id not in

(
   select  DISTINCT master_service_cat_id from sync_service_cat_logs WHERE ((from_user_company_id=".$data['toId']." AND to_user_company_id=".$data['fromId']." ) || (from_user_company_id=".$data['fromId']." AND to_user_company_id=".$data['toId']." ))

UNION

select  DISTINCT new_service_cat_id from sync_service_cat_logs WHERE ((from_user_company_id=".$data['toId']." AND to_user_company_id=".$data['fromId']." ) || (from_user_company_id=".$data['fromId']." AND to_user_company_id=".$data['toId']." ))

)

AND user_company_id!=".$data['toId']." and user_company_id=".$data['fromId'].""));

        for($i=0;$i<count($masterCatData);$i++){
            $insert=[];
            $insert['name']=$masterCatData[$i]->name;
            $insert['type']=$masterCatData[$i]->type;
            $insert['color']=$masterCatData[$i]->color;
            $insert['no_of_appointment']=$masterCatData[$i]->no_of_appointment;
            $insert['user_company_id']=$data['toId'];
            $insert['created_by']=$data['toId'];
            $insert['updated_by']=$data['toId'];
            $insert['created_at']=date('Y-m-d H:i:s');
            $insert['updated_at']=date('Y-m-d H:i:s');

            $lastdata=DB::table('services_categories')->insertGetId($insert);

            $insertToSync=[];
            $insertToSync['master_service_cat_id']=$masterCatData[$i]->master_id;
            $insertToSync['new_service_cat_id']=$lastdata;
            $insertToSync['from_user_company_id']=$data['fromId'];
            $insertToSync['to_user_company_id']=$data['toId'];
            $insertToSync['created_by']=$data['toId'];
            $insertToSync['updated_by']=$data['toId'];

            DB::table('sync_service_cat_logs')->insertGetId($insertToSync);

        }
    }

    public static function syncService($data){

        $masterServiceData = DB::select( DB::raw("SELECT *,id as master_id FROM services where id not in

(
   select  DISTINCT master_service_id from sync_services_logs WHERE ((from_user_company_id=".$data['toId']." AND to_user_company_id=".$data['fromId']." ) || (from_user_company_id=".$data['fromId']." AND to_user_company_id=".$data['toId']." ))

UNION

select  DISTINCT new_service_id from sync_services_logs WHERE ((from_user_company_id=".$data['toId']." AND to_user_company_id=".$data['fromId']." ) || (from_user_company_id=".$data['fromId']." AND to_user_company_id=".$data['toId']." ))

)

AND user_company_id!=".$data['toId']." and user_company_id=".$data['fromId'].""));

        for($i=0;$i<count($masterServiceData);$i++){

             $catData = DB::select( DB::raw("SELECT * FROM `sync_service_cat_logs` where ((from_user_company_id=".$data['fromId']." AND to_user_company_id=".$data['toId']." ) || (from_user_company_id=".$data['toId']." AND to_user_company_id=".$data['fromId'].") ) AND (master_service_cat_id=".$masterServiceData[$i]->category_id." || new_service_cat_id=".$masterServiceData[$i]->category_id.")"));

            $taxData = DB::select( DB::raw("SELECT * FROM `sync_tax_logs` where ((from_user_company_id=".$data['fromId']." AND to_user_company_id=".$data['toId']." ) || (from_user_company_id=".$data['toId']." AND to_user_company_id=".$data['fromId'].") ) AND (master_tax_id=".$masterServiceData[$i]->tax_id."  || new_tax_id=".$masterServiceData[$i]->tax_id." ) "));


            if(!empty($catData) && !empty($taxData)){

                if($catData[0]->master_service_cat_id==$masterServiceData[$i]->category_id){
                    $new_service_cat_id=$catData[0]->new_service_cat_id;
                }else if($catData[0]->new_service_cat_id==$masterServiceData[$i]->category_id){
                    $new_service_cat_id=$catData[0]->master_service_cat_id;

                }

                if($taxData[0]->master_tax_id==$masterServiceData[$i]->tax_id){

                    $new_tax_id=$taxData[0]->new_tax_id;

                }else if($taxData[0]->new_tax_id==$masterServiceData[$i]->tax_id){
                    $new_tax_id=$taxData[0]->master_tax_id;

                }

                $insert=[];
                $insert['name']=$masterServiceData[$i]->name;
                $insert['contact_time']=$masterServiceData[$i]->contact_time;
                $insert['buffer_time']=$masterServiceData[$i]->buffer_time;
                $insert['buffer_duration']=$masterServiceData[$i]->buffer_duration;
                $insert['sales_price']=$masterServiceData[$i]->sales_price;
                $insert['duration']=$masterServiceData[$i]->duration;
                $insert['category_id']=$new_service_cat_id;
                $insert['tax_id']=$new_tax_id;
                $insert['user_company_id']=$data['toId'];
                $insert['created_by']=$data['toId'];
                $insert['updated_by']=$data['toId'];
                $insert['created_at']=date('Y-m-d H:i:s');
                $insert['updated_at']=date('Y-m-d H:i:s');

                $lastdata=DB::table('services')->insertGetId($insert);

                $insertToSync=[];
                $insertToSync['master_service_id']=$masterServiceData[$i]->master_id;
                $insertToSync['new_service_id']=$lastdata;
                $insertToSync['from_user_company_id']=$data['fromId'];
                $insertToSync['to_user_company_id']=$data['toId'];
                $insertToSync['created_by']=$data['toId'];
                $insertToSync['updated_by']=$data['toId'];

                DB::table('sync_services_logs')->insertGetId($insertToSync);
            }
        }
    }
}
