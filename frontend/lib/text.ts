const MOJIBAKE_MARKERS = /[\u00c2\u00c3\u00d8\u00d9\u0152\u0160\u0178\u201a\u201e\u2020\u02c6]/;

function charToByte(char: string): number[] {
  const code = char.charCodeAt(0);
  if (code <= 0xff) {
    return [code];
  }

  const cp1252: Record<number, number> = {
    0x0152: 0x8c,
    0x0153: 0x9c,
    0x0160: 0x8a,
    0x0161: 0x9a,
    0x0178: 0x9f,
    0x017d: 0x8e,
    0x017e: 0x9e,
    0x0192: 0x83,
    0x02c6: 0x88,
    0x02dc: 0x98,
    0x2013: 0x96,
    0x2014: 0x97,
    0x2018: 0x91,
    0x2019: 0x92,
    0x201a: 0x82,
    0x201c: 0x93,
    0x201d: 0x94,
    0x201e: 0x84,
    0x2020: 0x86,
    0x2021: 0x87,
    0x2022: 0x95,
    0x2026: 0x85,
    0x2030: 0x89,
    0x2039: 0x8b,
    0x203a: 0x9b,
    0x20ac: 0x80,
    0x2122: 0x99,
  };

  const mapped = cp1252[code];
  return mapped === undefined ? [] : [mapped];
}

function decodeUtf8(bytes: number[]) {
  return new TextDecoder("utf-8", { fatal: true }).decode(new Uint8Array(bytes));
}

export function normalizeText(value: string) {
  if (!MOJIBAKE_MARKERS.test(value)) {
    return value;
  }

  const bytes: number[] = [];
  for (const char of value) {
    const next = charToByte(char);
    if (!next.length) {
      return value;
    }
    bytes.push(...next);
  }

  try {
    return decodeUtf8(bytes);
  } catch {
    return value;
  }
}

export function normalizeDeepText<T>(value: T): T {
  if (typeof value === "string") {
    return normalizeText(value) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeDeepText(item)) as T;
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, normalizeDeepText(item)]),
    ) as T;
  }

  return value;
}
