<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Material extends Model
{
    protected $fillable = ['id','user_id','event_id', 'uniq_club_name', 'is_active', 'created_by','updated_by', 'created_at', 'updated_at','int_created_at','int_updated_at'];
    protected $table = 'material_master';
    protected $primaryKey = "id";

    public static function add_material($request) {
        $sql = new Material;
        $sql->user_id = $user_id;
        $sql->name = $request['name'];
        $sql->is_active = 1;
        $sql->created_by = $user_id;
        $sql->created_at = date('Y-m-d h:i:s');
        $sql->int_created_at = time();
        if(!$sql->save()) {
            return response(['error'=>true,'message'=>'Add Material failed.'])->header('Content-Type', 'json');
        } else {
            return response(['error'=>true,'message'=>'Material added successfully.'])->header('Content-Type', 'json');
        }
    }

    public static function update_material($request) {
        $sql = Material::find($request['material_id']);;
        $sql->user_id = $user_id;
        $sql->name = $request['name'];
        $sql->is_active = 1;
        $sql->updated_by = $user_id;
        $sql->updated_at = date('Y-m-d h:i:s');
        $sql->int_updated_at = time();
        if(!$sql->save()) {
            return response(['error'=>true,'message'=>'Update Material failed.'])->header('Content-Type', 'json');
        } else {
            return response(['error'=>true,'message'=>'Material updated successfully.'])->header('Content-Type', 'json');
        }
    }

    public static function material_list($user_id) {
        $listArr = Material::select('id','name','is_active')->where('user_id',$user_id)->get();
        if(!empty($listArr)) {
            $group = array();
            foreach ( $listArr as $value ) {
                $group[$value->year][] = $value;
            }
            return response(['error'=>false,'message'=>'Materials Found.','data'=>$group])->header('Content-Type', 'json');
       } else {
            return response(['error'=>false,'message'=>'Materials not Found.','data'=>array()])->header('Content-Type', 'json');
       }
    }
}
