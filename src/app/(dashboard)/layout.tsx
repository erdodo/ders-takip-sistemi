import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/shared/DashboardShell";

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
    <DashboardShell studioName={studioName}>
      {children}
    </DashboardShell>
  );
}
