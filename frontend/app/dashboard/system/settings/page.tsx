import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { SettingsForm } from "@/components/dashboard/settings-form";
import { getSystemSettings } from "@/lib/api";

export default async function DashboardSystemSettingsPage() {
  const headerStore = await headers();
  const cookieHeader = headerStore.get("cookie") ?? "";
  const settings = await getSystemSettings(cookieHeader);

  if (!settings) {
    notFound();
  }

  return <SettingsForm initialData={settings} />;
}
