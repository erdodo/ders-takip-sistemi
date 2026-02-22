import { getPackages } from "@/lib/actions/package.actions";
import Link from "next/link";
import { Plus, Package } from "lucide-react";
import { formatCurrency, LESSON_TYPE_LABELS } from "@/lib/utils";

export default async function PackagesPage() {
  const packages = await getPackages();

  const lessonTypeColors: Record<string, string> = {
    YOGA: "bg-purple-100 text-purple-700",
    PILATES: "bg-pink-100 text-pink-700",
    PRIVATE: "bg-blue-100 text-blue-700",
    OTHER: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Paketler</h1>
          <p className="text-gray-500 text-sm mt-0.5">Satılabilir paket şablonları</p>
        </div>
        <Link
          href="/packages/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Yeni Paket</span>
          <span className="sm:hidden">Ekle</span>
        </Link>
      </div>

      {packages.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="w-7 h-7 text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Henüz paket yok</h3>
          <p className="text-gray-500 text-sm mb-4">
            İlk paket şablonunuzu oluşturun
          </p>
          <Link
            href="/packages/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus size={16} />
            Paket Oluştur
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white rounded-xl border border-gray-200 p-5 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{pkg.name}</p>
                  <span
                    className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-1 ${
                      lessonTypeColors[pkg.lessonType] ?? lessonTypeColors.OTHER
                    }`}
                  >
                    {LESSON_TYPE_LABELS[pkg.lessonType] ?? pkg.lessonType}
                  </span>
                </div>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(pkg.price)}
                </p>
              </div>

              {pkg.description && (
                <p className="text-xs text-gray-500">{pkg.description}</p>
              )}

              <div className="flex gap-3 pt-1 border-t border-gray-100">
                <div className="flex-1 text-center">
                  <p className="text-lg font-bold text-green-600">{pkg.lessonCount}</p>
                  <p className="text-xs text-gray-500">ders</p>
                </div>
                <div className="w-px bg-gray-100" />
                <div className="flex-1 text-center">
                  <p className="text-lg font-bold text-gray-700">{pkg.validityDays}</p>
                  <p className="text-xs text-gray-500">gün geçerli</p>
                </div>
                <div className="w-px bg-gray-100" />
                <div className="flex-1 text-center">
                  <p className="text-lg font-bold text-gray-700">
                    {(parseFloat(pkg.price.toString()) / pkg.lessonCount).toFixed(0)}₺
                  </p>
                  <p className="text-xs text-gray-500">ders/fiyat</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
