import { NextRequest, NextResponse } from "next/server";
import { assertCsrf } from "@/lib/api-security";
import { getGateways, saveGateways } from "../../_store";

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const csrfError = assertCsrf(request);
  if (csrfError) return csrfError;
  const { id } = await context.params;
  const patch = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const gateways = await getGateways();
  const saved = await saveGateways(gateways.map((gateway) => (gateway.key === id ? { ...gateway, ...patch } : gateway)));
  return NextResponse.json({ status: 1, message: "تم تحديث البوابة.", data: saved.find((gateway) => gateway.key === id) });
}
