<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Companies;
use App\Models\Products;
use App\Http\Controllers\Middleweb_Controller;
class CompaniesController extends Middleweb_Controller
{

    public function index(){
       
        $companies = Companies::where('user_company_id',$this->ExpToken["parent_id"])->orderBy('id', 'DESC')->get();
        $response = array(
            "success" => true,
            "data" => $companies,
        );
        return response()->json($response);
        
    }
    public function store(Request $request){
        $check_validate = $request->validate([
            'name' => ['required', 'string','unique:companies'],
           
        ]);
                $company = new Companies();
                $company->name = $request->name;
                $company->user_company_id = $this->ExpToken["parent_id"];
                $company->created_by = $this->ExpToken["user_id"];
                $company->updated_by = $this->ExpToken["user_id"];
                $company->save(); 
                $response = array(
                    "success" => true,
                    "message" => "Supplier add successfully.",
                );
            return response()->json($response);
    }

    public function update(Request $request){

        $check_validate = $request->validate([
            'name' => 'required|unique:companies,name,'.$request->get('id').',id',
           
        ]);
        
            $company = Companies::find($request->id);
            $company->name = $request->name;
            $company->user_company_id = $this->ExpToken["parent_id"];
            $company->created_by = $this->ExpToken["user_id"];
            $company->updated_by = $this->ExpToken["user_id"];
            $company->save();
            $response = array(
                "success" => true,
                "message" => "Supplier update successfully.",
            );
        
        return response()->json($response);
    }

    public function destroy(Request $request){
        $products = Products::where('company_id', '=', $request->id)->get()->toArray();
        if(count($products) > 0){
            $response = array(
            "success" => false,
            "message" => "Can't delete, company has some products !!.",
        );
        return response()->json($response);
        }else{
            $company = Companies::find($request->id);
            $company->delete();
            $response = array(
            "success" => true,
            "message" => "Supplier delete successfully.",
        );
        return response()->json($response);
        }
        
    }
   
    public function newProductCompanyList(Request $request){
       
        $limit = $request->get('length');
        $start = $request->get('start');
        $draw = $request->get('draw');
        $sort_by = $t1 = $request->get('column_name');
        $sort_order = $request->get('order');
        $search = $request->get('search');
        $params = array('limit' => $limit, 'start' => $start, 'sort_by' => $sort_by, 'sort_order' => $sort_order, 'search' => $search, 'user_company_id' => $this->ExpToken["parent_id"]);
        $companies = Companies::product_company_list($params);
        $companies_count = Companies::product_company_listCount($params);
        $response = array(
            'success' => true,
            "data" => $companies,
            "draw" => $draw,
            "recordsFiltered" => $companies_count,
            "recordsTotal" => $companies_count
        );
        return response()->json($response);
    }


}
