"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDownToLine,
  BadgePercent,
  BarChart3,
  Bath,
  BedDouble,
  Copy,
  Eye,
  FileSpreadsheet,
  Grid2X2,
  Heart,
  ImageIcon,
  List,
  MapPin,
  Search,
  Share2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Trash2,
  TrendingUp,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import type { BridgeSessionUser, BridgeWishlistItem } from "@/lib/api";
import { secureFetch } from "@/lib/client-security";
import { parseMultilingualText } from "@/lib/parse-multilingual-text";
import { FALLBACK_LISTING_IMAGE, normalizeAssetUrl } from "@/lib/presentation";

type WishlistSuiteProps = {
  currentUser: BridgeSessionUser;
  wishlist: BridgeWishlistItem[];
};

type ViewMode = "grid" | "list";
type SortMode = "recommended" | "price_asc" | "price_desc" | "rating_desc" | "offers";

const typeLabels: Record<BridgeWishlistItem["type"], string> = {
  home: "إقامات",
  experience: "تجارب",
  service: "فعاليات",
};

const typePath: Record<BridgeWishlistItem["type"], string> = {
  home: "home",
  experience: "experience",
  service: "car",
};

function titleOf(item: BridgeWishlistItem) {
  return parseMultilingualText(item.title, "ar") || "عنصر محفوظ";
}

function locationOf(item: BridgeWishlistItem) {
  return item.city || "المملكة العربية السعودية";
}

function formatMoney(value?: number | null) {
  return `${Number(value ?? 0).toLocaleString("ar-SA")} ر.س`;
}

function itemHref(item: BridgeWishlistItem) {
  return `/${typePath[item.type]}/${item.id}/${item.slug}`;
}

function itemImage(item: BridgeWishlistItem) {
  return normalizeAssetUrl(item.thumb || FALLBACK_LISTING_IMAGE);
}

function scoreItem(item: BridgeWishlistItem) {
  let score = 60;
  if (item.rating > 0) score += Math.min(25, item.rating * 5);
  if (item.is_featured) score += 10;
  if (item.use_offer) score += 8;
  return Math.min(100, Math.round(score));
}

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  hint: string;
  icon: LucideIcon;
}) {
  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-[#FF385C]/10 text-[#FF385C]">
          <Icon className="size-5" />
        </div>
        <span className="rounded-full bg-gray-50 px-2.5 py-1 text-xs font-bold text-gray-400">Live</span>
      </div>
      <div className="mt-5 text-2xl font-black text-[#1a1f36]">{value}</div>
      <div className="mt-1 text-sm font-bold text-gray-600">{label}</div>
      <div className="mt-3 text-xs text-emerald-600">{hint}</div>
    </article>
  );
}

function SavedImage({ item, className }: { item: BridgeWishlistItem; className: string }) {
  const image = itemImage(item);

  return (
    <div className={`relative overflow-hidden bg-gray-100 ${className}`}>
      {image ? (
        <Image
          src={image}
          alt={titleOf(item)}
          fill
          sizes="(max-width: 768px) 100vw, 360px"
          className="object-cover transition duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full items-center justify-center text-gray-300">
          <ImageIcon className="size-8" />
        </div>
      )}
      {item.use_offer && item.offer_percent ? (
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#FF385C] px-3 py-1 text-xs font-black text-white shadow-sm">
          <BadgePercent className="size-3" />
          خصم {Number(item.offer_percent).toLocaleString("ar-SA")}%
        </span>
      ) : item.is_featured ? (
        <span className="absolute right-3 top-3 rounded-full bg-[#1a1f36] px-3 py-1 text-xs font-black text-white">
          مميز
        </span>
      ) : null}
      <span className="absolute bottom-3 right-3 rounded-full bg-black/55 px-3 py-1 text-xs font-bold text-white backdrop-blur">
        {typeLabels[item.type]}
      </span>
    </div>
  );
}

