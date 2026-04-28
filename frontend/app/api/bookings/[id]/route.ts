import { NextRequest, NextResponse } from "next/server";
import { getDashboardBookingDetail } from "@/lib/api";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const bookingId = Number(id);

  if (!Number.isInteger(bookingId) || bookingId <= 0) {
    return NextResponse.json({ message: "رقم الحجز غير صالح" }, { status: 400 });
  }

  const data = await getDashboardBookingDetail(bookingId, request.headers.get("cookie") ?? "");

  if (!data) {
    return NextResponse.json({ message: "لم يتم العثور على الحجز" }, { status: 404 });
  }

  return NextResponse.json(data);
}
