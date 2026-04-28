"use client";

import Link from "next/link";
import { createElement, useMemo, useState, useTransition, type ReactNode } from "react";
import {
  AlertTriangle,
  Bell,
  CalendarDays,
  CheckCheck,
  Clock3,
  Copy,
  Download,
  Eye,
  Filter,
  Inbox,
  Mail,
  MessageSquare,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { BridgeNotification, BridgeNotificationsResponse } from "@/lib/api";
import { secureFetch } from "@/lib/client-security";

type NotificationFilter = "all" | "booking" | "security" | "system" | "partner";
type PriorityFilter = "all" | "high" | "medium" | "low";
type ReadFilter = "all" | "unread" | "read";

function titleOf(item: BridgeNotification) {
  return item.title || "تنبيه جديد";
}

function iconFor(value: string) {
  if (value === "calendar" || value === "booking") return CalendarDays;
  if (value === "shield" || value === "security") return ShieldCheck;
  if (value === "partner") return Sparkles;
  if (value === "system") return AlertTriangle;
  return Bell;
}

function normalizedType(item: BridgeNotification): Exclude<NotificationFilter, "all"> {
  const value = `${item.type} ${item.icon} ${item.title}`.toLowerCase();
  if (value.includes("partner") || value.includes("request")) return "partner";
  if (value.includes("booking") || value.includes("calendar")) return "booking";
  if (value.includes("shield") || value.includes("security") || value.includes("login")) return "security";
  return "system";
}

function typeLabel(type: string) {
  const labels: Record<string, string> = {
    booking: "حجوزات",
    security: "أمان",
    system: "نظام",
    partner: "شركاء",
    global: "عام",
    calendar: "حجوزات",
    shield: "أمان",
    bell: "عام",
  };
  return labels[type] ?? "عام";
}

function priorityFor(item: BridgeNotification): "high" | "medium" | "low" {
  const value = `${item.type} ${item.icon} ${item.title}`.toLowerCase();
  if (value.includes("partner") || value.includes("request") || value.includes("failed") || value.includes("error")) return "high";
  if (value.includes("booking") || value.includes("calendar") || value.includes("shield")) return "medium";
  return "low";
}

function priorityLabel(priority: "high" | "medium" | "low") {
  if (priority === "high") return "عالية";
  if (priority === "medium") return "متوسطة";
  return "منخفضة";
}

function priorityClass(priority: "high" | "medium" | "low") {
  if (priority === "high") return "border-red-100 bg-red-50 text-red-600";
  if (priority === "medium") return "border-amber-100 bg-amber-50 text-amber-700";
  return "border-gray-100 bg-gray-50 text-gray-500";
}

function csvEscape(value: string | number) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "primary",
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  hint: string;
  tone?: "primary" | "red" | "amber" | "dark";
}) {
  const toneClass = {
    primary: "bg-[#FF385C]/10 text-[#FF385C]",
    red: "bg-red-50 text-red-600",
    amber: "bg-amber-50 text-amber-700",
    dark: "bg-[#1a1f36]/10 text-[#1a1f36]",
  }[tone];

  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className={`flex size-11 items-center justify-center rounded-2xl ${toneClass}`}>
          <Icon className="size-5" />
        </div>
        <span className="rounded-full bg-gray-50 px-2.5 py-1 text-xs font-bold text-gray-400">Live</span>
      </div>
      <div className="mt-5 text-2xl font-black text-[#1a1f36]">{value.toLocaleString("ar-SA")}</div>
      <div className="mt-1 text-sm font-bold text-gray-600">{label}</div>
      <div className="mt-3 text-xs text-emerald-600">{hint}</div>
    </article>
  );
}

