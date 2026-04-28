"use client";

import { secureFetch } from "@/lib/client-security";
import type { FormEvent } from "react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, LockKeyhole, Mail } from "lucide-react";

type LoginFormProps = {
  returnUrl?: string;
};

type LoginResponse = {
  status?: number;
  message?: string;
  redirect?: string;
};

export function LoginForm({ returnUrl = "/dashboard" }: LoginFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    if (!email.includes("@") || password.length < 6) {
      setError("أدخل بريد إلكتروني صحيح وكلمة مرور لا تقل عن 6 أحرف.");
      return;
    }

    try {
      const response = await secureFetch("/api/session/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          remember,
          rememberMe: remember,
          return_url: returnUrl,
        }),
      });

      const result = (await response.json().catch(() => null)) as LoginResponse | null;
      if (!response.ok || result?.status !== 1) {
        setError(result?.message || "تعذر تسجيل الدخول. تحقق من البريد وكلمة المرور.");
        return;
      }

      startTransition(() => {
        router.replace(result.redirect || returnUrl || "/dashboard");
        router.refresh();
      });
    } catch {
      setError("تعذر الاتصال بخدمة تسجيل الدخول حاليا.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <FieldShell label="البريد الإلكتروني" icon={<Mail className="size-4" />}>
        <input
          name="email"
          type="email"
          dir="ltr"
          autoComplete="email"
          required
          placeholder="admin@example.com"
          className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-950 outline-none placeholder:text-slate-400"
        />
      </FieldShell>

      <FieldShell label="كلمة المرور" icon={<LockKeyhole className="size-4" />}>
        <input
          name="password"
          type={showPassword ? "text" : "password"}
          dir="ltr"
          autoComplete="current-password"
          required
          minLength={6}
          placeholder="••••••••"
          className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-950 outline-none placeholder:text-slate-400"
        />
        <button
          type="button"
          onClick={() => setShowPassword((value) => !value)}
          className="grid size-9 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
        >
          {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </FieldShell>

      <div className="flex items-center justify-between gap-4 text-sm">
        <label className="inline-flex items-center gap-2 font-semibold text-slate-600">
          <input
            type="checkbox"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
            className="size-4 rounded border-slate-300 accent-[#FF385C]"
          />
          تذكرني
        </label>
        <Link href="/contact-us" className="font-bold text-[#FF385C] transition hover:text-[#E31C5F]">
          احتاج مساعدة
        </Link>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#1a1f36] px-5 text-sm font-black text-white shadow-lg shadow-slate-950/15 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
        {isPending ? "جاري تسجيل الدخول" : "تسجيل الدخول"}
      </button>
    </form>
  );
}

function FieldShell({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black text-slate-500">{label}</span>
      <span className="flex h-14 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-400 transition focus-within:border-[#FF385C] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#FF385C]/10">
        {icon}
        {children}
      </span>
    </label>
  );
}
