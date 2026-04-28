import { NextRequest, NextResponse } from "next/server";
import { assertCsrf, appendHardenedSetCookies, checkRateLimit, jsonError } from "@/lib/api-security";
import { legacyUrl } from "@/lib/platform";

export async function POST(request: NextRequest) {
  const limited = checkRateLimit(request, "bookings-complete", 20);
  if (limited) return limited;

  const csrfError = assertCsrf(request);
  if (csrfError) return csrfError;

  const body = await request.text();
  if (!body) {
    return jsonError("Missing booking payload.", 400);
  }

  const upstream = await fetch(legacyUrl("/bridge/v1/bookings/complete"), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": request.headers.get("content-type") ?? "application/json",
      Cookie: request.headers.get("cookie") ?? "",
    },
    body,
    cache: "no-store",
  });

  const text = await upstream.text();
  const response = new NextResponse(text, {
    status: upstream.status,
    headers: {
      "content-type": upstream.headers.get("content-type") ?? "application/json",
    },
  });

  appendHardenedSetCookies(response, upstream);
  return response;
}
