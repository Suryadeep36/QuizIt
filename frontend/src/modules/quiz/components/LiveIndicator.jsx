export default function LiveIndicator({ isLive, participantCount }) {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
        isLive
          ? "bg-orange-100 border border-orange-400"
          : "bg-gray-100 border border-gray-300"
      }`}
    >
      {isLive && (
        <>
          <div className="relative w-2 h-2">
            <div className="absolute inset-0 bg-orange-500 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 bg-orange-500 rounded-full animate-ping"></div>
          </div>
          <span className="text-xs font-bold text-orange-600">LIVE</span>
        </>
      )}
      {!isLive && (
        <span className="text-xs font-semibold text-gray-600">Waiting</span>
      )}
      <span className="text-xs text-gray-500">•</span>
      <span className="text-xs font-semibold text-gray-800">
        {participantCount} users
      </span>
    </div>
  );
}
