"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import {
  User,
  Building2,
  Webhook,
  Save,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  RefreshCw,
  Play,
  CheckCircle,
  XCircle,
  Copy,
  Check,
} from "lucide-react";
import {
  updateStudioSettings,
  updateAccountInfo,
  changePassword,
  createWebhookEndpoint,
  updateWebhookEndpoint,
  deleteWebhookEndpoint,
  rotateWebhookSecret,
  testWebhookEndpoint,
} from "@/lib/actions/settings.actions";

// ─── Tipler ───────────────────────────────────────────────────

interface Studio {
  id: string;
  name: string;
  description?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  website?: string | null;
  logoUrl?: string | null;
  primaryColor?: string | null;
  accentColor?: string | null;
}

interface Account {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: Date;
}

interface WebhookLog {
  id: string;
  event: string;
  status: string;
  statusCode?: number | null;
  sentAt: Date;
}

interface WebhookEndpoint {
  id: string;
  url: string;
  label?: string | null;
  events: string[];
  isActive: boolean;
  secret: string;
  createdAt: Date;
  logs: WebhookLog[];
}

interface Props {
  studio: Studio;
  account: Account;
  webhooks: WebhookEndpoint[];
}

const WEBHOOK_EVENTS = [
  { value: "lesson.processed", label: "Ders İşlendi" },
  { value: "payment.created", label: "Ödeme Oluşturuldu" },
  { value: "customer.created", label: "Müşteri Oluşturuldu" },
  { value: "customer.updated", label: "Müşteri Güncellendi" },
  { value: "package.assigned", label: "Paket Atandı" },
  { value: "credit.low", label: "Kredi Azaldı (≤2)" },
];

// ─── Toast ────────────────────────────────────────────────────

