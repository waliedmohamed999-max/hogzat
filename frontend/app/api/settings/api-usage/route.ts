import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: 1,
    data: {
      today: 2847,
      month: 84291,
      successRate: 99.2,
      averageLatencyMs: 142,
      limits: {
        perMinute: { used: 847, total: 1000 },
        perDay: { used: 84291, total: 100000 },
        perMonth: { used: 84291, total: 1000000 },
      },
    },
  });
}
