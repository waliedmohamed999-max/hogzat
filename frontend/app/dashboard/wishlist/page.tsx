import { headers } from "next/headers";
import { WishlistSuite } from "@/components/dashboard/wishlist-suite";
import { type BridgeSessionUser, getSessionUser, getWishlist } from "@/lib/api";
import { DASHBOARD_SESSION_HEADER, decodeSessionHeader } from "@/lib/session-header";

export default async function DashboardWishlistPage() {
  const headerStore = await headers();
  const cookieHeader = headerStore.get("cookie") ?? "";
  const [currentUser, wishlist] = await Promise.all([
    decodeSessionHeader<BridgeSessionUser>(headerStore.get(DASHBOARD_SESSION_HEADER)) ?? getSessionUser(cookieHeader),
    getWishlist(cookieHeader),
  ]);

  if (!currentUser) {
    return null;
  }

  return <WishlistSuite currentUser={currentUser} wishlist={wishlist ?? []} />;
}
