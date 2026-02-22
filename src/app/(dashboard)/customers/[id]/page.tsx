import { getCustomerById } from "@/lib/actions/customer.actions";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Phone,
  Mail,
  Package,
  Calendar,
  BookOpen,
  Pencil,
} from "lucide-react";
import { ProcessLessonButton } from "@/components/customers/ProcessLessonButton";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
import {
  formatDate,
  formatDateTime,
  formatCurrency,
  getDaysUntilExpiry,
  LESSON_TYPE_LABELS,
} from "@/lib/utils";

interface PageProps {
  params: { id: string };
}

export default async function CustomerDetailPage({ params }: PageProps) {
  const [customer, session] = await Promise.all([
    getCustomerById(params.id),
    auth(),
  ]);

  if (!customer) notFound();

  const studioName = (session?.user as any)?.studioName ?? "Stüdyonuz";
  const activePackages = customer.customerPackages.filter((p) => p.isActive);
  const pastPackages = customer.customerPackages.filter((p) => !p.isActive);

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link
          href="/customers"
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 mt-0.5"
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
            {!customer.isActive && (
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                Pasif
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 mt-1 flex-wrap">
            {customer.phone && (
              <span className="flex items-center gap-1 text-sm text-gray-500">
                <Phone size={13} />
                {customer.phone}
              </span>
            )}
            {customer.email && (
              <span className="flex items-center gap-1 text-sm text-gray-500">
                <Mail size={13} />
                {customer.email}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/customers/${customer.id}/edit`}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors"
          >
            <Pencil size={15} />
            <span className="hidden sm:inline">Düzenle</span>
          </Link>
          <Link
            href={`/customers/${customer.id}/packages/new`}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Package size={15} />
            <span className="hidden sm:inline">Paket Ata</span>
          </Link>
        </div>
      </div>

      {/* Notes */}
      {customer.notes && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
          <span className="font-medium">Not: </span>
          {customer.notes}
        </div>
      )}

      {/* Active Packages */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Package size={16} className="text-green-600" />
          Aktif Paketler
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
            {activePackages.length}
          </span>
        </h2>

        {activePackages.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-6 text-center">
            <p className="text-gray-400 text-sm">Aktif paket yok</p>
            <Link
              href={`/customers/${customer.id}/packages/new`}
              className="inline-flex items-center gap-1.5 mt-2 text-sm text-green-600 font-medium hover:underline"
            >
              <Package size={14} />
              Paket Ata
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {activePackages.map((pkg) => {
              const daysLeft = getDaysUntilExpiry(pkg.expiresAt);
              const isLowCredit = pkg.remainingCredits <= 2;
              const creditPercent = Math.round(
                (pkg.remainingCredits / pkg.totalCredits) * 100
              );

              return (
                <div
                  key={pkg.id}
                  className="bg-white rounded-xl border border-gray-200 p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {pkg.package.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {LESSON_TYPE_LABELS[pkg.package.lessonType]} •{" "}
                        {formatDate(pkg.startDate)} – {formatDate(pkg.expiresAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!pkg.isPaid && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-lg font-medium">
                          Ödenmedi
                        </span>
                      )}
                      {isLowCredit && customer.phone && (
                        <WhatsAppButton
                          phone={customer.phone}
                          customerName={customer.name}
                          remainingCredits={pkg.remainingCredits}
                          studioName={studioName}
                          variant="icon"
                        />
                      )}
                      <ProcessLessonButton
                        customerPackageId={pkg.id}
                        remainingCredits={pkg.remainingCredits}
                      />
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>
                        <span
                          className={`font-semibold ${
                            isLowCredit ? "text-orange-600" : "text-green-600"
                          }`}
                        >
                          {pkg.remainingCredits}
                        </span>{" "}
                        / {pkg.totalCredits} ders kaldı
                      </span>
                      <span
                        className={
                          daysLeft <= 7 ? "text-orange-600 font-medium" : ""
                        }
                      >
                        {daysLeft > 0 ? `${daysLeft} gün` : "Süresi doldu"}
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isLowCredit ? "bg-orange-400" : "bg-green-500"
                        }`}
                        style={{ width: `${creditPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Lesson History */}
                  {pkg.lessons.length > 0 && (
                    <div className="pt-1 border-t border-gray-100">
                      <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                        <BookOpen size={11} />
                        Son Dersler
                      </p>
                      <div className="space-y-1">
                        {pkg.lessons.slice(0, 5).map((lesson: any) => (
                          <div
                            key={lesson.id}
                            className="flex items-center justify-between text-xs text-gray-600"
                          >
                            <span>{formatDateTime(lesson.lessonDate)}</span>
                            <span className="text-gray-400">
                              {lesson.loggedBy.name?.split(" ")[0]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Past Packages */}
      {pastPackages.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Calendar size={16} className="text-gray-400" />
            Geçmiş Paketler
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {pastPackages.map((pkg) => (
              <div key={pkg.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {pkg.package.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDate(pkg.startDate)} – {formatDate(pkg.expiresAt)} •{" "}
                    {pkg.totalCredits - pkg.remainingCredits}/{pkg.totalCredits} ders
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      pkg.isPaid
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {pkg.isPaid ? "Ödendi" : "Ödenmedi"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
