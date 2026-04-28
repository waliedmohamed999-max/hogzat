import { NextRequest, NextResponse } from "next/server";
import { appendHardenedSetCookies, assertCsrf, requireDashboardSession } from "@/lib/api-security";
import { legacyUrl } from "@/lib/platform";

export async function POST(request: NextRequest) {
  const authError = await requireDashboardSession(request);
  if (authError) return authError;

  const csrfError = assertCsrf(request);
  if (csrfError) return csrfError;

  const upstream = await fetch(legacyUrl("/bridge/v1/dashboard/finance/ledger?per_page=1"), {
    headers: {
      Accept: "application/json",
      Cookie: request.headers.get("cookie") ?? "",
    },
    cache: "no-store",
  });

  const payload = (await upstream.json().catch(() => null)) as { status?: number; message?: string } | null;
  const response = NextResponse.json(
    {
      status: upstream.ok && payload?.status !== 0 ? 1 : 0,
      message: upstream.ok && payload?.status !== 0 ? "تم تشغيل مطابقة بوابات الدفع." : payload?.message || "تعذرت المطابقة.",
      data: payload,
    },
    { status: upstream.status },
  );

  appendHardenedSetCookies(response, upstream);
  return response;
}
