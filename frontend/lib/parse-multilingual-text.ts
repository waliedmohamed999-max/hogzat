import { normalizeText } from "@/lib/text";

export function parseMultilingualText(text?: string | null, locale = "ar") {
  const value = normalizeText(String(text ?? ""));

  if (!value) {
    return "";
  }

  const arMatch = value.match(/\[ar:\]([\s\S]*?)(?=\[en:\]|\[:\]|$)/i);
  const enMatch = value.match(/\[en:\]([\s\S]*?)(?=\[:\]|\[ar:\]|$)/i);

  if (locale === "ar" && arMatch?.[1]) {
    return arMatch[1].trim();
  }

  if (locale === "en" && enMatch?.[1]) {
    return enMatch[1].trim();
  }

  if (arMatch?.[1]) {
    return arMatch[1].trim();
  }

  if (enMatch?.[1]) {
    return enMatch[1].trim();
  }

  return value.replace(/\[ar:\]|\[en:\]|\[:\]/gi, "").trim();
}
