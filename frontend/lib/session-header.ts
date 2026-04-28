export const DASHBOARD_SESSION_HEADER = "x-labayh-session";

export function encodeSessionHeader(session: unknown) {
  return encodeURIComponent(JSON.stringify(session));
}

export function decodeSessionHeader<T>(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(decodeURIComponent(value)) as T;
  } catch {
    return null;
  }
}
