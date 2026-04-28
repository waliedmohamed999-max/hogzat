<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Sentinel;

class Menu extends Model
{
    protected $table = 'menu';
    protected $primaryKey = 'menu_id';
    public $timestamps = false;
    protected $guarded = [];

    public function resetMenuLocation($menu_location){
        return DB::table($this->getTable())->where('menu_position', $menu_location)->update([
            'menu_position' => ''
        ]);
    }

    public function deleteMenu($menu_id)
    {
        return DB::table($this->table)->where('menu_id', $menu_id)->delete();
    }

    public function updateMenu($menu_id, $data)
    {
        return DB::table($this->getTable())->where('menu_id', $menu_id)->update($data);
    }

    public function hasMenuLocation($menu_type = 'primary'){
        $count = DB::table($this->getTable())->selectRaw('COUNT(*) as row_count')->where('menu_position', $menu_type)->get()[0]->row_count;
        if($count > 0){
            return true;
        }
        return false;
    }

    public function getByWhere($where)
    {
        $menu = DB::table($this->table)->where($where)->get();
        return $menu;
    }

    public function getById($menu_id)
    {
        $menu = DB::table($this->table)->where('menu_id', $menu_id)->get()->first();
        return $menu;
    }

    public function getMenuByLocation($location){
        $query = DB::table($this->table)->where('menu_position', $location);
        if (DB::getSchemaBuilder()->hasColumn($this->table, 'is_active')) {
            $query->where('is_active', 1);
        }
        $menu = $query->get()->first();
        return $menu;
    }

    public function createMenu($data = [])
    {
        return DB::table($this->getTable())->insertGetId($data);
    }

    public function getAllMenus($data = [])
    {
       $sql = DB::table($this->getTable())->select();
       if (!empty($data['active_only']) && DB::getSchemaBuilder()->hasColumn($this->getTable(), 'is_active')) {
           $sql->where('is_active', 1);
       }
       if (!empty($data['location'])) {
           $sql->where('menu_position', $data['location']);
       }
       $results = $sql->get();
       return (!empty($results) && is_object($results)) ? $results : false;
    }
}
