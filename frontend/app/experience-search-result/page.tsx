import { headers } from "next/headers";
import { SearchResultsPage } from "@/components/pages/search-results-page";

type SearchPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ExperienceSearchResultsPage({
  searchParams,
}: SearchPageProps) {
  const headerStore = await headers();
  const cookieHeader = headerStore.get("cookie") ?? "";

  return (
    <SearchResultsPage
      type="experience"
      title="تجارب متاحة"
      eyebrow="نتائج التجارب"
      searchParams={(await searchParams) ?? {}}
      cookieHeader={cookieHeader}
    />
  );
}
