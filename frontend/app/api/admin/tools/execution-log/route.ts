import { NextResponse } from "next/server";
import { readToolsStore } from "../_store";

export async function GET() {
  const store = await readToolsStore();
  return NextResponse.json({ status: 1, data: store.runs });
}
