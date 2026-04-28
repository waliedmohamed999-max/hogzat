"use client";

import { secureFetch } from "@/lib/client-security";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Copy, ExternalLink, Pencil, Trash2 } from "lucide-react";
import type { BridgeManagedServiceType } from "@/lib/api";

type ManagedServiceActionsProps = {
  type: BridgeManagedServiceType;
  id: number;
  editUrl: string;
  publicUrl: string;
};

export function ManagedServiceActions({
  type,
  id,
  editUrl,
  publicUrl,
}: ManagedServiceActionsProps) {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const segment = type === "home" ? "homes" : "experiences";

  async function submitAction(action: "status" | "duplicate" | "delete", body?: unknown) {
    setError(null);

    const response = await secureFetch(`/api/v1/dashboard/services/${segment}/${id}/${action}`, {
      method: "POST",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });

    const result = (await response.json()) as {
      status?: number;
      message?: string;
    };

    if (!response.ok || result.status !== 1) {
      setError(result.message || "تعذر تنفيذ الإجراء حاليًا.");
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <Link
          href={editUrl}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
        >
          <Pencil className="size-4" />
          تعديل
        </Link>
        <Link
          href={publicUrl}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
        >
          <ExternalLink className="size-4" />
          عرض
        </Link>
      </div>

      <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
        >
          <option value="">تغيير الحالة</option>
          <option value="publish">منشور</option>
          <option value="pending">معلق</option>
          <option value="draft">مسودة</option>
          <option value="trash">سلة المهملات</option>
        </select>
        <button
          type="button"
          disabled={!status || isPending}
          onClick={() => submitAction("status", { status })}
          className="rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          تطبيق
        </button>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() => submitAction("duplicate")}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white disabled:opacity-60"
        >
          <Copy className="size-4" />
          تكرار
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            if (window.confirm("هل تريد حذف هذا العنصر نهائيًا؟")) {
              submitAction("delete");
            }
          }}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-100 disabled:opacity-60"
        >
          <Trash2 className="size-4" />
          حذف
        </button>
      </div>

      {error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      ) : null}
    </div>
  );
}
