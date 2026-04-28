import { headers } from "next/headers";
import { SearchResultsPage } from "@/components/pages/search-results-page";

type SearchPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function HomeSearchResultsPage({
  searchParams,
}: SearchPageProps) {
  const headerStore = await headers();
  const cookieHeader = headerStore.get("cookie") ?? "";

  return (
    <SearchResultsPage
      type="home"
      title="إقامات متاحة"
      eyebrow="نتائج الإقامات"
      searchParams={(await searchParams) ?? {}}
      cookieHeader={cookieHeader}
    />
  );
}
