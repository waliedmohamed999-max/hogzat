import { NextRequest, NextResponse } from "next/server";
import { assertCsrf } from "@/lib/api-security";

export async function POST(request: NextRequest) {
  const csrfError = assertCsrf(request);
  if (csrfError) return csrfError;
  return NextResponse.json({ status: 1, data: { id: `backup_${Date.now()}`, size: "132 MB", date: new Date().toISOString() } });
}
