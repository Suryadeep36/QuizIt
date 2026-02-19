import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { 
  BarChart3, Clock, Target, Users, ChevronDown, ChevronUp, 
  Zap, Info, Loader2, ArrowLeft, Trophy 
} from "lucide-react";
// Adjust path
import toast from "react-hot-toast";
import { getDetailedQAQ } from "../../../services/AuthService";

export default function GlobalQuizAnalytics() {
  const { quizId } = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await getDetailedQAQ(quizId);
        setData(res);
      } catch (err) {
        toast.error("Failed to load global analytics");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [quizId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#4a9cb0] flex flex-col items-center justify-center text-white">
        <Loader2 className="w-12 h-12 animate-spin mb-4 text-[#f5a65b]" />
        <p className="font-bold tracking-widest uppercase text-xs">Generating Global Insights...</p>
      </div>
    );
  }

  // Derived Stats for the Header
  const avgAccuracy = Math.round(data.reduce((acc, curr) => acc + (curr.accuracyPercentage || 0), 0) / data.length);
  const totalAttempts = data.reduce((acc, curr) => acc + (curr.analytics?.totalAnswered || 0), 0);

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      {/* HEADER */}
      <header className="bg-[#4a9cb0] text-white pt-10 pb-20 px-6 rounded-b-[3rem] shadow-2xl">
        <div className="max-w-5xl mx-auto">
          <button onClick={() => window.history.back()} className="mb-6 flex items-center gap-2 text-white/80 hover:text-white transition">
            <ArrowLeft className="w-5 h-5" /> Back to Dashboard
          </button>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">QUIZ INSIGHTS</h1>
              <p className="text-white/70 font-bold uppercase tracking-widest text-xs mt-2 flex items-center gap-2">
                <Users className="w-4 h-4" /> Global Participant Data
              </p>
            </div>
            <div className="flex gap-4">
              <HeaderStat label="Avg. Accuracy" value={`${avgAccuracy}%`} />
              <HeaderStat label="Responses" value={totalAttempts} />
            </div>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="max-w-5xl mx-auto px-6 -mt-10">
        <div className="space-y-4">
          {data.map((item, index) => (
            <QuestionStatCard 
              key={item.analytics.qaqId} 
              item={item} 
              index={index}
              isExpanded={expandedId === item.analytics.qaqId}
              onToggle={() => setExpandedId(expandedId === item.analytics.qaqId ? null : item.analytics.qaqId)}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

function QuestionStatCard({ item, index, isExpanded, onToggle }) {
  const { question, analytics, accuracyPercentage } = item;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
      {/* Top Main Row */}
      <div 
        className="p-5 md:p-6 cursor-pointer flex items-center justify-between gap-4"
        onClick={onToggle}
      >
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-slate-100 text-slate-500 font-black text-[10px] px-2 py-1 rounded-md uppercase">
              Q{index + 1} • {question.questionType}
            </span>
            {accuracyPercentage > 80 && (
              <span className="text-emerald-500 font-bold text-[10px] uppercase flex items-center gap-1">
                <Trophy className="w-3 h-3" /> High Success
              </span>
            )}
          </div>
          <h3 className="text-slate-800 font-bold text-lg leading-tight line-clamp-1">
            {question.content}
          </h3>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:block text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase">Accuracy</p>
            <p className={`text-xl font-black ${accuracyPercentage < 40 ? 'text-red-500' : 'text-[#4a9cb0]'}`}>
              {Math.round(accuracyPercentage)}%
            </p>
          </div>
          <div className={`p-2 rounded-full transition-colors ${isExpanded ? 'bg-slate-100' : ''}`}>
            {isExpanded ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-6 pb-6 pt-2 bg-slate-50/50 border-t border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <DetailBox 
              icon={<Users className="text-blue-500" />} 
              label="Total Answered" 
              value={analytics.totalAnswered} 
            />
            <DetailBox 
              icon={<Target className="text-emerald-500" />} 
              label="Correct Hits" 
              value={analytics.correctAnswerCount} 
            />
            <DetailBox 
              icon={<Clock className="text-orange-500" />} 
              label="Avg. Time" 
              value={`${(analytics.averageTime / 1000).toFixed(2)}s`} 
            />
          </div>

          <div className="mt-6 bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 p-2 rounded-xl text-yellow-600">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">Fastest Response</p>
                <p className="text-sm font-bold text-slate-700 truncate max-w-[200px]">
                  User ID: {analytics.fastestUserId || "N/A"}
                </p>
              </div>
            </div>
            <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase">Correct Answer</p>
                <p className="text-sm font-black text-emerald-600">
                    {question.correctAnswer?.[0]?.key || "Check Config"}
                </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function HeaderStat({ label, value }) {
  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl min-w-[120px]">
      <p className="text-[10px] font-black text-white/60 uppercase tracking-tighter">{label}</p>
      <p className="text-2xl font-black">{value}</p>
    </div>
  );
}

function DetailBox({ icon, label, value }) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
        {React.cloneElement(icon, { size: 20 })}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase">{label}</p>
        <p className="text-lg font-black text-slate-800">{value}</p>
      </div>
    </div>
  );
}