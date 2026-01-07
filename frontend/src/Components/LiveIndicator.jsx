

export default function LiveIndicator({ isLive, participantCount }) {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
        isLive ? "bg-red-500/20 border border-red-500/50" : "bg-slate-500/20 border border-slate-500/50"
      }`}
    >
      {isLive && (
        <>
          <div className="relative w-2 h-2">
            <div className="absolute inset-0 bg-red-500 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 bg-red-500 rounded-full animate-ping"></div>
          </div>
          <span className="text-xs font-bold text-red-400">LIVE</span>
        </>
      )}
      {!isLive && <span className="text-xs font-semibold text-slate-400">Waiting</span>}
      <span className="text-xs text-slate-400">•</span>
      <span className="text-xs font-semibold">{participantCount} users</span>
    </div>
  )
}