<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use App\Models\Common;
class Middleweb_Controller extends BaseController
{
    public $ExpToken;
    public function __construct(Request $request) {
		$token = $request->header('authtoken');
		if ($token != '') {
            $checkarray = array('auth_token' => $token);
            $userData = Common::getOne('users', $checkarray);
            if (!empty($userData)) {
               
                if($userData[0]['role_id']==1 && $userData[0]['parent_id']==0){
                    $parent_id=$userData[0]['id'];
                }else {
                    $parent_id=$userData[0]['parent_id'];
                }
                
                $arr=array('user_id'=>$userData[0]['id'],'parent_id'=>$parent_id,'company_name'=>$userData[0]['company_name'],'role_id'=>$userData[0]['role_id']);
                $this->ExpToken=$arr;
            } else {
                $arr = array(
                    'error' => TRUE,
                    'message' => "Auth token not match"
                );
                echo json_encode(array('error' => TRUE, 'message' => "Auth token not match",'status'=>401)); die;
            }
        } else {
			$arr = array(
                'error' => TRUE,
                'message' => "Autho token not get."
            );
            echo json_encode(array('error' => TRUE, 'message' => "Autho token not get.",'status'=>401)); die;
        }
	}
}
