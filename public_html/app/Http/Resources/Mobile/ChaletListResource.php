<?php

namespace App\Http\Resources\Mobile;

use Illuminate\Http\Resources\Json\JsonResource;

class ChaletListResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => (int)($this->post_id ?? 0),
            'title' => get_translate($this->post_title ?? '', 1),
            'price' => (float)($this->base_price ?? 0),
            'rating' => (float)($this->rating ?? 0),
            'thumb' => get_attachment_url($this->thumbnail_id ?? ''),
            'city' => get_translate($this->location_city ?? '', 1),
            'status' => $this->status ?? '',
            'deeplink' => 'app://chalets/' . (int)($this->post_id ?? 0),
        ];
    }
}
