"use client";

import Image from "next/image";
import { Check, FileText, Search, X } from "lucide-react";
import type { ReactNode } from "react";

export type StatItem = {
  label: string;
  value: string | number;
  hint?: string;
};

export function StatsBar({ items }: { items: StatItem[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {items.map((item) => (
        <div
          key={item.label}
          className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-gray-200 hover:shadow-md"
        >
          <div className="absolute left-4 top-4 h-10 w-10 rounded-2xl bg-[#FF385C]/10" />
          <div className="text-sm font-bold text-gray-500">{item.label}</div>
          <div className="mt-3 text-2xl font-black text-[#1a1f36]">{item.value}</div>
          {item.hint ? <div className="mt-1 text-xs font-semibold text-gray-400">{item.hint}</div> : null}
        </div>
      ))}
    </div>
  );
}

export function UserAvatar({
  name,
  src,
  size = "md",
}: {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg";
}) {
  const dimension = size === "lg" ? 72 : size === "sm" ? 36 : 40;
  const classes = size === "lg" ? "size-18 text-xl" : size === "sm" ? "size-9 text-xs" : "size-10 text-sm";
  const initials = (name || "مستخدم")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");

  if (src) {
    return (
      <span className={`relative overflow-hidden rounded-full bg-slate-100 ${classes}`}>
        <Image src={src} alt={name} width={dimension} height={dimension} className="h-full w-full object-cover" unoptimized />
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center justify-center rounded-full bg-[#1a1f36] font-bold text-white ${classes}`}>
      {initials || "م"}
    </span>
  );
}

const roleStyles: Record<string, string> = {
  guest: "bg-gray-100 text-gray-600",
  customer: "bg-gray-100 text-gray-600",
  host: "bg-blue-50 text-blue-700",
  partner: "bg-purple-50 text-purple-700",
  admin: "bg-orange-50 text-orange-700",
  administrator: "bg-orange-50 text-orange-700",
  superadmin: "bg-red-50 text-red-700",
};

const roleLabels: Record<string, string> = {
  guest: "ضيف",
  customer: "ضيف",
  host: "مضيف",
  partner: "شريك",
  admin: "مشرف",
  administrator: "مشرف",
  superadmin: "مشرف عام",
};

export function RoleBadge({ role }: { role?: string }) {
  const key = role || "guest";
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${roleStyles[key] || roleStyles.guest}`}>
      {roleLabels[key] || role}
    </span>
  );
}

const statusStyles: Record<string, string> = {
  active: "bg-green-50 text-green-700",
  suspended: "bg-red-50 text-red-600",
  inactive: "bg-yellow-50 text-yellow-700",
  deleted: "bg-slate-100 text-slate-600",
  pending: "bg-yellow-50 text-yellow-700",
  approved: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-600",
  info_requested: "bg-blue-50 text-blue-700",
};

const statusLabels: Record<string, string> = {
  active: "نشط",
  suspended: "موقوف",
  inactive: "غير مفعّل",
  deleted: "محذوف",
  pending: "قيد المراجعة",
  approved: "مقبول",
  rejected: "مرفوض",
  info_requested: "طلب معلومات",
};

export function StatusBadge({ status, pulse = false }: { status?: string; pulse?: boolean }) {
  const key = status || "inactive";
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${statusStyles[key] || statusStyles.inactive}`}>
      <span className={`size-1.5 rounded-full bg-current ${pulse ? "animate-pulse" : ""}`} />
      {statusLabels[key] || status}
    </span>
  );
}

export function FilterToolbar({
  children,
  action,
}: {
  children: ReactNode;
  action?: string;
}) {
  return (
    <form action={action} className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="grid gap-3 lg:grid-cols-6">{children}</div>
    </form>
  );
}

export function SearchField({ name = "search", defaultValue, placeholder }: { name?: string; defaultValue?: string; placeholder: string }) {
  return (
    <label className="relative lg:col-span-2">
      <Search className="absolute right-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
      <input
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pr-11 pl-4 text-sm outline-none transition focus:border-[#1a1f36] focus:bg-white"
      />
    </label>
  );
}

export function SelectField({
  name,
  defaultValue,
  options,
}: {
  name: string;
  defaultValue?: string;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <select
      name={name}
      defaultValue={defaultValue || ""}
      className="h-12 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none transition focus:border-[#1a1f36] focus:bg-white"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function ToolbarButton({ children, variant = "dark" }: { children: ReactNode; variant?: "dark" | "light" | "danger" }) {
  const cls =
    variant === "light"
      ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      : variant === "danger"
        ? "bg-red-500 text-white hover:bg-red-600"
        : "bg-[#1a1f36] text-white hover:bg-slate-800";
  return <button className={`h-12 rounded-xl px-5 text-sm font-bold transition ${cls}`}>{children}</button>;
}

export function BulkActionBar({
  count,
  children,
}: {
  count: number;
  children: ReactNode;
}) {
  if (count === 0) return null;

  return (
    <div className="sticky top-24 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#FF385C]/20 bg-white p-4 shadow-[0_20px_60px_-35px_rgba(255,56,92,0.35)]">
      <div className="font-bold text-[#1a1f36]">تم تحديد {count} مستخدم</div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export function DetailDrawer({
  open,
  title,
  children,
  footer,
  onClose,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80]">
      <button type="button" aria-label="إغلاق" onClick={onClose} className="absolute inset-0 bg-slate-950/35 backdrop-blur-sm" />
      <aside className="absolute inset-y-0 right-0 flex w-full flex-col bg-white shadow-2xl sm:w-[480px]">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <h2 className="text-xl font-bold text-[#1a1f36]">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50">
            <X className="size-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer ? <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">{footer}</div> : null}
      </aside>
    </div>
  );
}

export function ActivityTimeline({ items }: { items: Array<{ title: string; description?: string; date?: string }> }) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={`${item.title}-${index}`} className="relative pr-6">
          <span className="absolute right-0 top-2 size-2 rounded-full bg-[#FF385C]" />
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="font-bold text-[#1a1f36]">{item.title}</div>
            {item.description ? <div className="mt-1 text-sm text-slate-500">{item.description}</div> : null}
            {item.date ? <div className="mt-2 text-xs text-slate-400">{item.date}</div> : null}
          </div>
        </div>
      ))}
    </div>
  );
}

