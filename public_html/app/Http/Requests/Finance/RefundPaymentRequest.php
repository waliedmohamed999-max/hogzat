<?php

namespace App\Http\Requests\Finance;

use Illuminate\Foundation\Http\FormRequest;
use Sentinel;

class RefundPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool)Sentinel::getUser();
    }

    public function rules(): array
    {
        return [
            'booking_id' => ['required', 'integer'],
            'booking_table' => ['nullable', 'in:booking,bookings'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'reason' => ['nullable', 'string', 'max:255'],
        ];
    }
}
