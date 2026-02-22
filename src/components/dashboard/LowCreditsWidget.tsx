import { AlertTriangle } from "lucide-react";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
import Link from "next/link";

interface LowCreditsWidgetProps {
  packages: any[];
  studioName: string;
}

export function LowCreditsWidget({ packages, studioName }: LowCreditsWidgetProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center gap-2 p-4 border-b border-gray-100">
        <div className="bg-orange-50 p-1.5 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-orange-500" />
        </div>
        <h2 className="font-semibold text-gray-900 text-sm">Kredisi Azalanlar</h2>
        <span className="ml-auto bg-orange-100 text-orange-700 text-xs font-medium px-2 py-0.5 rounded-full">
          {packages.length}
        </span>
      </div>

      <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
        {packages.length === 0 ? (
          <div className="p-6 text-center text-gray-400 text-sm">
            Kredisi azalan üye yok 🎉
          </div>
        ) : (
          packages.map((pkg: any) => (
            <div key={pkg.id} className="px-4 py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <Link
                  href={`/customers/${pkg.customer.id}`}
                  className="text-sm font-medium text-gray-900 hover:text-green-700 truncate block"
                >
                  {pkg.customer.name}
                </Link>
                <p className="text-xs text-gray-500">{pkg.package.name}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span
                  className={`text-xs font-bold px-2 py-1 rounded-lg ${
                    pkg.remainingCredits === 0
                      ? "bg-red-100 text-red-700"
                      : "bg-orange-100 text-orange-700"
                  }`}
                >
                  {pkg.remainingCredits} ders
                </span>
                {pkg.customer.phone && (
                  <WhatsAppButton
                    phone={pkg.customer.phone}
                    customerName={pkg.customer.name}
                    remainingCredits={pkg.remainingCredits}
                    studioName={studioName}
                    variant="icon"
                  />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
