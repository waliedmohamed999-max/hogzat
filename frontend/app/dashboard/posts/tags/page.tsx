import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { PostTermsManager } from "@/components/dashboard/post-terms-manager";
import { getPostTerms } from "@/lib/api";

type DashboardPostsTagsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardPostsTagsPage({
  searchParams,
}: DashboardPostsTagsPageProps) {
  const headerStore = await headers();
  const cookieHeader = headerStore.get("cookie") ?? "";
  const resolvedSearchParams = (await searchParams) ?? {};
  const payload = await getPostTerms("post-tag", cookieHeader, resolvedSearchParams);

  if (!payload) {
    notFound();
  }

  return <PostTermsManager payload={payload} title="Post tags" />;
}
