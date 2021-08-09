<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ServicesCategories;
use App\Models\Services;
use App\Http\Controllers\Middleweb_Controller;
use DB;


class ServicesCategoriesController extends Middleweb_Controller
{



    public function index()
    {
        $service_category = ServicesCategories::where('user_company_id',$this->ExpToken["parent_id"])->orderBy('id', 'DESC')->get();
        $response = array(
            "success" => true,
            "data" => $service_category,
        );
        return response()->json($response);
    }

    public function single_service_category($cat_id)
    {
        $single_service_category = ServicesCategories::where('id', $cat_id)->where('user_company_id',$this->ExpToken["parent_id"])->orderBy('id', 'DESC')->get();
        $response = array(
            "success" => true,
            "data" => $single_service_category,
        );
        return response()->json($response);
    }

    public function store(Request $request)
    {
        $check_validate = $request->validate([
            
            'name' => ['required', 'string'],
            'color' => ['required', 'string'],
            'gender' => 'required',
        ]);
        $service_category = new ServicesCategories();
        $service_category->name = $request->name;
        $service_category->user_company_id = $this->ExpToken["parent_id"];
        $service_category->type = $request->type;
        $service_category->gender = $request->gender;
        $service_category->color = $request->color == '' ? '#00000' : $request->color;
        $service_category->no_of_appointment = $request->no_of_appointment;
        $service_category->created_by = $this->ExpToken["user_id"];
        $service_category->updated_by = $this->ExpToken["user_id"];
        $service_category->save();
        $response = array(
            "success" => true,
            "message" => "Service category add successfully.",
        );
        return response()->json($response);
    }

    public function update(Request $request)
    {
        $check_validate = $request->validate([
            'name' => 'required|unique:services_categories,name,' . $request->get('id') . ',id',
            'type' => 'required',
            'gender' => 'required',
            'color' => 'required|unique:services_categories,color,' . $request->get('id') . ',id',
            'no_of_appointment' => 'required',

        ]);
        $service_category = ServicesCategories::find($request->id);
        $service_category->name = $request->name;
        $service_category->user_company_id = $this->ExpToken["parent_id"];
        $service_category->type = $request->type;
        $service_category->color = $request->color;
        $service_category->gender = $request->gender;
        $service_category->no_of_appointment = $request->no_of_appointment;
        $service_category->created_by = $this->ExpToken["user_id"];
        $service_category->updated_by = $this->ExpToken["user_id"];
        $service_category->save();

        $service_find = Services::where('category_id',$request->id)->get();
        DB::update("update services set gender_id = ". $request->gender. " where category_id = ".$request->id);

        $response = array(
            "success" => true,
            "message" => "Service category update successfully.",
            "service" => $service_find
        );

        return response()->json($response);
    }




    public function destroy(Request $request)
    {
        $services = Services::where('category_id', '=', $request->id)->where('user_company_id', '=', $this->ExpToken["parent_id"])->get()->toArray();
        if (count($services) > 0) {
            $response = array(
                "success" => false,
                "message" => "Can't delete, category has some services !!.",
            );
            return response()->json($response);
        } else {
            $service_category = ServicesCategories::find($request->id);
            $service_category->delete();
            $response = array(
                "success" => true,
                "message" => "Service category delete successfully.",
            );
            return response()->json($response);
        }
    }

    public function serviceCatforSelect()
    {
        $service_category = ServicesCategories::with('services')->where('user_company_id',$this->ExpToken["parent_id"])->orderBy('id', 'DESC')->get()->toArray();

        $filteredArray = array_filter($service_category, function ($service_category) {
            if (count($service_category['services']) > 0) {
                return  $service_category;
            };
        });

        $response = array(
            "success" => true,
            "data" => $filteredArray,
        );

        return json_encode($response);
    }



    public function newCategoryList(Request $request)
    {

        $limit = $request->get('length');
        $start = $request->get('start');
        $draw = $request->get('draw');
        $sort_by = $t1 = $request->get('column_name');
        $sort_order = $request->get('order');
        $search = $request->get('search');
        $params = array('limit' => $limit, 'start' => $start, 'sort_by' => $sort_by, 'sort_order' => $sort_order, 'search' => $search, 'user_company_id' => $this->ExpToken["parent_id"]);
        $categories = ServicesCategories::category_list($params);
        $categories_count = ServicesCategories::category_listCount($params);

        $response = array(
            'success' => true,
            "data" => $categories,
            "draw" => $draw,
            "recordsFiltered" => $categories_count,
            "recordsTotal" => $categories_count
        );
        return response()->json($response);
    }


}
