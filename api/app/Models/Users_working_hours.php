<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class Users_working_hours extends Model
{
    protected $fillable = ['id', 'user_id', 'dayname','from_time','to_time','is_check','created_by','updated_by','updated_at','created_at','from_obj'];
    
    protected $table = 'users_working_hours';
    
    public static function saveWorkingTime($data) {
        $time = new users_working_hours;
        $time->user_id = $data['user_id'];
        $time->dayname = $data['dayname'];
        $time->dayindex = $data['dayindex'];
        $time->is_check = $data['is_check'];
        $time->from_time = $data['from_time'];
        $time->to_time = $data['to_time'];
        $time->created_by =$data['created_by'];
        $time->updated_by =$data['updated_by'];
        $time->from_obj = $data['from_obj'];
        if ($time->save()) {
            return $time;
        }
    }
    public static function getStaffTimes($id){
        $timeData= users_working_hours::select('dayname')->where('user_id',$id)->groupBy('dayname','dayindex')->orderBy('dayindex','ASC')->get()->toArray();
       
        if(!empty($timeData)){
            for($i=0;$i<count($timeData);$i++){
                $slotData= users_working_hours::select('is_check','from_time','to_time')->where('user_id',$id)->where('dayname',$timeData[$i]['dayname'])->get()->toArray();
                $timeData[$i]['timeSlot']=$slotData;
            }
        }
        return $timeData;
    }
    public static function deleteWorkingTime($id){
        return users_working_hours::where('user_id',$id)->delete();
    }
    
    
    
}
