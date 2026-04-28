import { NextResponse } from "next/server";
import { readToolsStore } from "../../_store";

export async function GET(_: Request, context: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await context.params;
  const store = await readToolsStore();
  const run = store.runs.find((item) => item.id === jobId);
  return NextResponse.json({ status: run?.status ?? "success", output: run?.output ?? [], duration: run?.duration ?? "0.0 ثانية", result: run ?? null });
}
