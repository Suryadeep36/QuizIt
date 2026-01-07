import { Pause, Play, Eye } from "lucide-react"


export default function QuestionDisplay({ question, timer, isPaused, onPauseToggle, onReveal }) {
  const timerColor = timer > 10 ? "text-emerald-400" : timer > 5 ? "text-yellow-400" : "text-red-400"
  const timerBg = timer > 10 ? "bg-emerald-500/20" : timer > 5 ? "bg-yellow-500/20" : "bg-red-500/20"

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-3xl font-bold leading-tight mb-2">{question.text}</h2>
          <p className="text-sm text-slate-400">
            {question.type === "TRUE_FALSE" ? "True/False" : "Multiple Choice"} Question
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`relative w-24 h-24 rounded-full flex items-center justify-center border-4 ${timerBg} border-current`}
          >
            <span className={`text-4xl font-black ${timerColor} font-mono`}>{timer}</span>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={onPauseToggle}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
              title={isPaused ? "Resume" : "Pause"}
            >
              {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {question.options.map((opt, i) => (
          <div
            key={i}
            className="bg-white/5 border border-white/10 rounded-xl p-6 text-center hover:border-cyan-500/50 transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="text-sm font-semibold text-slate-400 group-hover:text-slate-300">
                {String.fromCharCode(65 + i)}
              </span>
              <p className="text-lg font-semibold">{opt}</p>
            </div>
            <p className="text-xs text-slate-500">{question.responses[i]} responses</p>
          </div>
        ))}
      </div>

      <button
        onClick={onReveal}
        className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-emerald-500/50 flex items-center justify-center gap-2"
      >
        <Eye className="w-5 h-5" />
        Reveal Answer Now
      </button>
    </div>
  )
}