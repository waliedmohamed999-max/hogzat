import { NextRequest, NextResponse } from "next/server";
import { appendHardenedSetCookies, assertCsrf, checkRateLimit, jsonError } from "@/lib/api-security";
import { legacyUrl } from "@/lib/platform";

export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(request, "partner-apply", 3);
  if (rateLimit) return rateLimit;

  const csrfError = assertCsrf(request);
  if (csrfError) return csrfError;

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return jsonError("Invalid partner application request.", 422);
  }

  const upstream = await fetch(legacyUrl("/bridge/v1/partners/apply"), {
    method: "POST",
    headers: {
      Accept: "application/json",
      Cookie: request.headers.get("cookie") ?? "",
    },
    body: formData,
    cache: "no-store",
  }).catch(() => null);

  if (!upstream) {
    return jsonError("Unable to submit partner application right now.", 503);
  }

  const response = new NextResponse(await upstream.text(), {
    status: upstream.status,
    headers: {
      "content-type": upstream.headers.get("content-type") ?? "application/json",
    },
  });
  appendHardenedSetCookies(response, upstream);
  return response;
}
