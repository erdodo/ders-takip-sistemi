import { getCustomerById } from "@/lib/actions/customer.actions";
import { notFound } from "next/navigation";
import { CustomerEditForm } from "./CustomerEditForm";

interface Props {
  params: { id: string };
}

export default async function CustomerEditPage({ params }: Props) {
  const customer = await getCustomerById(params.id);

  if (!customer) notFound();

  return (
    <CustomerEditForm
      customerId={customer.id}
      initialData={{
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        notes: customer.notes,
        isActive: customer.isActive,
      }}
    />
  );
}
