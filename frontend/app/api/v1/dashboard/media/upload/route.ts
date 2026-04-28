import { NextRequest } from "next/server";
import { assertCsrf, jsonError, proxyBridgeResponse, requireDashboardSession } from "@/lib/api-security";

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(request: NextRequest) {
  const authError = await requireDashboardSession(request);
  if (authError) return authError;

  const csrfError = assertCsrf(request);
  if (csrfError) return csrfError;

  const incoming = await request.formData();
  const file = incoming.get("file");

  if (!(file instanceof File)) {
    return jsonError("No file uploaded.", 422);
  }

  if (!ALLOWED_MIME_TYPES.has(file.type) || file.size <= 0 || file.size > MAX_UPLOAD_BYTES) {
    return jsonError("Invalid upload file.", 422);
  }

  const formData = new FormData();
  formData.append("file", file);

  return proxyBridgeResponse(request, "dashboard/media/upload", {
    body: formData,
    contentType: null,
  });
}
