"use client";

import { secureFetch } from "@/lib/client-security";
import type { BridgeProfile } from "@/lib/api";
import {
  Activity,
  BadgeCheck,
  Bell,
  Camera,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  Globe2,
  KeyRound,
  LockKeyhole,
  Mail,
  MapPin,
  MonitorSmartphone,
  Phone,
  Save,
  ShieldCheck,
  Sparkles,
  UserCircle2,
} from "lucide-react";
import { useMemo, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type TabKey = "profile" | "security" | "preferences" | "activity";

const tabs: Array<{ key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { key: "profile", label: "البيانات الشخصية", icon: UserCircle2 },
  { key: "security", label: "الأمان وكلمة المرور", icon: ShieldCheck },
  { key: "preferences", label: "التفضيلات والتنبيهات", icon: Bell },
  { key: "activity", label: "النشاط والجلسات", icon: Activity },
];

function initials(profile: BridgeProfile) {
  const first = profile.first_name?.trim()?.[0] ?? "";
  const last = profile.last_name?.trim()?.[0] ?? "";
  return `${first}${last}` || profile.display_name?.slice(0, 2) || "م";
}

function completionScore(profile: BridgeProfile) {
  const fields = [
    profile.first_name,
    profile.last_name,
    profile.email,
    profile.mobile,
    profile.location,
    profile.address,
    profile.description,
    profile.trade_name,
  ];
  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
}

function profileRole(profile: BridgeProfile) {
  const role = profile.roles?.[0] ?? "user";
  const labels: Record<string, string> = {
    administrator: "مشرف",
    admin: "مشرف",
    superadmin: "مشرف عام",
    partner: "شريك",
    host: "مضيف",
    customer: "ضيف",
    user: "مستخدم",
  };
  return labels[role] ?? role;
}

export function ProfileManager({ profile }: { profile: BridgeProfile }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("profile");
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const score = useMemo(() => completionScore(profile), [profile]);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfileMessage(null);
    setProfileError(null);

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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = (await response.json().catch(() => null)) as { status?: number; message?: string } | null;

    if (!response.ok || result?.status !== 1) {
      setProfileError(result?.message || "تعذر تحديث الملف الشخصي حالياً.");
      return;
    }

    setProfileMessage(result.message || "تم حفظ بيانات الملف الشخصي.");
    startTransition(() => router.refresh());
  }

  async function savePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordMessage(null);
    setPasswordError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const password = String(formData.get("password") || "");
    const passwordConfirmation = String(formData.get("password_confirmation") || "");

    if (password !== passwordConfirmation) {
      setPasswordError("تأكيد كلمة المرور غير مطابق.");
      return;
    }

    const response = await secureFetch("/api/v1/profile/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, password_confirmation: passwordConfirmation }),
    });
    const result = (await response.json().catch(() => null)) as { status?: number; message?: string } | null;

    if (!response.ok || result?.status !== 1) {
      setPasswordError(result?.message || "تعذر تحديث كلمة المرور حالياً.");
      return;
    }

    setPasswordMessage(result.message || "تم تحديث كلمة المرور بنجاح.");
    form.reset();
  }

  return (
    <div dir="rtl" className="space-y-6 font-[Cairo]">
      <section className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
        <div className="bg-[#1a1f36] p-6 text-white">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                {profile.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatar} alt={profile.display_name} className="size-20 rounded-2xl border border-white/20 object-cover" />
                ) : (
                  <div className="grid size-20 place-items-center rounded-2xl bg-white/10 text-2xl font-bold">{initials(profile)}</div>
                )}
                <button type="button" className="absolute -bottom-2 -left-2 grid size-9 place-items-center rounded-xl bg-[#FF385C] text-white shadow-lg">
                  <Camera className="size-4" />
                </button>
              </div>
              <div>
                <p className="text-sm text-white/60">الحساب الحالي</p>
                <h1 className="mt-1 text-3xl font-bold">{profile.display_name}</h1>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold">{profileRole(profile)}</span>
                  <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-200">جلسة موثقة</span>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-mono">ID #{profile.id}</span>
                </div>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <HeaderMetric label="اكتمال الملف" value={`${score}%`} />
              <HeaderMetric label="الدور" value={profileRole(profile)} />
              <HeaderMetric label="الأمان" value="جيد" />
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-5 lg:grid-cols-4">
          <InfoTile icon={Mail} label="البريد الإلكتروني" value={profile.email || "-"} verified />
          <InfoTile icon={Phone} label="رقم الجوال" value={profile.mobile || "-"} verified={Boolean(profile.mobile)} />
          <InfoTile icon={MapPin} label="الموقع" value={profile.location || "غير محدد"} />
          <InfoTile icon={BadgeCheck} label="الاسم التجاري" value={profile.trade_name || "غير محدد"} />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="mb-3 px-2 text-xs font-bold text-slate-400">مركز التحكم</div>
            <div className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
                      activeTab === tab.key ? "bg-[#1a1f36] text-white shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                    }`}
                  >
                    <Icon className="size-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-950">جودة الملف</h3>
              <Sparkles className="size-5 text-[#FF385C]" />
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-[#FF385C]" style={{ width: `${score}%` }} />
            </div>
            <p className="mt-3 text-sm text-slate-500">
              أضف الموقع والعنوان والنبذة والاسم التجاري لتحسين ظهور حسابك داخل اللوحة.
            </p>
          </div>
        </aside>

        <div className="min-w-0">
          {activeTab === "profile" ? (
            <form onSubmit={saveProfile} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <SectionTitle title="البيانات الشخصية" subtitle="إدارة بيانات الحساب الأساسية وبيانات التواصل." />
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <Field label="الاسم الأول" name="first_name" defaultValue={profile.first_name} required />
                <Field label="اسم العائلة" name="last_name" defaultValue={profile.last_name} required />
                <Field label="البريد الإلكتروني" name="email" type="email" defaultValue={profile.email} required ltr />
                <Field label="رقم الجوال" value={profile.mobile} readOnly ltr hint="رقم الجوال مرتبط بجلسة النظام الحالية." />
                <Field label="الموقع" name="location" defaultValue={profile.location} />
                <Field label="الاسم التجاري" name="trade_name" defaultValue={profile.trade_name} />
              </div>
              <div className="mt-4">
                <Field label="العنوان" name="address" defaultValue={profile.address} />
              </div>
              <label className="mt-4 grid gap-2">
                <span className="text-sm font-bold text-slate-700">نبذة مختصرة</span>
                <textarea
                  name="description"
                  defaultValue={profile.description}
                  rows={5}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#FF385C] focus:bg-white"
                />
              </label>
              <FormStatus error={profileError} message={profileMessage} />
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <button type="button" onClick={() => navigator.clipboard?.writeText(String(profile.id))} className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700">
                  <Copy className="size-4" />
                  نسخ رقم الحساب
                </button>
                <button type="submit" disabled={isPending} className="flex items-center gap-2 rounded-xl bg-[#1a1f36] px-5 py-3 text-sm font-bold text-white disabled:opacity-60">
                  <Save className="size-4" />
                  {isPending ? "جارٍ الحفظ..." : "حفظ التغييرات"}
                </button>
              </div>
            </form>
          ) : null}

          {activeTab === "security" ? (
            <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
              <form onSubmit={savePassword} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                <SectionTitle title="تحديث كلمة المرور" subtitle="استخدم كلمة مرور قوية وفريدة لحماية حسابك." />
                <div className="mt-6 grid gap-4">
                  <PasswordField label="كلمة المرور الجديدة" name="password" show={showPassword} onToggle={() => setShowPassword((value) => !value)} />
                  <PasswordField label="تأكيد كلمة المرور" name="password_confirmation" show={showPassword} onToggle={() => setShowPassword((value) => !value)} />
                </div>
                <PasswordStrength />
                <FormStatus error={passwordError} message={passwordMessage} />
                <button type="submit" className="mt-6 flex items-center gap-2 rounded-xl bg-[#FF385C] px-5 py-3 text-sm font-bold text-white">
                  <LockKeyhole className="size-4" />
                  تحديث كلمة المرور
                </button>
              </form>

              <div className="space-y-4">
                <SecurityCard title="المصادقة الثنائية" description="جهّز خطوة تحقق إضافية عند تسجيل الدخول." action="تفعيل قريباً" />
                <SecurityCard title="تنبيهات الدخول" description="إرسال إشعار عند تسجيل دخول جديد من جهاز غير معروف." action="مفعّل" active />
                <SecurityCard title="أجهزة موثوقة" description="إدارة الأجهزة التي تحتفظ بجلسة دخول محفوظة." action="عرض الأجهزة" />
              </div>
            </div>
          ) : null}

          {activeTab === "preferences" ? (
            <div className="grid gap-6 xl:grid-cols-2">
              <PreferenceCard icon={Globe2} title="اللغة والمنطقة" items={["العربية كلغة افتراضية", "المنطقة الزمنية: Asia/Riyadh", "تنسيق الأسعار: ر.س"]} />
              <PreferenceCard icon={Bell} title="الإشعارات" items={["تنبيهات الحجوزات", "رسائل الإدارة", "ملخص أسبوعي للأداء"]} />
              <PreferenceCard icon={Mail} title="البريد والرسائل" items={["إرسال نسخة من الإشعارات للبريد", "إشعارات الأمان العاجلة", "رسائل التسويق اختيارية"]} />
              <PreferenceCard icon={MonitorSmartphone} title="تجربة اللوحة" items={["واجهة RTL", "تصميم كثيف مناسب للإدارة", "حفظ تلقائي للمسودات"]} />
            </div>
          ) : null}

          {activeTab === "activity" ? (
            <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
              <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                <SectionTitle title="سجل النشاط" subtitle="آخر العمليات المهمة داخل حسابك." />
                <div className="mt-6 space-y-4">
                  {[
                    ["تسجيل دخول ناجح", "من المتصفح الحالي", "الآن"],
                    ["فتح صفحة الملف الشخصي", "لوحة التحكم الموحدة", "منذ دقائق"],
                    ["تحديث بيانات الحساب", "يظهر هنا بعد الحفظ", "حسب آخر عملية"],
                    ["تغيير كلمة المرور", "يظهر هنا بعد التحديث", "حسب آخر عملية"],
                  ].map(([title, description, time]) => (
                    <div key={title} className="flex gap-3 rounded-2xl border border-slate-100 p-4">
                      <span className="mt-1 size-2 rounded-full bg-[#FF385C]" />
                      <div>
                        <h3 className="font-bold text-slate-950">{title}</h3>
                        <p className="mt-1 text-sm text-slate-500">{description}</p>
                        <p className="mt-2 text-xs font-bold text-slate-400">{time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                <SectionTitle title="الجلسات النشطة" subtitle="إدارة الأجهزة المتصلة بحسابك." />
                <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                  <div className="flex items-center gap-3">
                    <MonitorSmartphone className="size-5 text-emerald-700" />
                    <div>
                      <h3 className="font-bold text-emerald-900">الجهاز الحالي</h3>
                      <p className="text-sm text-emerald-700">Chrome على Windows</p>
                    </div>
                  </div>
                </div>
                <button type="button" className="mt-4 w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
                  تسجيل خروج من الأجهزة الأخرى
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function HeaderMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 px-5 py-4">
      <p className="text-xs text-white/60">{label}</p>
      <p className="mt-2 text-lg font-bold">{value}</p>
    </div>
  );
}

function InfoTile({ icon: Icon, label, value, verified = false }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; verified?: boolean }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <Icon className="size-5 text-[#FF385C]" />
        {verified ? <CheckCircle2 className="size-4 text-emerald-600" /> : null}
      </div>
      <p className="mt-4 text-xs font-bold text-slate-400">{label}</p>
      <p className="mt-1 truncate text-sm font-bold text-slate-950">{value}</p>
    </div>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">{subtitle}</p>
    </div>
  );
}

function Field({ label, hint, ltr = false, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; ltr?: boolean }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <input
        {...props}
        dir={ltr ? "ltr" : "rtl"}
        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#FF385C] focus:bg-white disabled:opacity-70"
      />
      {hint ? <span className="text-xs text-slate-400">{hint}</span> : null}
    </label>
  );
}

function PasswordField({ label, name, show, onToggle }: { label: string; name: string; show: boolean; onToggle: () => void }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-[#FF385C] focus-within:bg-white">
        <KeyRound className="size-4 text-slate-400" />
        <input type={show ? "text" : "password"} name={name} minLength={6} required dir="ltr" className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
        <button type="button" onClick={onToggle} className="text-slate-400 hover:text-slate-700">
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </label>
  );
}

function PasswordStrength() {
  return (
    <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <div className="flex gap-2">
        <span className="h-2 flex-1 rounded-full bg-[#FF385C]" />
        <span className="h-2 flex-1 rounded-full bg-amber-400" />
        <span className="h-2 flex-1 rounded-full bg-emerald-500" />
      </div>
      <p className="mt-3 text-xs text-slate-500">استخدم 8 أحرف على الأقل مع أرقام ورمز خاص لرفع مستوى الحماية.</p>
    </div>
  );
}

function FormStatus({ error, message }: { error: string | null; message: string | null }) {
  return (
    <>
      {error ? <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{error}</div> : null}
      {message ? <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{message}</div> : null}
    </>
  );
}

function SecurityCard({ title, description, action, active = false }: { title: string; description: string; action: string; active?: boolean }) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-bold text-slate-950">{title}</h3>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{action}</span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

function PreferenceCard({ icon: Icon, title, items }: { icon: React.ComponentType<{ className?: string }>; title: string; items: string[] }) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-2xl bg-[#FF385C]/10 text-[#FF385C]">
          <Icon className="size-5" />
        </span>
        <h2 className="text-xl font-bold text-slate-950">{title}</h2>
      </div>
      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <label key={item} className="flex items-center justify-between rounded-2xl border border-slate-100 p-4">
            <span className="text-sm font-bold text-slate-700">{item}</span>
            <input type="checkbox" defaultChecked className="size-4 accent-[#FF385C]" />
          </label>
        ))}
      </div>
    </div>
  );
}
