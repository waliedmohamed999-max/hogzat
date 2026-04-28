"use client";

import { secureFetch } from "@/lib/client-security";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CheckCircle2, Copy, ExternalLink, Loader2, Trash2 } from "lucide-react";

export function MediaItemActions({ id, url }: { id: number; url: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleDelete() {
    setError(null);

    const response = await secureFetch(`/api/v1/dashboard/bridge/dashboard/media/${id}/delete`, {
      method: "POST",
    });
    const result = (await response.json()) as { status?: number; message?: string };

    if (!response.ok || result.status !== 1) {
      setError(result.message || "تعذر حذف ملف الوسائط.");
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  }

  async function copyUrl() {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <Link
          href={url || "#"}
          target="_blank"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 transition hover:border-[#1a1f36] hover:text-[#1a1f36]"
        >
          <ExternalLink className="h-4 w-4" />
          فتح
        </Link>
        <button
          type="button"
          disabled={!url}
          onClick={() => void copyUrl()}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 transition hover:border-[#1a1f36] hover:text-[#1a1f36] disabled:opacity-50"
        >
          {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
          {copied ? "تم النسخ" : "نسخ"}
        </button>
      </div>
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          if (window.confirm("هل تريد حذف ملف الوسائط؟")) void handleDelete();
        }}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600 transition hover:bg-rose-100 disabled:opacity-60"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        حذف الملف
      </button>
      {error ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600">{error}</p> : null}
    </div>
  );
}
