"use client";

import { useState, useTransition } from "react";
import { secureFetch } from "@/lib/client-security";
import type { BridgePermissionsMatrix } from "@/lib/api";

const roles = [
  ["guest", "ضيف"],
  ["host", "مضيف"],
  ["partner", "شريك"],
  ["admin", "مشرف"],
  ["superadmin", "مشرف عام"],
] as const;

const permissions = [
  ["create_listing", "إنشاء إعلانات"],
  ["manage_bookings", "إدارة الحجوزات"],
  ["access_dashboard", "الوصول للوحة التحكم"],
  ["manage_users", "إدارة المستخدمين"],
  ["view_reports", "التقارير المالية"],
  ["edit_others", "تعديل إعلانات الآخرين"],
] as const;

export function PermissionsMatrix({ initialMatrix }: { initialMatrix: BridgePermissionsMatrix | null }) {
  const [matrix, setMatrix] = useState<BridgePermissionsMatrix>(initialMatrix ?? {});
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function toggle(role: string, permission: string) {
    setMatrix((current) => ({
      ...current,
      [role]: {
        ...(current[role] ?? {}),
        [permission]: !(current[role]?.[permission] ?? false),
      },
    }));
  }

  async function save() {
    setMessage("");
    const response = await secureFetch("/api/admin/permissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matrix }),
    });
    const payload = (await response.json()) as { message?: string };
    startTransition(() => setMessage(response.ok ? payload.message || "تم حفظ الصلاحيات" : payload.message || "تعذر الحفظ"));
  }

  return (
    <div className="space-y-6" dir="rtl">
      <section>
        <h1 className="text-2xl font-bold text-[#1a1f36]">مصفوفة الصلاحيات</h1>
        <p className="mt-2 text-sm text-slate-500">إدارة صلاحيات الأدوار في لوحة التحكم والواجهة العامة.</p>
      </section>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_22px_70px_-46px_rgba(26,31,54,0.35)]">
        <table className="w-full min-w-[900px] text-right text-sm">
          <thead className="bg-slate-50 text-xs font-bold text-slate-500">
            <tr>
              <th className="p-4">الدور</th>
              {permissions.map(([, label]) => <th key={label} className="p-4 text-center">{label}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {roles.map(([role, label]) => (
              <tr key={role}>
                <td className="p-4 font-bold text-[#1a1f36]">{label}</td>
                {permissions.map(([permission]) => (
                  <td key={permission} className="p-4 text-center">
                    <button
                      type="button"
                      onClick={() => toggle(role, permission)}
                      className={`mx-auto flex h-7 w-12 items-center rounded-full p-1 transition ${matrix[role]?.[permission] ? "bg-[#FF385C]" : "bg-slate-200"}`}
                    >
                      <span className={`size-5 rounded-full bg-white shadow transition ${matrix[role]?.[permission] ? "translate-x-0" : "-translate-x-5"}`} />
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5">
        <button disabled={isPending} onClick={save} className="rounded-xl bg-[#1a1f36] px-6 py-3 text-sm font-bold text-white disabled:opacity-60">
          حفظ الصلاحيات
        </button>
        {message ? <p className="text-sm font-bold text-[#FF385C]">{message}</p> : null}
      </div>
    </div>
  );
}