export function NotificationsSuite({ initialPayload }: { initialPayload: BridgeNotificationsResponse }) {
  const [items, setItems] = useState(initialPayload.results ?? []);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<NotificationFilter>("all");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
  const [readFilter, setReadFilter] = useState<ReadFilter>("all");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [readIds, setReadIds] = useState<number[]>([]);
  const [activeItem, setActiveItem] = useState<BridgeNotification | null>(null);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const unreadIds = useMemo(() => {
    const count = Math.min(initialPayload.unread_count ?? 0, items.length);
    return items
      .slice(0, count)
      .map((item) => item.id)
      .filter((id) => !readIds.includes(id));
  }, [initialPayload.unread_count, items, readIds]);

  const stats = useMemo(() => {
    return {
      total: items.length,
      unread: unreadIds.length,
      high: items.filter((item) => priorityFor(item) === "high").length,
      bookings: items.filter((item) => normalizedType(item) === "booking").length,
      security: items.filter((item) => normalizedType(item) === "security").length,
      system: items.filter((item) => normalizedType(item) === "system").length,
    };
  }, [items, unreadIds.length]);

  const filteredItems = useMemo(() => {
    const search = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesSearch = !search || `${item.title} ${item.created_at} ${item.time_ago}`.toLowerCase().includes(search);
      const matchesType = typeFilter === "all" || normalizedType(item) === typeFilter;
      const matchesPriority = priorityFilter === "all" || priorityFor(item) === priorityFilter;
      const isUnread = unreadIds.includes(item.id);
      const matchesRead = readFilter === "all" || (readFilter === "unread" ? isUnread : !isUnread);
      return matchesSearch && matchesType && matchesPriority && matchesRead;
    });
  }, [items, priorityFilter, query, readFilter, typeFilter, unreadIds]);

  const allSelected = filteredItems.length > 0 && filteredItems.every((item) => selectedIds.includes(item.id));

  const heroStats: Array<[string, number, LucideIcon]> = [
    ["غير مقروءة", stats.unread, Bell],
    ["عالية الأهمية", stats.high, AlertTriangle],
    ["حجوزات", stats.bookings, CalendarDays],
    ["إجمالي التنبيهات", stats.total, Inbox],
  ];

  function openItem(item: BridgeNotification) {
    setReadIds((current) => (current.includes(item.id) ? current : [...current, item.id]));
    setActiveItem(item);
  }

  function toggleSelected(id: number) {
    setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function toggleSelectAll() {
    setSelectedIds(allSelected ? [] : filteredItems.map((item) => item.id));
  }

  function markSelectedRead() {
    setReadIds((current) => Array.from(new Set([...current, ...selectedIds])));
    setSelectedIds([]);
    setToast("تم تعليم التنبيهات كمقروءة.");
  }

  async function deleteItem(id: number) {
    setDeletingId(id);
    setError("");
    const response = await secureFetch(`/api/v1/dashboard/bridge/notifications/${id}/delete`, { method: "POST" });
    const result = (await response.json().catch(() => null)) as { status?: number; message?: string } | null;
    setDeletingId(null);

    if (!response.ok || result?.status !== 1) {
      setError(result?.message || "تعذر حذف التنبيه.");
      return false;
    }

    setItems((current) => current.filter((item) => item.id !== id));
    setSelectedIds((current) => current.filter((item) => item !== id));
    setReadIds((current) => current.filter((item) => item !== id));
    setActiveItem((current) => (current?.id === id ? null : current));
    setToast(result.message || "تم حذف التنبيه.");
    return true;
  }

  function bulkDelete() {
    if (selectedIds.length === 0) return;
    const confirmed = window.confirm(`سيتم حذف ${selectedIds.length.toLocaleString("ar-SA")} تنبيه. هل تريد المتابعة؟`);
    if (!confirmed) return;

    startTransition(async () => {
      for (const id of selectedIds) {
        await deleteItem(id);
      }
      setToast("تم حذف التنبيهات المحددة.");
    });
  }

  function exportCsv(rows = filteredItems) {
    const csvRows = [
      ["id", "title", "type", "priority", "created_at", "time_ago"],
      ...rows.map((item) => [
        item.id,
        titleOf(item),
        typeLabel(normalizedType(item)),
        priorityLabel(priorityFor(item)),
        item.created_at,
        item.time_ago,
      ]),
    ];
    const csv = csvRows.map((row) => row.map(csvEscape).join(",")).join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `notifications-${Date.now()}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6 bg-[#F7F8FA] pb-10" dir="rtl">
      {toast ? (
        <div className="fixed left-6 top-6 z-[70] rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-3 text-sm font-bold text-emerald-700 shadow-lg">
          {toast}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-[28px] border border-gray-100 bg-white shadow-sm">
        <div className="bg-[#1a1f36] p-6 text-white lg:p-8">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold text-white/80">
                <Bell className="size-4 text-[#FF385C]" />
                مركز التنبيهات الموحد
              </div>
              <h1 className="mt-4 text-3xl font-black">التنبيهات</h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-white/70">
                تابع إشعارات الحجوزات، الشركاء، الأمان، والنظام من لوحة واحدة مع فلاتر ذكية وإجراءات جماعية.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
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
                <Download className="size-4" />
                تصدير CSV
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 divide-x divide-x-reverse divide-gray-100 bg-white md:grid-cols-4">
          {heroStats.map(([label, value, Icon]) => (
            <div key={label} className="p-4 text-center">
              <Icon className="mx-auto mb-2 size-5 text-[#FF385C]" />
              <div className="text-2xl font-black text-[#1a1f36]">{value.toLocaleString("ar-SA")}</div>
              <div className="mt-1 text-xs font-bold text-gray-500">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Inbox} label="كل التنبيهات" value={stats.total} hint="داخل الحساب الحالي" />
        <StatCard icon={AlertTriangle} label="تحتاج متابعة" value={stats.high} hint="أولوية عالية" tone="red" />
        <StatCard icon={CalendarDays} label="تنبيهات الحجوزات" value={stats.bookings} hint="مرتبطة بالطلبات والحجوزات" tone="amber" />
        <StatCard icon={ShieldCheck} label="الأمان والنظام" value={stats.security + stats.system} hint="تشغيل ومراقبة" tone="dark" />
      </section>

      <section className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm lg:p-5">
        <div className="grid gap-3 xl:grid-cols-[1fr_170px_170px_170px_auto]">
          <label className="relative">
            <Search className="absolute right-4 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ابحث بعنوان التنبيه أو التاريخ..."
              className="w-full rounded-2xl border border-gray-200 bg-white py-3 pe-11 ps-4 text-sm text-gray-900 outline-none transition focus:border-[#FF385C] focus:ring-2 focus:ring-[#FF385C]/20"
            />
          </label>
          <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as NotificationFilter)} className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 outline-none">
            <option value="all">كل الأنواع</option>
            <option value="booking">حجوزات</option>
            <option value="partner">شركاء</option>
            <option value="security">أمان</option>
            <option value="system">نظام</option>
          </select>
          <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value as PriorityFilter)} className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 outline-none">
            <option value="all">كل الأولويات</option>
            <option value="high">عالية</option>
            <option value="medium">متوسطة</option>
            <option value="low">منخفضة</option>
          </select>
          <select value={readFilter} onChange={(event) => setReadFilter(event.target.value as ReadFilter)} className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 outline-none">
            <option value="all">الكل</option>
            <option value="unread">غير مقروء</option>
            <option value="read">مقروء</option>
          </select>
          <button
            type="button"
            onClick={toggleSelectAll}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1a1f36] px-5 py-3 text-sm font-bold text-white"
          >
            <CheckCheck className="size-4" />
            {allSelected ? "إلغاء التحديد" : "تحديد المعروض"}
          </button>
        </div>

        {selectedIds.length ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#FF385C]/15 bg-[#FF385C]/5 px-4 py-3">
            <div className="text-sm font-black text-[#1a1f36]">تم تحديد {selectedIds.length.toLocaleString("ar-SA")} تنبيه</div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={markSelectedRead} className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700">
                تعليم كمقروء
              </button>
              <button type="button" onClick={() => exportCsv(items.filter((item) => selectedIds.includes(item.id)))} className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700">
                تصدير المحدد
              </button>
              <button type="button" onClick={bulkDelete} disabled={isPending} className="rounded-xl bg-red-500 px-3 py-2 text-xs font-bold text-white disabled:opacity-60">
                {isPending ? "جارٍ الحذف..." : "حذف المحدد"}
              </button>
            </div>
          </div>
        ) : null}
      </section>

      {error ? <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{error}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="rounded-3xl border border-gray-100 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 p-5">
            <div>
              <h2 className="text-xl font-black text-[#1a1f36]">قائمة التنبيهات</h2>
              <p className="mt-1 text-sm text-gray-500">
                يعرض {filteredItems.length.toLocaleString("ar-SA")} من {items.length.toLocaleString("ar-SA")} تنبيه
              </p>
            </div>
          </div>

          {filteredItems.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {filteredItems.map((item) => (
                <NotificationRow
                  key={item.id}
                  item={item}
                  unread={unreadIds.includes(item.id)}
                  checked={selectedIds.includes(item.id)}
                  deleting={deletingId === item.id}
                  onCheck={() => toggleSelected(item.id)}
                  onOpen={() => openItem(item)}
                  onDelete={() => void deleteItem(item.id)}
                />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-gray-50 text-gray-400">
                <Inbox className="size-8" />
              </div>
              <h3 className="mt-4 font-black text-[#1a1f36]">لا توجد تنبيهات مطابقة</h3>
              <p className="mt-2 text-sm text-gray-500">جرب تعديل الفلاتر أو البحث بكلمة أخرى.</p>
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <PanelCard icon={SlidersHorizontal} title="قواعد المتابعة">
            <RuleItem label="طلبات الشركاء الجديدة" enabled />
            <RuleItem label="الحجوزات المعلقة أكثر من ساعة" enabled />
            <RuleItem label="محاولات دخول غير معتادة" enabled />
            <RuleItem label="تنبيه عند فشل الدفع" />
          </PanelCard>

          <PanelCard icon={Settings2} title="قنوات الإشعار">
            <Channel icon={Bell} label="داخل اللوحة" active />
            <Channel icon={Mail} label="البريد الإلكتروني" active />
            <Channel icon={MessageSquare} label="رسائل SMS" />
            <Channel icon={Zap} label="Webhook" />
          </PanelCard>

          <PanelCard icon={Filter} title="إجراءات مقترحة">
            <Suggestion text="راجع طلبات الشركاء الجديدة من لوحة طلبات الشركاء." href="/dashboard/system/partner-requests" />
            <Suggestion text="افتح الحجوزات المعلقة للتأكيد أو الإلغاء." href="/dashboard/bookings" />
            <Suggestion text="اضبط رسائل الإشعارات المرسلة للعملاء." href="/dashboard/system/messages" />
          </PanelCard>
        </aside>
      </div>

      {activeItem ? (
        <NotificationDrawer
          item={activeItem}
          unread={unreadIds.includes(activeItem.id)}
          onClose={() => setActiveItem(null)}
          onDelete={() => void deleteItem(activeItem.id)}
          onCopy={() => {
            navigator.clipboard.writeText(`${activeItem.id} - ${titleOf(activeItem)}`);
            setToast("تم نسخ تفاصيل التنبيه.");
          }}
        />
      ) : null}
    </div>
  );
}

function NotificationRow({
  item,
  unread,
  checked,
  deleting,
  onCheck,
  onOpen,
  onDelete,
}: {
  item: BridgeNotification;
  unread: boolean;
  checked: boolean;
  deleting: boolean;
  onCheck: () => void;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const icon = iconFor(item.icon || item.type);
  const priority = priorityFor(item);
  const type = normalizedType(item);

  return (
    <article className={`grid gap-4 p-5 transition hover:bg-gray-50 lg:grid-cols-[auto_1fr_auto] lg:items-center ${unread ? "bg-[#FF385C]/[0.03]" : ""}`}>
      <div className="flex items-center gap-4">
        <input type="checkbox" checked={checked} onChange={onCheck} className="size-4 rounded border-gray-300 text-[#FF385C] focus:ring-[#FF385C]" />
        <button type="button" onClick={onOpen} className={`grid size-12 place-items-center rounded-2xl ${unread ? "bg-[#FF385C]/10 text-[#FF385C]" : "bg-gray-100 text-gray-600"}`}>
          {createElement(icon, { className: "size-5" })}
        </button>
      </div>
      <button type="button" onClick={onOpen} className="min-w-0 text-right">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-black text-[#1a1f36]">{titleOf(item)}</h3>
          {unread ? <span className="rounded-full bg-[#FF385C] px-2.5 py-1 text-xs font-bold text-white">جديد</span> : null}
          <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${priorityClass(priority)}`}>{priorityLabel(priority)}</span>
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-500">{typeLabel(type)}</span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1">
            <Clock3 className="size-3.5" />
            {item.time_ago}
          </span>
          <span>{item.created_at}</span>
          <span className="font-mono">#{item.id}</span>
        </div>
      </button>
      <div className="flex items-center justify-end gap-2">
        <button type="button" onClick={onOpen} className="rounded-xl border border-gray-200 p-2 text-gray-500 hover:text-gray-900">
          <Eye className="size-4" />
        </button>
        <button type="button" onClick={onDelete} disabled={deleting} className="rounded-xl border border-red-100 bg-red-50 p-2 text-red-600 disabled:opacity-50">
          <Trash2 className="size-4" />
        </button>
      </div>
    </article>
  );
}

