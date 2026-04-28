<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentTransaction extends Model
{
    protected $fillable = [
        'gateway',
        'transaction_id',
        'booking_id',
        'booking_table',
        'amount',
        'currency',
        'status',
        'refund_id',
        'refunded_amount',
        'request_payload',
        'response_payload',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'refunded_amount' => 'decimal:2',
        'request_payload' => 'array',
        'response_payload' => 'array',
    ];
}
