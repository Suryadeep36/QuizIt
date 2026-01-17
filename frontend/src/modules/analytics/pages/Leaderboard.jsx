import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Trophy, Users, ArrowRight, Search, 
  Medal, CheckCircle, Timer, BarChart2, ChevronLeft
} from "lucide-react";
import toast from "react-hot-toast";
import { getLeaderboardByQuizId } from "../../../services/AuthService";

export default function Leaderboard() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  
  // State for your API response type: LeaderboardResponse[]
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

 useEffect(() => {
  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await getLeaderboardByQuizId(quizId);
      console.log(data)
      setParticipants(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch leaderboard", err);
      toast.error(
        err.response?.data?.message ||
        err.message ||
        "Could not load rankings"
      );

      // Dummy fallback (DEV only)
      setParticipants([
        { participantName: "Parth", score: 850, rank: 1, totalTimeSpent: 120 },
        { participantName: "Krishna", score: 720, rank: 2, totalTimeSpent: 145 },
        { participantName: "Ravi", score: 510, rank: 3, totalTimeSpent: 90 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (quizId) fetchLeaderboard();
}, [quizId]);


  const filteredParticipants = participants.filter(p => 
    p.participantName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen bg-[#4a9cb0] flex items-center justify-center">
      <div className="text-white font-bold animate-pulse uppercase tracking-widest">Loading Rankings...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* Header Section */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 md:px-8 py-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition">
              <ChevronLeft className="w-6 h-6 text-slate-600" />
            </button>
            <div className="p-2 bg-gradient-to-br from-[#f5a65b] to-[#f59843] rounded-xl shadow-md">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-800 italic uppercase">Leaderboard</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Quiz ID: {quizId.slice(0, 8)}</p>
            </div>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Find participant..."
              className="pl-11 pr-4 py-2 bg-slate-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#4a9cb0] w-full md:w-64"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-8 mt-8">
        <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rank</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Time Spent</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Score</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredParticipants.map((p) => (
                <tr key={p.participantName} className="hover:bg-[#4a9cb0]/5 transition-colors group">
                  <td className="p-5">
                    {p.rank <= 3 ? (
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold 
                        ${p.rank === 1 ? 'bg-yellow-100 text-yellow-600' : 
                          p.rank === 2 ? 'bg-slate-100 text-slate-500' : 'bg-orange-100 text-orange-600'}`}>
                        {p.rank}
                      </div>
                    ) : (
                      <span className="ml-3 font-bold text-slate-300">#{p.rank}</span>
                    )}
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[#4a9cb0]">
                        {p.participantName.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-700">{p.participantName}</span>
                    </div>
                  </td>
                  <td className="p-5 text-center font-mono text-sm text-slate-500">
                    {Math.floor(p.totalTimeSpent / 60)}m {p.totalTimeSpent % 60}s
                  </td>
                  <td className="p-5 text-center">
                    <span className="px-3 py-1 bg-[#4a9cb0]/10 text-[#4a9cb0] rounded-lg font-black text-sm">
                      {p.score}
                    </span>
                  </td>
                  <td className="p-5 text-center">
                    <button 
                      onClick={() => navigate(`/analytics/${quizId}/${p.participantName}`)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#4a9cb0] text-[#4a9cb0] hover:bg-[#4a9cb0] hover:text-white rounded-xl font-bold text-xs transition-all active:scale-95"
                    >
                      <BarChart2 className="w-4 h-4" />
                      DETAILS
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}