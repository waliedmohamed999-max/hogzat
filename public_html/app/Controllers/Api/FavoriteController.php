<?php

namespace App\Controllers\Api;

use App\Models\Favourite;
use App\Models\User;
use App\Models\Home;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FavoriteController extends APIController
{
    public function index(Request $request)
    {
        $token = $request->bearerToken();
        $user_model = new User();
        $user_id = $user_model->getUserIDByToken($token);
        if (!$user_id) {
            return $this->sendJson([
                'status' => 0,
                'message' => __('Data is invalid'),
            ]);
        }

        $user = User::find($user_id);
        $phone = $user ? $user->mobile : '';
        if (empty($phone)) {
            return $this->sendJson([
                'status' => 1,
                'data' => [],
            ]);
        }

        $favorites = DB::table('favourite')
            ->join('home', 'favourite.id_ads', '=', 'home.post_id')
            ->where('favourite.phone_faved_user', '=', $phone)
            ->where('favourite.isFav', '=', '1')
            ->select('home.*')
            ->get();

        return $this->sendJson([
            'status' => 1,
            'data' => $favorites,
        ]);
    }

    public function toggle($propertyId, Request $request)
    {
        $token = $request->bearerToken();
        $user_model = new User();
        $user_id = $user_model->getUserIDByToken($token);
        if (!$user_id) {
            return $this->sendJson([
                'status' => 0,
                'message' => __('Data is invalid'),
            ]);
        }

        $user = User::find($user_id);
        $phone = $user ? $user->mobile : '';
        if (empty($phone)) {
            return $this->sendJson([
                'status' => 0,
                'message' => __('Mobile is required'),
            ]);
        }

        $favorite = Favourite::where('phone_faved_user', '=', $phone)
            ->where('id_ads', '=', $propertyId)
            ->first();

        if ($favorite) {
            $favorite->isFav = $favorite->isFav == '1' ? '0' : '1';
            $favorite->save();
            $is_favorite = $favorite->isFav == '1';
        } else {
            $favorite = new Favourite();
            $favorite->phone_faved_user = $phone;
            $favorite->id_ads = $propertyId;
            $favorite->isFav = '1';
            $favorite->save();
            $is_favorite = true;
        }

        return $this->sendJson([
            'status' => 1,
            'is_favorite' => $is_favorite,
        ]);
    }
}
