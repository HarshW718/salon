<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Tax;
use App\Http\Controllers\Middleweb_Controller;
class TaxsController extends Middleweb_Controller
{
 
    public function index(){
        $list_taxs = Tax::where('user_company_id',$this->ExpToken["parent_id"])->orderBy('id', 'DESC')->get();
        $response = array(
            "success" => true,
            "data" => $list_taxs,
        );
        
        return response()->json($response);
        
    }
    public function store(Request $request){
        $check_validate = $request->validate([
            'name' => ['required', 'string','unique:taxs'],
            'tax_value' => ['required','unique:taxs'],
           
        ]);
           
        $tax = new Tax();
        $tax->name = $request->name;
        $tax->tax_value = $request->tax_value;
        $tax->user_company_id = $this->ExpToken["parent_id"];
        $tax->created_by = $this->ExpToken["user_id"];
        $tax->updated_by = $this->ExpToken["user_id"];
        $tax->save(); 
        $response = array(
            "success" => true,
            "message" => "Tax add successfully.",
        );
        return response()->json($response);
    }


    public function update(Request $request){

        $check_validate = $request->validate([
            'name' => 'required|unique:taxs,name,'.$request->get('id').',id',
            'tax_value' => 'required|unique:taxs,tax_value,'.$request->get('id').',id',
           
           
        ]);
        
        $tax = Tax::find($request->id);
        $tax->name = $request->name;
        $tax->tax_value = $request->tax_value;
        $tax->user_company_id = $this->ExpToken["parent_id"];
        $tax->created_by = $this->ExpToken["user_id"];
        $tax->updated_by = $this->ExpToken["user_id"];
        $tax->save();
        $response = array(
            "success" => true,
            "message" => "Tax update successfully.",
        );
        
        return response()->json($response);
    }

   

    public function destroy(Request $request){
        $tax = Tax::find($request->id);
        $tax->delete();
        $response = array(
            "success" => true,
            "message" => "Tax value delete successfully.",
        );
        return response()->json($response);
    }
    


    public function datatable_tax_list(Request $request){
       
        $limit = $request->get('length');
        $start = $request->get('start');
        $draw = $request->get('draw');
        $sort_by = $t1 = $request->get('column_name');
        $sort_order = $request->get('order');
        $search = $request->get('search');
        $params = array('limit' => $limit, 'start' => $start, 'sort_by' => $sort_by, 'sort_order' => $sort_order, 'search' => $search,'user_company_id'=>$this->ExpToken["parent_id"]);
        $taxs = Tax::tax_list($params);
        $taxs_count = Tax::tax_listCount($params);

        $response = array(
            'success' => true,
            "data" => $taxs,
            "draw" => $draw,
            "recordsFiltered" => $taxs_count,
            "recordsTotal" => $taxs_count
        );
        return response()->json($response);
    }
}
