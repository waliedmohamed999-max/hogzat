import { NextRequest, NextResponse } from "next/server";
import { assertCsrf } from "@/lib/api-security";
import type { PaymentMethod } from "@/lib/payment-methods";
import { getGateways, saveGateways } from "../_store";

export async function GET() {
  const gateways = await getGateways();
  return NextResponse.json({ status: 1, data: gateways });
}

export async function PUT(request: NextRequest) {
  const csrfError = assertCsrf(request);
  if (csrfError) return csrfError;
  const body = (await request.json().catch(() => null)) as { gateways?: unknown[] } | null;
  const saved = await saveGateways(Array.isArray(body?.gateways) ? (body.gateways as Partial<PaymentMethod>[]) : []);
  return NextResponse.json({ status: 1, message: "تم حفظ بوابات الدفع.", data: saved });
}
