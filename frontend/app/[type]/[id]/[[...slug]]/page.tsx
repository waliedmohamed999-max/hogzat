import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { MapPin, Star } from "lucide-react";
import { Footer } from "@/components/sections/footer";
import { SiteNavbar } from "@/components/sections/site-navbar";
import {
  InteractiveBookingCard,
  InteractiveDateCalendar,
} from "@/components/ui/listing-date-tools";
import { WishlistButton } from "@/components/ui/wishlist-button";
import {
  getProductDetails,
  getProductReviews,
  getSessionUser,
  getWishlist,
  pathToBridgeType,
} from "@/lib/api";
import {
  FALLBACK_LISTING_IMAGE,
  formatMoney,
  formatRating,
  normalizeAssetUrl,
  normalizeBrandText,
} from "@/lib/presentation";

type ListingDetailsPageProps = {
  params: Promise<{
    type: string;
    id: string;
    slug?: string[];
  }>;
};

export default async function ListingDetailsPage({
  params,
}: ListingDetailsPageProps) {
  const { type, id } = await params;
  const bridgeType = pathToBridgeType(type);

  if (!bridgeType) {
    notFound();
  }

  const headerStore = await headers();
  const cookieHeader = headerStore.get("cookie") ?? "";
  const currentUser = await getSessionUser(cookieHeader);
  const numericId = Number(id);

  const [details, reviews, wishlist] = await Promise.all([
    getProductDetails(numericId, type),
    getProductReviews(numericId, type),
    currentUser ? getWishlist(cookieHeader) : Promise.resolve([]),
  ]);

  if (!details) {
    notFound();
  }

  const gallery = details.images?.length
    ? details.images.map(normalizeAssetUrl)
    : [FALLBACK_LISTING_IMAGE];
  const displayGallery = Array.from(
    { length: 5 },
    (_, index) => gallery[index] ?? gallery[0] ?? FALLBACK_LISTING_IMAGE,
  );
  const isSaved = Boolean((wishlist ?? []).find((item) => item.id === details.id));
  const nextType = type === "service" ? "service" : bridgeType;
  const quoteHref = `/checkout/quote?product_id=${details.id}&type=${nextType}&checkin=${details.pricing.start_date}&checkout=${details.pricing.end_date}&guests_count=${details.guests || 1}`;
  const locationLabel =
    details.subtitle || details.location.city || "المملكة العربية السعودية";
  const priceLabel = formatMoney(details.pricing.total, details.pricing.currency);
  const hostAvatar = normalizeAssetUrl(details.host.avatar_url || FALLBACK_LISTING_IMAGE);
  const reviewCount = details.review_count || reviews?.length || 0;
  const mapsHref =
    details.location.lat && details.location.lng
      ? `https://www.google.com/maps/search/?api=1&query=${details.location.lat},${details.location.lng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          details.location.address || details.location.city || locationLabel,
        )}`;

  return (
    <main className="min-h-screen bg-white text-[#222222]" dir="rtl">
      <SiteNavbar currentUser={currentUser} />

      <section className="px-4 pb-10 pt-28 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1280px]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between" dir="ltr">
            <div className="flex items-center gap-3 text-sm font-semibold text-[#222222]" dir="rtl">
              <button className="rounded-full px-3 py-2 underline underline-offset-4 transition hover:bg-gray-100">
                مشاركة
              </button>
              <WishlistButton
                productId={details.id}
                type={nextType}
                initialSaved={isSaved}
                isAuthenticated={Boolean(currentUser)}
                className="static rounded-full"
              />
            </div>
            <div className="text-right" dir="rtl">
              <h1 className="text-3xl font-bold leading-tight text-[#222222] sm:text-4xl">
                {details.title}
              </h1>
              <div className="mt-3 flex flex-wrap items-center justify-end gap-x-4 gap-y-2 text-sm text-[#717171]">
                {details.guest_favorite_label ? (
                  <span className="rounded-full bg-[#FFB400]/20 px-3 py-1 font-semibold text-[#7A5200]">
                    {details.guest_favorite_label}
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-1">
                  <Star className="size-4 fill-[#FFB400] text-[#FFB400]" />
                  <strong className="text-[#222222]">{formatRating(details.rating)}</strong>
                  <span>({reviewCount} مراجعة)</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-4" />
                  {locationLabel}
                </span>
              </div>
            </div>
          </div>

          <div className="relative mt-6 overflow-hidden rounded-xl">
            <div className="flex h-[520px] flex-col gap-2 lg:flex-row-reverse">
              <div className="relative min-h-[280px] flex-1 overflow-hidden bg-gray-100 lg:min-h-0">
                <Image
                  src={displayGallery[0]}
                  alt={details.title}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                  priority
                />
              </div>
              <div className="grid flex-1 grid-cols-2 gap-2">
                {displayGallery.slice(1, 5).map((image, index) => (
                  <div key={`${image}-${index}`} className="relative overflow-hidden bg-gray-100">
                    <Image
                      src={image}
                      alt={`${details.title} - صورة ${index + 2}`}
                      fill
                      sizes="(min-width: 1024px) 25vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
            <button className="absolute bottom-5 left-5 rounded-lg border border-[#222222] bg-white px-4 py-2 text-sm font-bold text-[#222222] shadow-md transition hover:bg-gray-50">
              إظهار كل الصور ▦
            </button>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 lg:px-10">
        <div className="mx-auto grid max-w-[1280px] gap-8 lg:grid-cols-[minmax(300px,35%)_minmax(0,60%)] lg:items-start" dir="ltr">
          <aside className="order-2 lg:order-1 lg:sticky lg:top-28" dir="rtl">
            <InteractiveBookingCard
              productId={details.id}
              productType={nextType}
              priceLabel={priceLabel}
              initialCheckIn={details.pricing.start_date}
              initialCheckOut={details.pricing.end_date}
              initialGuests={details.guests || 1}
              freeCancellationLabel={details.pricing.free_cancellation_label}
            />

            <div className="mt-6 border-b border-[#DDDDDD] pb-6">
              <div className="flex items-center gap-4">
                <div className="relative size-12 overflow-hidden rounded-full bg-gray-100">
                  <Image
                    src={hostAvatar}
                    alt={normalizeBrandText(details.host.name, "فريق لبية")}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="font-bold text-[#222222]">
                    {normalizeBrandText(details.host.name, "فريق لبية")}
                  </div>
                  <div className="text-sm text-[#717171]">
                    {normalizeBrandText(details.host.badge_label) || "مضيف موثوق"}
                  </div>
                </div>
              </div>
              <div className="mt-4 text-sm leading-7 text-[#717171]">
                {normalizeBrandText(details.host.response_time_label) || "يرد في غضون ساعة"}
              </div>
            </div>
          </aside>

          <div className="order-1 space-y-10 lg:order-2" dir="rtl">
            <section className="border-b border-[#DDDDDD] pb-8">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-[#FFB400]/20 px-4 py-2 text-sm font-bold text-[#7A5200]">
                  مفضّل لدى الضيوف
                </span>
                <span className="inline-flex items-center gap-1 text-sm text-[#717171]">
                  <Star className="size-4 fill-[#FFB400] text-[#FFB400]" />
                  <strong className="text-[#222222]">{formatRating(details.rating)}</strong>
                  <span>{reviewCount} مراجعة</span>
                </span>
              </div>
              <h2 className="mt-5 text-2xl font-bold text-[#222222]">
                {details.property_type_label || "إقامة مميزة"} في {locationLabel}
              </h2>
              <p className="mt-2 text-[#717171]">
                {details.guests || 1} ضيوف · {details.bedrooms || 1} غرف نوم · {details.beds || 1} أسرّة · {details.baths || 1} حمامات
              </p>
            </section>

            <section className="grid gap-6 border-b border-[#DDDDDD] pb-8 md:grid-cols-3">
              {[
                ["⭐", "تقييم مرتفع", `${formatRating(details.rating)} من الضيوف`],
                ["🛡️", details.cancellation_policy.title || "حجز موثوق", details.cancellation_policy.summary || "سياسة واضحة قبل الدفع"],
                ["📍", "موقع مناسب", locationLabel],
              ].map(([icon, title, subtitle]) => (
                <div key={title} className="flex items-start gap-4">
                  <span className="text-2xl">{icon}</span>
                  <div>
                    <h3 className="font-semibold text-[#222222]">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-[#717171]">{subtitle}</p>
                  </div>
                </div>
              ))}
            </section>

            <section className="border-b border-[#DDDDDD] pb-8">
              <h2 className="text-2xl font-bold text-[#222222]">نبذة عن الإعلان</h2>
              <p className="mt-5 text-base leading-8 text-[#717171]">
                {details.description || "لا يوجد وصف متاح حاليًا لهذا الإعلان."}
              </p>
            </section>

            <section className="border-b border-[#DDDDDD] pb-8">
              <h2 className="text-2xl font-bold text-[#222222]">ترتيبات النوم</h2>
              <div className="relative mt-5">
                <div className="flex gap-4 overflow-x-auto pb-3">
                  {details.sleeping_arrangements.length > 0 ? (
                    details.sleeping_arrangements.map((room, index) => (
                      <div
                        key={`${room.title}-${index}`}
                        className="w-[200px] shrink-0 rounded-xl border border-[#DDDDDD] p-4"
                      >
                        <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-lg bg-gray-100">
                          <Image
                            src={displayGallery[(index + 1) % displayGallery.length]}
                            alt={room.title}
                            fill
                            sizes="200px"
                            className="object-cover"
                          />
                        </div>
                        <div className="font-bold text-[#222222]">{room.title}</div>
                        <div className="mt-1 text-sm text-[#717171]">{room.beds_label}</div>
                      </div>
                    ))
                  ) : (
                    <div className="w-[200px] shrink-0 rounded-xl border border-[#DDDDDD] p-4 text-sm text-[#717171]">
                      لا توجد بيانات نوم مفصلة.
                    </div>
                  )}
                </div>
                <button className="absolute -left-3 top-1/2 hidden size-10 -translate-y-1/2 rounded-full bg-white shadow-md lg:block">
                  ‹
                </button>
              </div>
            </section>

            <section className="border-b border-[#DDDDDD] pb-8">
              <h2 className="text-2xl font-bold text-[#222222]">ما يقدمه هذا المكان</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {details.amenities.length > 0 ? (
                  details.amenities.map((amenity) => (
                    <div key={amenity.id} className="flex items-center gap-3 text-[#222222]">
                      <span className="text-xl">✓</span>
                      <span>{amenity.name}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center gap-3 text-[#717171] line-through">
                    <span>×</span>
                    <span>لا توجد مزايا مضافة حاليًا.</span>
                  </div>
                )}
              </div>
              <button className="mt-6 rounded-lg border border-[#222222] px-5 py-3 text-sm font-bold text-[#222222] transition hover:bg-gray-50">
                عرض الميزات
              </button>
            </section>

            <section className="border-b border-[#DDDDDD] pb-8">
              <div className="text-center">
                <div className="text-sm text-[#717171]">‹‹</div>
                <div className="text-5xl font-bold text-[#222222]">{formatRating(details.rating)}</div>
                <div className="mt-1 text-sm text-[#717171]">تقييم الضيوف العام</div>
                <div className="text-sm text-[#717171]">››</div>
              </div>
              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {["النظافة", "الدقة", "الوصول", "التواصل", "الموقع", "القيمة"].map((label) => (
                  <div key={label} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-[#222222]">{label}</span>
                      <span className="text-[#717171]">{formatRating(details.rating)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-200">
                      <div className="h-full w-[88%] rounded-full bg-[#222222]" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 grid gap-6 md:grid-cols-2">
                {reviews && reviews.length > 0 ? (
                  reviews.map((review) => (
                    <article key={review.id} className="rounded-xl border border-[#DDDDDD] p-5">
                      <div className="flex items-center gap-3">
                        <div className="relative size-11 overflow-hidden rounded-full bg-gray-100">
                          <Image
                            src={normalizeAssetUrl(review.author_avatar || FALLBACK_LISTING_IMAGE)}
                            alt={review.author_name}
                            fill
                            sizes="44px"
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-[#222222]">{review.author_name}</div>
                          <div className="text-sm text-[#717171]">{review.date_label}</div>
                        </div>
                      </div>
                      <div className="mt-4 text-sm text-[#222222]">
                        {"★★★★★".slice(0, Math.max(1, Math.round(review.rating)))}
                      </div>
                      <p className="mt-3 text-sm leading-7 text-[#717171]">
                        {review.comment || "لا يوجد نص مضاف."}
                      </p>
                    </article>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-[#DDDDDD] p-5 text-sm text-[#717171] md:col-span-2">
                    لا توجد مراجعات متاحة حاليًا لهذا الإعلان.
                  </div>
                )}
              </div>
            </section>

            <section className="border-b border-[#DDDDDD] pb-8">
              <InteractiveDateCalendar
                initialCheckIn={details.pricing.start_date}
                initialCheckOut={details.pricing.end_date}
              />
            </section>

            <section className="border-b border-[#DDDDDD] pb-8">
              <h2 className="text-2xl font-bold text-[#222222]">الموقع</h2>
              <div className="relative mt-5 h-[400px] overflow-hidden rounded-xl border border-[#DDDDDD] bg-[#F4F4F4]">
                <div className="absolute inset-0 opacity-70 [background-image:linear-gradient(90deg,rgba(34,34,34,0.08)_1px,transparent_1px),linear-gradient(rgba(34,34,34,0.08)_1px,transparent_1px)] [background-size:56px_56px]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_42%,rgba(255,56,92,0.20),transparent_20%),radial-gradient(circle_at_35%_70%,rgba(0,138,5,0.12),transparent_22%)]" />
                <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
                  <div className="flex size-14 items-center justify-center rounded-full bg-[#FF385C] text-white shadow-xl shadow-[#FF385C]/30">
                    <MapPin className="size-7 fill-current" />
                  </div>
                  <div className="mt-3 rounded-full bg-white px-4 py-2 text-sm font-bold text-[#222222] shadow-lg">
                    {locationLabel}
                  </div>
                </div>
                <a
                  href={mapsHref}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute bottom-5 left-5 rounded-lg bg-white px-4 py-2 text-sm font-bold text-[#222222] shadow-md transition hover:bg-gray-50"
                >
                  فتح الموقع على الخريطة
                </a>
              </div>
              <p className="mt-3 text-sm text-[#717171]">
                {details.location.address || `${details.location.city} ${details.location.country}`}
              </p>
            </section>

            <section className="border-b border-[#DDDDDD] pb-8">
              <h2 className="text-2xl font-bold text-[#222222]">أماكن قريبة قد تعجبك</h2>
              <div className="relative mt-5">
                <div className="flex gap-4 overflow-x-auto pb-3">
                  {displayGallery.slice(1, 5).map((image, index) => (
                    <article key={`${image}-nearby-${index}`} className="w-[220px] shrink-0">
                      <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
                        <Image
                          src={image}
                          alt={`${details.title} قريب ${index + 1}`}
                          fill
                          sizes="220px"
                          className="object-cover"
                        />
                      </div>
                      <h3 className="mt-3 line-clamp-1 font-bold text-[#222222]">{details.title}</h3>
                      <div className="mt-1 flex items-center gap-1 text-sm text-[#717171]">
                        <Star className="size-4 fill-[#FFB400] text-[#FFB400]" />
                        {formatRating(details.rating)}
                      </div>
                      <div className="mt-1 text-sm text-[#222222]">
                        <strong>{priceLabel}</strong> / ليلة
                      </div>
                    </article>
                  ))}
                </div>
                <button className="absolute -left-3 top-20 hidden size-10 rounded-full bg-white shadow-md lg:block">
                  ‹
                </button>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#222222]">أشياء يجب معرفتها</h2>
              <div className="mt-6 grid gap-8 md:grid-cols-3">
                <div>
                  <h3 className="font-semibold text-[#222222]">قواعد المكان</h3>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-[#717171]">
                    {details.house_rules.length > 0 ? (
                      details.house_rules.slice(0, 3).map((rule, index) => (
                        <li key={`${rule.title}-${index}`}>{rule.title}{rule.value ? `: ${rule.value}` : ""}</li>
                      ))
                    ) : (
                      <li>لا توجد قواعد منشورة حاليًا.</li>
                    )}
                  </ul>
                  <a className="mt-4 inline-block text-sm font-medium text-[#222222] underline" href="#top">
                    اطلع على المزيد
                  </a>
                </div>
                <div>
                  <h3 className="font-semibold text-[#222222]">السلامة والمكان</h3>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-[#717171]">
                    {details.safety_items.length > 0 ? (
                      details.safety_items.slice(0, 3).map((item, index) => (
                        <li key={`${item.title}-${index}`}>{item.title}{item.value ? `: ${item.value}` : ""}</li>
                      ))
                    ) : (
                      <li>لا توجد عناصر سلامة منشورة حاليًا.</li>
                    )}
                  </ul>
                  <a className="mt-4 inline-block text-sm font-medium text-[#222222] underline" href="#top">
                    اطلع على المزيد
                  </a>
                </div>
                <div>
                  <h3 className="font-semibold text-[#222222]">سياسة الإلغاء</h3>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-[#717171]">
                    <li>{details.cancellation_policy.title}</li>
                    <li>{details.cancellation_policy.summary || details.cancellation_policy.details || "سياسة الإلغاء غير مضافة حاليًا."}</li>
                  </ul>
                  <a className="mt-4 inline-block text-sm font-medium text-[#222222] underline" href="#top">
                    اطلع على المزيد
                  </a>
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#DDDDDD] bg-white p-3 shadow-[0_-10px_30px_-20px_rgba(0,0,0,0.4)] lg:hidden">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-3" dir="rtl">
          <div>
            <div className="text-base font-bold text-[#222222]">{priceLabel}</div>
            <div className="text-xs text-[#717171]">/ ليلة</div>
          </div>
          <Link
            href={quoteHref}
            className="rounded-full bg-[#FF385C] px-8 py-3 text-sm font-bold text-white"
          >
            احجز
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
