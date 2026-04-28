<?php

namespace App\Http\Requests\Finance;

use Illuminate\Foundation\Http\FormRequest;
use Sentinel;

class FinanceSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool)Sentinel::getUser();
    }

    public function rules(): array
    {
        return [
            'currency' => ['nullable', 'string', 'max:10'],
            'vat_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'invoice_prefix' => ['nullable', 'string', 'max:20'],
            'zatca_enabled' => ['nullable', 'boolean'],
            'zatca_environment' => ['nullable', 'in:sandbox,production'],
            'gateways' => ['nullable', 'array'],
        ];
    }
}
