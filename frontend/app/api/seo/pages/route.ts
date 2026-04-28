import { NextRequest, NextResponse } from "next/server";
import { appendHardenedSetCookies, assertCsrf, jsonError } from "@/lib/api-security";
import { legacyUrl } from "@/lib/platform";

export async function GET(request: NextRequest) {
  const upstream = await fetch(legacyUrl("/bridge/v1/dashboard/system-native/seo"), {
    headers: {
      Accept: "application/json",
      Cookie: request.headers.get("cookie") ?? "",
    },
    cache: "no-store",
  });

  return new NextResponse(await upstream.text(), {
    status: upstream.status,
    headers: { "content-type": upstream.headers.get("content-type") ?? "application/json" },
  });
}

export async function PUT(request: NextRequest) {
  const csrfError = assertCsrf(request);
  if (csrfError) return csrfError;

  const body = await request.text();
  if (!body) return jsonError("Invalid SEO payload.", 422);

  const upstream = await fetch(legacyUrl("/bridge/v1/dashboard/system-native/seo"), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Cookie: request.headers.get("cookie") ?? "",
    },
    body,
    cache: "no-store",
  });

  const response = new NextResponse(await upstream.text(), {
    status: upstream.status,
    headers: { "content-type": upstream.headers.get("content-type") ?? "application/json" },
  });
  appendHardenedSetCookies(response, upstream);
  return response;
}
