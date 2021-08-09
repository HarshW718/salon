<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Products;
use App\Models\ProductsCategories;
use App\Models\Companies;
use App\Models\Tax;
use App\Models\Sync_allow;
use App\Models\Sync_cron;
use App\Models\Users;
use App\Http\Controllers\Middleweb_Controller;
use Config;

use Illuminate\Support\Facades\DB;

class ProductsController extends Middleweb_Controller
{

    public function index()
    {

        $products = Products::with('product_category', 'product_company')->where('user_company_id',$this->ExpToken["parent_id"])->where('type',2)->orderBy('id', 'DESC')->get();
        $response = array(
            "success" => true,
            "data" => $products,
        );
        return response()->json($response);
    }

    public function search_products(Request $request)
    {
        if (count($request->search) > 0) {
            $products =  Products::where('user_company_id',$this->ExpToken["parent_id"])->where('name', 'like', '%' . $request->search['search_product'] . '%')->get();

        } else {
            $products = Products::where('user_company_id',$this->ExpToken["parent_id"])->orderBy('id', 'DESC')->get();
        }
        $response = array(
            "success" => true,
            "data" => $products,

        );
        return response()->json($response);

    }
    public function store(Request $request)
    {

        $check_validate = $request->validate([
            'name' => ['required', 'string'],
            'category_id' => 'required',
            // 'company_id' => 'required',
            'type' => 'required',
            'sale_price' => 'required'
            // 'tax_id' => 'required',
        ]);

        $insert_data = $request->all();

        $insert_data['user_company_id'] = $this->ExpToken["parent_id"];
        $insert_data['created_by'] = $this->ExpToken["user_id"];
        $insert_data['updated_by'] = $this->ExpToken["user_id"];
        $product_id = Products::where('category_id',$request->category_id)->get();

        Products::create($insert_data);
        $sync_cron=Sync_cron::where('from_user_company_id',$this->ExpToken["parent_id"])->get()->toarray();

        if(empty($sync_cron)){

            $insertCron=[];
            $insertCron['from_user_company_id']=$this->ExpToken["parent_id"];
            $insertCron['is_run']=1;
            $insertCron['created_at']=date('Y-m-d H:i:s');
            $insertCron['updated_at']=date('Y-m-d H:i:s', strtotime('+1 minutes'));
            $insertCron['created_by']=$this->ExpToken["user_id"];
            $insertCron['updated_by']=$this->ExpToken["user_id"];
            Sync_cron::create($insertCron);

        }else {

            $sync_cron = Sync_cron::find($sync_cron[0]['id']);
            $sync_cron->is_run = 1;
            $sync_cron->updated_at = date('Y-m-d H:i:s', strtotime('+1 minutes'));
            $sync_cron->updated_by = $this->ExpToken["user_id"];
            $sync_cron->save();
        }

        $response = array(
            "success" => true,
            "message" => "Product add successfully.",
            "prodcuts" => $product_id
        );
        return response()->json($response);
    }

    public function update(Request $request)
    {

        $check_validate = $request->validate([
            'name' => 'required|unique:products,name,' . $request->get('id') . ',id',
            'category_id' => 'required',
            // 'company_id' => 'required',
            'type' => 'required',
            'sale_price' => 'required',
            'tax_id' => 'required',
        ]);

        $product = Products::find($request->id);
        $product->name = $request->name;
        $product->category_id = $request->category_id;
        $product->tax_id = $request->tax_id;
        $product->company_id = $request->company_id;
        $product->ean = $request->ean;
        $product->sku = $request->sku;
        $product->stocke = $request->stocke;
        $product->min_stocke = $request->min_stocke;
        $product->type = $request->type;
        $product->sale_price = $request->sale_price;
        $product->purchase_price = $request->purchase_price;
        $product->user_company_id = $this->ExpToken["parent_id"];
        $product->created_by = $this->ExpToken["user_id"];
        $product->updated_by = $this->ExpToken["user_id"];
        $product->save();
        $response = array(
            "success" => true,
            "message" => "Product update successfully.",
        );
        return response()->json($response);
    }

