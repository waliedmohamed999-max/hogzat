<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Car;
use App\Models\Experience;
use App\Models\Favourite;
use App\Models\Home;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Sentinel;

class WishlistController extends Controller
{
    public function index(Request $request)
    {
        $user = Sentinel::getUser();
        if (!$user) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $type = $this->normalizeType($request->get('type'));
        $query = DB::table('favourite')
            ->where('phone_faved_user', $user->id)
            ->where('isFav', '1')
            ->orderByDesc('id_fav');

        if (!empty($type)) {
            $query->where('type', $type);
        }

        $items = [];
        foreach ($query->get() as $favorite) {
            $item = $this->getByType($favorite->type, $favorite->id_ads);
            if ($item) {
                $items[] = $this->mapSummary($item, $favorite->type);
            }
        }

        return response()->json([
            'status' => 1,
            'data' => $items,
        ]);
    }

    public function toggle(Request $request)
    {
        $user = Sentinel::getUser();
        if (!$user) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $request->validate([
            'product_id' => 'required|numeric',
            'type' => 'required|string',
        ]);

        $productId = (int)$request->get('product_id');
        $type = $this->normalizeType($request->get('type', 'home'));

        $existing = Favourite::query()
            ->where('phone_faved_user', $user->id)
            ->where('id_ads', $productId)
            ->where('type', $type)
            ->first();

        if ($existing) {
            $existing->delete();

            return response()->json([
                'status' => 1,
                'data' => [
                    'product_id' => $productId,
                    'type' => $this->publicType($type),
                    'is_favorite' => false,
                ],
            ]);
        }

        $favorite = new Favourite();
        $favorite->isFav = '1';
        $favorite->id_ads = $productId;
        $favorite->phone_faved_user = $user->id;
        $favorite->type = $type;
        $favorite->save();

        return response()->json([
            'status' => 1,
            'data' => [
                'product_id' => $productId,
                'type' => $this->publicType($type),
                'is_favorite' => true,
            ],
        ]);
    }

    private function normalizeType($type)
    {
        if ($type === 'service') {
            return 'car';
        }

        return in_array($type, ['home', 'experience', 'car'], true) ? $type : '';
    }

    private function publicType($type)
    {
        return $type === 'car' ? 'service' : $type;
    }

    private function getByType($type, $id)
    {
        if ($type === 'home') {
            return (new Home())->getById($id);
        }

        if ($type === 'experience') {
            return (new Experience())->getById($id);
        }

        return (new Car())->getById($id);
    }

    private function mapSummary($item, $type)
    {
        return [
            'id' => (int)$item->post_id,
            'type' => $this->publicType($type),
            'slug' => $item->post_slug ?? '',
            'title' => get_translate($item->post_title, 1),
            'price_from' => (float)($item->base_price ?? 0),
            'rating' => isset($item->rating) ? (float)$item->rating : 0,
            'thumb' => get_attachment_url($item->thumbnail_id) ?? '',
            'city' => get_translate($item->location_city ?? '', 1),
            'amenity_ids' => $item->amenities ?? ($item->features ?? ''),
            'guests' => (int)($item->number_of_guest ?? 0),
            'bedrooms' => (int)($item->number_of_bedrooms ?? 0),
            'baths' => (float)($item->number_of_bathrooms ?? 0),
            'is_featured' => ($item->is_featured ?? '') === 'on',
            'use_offer' => ($item->use_offer ?? '') === 'on',
            'offer_percent' => (int)($item->offer ?? 0),
        ];
    }
}
