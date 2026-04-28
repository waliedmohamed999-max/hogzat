import { PaymentMethodsManager } from "@/components/dashboard/payment-methods-manager";
import { getPaymentMethods } from "@/lib/payment-methods";

export default async function DashboardPaymentMethodsPage() {
  const methods = await getPaymentMethods();
  return <PaymentMethodsManager initialMethods={methods} />;
}