function PanelCard({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="grid size-10 place-items-center rounded-2xl bg-[#FF385C]/10 text-[#FF385C]">
          <Icon className="size-5" />
        </div>
        <h3 className="font-black text-[#1a1f36]">{title}</h3>
      </div>
      <div className="mt-5 space-y-3">{children}</div>
    </section>
  );
}

function RuleItem({ label, enabled = false }: { label: string; enabled?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-gray-50 p-3">
      <span className="text-sm font-bold text-gray-700">{label}</span>
      <span className={`relative h-6 w-11 rounded-full p-1 transition ${enabled ? "bg-[#1a1f36]" : "bg-gray-200"}`}>
        <span className={`block size-4 rounded-full bg-white transition ${enabled ? "-translate-x-5" : "translate-x-0"}`} />
      </span>
    </div>
  );
}

function Channel({ icon: Icon, label, active = false }: { icon: LucideIcon; label: string; active?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-gray-100 p-3">
      <span className="inline-flex items-center gap-2 text-sm font-bold text-gray-700">
        <Icon className="size-4 text-[#FF385C]" />
        {label}
      </span>
      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
        {active ? "مفعل" : "متوقف"}
      </span>
    </div>
  );
}

function Suggestion({ text, href }: { text: string; href: string }) {
  return (
    <Link href={href} className="block rounded-2xl border border-gray-100 p-3 text-sm leading-6 text-gray-600 transition hover:border-[#FF385C]/30 hover:text-[#1a1f36]">
      {text}
    </Link>
  );
}

