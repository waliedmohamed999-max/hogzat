"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Bath,
  BedDouble,
  CheckCircle2,
  Copy,
  Edit3,
  ExternalLink,
  Eye,
  FileSpreadsheet,
  Grid2X2,
  Home,
  ImageIcon,
  List,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Tags,
  Trash2,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import type { BridgeManagedServiceItem, BridgeManagedServicesResponse } from "@/lib/api";
import { secureFetch } from "@/lib/client-security";
import { FALLBACK_LISTING_IMAGE, normalizeAssetUrl } from "@/lib/presentation";

type ManagedHomesSuiteProps = {
  managed: BridgeManagedServicesResponse | null;
};

type ViewMode = "grid" | "list";
type SortMode = "newest" | "price_asc" | "price_desc" | "guests_desc";

const statusOptions = [
  { value: "all", label: "كل الحالات" },
  { value: "publish", label: "منشور" },
  { value: "pending", label: "معلق" },
  { value: "draft", label: "مسودة" },
  { value: "trash", label: "سلة المهملات" },
];

const statusMeta: Record<string, { label: string; className: string; dot: string }> = {
  publish: { label: "منشور", className: "border-emerald-100 bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  pending: { label: "معلق", className: "border-amber-100 bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  draft: { label: "مسودة", className: "border-gray-100 bg-gray-50 text-gray-600", dot: "bg-gray-400" },
  trash: { label: "محذوف", className: "border-red-100 bg-red-50 text-red-600", dot: "bg-red-500" },
};

function formatMoney(value?: number | null) {
  return `${Number(value ?? 0).toLocaleString("ar-SA")} ر.س`;
}

function publicHomePath(item: BridgeManagedServiceItem) {
  return item.public_url || `/home/${item.id}/${item.slug || "details"}`;
}

function itemImage(item: BridgeManagedServiceItem) {
  return normalizeAssetUrl(item.thumbnail || FALLBACK_LISTING_IMAGE);
}

function statusBadge(status: string, label?: string) {
  const meta = statusMeta[status] ?? { label: label || status || "غير محدد", className: "border-gray-100 bg-gray-50 text-gray-600", dot: "bg-gray-400" };
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${meta.className}`}>
      <span className={`size-1.5 rounded-full ${meta.dot}`} />
      {label || meta.label}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, hint }: { icon: LucideIcon; label: string; value: string | number; hint: string }) {
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

function HomeImage({ item, className }: { item: BridgeManagedServiceItem; className: string }) {
  const image = itemImage(item);
  return (
    <div className={`relative overflow-hidden bg-gray-100 ${className}`}>
      {image ? (
        <Image src={image} alt={item.title} fill sizes="(max-width: 768px) 100vw, 360px" className="object-cover transition duration-300 group-hover:scale-105" />
      ) : (
        <div className="flex h-full items-center justify-center text-gray-300">
          <ImageIcon className="size-8" />
        </div>
      )}
    </div>
  );
}

export function ManagedHomesSuite({ managed }: ManagedHomesSuiteProps) {
  const router = useRouter();
  const [items, setItems] = useState(managed?.results ?? []);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState<SortMode>("newest");
  const [view, setView] = useState<ViewMode>("grid");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [activeItem, setActiveItem] = useState<BridgeManagedServiceItem | null>(null);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const stats = useMemo(() => {
    const total = items.length;
    const published = items.filter((item) => item.status === "publish").length;
    const pending = items.filter((item) => item.status === "pending").length;
    const drafts = items.filter((item) => item.status === "draft").length;
    const avgPrice = total ? items.reduce((sum, item) => sum + Number(item.price ?? 0), 0) / total : 0;
    return { total, published, pending, drafts, avgPrice };
  }, [items]);

  const filteredItems = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const result = items.filter((item) => {
      const matchesSearch = !needle || `${item.title} ${item.id} ${item.type_label}`.toLowerCase().includes(needle);
      const matchesStatus = status === "all" || item.status === status;
      return matchesSearch && matchesStatus;
    });

    return [...result].sort((a, b) => {
      if (sort === "price_asc") return Number(a.price ?? 0) - Number(b.price ?? 0);
      if (sort === "price_desc") return Number(b.price ?? 0) - Number(a.price ?? 0);
      if (sort === "guests_desc") return Number(b.guests ?? 0) - Number(a.guests ?? 0);
      return Number(b.id) - Number(a.id);
    });
  }, [items, query, sort, status]);

  const allSelected = filteredItems.length > 0 && filteredItems.every((item) => selectedIds.includes(item.id));

  function toggleSelected(id: number) {
    setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function toggleSelectAll() {
    setSelectedIds(allSelected ? [] : filteredItems.map((item) => item.id));
  }

  async function submitAction(item: BridgeManagedServiceItem, action: "status" | "duplicate" | "delete", body?: unknown) {
    setPendingId(item.id);
    setError("");

    const response = await secureFetch(`/api/v1/dashboard/services/homes/${item.id}/${action}`, {
      method: "POST",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const result = (await response.json().catch(() => null)) as { status?: number; message?: string } | null;
    setPendingId(null);

    if (!response.ok || result?.status !== 1) {
      setError(result?.message || "تعذر تنفيذ الإجراء حالياً.");
      return false;
    }

    if (action === "delete") {
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      setSelectedIds((current) => current.filter((id) => id !== item.id));
    }

    setToast(result.message || "تم تنفيذ الإجراء.");
    startTransition(() => router.refresh());
    return true;
  }

  function bulkDelete() {
    if (selectedIds.length === 0) return;
    const confirmed = window.confirm(`سيتم حذف ${selectedIds.length.toLocaleString("ar-SA")} وحدة. هل تريد المتابعة؟`);
    if (!confirmed) return;

    startTransition(async () => {
      for (const item of items.filter((entry) => selectedIds.includes(entry.id))) {
        await submitAction(item, "delete");
      }
      setSelectedIds([]);
      setToast("تم حذف الوحدات المحددة.");
    });
  }

  function exportCsv(rows = filteredItems) {
    const csvRows = [
      ["id", "title", "status", "price", "guests", "public_url"],
      ...rows.map((item) => [item.id, item.title, item.status, item.price, item.guests, publicHomePath(item)]),
    ];
    const csv = csvRows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `homes-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const selectedItems = items.filter((item) => selectedIds.includes(item.id));

  return (
    <div className="space-y-6 bg-[#F7F8FA] pb-10" dir="rtl">
      {toast ? (
        <div className="fixed left-6 top-6 z-[70] rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-3 text-sm font-bold text-emerald-700 shadow-lg">
          {toast}
        </div>
      ) : null}
      {error ? <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{error}</div> : null}

      <section className="overflow-hidden rounded-[28px] border border-gray-100 bg-white shadow-sm">
        <div className="bg-[#1a1f36] p-6 text-white lg:p-8">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold text-white/80">
                <Home className="size-4 text-[#FF385C]" />
                مركز إدارة الشاليهات والفلل
              </div>
              <h1 className="mt-4 text-3xl font-black">الوحدات: الشاليهات والفلل</h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-white/70">
                إدارة النشر، الأسعار، السعة، الصور، التصنيفات، ووسائل الراحة من لوحة تشغيل واحدة.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => router.refresh()} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold text-white">
                <RefreshCw className="size-4" />
                تحديث
              </button>
              <button onClick={() => exportCsv()} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold text-white">
                <FileSpreadsheet className="size-4" />
                تصدير CSV
              </button>
              <Link href="/dashboard/services/homes/new" className="inline-flex items-center gap-2 rounded-xl bg-[#FF385C] px-4 py-2 text-sm font-bold text-white">
                <Plus className="size-4" />
                إضافة وحدة
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 divide-x divide-x-reverse divide-gray-100 bg-white md:grid-cols-5">
          {[
            ["الكل", stats.total],
            ["منشور", stats.published],
            ["معلق", stats.pending],
            ["مسودات", stats.drafts],
            ["متوسط السعر", formatMoney(stats.avgPrice)],
          ].map(([label, value]) => (
            <div key={String(label)} className="p-4 text-center">
              <div className="text-2xl font-black text-[#1a1f36]">{typeof value === "number" ? value.toLocaleString("ar-SA") : value}</div>
              <div className="mt-1 text-xs font-bold text-gray-500">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Home} label="إجمالي الوحدات" value={stats.total.toLocaleString("ar-SA")} hint="داخل لوحة الإدارة" />
        <StatCard icon={CheckCircle2} label="منشورة الآن" value={stats.published.toLocaleString("ar-SA")} hint="ظاهرة في الواجهة" />
        <StatCard icon={ShieldCheck} label="تحتاج مراجعة" value={stats.pending.toLocaleString("ar-SA")} hint="طلبات معلقة أو غير مكتملة" />
        <StatCard icon={Sparkles} label="متوسط السعر" value={formatMoney(stats.avgPrice)} hint="متوسط سعر الليلة" />
      </section>

      <section className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm lg:p-5">
        <div className="grid gap-3 xl:grid-cols-[1fr_180px_180px_auto_auto]">
          <label className="relative">
            <Search className="absolute right-4 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ابحث بالعنوان أو رقم الوحدة..."
              className="w-full rounded-2xl border border-gray-200 bg-white py-3 pe-11 ps-4 text-sm outline-none transition focus:border-[#FF385C] focus:ring-2 focus:ring-[#FF385C]/20"
            />
          </label>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700">
            {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <select value={sort} onChange={(event) => setSort(event.target.value as SortMode)} className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700">
            <option value="newest">الأحدث</option>
            <option value="price_asc">الأقل سعراً</option>
            <option value="price_desc">الأعلى سعراً</option>
            <option value="guests_desc">الأكبر سعة</option>
          </select>
          <button onClick={toggleSelectAll} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1a1f36] px-5 py-3 text-sm font-bold text-white">
            <SlidersHorizontal className="size-4" />
            {allSelected ? "إلغاء التحديد" : "تحديد المعروض"}
          </button>
          <div className="flex rounded-2xl border border-gray-200 bg-white p-1">
            <button onClick={() => setView("grid")} className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold ${view === "grid" ? "bg-[#1a1f36] text-white" : "text-gray-600"}`}>
              <Grid2X2 className="size-4" />
              كروت
            </button>
            <button onClick={() => setView("list")} className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold ${view === "list" ? "bg-[#1a1f36] text-white" : "text-gray-600"}`}>
              <List className="size-4" />
              قائمة
            </button>
          </div>
        </div>

        {selectedIds.length ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#FF385C]/15 bg-[#FF385C]/5 px-4 py-3">
            <div className="text-sm font-black text-[#1a1f36]">تم تحديد {selectedIds.length.toLocaleString("ar-SA")} وحدة</div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => exportCsv(selectedItems)} className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700">تصدير المحدد</button>
              <button onClick={bulkDelete} disabled={isPending} className="rounded-xl bg-red-500 px-3 py-2 text-xs font-bold text-white disabled:opacity-60">حذف المحدد</button>
            </div>
          </div>
        ) : null}
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm lg:p-5">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-[#1a1f36]">قائمة الوحدات</h2>
              <p className="mt-1 text-sm text-gray-500">عرض {filteredItems.length.toLocaleString("ar-SA")} من أصل {items.length.toLocaleString("ar-SA")} وحدة</p>
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-200 p-12 text-center">
              <Home className="mx-auto size-16 text-gray-300" />
              <h3 className="mt-4 text-lg font-black text-gray-700">لا توجد وحدات مطابقة</h3>
              <p className="mt-2 text-sm text-gray-400">جرّب تغيير البحث أو حالة النشر.</p>
            </div>
          ) : view === "grid" ? (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredItems.map((item) => (
                <HomeCard
                  key={item.id}
                  item={item}
                  selected={selectedIds.includes(item.id)}
                  pending={pendingId === item.id}
                  onSelect={() => toggleSelected(item.id)}
                  onOpen={() => setActiveItem(item)}
                  onAction={submitAction}
                />
              ))}
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-gray-100">
              <div className="hidden grid-cols-[44px_1.4fr_120px_120px_120px_150px] gap-3 bg-gray-50 px-4 py-3 text-xs font-black text-gray-500 lg:grid">
                <span />
                <span>الوحدة</span>
                <span>الحالة</span>
                <span>السعة</span>
                <span>السعر</span>
                <span>الإجراءات</span>
              </div>
              <div className="divide-y divide-gray-100">
                {filteredItems.map((item) => (
                  <HomeRow
                    key={item.id}
                    item={item}
                    selected={selectedIds.includes(item.id)}
                    pending={pendingId === item.id}
                    onSelect={() => toggleSelected(item.id)}
                    onOpen={() => setActiveItem(item)}
                    onAction={submitAction}
                  />
                ))}
              </div>
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
            <h3 className="font-black text-[#1a1f36]">روابط تشغيلية</h3>
            <div className="mt-4 grid gap-2">
              <QuickLink href="/dashboard/services/homes/new" label="إضافة وحدة جديدة" icon={Plus} />
              <QuickLink href="/dashboard/services/homes/last-minute" label="عروض آخر لحظة" icon={Sparkles} />
              <QuickLink href="/dashboard/services/homes/amenities" label="وسائل الراحة" icon={Bath} />
              <QuickLink href="/dashboard/services/homes/types" label="تصنيفات الوحدات" icon={Tags} />
            </div>
          </section>

          <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
            <h3 className="font-black text-[#1a1f36]">توزيع الحالات</h3>
            <div className="mt-5 space-y-3">
              {statusOptions.filter((option) => option.value !== "all").map((option) => {
                const count = items.filter((item) => item.status === option.value).length;
                const percent = stats.total ? Math.round((count / stats.total) * 100) : 0;
                return (
                  <div key={option.value}>
                    <div className="mb-1 flex items-center justify-between text-xs font-bold text-gray-500">
                      <span>{option.label}</span>
                      <span>{count.toLocaleString("ar-SA")}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <div className="h-full rounded-full bg-[#FF385C]" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </aside>
      </div>

      {activeItem ? (
        <HomeDrawer
          item={activeItem}
          pending={pendingId === activeItem.id}
          onClose={() => setActiveItem(null)}
          onAction={submitAction}
        />
      ) : null}
    </div>
  );
}

function HomeCard({
  item,
  selected,
  pending,
  onSelect,
  onOpen,
  onAction,
}: {
  item: BridgeManagedServiceItem;
  selected: boolean;
  pending: boolean;
  onSelect: () => void;
  onOpen: () => void;
  onAction: (item: BridgeManagedServiceItem, action: "status" | "duplicate" | "delete", body?: unknown) => Promise<boolean>;
}) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <HomeImage item={item} className="aspect-[16/10] w-full" />
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between gap-3">
          {statusBadge(item.status, item.status_label)}
          <label className="inline-flex items-center gap-2 text-xs font-bold text-gray-500">
            <input type="checkbox" checked={selected} onChange={onSelect} className="size-4 rounded border-gray-300 text-[#FF385C] focus:ring-[#FF385C]" />
            تحديد
          </label>
        </div>
        <div>
          <h3 className="line-clamp-2 min-h-[3.25rem] text-xl font-black text-[#1a1f36]">{item.title}</h3>
          <p className="mt-1 text-sm text-gray-500">{item.type_label || "وحدة سكنية"} • #{item.id}</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-3 py-1"><Users className="size-3" />{item.guests} ضيف</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-3 py-1"><BedDouble className="size-3" />قابل للتعديل</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-3 py-1"><Bath className="size-3" />وسائل راحة</span>
        </div>
        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
          <div>
            <span className="block text-xs text-gray-400">السعر</span>
            <b className="text-lg text-[#1a1f36]">{formatMoney(item.price)}</b>
          </div>
          <div className="flex gap-2">
            <button onClick={onOpen} className="rounded-xl border border-gray-200 p-2 text-gray-600"><Eye className="size-4" /></button>
            <Link href={`/dashboard/services/homes/${item.id}/edit`} className="rounded-xl bg-[#1a1f36] px-4 py-2 text-xs font-bold text-white">تعديل</Link>
          </div>
        </div>
        <ActionBar item={item} pending={pending} onAction={onAction} />
      </div>
    </article>
  );
}

