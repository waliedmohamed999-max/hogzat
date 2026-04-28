import { NextRequest } from "next/server";
import { jsonError, normalizeNumericId, proxyBridgeResponse, readJsonBody } from "@/lib/api-security";

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

  const payload = await readJsonBody<{ status?: unknown }>(request);
  const status = typeof payload?.status === "string" ? payload.status : "";
  if (!/^(publish|draft|pending|trash)$/.test(status)) {
    return jsonError("Invalid status value.", 422);
  }

  return proxyBridgeResponse(request, `dashboard/services/${segment}/${id}/status`, {
    body: JSON.stringify({ status }),
    contentType: "application/json",
  });
}
