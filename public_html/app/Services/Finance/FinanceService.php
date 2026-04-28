<?php

namespace App\Services\Finance;

use App\Models\FinanceExpense;
use App\Models\FinanceLedgerEntry;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class FinanceService
{
    public function dashboardStats(array $filters = []): array
    {
        [$from, $to] = $this->dateRange($filters);
        $revenue = $this->bookingRevenue($from, $to);
        $settings = app(FinanceSettingsService::class);
        $vatRate = (float)$settings->get('vat_rate', 15);
        $vat = $vatRate > 0 ? round($revenue - ($revenue / (1 + ($vatRate / 100))), 2) : 0;
        $expenses = $this->expensesTotal($from, $to);

        return [
            'total_revenue' => round($revenue, 2),
            'vat' => round($vat, 2),
            'net_profit' => round($revenue - $vat - $expenses, 2),
            'expenses' => round($expenses, 2),
            'currency' => $settings->get('currency', 'SAR'),
            'date_from' => $from->toDateString(),
            'date_to' => $to->toDateString(),
        ];
    }

    public function recordBookingPayment($bookingId, string $status = 'completed', string $bookingTable = 'booking'): void
    {
        if ($status !== 'completed' || !Schema::hasTable('finance_ledger_entries')) {
            return;
        }

        $booking = DB::table($bookingTable)->where($bookingTable === 'booking' ? 'ID' : 'id', $bookingId)->first();
        if (!$booking) {
            return;
        }

        $exists = FinanceLedgerEntry::query()
            ->where('source', 'booking_payment')
            ->where('reference_type', $bookingTable)
            ->where('reference_id', $bookingId)
            ->exists();
        if ($exists) {
            return;
        }

        $settings = app(FinanceSettingsService::class);
        $vatRate = (float)$settings->get('vat_rate', 15);
        $amount = (float)($booking->total ?? $booking->total_price ?? 0);
        $vatAmount = $vatRate > 0 ? round($amount - ($amount / (1 + ($vatRate / 100))), 2) : 0;

        FinanceLedgerEntry::query()->create([
            'type' => 'income',
            'amount' => $amount,
            'vat_amount' => $vatAmount,
            'net_amount' => $amount - $vatAmount,
            'currency' => (string)$settings->get('currency', 'SAR'),
            'source' => 'booking_payment',
            'reference_type' => $bookingTable,
            'reference_id' => (int)$bookingId,
            'user_id' => (int)($booking->buyer ?? $booking->user_id ?? 0) ?: null,
            'description' => $booking->booking_description ?? 'Booking payment',
            'entry_date' => now(),
            'meta' => ['payment_type' => $booking->payment_type ?? null],
        ]);

        app(InvoiceService::class)->generateForBooking($bookingId, $bookingTable);
    }

    public function recordExpense(FinanceExpense $expense): void
    {
        if (!Schema::hasTable('finance_ledger_entries')) {
            return;
        }

        FinanceLedgerEntry::query()->updateOrCreate(
            [
                'source' => 'expense',
                'reference_type' => 'finance_expenses',
                'reference_id' => $expense->id,
            ],
            [
                'type' => 'expense',
                'amount' => $expense->amount,
                'vat_amount' => $expense->vat_amount,
                'net_amount' => max(0, (float)$expense->amount - (float)$expense->vat_amount),
                'currency' => $expense->currency,
                'user_id' => $expense->created_by,
                'description' => $expense->title,
                'entry_date' => $expense->expense_date,
                'meta' => ['category' => $expense->category],
            ]
        );
    }

    public function ledger(array $filters = [])
    {
        if (!Schema::hasTable('finance_ledger_entries')) {
            return collect();
        }

        [$from, $to] = $this->dateRange($filters);
        return FinanceLedgerEntry::query()
            ->whereBetween('entry_date', [$from, $to])
            ->when(!empty($filters['type']), fn ($query) => $query->where('type', $filters['type']))
            ->orderByDesc('entry_date')
            ->paginate((int)($filters['per_page'] ?? 20));
    }

    public function exportCsv(array $filters = []): string
    {
        $rows = $this->ledger($filters);
        $csv = "id,type,amount,vat_amount,net_amount,currency,source,reference_id,date\n";
        foreach ($rows as $row) {
            $csv .= implode(',', [
                $row->id,
                $row->type,
                $row->amount,
                $row->vat_amount,
                $row->net_amount,
                $row->currency,
                $row->source,
                $row->reference_id,
                optional($row->entry_date)->format('Y-m-d H:i:s'),
            ]) . "\n";
        }
        return $csv;
    }

    private function bookingRevenue(Carbon $from, Carbon $to): float
    {
        $total = 0.0;
        if (Schema::hasTable('booking')) {
            $total += (float)DB::table('booking')
                ->where('status', 'completed')
                ->whereBetween('created_date', [$from->timestamp, $to->timestamp])
                ->sum('total');
        }
        if (Schema::hasTable('bookings')) {
            $total += (float)DB::table('bookings')
                ->where(function ($query) {
                    $query->where('payment_status', 'paid')->orWhere('status', 'completed');
                })
                ->whereBetween('created_at', [$from, $to])
                ->sum('total_price');
        }
        return $total;
    }

    private function expensesTotal(Carbon $from, Carbon $to): float
    {
        if (!Schema::hasTable('finance_expenses')) {
            return 0;
        }

        return (float)FinanceExpense::query()
            ->whereBetween('expense_date', [$from->toDateString(), $to->toDateString()])
            ->sum('amount');
    }

    private function dateRange(array $filters): array
    {
        $range = $filters['range'] ?? 'month';
        $now = now();
        if ($range === 'today') {
            return [$now->copy()->startOfDay(), $now->copy()->endOfDay()];
        }
        if ($range === 'week') {
            return [$now->copy()->startOfWeek(), $now->copy()->endOfWeek()];
        }
        if ($range === 'custom' && !empty($filters['date_from']) && !empty($filters['date_to'])) {
            return [Carbon::parse($filters['date_from'])->startOfDay(), Carbon::parse($filters['date_to'])->endOfDay()];
        }
        return [$now->copy()->startOfMonth(), $now->copy()->endOfMonth()];
    }
}
