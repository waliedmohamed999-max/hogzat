<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FinanceInvoice extends Model
{
    protected $fillable = [
        'invoice_number',
        'booking_id',
        'booking_table',
        'customer_id',
        'customer_name',
        'customer_email',
        'customer_phone',
        'subtotal',
        'vat_rate',
        'vat_amount',
        'total',
        'currency',
        'status',
        'issued_at',
        'lines',
        'meta',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'vat_rate' => 'decimal:3',
        'vat_amount' => 'decimal:2',
        'total' => 'decimal:2',
        'lines' => 'array',
        'meta' => 'array',
        'issued_at' => 'datetime',
    ];
}
