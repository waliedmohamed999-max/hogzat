import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { ArrowUpRight, Clock3, ExternalLink, Flame, Gauge, TimerReset, TrendingUp, type LucideIcon } from "lucide-react";
import { LastMinuteDealActions } from "@/components/dashboard/last-minute-deal-actions";
import { getLastMinuteHomes } from "@/lib/api";
import { FALLBACK_LISTING_IMAGE, formatMoney, normalizeAssetUrl } from "@/lib/presentation";

function remainingLabel(seconds?: number) {
  const totalSeconds = Math.max(0, Number(seconds ?? 0));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (totalSeconds <= 0) {
    return "انتهى العرض، ويمكن إعادة تشغيل عداد 24 ساعة من تاريخ بداية جديد.";
  }

  return `${hours.toLocaleString("ar-SA")} ساعة و ${minutes.toLocaleString("ar-SA")} دقيقة`;
}

export default async function HomeLastMinutePage() {
  const headerStore = await headers();
  const items = await getLastMinuteHomes(headerStore.get("cookie") ?? "");
  const deals = items ?? [];
  const activeCount = deals.filter((item) => item.enabled).length;
  const expiredCount = deals.filter((item) => item.expired).length;
  const bestDiscount = Math.max(0, ...deals.map((item) => Number(item.discount_percent ?? 0)));

  return (
    <div className="space-y-6" dir="rtl">
      <section className="overflow-hidden rounded-[28px] border border-gray-100 bg-white shadow-sm">
        <div className="grid gap-6 bg-[#1a1f36] p-6 text-white lg:grid-cols-[minmax(0,1fr)_360px] lg:p-8">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#FF385C]/15 px-3 py-1 text-xs font-bold text-[#FF385C]">
              <Flame className="size-4" />
              الصفقات السريعة
            </span>
            <h1 className="mt-4 text-3xl font-black">عروض آخر لحظة</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/70">
              تحكم في العروض التي تظهر مباشرة في واجهة الصفقات السريعة، مع سعر خصم واضح، تاريخ بداية ونهاية، وعداد مدة العرض داخل البطاقة.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/home-search-result?featured=1" className="inline-flex items-center gap-2 rounded-xl bg-[#FF385C] px-4 py-2 text-sm font-bold text-white">
                معاينة الواجهة
                <ArrowUpRight className="size-4" />
              </Link>
              <Link href="/dashboard/services/homes" className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold text-white">
                إدارة الإقامات
                <ExternalLink className="size-4" />
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Metric label="كل العروض" value={deals.length} icon={Gauge} />
            <Metric label="مفعلة الآن" value={activeCount} icon={TrendingUp} tone="green" />
            <Metric label="منتهية" value={expiredCount} icon={TimerReset} tone="amber" />
            <Metric label="أعلى خصم" value={`${bestDiscount.toLocaleString("ar-SA")}%`} icon={Flame} tone="rose" />
          </div>
        </div>
      </section>

      {deals.length > 0 ? (
        <div className="grid gap-5 xl:grid-cols-2">
          {deals.map((item) => (
            <article key={item.id} className="overflow-hidden rounded-[28px] border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="relative h-64 bg-gray-100">
                <Image
                  src={normalizeAssetUrl(item.thumbnail || FALLBACK_LISTING_IMAGE)}
                  alt={item.title}
                  fill
                  sizes="(min-width: 1280px) 50vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1f36]/85 via-[#1a1f36]/15 to-transparent" />
                <span className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-bold ${item.enabled ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
                  {item.enabled ? "مفعل" : "متوقف"}
                </span>
                {item.discount_percent ? (
                  <span className="absolute left-4 top-4 rounded-full bg-[#FF385C] px-3 py-1 text-xs font-bold text-white">
                    خصم {Number(item.discount_percent).toLocaleString("ar-SA")}%
                  </span>
                ) : null}
                <div className="absolute bottom-4 right-4 left-4 text-white">
                  <h2 className="line-clamp-2 text-2xl font-black">{item.title}</h2>
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur">
                    <Clock3 className="size-4" />
                    مدة العرض: {Number(item.duration_hours ?? 24).toLocaleString("ar-SA")} ساعة
                  </div>
                </div>
              </div>

              <div className="space-y-5 p-5">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <InfoTile label="سعر الصفقة" value={formatMoney(item.price)} accent="rose" />
                  <InfoTile label="السعر الأساسي" value={item.original_price ? formatMoney(item.original_price) : "-"} muted />
                  <InfoTile label="بداية العرض" value={item.date || "-"} />
                  <InfoTile label="انتهاء العرض" value={item.ends_date || "-"} />
                </div>

                <div className="rounded-2xl border border-[#FF385C]/15 bg-[#FF385C]/5 p-4">
                  <div className="flex items-start gap-3">
                    <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#FF385C] text-white">
                      <TimerReset className="size-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#FF385C]">الوقت المتبقي في البطاقة</p>
                      <p className="mt-1 text-sm font-black text-[#1a1f36]">{remainingLabel(item.remaining_seconds)}</p>
                    </div>
                  </div>
                </div>

                <LastMinuteDealActions
                  id={item.id}
                  enabled={item.enabled}
                  price={item.price}
                  date={item.date}
                  endsDate={item.ends_date}
                />

                <Link href={item.public_url || `/home/${item.home_id}`} className="inline-flex items-center gap-2 text-sm font-bold text-[#FF385C]">
                  عرض الإعلان
                  <ExternalLink className="size-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <section className="rounded-[28px] border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-[#FF385C]/10 text-[#FF385C]">
            <Flame className="size-8" />
          </div>
          <h2 className="mt-4 text-xl font-black text-[#1a1f36]">لا توجد عروض آخر لحظة</h2>
          <p className="mt-2 text-sm text-gray-500">أضف الصفقة من إعدادات الوحدة ثم فعلها هنا لتظهر في الواجهة.</p>
        </section>
      )}
    </div>
  );
}

function Metric({ label, value, icon: Icon, tone = "default" }: { label: string; value: number | string; icon: LucideIcon; tone?: "default" | "green" | "amber" | "rose" }) {
  const toneClass = {
    default: "bg-white/10 text-white",
    green: "bg-emerald-400/15 text-emerald-200",
    amber: "bg-amber-400/15 text-amber-200",
    rose: "bg-[#FF385C]/20 text-white",
  }[tone];

  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
      <div className={`mb-3 grid size-10 place-items-center rounded-xl ${toneClass}`}>
        <Icon className="size-5" />
      </div>
      <div className="text-2xl font-black">{typeof value === "number" ? value.toLocaleString("ar-SA") : value}</div>
      <div className="mt-1 text-xs font-bold text-white/60">{label}</div>
    </div>
  );
}

function InfoTile({ label, value, accent, muted = false }: { label: string; value: string; accent?: "rose"; muted?: boolean }) {
  return (
    <div className="rounded-2xl bg-gray-50 p-4">
      <div className="text-xs font-bold text-gray-400">{label}</div>
      <div className={`mt-1 text-base font-black ${accent === "rose" ? "text-[#FF385C]" : "text-[#1a1f36]"} ${muted ? "line-through decoration-gray-400" : ""}`}>
        {value}
      </div>
    </div>
  );
}
