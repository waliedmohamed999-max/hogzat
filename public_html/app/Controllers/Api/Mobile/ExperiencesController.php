<?php

namespace App\Controllers\Api\Mobile;

use App\Controllers\Api\APIController;
use App\Http\Resources\Mobile\ExperienceDetailResource;
use App\Http\Resources\Mobile\ExperienceListResource;
use App\Models\Experience;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ExperiencesController extends APIController
{
    private $model;

    public function __construct()
    {
        $this->model = new Experience();
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
            'search' => 'string',
            'orderby' => 'string',
            'order' => 'string',
            'status' => 'string',
            'vote' => 'string',
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
            'vote' => $request->get('vote', ''),
            'page' => $request->get('page', 1),
            'number' => $request->get('number', posts_per_page()),
            'author' => $user->id,
            'author_override' => true,
        ];

        $posts = $this->model->getAllExperiences($dashboardData);

        $etag = $this->buildEtag('experiences', $request->all());
        $clientEtag = $request->headers->get('If-None-Match');
        if ($clientEtag && $clientEtag === $etag) {
            return response('', 304)->header('ETag', $etag);
        }

        return $this->sendJson([
            'status' => 1,
            'data' => ExperienceListResource::collection($posts['results'] ?? []),
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
            'data' => new ExperienceDetailResource($data),
        ])->header('ETag', $etag)->header('Cache-Control', 'private, max-age=60');
    }

    private function buildEtag($prefix, $params = [])
    {
        $expUpdated = DB::table('experience')->max(DB::raw('COALESCE(updated_at, created_at)'));
        $payload = json_encode([
            'prefix' => $prefix,
            'params' => $params,
            'expUpdated' => $expUpdated,
        ]);
        return '"' . md5($payload ?: '') . '"';
    }
}
