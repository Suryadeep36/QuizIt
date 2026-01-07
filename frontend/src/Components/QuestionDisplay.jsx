import { Pause, Play, Eye } from "lucide-react";

export default function QuestionDisplay({
  question,
  timer,
  isPaused,
  onPauseToggle,
  onReveal,
}) {
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

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-8 space-y-6 shadow-md">
      {/* Question Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-3xl font-bold leading-tight mb-2 text-gray-900">
            {question.content}
          </h2>

          <p className="text-sm text-gray-600">
            {question.questionType === "TRUE_FALSE"
              ? "True or False"
              : "Multiple Choice"}{" "}
            Question
          </p>
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

          {/* Pause/Resume button */}
          <button
            onClick={onPauseToggle}
            className="p-2 bg-teal-100 hover:bg-teal-200 text-teal-700 rounded-lg transition-all"
            title={isPaused ? "Resume" : "Pause"}
          >
            {isPaused ? (
              <Play className="w-5 h-5" />
            ) : (
              <Pause className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Options Section */}
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(question.options).map(([key, value]) => (
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

            {/* If you want, you can show responses later */}
            <p className="text-xs text-gray-500">Responses coming soon...</p>
          </div>
        ))}
      </div>

      {/* Reveal Answer Button */}
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
