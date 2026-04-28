<?php

namespace App\Controllers\Api;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;

class NotificationController extends APIController
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

        $noti_model = new Notification();
        $data = $noti_model->allNotifications([
            'user_id' => $user_id,
            'user_type' => 'user_to',
            'page' => $request->get('page', 1),
            'number' => $request->get('number', posts_per_page()),
        ]);

        return $this->sendJson([
            'status' => 1,
            'data' => $data['results'],
            'meta' => [
                'total' => $data['total'],
                'page' => (int)$request->get('page', 1),
            ],
        ]);
    }
}
