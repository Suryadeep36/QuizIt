import { Check } from "lucide-react";

export default function QuestionSidebar({ questions, currentQuestion, stage }) {
  return (
    <div className="w-64 space-y-3">
      <h2 className="text-sm font-semibold text-teal-700 px-2">Questions</h2>

      <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
        {questions.map((q, index) => {
          const isActive = currentQuestion?.questionId === q.questionId;

          return (
            <div
              key={q.questionId}
              className={`group relative p-3 rounded-xl transition-all cursor-pointer backdrop-blur-sm ${
                isActive
                  ? "bg-gradient-to-r from-teal-100 to-blue-100 border border-teal-400 shadow-lg shadow-teal-200"
                  : "bg-white border border-gray-200 hover:border-teal-300"
              }`}
            >
              <div className="flex items-start gap-2">
                <span
                  className={`font-bold mt-0.5 min-w-5 ${
                    isActive ? "text-teal-600" : "text-gray-500"
                  }`}
                >
                  {index + 1}
                </span>

                <p
                  className={`text-xs leading-snug flex-1 ${
                    isActive ? "text-teal-900" : "text-gray-700"
                  }`}
                >
                  {q.content}
                </p>
              </div>

              {stage === "leaderboard" && (
                <div className="absolute top-2 right-2 text-emerald-600">
                  <Check className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
