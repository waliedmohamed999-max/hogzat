import { AppPromoSection } from "@/components/sections/app-promo";
import { CategoriesSection } from "@/components/sections/categories";
import { DestinationsSection } from "@/components/sections/destinations";
import { FeaturedListingsSection } from "@/components/sections/featured-listings";
import { Footer } from "@/components/sections/footer";
import { Hero } from "@/components/sections/hero";
import { SiteNavbar } from "@/components/sections/site-navbar";
import { PlatformFeaturesSection } from "@/components/sections/platform-features";
import { UrgentDealsSection } from "@/components/sections/urgent-deals";
import { headers } from "next/headers";
import {
  getFeaturedPromotions,
  getHomeProducts,
  getLastMinuteHomes,
  getPublicMenus,
  getPublicSystemSettings,
  getSessionUser,
  getWishlist,
} from "@/lib/api";

export default async function Home() {
  const headerStore = await headers();
  const cookieHeader = headerStore.get("cookie") ?? "";
  const currentUser = await getSessionUser(cookieHeader);

  const [
    homeProducts,
    featuredPromotions,
    lastMinuteHomes,
    publicSettings,
    wishlist,
    heroQuickMenus,
    categoryMenus,
    appPromoMenus,
    platformFeatureMenus,
  ] = await Promise.all([
    getHomeProducts(),
    getFeaturedPromotions(),
    getLastMinuteHomes(cookieHeader),
    getPublicSystemSettings(),
    currentUser ? getWishlist(cookieHeader) : Promise.resolve([]),
    getPublicMenus("hero-quick-links"),
    getPublicMenus("home-categories"),
    getPublicMenus("app-promo-links"),
    getPublicMenus("platform-features"),
  ]);
  const savedIds = (wishlist ?? []).map((item) => item.id);

  return (
    <main className="min-h-screen bg-[#f8f8f6] text-slate-950">
      <SiteNavbar currentUser={currentUser} />
      <Hero settings={publicSettings} quickLinks={heroQuickMenus?.[0]?.items ?? []} />
      <CategoriesSection menuItems={categoryMenus?.[0]?.items ?? []} />
      <DestinationsSection
        items={homeProducts}
        savedIds={savedIds}
        isAuthenticated={Boolean(currentUser)}
      />
      <FeaturedListingsSection
        items={featuredPromotions}
        savedIds={savedIds}
        isAuthenticated={Boolean(currentUser)}
      />
      <UrgentDealsSection items={featuredPromotions} lastMinuteHomes={lastMinuteHomes} />
      <AppPromoSection ctaItems={appPromoMenus?.[0]?.items ?? []} />
      <PlatformFeaturesSection menuItems={platformFeatureMenus?.[0]?.items ?? []} />
      <Footer />
    </main>
  );
}
