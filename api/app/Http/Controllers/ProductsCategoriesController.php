<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ProductsCategories;
use App\Models\Products;
use App\Http\Controllers\Middleweb_Controller;

class ProductsCategoriesController extends Middleweb_Controller
{


    public function index()
    {

        $product_category = ProductsCategories::with('products')->where('user_company_id', $this->ExpToken["parent_id"])->orderBy('id', 'DESC')->get()->toArray();
        $filteredArray = array_filter($product_category, function ($product_category) {
            if (count($product_category['products']) > 0) {
                return  $product_category;
            };
        });
        $response = array(
            "success" => true,
            "data" => $filteredArray,
            "product_categories"=>$product_category
        );

        return json_encode($response);
    }


    public function store(Request $request)
    {

        $check_validate = $request->validate([
            'name' => ['required', 'string', 'unique:products_categories'],
        ]);
        $product_category = new ProductsCategories();
        $product_category->name = $request->name;
        $product_category->user_company_id = $this->ExpToken["parent_id"];
        $product_category->created_by = $this->ExpToken["user_id"];
        $product_category->updated_by = $this->ExpToken["user_id"];
        $product_category->save();
        $response = array(
            "success" => true,
            "message" => "Product category add successfully.",
        );

        return response()->json($response);
    }

    public function update(Request $request)
    {

        $check_validate = $request->validate([
            'name' => 'required|unique:products_categories,name,' . $request->get('id') . ',id',

        ]);
        $product_category = ProductsCategories::find($request->id);
        $product_category->name = $request->name;
        $product_category->user_company_id = $this->ExpToken["parent_id"];
        $product_category->created_by = $this->ExpToken["user_id"];
        $product_category->updated_by = $this->ExpToken["user_id"];
        $product_category->save();
        $response = array(
            "success" => true,
            "message" => "Product category update successfully.",
        );

        return response()->json($response);
    }

    public function destroy(Request $request)
    {

        $products = Products::where('category_id', '=', $request->id)->get()->toArray();
        if (count($products) > 0) {
            $response = array(
                "success" => false,
                "message" => "Can't delete, category has some products !!.",
            );
            return response()->json($response);
        } else {

            $product_category = ProductsCategories::find($request->id);
            $product_category->delete();
            $response = array(
                "success" => true,
                "message" => "Product category delete successfully.",
            );
            return response()->json($response);
        }
    }
    public function event(Request $request)
    {

        $limit = $request->get('length');
        $start = $request->get('start');
        $draw = $request->get('draw');
        $sort_by = $t1 = $request->get('column_name');
        $sort_order = $request->get('order');
        $search = $request->get('search');
        $params = array('limit' => $limit, 'start' => $start, 'sort_by' => $sort_by, 'sort_order' => $sort_order, 'search' => $search);
        $categories = ProductsCategories::categories_list($params);
        $categories_count = ProductsCategories::categories_listCount($params);

        $response = array(
            'success' => true,
            "data" => $categories,
            "draw" => $draw,
            "recordsFiltered" => $categories_count,
            "recordsTotal" => $categories_count
        );
        return response()->json($response);
    }


    public function updateCategory($request)
    {

        $product_category = ProductsCategories::find($request->id);
        $product_category->name = $request->name;
        $product_category->type = $request->type;
        $product_category->color = $request->color;
        $product_category->no_of_appointment = $request->no_of_appointment;
        $product_category->save();
    }



    public function newProductCategoryList(Request $request)
    {

        $limit = $request->get('length');
        $start = $request->get('start');
        $draw = $request->get('draw');
        $sort_by = $t1 = $request->get('column_name');
        $sort_order = $request->get('order');
        $search = $request->get('search');
        $params = array('limit' => $limit, 'start' => $start, 'sort_by' => $sort_by, 'sort_order' => $sort_order, 'search' => $search, 'user_company_id' => $this->ExpToken["parent_id"]);
        $product_categories = ProductsCategories::product_category_list($params);
        $product_categories_count = ProductsCategories::product_category_listCount($params);

        $response = array(
            'success' => true,
            "data" => $product_categories,
            "draw" => $draw,
            "recordsFiltered" => $product_categories_count,
            "recordsTotal" => $product_categories_count
        );
        return response()->json($response);
    }
}
