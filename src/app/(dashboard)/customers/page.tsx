import { getCustomers } from "@/lib/actions/customer.actions";
import Link from "next/link";
import { UserPlus, Search, ChevronRight } from "lucide-react";
import { LESSON_TYPE_LABELS } from "@/lib/utils";

export default async function CustomersPage() {
  const customers = await getCustomers();

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Müşteriler</h1>
          <p className="text-gray-500 text-sm mt-0.5">{customers.length} kayıtlı üye</p>
        </div>
        <Link
          href="/customers/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
        >
          <UserPlus size={16} />
          <span className="hidden sm:inline">Yeni Müşteri</span>
          <span className="sm:hidden">Ekle</span>
        </Link>
      </div>

      {/* Customer List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {customers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-7 h-7 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Henüz müşteri yok</h3>
            <p className="text-gray-500 text-sm mb-4">İlk müşterinizi ekleyerek başlayın</p>
            <Link
              href="/customers/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              <UserPlus size={16} />
              Müşteri Ekle
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {customers.map((customer) => {
              const activePackage = customer.customerPackages[0];
              const isLowCredit = activePackage && activePackage.remainingCredits <= 2;

              return (
                <Link
                  key={customer.id}
                  href={`/customers/${customer.id}`}
                  className="flex items-center px-4 py-3.5 hover:bg-gray-50 transition-colors group"
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 font-semibold text-sm flex items-center justify-center flex-shrink-0 mr-3">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 truncate">{customer.name}</p>
                      {!customer.isActive && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">Pasif</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{customer.phone}</p>
                  </div>

                  {/* Package Status */}
                  <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                    {activePackage ? (
                      <div className="text-right">
                        <p className="text-xs text-gray-500 hidden sm:block">
                          {LESSON_TYPE_LABELS[activePackage.package.lessonType]}
                        </p>
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            isLowCredit
                              ? "bg-orange-100 text-orange-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {activePackage.remainingCredits} ders
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        Paketsiz
                      </span>
                    )}
                    <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-600" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
