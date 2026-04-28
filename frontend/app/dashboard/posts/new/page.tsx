import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { ContentEditorForm } from "@/components/dashboard/content-editor-form";
import { getPostEditor } from "@/lib/api";

export default async function DashboardPostNewPage() {
  const headerStore = await headers();
  const cookieHeader = headerStore.get("cookie") ?? "";
  const data = await getPostEditor("new", cookieHeader);

  if (!data) {
    notFound();
  }

  return <ContentEditorForm resource="posts" initialData={data} />;
}
