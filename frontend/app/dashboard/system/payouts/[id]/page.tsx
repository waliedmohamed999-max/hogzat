import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getDashboardPayoutDetail } from "@/lib/api";
import { SAUDI_RIYAL_SYMBOL } from "@/lib/presentation";

function formatMoney(value: number, currency: string) {
  const normalizedCurrency = ["SR", "SAR", "ر.س", "ريال", "ريال سعودي", "رس", "⃁"].includes(currency) ? SAUDI_RIYAL_SYMBOL : currency;
  return `${Number(value).toLocaleString("ar-SA")} ${normalizedCurrency}`;
}

export default async function DashboardPayoutDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const payoutId = Number(id);

  if (!Number.isFinite(payoutId)) {
    notFound();
  }

  const headerStore = await headers();
  const cookieHeader = headerStore.get("cookie") ?? "";
  const payout = await getDashboardPayoutDetail(payoutId, cookieHeader);

  if (!payout) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.18)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-slate-950">تفاصيل الدفعة</h1>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              مراجعة بيانات طلب الصرف وحالته الحالية.
            </p>
          </div>
          <Link
            href="/dashboard/system/payouts"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
          >
            <ArrowLeft className="size-4" />
            العودة للمدفوعات
          </Link>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.18)]">
          <h2 className="text-xl font-semibold text-slate-950">الملخص</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <div className="text-xs uppercase tracking-[0.24em] text-slate-400">معرف الدفعة</div>
              <div className="mt-1 text-sm font-medium text-slate-700">{payout.payout_id}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <div className="text-xs uppercase tracking-[0.24em] text-slate-400">المستخدم</div>
              <div className="mt-1 text-sm font-medium text-slate-700">#{payout.user_id}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <div className="text-xs uppercase tracking-[0.24em] text-slate-400">الحالة</div>
              <div className="mt-1 text-sm font-medium text-slate-700">{payout.status}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <div className="text-xs uppercase tracking-[0.24em] text-slate-400">تاريخ الإنشاء</div>
              <div className="mt-1 text-sm font-medium text-slate-700">{payout.created_at || "-"}</div>
            </div>
          </div>
        </article>

        <article className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.18)]">
          <h2 className="text-xl font-semibold text-slate-950">الصرف</h2>
          <div className="mt-5 rounded-[28px] bg-slate-950 px-6 py-8 text-white">
            <div className="text-sm text-slate-300">قيمة طلب الصرف</div>
            <div className="mt-3 text-4xl font-semibold">{formatMoney(payout.amount, payout.currency)}</div>
            {payout.note ? <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">{payout.note}</p> : null}
          </div>
        </article>
      </section>
    </div>
  );
}
