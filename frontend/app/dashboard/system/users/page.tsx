import { headers } from "next/headers";
import { UsersManagement } from "@/components/dashboard/users-management";
import { getDashboardUsers, getDashboardUsersStats } from "@/lib/api";

type DashboardUsersPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardUsersPage({ searchParams }: DashboardUsersPageProps) {
  const headerStore = await headers();
  const cookieHeader = headerStore.get("cookie") ?? "";
  const resolvedSearchParams = (await searchParams) ?? {};
  const [users, stats] = await Promise.all([
    getDashboardUsers(cookieHeader, resolvedSearchParams),
    getDashboardUsersStats(cookieHeader),
  ]);

  return <UsersManagement users={users} stats={stats} filters={resolvedSearchParams} />;
}
