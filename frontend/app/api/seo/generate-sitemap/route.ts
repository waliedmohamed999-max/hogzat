import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { assertCsrf } from "@/lib/api-security";

type SitemapPage = {
  slug?: string;
  priority?: number;
  changefreq?: string;
};

export async function POST(request: NextRequest) {
  const csrfError = assertCsrf(request);
  if (csrfError) return csrfError;

  const payload = (await request.json().catch(() => null)) as { pages?: SitemapPage[] } | null;
  const pages = payload?.pages?.length ? payload.pages : [{ slug: "", priority: 1, changefreq: "daily" }];
  const now = new Date().toISOString();
  const urls = pages.map((page) => {
    const loc = `https://labayh.com/${page.slug ?? ""}`.replace(/\/$/, "");
    return [
      "  <url>",
      `    <loc>${loc || "https://labayh.com"}</loc>`,
      `    <lastmod>${now}</lastmod>`,
      `    <changefreq>${page.changefreq ?? "weekly"}</changefreq>`,
      `    <priority>${Number(page.priority ?? 0.8).toFixed(1)}</priority>`,
      "  </url>",
    ].join("\n");
  });
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
  const publicDir = path.join(process.cwd(), "public");
  await mkdir(publicDir, { recursive: true });
  await writeFile(path.join(publicDir, "sitemap.xml"), xml, "utf8");
  return NextResponse.json({ status: 1, generated_at: now, pages_count: pages.length });
}
