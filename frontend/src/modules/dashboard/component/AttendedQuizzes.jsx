import React, { useEffect } from "react";
import { Link } from "react-router";
import toast from "react-hot-toast";
import HistoryEduIcon from "@mui/icons-material/HistoryEdu";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PersonIcon from "@mui/icons-material/Person";
import useAuth from "../../../stores/store";
import useHistoryStore from "../../../stores/historyStore";
import RefreshIcon from "@mui/icons-material/Refresh";
export default function AttendedQuizzes() {
  const user = useAuth((s) => s.user);

  const attendedQuizzes = useHistoryStore((s) => s.history);
  const loading = useHistoryStore((s) => s.loading);
  const fetchHistory = useHistoryStore((s) => s.fetchHistory);

  useEffect(() => {
    if (!user?.id) return;
    fetchHistory(user.id); // cached + TTL + persists across refresh
  }, [user?.id, fetchHistory]);
const handleRefresh = async () => {
    if (!user?.id) return;
    try {
      await fetchHistory(user.id, { force: true });
    //   toast.success("History refreshed ✅");
    } catch (err) {
      console.error(err);
      toast.error("Failed to refresh history.");
    }
  };

  if (loading && attendedQuizzes.length === 0) {
    return (
      <div className="mt-12 text-center p-8 bg-white rounded-xl shadow-sm border border-gray-100">
        <p className="text-cyan-700 font-medium animate-pulse">
          Loading participation history...
        </p>
      </div>
    );
  }

  const getScoreColor = (score, total) => {
    const safeScore = score || 0;
    const safeTotal = total || 0;
    if (safeTotal === 0) return "bg-gray-100 text-gray-700 border-gray-200";
    const percentage = (safeScore / safeTotal) * 100;
    if (percentage >= 80) return "bg-green-100 text-green-700 border-green-200";
    if (percentage >= 50) return "bg-orange-100 text-orange-700 border-orange-200";
    return "bg-red-100 text-red-700 border-red-200";
  };

  return (
    <div className="mt-12">
     <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
  {/* Left */}
  <div className="flex items-center gap-2">
    <HistoryEduIcon className="text-cyan-700" />
    <h2 className="text-xl font-semibold text-gray-800">
      Participation History
    </h2>

    {loading && attendedQuizzes.length > 0 && (
      <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">
        Refreshing…
      </span>
    )}
  </div>

  {/* Right */}
  <button
    onClick={handleRefresh}
    disabled={loading}
    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-cyan-200 text-cyan-700 font-medium hover:bg-cyan-600 hover:text-white transition shadow-sm text-sm disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
  >
    <RefreshIcon fontSize="small" />
    {loading ? "Refreshing" : "Refresh"}
  </button>
</div>


      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {attendedQuizzes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            You haven't attended any quizzes yet.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {attendedQuizzes.map((item) => (
              <div
                key={item.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between hover:bg-cyan-50/30 transition duration-200 gap-4"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 text-lg">
                    <span className="text-cyan-600 font-normal mr-2">Quiz:</span>
                    {item.quizName}
                  </h3>

                  <div className="flex flex-wrap gap-4 mt-1 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <PersonIcon fontSize="small" className="text-gray-400" />
                      <span>
                        Joined as:{" "}
                        <span className="font-medium text-gray-700">
                          {item.participantName || "Anonymous"}
                        </span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <CalendarTodayIcon fontSize="small" className="text-gray-400" />
                      <span>{item.date ? new Date(item.date).toLocaleDateString() : "N/A"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
                  {item.totalQuestions > 0 && (
                    <div
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold border ${getScoreColor(
                        item.score,
                        item.totalQuestions
                      )}`}
                    >
                      <EmojiEventsIcon fontSize="small" />
                      <span>
                        {item.score || 0}/{item.totalQuestions}
                      </span>
                    </div>
                  )}

                  {/* ⚠️ your route expects participantId, but you're passing item.id (participantId) ✅ ok */}
                  <Link to={`/quizAnalytics/${item.quizId}/participant/${item.id}`}>
                    <button className="px-4 py-2 rounded-lg border border-cyan-200 text-cyan-700 font-medium hover:bg-cyan-600 hover:text-white transition shadow-sm text-sm">
                      View Result
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
