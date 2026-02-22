import { CreditCard } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

interface UnpaidWidgetProps {
  packages: any[];
}

export function UnpaidWidget({ packages }: UnpaidWidgetProps) {
  const totalUnpaid = packages.reduce(
    (sum: number, pkg: any) => sum + Number(pkg.package.price),
    0
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center gap-2 p-4 border-b border-gray-100">
        <div className="bg-red-50 p-1.5 rounded-lg">
          <CreditCard className="w-4 h-4 text-red-500" />
        </div>
        <h2 className="font-semibold text-gray-900 text-sm">Ödeme Bekleyenler</h2>
        <span className="ml-auto bg-red-100 text-red-700 text-xs font-medium px-2 py-0.5 rounded-full">
          {packages.length}
        </span>
      </div>

      {packages.length > 0 && (
        <div className="px-4 py-2 bg-red-50 border-b border-red-100">
          <p className="text-xs text-red-600 font-medium">
            Toplam bekleyen: {formatCurrency(totalUnpaid)}
          </p>
        </div>
      )}

      <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
        {packages.length === 0 ? (
          <div className="p-6 text-center text-gray-400 text-sm">
            Bekleyen ödeme yok ✓
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
              <div className="flex-shrink-0 text-right">
                <p className="text-sm font-semibold text-red-600">
                  {formatCurrency(pkg.package.price)}
                </p>
                <p className="text-xs text-gray-400">{pkg.remainingCredits}/{pkg.totalCredits} ders</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
