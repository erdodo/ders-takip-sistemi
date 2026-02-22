import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const studioId = (session.user as any).studioId;

  const packages = await prisma.package.findMany({
    where: { studioId, isActive: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(packages);
}
