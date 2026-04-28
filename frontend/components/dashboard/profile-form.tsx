"use client";

import { secureFetch } from "@/lib/client-security";

import type { FormEvent } from "react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { BridgeProfile } from "@/lib/api";

type ProfileFormProps = {
  profile: BridgeProfile;
};

export function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      first_name: String(formData.get("first_name") || ""),
      last_name: String(formData.get("last_name") || ""),
      email: String(formData.get("email") || ""),
      location: String(formData.get("location") || ""),
      address: String(formData.get("address") || ""),
      description: String(formData.get("description") || ""),
      trade_name: String(formData.get("trade_name") || ""),
    };

    const response = await secureFetch("/api/v1/profile", {
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
      setError(result.message || "تعذر تحديث الملف الشخصي حالياً.");
      return;
    }

    setMessage(result.message || "تم تحديث البيانات بنجاح.");
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.18)]"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            الاسم الأول
          </label>
          <input
            name="first_name"
            defaultValue={profile.first_name}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-rose-300 focus:bg-white"
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            اسم العائلة
          </label>
          <input
            name="last_name"
            defaultValue={profile.last_name}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-rose-300 focus:bg-white"
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            البريد الإلكتروني
          </label>
          <input
            type="email"
            name="email"
            defaultValue={profile.email}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-rose-300 focus:bg-white"
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            رقم الجوال
          </label>
          <input
            value={profile.mobile}
            readOnly
            className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500 outline-none"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            الموقع
          </label>
          <input
            name="location"
            defaultValue={profile.location}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-rose-300 focus:bg-white"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            الاسم التجاري
          </label>
          <input
            name="trade_name"
            defaultValue={profile.trade_name}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-rose-300 focus:bg-white"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="mb-2 block text-sm font-medium text-slate-700">
          العنوان
        </label>
        <input
          name="address"
          defaultValue={profile.address}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-rose-300 focus:bg-white"
        />
      </div>

      <div className="mt-4">
        <label className="mb-2 block text-sm font-medium text-slate-700">
          نبذة مختصرة
        </label>
        <textarea
          name="description"
          defaultValue={profile.description}
          rows={5}
          className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-rose-300 focus:bg-white"
        />
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
          className="rounded-2xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? "جارٍ الحفظ..." : "حفظ التغييرات"}
        </button>
      </div>
    </form>
  );
}