function NotificationDrawer({
  item,
  unread,
  onClose,
  onDelete,
  onCopy,
}: {
  item: BridgeNotification;
  unread: boolean;
  onClose: () => void;
  onDelete: () => void;
  onCopy: () => void;
}) {
  const icon = iconFor(item.icon || item.type);
  const priority = priorityFor(item);
  const type = normalizedType(item);
  const timeline: Array<[string, string, LucideIcon]> = [
    ["استلام التنبيه", item.created_at || item.time_ago, Bell],
    ["تصنيف الأولوية", priorityLabel(priority), AlertTriangle],
    ["جاهز للمتابعة", typeLabel(type), CheckCheck],
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#1a1f36]/40 backdrop-blur-sm" onClick={onClose}>
      <aside className="ms-auto h-full w-full max-w-[500px] overflow-y-auto bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-gray-100 bg-white/95 p-5 backdrop-blur">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
              <span className="font-mono">#{item.id}</span>
              {unread ? <span className="rounded-full bg-[#FF385C] px-2 py-0.5 text-white">جديد</span> : null}
            </div>
            <h2 className="mt-2 text-2xl font-black text-[#1a1f36]">تفاصيل التنبيه</h2>
          </div>
          <button onClick={onClose} className="rounded-2xl border border-gray-200 p-2">
            <X className="size-5" />
          </button>
        </div>

        <div className="p-5">
          <div className="rounded-3xl border border-gray-100 bg-gray-50 p-5">
            <div className="flex items-start gap-4">
              <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[#FF385C]/10 text-[#FF385C]">
                {createElement(icon, { className: "size-7" })}
              </div>
              <div>
                <h3 className="text-xl font-black text-[#1a1f36]">{titleOf(item)}</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className={`rounded-full border px-3 py-1 text-xs font-bold ${priorityClass(priority)}`}>{priorityLabel(priority)}</span>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-gray-600">{typeLabel(type)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <InfoBox label="وقت الإنشاء" value={item.created_at || "-"} />
            <InfoBox label="منذ" value={item.time_ago || "-"} />
            <InfoBox label="النوع" value={typeLabel(type)} />
            <InfoBox label="الأولوية" value={priorityLabel(priority)} />
          </div>

          <section className="mt-5 rounded-3xl border border-gray-100 p-5">
            <h4 className="font-black text-[#1a1f36]">مسار المعالجة</h4>
            <div className="mt-4 space-y-4">
              {timeline.map(([label, value, TimelineIcon], index) => (
                <div key={label} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="grid size-8 place-items-center rounded-full bg-[#1a1f36] text-white">
                      <TimelineIcon className="size-4" />
                    </div>
                    {index < timeline.length - 1 ? <div className="h-8 w-px bg-gray-200" /> : null}
                  </div>
                  <div>
                    <div className="text-sm font-black text-gray-900">{label}</div>
                    <div className="text-xs text-gray-500">{value || "-"}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="sticky bottom-0 mt-6 flex flex-wrap gap-2 border-t border-gray-100 bg-white py-5">
            <button onClick={onCopy} className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700">
              <Copy className="size-4" />
              نسخ
            </button>
            <button onClick={onDelete} className="inline-flex items-center gap-2 rounded-2xl bg-red-500 px-4 py-3 text-sm font-bold text-white">
              <Trash2 className="size-4" />
              حذف
            </button>
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
