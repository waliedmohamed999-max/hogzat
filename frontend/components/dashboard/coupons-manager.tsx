"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Copy, Edit3, Percent, Plus, Search, TicketPercent, Trash2, X } from "lucide-react";
import type { BridgeDashboardCoupon, BridgeDashboardCouponsResponse } from "@/lib/api";
import { secureFetch } from "@/lib/client-security";
import { SAUDI_RIYAL_SYMBOL } from "@/lib/presentation";

type CouponDraft = {
  id: number;
  code: string;
  description: string;
  price_type: string;
  price: number;
  status: string;
  start_date: string;
  end_date: string;
  service_type: string;
};

const EMPTY_DRAFT: CouponDraft = {
  id: 0,
  code: "",
  description: "",
  price_type: "percent",
  price: 10,
  status: "on",
  start_date: "",
  end_date: "",
  service_type: "",
};

function toDraft(item: BridgeDashboardCoupon): CouponDraft {
  return {
    id: item.id,
    code: item.code,
    description: item.description,
    price_type: item.price_type || "percent",
    price: item.price,
    status: item.status || "on",
    start_date: item.start_date || "",
    end_date: item.end_date || "",
    service_type: item.service_type || "",
  };
}

function formatDiscount(item: Pick<BridgeDashboardCoupon, "price" | "price_type">) {
  if (item.price_type === "percent") return `${Number(item.price).toLocaleString("ar-SA")}%`;
  return `${Number(item.price).toLocaleString("ar-SA")} ${SAUDI_RIYAL_SYMBOL}`;
}

function normalizeCouponStatus(status?: string) {
  const normalized = String(status || "").trim().toLowerCase();
  return ["on", "active", "enabled", "1", "true", "نشط"].includes(normalized) ? "on" : "off";
}

function statusLabel(status: string) {
  return normalizeCouponStatus(status) === "on" ? "نشط" : "غير نشط";
}

function statusClass(status: string) {
  return normalizeCouponStatus(status) === "on"
    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
    : "bg-gray-100 text-gray-600 ring-1 ring-gray-200";
}

function serviceLabel(type?: string) {
  if (type === "home") return "الإقامات";
  if (type === "experience") return "التجارب";
  if (type === "car") return "الخدمات";
  return "كل الخدمات";
}

function isCurrent(item: BridgeDashboardCoupon) {
  const today = new Date().toISOString().slice(0, 10);
  if (normalizeCouponStatus(item.status) !== "on") return false;
  if (item.start_date && today < item.start_date) return false;
  if (item.end_date && today > item.end_date) return false;
  return true;
}

