"use client";

import { useMemo, useState, useTransition } from "react";
import type { ReactNode } from "react";
import { Building2, CalendarDays, ClipboardCheck, Handshake, Mail, Phone, ShieldCheck, Sparkles } from "lucide-react";
import { secureFetch } from "@/lib/client-security";
import type { BridgeDashboardUsersResponse, BridgePartnerRequestDetail, BridgePartnerStats } from "@/lib/api";
import {
  ActivityTimeline,
  CheckMark,
  DetailDrawer,
  DocumentViewer,
  FilterToolbar,
  SearchField,
  SelectField,
  StatsBar,
  StatusBadge,
  ToolbarButton,
  UserAvatar,
} from "@/components/dashboard/admin-shared";

type PartnerRequestsManagementProps = {
  requests: BridgeDashboardUsersResponse | null;
  stats: BridgePartnerStats | null;
  filters: Record<string, string | string[] | undefined>;
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

function formatNumber(value = 0) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ar-SA", { dateStyle: "medium" }).format(date);
}

const statusOptions = [
  { value: "", label: "كل الحالات" },
  { value: "pending", label: "قيد المراجعة" },
  { value: "approved", label: "مقبول" },
  { value: "rejected", label: "مرفوض" },
  { value: "suspended", label: "معلّق" },
];

const typeOptions = [
  { value: "", label: "كل الأنواع" },
  { value: "host", label: "مضيف فردي" },
  { value: "company", label: "شركة" },
  { value: "agency", label: "وكالة سياحية" },
  { value: "operator", label: "مشغّل تجارب" },
];

