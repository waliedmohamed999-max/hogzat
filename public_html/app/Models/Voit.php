<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Voit extends Model
{
    
    protected $table = 'voits';
    protected $fillable = [
        'name',
        'start_date',
        'status',
        'end_date',
        'event_date',
        'image',
         'per',
        'experienceID'
    ];

    public function updateVote($vote_id, $data)
    {
        return DB::table($this->getTable())->where('id', $vote_id)->update($data);
    }
    
       public function experience(){
        return $this->belongsTo('App\Models\Experience' , 'experienceID');
    }
    
    public function getById($experience_id)
    {
        $post = DB::table($this->table)->where('id', $experience_id)->get()->first();
        return (!empty($post) && is_object($post)) ? $post : null;
    }
}
