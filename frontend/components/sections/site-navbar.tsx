import type { BridgeSessionUser } from "@/lib/api";
import { getPublicMenus, getPublicSystemSettings } from "@/lib/api";
import { Navbar } from "@/components/sections/navbar";

export async function SiteNavbar({
  currentUser,
}: {
  currentUser?: BridgeSessionUser | null;
}) {
  const [settings, menus] = await Promise.all([
    getPublicSystemSettings(),
    getPublicMenus("primary"),
  ]);

  return <Navbar currentUser={currentUser} settings={settings} menuItems={menus?.[0]?.items ?? []} />;
}
