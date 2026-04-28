import { CouponsManager } from "@/components/dashboard/coupons-manager";
import { getDashboardCoupons } from "@/lib/api";
import { headers } from "next/headers";

type DashboardCouponsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardCouponsPage({ searchParams }: DashboardCouponsPageProps) {
  const headerStore = await headers();
  const cookieHeader = headerStore.get("cookie") ?? "";
  const resolvedSearchParams = (await searchParams) ?? {};
  const coupons = await getDashboardCoupons(cookieHeader, resolvedSearchParams);

  return <CouponsManager payload={coupons} />;
}
