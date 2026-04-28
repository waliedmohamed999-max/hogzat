import { headers } from "next/headers";
import { MenuManager } from "@/components/dashboard/menu-manager";
import { getMenus } from "@/lib/api";

export default async function DashboardSystemMenusPage() {
  const headerStore = await headers();
  const cookieHeader = headerStore.get("cookie") ?? "";
  const menus = (await getMenus(cookieHeader)) ?? [];

  return <MenuManager initialMenus={menus} />;
}
