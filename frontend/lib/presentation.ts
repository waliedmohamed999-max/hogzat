import { buildListingPath, type BridgeLastMinuteHome, type BridgeListing } from "@/lib/api";
import { legacyBaseUrl } from "@/lib/platform";
import { normalizeText } from "@/lib/text";

export const FALLBACK_LISTING_IMAGE =
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1400&q=80";

export const SAUDI_RIYAL_SYMBOL = "ر.س";

export function formatMoney(value?: number | null, currency = SAUDI_RIYAL_SYMBOL) {
  const amount = Number(value ?? 0);
  const cleanCurrency = normalizeText(currency);
  const normalizedCurrency =
    cleanCurrency === "SR" ||
    cleanCurrency === "SAR" ||
    cleanCurrency === "ر.س" ||
    cleanCurrency === "ريال" ||
    cleanCurrency === "ريال سعودي" ||
    cleanCurrency === "رس" ||
    cleanCurrency === "⃁"
      ? SAUDI_RIYAL_SYMBOL
      : cleanCurrency;
  return `${amount.toLocaleString("ar-SA")} ${normalizedCurrency}`;
}

export function formatRating(value?: number | null) {
  return value && value > 0 ? value.toFixed(1) : "جديد";
}

export function listingLocation(city?: string | null) {
  return normalizeText(city?.trim() || "المملكة العربية السعودية");
}

export function listingTypeLabel(type: BridgeListing["type"]) {
  if (type === "experience") {
    return "تجربة";
  }

  if (type === "service") {
    return "خدمة";
  }

  return "إقامة";
}

export function listingBadge(item: BridgeListing) {
  if (item.use_offer && item.offer_percent) {
    return `خصم ${item.offer_percent}%`;
  }

  if (item.is_featured) {
    return "مميز";
  }

  return listingTypeLabel(item.type);
}

export function normalizeAssetUrl(url?: string | null) {
  if (!url) {
    return FALLBACK_LISTING_IMAGE;
  }

  const normalized = url
    .replace(/^http:\/\/localhost\/DMSRBNB/i, legacyBaseUrl)
    .replace(/^https:\/\/localhost\/DMSRBNB/i, legacyBaseUrl);

  try {
    const parsed = new URL(normalized);
    if (
      (parsed.hostname === "127.0.0.1" && parsed.port === "8000") ||
      parsed.hostname === "localhost"
    ) {
      if (
        parsed.pathname.startsWith("/storage/") ||
        parsed.pathname.startsWith("/images/") ||
        parsed.pathname.startsWith("/public/")
      ) {
        return `/legacy-media${parsed.pathname}`;
      }
    }
  } catch {
    const path = normalized.startsWith("/") ? normalized : `/${normalized}`;
    if (path.startsWith("/storage/") || path.startsWith("/images/") || path.startsWith("/public/")) {
      return `/legacy-media${path}`;
    }
  }

  return normalized;
}

export function normalizeBrandText(value?: string | null, fallback = "") {
  const text = normalizeText(value?.trim() || fallback);
  const replacements: Array<[RegExp, string]> = [
    [new RegExp(["DMS", " Reserve"].join(""), "gi"), "Labayh"],
    [new RegExp(["DMS", " Admin"].join(""), "gi"), "Labayh Admin"],
    [new RegExp(["D M S", " Admin"].join(""), "gi"), "Labayh Admin"],
    [new RegExp(["Premium", " Stays"].join(""), "gi"), "Labayh"],
    [new RegExp(["Bala", "jat"].join(""), "gi"), "Labayh"],
    [new RegExp(["Bla", "gat Saudia"].join(""), "gi"), "فريق لبية"],
    [new RegExp(["Bla", "gat Saudi"].join(""), "gi"), "فريق لبية"],
    [new RegExp(["Bla", "gat"].join(""), "gi"), "Labayh"],
    [new RegExp(["بلا", "جات|بل", "جات|الن", "ادر"].join(""), "g"), "لبية"],
  ];

  return replacements.reduce((current, [pattern, next]) => current.replace(pattern, next), text);
}

export function listingMetadata(item: Pick<BridgeListing, "guests" | "bedrooms" | "baths">) {
  const metadata: string[] = [];

  if (item.guests) {
    metadata.push(`${item.guests} ضيف`);
  }
  if (item.bedrooms) {
    metadata.push(`${item.bedrooms} غرفة`);
  }
  if (item.baths) {
    metadata.push(`${item.baths} حمام`);
  }

  return metadata;
}

export function mapListingCard(item: BridgeListing, savedIds: number[] = []) {
  return {
    listingId: item.id,
    listingType: item.type,
    title: normalizeText(item.title),
    location: listingLocation(item.city),
    price: formatMoney(item.price_from),
    rating: formatRating(item.rating),
    image: normalizeAssetUrl(item.thumb),
    href: buildListingPath(item),
    metadata: listingMetadata(item),
    badge: listingBadge(item),
    isSaved: savedIds.includes(item.id),
  };
}

export function mapLastMinuteDealCard(item: BridgeLastMinuteHome, savedIds: number[] = []) {
  const hasOriginalPrice = Boolean(item.original_price && item.original_price > item.price);
  const discountBadge = item.discount_percent && item.discount_percent > 0
    ? `خصم ${item.discount_percent}%`
    : "صفقة سريعة";

  return {
    listingId: item.home_id,
    listingType: "home" as const,
    title: normalizeText(item.title),
    location: listingLocation(""),
    price: formatMoney(item.price),
    originalPrice: hasOriginalPrice ? formatMoney(item.original_price) : undefined,
    discountPercent: item.discount_percent,
    rating: "جديد",
    image: normalizeAssetUrl(item.thumbnail),
    href: `/home/${item.home_id}`,
    metadata: [item.ends_date ? `تنتهي ${item.ends_date}` : "وقت محدود"],
    badge: discountBadge,
    isDeal: true,
    dealEndsAtTimestamp: item.ends_at_timestamp,
    dealDurationHours: item.duration_hours,
    isSaved: savedIds.includes(item.home_id),
  };
}
