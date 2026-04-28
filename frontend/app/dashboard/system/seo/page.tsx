import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { SeoManager } from "@/components/dashboard/seo-manager";
import { getSeoData } from "@/lib/api";

export default async function DashboardSystemSeoPage() {
  const headerStore = await headers();
  const cookieHeader = headerStore.get("cookie") ?? "";
  const payload = await getSeoData(cookieHeader);

  if (!payload) {
    notFound();
  }

  return <SeoManager payload={payload} />;
}
