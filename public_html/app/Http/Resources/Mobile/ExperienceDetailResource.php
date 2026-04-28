<?php

namespace App\Http\Resources\Mobile;

use Illuminate\Http\Resources\Json\JsonResource;

class ExperienceDetailResource extends JsonResource
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

        return [
            'id' => (int)($this->post_id ?? 0),
            'title' => get_translate($this->post_title ?? '', 1),
            'description' => get_translate($this->post_content ?? '', 1),
            'images' => $gallery,
            'price' => (float)($this->base_price ?? 0),
            'rating' => (float)($this->rating ?? 0),
            'city' => get_translate($this->location_city ?? '', 1),
            'status' => $this->status ?? '',
            'created_at' => isset($this->created_at) ? (string)$this->created_at : null,
            'deeplink' => 'app://experiences/' . (int)($this->post_id ?? 0),
        ];
    }
}