export function WishlistSuite({ currentUser, wishlist }: WishlistSuiteProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [type, setType] = useState<"all" | BridgeWishlistItem["type"]>("all");
  const [sort, setSort] = useState<SortMode>("recommended");
  const [view, setView] = useState<ViewMode>("grid");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [activeItem, setActiveItem] = useState<BridgeWishlistItem | null>(null);
  const [toast, setToast] = useState("");
  const [isPending, startTransition] = useTransition();

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    const result = wishlist.filter((item) => {
      const matchesType = type === "all" || item.type === type;
      const matchesSearch =
        !query ||
        titleOf(item).toLowerCase().includes(query) ||
        locationOf(item).toLowerCase().includes(query);
      return matchesType && matchesSearch;
    });

    return [...result].sort((a, b) => {
      if (sort === "price_asc") return Number(a.price_from ?? 0) - Number(b.price_from ?? 0);
      if (sort === "price_desc") return Number(b.price_from ?? 0) - Number(a.price_from ?? 0);
      if (sort === "rating_desc") return Number(b.rating ?? 0) - Number(a.rating ?? 0);
      if (sort === "offers") return Number(Boolean(b.use_offer)) - Number(Boolean(a.use_offer));
      return scoreItem(b) - scoreItem(a);
    });
  }, [search, sort, type, wishlist]);

  const stats = useMemo(() => {
    const total = wishlist.length;
    const offers = wishlist.filter((item) => item.use_offer).length;
    const featured = wishlist.filter((item) => item.is_featured).length;
    const average =
      total > 0
        ? wishlist.reduce((sum, item) => sum + Number(item.price_from ?? 0), 0) / total
        : 0;
    return { total, offers, featured, average };
  }, [wishlist]);

  const allSelected = filteredItems.length > 0 && filteredItems.every((item) => selectedIds.includes(item.id));
  const heroStats: Array<[string, string | number, LucideIcon]> = [
    ["كل العناصر", stats.total, Heart],
    ["عروض محفوظة", stats.offers, BadgePercent],
    ["عناصر مميزة", stats.featured, Sparkles],
    ["متوسط السعر", formatMoney(stats.average), BarChart3],
  ];

  function toggleSelected(id: number) {
    setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(filteredItems.map((item) => item.id));
  }

  async function removeItem(item: BridgeWishlistItem) {
    const response = await secureFetch("/api/v1/wishlist/toggle", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_id: item.id,
        type: item.type,
      }),
    });

    return response.ok;
  }

  function removeSelected() {
    if (selectedIds.length === 0) return;
    const confirmed = window.confirm(`سيتم إزالة ${selectedIds.length.toLocaleString("ar-SA")} عنصر من المفضلة. هل تريد المتابعة؟`);
    if (!confirmed) return;

    startTransition(async () => {
      const items = wishlist.filter((item) => selectedIds.includes(item.id));
      for (const item of items) {
        await removeItem(item);
      }
      setSelectedIds([]);
      setToast("تمت إزالة العناصر المحددة.");
      router.refresh();
    });
  }

  function exportCsv(rows = filteredItems) {
    const content = [
      ["id", "type", "title", "city", "price", "rating", "url"].join(","),
      ...rows.map((item) =>
        [
          item.id,
          item.type,
          `"${titleOf(item).replace(/"/g, '""')}"`,
          `"${locationOf(item).replace(/"/g, '""')}"`,
          item.price_from ?? 0,
          item.rating ?? 0,
          itemHref(item),
        ].join(","),
      ),
    ].join("\n");
    const blob = new Blob([`\uFEFF${content}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `wishlist-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function copyShareLink() {
    const url = `${window.location.origin}/dashboard/wishlist`;
    navigator.clipboard.writeText(url);
    setToast("تم نسخ رابط المفضلة.");
  }

  const selectedItems = wishlist.filter((item) => selectedIds.includes(item.id));

  return (
    <div className="space-y-6 bg-[#F7F8FA] pb-10" dir="rtl">
      {toast ? (
        <div className="fixed left-6 top-6 z-[70] rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-3 text-sm font-bold text-emerald-700 shadow-lg">
          {toast}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-[28px] border border-gray-100 bg-white shadow-sm">
        <div className="bg-[#1a1f36] p-6 text-white lg:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold text-white/80">
                <Heart className="size-4 fill-current text-[#FF385C]" />
                مركز المفضلة الذكي
              </div>
              <h1 className="mt-4 text-3xl font-black">المفضلة</h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-white/70">
                احفظ، قارن، صفّي، وراجع اختياراتك قبل الحجز. كل العناصر المحفوظة مرتبطة بجلسة {currentUser.display_name || currentUser.first_name}.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={copyShareLink}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/15"
              >
                <Share2 className="size-4" />
                مشاركة
              </button>
              <button
                type="button"
                onClick={() => exportCsv()}
                className="inline-flex items-center gap-2 rounded-xl bg-[#FF385C] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#e72f50]"
              >
                <FileSpreadsheet className="size-4" />
                تصدير CSV
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 divide-x divide-x-reverse divide-gray-100 bg-white md:grid-cols-4">
          {heroStats.map(([label, value, Icon]) => (
            <div key={String(label)} className="p-4 text-center">
              <Icon className="mx-auto mb-2 size-5 text-[#FF385C]" />
              <div className="text-xl font-black text-[#1a1f36]">{typeof value === "number" ? value.toLocaleString("ar-SA") : value}</div>
              <div className="mt-1 text-xs font-bold text-gray-500">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="محفوظاتك" value={stats.total.toLocaleString("ar-SA")} hint="مرتبطة بحسابك الحالي" icon={ShieldCheck} />
        <StatCard label="أفضل فرصة" value={stats.offers.toLocaleString("ar-SA")} hint="عناصر عليها خصومات" icon={TrendingUp} />
        <StatCard label="متوسط الميزانية" value={formatMoney(stats.average)} hint="متوسط السعر للعناصر" icon={BarChart3} />
        <StatCard label="نتائج ظاهرة" value={filteredItems.length.toLocaleString("ar-SA")} hint="بعد التصفية الحالية" icon={SlidersHorizontal} />
      </section>

      <section className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm lg:p-5">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto_auto]">
          <label className="relative">
            <Search className="absolute right-4 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="ابحث داخل المفضلة بالاسم أو المدينة..."
              className="w-full rounded-2xl border border-gray-200 bg-white py-3 pe-11 ps-4 text-sm text-gray-900 outline-none transition focus:border-[#FF385C] focus:ring-2 focus:ring-[#FF385C]/20"
            />
          </label>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortMode)}
            className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 outline-none transition focus:border-[#FF385C]"
          >
            <option value="recommended">الأفضل لك</option>
            <option value="price_asc">الأقل سعراً</option>
            <option value="price_desc">الأعلى سعراً</option>
            <option value="rating_desc">الأعلى تقييماً</option>
            <option value="offers">العروض أولاً</option>
          </select>
          <button
            type="button"
            onClick={toggleSelectAll}
            className="rounded-2xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700 transition hover:border-gray-300"
          >
            {allSelected ? "إلغاء التحديد" : "تحديد الكل"}
          </button>
          <div className="flex rounded-2xl border border-gray-200 bg-white p-1">
            <button
              type="button"
              onClick={() => setView("grid")}
              className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition ${
                view === "grid" ? "bg-[#1a1f36] text-white" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Grid2X2 className="size-4" />
              كروت
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition ${
                view === "list" ? "bg-[#1a1f36] text-white" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <List className="size-4" />
              قائمة
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[
            ["all", "الكل", wishlist.length],
            ["home", "الإقامات", wishlist.filter((item) => item.type === "home").length],
            ["experience", "التجارب", wishlist.filter((item) => item.type === "experience").length],
            ["service", "الفعاليات", wishlist.filter((item) => item.type === "service").length],
          ].map(([value, label, count]) => (
            <button
              key={String(value)}
              type="button"
              onClick={() => setType(value as "all" | BridgeWishlistItem["type"])}
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                type === value ? "bg-[#1a1f36] text-white" : "border border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              }`}
            >
              {label}
              <span className="ms-2 text-xs opacity-70">{Number(count).toLocaleString("ar-SA")}</span>
            </button>
          ))}
        </div>
      </section>

      {selectedIds.length > 0 ? (
        <section className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-[#FF385C]/20 bg-[#FF385C]/5 p-4">
          <div>
            <div className="font-black text-[#1a1f36]">تم تحديد {selectedIds.length.toLocaleString("ar-SA")} عنصر</div>
            <p className="text-xs text-gray-500">يمكنك التصدير، المقارنة، أو إزالة العناصر دفعة واحدة.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => exportCsv(selectedItems)} className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700">
              تصدير المحدد
            </button>
            <button onClick={removeSelected} disabled={isPending} className="rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white disabled:opacity-60">
              {isPending ? "جارٍ الإزالة..." : "إزالة المحدد"}
            </button>
          </div>
        </section>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <section className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm lg:p-5">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-[#1a1f36]">العناصر المحفوظة</h2>
              <p className="mt-1 text-sm text-gray-500">
                عرض {filteredItems.length.toLocaleString("ar-SA")} من أصل {wishlist.length.toLocaleString("ar-SA")} عنصر
              </p>
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-200 p-12 text-center">
              <Heart className="mx-auto size-16 text-gray-300" />
              <h3 className="mt-4 text-lg font-black text-gray-700">لا توجد عناصر محفوظة حالياً</h3>
              <p className="mt-2 text-sm text-gray-400">ابدأ بحفظ الإقامات والتجارب التي تهمك لتظهر هنا.</p>
              <Link href="/home-search-result" className="mt-5 inline-flex rounded-xl bg-[#1a1f36] px-5 py-2.5 text-sm font-bold text-white">
                تصفح الإقامات
              </Link>
            </div>
          ) : view === "grid" ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredItems.map((item) => (
                <article key={`${item.type}-${item.id}`} className="group overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <SavedImage item={item} className="aspect-[4/3] w-full" />
                  <div className="space-y-4 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <label className="inline-flex items-center gap-2 text-xs font-bold text-gray-500">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={() => toggleSelected(item.id)}
                          className="size-4 rounded border-gray-300 text-[#FF385C] focus:ring-[#FF385C]"
                        />
                        مقارنة
                      </label>
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                        <Star className="size-3 fill-current" />
                        {item.rating > 0 ? item.rating.toFixed(1) : "جديد"}
                      </span>
                    </div>
                    <div>
                      <h3 className="line-clamp-2 min-h-[2.75rem] text-base font-black text-[#1a1f36]">{titleOf(item)}</h3>
                      <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                        <MapPin className="size-3.5" />
                        <span className="truncate">{locationOf(item)}</span>
                      </div>
                    </div>
                    <div className="flex min-h-5 flex-wrap items-center gap-2 text-xs text-gray-500">
                      {item.guests ? <span className="inline-flex items-center gap-1"><Users className="size-3" />{item.guests} ضيف</span> : null}
                      {item.bedrooms ? <span className="inline-flex items-center gap-1"><BedDouble className="size-3" />{item.bedrooms} غرفة</span> : null}
                      {item.baths ? <span className="inline-flex items-center gap-1"><Bath className="size-3" />{item.baths} حمام</span> : null}
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                      <div>
                        <span className="block text-xs text-gray-400">يبدأ من</span>
                        <b className="text-lg text-[#1a1f36]">{formatMoney(item.price_from)}</b>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setActiveItem(item)} className="rounded-xl border border-gray-200 p-2 text-gray-600">
                          <Eye className="size-4" />
                        </button>
                        <Link href={itemHref(item)} className="rounded-xl bg-[#FF385C] px-4 py-2 text-xs font-bold text-white">
                          التفاصيل
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-gray-100">
              <div className="hidden grid-cols-[44px_1.4fr_120px_120px_120px_140px] gap-3 bg-gray-50 px-4 py-3 text-xs font-black text-gray-500 lg:grid">
                <span />
                <span>العنصر</span>
                <span>النوع</span>
                <span>التقييم</span>
                <span>السعر</span>
                <span>الإجراءات</span>
              </div>
              <div className="divide-y divide-gray-100">
                {filteredItems.map((item) => (
                  <article key={`${item.type}-${item.id}`} className="grid gap-4 p-4 transition hover:bg-gray-50 lg:grid-cols-[44px_1.4fr_120px_120px_120px_140px] lg:items-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleSelected(item.id)}
                      className="size-4 rounded border-gray-300 text-[#FF385C] focus:ring-[#FF385C]"
                    />
                    <div className="flex min-w-0 gap-3">
                      <SavedImage item={item} className="size-16 shrink-0 rounded-2xl" />
                      <div className="min-w-0">
                        <button onClick={() => setActiveItem(item)} className="line-clamp-1 text-right text-sm font-black text-[#1a1f36] hover:text-[#FF385C]">
                          {titleOf(item)}
                        </button>
                        <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                          <MapPin className="size-3" />
                          {locationOf(item)}
                        </div>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gray-600">{typeLabels[item.type]}</span>
                    <span className="inline-flex w-fit items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                      <Star className="size-3 fill-current" />
                      {item.rating > 0 ? item.rating.toFixed(1) : "جديد"}
                    </span>
                    <span className="text-sm font-black text-[#1a1f36]">{formatMoney(item.price_from)}</span>
                    <div className="flex gap-2">
                      <Link href={itemHref(item)} className="rounded-xl bg-[#1a1f36] px-3 py-2 text-xs font-bold text-white">فتح</Link>
                      <button onClick={() => setActiveItem(item)} className="rounded-xl border border-gray-200 p-2 text-gray-600">
                        <MoreIcon />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
            <h3 className="font-black text-[#1a1f36]">تحليل المفضلة</h3>
            <div className="mt-5 space-y-3">
              {Object.entries({
                home: wishlist.filter((item) => item.type === "home").length,
                experience: wishlist.filter((item) => item.type === "experience").length,
                service: wishlist.filter((item) => item.type === "service").length,
              }).map(([key, value]) => {
                const percent = wishlist.length ? Math.round((value / wishlist.length) * 100) : 0;
                return (
                  <div key={key}>
                    <div className="mb-1 flex items-center justify-between text-xs font-bold text-gray-500">
                      <span>{typeLabels[key as BridgeWishlistItem["type"]]}</span>
                      <span>{value.toLocaleString("ar-SA")}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <div className="h-full rounded-full bg-[#FF385C]" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
            <h3 className="font-black text-[#1a1f36]">اختيارات موصى بها</h3>
            <div className="mt-4 space-y-3">
              {filteredItems.slice(0, 3).map((item) => (
                <button key={`${item.type}-${item.id}`} onClick={() => setActiveItem(item)} className="flex w-full items-center gap-3 rounded-2xl bg-gray-50 p-3 text-right transition hover:bg-gray-100">
                  <SavedImage item={item} className="size-12 shrink-0 rounded-xl" />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-black text-[#1a1f36]">{titleOf(item)}</div>
                    <div className="text-xs text-gray-500">{formatMoney(item.price_from)}</div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
            <h3 className="font-black text-[#1a1f36]">أدوات سريعة</h3>
            <div className="mt-4 grid gap-2">
              <button onClick={() => exportCsv()} className="inline-flex items-center justify-between rounded-2xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700 transition hover:border-gray-300">
                تصدير كل المفضلة
                <ArrowDownToLine className="size-4" />
              </button>
              <Link href="/home-search-result" className="inline-flex items-center justify-between rounded-2xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700 transition hover:border-gray-300">
                اكتشاف إقامات جديدة
                <Sparkles className="size-4" />
              </Link>
            </div>
          </section>
        </aside>
      </div>

      {activeItem ? (
        <div className="fixed inset-0 z-50 bg-[#1a1f36]/40 backdrop-blur-sm" onClick={() => setActiveItem(null)}>
          <aside className="ms-auto h-full w-full max-w-[500px] overflow-y-auto bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white/95 p-5 backdrop-blur">
              <div>
                <div className="text-xs font-bold text-gray-400">تفاصيل العنصر المحفوظ</div>
                <h2 className="mt-1 text-2xl font-black text-[#1a1f36]">{titleOf(activeItem)}</h2>
              </div>
              <button onClick={() => setActiveItem(null)} className="rounded-2xl border border-gray-200 p-2">
                <X className="size-5" />
              </button>
            </div>
            <div className="p-5">
              <SavedImage item={activeItem} className="aspect-video w-full rounded-3xl" />
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-gray-50 p-4">
                  <span className="block text-xs font-bold text-gray-400">السعر</span>
                  <b className="text-lg text-[#1a1f36]">{formatMoney(activeItem.price_from)}</b>
                </div>
                <div className="rounded-2xl bg-gray-50 p-4">
                  <span className="block text-xs font-bold text-gray-400">التقييم</span>
                  <b className="text-lg text-[#1a1f36]">{activeItem.rating > 0 ? activeItem.rating.toFixed(1) : "جديد"}</b>
                </div>
                <div className="rounded-2xl bg-gray-50 p-4">
                  <span className="block text-xs font-bold text-gray-400">النوع</span>
                  <b className="text-lg text-[#1a1f36]">{typeLabels[activeItem.type]}</b>
                </div>
                <div className="rounded-2xl bg-gray-50 p-4">
                  <span className="block text-xs font-bold text-gray-400">درجة الملاءمة</span>
                  <b className="text-lg text-[#1a1f36]">{scoreItem(activeItem).toLocaleString("ar-SA")}%</b>
                </div>
              </div>
              <div className="mt-5 rounded-3xl border border-gray-100 p-5">
                <h3 className="font-black text-[#1a1f36]">مواصفات سريعة</h3>
                <div className="mt-4 grid gap-2 text-sm text-gray-600">
                  <span className="inline-flex items-center gap-2"><MapPin className="size-4 text-[#FF385C]" />{locationOf(activeItem)}</span>
                  {activeItem.guests ? <span className="inline-flex items-center gap-2"><Users className="size-4 text-[#FF385C]" />{activeItem.guests} ضيف</span> : null}
                  {activeItem.bedrooms ? <span className="inline-flex items-center gap-2"><BedDouble className="size-4 text-[#FF385C]" />{activeItem.bedrooms} غرفة</span> : null}
                  {activeItem.baths ? <span className="inline-flex items-center gap-2"><Bath className="size-4 text-[#FF385C]" />{activeItem.baths} حمام</span> : null}
                </div>
              </div>
              <div className="sticky bottom-0 mt-6 flex flex-wrap gap-2 border-t border-gray-100 bg-white py-5">
                <Link href={itemHref(activeItem)} className="rounded-2xl bg-[#FF385C] px-5 py-3 text-sm font-black text-white">
                  فتح التفاصيل
                </Link>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}${itemHref(activeItem)}`);
                    setToast("تم نسخ رابط العنصر.");
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700"
                >
                  <Copy className="size-4" />
                  نسخ الرابط
                </button>
                <button
                  onClick={() => {
                    const confirmed = window.confirm("هل تريد إزالة هذا العنصر من المفضلة؟");
                    if (!confirmed) return;
                    startTransition(async () => {
                      await removeItem(activeItem);
                      setActiveItem(null);
                      router.refresh();
                    });
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl bg-red-500 px-4 py-3 text-sm font-bold text-white"
                >
                  <Trash2 className="size-4" />
                  إزالة
                </button>
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}

function MoreIcon() {
  return <Eye className="size-4" />;
}