export function CouponsManager({ payload }: { payload: BridgeDashboardCouponsResponse | null }) {
  const [items, setItems] = useState(payload?.results ?? []);
  const [draft, setDraft] = useState<CouponDraft>(EMPTY_DRAFT);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const filteredItems = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesText = !needle || [item.code, item.description, item.service_type].filter(Boolean).some((value) => String(value).toLowerCase().includes(needle));
      const matchesStatus = !statusFilter || normalizeCouponStatus(item.status) === statusFilter;
      return matchesText && matchesStatus;
    });
  }, [items, query, statusFilter]);

  const activeCount = items.filter((item) => normalizeCouponStatus(item.status) === "on").length;
  const currentCount = items.filter(isCurrent).length;

  function updateDraft(next: Partial<CouponDraft>) {
    setDraft((current) => ({ ...current, ...next }));
  }

  async function saveCoupon() {
    setPending(true);
    setError(null);
    setMessage(null);

    try {
      const response = await secureFetch("/api/v1/dashboard/bridge/dashboard/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const result = (await response.json()) as { status?: number; message?: string; data?: { id?: number } };
      if (!response.ok || result.status !== 1) {
        setError(result.message || "تعذر حفظ الكوبون.");
        return;
      }

      const savedId = result.data?.id ?? draft.id;
      const savedItem: BridgeDashboardCoupon = {
        id: savedId,
        code: draft.code.toUpperCase(),
        description: draft.description,
        price_type: draft.price_type,
        price: draft.price,
        status: draft.status,
        start_date: draft.start_date,
        end_date: draft.end_date,
        service_type: draft.service_type,
      };

      setItems((current) => {
        const exists = current.some((item) => item.id === savedId);
        return exists ? current.map((item) => (item.id === savedId ? savedItem : item)) : [savedItem, ...current];
      });
      setDraft(EMPTY_DRAFT);
      setMessage(result.message || "تم حفظ الكوبون.");
    } finally {
      setPending(false);
    }
  }

  async function updateStatus(id: number, status: string) {
    setPending(true);
    setError(null);
    setMessage(null);

    try {
      const response = await secureFetch(`/api/v1/dashboard/bridge/dashboard/coupons/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const result = (await response.json()) as { status?: number; message?: string };
      if (!response.ok || result.status !== 1) {
        setError(result.message || "تعذر تحديث حالة الكوبون.");
        return;
      }

      setItems((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));
      setMessage(result.message || "تم تحديث الحالة.");
    } finally {
      setPending(false);
    }
  }

  async function deleteCoupon(id: number) {
    const confirmed = window.confirm("هل تريد حذف هذا الكوبون؟");
    if (!confirmed) return;

    setPending(true);
    setError(null);
    setMessage(null);

    try {
      const response = await secureFetch(`/api/v1/dashboard/bridge/dashboard/coupons/${id}/delete`, { method: "POST" });
      const result = (await response.json()) as { status?: number; message?: string };
      if (!response.ok || result.status !== 1) {
        setError(result.message || "تعذر حذف الكوبون.");
        return;
      }

      setItems((current) => current.filter((item) => item.id !== id));
      if (draft.id === id) setDraft(EMPTY_DRAFT);
      setMessage(result.message || "تم حذف الكوبون.");
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
              <TicketPercent className="size-4" />
              الخصومات
            </span>
            <h1 className="mt-4 text-3xl font-black">كوبونات الخصم</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/70">
              أنشئ كوبونات قابلة للتطبيق في الحجز، وحدد القيمة ونطاق الخدمة وفترة التفعيل.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Summary label="الإجمالي" value={items.length} />
              <Summary label="نشط" value={activeCount} />
              <Summary label="ساري الآن" value={currentCount} />
            </div>
          </div>
          <div className="grid gap-3 border-b border-gray-100 p-5 md:grid-cols-[1fr_220px_auto]">
            <label className="relative">
              <Search className="absolute right-4 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث بكود الكوبون أو الوصف" className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pe-11 ps-4 text-sm outline-none focus:border-[#FF385C] focus:bg-white" />
            </label>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none">
              <option value="">كل الحالات</option>
              <option value="on">نشط</option>
              <option value="off">غير نشط</option>
            </select>
            <button type="button" onClick={() => setDraft(EMPTY_DRAFT)} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1a1f36] px-5 py-3 text-sm font-bold text-white">
              <Plus className="size-4" />
              كوبون جديد
            </button>
          </div>
        </div>

        {filteredItems.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {filteredItems.map((item) => (
              <article key={item.id} className={`rounded-[24px] border bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md ${isCurrent(item) ? "border-emerald-200" : "border-gray-100"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="grid size-12 place-items-center rounded-2xl bg-[#FF385C]/10 text-[#FF385C]">
                      <TicketPercent className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate text-xl font-black tracking-wide text-[#1a1f36]" dir="ltr" title={item.code}>{item.code}</h2>
                      <p className="mt-1 text-xs font-bold text-gray-400">#{item.id}</p>
                    </div>
                  </div>
                  <span className={`inline-flex h-7 shrink-0 items-center justify-center whitespace-nowrap rounded-full px-3 text-xs font-bold leading-none ${statusClass(item.status)}`}>
                    {statusLabel(item.status)}
                  </span>
                </div>
                <div className="mt-5 rounded-2xl bg-[#1a1f36] p-5 text-white">
                  <p className="text-xs font-bold text-white/55">قيمة الخصم</p>
                  <p className="mt-1 text-4xl font-black">{formatDiscount(item)}</p>
                </div>
                <p className="mt-4 line-clamp-2 min-h-[3.5rem] text-sm leading-7 text-gray-600">{item.description || "لا يوجد وصف لهذا الكوبون."}</p>
                <div className="mt-4 grid gap-2 text-xs font-bold text-gray-500">
                  <Info label="النطاق" value={serviceLabel(item.service_type)} />
                  <Info label="البداية" value={item.start_date || "-"} />
                  <Info label="النهاية" value={item.end_date || "-"} />
                </div>
                <div className="mt-5 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
                  <button type="button" onClick={() => navigator.clipboard?.writeText(item.code)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold text-gray-700">
                    <Copy className="size-4" />
                    نسخ
                  </button>
                  <button type="button" onClick={() => setDraft(toDraft(item))} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold text-gray-700">
                    <Edit3 className="size-4" />
                    تعديل
                  </button>
                  <button type="button" disabled={pending} onClick={() => updateStatus(item.id, normalizeCouponStatus(item.status) === "on" ? "off" : "on")} className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold text-gray-700 disabled:opacity-60">
                    {normalizeCouponStatus(item.status) === "on" ? "تعطيل" : "تفعيل"}
                  </button>
                  <button type="button" disabled={pending} onClick={() => deleteCoupon(item.id)} className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-red-600 disabled:opacity-60">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-[28px] border border-dashed border-gray-300 bg-white p-12 text-center text-sm font-bold text-gray-500 shadow-sm">لا توجد كوبونات مطابقة.</div>
        )}
      </section>

      <aside className="h-fit rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm xl:sticky xl:top-24">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-[#1a1f36]">{draft.id ? "تعديل كوبون" : "إضافة كوبون"}</h2>
            <p className="mt-2 text-sm leading-7 text-gray-500">الكود سيطبق في ملخص الحجز عند إدخاله من العميل.</p>
          </div>
          {draft.id ? <button type="button" onClick={() => setDraft(EMPTY_DRAFT)} className="rounded-xl border border-gray-200 p-2 text-gray-500"><X className="size-4" /></button> : null}
        </div>
        <div className="mt-6 grid gap-4">
          <Field label="كود الكوبون" value={draft.code} onChange={(value) => updateDraft({ code: value.toUpperCase().replace(/\s+/g, "") })} placeholder="LABAYH20" dir="ltr" />
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-xs font-bold text-gray-500">نوع الخصم</span>
              <select value={draft.price_type} onChange={(event) => updateDraft({ price_type: event.target.value })} className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none">
                <option value="percent">نسبة مئوية</option>
                <option value="fixed">مبلغ ثابت</option>
              </select>
            </label>
            <Field label="القيمة" type="number" value={String(draft.price)} onChange={(value) => updateDraft({ price: Number(value || 0) })} placeholder="10" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="بداية التفعيل" type="date" value={draft.start_date} onChange={(value) => updateDraft({ start_date: value })} placeholder="" />
            <Field label="نهاية التفعيل" type="date" value={draft.end_date} onChange={(value) => updateDraft({ end_date: value })} placeholder="" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-xs font-bold text-gray-500">النطاق</span>
              <select value={draft.service_type} onChange={(event) => updateDraft({ service_type: event.target.value })} className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none">
                <option value="">كل الخدمات</option>
                <option value="home">الإقامات</option>
                <option value="experience">التجارب</option>
                <option value="car">الخدمات</option>
              </select>
            </label>
            <label className="grid gap-2">
              <span className="text-xs font-bold text-gray-500">الحالة</span>
              <select value={draft.status} onChange={(event) => updateDraft({ status: event.target.value })} className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none">
                <option value="on">نشط</option>
                <option value="off">غير نشط</option>
              </select>
            </label>
          </div>
          <label className="grid gap-2">
            <span className="text-xs font-bold text-gray-500">الوصف</span>
            <textarea value={draft.description} onChange={(event) => updateDraft({ description: event.target.value })} rows={4} className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-7 outline-none focus:border-[#FF385C] focus:bg-white" placeholder="مثال: خصم افتتاحي لفترة محدودة" />
          </label>
          <button type="button" disabled={pending || !draft.code.trim() || draft.price <= 0} onClick={saveCoupon} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1a1f36] px-5 py-3 text-sm font-bold text-white disabled:opacity-60">
            <CheckCircle2 className="size-4" />
            {pending ? "جارٍ الحفظ..." : "حفظ الكوبون"}
          </button>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <div className="flex items-center gap-2 font-bold text-[#1a1f36]">
              <Percent className="size-4 text-[#FF385C]" />
              معاينة الخصم
            </div>
            <p className="mt-2 text-3xl font-black text-[#1a1f36]">{draft.price_type === "percent" ? `${draft.price || 0}%` : `${draft.price || 0} ${SAUDI_RIYAL_SYMBOL}`}</p>
          </div>
          {message ? <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{message}</p> : null}
          {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{error}</p> : null}
        </div>
      </aside>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
      <p className="text-xs font-bold text-white/60">{label}</p>
      <p className="mt-1 text-2xl font-black text-white">{value.toLocaleString("ar-SA")}</p>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text", dir }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; type?: string; dir?: "ltr" | "rtl" }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-bold text-gray-500">{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} dir={dir} className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-[#FF385C] focus:bg-white" />
    </label>
  );
}
