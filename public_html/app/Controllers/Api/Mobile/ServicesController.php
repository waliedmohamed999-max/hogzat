<?php

namespace App\Controllers\Api\Mobile;

use App\Controllers\Api\APIController;
use App\Http\Resources\Mobile\ServiceSectionResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ServicesController extends APIController
{
    public function index(Request $request)
    {
        $user = get_user_by_access_token($request->bearerToken());
        if (!$user) {
            return $this->sendJson([
                'status' => 0,
                'message' => __('Invalid token'),
            ]);
        }

        $menu = $this->resolveMenuByUser($user->id);
        $sections = $this->buildServiceSections($menu);

        $etag = $this->buildEtag($sections);
        $clientEtag = $request->headers->get('If-None-Match');
        if ($clientEtag && $clientEtag === $etag) {
            return response('', 304)->header('ETag', $etag);
        }

        return $this->sendJson([
            'version' => 1,
            'sections' => ServiceSectionResource::collection($sections),
        ])->header('ETag', $etag)->header('Cache-Control', 'private, max-age=60');
    }

    private function resolveMenuByUser($userId)
    {
        if (!empty($userId)) {
            $role = DB::table('role_users')
                ->join('roles', 'roles.id', '=', 'role_users.role_id')
                ->where('role_users.user_id', $userId)
                ->select('roles.slug')
                ->first();
            if ($role && $role->slug === 'partner') {
                return Config::get('awebooking.partner_menu');
            }
            if ($role && $role->slug === 'customer') {
                return Config::get('awebooking.customer_menu');
            }
        }
        return Config::get('awebooking.admin_menu');
    }

    private function buildServiceSections($menu)
    {
        $sections = [];
        if (empty($menu) || !is_array($menu)) {
            return $sections;
        }

        foreach ($menu as $entry) {
            if (!is_array($entry)) {
                continue;
            }
            if (($entry['type'] ?? '') !== 'parent') {
                continue;
            }
            if (!isset($entry['service'])) {
                continue;
            }

            $items = [];
            foreach ($entry['child'] ?? [] as $child) {
                $items[] = $this->mapMenuItem($entry['service'], $child);
            }

            $sections[] = [
                'key' => $entry['service'],
                'title' => $entry['label'] ?? '',
                'icon' => $entry['icon'] ?? '',
                'items' => $items,
            ];
        }

        return $sections;
    }

    private function mapMenuItem($service, $child)
    {
        $screen = $child['screen'] ?? '';
        $label = $child['label'] ?? '';

        $item = [
            'key' => $screen,
            'title' => $label,
            'type' => 'web',
            'target' => dashboard_url($screen),
        ];

        if ($service === 'home') {
            if ($screen === 'add-new-home') {
                $item['type'] = 'action';
                $item['target'] = 'app://chalets/create';
            } elseif ($screen === 'my-home') {
                $item['type'] = 'list';
                $item['endpoint'] = '/api/mobile/chalets';
                $item['target'] = null;
            } elseif ($screen === 'last-Minute-home') {
                $item['type'] = 'list';
                $item['endpoint'] = '/api/mobile/chalets?filter=last_minute';
                $item['target'] = null;
            }
        }

        if ($service === 'experience') {
            if ($screen === 'add-new-experience') {
                $item['type'] = 'action';
                $item['target'] = 'app://experiences/create';
            } elseif ($screen === 'my-experience') {
                $item['type'] = 'list';
                $item['endpoint'] = '/api/mobile/experiences';
                $item['target'] = null;
            }
        }

        return $item;
    }

    private function buildEtag($sections)
    {
        $homeUpdated = DB::table('home')->max(DB::raw('COALESCE(updated_at, created_at)'));
        $expUpdated = DB::table('experience')->max(DB::raw('COALESCE(updated_at, created_at)'));
        $payload = json_encode([
            'sections' => $sections,
            'homeUpdated' => $homeUpdated,
            'expUpdated' => $expUpdated,
        ]);
        return '"' . md5($payload ?: '') . '"';
    }
}
