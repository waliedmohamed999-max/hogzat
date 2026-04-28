import { headers } from "next/headers";
import { NotificationsSuite } from "@/components/dashboard/notifications-suite";
import { getNotifications } from "@/lib/api";

type NotificationsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardNotificationsPage({
  searchParams,
}: NotificationsPageProps) {
  const headerStore = await headers();
  const cookieHeader = headerStore.get("cookie") ?? "";
  const resolvedSearchParams = (await searchParams) ?? {};
  const notifications = await getNotifications(cookieHeader, resolvedSearchParams);

  return (
    <NotificationsSuite
      initialPayload={
        notifications ?? {
          total: 0,
          page: 1,
          per_page: 20,
          unread_count: 0,
          results: [],
        }
      }
    />
  );
}
