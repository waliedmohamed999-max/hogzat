<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentWebhookEvent extends Model
{
    protected $fillable = [
        'gateway',
        'event_id',
        'event_type',
        'status',
        'payload',
        'error_message',
    ];

    protected $casts = [
        'payload' => 'array',
    ];
}
