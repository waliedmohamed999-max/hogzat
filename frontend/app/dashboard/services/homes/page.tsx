import { headers } from "next/headers";
import { ManagedHomesSuite } from "@/components/dashboard/managed-homes-suite";
import { getManagedHomes } from "@/lib/api";

type ManagedHomesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ManagedHomesPage({ searchParams }: ManagedHomesPageProps) {
  const headerStore = await headers();
  const cookieHeader = headerStore.get("cookie") ?? "";
  const resolvedSearchParams = (await searchParams) ?? {};
  const managed = await getManagedHomes(cookieHeader, resolvedSearchParams);

  return <ManagedHomesSuite managed={managed} />;
}
