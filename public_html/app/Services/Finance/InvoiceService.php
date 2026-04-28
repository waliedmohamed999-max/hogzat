<?php

namespace App\Services\Finance;

use App\Models\FinanceInvoice;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class InvoiceService
{
    public function generateForBooking($bookingId, string $bookingTable = 'booking'): ?FinanceInvoice
    {
        if (!Schema::hasTable('finance_invoices')) {
            return null;
        }

        $booking = DB::table($bookingTable)->where($bookingTable === 'booking' ? 'ID' : 'id', $bookingId)->first();
        if (!$booking) {
            return null;
        }

        $existing = FinanceInvoice::query()
            ->where('booking_table', $bookingTable)
            ->where('booking_id', $bookingId)
            ->first();
        if ($existing) {
            return $existing;
        }

        $settings = app(FinanceSettingsService::class);
        $vatRate = (float)$settings->get('vat_rate', 15);
        $total = (float)($booking->total ?? $booking->total_price ?? 0);
        $subtotal = $vatRate > 0 ? round($total / (1 + ($vatRate / 100)), 2) : $total;
        $vatAmount = max(0, round($total - $subtotal, 2));
        $prefix = (string)$settings->get('invoice_prefix', 'INV');

        return FinanceInvoice::query()->create([
            'invoice_number' => $this->nextInvoiceNumber($prefix),
            'booking_id' => (int)$bookingId,
            'booking_table' => $bookingTable,
            'customer_id' => (int)($booking->buyer ?? $booking->user_id ?? 0) ?: null,
            'customer_name' => trim(($booking->first_name ?? '') . ' ' . ($booking->last_name ?? '')) ?: null,
            'customer_email' => $booking->email ?? null,
            'customer_phone' => $booking->phone ?? null,
            'subtotal' => $subtotal,
            'vat_rate' => $vatRate,
            'vat_amount' => $vatAmount,
            'total' => $total,
            'currency' => (string)$settings->get('currency', 'SAR'),
            'status' => 'issued',
            'issued_at' => now(),
            'lines' => [
                [
                    'description' => $booking->booking_description ?? 'Booking #' . $bookingId,
                    'amount' => $subtotal,
                    'vat' => $vatAmount,
                    'total' => $total,
                ],
            ],
            'meta' => [
                'zatca_enabled' => (bool)$settings->get('zatca_enabled', false),
                'source' => 'auto',
            ],
        ]);
    }

    public function renderPdf(FinanceInvoice $invoice): string
    {
        $lines = [
            'Labayh Invoice',
            'Invoice: ' . $invoice->invoice_number,
            'Date: ' . optional($invoice->issued_at)->format('Y-m-d H:i'),
            'Customer: ' . ($invoice->customer_name ?: '-'),
            'Email: ' . ($invoice->customer_email ?: '-'),
            'Subtotal: ' . number_format((float)$invoice->subtotal, 2) . ' ' . $invoice->currency,
            'VAT: ' . number_format((float)$invoice->vat_amount, 2) . ' ' . $invoice->currency,
            'Total: ' . number_format((float)$invoice->total, 2) . ' ' . $invoice->currency,
        ];

        $content = implode("\\n", array_map([$this, 'escapePdfText'], $lines));
        $stream = "BT /F1 14 Tf 50 780 Td ({$content}) Tj ET";
        $objects = [
            "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
            "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
            "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj",
            "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
            "5 0 obj << /Length " . strlen($stream) . " >> stream\n{$stream}\nendstream endobj",
        ];

        $pdf = "%PDF-1.4\n";
        $offsets = [0];
        foreach ($objects as $object) {
            $offsets[] = strlen($pdf);
            $pdf .= $object . "\n";
        }
        $xref = strlen($pdf);
        $pdf .= "xref\n0 " . (count($objects) + 1) . "\n0000000000 65535 f \n";
        foreach (array_slice($offsets, 1) as $offset) {
            $pdf .= str_pad((string)$offset, 10, '0', STR_PAD_LEFT) . " 00000 n \n";
        }
        $pdf .= "trailer << /Size " . (count($objects) + 1) . " /Root 1 0 R >>\nstartxref\n{$xref}\n%%EOF";

        return $pdf;
    }

    private function nextInvoiceNumber(string $prefix): string
    {
        return $prefix . '-' . now()->format('Ymd') . '-' . strtoupper(Str::random(6));
    }

    private function escapePdfText(string $value): string
    {
        return str_replace(['\\', '(', ')'], ['\\\\', '\\(', '\\)'], $value);
    }
}
