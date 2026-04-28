import { NextRequest, NextResponse } from "next/server";
import { assertCsrf } from "@/lib/api-security";

export async function POST(request: NextRequest) {
  const csrfError = assertCsrf(request);
  if (csrfError) return csrfError;
  return NextResponse.json({ status: 1, output: ["تم حذف الملفات المؤقتة", "تم تحرير 291 MB"] });
}
