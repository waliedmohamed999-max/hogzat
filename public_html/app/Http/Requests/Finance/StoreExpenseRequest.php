<?php

namespace App\Http\Requests\Finance;

use Illuminate\Foundation\Http\FormRequest;
use Sentinel;

class StoreExpenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool)Sentinel::getUser();
    }

    public function rules(): array
    {
        return [
            'category' => ['required', 'string', 'max:80'],
            'title' => ['required', 'string', 'max:191'],
            'description' => ['nullable', 'string'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'vat_amount' => ['nullable', 'numeric', 'min:0'],
            'currency' => ['nullable', 'string', 'max:10'],
            'expense_date' => ['required', 'date'],
            'attachment' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf,webp', 'max:5120'],
        ];
    }
}
