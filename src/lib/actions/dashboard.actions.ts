"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function getStudioId(): Promise<string> {
  const session = await auth();
  if (!session?.user) throw new Error("Oturum bulunamadı");
  const studioId = (session.user as any).studioId;
  if (!studioId) throw new Error("Stüdyo bulunamadı");
  return studioId;
}

export async function getDashboardData() {
  const studioId = await getStudioId();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [
    todayLessons,
    lowCreditPackages,
    unpaidPackages,
    totalCustomers,
    totalActivePackages,
  ] = await Promise.all([
    // Bugün işlenen dersler
    prisma.lesson.findMany({
      where: {
        lessonDate: { gte: today, lt: tomorrow },
        customerPackage: { customer: { studioId } },
      },
      include: {
        customerPackage: {
          include: { customer: true, package: true },
        },
        loggedBy: true,
      },
      orderBy: { lessonDate: "desc" },
    }),

    // Kredisi 2 veya altı olan aktif paketler
    prisma.customerPackage.findMany({
      where: {
        isActive: true,
        remainingCredits: { lte: 2 },
        customer: { studioId },
      },
      include: {
        customer: true,
        package: true,
      },
      orderBy: { remainingCredits: "asc" },
    }),

    // Ödemesi eksik aktif paketler
    prisma.customerPackage.findMany({
      where: {
        isPaid: false,
        isActive: true,
        customer: { studioId },
      },
      include: {
        customer: true,
        package: true,
      },
      orderBy: { createdAt: "desc" },
    }),

    // Toplam aktif müşteri sayısı
    prisma.customer.count({
      where: { studioId, isActive: true },
    }),

    // Toplam aktif paket sayısı
    prisma.customerPackage.count({
      where: { isActive: true, customer: { studioId } },
    }),
  ]);

  return {
    todayLessons,
    lowCreditPackages,
    unpaidPackages,
    stats: {
      totalCustomers,
      totalActivePackages,
      todayLessonCount: todayLessons.length,
      lowCreditCount: lowCreditPackages.length,
      unpaidCount: unpaidPackages.length,
    },
  };
}
