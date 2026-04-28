import { NextRequest } from "next/server";
import { jsonError, normalizeNumericId, proxyBridgeResponse } from "@/lib/api-security";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const { id: rawId } = await context.params;
  const id = normalizeNumericId(rawId);

  if (!id) {
    return jsonError("رقم الصفقة غير صالح", 400);
  }

  const body = await request.text();
  return proxyBridgeResponse(request, `dashboard/last-minute/homes/${id}`, {
    body: body || undefined,
    contentType: body ? request.headers.get("content-type") ?? "application/json" : null,
  });
}
