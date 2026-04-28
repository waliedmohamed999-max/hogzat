import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { ApiSettingsManager } from "@/components/dashboard/api-settings-manager";
import { getApiSettings } from "@/lib/api";

export default async function DashboardSystemApiPage() {
  const headerStore = await headers();
  const cookieHeader = headerStore.get("cookie") ?? "";
  const payload = await getApiSettings(cookieHeader);

  if (!payload) {
    notFound();
  }

  return <ApiSettingsManager payload={payload} />;
}
