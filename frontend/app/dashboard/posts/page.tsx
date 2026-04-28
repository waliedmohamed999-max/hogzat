import { headers } from "next/headers";
import { ContentListSuite } from "@/components/dashboard/content-list-suite";
import { getDashboardPosts } from "@/lib/api";

type DashboardPostsIndexPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardPostsIndexPage({
  searchParams,
}: DashboardPostsIndexPageProps) {
  const headerStore = await headers();
  const cookieHeader = headerStore.get("cookie") ?? "";
  const resolvedSearchParams = (await searchParams) ?? {};
  const posts = await getDashboardPosts(cookieHeader, resolvedSearchParams);

  return <ContentListSuite resource="posts" payload={posts} searchParams={resolvedSearchParams} />;
}
