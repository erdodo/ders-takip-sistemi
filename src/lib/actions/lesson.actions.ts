"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { fireWebhooks } from "@/lib/webhook";

async function getCurrentUser() {
  const session = await auth();
  if (!session?.user) throw new Error("Oturum bulunamadı");
  return session.user as any;
}

/**
 * Ders işle — atomic transaction:
 * 1. Lesson kaydı oluştur
 * 2. remainingCredits--
 * 3. Sıfırsa paketi pasif et
 */
export async function processLesson(customerPackageId: string, notes?: string) {
  const user = await getCurrentUser();

  const result = await prisma.$transaction(async (tx) => {
    const pkg = await tx.customerPackage.findUnique({
      where: { id: customerPackageId },
      include: { customer: true },
    });

    if (!pkg) throw new Error("Paket bulunamadı");
    if (!pkg.isActive) throw new Error("Paket artık aktif değil");
    if (pkg.remainingCredits <= 0) throw new Error("Kredi kalmadı");

    // Tenant izolasyonu kontrolü
    if (pkg.customer.studioId !== user.studioId) {
      throw new Error("Yetkisiz erişim");
    }

    const lesson = await tx.lesson.create({
      data: {
        customerPackageId,
        loggedById: user.id,
        notes,
      },
    });

    const newCredits = pkg.remainingCredits - 1;
    const updatedPkg = await tx.customerPackage.update({
      where: { id: customerPackageId },
      data: {
        remainingCredits: newCredits,
        isActive: newCredits > 0,
      },
    });

    return { lesson, updatedPkg };
  });

  revalidatePath("/dashboard");
  revalidatePath(`/customers/${result.updatedPkg.customerId}`);
  revalidatePath("/customers");

  // Webhook: ders işlendi
  const studioId = user.studioId;
  fireWebhooks(studioId, "lesson.processed", {
    lessonId: result.lesson.id,
    customerPackageId,
    customerId: result.updatedPkg.customerId,
    remainingCredits: result.updatedPkg.remainingCredits,
  }).catch(() => {});

  // Webhook: kredi düşük uyarısı
  if (result.updatedPkg.remainingCredits <= 2) {
    fireWebhooks(studioId, "credit.low", {
      customerPackageId,
      customerId: result.updatedPkg.customerId,
      remainingCredits: result.updatedPkg.remainingCredits,
    }).catch(() => {});
  }

  return result;
}

export async function getLessons(customerPackageId: string) {
  return prisma.lesson.findMany({
    where: { customerPackageId },
    include: { loggedBy: true },
    orderBy: { lessonDate: "desc" },
  });
}
