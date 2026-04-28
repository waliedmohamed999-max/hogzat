import { NextRequest, NextResponse } from "next/server";
import {
  assertCsrf,
  jsonError,
  normalizeNumericId,
  readJsonBody,
  requireDashboardSession,
} from "@/lib/api-security";
import { legacyUrl } from "@/lib/platform";
import { normalizeDeepText } from "@/lib/text";

export type ServiceEditorSavePayload = {
  type?: unknown;
  id?: unknown;
  values?: unknown;
};

type BridgePayload = {
  status?: number;
  message?: string;
  data?: {
    service_id?: number;
    public_url?: string;
  };
};

export function editorSegment(type: unknown) {
  if (type === "experience" || type === "experiences") {
    return "experiences";
  }

  if (type === "home" || type === "homes") {
    return "homes";
  }

  return null;
}

async function readBridgeJson(response: Response): Promise<BridgePayload | null> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return null;
  }

  try {
    return normalizeDeepText((await response.json()) as BridgePayload);
  } catch {
    return null;
  }
}

async function saveToBridge(request: NextRequest, segment: string, id: string, values: unknown) {
  return fetch(legacyUrl(`/bridge/v1/dashboard/services/${segment}/editor/${id}`), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Cookie: request.headers.get("cookie") ?? "",
    },
    body: JSON.stringify({ values }),
    cache: "no-store",
  });
}

async function createDraft(request: NextRequest, segment: string) {
  const response = await fetch(legacyUrl(`/bridge/v1/dashboard/services/${segment}/editor/new`), {
    method: "GET",
    headers: {
      Accept: "application/json",
      Cookie: request.headers.get("cookie") ?? "",
    },
    cache: "no-store",
  });

  const payload = await readBridgeJson(response);
  const id = normalizeNumericId(String(payload?.data?.service_id ?? ""));
  return response.ok && payload?.status && id ? id : null;
}

export async function handleServiceEditorSave(request: NextRequest, overrides: Partial<ServiceEditorSavePayload> = {}) {
  const authError = await requireDashboardSession(request);
  if (authError) return authError;

  const csrfError = assertCsrf(request);
  if (csrfError) return csrfError;

  const body = await readJsonBody<ServiceEditorSavePayload>(request);
  const payload = { ...(body ?? {}), ...overrides };

  if (!body) {
    return jsonError("طلب الحفظ غير صحيح.", 422);
  }

  const segment = editorSegment(payload.type);
  const id = normalizeNumericId(String(payload.id ?? ""));

  if (!segment || !id || typeof payload.values !== "object" || payload.values === null || Array.isArray(payload.values)) {
    return jsonError("تعذر تحديد العنصر المطلوب حفظه.", 422);
  }

  let savedId = id;
  let upstream = await saveToBridge(request, segment, savedId, payload.values);
  let bridgePayload = await readBridgeJson(upstream);

  if (!upstream.ok && upstream.status === 404) {
    const freshId = await createDraft(request, segment);
    if (freshId) {
      savedId = freshId;
      upstream = await saveToBridge(request, segment, savedId, payload.values);
      bridgePayload = await readBridgeJson(upstream);
    }
  }

  if (!upstream.ok || !bridgePayload) {
    return NextResponse.json(
      {
        status: 0,
        message:
          upstream.status === 404
            ? "تعذر العثور على مسودة قابلة للحفظ. افتح صفحة الإضافة من جديد ثم حاول مرة أخرى."
            : `تعذر الحفظ. رمز الاستجابة: ${upstream.status}`,
      },
      { status: upstream.status === 404 ? 502 : upstream.status || 500 },
    );
  }

  const serviceId = Number(bridgePayload.data?.service_id ?? savedId);

  return NextResponse.json(
    {
      status: bridgePayload.status ? 1 : 0,
      message: bridgePayload.status ? "تم حفظ التعديلات بنجاح" : bridgePayload.message || "تعذر حفظ التعديلات.",
      data: {
        ...(bridgePayload.data ?? {}),
        service_id: serviceId,
      },
    },
    { status: upstream.status },
  );
}
