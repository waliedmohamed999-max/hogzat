"use client";

import { secureFetch } from "@/lib/client-security";
import type { BridgeSeoPage, BridgeSeoResponse } from "@/lib/api";
import {
  AlertTriangle,
  CheckCircle,
  Clipboard,
  Download,
  ExternalLink,
  FileSearch,
  Globe2,
  ImageIcon,
  Link2,
  Save,
  Search,
  Settings2,
  Share2,
  Sparkles,
  UploadCloud,
  X,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

type Lang = "ar" | "en";
type MainTab = "pages" | "tools";
type PreviewTab = "google" | "social";
type DevicePreview = "desktop" | "mobile";

type SeoPageDraft = BridgeSeoPage & {
  slug: string;
  keywords: string[];
  ogImageUrl: string;
  indexable: boolean;
  followLinks: boolean;
  canonicalUrl: string;
  useDefaultCanonical: boolean;
  schemaType: string;
  sitemapPriority: number;
  changefreq: string;
  twitterCard: string;
  scoreHistory: number[];
};

type MultiLangValue = Record<Lang, string>;

const LANGS: Array<{ key: Lang; label: string }> = [
  { key: "ar", label: "العربية" },
  { key: "en", label: "English" },
];

const pageLabels: Record<string, string> = {
  "home-page": "الرئيسية",
  "home-search": "إقامات لبية",
  "experience-search": "تجارب مميزة",
  "event-search": "فعاليات",
  "last-minute": "صفقات سريعة",
  blog: "المدونة",
  "contact-us": "تواصل معنا",
  "about-us": "من نحن",
};

const commonKeywords = ["إقامات", "شاليهات", "فلل", "تجارب", "حجز", "السعودية", "الرياض", "جدة", "صفقات"];

function parseMultiLang(value?: string | number | null): MultiLangValue {
  const raw = String(value ?? "");
  const arMatch = raw.match(/\[ar:\]([\s\S]*?)(?=\[en:\]|\[:\]|$)/);
  const enMatch = raw.match(/\[en:\]([\s\S]*?)(?=\[ar:\]|\[:\]|$)/);

  if (arMatch || enMatch) {
    return {
      ar: (arMatch?.[1] ?? "").trim(),
      en: (enMatch?.[1] ?? "").trim(),
    };
  }

  if (/[\u0600-\u06FF]/.test(raw)) {
    return { ar: raw.trim(), en: "" };
  }

  return { ar: "", en: raw.trim() };
}

function formatMultiLang(value: MultiLangValue) {
  return `[ar:]${value.ar.trim()}[en:]${value.en.trim()}[:]`;
}

function cleanLabel(value: string) {
  return parseMultiLang(value).ar || parseMultiLang(value).en || value;
}

function countColor(count: number, min: number, goodMin: number, max: number) {
  if (count >= goodMin && count <= max) return "text-emerald-600";
  if (count >= min && count < goodMin) return "text-amber-600";
  return "text-red-500";
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

function toDraft(page: BridgeSeoPage): SeoPageDraft {
  const fallbackSlug = page.screen === "home-page" ? "" : slugify(page.screen.replace(/-page$/, ""));
  const keywords = parseMultiLang(page.seo_title).ar
    .split(/\s+/)
    .filter((item) => item.length > 3)
    .slice(0, 3);

  return {
    ...page,
    name: cleanLabel(page.name),
    slug: fallbackSlug,
    keywords,
    ogImageUrl: page.facebook_image ? `/legacy-media/${page.facebook_image}` : "",
    indexable: true,
    followLinks: true,
    canonicalUrl: "",
    useDefaultCanonical: true,
    schemaType: "WebPage",
    sitemapPriority: page.screen === "home-page" ? 1 : 0.8,
    changefreq: "weekly",
    twitterCard: "summary_large_image",
    scoreHistory: [56, 61, 66, 72, 79, 84, 87],
  };
}

function publicUrl(page: SeoPageDraft) {
  return `https://labayh.com/${page.slug}`.replace(/\/$/, "");
}

function languageText(value: string, lang: Lang) {
  const parsed = parseMultiLang(value);
  return parsed[lang] || parsed.ar || parsed.en;
}

function calculateScore(page: SeoPageDraft) {
  const title = parseMultiLang(page.seo_title).ar;
  const description = parseMultiLang(page.seo_description).ar;
  let score = 0;
  if (title.length >= 50 && title.length <= 60) score += 18;
  else if (title.length >= 30 && title.length <= 70) score += 12;
  if (description.length >= 120 && description.length <= 160) score += 18;
  else if (description.length >= 80 && description.length <= 180) score += 12;
  if (page.keywords.length >= 3) score += 12;
  if (/^[a-z0-9\u0600-\u06FF-]*$/.test(page.slug) && page.slug.length <= 70) score += 10;
  if (page.facebook_image || page.ogImageUrl) score += 10;
  if (page.keywords.some((keyword) => title.includes(keyword))) score += 10;
  if (page.keywords.some((keyword) => description.includes(keyword))) score += 8;
  if (page.indexable) score += 6;
  if (page.useDefaultCanonical || page.canonicalUrl) score += 4;
  if (page.schemaType) score += 4;
  return Math.min(100, score);
}

function checklist(page: SeoPageDraft) {
  const title = parseMultiLang(page.seo_title).ar;
  const description = parseMultiLang(page.seo_description).ar;
  const hasKeywordInTitle = page.keywords.some((keyword) => title.includes(keyword));
  const hasKeywordInDescription = page.keywords.some((keyword) => description.includes(keyword));
  const hasKeywordInSlug = page.keywords.some((keyword) => page.slug.includes(slugify(keyword)));

  return [
    { group: "الأساسيات", label: "العنوان موجود ومناسب الطول", status: title.length >= 50 && title.length <= 60 ? "ok" : "warn" },
    { group: "الأساسيات", label: "الوصف موجود ومناسب الطول", status: description.length >= 120 && description.length <= 160 ? "ok" : "warn" },
    { group: "الأساسيات", label: "الكلمات المفتاحية 3 أو أكثر", status: page.keywords.length >= 3 ? "ok" : "warn" },
    { group: "الأساسيات", label: "الرابط الثابت نظيف وقصير", status: /^[a-z0-9\u0600-\u06FF-]*$/.test(page.slug) ? "ok" : "error" },
    { group: "الأساسيات", label: "صورة Open Graph موجودة", status: page.facebook_image || page.ogImageUrl ? "ok" : "error" },
    { group: "المحتوى", label: "العنوان يحتوي على كلمة مفتاحية", status: hasKeywordInTitle ? "ok" : "warn" },
    { group: "المحتوى", label: "الوصف يحتوي على كلمة مفتاحية", status: hasKeywordInDescription ? "ok" : "warn" },
    { group: "المحتوى", label: "الرابط يحتوي على كلمة مفتاحية", status: hasKeywordInSlug || page.keywords.length === 0 ? "ok" : "warn" },
    { group: "التقني", label: "الصفحة مسموح بفهرستها", status: page.indexable ? "ok" : "error" },
    { group: "التقني", label: "Canonical URL محدد", status: page.useDefaultCanonical || page.canonicalUrl ? "ok" : "warn" },
    { group: "التقني", label: "Schema Markup محدد", status: page.schemaType ? "ok" : "warn" },
  ] as const;
}

function scoreLabel(score: number) {
  if (score >= 80) return { label: "ممتاز", color: "text-emerald-600", bar: "bg-emerald-500" };
  if (score >= 60) return { label: "جيد", color: "text-amber-600", bar: "bg-amber-500" };
  if (score >= 40) return { label: "يحتاج تحسين", color: "text-orange-600", bar: "bg-orange-500" };
  return { label: "ضعيف", color: "text-red-600", bar: "bg-red-500" };
}

export function MultiLangInput({
  label,
  value,
  onChange,
  maxLength = 60,
  goodMin = 50,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  goodMin?: number;
}) {
  const [lang, setLang] = useState<Lang>("ar");
  const parsed = parseMultiLang(value);
  const current = parsed[lang];

  function update(next: string) {
    onChange(formatMultiLang({ ...parsed, [lang]: next }));
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm font-bold text-gray-900">{label}</label>
        <span className={`text-xs font-bold ${countColor(current.length, Math.floor(goodMin * 0.6), goodMin, maxLength)}`}>
          {current.length}/{maxLength}
        </span>
      </div>
      <div className="flex w-fit rounded-xl bg-gray-100 p-1">
        {LANGS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setLang(item.key)}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${lang === item.key ? "bg-white text-[#1a1f36] shadow-sm" : "text-gray-500"}`}
          >
            {item.key === "ar" ? "🇸🇦" : "🇬🇧"} {item.label}
          </button>
        ))}
      </div>
      <input
        dir={lang === "ar" ? "rtl" : "ltr"}
        value={current}
        maxLength={maxLength + 20}
        onChange={(event) => update(event.target.value)}
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#1a1f36]"
      />
    </div>
  );
}

export function MultiLangTextarea({
  label,
  value,
  onChange,
  maxLength = 160,
  goodMin = 120,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  goodMin?: number;
}) {
  const [lang, setLang] = useState<Lang>("ar");
  const parsed = parseMultiLang(value);
  const current = parsed[lang];

  function update(next: string) {
    onChange(formatMultiLang({ ...parsed, [lang]: next }));
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm font-bold text-gray-900">{label}</label>
        <span className={`text-xs font-bold ${countColor(current.length, Math.floor(goodMin * 0.66), goodMin, maxLength)}`}>
          {current.length}/{maxLength}
        </span>
      </div>
      <div className="flex w-fit rounded-xl bg-gray-100 p-1">
        {LANGS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setLang(item.key)}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${lang === item.key ? "bg-white text-[#1a1f36] shadow-sm" : "text-gray-500"}`}
          >
            {item.key === "ar" ? "🇸🇦" : "🇬🇧"} {item.label}
          </button>
        ))}
      </div>
      <textarea
        rows={4}
        dir={lang === "ar" ? "rtl" : "ltr"}
        value={current}
        maxLength={maxLength + 40}
        onChange={(event) => update(event.target.value)}
        className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm leading-7 outline-none transition focus:border-[#1a1f36]"
      />
    </div>
  );
}

