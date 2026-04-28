"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, ToggleLeft, ToggleRight } from "lucide-react";
import { secureFetch } from "@/lib/client-security";

type LastMinuteDealActionsProps = {
  id: number;
  enabled: boolean;
  price: number;
  date: string;
  endsDate?: string;
};

export function LastMinuteDealActions({
  id,
  enabled,
  price,
  date,
  endsDate,
}: LastMinuteDealActionsProps) {
  const router = useRouter();
  const [draftEnabled, setDraftEnabled] = useState(enabled);
  const [draftPrice, setDraftPrice] = useState(String(price || ""));
  const [draftDate, setDraftDate] = useState(date);
  const [draftEndsDate, setDraftEndsDate] = useState(endsDate || "");
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<"idle" | "success" | "error">("idle");
  const [isPending, startTransition] = useTransition();

  async function save() {
    setMessage("");
    setTone("idle");

    const response = await secureFetch(`/api/v1/dashboard/last-minute/homes/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        enabled: draftEnabled,
        price: Number(draftPrice || 0),
        date: draftDate,
        ends_date: draftEndsDate,
      }),
    });

    const result = (await response.json().catch(() => ({}))) as {
      status?: number;
      message?: string;
    };

    if (!response.ok || result.status !== 1) {
      setTone("error");
      setMessage(result.message || "تعذر حفظ الصفقة الآن");
      return;
    }

    setTone("success");
    setMessage("تم حفظ الصفقة وتحديث الواجهة");
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="text-xs font-semibold text-slate-500">سعر الصفقة</span>
          <input
            type="number"
            min="0"
            value={draftPrice}
            onChange={(event) => setDraftPrice(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#FF385C] focus:ring-2 focus:ring-[#FF385C]/20"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-semibold text-slate-500">تاريخ بداية العرض</span>
          <input
            type="date"
            value={draftDate}
            onChange={(event) => setDraftDate(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#FF385C] focus:ring-2 focus:ring-[#FF385C]/20"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-semibold text-slate-500">تاريخ انتهاء العرض</span>
          <input
            type="date"
            min={draftDate || undefined}
            value={draftEndsDate}
            onChange={(event) => setDraftEndsDate(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#FF385C] focus:ring-2 focus:ring-[#FF385C]/20"
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setDraftEnabled((value) => !value)}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
            draftEnabled ? "bg-green-50 text-green-700" : "bg-slate-200 text-slate-600"
          }`}
        >
          {draftEnabled ? <ToggleRight className="size-5" /> : <ToggleLeft className="size-5" />}
          {draftEnabled ? "مفعل في الصفقات السريعة" : "غير مفعل"}
        </button>

        <button
          type="button"
          disabled={isPending}
          onClick={save}
          className="inline-flex items-center gap-2 rounded-full bg-[#FF385C] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#e0314f] disabled:opacity-60"
        >
          <Save className="size-4" />
          حفظ الصفقة
        </button>
      </div>

      {message ? (
        <div
          className={`rounded-xl px-4 py-2 text-sm ${
            tone === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
          }`}
        >
          {message}
        </div>
      ) : null}
    </div>
  );
}
