import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ArrowLeft, BadgeCheck, ShieldCheck, Sparkles } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";
import { getPublicSystemSettings, getSessionUser } from "@/lib/api";
import { resolveBrand } from "@/lib/brand";

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function safeReturnUrl(value?: string | string[]) {
  const url = Array.isArray(value) ? value[0] : value;
  return url && url.startsWith("/") && !url.startsWith("//") ? url : "/dashboard";
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  redirect("/dashboard");

  const headerStore = await headers();
  const cookieHeader = headerStore.get("cookie") ?? "";
  const [currentUser, publicSettings] = await Promise.all([
    getSessionUser(cookieHeader),
    getPublicSystemSettings(),
  ]);

  if (currentUser) {
    redirect("/dashboard");
  }

  const resolvedSearchParams = (await searchParams) ?? {};
  const returnUrl = safeReturnUrl(resolvedSearchParams.return_url);
  const siteBrand = resolveBrand(publicSettings);

  return (
    <main dir="rtl" className="min-h-screen bg-[#f8f8f6] text-slate-950">
      <section className="grid min-h-screen lg:grid-cols-[minmax(0,0.95fr)_minmax(520px,1.05fr)]">
        <aside className="relative hidden overflow-hidden bg-[#1a1f36] px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(90deg,rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:48px_48px]" />
          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-2xl bg-white text-xl font-black text-[#1a1f36]">
                {siteBrand.nameAr.charAt(0) || "ل"}
              </span>
              <span>
                <span className="block text-xs font-black uppercase tracking-[0.3em] text-[#FF385C]">{siteBrand.nameEn}</span>
                <span className="mt-1 block text-2xl font-black">{siteBrand.nameAr}</span>
              </span>
            </Link>

            <div className="mt-24 max-w-xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-black text-white/80">
                <ShieldCheck className="size-4 text-[#FF385C]" />
                دخول آمن للوحة التحكم
              </span>
              <h1 className="mt-6 text-5xl font-black leading-tight">
                إدارة الحجوزات تبدأ من جلسة دخول واضحة وسريعة.
              </h1>
              <p className="mt-5 text-base leading-8 text-white/68">
                استخدم بريدك الإلكتروني وكلمة المرور للوصول إلى الحجوزات، الخدمات، الكوبونات، المدفوعات، وإعدادات المنصة.
              </p>
            </div>
          </div>

          <div className="relative z-10 grid gap-3 md:grid-cols-3">
            <Signal icon={BadgeCheck} label="جلسة موثقة" />
            <Signal icon={Sparkles} label="واجهة سريعة" />
            <Signal icon={ShieldCheck} label="حماية CSRF" />
          </div>
        </aside>

        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-[480px]">
            <div className="mb-8 flex items-center justify-between gap-4">
              <Link href="/" className="inline-flex items-center gap-2 text-sm font-black text-slate-600 transition hover:text-[#FF385C]">
                <ArrowLeft className="size-4" />
                الرجوع للموقع
              </Link>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-black text-slate-500">
                {siteBrand.nameEn}
              </span>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_30px_90px_-52px_rgba(15,23,42,0.55)] sm:p-8">
              <div className="mb-7">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#FF385C]/10 px-3 py-1.5 text-xs font-black text-[#FF385C]">
                  <ShieldCheck className="size-4" />
                  تسجيل دخول
                </span>
                <h2 className="mt-4 text-3xl font-black text-[#1a1f36]">أهلا بعودتك</h2>
                <p className="mt-2 text-sm leading-7 text-slate-500">
                  أدخل البريد الإلكتروني وكلمة المرور الخاصة بحسابك.
                </p>
              </div>

              <LoginForm returnUrl={returnUrl} />
            </div>

            <p className="mt-6 text-center text-sm font-semibold text-slate-500">
              لا تملك حسابا؟{" "}
              <Link href="/auth/sign-up" className="font-black text-[#FF385C] hover:text-[#E31C5F]">
                إنشاء حساب جديد
              </Link>
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}

function Signal({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
      <Icon className="size-5 text-[#FF385C]" />
      <div className="mt-3 text-sm font-black text-white">{label}</div>
    </div>
  );
}
