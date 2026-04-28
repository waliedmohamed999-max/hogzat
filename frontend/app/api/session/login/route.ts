import { NextRequest, NextResponse } from "next/server";
import { legacyBaseUrl, legacyUrl, normalizeFrontendHref } from "@/lib/platform";
import {
  appendHardenedSetCookies,
  checkRateLimit,
  jsonError,
  readJsonBody,
} from "@/lib/api-security";

type LoginRequestBody = {
  email?: unknown;
  password?: unknown;
  rememberMe?: unknown;
  mobile?: unknown;
  digit1?: unknown;
  digit2?: unknown;
  digit3?: unknown;
  digit4?: unknown;
  remember?: unknown;
  return_url?: unknown;
};

export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(request, "session-login", 10);
  if (rateLimit) return rateLimit;

  const payload = await readJsonBody<LoginRequestBody>(request);
  if (!payload) {
    return jsonError("Invalid login request.", 422);
  }

  const email = String(payload.email ?? "").trim().slice(0, 190);
  const password = String(payload.password ?? "");
  const mobile = String(payload.mobile ?? "").replace(/[^\d+]/g, "").slice(0, 20);
  const code = [payload.digit1, payload.digit2, payload.digit3, payload.digit4].map((digit) =>
    String(digit ?? "").replace(/\D/g, "").slice(0, 1),
  );

  const isEmailLogin = email.includes("@") || password.length > 0;
  if (isEmailLogin && (!email || password.length < 6)) {
    return jsonError("Invalid login request.", 422);
  }

  if (!isEmailLogin && (!mobile || code.some((digit) => digit.length !== 1))) {
    return jsonError("Invalid login request.", 422);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000);

  try {
    const upstream = await fetch(legacyUrl("/bridge/v1/session/login"), {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Cookie: request.headers.get("cookie") ?? "",
      },
      body: JSON.stringify(isEmailLogin ? {
        email,
        password,
        remember: Boolean(payload.remember ?? payload.rememberMe),
        rememberMe: Boolean(payload.remember ?? payload.rememberMe),
        return_url:
          typeof payload.return_url === "string" && payload.return_url.startsWith("/")
            ? payload.return_url.slice(0, 200)
            : "/",
      } : {
        mobile,
        digit1: code[0],
        digit2: code[1],
        digit3: code[2],
        digit4: code[3],
        remember: Boolean(payload.remember),
        return_url:
          typeof payload.return_url === "string" && payload.return_url.startsWith("/")
            ? payload.return_url.slice(0, 200)
            : "/dashboard",
      }),
      cache: "no-store",
      signal: controller.signal,
    });

    const text = await upstream.text();
    const contentType = upstream.headers.get("content-type") ?? "application/json";
    let responseBody = text;

    if (contentType.includes("application/json")) {
      const payload = JSON.parse(text) as Record<string, unknown>;
      const requestedReturnUrl =
        typeof payload.return_url === "string" ? payload.return_url : isEmailLogin ? "/" : "/dashboard";
      const upstreamRedirect =
        typeof payload.redirect === "string"
          ? payload.redirect
          : typeof payload.dashboard_url === "string"
            ? payload.dashboard_url
            : requestedReturnUrl;

      payload.redirect = normalizeDashboardRedirect(upstreamRedirect, requestedReturnUrl);
      responseBody = JSON.stringify(payload);
    }

    const response = new NextResponse(responseBody, {
      status: upstream.status,
      headers: {
        "content-type": contentType,
      },
    });

    appendHardenedSetCookies(response, upstream);
    return response;
  } catch {
    return jsonError("Unable to reach the login service right now.", 503);
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeDashboardRedirect(value: string, fallback: string) {
  const normalized = normalizeFrontendHref(value || fallback);

  if (/^https?:\/\//i.test(normalized)) {
    try {
      const legacy = new URL(legacyBaseUrl);
      const target = new URL(normalized);
      if (target.origin === legacy.origin) {
        return `${target.pathname}${target.search}${target.hash}`;
      }
    } catch {
      return fallback.startsWith("/") ? fallback : "/";
    }
  }

  return normalized.startsWith("/") ? normalized : fallback.startsWith("/") ? fallback : "/";
}
