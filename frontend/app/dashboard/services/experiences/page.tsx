import { headers } from "next/headers";
import { ManagedExperiencesSuite } from "@/components/dashboard/managed-experiences-suite";
import { getManagedExperiences } from "@/lib/api";

type ManagedExperiencesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ManagedExperiencesPage({ searchParams }: ManagedExperiencesPageProps) {
  const headerStore = await headers();
  const cookieHeader = headerStore.get("cookie") ?? "";
  const resolvedSearchParams = (await searchParams) ?? {};
  const managed = await getManagedExperiences(cookieHeader, resolvedSearchParams);
  const category = Array.isArray(resolvedSearchParams.category)
    ? resolvedSearchParams.category[0]
    : resolvedSearchParams.category;

  return <ManagedExperiencesSuite managed={managed} initialCategory={category || "all"} />;
}
