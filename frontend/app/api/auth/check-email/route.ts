import { NextRequest, NextResponse } from "next/server";
import { legacyUrl } from "@/lib/platform";

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email") ?? "";
  const upstream = await fetch(legacyUrl(`/bridge/v1/auth/check-email?email=${encodeURIComponent(email)}`), {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  }).catch(() => null);

  if (!upstream) {
    return NextResponse.json({ status: 0, available: false, message: "Unable to check email right now." }, { status: 503 });
  }

  return new NextResponse(await upstream.text(), {
    status: upstream.status,
    headers: {
      "content-type": upstream.headers.get("content-type") ?? "application/json",
    },
  });
}
