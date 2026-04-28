"use client";

import { secureFetch } from "@/lib/client-security";
import type { BridgeDashboardTerm } from "@/lib/api";
import { CheckCircle2, Edit3, Plus, Search, Sparkles, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";

type AmenityDraft = {
  id: number;
  title: string;
  name: string;
  description: string;
  icon: string;
  price: number;
};

const EMPTY_DRAFT: AmenityDraft = {
  id: 0,
  title: "",
  name: "",
  description: "",
  icon: "",
  price: 0,
};

function toDraft(term: BridgeDashboardTerm): AmenityDraft {
  return {
    id: term.id,
    title: term.title,
    name: term.name,
    description: term.description ?? "",
    icon: term.icon ?? "",
    price: term.price ?? 0,
  };
}

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\u0600-\u06ff-]/g, "");
}

export function AmenitiesManager({ initialTerms }: { initialTerms: BridgeDashboardTerm[] }) {
  const [items, setItems] = useState(initialTerms);
  const [draft, setDraft] = useState<AmenityDraft>(EMPTY_DRAFT);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const filteredItems = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return items;
    }

    return items.filter((item) =>
      [item.title, item.name, item.description, item.icon]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle)),
    );
  }, [items, query]);

  const usedCount = items.filter((item) => (item.usage_count ?? 0) > 0).length;

  function updateDraft(next: Partial<AmenityDraft>) {
    setDraft((current) => ({ ...current, ...next }));
  }

  function resetDraft() {
    setDraft(EMPTY_DRAFT);
    setError(null);
    setMessage(null);
  }

  async function saveAmenity() {
    setPending(true);
    setError(null);
    setMessage(null);

    try {
      const response = await secureFetch("/api/v1/dashboard/bridge/dashboard/terms/home-amenity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
        setError(result.message || "تعذر حفظ وسيلة الراحة.");
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
        return exists
          ? current.map((item) => (item.id === savedId ? savedItem : item))
          : [savedItem, ...current];
      });
      setDraft(EMPTY_DRAFT);
      setMessage(result.message || "تم حفظ وسيلة الراحة.");
    } finally {
      setPending(false);
    }
  }

  async function deleteAmenity(id: number) {
    const confirmed = window.confirm("هل تريد حذف وسيلة الراحة؟ سيتم فصلها من أي إعلان يستخدمها.");
    if (!confirmed) {
      return;
    }

    setPending(true);
    setError(null);
    setMessage(null);

    try {
      const response = await secureFetch(`/api/v1/dashboard/bridge/dashboard/terms/home-amenity/${id}/delete`, {
        method: "POST",
      });
      const result = (await response.json()) as { status?: number; message?: string };

      if (!response.ok || result.status !== 1) {
        setError(result.message || "تعذر حذف وسيلة الراحة.");
        return;
      }

      setItems((current) => current.filter((item) => item.id !== id));
      if (draft.id === id) {
        setDraft(EMPTY_DRAFT);
      }
      setMessage(result.message || "تم حذف وسيلة الراحة.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_390px]">
      <section className="space-y-6">
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_24px_80px_-54px_rgba(15,23,42,0.72)]">
          <div className="border-b border-slate-100 bg-[#f8f8f6] p-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <span className="inline-flex rounded-md border border-rose-100 bg-white px-4 py-1.5 text-xs font-bold text-rose-600">
                  إدارة الإعلانات
                </span>
                <h1 className="mt-4 text-3xl font-black text-slate-950">وسائل الراحة</h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                  أضف وعدل وسائل الراحة التي تظهر داخل محرر الإقامات وصفحات التفاصيل وفلاتر البحث.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
                  <p className="text-xs font-semibold text-slate-500">الإجمالي</p>
                  <p className="mt-1 text-2xl font-black text-slate-950">{items.length}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
                  <p className="text-xs font-semibold text-slate-500">مستخدمة</p>
                  <p className="mt-1 text-2xl font-black text-slate-950">{usedCount}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setDraft(EMPTY_DRAFT)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-3 text-sm font-bold text-white"
                >
                  <Plus className="size-4" />
                  إضافة جديدة
                </button>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
              <Search className="size-4 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="ابحث بالاسم أو الكود أو الأيقونة"
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="grid gap-4 p-5 md:grid-cols-2 2xl:grid-cols-3">
            {filteredItems.map((item) => (
              <article
                key={item.id}
                className="group rounded-lg border border-slate-200 bg-white p-5 shadow-[0_18px_60px_-48px_rgba(15,23,42,0.72)] transition hover:-translate-y-1 hover:border-rose-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-lg border border-rose-100 bg-rose-50 text-rose-600">
                      <Sparkles className="size-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-950">{item.title}</h2>
                      <p className="mt-1 text-xs font-semibold text-slate-400">#{item.id}</p>
                    </div>
                  </div>
                  <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-500">
                    {item.usage_count ?? 0} إعلان
                  </span>
                </div>

                <div className="mt-5 grid gap-3">
                  <div className="rounded-lg bg-slate-50 px-4 py-3">
                    <p className="text-xs font-bold text-slate-400">الكود</p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">{item.name || "-"}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 px-4 py-3">
                    <p className="text-xs font-bold text-slate-400">الأيقونة</p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">{item.icon || "بدون أيقونة"}</p>
                  </div>
                </div>

                {item.description ? (
                  <p className="mt-4 line-clamp-2 text-sm leading-7 text-slate-600">{item.description}</p>
                ) : null}

                <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setDraft(toDraft(item))}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Edit3 className="size-4" />
                    تعديل
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteAmenity(item.id)}
                    disabled={pending}
                    className="inline-flex items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-600 transition hover:bg-rose-100 disabled:opacity-60"
                    aria-label="حذف"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <aside className="h-fit rounded-lg border border-slate-200 bg-white p-6 shadow-[0_24px_80px_-54px_rgba(15,23,42,0.72)] xl:sticky xl:top-24">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-950">
              {draft.id ? "تعديل وسيلة راحة" : "إضافة وسيلة راحة"}
            </h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              الاسم يظهر للمستخدم، والكود يستخدم في الفلاتر والربط الداخلي.
            </p>
          </div>
          {draft.id ? (
            <button
              type="button"
              onClick={resetDraft}
              className="rounded-lg border border-slate-200 p-2 text-slate-500"
              aria-label="إلغاء التعديل"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>

        <div className="mt-6 grid gap-4">
          <label className="grid gap-2">
            <span className="text-xs font-bold text-slate-500">اسم وسيلة الراحة</span>
            <input
              value={draft.title}
              onChange={(event) => updateDraft({ title: event.target.value })}
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-rose-300 focus:bg-white"
              placeholder="مثال: مسبح خاص"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-xs font-bold text-slate-500">الكود</span>
            <input
              value={draft.name}
              onChange={(event) => updateDraft({ name: normalizeSlug(event.target.value) })}
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-rose-300 focus:bg-white"
              placeholder="private-pool"
              dir="ltr"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-xs font-bold text-slate-500">الأيقونة</span>
            <input
              value={draft.icon}
              onChange={(event) => updateDraft({ icon: event.target.value })}
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-rose-300 focus:bg-white"
              placeholder="pool أو wifi أو local_laundry_service"
              dir="ltr"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-xs font-bold text-slate-500">رسوم إضافية اختيارية</span>
            <input
              type="number"
              value={draft.price}
              onChange={(event) => updateDraft({ price: Number(event.target.value || 0) })}
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-rose-300 focus:bg-white"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-xs font-bold text-slate-500">وصف مختصر</span>
            <textarea
              value={draft.description}
              onChange={(event) => updateDraft({ description: event.target.value })}
              rows={4}
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-7 outline-none transition focus:border-rose-300 focus:bg-white"
              placeholder="ملاحظة داخلية أو وصف يظهر لاحقًا في الواجهة"
            />
          </label>

          <button
            type="button"
            onClick={saveAmenity}
            disabled={pending || !draft.title.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <CheckCircle2 className="size-4" />
            {pending ? "جار الحفظ..." : "حفظ وسيلة الراحة"}
          </button>

          {message ? <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{message}</p> : null}
          {error ? <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{error}</p> : null}
        </div>
      </aside>
    </div>
  );
}
