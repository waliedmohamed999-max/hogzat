import { NextRequest } from "next/server";
import { jsonError, normalizeNumericId, proxyBridgeResponse, readJsonBody } from "@/lib/api-security";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: NextRequest, context: RouteContext) {
  const { id: rawId } = await context.params;
  const id = normalizeNumericId(rawId);

  if (!id) {
    return jsonError("رقم الحجز غير صالح", 400);
  }

  const body = await readJsonBody<{ status?: unknown }>(request);
  const status = typeof body?.status === "string" ? body.status : "";

  if (status === "confirmed") {
    return proxyBridgeResponse(request, `dashboard/bookings/${id}/confirm`);
  }

  if (status === "canceled") {
    return proxyBridgeResponse(request, `dashboard/bookings/${id}/cancel`);
  }

  return jsonError("حالة الحجز غير مدعومة", 422);
}
