import { NextRequest, NextResponse } from "next/server";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { assertCsrf, jsonError } from "@/lib/api-security";

const defaultRobots = "User-agent: *\nAllow: /\nDisallow: /dashboard\nSitemap: https://labayh.com/sitemap.xml\n";

export async function GET() {
  const filePath = path.join(process.cwd(), "public", "robots.txt");
  const content = await readFile(filePath, "utf8").catch(() => defaultRobots);
  return NextResponse.json({ status: 1, content });
}

export async function PUT(request: NextRequest) {
  const csrfError = assertCsrf(request);
  if (csrfError) return csrfError;

  const payload = (await request.json().catch(() => null)) as { content?: string } | null;
  const content = String(payload?.content ?? "").slice(0, 20_000);
  if (!content.trim()) return jsonError("robots.txt content is required.", 422);

  const publicDir = path.join(process.cwd(), "public");
  await mkdir(publicDir, { recursive: true });
  await writeFile(path.join(publicDir, "robots.txt"), content, "utf8");
  return NextResponse.json({ status: 1, message: "robots.txt saved." });
}
