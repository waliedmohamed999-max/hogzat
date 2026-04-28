<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use App\Models\HomeAvailability;

class LastMinute extends Model
{
    protected $table = 'last_minute';
    protected $primaryKey = 'id';

    public function createLAstHome($data = [])
    {
        $updateItem = DB::table($this->getTable())->where('home_id', $data['home_id'])->first();
        if ( $updateItem != null) {
            return DB::table($this->getTable())->where('home_id', $data['home_id'])->update($data);
        } else {
            return DB::table($this->getTable())->insertGetId($data);
        }
    }
    
      public function checkItemAndDelete()
    {date_default_timezone_set("Asia/Riyadh");
          $today =date('Y-m-d', time());
        return DB::table($this->getTable())->where('creattted_at','<', $today)->delete();
    }
    
       public function getHomeItem($id)
    {
             $sql = DB::table($this->getTable())->selectRaw("SQL_CALC_FOUND_ROWS *");
                    $sql->whereRaw("last_minute.home_id = $id");
                        $sql->Join('home', function ($join)  {
                            $join->on('last_minute.home_id', '=', 'home.post_id');
                        });
                    $results = $sql->first();
                  return $results;
    }
    
      public function checkBookingLast($idlast)
    {
           $sql = DB::table($this->getTable())->whereRaw("id = {$idlast} ")->first();

         $avai_model = new HomeAvailability();
                 $avaiItems = $avai_model->getAvailabilityItems($sql->home_id, strtotime(date('Y-m-d', strtotime($sql->creattted_at . " +1 days"))),
                 strtotime(date('Y-m-d', strtotime($sql->creattted_at . " +2 days"))));
              
                 if($avaiItems['total'] == 0){
                 return null;
                 }else{ return 1 ;}
              
      
      
    }

}
