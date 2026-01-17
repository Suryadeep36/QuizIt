import { Users } from "lucide-react";

export default function ParticipantsList({ participants, maxShow = 6 }) {
  const displayed = participants.slice(0, maxShow);
  const hidden = participants.length - displayed.length;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-md">
      <h3 className="text-sm font-semibold text-teal-700 mb-6 flex items-center gap-2">
        <Users className="w-4 h-4" />
        Participants Joined ({participants.length})
      </h3>

      <div className="flex flex-wrap gap-3 justify-center">
        {displayed.map((p) => (
          <div
            key={p.participantSessionId}
            className="group bg-gradient-to-br from-teal-50 to-blue-50 hover:from-teal-100 hover:to-blue-100 border border-teal-200 hover:border-teal-400 px-6 py-3 rounded-full transition-all cursor-pointer backdrop-blur-sm shadow-sm hover:shadow-md"
          >
            <span className="text-sm font-semibold text-teal-900">
              {p.participantName}
            </span>
          </div>
        ))}
        {hidden > 0 && (
          <div className="bg-gray-100 border border-gray-300 px-6 py-3 rounded-full">
            <span className="text-sm font-semibold text-gray-700">
              +{hidden} more
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
