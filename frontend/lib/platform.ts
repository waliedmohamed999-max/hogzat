const DEFAULT_LEGACY_BASE_URL = "http://127.0.0.1:8000";
const DEFAULT_PREMIUM_FRONTEND_URL = "http://localhost:3000";

function normalizeBaseUrl(url: string) {
  return url.replace(/\/+$/, "");
}

function normalizePath(path = "/") {
  return path.startsWith("/") ? path : `/${path}`;
}

export const legacyBaseUrl = normalizeBaseUrl(
  process.env.NEXT_PUBLIC_LEGACY_BASE_URL || DEFAULT_LEGACY_BASE_URL,
);

export const premiumFrontendUrl = normalizeBaseUrl(
  process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_PREMIUM_FRONTEND_URL,
);

export function buildUrl(baseUrl: string, path = "/") {
  return `${normalizeBaseUrl(baseUrl)}${normalizePath(path)}`;
}

export function legacyUrl(path = "/") {
  return buildUrl(legacyBaseUrl, path);
}

export function premiumUrl(path = "/") {
  return buildUrl(premiumFrontendUrl, path);
}

export function legacyHref(pathOrUrl = "/") {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  return legacyUrl(pathOrUrl);
}

export function normalizeFrontendHref(pathOrUrl = "/") {
  if (!pathOrUrl || pathOrUrl === "#") {
    return "#";
  }

  try {
    const legacy = new URL(legacyBaseUrl);
    const current = new URL(premiumFrontendUrl);
    const target = /^https?:\/\//i.test(pathOrUrl)
      ? new URL(pathOrUrl)
      : new URL(pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`, current.origin);

    if (target.origin === legacy.origin || target.origin === current.origin) {
      return `${target.pathname}${target.search}${target.hash}`;
    }
  } catch {
    return pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  }

  return pathOrUrl.startsWith("/") || /^https?:\/\//i.test(pathOrUrl) ? pathOrUrl : `/${pathOrUrl}`;
}
