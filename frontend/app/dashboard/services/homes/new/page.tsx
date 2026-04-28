import { headers } from "next/headers";
import { ServiceEditorForm } from "@/components/dashboard/service-editor-form";
import { getManagedServiceEditorNewResult } from "@/lib/api";

export default async function AddHomePage() {
  const headerStore = await headers();
  const cookieHeader = headerStore.get("cookie") ?? "";
  const result = await getManagedServiceEditorNewResult("home", cookieHeader);

  if (!result.ok || !result.data) {
    return (
      <div className="rounded-3xl border border-red-100 bg-red-50 p-6 text-sm text-red-700">
        تعذر تحميل نموذج إضافة الوحدة.
        <div className="mt-2 text-xs opacity-80">
          {result.status ? `الحالة: ${result.status}` : "الحالة: تعذر الاتصال"}
          {result.message ? ` - ${result.message}` : ""}
        </div>
      </div>
    );
  }

  return <ServiceEditorForm editor={result.data} />;
}
