import { BarChart3 } from "lucide-react"

export default function ResponseStats({
  question,
  answeredCount,
  totalParticipants,
  progressPercent,
  showResults = false,
}) {
  const totalResponses = Object.values(question.responses).reduce((a, b) => a + b, 0)
  const maxResponses = Math.max(...Object.values(question.responses), 1)

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <h3 className="text-sm font-semibold text-slate-300 mb-6 flex items-center gap-2">
        <BarChart3 className="w-4 h-4" />
        Live Response Data
      </h3>

      <div className="space-y-4">
        {question.options.map((opt, i) => {
          const responses = question.responses[i] || 0
          const percent = totalResponses > 0 ? (responses / totalResponses) * 100 : 0
          const isCorrect = showResults && i === question.correctAnswer

          return (
            <div key={i}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 w-6">{String.fromCharCode(65 + i)}</span>
                  <span className={`text-sm font-medium ${isCorrect ? "text-emerald-300" : "text-slate-300"}`}>
                    {opt}
                  </span>
                  {isCorrect && <span className="text-xs font-semibold text-emerald-400 ml-1">✓ Correct</span>}
                </div>
                <span className="text-sm font-bold text-slate-300">{responses}</span>
              </div>

              <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isCorrect
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                      : "bg-gradient-to-r from-cyan-500 to-blue-500"
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {!showResults && (
        <div className="mt-6 pt-6 border-t border-slate-700 text-xs text-slate-400">
          <p className="text-xs">
            <span className="font-semibold text-slate-300">{totalResponses}</span> total responses received
          </p>
        </div>
      )}
    </div>
  )
}