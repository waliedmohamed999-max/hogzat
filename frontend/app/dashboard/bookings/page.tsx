import { headers } from "next/headers";
import { BookingsModule } from "@/components/dashboard/bookings-module";
import { getDashboardBookings, getDashboardBookingStats } from "@/lib/api";

type BookingsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardBookingsPage({ searchParams }: BookingsPageProps) {
  const headerStore = await headers();
  const cookieHeader = headerStore.get("cookie") ?? "";
  const resolvedSearchParams = (await searchParams) ?? {};

  const [bookings, stats] = await Promise.all([
    getDashboardBookings(cookieHeader, {
      ...resolvedSearchParams,
      per_page: resolvedSearchParams.per_page ?? resolvedSearchParams.limit ?? "10",
    }),
    getDashboardBookingStats(cookieHeader),
  ]);

  return <BookingsModule initialBookings={bookings} initialStats={stats} />;
}
