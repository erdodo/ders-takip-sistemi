"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { assignPackageToCustomer } from "@/lib/actions/package.actions";
import Link from "next/link";
import { ArrowLeft, Package } from "lucide-react";
import { formatCurrency, LESSON_TYPE_LABELS } from "@/lib/utils";

interface PageProps {
  params: { id: string };
}

export default function AssignPackagePage({ params }: PageProps) {
  const router = useRouter();
  const [packages, setPackages] = useState<any[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/packages")
      .then((r) => r.json())
      .then(setPackages)
      .catch(console.error);
  }, []);

  const selectedPackage = packages.find((p) => p.id === selectedPackageId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPackageId) {
      setError("Lütfen bir paket seçin");
      return;
    }
    setLoading(true);
    setError("");

    try {
      await assignPackageToCustomer(
        params.id,
        selectedPackageId,
        isPaid,
        notes || undefined
      );
      router.push(`/customers/${params.id}`);
    } catch (err: any) {
      setError(err?.message ?? "Bir hata oluştu");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link
          href={`/customers/${params.id}`}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Paket Ata</h1>
          <p className="text-gray-500 text-sm">Müşteriye paket atayın</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paket Seç <span className="text-red-500">*</span>
            </label>
            {packages.length === 0 ? (
              <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg">
                Henüz paket tanımlanmamış.{" "}
                <Link href="/packages/new" className="text-green-600 hover:underline">
                  Paket oluşturun
                </Link>
              </div>
            ) : (
              <div className="grid gap-2">
                {packages.map((pkg) => (
                  <label
                    key={pkg.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedPackageId === pkg.id
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="package"
                      value={pkg.id}
                      checked={selectedPackageId === pkg.id}
                      onChange={(e) => setSelectedPackageId(e.target.value)}
                      className="accent-green-600"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{pkg.name}</p>
                      <p className="text-xs text-gray-500">
                        {LESSON_TYPE_LABELS[pkg.lessonType]} • {pkg.lessonCount} ders •{" "}
                        {pkg.validityDays} gün
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 flex-shrink-0">
                      {formatCurrency(pkg.price)}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {selectedPackage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-xs text-green-700">
                <span className="font-semibold">{selectedPackage.lessonCount} ders</span>,{" "}
                {selectedPackage.validityDays} gün geçerli —{" "}
                {formatCurrency(selectedPackage.price)}
              </p>
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isPaid"
              checked={isPaid}
              onChange={(e) => setIsPaid(e.target.checked)}
              className="accent-green-600 w-4 h-4"
            />
            <label htmlFor="isPaid" className="text-sm text-gray-700">
              Ödeme yapıldı
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Not (opsiyonel)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm resize-none"
              placeholder="Özel not..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Link
              href={`/customers/${params.id}`}
              className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              İptal
            </Link>
            <button
              type="submit"
              disabled={loading || !selectedPackageId}
              className="flex-1 py-2.5 px-4 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-medium rounded-lg transition-colors inline-flex items-center justify-center gap-2"
            >
              <Package size={15} />
              {loading ? "Atanıyor..." : "Paketi Ata"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