function HomeRow({
  item,
  selected,
  pending,
  onSelect,
  onOpen,
  onAction,
}: {
  item: BridgeManagedServiceItem;
  selected: boolean;
  pending: boolean;
  onSelect: () => void;
  onOpen: () => void;
  onAction: (item: BridgeManagedServiceItem, action: "status" | "duplicate" | "delete", body?: unknown) => Promise<boolean>;
}) {
  return (
    <article className="grid gap-4 p-4 transition hover:bg-gray-50 lg:grid-cols-[44px_1.4fr_120px_120px_120px_150px] lg:items-center">
      <input type="checkbox" checked={selected} onChange={onSelect} className="size-4 rounded border-gray-300 text-[#FF385C] focus:ring-[#FF385C]" />
      <div className="flex min-w-0 gap-3">
        <HomeImage item={item} className="size-16 shrink-0 rounded-2xl" />
        <div className="min-w-0">
          <button onClick={onOpen} className="line-clamp-1 text-right text-sm font-black text-[#1a1f36] hover:text-[#FF385C]">{item.title}</button>
          <div className="mt-1 text-xs text-gray-500">#{item.id} • {item.type_label || "وحدة"}</div>
        </div>
      </div>
      {statusBadge(item.status, item.status_label)}
      <span className="text-sm font-bold text-gray-600">{Number(item.guests || 0).toLocaleString("ar-SA")} ضيف</span>
      <span className="text-sm font-black text-[#1a1f36]">{formatMoney(item.price)}</span>
      <div className="flex gap-2">
        <button onClick={onOpen} className="rounded-xl border border-gray-200 p-2 text-gray-600"><Eye className="size-4" /></button>
        <Link href={`/dashboard/services/homes/${item.id}/edit`} className="rounded-xl bg-[#1a1f36] px-3 py-2 text-xs font-bold text-white">تعديل</Link>
        <button disabled={pending} onClick={() => onAction(item, "duplicate")} className="rounded-xl border border-gray-200 p-2 text-gray-600 disabled:opacity-50"><Copy className="size-4" /></button>
      </div>
    </article>
  );
}

