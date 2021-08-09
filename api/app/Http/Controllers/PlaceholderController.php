<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Placeholder;
use App\Http\Controllers\Middleweb_Controller;
use DB;
class PlaceholderController extends Middleweb_Controller
{

    public function index()
    {
       $placeholders = Placeholder::get()->toarray();
        $response = array(
            "success" => true,
            "data" => $placeholders,
        );
        
        return response()->json($response);
    }

}
