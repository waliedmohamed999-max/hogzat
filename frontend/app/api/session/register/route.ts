import { NextRequest, NextResponse } from "next/server";
import { legacyUrl } from "@/lib/platform";
import { appendHardenedSetCookies, checkRateLimit, jsonError, readJsonBody } from "@/lib/api-security";

export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(request, "session-register", 5);
  if (rateLimit) return rateLimit;

  const body = await readJsonBody<Record<string, unknown>>(request);
  if (!body) {
    return jsonError("Invalid registration request.", 422);
  }

  const upstream = await fetch(legacyUrl("/api/v1/register"), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(sanitizeRegistrationBody(body)),
  });

  const payload = await upstream.json().catch(() => ({
    status: 0,
    message: "Unable to complete registration right now.",
  }));

  if (upstream.ok && payload?.status === 1 && typeof body.email === "string" && typeof body.password === "string") {
    const login = await fetch(legacyUrl("/bridge/v1/session/login"), {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Cookie: request.headers.get("cookie") ?? "",
      },
      body: JSON.stringify({
        email: body.email,
        password: body.password,
        remember: true,
        return_url: "/",
      }),
      cache: "no-store",
    }).catch(() => null);

    if (login) {
      const response = NextResponse.json({ ...payload, redirect: "/" }, {
        status: login.ok ? 200 : (upstream.ok ? 200 : upstream.status),
      });
      appendHardenedSetCookies(response, login);
      return response;
    }
  }

  return NextResponse.json(payload, {
    status: upstream.ok ? 200 : upstream.status,
  });
}

function sanitizeRegistrationBody(body: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(body).map(([key, value]) => [
      key,
      typeof value === "string" ? value.trim().slice(0, 500) : value,
    ]),
  );
}