function ActionBar({
  item,
  pending,
  onAction,
}: {
  item: BridgeManagedServiceItem;
  pending: boolean;
  onAction: (item: BridgeManagedServiceItem, action: "status" | "duplicate" | "delete", body?: unknown) => Promise<boolean>;
}) {
  const [nextStatus, setNextStatus] = useState("");

  return (
    <div className="grid gap-2 border-t border-gray-100 pt-4 sm:grid-cols-2">
      <Link href={publicHomePath(item)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold text-gray-700">
        <ExternalLink className="size-4" />
        عرض
      </Link>
      <button disabled={pending} onClick={() => onAction(item, "duplicate")} className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold text-gray-700 disabled:opacity-50">
        <Copy className="size-4" />
        تكرار
      </button>
      <select value={nextStatus} onChange={(event) => setNextStatus(event.target.value)} className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700">
        <option value="">تغيير الحالة</option>
        <option value="publish">منشور</option>
        <option value="pending">معلق</option>
        <option value="draft">مسودة</option>
        <option value="trash">سلة المهملات</option>
      </select>
      <button disabled={!nextStatus || pending} onClick={() => onAction(item, "status", { status: nextStatus })} className="rounded-xl bg-[#1a1f36] px-3 py-2 text-xs font-bold text-white disabled:opacity-50">
        تطبيق
      </button>
    </div>
  );
}

function QuickLink({ href, label, icon: Icon }: { href: string; label: string; icon: LucideIcon }) {
  return (
    <Link href={href} className="inline-flex items-center justify-between rounded-2xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700 transition hover:border-[#FF385C]/30">
      {label}
      <Icon className="size-4 text-[#FF385C]" />
    </Link>
  );
}

function HomeDrawer({
  item,
  pending,
  onClose,
  onAction,
}: {
  item: BridgeManagedServiceItem;
  pending: boolean;
  onClose: () => void;
  onAction: (item: BridgeManagedServiceItem, action: "status" | "duplicate" | "delete", body?: unknown) => Promise<boolean>;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-[#1a1f36]/40 backdrop-blur-sm" onClick={onClose}>
      <aside className="ms-auto h-full w-full max-w-[520px] overflow-y-auto bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-gray-100 bg-white/95 p-5 backdrop-blur">
          <div>
            <div className="text-xs font-bold text-gray-400">ملف الوحدة #{item.id}</div>
            <h2 className="mt-1 text-2xl font-black text-[#1a1f36]">{item.title}</h2>
          </div>
          <button onClick={onClose} className="rounded-2xl border border-gray-200 p-2"><X className="size-5" /></button>
        </div>
        <div className="p-5">
          <HomeImage item={item} className="aspect-video w-full rounded-3xl" />
          <div className="mt-5 grid grid-cols-2 gap-3">
            <InfoBox label="الحالة" value={item.status_label || item.status} />
            <InfoBox label="السعر" value={formatMoney(item.price)} />
            <InfoBox label="السعة" value={`${Number(item.guests || 0).toLocaleString("ar-SA")} ضيف`} />
            <InfoBox label="النوع" value={item.type_label || "وحدة"} />
          </div>
          <div className="sticky bottom-0 mt-6 flex flex-wrap gap-2 border-t border-gray-100 bg-white py-5">
            <Link href={`/dashboard/services/homes/${item.id}/edit`} className="inline-flex items-center gap-2 rounded-2xl bg-[#FF385C] px-4 py-3 text-sm font-bold text-white"><Edit3 className="size-4" />تعديل</Link>
            <Link href={publicHomePath(item)} className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700"><ExternalLink className="size-4" />عرض</Link>
            <button disabled={pending} onClick={() => onAction(item, "duplicate")} className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700 disabled:opacity-50"><Copy className="size-4" />تكرار</button>
            <button disabled={pending} onClick={() => window.confirm("هل تريد حذف هذه الوحدة؟") && onAction(item, "delete")} className="inline-flex items-center gap-2 rounded-2xl bg-red-500 px-4 py-3 text-sm font-bold text-white disabled:opacity-50"><Trash2 className="size-4" />حذف</button>
          </div>
        </div>
      </aside>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-gray-50 p-4">
      <span className="block text-xs font-bold text-gray-400">{label}</span>
      <b className="text-sm text-[#1a1f36]">{value}</b>
    </div>
  );
}
