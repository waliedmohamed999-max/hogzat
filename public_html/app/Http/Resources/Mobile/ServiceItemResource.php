<?php

namespace App\Http\Resources\Mobile;

use Illuminate\Http\Resources\Json\JsonResource;

class ServiceItemResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'key' => $this['key'] ?? '',
            'title' => $this['title'] ?? '',
            'type' => $this['type'] ?? 'web',
            'target' => $this['target'] ?? null,
            'endpoint' => $this['endpoint'] ?? null,
        ];
    }
}
