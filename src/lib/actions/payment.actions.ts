"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { fireWebhooks } from "@/lib/webhook";

async function getStudioId(): Promise<string> {
  const session = await auth();
  if (!session?.user) throw new Error("Oturum bulunamadı");
  const studioId = (session.user as any).studioId;
  if (!studioId) throw new Error("Stüdyo bulunamadı");
  return studioId;
}

export async function createPayment(data: {
  customerId: string;
  customerPackageId?: string;
  amount: number;
  method: string;
  notes?: string;
}) {
  const studioId = await getStudioId();

  const payment = await prisma.$transaction(async (tx) => {
    const p = await tx.payment.create({
      data: { ...data, studioId } as any,
    });

    // Paketi ödendi olarak işaretle
    if (data.customerPackageId) {
      await tx.customerPackage.update({
        where: { id: data.customerPackageId },
        data: { isPaid: true },
      });
    }

    return p;
  });

  revalidatePath("/payments");
  revalidatePath(`/customers/${data.customerId}`);
  revalidatePath("/dashboard");

  // Webhook: ödeme oluşturuldu
  fireWebhooks(studioId, "payment.created", {
    paymentId: payment.id,
    customerId: data.customerId,
    amount: Number(payment.amount),
    method: payment.method,
  }).catch(() => {});

  return payment;
}

export async function getPayments() {
  const studioId = await getStudioId();
  return prisma.payment.findMany({
    where: { studioId },
    include: {
      customer: true,
      customerPackage: { include: { package: true } },
    },
    orderBy: { paidAt: "desc" },
  });
}
