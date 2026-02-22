import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatCurrency(amount: number | string | any): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(Number(amount));
}

/**
 * Türkiye telefon numarasını WhatsApp formatına dönüştürür
 * 05xx → 905xx
 */
export function formatPhoneForWhatsApp(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("90")) return cleaned;
  if (cleaned.startsWith("0")) return "90" + cleaned.slice(1);
  return "90" + cleaned;
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const formattedPhone = formatPhoneForWhatsApp(phone);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
}

export function getLowCreditMessage(
  customerName: string,
  remainingCredits: number,
  studioName: string
): string {
  return `Merhaba ${customerName} 👋

${studioName} olarak bilgilendirmek istedik: paketinizde yalnızca *${remainingCredits} ders hakkınız* kaldı.

Devam etmek için yeni bir paket alabilirsiniz. Sorularınız için bize ulaşmaktan çekinmeyin! 🙏`;
}

export function getDaysUntilExpiry(expiresAt: Date | string): number {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diff = expiry.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const LESSON_TYPE_LABELS: Record<string, string> = {
  YOGA: "Yoga",
  PILATES: "Pilates",
  PRIVATE: "Özel Ders",
  OTHER: "Diğer",
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: "Nakit",
  CARD: "Kart",
  BANK_TRANSFER: "Banka Transferi",
};
