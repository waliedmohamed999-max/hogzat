<?php

namespace App\Controllers\Api;

use App\Models\Home;
use App\Models\HomeAvailability;
use App\Models\HomePrice;
use App\Models\Comment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PropertyController extends APIController
{
    protected $model;

    public function __construct()
    {
        $this->model = new Home();
    }

    public function index(Request $request)
    {
        $rules = [
            'page' => 'integer|min:1',
            'city' => 'string',
            'from' => 'date',
            'to' => 'date',
            'guests' => 'integer|min:1',
            'price_min' => 'numeric',
            'price_max' => 'numeric',
            'amenities' => 'array',
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

        $posts = $this->model->getSearchResult($data);
        $results = [];
        if ($posts['total'] > 0) {
            foreach ($posts['results'] as $item) {
                $results[] = [
                    'id' => $item->post_id,
                    'title' => get_translate($item->post_title, 1),
                    'price_from' => (float)$item->base_price,
                    'rating' => (float)$item->rating,
                    'thumb' => get_attachment_url($item->thumbnail_id),
                    'city' => get_translate($item->location_city, 1),
                    'lat' => (float)$item->location_lat,
                    'lng' => (float)$item->location_lng,
                    'capacity' => (int)$item->number_of_guest,
                    'is_featured' => $item->is_featured == 'on',
                ];
            }
        }

        return $this->sendJson([
            'status' => 1,
            'data' => $results,
            'meta' => [
                'total' => $posts['total'],
                'page' => (int)$request->get('page', 1),
            ],
        ]);
    }

    public function show($id, Request $request)
    {
        $data = $this->model->getById($id);
        if (!$data) {
            return $this->sendJson([
                'status' => 0,
                'message' => __('Data is invalid'),
            ]);
        }

        $gallery = [];
        if (!empty($data->gallery)) {
            $gallery_ids = explode(',', $data->gallery);
            foreach ($gallery_ids as $gallery_id) {
                $gallery[] = get_attachment_url($gallery_id);
            }
        }

        $amenities = [];
        if (!empty($data->amenities)) {
            $amenity_ids = explode(',', $data->amenities);
            foreach ($amenity_ids as $amenity_id) {
                $term = get_term_by('id', $amenity_id);
                if ($term) {
                    $amenities[] = [
                        'id' => (int)$term->term_id,
                        'name' => get_translate($term->term_title, 1),
                    ];
                }
            }
        }

        $payload = [
            'id' => $data->post_id,
            'title' => get_translate($data->post_title, 1),
            'description' => get_translate($data->post_content, 1),
            'rules' => get_translate($data->cancellation_detail, 1),
            'images' => $gallery,
            'amenities' => $amenities,
            'location' => [
                'lat' => (float)$data->location_lat,
                'lng' => (float)$data->location_lng,
                'address' => get_translate($data->location_address, 1),
                'city' => get_translate($data->location_city, 1),
            ],
            'units' => [
                [
                    'id' => $data->post_id,
                    'name' => get_translate($data->post_title, 1),
                    'capacity' => (int)$data->number_of_guest,
                    'base_price' => (float)$data->base_price,
                ],
            ],
            'rating' => (float)$data->rating,
            'booking_type' => $data->booking_type,
        ];

        return $this->sendJson([
            'status' => 1,
            'data' => $payload,
        ]);
    }

    public function availability($id, Request $request)
    {
        $rules = [
            'from' => 'required|date',
            'to' => 'required|date',
        ];
        $validator = Validator::make($request->all(), $rules);
        if ($validator->fails()) {
            return $this->sendJson([
                'status' => 0,
                'message' => $validator->errors(),
            ]);
        }

        $start_time = strtotime($request->get('from'));
        $end_time = strtotime($request->get('to'));

        $price_model = new HomePrice();
        $avai_model = new HomeAvailability();
        $homeObject = \App\Controllers\Services\HomeController::get_inst()->getById($id);

        if (!$homeObject) {
            return $this->sendJson([
                'status' => 0,
                'message' => __('Data is invalid'),
            ]);
        }

        $events = [];
        $price = (float)$homeObject->base_price;
        $wprice = $homeObject->weekend_price;
        $ruleWeekend = $homeObject->weekend_to_apply;

        if ($homeObject->booking_type == 'per_night') {
            $end_time = strtotime('-1 day', $end_time);
            $priceItems = $price_model->getPriceItems($id, $start_time, $end_time, $status = 'on');
            $avaiItems = $avai_model->getAvailabilityItems($id, $start_time, $end_time);

            for ($i = $start_time; $i <= $end_time; $i = strtotime('+1 day', $i)) {
                $status = 'available';
                $event_price = $price;
                $inCustom = false;

                foreach ($avaiItems['results'] as $avaiItem) {
                    if ($i >= $avaiItem->start_date && $i <= $avaiItem->end_date) {
                        if ($avaiItem->booking_id == 0 && $avaiItem->total_minutes == 1440) {
                            $status = 'not_available';
                            break;
                        } else {
                            $status = 'booked';
                            break;
                        }
                    }
                }

                if ($status == 'available') {
                    foreach ($priceItems['results'] as $range) {
                        if ($i >= $range->start_time && $i <= $range->end_time) {
                            $event_price = (float)$range->price;
                            $inCustom = true;
                            break;
                        }
                    }
                }

                if (!$inCustom && !is_null($wprice) && is_weekend($i, $ruleWeekend)) {
                    $event_price = (float)$wprice;
                }

                $events[] = [
                    'date' => date('Y-m-d', $i),
                    'available' => $status === 'available',
                    'price' => $event_price,
                ];
            }
        }

        return $this->sendJson([
            'status' => 1,
            'data' => $events,
        ]);
    }

    public function reviews($id, Request $request)
    {
        $post = get_post($id, 'home');
        if (!$post) {
            return $this->sendJson([
                'status' => 0,
                'message' => __('Data is invalid'),
            ]);
        }

        $comments = get_comment_list($id, [
            'number' => $request->get('number', comments_per_page()),
            'page' => $request->get('page', 1),
            'type' => 'home',
        ]);

        return $this->sendJson([
            'status' => 1,
            'data' => $comments,
        ]);
    }

    public function amenities($id)
    {
        $data = $this->model->getById($id);
        if (!$data) {
            return $this->sendJson([
                'status' => 0,
                'message' => __('Data is invalid'),
            ]);
        }

        $amenities = [];
        if (!empty($data->amenities)) {
            $amenity_ids = explode(',', $data->amenities);
            foreach ($amenity_ids as $amenity_id) {
                $term = get_term_by('id', $amenity_id);
                if ($term) {
                    $amenities[] = [
                        'id' => (int)$term->term_id,
                        'name' => get_translate($term->term_title, 1),
                    ];
                }
            }
        }

        return $this->sendJson([
            'status' => 1,
            'data' => $amenities,
        ]);
    }
}
