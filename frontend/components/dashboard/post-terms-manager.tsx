"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Edit3, FolderTree, Hash, ImageIcon, Plus, Search, Tags, Trash2, X, type LucideIcon } from "lucide-react";
import type { BridgePostTerm, BridgePostTermsResponse } from "@/lib/api";
import { secureFetch } from "@/lib/client-security";

const EMPTY_FORM: Omit<BridgePostTerm, "taxonomy"> = {
  id: 0,
  title: "",
  slug: "",
  description: "",
  image: "",
  icon: "",
  price: 0,
};

function pageMeta(taxonomy: BridgePostTermsResponse["taxonomy"], fallbackTitle: string) {
  const isTag = taxonomy === "post-tag";
  return {
    title: fallbackTitle.includes("Post") ? (isTag ? "وسوم المقالات" : "تصنيفات المقالات") : fallbackTitle,
    eyebrow: isTag ? "وسوم المحتوى" : "تصنيفات المحتوى",
    description: isTag
      ? "أنشئ وسومًا دقيقة لتسهيل البحث وتنظيم المقالات وربط المحتوى المتشابه."
      : "نظم المقالات داخل تصنيفات واضحة تساعد الزائر ومحركات البحث على فهم بنية المحتوى.",
    icon: isTag ? Tags : FolderTree,
    addLabel: isTag ? "إضافة وسم" : "إضافة تصنيف",
  };
}

