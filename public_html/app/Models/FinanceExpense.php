<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FinanceExpense extends Model
{
    protected $fillable = [
        'category',
        'title',
        'description',
        'amount',
        'vat_amount',
        'currency',
        'expense_date',
        'attachment_path',
        'created_by',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'vat_amount' => 'decimal:2',
        'expense_date' => 'date',
    ];
}
