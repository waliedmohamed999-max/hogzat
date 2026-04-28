import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export async function GET() {
  const sitemapPath = path.join(process.cwd(), "public", "sitemap.xml");
  const xml = await readFile(sitemapPath, "utf8").catch(() =>
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>https://labayh.com</loc></url>\n</urlset>\n`,
  );
  return new NextResponse(xml, {
    headers: { "content-type": "application/xml; charset=utf-8" },
  });
}
