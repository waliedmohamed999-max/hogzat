import Image from "next/image";
import Link from "next/link";
import { BadgePercent, Bath, BedDouble, MapPin, Star, Users } from "lucide-react";
import { DealCountdown } from "@/components/ui/deal-countdown";
import { WishlistButton } from "@/components/ui/wishlist-button";

type ListingCardProps = {
  listingId: number;
  listingType: "home" | "experience" | "service";
  title: string;
  location: string;
  price: string;
  originalPrice?: string;
  discountPercent?: number;
  rating: string;
  image: string;
  metadata?: string[];
  badge?: string;
  href?: string;
  isSaved?: boolean;
  isAuthenticated?: boolean;
  isDeal?: boolean;
  dealEndsAtTimestamp?: number;
  dealDurationHours?: number;
  featured?: boolean;
};

export function ListingCard({
  listingId,
  listingType,
  title,
  location,
  price,
  originalPrice,
  discountPercent,
  rating,
  image,
  metadata = [],
  badge,
  href = "/home-search-result",
  isSaved = false,
  isAuthenticated = false,
  isDeal = false,
  dealEndsAtTimestamp,
  featured = false,
}: ListingCardProps) {
  const specs = Array.isArray(metadata) ? metadata.slice(0, 3) : [];

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="relative w-full flex-shrink-0 overflow-hidden bg-gray-100 aspect-[4/3]">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 hover:scale-105"
        />
        <WishlistButton
          productId={listingId}
          type={listingType}
          initialSaved={isSaved}
          isAuthenticated={isAuthenticated}
          className="left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 p-0 shadow-sm backdrop-blur-sm transition hover:bg-white hover:scale-100"
        />
        {featured || badge === "مميز" ? (
          <span className="absolute right-3 top-3 rounded-full bg-[#FF385C] px-2.5 py-1 text-xs font-medium text-white">
            مميز
          </span>
        ) : null}
        <span className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2.5 py-1 text-xs text-white backdrop-blur-sm">
          {badge || "جاهز للحجز"}
        </span>
        <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-white/85 px-2.5 py-1 text-xs font-medium text-gray-900 backdrop-blur-sm">
          <Star className="h-3 w-3 fill-current text-[#FFB400]" />
          {rating}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-gray-900">
          {title}
        </h3>

        <div className="flex items-center gap-1 text-xs text-gray-500">
          <MapPin className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">{location}</span>
        </div>

        <div className="flex min-h-5 flex-wrap items-center gap-2 text-xs text-gray-500">
          {specs[0] ? (
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {specs[0]}
            </span>
          ) : null}
          {specs[1] ? <span className="h-3 w-px bg-gray-200" /> : null}
          {specs[1] ? (
            <span className="flex items-center gap-1">
              <BedDouble className="h-3 w-3" />
              {specs[1]}
            </span>
          ) : null}
          {specs[2] ? <span className="h-3 w-px bg-gray-200" /> : null}
          {specs[2] ? (
            <span className="flex items-center gap-1">
              <Bath className="h-3 w-3" />
              {specs[2]}
            </span>
          ) : null}
        </div>

        <div className="min-h-[2.5rem]">
          {isDeal ? (
            <DealCountdown endsAtTimestamp={dealEndsAtTimestamp} />
          ) : null}
        </div>

        <div className="my-1 border-t border-gray-100" />

        <div className={`mt-auto flex items-center justify-between gap-3 ${isDeal ? "rounded-xl border border-[#FF385C]/15 bg-[#FF385C]/5 p-3 shadow-[0_14px_35px_-28px_rgba(255,56,92,0.8)]" : ""}`}>
          <div className="min-w-0">
            {isDeal && originalPrice ? (
              <div className="mb-1.5 flex flex-wrap items-center gap-2 text-[11px]">
                <span className="text-gray-400 line-through decoration-[#FF385C]/60 decoration-2">{originalPrice}</span>
                {discountPercent ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#FF385C] px-2 py-0.5 font-bold text-white shadow-sm shadow-[#FF385C]/20">
                    <BadgePercent className="h-3 w-3" />
                    خصم {discountPercent}%
                  </span>
                ) : null}
              </div>
            ) : null}
            <div className="flex flex-wrap items-baseline gap-1">
              <span className={isDeal ? "text-xl font-black text-[#FF385C]" : "text-base font-bold text-gray-900"}>{price}</span>
              <span className={isDeal ? "text-xs font-bold text-gray-700" : "text-xs text-gray-400"}>/ ليلة</span>
            </div>
          </div>
          <Link
            href={href}
            className="flex-shrink-0 rounded-xl bg-[#FF385C] px-4 py-2 text-xs font-medium !text-white transition-all hover:bg-[#E31C5F] active:scale-95"
          >
            التفاصيل
          </Link>
        </div>
      </div>
    </article>
  );
}
