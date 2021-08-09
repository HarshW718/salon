<?php

namespace App\Http\Middleware;

use Closure;
use App\Models\User;
use Response;

class ApiAuthentication
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        if($request->header('authtoken')){
			$token = $request->header('authtoken');
			$userData = User::where(array('auth_token' => $token))->first();
			if (isset($userData)) {
				if($userData->role == 1) {
					$arr=array('user_id'=>$userData->admin_id);
					$request->attributes->add(['user_id' => $userData->admin_id]);
				} else {
					$arr=array('user_id'=>$userData->user_id);
					$request->attributes->add(['user_id' => $userData->user_id]);
				}
				return $next($request);
			} else {
				return Response::json(['error' => true,'message'=>"Auth token not match"], 401);
			} 
		} else {
			return Response::json(['error' => true,'message'=>"Autho token not get."], 401);
		}
    }
}
