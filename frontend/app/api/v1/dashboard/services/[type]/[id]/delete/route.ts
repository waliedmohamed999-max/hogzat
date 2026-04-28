import { NextRequest } from "next/server";
import { jsonError, normalizeNumericId, proxyBridgeResponse } from "@/lib/api-security";

function resolveSegment(type: string) {
  return type === "homes" ? "homes" : type === "experiences" ? "experiences" : null;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ type: string; id: string }> },
) {
  const { type, id: rawId } = await context.params;
  const segment = resolveSegment(type);
  const id = normalizeNumericId(rawId);
  if (!segment || !id) {
    return jsonError("Invalid service target.", 400);
  }

  return proxyBridgeResponse(request, `dashboard/services/${segment}/${id}/delete`);
}
