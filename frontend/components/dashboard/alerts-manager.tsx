"use client";

import { secureFetch } from "@/lib/client-security";
import {
  AlertTriangle,
  Bell,
  CalendarDays,
  ChevronLeft,
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
  Trash2,
  X,
  Zap,
} from "lucide-react";
import { createElement, useMemo, useState, useTransition } from "react";
import type { BridgeNotification, BridgeNotificationsResponse } from "@/lib/api";

type AlertFilter = "all" | "booking" | "global" | "system";
type PriorityFilter = "all" | "high" | "medium" | "low";

function iconFor(type: string) {
  if (type === "calendar" || type === "booking") return CalendarDays;
  if (type === "shield" || type === "global") return ShieldCheck;
  if (type === "system") return AlertTriangle;
  return Bell;
}

function typeLabel(type: string) {
  const labels: Record<string, string> = {
    booking: "حجوزات",
    global: "نظام",
    system: "تشغيل",
    calendar: "حجوزات",
    shield: "أمان",
    bell: "عام",
  };
  return labels[type] ?? "عام";
}

function priorityFor(item: BridgeNotification): "high" | "medium" | "low" {
  const title = item.title.toLowerCase();
  if (title.includes("request") || title.includes("partner") || item.type === "booking") return "high";
  if (item.type === "global" || item.icon === "shield") return "medium";
  return "low";
}

function priorityLabel(priority: "high" | "medium" | "low") {
  return priority === "high" ? "عالي" : priority === "medium" ? "متوسط" : "منخفض";
}

function priorityClass(priority: "high" | "medium" | "low") {
  if (priority === "high") return "bg-red-50 text-red-600 border-red-100";
  if (priority === "medium") return "bg-amber-50 text-amber-700 border-amber-100";
  return "bg-slate-50 text-slate-500 border-slate-100";
}

function normalizeType(item: BridgeNotification) {
  if (item.type === "booking" || item.icon === "calendar") return "booking";
  if (item.type === "global" || item.icon === "shield") return "global";
  return "system";
}

function csvEscape(value: string | number) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

