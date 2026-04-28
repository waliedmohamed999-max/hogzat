import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { SystemToolsManager } from "@/components/dashboard/system-tools-manager";
import { getSystemTools } from "@/lib/api";

export default async function DashboardSystemToolsPage() {
  const headerStore = await headers();
  const cookieHeader = headerStore.get("cookie") ?? "";
  const payload = await getSystemTools(cookieHeader);

  if (!payload) {
    notFound();
  }

  return <SystemToolsManager payload={payload} />;
}
