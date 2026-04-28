"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { Download, ShieldCheck, Sparkles, UserCog, Users } from "lucide-react";
import { secureFetch } from "@/lib/client-security";
import type { BridgeDashboardUsersResponse, BridgeDashboardUserDetail, BridgeDashboardUserStats } from "@/lib/api";
import {
  ActivityTimeline,
  BulkActionBar,
  ConfirmDialog,
  DataTable,
  DetailDrawer,
  FilterToolbar,
  RoleBadge,
  SearchField,
  SelectField,
  StatsBar,
  StatusBadge,
  ToolbarButton,
  UserAvatar,
} from "@/components/dashboard/admin-shared";

type UsersManagementProps = {
  users: BridgeDashboardUsersResponse | null;
  stats: BridgeDashboardUserStats | null;
  filters: Record<string, string | string[] | undefined>;
};

const roleOptions = [
  { value: "", label: "كل الأدوار" },
  { value: "guest", label: "ضيف" },
  { value: "host", label: "مضيف" },
  { value: "partner", label: "شريك" },
  { value: "admin", label: "مشرف" },
  { value: "superadmin", label: "مشرف عام" },
];

const statusOptions = [
  { value: "", label: "كل الحالات" },
  { value: "active", label: "نشط" },
  { value: "suspended", label: "موقوف" },
  { value: "inactive", label: "غير مفعّل" },
  { value: "deleted", label: "محذوف" },
];

const verificationOptions = [
  { value: "", label: "كل التوثيق" },
  { value: "verified", label: "موثّق" },
  { value: "unverified", label: "غير موثّق" },
];

const sortOptions = [
  { value: "newest", label: "الأحدث" },
  { value: "oldest", label: "الأقدم" },
  { value: "bookings", label: "الأكثر حجوزات" },
  { value: "rating", label: "الأعلى تقييمًا" },
];

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

