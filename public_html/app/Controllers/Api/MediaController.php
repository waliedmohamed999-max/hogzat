<?php

namespace App\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\User;
use App\Models\Media;
class MediaController extends APIController
{
	public function __construct() {

	}

	public function store(){

    }
    
	public function getUserAvatar($id)  
	{   $user=User::find($id);
	    $avatar=Media::where('media_id','=',$user->avatar)->first();
	    return $avatar->media_url;
    	    

    }
    
}
