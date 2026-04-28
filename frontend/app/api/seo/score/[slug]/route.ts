import { NextRequest, NextResponse } from "next/server";
import { legacyUrl } from "@/lib/platform";

type Params = { params: Promise<{ slug: string }> };

function parseLang(value?: unknown) {
  const raw = String(value ?? "");
  return raw.match(/\[ar:\]([\s\S]*?)(?=\[en:\]|\[:\]|$)/)?.[1]?.trim() || raw;
}

function score(page: Record<string, unknown>) {
  const title = parseLang(page.seo_title);
  const description = parseLang(page.seo_description);
  let total = 0;
  if (title.length >= 50 && title.length <= 60) total += 35;
  else if (title.length >= 30) total += 20;
  if (description.length >= 120 && description.length <= 160) total += 35;
  else if (description.length >= 80) total += 20;
  if (Number(page.facebook_image ?? 0) > 0) total += 15;
  if (parseLang(page.facebook_title)) total += 10;
  if (parseLang(page.twitter_title)) total += 5;
  return Math.min(100, total);
}

export async function GET(request: NextRequest, context: Params) {
  const { slug } = await context.params;
  const upstream = await fetch(legacyUrl("/bridge/v1/dashboard/system-native/seo"), {
    headers: { Accept: "application/json", Cookie: request.headers.get("cookie") ?? "" },
    cache: "no-store",
  });
  const payload = (await upstream.json().catch(() => null)) as { data?: { pages?: Array<Record<string, unknown>> } } | null;
  const page = payload?.data?.pages?.find((item) => item.screen === slug || item.key === slug);
  return NextResponse.json({ status: page ? 1 : 0, score: page ? score(page) : 0 });
}
