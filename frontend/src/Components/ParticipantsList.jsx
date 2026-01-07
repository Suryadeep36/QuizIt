import {  Users } from "lucide-react"

export default function ParticipantsList({ participants, maxShow = 6 }) {
  const displayed = participants.slice(0, maxShow)
  const hidden = participants.length - displayed.length

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
      <h3 className="text-sm font-semibold text-slate-300 mb-6 flex items-center gap-2">
        <Users className="w-4 h-4" />
        Participants Joined ({participants.length})
      </h3>

      <div className="flex flex-wrap gap-3 justify-center">
        {displayed.map((p) => (
          <div
            key={p.id}
            className="group bg-gradient-to-br from-white/10 to-white/5 hover:from-cyan-500/20 hover:to-blue-500/20 border border-white/10 hover:border-cyan-500/50 px-6 py-3 rounded-full transition-all cursor-pointer backdrop-blur-sm"
          >
            <span className="text-sm font-semibold">{p.name}</span>
          </div>
        ))}
        {hidden > 0 && (
          <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-full">
            <span className="text-sm font-semibold text-slate-400">+{hidden} more</span>
          </div>
        )}
      </div>
    </div>
  )
}
