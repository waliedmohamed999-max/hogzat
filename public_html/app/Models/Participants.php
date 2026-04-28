<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Participants extends Model
{
      
    protected $fillable = [
        'name',
           'link',
        'age',
        'type',
        'image',
        'userID',
        'experienceID',
    ];

    public function user(){
        return $this->belongsTo('App\Models\User' , 'userID');
    }
    public function experience(){
        return $this->belongsTo('App\Models\Experience' , 'experienceID');
    }
}
