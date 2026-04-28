"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpLeft, BadgePercent, Clock3, Flame, ShieldCheck, TimerReset } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { BridgeLastMinuteHome, BridgeListing } from "@/lib/api";
import { buildListingPath } from "@/lib/api";
import { parseMultilingualText } from "@/lib/parse-multilingual-text";
import { urgentDeals as fallbackDeals } from "@/lib/site-data";
import { FALLBACK_LISTING_IMAGE, formatMoney, listingBadge, normalizeAssetUrl } from "@/lib/presentation";

type UrgentDealsSectionProps = {
  items?: BridgeListing[] | null;
  lastMinuteHomes?: BridgeLastMinuteHome[] | null;
};

type DealCard = {
  title: string;
  badge: string;
  discount: string;
  price: string;
  originalPrice?: string;
  discountPercent?: number;
  href: string;
  image: string;
  dealId: string;
  dateLabel?: string;
  endsDateLabel?: string;
  endsAtTimestamp?: number;
  durationHours?: number;
  source: "dashboard" | "fallback";
};

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const countdownStorageKey = "labayh-deal-countdown-end";

function getRollingCountdownEnd(storageKey: string, durationMs: number) {
  if (typeof window === "undefined") {
    return Date.now() + durationMs;
  }

  const stored = Number(window.localStorage.getItem(storageKey) ?? 0);
  const now = Date.now();

  if (Number.isFinite(stored) && stored > now) {
    return stored;
  }

  const nextEnd = now + durationMs;
  window.localStorage.setItem(storageKey, String(nextEnd));
  return nextEnd;
}

function getDealCountdownEnd(deal?: DealCard) {
  const now = Date.now();
  const dashboardEnd = Number(deal?.endsAtTimestamp ?? 0) * 1000;

  if (Number.isFinite(dashboardEnd) && dashboardEnd > now) {
    return dashboardEnd;
  }

  const durationMs = Math.max(1, Number(deal?.durationHours ?? 24)) * 60 * 60 * 1000;
  return getRollingCountdownEnd(`${countdownStorageKey}-${deal?.dealId ?? "global"}`, durationMs);
}

function formatCountdown(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
  };
}

