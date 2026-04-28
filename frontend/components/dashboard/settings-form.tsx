"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  ExternalLink,
  Facebook,
  GripVertical,
  Instagram,
  MapPin,
  Plus,
  Save,
  Share2,
  Trash2,
  UploadCloud,
} from "lucide-react";
import type { BridgeSystemSettings } from "@/lib/api";
import { resolveBrand } from "@/lib/brand";
import { secureFetch } from "@/lib/client-security";

type SettingKey = keyof BridgeSystemSettings;
type Lang = "ar" | "en";
type LangValue = Record<Lang, string>;

type City = {
  id: string;
  nameAr: string;
  nameEn: string;
  country: string;
  image: string;
  listings: number;
  active: boolean;
  featured: boolean;
};

type FooterLink = {
  id: string;
  label: LangValue;
  url: string;
};

const sectionNav = [
  ["identity", "🏷️", "هوية الموقع واللوجو"],
  ["appearance", "🎨", "الألوان والمظهر"],
  ["content", "📝", "المحتوى العام"],
  ["contact", "📞", "معلومات التواصل"],
  ["social", "🌐", "الشبكات الاجتماعية"],
  ["footer", "🦶", "الفوتر"],
  ["cities", "🗺️", "المدن والمواقع"],
  ["technical", "⚙️", "الإعدادات التقنية"],
  ["analytics", "📊", "التحليلات والتتبع"],
] as const;

const defaultColors = {
  primary: "#FF385C",
  dark: "#1a1f36",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  background: "#F7F8FA",
  border: "#E5E7EB",
};

const initialCities: City[] = [
  { id: "riyadh", nameAr: "الرياض", nameEn: "Riyadh", country: "السعودية", image: "", listings: 128, active: true, featured: true },
  { id: "jeddah", nameAr: "جدة", nameEn: "Jeddah", country: "السعودية", image: "", listings: 96, active: true, featured: true },
  { id: "makkah", nameAr: "مكة", nameEn: "Makkah", country: "السعودية", image: "", listings: 74, active: true, featured: false },
];

function parseMultiLang(value?: string): LangValue {
  const text = value ?? "";
  const arMatch = text.match(/\[ar:\]([\s\S]*?)(?=\[en:\]|\[:\]|$)/);
  const enMatch = text.match(/\[en:\]([\s\S]*?)(?=\[:\]|$)/);
  if (arMatch || enMatch) return { ar: arMatch?.[1] ?? "", en: enMatch?.[1] ?? "" };
  return { ar: text, en: "" };
}

function formatMultiLang(value: LangValue) {
  return `[ar:]${value.ar}[en:]${value.en}[:]`;
}

function asString(value: BridgeSystemSettings[SettingKey]) {
  return value == null ? "" : String(value);
}

function isValidUrl(value: string) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function Card({ id, title, children, actions }: { id: string; title: string; children: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-36 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-5">
        <h2 className="text-xl font-black text-[#1a1f36]">{title}</h2>
        {actions}
      </div>
      {children}
    </section>
  );
}

function TextField({
  label,
  value,
  onChange,
  dir,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  dir?: "rtl" | "ltr";
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-bold text-gray-900">{label}</span>
      <input
        type={type}
        dir={dir}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[#1a1f36] focus:bg-white"
      />
    </label>
  );
}

function MultiLangTextarea({ label, value, onChange, max }: { label: string; value: string; onChange: (value: string) => void; max?: number }) {
  const [active, setActive] = useState<Lang>("ar");
  const parsed = parseMultiLang(value);
  const current = parsed[active];

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-bold text-gray-900">{label}</span>
        {max ? <span className="text-xs text-gray-400">{current.length}/{max}</span> : null}
      </div>
      <div className="flex w-fit rounded-xl bg-gray-100 p-1">
        {(["ar", "en"] as Lang[]).map((lang) => (
          <button key={lang} type="button" onClick={() => setActive(lang)} className={`rounded-lg px-3 py-1.5 text-xs font-bold ${active === lang ? "bg-white text-[#1a1f36] shadow-sm" : "text-gray-500"}`}>
            {lang === "ar" ? "🇸🇦 العربية" : "🇬🇧 English"}
          </button>
        ))}
      </div>
      <textarea
        dir={active === "ar" ? "rtl" : "ltr"}
        value={current}
        maxLength={max}
        onChange={(event) => onChange(formatMultiLang({ ...parsed, [active]: event.target.value }))}
        className="min-h-28 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[#1a1f36] focus:bg-white"
      />
    </div>
  );
}

