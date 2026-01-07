import { Check } from "lucide-react"

export default function QuestionSidebar({ questions, currentQuestion, stage }) {
  return (
    <div className="w-64 space-y-3">
      <h2 className="text-sm font-semibold text-slate-300 px-2">Questions</h2>
      <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
        {questions.map((q, index) => (
          <div
            key={q.id}
            className={`group relative p-3 rounded-xl transition-all cursor-pointer backdrop-blur-sm ${
              index === currentQuestion
                ? "bg-gradient-to-r from-cyan-500/30 to-blue-500/30 border border-cyan-500/50 shadow-lg shadow-cyan-500/20"
                : "bg-white/5 border border-white/10 hover:border-slate-600"
            }`}
          >
            <div className="flex items-start gap-2">
              <span
                className={`font-bold mt-0.5 min-w-5 ${index === currentQuestion ? "text-cyan-300" : "text-slate-500"}`}
              >
                {index + 1}
              </span>
              <p
                className={`text-xs leading-snug flex-1 ${index === currentQuestion ? "text-white" : "text-slate-400"}`}
              >
                {q.text}
              </p>
            </div>
            {stage === "leaderboard" && (
              <div className="absolute top-2 right-2 text-emerald-400">
                <Check className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}