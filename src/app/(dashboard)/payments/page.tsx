import { getPayments } from "@/lib/actions/payment.actions";
import { getCustomersWithActivePackages } from "@/lib/actions/customer.actions";
import { PaymentsPageClient } from "./PaymentsPageClient";

export default async function PaymentsPage() {
  const [payments, customers] = await Promise.all([
    getPayments(),
    getCustomersWithActivePackages(),
  ]);

  return (
    <PaymentsPageClient
      payments={payments as any}
      customers={customers as any}
    />
  );
}
