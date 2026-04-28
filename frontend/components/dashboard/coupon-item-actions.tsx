"use client";

import { secureFetch } from "@/lib/client-security";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export function CouponItemActions({ id }: { id: number }) {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function submit(action: "status" | "delete", body?: unknown) {
    setError(null);

    const response = await secureFetch(`/api/v1/dashboard/bridge/dashboard/coupons/${id}/${action}`, {
      method: "POST",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const result = (await response.json()) as { status?: number; message?: string };

    if (!response.ok || result.status !== 1) {
      setError(result.message || "تعذر تنفيذ الإجراء.");
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
        >
          <option value="">حالة الكوبون</option>
          <option value="on">نشط</option>
          <option value="off">غير نشط</option>
        </select>
        <button
          type="button"
          disabled={!status || isPending}
          onClick={() => submit("status", { status })}
          className="rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
        >
          تطبيق
        </button>
      </div>
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          if (window.confirm("هل تريد حذف هذا الكوبون؟")) {
            submit("delete");
          }
        }}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-100 disabled:opacity-60"
      >
        <Trash2 className="size-4" />
        حذف
      </button>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
