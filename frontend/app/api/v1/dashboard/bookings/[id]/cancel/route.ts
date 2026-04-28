import { NextRequest } from "next/server";
import { jsonError, normalizeNumericId, proxyBridgeResponse } from "@/lib/api-security";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id: rawId } = await context.params;
  const id = normalizeNumericId(rawId);
  if (!id) {
    return jsonError("Invalid booking target.", 400);
  }

  return proxyBridgeResponse(request, `dashboard/bookings/${id}/cancel`);
}
