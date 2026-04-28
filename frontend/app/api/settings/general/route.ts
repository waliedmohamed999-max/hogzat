import { NextResponse } from "next/server";
import { readGeneralStore } from "./_store";

export async function GET() {
  return NextResponse.json({ status: 1, data: await readGeneralStore() });
}
