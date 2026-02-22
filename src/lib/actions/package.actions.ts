"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { addDays } from "date-fns";
import { fireWebhooks } from "@/lib/webhook";

async function getStudioId(): Promise<string> {
  const session = await auth();
  if (!session?.user) throw new Error("Oturum bulunamadı");
  const studioId = (session.user as any).studioId;
  if (!studioId) throw new Error("Stüdyo bulunamadı");
  return studioId;
}

export async function getPackages() {
  const studioId = await getStudioId();
  return prisma.package.findMany({
    where: { studioId, isActive: true },
    orderBy: { name: "asc" },
  });
}

export async function createPackage(data: {
  name: string;
  lessonType: string;
  lessonCount: number;
  validityDays: number;
  price: number;
  description?: string;
}) {
  const studioId = await getStudioId();
  const pkg = await prisma.package.create({
    data: { ...data, studioId } as any,
  });
  revalidatePath("/packages");
  return pkg;
}

export async function updatePackage(
  id: string,
  data: {
    name?: string;
    lessonType?: string;
    lessonCount?: number;
    validityDays?: number;
    price?: number;
    description?: string;
    isActive?: boolean;
  }
) {
  const studioId = await getStudioId();
  await prisma.package.updateMany({
    where: { id, studioId },
    data: data as any,
  });
  revalidatePath("/packages");
}

export async function assignPackageToCustomer(
  customerId: string,
  packageId: string,
  isPaid: boolean = false,
  notes?: string
) {
  const studioId = await getStudioId();

  // Müşterinin bu stüdyoya ait olduğunu doğrula
  const customer = await prisma.customer.findFirst({
    where: { id: customerId, studioId },
  });
  if (!customer) throw new Error("Müşteri bulunamadı");

  const pkg = await prisma.package.findFirst({
    where: { id: packageId, studioId },
  });
  if (!pkg) throw new Error("Paket bulunamadı");

  const now = new Date();
  const customerPackage = await prisma.customerPackage.create({
    data: {
      customerId,
      packageId,
      totalCredits: pkg.lessonCount,
      remainingCredits: pkg.lessonCount,
      startDate: now,
      expiresAt: addDays(now, pkg.validityDays),
      isPaid,
      notes,
    },
  });

  revalidatePath(`/customers/${customerId}`);
  revalidatePath("/dashboard");

  // Webhook: paket atandı
  fireWebhooks(studioId, "package.assigned", {
    customerPackageId: customerPackage.id,
    customerId,
    packageId,
    totalCredits: pkg.lessonCount,
    isPaid,
  }).catch(() => {});

  return customerPackage;
}
