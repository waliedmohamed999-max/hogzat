import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { AlertsManager } from "@/components/dashboard/alerts-manager";
import { getNotifications } from "@/lib/api";

type DashboardAlertsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardAlertsPage({
  searchParams,
}: DashboardAlertsPageProps) {
  const headerStore = await headers();
  const cookieHeader = headerStore.get("cookie") ?? "";
  const resolvedSearchParams = (await searchParams) ?? {};
  const payload = await getNotifications(cookieHeader, resolvedSearchParams);

  if (!payload) {
    notFound();
  }

  return <AlertsManager initialPayload={payload} />;
}
