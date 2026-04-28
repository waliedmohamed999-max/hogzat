"use client";

import { secureFetch } from "@/lib/client-security";

import { useState, useTransition } from "react";
import Link from "next/link";

type RegisterResult = {
  status?: number;
  message?: string | Record<string, string[]>;
};

function renderMessage(message: RegisterResult["message"]) {
  if (!message) {
    return "";
  }

  if (typeof message === "string") {
    return message;
  }

  return Object.values(message).flat().join(" ");
}

export function RegisterForm() {
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const response = await secureFetch("/api/session/register", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(formData.entries())),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const payload = (await response.json()) as RegisterResult;

      if (!response.ok || payload.status !== 1) {
        setResult({
          ok: false,
          message: renderMessage(payload.message) || "تعذر إنشاء الحساب الآن.",
        });
        return;
      }

      form.reset();
      setResult({
        ok: true,
        message: "تم إنشاء الحساب. يمكنك تسجيل الدخول الآن من الواجهة الجديدة.",
      });
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <input name="first_name" required placeholder="الاسم الأول" className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-rose-300 focus:bg-white" />
        <input name="last_name" required placeholder="اسم العائلة" className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-rose-300 focus:bg-white" />
      </div>
      <input name="mobile" required placeholder="رقم الجوال" className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-rose-300 focus:bg-white" />
      <input name="email" type="email" required placeholder="البريد الإلكتروني" className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-rose-300 focus:bg-white" />
      <input name="password" type="password" required minLength={6} placeholder="كلمة المرور" className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-rose-300 focus:bg-white" />
      <button disabled={isPending} className="rounded-lg bg-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:opacity-60">
        {isPending ? "جارٍ إنشاء الحساب..." : "إنشاء الحساب"}
      </button>
      {result ? (
        <p className={result.ok ? "text-sm text-emerald-600" : "text-sm text-rose-600"}>
          {result.message}
        </p>
      ) : null}
      <div className="text-sm text-slate-500">
        لديك حساب بالفعل؟{" "}
        <Link href="/auth/login" className="font-semibold text-rose-500">
          تسجيل الدخول
        </Link>
      </div>
    </form>
  );
}