export function PostTermsManager({
  payload,
  title,
}: {
  payload: BridgePostTermsResponse;
  title: string;
}) {
  const [items, setItems] = useState(payload.results);
  const [draft, setDraft] = useState<Omit<BridgePostTerm, "taxonomy">>(EMPTY_FORM);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const meta = pageMeta(payload.taxonomy, title);
  const HeaderIcon = meta.icon;

  const filteredItems = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((item) => `${item.title} ${item.slug} ${item.description}`.toLowerCase().includes(needle));
  }, [items, query]);

  function updateDraft(next: Partial<Omit<BridgePostTerm, "taxonomy">>) {
    setDraft((current) => ({ ...current, ...next }));
  }

  async function saveTerm() {
    setMessage(null);
    setError(null);
    setPending(true);

    try {
      const response = await secureFetch(`/api/v1/dashboard/bridge/dashboard/content/posts/terms/${payload.taxonomy}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: draft.id,
          title: draft.title,
          slug: draft.slug,
          description: draft.description,
          icon: draft.icon,
          price: draft.price,
          image_id: 0,
        }),
      });
      const result = (await response.json()) as { status?: number; message?: string; data?: { id?: number } };
      if (!response.ok || result.status !== 1) {
        setError(result.message || "تعذر حفظ العنصر.");
        return;
      }

      const savedId = result.data?.id ?? draft.id;
      const saved: BridgePostTerm = { ...draft, id: savedId, taxonomy: payload.taxonomy };
      setItems((current) => {
        const exists = current.some((item) => item.id === savedId);
        return exists ? current.map((item) => (item.id === savedId ? saved : item)) : [saved, ...current];
      });
      setDraft(EMPTY_FORM);
      setMessage(result.message || "تم الحفظ بنجاح.");
    } finally {
      setPending(false);
    }
  }

  async function deleteTerm(id: number) {
    const confirmed = window.confirm("هل تريد حذف هذا العنصر؟");
    if (!confirmed) return;

    setMessage(null);
    setError(null);
    setPending(true);

    try {
      const response = await secureFetch(`/api/v1/dashboard/bridge/dashboard/content/posts/terms/${payload.taxonomy}/${id}/delete`, {
        method: "POST",
      });
      const result = (await response.json()) as { status?: number; message?: string };
      if (!response.ok || result.status !== 1) {
        setError(result.message || "تعذر حذف العنصر.");
        return;
      }

      setItems((current) => current.filter((item) => item.id !== id));
      if (draft.id === id) setDraft(EMPTY_FORM);
      setMessage(result.message || "تم الحذف.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]" dir="rtl">
      <section className="space-y-6">
        <div className="overflow-hidden rounded-[28px] border border-gray-100 bg-white shadow-sm">
          <div className="bg-[#1a1f36] p-6 text-white lg:p-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#FF385C]/15 px-3 py-1 text-xs font-bold text-[#FF385C]">
              <HeaderIcon className="size-4" />
              {meta.eyebrow}
            </span>
            <h1 className="mt-4 text-3xl font-black">{meta.title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/70">{meta.description}</p>
          </div>
          <div className="grid gap-3 border-b border-gray-100 p-5 md:grid-cols-[1fr_auto_auto]">
            <label className="relative">
              <Search className="absolute right-4 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="ابحث بالعنوان أو الرابط المختصر"
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pe-11 ps-4 text-sm outline-none focus:border-[#FF385C] focus:bg-white"
              />
            </label>
            <button type="button" onClick={() => setDraft(EMPTY_FORM)} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1a1f36] px-5 py-3 text-sm font-bold text-white">
              <Plus className="size-4" />
              {meta.addLabel}
            </button>
            <div className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-3 text-center">
              <b className="block text-xl text-[#1a1f36]">{items.length.toLocaleString("ar-SA")}</b>
              <span className="text-xs font-bold text-gray-400">عنصر</span>
            </div>
          </div>
        </div>

        {filteredItems.length ? (
          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {filteredItems.map((item) => (
              <article key={item.id} className="rounded-[24px] border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div className="grid size-12 place-items-center rounded-2xl bg-[#FF385C]/10 text-[#FF385C]">
                    {item.icon ? <span className="text-lg font-black">{item.icon.slice(0, 2)}</span> : <HeaderIcon className="size-5" />}
                  </div>
                  <span className="rounded-full bg-gray-50 px-2.5 py-1 text-xs font-bold text-gray-400">#{item.id}</span>
                </div>
                <h2 className="mt-4 line-clamp-2 min-h-[3.5rem] text-xl font-black text-[#1a1f36]">{item.title || "بدون عنوان"}</h2>
                <div className="mt-4 grid gap-2 text-xs">
                  <InfoLine icon={Hash} label="الرابط" value={item.slug || "-"} />
                  <InfoLine icon={ImageIcon} label="الصورة" value={item.image ? "مضافة" : "غير مضافة"} />
                </div>
                {item.description ? <p className="mt-4 line-clamp-3 text-sm leading-7 text-gray-500">{item.description}</p> : null}
                <div className="mt-5 flex gap-2 border-t border-gray-100 pt-4">
                  <button type="button" onClick={() => setDraft({ id: item.id, title: item.title, slug: item.slug, description: item.description, image: item.image, icon: item.icon, price: item.price })} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold text-gray-700">
                    <Edit3 className="size-4" />
                    تعديل
                  </button>
                  <button type="button" disabled={pending} onClick={() => deleteTerm(item.id)} className="inline-flex items-center justify-center rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-red-600 disabled:opacity-50">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-[28px] border border-dashed border-gray-300 bg-white p-12 text-center text-sm font-bold text-gray-500 shadow-sm">
            لا توجد عناصر مطابقة.
          </div>
        )}
      </section>

      <aside className="h-fit rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm xl:sticky xl:top-24">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black text-[#1a1f36]">{draft.id ? "تعديل عنصر" : meta.addLabel}</h2>
            <p className="mt-2 text-sm leading-7 text-gray-500">اضبط الاسم والرابط والوصف لتحسين التنظيم والظهور في الفلاتر.</p>
          </div>
          {draft.id ? (
            <button type="button" onClick={() => setDraft(EMPTY_FORM)} className="rounded-xl border border-gray-200 p-2 text-gray-500">
              <X className="size-4" />
            </button>
          ) : null}
        </div>
        <div className="mt-6 grid gap-4">
          <Field label="العنوان" value={draft.title} onChange={(value) => updateDraft({ title: value })} placeholder="مثال: أخبار السياحة" />
          <Field label="الرابط المختصر" value={draft.slug} onChange={(value) => updateDraft({ slug: value })} placeholder="travel-news" dir="ltr" />
          <Field label="الأيقونة" value={draft.icon} onChange={(value) => updateDraft({ icon: value })} placeholder="مثال: tag" />
          <Field label="ترتيب اختياري" type="number" value={String(draft.price)} onChange={(value) => updateDraft({ price: Number(value || 0) })} placeholder="0" />
          <label className="grid gap-2">
            <span className="text-xs font-bold text-gray-500">الوصف</span>
            <textarea value={draft.description} onChange={(event) => updateDraft({ description: event.target.value })} rows={5} className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-7 outline-none focus:border-[#FF385C] focus:bg-white" placeholder="وصف مختصر يساعد في الإدارة والظهور" />
          </label>
          <button type="button" disabled={pending || !draft.title.trim()} onClick={saveTerm} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1a1f36] px-5 py-3 text-sm font-bold text-white disabled:opacity-50">
            <CheckCircle2 className="size-4" />
            {pending ? "جارٍ الحفظ..." : "حفظ العنصر"}
          </button>
          {message ? <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{message}</p> : null}
          {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{error}</p> : null}
        </div>
      </aside>
    </div>
  );
}

function InfoLine({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2">
      <span className="inline-flex items-center gap-1 text-gray-400">
        <Icon className="size-3.5" />
        {label}
      </span>
      <span className="font-bold text-gray-700">{value}</span>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text", dir }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; type?: string; dir?: "ltr" | "rtl" }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-bold text-gray-500">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        dir={dir}
        className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-[#FF385C] focus:bg-white"
      />
    </label>
  );
}
