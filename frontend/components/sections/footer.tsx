import Link from "next/link";
import { resolveBrand } from "@/lib/brand";
import { getPublicMenus, getPublicSystemSettings, type BridgeMenuItem } from "@/lib/api";
import { legacyUrl } from "@/lib/platform";

type FooterLink = {
  name: string;
  url: string;
  target: string;
};

function normalizeFooterItems(items: BridgeMenuItem[], group: string, fallback: Array<{ name: string; url: string }>): FooterLink[] {
  const grouped = items
    .filter((item) => {
      const itemGroup = typeof item.metadata?.group === "string" ? item.metadata.group : "";
      return item.is_active !== 0 && item.name.trim().length > 0 && itemGroup === group;
    })
    .sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0))
    .map((item) => ({
      name: item.name.trim(),
      url: item.route_name || item.url || "#",
      target: item.target || (item.open_in_new_tab ? "_blank" : "_self"),
    }));

  if (grouped.length > 0) {
    return grouped;
  }

  return fallback.map((item) => ({ ...item, target: "_self" }));
}

export async function Footer() {
  const [settings, footerMenus] = await Promise.all([getPublicSystemSettings(), getPublicMenus("footer")]);
  const footerItems = footerMenus?.[0]?.items ?? [];
  const siteBrand = resolveBrand(settings);
  const sectionsTitle = settings?.footer_sections_title || "الأقسام";
  const accountTitle = settings?.footer_account_title || "الحساب";
  const newsletterTitle = settings?.footer_newsletter_title || "النشرة البريدية";
  const newsletterText =
    settings?.footer_newsletter_text ||
    `أدخل بريدك ليصلك جديد العروض والإقامات المميزة من ${siteBrand.nameAr}.`;
  const sections = normalizeFooterItems(footerItems, "sections", [
    { name: "الرئيسية", url: "/" },
    { name: "الشاليهات والفلل", url: "/home-search-result" },
    { name: "التجارب", url: "/experience-search-result" },
    { name: "الفعاليات والمؤتمرات", url: "/experience-search-result?category=events" },
  ]);
  const account = normalizeFooterItems(footerItems, "account", [
    { name: "لوحة التحكم", url: "/dashboard" },
    { name: "تسجيل الدخول", url: "/auth/login" },
    { name: "إنشاء حساب", url: "/auth/sign-up" },
    { name: "المدونة", url: "/blog" },
  ]);

  return (
    <footer className="border-t border-slate-200 bg-white px-4 py-16 sm:px-6 lg:px-10">
      <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[1.2fr_.8fr_.8fr_1fr]">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-rose-500">{siteBrand.nameEn}</div>
          <div className="mt-3 text-2xl font-semibold leading-snug text-slate-950">{siteBrand.taglineAr}</div>
          <p className="mt-4 text-sm leading-7 text-slate-600">{siteBrand.descriptionAr}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-950">{sectionsTitle}</h3>
          <ul className="mt-5 space-y-3 text-sm text-slate-600">
            {sections.map((item) => (
              <li key={`${item.name}-${item.url}`}>
                <Link className="hover:text-rose-600" href={item.url} target={item.target === "_blank" ? "_blank" : undefined}>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-950">{accountTitle}</h3>
          <ul className="mt-5 space-y-3 text-sm text-slate-600">
            {account.map((item) => (
              <li key={`${item.name}-${item.url}`}>
                <Link className="hover:text-rose-600" href={item.url} target={item.target === "_blank" ? "_blank" : undefined}>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-950">{newsletterTitle}</h3>
          <p className="mt-5 text-sm leading-7 text-slate-600">{newsletterText}</p>
          <form action={legacyUrl("/subscribe-email")} method="POST" className="mt-5 flex gap-3">
            <input
              type="email"
              name="email"
              required
              placeholder="البريد الإلكتروني"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-rose-300 focus:bg-white"
            />
            <button className="rounded-lg bg-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-600">
              اشتراك
            </button>
          </form>
        </div>
      </div>
    </footer>
  );
}
