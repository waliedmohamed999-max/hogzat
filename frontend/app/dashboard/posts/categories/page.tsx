import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { PostTermsManager } from "@/components/dashboard/post-terms-manager";
import { getPostTerms } from "@/lib/api";

type DashboardPostsCategoriesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardPostsCategoriesPage({
  searchParams,
}: DashboardPostsCategoriesPageProps) {
  const headerStore = await headers();
  const cookieHeader = headerStore.get("cookie") ?? "";
  const resolvedSearchParams = (await searchParams) ?? {};
  const payload = await getPostTerms("post-category", cookieHeader, resolvedSearchParams);

  if (!payload) {
    notFound();
  }

  return <PostTermsManager payload={payload} title="Post categories" />;
}