export function UsersManagement({ users, stats, filters }: UsersManagementProps) {
  const [selected, setSelected] = useState<number[]>([]);
  const [detail, setDetail] = useState<BridgeDashboardUserDetail | null>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const rows = users?.results ?? [];

  const allSelected = rows.length > 0 && rows.every((item) => selected.includes(item.id));
  const statItems = useMemo(
    () => [
      { label: "الكل", value: formatNumber(stats?.total ?? users?.total ?? 0) },
      { label: "نشطون", value: formatNumber(stats?.active ?? 0) },
      { label: "موقوفون", value: formatNumber(stats?.suspended ?? 0) },
      { label: "مضيفون", value: formatNumber(stats?.hosts ?? 0) },
      { label: "ضيوف", value: formatNumber(stats?.guests ?? 0) },
    ],
    [stats, users?.total],
  );

  async function openDetail(id: number) {
    const response = await fetch(`/api/admin/users/${id}`, { cache: "no-store" });
    const payload = (await response.json()) as { status?: number; data?: BridgeDashboardUserDetail };
    if (response.ok && payload.status === 1 && payload.data) {
      setDetail(payload.data);
      setActiveTab("profile");
    }
  }

  async function submit(path: string, body?: Record<string, unknown>) {
    const response = await secureFetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body ?? {}),
    });
    if (response.ok) {
      startTransition(() => window.location.reload());
    }
  }

  function exportCsv() {
    const params = new URLSearchParams(window.location.search);
    window.location.href = `/api/admin/users/export?${params.toString()}`;
  }

  return (
    <div className="space-y-6" dir="rtl">
      <section className="overflow-hidden rounded-3xl border border-gray-100 bg-[#1a1f36] text-white shadow-sm">
        <div className="grid gap-6 p-6 lg:grid-cols-[1fr_auto] lg:p-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/80">
              <Users className="h-4 w-4 text-[#FF385C]" />
              مركز المستخدمين
            </div>
            <h1 className="mt-5 text-3xl font-black">المستخدمين والصلاحيات</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">
              إدارة الحسابات، الأدوار، التوثيق، الحجوزات، وسجل النشاط من لوحة واحدة احترافية.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:items-start">
            <Link
              href="/dashboard/users/permissions"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white hover:text-[#1a1f36]"
            >
              <ShieldCheck className="h-4 w-4" />
              مصفوفة الصلاحيات
            </Link>
            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#FF385C] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#e63252]"
            >
              <Download className="h-4 w-4" />
              تصدير CSV
            </button>
          </div>
        </div>
        <div className="grid border-t border-white/10 bg-white/5 p-4 text-sm text-white/70 md:grid-cols-3">
          <div className="flex items-center gap-2 px-3 py-2">
            <UserCog className="h-4 w-4 text-[#FF385C]" />
            تغيير الدور والحالة مباشرة
          </div>
          <div className="flex items-center gap-2 px-3 py-2">
            <ShieldCheck className="h-4 w-4 text-[#FF385C]" />
            متابعة التوثيق والصلاحيات
          </div>
          <div className="flex items-center gap-2 px-3 py-2">
            <Sparkles className="h-4 w-4 text-[#FF385C]" />
            درج تفاصيل كامل لكل مستخدم
          </div>
        </div>
      </section>

      <StatsBar items={statItems} />

      <FilterToolbar>
        <SearchField defaultValue={firstValue(filters.search ?? filters._s)} placeholder="ابحث بالاسم أو البريد الإلكتروني أو رقم الهاتف" />
        <SelectField name="role" defaultValue={firstValue(filters.role)} options={roleOptions} />
        <SelectField name="status" defaultValue={firstValue(filters.status)} options={statusOptions} />
        <SelectField name="verification" defaultValue={firstValue(filters.verification)} options={verificationOptions} />
        <SelectField name="sort" defaultValue={firstValue(filters.sort) || "newest"} options={sortOptions} />
        <div className="grid gap-3 lg:col-span-2 lg:grid-cols-2">
          <input name="date_from" type="date" defaultValue={firstValue(filters.date_from)} className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-[#FF385C]" />
          <input name="date_to" type="date" defaultValue={firstValue(filters.date_to)} className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-[#FF385C]" />
        </div>
        <ToolbarButton>تصفية</ToolbarButton>
        <Link href="/dashboard/system/users" className="grid h-12 place-items-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700">
          مسح الكل
        </Link>
        <button type="button" onClick={exportCsv} className="h-12 rounded-xl border border-[#FF385C]/30 bg-[#FF385C]/10 px-5 text-sm font-bold text-[#FF385C] transition hover:bg-[#FF385C] hover:text-white">
          تصدير CSV
        </button>
      </FilterToolbar>

      <BulkActionBar count={selected.length}>
        <button onClick={() => submit("/api/admin/users/0/status", { ids: selected, status: "suspended" })} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold">
          إيقاف
        </button>
        <button onClick={() => submit("/api/admin/users/0/status", { ids: selected, status: "active" })} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold">
          تفعيل
        </button>
        <button onClick={exportCsv} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold">
          تصدير
        </button>
      </BulkActionBar>

      <DataTable>
        <table className="w-full min-w-[980px] text-right text-sm">
          <thead className="bg-slate-50 text-xs font-bold text-slate-500">
            <tr>
              <th className="w-12 p-4">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(event) => setSelected(event.target.checked ? rows.map((item) => item.id) : [])}
                />
              </th>
              <th className="p-4">المستخدم</th>
              <th className="p-4">البريد الإلكتروني</th>
              <th className="p-4">تاريخ الانضمام</th>
              <th className="p-4">الحجوزات</th>
              <th className="p-4">الدور</th>
              <th className="p-4">الحالة</th>
              <th className="p-4">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((user) => (
              <tr key={user.id} className="cursor-pointer bg-white transition hover:bg-slate-50" onClick={() => openDetail(user.id)}>
                <td className="p-4" onClick={(event) => event.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selected.includes(user.id)}
                    onChange={(event) => setSelected((current) => (event.target.checked ? [...current, user.id] : current.filter((id) => id !== user.id)))}
                  />
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <UserAvatar name={user.name || `مستخدم ${user.id}`} src={user.avatar} />
                    <div>
                      <div className="font-bold text-[#1a1f36]">{user.name || `مستخدم #${user.id}`}</div>
                      <div className="text-xs text-slate-500">{user.mobile || "-"}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="font-medium text-slate-700">{user.email || "-"}</div>
                  {user.email_verified ? <div className="mt-1 text-xs font-bold text-green-600">✓ موثّق</div> : <div className="mt-1 text-xs text-slate-400">غير موثّق</div>}
                </td>
                <td className="p-4 text-slate-600">{formatDate(user.created_at)}</td>
                <td className="p-4">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{user.bookings_count ?? 0}</span>
                </td>
                <td className="p-4"><RoleBadge role={user.role_slug} /></td>
                <td className="p-4"><StatusBadge status={user.status} /></td>
                <td className="relative p-4" onClick={(event) => event.stopPropagation()}>
                  <button type="button" onClick={() => setOpenMenu(openMenu === user.id ? null : user.id)} className="rounded-lg border border-slate-200 p-2">
                    ...
                  </button>
                  {openMenu === user.id ? (
                    <div className="absolute left-4 top-12 z-10 w-52 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                      <button onClick={() => openDetail(user.id)} className="block w-full rounded-lg px-3 py-2 text-right text-sm hover:bg-slate-50">عرض الملف الشخصي</button>
                      <button className="block w-full rounded-lg px-3 py-2 text-right text-sm hover:bg-slate-50">تعديل البيانات</button>
                      <button onClick={() => submit(`/api/admin/users/${user.id}/role`, { role: "partner" })} className="block w-full rounded-lg px-3 py-2 text-right text-sm hover:bg-slate-50">تغيير الدور</button>
                      <button onClick={() => submit(`/api/admin/users/${user.id}/status`, { status: user.status === "suspended" ? "active" : "suspended" })} className="block w-full rounded-lg px-3 py-2 text-right text-sm hover:bg-slate-50">
                        {user.status === "suspended" ? "إلغاء التعليق" : "تعليق الحساب"}
                      </button>
                      <button onClick={() => submit(`/api/admin/users/${user.id}/notify`, { title: "تنبيه إداري", message: "لديك إشعار جديد من الإدارة." })} className="block w-full rounded-lg px-3 py-2 text-right text-sm hover:bg-slate-50">إرسال إشعار</button>
                      <button onClick={() => setConfirmDelete(user.id)} className="block w-full rounded-lg px-3 py-2 text-right text-sm text-red-600 hover:bg-red-50">حذف الحساب</button>
                    </div>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataTable>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">لا يوجد مستخدمون مطابقون.</div>
      ) : null}

      <UserDrawer
        user={detail}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onClose={() => setDetail(null)}
        onAction={submit}
        pending={isPending}
      />

      <ConfirmDialog
        open={confirmDelete !== null}
        title="حذف الحساب"
        description="سيتم وضع الحساب في حالة محذوف بدون إزالة بيانات النظام المرتبطة."
        confirmLabel="حذف"
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (confirmDelete) submit(`/api/admin/users/${confirmDelete}/delete`);
          setConfirmDelete(null);
        }}
      />
    </div>
  );
}

function UserDrawer({
  user,
  activeTab,
  setActiveTab,
  onClose,
  onAction,
  pending,
}: {
  user: BridgeDashboardUserDetail | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onClose: () => void;
  onAction: (path: string, body?: Record<string, unknown>) => void;
  pending: boolean;
}) {
  const tabs = [
    ["profile", "المعلومات الشخصية"],
    ["bookings", "الحجوزات"],
    ["listings", "الإعلانات"],
    ["payments", "المدفوعات"],
    ["activity", "النشاط والسجل"],
    ["permissions", "الصلاحيات والأدوار"],
  ];

  return (
    <DetailDrawer
      open={Boolean(user)}
      title="ملف المستخدم"
      onClose={onClose}
      footer={
        user ? (
          <div className="grid grid-cols-2 gap-2">
            <button className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-bold">تعديل</button>
            <button disabled={pending} onClick={() => onAction(`/api/admin/users/${user.id}/status`, { status: user.status === "suspended" ? "active" : "suspended" })} className="rounded-xl bg-[#1a1f36] px-3 py-3 text-sm font-bold text-white">
              {user.status === "suspended" ? "تفعيل" : "إيقاف"}
            </button>
            <button onClick={() => onAction(`/api/admin/users/${user.id}/notify`, { title: "رسالة من الإدارة", message: "تم إرسال رسالة إدارية إلى حسابك." })} className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-bold">
              إرسال رسالة
            </button>
            <button onClick={() => onAction(`/api/admin/users/${user.id}/delete`)} className="rounded-xl bg-red-500 px-3 py-3 text-sm font-bold text-white">حذف</button>
          </div>
        ) : null
      }
    >
      {user ? (
        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <UserAvatar name={user.name} src={user.avatar} size="lg" />
            <div>
              <div className="text-2xl font-bold text-[#1a1f36]">{user.name || `مستخدم #${user.id}`}</div>
              <div className="mt-2 flex flex-wrap gap-2">
                <RoleBadge role={user.role_slug} />
                <StatusBadge status={user.status} />
              </div>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {tabs.map(([key, label]) => (
              <button key={key} onClick={() => setActiveTab(key)} className={`shrink-0 rounded-xl px-3 py-2 text-xs font-bold ${activeTab === key ? "bg-[#FF385C] text-white" : "bg-slate-100 text-slate-600"}`}>
                {label}
              </button>
            ))}
          </div>

          {activeTab === "profile" ? (
            <div className="space-y-4">
              <InfoGrid
                items={[
                  ["البريد الإلكتروني", user.email],
                  ["رقم الهاتف", user.mobile || "-"],
                  ["تاريخ الانضمام", formatDate(user.created_at)],
                  ["آخر تسجيل دخول", user.last_login || "-"],
                  ["الدولة", user.country || "-"],
                  ["اللغة المفضلة", user.language || "-"],
                  ["الجنسية", user.nationality || "-"],
                  ["تاريخ الميلاد", user.birth_date || "-"],
                ]}
              />
              <InfoGrid
                items={[
                  ["البريد", user.email_verified ? "✓ موثّق" : "✗ غير موثّق"],
                  ["الهاتف", user.phone_verified ? "✓ موثّق" : "✗ غير موثّق"],
                  ["الهوية", user.identity_verified ? "✓ موثّق" : "✗ غير موثّق"],
                ]}
              />
            </div>
          ) : null}

          {activeTab === "bookings" ? <MiniList items={user.bookings.map((item) => ({ title: item.title, meta: item.dates, value: `${item.price} ${item.currency}` }))} empty="لا توجد حجوزات" link="/dashboard/bookings" /> : null}
          {activeTab === "listings" ? <MiniList items={user.listings.map((item) => ({ title: item.title, meta: item.status, value: `${item.price}/الليلة` }))} empty="لا توجد إعلانات" link="/dashboard/services/homes" /> : null}
          {activeTab === "payments" ? (
            <div className="space-y-4">
              <StatsBar items={[{ label: "إجمالي المصروف", value: user.payments.total_spent }, { label: "إجمالي الأرباح", value: user.payments.total_earned }]} />
              <MiniList items={user.payments.transactions.map((item) => ({ title: item.title, meta: item.status, value: `${item.price} ${item.currency}` }))} empty="لا توجد معاملات" />
            </div>
          ) : null}
          {activeTab === "activity" ? <ActivityTimeline items={user.activity} /> : null}
          {activeTab === "permissions" ? (
            <div className="space-y-4">
              <select defaultValue={user.role_slug} onChange={(event) => onAction(`/api/admin/users/${user.id}/role`, { role: event.target.value })} className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm">
                {roleOptions.slice(1).map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
              <div className="space-y-3">
                {Object.entries(user.permissions).map(([key, value]) => (
                  <label key={key} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
                    <input type="checkbox" defaultChecked={value} />
                    <span className="text-sm font-bold text-slate-700">{permissionLabel(key)}</span>
                  </label>
                ))}
              </div>
              <button className="w-full rounded-xl bg-[#FF385C] px-4 py-3 text-sm font-bold text-white">حفظ الصلاحيات</button>
            </div>
          ) : null}
        </div>
      ) : null}
    </DetailDrawer>
  );
}

function InfoGrid({ items }: { items: Array<[string, string]> }) {
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

function MiniList({ items, empty, link }: { items: Array<{ title: string; meta?: string; value?: string }>; empty: string; link?: string }) {
  return (
    <div className="space-y-3">
      {items.length > 0 ? items.map((item, index) => (
        <div key={`${item.title}-${index}`} className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="font-bold text-[#1a1f36]">{item.title}</div>
          <div className="mt-1 text-xs text-slate-500">{item.meta}</div>
          <div className="mt-2 text-sm font-bold text-[#FF385C]">{item.value}</div>
        </div>
      )) : <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">{empty}</div>}
      {link ? <Link href={link} className="block rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-bold text-slate-700">عرض الكل</Link> : null}
    </div>
  );
}

function permissionLabel(key: string) {
  const labels: Record<string, string> = {
    create_listing: "يمكنه إنشاء إعلانات",
    manage_bookings: "يمكنه استقبال حجوزات",
    access_dashboard: "يمكنه الوصول للوحة التحكم",
    manage_users: "يمكنه إدارة المستخدمين",
    view_reports: "يمكنه الوصول للتقارير المالية",
    edit_others: "يمكنه تعديل إعلانات الآخرين",
  };
  return labels[key] || key;
}
