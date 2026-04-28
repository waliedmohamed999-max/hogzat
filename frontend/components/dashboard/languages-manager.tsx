"use client";

import { secureFetch } from "@/lib/client-security";
import type { BridgeLanguageItem, BridgeLanguagesResponse } from "@/lib/api";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Globe2,
  Languages,
  Plus,
  Save,
  Search,
  ToggleLeft,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";

function emptyLanguage(): BridgeLanguageItem {
  return {
    id: 0,
    code: "",
    name: "",
    flag_name: "",
    flag_code: "",
    status: "off",
    rtl: "no",
    priority: 0,
  };
}

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold text-gray-400">{label}</p>
      <p className="mt-3 text-2xl font-black text-[#1a1f36]">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{hint}</p>
    </div>
  );
}

function LanguageStatus({ status }: { status: string }) {
  const active = status === "on";
  return (
    <span
      className={classNames(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold",
        active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600",
      )}
    >
      <span className={classNames("h-2 w-2 rounded-full", active ? "bg-emerald-500" : "bg-gray-400")} />
      {active ? "مفعلة" : "متوقفة"}
    </span>
  );
}

export function LanguagesManager({ payload }: { payload: BridgeLanguagesResponse }) {
  const [items, setItems] = useState(payload.results);
  const [draft, setDraft] = useState<BridgeLanguageItem>(emptyLanguage());
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesSearch =
        !normalized ||
        item.code.toLowerCase().includes(normalized) ||
        item.name.toLowerCase().includes(normalized) ||
        item.flag_name.toLowerCase().includes(normalized);
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [items, query, statusFilter]);

  const activeCount = items.filter((item) => item.status === "on").length;
  const rtlCount = items.filter((item) => item.rtl === "yes").length;
  const catalogCount = Object.keys(payload.catalog ?? {}).length;

  async function submit(path: string, body?: unknown, action = path) {
    setMessage(null);
    setError(null);
    setBusyAction(action);

    try {
      const response = await secureFetch(`/api/v1/dashboard/bridge/${path}`, {
        method: "POST",
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const result = (await response.json()) as {
        status?: number;
        message?: string;
        data?: { id?: number };
      };

      if (!response.ok || result.status !== 1) {
        setError(result.message || "تعذر تنفيذ الإجراء.");
        return null;
      }

      setMessage(result.message || "تم الحفظ.");
      return result;
    } finally {
      setBusyAction(null);
    }
  }

  async function saveDraft() {
    const result = await submit("dashboard/system-native/languages", draft, "save-language");
    if (!result) return;

    const savedId = result.data?.id ?? draft.id;
    const saved = { ...draft, id: savedId };

    setItems((current) => {
      const exists = current.some((item) => item.id === savedId);
      return exists ? current.map((item) => (item.id === savedId ? saved : item)) : [...current, saved];
    });
    setDraft(saved);
  }

  async function toggleStatus(item: BridgeLanguageItem) {
    const nextStatus = item.status === "on" ? "off" : "on";
    const result = await submit(
      `dashboard/system-native/languages/${item.id}/status`,
      { status: nextStatus },
      `status-${item.id}`,
    );
    if (!result) return;

    setItems((current) => current.map((row) => (row.id === item.id ? { ...row, status: nextStatus } : row)));
  }

  async function deleteLanguage(item: BridgeLanguageItem) {
    if (!window.confirm(`هل تريد حذف لغة ${item.name || item.code}؟`)) return;

    const result = await submit(`dashboard/system-native/languages/${item.id}/delete`, undefined, `delete-${item.id}`);
    if (!result) return;

    setItems((current) => current.filter((row) => row.id !== item.id));
    if (draft.id === item.id) setDraft(emptyLanguage());
  }

  async function saveOrder() {
    const data = Object.fromEntries(items.map((item) => [item.code, item.priority]));
    await submit("dashboard/system-native/languages/order", { data }, "save-order");
  }

  function updatePriority(item: BridgeLanguageItem, direction: "up" | "down") {
    const delta = direction === "up" ? -1 : 1;
    setItems((current) =>
      current
        .map((row) => (row.id === item.id ? { ...row, priority: Math.max(0, Number(row.priority || 0) + delta) } : row))
        .sort((a, b) => Number(a.priority || 0) - Number(b.priority || 0)),
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <section className="overflow-hidden rounded-3xl border border-gray-100 bg-[#1a1f36] text-white shadow-sm">
        <div className="grid gap-6 p-6 lg:grid-cols-[1fr_auto] lg:p-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/80">
              <Languages className="h-4 w-4 text-[#FF385C]" />
              مركز اللغات
            </div>
            <h1 className="mt-5 text-3xl font-black">إدارة اللغات والترجمة</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">
              تحكم في اللغات المفعلة، اتجاه العرض، الأولوية، وربطها مباشرة بملفات الترجمة داخل المنصة.
            </p>
          </div>
          <div className="grid min-w-[260px] grid-cols-2 gap-3 rounded-2xl bg-white/10 p-4">
            <div className="rounded-xl bg-white/10 p-4">
              <p className="text-xs text-white/60">اللغة الافتراضية</p>
              <p className="mt-2 text-xl font-black">{items[0]?.code || "ar"}</p>
            </div>
            <div className="rounded-xl bg-white/10 p-4">
              <p className="text-xs text-white/60">الكتالوج</p>
              <p className="mt-2 text-xl font-black">{catalogCount}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="كل اللغات" value={items.length} hint="لغة داخل لوحة التحكم" />
        <StatCard label="مفعلة" value={activeCount} hint="تظهر في الواجهة" />
        <StatCard label="متوقفة" value={Math.max(items.length - activeCount, 0)} hint="مخفية مؤقتا" />
        <StatCard label="RTL" value={rtlCount} hint="لغات باتجاه عربي" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-5">
          <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="grid gap-3 lg:grid-cols-[1fr_220px_auto]">
              <label className="relative">
                <Search className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="ابحث بالكود أو اسم اللغة أو العلم"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pr-11 pl-4 text-sm outline-none transition focus:border-[#1a1f36] focus:bg-white"
                />
              </label>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[#1a1f36] focus:bg-white"
              >
                <option value="all">كل الحالات</option>
                <option value="on">مفعلة</option>
                <option value="off">متوقفة</option>
              </select>
              <button
                type="button"
                onClick={() => setDraft(emptyLanguage())}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#FF385C] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#e63252]"
              >
                <Plus className="h-4 w-4" />
                إضافة لغة
              </button>
            </div>
          </div>

          <div className="grid gap-4">
            {filtered.map((item) => (
              <article
                key={item.id}
                className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-gray-200 hover:shadow-md"
              >
                <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#FF385C]/10 text-lg font-black text-[#FF385C]">
                      {item.code.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-xl font-black text-[#1a1f36]">{item.name || "لغة بدون اسم"}</h2>
                        <LanguageStatus status={item.status} />
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">
                          {item.rtl === "yes" ? "RTL" : "LTR"}
                        </span>
                      </div>
                      <div className="mt-4 grid gap-3 text-sm text-gray-500 sm:grid-cols-4">
                        <span className="rounded-2xl bg-gray-50 p-3">الكود: {item.code || "-"}</span>
                        <span className="rounded-2xl bg-gray-50 p-3">العلم: {item.flag_name || "-"}</span>
                        <span className="rounded-2xl bg-gray-50 p-3">كود العلم: {item.flag_code || "-"}</span>
                        <span className="rounded-2xl bg-gray-50 p-3">الأولوية: {item.priority}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updatePriority(item, "up")}
                      className="rounded-xl border border-gray-200 p-3 text-gray-600 transition hover:border-[#1a1f36] hover:text-[#1a1f36]"
                      aria-label="رفع الأولوية"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => updatePriority(item, "down")}
                      className="rounded-xl border border-gray-200 p-3 text-gray-600 transition hover:border-[#1a1f36] hover:text-[#1a1f36]"
                      aria-label="خفض الأولوية"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDraft(item)}
                      className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700 transition hover:border-[#1a1f36] hover:text-[#1a1f36]"
                    >
                      تعديل
                    </button>
                    <button
                      type="button"
                      disabled={busyAction === `status-${item.id}`}
                      onClick={() => void toggleStatus(item)}
                      className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700 transition hover:border-[#1a1f36] disabled:opacity-60"
                    >
                      <ToggleLeft className="h-4 w-4" />
                      تبديل
                    </button>
                    <button
                      type="button"
                      disabled={busyAction === `delete-${item.id}`}
                      onClick={() => void deleteLanguage(item)}
                      className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600 transition hover:bg-rose-100 disabled:opacity-60"
                    >
                      <Trash2 className="h-4 w-4" />
                      حذف
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
            <button
              type="button"
              disabled={busyAction === "save-order"}
              onClick={() => void saveOrder()}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#1a1f36] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#2d3458] disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              حفظ ترتيب اللغات
            </button>
            {message ? (
              <p className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                {message}
              </p>
            ) : null}
            {error ? (
              <p className="inline-flex items-center gap-2 text-sm font-bold text-rose-600">
                <AlertTriangle className="h-4 w-4" />
                {error}
              </p>
            ) : null}
          </div>
        </div>

        <aside className="h-fit rounded-3xl border border-gray-100 bg-white p-6 shadow-sm xl:sticky xl:top-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-[#FF385C]">{draft.id ? "تعديل اللغة" : "لغة جديدة"}</p>
              <h2 className="mt-2 text-2xl font-black text-[#1a1f36]">{draft.id ? draft.name : "إضافة لغة"}</h2>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 text-[#1a1f36]">
              <Globe2 className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            <label className="space-y-2">
              <span className="text-xs font-bold text-gray-600">كود اللغة</span>
              <input dir="ltr" className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-[#1a1f36] focus:bg-white" placeholder="ar" value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value })} />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-bold text-gray-600">اسم اللغة</span>
              <input className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-[#1a1f36] focus:bg-white" placeholder="العربية" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-xs font-bold text-gray-600">اسم العلم</span>
                <input className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-[#1a1f36] focus:bg-white" placeholder="Saudi Arabia" value={draft.flag_name} onChange={(e) => setDraft({ ...draft, flag_name: e.target.value })} />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-bold text-gray-600">كود العلم</span>
                <input dir="ltr" className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-[#1a1f36] focus:bg-white" placeholder="SA" value={draft.flag_code} onChange={(e) => setDraft({ ...draft, flag_code: e.target.value })} />
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-xs font-bold text-gray-600">الحالة</span>
                <select className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-[#1a1f36] focus:bg-white" value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })}>
                  <option value="on">مفعلة</option>
                  <option value="off">متوقفة</option>
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-xs font-bold text-gray-600">الاتجاه</span>
                <select className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-[#1a1f36] focus:bg-white" value={draft.rtl} onChange={(e) => setDraft({ ...draft, rtl: e.target.value })}>
                  <option value="yes">RTL</option>
                  <option value="no">LTR</option>
                </select>
              </label>
            </div>
            <label className="space-y-2">
              <span className="text-xs font-bold text-gray-600">الأولوية</span>
              <input type="number" className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-[#1a1f36] focus:bg-white" value={draft.priority} onChange={(e) => setDraft({ ...draft, priority: Number(e.target.value || 0) })} />
            </label>
            <button
              type="button"
              disabled={busyAction === "save-language"}
              onClick={() => void saveDraft()}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#FF385C] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#e63252] disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              حفظ اللغة
            </button>
          </div>
        </aside>
      </section>
    </div>
  );
}
