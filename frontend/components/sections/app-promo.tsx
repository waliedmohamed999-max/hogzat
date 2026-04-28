import Image from "next/image";
import Link from "next/link";
import { ArrowUpLeft, Bell, CalendarCheck2, Heart, ListChecks, ShieldCheck } from "lucide-react";
import type { BridgeMenuItem } from "@/lib/api";

const journeyItems = [
  { label: "المفضلة", detail: "حفظ الإقامات", icon: Heart, tone: "text-rose-600 bg-rose-50 border-rose-100" },
  { label: "الحجوزات", detail: "متابعة الطلبات", icon: ListChecks, tone: "text-emerald-600 bg-emerald-50 border-emerald-100" },
  { label: "التنبيهات", detail: "تحديثات فورية", icon: Bell, tone: "text-amber-600 bg-amber-50 border-amber-100" },
];

const checkpoints = [
  { label: "بحث", icon: CalendarCheck2 },
  { label: "عرض سعر", icon: ShieldCheck },
  { label: "تأكيد", icon: ListChecks },
];

function normalizeCtaItems(items: BridgeMenuItem[]) {
  const links = items
    .filter((item) => item.is_active !== 0 && Number(item.parent_id || 0) === 0 && item.name.trim().length > 0)
    .sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0))
    .map((item) => ({
      title: item.name.trim(),
      href: item.route_name || item.url || "#",
      style: item.metadata?.style === "secondary" ? "secondary" : "primary",
    }));

  return links.length > 0
    ? links
    : [
        { title: "فتح الداشبورد", href: "/dashboard", style: "primary" },
        { title: "إدارة الحجوزات", href: "/dashboard/bookings", style: "secondary" },
      ];
}

export function AppPromoSection({ ctaItems = [] }: { ctaItems?: BridgeMenuItem[] }) {
  const actions = normalizeCtaItems(ctaItems);
  return (
    <section className="bg-white px-4 py-24 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="relative order-2 lg:order-1">
            <div className="absolute -inset-4 rounded-lg border border-slate-200 bg-[#f5f7f6]" />
            <div className="relative min-h-[520px] overflow-hidden rounded-lg shadow-[0_34px_90px_-54px_rgba(15,23,42,0.8)]">
              <Image
                src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80"
                alt="تجربة حجز عبر الجوال"
                fill
                sizes="(min-width: 1024px) 42vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              <div className="absolute right-5 top-5 rounded-md border border-white/20 bg-white/90 px-4 py-2 text-xs font-bold text-slate-950 shadow-lg backdrop-blur">
                تجربة متصلة
              </div>

              <div className="absolute inset-x-5 bottom-5 rounded-lg border border-white/40 bg-white/94 p-5 shadow-[0_22px_60px_-34px_rgba(15,23,42,0.9)] backdrop-blur">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-black text-slate-950">مسار واحد للحجز</p>
                    <p className="mt-1 text-xs text-slate-500">من الاختيار إلى التأكيد بدون انتقالات مربكة</p>
                  </div>
                  <span className="rounded-md bg-slate-950 px-3 py-1 text-xs font-bold text-white">
                    مباشر
                  </span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {journeyItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="rounded-lg border border-slate-200 bg-white p-4">
                        <div className={`mb-3 flex size-10 items-center justify-center rounded-lg border ${item.tone}`}>
                          <Icon className="size-4" />
                        </div>
                        <p className="text-sm font-bold text-slate-950">{item.label}</p>
                        <p className="mt-1 text-xs text-slate-500">{item.detail}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <span className="inline-flex rounded-md border border-rose-100 bg-rose-50 px-4 py-1.5 text-xs font-bold text-rose-600 shadow-sm">
              الحساب والداشبورد
            </span>
            <h2 className="mt-5 max-w-3xl text-3xl font-black leading-tight text-slate-950 sm:text-4xl lg:text-5xl">
              كل رحلة مستخدم تنتهي بإجراء واضح
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-8 text-slate-600 sm:text-base">
              من البحث إلى صفحة التفاصيل ثم عرض السعر والداشبورد، تبقى المسارات مرتبطة بجلسة المستخدم وبيانات النظام الحالية.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {checkpoints.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 rounded-lg border border-slate-200 bg-[#f8f8f6] p-4"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white text-rose-600 shadow-sm">
                      <Icon className="size-4" />
                    </span>
                    <div>
                      <p className="text-xs font-black text-slate-400">0{index + 1}</p>
                      <p className="text-sm font-bold text-slate-950">{item.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              {actions.map((item) => {
                const isSecondary = item.style === "secondary";
                const Icon = isSecondary ? ListChecks : ArrowUpLeft;
                return (
                  <Link
                    key={`${item.title}-${item.href}`}
                    href={item.href}
                    className={
                      isSecondary
                        ? "inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-6 py-4 text-sm font-semibold text-slate-900 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                        : "inline-flex items-center gap-2 rounded-lg bg-[#FF385C] px-6 py-4 text-sm font-semibold !text-white shadow-lg shadow-[#FF385C]/20 transition hover:bg-[#E31C5F]"
                    }
                  >
                    {item.title}
                    <Icon className="size-4" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
