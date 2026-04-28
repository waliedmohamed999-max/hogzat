import { NextRequest, NextResponse } from "next/server";
import { getDashboardBookings } from "@/lib/api";

export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const data = await getDashboardBookings(request.headers.get("cookie") ?? "", params);

  if (!data) {
    return NextResponse.json({ message: "حدث خطأ في تحميل الحجوزات" }, { status: 500 });
  }

  return NextResponse.json({
    bookings: data.results,
    total: data.total,
    page: data.page,
    perPage: data.per_page,
    pages: data.pages ?? Math.max(1, Math.ceil(data.total / data.per_page)),
  });
}
