<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function me(Request $request)
    {
        $token = $request->bearerToken();
        if (!$token) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $user = get_user_by_access_token($token);
        if (!$user) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        return response()->json([
            'status' => 1,
            'data' => [
                'id' => (int)$user->id,
                'name' => trim(($user->first_name ?? '') . ' ' . ($user->last_name ?? '')),
                'email' => $user->email ?? '',
                'mobile' => $user->mobile ?? '',
                'avatar' => $user->avatar && function_exists('get_attachment_url')
                    ? get_attachment_url($user->avatar)
                    : '',
            ],
        ]);
    }
}
