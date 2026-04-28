<?php

namespace App\Services\Finance;

use App\Models\FinanceSetting;
use Illuminate\Support\Facades\Schema;

class FinanceSettingsService
{
    public function all(): array
    {
        $defaults = $this->defaults();
        if (!Schema::hasTable('finance_settings')) {
            return $defaults;
        }

        $stored = FinanceSetting::query()->pluck('value', 'key')->all();
        foreach ($stored as $key => $value) {
            $decoded = json_decode((string)$value, true);
            $defaults[$key] = json_last_error() === JSON_ERROR_NONE ? $decoded : $value;
        }

        return $defaults;
    }

    public function get(string $key, $default = null)
    {
        $settings = $this->all();
        return array_key_exists($key, $settings) ? $settings[$key] : $default;
    }

    public function save(array $settings): array
    {
        if (!Schema::hasTable('finance_settings')) {
            return $this->defaults();
        }

        foreach ($settings as $key => $value) {
            FinanceSetting::query()->updateOrCreate(
                ['key' => $key],
                ['value' => is_array($value) ? json_encode($value) : (string)$value]
            );
        }

        return $this->all();
    }

    public function defaults(): array
    {
        return [
            'currency' => 'SAR',
            'vat_rate' => 15,
            'invoice_prefix' => 'INV',
            'zatca_enabled' => false,
            'zatca_environment' => 'sandbox',
            'gateways' => [
                'stripe' => ['enabled' => false],
                'paytabs' => ['enabled' => false],
                'moyasar' => ['enabled' => false],
            ],
        ];
    }
}
