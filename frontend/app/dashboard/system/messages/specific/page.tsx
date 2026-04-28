import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { MessagesCenter } from "@/components/dashboard/messages-center";
import { getMessagesMeta } from "@/lib/api";

export default async function DashboardSystemMessagesSpecificPage() {
  const headerStore = await headers();
  const cookieHeader = headerStore.get("cookie") ?? "";
  const meta = await getMessagesMeta(cookieHeader);

  if (!meta) {
    notFound();
  }

  return <MessagesCenter meta={meta} mode="specific" />;
}
