import { NextRequest } from "next/server";
import { proxyBridgeResponse } from "@/lib/api-security";

export async function POST(request: NextRequest) {
  const body = await request.text();
  return proxyBridgeResponse(request, "profile", {
    body: body || undefined,
    contentType: request.headers.get("content-type") ?? "application/json",
  });
}
