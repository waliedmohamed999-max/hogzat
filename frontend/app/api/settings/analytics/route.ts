import { NextRequest, NextResponse } from "next/server";
import { assertCsrf } from "@/lib/api-security";
import { readGeneralStore, writeGeneralStore } from "../general/_store";

export async function PUT(request: NextRequest) {
  const csrfError = assertCsrf(request);
  if (csrfError) return csrfError;
  const analytics = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const store = await readGeneralStore();
  await writeGeneralStore({ ...store, analytics: analytics ?? {} });
  return NextResponse.json({ status: 1, data: analytics });
}
