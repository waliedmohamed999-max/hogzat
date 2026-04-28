import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { LanguagesManager } from "@/components/dashboard/languages-manager";
import { getLanguages } from "@/lib/api";

type DashboardSystemLanguagesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardSystemLanguagesPage({
  searchParams,
}: DashboardSystemLanguagesPageProps) {
  const headerStore = await headers();
  const cookieHeader = headerStore.get("cookie") ?? "";
  const resolvedSearchParams = (await searchParams) ?? {};
  const payload = await getLanguages(cookieHeader, resolvedSearchParams);

  if (!payload) {
    notFound();
  }

  return <LanguagesManager payload={payload} />;
}
