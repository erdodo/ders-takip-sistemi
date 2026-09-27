import { CAMPAIGN_END_LABEL, isCampaignActive, isTenantReadOnly, READ_ONLY_MESSAGE } from "@/lib/campaign";

export function CampaignBanner({ studioId }: { studioId?: string }) {
  if (isTenantReadOnly(studioId)) {
    return <div className="bg-red-600 px-4 py-2 text-center text-sm font-medium text-white">{READ_ONLY_MESSAGE}</div>;
  }
  if (!isCampaignActive()) return null;
  return (
    <div className="bg-emerald-600 px-4 py-2 text-center text-sm font-medium text-white">
      🎉 Lansman kampanyası: {CAMPAIGN_END_LABEL} tarihine kadar tüm özellikler ücretsiz.
    </div>
  );
}
