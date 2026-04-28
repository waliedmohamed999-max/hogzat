import { NextRequest } from "next/server";
import { jsonError, proxyBridgeResponse } from "@/lib/api-security";
import { handleServiceEditorSave } from "@/lib/service-editor-save";

const ALLOWED_SEGMENTS = /^[a-zA-Z0-9/_-]+$/;
const ALLOWED_PREFIXES = ["dashboard/", "notifications/"];

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const joinedPath = path.join("/");

  if (joinedPath === "dashboard/services/editor-save") {
    return handleServiceEditorSave(request);
  }

  if (!ALLOWED_PREFIXES.some((prefix) => joinedPath.startsWith(prefix)) || !ALLOWED_SEGMENTS.test(joinedPath)) {
    return jsonError("Invalid dashboard endpoint.", 404);
  }

  const body = await request.text();
  return proxyBridgeResponse(request, joinedPath, {
    body: body || undefined,
    contentType: body ? request.headers.get("content-type") ?? "application/json" : null,
  });
}
