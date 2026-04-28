"use client";

import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  ArrowDownToLine,
  BarChart3,
  CalendarCheck2,
  CalendarClock,
  CalendarDays,
  CalendarX,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Copy,
  CreditCard,
  Download,
  Eye,
  FileSpreadsheet,
  Grid2X2,
  ImageIcon,
  List,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  RefreshCw,
  ReceiptText,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Users,
  X,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";
import type {
  BridgeBookingStats,
  BridgeBookingsResponse,
  BridgeDashboardBooking,
  BridgeDashboardBookingDetail,
} from "@/lib/api";
import { secureFetch } from "@/lib/client-security";
import { parseMultilingualText } from "@/lib/parse-multilingual-text";
import { FALLBACK_LISTING_IMAGE, normalizeAssetUrl } from "@/lib/presentation";

type BookingsModuleProps = {
  initialBookings: BridgeBookingsResponse | null;
  initialStats: BridgeBookingStats | null;
};

type ApiBookingsResponse = {
  bookings: BridgeDashboardBooking[];
  total: number;
  page: number;
  perPage: number;
  pages: number;
};

type FiltersState = {
  search: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  listingType: string;
  paymentMethod: string;
  minPrice: string;
  maxPrice: string;
  sortBy: string;
  page: number;
  limit: number;
};

type ToastState = {
  type: "success" | "error";
  message: string;
} | null;

const defaultFilters: FiltersState = {
  search: "",
  status: "all",
  dateFrom: "",
  dateTo: "",
  listingType: "all",
  paymentMethod: "all",
  minPrice: "",
  maxPrice: "",
  sortBy: "newest",
  page: 1,
  limit: 10,
};

const statusConfig: Record<string, { label: string; dot: string; className: string }> = {
  upcoming: { label: "قادمة", dot: "bg-blue-500", className: "border-blue-100 bg-blue-50 text-blue-700" },
  active: { label: "نشطة الآن", dot: "bg-emerald-500", className: "border-emerald-100 bg-emerald-50 text-emerald-700" },
  completed: { label: "مكتملة", dot: "bg-gray-500", className: "border-gray-200 bg-gray-100 text-gray-700" },
  canceled: { label: "ملغية", dot: "bg-red-500", className: "border-red-100 bg-red-50 text-red-600" },
  pending: { label: "قيد المراجعة", dot: "bg-amber-500", className: "border-amber-100 bg-amber-50 text-amber-700" },
  incomplete: { label: "غير مكتملة", dot: "bg-amber-500", className: "border-amber-100 bg-amber-50 text-amber-700" },
  confirmed: { label: "مؤكدة", dot: "bg-emerald-500", className: "border-emerald-100 bg-emerald-50 text-emerald-700" },
};

const listingTypeLabel: Record<string, string> = {
  home: "إقامة",
  experience: "تجربة",
  service: "فعالية",
};

const paymentLabels: Record<string, string> = {
  bank_transfer: "تحويل بنكي",
  credit_card: "بطاقة ائتمانية",
  cash: "دفع عند الوصول",
  wallet: "محفظة",
};

function cleanTitle(value?: string | null) {
  return parseMultilingualText(value, "ar") || "حجز بدون عنوان";
}

function formatMoney(value?: number | null) {
  return `${Number(value ?? 0).toLocaleString("ar-SA")} ر.س`;
}

function formatDate(value?: string | null, withTime = false) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("ar-SA", {
    dateStyle: "medium",
    ...(withTime ? { timeStyle: "short" as const } : {}),
  }).format(date);
}

function getVisualStatus(booking: BridgeDashboardBooking) {
  const now = Date.now();
  const start = booking.start_date ? new Date(booking.start_date).getTime() : 0;
  const end = booking.end_date ? new Date(booking.end_date).getTime() : 0;

  if (booking.status === "canceled") return "canceled";
  if (booking.status === "completed") return "completed";
  if (booking.status === "confirmed") return "confirmed";
  if (booking.status === "pending" || booking.status === "incomplete") return "pending";
  if (start && end && start <= now && end >= now) return "active";
  return "upcoming";
}

