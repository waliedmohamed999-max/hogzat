<?php

namespace App\Http\Resources\Mobile;

use Illuminate\Http\Resources\Json\JsonResource;

class ChaletDetailResource extends JsonResource
{
    public function toArray($request)
    {
        $gallery = [];
        if (!empty($this->gallery)) {
            $gallery_ids = explode(',', $this->gallery);
            foreach ($gallery_ids as $gallery_id) {
                $gallery[] = get_attachment_url($gallery_id);
            }
        }
        if (empty($gallery)) {
            $thumb = get_attachment_url($this->thumbnail_id ?? '');
            if (!empty($thumb)) {
                $gallery[] = $thumb;
            }
        }

        $amenities = [];
        if (!empty($this->amenities)) {
            $amenity_ids = explode(',', $this->amenities);
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

        return [
            'id' => (int)($this->post_id ?? 0),
            'title' => get_translate($this->post_title ?? '', 1),
            'description' => get_translate($this->post_content ?? '', 1),
            'images' => $gallery,
            'price' => (float)($this->base_price ?? 0),
            'rating' => (float)($this->rating ?? 0),
            'city' => get_translate($this->location_city ?? '', 1),
            'amenities' => $amenities,
            'status' => $this->status ?? '',
            'created_at' => isset($this->created_at) ? (string)$this->created_at : null,
            'deeplink' => 'app://chalets/' . (int)($this->post_id ?? 0),
        ];
    }
}
