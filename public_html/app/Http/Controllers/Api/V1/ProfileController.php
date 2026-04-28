<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Sentinel;

class ProfileController extends Controller
{
    public function show()
    {
        $user = Sentinel::getUser();
        if (!$user) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        return response()->json([
            'status' => 1,
            'data' => $this->mapProfile($user),
        ]);
    }

    public function update(Request $request)
    {
        $user = Sentinel::getUser();
        if (!$user) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $validator = Validator::make($request->all(), [
            'first_name' => ['required', 'string', 'max:120'],
            'last_name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:180', 'unique:users,email,' . $user->id],
            'location' => ['nullable', 'string', 'max:180'],
            'address' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'trade_name' => ['nullable', 'string', 'max:180'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => $validator->errors()->first(),
            ], 422);
        }

        $payload = [
            'first_name' => trim((string)$request->get('first_name')),
            'last_name' => trim((string)$request->get('last_name')),
            'email' => trim((string)$request->get('email')),
            'location' => trim((string)$request->get('location', '')),
            'address' => trim((string)$request->get('address', '')),
            'description' => trim((string)$request->get('description', '')),
            'trade_name' => trim((string)$request->get('trade_name', '')),
        ];

        $userModel = new User();
        $updated = $userModel->updateUser($user->id, $payload);

        if (is_null($updated)) {
            return response()->json([
                'status' => 0,
                'message' => __('Can not update this user. Try again!'),
            ], 500);
        }

        $fresh = get_user_by_id($user->id);

        return response()->json([
            'status' => 1,
            'message' => __('Updated successfully'),
            'data' => $this->mapProfile($fresh),
        ]);
    }

    public function updatePassword(Request $request)
    {
        $user = Sentinel::getUser();
        if (!$user) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $validator = Validator::make($request->all(), [
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => $validator->errors()->first(),
            ], 422);
        }

        Sentinel::update($user, [
            'password' => trim((string)$request->get('password')),
        ]);

        return response()->json([
            'status' => 1,
            'message' => __('Updated password successfully'),
        ]);
    }

    private function mapProfile($user)
    {
        $roles = [];

        if (method_exists($user, 'roles')) {
            try {
                $roles = $user->roles()->pluck('slug')->all();
            } catch (\Throwable $throwable) {
                $roles = [];
            }
        }

        return [
            'id' => (int)$user->id,
            'email' => $user->email ?? '',
            'mobile' => $user->mobile ?? '',
            'first_name' => $user->first_name ?? '',
            'last_name' => $user->last_name ?? '',
            'display_name' => trim(($user->first_name ?? '') . ' ' . ($user->last_name ?? '')) ?: get_username($user->id),
            'location' => $user->location ?? '',
            'address' => $user->address ?? '',
            'description' => $user->description ?? '',
            'trade_name' => $user->trade_name ?? '',
            'avatar' => get_user_avatar($user->id),
            'roles' => $roles,
            'dashboard_url' => dashboard_url(),
        ];
    }
}
