import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { PostCommentsManager } from "@/components/dashboard/post-comments-manager";
import { getPostComments } from "@/lib/api";

type DashboardPostsCommentsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardPostsCommentsPage({
  searchParams,
}: DashboardPostsCommentsPageProps) {
  const headerStore = await headers();
  const cookieHeader = headerStore.get("cookie") ?? "";
  const resolvedSearchParams = (await searchParams) ?? {};
  const payload = await getPostComments(cookieHeader, resolvedSearchParams);

  if (!payload) {
    notFound();
  }

  return <PostCommentsManager payload={payload} />;
}
