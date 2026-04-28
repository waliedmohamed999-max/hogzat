<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FinanceLedgerEntry extends Model
{
    protected $fillable = [
        'type',
        'amount',
        'vat_amount',
        'net_amount',
        'currency',
        'source',
        'reference_type',
        'reference_id',
        'user_id',
        'description',
        'meta',
        'entry_date',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'vat_amount' => 'decimal:2',
        'net_amount' => 'decimal:2',
        'meta' => 'array',
        'entry_date' => 'datetime',
    ];
}
