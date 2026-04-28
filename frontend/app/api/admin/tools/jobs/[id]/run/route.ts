import { NextRequest, NextResponse } from "next/server";
import { assertCsrf } from "@/lib/api-security";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const csrfError = assertCsrf(request);
  if (csrfError) return csrfError;
  const { id } = await context.params;
  return NextResponse.json({ status: 1, jobId: id, output: ["تم تشغيل المهمة يدوياً"] });
}
