<?php

namespace App\Services\Finance;

use App\Models\PaymentTransaction;
use App\Models\PaymentWebhookEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schema;

class PaymentService
{
    public function createIntent(int $bookingId, string $method, string $bookingTable = 'booking'): array
    {
        $booking = $this->booking($bookingId, $bookingTable);
        if (!$booking) {
            return ['status' => 0, 'message' => __('Booking not found')];
        }

        $amount = (float)($booking->total ?? $booking->total_price ?? 0);
        $currency = app(FinanceSettingsService::class)->get('currency', 'SAR');

        $result = match ($method) {
            'stripe' => $this->stripeIntent($bookingId, $bookingTable, $amount, $currency, $booking),
            'paytabs' => $this->paytabsIntent($bookingId, $bookingTable, $amount, $currency, $booking),
            'moyasar' => $this->moyasarIntent($bookingId, $bookingTable, $amount, $currency, $booking),
            default => ['status' => 0, 'message' => __('Payment gateway is not supported')],
        };

        $this->storeTransaction($method, $bookingId, $bookingTable, $amount, $currency, 'pending', request()->all(), $result);

        return $result;
    }

    public function refund(int $bookingId, float $amount, string $reason = '', string $bookingTable = 'booking'): array
    {
        if (!Schema::hasTable('payment_transactions')) {
            return ['status' => 0, 'message' => __('Payment transactions table is not ready')];
        }

        $transaction = PaymentTransaction::query()
            ->where('booking_table', $bookingTable)
            ->where('booking_id', $bookingId)
            ->whereIn('status', ['paid', 'completed'])
            ->latest()
            ->first();

        if (!$transaction) {
            return ['status' => 0, 'message' => __('No paid transaction found')];
        }

        $amount = min($amount, (float)$transaction->amount - (float)$transaction->refunded_amount);
        if ($amount <= 0) {
            return ['status' => 0, 'message' => __('Refund amount is invalid')];
        }

        try {
            $response = $this->executeGatewayRefund($transaction, $amount, $reason);
            $transaction->update([
                'status' => 'refunded',
                'refunded_amount' => (float)$transaction->refunded_amount + $amount,
                'refund_id' => $response['refund_id'] ?? null,
                'response_payload' => $response,
            ]);

            if (Schema::hasTable($bookingTable)) {
                DB::table($bookingTable)
                    ->where($bookingTable === 'booking' ? 'ID' : 'id', $bookingId)
                    ->update($bookingTable === 'booking' ? ['status' => 'refunded'] : ['payment_status' => 'refunded']);
            }

            return ['status' => 1, 'message' => __('Refund processed successfully'), 'data' => $response];
        } catch (\Throwable $exception) {
            return ['status' => 0, 'message' => $exception->getMessage()];
        }
    }

    public function handleWebhook(string $gateway, Request $request): array
    {
        $payload = $request->all();
        $event = null;

        try {
            if ($gateway === 'stripe') {
                $event = $this->verifyStripeWebhook($request);
                $payload = $event ? $event->toArray() : $payload;
            }

            $eventRecord = null;
            if (Schema::hasTable('payment_webhook_events')) {
                $eventRecord = PaymentWebhookEvent::query()->create([
                    'gateway' => $gateway,
                    'event_id' => $payload['id'] ?? $payload['tran_ref'] ?? $payload['payment_id'] ?? null,
                    'event_type' => $payload['type'] ?? $payload['event'] ?? $payload['status'] ?? null,
                    'status' => 'received',
                    'payload' => $payload,
                ]);
            }

            $result = $this->applyWebhookPaymentState($gateway, $payload);
            if ($eventRecord) {
                $eventRecord->update(['status' => !empty($result['status']) ? 'processed' : 'ignored']);
            }

            return $result;
        } catch (\Throwable $exception) {
            if (Schema::hasTable('payment_webhook_events')) {
                PaymentWebhookEvent::query()->create([
                    'gateway' => $gateway,
                    'event_type' => $payload['type'] ?? null,
                    'status' => 'failed',
                    'payload' => $payload,
                    'error_message' => $exception->getMessage(),
                ]);
            }
            return ['status' => 0, 'message' => $exception->getMessage()];
        }
    }

    private function stripeIntent(int $bookingId, string $bookingTable, float $amount, string $currency, $booking): array
    {
        $secret = get_option('stripe_secret_key', '');
        if (!$secret) {
            return ['status' => 0, 'message' => __('Stripe secret key is not configured')];
        }

        \Stripe\Stripe::setApiKey($secret);
        $intent = \Stripe\PaymentIntent::create([
            'amount' => (int)round($amount * 100),
            'currency' => strtolower($currency),
            'metadata' => [
                'booking_id' => $bookingId,
                'booking_table' => $bookingTable,
                'customer_email' => $booking->email ?? '',
            ],
        ]);

        return [
            'status' => 1,
            'gateway' => 'stripe',
            'client_secret' => $intent->client_secret,
            'transaction_id' => $intent->id,
        ];
    }

