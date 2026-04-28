"use client";

import { secureFetch } from "@/lib/client-security";

import type { FormEvent } from "react";
import Link from "next/link";
import { useState, useTransition } from "react";
import type { BridgeBookingQuote, BridgeProfile, BridgeSessionUser } from "@/lib/api";
import type { PaymentMethod } from "@/lib/payment-methods";

type BookingCompletionFormProps = {
  quote: BridgeBookingQuote;
  currentUser: BridgeSessionUser;
  profile?: BridgeProfile | null;
  paymentMethods: PaymentMethod[];
  brandName?: string;
};

type CompletionResult = {
  booking_id: number;
  status: string;
  token_code: string;
  dashboard_url: string;
  service_path: string;
};

export function BookingCompletionForm({
  quote,
  currentUser,
  profile,
  paymentMethods,
  brandName = "لبية",
}: BookingCompletionFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CompletionResult | null>(null);
  const [selectedPayment, setSelectedPayment] = useState(paymentMethods[0]?.key ?? "");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    setResult(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      product_id: quote.product_id,
      type: quote.type,
      checkin: quote.checkin,
      checkout: quote.checkout,
      guests_count: quote.guests_count,
      coupon_code: quote.coupon_valid ? quote.coupon_code || "" : "",
      first_name: String(formData.get("first_name") || ""),
      last_name: String(formData.get("last_name") || ""),
      email: String(formData.get("email") || ""),
      phone: String(formData.get("phone") || ""),
      address: String(formData.get("address") || ""),
      note: String(formData.get("note") || ""),
      payment: String(formData.get("payment") || selectedPayment || "pending"),
      payment_status: "pending",
    };

    const response = await secureFetch("/api/v1/bookings/complete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as {
      status?: number;
      message?: string;
      data?: CompletionResult;
    };

    if (!response.ok || data.status !== 1 || !data.data) {
      setError(data.message || "تعذر إكمال الحجز حالياً.");
      return;
    }

    startTransition(() => {
      setMessage(data.message || "تم إنشاء الحجز بنجاح.");
      setResult(data.data ?? null);
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.18)]"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-950">إكمال الحجز</h2>
        <p className="mt-2 text-sm leading-7 text-slate-500">
          سيتم إنشاء الحجز في نفس نظام {brandName} الحالي مع بقاء الواجهة الجديدة كواجهة
          إتمام حديثة.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            الاسم الأول
          </label>
          <input
            name="first_name"
            defaultValue={profile?.first_name || currentUser.first_name}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-rose-300 focus:bg-white"
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            اسم العائلة
          </label>
          <input
            name="last_name"
            defaultValue={profile?.last_name || currentUser.last_name}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-rose-300 focus:bg-white"
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            البريد الإلكتروني
          </label>
          <input
            type="email"
            name="email"
            defaultValue={profile?.email || currentUser.email}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-rose-300 focus:bg-white"
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            رقم الجوال
          </label>
          <input
            name="phone"
            defaultValue={profile?.mobile || currentUser.mobile}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-rose-300 focus:bg-white"
            required
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="mb-2 block text-sm font-medium text-slate-700">
          العنوان
        </label>
        <input
          name="address"
          defaultValue={profile?.address || ""}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-rose-300 focus:bg-white"
        />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[1fr_220px]">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            ملاحظات إضافية
          </label>
          <textarea
            name="note"
            rows={4}
            className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-rose-300 focus:bg-white"
          />
        </div>
      </div>

      <section className="mt-6 rounded-[28px] border border-slate-200 bg-slate-50 p-5">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">طريقة الدفع</h3>
          <p className="mt-2 text-sm leading-7 text-slate-500">
            اختر وسيلة الدفع المتاحة. الطرق الظاهرة هنا يتم تفعيلها أو تعطيلها من لوحة الدفع.
          </p>
        </div>

        {paymentMethods.length > 0 ? (
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {paymentMethods.map((method) => (
              <label
                key={method.key}
                className={`cursor-pointer rounded-2xl border bg-white p-4 transition ${
                  selectedPayment === method.key
                    ? "border-rose-400 ring-2 ring-rose-100"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="payment"
                    value={method.key}
                    checked={selectedPayment === method.key}
                    onChange={() => setSelectedPayment(method.key)}
                    className="mt-1 size-4 accent-rose-500"
                    required
                  />
                  <div>
                    <div className="font-semibold text-slate-950">{method.label}</div>
                    <p className="mt-1 text-sm leading-6 text-slate-500">{method.description}</p>
                    {method.instructions ? (
                      <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs leading-6 text-slate-500">
                        {method.instructions}
                      </p>
                    ) : null}
                  </div>
                </div>
              </label>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            لا توجد طرق دفع مفعلة حاليًا. فعّل وسيلة دفع واحدة على الأقل من لوحة الدفع.
          </div>
        )}
      </section>

      {error ? (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      ) : null}

      {message ? (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}

      {result ? (
        <div className="mt-4 rounded-[24px] border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
          <div className="font-semibold text-slate-950">تم إنشاء الحجز رقم #{result.booking_id}</div>
          <div className="mt-2">حالة الحجز الحالية: {result.status}</div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/dashboard/bookings"
              className="rounded-2xl bg-slate-950 px-4 py-3 font-semibold text-white transition hover:bg-slate-800"
            >
              فتح الحجوزات الجديدة
            </Link>
            <a
              href={result.service_path}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 transition hover:border-slate-300"
            >
              العودة إلى الإعلان
            </a>
          </div>
        </div>
      ) : null}

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={isPending || paymentMethods.length === 0}
          className="rounded-2xl bg-rose-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? "جارٍ إنشاء الحجز..." : "تأكيد الحجز"}
        </button>
      </div>
    </form>
  );
}
