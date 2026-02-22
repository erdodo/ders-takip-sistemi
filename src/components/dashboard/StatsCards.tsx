import {
  Users,
  BookOpen,
  AlertTriangle,
  CreditCard,
  Package,
} from "lucide-react";

interface StatsCardsProps {
  stats: {
    totalCustomers: number;
    totalActivePackages: number;
    todayLessonCount: number;
    lowCreditCount: number;
    unpaidCount: number;
  };
}

const cards = [
  {
    key: "totalCustomers" as const,
    label: "Aktif Üye",
    icon: Users,
    color: "bg-blue-500",
    bg: "bg-blue-50",
    text: "text-blue-700",
  },
  {
    key: "totalActivePackages" as const,
    label: "Aktif Paket",
    icon: Package,
    color: "bg-purple-500",
    bg: "bg-purple-50",
    text: "text-purple-700",
  },
  {
    key: "todayLessonCount" as const,
    label: "Bugün İşlenen",
    icon: BookOpen,
    color: "bg-green-500",
    bg: "bg-green-50",
    text: "text-green-700",
  },
  {
    key: "lowCreditCount" as const,
    label: "Kredi Azalan",
    icon: AlertTriangle,
    color: "bg-orange-500",
    bg: "bg-orange-50",
    text: "text-orange-700",
  },
  {
    key: "unpaidCount" as const,
    label: "Ödeme Bekleyen",
    icon: CreditCard,
    color: "bg-red-500",
    bg: "bg-red-50",
    text: "text-red-700",
  },
];

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.key}
            className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3"
          >
            <div className={`${card.bg} p-2.5 rounded-lg`}>
              <Icon className={`${card.text} w-5 h-5`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats[card.key]}</p>
              <p className="text-xs text-gray-500 leading-tight">{card.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
