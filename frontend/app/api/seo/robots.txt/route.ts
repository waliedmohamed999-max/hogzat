import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export async function GET() {
  const content = await readFile(path.join(process.cwd(), "public", "robots.txt"), "utf8").catch(() =>
    "User-agent: *\nAllow: /\nDisallow: /dashboard\nSitemap: https://labayh.com/sitemap.xml\n",
  );
  return new NextResponse(content, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
