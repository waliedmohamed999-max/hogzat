import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AuthAccessPanel } from "@/components/auth/auth-access-panel";
import { SiteNavbar } from "@/components/sections/site-navbar";
import { getPublicSystemSettings, getSessionUser } from "@/lib/api";
import { resolveBrand } from "@/lib/brand";

export default async function SignUpPage() {
  const headerStore = await headers();
  const cookieHeader = headerStore.get("cookie") ?? "";
  const [currentUser, publicSettings] = await Promise.all([
    getSessionUser(cookieHeader),
    getPublicSystemSettings(),
  ]);
  const siteBrand = resolveBrand(publicSettings);

  if (currentUser) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#fff5f6_0%,#f8f8f6_48%,#eef2ff_100%)] text-slate-950">
      <SiteNavbar currentUser={currentUser} />
      <AuthAccessPanel initialMode="register" brandName={siteBrand.nameAr} />
    </main>
  );
}
