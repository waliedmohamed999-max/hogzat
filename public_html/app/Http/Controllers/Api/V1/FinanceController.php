<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\FinanceSettingsRequest;
use App\Http\Requests\Finance\RefundPaymentRequest;
use App\Http\Requests\Finance\StoreExpenseRequest;
use App\Models\FinanceExpense;
use App\Models\FinanceInvoice;
use App\Services\Finance\FinanceService;
use App\Services\Finance\FinanceSettingsService;
use App\Services\Finance\InvoiceService;
use App\Services\Finance\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Sentinel;

class FinanceController extends Controller
{
    public function stats(Request $request, FinanceService $finance)
    {
        $this->requireUser();
        return response()->json(['status' => 1, 'data' => $finance->dashboardStats($request->all())]);
    }

    public function ledger(Request $request, FinanceService $finance)
    {
        $this->requireUser();
        return response()->json(['status' => 1, 'data' => $finance->ledger($request->all())]);
    }

    public function expenses(Request $request)
    {
        $this->requireUser();
        if (!Schema::hasTable('finance_expenses')) {
            return response()->json(['status' => 1, 'data' => ['data' => []]]);
        }

        $items = FinanceExpense::query()
            ->when($request->get('category'), fn ($query, $category) => $query->where('category', $category))
            ->when($request->get('date_from'), fn ($query, $date) => $query->whereDate('expense_date', '>=', $date))
            ->when($request->get('date_to'), fn ($query, $date) => $query->whereDate('expense_date', '<=', $date))
            ->orderByDesc('expense_date')
            ->paginate((int)$request->get('per_page', 20));

        return response()->json(['status' => 1, 'data' => $items]);
    }

    public function storeExpense(StoreExpenseRequest $request, FinanceService $finance)
    {
        $user = $this->requireUser();
        $data = $request->validated();
        $data['currency'] = $data['currency'] ?? app(FinanceSettingsService::class)->get('currency', 'SAR');
        $data['vat_amount'] = $data['vat_amount'] ?? 0;
        $data['created_by'] = $user->id;

        if ($request->hasFile('attachment')) {
            $data['attachment_path'] = $request->file('attachment')->store('finance-expenses', 'public');
        }

        $expense = FinanceExpense::query()->create($data);
        $finance->recordExpense($expense);

        return response()->json(['status' => 1, 'message' => __('Saved successfully'), 'data' => $expense]);
    }

    public function updateExpense(StoreExpenseRequest $request, $id, FinanceService $finance)
    {
        $this->requireUser();
        $expense = FinanceExpense::query()->findOrFail($id);
        $data = $request->validated();
        if ($request->hasFile('attachment')) {
            $data['attachment_path'] = $request->file('attachment')->store('finance-expenses', 'public');
        }
        $expense->update($data);
        $finance->recordExpense($expense);

        return response()->json(['status' => 1, 'message' => __('Updated successfully'), 'data' => $expense]);
    }

    public function deleteExpense($id)
    {
        $this->requireUser();
        $expense = FinanceExpense::query()->findOrFail($id);
        $expense->delete();

        return response()->json(['status' => 1, 'message' => __('Deleted successfully')]);
    }

    public function issueInvoice(Request $request, InvoiceService $invoices)
    {
        $this->requireUser();
        $request->validate([
            'booking_id' => ['required', 'integer'],
            'booking_table' => ['nullable', 'in:booking,bookings'],
        ]);

        $invoice = $invoices->generateForBooking(
            (int)$request->get('booking_id'),
            (string)$request->get('booking_table', 'booking')
        );

        if (!$invoice) {
            return response()->json(['status' => 0, 'message' => __('Can not generate invoice')], 422);
        }

        return response()->json(['status' => 1, 'message' => __('Invoice generated'), 'data' => $invoice]);
    }

    public function invoice($id)
    {
        $this->requireUser();
        $invoice = FinanceInvoice::query()->findOrFail($id);
        return response()->json(['status' => 1, 'data' => $invoice]);
    }

    public function invoicePdf($id, InvoiceService $invoices)
    {
        $this->requireUser();
        $invoice = FinanceInvoice::query()->findOrFail($id);

        return response($invoices->renderPdf($invoice), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="' . $invoice->invoice_number . '.pdf"',
        ]);
    }

    public function paymentIntent(Request $request, PaymentService $payments)
    {
        $this->requireUser();
        $request->validate([
            'booking_id' => ['required', 'integer'],
            'booking_table' => ['nullable', 'in:booking,bookings'],
            'method' => ['required', 'in:stripe,paytabs,moyasar'],
        ]);

        $result = $payments->createIntent(
            (int)$request->get('booking_id'),
            (string)$request->get('method'),
            (string)$request->get('booking_table', 'booking')
        );

        return response()->json($result, !empty($result['status']) ? 200 : 422);
    }

    public function refund(RefundPaymentRequest $request, PaymentService $payments)
    {
        $result = $payments->refund(
            (int)$request->get('booking_id'),
            (float)$request->get('amount'),
            (string)$request->get('reason', ''),
            (string)$request->get('booking_table', 'booking')
        );

        return response()->json($result, !empty($result['status']) ? 200 : 422);
    }

    public function webhook($gateway, Request $request, PaymentService $payments)
    {
        $result = $payments->handleWebhook((string)$gateway, $request);
        return response()->json($result, !empty($result['status']) ? 200 : 422);
    }

    public function settings(FinanceSettingsService $settings)
    {
        $this->requireUser();
        return response()->json(['status' => 1, 'data' => $settings->all()]);
    }

    public function saveSettings(FinanceSettingsRequest $request, FinanceSettingsService $settings)
    {
        $saved = $settings->save($request->validated());
        return response()->json(['status' => 1, 'message' => __('Settings saved'), 'data' => $saved]);
    }

    public function export(Request $request, FinanceService $finance)
    {
        $this->requireUser();
        $type = $request->get('type', 'ledger');
        $content = $type === 'vat' ? $this->vatCsv($request) : $finance->exportCsv($request->all());
        $filename = $type . '-' . now()->format('Ymd-His') . '.csv';

        return response($content, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    public function zatcaPayload($invoiceId)
    {
        $this->requireUser();
        $invoice = FinanceInvoice::query()->findOrFail($invoiceId);

        return response()->json([
            'status' => 1,
            'data' => [
                'invoice_number' => $invoice->invoice_number,
                'issue_date' => optional($invoice->issued_at)->toIso8601String(),
                'currency' => $invoice->currency,
                'tax_total' => (float)$invoice->vat_amount,
                'payable_amount' => (float)$invoice->total,
                'customer' => [
                    'name' => $invoice->customer_name,
                    'email' => $invoice->customer_email,
                ],
                'zatca_environment' => app(FinanceSettingsService::class)->get('zatca_environment', 'sandbox'),
            ],
        ]);
    }

    private function vatCsv(Request $request): string
    {
        $finance = app(FinanceService::class);
        $rows = $finance->ledger($request->all());
        $csv = "id,type,amount,vat_amount,net_amount,date\n";
        foreach ($rows as $row) {
            $csv .= implode(',', [
                $row->id,
                $row->type,
                $row->amount,
                $row->vat_amount,
                $row->net_amount,
                optional($row->entry_date)->format('Y-m-d H:i:s'),
            ]) . "\n";
        }
        return $csv;
    }

    private function requireUser()
    {
        $user = Sentinel::getUser();
        if (!$user) {
            abort(response()->json(['status' => 0, 'message' => 'Unauthorized'], 401));
        }

        return $user;
    }
}
