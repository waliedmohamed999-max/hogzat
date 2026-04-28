"use client";

import { useMemo, useState } from "react";
import {
  BadgeCheck,
  CheckCircle2,
  Copy,
  Edit3,
  Grid2X2,
  Hash,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  Tags,
  Trash2,
  X,
  type LucideIcon,
} from "lucide-react";
import type { BridgeDashboardTerm } from "@/lib/api";
import { secureFetch } from "@/lib/client-security";

type ServiceTermDraft = {
  id: number;
  title: string;
  name: string;
  description: string;
  icon: string;
  price: number;
};

type ServiceTermsManagerProps = {
  initialTerms: BridgeDashboardTerm[];
  taxonomy: string;
  title: string;
  eyebrow: string;
  description: string;
  addLabel: string;
  usageLabel: string;
};

const EMPTY_DRAFT: ServiceTermDraft = {
  id: 0,
  title: "",
  name: "",
  description: "",
  icon: "",
  price: 0,
};

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\u0600-\u06ff-]/g, "");
}

function toDraft(term: BridgeDashboardTerm): ServiceTermDraft {
  return {
    id: term.id,
    title: term.title,
    name: term.name,
    description: term.description ?? "",
    icon: term.icon ?? "",
    price: term.price ?? 0,
  };
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

export function ServiceTermsManager({
  initialTerms,
  taxonomy,
  title,
  eyebrow,
  description,
  addLabel,
  usageLabel,
}: ServiceTermsManagerProps) {
  const [items, setItems] = useState(initialTerms);
  const [draft, setDraft] = useState<ServiceTermDraft>(EMPTY_DRAFT);
  const [query, setQuery] = useState("");
  const [usageFilter, setUsageFilter] = useState<"all" | "used" | "unused">("all");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const stats = useMemo(() => {
    const total = items.length;
    const used = items.filter((item) => (item.usage_count ?? 0) > 0).length;
    const unused = total - used;
    const priced = items.filter((item) => Number(item.price ?? 0) > 0).length;
    return { total, used, unused, priced };
  }, [items]);

  const filteredItems = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesQuery =
        !needle ||
        [item.title, item.name, item.description, item.icon]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(needle));
      const isUsed = (item.usage_count ?? 0) > 0;
      const matchesUsage = usageFilter === "all" || (usageFilter === "used" ? isUsed : !isUsed);
      return matchesQuery && matchesUsage;
    });
  }, [items, query, usageFilter]);

  function updateDraft(next: Partial<ServiceTermDraft>) {
    setDraft((current) => ({ ...current, ...next }));
  }

  function resetDraft() {
    setDraft(EMPTY_DRAFT);
    setSelectedId(null);
    setError(null);
    setMessage(null);
  }

  function editTerm(term: BridgeDashboardTerm) {
    setDraft(toDraft(term));
    setSelectedId(term.id);
  }

  async function saveTerm() {
    setPending(true);
    setError(null);
    setMessage(null);

    try {
      const response = await secureFetch(`/api/v1/dashboard/bridge/dashboard/terms/${taxonomy}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: draft.id,
          title: draft.title,
          name: draft.name || normalizeSlug(draft.title),
          description: draft.description,
          icon: draft.icon,
          price: draft.price,
        }),
      });
      const result = (await response.json()) as {
        status?: number;
        message?: string;
        data?: { id?: number };
      };

      if (!response.ok || result.status !== 1) {
        setError(result.message || "تعذر حفظ العنصر.");
        return;
      }

      const savedId = result.data?.id ?? draft.id;
      const savedItem: BridgeDashboardTerm = {
        id: savedId,
        title: draft.title,
        name: draft.name || normalizeSlug(draft.title),
        description: draft.description,
        icon: draft.icon,
        price: draft.price,
        usage_count: items.find((item) => item.id === savedId)?.usage_count ?? 0,
      };

      setItems((current) => {
        const exists = current.some((item) => item.id === savedId);
        return exists ? current.map((item) => (item.id === savedId ? savedItem : item)) : [savedItem, ...current];
      });
      setDraft(EMPTY_DRAFT);
      setSelectedId(null);
      setMessage(result.message || "تم الحفظ بنجاح.");
    } finally {
      setPending(false);
    }
  }

  async function deleteTerm(id: number) {
    const confirmed = window.confirm("هل تريد حذف هذا العنصر؟ قد يؤثر ذلك على الإعلانات المرتبطة به.");
    if (!confirmed) return;

    setPending(true);
    setError(null);
    setMessage(null);

    try {
      const response = await secureFetch(`/api/v1/dashboard/bridge/dashboard/terms/${taxonomy}/${id}/delete`, {
        method: "POST",
      });
      const result = (await response.json()) as { status?: number; message?: string };

      if (!response.ok || result.status !== 1) {
        setError(result.message || "تعذر حذف العنصر.");
        return;
      }

      setItems((current) => current.filter((item) => item.id !== id));
      if (draft.id === id) resetDraft();
      setMessage(result.message || "تم الحذف بنجاح.");
    } finally {
      setPending(false);
    }
  }

  function copySlug(value: string) {
    navigator.clipboard.writeText(value);
    setMessage("تم نسخ الكود.");
  }

  return (
    <div className="space-y-6 bg-[#F7F8FA] pb-10" dir="rtl">
      <section className="overflow-hidden rounded-[28px] border border-gray-100 bg-white shadow-sm">
        <div className="bg-[#1a1f36] p-6 text-white lg:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold text-white/80">
                <Tags className="size-4 text-[#FF385C]" />
                {eyebrow}
              </div>
              <h1 className="mt-4 text-3xl font-black">{title}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-white/70">{description}</p>
            </div>
            <button
              type="button"
              onClick={resetDraft}
              className="inline-flex items-center gap-2 rounded-xl bg-[#FF385C] px-4 py-2 text-sm font-bold text-white"
            >
              <Plus className="size-4" />
              {addLabel}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 divide-x divide-x-reverse divide-gray-100 bg-white md:grid-cols-4">
          {[
            ["الإجمالي", stats.total],
            ["مستخدمة", stats.used],
            ["غير مستخدمة", stats.unused],
            ["برسوم", stats.priced],
          ].map(([label, value]) => (
            <div key={String(label)} className="p-4 text-center">
              <div className="text-2xl font-black text-[#1a1f36]">{Number(value).toLocaleString("ar-SA")}</div>
              <div className="mt-1 text-xs font-bold text-gray-500">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Tags} label="العناصر" value={stats.total.toLocaleString("ar-SA")} hint="إجمالي العناصر" />
        <StatCard icon={BadgeCheck} label="مستخدمة" value={stats.used.toLocaleString("ar-SA")} hint="مرتبطة بإعلانات" />
        <StatCard icon={SlidersHorizontal} label="غير مستخدمة" value={stats.unused.toLocaleString("ar-SA")} hint="جاهزة للتنظيف" />
        <StatCard icon={Sparkles} label="برسوم" value={stats.priced.toLocaleString("ar-SA")} hint="لها قيمة إضافية" />
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
        <section className="rounded-3xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-5">
            <div className="grid gap-3 md:grid-cols-[1fr_180px]">
              <label className="relative">
                <Search className="absolute right-4 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="ابحث بالاسم أو الكود أو الأيقونة..."
                  className="w-full rounded-2xl border border-gray-200 bg-white py-3 pe-11 ps-4 text-sm outline-none transition focus:border-[#FF385C] focus:ring-2 focus:ring-[#FF385C]/20"
                />
              </label>
              <select
                value={usageFilter}
                onChange={(event) => setUsageFilter(event.target.value as "all" | "used" | "unused")}
                className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700"
              >
                <option value="all">كل العناصر</option>
                <option value="used">مستخدمة فقط</option>
                <option value="unused">غير مستخدمة</option>
              </select>
            </div>
          </div>

          {filteredItems.length > 0 ? (
            <div className="grid gap-4 p-5 md:grid-cols-2 2xl:grid-cols-3">
              {filteredItems.map((item) => (
                <article
                  key={item.id}
                  className={`rounded-3xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                    selectedId === item.id ? "border-[#FF385C]" : "border-gray-100"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-12 items-center justify-center rounded-2xl bg-[#FF385C]/10 text-[#FF385C]">
                        <Grid2X2 className="size-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-black text-[#1a1f36]">{item.title}</h2>
                        <p className="mt-1 text-xs font-bold text-gray-400">#{item.id}</p>
                      </div>
                    </div>
                    <span className="rounded-full border border-gray-100 bg-gray-50 px-2.5 py-1 text-xs font-bold text-gray-500">
                      {Number(item.usage_count ?? 0).toLocaleString("ar-SA")} {usageLabel}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3">
                    <button
                      type="button"
                      onClick={() => copySlug(item.name || "")}
                      className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 text-right"
                    >
                      <span>
                        <span className="block text-xs font-bold text-gray-400">الكود</span>
                        <b className="text-sm text-[#1a1f36]" dir="ltr">{item.name || "-"}</b>
                      </span>
                      <Copy className="size-4 text-gray-400" />
                    </button>
                    <div className="rounded-2xl bg-gray-50 px-4 py-3">
                      <span className="block text-xs font-bold text-gray-400">الأيقونة</span>
                      <b className="text-sm text-[#1a1f36]" dir="ltr">{item.icon || "بدون أيقونة"}</b>
                    </div>
                  </div>

                  {item.description ? <p className="mt-4 line-clamp-2 text-sm leading-7 text-gray-600">{item.description}</p> : null}

                  <div className="mt-5 flex items-center gap-2 border-t border-gray-100 pt-4">
                    <button
                      type="button"
                      onClick={() => editTerm(item)}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-700 transition hover:border-[#FF385C]/30 hover:text-[#FF385C]"
                    >
                      <Edit3 className="size-4" />
                      تعديل
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteTerm(item.id)}
                      disabled={pending}
                      className="inline-flex items-center justify-center rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-60"
                      aria-label="حذف"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="m-5 rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-center">
              <Tags className="mx-auto size-14 text-gray-300" />
              <h3 className="mt-4 font-black text-[#1a1f36]">لا توجد عناصر مطابقة</h3>
              <p className="mt-2 text-sm text-gray-500">جرّب تعديل البحث أو الفلتر الحالي.</p>
            </div>
          )}
        </section>

        <aside className="h-fit rounded-3xl border border-gray-100 bg-white p-5 shadow-sm xl:sticky xl:top-24">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-[#1a1f36]">
                {draft.id ? "تعديل عنصر" : addLabel}
              </h2>
              <p className="mt-2 text-sm leading-7 text-gray-600">
                الاسم يظهر للمستخدم، والكود يستخدم في الفلاتر والربط الداخلي.
              </p>
            </div>
            {draft.id ? (
              <button type="button" onClick={resetDraft} className="rounded-2xl border border-gray-200 p-2 text-gray-500" aria-label="إلغاء التعديل">
                <X className="size-4" />
              </button>
            ) : null}
          </div>

          <div className="mt-6 grid gap-4">
            <label className="grid gap-2">
              <span className="text-xs font-bold text-gray-500">الاسم</span>
              <input
                value={draft.title}
                onChange={(event) => updateDraft({ title: event.target.value })}
                className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[#FF385C] focus:bg-white"
                placeholder="مثال: شاليه أو مسبح خاص"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-bold text-gray-500">الكود</span>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={draft.name}
                  onChange={(event) => updateDraft({ name: normalizeSlug(event.target.value) })}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 ps-10 text-sm outline-none transition focus:border-[#FF385C] focus:bg-white"
                  placeholder="private-pool"
                  dir="ltr"
                />
              </div>
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-bold text-gray-500">الأيقونة</span>
              <input
                value={draft.icon}
                onChange={(event) => updateDraft({ icon: event.target.value })}
                className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[#FF385C] focus:bg-white"
                placeholder="home أو pool أو wifi"
                dir="ltr"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-bold text-gray-500">قيمة/ترتيب اختياري</span>
              <input
                type="number"
                value={draft.price}
                onChange={(event) => updateDraft({ price: Number(event.target.value || 0) })}
                className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[#FF385C] focus:bg-white"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-bold text-gray-500">وصف مختصر</span>
              <textarea
                value={draft.description}
                onChange={(event) => updateDraft({ description: event.target.value })}
                rows={4}
                className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-7 outline-none transition focus:border-[#FF385C] focus:bg-white"
                placeholder="وصف يساعد فريق الإدارة على تمييز العنصر"
              />
            </label>

            <button
              type="button"
              onClick={saveTerm}
              disabled={pending || !draft.title.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1a1f36] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#2d3458] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <CheckCircle2 className="size-4" />
              {pending ? "جار الحفظ..." : "حفظ"}
            </button>

            <div className="rounded-3xl border border-gray-100 bg-gray-50 p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-[#1a1f36]">
                <Tags className="size-4 text-[#FF385C]" />
                معاينة العنصر
              </div>
              <p className="mt-2 text-xl font-black text-[#1a1f36]">{draft.title || "اسم العنصر"}</p>
              <p className="mt-1 text-sm text-gray-500" dir="ltr">{draft.name || "item-code"}</p>
            </div>

            {message ? <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{message}</p> : null}
            {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p> : null}
          </div>
        </aside>
      </div>
    </div>
  );
}
