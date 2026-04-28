import { headers } from "next/headers";
import { ContentListSuite } from "@/components/dashboard/content-list-suite";
import { getDashboardPages } from "@/lib/api";

type DashboardPagesIndexPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardPagesIndexPage({
  searchParams,
}: DashboardPagesIndexPageProps) {
  const headerStore = await headers();
  const cookieHeader = headerStore.get("cookie") ?? "";
  const resolvedSearchParams = (await searchParams) ?? {};
  const pages = await getDashboardPages(cookieHeader, resolvedSearchParams);

  return <ContentListSuite resource="pages" payload={pages} searchParams={resolvedSearchParams} />;
}
