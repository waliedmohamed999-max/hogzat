import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { TranslationManager } from "@/components/dashboard/translation-manager";
import { getTranslationData } from "@/lib/api";

type DashboardSystemTranslationPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardSystemTranslationPage({
  searchParams,
}: DashboardSystemTranslationPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const selectedLang = Array.isArray(resolvedSearchParams.lang)
    ? resolvedSearchParams.lang[0]
    : resolvedSearchParams.lang || "none";
  const headerStore = await headers();
  const cookieHeader = headerStore.get("cookie") ?? "";
  const payload = await getTranslationData(selectedLang, cookieHeader);

  if (!payload) {
    notFound();
  }

  return <TranslationManager payload={payload} />;
}
