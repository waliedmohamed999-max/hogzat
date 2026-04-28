<?php

namespace App\Http\Resources\Mobile;

use Illuminate\Http\Resources\Json\JsonResource;

class ServiceSectionResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'key' => $this['key'] ?? '',
            'title' => $this['title'] ?? '',
            'icon' => $this['icon'] ?? '',
            'items' => ServiceItemResource::collection($this['items'] ?? []),
        ];
    }
}