export function AlertsManager({ initialPayload }: { initialPayload: BridgeNotificationsResponse }) {
  const [items, setItems] = useState(initialPayload.results);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<AlertFilter>("all");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedItem, setSelectedItem] = useState<BridgeNotification | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const stats = useMemo(() => {
    const high = items.filter((item) => priorityFor(item) === "high").length;
    const system = items.filter((item) => normalizeType(item) === "system").length;
    const bookings = items.filter((item) => normalizeType(item) === "booking").length;
    return {
      total: items.length,
      unread: initialPayload.unread_count ?? 0,
      high,
      system,
      bookings,
    };
  }, [items, initialPayload.unread_count]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesQuery = !query || `${item.title} ${item.created_at} ${item.time_ago}`.toLowerCase().includes(query.toLowerCase());
      const matchesType = typeFilter === "all" || normalizeType(item) === typeFilter;
      const matchesPriority = priorityFilter === "all" || priorityFor(item) === priorityFilter;
      return matchesQuery && matchesType && matchesPriority;
    });
  }, [items, query, typeFilter, priorityFilter]);

  function toggleSelected(id: number) {
    setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function toggleSelectAll() {
    const visibleIds = filteredItems.map((item) => item.id);
    const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
    setSelectedIds(allSelected ? selectedIds.filter((id) => !visibleIds.includes(id)) : Array.from(new Set([...selectedIds, ...visibleIds])));
  }

  async function deleteItem(id: number) {
    setDeletingId(id);
    setMessage(null);
    setError(null);

    const response = await secureFetch(`/api/v1/dashboard/bridge/notifications/${id}/delete`, { method: "POST" });
    const result = (await response.json().catch(() => null)) as { status?: number; message?: string } | null;
    setDeletingId(null);

    if (!response.ok || result?.status !== 1) {
      setError(result?.message || "تعذر حذف الإشعار.");
      return false;
    }

    setItems((current) => current.filter((item) => item.id !== id));
    setSelectedIds((current) => current.filter((item) => item !== id));
    setSelectedItem((current) => (current?.id === id ? null : current));
    setMessage(result.message || "تم حذف الإشعار.");
    return true;
  }

  function bulkDelete() {
    startTransition(async () => {
      for (const id of selectedIds) {
        await deleteItem(id);
      }
      setMessage("تم حذف التنبيهات المحددة.");
    });
  }

  function exportCsv() {
    const rows = [
      ["id", "title", "type", "priority", "created_at", "time_ago"],
      ...filteredItems.map((item) => [item.id, item.title, typeLabel(item.type), priorityLabel(priorityFor(item)), item.created_at, item.time_ago]),
    ];
    const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "system-alerts.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div dir="rtl" className="space-y-6 font-[Cairo]">
      <section className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
        <div className="bg-[#1a1f36] p-6 text-white lg:p-8">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold">
                <Bell className="size-4 text-[#FF385C]" />
                مركز تنبيهات النظام
              </span>
              <h1 className="mt-5 text-3xl font-bold">تنبيهات النظام</h1>
              <p className="mt-3 max-w-2xl text-sm leading-8 text-white/70">
                إدارة التنبيهات التشغيلية والحجوزات والأمان مع فلاتر ذكية وإجراءات جماعية وتصدير سريع.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <HeroMetric label="غير مقروءة" value={String(stats.unread)} />
              <HeroMetric label="عالية الأهمية" value={String(stats.high)} />
              <HeroMetric label="إجمالي التنبيهات" value={String(stats.total)} />
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={Inbox} label="كل التنبيهات" value={stats.total} hint="داخل الحساب الحالي" />
          <StatCard icon={AlertTriangle} label="تحتاج متابعة" value={stats.high} hint="أولوية عالية" tone="rose" />
          <StatCard icon={CalendarDays} label="تنبيهات الحجوزات" value={stats.bookings} hint="مرتبطة بالحجوزات" tone="amber" />
          <StatCard icon={ShieldCheck} label="تنبيهات النظام" value={stats.system} hint="تشغيل وأمان" tone="dark" />
        </div>
      </section>

      <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="grid gap-3 xl:grid-cols-[1fr_180px_180px_auto_auto]">
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-[#FF385C] focus-within:bg-white">
            <Search className="size-4 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ابحث بعنوان التنبيه أو التاريخ"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
          </div>
          <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as AlertFilter)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none">
            <option value="all">كل الأنواع</option>
            <option value="booking">حجوزات</option>
            <option value="global">نظام</option>
            <option value="system">تشغيل</option>
          </select>
          <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value as PriorityFilter)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none">
            <option value="all">كل الأولويات</option>
            <option value="high">عالي</option>
            <option value="medium">متوسط</option>
            <option value="low">منخفض</option>
          </select>
          <button type="button" onClick={exportCsv} className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700">
            <Download className="size-4" />
            تصدير
          </button>
          <button type="button" onClick={() => window.location.reload()} className="flex items-center justify-center gap-2 rounded-2xl bg-[#1a1f36] px-4 py-3 text-sm font-bold text-white">
            <RefreshCw className="size-4" />
            تحديث
          </button>
        </div>

        {selectedIds.length ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#FF385C]/15 bg-[#FF385C]/5 px-4 py-3">
            <div className="text-sm font-bold text-[#1a1f36]">تم تحديد {selectedIds.length.toLocaleString("ar-SA")} تنبيه</div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setSelectedIds([])} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600">
                إلغاء التحديد
              </button>
              <button type="button" onClick={bulkDelete} disabled={isPending} className="rounded-xl bg-red-500 px-3 py-2 text-xs font-bold text-white disabled:opacity-60">
                حذف المحدد
              </button>
            </div>
          </div>
        ) : null}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-3xl border border-slate-100 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-5">
            <div>
              <h2 className="text-xl font-bold text-slate-950">قائمة التنبيهات</h2>
              <p className="mt-1 text-sm text-slate-500">يعرض {filteredItems.length.toLocaleString("ar-SA")} من {items.length.toLocaleString("ar-SA")} تنبيه</p>
            </div>
            <button type="button" onClick={toggleSelectAll} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700">
              تحديد المعروض
            </button>
          </div>

          {filteredItems.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {filteredItems.map((item) => (
                <AlertRow
                  key={item.id}
                  item={item}
                  checked={selectedIds.includes(item.id)}
                  deleting={deletingId === item.id}
                  onCheck={() => toggleSelected(item.id)}
                  onOpen={() => setSelectedItem(item)}
                  onDelete={() => void deleteItem(item.id)}
                />
              ))}
            </div>
          ) : (
            <div className="p-10 text-center">
              <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-slate-50 text-slate-400">
                <Inbox className="size-8" />
              </div>
              <h3 className="mt-4 font-bold text-slate-950">لا توجد تنبيهات مطابقة</h3>
              <p className="mt-2 text-sm text-slate-500">جرّب تعديل الفلاتر أو البحث بكلمة أخرى.</p>
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <PanelTitle icon={SlidersHorizontal} title="قواعد المتابعة" />
            <div className="mt-5 space-y-3">
              <RuleItem label="طلبات الشركاء الجديدة" enabled />
              <RuleItem label="الحجوزات المعلقة أكثر من ساعة" enabled />
              <RuleItem label="محاولات دخول غير معتادة" enabled />
              <RuleItem label="تنبيه عند فشل الدفع" />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <PanelTitle icon={Settings2} title="قنوات الإشعار" />
            <div className="mt-5 grid gap-3">
              <Channel icon={Bell} label="داخل اللوحة" active />
              <Channel icon={Mail} label="البريد الإلكتروني" active />
              <Channel icon={MessageSquare} label="رسائل SMS" />
              <Channel icon={Zap} label="Webhook" />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <PanelTitle icon={Filter} title="إجراءات مقترحة" />
            <div className="mt-5 space-y-3 text-sm">
              <Suggestion text="راجع طلبات الشركاء الجديدة من لوحة طلبات الشركاء." href="/dashboard/system/partner-requests" />
              <Suggestion text="افتح الحجوزات المعلقة للتأكيد أو الإلغاء." href="/dashboard/bookings" />
              <Suggestion text="اضبط رسائل الإشعارات المرسلة للعملاء." href="/dashboard/system/messages" />
            </div>
          </div>
        </aside>
      </section>

      {message ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{message}</div> : null}
      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{error}</div> : null}

      {selectedItem ? <AlertDrawer item={selectedItem} onClose={() => setSelectedItem(null)} onDelete={() => void deleteItem(selectedItem.id)} /> : null}
    </div>
  );
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4">
      <p className="text-xs text-white/60">{label}</p>
      <p className="mt-2 text-2xl font-bold text-white">{Number(value).toLocaleString("ar-SA")}</p>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, hint, tone = "primary" }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number; hint: string; tone?: "primary" | "rose" | "amber" | "dark" }) {
  const tones = {
    primary: "bg-[#FF385C]/10 text-[#FF385C]",
    rose: "bg-red-50 text-red-600",
    amber: "bg-amber-50 text-amber-700",
    dark: "bg-[#1a1f36]/10 text-[#1a1f36]",
  };
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className={`grid size-11 place-items-center rounded-2xl ${tones[tone]}`}>
          <Icon className="size-5" />
        </span>
        <span className="text-2xl font-bold text-slate-950">{value.toLocaleString("ar-SA")}</span>
      </div>
      <p className="mt-4 text-sm font-bold text-slate-700">{label}</p>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </div>
  );
}

