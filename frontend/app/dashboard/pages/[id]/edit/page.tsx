import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { ContentEditorForm } from "@/components/dashboard/content-editor-form";
import { getPageEditor } from "@/lib/api";

export default async function DashboardPageEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const headerStore = await headers();
  const cookieHeader = headerStore.get("cookie") ?? "";
  const data = await getPageEditor(Number(id), cookieHeader);

  if (!data) {
    notFound();
  }

  return <ContentEditorForm resource="pages" initialData={data} />;
}
