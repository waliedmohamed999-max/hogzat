import { NextResponse } from "next/server";
import { paymentStats, readPaymentsStore } from "../_store";

export async function GET() {
  const store = await readPaymentsStore();
  return NextResponse.json({ status: 1, data: paymentStats(store) });
}
