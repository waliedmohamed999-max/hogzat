<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;
use Sentinel;

class NotificationsBridgeController extends Controller
{
    public function index(Request $request)
    {
        $user = Sentinel::getUser();
        if (!$user) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $page = max(1, (int)$request->get('page', 1));
        $perPage = min(20, max(1, (int)$request->get('per_page', posts_per_page())));

        $model = new Notification();
        $unread = $model->countNotificationByUser($user->id, 'to');
        $notifications = $model->allNotifications([
            'page' => $page,
            'number' => $perPage,
            'user_id' => $user->id,
            'user_type' => 'user_to',
        ]);

        update_user_meta($user->id, 'last_check_notification', time());

        return response()->json([
            'status' => 1,
            'data' => [
                'total' => (int)($notifications['total'] ?? 0),
                'page' => $page,
                'per_page' => $perPage,
                'unread_count' => (int)($unread['total'] ?? 0),
                'results' => collect($notifications['results'] ?? [])->map(function ($item) {
                    return [
                        'id' => (int)$item->ID,
                        'type' => $item->type ?? 'global',
                        'title' => trim(strip_tags(balanceTags($item->title ?? ''))),
                        'time_ago' => balanceTags(get_time_since($item->created_at)),
                        'created_at' => !empty($item->created_at) ? date('Y-m-d H:i', $item->created_at) : '',
                        'icon' => $this->resolveIcon($item->type ?? ''),
                    ];
                })->values()->all(),
            ],
        ]);
    }

    public function delete($id)
    {
        $user = Sentinel::getUser();
        if (!$user) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $notification = \DB::table('notification')
            ->where('ID', (int) $id)
            ->where('user_to', $user->id)
            ->first();

        if (!$notification) {
            return response()->json(['status' => 0, 'message' => __('Can not delete this notification')], 404);
        }

        $deleted = (new Notification())->deleteNotification((int) $id);
        return response()->json([
            'status' => $deleted ? 1 : 0,
            'message' => $deleted ? __('Deleted successfully') : __('Can not delete this notification'),
        ], $deleted ? 200 : 422);
    }

    private function resolveIcon($type)
    {
        if ($type === 'booking') {
            return 'calendar';
        }

        if ($type === 'global') {
            return 'shield';
        }

        return 'bell';
    }
}
