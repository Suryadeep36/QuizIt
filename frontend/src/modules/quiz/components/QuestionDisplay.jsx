import { Pause, Play, Eye } from "lucide-react";

export default function QuestionDisplay({
  question,
  timer,
  isPaused,
  onPauseToggle,
  onReveal,
}) {
  // If question not loaded yet (before START_QUIZ)
  if (!question) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-md text-center">
        <p className="text-gray-600 text-lg">
          Waiting for the first question...
        </p>
      </div>
    );
  }
  const timerColor =
    timer > 10
      ? "text-emerald-400"
      : timer > 5
        ? "text-yellow-400"
        : "text-red-400";

  const timerBg =
    timer > 10
      ? "bg-emerald-500/20"
      : timer > 5
        ? "bg-yellow-500/20"
        : "bg-red-500/20";

  const renderOptionsUI = (type, options, correctAnswer) => {
    switch (type) {
      case "MCQ":
        return (
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(options).map(([key, value]) => (
              <div
                key={key}
                className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-300 rounded-xl p-6 text-center hover:border-teal-400 hover:shadow-md transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-center gap-3 mb-2">
                  <span className="text-sm font-semibold text-gray-600 group-hover:text-teal-700">
                    {key}
                  </span>
                  <p className="text-lg font-semibold text-gray-900">{value}</p>
                </div>
              </div>
            ))}
          </div>
        );

      case "TRUE_FALSE":
        return (
          <div className="grid grid-cols-2 gap-4">
            {["TRUE", "FALSE"].map((value) => (
              <div
                key={value}
                className={`bg-gradient-to-br from-gray-50 to-gray-100 border rounded-xl p-6 text-center transition-all group cursor-pointer
                ${
                  correctAnswer?.[0]?.key === value
                    ? "border-teal-500 shadow-lg"
                    : "border-gray-300"
                }
              `}
              >
                <p className="text-lg font-semibold text-gray-900 group-hover:text-teal-700">
                  {value}
                </p>
              </div>
            ))}
          </div>
        );

      case "SHORT_ANSWER":
      case "NUMERICAL":
        return (
          <div className="flex justify-center">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-300 rounded-xl p-6 w-full max-w-sm text-center">
              <p className="text-sm text-gray-600">Correct Answer</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {correctAnswer?.[0]?.key}
              </p>
            </div>
          </div>
        );

      case "MATCH_FOLLOWING": {
        const matchPairs = correctAnswer?.[0]?.matchPairs || {};

        return (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-gray-600 text-center">
              Correct Matches
            </p>

            <div className="flex flex-wrap gap-3 justify-center">
              {Object.entries(matchPairs)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([rightIdx, leftIdx], index) => (
                  <div
                    key={index}
                    className="
                    px-5 py-3
                    text-lg font-bold
                    text-[#4a9cb0]
                    bg-[#4a9cb0]/10
                    border border-[#4a9cb0]/30
                    rounded-xl
                    shadow-sm
                  "
                  >
                    <span className="text-[#4a9cb0]">
                      {options?.left?.[parseInt(leftIdx)] ??
                        `Left ${parseInt(leftIdx) + 1}`}
                    </span>

                    <span className="mx-2 text-gray-400">→</span>

                    <span className="text-[#f5a65b]">
                      {options?.right?.[parseInt(rightIdx)] ??
                        `Right ${parseInt(rightIdx) + 1}`}
                    </span>
                  </div>
                ))}

              {Object.keys(matchPairs).length === 0 && (
                <p className="text-gray-400 italic">
                  No correct matches configured.
                </p>
              )}
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-8 space-y-6 shadow-md">
      {/* Question Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-3xl font-bold leading-tight mb-2 text-gray-900">
            {question.content}
          </h2>

          <p className="text-sm text-gray-600">{question.type} Question</p>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-3">
          <div
            className={`relative w-24 h-24 rounded-full flex items-center justify-center border-4 ${timerBg} border-current`}
          >
            <span className={`text-4xl font-black ${timerColor} font-mono`}>
              {timer}
            </span>
          </div>
        </div>
      </div>

      {/* Options */}
      {renderOptionsUI(question.type, question.options, question.correctAnswer)}

      {/* Reveal Button */}
      <button
        onClick={onReveal}
        className="w-full py-3 bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-orange-300/50 flex items-center justify-center gap-2"
      >
        <Eye className="w-5 h-5" />
        Reveal Answer Now
      </button>
    </div>
  );
}
