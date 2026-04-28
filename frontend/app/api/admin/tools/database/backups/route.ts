import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ status: 1, data: [{ id: "backup_1", date: "2026-04-18", size: "128 MB" }] });
}
