import { headers } from "next/headers";
import { ServiceEditorForm } from "@/components/dashboard/service-editor-form";
import { getManagedServiceEditorResult } from "@/lib/api";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditHomePage({ params }: Props) {
  const { id } = await params;
  const headerStore = await headers();
  const cookieHeader = headerStore.get("cookie") ?? "";
  const result = await getManagedServiceEditorResult("home", Number(id), cookieHeader);

  if (!result.ok || !result.data) {
    return (
      <div className="rounded-3xl border border-red-100 bg-red-50 p-6 text-sm text-red-700">
        تعذر تحميل بيانات الوحدة.
        <div className="mt-2 text-xs opacity-80">
          {result.status ? `الحالة: ${result.status}` : "الحالة: تعذر الاتصال"}
          {result.message ? ` - ${result.message}` : ""}
        </div>
      </div>
    );
  }

  return <ServiceEditorForm editor={result.data} />;
}
