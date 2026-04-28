"use client";

import { secureFetch } from "@/lib/client-security";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Trash2 } from "lucide-react";

type UserItemActionsProps = {
  id: number;
  canApprove?: boolean;
};

export function UserItemActions({ id, canApprove = false }: UserItemActionsProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function submit(path: string) {
    setError(null);

    const response = await secureFetch(path, { method: "POST" });
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
      {canApprove ? (
        <button
          type="button"
          disabled={isPending}
          onClick={() => submit(`/api/v1/dashboard/bridge/dashboard/users/${id}/approve`)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
        >
          <CheckCircle2 className="size-4" />
          اعتماد
        </button>
      ) : null}
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          if (window.confirm("هل تريد حذف حساب المستخدم؟")) {
            submit(`/api/v1/dashboard/bridge/dashboard/users/${id}/delete`);
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
