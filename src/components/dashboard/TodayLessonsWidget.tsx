import { BookOpen } from "lucide-react";
import { formatDateTime, LESSON_TYPE_LABELS } from "@/lib/utils";

interface TodayLessonsWidgetProps {
  lessons: any[];
}

export function TodayLessonsWidget({ lessons }: TodayLessonsWidgetProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center gap-2 p-4 border-b border-gray-100">
        <div className="bg-green-50 p-1.5 rounded-lg">
          <BookOpen className="w-4 h-4 text-green-600" />
        </div>
        <h2 className="font-semibold text-gray-900 text-sm">Bugünün Dersleri</h2>
        <span className="ml-auto bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">
          {lessons.length}
        </span>
      </div>

      <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
        {lessons.length === 0 ? (
          <div className="p-6 text-center text-gray-400 text-sm">
            Bugün henüz ders işlenmedi
          </div>
        ) : (
          lessons.map((lesson: any) => (
            <div key={lesson.id} className="px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {lesson.customerPackage.customer.name}
                </p>
                <p className="text-xs text-gray-500">
                  {LESSON_TYPE_LABELS[lesson.customerPackage.package.lessonType] ?? lesson.customerPackage.package.lessonType}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">
                  {formatDateTime(lesson.lessonDate).split(" ")[1]}
                </p>
                <p className="text-xs text-gray-400">{lesson.loggedBy.name?.split(" ")[0]}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
