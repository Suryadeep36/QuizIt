import { BarChart3 } from "lucide-react";

export default function ResponseStats({
  question,
  answeredCount,
  totalParticipants,
  progressPercent,
  showResults = false,
}) {
  if (!question || !question.options) return null;

  const responses = question.responses || {};

  const totalVotes = Object.values(responses).reduce(
    (a, b) => a + b,
    0
  );

  const isMulti =
    question.multipleCorrect ||
    (Array.isArray(question.correctAnswer) &&
      question.correctAnswer.length > 1);

  const denominator =
    question.questionType === "MCQ" && !isMulti
      ? totalVotes || 1
      : answeredCount || 1;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md">
      <h3 className="text-sm font-semibold text-teal-700 mb-2 flex items-center gap-2">
        <BarChart3 className="w-4 h-4" />
        Live Response Data
      </h3>

      <p className="text-xs text-gray-500 mb-6">
        {isMulti
          ? "Multiple answers allowed"
          : "Single answer question"}
      </p>

      {(question.questionType === "MCQ" ||
        question.questionType === "TRUE_FALSE") && (
        <div className="space-y-4">
          {question.options.map((opt, i) => {
            const voteCount = responses[i] || 0;
            const percent = (voteCount / denominator) * 100;

            const isCorrect =
              showResults &&
              (Array.isArray(question.correctAnswer)
                ? question.correctAnswer.includes(i)
                : i === question.correctAnswer);

            return (
              <div key={i}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-600 w-6">
                      {String.fromCharCode(65 + i)}
                    </span>

                    <span
                      className={`text-sm font-medium ${
                        isCorrect
                          ? "text-emerald-600"
                          : "text-gray-900"
                      }`}
                    >
                      {opt}
                    </span>

                    {isCorrect && (
                      <span className="text-xs font-semibold text-emerald-600 ml-1">
                        ✓ Correct
                      </span>
                    )}
                  </div>

                  <span className="text-sm font-bold text-gray-900">
                    {voteCount} • {Math.round(percent)}%
                  </span>
                </div>

                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isCorrect
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                        : "bg-gradient-to-r from-teal-400 to-blue-400"
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!showResults && (
        <div className="mt-6 pt-6 border-t border-gray-200 text-xs text-gray-600">
          <p>
            <span className="font-semibold text-gray-900">
              {answeredCount}
            </span>{" "}
            participants answered •{" "}
            <span className="font-semibold text-gray-900">
              {totalVotes}
            </span>{" "}
            total selections
          </p>
        </div>
      )}
    </div>
  );
}