export function PartnerRequestsManagement({ requests, stats, filters }: PartnerRequestsManagementProps) {
  const [detail, setDetail] = useState<BridgePartnerRequestDetail | null>(null);
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState("normal");
  const [isPending, startTransition] = useTransition();
  const rows = requests?.results ?? [];
  const statItems = useMemo(
    () => [
      { label: "الكل", value: formatNumber(stats?.total ?? requests?.total ?? 0) },
      { label: "قيد المراجعة", value: formatNumber(stats?.pending ?? 0) },
      { label: "مقبولة", value: formatNumber(stats?.approved ?? 0) },
      { label: "مرفوضة", value: formatNumber(stats?.rejected ?? 0) },
      { label: "هذا الشهر", value: formatNumber(stats?.this_month ?? 0) },
    ],
    [stats, requests?.total],
  );

  async function openDetail(id: number) {
    const response = await fetch(`/api/admin/partners/${id}`, { cache: "no-store" });
    const payload = (await response.json()) as { status?: number; data?: BridgePartnerRequestDetail };
    if (response.ok && payload.status === 1 && payload.data) {
      setDetail(payload.data);
      setPriority(payload.data.priority || "normal");
      setReason(payload.data.review_reason || "");
      setNotes("");
    }
  }

  async function action(path: string, body?: Record<string, unknown>) {
    const response = await secureFetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body ?? {}),
    });
    if (response.ok) {
      startTransition(() => window.location.reload());
    }
  }

  return (
    <div className="space-y-6" dir="rtl">
      <section className="overflow-hidden rounded-3xl border border-gray-100 bg-[#1a1f36] text-white shadow-sm">
        <div className="grid gap-6 p-6 lg:grid-cols-[1fr_auto] lg:p-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/80">
              <Handshake className="h-4 w-4 text-[#FF385C]" />
              مركز الشركاء
            </div>
            <h1 className="mt-5 text-3xl font-black">طلبات الشركاء</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">
              مراجعة طلبات الانضمام، فحص المستندات، تسجيل الملاحظات، واتخاذ قرار القبول أو الرفض بخطوات واضحة.
            </p>
          </div>
          <div className="grid min-w-[260px] gap-3 rounded-2xl bg-white/10 p-4 text-sm">
            <div className="flex items-center gap-2 text-white/80">
              <ShieldCheck className="h-4 w-4 text-[#FF385C]" />
              مراجعة إدارية موثقة
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <ClipboardCheck className="h-4 w-4 text-[#FF385C]" />
              قائمة تحقق لكل طلب
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <Building2 className="h-4 w-4 text-[#FF385C]" />
              تحويل تلقائي لشريك بعد القبول
            </div>
          </div>
        </div>
        <div className="grid border-t border-white/10 bg-white/5 p-4 text-sm text-white/70 md:grid-cols-3">
          <div className="flex items-center gap-2 px-3 py-2">
            <Sparkles className="h-4 w-4 text-[#FF385C]" />
            فلاتر حسب الحالة والنوع والأولوية
          </div>
          <div className="flex items-center gap-2 px-3 py-2">
            <Mail className="h-4 w-4 text-[#FF385C]" />
            مراسلة المتقدم من نفس الطلب
          </div>
          <div className="flex items-center gap-2 px-3 py-2">
            <CalendarDays className="h-4 w-4 text-[#FF385C]" />
            سجل مراجعة زمني داخل الدرج
          </div>
        </div>
      </section>

      <StatsBar items={statItems} />

      <FilterToolbar>
        <SearchField defaultValue={firstValue(filters.search ?? filters._s)} placeholder="ابحث بالاسم أو الشركة أو البريد" />
        <SelectField name="status" defaultValue={firstValue(filters.status)} options={statusOptions} />
        <SelectField name="partner_type" defaultValue={firstValue(filters.partner_type)} options={typeOptions} />
        <SelectField
          name="sort"
          defaultValue={firstValue(filters.sort) || "newest"}
          options={[
            { value: "newest", label: "الأحدث" },
            { value: "oldest", label: "الأقدم" },
            { value: "priority", label: "الأعلى أولوية" },
          ]}
        />
        <input name="date_from" type="date" defaultValue={firstValue(filters.date_from)} className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-[#FF385C]" />
        <input name="date_to" type="date" defaultValue={firstValue(filters.date_to)} className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-[#FF385C]" />
        <ToolbarButton>تصفية</ToolbarButton>
      </FilterToolbar>

      <section className="grid gap-4">
        {rows.map((request) => (
          <article key={request.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_60px_-42px_rgba(26,31,54,0.25)]">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex gap-4">
                <UserAvatar name={request.name || `طلب #${request.id}`} src={request.avatar} />
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-lg font-bold text-[#1a1f36]">{request.name || `مستخدم #${request.id}`}</h2>
                    <StatusBadge status={request.request_status || "pending"} pulse={(request.request_status || "pending") === "pending"} />
                  </div>
                  <p className="mt-2 text-sm text-slate-500">شركة: {(request as { company_name?: string }).company_name || "غير محدد"}</p>
                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">
                    <span className="inline-flex items-center gap-2"><Mail className="size-4 text-[#FF385C]" />{request.email || "-"}</span>
                    <span className="inline-flex items-center gap-2"><Phone className="size-4 text-[#FF385C]" />{request.mobile || "-"}</span>
                    <span className="inline-flex items-center gap-2"><CalendarDays className="size-4 text-[#FF385C]" />تاريخ التقديم: {formatDate(request.created_at)}</span>
                    <span>نوع الشراكة: {(request as { partner_type?: string }).partner_type || "وكالة سياحية"}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button onClick={() => openDetail(request.id)} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700">عرض التفاصيل</button>
                <button disabled={isPending} onClick={() => action(`/api/admin/partners/${request.id}/status`, { status: "approved" })} className="rounded-xl bg-green-600 px-4 py-3 text-sm font-bold text-white">قبول ✓</button>
                <button disabled={isPending} onClick={() => action(`/api/admin/partners/${request.id}/status`, { status: "rejected", reason: "تم رفض الطلب من لوحة التحكم." })} className="rounded-xl bg-red-500 px-4 py-3 text-sm font-bold text-white">رفض ✗</button>
                <button disabled={isPending} onClick={() => action(`/api/admin/partners/${request.id}/status`, { status: "info_requested" })} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700">طلب معلومات</button>
              </div>
            </div>
          </article>
        ))}
      </section>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">لا توجد طلبات شركاء.</div>
      ) : null}

      <DetailDrawer
        open={Boolean(detail)}
        title="مراجعة طلب الشريك"
        onClose={() => setDetail(null)}
        footer={
          detail ? (
            <div className="space-y-3">
              {detail.request_status === "approved" ? (
                <>
                  <div className="rounded-xl bg-green-50 p-3 text-sm font-bold text-green-700">تم القبول بواسطة الإدارة.</div>
                  <button onClick={() => action(`/api/admin/partners/${detail.id}/status`, { status: "pending" })} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold">إلغاء القبول</button>
                  <button onClick={() => action(`/api/admin/partners/${detail.id}/message`, { title: "مرحباً بك", message: "مرحباً بك كشريك في المنصة." })} className="w-full rounded-xl bg-[#1a1f36] px-4 py-3 text-sm font-bold text-white">إرسال بريد ترحيبي</button>
                </>
              ) : detail.request_status === "rejected" ? (
                <>
                  <div className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-600">{detail.review_reason || "تم رفض الطلب."}</div>
                  <button onClick={() => action(`/api/admin/partners/${detail.id}/status`, { status: "pending" })} className="w-full rounded-xl bg-[#1a1f36] px-4 py-3 text-sm font-bold text-white">مراجعة مجددًا</button>
                </>
              ) : (
                <>
                  <textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="سبب القرار (مطلوب عند الرفض)" className="min-h-20 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-[#FF385C]" />
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => action(`/api/admin/partners/${detail.id}/status`, { status: "approved", priority })} className="rounded-xl bg-green-600 px-4 py-3 text-sm font-bold text-white">قبول الطلب ✓</button>
                    <button onClick={() => action(`/api/admin/partners/${detail.id}/status`, { status: "rejected", reason, priority })} className="rounded-xl bg-red-500 px-4 py-3 text-sm font-bold text-white">رفض الطلب ✗</button>
                    <button onClick={() => action(`/api/admin/partners/${detail.id}/status`, { status: "info_requested", reason, priority })} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold">طلب معلومات إضافية</button>
                    <button onClick={() => action(`/api/admin/partners/${detail.id}/status`, { status: "suspended", reason, priority })} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold">تعليق الطلب</button>
                  </div>
                </>
              )}
            </div>
          ) : null
        }
      >
        {detail ? (
          <div className="space-y-6">
            <section className="flex items-center gap-4">
              <UserAvatar name={detail.name} src={detail.avatar} size="lg" />
              <div>
                <h2 className="text-2xl font-bold text-[#1a1f36]">{detail.name}</h2>
                <div className="mt-2 flex gap-2"><StatusBadge status={detail.request_status} /></div>
              </div>
            </section>

            <ReviewSection title="معلومات مقدم الطلب">
              <Info items={[
                ["البريد", detail.email],
                ["الهاتف", detail.mobile || "-"],
                ["الجنسية", detail.nationality || "-"],
                ["الموقع", detail.location || "-"],
                ["تاريخ الميلاد", detail.birth_date || "-"],
                ["رقم الهوية", detail.national_id_masked || "-"],
                ["تاريخ التقديم", formatDate(detail.submitted_at || detail.created_at)],
              ]} />
            </ReviewSection>

            <ReviewSection title="معلومات الشراكة">
              <Info items={[
                ["نوع الشراكة", detail.partner_type || "-"],
                ["اسم الشركة", detail.company_name || "-"],
                ["السجل التجاري", detail.commercial_registration || "-"],
                ["سنوات الخبرة", detail.experience_years || "-"],
                ["عدد الإعلانات المخطط", detail.planned_listings || "-"],
                ["المناطق المستهدفة", detail.target_cities || "-"],
                ["الحجوزات الشهرية المتوقعة", detail.expected_monthly_bookings || "-"],
              ]} />
            </ReviewSection>

            <ReviewSection title="المستندات المرفقة">
              <DocumentViewer documents={detail.documents} onStatus={(docId, status) => action(`/api/admin/partners/${detail.id}/documents/${docId}`, { status })} />
            </ReviewSection>

            <ReviewSection title="تقييم الطلب">
              <div className="space-y-3">
                <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="ملاحظات داخلية (لن تُرسل للمتقدم)" className="min-h-24 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-[#FF385C]" />
                <select value={priority} onChange={(event) => setPriority(event.target.value)} className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm">
                  <option value="normal">عادي</option>
                  <option value="high">مرتفع</option>
                  <option value="urgent">عاجل</option>
                </select>
                {["تم التحقق من الهوية", "تم التحقق من السجل التجاري", "تم فحص العقارات", "تم التواصل مع المتقدم", "لا توجد مشاكل قانونية"].map((label) => (
                  <label key={label} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm font-bold">
                    <input type="checkbox" />
                    {label}
                  </label>
                ))}
                <button onClick={() => action(`/api/admin/partners/${detail.id}/notes`, { note: notes || "تم تحديث تقييم الطلب", priority })} className="w-full rounded-xl bg-[#FF385C] px-4 py-3 text-sm font-bold text-white">حفظ الملاحظات</button>
              </div>
            </ReviewSection>

            <ReviewSection title="سجل المراجعة">
              <ActivityTimeline items={detail.activity} />
            </ReviewSection>

            <ReviewSection title="متابعة التأهيل بعد القبول">
              <div className="space-y-3">
                {detail.onboarding.map((item) => (
                  <div key={item.label} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-sm font-bold">
                    <CheckMark done={item.done} />
                    {item.label}
                  </div>
                ))}
              </div>
            </ReviewSection>
          </div>
        ) : null}
      </DetailDrawer>
    </div>
  );
}

function ReviewSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-lg font-bold text-[#1a1f36]">{title}</h3>
      {children}
    </section>
  );
}

function Info({ items }: { items: Array<[string, string]> }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="text-xs font-bold text-slate-400">{label}</div>
          <div className="mt-2 text-sm font-bold text-[#1a1f36]">{value}</div>
        </div>
      ))}
    </div>
  );
}
