"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

async function getSession() {
  const session = await auth();
  if (!session?.user) throw new Error("Oturum bulunamadı");
  return session.user as any;
}

// ─── Stüdyo Ayarları ─────────────────────────────────────────

export async function getStudioSettings() {
  const user = await getSession();
  return prisma.studio.findUnique({ where: { id: user.studioId } });
}

export async function updateStudioSettings(data: {
  name?: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  logoUrl?: string;
  primaryColor?: string;
  accentColor?: string;
}) {
  const user = await getSession();
  const studio = await prisma.studio.update({
    where: { id: user.studioId },
    data,
  });
  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return studio;
}

// ─── Hesap Ayarları ──────────────────────────────────────────

export async function getAccountSettings() {
  const user = await getSession();
  return prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
}

export async function updateAccountInfo(data: { name: string; email: string }) {
  const user = await getSession();

  // Email değişiyorsa çakışma kontrolü
  if (data.email !== user.email) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing && existing.id !== user.id) {
      throw new Error("Bu email adresi zaten kullanımda");
    }
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { name: data.name, email: data.email },
  });
  revalidatePath("/settings");
  return updated;
}

export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}) {
  const user = await getSession();
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser?.password) throw new Error("Şifre değiştirilemedi");

  const isValid = await bcrypt.compare(data.currentPassword, dbUser.password);
  if (!isValid) throw new Error("Mevcut şifre hatalı");

  const hashed = await bcrypt.hash(data.newPassword, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed },
  });
  return { success: true };
}

// ─── Webhook Ayarları ────────────────────────────────────────

export async function getWebhookEndpoints() {
  const user = await getSession();
  return prisma.webhookEndpoint.findMany({
    where: { studioId: user.studioId },
    include: {
      logs: {
        orderBy: { sentAt: "desc" },
        take: 5,
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createWebhookEndpoint(data: {
  url: string;
  events: string[];
  label?: string;
}) {
  const user = await getSession();
  const secret = randomBytes(32).toString("hex");

  const endpoint = await prisma.webhookEndpoint.create({
    data: {
      studioId: user.studioId,
      url: data.url,
      events: data.events,
      label: data.label,
      secret,
    },
  });
  revalidatePath("/settings");
  return endpoint;
}

export async function updateWebhookEndpoint(
  id: string,
  data: { url?: string; events?: string[]; label?: string; isActive?: boolean }
) {
  const user = await getSession();
  await prisma.webhookEndpoint.updateMany({
    where: { id, studioId: user.studioId },
    data,
  });
  revalidatePath("/settings");
}

export async function deleteWebhookEndpoint(id: string) {
  const user = await getSession();
  await prisma.webhookEndpoint.deleteMany({
    where: { id, studioId: user.studioId },
  });
  revalidatePath("/settings");
}

export async function rotateWebhookSecret(id: string) {
  const user = await getSession();
  const newSecret = randomBytes(32).toString("hex");
  await prisma.webhookEndpoint.updateMany({
    where: { id, studioId: user.studioId },
    data: { secret: newSecret },
  });
  revalidatePath("/settings");
  return newSecret;
}

export async function testWebhookEndpoint(id: string) {
  const user = await getSession();
  const ep = await prisma.webhookEndpoint.findFirst({
    where: { id, studioId: user.studioId },
  });
  if (!ep) throw new Error("Endpoint bulunamadı");

  const { fireWebhooks } = await import("@/lib/webhook");
  await fireWebhooks(user.studioId, "lesson.processed", {
    test: true,
    message: "Bu bir test tetiklemesidir",
  });
  return { success: true };
}
