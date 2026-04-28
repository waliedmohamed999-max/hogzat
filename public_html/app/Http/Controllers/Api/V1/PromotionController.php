<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Experience;
use App\Models\Home;

class PromotionController extends Controller
{
    public function featured()
    {
        return $this->listByType('featured');
    }

    public function sponsored()
    {
        return $this->listByType('sponsored');
    }

    private function listByType($type)
    {
        $products = [];

        if ($type === 'featured') {
            $products = $this->featuredListings();
        } elseif ($type === 'sponsored') {
            $products = $this->sponsoredListings();
        }

        return response()->json([
            'status' => 1,
            'data' => $products,
        ]);
    }

    private function featuredListings()
    {
        $homeModel = new Home();
        $experienceModel = new Experience();

        $homes = $homeModel->listOfHomes([
            'is_featured' => 'on',
            'number' => 4,
            'orderby' => 'post_id',
            'order' => 'desc',
        ]);

        $experiences = $experienceModel->listOfExperiences([
            'is_featured' => 'on',
            'number' => 2,
            'orderby' => 'post_id',
            'order' => 'desc',
        ]);

        $items = [];
        foreach ($homes['results'] as $item) {
            $items[] = $this->mapListing($item, 'home', 'featured');
        }
        foreach ($experiences['results'] as $item) {
            $items[] = $this->mapListing($item, 'experience', 'featured');
        }

        return $items;
    }

    private function sponsoredListings()
    {
        $homeModel = new Home();
        $homes = $homeModel->getSearchResult([
            'page' => 1,
            'number' => 6,
            'offer' => 'on',
        ]);

        $items = [];
        foreach ($homes['results'] as $item) {
            $items[] = $this->mapListing($item, 'home', 'sponsored');
        }

        return $items;
    }

    private function mapListing($item, $type, $promotion)
    {
        return [
            'id' => (int)$item->post_id,
            'type' => $type,
            'slug' => $item->post_slug ?? '',
            'title' => get_translate($item->post_title, 1),
            'rating' => isset($item->rating) ? (float)$item->rating : 0,
            'city' => get_translate($item->location_city ?? '', 1),
            'thumb' => get_attachment_url($item->thumbnail_id) ?? '',
            'price_from' => (float)($item->base_price ?? 0),
            'guests' => (int)($item->number_of_guest ?? 0),
            'bedrooms' => (int)($item->number_of_bedrooms ?? 0),
            'baths' => (float)($item->number_of_bathrooms ?? 0),
            'promotion' => $promotion,
            'is_featured' => ($item->is_featured ?? '') === 'on',
            'use_offer' => ($item->use_offer ?? '') === 'on',
            'offer_percent' => (int)($item->offer ?? 0),
        ];
    }
}