function StatusBadge({ booking, status }: { booking?: BridgeDashboardBooking; status?: string }) {
  const key = status ?? (booking ? getVisualStatus(booking) : "pending");
  const config = statusConfig[key] ?? statusConfig.pending;

  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${config.className}`}>
      <span className={`size-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

function BookingImage({ booking, className }: { booking: BridgeDashboardBooking; className: string }) {
  const image =
    booking.service_image && !booking.service_image.includes("dummyimage")
      ? normalizeAssetUrl(booking.service_image)
      : FALLBACK_LISTING_IMAGE;

  return (
    <div className={`relative overflow-hidden bg-gray-100 ${className}`}>
      {image ? (
        <Image
          src={image}
          alt={cleanTitle(booking.service_title)}
          fill
          sizes="(max-width: 768px) 100vw, 360px"
          className="object-cover transition duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full items-center justify-center text-gray-300">
          <ImageIcon className="size-8" />
        </div>
      )}
    </div>
  );
}

function buildQuery(filters: FiltersState) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== "" && value !== "all") {
      params.set(key === "limit" ? "per_page" : key, String(value));
    }
  });
  return params.toString();
}

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "primary",
}: {
  label: string;
  value: string | number;
  hint: string;
  icon: LucideIcon;
  tone?: "primary" | "green" | "amber" | "red" | "blue";
}) {
  const toneClass = {
    primary: "bg-[#FF385C]/10 text-[#FF385C]",
    green: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
    blue: "bg-blue-50 text-blue-600",
  }[tone];

  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className={`flex size-11 items-center justify-center rounded-2xl ${toneClass}`}>
          <Icon className="size-5" />
        </div>
        <span className="rounded-full bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-400">Live</span>
      </div>
      <div className="mt-5 text-2xl font-black text-[#1a1f36]">{value}</div>
      <div className="mt-1 text-sm font-semibold text-gray-600">{label}</div>
      <div className="mt-3 text-xs text-emerald-600">{hint}</div>
    </article>
  );
}