function Toast({ message, type }: { message: string; type: "success" | "error" }) {
  return (
    <div
      className={cn(
        "fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium",
        type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
      )}
    >
      {type === "success" ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
      {message}
    </div>
  );
}

// ─── Ana Bileşen ──────────────────────────────────────────────

export function SettingsClient({ studio, account, webhooks: initialWebhooks }: Props) {
  const [activeTab, setActiveTab] = useState<"account" | "studio" | "webhook">("account");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  function showToast(message: string, type: "success" | "error" = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  const tabs = [
    { id: "account" as const, label: "Hesabım", icon: User },
    { id: "studio" as const, label: "İşletme", icon: Building2 },
    { id: "webhook" as const, label: "Webhook", icon: Webhook },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ayarlar</h1>
        <p className="text-gray-500 text-sm mt-0.5">Hesap ve stüdyo bilgilerinizi yönetin</p>
      </div>

      {/* Sekme Başlıkları */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
                  activeTab === tab.id
                    ? "border-green-600 text-green-700"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sekme İçerikleri */}
      {activeTab === "account" && (
        <AccountTab account={account} onShowToast={showToast} />
      )}
      {activeTab === "studio" && (
        <StudioTab studio={studio} onShowToast={showToast} />
      )}
      {activeTab === "webhook" && (
        <WebhookTab webhooks={initialWebhooks} onShowToast={showToast} />
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}

// ─── Hesabım Sekmesi ──────────────────────────────────────────

function AccountTab({
  account,
  onShowToast,
}: {
  account: Account;
  onShowToast: (msg: string, type?: "success" | "error") => void;
}) {
  const [name, setName] = useState(account.name ?? "");
  const [email, setEmail] = useState(account.email);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isPwPending, startPwTransition] = useTransition();

  function handleInfoSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        await updateAccountInfo({ name, email });
        onShowToast("Bilgiler güncellendi");
      } catch (err: any) {
        onShowToast(err.message || "Hata oluştu", "error");
      }
    });
  }

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPw !== confirmPw) {
      onShowToast("Şifreler eşleşmiyor", "error");
      return;
    }
    if (newPw.length < 6) {
      onShowToast("Şifre en az 6 karakter olmalı", "error");
      return;
    }
    startPwTransition(async () => {
      try {
        await changePassword({ currentPassword: currentPw, newPassword: newPw });
        onShowToast("Şifre değiştirildi");
        setCurrentPw("");
        setNewPw("");
        setConfirmPw("");
      } catch (err: any) {
        onShowToast(err.message || "Hata oluştu", "error");
      }
    });
  }

  return (
    <div className="grid gap-5 max-w-2xl">
      {/* Kişisel Bilgiler */}
      <form onSubmit={handleInfoSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Kişisel Bilgiler</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Ad Soyad"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="ornek@email.com"
            />
          </div>
        </div>
        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-gray-400">Rol: {account.role === "OWNER" ? "Sahip" : "Eğitmen"}</p>
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-60 transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            {isPending ? "Kaydediliyor…" : "Kaydet"}
          </button>
        </div>
      </form>

      {/* Şifre Değiştir */}
      <form onSubmit={handlePasswordSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Şifre Değiştir</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mevcut Şifre</label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              required
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Yeni Şifre</label>
            <input
              type={showPw ? "text" : "password"}
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Şifre Tekrar</label>
            <input
              type={showPw ? "text" : "password"}
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={isPwPending}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-60 transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            {isPwPending ? "Değiştiriliyor…" : "Şifreyi Değiştir"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── İşletme Sekmesi ──────────────────────────────────────────

function StudioTab({
  studio,
  onShowToast,
}: {
  studio: Studio;
  onShowToast: (msg: string, type?: "success" | "error") => void;
}) {
  const [form, setForm] = useState({
    name: studio.name,
    description: studio.description ?? "",
    phone: studio.phone ?? "",
    email: studio.email ?? "",
    address: studio.address ?? "",
    website: studio.website ?? "",
    logoUrl: studio.logoUrl ?? "",
    primaryColor: studio.primaryColor ?? "#16a34a",
    accentColor: studio.accentColor ?? "#15803d",
  });
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        await updateStudioSettings(form);
        onShowToast("İşletme bilgileri güncellendi");
      } catch (err: any) {
        onShowToast(err.message || "Hata oluştu", "error");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Temel Bilgiler</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Stüdyo Adı *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            placeholder="Stüdyonuz hakkında kısa bir açıklama…"
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="05xx xxx xx xx"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="info@studyonuz.com"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
          <textarea
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Web Sitesi</label>
          <input
            type="url"
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="https://studyonuz.com"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Görünüm</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
          <input
            type="url"
            value={form.logoUrl}
            onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="https://cdn.ornek.com/logo.png"
          />
          {form.logoUrl && (
            <div className="mt-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={form.logoUrl}
                alt="Logo önizleme"
                className="h-12 object-contain rounded border border-gray-200 p-1"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            </div>
          )}
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ana Renk</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.primaryColor}
                onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={form.primaryColor}
                onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="#16a34a"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vurgu Rengi</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.accentColor}
                onChange={(e) => setForm({ ...form, accentColor: e.target.value })}
                className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={form.accentColor}
                onChange={(e) => setForm({ ...form, accentColor: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="#15803d"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-60 transition-colors"
        >
          <Save className="w-4 h-4" />
          {isPending ? "Kaydediliyor…" : "Değişiklikleri Kaydet"}
        </button>
      </div>
    </form>
  );
}

// ─── Webhook Sekmesi ─────────────────────────────────────────

function WebhookTab({
  webhooks: initial,
  onShowToast,
}: {
  webhooks: WebhookEndpoint[];
  onShowToast: (msg: string, type?: "success" | "error") => void;
}) {
  const [webhooks, setWebhooks] = useState(initial);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>(["lesson.processed"]);
  const [isPending, startTransition] = useTransition();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function toggleEvent(ev: string) {
    setSelectedEvents((prev) =>
      prev.includes(ev) ? prev.filter((e) => e !== ev) : [...prev, ev]
    );
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newUrl || selectedEvents.length === 0) return;
    startTransition(async () => {
      try {
        const endpoint = await createWebhookEndpoint({
          url: newUrl,
          events: selectedEvents,
          label: newLabel || undefined,
        });
        setWebhooks((prev) => [endpoint as any, ...prev]);
        setShowAddForm(false);
        setNewUrl("");
        setNewLabel("");
        setSelectedEvents(["lesson.processed"]);
        onShowToast("Webhook eklendi");
      } catch (err: any) {
        onShowToast(err.message || "Hata oluştu", "error");
      }
    });
  }

  function handleToggle(id: string, current: boolean) {
    startTransition(async () => {
      try {
        await updateWebhookEndpoint(id, { isActive: !current });
        setWebhooks((prev) =>
          prev.map((w) => (w.id === id ? { ...w, isActive: !current } : w))
        );
      } catch {
        onShowToast("Güncelleme başarısız", "error");
      }
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Bu webhook endpoint silinecek. Emin misiniz?")) return;
    startTransition(async () => {
      try {
        await deleteWebhookEndpoint(id);
        setWebhooks((prev) => prev.filter((w) => w.id !== id));
        onShowToast("Webhook silindi");
      } catch {
        onShowToast("Silme başarısız", "error");
      }
    });
  }

  function handleRotate(id: string) {
    if (!confirm("Secret yenilenecek. Mevcut entegrasyonunuz çalışmayı durdurabilir. Devam?")) return;
    startTransition(async () => {
      try {
        const newSecret = await rotateWebhookSecret(id);
        setWebhooks((prev) =>
          prev.map((w) => (w.id === id ? { ...w, secret: newSecret } : w))
        );
        onShowToast("Secret yenilendi");
      } catch {
        onShowToast("Yenileme başarısız", "error");
      }
    });
  }

  function handleTest(id: string) {
    startTransition(async () => {
      try {
        await testWebhookEndpoint(id);
        onShowToast("Test isteği gönderildi");
      } catch (err: any) {
        onShowToast(err.message || "Test başarısız", "error");
      }
    });
  }

  async function copySecret(id: string, secret: string) {
    await navigator.clipboard.writeText(secret);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Açıklama */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        <strong>Webhook nedir?</strong> Belirli olaylar gerçekleştiğinde (ders işleme, ödeme alma vb.)
        sisteminizin belirlediğiniz URL&apos;e otomatik HTTP POST isteği göndermesidir.
        İstekler <code className="bg-blue-100 px-1 rounded">X-Webhook-Signature: sha256=...</code> başlığıyla imzalanır.
      </div>

      {/* Ekle Butonu */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Yeni Endpoint Ekle
        </button>
      </div>

      {/* Yeni Endpoint Formu */}
      {showAddForm && (
        <form onSubmit={handleAdd} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h3 className="font-semibold text-gray-900">Yeni Webhook Endpoint</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Etiket <span className="text-gray-400 font-normal">(opsiyonel)</span>
            </label>
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Örn: Zapier Entegrasyonu"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL *</label>
            <input
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="https://hooks.zapier.com/hooks/catch/..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tetiklenecek Olaylar *</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {WEBHOOK_EVENTS.map((ev) => (
                <label
                  key={ev.value}
                  className="flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors hover:bg-gray-50 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={selectedEvents.includes(ev.value)}
                    onChange={() => toggleEvent(ev.value)}
                    className="accent-green-600"
                  />
                  {ev.label}
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-60"
            >
              <Plus className="w-3.5 h-3.5" />
              {isPending ? "Ekleniyor…" : "Ekle"}
            </button>
          </div>
        </form>
      )}

      {/* Endpoint Listesi */}
      {webhooks.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <Webhook className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Henüz webhook endpoint eklenmemiş</p>
        </div>
      ) : (
        <div className="space-y-3">
          {webhooks.map((wh) => (
            <div key={wh.id} className="bg-white rounded-xl border border-gray-200">
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {wh.label && (
                        <span className="font-medium text-gray-900 text-sm">{wh.label}</span>
                      )}
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full font-medium",
                          wh.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        )}
                      >
                        {wh.isActive ? "Aktif" : "Pasif"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 font-mono mt-1 truncate">{wh.url}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {wh.events.map((ev) => {
                        const label = WEBHOOK_EVENTS.find((e) => e.value === ev)?.label ?? ev;
                        return (
                          <span key={ev} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                            {label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  {/* Aksiyonlar */}
                  <div className="flex items-center gap-1">
                    {/* Aktif/Pasif Anahtar */}
                    <button
                      onClick={() => handleToggle(wh.id, wh.isActive)}
                      title={wh.isActive ? "Devre Dışı Bırak" : "Etkinleştir"}
                      className={cn(
                        "p-2 rounded-lg text-xs font-medium transition-colors",
                        wh.isActive
                          ? "text-gray-500 hover:bg-gray-100"
                          : "text-green-600 hover:bg-green-50"
                      )}
                    >
                      {wh.isActive ? (
                        <XCircle className="w-4 h-4" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                    </button>
                    {/* Test */}
                    <button
                      onClick={() => handleTest(wh.id)}
                      title="Test Gönder"
                      className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                    {/* Secret Yenile */}
                    <button
                      onClick={() => handleRotate(wh.id)}
                      title="Secret Yenile"
                      className="p-2 rounded-lg text-amber-500 hover:bg-amber-50 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    {/* Sil */}
                    <button
                      onClick={() => handleDelete(wh.id)}
                      title="Sil"
                      className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Secret */}
                <div className="mt-3 flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                  <span className="text-xs text-gray-500 font-medium">Secret:</span>
                  <code className="text-xs text-gray-700 font-mono flex-1 truncate">
                    {wh.secret}
                  </code>
                  <button
                    onClick={() => copySecret(wh.id, wh.secret)}
                    className="text-gray-400 hover:text-gray-700 flex-shrink-0"
                    title="Kopyala"
                  >
                    {copiedId === wh.id ? (
                      <Check className="w-3.5 h-3.5 text-green-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Son Loglar */}
                {wh.logs.length > 0 && (
                  <div className="mt-2">
                    <button
                      onClick={() => setExpandedId(expandedId === wh.id ? null : wh.id)}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      {expandedId === wh.id ? "▾ Logları Gizle" : `▸ Son ${wh.logs.length} Log`}
                    </button>
                    {expandedId === wh.id && (
                      <div className="mt-2 space-y-1">
                        {wh.logs.map((log) => (
                          <div
                            key={log.id}
                            className="flex items-center gap-2 text-xs py-1 px-2 rounded bg-gray-50"
                          >
                            <span
                              className={cn(
                                "w-2 h-2 rounded-full flex-shrink-0",
                                log.status === "success" ? "bg-green-500" : "bg-red-500"
                              )}
                            />
                            <span className="text-gray-600 font-mono">{log.event}</span>
                            {log.statusCode && (
                              <span className="text-gray-400">{log.statusCode}</span>
                            )}
                            <span className="text-gray-400 ml-auto">
                              {new Date(log.sentAt).toLocaleString("tr-TR")}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
