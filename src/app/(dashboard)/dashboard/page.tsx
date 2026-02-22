import { getDashboardData } from "@/lib/actions/dashboard.actions";
import { auth } from "@/lib/auth";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { TodayLessonsWidget } from "@/components/dashboard/TodayLessonsWidget";
import { LowCreditsWidget } from "@/components/dashboard/LowCreditsWidget";
import { UnpaidWidget } from "@/components/dashboard/UnpaidWidget";

export default async function DashboardPage() {
  const [session, data] = await Promise.all([
    auth(),
    getDashboardData(),
  ]);

  const studioName = (session?.user as any)?.studioName ?? "Stüdyonuz";

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          {new Date().toLocaleDateString("tr-TR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      {/* İstatistik Kartları */}
      <StatsCards stats={data.stats} />

      {/* 3 Widget Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <TodayLessonsWidget lessons={data.todayLessons} />
        <LowCreditsWidget packages={data.lowCreditPackages} studioName={studioName} />
        <UnpaidWidget packages={data.unpaidPackages} />
      </div>
    </div>
  );
}
