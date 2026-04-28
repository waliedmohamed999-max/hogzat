import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ProfileManager } from "@/components/dashboard/profile-manager";
import { type BridgeSessionUser, getProfile, getSessionUser } from "@/lib/api";
import { DASHBOARD_SESSION_HEADER, decodeSessionHeader } from "@/lib/session-header";

export default async function DashboardProfilePage() {
  const headerStore = await headers();
  const cookieHeader = headerStore.get("cookie") ?? "";
  const [currentUser, profile] = await Promise.all([
    decodeSessionHeader<BridgeSessionUser>(headerStore.get(DASHBOARD_SESSION_HEADER)) ?? getSessionUser(cookieHeader),
    getProfile(cookieHeader),
  ]);

  if (!currentUser) {
    redirect("/auth/login?return_url=/dashboard/profile");
  }

  if (!profile) {
    return null;
  }

  return <ProfileManager profile={profile} />;
}
