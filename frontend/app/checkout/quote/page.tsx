import Link from "next/link";
import { headers } from "next/headers";
import { Footer } from "@/components/sections/footer";
import { SiteNavbar } from "@/components/sections/site-navbar";
import { BookingCompletionForm } from "@/components/checkout/booking-completion-form";
import { getBookingQuote, getProfile, getPublicSystemSettings, getSessionUser } from "@/lib/api";
import { resolveBrand } from "@/lib/brand";
import { SAUDI_RIYAL_SYMBOL } from "@/lib/presentation";
import { getEnabledPaymentMethods, getPaymentMethods } from "@/lib/payment-methods";

type CheckoutQuotePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function valueOf(param?: string | string[]) {
  return Array.isArray(param) ? param[0] ?? "" : param ?? "";
}

function formatMoney(value: number, currency: string) {
  const normalizedCurrency = ["SR", "SAR", "ر.س", "ريال", "ريال سعودي", "رس", "⃁"].includes(currency) ? SAUDI_RIYAL_SYMBOL : currency;
  return `${Number(value).toLocaleString("ar-SA")} ${normalizedCurrency}`;
}

export default async function CheckoutQuotePage({
  searchParams,
}: CheckoutQuotePageProps) {
  const headerStore = await headers();
  const cookieHeader = headerStore.get("cookie") ?? "";
  const currentUser = await getSessionUser(cookieHeader);
  const profile = currentUser ? await getProfile(cookieHeader) : null;
  const publicSettings = await getPublicSystemSettings();
  const siteBrand = resolveBrand(publicSettings);
  const paymentMethods = getEnabledPaymentMethods(await getPaymentMethods());
  const params = (await searchParams) ?? {};

  const productId = Number(valueOf(params.product_id));
  const type = valueOf(params.type) || "home";
  const checkin = valueOf(params.checkin);
  const checkout = valueOf(params.checkout);
  const guests = Number(valueOf(params.guests_count) || "1");
  const couponCode = valueOf(params.coupon_code);

  const quote =
    productId && checkin && checkout
      ? await getBookingQuote(
          {
            product_id: productId,
            type,
            checkin,
            checkout,
            guests_count: guests,
            coupon_code: couponCode,
          },
          cookieHeader,
        )
      : null;

  return (
    <main className="min-h-screen bg-[#f8f8f6] text-slate-950">
      <SiteNavbar currentUser={currentUser} />
      <section className="px-4 pb-24 pt-36 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1280px] space-y-8">
          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.18)]">
            <h1 className="text-3xl font-semibold text-slate-950">ملخص الحجز</h1>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              تقدير سعري وإتمام حجز محلي داخل الواجهة الجديدة باستخدام نفس بيانات
              المنتج والجلسة من النظام الحالي.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
            <section className="space-y-8">
              <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.18)]">
                <form className="grid gap-4 md:grid-cols-2">
                  <input
                    type="number"
                    name="product_id"
                    defaultValue={productId || ""}
                    placeholder="رقم الإعلان"
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm outline-none"
                  />
                  <select
                    name="type"
                    defaultValue={type}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm outline-none"
                  >
                    <option value="home">إقامة</option>
                    <option value="experience">تجربة</option>
                    <option value="service">سيارة / خدمة</option>
                  </select>
                  <input
                    type="date"
                    name="checkin"
                    defaultValue={checkin}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm outline-none"
                  />
                  <input
                    type="date"
                    name="checkout"
                    defaultValue={checkout}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm outline-none"
                  />
                  <input
                    type="number"
                    min="1"
                    name="guests_count"
                    defaultValue={guests}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm outline-none"
                  />
                  <input
                    type="text"
                    name="coupon_code"
                    defaultValue={couponCode}
                    placeholder="كود الخصم"
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm uppercase outline-none"
                    dir="ltr"
                  />
                  <button
                    type="submit"
                    className="rounded-2xl bg-slate-950 px-5 py-4 text-sm font-semibold text-white transition hover:bg-slate-800 md:col-span-2"
                  >
                    إعادة حساب السعر
                  </button>
                </form>
              </section>

              {quote && currentUser ? (
                <BookingCompletionForm
                  quote={quote}
                  currentUser={currentUser}
                  profile={profile}
                  paymentMethods={paymentMethods}
                  brandName={siteBrand.nameAr}
                />
              ) : null}
            </section>

            <aside className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.18)]">
              {quote ? (
                <div className="space-y-5">
                  <div>
                    <div className="text-sm text-slate-500">العرض الحالي</div>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                      {quote.title}
                    </h2>
                  </div>

                  <div className="space-y-3 rounded-[24px] bg-slate-50 p-5 text-sm text-slate-600">
                    <div className="flex items-center justify-between">
                      <span>سعر الوحدة</span>
                      <span>{formatMoney(quote.unit_price, quote.currency)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>نوع التسعير</span>
                      <span>{quote.unit_label}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>عدد الليالي</span>
                      <span>{quote.nights}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>عدد الضيوف</span>
                      <span>{quote.guests_count}</span>
                    </div>
                    {quote.coupon_code ? (
                      <div className={`rounded-2xl border px-4 py-3 ${
                        quote.coupon_valid
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-rose-200 bg-rose-50 text-rose-700"
                      }`}>
                        <div className="flex items-center justify-between gap-3">
                          <span>كود الخصم</span>
                          <span className="font-bold" dir="ltr">{quote.coupon_code}</span>
                        </div>
                        <div className="mt-2 text-xs">
                          {quote.coupon_valid
                            ? `تم تطبيق الخصم ${quote.coupon_label || ""}`
                            : quote.coupon_error || "تعذر تطبيق الكوبون"}
                        </div>
                      </div>
                    ) : null}
                    {quote.discount > 0 ? (
                      <div className="flex items-center justify-between text-emerald-700">
                        <span>الخصم</span>
                        <span>- {formatMoney(quote.discount, quote.currency)}</span>
                      </div>
                    ) : null}
                    <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-base font-semibold text-slate-950">
                      <span>الإجمالي</span>
                      <span>{formatMoney(quote.total, quote.currency)}</span>
                    </div>
                  </div>

                  <a
                    href={quote.booking_url}
                    className="block rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-center text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white"
                  >
                    فتح صفحة الإعلان الأصلية
                  </a>
                </div>
              ) : (
                <div className="space-y-3 text-sm text-slate-500">
                  <div>أدخل بيانات الحجز لعرض التقدير السعري أولاً.</div>
                  <Link href="/" className="font-semibold text-slate-950">
                    العودة إلى الصفحة الرئيسية
                  </Link>
                </div>
              )}

              {!currentUser ? (
                <div className="mt-6 rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
                  من الأفضل تسجيل الدخول أولاً حتى تنتقل لاحقاً إلى الحجوزات
                  والمفضلة من نفس الجلسة.
                  <Link
                    href="/auth/login?return_url=/checkout/quote"
                    className="mr-2 font-semibold text-rose-500"
                  >
                    تسجيل الدخول
                  </Link>
                </div>
              ) : null}
            </aside>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