function AlertRow({ item, checked, deleting, onCheck, onOpen, onDelete }: { item: BridgeNotification; checked: boolean; deleting: boolean; onCheck: () => void; onOpen: () => void; onDelete: () => void }) {
  const icon = iconFor(item.icon || item.type);
  const priority = priorityFor(item);

  return (
    <article className="grid gap-4 p-5 transition hover:bg-slate-50 lg:grid-cols-[auto_1fr_auto] lg:items-center">
      <div className="flex items-center gap-4">
        <input type="checkbox" checked={checked} onChange={onCheck} className="size-4 accent-[#FF385C]" />
        <button type="button" onClick={onOpen} className="grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-700">
          {createElement(icon, { className: "size-5" })}
        </button>
      </div>
      <button type="button" onClick={onOpen} className="min-w-0 text-right">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-bold text-slate-950">{item.title || "تنبيه جديد"}</h3>
          <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${priorityClass(priority)}`}>{priorityLabel(priority)}</span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">{typeLabel(item.type || item.icon)}</span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1"><Clock3 className="size-3.5" />{item.time_ago}</span>
          <span>{item.created_at}</span>
          <span className="font-mono">#{item.id}</span>
        </div>
      </button>
      <div className="flex items-center justify-end gap-2">
        <button type="button" onClick={onOpen} className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:text-slate-900">
          <Eye className="size-4" />
        </button>
        <button type="button" onClick={onDelete} disabled={deleting} className="rounded-xl border border-red-200 bg-red-50 p-2 text-red-500 hover:bg-red-100 disabled:opacity-60">
          <Trash2 className="size-4" />
        </button>
      </div>
    </article>
  );
}

function PanelTitle({ icon: Icon, title }: { icon: React.ComponentType<{ className?: string }>; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-10 place-items-center rounded-2xl bg-[#1a1f36] text-white">
        <Icon className="size-5" />
      </span>
      <h2 className="font-bold text-slate-950">{title}</h2>
    </div>
  );
}

function RuleItem({ label, enabled = false }: { label: string; enabled?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-100 p-4">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <span className={`h-6 w-11 rounded-full p-1 transition ${enabled ? "bg-emerald-500" : "bg-slate-200"}`}>
        <span className={`block size-4 rounded-full bg-white transition ${enabled ? "translate-x-[-20px]" : ""}`} />
      </span>
    </div>
  );
}

function Channel({ icon: Icon, label, active = false }: { icon: React.ComponentType<{ className?: string }>; label: string; active?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-100 p-4">
      <span className="flex items-center gap-2 text-sm font-bold text-slate-700">
        <Icon className="size-4 text-[#FF385C]" />
        {label}
      </span>
      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
        {active ? "نشط" : "معطل"}
      </span>
    </div>
  );
}

function Suggestion({ text, href }: { text: string; href: string }) {
  return (
    <a href={href} className="flex items-center justify-between rounded-2xl border border-slate-100 p-4 font-bold text-slate-700 transition hover:border-[#FF385C]/30 hover:text-[#FF385C]">
      <span>{text}</span>
      <ChevronLeft className="size-4" />
    </a>
  );
}

function AlertDrawer({ item, onClose, onDelete }: { item: BridgeNotification; onClose: () => void; onDelete: () => void }) {
  const icon = iconFor(item.icon || item.type);
  const priority = priorityFor(item);

  return (
    <div className="fixed inset-0 z-50 bg-black/35" onClick={onClose}>
      <aside className="mr-auto h-full w-full max-w-xl overflow-y-auto bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-[#1a1f36] text-white">
              {createElement(icon, { className: "size-5" })}
            </span>
            <div>
              <p className="text-xs font-bold text-slate-400">تفاصيل التنبيه</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-950">#{item.id}</h2>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 p-2 text-slate-500">
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-6 rounded-3xl border border-slate-100 bg-slate-50 p-5">
          <h3 className="text-xl font-bold text-slate-950">{item.title || "تنبيه جديد"}</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className={`rounded-full border px-3 py-1 text-xs font-bold ${priorityClass(priority)}`}>{priorityLabel(priority)}</span>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-500">{typeLabel(item.type || item.icon)}</span>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-500">{item.time_ago}</span>
          </div>
        </div>

        <div className="mt-6 grid gap-3">
          <Detail label="تاريخ الإنشاء" value={item.created_at || "-"} />
          <Detail label="نوع التنبيه" value={typeLabel(item.type || item.icon)} />
          <Detail label="الأولوية" value={priorityLabel(priority)} />
          <Detail label="معرّف التنبيه" value={String(item.id)} mono />
        </div>

        <div className="mt-6 rounded-3xl border border-slate-100 p-5">
          <h3 className="font-bold text-slate-950">سجل التنفيذ</h3>
          <div className="mt-4 space-y-3">
            <TimelineItem text="تم إنشاء التنبيه داخل النظام" time={item.created_at || "-"} />
            <TimelineItem text="تم سحب التنبيه إلى لوحة التحكم" time={item.time_ago || "-"} />
            <TimelineItem text="جاهز للمراجعة أو الحذف" time="الآن" />
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={() => navigator.clipboard?.writeText(String(item.id))} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700">
            <Copy className="size-4" />
            نسخ المعرف
          </button>
          <button type="button" onClick={onDelete} className="flex items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-sm font-bold text-white">
            <Trash2 className="size-4" />
            حذف التنبيه
          </button>
        </div>
      </aside>
    </div>
  );
}

function Detail({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4">
      <p className="text-xs font-bold text-slate-400">{label}</p>
      <p className={`mt-2 text-sm font-bold text-slate-950 ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}

function TimelineItem({ text, time }: { text: string; time: string }) {
  return (
    <div className="flex gap-3">
      <span className="mt-1 size-2 rounded-full bg-[#FF385C]" />
      <div>
        <p className="text-sm font-bold text-slate-800">{text}</p>
        <p className="mt-1 text-xs text-slate-400">{time}</p>
      </div>
    </div>
  );
}
