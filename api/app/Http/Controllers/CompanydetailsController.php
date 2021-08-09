<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Companydetails;
use App\Models\Users;
use App\Http\Controllers\Middleweb_Controller;
use Config;
class CompanydetailsController extends Middleweb_Controller
{

    public function index()
    {
        $company_detail = Companydetails::where('user_company_id',$this->ExpToken["parent_id"])->get()->toarray();
        if(!empty($company_detail)){
            $data=$company_detail[0];
            
        }else {
            $userData = Users::where('id',$this->ExpToken["parent_id"])->get()->toarray();
            if(!empty($userData)){
                $data=[];
                $data['user_company_id']=$userData[0]['id'];
                $data['company_name']=$userData[0]['company_name'];
                $data['company_logo']='';
                $data['website']='';
                $data['email']=$userData[0]['email'];
                $data['mobile']='';
                $data['address']='';
                $data['postal_code']='';
                $data['residence']='';
                $data['chamber_of_commerce']='';
                $data['were_going']='';
                $data['btw']='';
            }else {
                $data='';
            }
        }
        $response = array(
            "success" => false,
            "data" => $data,
        );
        return response()->json($response);
    }



    public function update(Request $request)
    {
        
        $check_validate = $request->validate([
            'company_name' => 'required|unique:company_details,company_name,' . $request->get('id') . ',id',
        ]);
        $check_email = isset($request->user_company_id) ? Users::where('email',$request->email)->where('id','!=',$request->user_company_id)->get()->toarray() : new Users();
        $userData = Users::where('id',$request->user_company_id)->get()->toarray() ;
        if(empty($check_email)){
            if(!empty($userData)){
                $oldEmail=$userData[0]['email'];
                if($oldEmail!=$request->email){
                    $user=Users::find($userData[0]['id']);
                    $user->email=$request->email;
                    $user->save();
                }
            }
            $company_detail = isset($request->id) ? Companydetails::find($request->id) : new Companydetails();
            $company_detail->company_name = $request->company_name;
            $company_detail->company_logo = $request->company_logo;
            $company_detail->website = $request->website;
            $company_detail->email = $request->email;
            $company_detail->mobile = $request->mobile;
            $company_detail->address = $request->address;
            $company_detail->postal_code = $request->postal_code;
            $company_detail->residence = $request->residence;
            $company_detail->chamber_of_commerce = $request->chamber_of_commerce;
            $company_detail->were_going = $request->were_going;
            $company_detail->btw = $request->btw;
            $company_detail->created_by = $this->ExpToken["user_id"];
            $company_detail->updated_by = $this->ExpToken["user_id"];
            $company_detail->created_at = date('Y-m-d H:i:s');
            $company_detail->updated_at = date('Y-m-d H:i:s');
            $company_detail->user_company_id = $this->ExpToken["parent_id"];
            $company_detail->save();
            $response = array(
                "success" => false,
                "message" => "Company details update successfully.",
            );
        }else {
            $response = array(
                "success" => true,
                "message" => "Email already exist in the system. Please try another email",
            );
        }
        return response()->json($response);
    }
    
    public function companyImage(Request $request)
    {

        $file = $request->file('file');
        $upload_path = str_replace("api", "company_logo", base_path());
        if($file->getClientSize()<=20000){
            $image_name = date('mdYHis') . uniqid().'.'.$file->getclientoriginalextension();
            $file->move($upload_path, $image_name);
            echo $image_name;
            
        }else {
            echo 'error';
        }
    }
    
    public function deleteCompanyImages(Request $request)
    {
       
        $company_detail = isset($request->id) ? Companydetails::find($request->id) : new Companydetails();
        $company_detail->company_logo = '';
        $company_detail->updated_by = $this->ExpToken["user_id"];
        $company_detail->created_at = date('Y-m-d H:i:s');
        $company_detail->updated_at = date('Y-m-d H:i:s');
        if($company_detail->save()){
            $imageUrl = Config::get('constants.imageUrl').'company_logo/'.$request->company_logo;
            unlink($imageUrl);
            $response = array(
                "success" => false,
                "message" => "Company logo delete successfully.",
            );
        }else {
            
            $response = array(
                "success" => true,
                "message" => "An error occured while performing operation."
            );
        }
        return response()->json($response);
    }
}
