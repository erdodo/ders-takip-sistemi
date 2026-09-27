// Lansman kampanyası: kayıt olan her stüdyo bu tarihe kadar sistemi ücretsiz ve tam yetkili kullanır.
// Tarih geçtikten sonra aboneliği olmayan stüdyolar salt okunur olur (veriler görünür, değişiklik yapılamaz).
//
// Aboneliği olan stüdyolar: ortam değişkeni SUBSCRIBED_TENANTS — virgülle ayrılmış stüdyo id listesi.
// Bu dosya middleware tarafından da kullanıldığı için Prisma import ETMEZ.

export const CAMPAIGN_END = new Date("2027-01-31T23:59:59+03:00");
export const CAMPAIGN_END_LABEL = "31 Ocak 2027";
export const CONTACT_EMAIL = "erdoganyesil3@gmail.com";

export function isCampaignActive(now: Date = new Date()): boolean {
  return now.getTime() <= CAMPAIGN_END.getTime();
}

export function isTenantReadOnly(studioId?: string | null): boolean {
  if (isCampaignActive()) return false;
  const subscribed = (process.env.SUBSCRIBED_TENANTS ?? "").split(",").map((s) => s.trim());
  return !studioId || !subscribed.includes(studioId);
}

export const READ_ONLY_MESSAGE = `Ücretsiz kullanım süresi ${CAMPAIGN_END_LABEL} tarihinde sona erdi. Hesabınız salt okunur; devam etmek için ${CONTACT_EMAIL} adresinden abonelik başlatın.`;
