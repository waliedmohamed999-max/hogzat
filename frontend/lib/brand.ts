import type { BridgeSystemSettings } from "@/lib/api";

export const brand = {
  nameAr: "لبية",
  nameEn: "Labayh",
  taglineAr: "حجوزات فاخرة للإقامات والتجارب والفعاليات",
  descriptionAr:
    "منصة حجوزات حديثة تجمع الشاليهات والفلل والتجارب والفعاليات في واجهة واحدة مرتبطة بلوحة التحكم.",
} as const;

export const brandTitle = `${brand.nameAr} | ${brand.nameEn}`;

function text(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export function resolveBrand(settings?: Partial<BridgeSystemSettings> | null) {
  const nameAr = text(settings?.brand_name_ar || settings?.site_title, brand.nameAr);
  const nameEn = text(settings?.brand_name_en, brand.nameEn);
  const taglineAr = text(settings?.footer_tagline, brand.taglineAr);
  const descriptionAr = text(settings?.footer_description || settings?.site_description, brand.descriptionAr);

  return {
    nameAr,
    nameEn,
    taglineAr,
    descriptionAr,
    title: `${nameAr} | ${nameEn}`,
    logoUrl: text(settings?.brand_logo_url, ""),
    logoShortUrl: text(settings?.brand_logo_short_url, ""),
  };
}
