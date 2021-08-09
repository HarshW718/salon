<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\BlockTime;
use App\Models\Services;
use App\Http\Controllers\Middleweb_Controller;
class BlockTimeController extends Middleweb_Controller
{



    public function index(){

        $block_time = BlockTime::orderBy('id', 'DESC')->get();
        $response = array(
            "success" => true,
            "data" => $block_time,
        );
        return response()->json($response);
        
    }
  
    public function store(Request $request){

 
        $block_time = new BlockTime();
        $block_time->worker_id = $request->worker_id;
        $block_time->type = $request->type;
        $block_time->description = $request->description;
        $block_time->start_time = $request->start_time;
        $block_time->end_time = $request->end_time;
        $block_time->created_by = $this->ExpToken["user_id"];
        $block_time->updated_by = $this->ExpToken["user_id"];
       

        $block_time->save();
            $response = array(
                "success" => true,
                "message" => "Block time add successfully.",
            );
            return response()->json($response);

    }

    public function update(Request $request){

        $check_validate = $request->validate([
            'name' => 'required|unique:services_categories,name,'.$request->get('id').',id',
            'type' => 'required',
            'color' => 'required|unique:services_categories,color,'.$request->get('id').',id',
            'no_of_appointment' => 'required',

        ]);

    $block_time = BlockTime::find($request->id);
    $block_time->name = $request->name;
    $block_time->type = $request->type;
    $block_time->color = $request->color;
    $block_time->no_of_appointment = $request->no_of_appointment;
    $block_time->created_by = $this->ExpToken["user_id"];
    $block_time->updated_by = $this->ExpToken["user_id"];
    $block_time->save();
    $response = array(
        "success" => true,
        "message" => "Service category update successfully.",
    );
    return response()->json($response);
    
}

public function destroy(Request $request){

    $services = Services::where('category_id','=',$request->id)->get()->toArray();
    if(count($services) > 0){
        $response = array(
            "success" => false,
            "message" => "Can't delete, category has some services !!.",
        );
        return response()->json($response);
    }else{
        $block_time = BlockTime::find($request->id);
        $block_time->delete();
        $response = array(
            "success" => true,
            "message" => "Service category delete successfully.",
        );
        return response()->json($response);

    }

}





}
