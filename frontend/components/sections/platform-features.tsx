import type { BridgeMenuItem } from "@/lib/api";
import {
  BadgeCheck,
  ShieldCheck,
  Sparkles,
  Star,
  TicketPercent,
  Workflow,
  type LucideIcon,
} from "lucide-react";

type PlatformFeature = {
  title: string;
  description: string;
  icon: LucideIcon;
};

type PlatformFeaturesSectionProps = {
  menuItems?: BridgeMenuItem[];
};

const iconMap: Record<string, LucideIcon> = {
  BadgeCheck,
  ShieldCheck,
  Sparkles,
  TicketPercent,
  Workflow,
};

const fallbackFeatures: PlatformFeature[] = [
  {
    title: "دفع آمن",
    description: "تجربة دفع واضحة مع جلسات مستخدم موحدة وحماية للبيانات في كل خطوة.",
    icon: ShieldCheck,
  },
  {
    title: "إعلانات موثقة",
    description: "الصور والأسعار والتوفر تظهر من بيانات النظام مع حالات نشر قابلة للإدارة.",
    icon: BadgeCheck,
  },
  {
    title: "بحث ذكي",
    description: "فلترة بالمدينة والتاريخ والصيف والأسعار مع مسارات نتائج مستقرة.",
    icon: Sparkles,
  },
  {
    title: "تجربة متكاملة",
    description: "الواجهة ولوحة التحكم تعملان فوق نفس الربط لضمان اتساق البيانات.",
    icon: Workflow,
  },
  {
    title: "عروض قابلة للتحكم",
    description: "العروض والتمييز والخصومات تظهر من إعدادات المنتج بلا عناصر منفصلة غير مرتبطة.",
    icon: TicketPercent,
  },
];

const platformStats = [
  { value: "01", label: "جلسة موحدة", detail: "تسجيل، مفضلة، وحجز في مسار واحد" },
  { value: "02", label: "بيانات مباشرة", detail: "الأسعار والتوفر من نفس المصدر" },
  { value: "03", label: "تحكم كامل", detail: "العروض تظهر من إعدادات الداشبورد" },
];

const accents = [
  "border-rose-200 bg-rose-50 text-rose-600",
  "border-emerald-200 bg-emerald-50 text-emerald-600",
  "border-sky-200 bg-sky-50 text-sky-600",
  "border-amber-200 bg-amber-50 text-amber-600",
  "border-slate-200 bg-slate-50 text-slate-700",
];

function getStringMetadata(item: BridgeMenuItem, key: string) {
  const value = item.metadata?.[key];
  return typeof value === "string" ? value : "";
}

function normalizeFeatures(menuItems: BridgeMenuItem[]): PlatformFeature[] {
  if (!menuItems.length) {
    return fallbackFeatures;
  }

  return menuItems
    .filter((item) => item.is_active !== 0)
    .map((item, index) => ({
      title: item.name || fallbackFeatures[index % fallbackFeatures.length].title,
      description:
        getStringMetadata(item, "description") ||
        fallbackFeatures[index % fallbackFeatures.length].description,
      icon: iconMap[item.icon || ""] ?? fallbackFeatures[index % fallbackFeatures.length].icon,
    }));
}

export function PlatformFeaturesSection({ menuItems = [] }: PlatformFeaturesSectionProps) {
  const features = normalizeFeatures(menuItems);

  return (
    <section className="relative overflow-hidden border-y border-slate-200 bg-[#f5f7f6] px-4 py-24 sm:px-6 lg:px-10">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-rose-300 to-transparent" />
      <div className="mx-auto max-w-[1440px]">
        <div className="grid items-end gap-10 lg:grid-cols-[1fr_0.9fr]">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-md border border-rose-100 bg-white px-4 py-1.5 text-xs font-bold text-rose-600 shadow-sm">
              مزايا المنصة
            </span>
            <h2 className="mt-5 max-w-4xl text-3xl font-black leading-tight text-slate-950 sm:text-4xl lg:text-5xl">
              واجهة حجز مرتبطة بالنظام وليست طبقة عرض منفصلة
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-8 text-slate-600 sm:text-base">
              البيانات، الجلسات، المفضلة، الحجز، والداشبورد تعمل عبر نفس الربط، وهذا يجعل كل تحسين بصري قابلا للاستخدام الفعلي.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {platformStats.map((stat) => (
              <div
                key={stat.value}
                className="flex items-center gap-4 rounded-lg border border-white bg-white/80 p-4 shadow-[0_18px_50px_-42px_rgba(15,23,42,0.7)]"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-sm font-black text-white">
                  {stat.value}
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-950">{stat.label}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{stat.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mt-14">
          <div className="absolute left-0 right-0 top-1/2 hidden h-px bg-slate-200 xl:block" />
          <div className="relative grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <article
                  key={`${feature.title}-${index}`}
                  className="group relative flex min-h-[250px] flex-col rounded-lg border border-slate-200 bg-white p-6 shadow-[0_24px_70px_-52px_rgba(15,23,42,0.75)] transition duration-300 hover:-translate-y-1 hover:border-rose-200 hover:shadow-[0_28px_80px_-48px_rgba(15,23,42,0.85)]"
                >
                  <div className="mb-6 flex items-start justify-between gap-4">
                    <div className={`flex size-14 items-center justify-center rounded-lg border ${accents[index % accents.length]}`}>
                      <Icon className="size-6" />
                    </div>
                    <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-black text-slate-400">
                      0{index + 1}
                    </span>
                  </div>

                  <h3 className="text-xl font-black leading-7 text-slate-950">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{feature.description}</p>

                  <div className="mt-auto pt-6">
                    <div className="flex items-center gap-1.5 text-amber-400">
                      {Array.from({ length: 5 }).map((_, starIndex) => (
                        <Star
                          key={starIndex}
                          className="size-4 fill-current transition group-hover:scale-110"
                        />
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
