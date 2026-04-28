import { NextRequest, NextResponse } from "next/server";
import { assertCsrf } from "@/lib/api-security";

export async function POST(request: NextRequest) {
  const csrfError = assertCsrf(request);
  if (csrfError) return csrfError;

  const payload = (await request.json().catch(() => null)) as { pages?: string[] } | null;
  const pages = payload?.pages ?? [];
  const broken = pages.filter((page) => page.includes("404") || page.includes("broken"));
  const redirects = pages.filter((page) => page.includes("old"));

  return NextResponse.json({
    healthy: Math.max(0, pages.length - broken.length - redirects.length),
    broken,
    redirects,
  });
}
