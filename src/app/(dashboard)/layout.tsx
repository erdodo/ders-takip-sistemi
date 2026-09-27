import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { CampaignBanner } from "@/components/shared/CampaignBanner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const studioName = (session.user as any).studioName;

  return (
    <>
      <CampaignBanner studioId={(session.user as any).studioId} />
      <DashboardShell studioName={studioName}>
        {children}
      </DashboardShell>
    </>
  );
}