    public function destroy(Request $request)
    {
        $product = Products::find($request->id);
        $product->delete();
        $response = array(
            "success" => true,
            "message" => "Product delete successfully.",
        );
        return response()->json($response);
    }
    public function destroyAll(Request $request)
    {

        $ids = $request->all();
        $product = Products::whereIn('id', $ids)->delete();
        $response = array(
            "success" => true,
            "message" => "All Product delete successfully.",
        );
        return response()->json($response);
    }
    public function newProductList(Request $request)
    {

        $limit = $request->get('length');
        $start = $request->get('start');
        $draw = $request->get('draw');
        $sort_by = $t1 = $request->get('column_name');
        $sort_order = $request->get('order');
        $search = $request->get('search');
        $params = array('limit' => $limit, 'start' => $start, 'sort_by' => $sort_by, 'sort_order' => $sort_order, 'search' => $search,'user_company_id'=>$this->ExpToken["parent_id"]);
        $categories = Products::product_list($params);
        $categories_count = Products::product_listCount($params);

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
    { }
    public function getNewProduct(Request $request)
    {
        $id = $request->get('id');
        $productDetails = Products::getNewProduct($id);
        if (!empty($productDetails)) {
            $response = array(
                'data' => $productDetails,
                'error' => FALSE
            );
        } else {
            $response = array(
                'data' => $productDetails,
                'error' => True
            );
        }
        return response()->json($response);
    }

    public function upload_csv(Request $request)
    {

        $data_csv = $request->all();
        $data_csv = array_filter($data_csv);
        if (count($data_csv) >= 2) {
            foreach ($data_csv as $key => $value) {
                $line_into_array[$key] = explode(",", $value);
                if ($key > 0) {
                    if (count($line_into_array[$key]) == 12) {
                        if (Products::whereRaw('LOWER(`name`) = "' . trim(strtolower($line_into_array[$key][4])) . '"')->count() > 0) {

                            $response = array(
                                "success" => false,
                                "message" => "Product with name " . $line_into_array[$key][4] . " alredy exist in your list !!",
                            );
                            return response()->json($response);
                            exit();
                        } else {
                            if (trim($line_into_array[$key][0]) != "" && trim($line_into_array[$key][1]) != "" && trim($line_into_array[$key][4]) != "" &&  trim($line_into_array[$key][6]) != "" &&  trim($line_into_array[$key][7]) != "" &&  trim($line_into_array[$key][8]) != "") {

                                if (ProductsCategories::whereRaw('LOWER(`name`) = "' . trim(strtolower($line_into_array[$key][0])) . '"')->count() > 0) {
                                    $product_category = ProductsCategories::whereRaw('LOWER(`name`) = "' . trim(strtolower($line_into_array[$key][0])) . '"')->first()->toArray();
                                    $line_into_array[$key][0] = $product_category['id'];
                                    $final_data[$key]['category_id'] = $line_into_array[$key][0];
                                } else {
                                    $response = array(
                                        "success" => false,
                                        "message" => "Product category with name " . $line_into_array[$key][0] . " not exist in your list ,First add category !!",
                                    );
                                    return response()->json($response);
                                    exit();
                                }
                                if (Companies::whereRaw('LOWER(`name`) = "' . trim(strtolower($line_into_array[$key][8])) . '"')->count() > 0) {
                                    $product_company = Companies::whereRaw('LOWER(`name`) = "' . trim(strtolower($line_into_array[$key][8])) . '"')->first()->toArray();
                                    $line_into_array[$key][8] = $product_company['id'];
                                    $final_data[$key]['company_id'] = $line_into_array[$key][8];
                                } else {
                                    $response = array(
                                        "success" => false,
                                        "message" => "Supplier with name " . $line_into_array[$key][8] . " not exist in your list ,First add supplier !!",
                                    );
                                    return response()->json($response);
                                    exit();
                                }

                                if (Tax::whereRaw('LOWER(`name`) = "' . trim(strtolower($line_into_array[$key][7])) . '"')->count() > 0) {
                                    $product_tax = Tax::whereRaw('LOWER(`name`) = "' . trim(strtolower($line_into_array[$key][7])) . '"')->first()->toArray();
                                    $line_into_array[$key][7] = $product_tax['id'];
                                    $final_data[$key]['tax_id'] = $line_into_array[$key][7];
                                } else {
                                    $response = array(
                                        "success" => false,
                                        "message" => "Tax with name " . $line_into_array[$key][7] . " not exist in your list ,First add tax !!",
                                    );
                                    return response()->json($response);
                                    exit();
                                }

                                if ((trim(strtolower($line_into_array[$key][1])) == 'salon') || (trim(strtolower($line_into_array[$key][1])) == 'sell')) {

                                    $final_data[$key]['type'] = (trim(strtolower($line_into_array[$key][1])) == 'salon') ? 1 : 2;
                                } else {

                                    $response = array(
                                        "success" => false,
                                        "message" => "Product type should be salon or sell !!",
                                    );
                                    return response()->json($response);
                                    exit();
                                }

                                $final_data[$key]['ean'] = $line_into_array[$key][2];
                                $final_data[$key]['sku'] = $line_into_array[$key][3];
                                $final_data[$key]['name'] = $line_into_array[$key][4];
                                $final_data[$key]['purchase_price'] = $line_into_array[$key][5];
                                $final_data[$key]['sale_price'] = $line_into_array[$key][6];
                                $final_data[$key]['stocke'] = $line_into_array[$key][9];
                                $final_data[$key]['min_stocke'] = $line_into_array[$key][10];
                                $final_data[$key]['user_company_id'] = $this->ExpToken["parent_id"];
                                $final_data[$key]['created_by'] = $this->ExpToken["user_id"];
                                $final_data[$key]['updated_by'] = $this->ExpToken["user_id"];
                            } else {

                                $response = array(
                                    "success" => false,
                                    "message" => "Missing required field, It may be name,category,type,supplier,sale price or tax !!",
                                );
                                return response()->json($response);
                                exit();
                            }
                        }
                    } else {
                        $response = array(
                            "success" => false,
                            "message" => "Comma(,) not allowed in any cell !!",
                        );
                        return response()->json($response);
                        exit();
                    }
                }
            }
        } else {

            $response = array(
                "success" => false,
                "message" => "No data found recheck your file !!",
            );
            return response()->json($response);
            exit();
        }

        Products::insert($final_data);
        $response = array(
            "success" => true,
            "message" => "Products add successfully.",
        );
        return response()->json($response);
    }

    public function sendSyncRequest(Request $request) {
        $emailList=$request->get('email');
        $user_id=$this->ExpToken["user_id"];
        $fromCompany =  Users::where('id', $user_id)->get()->toarray();

        for($i=0;$i<count($emailList);$i++){
            $email=$emailList[$i]['text'];
            $toCompanyData =  Users::where('email', $email)->where('is_active',1)->where('role_id',1)->get()->toarray();

            if(!empty($toCompanyData)){

               $toCompanyId=$toCompanyData[0]['id'];

               $syncFromToData= DB::select( DB::raw("SELECT * FROM sync_allows WHERE  from_user_company_id=".$user_id." AND to_user_company_id=".$toCompanyId.""));

               $syncToFromData= DB::select( DB::raw("SELECT * FROM sync_allows WHERE  from_user_company_id=".$toCompanyId." AND to_user_company_id=".$user_id." "));

                $fromCompanyName=$fromCompany[0]['company_name'];

                $yesUrl = Config::get('constants.activationUrl').'login/allow/yes/'.$user_id.'/'.$toCompanyId;


                $noUrl = Config::get('constants.activationUrl').'login/allow/no/'.$user_id.'/'.$toCompanyId;
                $body = "Dear " . $toCompanyData[0]['name'] . " <br/><br/>";
                $body .= $fromCompanyName." company send to requested to you for add master datas in your account. If you want to then click on Yes otherwise click on No link ";
                $body .="<br>";
                $body .= "<a href='".$yesUrl."'>Yes, I want </a>    ";
                $body .="<br>";
                $body .= "<a href='".$noUrl."'>No Thanks</a>";


                $body .= "<br/><b>Thanks <br /> Salon Team</b>";
                $mailData = [];
                $mailData['to_email'] = $email;
                $mailData['bodyData'] = $body;
                $mailData['user_id'] = $toCompanyId;
                $mailData['user_company_id'] = $this->ExpToken["parent_id"];
                $mailData['sub'] = 'Request for copy master data - Salon';
                $is_allow_from_to=0;
                $is_allow_to_from=0;
                if(!empty($syncFromToData) && $syncFromToData[0]->is_allow_from_to==0){

                    $is_allow_from_to=1;
                    Users::saveMail($mailData);
                    $sunc=Sync_allow::find($syncFromToData[0]->id);
                    $sunc->is_allow_from_to=1;
                    $sunc->save();

                }else if(!empty($syncToFromData) && $syncToFromData[0]->is_allow_to_from==0){

                    $is_allow_to_from=1;
                    Users::saveMail($mailData);
                    $sunc=Sync_allow::find($syncToFromData[0]->id);
                    $sunc->is_allow_to_from=1;
                    $sunc->save();
                }

               if(empty($syncFromToData) && empty($syncToFromData)){

                    $insert_data=[];
                    $insert_data['from_user_company_id'] = $user_id;
                    $insert_data['to_user_company_id'] = $toCompanyId;
                    $insert_data['is_allow_from_to'] = 1;
                    $insert_data['is_allow_to_from'] = $is_allow_to_from;
                    $insert_data['created_by'] = $this->ExpToken["user_id"];
                    $insert_data['updated_by'] = $this->ExpToken["user_id"];
                    Sync_allow::create($insert_data);
                    Users::saveMail($mailData);

               }

            }
        }

        $response = array(
            "success" => false,
            "message" => "Request send successfully.",
        );

        return response()->json($response);
    }

    public function syncList(Request $request)
    {

        $limit = $request->get('length');
        $start = $request->get('start');
        $draw = $request->get('draw');
        $sort_by = $t1 = $request->get('column_name');
        $sort_order = $request->get('order');
        $search = $request->get('search');
        $params = array('limit' => $limit, 'start' => $start, 'sort_by' => $sort_by, 'sort_order' => $sort_order, 'search' => $search, 'user_company_id' => $this->ExpToken["parent_id"]);
        $categories = Products::sync_list($params);
        $categories_count = Products::sync_listCount($params);

        $response = array(
            'success' => true,
            "data" => $categories,
            "draw" => $draw,
            "recordsFiltered" => $categories_count,
            "recordsTotal" => $categories_count
        );
        return response()->json($response);
    }
    public function deduct_product_quantity(Request $request)
    {
        $productData = $request->all();
        foreach ($productData as $key => $value) {

            $pro = DB::table('products')->where('id',$value['id'])->first();

            $newStock = number_format($pro->stocke) - number_format($value['quantity']);
            if($newStock <= 0)
            {
                DB::table('products')->where('id', $pro->id)->update(['stocke' => 0]);
            }else{
                DB::table('products')->where('id', $pro->id)->update(['stocke' => $newStock]);
            }
        }
        $response = array(
            'success' => true,
            "data" => [],
        );
        return response()->json($response);

    }


}