export function DocumentViewer({
  documents,
  onStatus,
}: {
  documents: Array<{ id: string; title: string; url?: string; thumbnail?: string; status: string }>;
  onStatus?: (id: string, status: string) => void;
}) {
  return (
    <div className="grid gap-3">
      {documents.map((doc) => (
        <article key={doc.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex size-12 items-center justify-center rounded-xl bg-white text-[#FF385C]">
              <FileText className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-[#1a1f36]">{doc.title}</div>
              <StatusBadge status={doc.status === "verified" ? "approved" : doc.status === "rejected" ? "rejected" : "pending"} />
              <div className="mt-3 flex flex-wrap gap-2">
                {doc.url ? (
                  <>
                    <a href={doc.url} target="_blank" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700">
                      عرض
                    </a>
                    <a href={doc.url} download className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700">
                      تحميل
                    </a>
                  </>
                ) : null}
                {onStatus ? (
                  <>
                    <button type="button" onClick={() => onStatus(doc.id, "verified")} className="rounded-lg bg-green-600 px-3 py-2 text-xs font-bold text-white">
                      توثيق
                    </button>
                    <button type="button" onClick={() => onStatus(doc.id, "rejected")} className="rounded-lg bg-red-500 px-3 py-2 text-xs font-bold text-white">
                      رفض
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "تأكيد",
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-slate-950/35 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-[#1a1f36]">{title}</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700">
            إلغاء
          </button>
          <button type="button" onClick={onConfirm} className="rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function DataTable({ children }: { children: ReactNode }) {
  return <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">{children}</div>;
}

export function CheckMark({ done }: { done: boolean }) {
  return (
    <span className={`inline-flex size-5 items-center justify-center rounded-full ${done ? "bg-green-600 text-white" : "bg-slate-200 text-slate-500"}`}>
      {done ? <Check className="size-3" /> : null}
    </span>
  );
}
