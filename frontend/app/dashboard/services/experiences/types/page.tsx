import { ServiceTermsManager } from "@/components/dashboard/service-terms-manager";
import { getDashboardTerms } from "@/lib/api";
import { headers } from "next/headers";

export default async function ExperienceTypesPage() {
  const headerStore = await headers();
  const terms = await getDashboardTerms("experience-type", headerStore.get("cookie") ?? "");

  return (
    <ServiceTermsManager
      initialTerms={terms ?? []}
      taxonomy="experience-type"
      eyebrow="إدارة التجارب والفعاليات"
      title="تصنيفات التجارب"
      description="أضف وعدّل تصنيفات التجارب والفعاليات والمؤتمرات التي تظهر في محرر التجربة وفلاتر البحث وصفحات العرض."
      addLabel="تصنيف جديد"
      usageLabel="عنصر"
    />
  );
}
