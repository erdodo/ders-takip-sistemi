"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPackage } from "@/lib/actions/package.actions";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const LESSON_TYPES = [
  { value: "YOGA", label: "Yoga" },
  { value: "PILATES", label: "Pilates" },
  { value: "PRIVATE", label: "Özel Ders" },
  { value: "OTHER", label: "Diğer" },
];

export default function NewPackagePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    lessonType: "YOGA",
    lessonCount: 10,
    validityDays: 30,
    price: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await createPackage({
        name: form.name,
        lessonType: form.lessonType,
        lessonCount: Number(form.lessonCount),
        validityDays: Number(form.validityDays),
        price: Number(form.price),
        description: form.description || undefined,
      });
      router.push("/packages");
    } catch (err: any) {
      setError(err?.message ?? "Bir hata oluştu");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link
          href="/packages"
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Yeni Paket</h1>
          <p className="text-gray-500 text-sm">Paket şablonu oluşturun</p>
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
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Paket Adı <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              placeholder="10 Ders Yoga Paketi"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Ders Türü
            </label>
            <select
              name="lessonType"
              value={form.lessonType}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white"
            >
              {LESSON_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Ders Sayısı <span className="text-red-500">*</span>
              </label>
              <input
                name="lessonCount"
                type="number"
                min={1}
                max={100}
                value={form.lessonCount}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Geçerlilik (gün) <span className="text-red-500">*</span>
              </label>
              <input
                name="validityDays"
                type="number"
                min={1}
                max={365}
                value={form.validityDays}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Fiyat (₺) <span className="text-red-500">*</span>
            </label>
            <input
              name="price"
              type="number"
              min={0}
              step="0.01"
              value={form.price}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              placeholder="1500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Açıklama
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm resize-none"
              placeholder="Paket hakkında ek bilgi..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Link
              href="/packages"
              className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              İptal
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-4 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {loading ? "Oluşturuluyor..." : "Paketi Oluştur"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
