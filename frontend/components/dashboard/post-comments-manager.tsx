"use client";

import { secureFetch } from "@/lib/client-security";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { BridgePostCommentsResponse } from "@/lib/api";

export function PostCommentsManager({
  payload,
}: {
  payload: BridgePostCommentsResponse;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function submit(id: number, action: "status" | "delete", body?: unknown) {
    setError(null);
    const suffix = action === "status" ? "status" : "delete";
    const response = await secureFetch(`/api/v1/dashboard/bridge/dashboard/content/posts/comments/${id}/${suffix}`, {
      method: "POST",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const result = (await response.json()) as { status?: number; message?: string };
    if (!response.ok || result.status !== 1) {
      setError(result.message || "تعذر تنفيذ الإجراء.");
      return;
    }

    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.18)]">
        <h1 className="text-3xl font-semibold text-slate-950">تعليقات المنشورات</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          إدارة تعليقات المدونة وتغيير حالتها أو حذفها من لوحة التحكم الموحدة.
        </p>
      </section>

      <section className="space-y-5">
        {payload.results.map((item) => (
          <article
            key={item.id}
            className="grid gap-5 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.18)] lg:grid-cols-[minmax(0,1fr)_260px]"
          >
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-slate-950">
                  {item.title || `تعليق #${item.id}`}
                </h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {item.status}
                </span>
              </div>
              <p className="text-sm leading-7 text-slate-600">{item.content}</p>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  <div className="text-xs uppercase tracking-[0.24em] text-slate-400">الكاتب</div>
                  <div className="mt-1">{item.author_name || "-"}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  <div className="text-xs uppercase tracking-[0.24em] text-slate-400">البريد</div>
                  <div className="mt-1">{item.author_email || "-"}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  <div className="text-xs uppercase tracking-[0.24em] text-slate-400">المنشور</div>
                  <div className="mt-1">{item.post_title || "-"}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  <div className="text-xs uppercase tracking-[0.24em] text-slate-400">تاريخ الإنشاء</div>
                  <div className="mt-1">{item.created_at || "-"}</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Link
                href={item.public_url}
                target="_blank"
                className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
              >
                فتح المنشور
              </Link>
              <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                <select
                  defaultValue=""
                  onChange={(event) => {
                    if (event.target.value) {
                      submit(item.id, "status", { status: event.target.value });
                    }
                  }}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
                >
                  <option value="">تغيير الحالة</option>
                  <option value="publish">منشور</option>
                  <option value="pending">قيد المراجعة</option>
                  <option value="trash">محذوف</option>
                </select>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => submit(item.id, "delete")}
                  className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600"
                >
                  حذف
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
