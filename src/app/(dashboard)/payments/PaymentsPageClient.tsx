"use client";

import { useRouter } from "next/navigation";
import { AddPaymentModal } from "@/components/payments/AddPaymentModal";
import {
  formatCurrency,
  formatDateTime,
  PAYMENT_METHOD_LABELS,
} from "@/lib/utils";
import { CreditCard } from "lucide-react";

interface Payment {
  id: string;
  amount: any;
  method: string;
  paidAt: Date;
  customer: { name: string };
  customerPackage?: { package: { name: string } } | null;
}

interface ActivePackage {
  id: string;
  package: { name: string };
  remainingCredits: number;
}

interface Customer {
  id: string;
  name: string;
  customerPackages: ActivePackage[];
}

interface Props {
  payments: Payment[];
  customers: Customer[];
}

export function PaymentsPageClient({ payments, customers }: Props) {
  const router = useRouter();

  const totalAmount = payments.reduce(
    (sum, p) => sum + parseFloat(p.amount.toString()),
    0
  );

  const methodColors: Record<string, string> = {
    CASH: "bg-green-100 text-green-700",
    CARD: "bg-blue-100 text-blue-700",
    BANK_TRANSFER: "bg-purple-100 text-purple-700",
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ödemeler</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {payments.length} ödeme kaydı
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-right">
            <p className="text-xs text-gray-500">Toplam Tahsilat</p>
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(totalAmount)}
            </p>
          </div>
          <AddPaymentModal
            customers={customers}
            onSuccess={() => router.refresh()}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {payments.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-7 h-7 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Henüz ödeme yok</h3>
            <p className="text-gray-500 text-sm">
              &quot;Ödeme Ekle&quot; butonuyla ilk ödemeyi ekleyin
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table header */}
            <div className="hidden sm:grid sm:grid-cols-5 px-4 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wide">
              <div className="col-span-2">Müşteri / Paket</div>
              <div>Tarih</div>
              <div>Yöntem</div>
              <div className="text-right">Tutar</div>
            </div>
            <div className="divide-y divide-gray-100">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="px-4 py-3 flex items-center sm:grid sm:grid-cols-5 gap-3"
                >
                  <div className="sm:col-span-2 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {payment.customer.name}
                    </p>
                    {payment.customerPackage && (
                      <p className="text-xs text-gray-500 truncate">
                        {payment.customerPackage.package.name}
                      </p>
                    )}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm text-gray-600">
                      {formatDateTime(payment.paidAt)}
                    </p>
                  </div>
                  <div>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        methodColors[payment.method] ?? "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {PAYMENT_METHOD_LABELS[payment.method] ?? payment.method}
                    </span>
                  </div>
                  <div className="text-right ml-auto sm:ml-0">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(payment.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
