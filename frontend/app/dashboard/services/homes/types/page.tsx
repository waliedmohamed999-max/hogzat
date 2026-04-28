import { ServiceTermsManager } from "@/components/dashboard/service-terms-manager";
import { getDashboardTerms } from "@/lib/api";
import { headers } from "next/headers";

export default async function HomeTypesPage() {
  const headerStore = await headers();
  const terms = await getDashboardTerms("home-type", headerStore.get("cookie") ?? "");

  return (
    <ServiceTermsManager
      initialTerms={terms ?? []}
      taxonomy="home-type"
      eyebrow="إدارة الإقامات"
      title="تصنيفات الوحدات"
      description="أضف وعدّل تصنيفات الإقامات التي تظهر في محرر الإعلان وصفحات العرض وفلاتر البحث."
      addLabel="تصنيف جديد"
      usageLabel="إعلان"
    />
  );
}
