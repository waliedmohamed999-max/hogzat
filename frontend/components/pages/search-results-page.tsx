import { Footer } from "@/components/sections/footer";
import { SiteNavbar } from "@/components/sections/site-navbar";
import { ListingCard } from "@/components/ui/listing-card";
import { getLastMinuteHomes, getSessionUser, getWishlist, searchProducts, type SearchInput } from "@/lib/api";
import { mapLastMinuteDealCard, mapListingCard } from "@/lib/presentation";
import { SlidersHorizontal } from "lucide-react";

type SearchResultsPageProps = {
  type: "home" | "experience" | "car";
  title: string;
  eyebrow: string;
  searchParams?: Record<string, string | string[] | undefined>;
  cookieHeader: string;
};

function readParam(
  searchParams: Record<string, string | string[] | undefined> | undefined,
  key: string,
  fallback = "",
) {
  const value = searchParams?.[key];
  return (Array.isArray(value) ? value[0] : value) || fallback;
}

function routeFor(type: SearchResultsPageProps["type"]) {
  if (type === "experience") {
    return "/experience-search-result";
  }

  if (type === "car") {
    return "/car-search-result";
  }

  return "/home-search-result";
}

export async function SearchResultsPage({
  type,
  title,
  eyebrow,
  searchParams,
  cookieHeader,
}: SearchResultsPageProps) {
  const isQuickDeals = readParam(searchParams, "featured") === "1" || readParam(searchParams, "last_minute") === "1";
  const currentUser = await getSessionUser(cookieHeader);
  const [results, lastMinuteHomes, wishlist] = await Promise.all([
    isQuickDeals ? Promise.resolve(null) : searchProducts(type, (searchParams ?? {}) as SearchInput),
    isQuickDeals ? getLastMinuteHomes(cookieHeader) : Promise.resolve(null),
    currentUser ? getWishlist(cookieHeader) : Promise.resolve([]),
  ]);

  const savedIds = (wishlist ?? []).map((item) => item.id);
  const city = readParam(searchParams, "city", readParam(searchParams, "address", "كل المدن"));
  const cards = isQuickDeals
    ? (lastMinuteHomes ?? [])
        .filter((item) => item.enabled)
        .map((item) => mapLastMinuteDealCard(item, savedIds))
    : (results ?? []).map((item) => mapListingCard(item, savedIds));
  const headingTitle = isQuickDeals ? "صفقات سريعة" : title;
  const headingEyebrow = isQuickDeals ? "عروض آخر لحظة" : eyebrow;
  const headingDescription = isQuickDeals
    ? `عدد الصفقات المعروضة حاليًا: ${cards.length}. هذه النتائج مرتبطة مباشرة بعروض آخر لحظة المفعلة في الداشبورد.`
    : `عدد النتائج الحالية: ${cards.length}. الفلاتر هنا ترسل نفس مفاتيح البحث إلى النظام للحفاظ على تطابق النتائج مع الداشبورد.`;

  return (
    <main className="min-h-screen bg-[#f8f8f6] text-slate-950">
      <SiteNavbar currentUser={currentUser} />
      <section className="px-4 pb-10 pt-36 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1440px]">
          <form
            action={routeFor(type)}
            method="GET"
            className="mb-6 flex flex-wrap items-center gap-3"
          >
            {isQuickDeals ? <input type="hidden" name="featured" value="1" /> : null}
            <button className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 transition hover:border-gray-400">
              <SlidersHorizontal className="h-4 w-4" />
              جميع الفلاتر
            </button>
            <input
              type="text"
              name="city"
              defaultValue={city === "كل المدن" ? "" : city}
              placeholder="المدينة"
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#1a1f36]"
            />
            <input
              type="date"
              name="date_from"
              defaultValue={readParam(searchParams, "date_from", readParam(searchParams, "checkIn"))}
              className="cursor-pointer appearance-none rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 outline-none transition focus:border-[#1a1f36]"
            />
            <input
              type="date"
              name="date_to"
              defaultValue={readParam(searchParams, "date_to", readParam(searchParams, "checkOut"))}
              className="cursor-pointer appearance-none rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 outline-none transition focus:border-[#1a1f36]"
            />
            <input
              type="number"
              min="1"
              name="guests"
              defaultValue={readParam(searchParams, "guests", readParam(searchParams, "num_adults", "2"))}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 outline-none transition focus:border-[#1a1f36]"
            />
            <input
              type="number"
              min="0"
              name="min_price"
              defaultValue={readParam(searchParams, "min_price")}
              placeholder="أقل سعر"
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#1a1f36]"
            />
            <input
              type="number"
              min="0"
              name="max_price"
              defaultValue={readParam(searchParams, "max_price")}
              placeholder="أعلى سعر"
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#1a1f36]"
            />
          </form>
        </div>
      </section>

      <section className="px-4 pb-24 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-8">
            <div className="mb-2 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">
                {isQuickDeals ? headingTitle : `${headingTitle} في ${city}`}
              </h1>
              <span className="rounded-full border border-[#FF385C]/20 bg-[#FF385C]/10 px-3 py-1.5 text-xs font-medium text-[#FF385C]">
                {headingEyebrow}
              </span>
            </div>
            <p className="max-w-2xl text-sm text-gray-500">
              {headingDescription}
            </p>
          </div>

          {cards.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {cards.map((item) => (
                <ListingCard
                  key={`${item.listingId}-${item.href}`}
                  {...item}
                  isAuthenticated={Boolean(currentUser)}
                />
              ))}
            </div>
          ) : (
            <div className="mt-12 rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center shadow-[0_20px_60px_-45px_rgba(15,23,42,0.48)]">
              <h2 className="text-2xl font-semibold text-slate-950">لا توجد نتائج مطابقة حاليًا</h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600">
                جرّب تغيير المدينة أو نطاق السعر أو عدد الضيوف. الصفحة لا تعرض عناصر وهمية عندما لا ترجع بيانات من النظام.
              </p>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}
