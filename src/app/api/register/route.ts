import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { BURST_MESSAGE, burstSince, isSignupBurst, spamCheck } from "@/lib/antispam";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { studioName, email, password, phone } = body;
    const spam = spamCheck(body);
    if (spam) return NextResponse.json({ error: spam }, { status: 400 });
    if (isSignupBurst(await prisma.studio.count({ where: { createdAt: { gte: burstSince() } } }))) {
      return NextResponse.json({ error: BURST_MESSAGE }, { status: 429 });
    }

    if (!studioName || !email || !password) {
      return NextResponse.json(
        { error: "Tüm alanlar zorunludur" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Bu email adresi zaten kayıtlı" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    let slug = slugify(studioName);

    // Slug çakışma kontrolü
    const existingStudio = await prisma.studio.findUnique({ where: { slug } });
    if (existingStudio) {
      slug = slug + "-" + Date.now();
    }

    const { user } = await prisma.$transaction(async (tx) => {
      const studio = await tx.studio.create({
        data: { name: studioName, slug, phone },
      });

      const user = await tx.user.create({
        data: {
          studioId: studio.id,
          email,
          password: hashedPassword,
          name: studioName + " Admin",
          role: "OWNER",
        },
      });

      return { studio, user };
    });

    return NextResponse.json(
      { message: "Hesap oluşturuldu", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
