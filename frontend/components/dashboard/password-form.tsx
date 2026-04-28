"use client";

import { secureFetch } from "@/lib/client-security";

import type { FormEvent } from "react";
import { useState, useTransition } from "react";

export function PasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      password: String(formData.get("password") || ""),
      password_confirmation: String(formData.get("password_confirmation") || ""),
    };

    const response = await secureFetch("/api/v1/profile/password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = (await response.json()) as {
      status?: number;
      message?: string;
    };

    if (!response.ok || result.status !== 1) {
      setError(result.message || "تعذر تحديث كلمة المرور حالياً.");
      return;
    }

    setMessage(result.message || "تم تحديث كلمة المرور بنجاح.");
    startTransition(() => {
      event.currentTarget.reset();
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.18)]"
    >
      <h2 className="text-2xl font-semibold text-slate-950">تحديث كلمة المرور</h2>
      <div className="mt-6 grid gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            كلمة المرور الجديدة
          </label>
          <input
            type="password"
            name="password"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-rose-300 focus:bg-white"
            minLength={6}
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            تأكيد كلمة المرور
          </label>
          <input
            type="password"
            name="password_confirmation"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-rose-300 focus:bg-white"
            minLength={6}
            required
          />
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      ) : null}

      {message ? (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-2xl bg-rose-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? "جارٍ التحديث..." : "تحديث كلمة المرور"}
        </button>
      </div>
    </form>
  );
}
