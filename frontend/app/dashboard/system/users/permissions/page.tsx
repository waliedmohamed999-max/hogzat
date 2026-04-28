import { headers } from "next/headers";
import { PermissionsMatrix } from "@/components/dashboard/permissions-matrix";
import { getDashboardPermissionsMatrix } from "@/lib/api";

export default async function DashboardUsersPermissionsPage() {
  const headerStore = await headers();
  const cookieHeader = headerStore.get("cookie") ?? "";
  const matrix = await getDashboardPermissionsMatrix(cookieHeader);

  return <PermissionsMatrix initialMatrix={matrix} />;
}
