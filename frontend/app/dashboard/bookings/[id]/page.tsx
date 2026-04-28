import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import {
  BadgeCheck,
  CalendarDays,
  CreditCard,
  FileText,
  MapPin,
  ShieldCheck,
  UserCircle2,
} from "lucide-react";
import { CancelBookingButton } from "@/components/dashboard/cancel-booking-button";
import { ConfirmBookingButton } from "@/components/dashboard/confirm-booking-button";
import { InvoiceActions } from "@/components/dashboard/invoice-actions";
import { getDashboardBookingDetail } from "@/lib/api";
import { SAUDI_RIYAL_SYMBOL } from "@/lib/presentation";

type BookingDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatMoney(value: number, currency: string) {
  const normalizedCurrency = ["SR", "SAR", "ر.س", "ريال", "ريال سعودي", "رس", "⃁"].includes(currency) ? SAUDI_RIYAL_SYMBOL : currency;
  return `${Number(value).toLocaleString("ar-SA")} ${normalizedCurrency}`;
}

export default async function DashboardBookingDetailPage({
  params,
}: BookingDetailPageProps) {
  const headerStore = await headers();
  const cookieHeader = headerStore.get("cookie") ?? "";
  const resolvedParams = await params;
  const bookingId = Number(resolvedParams.id);

  if (!bookingId) {
    notFound();
  }

  const detail = await getDashboardBookingDetail(bookingId, cookieHeader);
  if (!detail) {
    notFound();
  }

  const cancelDisabled = ["canceled", "completed"].includes(detail.status);
  const paymentFollowUpTone =
    detail.payment_follow_up.status === "completed"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : detail.payment_follow_up.status === "pending" ||
          detail.payment_follow_up.status === "incomplete"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : detail.payment_follow_up.status === "canceled"
          ? "border-rose-200 bg-rose-50 text-rose-700"
          : "border-slate-200 bg-slate-50 text-slate-700";
  const confirmationTone = detail.is_confirmed
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-sky-200 bg-sky-50 text-sky-700";

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.18)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-sm text-slate-500">تفاصيل الحجز</div>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950">
              {detail.service_title}
            </h1>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
              <span className="inline-flex items-center gap-2">
                <MapPin className="size-4" />
                {detail.service_city || "المملكة العربية السعودية"}
              </span>
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="size-4" />
                {detail.start_date} - {detail.end_date}
              </span>
              <span className="inline-flex items-center gap-2">
                <CreditCard className="size-4" />
                {detail.payment_method}
              </span>
            </div>
          </div>

          <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
            {detail.status_label}
          </div>
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-[1fr_380px]">
        <section className="space-y-8">
          <article className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.18)]">
            <div className="flex items-center gap-3">
              <FileText className="size-5 text-rose-500" />
              <h2 className="text-2xl font-semibold text-slate-950">الفاتورة</h2>
            </div>
            <div className="mt-6">
              <InvoiceActions invoice={detail.invoice} />
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[24px] bg-slate-50 p-5">
                <div className="text-xs text-slate-400">رقم الحجز</div>
                <div className="mt-2 text-lg font-semibold text-slate-950">
                  {detail.invoice.booking_id}
                </div>
              </div>
              <div className="rounded-[24px] bg-slate-50 p-5">
                <div className="text-xs text-slate-400">طريقة الدفع</div>
                <div className="mt-2 text-lg font-semibold text-slate-950">
                  {detail.invoice.payment_method}
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3 rounded-[28px] border border-slate-200 bg-slate-50 p-5">
              {detail.invoice.line_items.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between text-sm text-slate-600"
                >
                  <span>{item.label}</span>
                  <span>{formatMoney(item.value, detail.invoice.currency)}</span>
                </div>
              ))}

              <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-sm text-slate-600">
                <span>الضريبة</span>
                <span>{detail.invoice.tax_percent}%</span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>عمولة المنصة</span>
                <span>{detail.invoice.commission_percent}%</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-base font-semibold text-slate-950">
                <span>الإجمالي</span>
                <span>{formatMoney(detail.invoice.total, detail.invoice.currency)}</span>
              </div>
            </div>
          </article>

          <article className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.18)]">
              <div className="flex items-center gap-3">
                <ShieldCheck className="size-5 text-sky-500" />
                <h2 className="text-2xl font-semibold text-slate-950">تأكيد الحجز</h2>
              </div>
              <div
                className={`mt-6 rounded-[24px] border px-5 py-4 text-sm leading-7 ${confirmationTone}`}
              >
                {detail.is_confirmed
                  ? "تم تأكيد هذا الحجز بالفعل داخل النظام وأصبح موثقاً على الحساب."
                  : "يمكنك تأكيد هذا الحجز من هنا ليتم تحديث حالته داخل النظام وإرسال إشعاراته المرتبطة."}
              </div>
              <div className="mt-6">
                {detail.is_confirmed ? (
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                    <BadgeCheck className="size-4" />
                    الحجز مؤكد
                  </div>
                ) : (
                  <ConfirmBookingButton bookingId={detail.id} />
                )}
              </div>
            </div>

            <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.18)]">
              <div className="flex items-center gap-3">
                <CreditCard className="size-5 text-amber-500" />
                <h2 className="text-2xl font-semibold text-slate-950">متابعة الدفع</h2>
              </div>
              <div
                className={`mt-6 rounded-[24px] border px-5 py-4 text-sm leading-7 ${paymentFollowUpTone}`}
              >
                <div className="font-semibold">{detail.payment_follow_up.label}</div>
                <div className="mt-2">{detail.payment_follow_up.message}</div>
              </div>
            </div>
          </article>

          <article className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.18)]">
              <div className="flex items-center gap-3">
                <UserCircle2 className="size-5 text-slate-500" />
                <h2 className="text-2xl font-semibold text-slate-950">بيانات العميل</h2>
              </div>
              <div className="mt-6 space-y-3 text-sm text-slate-600">
                <div>
                  <span className="font-medium text-slate-950">الاسم:</span>{" "}
                  {detail.customer.first_name} {detail.customer.last_name}
                </div>
                <div>
                  <span className="font-medium text-slate-950">البريد:</span>{" "}
                  {detail.customer.email}
                </div>
                <div>
                  <span className="font-medium text-slate-950">الجوال:</span>{" "}
                  {detail.customer.phone}
                </div>
                <div>
                  <span className="font-medium text-slate-950">العنوان:</span>{" "}
                  {detail.customer.address || "غير متوفر"}
                </div>
                {detail.customer.note ? (
                  <div>
                    <span className="font-medium text-slate-950">ملاحظة:</span>{" "}
                    {detail.customer.note}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.18)]">
              <div className="flex items-center gap-3">
                <UserCircle2 className="size-5 text-slate-500" />
                <h2 className="text-2xl font-semibold text-slate-950">بيانات المالك</h2>
              </div>
              <div className="mt-6 space-y-3 text-sm text-slate-600">
                <div>
                  <span className="font-medium text-slate-950">الاسم:</span>{" "}
                  {detail.owner.name || "غير متوفر"}
                </div>
                <div>
                  <span className="font-medium text-slate-950">البريد:</span>{" "}
                  {detail.owner.email || "غير متوفر"}
                </div>
                <div>
                  <span className="font-medium text-slate-950">الجوال:</span>{" "}
                  {detail.owner.phone || "غير متوفر"}
                </div>
                <div>
                  <span className="font-medium text-slate-950">العنوان:</span>{" "}
                  {detail.owner.address || "غير متوفر"}
                </div>
              </div>
            </div>
          </article>
        </section>

        <aside className="space-y-6">
          <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.18)]">
            <div className="text-sm text-slate-500">ملخص سريع</div>
            <div className="mt-2 text-3xl font-semibold text-slate-950">
              {formatMoney(detail.total, detail.currency)}
            </div>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <div>رقم الحجز: #{detail.booking_id}</div>
              <div>الخدمة: {detail.invoice.service_name}</div>
              <div>عدد الضيوف: {detail.invoice.guests_count}</div>
            </div>
            <div className="mt-6 space-y-3">
              <Link
                href={detail.service_path}
                className="block rounded-2xl bg-slate-950 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                فتح الإعلان
              </Link>
              <Link
                href="/dashboard/bookings"
                className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white"
              >
                العودة إلى قائمة الحجوزات
              </Link>
            </div>
          </section>

          <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.18)]">
            <h2 className="text-xl font-semibold text-slate-950">إجراءات الحجز</h2>
            <div className="mt-4 text-sm leading-7 text-slate-500">
              يمكنك إدارة حالة الحجز من هذه الواجهة مباشرة. إذا كانت حالة الحجز تسمح
              بالإلغاء فسيتم تنفيذ الإجراء فوراً داخل النظام الموحد مع بقاء نفس الجلسة.
            </div>
            <div className="mt-6">
              <CancelBookingButton bookingId={detail.id} disabled={cancelDisabled} />
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
