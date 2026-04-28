"use client";

import { secureFetch } from "@/lib/client-security";
import type { BridgeTranslationResponse } from "@/lib/api";
import {
  AlertTriangle,
  CheckCircle2,
  FileSearch,
  Languages,
  Save,
  Search,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";

function completionColor(percent: number) {
  if (percent >= 80) return "bg-emerald-500";
  if (percent >= 45) return "bg-amber-500";
  return "bg-rose-500";
}

function StatCard({ label, value, hint }: { label: string; value: string | number; hint: string }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <p className="text-xs font-bold text-gray-400">{label}</p>
      <p className="mt-3 text-2xl font-black text-[#1a1f36]">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{hint}</p>
    </div>
  );
}

export function TranslationManager({ payload }: { payload: BridgeTranslationResponse }) {
  const [values, setValues] = useState<Record<string, string>>(payload.translation ?? {});
  const [filter, setFilter] = useState("");
  const [onlyMissing, setOnlyMissing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"save" | "scan" | null>(null);

  const translatedCount = useMemo(
    () => payload.strings.filter((key) => Boolean((values[key] ?? "").trim())).length,
    [payload.strings, values],
  );
  const completion = payload.strings.length ? Math.round((translatedCount / payload.strings.length) * 100) : 0;

  const filtered = useMemo(() => {
    const query = filter.trim().toLowerCase();
    return payload.strings.filter((item) => {
      const translated = (values[item] ?? "").trim();
      const matchesQuery =
        !query || item.toLowerCase().includes(query) || translated.toLowerCase().includes(query);
      const matchesMissing = !onlyMissing || !translated;
      return matchesQuery && matchesMissing;
    });
  }, [filter, onlyMissing, payload.strings, values]);

  async function saveTranslation() {
    setMessage(null);
    setError(null);
    setBusy("save");
    try {
      const response = await secureFetch("/api/v1/dashboard/bridge/dashboard/system-native/translation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lang: payload.lang, values }),
      });
      const result = (await response.json()) as { status?: number; message?: string };
      if (!response.ok || result.status !== 1) {
        setError(result.message || "تعذر حفظ الترجمة.");
        return;
      }
      setMessage(result.message || "تم حفظ الترجمة.");
    } finally {
      setBusy(null);
    }
  }

  async function scanStrings() {
    setMessage(null);
    setError(null);
    setBusy("scan");
    try {
      const response = await secureFetch("/api/v1/dashboard/bridge/dashboard/system-native/translation/scan", {
        method: "POST",
      });
      const result = (await response.json()) as { status?: number; message?: string };
      if (!response.ok || result.status !== 1) {
        setError(result.message || "تعذر فحص النصوص.");
        return;
      }
      setMessage(result.message || "تم فحص مصادر الترجمة.");
    } finally {
      setBusy(null);
    }
  }

  function changeLanguage(nextLang: string) {
    const url = new URL(window.location.href);
    url.searchParams.set("lang", nextLang);
    window.location.href = url.toString();
  }

  function autoFillMissing() {
    const next = { ...values };
    payload.strings.forEach((key) => {
      if (!next[key]) next[key] = key;
    });
    setValues(next);
  }

  return (
    <div className="space-y-6" dir="rtl">
      <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm lg:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#FF385C]/10 px-3 py-1 text-xs font-bold text-[#FF385C]">
              <Languages className="h-4 w-4" />
              محرر الترجمة
            </div>
            <h1 className="mt-4 text-3xl font-black text-[#1a1f36]">إدارة النصوص متعددة اللغات</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-500">
              ابحث، راجع النصوص الناقصة، احفظ الترجمة، وافحص النصوص الجديدة من نفس الواجهة.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void scanStrings()}
              disabled={busy === "scan"}
              className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-5 py-3 text-sm font-bold text-gray-700 transition hover:border-[#1a1f36] disabled:opacity-60"
            >
              <FileSearch className="h-4 w-4" />
              فحص النصوص
            </button>
            <button
              type="button"
              onClick={() => void saveTranslation()}
              disabled={busy === "save"}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#1a1f36] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#2d3458] disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              حفظ الترجمة
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="كل النصوص" value={payload.strings.length} hint="مفتاح ترجمة" />
        <StatCard label="مترجم" value={translatedCount} hint="نص مكتمل" />
        <StatCard label="ناقص" value={Math.max(payload.strings.length - translatedCount, 0)} hint="يحتاج مراجعة" />
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold text-gray-400">نسبة الاكتمال</p>
          <p className="mt-3 text-2xl font-black text-[#1a1f36]">{completion}%</p>
          <div className="mt-3 h-2 rounded-full bg-gray-100">
            <div className={`h-2 rounded-full ${completionColor(completion)}`} style={{ width: `${completion}%` }} />
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[220px_1fr_auto_auto]">
          <select
            value={payload.lang}
            onChange={(event) => changeLanguage(event.target.value)}
            className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[#1a1f36] focus:bg-white"
          >
            {Object.entries(payload.langs).map(([key, lang]) => (
              <option key={key} value={key}>
                {lang.name}
              </option>
            ))}
          </select>
          <label className="relative">
            <Search className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              placeholder="البحث في النص الأصلي أو الترجمة"
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pr-11 pl-4 text-sm outline-none transition focus:border-[#1a1f36] focus:bg-white"
            />
          </label>
          <button
            type="button"
            onClick={() => setOnlyMissing((value) => !value)}
            className={`rounded-2xl px-5 py-3 text-sm font-bold transition ${
              onlyMissing ? "bg-[#FF385C] text-white" : "border border-gray-200 text-gray-700 hover:border-[#1a1f36]"
            }`}
          >
            النصوص الناقصة
          </button>
          <button
            type="button"
            onClick={autoFillMissing}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 px-5 py-3 text-sm font-bold text-gray-700 transition hover:border-[#1a1f36]"
          >
            <Sparkles className="h-4 w-4" />
            تعبئة مبدئية
          </button>
        </div>
      </section>

      {(message || error) && (
        <section
          className={`rounded-2xl border p-4 text-sm font-bold ${
            error ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          <div className="flex items-center gap-2">
            {error ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
            {error || message}
          </div>
        </section>
      )}

      <section className="grid gap-4">
        {filtered.map((key) => {
          const translated = (values[key] ?? "").trim();
          return (
            <article
              key={key}
              className="grid gap-4 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-gray-200 hover:shadow-md lg:grid-cols-[minmax(260px,0.9fr)_minmax(0,1.5fr)]"
            >
              <div className="rounded-2xl bg-gray-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      translated ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {translated ? "مكتمل" : "ناقص"}
                  </span>
                  <span className="text-xs font-bold text-gray-400">النص الأصلي</span>
                </div>
                <p className="mt-4 break-words text-sm leading-7 text-[#1a1f36]">{key}</p>
              </div>
              <label className="block">
                <span className="text-xs font-bold text-gray-500">ترجمة {payload.langs[payload.lang]?.name || payload.lang}</span>
                <textarea
                  rows={4}
                  value={values[key] ?? ""}
                  onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))}
                  className={`mt-2 w-full rounded-2xl border bg-gray-50 px-4 py-4 text-sm leading-7 outline-none transition focus:bg-white ${
                    translated ? "border-emerald-200 focus:border-emerald-400" : "border-gray-200 focus:border-[#1a1f36]"
                  }`}
                />
              </label>
            </article>
          );
        })}
      </section>
    </div>
  );
}
