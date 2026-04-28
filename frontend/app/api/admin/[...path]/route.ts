import { NextRequest, NextResponse } from "next/server";
import { appendHardenedSetCookies, assertCsrf, jsonError, requireAdminSession } from "@/lib/api-security";
import { legacyUrl } from "@/lib/platform";

const ALLOWED_SEGMENTS = /^[a-zA-Z0-9/_-]+$/;

async function proxyAdmin(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const authError = await requireAdminSession(request);
  if (authError) return authError;

  const csrfError = assertCsrf(request);
  if (csrfError) return csrfError;

  const { path } = await context.params;
  const joinedPath = path.join("/");
  if (!joinedPath || !ALLOWED_SEGMENTS.test(joinedPath)) {
    return jsonError("Invalid admin endpoint.", 404);
  }

  const search = request.nextUrl.searchParams.toString();
  const body = request.method === "GET" || request.method === "HEAD" ? undefined : await request.text();
  const upstream = await fetch(legacyUrl(`/bridge/v1/admin/${joinedPath}${search ? `?${search}` : ""}`), {
    method: request.method === "PUT" || request.method === "DELETE" ? "POST" : request.method,
    headers: {
      Accept: request.headers.get("accept") ?? "application/json",
      Cookie: request.headers.get("cookie") ?? "",
      ...(body ? { "Content-Type": request.headers.get("content-type") ?? "application/json" } : {}),
    },
    body: body || undefined,
    cache: "no-store",
  });

  const response = new NextResponse(await upstream.text(), {
    status: upstream.status,
    headers: {
      "content-type": upstream.headers.get("content-type") ?? "application/json",
      ...(upstream.headers.get("content-disposition")
        ? { "content-disposition": upstream.headers.get("content-disposition") as string }
        : {}),
    },
  });

  appendHardenedSetCookies(response, upstream);
  return response;
}

export const GET = proxyAdmin;
export const POST = proxyAdmin;
export const PUT = proxyAdmin;
export const DELETE = proxyAdmin;
