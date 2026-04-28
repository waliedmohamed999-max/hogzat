import { NextRequest, NextResponse } from "next/server";
import { appendHardenedSetCookies, assertCsrf, jsonError } from "@/lib/api-security";
import { legacyUrl } from "@/lib/platform";

type Params = { params: Promise<{ slug: string }> };

async function fetchPages(request: NextRequest) {
  const upstream = await fetch(legacyUrl("/bridge/v1/dashboard/system-native/seo"), {
    headers: {
      Accept: "application/json",
      Cookie: request.headers.get("cookie") ?? "",
    },
    cache: "no-store",
  });
  return upstream.json().catch(() => null) as Promise<{ status?: number; data?: { pages?: Array<Record<string, unknown>> } } | null>;
}

export async function GET(request: NextRequest, context: Params) {
  const { slug } = await context.params;
  const payload = await fetchPages(request);
  const page = payload?.data?.pages?.find((item) => item.screen === slug || item.key === slug);
  if (!page) return jsonError("SEO page not found.", 404);
  return NextResponse.json({ status: 1, data: page });
}

export async function PUT(request: NextRequest, context: Params) {
  const csrfError = assertCsrf(request);
  if (csrfError) return csrfError;

  const { slug } = await context.params;
  const nextPage = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!nextPage) return jsonError("Invalid SEO page payload.", 422);

  const payload = await fetchPages(request);
  const pages = payload?.data?.pages ?? [];
  const nextPages = pages.map((item) => (item.screen === slug || item.key === slug ? { ...item, ...nextPage } : item));

  const upstream = await fetch(legacyUrl("/bridge/v1/dashboard/system-native/seo"), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Cookie: request.headers.get("cookie") ?? "",
    },
    body: JSON.stringify({ pages: nextPages }),
    cache: "no-store",
  });

  const response = new NextResponse(await upstream.text(), {
    status: upstream.status,
    headers: { "content-type": upstream.headers.get("content-type") ?? "application/json" },
  });
  appendHardenedSetCookies(response, upstream);
  return response;
}
