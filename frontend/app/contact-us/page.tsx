import { headers } from "next/headers";
import { Mail, MapPin, Phone } from "lucide-react";
import { Footer } from "@/components/sections/footer";
import { SiteNavbar } from "@/components/sections/site-navbar";
import { getPublicSystemSettings, getSessionUser } from "@/lib/api";
import { resolveBrand } from "@/lib/brand";
import { legacyUrl } from "@/lib/platform";

export default async function ContactUsPage() {
  const headerStore = await headers();
  const cookieHeader = headerStore.get("cookie") ?? "";
  const [currentUser, publicSettings] = await Promise.all([
    getSessionUser(cookieHeader),
    getPublicSystemSettings(),
  ]);
  const siteBrand = resolveBrand(publicSettings);

  return (
    <main className="min-h-screen bg-[#f8f8f6] text-slate-950">
      <SiteNavbar currentUser={currentUser} />

      <section className="px-4 pb-20 pt-32 sm:px-6 lg:px-10">
        <div className="mx-auto grid max-w-[1180px] gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <span className="inline-flex rounded-full border border-rose-100 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-500">
              تواصل معنا
            </span>
            <h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl">
              فريق {siteBrand.nameAr} جاهز لخدمتك
            </h1>
            <p className="mt-5 text-sm leading-8 text-slate-600">
              أرسل طلبك من الواجهة الجديدة وسيصل إلى نظام المنصة الحالي لمعالجته.
            </p>

            <div className="mt-8 space-y-3 text-sm text-slate-600">
              <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
                <Phone className="size-4 text-rose-500" />
                <span>{publicSettings?.contact_phone || "الدعم والحجوزات"}</span>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
                <Mail className="size-4 text-rose-500" />
                <span>{publicSettings?.contact_email || "طلبات الشراكات والإعلانات"}</span>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
                <MapPin className="size-4 text-rose-500" />
                <span>{publicSettings?.contact_address || "المملكة العربية السعودية"}</span>
              </div>
            </div>
          </div>

          <form
            action={legacyUrl("/contact-us-post")}
            method="POST"
            className="rounded-lg border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.18)]"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <input
                name="name"
                required
                placeholder="الاسم"
                className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-rose-300 focus:bg-white"
              />
              <input
                name="email"
                type="email"
                required
                placeholder="البريد الإلكتروني"
                className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-rose-300 focus:bg-white"
              />
              <input
                name="phone"
                placeholder="رقم الجوال"
                className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-rose-300 focus:bg-white md:col-span-2"
              />
              <textarea
                name="message"
                required
                rows={7}
                placeholder="اكتب رسالتك"
                className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-rose-300 focus:bg-white md:col-span-2"
              />
            </div>
            <button className="mt-5 rounded-lg bg-rose-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-600">
              إرسال الرسالة
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </main>
  );
}
