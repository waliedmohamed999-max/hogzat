"use client";

import { secureFetch } from "@/lib/client-security";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";

type ContentItemActionsProps = {
  resource: "posts" | "pages";
  id: number;
  editUrl: string;
  publicUrl: string;
};

export function ContentItemActions({
  resource,
  id,
  editUrl,
  publicUrl,
}: ContentItemActionsProps) {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function submit(action: "status" | "delete", body?: unknown) {
    setError(null);

    const response = await secureFetch(`/api/v1/dashboard/bridge/dashboard/${resource}/${id}/${action}`, {
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
          معاينة
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
          <option value="draft">مسودة</option>
          <option value="trash">سلة المهملات</option>
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
          if (window.confirm("هل تريد حذف هذا العنصر نهائيًا؟")) {
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
