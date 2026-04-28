<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateFinanceSystemTables extends Migration
{
    public function up()
    {
        if (!Schema::hasTable('finance_ledger_entries')) {
            Schema::create('finance_ledger_entries', function (Blueprint $table) {
                $table->bigIncrements('id');
                $table->string('type', 30);
                $table->decimal('amount', 14, 2);
                $table->decimal('vat_amount', 14, 2)->default(0);
                $table->decimal('net_amount', 14, 2)->default(0);
                $table->string('currency', 10)->default('SAR');
                $table->string('source', 80);
                $table->string('reference_type', 80)->nullable();
                $table->unsignedBigInteger('reference_id')->nullable();
                $table->unsignedBigInteger('user_id')->nullable();
                $table->string('description')->nullable();
                $table->json('meta')->nullable();
                $table->timestamp('entry_date')->nullable();
                $table->timestamps();

                $table->index(['type', 'entry_date']);
                $table->index(['reference_type', 'reference_id']);
            });
        }

        if (!Schema::hasTable('finance_invoices')) {
            Schema::create('finance_invoices', function (Blueprint $table) {
                $table->bigIncrements('id');
                $table->string('invoice_number')->unique();
                $table->unsignedBigInteger('booking_id')->nullable();
                $table->string('booking_table', 40)->default('booking');
                $table->unsignedBigInteger('customer_id')->nullable();
                $table->string('customer_name')->nullable();
                $table->string('customer_email')->nullable();
                $table->string('customer_phone')->nullable();
                $table->decimal('subtotal', 14, 2)->default(0);
                $table->decimal('vat_rate', 6, 3)->default(0);
                $table->decimal('vat_amount', 14, 2)->default(0);
                $table->decimal('total', 14, 2)->default(0);
                $table->string('currency', 10)->default('SAR');
                $table->string('status', 30)->default('issued');
                $table->timestamp('issued_at')->nullable();
                $table->json('lines')->nullable();
                $table->json('meta')->nullable();
                $table->timestamps();

                $table->index(['booking_table', 'booking_id']);
                $table->index(['status', 'issued_at']);
            });
        }

        if (!Schema::hasTable('finance_expenses')) {
            Schema::create('finance_expenses', function (Blueprint $table) {
                $table->bigIncrements('id');
                $table->string('category', 80);
                $table->string('title');
                $table->text('description')->nullable();
                $table->decimal('amount', 14, 2);
                $table->decimal('vat_amount', 14, 2)->default(0);
                $table->string('currency', 10)->default('SAR');
                $table->date('expense_date');
                $table->string('attachment_path')->nullable();
                $table->unsignedBigInteger('created_by')->nullable();
                $table->timestamps();

                $table->index(['category', 'expense_date']);
            });
        }

        if (!Schema::hasTable('finance_settings')) {
            Schema::create('finance_settings', function (Blueprint $table) {
                $table->bigIncrements('id');
                $table->string('key')->unique();
                $table->longText('value')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('payment_transactions')) {
            Schema::create('payment_transactions', function (Blueprint $table) {
                $table->bigIncrements('id');
                $table->string('gateway', 60);
                $table->string('transaction_id')->nullable()->index();
                $table->unsignedBigInteger('booking_id')->nullable();
                $table->string('booking_table', 40)->default('booking');
                $table->decimal('amount', 14, 2)->default(0);
                $table->string('currency', 10)->default('SAR');
                $table->string('status', 30)->default('pending');
                $table->string('refund_id')->nullable();
                $table->decimal('refunded_amount', 14, 2)->default(0);
                $table->json('request_payload')->nullable();
                $table->json('response_payload')->nullable();
                $table->timestamps();

                $table->index(['booking_table', 'booking_id']);
                $table->index(['gateway', 'status']);
            });
        }

        if (!Schema::hasTable('payment_webhook_events')) {
            Schema::create('payment_webhook_events', function (Blueprint $table) {
                $table->bigIncrements('id');
                $table->string('gateway', 60);
                $table->string('event_id')->nullable()->index();
                $table->string('event_type')->nullable();
                $table->string('status', 30)->default('received');
                $table->json('payload')->nullable();
                $table->text('error_message')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down()
    {
        Schema::dropIfExists('payment_webhook_events');
        Schema::dropIfExists('payment_transactions');
        Schema::dropIfExists('finance_settings');
        Schema::dropIfExists('finance_expenses');
        Schema::dropIfExists('finance_invoices');
        Schema::dropIfExists('finance_ledger_entries');
    }
}
