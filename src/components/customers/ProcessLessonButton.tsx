"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { processLesson } from "@/lib/actions/lesson.actions";
import { BookOpen, Loader2 } from "lucide-react";

interface ProcessLessonButtonProps {
  customerPackageId: string;
  remainingCredits: number;
  disabled?: boolean;
}

export function ProcessLessonButton({
  customerPackageId,
  remainingCredits,
  disabled,
}: ProcessLessonButtonProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleClick() {
    if (loading || disabled || remainingCredits <= 0) return;
    setLoading(true);

    try {
      await processLesson(customerPackageId);
      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 2000);
    } catch (err: any) {
      alert(err?.message ?? "Ders işlenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  }

  const isDisabled = disabled || remainingCredits <= 0 || loading;

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
        ${success
          ? "bg-green-100 text-green-700 border border-green-300"
          : isDisabled
          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
          : "bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow"
        }
      `}
    >
      {loading ? (
        <Loader2 size={15} className="animate-spin" />
      ) : (
        <BookOpen size={15} />
      )}
      {success ? "İşlendi!" : loading ? "İşleniyor..." : "Ders İşle"}
    </button>
  );
}
