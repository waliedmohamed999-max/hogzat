import { NextResponse } from "next/server";
import { revenueChart } from "../_store";

export async function GET() {
  return NextResponse.json({ status: 1, data: revenueChart() });
}
