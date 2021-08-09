<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Material;
use Validator;

class MaterialController extends Controller
{
    /*--------function for get material list for material master--------*/
    public function materialList(Request $request){
        $user_id = $request->get('user_id');
        $response = Material::material_list($user_id);
        return $response;
    }

    /*--------function for add material for material master--------*/
    public function addMaterial(Request $request){
        $validator = Validator::make($request->all(), [
            'name' => 'required',
        ]); 
        if ($validator->fails()) {
            $err_msg = $validator->messages()->first();
            return response(['error'=>true,'message'=>$err_msg])->header('Content-Type', 'json');
        } 
        $user_id = $request->get('user_id');
        $response = Material::add_material($user_id,$request);
        return $response;
    }

    /*--------function for add material for material master--------*/
    public function updateMaterial(Request $request){
        $validator = Validator::make($request->all(), [
            'name' => 'required',
        ]); 
        if ($validator->fails()) {
            $err_msg = $validator->messages()->first();
            return response(['error'=>true,'message'=>$err_msg])->header('Content-Type', 'json');
        } 
        $user_id = $request->get('user_id');
        $response = Material::update_material($user_id,$request);
        return $response;
    }

    /*--------function for delete material for material master--------*/
    public function deleteMaterial(Request $request){
        $user_id = $request->get('user_id');
        $validator = Validator::make($request->all(), [
            'material_id' => 'required',
        ]); 
        if ($validator->fails()) {
            $err_msg = $validator->messages()->first();
            return response(['error'=>true,'message'=>$err_msg])->header('Content-Type', 'json');
        } 
       
        $response = Material::delete_material($request);
        return $response;
    }
}
