import { NextRequest, NextResponse } from "next/server";
import { getDashboardBookingStats } from "@/lib/api";

export async function GET(request: NextRequest) {
  const data = await getDashboardBookingStats(request.headers.get("cookie") ?? "");

  if (!data) {
    return NextResponse.json({ message: "حدث خطأ في تحميل إحصائيات الحجوزات" }, { status: 500 });
  }

  return NextResponse.json(data);
}