    private function paytabsIntent(int $bookingId, string $bookingTable, float $amount, string $currency, $booking): array
    {
        $profileId = get_option('paytabs_profile_id', '');
        $serverKey = get_option('paytabs_server_key', '');
        if (!$profileId || !$serverKey) {
            return ['status' => 0, 'message' => __('PayTabs credentials are not configured')];
        }

        $response = Http::withToken($serverKey)->post('https://secure.paytabs.sa/payment/request', [
            'profile_id' => $profileId,
            'tran_type' => 'sale',
            'tran_class' => 'ecom',
            'cart_id' => $bookingTable . '-' . $bookingId,
            'cart_currency' => $currency,
            'cart_amount' => $amount,
            'cart_description' => 'Booking #' . $bookingId,
            'customer_details' => [
                'name' => trim(($booking->first_name ?? '') . ' ' . ($booking->last_name ?? '')) ?: 'Customer',
                'email' => $booking->email ?? 'customer@example.com',
                'phone' => $booking->phone ?? '',
            ],
        ])->json();

        return ['status' => !empty($response['redirect_url']) ? 1 : 0, 'gateway' => 'paytabs'] + (array)$response;
    }

    private function moyasarIntent(int $bookingId, string $bookingTable, float $amount, string $currency, $booking): array
    {
        $secret = get_option('moyasar_secret_key', '');
        if (!$secret) {
            return ['status' => 0, 'message' => __('Moyasar secret key is not configured')];
        }

        $response = Http::withBasicAuth($secret, '')
            ->asForm()
            ->post('https://api.moyasar.com/v1/payments', [
                'amount' => (int)round($amount * 100),
                'currency' => $currency,
                'description' => 'Booking #' . $bookingId,
                'metadata[booking_id]' => $bookingId,
                'metadata[booking_table]' => $bookingTable,
            ])->json();

        return ['status' => !empty($response['id']) ? 1 : 0, 'gateway' => 'moyasar'] + (array)$response;
    }

    private function executeGatewayRefund(PaymentTransaction $transaction, float $amount, string $reason): array
    {
        if ($transaction->gateway === 'stripe') {
            $secret = get_option('stripe_secret_key', '');
            \Stripe\Stripe::setApiKey($secret);
            $refund = \Stripe\Refund::create([
                'payment_intent' => $transaction->transaction_id,
                'amount' => (int)round($amount * 100),
                'reason' => $reason ?: null,
            ]);
            return ['refund_id' => $refund->id, 'status' => $refund->status];
        }

        return [
            'refund_id' => 'manual-' . now()->timestamp,
            'status' => 'manual_review',
            'message' => 'Gateway refund marked for manual processing.',
        ];
    }

    private function applyWebhookPaymentState(string $gateway, array $payload): array
    {
        $bookingId = $payload['metadata']['booking_id']
            ?? $payload['data']['object']['metadata']['booking_id']
            ?? $payload['cart_id']
            ?? $payload['metadata']['booking_id']
            ?? null;
        $bookingTable = $payload['metadata']['booking_table']
            ?? $payload['data']['object']['metadata']['booking_table']
            ?? 'booking';

        if (is_string($bookingId) && str_contains($bookingId, '-')) {
            [$bookingTable, $bookingId] = explode('-', $bookingId, 2);
        }

        if (!$bookingId) {
            return ['status' => 0, 'message' => __('Webhook has no booking reference')];
        }

        $eventType = $payload['type'] ?? $payload['payment_result']['response_status'] ?? $payload['status'] ?? '';
        $paid = in_array($eventType, ['payment_intent.succeeded', 'A', 'paid', 'succeeded'], true);
        $failed = in_array($eventType, ['payment_intent.payment_failed', 'failed', 'F'], true);

        if ($paid || $failed) {
            $status = $paid ? 'completed' : 'canceled';
            if (Schema::hasTable($bookingTable)) {
                DB::table($bookingTable)
                    ->where($bookingTable === 'booking' ? 'ID' : 'id', (int)$bookingId)
                    ->update($bookingTable === 'booking' ? ['status' => $status] : ['payment_status' => $paid ? 'paid' : 'failed']);
            }

            if ($paid) {
                app(FinanceService::class)->recordBookingPayment((int)$bookingId, 'completed', $bookingTable);
            }

            return ['status' => 1, 'message' => __('Webhook processed')];
        }

        return ['status' => 0, 'message' => __('Webhook ignored')];
    }

    private function verifyStripeWebhook(Request $request)
    {
        $secret = get_option('stripe_webhook_secret', '');
        if (!$secret) {
            return null;
        }

        return \Stripe\Webhook::constructEvent(
            $request->getContent(),
            $request->header('Stripe-Signature'),
            $secret
        );
    }

    private function booking(int $bookingId, string $bookingTable)
    {
        if (!Schema::hasTable($bookingTable)) {
            return null;
        }
        return DB::table($bookingTable)->where($bookingTable === 'booking' ? 'ID' : 'id', $bookingId)->first();
    }

    private function storeTransaction(string $gateway, int $bookingId, string $bookingTable, float $amount, string $currency, string $status, array $request, array $response): void
    {
        if (!Schema::hasTable('payment_transactions')) {
            return;
        }

        PaymentTransaction::query()->create([
            'gateway' => $gateway,
            'transaction_id' => $response['transaction_id'] ?? $response['id'] ?? $response['tran_ref'] ?? null,
            'booking_id' => $bookingId,
            'booking_table' => $bookingTable,
            'amount' => $amount,
            'currency' => $currency,
            'status' => !empty($response['status']) && $response['status'] === 1 ? 'pending' : 'failed',
            'request_payload' => $request,
            'response_payload' => $response,
        ]);
    }
}
