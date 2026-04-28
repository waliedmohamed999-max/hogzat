import { NextRequest, NextResponse } from "next/server";
import { appendHardenedSetCookies, requireDashboardSession } from "@/lib/api-security";
import { legacyUrl } from "@/lib/platform";

export async function GET(request: NextRequest) {
  const authError = await requireDashboardSession(request);
  if (authError) return authError;

  const type = request.nextUrl.searchParams.get("type") === "vat" ? "vat" : "ledger";
  const upstream = await fetch(legacyUrl(`/bridge/v1/dashboard/finance/export?type=${type}`), {
    headers: {
      Accept: "text/csv",
      Cookie: request.headers.get("cookie") ?? "",
    },
    cache: "no-store",
  });

  const body = await upstream.arrayBuffer();
  const response = new NextResponse(body, {
    status: upstream.status,
    headers: {
      "content-type": upstream.headers.get("content-type") ?? "text/csv; charset=UTF-8",
      "content-disposition":
        upstream.headers.get("content-disposition") ?? `attachment; filename="${type}.csv"`,
    },
  });

  appendHardenedSetCookies(response, upstream);
  return response;
}
