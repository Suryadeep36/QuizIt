import { useEffect, useState } from "react";
import { 
  Trophy, Users, Clock, ChevronLeft, Search, 
  Medal, BarChart2, ArrowRight, TrendingUp 
} from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { getLeaderboardByQuizId } from "./services/AuthService";

export default function Analytics() {
  const quizId = "729d508f-6a8f-4301-99b0-31be74959bef";
  const navigate = useNavigate();
  
  const [participants, setParticipants] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const data = await getLeaderboardByQuizId(quizId);
        setParticipants(Array.isArray(data) ? data : []);
      } catch (err) {
        setParticipants([
          { participantName: "Parth", score: 850, rank: 1, totalTimeSpent: 120 },
          { participantName: "Krishna", score: 720, rank: 2, totalTimeSpent: 145 },
          { participantName: "Ravi", score: 510, rank: 3, totalTimeSpent: 90 },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [quizId]);

  const filteredParticipants = participants.filter(row => 
    row.participantName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const avgTime = participants.length 
    ? (participants.reduce((acc, curr) => acc + (curr.totalTimeSpent || 0), 0) / participants.length).toFixed(1) 
    : 0;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4a9cb0] via-[#5fb4c7] to-[#4a9cb0] font-sans pb-10">
      
      {/* COMPACT STICKY HEADER */}
      <header className="bg-white/10 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50 px-4 py-3 md:py-4 shadow-xl">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 md:gap-4">
            <button onClick={() => window.history.back()} className="p-2 bg-white/10 rounded-xl text-white active:scale-90 transition-transform">
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <h1 className="text-lg md:text-2xl font-black text-white italic tracking-tighter">LEADERBOARD</h1>
          </div>

          <div className="relative flex-1 max-w-[180px] md:max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
            <input 
              type="text" 
              placeholder="Search..."
              className="w-full pl-9 pr-3 py-2 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#f5a65b]/50"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-6">
        
        {/* SUMMARY STATS - Horizontal Scroll on Mobile */}
        <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar sm:grid sm:grid-cols-3 sm:overflow-visible">
          <MiniStat icon={<Users className="w-4 h-4" />} label="Participants" value={participants.length} color="bg-blue-500" />
          <MiniStat icon={<Clock className="w-4 h-4" />} label="Avg Time" value={`${avgTime}s`} color="bg-emerald-500" />
          <MiniStat icon={<TrendingUp className="w-4 h-4" />} label="Top Score" value={participants[0]?.score || 0} color="bg-[#f5a65b]" />
        </div>

        {/* CONTENT AREA: Cards on Mobile | Table on Desktop */}
        <div className="mt-4 space-y-3 md:hidden">
          {filteredParticipants.map((row) => (
            <ParticipantCard key={row.participantName} row={row} onDetail={() => navigate(`/analytics/${quizId}/${row.participantName}`)} />
          ))}
        </div>

        <div className="hidden md:block mt-6 bg-white/95 backdrop-blur-sm rounded-[2rem] shadow-2xl overflow-hidden border border-white">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Rank</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Participant</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Time</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Score</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Analysis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredParticipants.map((row) => (
                <tr key={row.participantName} className="hover:bg-[#4a9cb0]/5 transition-all group">
                  <td className="p-6">
                    <RankIndicator rank={row.rank} />
                  </td>
                  <td className="p-6">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#4a9cb0] to-[#5fb4c7] flex items-center justify-center text-white font-black text-sm border-2 border-white shadow-sm">
                          {row.participantName?.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-700">{row.participantName}</span>
                     </div>
                  </td>
                  <td className="p-6 text-center font-mono font-bold text-slate-500">
                    {Math.floor(row.totalTimeSpent / 60)}m {row.totalTimeSpent % 60}s
                  </td>
                  <td className="p-6 text-center">
                    <span className="px-4 py-2 bg-[#4a9cb0]/10 text-[#4a9cb0] rounded-xl font-black">{row.score}</span>
                  </td>
                  <td className="p-6 text-center">
                    <button 
                      onClick={() => navigate(`/analytics/${quizId}/${row.participantName}`)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-[#4a9cb0] text-[#4a9cb0] hover:bg-[#4a9cb0] hover:text-white rounded-xl font-black text-xs transition-all"
                    >
                      DETAILS <ArrowRight className="w-3 h-3" />
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

/* --- MOBILE SPECIFIC CARD --- */
function ParticipantCard({ row, onDetail }) {
  return (
    <div className="bg-white/95 rounded-2xl p-4 shadow-lg border border-white/50 flex items-center justify-between animate-in fade-in slide-in-from-right-4">
      <div className="flex items-center gap-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm shadow-sm
          ${row.rank === 1 ? 'bg-yellow-400 text-white' : row.rank === 2 ? 'bg-slate-300 text-slate-700' : row.rank === 3 ? 'bg-orange-400 text-white' : 'bg-slate-100 text-slate-400'}`}>
          {row.rank <= 3 ? <Medal className="w-5 h-5" /> : row.rank}
        </div>
        <div>
          <p className="font-black text-slate-800 leading-none mb-1">{row.participantName}</p>
          <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase">
             <span className="text-[#4a9cb0]">{row.score} PTS</span>
             <span>•</span>
             <span>{Math.floor(row.totalTimeSpent / 60)}m {row.totalTimeSpent % 60}s</span>
          </div>
        </div>
      </div>
      <button onClick={onDetail} className="p-3 bg-[#4a9cb0]/10 rounded-xl text-[#4a9cb0] active:scale-90 transition-all">
        <BarChart2 className="w-6 h-6" />
      </button>
    </div>
  );
}

function MiniStat({ icon, label, value, color }) {
  return (
    <div className="bg-white/90 backdrop-blur-md p-3 px-4 rounded-2xl min-w-[140px] sm:w-full border border-white shadow-lg flex items-center gap-3 flex-shrink-0">
      <div className={`p-2 rounded-lg text-white shadow-sm ${color}`}>{icon}</div>
      <div>
        <span className="text-[8px] font-black text-slate-400 uppercase block tracking-widest">{label}</span>
        <p className="text-sm font-black text-slate-800 leading-none">{value}</p>
      </div>
    </div>
  );
}

function RankIndicator({ rank }) {
  if (rank <= 3) return (
    <div className="flex justify-center">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md transform rotate-3
        ${rank === 1 ? 'bg-yellow-100 text-yellow-600' : rank === 2 ? 'bg-slate-100 text-slate-500' : 'bg-orange-100 text-orange-600'}`}>
        <Medal className="w-5 h-5" />
      </div>
    </div>
  );
  return <div className="text-center font-black text-slate-300">#{rank}</div>;
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-[#4a9cb0] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4" />
      <p className="font-black text-white uppercase tracking-widest text-xs animate-pulse">Calculating Rankings...</p>
    </div>
  );
}