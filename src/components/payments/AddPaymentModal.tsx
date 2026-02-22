"use client";

import { useState, useTransition } from "react";
import { createPayment } from "@/lib/actions/payment.actions";
import { X, Plus } from "lucide-react";
import { PAYMENT_METHOD_LABELS } from "@/lib/utils";

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
  customers: Customer[];
  onSuccess: () => void;
}

export function AddPaymentModal({ customers, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [packageId, setPackageId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("CASH");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedCustomer = customers.find((c) => c.id === customerId);
  const availablePackages = selectedCustomer?.customerPackages ?? [];

  function reset() {
    setCustomerId("");
    setPackageId("");
    setAmount("");
    setMethod("CASH");
    setNotes("");
    setError(null);
  }

  function handleOpen() {
    reset();
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
    reset();
  }

  function handleCustomerChange(id: string) {
    setCustomerId(id);
    setPackageId(""); // Reset package when customer changes
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Geçerli bir tutar girin");
      return;
    }
    if (!customerId) {
      setError("Müşteri seçin");
      return;
    }

    startTransition(async () => {
      try {
        await createPayment({
          customerId,
          customerPackageId: packageId || undefined,
          amount: parsedAmount,
          method,
          notes: notes.trim() || undefined,
        });
        handleClose();
        onSuccess();
      } catch (err: any) {
        setError(err.message || "Ödeme eklenirken hata oluştu");
      }
    });
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Ödeme Ekle
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Ödeme Ekle</h2>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Müşteri */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Müşteri <span className="text-red-500">*</span>
                </label>
                <select
                  value={customerId}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                >
                  <option value="">Müşteri seçin…</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Paket (opsiyonel) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Paket{" "}
                  <span className="text-gray-400 font-normal">(opsiyonel)</span>
                </label>
                <select
                  value={packageId}
                  onChange={(e) => setPackageId(e.target.value)}
                  disabled={!customerId || availablePackages.length === 0}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white disabled:bg-gray-50 disabled:text-gray-400"
                >
                  <option value="">Paketsiz ödeme</option>
                  {availablePackages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.package.name} ({p.remainingCredits} kredi kaldı)
                    </option>
                  ))}
                </select>
                {customerId && availablePackages.length === 0 && (
                  <p className="text-xs text-gray-400 mt-1">Bu müşterinin aktif paketi yok</p>
                )}
              </div>

              {/* Tutar + Yöntem */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tutar (₺) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    min="0.01"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="0,00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ödeme Yöntemi <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  >
                    {Object.entries(PAYMENT_METHOD_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Notlar */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notlar <span className="text-gray-400 font-normal">(opsiyonel)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  placeholder="Ödeme notu…"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-60"
                >
                  <Plus className="w-4 h-4" />
                  {isPending ? "Ekleniyor…" : "Ödemeyi Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
