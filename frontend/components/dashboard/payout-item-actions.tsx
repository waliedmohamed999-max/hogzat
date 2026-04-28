"use client";

import { secureFetch } from "@/lib/client-security";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ExternalLink, Loader2, Trash2 } from "lucide-react";

export function PayoutItemActions({
  id,
  detailUrl,
}: {
  id: number;
  detailUrl: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function submit(action: "status" | "delete", body?: unknown) {
    setError(null);

    const response = await secureFetch(`/api/v1/dashboard/bridge/dashboard/payouts/${id}/${action}`, {
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
    <div className="space-y-3 rounded-2xl bg-gray-50 p-4">
      <Link
        href={detailUrl}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 transition hover:border-[#1a1f36] hover:text-[#1a1f36]"
      >
        <ExternalLink className="size-4" />
        عرض التفاصيل
      </Link>
      <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#1a1f36]"
        >
          <option value="">حالة الدفعة</option>
          <option value="pending">قيد الانتظار</option>
          <option value="completed">مكتملة</option>
        </select>
        <button
          type="button"
          disabled={!status || isPending}
          onClick={() => submit("status", { status })}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1a1f36] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#2d3458] disabled:opacity-60"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
          تطبيق
        </button>
      </div>
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          if (window.confirm("هل تريد حذف طلب الدفعة؟")) {
            void submit("delete");
          }
        }}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600 transition hover:bg-rose-100 disabled:opacity-60"
      >
        <Trash2 className="size-4" />
        حذف
      </button>
      {error ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600">{error}</p> : null}
    </div>
  );
}