function useDealCountdown(deal?: DealCard) {
  const [remaining, setRemaining] = useState(DAY_IN_MS);

  useEffect(() => {
    function tick() {
      const end = getDealCountdownEnd(deal);
      const left = end - Date.now();

      if (left <= 0) {
        window.localStorage.removeItem(`${countdownStorageKey}-${deal?.dealId ?? "global"}`);
        setRemaining(Math.max(1, Number(deal?.durationHours ?? 24)) * 60 * 60 * 1000);
        return;
      }

      setRemaining(left);
    }

    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [deal]);

  return formatCountdown(remaining);
}

function DealCountdown({ deal, compact = false }: { deal?: DealCard; compact?: boolean }) {
  const time = useDealCountdown(deal);
  const units = [
    { label: "ساعة", value: time.hours },
    { label: "دقيقة", value: time.minutes },
    { label: "ثانية", value: time.seconds },
  ];

  return (
    <div className={compact ? "rounded-xl border border-white/12 bg-white/10 p-3" : "rounded-2xl border border-white/12 bg-white/[0.06] p-4 shadow-2xl shadow-black/20 backdrop-blur"}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-white/70">تنتهي الصفقة خلال</span>
        <Clock3 className="size-4 text-rose-300" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {units.map((unit) => (
          <div key={unit.label} className="rounded-lg border border-white/12 bg-white text-center text-slate-950">
            <div className={compact ? "px-2 pt-1.5 text-lg font-black tabular-nums" : "px-3 pt-2 text-2xl font-black tabular-nums"}>
              {unit.value}
            </div>
            <div className="pb-2 text-[10px] font-semibold text-slate-500">{unit.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function UrgentDealsSection({ items, lastMinuteHomes }: UrgentDealsSectionProps) {
  const deals = useMemo<DealCard[]>(() => {
    const lastMinuteDeals = (lastMinuteHomes ?? [])
      .filter((item) => item.enabled)
      .slice(0, 4)
      .map((item) => ({
        title: parseMultilingualText(item.title, "ar"),
        badge: "صفقة سريعة",
        discount: "عرض آخر لحظة",
        price: formatMoney(item.price),
        originalPrice: item.original_price && item.original_price > item.price ? formatMoney(item.original_price) : undefined,
        discountPercent: item.discount_percent,
        href: `/home/${item.home_id}`,
        image: normalizeAssetUrl(item.thumbnail || FALLBACK_LISTING_IMAGE),
        dealId: `last-minute-${item.id}`,
        dateLabel: item.date,
        endsDateLabel: item.ends_date,
        endsAtTimestamp: item.ends_at_timestamp,
        durationHours: item.duration_hours ?? 24,
        source: "dashboard" as const,
      }));

    if (lastMinuteDeals.length > 0) {
      return lastMinuteDeals;
    }

    const dashboardDeals = (items ?? [])
      .filter((item) => item.use_offer || item.offer_percent || item.is_featured)
      .slice(0, 4)
      .map((item) => ({
        title: parseMultilingualText(item.title, "ar"),
        badge: item.offer_percent ? "صفقة مفعلة" : listingBadge(item),
        discount: item.offer_percent ? `خصم ${item.offer_percent}%` : "عرض مميز من لوحة التحكم",
        price: formatMoney(item.price_from),
        discountPercent: item.offer_percent,
        href: buildListingPath(item),
        image: normalizeAssetUrl(item.thumb || FALLBACK_LISTING_IMAGE),
        dealId: `promotion-${item.type}-${item.id}`,
        durationHours: 24,
        source: "dashboard" as const,
      }));

    if (dashboardDeals.length > 0) {
      return dashboardDeals;
    }

    return fallbackDeals.slice(0, 4).map((deal) => ({
      title: parseMultilingualText(deal.title, "ar"),
      badge: deal.badge,
      discount: deal.discount,
      price: "حسب التوفر",
      href: deal.href,
      image: deal.image,
      dealId: `fallback-${deal.href}`,
      durationHours: 24,
      source: "fallback" as const,
    }));
  }, [items, lastMinuteHomes]);

  const heroDeal = deals[0];
  const sideDeals = deals.slice(1);

  return (
    <section className="relative overflow-hidden bg-[#0B1220] px-4 py-24 text-white sm:px-6 lg:px-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,56,92,0.22),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(250,204,21,0.12),transparent_28%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-white/20 to-transparent" />

      <div className="relative mx-auto max-w-[1440px]">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-rose-300/30 bg-rose-500/12 px-4 py-2 text-xs font-bold text-rose-100">
              <Flame className="size-4 text-rose-300" />
              صفقات اليوم
            </span>
            <h2 className="mt-5 max-w-3xl text-4xl font-black leading-tight tracking-tight sm:text-5xl">
              صفقات سريعة بوقت محدود من لوحة التحكم
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/72">
              هذا القسم يعرض عروض آخر لحظة المفعلة في الداشبورد أولاً. كل صفقة لها عداد مستقل لمدة 24 ساعة من تاريخ بداية العرض، وتظهر مباشرة في الواجهة عند تفعيلها.
            </p>
          </div>
          <DealCountdown deal={heroDeal} />
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          {heroDeal ? (
            <article className="group relative min-h-[520px] overflow-hidden rounded-2xl border border-white/12 bg-white/[0.04] shadow-2xl shadow-black/20">
              <Image
                src={heroDeal.image}
                alt={heroDeal.title}
                fill
                sizes="(min-width: 1024px) 60vw, 100vw"
                className="object-cover opacity-72 transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220] via-[#0B1220]/68 to-[#0B1220]/10" />
              <div className="absolute start-6 top-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black text-slate-950 shadow-lg">
                <BadgePercent className="size-4 text-rose-500" />
                {heroDeal.discount}
              </div>
              <div className="relative flex min-h-[520px] flex-col justify-end p-6 sm:p-8 lg:p-10">
                <div className="mb-5 flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-rose-500 px-4 py-2 text-xs font-bold text-white">{heroDeal.badge}</span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-4 py-2 text-xs font-semibold text-white/80">
                    <ShieldCheck className="size-4" />
                    {heroDeal.source === "dashboard" ? "مربوطة بالداش بورد" : "عرض احتياطي"}
                  </span>
                  {heroDeal.dateLabel ? (
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-4 py-2 text-xs font-semibold text-white/80">
                      <TimerReset className="size-4" />
                      يبدأ: {heroDeal.dateLabel}
                    </span>
                  ) : null}
                </div>
                <h3 className="max-w-2xl text-4xl font-black leading-tight">{heroDeal.title}</h3>
                <p className="mt-4 max-w-xl text-sm leading-7 text-white/72">
                  سعر الصفقة <span className="font-bold text-white">{heroDeal.price}</span>
                  {heroDeal.originalPrice ? (
                    <span className="ms-2 text-white/50 line-through">{heroDeal.originalPrice}</span>
                  ) : null}
                  . راجع التوفر قبل إتمام الحجز لأن الصفقات محدودة بزمن وعدد حجوزات.
                </p>
                {heroDeal.discountPercent && heroDeal.discountPercent > 0 ? (
                  <div className="mt-4 inline-flex w-fit rounded-full bg-amber-300 px-4 py-2 text-xs font-black text-slate-950">
                    وفر {heroDeal.discountPercent}% على هذا العرض
                  </div>
                ) : null}
                {heroDeal.endsDateLabel ? (
                  <div className="mt-3 text-sm font-semibold text-white/75">
                    تاريخ انتهاء العرض: {heroDeal.endsDateLabel}
                  </div>
                ) : null}
                <Link
                  href={heroDeal.href}
                  className="mt-7 inline-flex w-fit items-center gap-2 rounded-full bg-[#FF385C] px-6 py-3 text-sm font-black text-white transition hover:bg-[#E31C5F]"
                >
                  احجز الصفقة الآن
                  <ArrowUpLeft className="size-4" />
                </Link>
              </div>
            </article>
          ) : null}

          <div className="grid gap-6">
            {sideDeals.map((deal) => (
              <article
                key={`${deal.dealId}-${deal.href}`}
                className="group relative min-h-[260px] overflow-hidden rounded-2xl border border-white/12 bg-white/[0.04]"
              >
                <Image
                  src={deal.image}
                  alt={deal.title}
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover opacity-55 transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-l from-[#0B1220]/96 via-[#0B1220]/76 to-[#0B1220]/24" />
                <div className="relative grid min-h-[260px] gap-5 p-6 md:grid-cols-[1fr_220px] md:items-end">
                  <div className="self-end">
                    <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-black text-slate-950">
                      <BadgePercent className="size-4 text-rose-500" />
                      {deal.discount}
                    </span>
                    <h3 className="text-2xl font-black leading-tight">{deal.title}</h3>
                    <p className="mt-3 text-sm text-white/70">
                      سعر الصفقة <span className="font-bold text-white">{deal.price}</span>
                      {deal.originalPrice ? <span className="ms-2 text-white/45 line-through">{deal.originalPrice}</span> : null}
                    </p>
                    {deal.discountPercent && deal.discountPercent > 0 ? (
                      <span className="mt-3 inline-flex rounded-full bg-amber-300 px-3 py-1 text-xs font-black text-slate-950">
                        وفر {deal.discountPercent}%
                      </span>
                    ) : null}
                    {deal.endsDateLabel ? (
                      <div className="mt-2 text-xs font-semibold text-white/65">ينتهي في: {deal.endsDateLabel}</div>
                    ) : null}
                    <Link
                      href={deal.href}
                      className="mt-5 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-white transition hover:bg-white hover:text-slate-950"
                    >
                      مشاهدة الصفقة
                      <ArrowUpLeft className="size-4" />
                    </Link>
                  </div>
                  <div className="self-end">
                    <DealCountdown deal={deal} compact />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