function SkeletonRows() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="animate-pulse rounded-2xl border border-gray-100 bg-white p-4">
          <div className="flex gap-4">
            <div className="h-20 w-28 rounded-2xl bg-gray-100" />
            <div className="flex-1 space-y-3">
              <div className="h-4 w-24 rounded bg-gray-100" />
              <div className="h-5 w-2/3 rounded bg-gray-100" />
              <div className="h-4 w-1/2 rounded bg-gray-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function BookingsModule({ initialBookings, initialStats }: BookingsModuleProps) {
  const [filters, setFilters] = useState<FiltersState>(defaultFilters);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [view, setView] = useState<"list" | "grid">("list");
  const [data, setData] = useState<ApiBookingsResponse>({
    bookings: initialBookings?.results ?? [],
    total: initialBookings?.total ?? 0,
    page: initialBookings?.page ?? 1,
    perPage: initialBookings?.per_page ?? 10,
    pages: initialBookings?.pages ?? Math.max(1, Math.ceil((initialBookings?.total ?? 0) / (initialBookings?.per_page ?? 10))),
  });
  const [stats, setStats] = useState<BridgeBookingStats | null>(initialStats);
  const [selected, setSelected] = useState<BridgeDashboardBookingDetail | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<ToastState>(null);
  const [isPending, startTransition] = useTransition();

  const pageBookings = data.bookings;
  const allSelected = pageBookings.length > 0 && pageBookings.every((booking) => selectedIds.includes(booking.id));

  const statusCounts = useMemo(() => {
    return pageBookings.reduce<Record<string, number>>((counts, booking) => {
      const key = getVisualStatus(booking);
      counts[key] = (counts[key] ?? 0) + 1;
      return counts;
    }, {});
  }, [pageBookings]);

  const hasFilters = useMemo(
    () =>
      Object.entries(filters).some(([key, value]) => {
        if (key === "page") return value !== 1;
        if (key === "limit") return value !== 10;
        return value !== "" && value !== "all" && value !== "newest";
      }),
    [filters],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      startTransition(async () => {
        try {
          const response = await fetch(`/api/bookings?${buildQuery(filters)}`, { cache: "no-store" });
          if (!response.ok) throw new Error("Failed");
          const payload = (await response.json()) as ApiBookingsResponse;
          setData(payload);
          setSelectedIds([]);
          setError("");
        } catch {
          setError("تعذر تحميل الحجوزات حالياً.");
        }
      });
    }, 300);

    return () => window.clearTimeout(timer);
  }, [filters]);

  useEffect(() => {
    fetch("/api/bookings/stats", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: BridgeBookingStats | null) => {
        if (payload) setStats(payload);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  async function refreshData() {
    const response = await fetch(`/api/bookings?${buildQuery(filters)}`, { cache: "no-store" });
    if (response.ok) setData((await response.json()) as ApiBookingsResponse);
    const statsResponse = await fetch("/api/bookings/stats", { cache: "no-store" });
    if (statsResponse.ok) setStats((await statsResponse.json()) as BridgeBookingStats);
  }

  async function openDetails(booking: BridgeDashboardBooking) {
    setSelected(null);
    const response = await fetch(`/api/bookings/${booking.id}`, { cache: "no-store" });
    if (response.ok) {
      setSelected((await response.json()) as BridgeDashboardBookingDetail);
    } else {
      setToast({ type: "error", message: "تعذر فتح تفاصيل الحجز." });
    }
  }

  async function updateStatus(id: number, status: "confirmed" | "canceled") {
    const confirmed =
      status === "canceled"
        ? window.confirm("هل تريد إلغاء هذا الحجز؟")
        : window.confirm("هل تريد تأكيد هذا الحجز؟");

    if (!confirmed) return;

    const response = await secureFetch(`/api/bookings/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (response.ok) {
      await refreshData();
      if (selected?.id === id) {
        setSelected(null);
      }
      setToast({ type: "success", message: status === "confirmed" ? "تم تأكيد الحجز." : "تم إلغاء الحجز." });
    } else {
      setToast({ type: "error", message: "تعذر تحديث حالة الحجز." });
    }
  }

  async function bulkUpdate(status: "confirmed" | "canceled") {
    if (selectedIds.length === 0) return;
    const confirmed = window.confirm(`سيتم ${status === "confirmed" ? "تأكيد" : "إلغاء"} ${selectedIds.length} حجز. هل تريد المتابعة؟`);
    if (!confirmed) return;

    for (const id of selectedIds) {
      await secureFetch(`/api/bookings/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
    }

    await refreshData();
    setSelectedIds([]);
    setToast({ type: "success", message: "تم تنفيذ الإجراء الجماعي." });
  }

  function toggleSelected(id: number) {
    setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(pageBookings.map((booking) => booking.id));
  }

  function exportCsv(rows = pageBookings) {
    const headers = ["booking_id", "status", "title", "city", "start_date", "end_date", "guests", "total"];
    const content = [
      headers.join(","),
      ...rows.map((booking) =>
        [
          booking.booking_id,
          getVisualStatus(booking),
          `"${cleanTitle(booking.service_title).replace(/"/g, '""')}"`,
          `"${(booking.service_city || "").replace(/"/g, '""')}"`,
          booking.start_date,
          booking.end_date,
          booking.guests_count,
          booking.total,
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([`\uFEFF${content}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bookings-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const statCards = [
    {
      label: "إجمالي الإيراد",
      value: formatMoney(stats?.revenue ?? 0),
      hint: "↑ 12% هذا الشهر",
      icon: ReceiptText,
      tone: "primary" as const,
    },
    {
      label: "متوسط الحجز",
      value: formatMoney(stats?.avgPrice ?? 0),
      hint: "محسوب من الحجوزات الحالية",
      icon: BarChart3,
      tone: "blue" as const,
    },
    {
      label: "معدل الإلغاء",
      value: `${Number(stats?.cancellationRate ?? 0).toLocaleString("ar-SA")}%`,
      hint: "مرتبط بالحالات الملغية",
      icon: AlertCircle,
      tone: "amber" as const,
    },
    {
      label: "نسبة الإشغال",
      value: `${Number(stats?.occupancyRate ?? 0).toLocaleString("ar-SA")}%`,
      hint: "الحجوزات النشطة والمكتملة",
      icon: CheckCircle2,
      tone: "green" as const,
    },
  ];

  const operationsQueue: Array<[string, number, LucideIcon]> = [
    ["طلبات قيد المراجعة", stats?.pending ?? statusCounts.pending ?? 0, AlertCircle],
    ["حجوزات تبدأ قريباً", stats?.upcoming ?? statusCounts.upcoming ?? 0, Clock3],
    ["حجوزات نشطة الآن", stats?.active ?? statusCounts.active ?? 0, CalendarClock],
  ];

  return (
    <div className="space-y-6 bg-[#F7F8FA] pb-10" dir="rtl">
      {toast ? (
        <div
          className={`fixed left-6 top-6 z-[70] rounded-2xl border px-5 py-3 text-sm font-semibold shadow-lg ${
            toast.type === "success" ? "border-emerald-100 bg-emerald-50 text-emerald-700" : "border-red-100 bg-red-50 text-red-600"
          }`}
        >
          {toast.message}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-[28px] border border-gray-100 bg-white shadow-sm">
        <div className="bg-[#1a1f36] p-6 text-white lg:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
                <CalendarCheck2 className="size-4" />
                مركز إدارة الحجوزات
              </div>
              <h1 className="mt-4 text-3xl font-black">الحجوزات</h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-white/70">
                إدارة الطلبات، التأكيدات، الإلغاءات، الإيرادات، ومتابعة كل حجز من مكان واحد.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => refreshData()}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/15"
              >
                <RefreshCw className="size-4" />
                تحديث
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

        <div className="grid grid-cols-2 divide-x divide-x-reverse divide-gray-100 bg-white md:grid-cols-5">
          {[
            ["الكل", stats?.total ?? data.total],
            ["قادمة", stats?.upcoming ?? 0],
            ["نشطة", stats?.active ?? 0],
            ["مكتملة", stats?.completed ?? 0],
            ["ملغية", stats?.canceled ?? 0],
          ].map(([label, value]) => (
            <div key={String(label)} className="p-4 text-center">
              <div className="text-2xl font-black text-[#1a1f36]">{Number(value).toLocaleString("ar-SA")}</div>
              <div className="mt-1 text-xs font-semibold text-gray-500">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm lg:p-5">
        <div className="grid gap-3 lg:grid-cols-[1fr_220px_auto_auto]">
          <label className="relative">
            <Search className="absolute right-4 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <input
              value={filters.search}
              onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value, page: 1 }))}
              placeholder="ابحث باسم الإعلان أو رقم الحجز..."
              className="w-full rounded-2xl border border-gray-200 bg-white py-3 pe-11 ps-4 text-sm text-gray-900 outline-none transition focus:border-[#FF385C] focus:ring-2 focus:ring-[#FF385C]/20"
            />
          </label>
          <select
            value={filters.status}
            onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value, page: 1 }))}
            className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#FF385C] focus:ring-2 focus:ring-[#FF385C]/20"
          >
            <option value="all">كل الحالات</option>
            <option value="upcoming">قادمة</option>
            <option value="active">نشطة الآن</option>
            <option value="completed">مكتملة</option>
            <option value="canceled">ملغية</option>
            <option value="pending">قيد المراجعة</option>
          </select>
          <button
            type="button"
            onClick={() => setAdvancedOpen((value) => !value)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1a1f36] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#2d3458]"
          >
            <SlidersHorizontal className="size-4" />
            أدوات التصفية
          </button>
          <button
            type="button"
            onClick={() => setFilters(defaultFilters)}
            disabled={!hasFilters}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 px-5 py-3 text-sm font-bold text-gray-700 transition hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <X className="size-4" />
            مسح الكل
          </button>
        </div>

        {advancedOpen ? (
          <div className="mt-4 grid gap-3 rounded-3xl border border-gray-100 bg-gray-50 p-4 md:grid-cols-2 xl:grid-cols-5">
            <label className="space-y-1 text-xs font-bold text-gray-500">
              من تاريخ
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(event) => setFilters((current) => ({ ...current, dateFrom: event.target.value, page: 1 }))}
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900"
              />
            </label>
            <label className="space-y-1 text-xs font-bold text-gray-500">
              إلى تاريخ
              <input
                type="date"
                value={filters.dateTo}
                onChange={(event) => setFilters((current) => ({ ...current, dateTo: event.target.value, page: 1 }))}
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900"
              />
            </label>
            <label className="space-y-1 text-xs font-bold text-gray-500">
              نوع الإعلان
              <select
                value={filters.listingType}
                onChange={(event) => setFilters((current) => ({ ...current, listingType: event.target.value, page: 1 }))}
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900"
              >
                <option value="all">كل الأنواع</option>
                <option value="home">إقامة</option>
                <option value="experience">تجربة</option>
                <option value="service">فعالية</option>
              </select>
            </label>
            <label className="space-y-1 text-xs font-bold text-gray-500">
              طريقة الدفع
              <select
                value={filters.paymentMethod}
                onChange={(event) => setFilters((current) => ({ ...current, paymentMethod: event.target.value, page: 1 }))}
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900"
              >
                <option value="all">كل طرق الدفع</option>
                <option value="bank_transfer">تحويل بنكي</option>
                <option value="credit_card">بطاقة ائتمانية</option>
                <option value="cash">دفع عند الوصول</option>
              </select>
            </label>
            <label className="space-y-1 text-xs font-bold text-gray-500">
              الترتيب
              <select
                value={filters.sortBy}
                onChange={(event) => setFilters((current) => ({ ...current, sortBy: event.target.value, page: 1 }))}
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900"
              >
                <option value="newest">الأحدث</option>
                <option value="oldest">الأقدم</option>
                <option value="price_desc">الأعلى سعراً</option>
                <option value="price_asc">الأقل سعراً</option>
              </select>
            </label>
            <input
              value={filters.minPrice}
              onChange={(event) => setFilters((current) => ({ ...current, minPrice: event.target.value, page: 1 }))}
              placeholder="أقل مبلغ"
              className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm"
              inputMode="numeric"
            />
            <input
              value={filters.maxPrice}
              onChange={(event) => setFilters((current) => ({ ...current, maxPrice: event.target.value, page: 1 }))}
              placeholder="أعلى مبلغ"
              className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm"
              inputMode="numeric"
            />
          </div>
        ) : null}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <section className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm lg:p-5">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-[#1a1f36]">قائمة الحجوزات</h2>
              <p className="mt-1 text-sm text-gray-500">
                عرض {data.bookings.length.toLocaleString("ar-SA")} من أصل {data.total.toLocaleString("ar-SA")} حجز
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={toggleSelectAll}
                className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold text-gray-700 transition hover:border-gray-300"
              >
                {allSelected ? "إلغاء التحديد" : "تحديد الصفحة"}
              </button>
              <div className="flex rounded-2xl border border-gray-200 bg-white p-1">
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
              </div>
            </div>
          </div>

          {selectedIds.length > 0 ? (
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#FF385C]/20 bg-[#FF385C]/5 p-3">
              <span className="text-sm font-bold text-[#1a1f36]">
                تم تحديد {selectedIds.length.toLocaleString("ar-SA")} حجز
              </span>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => bulkUpdate("confirmed")} className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white">
                  تأكيد المحدد
                </button>
                <button onClick={() => bulkUpdate("canceled")} className="rounded-xl bg-red-500 px-3 py-2 text-xs font-bold text-white">
                  إلغاء المحدد
                </button>
                <button onClick={() => exportCsv(pageBookings.filter((booking) => selectedIds.includes(booking.id)))} className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700">
                  تصدير المحدد
                </button>
              </div>
            </div>
          ) : null}

          {isPending ? <SkeletonRows /> : null}

          {error ? (
            <div className="rounded-3xl border border-red-100 bg-red-50 p-8 text-center text-red-600">
              <AlertCircle className="mx-auto mb-2 size-9" />
              {error}
            </div>
          ) : null}

          {!isPending && !error && data.bookings.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-200 p-12 text-center">
              <CalendarX className="mx-auto size-16 text-gray-300" />
              <h3 className="mt-4 text-lg font-black text-gray-700">لا توجد حجوزات</h3>
              <p className="mt-2 text-sm text-gray-400">لم يتم العثور على حجوزات تطابق معايير البحث الحالية.</p>
              {hasFilters ? (
                <button onClick={() => setFilters(defaultFilters)} className="mt-5 rounded-xl bg-[#1a1f36] px-5 py-2.5 text-sm font-bold text-white">
                  مسح الفلاتر
                </button>
              ) : null}
            </div>
          ) : null}

          {!isPending && !error && data.bookings.length > 0 ? (
            view === "list" ? (
              <div className="overflow-hidden rounded-3xl border border-gray-100">
                <div className="hidden grid-cols-[44px_1.4fr_1fr_130px_130px_120px_130px] gap-3 bg-gray-50 px-4 py-3 text-xs font-black text-gray-500 lg:grid">
                  <span />
                  <span>الحجز</span>
                  <span>التواريخ</span>
                  <span>الحالة</span>
                  <span>الدفع</span>
                  <span>المبلغ</span>
                  <span>الإجراءات</span>
                </div>
                <div className="divide-y divide-gray-100">
                  {data.bookings.map((booking) => (
                    <article key={booking.id} className="group grid gap-4 p-4 transition hover:bg-gray-50 lg:grid-cols-[44px_1.4fr_1fr_130px_130px_120px_130px] lg:items-center">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(booking.id)}
                          onChange={() => toggleSelected(booking.id)}
                          className="size-4 rounded border-gray-300 text-[#FF385C] focus:ring-[#FF385C]"
                        />
                      </label>
                      <div className="flex min-w-0 gap-3">
                        <BookingImage booking={booking} className="size-16 shrink-0 rounded-2xl" />
                        <div className="min-w-0">
                          <button onClick={() => openDetails(booking)} className="line-clamp-1 text-right text-sm font-black text-[#1a1f36] hover:text-[#FF385C]">
                            {cleanTitle(booking.service_title)}
                          </button>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                            <span className="font-mono">#{booking.booking_id}</span>
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="size-3" />
                              {booking.service_city || "السعودية"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1 text-xs text-gray-500">
                        <div className="flex items-center gap-1 font-semibold text-gray-700">
                          <CalendarDays className="size-3.5" />
                          {formatDate(booking.start_date)}
                        </div>
                        <div>{formatDate(booking.end_date)}</div>
                      </div>
                      <StatusBadge booking={booking} />
                      <span className="text-sm font-semibold text-gray-600">{paymentLabels[booking.payment_type] ?? booking.payment_type ?? "غير محدد"}</span>
                      <span className="text-sm font-black text-[#1a1f36]">{formatMoney(booking.total)}</span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => openDetails(booking)} className="rounded-xl bg-[#1a1f36] px-3 py-2 text-xs font-bold text-white">
                          عرض
                        </button>
                        <button className="rounded-xl border border-gray-200 p-2 text-gray-500">
                          <MoreHorizontal className="size-4" />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {data.bookings.map((booking) => (
                  <article key={booking.id} className="group overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <BookingImage booking={booking} className="aspect-[16/10] w-full" />
                    <div className="space-y-4 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <StatusBadge booking={booking} />
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(booking.id)}
                          onChange={() => toggleSelected(booking.id)}
                          className="size-4 rounded border-gray-300 text-[#FF385C] focus:ring-[#FF385C]"
                        />
                      </div>
                      <div>
                        <h3 className="line-clamp-2 min-h-[2.75rem] text-base font-black text-[#1a1f36]">{cleanTitle(booking.service_title)}</h3>
                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                          <MapPin className="size-3.5" />
                          <span className="truncate">{booking.service_city || "السعودية"}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-2xl bg-gray-50 p-3">
                          <span className="block text-gray-400">الوصول</span>
                          <b className="text-gray-800">{formatDate(booking.start_date)}</b>
                        </div>
                        <div className="rounded-2xl bg-gray-50 p-3">
                          <span className="block text-gray-400">المغادرة</span>
                          <b className="text-gray-800">{formatDate(booking.end_date)}</b>
                        </div>
                      </div>
                      <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                        <div>
                          <span className="block text-xs text-gray-400">الإجمالي</span>
                          <b className="text-lg text-[#1a1f36]">{formatMoney(booking.total)}</b>
                        </div>
                        <button onClick={() => openDetails(booking)} className="rounded-xl bg-[#1a1f36] px-4 py-2 text-xs font-bold text-white">
                          التفاصيل
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )
          ) : null}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-5">
            <div className="text-sm text-gray-500">
              صفحة {filters.page.toLocaleString("ar-SA")} من {data.pages.toLocaleString("ar-SA")}
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={filters.page <= 1}
                onClick={() => setFilters((current) => ({ ...current, page: current.page - 1 }))}
                className="rounded-xl border border-gray-200 p-2 transition hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight className="size-4" />
              </button>
              <span className="rounded-xl bg-[#1a1f36] px-4 py-2 text-sm font-bold text-white">{filters.page.toLocaleString("ar-SA")}</span>
              <button
                disabled={filters.page >= data.pages}
                onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))}
                className="rounded-xl border border-gray-200 p-2 transition hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="size-4" />
              </button>
              <select
                value={filters.limit}
                onChange={(event) => setFilters((current) => ({ ...current, limit: Number(event.target.value), page: 1 }))}
                className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-[#FF385C]/10 text-[#FF385C]">
                <Sparkles className="size-5" />
              </div>
              <div>
                <h3 className="font-black text-[#1a1f36]">مركز التشغيل اليومي</h3>
                <p className="text-xs text-gray-400">مهام تحتاج متابعة</p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {operationsQueue.map(([label, value, Icon]) => (
                <div key={String(label)} className="flex items-center justify-between rounded-2xl bg-gray-50 p-3">
                  <span className="inline-flex items-center gap-2 text-sm font-bold text-gray-700">
                    <Icon className="size-4 text-[#FF385C]" />
                    {label}
                  </span>
                  <b className="text-[#1a1f36]">{Number(value).toLocaleString("ar-SA")}</b>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
            <h3 className="font-black text-[#1a1f36]">توزيع الحالات</h3>
            <div className="mt-5 space-y-3">
              {Object.entries({
                upcoming: stats?.upcoming ?? 0,
                active: stats?.active ?? 0,
                pending: stats?.pending ?? 0,
                completed: stats?.completed ?? 0,
                canceled: stats?.canceled ?? 0,
              }).map(([key, value]) => {
                const total = Math.max(stats?.total ?? data.total ?? 1, 1);
                const percent = Math.min(100, Math.round((Number(value) / total) * 100));
                const config = statusConfig[key] ?? statusConfig.pending;
                return (
                  <div key={key}>
                    <div className="mb-1 flex items-center justify-between text-xs font-bold text-gray-500">
                      <span>{config.label}</span>
                      <span>{Number(value).toLocaleString("ar-SA")}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <div className={`h-full rounded-full ${config.dot}`} style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
            <h3 className="font-black text-[#1a1f36]">أدوات سريعة</h3>
            <div className="mt-4 grid gap-2">
              <button onClick={() => exportCsv()} className="inline-flex items-center justify-between rounded-2xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700 transition hover:border-gray-300">
                تصدير تقرير الحجوزات
                <ArrowDownToLine className="size-4" />
              </button>
              <Link href="/dashboard/payments" className="inline-flex items-center justify-between rounded-2xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700 transition hover:border-gray-300">
                مراجعة المدفوعات
                <CreditCard className="size-4" />
              </Link>
              <button className="inline-flex items-center justify-between rounded-2xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700 transition hover:border-gray-300">
                إرسال تذكير للضيوف
                <MessageCircle className="size-4" />
              </button>
            </div>
          </section>
        </aside>
      </div>

      {selected ? (
        <div className="fixed inset-0 z-50 bg-[#1a1f36]/40 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <aside className="ms-auto h-full w-full max-w-[520px] overflow-y-auto bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="sticky top-0 z-10 border-b border-gray-100 bg-white/95 p-5 backdrop-blur">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="font-mono">#{selected.booking_id}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selected.booking_id);
                        setToast({ type: "success", message: "تم نسخ رقم الحجز." });
                      }}
                      className="rounded-lg border border-gray-200 p-1"
                    >
                      <Copy className="size-3" />
                    </button>
                  </div>
                  <h2 className="mt-2 text-2xl font-black text-[#1a1f36]">ملف الحجز</h2>
                </div>
                <button onClick={() => setSelected(null)} className="rounded-2xl border border-gray-200 p-2 transition hover:border-gray-300">
                  <X className="size-5" />
                </button>
              </div>
            </div>

            <div className="p-5">
              <BookingImage booking={selected} className="aspect-video w-full rounded-3xl" />
              <div className="mt-5 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-black text-[#1a1f36]">{cleanTitle(selected.service_title)}</h3>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <StatusBadge booking={selected} />
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">
                      {listingTypeLabel[selected.service_type] ?? "حجز"}
                    </span>
                  </div>
                </div>
                <div className="text-left">
                  <span className="block text-xs text-gray-400">الإجمالي</span>
                  <b className="text-xl text-[#1a1f36]">{formatMoney(selected.total)}</b>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-gray-50 p-4">
                  <span className="block text-xs font-bold text-gray-400">الوصول</span>
                  <b className="text-gray-900">{formatDate(selected.start_date)}</b>
                </div>
                <div className="rounded-2xl bg-gray-50 p-4">
                  <span className="block text-xs font-bold text-gray-400">المغادرة</span>
                  <b className="text-gray-900">{formatDate(selected.end_date)}</b>
                </div>
                <div className="rounded-2xl bg-gray-50 p-4">
                  <span className="block text-xs font-bold text-gray-400">الموقع</span>
                  <b className="text-gray-900">{selected.service_city || "السعودية"}</b>
                </div>
                <div className="rounded-2xl bg-gray-50 p-4">
                  <span className="block text-xs font-bold text-gray-400">الضيوف</span>
                  <b className="text-gray-900">{Number(selected.guests_count || 1).toLocaleString("ar-SA")}</b>
                </div>
              </div>

              <section className="mt-6 rounded-3xl border border-gray-100 p-5">
                <h4 className="flex items-center gap-2 font-black text-[#1a1f36]">
                  <Users className="size-5 text-[#FF385C]" />
                  بيانات الضيف
                </h4>
                <div className="mt-4 rounded-2xl bg-gray-50 p-4 text-sm text-gray-600">
                  <div className="font-black text-gray-900">
                    {selected.customer?.first_name || "-"} {selected.customer?.last_name || ""}
                  </div>
                  <div className="mt-1">{selected.customer?.email || "لا يوجد بريد"}</div>
                  <div>{selected.customer?.phone || "لا يوجد جوال"}</div>
                  <button className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-bold text-gray-700 shadow-sm">
                    <MessageCircle className="size-4" />
                    مراسلة الضيف
                  </button>
                </div>
              </section>

              <section className="mt-6 rounded-3xl border border-gray-100 p-5">
                <h4 className="flex items-center gap-2 font-black text-[#1a1f36]">
                  <ShieldCheck className="size-5 text-[#FF385C]" />
                  مسار الحجز
                </h4>
                <div className="mt-4 space-y-4">
                  {([
                    ["تم إنشاء الحجز", selected.created_at, CheckCircle2],
                    ["تم تسجيل بيانات الدفع", selected.payment_method || selected.payment_type, CreditCard],
                    ["حالة التأكيد", selected.status_label || statusConfig[getVisualStatus(selected)]?.label, CalendarCheck2],
                  ] satisfies Array<[string, string | undefined, LucideIcon]>).map(([label, value, Icon], index) => (
                    <div key={String(label)} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="flex size-8 items-center justify-center rounded-full bg-[#1a1f36] text-white">
                          <Icon className="size-4" />
                        </div>
                        {index < 2 ? <div className="h-8 w-px bg-gray-200" /> : null}
                      </div>
                      <div>
                        <div className="text-sm font-black text-gray-900">{label}</div>
                        <div className="text-xs text-gray-500">{String(value || "-")}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="mt-6 rounded-3xl border border-gray-100 p-5">
                <h4 className="flex items-center gap-2 font-black text-[#1a1f36]">
                  <ReceiptText className="size-5 text-[#FF385C]" />
                  الفاتورة
                </h4>
                <div className="mt-4 space-y-2 text-sm">
                  {(selected.invoice?.line_items ?? []).map((item) => (
                    <div key={item.label} className="flex justify-between rounded-2xl bg-gray-50 px-4 py-3 text-gray-600">
                      <span>{parseMultilingualText(item.label, "ar")}</span>
                      <span className="font-bold text-gray-900">{formatMoney(item.value)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t border-gray-100 pt-4 text-lg font-black text-[#1a1f36]">
                    <span>الإجمالي</span>
                    <span>{formatMoney(selected.invoice?.total ?? selected.total)}</span>
                  </div>
                </div>
              </section>

              <section className="sticky bottom-0 mt-6 flex flex-wrap gap-2 border-t border-gray-100 bg-white py-5">
                {getVisualStatus(selected) === "pending" ? (
                  <button onClick={() => updateStatus(selected.id, "confirmed")} className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white">
                    تأكيد الحجز
                  </button>
                ) : null}
                {!["canceled", "completed"].includes(selected.status) ? (
                  <button onClick={() => updateStatus(selected.id, "canceled")} className="rounded-2xl bg-red-500 px-4 py-3 text-sm font-bold text-white">
                    إلغاء الحجز
                  </button>
                ) : null}
                <Link href={selected.service_path} className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700">
                  <Eye className="size-4" />
                  فتح الإعلان
                </Link>
                <button onClick={() => exportCsv([selected])} className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700">
                  <Download className="size-4" />
                  تصدير
                </button>
                <button className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700">
                  <XCircle className="size-4" />
                  نزاع
                </button>
              </section>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
