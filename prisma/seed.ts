import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { addDays } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seed başlıyor...");

  // Stüdyo oluştur
  const studio = await prisma.studio.upsert({
    where: { slug: "zen-yoga-studyosu" },
    update: {},
    create: {
      name: "Zen Yoga Stüdyosu",
      slug: "zen-yoga-studyosu",
      phone: "0532 111 22 33",
      email: "info@zenyoga.com",
      address: "Kadıköy, İstanbul",
    },
  });
  console.log("✅ Stüdyo:", studio.name);

  // Admin kullanıcı
  const hashedPassword = await bcrypt.hash("demo123", 12);
  const user = await prisma.user.upsert({
    where: { email: "demo@zenyoga.com" },
    update: {},
    create: {
      studioId: studio.id,
      email: "demo@zenyoga.com",
      password: hashedPassword,
      name: "Demo Admin",
      role: "OWNER",
    },
  });
  console.log("✅ Kullanıcı:", user.email, "/ Şifre: demo123");

  // Paket şablonları
  const packages = await Promise.all([
    prisma.package.upsert({
      where: { id: "pkg-yoga-10" },
      update: {},
      create: {
        id: "pkg-yoga-10",
        studioId: studio.id,
        name: "10 Ders Yoga",
        lessonType: "YOGA",
        lessonCount: 10,
        validityDays: 60,
        price: 1500,
        description: "60 gün geçerli, 10 ders yoga paketi",
      },
    }),
    prisma.package.upsert({
      where: { id: "pkg-pilates-8" },
      update: {},
      create: {
        id: "pkg-pilates-8",
        studioId: studio.id,
        name: "8 Ders Pilates",
        lessonType: "PILATES",
        lessonCount: 8,
        validityDays: 45,
        price: 2000,
        description: "45 gün geçerli, 8 ders pilates paketi",
      },
    }),
    prisma.package.upsert({
      where: { id: "pkg-private-5" },
      update: {},
      create: {
        id: "pkg-private-5",
        studioId: studio.id,
        name: "5 Özel Ders",
        lessonType: "PRIVATE",
        lessonCount: 5,
        validityDays: 30,
        price: 3000,
        description: "30 gün geçerli, 5 özel ders paketi",
      },
    }),
  ]);
  console.log("✅ Paketler:", packages.length, "adet");

  // Demo müşteriler
  const customerData = [
    { name: "Ayşe Kaya", phone: "05321234567", email: "ayse@ornek.com" },
    { name: "Mehmet Demir", phone: "05439876543", email: "mehmet@ornek.com" },
    { name: "Zeynep Arslan", phone: "05051112233", email: "zeynep@ornek.com" },
    { name: "Can Öztürk", phone: "05324445566", email: "can@ornek.com" },
    { name: "Selin Çelik", phone: "05417778899", email: "selin@ornek.com" },
  ];

  // Her müşteriye sabit paket ata (tutarlı demo verisi)
  const packageAssignments: Record<string, { pkg: typeof packages[0]; remaining: number; isPaid: boolean }> = {
    "Ayşe Kaya":     { pkg: packages[0], remaining: 1,  isPaid: true },   // Yoga 10 → kritik düşük
    "Mehmet Demir":  { pkg: packages[0], remaining: 2,  isPaid: true },   // Yoga 10 → düşük
    "Zeynep Arslan": { pkg: packages[1], remaining: 6,  isPaid: true },   // Pilates 8 → normal
    "Can Öztürk":    { pkg: packages[1], remaining: 5,  isPaid: false },  // Pilates 8 → ödenmemiş
    "Selin Çelik":   { pkg: packages[2], remaining: 4,  isPaid: true },   // Özel 5 → yeni
  };

  for (const cd of customerData) {
    const existing = await prisma.customer.findFirst({
      where: { studioId: studio.id, phone: cd.phone },
    });
    if (!existing) {
      const customer = await prisma.customer.create({
        data: { studioId: studio.id, ...cd },
      });

      const assignment = packageAssignments[cd.name];
      if (!assignment) continue;
      const { pkg, remaining, isPaid } = assignment;

      const cp = await prisma.customerPackage.create({
        data: {
          customerId: customer.id,
          packageId: pkg.id,
          totalCredits: pkg.lessonCount,
          remainingCredits: remaining,
          startDate: new Date(),
          expiresAt: addDays(new Date(), pkg.validityDays),
          isPaid,
        },
      });

      // Kullanılan dersler için log oluştur
      const usedLessons = pkg.lessonCount - remaining;
      for (let i = 0; i < Math.min(usedLessons, 3); i++) {
        await prisma.lesson.create({
          data: {
            customerPackageId: cp.id,
            loggedById: user.id,
            lessonDate: addDays(new Date(), -(usedLessons - i)),
          },
        });
      }

      console.log(`  👤 ${customer.name} → ${remaining}/${pkg.lessonCount} ders kaldı${!isPaid ? " (ödenmemiş)" : ""}`);
    }
  }

  console.log("\n🎉 Seed tamamlandı!");
  console.log("   Email: demo@zenyoga.com");
  console.log("   Şifre: demo123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
