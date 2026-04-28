import { headers } from "next/headers";
import { PartnerRequestsManagement } from "@/components/dashboard/partner-requests-management";
import { getDashboardPartnerRequests, getDashboardPartnerStats } from "@/lib/api";

type DashboardPartnerRequestsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardPartnerRequestsPage({
  searchParams,
}: DashboardPartnerRequestsPageProps) {
  const headerStore = await headers();
  const cookieHeader = headerStore.get("cookie") ?? "";
  const resolvedSearchParams = (await searchParams) ?? {};
  const [requests, stats] = await Promise.all([
    getDashboardPartnerRequests(cookieHeader, resolvedSearchParams),
    getDashboardPartnerStats(cookieHeader),
  ]);

  return <PartnerRequestsManagement requests={requests} stats={stats} filters={resolvedSearchParams} />;
}
