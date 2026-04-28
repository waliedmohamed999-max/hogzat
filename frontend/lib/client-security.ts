"use client";

import { CSRF_COOKIE_NAME } from "@/lib/security-constants";

function readCookie(name: string) {
  if (typeof document === "undefined") {
    return "";
  }

  return document.cookie
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.slice(name.length + 1) ?? "";
}

function createClientToken() {
  const bytes = new Uint8Array(24);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function ensureCsrfToken() {
  const current = decodeURIComponent(readCookie(CSRF_COOKIE_NAME));
  if (current || typeof document === "undefined") {
    return current;
  }

  const next = createClientToken();
  document.cookie = `${CSRF_COOKIE_NAME}=${encodeURIComponent(next)}; path=/; samesite=strict`;
  return next;
}

export function secureFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const method = (init.method ?? "GET").toUpperCase();
  const headers = new Headers(init.headers);

  if (method !== "GET" && method !== "HEAD" && method !== "OPTIONS") {
    const csrfToken = ensureCsrfToken();
    if (csrfToken) {
      headers.set("X-CSRF-Token", csrfToken);
    }
  }

  return fetch(input, {
    ...init,
    headers,
  });
}
