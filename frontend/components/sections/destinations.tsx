import Link from "next/link";
import { ListingCard } from "@/components/ui/listing-card";
import { SectionHeading } from "@/components/ui/section-heading";
import type { BridgeListing } from "@/lib/api";
import { destinations as fallbackDestinations } from "@/lib/site-data";
import { mapListingCard, SAUDI_RIYAL_SYMBOL } from "@/lib/presentation";
import { ArrowUpLeft } from "lucide-react";

type DestinationsSectionProps = {
  items?: BridgeListing[] | null;
  savedIds?: number[];
  isAuthenticated?: boolean;
};

function formatFallbackPrice(value: string | number) {
  const amount = Number(String(value).replace(/,/g, ""));
  return `${Number.isFinite(amount) ? amount.toLocaleString("ar-SA") : value} ${SAUDI_RIYAL_SYMBOL}`;
}

export function DestinationsSection({
  items,
  savedIds = [],
  isAuthenticated = false,
}: DestinationsSectionProps) {
  const listings =
    items && items.length > 0
      ? items.slice(0, 8).map((item) => mapListingCard(item, savedIds))
      : fallbackDestinations.map((item, index) => ({
          listingId: index + 1,
          listingType: "home" as const,
          title: item.title,
          location: item.location,
          price: formatFallbackPrice(item.price),
          rating: item.rating,
          href: item.href,
          metadata: [] as string[],
          image: item.image,
          badge: "وجهة",
          isSaved: false,
        }));

  return (
    <section className="border-y border-slate-200 bg-white px-4 py-24 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <SectionHeading
              align="start"
              eyebrow="إقامات مختارة"
              title="اختيارات جاهزة للحجز من بيانات المنصة"
              description="صور وأسعار وتوفر متزامنة مباشرة مع النظام، مع عرض بصري يساعد المستخدم على اتخاذ القرار بسرعة."
            />
          </div>

          <Link
            href="/home-search-result"
            className="inline-flex w-fit items-center gap-2 rounded-lg bg-[#FF385C] px-5 py-3 text-sm font-semibold !text-white shadow-lg shadow-[#FF385C]/20 transition hover:bg-[#E31C5F]"
          >
            عرض كل الإقامات
            <ArrowUpLeft className="size-4" />
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((item, index) => (
            <ListingCard
              key={`${item.listingId}-${item.href}`}
              {...item}
              featured={index === 0}
              isAuthenticated={isAuthenticated}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
