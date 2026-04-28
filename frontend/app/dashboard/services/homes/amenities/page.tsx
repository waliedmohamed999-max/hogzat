import { ServiceTermsManager } from "@/components/dashboard/service-terms-manager";
import { getDashboardTerms } from "@/lib/api";
import { headers } from "next/headers";

export default async function HomeAmenitiesPage() {
  const headerStore = await headers();
  const terms = await getDashboardTerms("home-amenity", headerStore.get("cookie") ?? "");

  return (
    <ServiceTermsManager
      initialTerms={terms ?? []}
      taxonomy="home-amenity"
      eyebrow="إدارة الإقامات"
      title="وسائل الراحة"
      description="أضف وعدّل وسائل الراحة التي تظهر داخل محرر الإقامات وصفحات التفاصيل وفلاتر البحث."
      addLabel="إضافة وسيلة راحة"
      usageLabel="إعلان"
    />
  );
}
