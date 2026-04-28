import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: 1,
    data: [
      { name: "users", records: 12480, size: "84 MB", updatedAt: "منذ ساعة" },
      { name: "posts", records: 3204, size: "126 MB", updatedAt: "اليوم" },
      { name: "bookings", records: 9442, size: "310 MB", updatedAt: "منذ 10 دقائق" },
    ],
  });
}