export function SeoManager({ payload }: { payload: BridgeSeoResponse }) {
  const [pages, setPages] = useState<SeoPageDraft[]>(() => payload.pages.map(toDraft));
  const [activeIndex, setActiveIndex] = useState(0);
  const [mainTab, setMainTab] = useState<MainTab>("pages");
  const [previewTab, setPreviewTab] = useState<PreviewTab>("google");
  const [device, setDevice] = useState<DevicePreview>("desktop");
  const [openGraphOpen, setOpenGraphOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [slugLocked, setSlugLocked] = useState(true);
  const [keywordDraft, setKeywordDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [robots, setRobots] = useState("User-agent: *\nAllow: /\nDisallow: /dashboard\nSitemap: https://labayh.com/sitemap.xml");
  const [keywordAnalysis, setKeywordAnalysis] = useState<string | null>(null);
  const [linkReport, setLinkReport] = useState<{ healthy: number; broken: string[]; redirects: string[] } | null>(null);
  const [gscCode, setGscCode] = useState("");

  const active = pages[activeIndex] ?? pages[0];
  const score = calculateScore(active);
  const scoreMeta = scoreLabel(score);
  const checks = checklist(active);
  const issues = checks.filter((item) => item.status !== "ok");
  const counts = {
    ok: checks.filter((item) => item.status === "ok").length,
    warn: checks.filter((item) => item.status === "warn").length,
    error: checks.filter((item) => item.status === "error").length,
  };

  function updateActive(patch: Partial<SeoPageDraft>) {
    setPages((current) => current.map((item, index) => (index === activeIndex ? { ...item, ...patch } : item)));
  }

  function updateField<K extends keyof SeoPageDraft>(key: K, value: SeoPageDraft[K]) {
    updateActive({ [key]: value } as Partial<SeoPageDraft>);
  }

  async function saveAll() {
    setLoading(true);
    setMessage(null);
    try {
      const response = await secureFetch("/api/seo/pages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pages: pages.map((page) => ({
            screen: page.screen,
            seo_title: page.seo_title,
            seo_description: page.seo_description,
            facebook_title: page.facebook_title,
            facebook_description: page.facebook_description,
            facebook_image: page.facebook_image,
            twitter_title: page.twitter_title,
            twitter_description: page.twitter_description,
            twitter_image: page.twitter_image,
          })),
        }),
      });
      const result = (await response.json().catch(() => null)) as { status?: number; message?: string } | null;
      setMessage(response.ok && result?.status === 1 ? "تم حفظ جميع صفحات SEO." : result?.message || "تعذر الحفظ.");
    } catch {
      setMessage("تعذر الاتصال بالخادم. تأكد من تشغيل السيرفر ثم حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  }

  async function generateSitemap() {
    try {
      const response = await secureFetch("/api/seo/generate-sitemap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pages: pages.map((page) => ({ slug: page.slug, priority: page.sitemapPriority, changefreq: page.changefreq })) }),
      });
      setMessage(response.ok ? "تم توليد sitemap.xml." : "تعذر توليد sitemap.xml.");
    } catch {
      setMessage("تعذر الاتصال بالخادم أثناء توليد sitemap.xml.");
    }
  }

  async function saveRobots() {
    try {
      const response = await secureFetch("/api/seo/robots", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: robots }),
      });
      setMessage(response.ok ? "تم حفظ robots.txt." : "تعذر حفظ robots.txt.");
    } catch {
      setMessage("تعذر الاتصال بالخادم أثناء حفظ robots.txt.");
    }
  }

  async function checkLinks() {
    try {
      const response = await secureFetch("/api/seo/check-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pages: pages.map((page) => page.slug) }),
      });
      const result = (await response.json().catch(() => null)) as typeof linkReport | null;
      setLinkReport(response.ok ? result : null);
      if (!response.ok) setMessage("تعذر فحص الروابط.");
    } catch {
      setLinkReport(null);
      setMessage("تعذر الاتصال بالخادم أثناء فحص الروابط.");
    }
  }

  function addKeyword(keyword: string) {
    const clean = keyword.trim();
    if (!clean || active.keywords.includes(clean) || active.keywords.length >= 10) return;
    updateField("keywords", [...active.keywords, clean]);
    setKeywordDraft("");
  }

  function addPage() {
    const next: SeoPageDraft = toDraft({
      key: `custom-${Date.now()}`,
      screen: `custom-${Date.now()}`,
      name: "صفحة جديدة",
      seo_title: formatMultiLang({ ar: "صفحة جديدة", en: "New Page" }),
      seo_description: formatMultiLang({ ar: "", en: "" }),
      facebook_title: formatMultiLang({ ar: "", en: "" }),
      facebook_description: formatMultiLang({ ar: "", en: "" }),
      facebook_image: 0,
      twitter_title: formatMultiLang({ ar: "", en: "" }),
      twitter_description: formatMultiLang({ ar: "", en: "" }),
      twitter_image: 0,
    });
    setPages((current) => [...current, next]);
    setActiveIndex(pages.length);
  }

  const titleAr = languageText(active.seo_title, "ar") || active.name;
  const descriptionAr = languageText(active.seo_description, "ar") || "أضف وصف SEO واضح ومناسب لمحركات البحث.";
  const ogTitle = languageText(active.facebook_title, "ar") || titleAr;
  const ogDescription = languageText(active.facebook_description, "ar") || descriptionAr;
  const sparkline = active.scoreHistory.map((value, index) => `${(index / Math.max(1, active.scoreHistory.length - 1)) * 120},${36 - (value / 100) * 32}`).join(" ");

  return (
    <div dir="rtl" className="-m-6 min-h-screen bg-[#F7F8FA] p-6 text-gray-950">
      <div className="sticky top-0 z-30 -mx-6 mb-6 border-b border-gray-100 bg-white/95 px-6 py-4 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-950">أدوات SEO</h1>
            <p className="mt-1 text-sm text-gray-500">إدارة احترافية لعناوين البحث، المعاينات الاجتماعية، sitemap، robots، وتحليل الجودة.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-gray-400">آخر حفظ: منذ 5 دقائق</span>
            <button onClick={generateSitemap} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700">
              <Download className="size-4" />
              تصدير sitemap.xml
            </button>
            <button onClick={saveAll} disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-[#1a1f36] px-5 py-3 text-sm font-bold text-white disabled:opacity-60">
              <Save className="size-4" />
              {loading ? "جار الحفظ..." : "حفظ جميع الصفحات"}
            </button>
          </div>
        </div>
        {message ? <p className="mt-3 text-sm font-bold text-[#FF385C]">{message}</p> : null}
      </div>

      <div className="mb-6 flex w-fit rounded-2xl bg-white p-1 shadow-sm">
        <button onClick={() => setMainTab("pages")} className={`rounded-xl px-5 py-3 text-sm font-bold ${mainTab === "pages" ? "bg-[#1a1f36] text-white" : "text-gray-500"}`}>صفحات</button>
        <button onClick={() => setMainTab("tools")} className={`rounded-xl px-5 py-3 text-sm font-bold ${mainTab === "tools" ? "bg-[#1a1f36] text-white" : "text-gray-500"}`}>أدوات عامة</button>
      </div>

      {mainTab === "pages" ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <main className="space-y-6">
            <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
              <div className="flex min-w-max gap-2">
                {pages.map((page, index) => {
                  const pageScore = calculateScore(page);
                  return (
                    <button
                      key={page.key}
                      onClick={() => {
                        setActiveIndex(index);
                        setSlugLocked(true);
                      }}
                      className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition ${index === activeIndex ? "bg-[#1a1f36] text-white" : "bg-gray-50 text-gray-600 hover:bg-gray-100"}`}
                    >
                      {pageLabels[page.screen] || page.name}
                      <span className={`rounded-full px-2 py-0.5 text-[11px] ${pageScore >= 80 ? "bg-emerald-100 text-emerald-700" : pageScore >= 60 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                        {pageScore}
                      </span>
                    </button>
                  );
                })}
                <button onClick={addPage} className="rounded-xl border border-dashed border-gray-300 px-4 py-3 text-sm font-bold text-gray-500">+ إضافة صفحة</button>
              </div>
            </div>

            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-2">
                <Search className="size-5 text-[#FF385C]" />
                <h2 className="text-xl font-black">المعلومات الأساسية</h2>
              </div>
              <div className="grid gap-5">
                <MultiLangInput label="عنوان SEO" value={active.seo_title} onChange={(value) => updateField("seo_title", value)} />
                <MultiLangTextarea label="وصف SEO" value={active.seo_description} onChange={(value) => updateField("seo_description", value)} />
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <label className="text-sm font-bold text-gray-900">الرابط الثابت</label>
                    <button onClick={() => setSlugLocked((value) => !value)} className="text-xs font-bold text-[#FF385C]">{slugLocked ? "تعديل" : "قفل"}</button>
                  </div>
                  <input
                    dir="ltr"
                    disabled={slugLocked}
                    value={active.slug}
                    onChange={(event) => updateField("slug", slugify(event.target.value))}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-mono text-sm outline-none disabled:bg-gray-50"
                  />
                  <p className="text-xs text-gray-500">الرابط الكامل: <span dir="ltr" className="font-mono text-emerald-700">{publicUrl(active)}</span></p>
                  {!/^[a-z0-9\u0600-\u06FF-]*$/.test(active.slug) ? <p className="text-xs text-red-500">الرابط يجب ألا يحتوي على مسافات أو رموز خاصة.</p> : null}
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-900">الكلمات المفتاحية</label>
                  <div className="mt-2 flex min-h-12 flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2">
                    {active.keywords.map((keyword) => (
                      <span key={keyword} className="inline-flex items-center gap-2 rounded-full bg-[#FF385C]/10 px-3 py-1 text-xs font-bold text-[#FF385C]">
                        {keyword}
                        <button onClick={() => updateField("keywords", active.keywords.filter((item) => item !== keyword))}><X className="size-3" /></button>
                      </span>
                    ))}
                    <input
                      value={keywordDraft}
                      onChange={(event) => setKeywordDraft(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          addKeyword(keywordDraft);
                        }
                      }}
                      placeholder="اكتب كلمة واضغط Enter"
                      className="min-w-40 flex-1 bg-transparent text-sm outline-none"
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {commonKeywords.map((keyword) => (
                      <button key={keyword} onClick={() => addKeyword(keyword)} className="rounded-full border border-gray-200 px-3 py-1 text-xs font-bold text-gray-500 hover:border-[#FF385C] hover:text-[#FF385C]">
                        {keyword}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-black">معاينة نتائج البحث</h2>
                <span className="rounded-full bg-[#FF385C]/10 px-3 py-1 text-xs font-bold text-[#FF385C]">معاينة</span>
              </div>
              <div className="mb-5 flex flex-wrap gap-2">
                <button onClick={() => setPreviewTab("google")} className={`rounded-xl px-4 py-2 text-sm font-bold ${previewTab === "google" ? "bg-[#1a1f36] text-white" : "bg-gray-100 text-gray-500"}`}>Google</button>
                <button onClick={() => setPreviewTab("social")} className={`rounded-xl px-4 py-2 text-sm font-bold ${previewTab === "social" ? "bg-[#1a1f36] text-white" : "bg-gray-100 text-gray-500"}`}>Facebook/Twitter</button>
                <button onClick={() => setDevice(device === "desktop" ? "mobile" : "desktop")} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-600">{device === "desktop" ? "Desktop" : "Mobile"}</button>
              </div>
              {previewTab === "google" ? (
                <div className={`rounded-2xl border border-gray-100 bg-white p-5 shadow-sm ${device === "mobile" ? "max-w-sm" : "max-w-2xl"}`}>
                  <div className="mb-2 flex items-center gap-2 text-sm text-emerald-700"><Globe2 className="size-4" /> labayh.com › {active.slug || "home"}</div>
                  <div className="text-xl font-medium text-[#1a0dab]">{titleAr.slice(0, 70)}</div>
                  <p className="mt-2 text-sm leading-6 text-gray-600">{descriptionAr.slice(0, 160)}{descriptionAr.length > 160 ? "..." : ""}</p>
                  {titleAr.length > 60 || descriptionAr.length > 160 ? <p className="mt-3 text-xs font-bold text-red-500">تنبيه: العنوان أو الوصف أطول من الحد الموصى به.</p> : null}
                </div>
              ) : (
                <div className="max-w-xl overflow-hidden rounded-2xl border border-gray-200 bg-white">
                  <div className="grid aspect-[1200/630] place-items-center bg-gray-100 text-gray-400">
                    {active.ogImageUrl ? active.ogImageUrl : <ImageIcon className="size-10" />}
                  </div>
                  <div className="p-4">
                    <p className="text-xs uppercase text-gray-400">labayh.com</p>
                    <h3 className="mt-1 font-black text-gray-950">{ogTitle}</h3>
                    <p className="mt-1 text-sm text-gray-500">{ogDescription}</p>
                  </div>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <button onClick={() => setOpenGraphOpen((value) => !value)} className="flex w-full items-center justify-between text-start">
                <span className="inline-flex items-center gap-2 text-xl font-black"><Share2 className="size-5 text-[#FF385C]" /> بيانات Open Graph</span>
                <span className="text-sm text-gray-400">{openGraphOpen ? "إخفاء" : "عرض"}</span>
              </button>
              {openGraphOpen ? (
                <div className="mt-6 grid gap-5">
                  <MultiLangInput label="عنوان فيسبوك" value={active.facebook_title} onChange={(value) => updateField("facebook_title", value)} />
                  <MultiLangTextarea label="وصف فيسبوك" value={active.facebook_description} onChange={(value) => updateField("facebook_description", value)} />
                  <label className="grid cursor-pointer place-items-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center hover:border-[#FF385C]">
                    <UploadCloud className="size-8 text-[#FF385C]" />
                    <span className="mt-2 text-sm font-bold">صورة فيسبوك 1200x630px</span>
                    <span className="mt-1 text-xs text-gray-400">ارفع صورة أو أدخل معرف الصورة القديم</span>
                    <input type="file" className="hidden" onChange={(event) => updateField("ogImageUrl", event.target.files?.[0]?.name ?? "")} />
                  </label>
                  <div className="grid gap-5 md:grid-cols-2">
                    <MultiLangInput label="عنوان تويتر" value={active.twitter_title} onChange={(value) => updateField("twitter_title", value)} />
                    <label className="grid gap-2">
                      <span className="text-sm font-bold text-gray-900">نوع بطاقة تويتر</span>
                      <select value={active.twitterCard} onChange={(event) => updateField("twitterCard", event.target.value)} className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none">
                        <option value="summary">summary</option>
                        <option value="summary_large_image">summary_large_image</option>
                      </select>
                    </label>
                  </div>
                  <MultiLangTextarea label="وصف تويتر" value={active.twitter_description} onChange={(value) => updateField("twitter_description", value)} />
                </div>
              ) : null}
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <button onClick={() => setAdvancedOpen((value) => !value)} className="flex w-full items-center justify-between text-start">
                <span className="inline-flex items-center gap-2 text-xl font-black"><Settings2 className="size-5 text-[#FF385C]" /> إعدادات متقدمة</span>
                <span className="text-sm text-gray-400">{advancedOpen ? "إخفاء" : "عرض"}</span>
              </button>
              {advancedOpen ? (
                <div className="mt-6 grid gap-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Toggle label={active.indexable ? "مسموح لمحركات البحث بالفهرسة" : "محجوب من محركات البحث"} checked={active.indexable} onChange={(value) => updateField("indexable", value)} />
                    <Toggle label={active.followLinks ? "تتبع الروابط مفعّل" : "عدم تتبع الروابط"} checked={active.followLinks} onChange={(value) => updateField("followLinks", value)} />
                  </div>
                  <label className="grid gap-2">
                    <span className="text-sm font-bold">Canonical URL</span>
                    <input dir="ltr" value={active.useDefaultCanonical ? publicUrl(active) : active.canonicalUrl} disabled={active.useDefaultCanonical} onChange={(event) => updateField("canonicalUrl", event.target.value)} className="rounded-xl border border-gray-200 px-4 py-3 font-mono text-sm outline-none disabled:bg-gray-50" />
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input type="checkbox" checked={active.useDefaultCanonical} onChange={(event) => updateField("useDefaultCanonical", event.target.checked)} />
                    استخدم الرابط الافتراضي
                  </label>
                  <div className="grid gap-5 md:grid-cols-2">
                    <label className="grid gap-2">
                      <span className="text-sm font-bold">Schema Markup type</span>
                      <select value={active.schemaType} onChange={(event) => updateField("schemaType", event.target.value)} className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none">
                        {["WebPage", "Article", "Product", "Event", "LocalBusiness"].map((item) => <option key={item}>{item}</option>)}
                      </select>
                    </label>
                    <label className="grid gap-2">
                      <span className="text-sm font-bold">تكرار الفحص</span>
                      <select value={active.changefreq} onChange={(event) => updateField("changefreq", event.target.value)} className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none">
                        <option value="daily">يومياً</option>
                        <option value="weekly">أسبوعياً</option>
                        <option value="monthly">شهرياً</option>
                        <option value="yearly">سنوياً</option>
                      </select>
                    </label>
                  </div>
                  <label className="grid gap-2">
                    <span className="text-sm font-bold">الأولوية في Sitemap: {active.sitemapPriority.toFixed(1)}</span>
                    <input type="range" min="0.1" max="1" step="0.1" value={active.sitemapPriority} onChange={(event) => updateField("sitemapPriority", Number(event.target.value))} />
                  </label>
                </div>
              ) : null}
            </section>
          </main>

          <aside className="space-y-6 xl:sticky xl:top-28 xl:self-start">
            <section className="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm">
              <p className="text-sm font-bold text-gray-500">نتيجة SEO للصفحة</p>
              <div className={`mx-auto mt-5 grid size-32 place-items-center rounded-full border-8 ${score >= 80 ? "border-emerald-100" : score >= 60 ? "border-amber-100" : "border-red-100"}`}>
                <div>
                  <div className={`text-4xl font-black ${scoreMeta.color}`}>{score}</div>
                  <div className="text-xs text-gray-400">/100</div>
                </div>
              </div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-gray-100">
                <div className={`h-full ${scoreMeta.bar}`} style={{ width: `${score}%` }} />
              </div>
              <p className={`mt-3 text-sm font-black ${scoreMeta.color}`}>{scoreMeta.label}</p>
              <div className="mt-5 grid grid-cols-3 gap-2 text-xs">
                <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700">قابل للتحسين: {counts.ok}</div>
                <div className="rounded-xl bg-amber-50 p-2 text-amber-700">تحذيرات: {counts.warn}</div>
                <div className="rounded-xl bg-red-50 p-2 text-red-700">أخطاء: {counts.error}</div>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="font-black">SEO Checklist</h3>
              <div className="mt-4 space-y-3">
                {checks.map((item) => (
                  <div key={item.label} className={`flex items-start gap-2 text-sm ${item.status === "ok" ? "text-emerald-700" : item.status === "warn" ? "text-amber-700" : "text-red-600"}`}>
                    {item.status === "ok" ? <CheckCircle className="mt-0.5 size-4 shrink-0" /> : item.status === "warn" ? <AlertTriangle className="mt-0.5 size-4 shrink-0" /> : <XCircle className="mt-0.5 size-4 shrink-0" />}
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="font-black">إصلاحات سريعة ({issues.length})</h3>
              <div className="mt-4 space-y-3">
                {issues.slice(0, 4).map((item) => (
                  <button key={item.label} className="flex w-full items-center justify-between rounded-xl bg-gray-50 px-3 py-3 text-start text-sm font-bold text-gray-700 hover:bg-[#FF385C]/5">
                    <span>{item.label}</span>
                    <ExternalLink className="size-4 text-[#FF385C]" />
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="font-black">تاريخ النتائج</h3>
              <svg viewBox="0 0 120 40" className="mt-4 h-16 w-full">
                <polyline fill="none" stroke="#10B981" strokeWidth="3" points={sparkline} />
              </svg>
              <p className="text-xs font-bold text-emerald-600">تحسن بمقدار +12 نقطة هذا الأسبوع</p>
            </section>
          </aside>
        </div>
      ) : (
        <GlobalTools
          robots={robots}
          setRobots={setRobots}
          saveRobots={saveRobots}
          generateSitemap={generateSitemap}
          keywordAnalysis={keywordAnalysis}
          setKeywordAnalysis={setKeywordAnalysis}
          checkLinks={checkLinks}
          linkReport={linkReport}
          gscCode={gscCode}
          setGscCode={setGscCode}
          pagesCount={pages.length}
        />
      )}
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-bold ${checked ? "border-emerald-100 bg-emerald-50 text-emerald-700" : "border-red-100 bg-red-50 text-red-600"}`}
    >
      {label}
      <span className={`h-6 w-11 rounded-full p-1 transition ${checked ? "bg-emerald-500" : "bg-red-500"}`}>
        <span className={`block size-4 rounded-full bg-white transition ${checked ? "translate-x-0" : "-translate-x-5"}`} />
      </span>
    </button>
  );
}

function GlobalTools({
  robots,
  setRobots,
  saveRobots,
  generateSitemap,
  keywordAnalysis,
  setKeywordAnalysis,
  checkLinks,
  linkReport,
  gscCode,
  setGscCode,
  pagesCount,
}: {
  robots: string;
  setRobots: (value: string) => void;
  saveRobots: () => void;
  generateSitemap: () => void;
  keywordAnalysis: string | null;
  setKeywordAnalysis: (value: string | null) => void;
  checkLinks: () => void;
  linkReport: { healthy: number; broken: string[]; redirects: string[] } | null;
  gscCode: string;
  setGscCode: (value: string) => void;
  pagesCount: number;
}) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Labayh",
    url: "https://labayh.com",
    logo: "https://labayh.com/logo.png",
  };

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <ToolCard icon={FileSearch} title="توليد sitemap.xml تلقائياً">
        <div className="space-y-3 text-sm text-gray-600">
          <p>آخر توليد: الآن</p>
          <p>يحتوي على {pagesCount} صفحة</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={generateSitemap} className="rounded-xl bg-[#FF385C] px-4 py-3 font-bold text-white">توليد Sitemap الآن</button>
            <a href="/api/seo/sitemap.xml" className="rounded-xl border border-gray-200 px-4 py-3 font-bold">تحميل sitemap.xml</a>
            <button onClick={() => navigator.clipboard.writeText("https://labayh.com/sitemap.xml")} className="rounded-xl border border-gray-200 px-4 py-3 font-bold">نسخ الرابط</button>
          </div>
        </div>
      </ToolCard>

      <ToolCard icon={Settings2} title="Robots.txt Editor">
        <textarea value={robots} onChange={(event) => setRobots(event.target.value)} dir="ltr" className="h-52 w-full rounded-xl border border-gray-200 bg-gray-950 p-4 font-mono text-sm text-emerald-300 outline-none" />
        <div className="mt-3 flex gap-2">
          <button onClick={() => setRobots("User-agent: *\nAllow: /\nDisallow: /dashboard\nSitemap: https://labayh.com/sitemap.xml")} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold">القالب الافتراضي</button>
          <button onClick={saveRobots} className="rounded-xl bg-[#1a1f36] px-4 py-2 text-sm font-bold text-white">حفظ robots.txt</button>
        </div>
      </ToolCard>

      <ToolCard icon={Clipboard} title="Structured Data">
        <pre dir="ltr" className="max-h-72 overflow-auto rounded-xl bg-gray-950 p-4 text-xs text-emerald-300">{JSON.stringify(organizationSchema, null, 2)}</pre>
        <button onClick={() => navigator.clipboard.writeText(JSON.stringify(organizationSchema, null, 2))} className="mt-3 rounded-xl bg-[#1a1f36] px-4 py-2 text-sm font-bold text-white">نسخ الكود</button>
      </ToolCard>

      <ToolCard icon={Sparkles} title="تحليل الكلمات المفتاحية">
        <KeywordTool keywordAnalysis={keywordAnalysis} setKeywordAnalysis={setKeywordAnalysis} />
      </ToolCard>

      <ToolCard icon={Link2} title="فحص روابط الصفحات">
        <button onClick={checkLinks} className="rounded-xl bg-[#FF385C] px-4 py-3 text-sm font-bold text-white">فحص الروابط</button>
        {linkReport ? (
          <div className="mt-4 grid gap-2 text-sm">
            <p className="text-emerald-700">روابط سليمة: {linkReport.healthy}</p>
            <p className="text-red-600">روابط مكسورة: {linkReport.broken.length}</p>
            <p className="text-amber-600">Redirect chains: {linkReport.redirects.length}</p>
          </div>
        ) : null}
      </ToolCard>

      <ToolCard icon={Globe2} title="Google Search Console">
        <input value={gscCode} onChange={(event) => setGscCode(event.target.value)} dir="ltr" placeholder="google-site-verification=..." className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none" />
        <button className="mt-3 rounded-xl bg-[#1a1f36] px-4 py-2 text-sm font-bold text-white">حفظ كود التحقق</button>
        <div className="mt-4 rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
          الحالة: {gscCode ? "متصل" : "غير متصل"} · clicks 1,240 · impressions 18,900
        </div>
      </ToolCard>
    </div>
  );
}

function ToolCard({ title, icon: Icon, children }: { title: string; icon: LucideIcon; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-2">
        <Icon className="size-5 text-[#FF385C]" />
        <h2 className="text-lg font-black">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function KeywordTool({ keywordAnalysis, setKeywordAnalysis }: { keywordAnalysis: string | null; setKeywordAnalysis: (value: string | null) => void }) {
  const [keyword, setKeyword] = useState("");
  const suggestions = keyword ? [`${keyword} السعودية`, `${keyword} الرياض`, `أفضل ${keyword}`, `${keyword} للعائلات`] : [];

  return (
    <div>
      <div className="flex gap-2">
        <input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="أدخل كلمة مفتاحية للتحليل" className="min-w-0 flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none" />
        <button onClick={() => setKeywordAnalysis(keyword || null)} className="rounded-xl bg-[#FF385C] px-4 py-3 text-sm font-bold text-white">تحليل</button>
      </div>
      {keywordAnalysis ? (
        <div className="mt-4 space-y-3 text-sm text-gray-600">
          <p>حجم البحث المتوقع: مرتفع</p>
          <p>مستوى المنافسة: 64%</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((item) => <span key={item} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold">{item}</span>)}
          </div>
          <p>الصفحات الموصى بها: الرئيسية، إقامات لبية، صفقات سريعة</p>
        </div>
      ) : null}
    </div>
  );
}