function MultiLangInput({ label, value, onChange }: { label: string; value: LangValue; onChange: (value: LangValue) => void }) {
  const [active, setActive] = useState<Lang>("ar");
  return (
    <div className="grid gap-2">
      <span className="text-sm font-bold text-gray-900">{label}</span>
      <div className="flex w-fit rounded-xl bg-gray-100 p-1">
        {(["ar", "en"] as Lang[]).map((lang) => (
          <button key={lang} type="button" onClick={() => setActive(lang)} className={`rounded-lg px-3 py-1.5 text-xs font-bold ${active === lang ? "bg-white text-[#1a1f36] shadow-sm" : "text-gray-500"}`}>
            {lang === "ar" ? "🇸🇦 العربية" : "🇬🇧 English"}
          </button>
        ))}
      </div>
      <input
        dir={active === "ar" ? "rtl" : "ltr"}
        value={value[active]}
        onChange={(event) => onChange({ ...value, [active]: event.target.value })}
        className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[#1a1f36] focus:bg-white"
      />
    </div>
  );
}

function UploadZone({ title, hint, value, onChange }: { title: string; hint: string; value?: string; onChange: (value: string) => void }) {
  function handleFile(file?: File) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    onChange(url);
  }

  return (
    <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-6 text-center transition hover:border-[#1a1f36] hover:bg-white">
      <p className="font-black text-[#1a1f36]">{title}</p>
      <div className="mt-4 flex min-h-32 items-center justify-center rounded-xl bg-white">
        {value ? (
          <Image src={value} alt={title} width={180} height={90} className="max-h-24 w-auto object-contain" unoptimized />
        ) : (
          <UploadCloud className="h-8 w-8 text-gray-300" />
        )}
      </div>
      <p className="mt-3 text-xs text-gray-400">{hint}</p>
      <div className="mt-4 flex justify-center gap-2">
        <label className="cursor-pointer rounded-xl bg-[#1a1f36] px-4 py-2 text-xs font-bold text-white">
          رفع
          <input type="file" className="hidden" accept="image/*,.svg,.ico" onChange={(event) => handleFile(event.target.files?.[0])} />
        </label>
        <button type="button" onClick={() => onChange("")} className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600">حذف</button>
      </div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className={`relative h-7 w-12 rounded-full transition ${checked ? "bg-[#1a1f36]" : "bg-gray-200"}`}>
      <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${checked ? "right-6" : "right-1"}`} />
    </button>
  );
}

function ColorControl({ label, value, onChange, hint }: { label: string; value: string; onChange: (value: string) => void; hint: string }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-black">{label}</p>
          <p className="mt-1 text-xs text-gray-500">{hint}</p>
        </div>
        <input type="color" value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-16 rounded-lg border border-gray-200 bg-white p-1" />
      </div>
      <input dir="ltr" value={value} onChange={(event) => onChange(event.target.value)} className="mt-3 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 font-mono text-sm outline-none" />
      <button type="button" onClick={() => onChange(defaultColors.primary)} className="mt-2 text-xs font-bold text-[#FF385C]">استعادة الافتراضي</button>
    </div>
  );
}

export function SettingsForm({ initialData }: { initialData: BridgeSystemSettings }) {
  const [form, setForm] = useState<BridgeSystemSettings>(initialData);
  const [colors, setColors] = useState(defaultColors);
  const [theme, setTheme] = useState("light");
  const [headingFont, setHeadingFont] = useState("Cairo");
  const [bodyFont, setBodyFont] = useState("Cairo");
  const [baseFontSize, setBaseFontSize] = useState("16px");
  const [keywords, setKeywords] = useState(["إقامات", "تجارب", "فعاليات"]);
  const [keywordDraft, setKeywordDraft] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [socials, setSocials] = useState<Record<string, string>>({
    Facebook: "",
    Instagram: "",
    "Twitter/X": "",
    LinkedIn: "",
    YouTube: "",
    TikTok: "",
    Snapchat: "",
    WhatsApp: "",
  });
  const [cities, setCities] = useState<City[]>(initialCities);
  const [cityModal, setCityModal] = useState<City | null>(null);
  const [footerLinks, setFooterLinks] = useState<FooterLink[]>([
    { id: "privacy", label: { ar: "سياسة الخصوصية", en: "Privacy Policy" }, url: "/privacy" },
    { id: "terms", label: { ar: "شروط الاستخدام", en: "Terms" }, url: "/terms" },
  ]);
  const [footerColumnTitle, setFooterColumnTitle] = useState<LangValue>({ ar: "روابط مهمة", en: "Important Links" });
  const [analytics, setAnalytics] = useState<Record<string, { id: string; enabled: boolean }>>({
    "Google Analytics 4": { id: "", enabled: false },
    "Google Search Console": { id: "", enabled: false },
    "Facebook Pixel": { id: "", enabled: false },
    "Twitter/X Pixel": { id: "", enabled: false },
    "Snapchat Pixel": { id: "", enabled: false },
    "TikTok Pixel": { id: "", enabled: false },
    Hotjar: { id: "", enabled: false },
    "Google Tag Manager": { id: "", enabled: false },
  });
  const [technical, setTechnical] = useState({
    domain: "https://labayh.com",
    smtpProvider: "SMTP",
    smtpHost: "",
    smtpPort: "587",
    smtpUser: "",
    smtpPassword: "",
    fromName: "Labayh",
    fromEmail: "",
    storageProvider: "Local",
    uploadMaxSize: "5MB",
    uploadExtensions: ["jpg", "png", "webp", "pdf"],
    maxImages: "20",
  });

  const brand = resolveBrand(form);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setToast("تم حفظ مسودة تلقائية");
      window.setTimeout(() => setToast(null), 1800);
    }, 60000);
    return () => window.clearInterval(timer);
  }, []);

  function updateField(key: SettingKey, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function saveLegacySettings() {
    const response = await secureFetch("/api/v1/dashboard/bridge/dashboard/system-native/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const result = (await response.json().catch(() => null)) as { status?: number; message?: string } | null;
    if (!response.ok || result?.status !== 1) throw new Error(result?.message || "تعذر حفظ الإعدادات");
  }

  async function saveSection(endpoint: string, payload: unknown) {
    const response = await secureFetch(endpoint, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("Save failed");
  }

  async function saveAll() {
    setSaving(true);
    try {
      await saveLegacySettings();
      await Promise.all([
        saveSection("/api/settings/colors", { colors, theme, headingFont, bodyFont, baseFontSize }),
        saveSection("/api/settings/content", { keywords }),
        saveSection("/api/settings/social", { socials }),
        saveSection("/api/settings/footer", { footerLinks, footerColumnTitle }),
        saveSection("/api/settings/analytics", { analytics }),
        saveSection("/api/settings/technical", { technical }),
      ]);
      setToast("تم حفظ جميع التغييرات ✅");
    } catch (error) {
      setToast(error instanceof Error ? error.message : "تعذر الحفظ");
    } finally {
      setSaving(false);
      window.setTimeout(() => setToast(null), 2500);
    }
  }

  async function saveLegacyOnly(label: string) {
    setSaving(true);
    try {
      await saveLegacySettings();
      setToast(`تم حفظ ${label} ✅`);
    } catch {
      setToast("تعذر الحفظ");
    } finally {
      setSaving(false);
      window.setTimeout(() => setToast(null), 2200);
    }
  }

  function addKeyword(value: string) {
    const clean = value.trim().replace(/,$/, "");
    if (!clean || keywords.includes(clean)) return;
    setKeywords((current) => [...current, clean]);
    setKeywordDraft("");
  }

  const previewTitle = asString(form.site_title) || brand.nameAr;
  const previewDescription = asString(form.public_hero_subtitle) || asString(form.site_description) || brand.descriptionAr;
  const logoUrl = asString(form.brand_logo_url) || brand.logoUrl;
  const shortLogoUrl = asString(form.brand_logo_short_url) || brand.logoShortUrl;

  return (
    <div dir="rtl" className="min-h-screen bg-[#F7F8FA] text-[#1a1f36]">
      {toast ? <div className="fixed left-6 top-6 z-50 rounded-xl bg-[#1a1f36] px-4 py-3 text-sm font-black text-white shadow-lg">{toast}</div> : null}

      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 px-4 py-5 backdrop-blur md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black">إعدادات الواجهة العامة</h1>
            <p className="mt-1 text-sm text-gray-500">تحكم كامل في هوية الموقع، المحتوى، والإعدادات العامة</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold text-gray-400">آخر حفظ: منذ 5 دقائق</span>
            <a href="/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700">
              معاينة الموقع <ExternalLink className="h-4 w-4" />
            </a>
            <button type="button" onClick={saveAll} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-[#FF385C] px-5 py-3 text-sm font-black text-white disabled:opacity-60">
              <Save className="h-4 w-4" />
              {saving ? "جارٍ الحفظ..." : "حفظ جميع التغييرات"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <section className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <span className="font-mono text-xs font-black text-[#FF385C]">PREVIEW</span>
            <span className="text-sm font-black">إعدادات الواجهة</span>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <div className="flex items-center gap-4">
              <LogoBox logoUrl={logoUrl || shortLogoUrl} label={previewTitle} />
              <div>
                <p className="font-mono text-xs tracking-[0.28em] text-[#FF385C]">{asString(form.brand_name_en) || "LABAYH"}</p>
                <h2 className="text-2xl font-black">{previewTitle}</h2>
              </div>
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-600">{previewDescription}</p>
            <div className="mt-5 border-t border-gray-200 pt-4">
              <div className="flex flex-wrap gap-3 text-sm font-bold">
                <span className="inline-flex items-center gap-2">اللون الرئيسي <span className="h-5 w-12 rounded" style={{ backgroundColor: colors.primary }} /></span>
                <span className="inline-flex items-center gap-2">اللون الثانوي <span className="h-5 w-12 rounded" style={{ backgroundColor: colors.dark }} /></span>
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-400">Updates live as admin changes settings below</p>
        </section>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="order-2 lg:order-1">
            <nav className="sticky top-36 space-y-2 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
              {sectionNav.map(([id, icon, label]) => (
                <a key={id} href={`#${id}`} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-gray-600 transition hover:bg-gray-50 hover:text-[#1a1f36]">
                  <span>{icon}</span>
                  {label}
                </a>
              ))}
            </nav>
          </aside>

          <div className="order-1 space-y-6 lg:order-2">
            <Card id="identity" title="هوية الموقع واللوجو" actions={<SectionSave onClick={() => void saveLegacyOnly("هوية الموقع")} />}>
              <div className="grid gap-4 md:grid-cols-2">
                <TextField label="عنوان الموقع" value={asString(form.site_title)} onChange={(value) => updateField("site_title", value)} />
                <TextField label="اسم البراند بالإنجليزي" dir="ltr" value={asString(form.brand_name_en)} onChange={(value) => updateField("brand_name_en", value)} />
                <TextField label="اسم البراند بالعربي" value={asString(form.brand_name_ar)} onChange={(value) => updateField("brand_name_ar", value)} />
                <label className="grid gap-2">
                  <span className="text-sm font-bold">لغة الموقع الافتراضية</span>
                  <select value={asString(form.site_language) || "ar"} onChange={(event) => updateField("site_language", event.target.value)} className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none">
                    <option value="ar">العربية (ar)</option>
                    <option value="en">English (en)</option>
                    <option value="both">كلاهما</option>
                  </select>
                </label>
                <UploadZone title="اللوجو الرئيسي" hint="PNG/SVG - max 2MB" value={logoUrl} onChange={(value) => updateField("brand_logo_url", value)} />
                <UploadZone title="اللوجو المختصر (Favicon)" hint="ICO/PNG 32×32" value={shortLogoUrl} onChange={(value) => updateField("brand_logo_short_url", value)} />
                <UploadZone title="اللوجو على الخلفية الفاتحة" hint="Light logo variant" value={asString(form.dashboard_logo)} onChange={(value) => updateField("dashboard_logo", value)} />
                <UploadZone title="اللوجو على الخلفية الداكنة" hint="Dark logo variant" value={asString(form.dashboard_logo_short)} onChange={(value) => updateField("dashboard_logo_short", value)} />
              </div>
            </Card>

            <Card id="appearance" title="الألوان والمظهر" actions={<SectionSave onClick={() => void saveSection("/api/settings/colors", { colors, theme, headingFont, bodyFont, baseFontSize }).then(() => setToast("تم حفظ الألوان ✅"))} />}>
              <div className="grid gap-4 lg:grid-cols-2">
                <ColorControl label="اللون الرئيسي" value={colors.primary} onChange={(value) => setColors((current) => ({ ...current, primary: value }))} hint="يستخدم في الأزرار والروابط والعناصر البارزة" />
                <ColorControl label="اللون الثانوي (الداكن)" value={colors.dark} onChange={(value) => setColors((current) => ({ ...current, dark: value }))} hint="يستخدم في الهيدر والأزرار الثانوية" />
              </div>
              <details className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <summary className="cursor-pointer font-black">ألوان إضافية</summary>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {(["success", "warning", "error", "background", "border"] as const).map((key) => (
                    <ColorControl key={key} label={key} value={colors[key]} onChange={(value) => setColors((current) => ({ ...current, [key]: value }))} hint="لون قابل للتخصيص" />
                  ))}
                </div>
              </details>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {["light", "dark", "auto"].map((mode) => (
                  <button key={mode} type="button" onClick={() => setTheme(mode)} className={`rounded-2xl border p-5 text-right ${theme === mode ? "border-[#1a1f36] bg-[#1a1f36] text-white" : "border-gray-100 bg-gray-50"}`}>
                    <p className="text-lg font-black">{mode === "light" ? "☀️ فاتح" : mode === "dark" ? "🌙 داكن" : "🔄 تلقائي"}</p>
                    <p className="mt-2 text-xs opacity-70">{mode === "auto" ? "حسب جهاز المستخدم" : mode}</p>
                  </button>
                ))}
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <SelectField label="خط العناوين" value={headingFont} onChange={setHeadingFont} options={["Cairo", "Tajawal", "IBM Plex Arabic", "Noto Sans Arabic"]} />
                <SelectField label="خط النصوص" value={bodyFont} onChange={setBodyFont} options={["Cairo", "Tajawal", "IBM Plex Arabic", "Noto Sans Arabic"]} />
                <SelectField label="حجم الخط الأساسي" value={baseFontSize} onChange={setBaseFontSize} options={["14px", "15px", "16px", "18px"]} />
              </div>
              <div className="mt-4 rounded-2xl bg-gray-50 p-4" style={{ fontFamily: bodyFont, fontSize: baseFontSize }}>هذا مثال على النص بالخط المختار</div>
            </Card>

            <Card id="content" title="المحتوى العام" actions={<SectionSave onClick={() => void saveLegacyOnly("المحتوى العام")} />}>
              <div className="grid gap-5">
                <MultiLangTextarea label="شعار الموقع الرئيسي (Tagline)" value={asString(form.footer_tagline)} onChange={(value) => updateField("footer_tagline", value)} max={150} />
                <MultiLangTextarea label="وصف الموقع (Meta Description)" value={asString(form.site_description)} onChange={(value) => updateField("site_description", value)} max={300} />
                <MultiLangTextarea label="رسالة الترحيب" value={asString(form.public_hero_title)} onChange={(value) => updateField("public_hero_title", value)} />
                <MultiLangTextarea label="نبذة عن المنصة (About)" value={asString(form.footer_description)} onChange={(value) => updateField("footer_description", value)} />
                <div>
                  <span className="text-sm font-bold">الكلمات المفتاحية العامة</span>
                  <div className="mt-2 flex flex-wrap gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3">
                    {keywords.map((keyword) => <button key={keyword} type="button" onClick={() => setKeywords((current) => current.filter((item) => item !== keyword))} className="rounded-full bg-white px-3 py-1 text-xs font-bold shadow-sm">{keyword} ×</button>)}
                    <input value={keywordDraft} onChange={(event) => setKeywordDraft(event.target.value)} onKeyDown={(event) => event.key === "Enter" && (event.preventDefault(), addKeyword(keywordDraft))} placeholder="أضف كلمة ثم Enter" className="min-w-48 flex-1 bg-transparent text-sm outline-none" />
                  </div>
                </div>
              </div>
            </Card>

            <Card id="contact" title="معلومات التواصل" actions={<SectionSave onClick={() => void saveLegacyOnly("معلومات التواصل")} />}>
              <div className="grid gap-4 md:grid-cols-2">
                <TextField label="البريد الإلكتروني الرئيسي" type="email" dir="ltr" value={asString(form.admin_email)} onChange={(value) => updateField("admin_email", value)} />
                <TextField label="بريد الدعم الفني" type="email" dir="ltr" value={asString(form.contact_email)} onChange={(value) => updateField("contact_email", value)} />
                <TextField label="رقم الهاتف الرئيسي" dir="ltr" value={asString(form.contact_phone)} onChange={(value) => updateField("contact_phone", value)} />
                <TextField label="رقم واتساب للدعم" dir="ltr" value={asString(form.contact_phone)} onChange={(value) => updateField("contact_phone", value)} />
                <TextField label="العنوان بالعربي" value={asString(form.contact_address)} onChange={(value) => updateField("contact_address", value)} />
                <TextField label="العنوان بالإنجليزي" dir="ltr" value={asString(form.contact_address)} onChange={(value) => updateField("contact_address", value)} />
              </div>
              <div className="mt-5 rounded-2xl border border-gray-100 bg-gray-50 p-5">
                <div className="flex h-48 items-center justify-center rounded-xl bg-white text-gray-400"><MapPin className="ml-2 h-5 w-5" /> Embedded mini Google Map</div>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <input dir="ltr" placeholder="24.7136" className="rounded-xl border border-gray-200 px-4 py-3 font-mono text-sm" />
                  <input dir="ltr" placeholder="46.6753" className="rounded-xl border border-gray-200 px-4 py-3 font-mono text-sm" />
                  <button className="rounded-xl bg-[#1a1f36] px-4 py-3 text-sm font-bold text-white">تحديد الموقع على الخريطة</button>
                </div>
              </div>
            </Card>

            <Card id="social" title="الشبكات الاجتماعية" actions={<SectionSave onClick={() => void saveSection("/api/settings/social", { socials }).then(() => setToast("تم حفظ الشبكات ✅"))} />}>
              <div className="space-y-3">
                {Object.entries(socials).map(([platform, url]) => (
                  <div key={platform} className="grid gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-3 md:grid-cols-[160px_1fr_auto_auto]">
                    <span className="flex items-center gap-2 font-bold">{platform === "Facebook" ? <Facebook className="h-4 w-4 text-blue-600" /> : platform === "Instagram" ? <Instagram className="h-4 w-4 text-pink-600" /> : <Share2 className="h-4 w-4 text-gray-500" />} {platform}</span>
                    <input dir="ltr" value={url} onChange={(event) => setSocials((current) => ({ ...current, [platform]: event.target.value }))} placeholder="https://..." className="rounded-xl border border-gray-200 bg-white px-4 py-2 font-mono text-sm outline-none" />
                    <span className={`self-center text-xs font-bold ${isValidUrl(url) ? "text-emerald-600" : "text-gray-400"}`}>{isValidUrl(url) ? "✓ صالح" : "غير محدد"}</span>
                    <a href={isValidUrl(url) ? url : "#"} target="_blank" rel="noreferrer" className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold">Test ↗</a>
                  </div>
                ))}
              </div>
              <button className="mt-4 inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-bold"><Plus className="h-4 w-4" /> إضافة شبكة أخرى</button>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <UploadZone title="صورة المشاركة الافتراضية (OG Image)" hint="1200x630 recommended" value="" onChange={() => undefined} />
                <label className="grid gap-2"><span className="text-sm font-bold">نص المشاركة الافتراضي</span><textarea className="min-h-32 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm" /></label>
              </div>
            </Card>

            <Card id="footer" title="الفوتر" actions={<SectionSave onClick={() => void saveSection("/api/settings/footer", { footerLinks, footerColumnTitle }).then(() => setToast("تم حفظ الفوتر ✅"))} />}>
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                <p className="font-black">معاينة الفوتر</p>
                <div className="mt-4 grid gap-3 md:grid-cols-4">
                  {["عمود 1", "عمود 2", "عمود 3", "نبذة + سوشيال"].map((item) => <div key={item} className="rounded-xl bg-white p-4 text-center text-sm font-bold">{item}</div>)}
                </div>
              </div>
              <div className="mt-5 grid gap-4">
                <MultiLangInput label="عنوان العمود" value={footerColumnTitle} onChange={setFooterColumnTitle} />
                <div className="space-y-3">
                  {footerLinks.map((link, index) => (
                    <div key={link.id} className="grid items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-3 md:grid-cols-[auto_1fr_1fr_auto]">
                      <GripVertical className="h-4 w-4 text-gray-400" />
                      <input value={link.label.ar} onChange={(event) => setFooterLinks((current) => current.map((item) => item.id === link.id ? { ...item, label: { ...item.label, ar: event.target.value } } : item))} className="rounded-xl border border-gray-200 px-3 py-2 text-sm" />
                      <input dir="ltr" value={link.url} onChange={(event) => setFooterLinks((current) => current.map((item) => item.id === link.id ? { ...item, url: event.target.value } : item))} className="rounded-xl border border-gray-200 px-3 py-2 text-sm" />
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setFooterLinks((current) => current.map((item, itemIndex) => itemIndex === index - 1 ? current[index] : itemIndex === index ? current[index - 1] ?? item : item))} className="rounded-lg border px-2 py-1 text-xs">↑</button>
                        <button type="button" onClick={() => setFooterLinks((current) => current.filter((item) => item.id !== link.id))} className="rounded-lg border px-2 py-1 text-red-600"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => setFooterLinks((current) => [...current, { id: `link_${Date.now()}`, label: { ar: "رابط جديد", en: "New link" }, url: "/" }])} className="w-fit rounded-xl bg-[#1a1f36] px-4 py-3 text-sm font-bold text-white">إضافة رابط</button>
                <MultiLangInput label="Copyright Text" value={{ ar: `© {year} ${previewTitle}. جميع الحقوق محفوظة.`, en: `© {year} ${asString(form.brand_name_en) || "Labayh"}. All rights reserved.` }} onChange={() => undefined} />
              </div>
            </Card>

            <Card id="cities" title="المدن والوجهات" actions={<button type="button" onClick={() => setCityModal({ id: `city_${Date.now()}`, nameAr: "", nameEn: "", country: "السعودية", image: "", listings: 0, active: true, featured: false })} className="rounded-xl bg-[#FF385C] px-4 py-3 text-sm font-bold text-white">إضافة مدينة</button>}>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-right text-sm">
                  <thead className="text-xs text-gray-500"><tr className="border-b"><th className="py-3">اسم المدينة</th><th>الصورة</th><th>عدد الإعلانات</th><th>الحالة</th><th>الإجراءات</th></tr></thead>
                  <tbody>{cities.map((city) => <tr key={city.id} className="border-b border-gray-50"><td className="py-3"><p className="font-black">{city.nameAr}</p><p className="text-xs text-gray-500">{city.nameEn}</p></td><td><div className="h-10 w-10 rounded-xl bg-gray-100" /></td><td><span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold">{city.listings}</span></td><td><Toggle checked={city.active} onChange={(value) => setCities((current) => current.map((item) => item.id === city.id ? { ...item, active: value } : item))} /></td><td><button onClick={() => setCityModal(city)} className="rounded-xl border px-3 py-2 text-xs font-bold">تعديل</button></td></tr>)}</tbody>
                </table>
              </div>
            </Card>

            <Card id="technical" title="الإعدادات التقنية" actions={<SectionSave onClick={() => void saveSection("/api/settings/technical", { technical }).then(() => setToast("تم حفظ الإعدادات التقنية ✅"))} />}>
              <div className="grid gap-4 md:grid-cols-2">
                <TextField label="الدومين الرئيسي" dir="ltr" value={technical.domain} onChange={(value) => setTechnical((current) => ({ ...current, domain: value }))} />
                <SelectField label="مزود البريد" value={technical.smtpProvider} onChange={(value) => setTechnical((current) => ({ ...current, smtpProvider: value }))} options={["SMTP", "SendGrid", "Mailgun", "SES"]} />
                <TextField label="SMTP Host" dir="ltr" value={technical.smtpHost} onChange={(value) => setTechnical((current) => ({ ...current, smtpHost: value }))} />
                <TextField label="Port" dir="ltr" value={technical.smtpPort} onChange={(value) => setTechnical((current) => ({ ...current, smtpPort: value }))} />
                <TextField label="From Name" value={technical.fromName} onChange={(value) => setTechnical((current) => ({ ...current, fromName: value }))} />
                <TextField label="From Email" type="email" dir="ltr" value={technical.fromEmail} onChange={(value) => setTechnical((current) => ({ ...current, fromEmail: value }))} />
                <SelectField label="مزود التخزين" value={technical.storageProvider} onChange={(value) => setTechnical((current) => ({ ...current, storageProvider: value }))} options={["Local", "S3", "Cloudflare R2"]} />
                <SelectField label="الحد الأقصى لحجم الصورة" value={technical.uploadMaxSize} onChange={(value) => setTechnical((current) => ({ ...current, uploadMaxSize: value }))} options={["2MB", "5MB", "10MB"]} />
                <TextField label="الحد الأقصى لعدد الصور لكل إعلان" dir="ltr" value={technical.maxImages} onChange={(value) => setTechnical((current) => ({ ...current, maxImages: value }))} />
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                {["Stripe", "PayTabs", "HyperPay", "Moyasar", "Apple Pay"].map((gateway, index) => <label key={gateway} className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-bold"><input type="checkbox" defaultChecked={index < 2} className="ml-2" /> {gateway}</label>)}
              </div>
            </Card>

            <Card id="analytics" title="التحليلات والتتبع" actions={<SectionSave onClick={() => void saveSection("/api/settings/analytics", { analytics }).then(() => setToast("تم حفظ التحليلات ✅"))} />}>
              <div className="space-y-3">
                {Object.entries(analytics).map(([name, item]) => (
                  <div key={name} className="grid gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-3 md:grid-cols-[220px_1fr_auto_auto]">
                    <span className="font-bold">{name}</span>
                    <input dir="ltr" value={item.id} onChange={(event) => setAnalytics((current) => ({ ...current, [name]: { ...item, id: event.target.value } }))} placeholder={name.includes("Google Analytics") ? "G-XXXXXXXXXX" : "Tracking ID"} className="rounded-xl border border-gray-200 bg-white px-4 py-2 font-mono text-sm outline-none" />
                    <span className={`self-center rounded-full px-2 py-1 text-xs font-bold ${item.enabled ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>{item.enabled ? "نشط" : "معطّل"}</span>
                    <Toggle checked={item.enabled} onChange={(value) => setAnalytics((current) => ({ ...current, [name]: { ...item, enabled: value } }))} />
                  </div>
                ))}
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="grid gap-2"><span className="text-sm font-bold">Custom &lt;head&gt; scripts</span><textarea dir="ltr" className="min-h-40 rounded-xl bg-[#0d1117] p-4 font-mono text-sm text-green-400" /></label>
                <label className="grid gap-2"><span className="text-sm font-bold">Custom &lt;body&gt; scripts</span><textarea dir="ltr" className="min-h-40 rounded-xl bg-[#0d1117] p-4 font-mono text-sm text-green-400" /></label>
              </div>
              <p className="mt-3 text-sm font-bold text-amber-700">⚠️ أضف فقط سكريبتات موثوقة</p>
            </Card>
          </div>
        </div>
      </main>

      {cityModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between"><h2 className="text-xl font-black">إضافة / تعديل مدينة</h2><button onClick={() => setCityModal(null)}>×</button></div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <TextField label="اسم المدينة بالعربي" value={cityModal.nameAr} onChange={(value) => setCityModal({ ...cityModal, nameAr: value })} />
              <TextField label="اسم المدينة بالإنجليزي" dir="ltr" value={cityModal.nameEn} onChange={(value) => setCityModal({ ...cityModal, nameEn: value })} />
              <TextField label="الدولة" value={cityModal.country} onChange={(value) => setCityModal({ ...cityModal, country: value })} />
              <TextField label="ترتيب العرض" dir="ltr" value="1" onChange={() => undefined} />
            </div>
            <div className="mt-5 flex gap-3">
              <button onClick={() => { setCities((current) => current.some((item) => item.id === cityModal.id) ? current.map((item) => item.id === cityModal.id ? cityModal : item) : [cityModal, ...current]); setCityModal(null); }} className="rounded-xl bg-[#FF385C] px-5 py-3 text-sm font-black text-white">حفظ المدينة</button>
              <button onClick={() => setCityModal(null)} className="rounded-xl border px-5 py-3 text-sm font-black">إلغاء</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SectionSave({ onClick }: { onClick: () => void }) {
  return <button type="button" onClick={onClick} className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-black text-gray-700">حفظ القسم</button>;
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-bold">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none">
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function LogoBox({ logoUrl, label }: { logoUrl: string; label: string }) {
  if (logoUrl) {
    return <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm"><Image src={logoUrl} alt={label} width={64} height={64} className="h-full w-full object-contain" unoptimized /></span>;
  }
  return <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1a1f36] text-2xl font-black text-white">{label.charAt(0) || "ل"}</span>;
}
