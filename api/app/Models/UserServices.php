<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use DB;

class UserServices extends Model
{
    public static function getStaffServices($id){
        $categoriesList=DB::table('user_services')->where('user_services.user_id',$id)
        ->select( 'services_categories.name', 'services_categories.id')
        ->join('services_categories', 'services_categories.id', '=', 'user_services.service_category_id')->distinct()->get()->toArray();
        if(!empty($categoriesList)){
            for($index=0;$index<count($categoriesList);$index++){
                $service=DB::table('services')->where('services.category_id',$categoriesList[$index]->id)
                ->select( 'services.name', 'services.id',DB::raw("'1' as is_check") )->get()->toArray();
                $categoriesList[$index]->servicesList=$service;
            }
        }
        return $categoriesList;
    }
}
