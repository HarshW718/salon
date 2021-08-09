<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Images;
use App\Http\Controllers\Middleweb_Controller;

class ImagesController extends Middleweb_Controller
{

    public function images_by_customer_id($customer_id)
    {

        $images = Images::where('customer_id', $customer_id)->get()->toArray();
        $collection = collect($images);
        $images_chunks = $collection->chunk(4);
        $images_chunks->toArray();
        $response = array(
            "success" => true,
            "data" => $images_chunks,
        );
        return json_encode($response);
    }

    public function destroySelectedImages(Request $request)
    {
        $ids = $request->all();
        Images::whereIn('id', $ids)->delete();
        $response = array(
            "success" => true,
            "message" => "Selected images delete successfully.",
        );
        return response()->json($response);
    }
}
