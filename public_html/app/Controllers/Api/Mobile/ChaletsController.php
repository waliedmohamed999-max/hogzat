<?php

namespace App\Controllers\Api\Mobile;

use App\Controllers\Api\APIController;
use App\Http\Resources\Mobile\ChaletDetailResource;
use App\Http\Resources\Mobile\ChaletListResource;
use App\Models\Home;
use App\Models\HomeAvailability;
use App\Models\HomePrice;
use App\Models\LastMinute;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ChaletsController extends APIController
{
    private $model;

    public function __construct()
    {
        $this->model = new Home();
    }

    public function index(Request $request)
    {
        $user = get_user_by_access_token($request->bearerToken());
        if (!$user) {
            return $this->sendJson([
                'status' => 0,
                'message' => __('Invalid token'),
            ]);
        }

        $rules = [
            'page' => 'integer|min:1',
            'city' => 'string',
            'from' => 'date',
            'to' => 'date',
            'guests' => 'integer|min:1',
            'price_min' => 'numeric',
            'price_max' => 'numeric',
            'amenities' => 'array',
            'filter' => 'string',
            'search' => 'string',
            'orderby' => 'string',
            'order' => 'string',
            'status' => 'string',
            'number' => 'integer|min:1',
        ];
        $validator = Validator::make($request->all(), $rules);
        if ($validator->fails()) {
            return $this->sendJson([
                'status' => 0,
                'message' => $validator->errors(),
            ]);
        }

        $price_filter = '';
        $price_min = $request->get('price_min');
        $price_max = $request->get('price_max');
        if (!is_null($price_min) || !is_null($price_max)) {
            $price_filter = floatval($price_min) . ';' . floatval($price_max);
        }

        $amenities = $request->get('amenities', []);
        $amenities_value = '';
        if (is_array($amenities) && !empty($amenities)) {
            $amenities_value = implode(',', $amenities);
        }

        $data = [
            'page' => $request->get('page', 1),
            'address' => $request->get('city', ''),
            'checkIn' => $request->get('from', ''),
            'checkOut' => $request->get('to', ''),
            'num_adults' => $request->get('guests', 0),
            'price_filter' => $price_filter,
            'home-amenity' => $amenities_value,
        ];

        $status = $request->get('status', []);
        if (is_string($status)) {
            $status = array_filter(array_map('trim', explode(',', $status)));
        }
        if (!is_array($status)) {
            $status = [];
        }

        $dashboardData = [
            'search' => $request->get('search', ''),
            'orderby' => $request->get('orderby', 'post_id'),
            'order' => $request->get('order', 'desc'),
            'status' => $status,
            'page' => $request->get('page', 1),
            'number' => $request->get('number', posts_per_page()),
            'author' => $user->id,
            'author_override' => true,
        ];

        if ($request->get('filter') === 'last_minute') {
            $dashboardData['last'] = true;
            $allHomes = $this->model->getAllHomes($dashboardData);

            $tomorrow = strtotime(date("Y-m-d", strtotime('tomorrow')));
            $price_model = new HomePrice();
            $lastMinute = new LastMinute();
            $avai_model = new HomeAvailability();

            $count = 0;
            $items = [];
            foreach ($allHomes['results'] as $value) {
                $price_model->getLastMinute($tomorrow, 'on', $value->post_id);
                $avaiItems = $avai_model->getLastAvailabilityItems($value->post_id, $tomorrow);
                if ($avaiItems['total'] == 0) {
                    $Last = $lastMinute->getHomeItem($value->post_id);
                    if ($Last != null) {
                        $value = (object)$Last;
                    } else {
                        $value = (object)$value;
                    }
                    $items[] = $value;
                    $count++;
                }
            }
            $posts = [
                'total' => $count,
                'results' => $items,
            ];
        } else {
            $posts = $this->model->getAllHomes($dashboardData);
        }

        $etag = $this->buildEtag('chalets', $request->all());
        $clientEtag = $request->headers->get('If-None-Match');
        if ($clientEtag && $clientEtag === $etag) {
            return response('', 304)->header('ETag', $etag);
        }

        return $this->sendJson([
            'status' => 1,
            'data' => ChaletListResource::collection($posts['results'] ?? []),
            'meta' => [
                'total' => $posts['total'] ?? 0,
                'page' => (int)$request->get('page', 1),
            ],
        ])->header('ETag', $etag)->header('Cache-Control', 'private, max-age=60');
    }

    public function show($id, Request $request)
    {
        $user = get_user_by_access_token($request->bearerToken());
        if (!$user) {
            return $this->sendJson([
                'status' => 0,
                'message' => __('Invalid token'),
            ]);
        }

        $data = $this->model->getById($id);
        if (!$data) {
            return $this->sendJson([
                'status' => 0,
                'message' => __('Data is invalid'),
            ]);
        }
        if ((int)$data->author !== (int)$user->id) {
            return $this->sendJson([
                'status' => 0,
                'message' => __('Data is invalid'),
            ]);
        }

        $etag = '"' . md5(($data->updated_at ?? $data->created_at ?? '') . ':' . $id) . '"';
        $clientEtag = $request->headers->get('If-None-Match');
        if ($clientEtag && $clientEtag === $etag) {
            return response('', 304)->header('ETag', $etag);
        }

        return $this->sendJson([
            'status' => 1,
            'data' => new ChaletDetailResource($data),
        ])->header('ETag', $etag)->header('Cache-Control', 'private, max-age=60');
    }

    public function ads(Request $request)
    {
        return $this->index($request);
    }

    public function showAd($id, Request $request)
    {
        return $this->show($id, $request);
    }

    private function buildEtag($prefix, $params = [])
    {
        $homeUpdated = DB::table('home')->max(DB::raw('COALESCE(updated_at, created_at)'));
        $payload = json_encode([
            'prefix' => $prefix,
            'params' => $params,
            'homeUpdated' => $homeUpdated,
        ]);
        return '"' . md5($payload ?: '') . '"';
    }
}
