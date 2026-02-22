"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function getStudioId(): Promise<string> {
  const session = await auth();
  if (!session?.user) throw new Error("Oturum bulunamadı");
  const studioId = (session.user as any).studioId;
  if (!studioId) throw new Error("Stüdyo bulunamadı");
  return studioId;
}

export async function getCustomers() {
  const studioId = await getStudioId();
  return prisma.customer.findMany({
    where: { studioId },
    include: {
      customerPackages: {
        where: { isActive: true },
        include: { package: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function getCustomerById(id: string) {
  const studioId = await getStudioId();
  return prisma.customer.findFirst({
    where: { id, studioId },
    include: {
      customerPackages: {
        include: {
          package: true,
          lessons: {
            include: { loggedBy: true },
            orderBy: { lessonDate: "desc" },
          },
          payments: true,
        },
        orderBy: { createdAt: "desc" },
      },
      payments: {
        orderBy: { paidAt: "desc" },
      },
    },
  });
}

export async function createCustomer(data: {
  name: string;
  email?: string;
  phone: string;
  notes?: string;
}) {
  const studioId = await getStudioId();
  const customer = await prisma.customer.create({
    data: { ...data, studioId },
  });
  revalidatePath("/customers");

  // Webhook: müşteri oluşturuldu
  const { fireWebhooks } = await import("@/lib/webhook");
  fireWebhooks(studioId, "customer.created", {
    customerId: customer.id,
    name: customer.name,
    phone: customer.phone,
  }).catch(() => {});

  return customer;
}

export async function updateCustomer(
  id: string,
  data: {
    name?: string;
    email?: string;
    phone?: string;
    notes?: string;
    isActive?: boolean;
  }
) {
  const studioId = await getStudioId();
  const customer = await prisma.customer.updateMany({
    where: { id, studioId },
    data,
  });
  revalidatePath("/customers");
  revalidatePath(`/customers/${id}`);
  return customer;
}

export async function deleteCustomer(id: string) {
  const studioId = await getStudioId();
  await prisma.customer.deleteMany({ where: { id, studioId } });
  revalidatePath("/customers");
}

export async function getCustomersWithActivePackages() {
  const studioId = await getStudioId();
  return prisma.customer.findMany({
    where: { studioId, isActive: true },
    include: {
      customerPackages: {
        where: { isActive: true },
        include: { package: true },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { name: "asc" },
  });
}
