import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import {
  BarChart3,
  Clock,
  Target,
  Users,
  ChevronDown,
  ChevronUp,
  Zap,
  Info,
  Loader2,
  ArrowLeft,
  Trophy,
  CheckCircle2,
  ArrowRightLeft,
} from "lucide-react";
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
        console.log(res);
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
        <p className="font-bold tracking-widest uppercase text-xs">
          Generating Global Insights...
        </p>
      </div>
    );
  }

  const avgAccuracy =
    data.length > 0
      ? (
          data.reduce((acc, curr) => acc + (curr.accuracyPercentage || 0), 0) /
          data.length
        ).toFixed(2)
      : "0.00";
  const totalAttempts = data[0]?.analytics?.totalAnswered || 0;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      <header className="bg-[#4a9cb0] text-white pt-10 pb-20 px-6 rounded-b-[3rem] shadow-2xl">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => window.history.back()}
            className="mb-6 flex items-center gap-2 text-white/80 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" /> Back to Dashboard
          </button>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase italic">
                Quiz Insights
              </h1>
              <p className="text-white/70 font-bold uppercase tracking-widest text-xs mt-2 flex items-center gap-2">
                <Users className="w-4 h-4" /> Global Participant Performance
              </p>
            </div>
            <div className="flex gap-4">
              <HeaderStat label="Avg. Accuracy" value={`${avgAccuracy}%`} />
              <HeaderStat label="Participants" value={totalAttempts} />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 -mt-10">
        <div className="space-y-4">
          {data.map((item, index) => (
            <QuestionStatCard
              key={item.question.questionId}
              item={item}
              index={index}
              isExpanded={expandedId === item.question.questionId}
              onToggle={() =>
                setExpandedId(
                  expandedId === item.question.questionId
                    ? null
                    : item.question.questionId,
                )
              }
            />
          ))}
        </div>
      </main>
    </div>
  );
}

function QuestionStatCard({ item, index, isExpanded, onToggle }) {
  const { question, analytics, accuracyPercentage } = item;

  // Handles resolving one or many correct answers into their readable values
  const getResolvedAnswers = () => {
    const answers = question.correctAnswer || [];
    return answers.map((ans) => {
      const key = ans.key;
      // Resolve against options map if it exists, otherwise return the raw key
      return question.options?.[key] || key;
    });
  };

  const correctValues = getResolvedAnswers();
  const isMultiSelect =
    question.allowMultipleAnswers || correctValues.length > 1;

  return (
    <div
      className={`bg-white rounded-[2rem] border transition-all duration-300 ${isExpanded ? "shadow-xl border-[#4a9cb0]/30" : "border-slate-200 shadow-sm"}`}
    >
      <div
        className="p-5 md:p-6 cursor-pointer flex items-center justify-between gap-4"
        onClick={onToggle}
      >
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-slate-100 text-slate-500 font-black text-[9px] px-2 py-0.5 rounded uppercase tracking-wider">
              Q{index + 1} • {question.questionType.replace("_", " ")}
            </span>
            {/* Visual Indicator for Multi-Select */}
            {isMultiSelect && (
              <span className="bg-amber-100 text-amber-700 font-black text-[9px] px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                <Info size={10} /> Multiple Selection
              </span>
            )}
          </div>
          <h3 className="text-slate-800 font-bold text-lg leading-tight line-clamp-1">
            {question.content}
          </h3>
          {question.imageUrl && (
            <div className="mt-3 flex justify-center">
              <img
                src={question.imageUrl}
                alt="question"
                className="max-h-[150px] md:max-h-[200px] w-auto object-contain rounded-lg border border-slate-200 shadow-sm"
                loading="lazy"
                onError={(e) => (e.target.style.display = "none")}
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:block text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
              Global Accuracy
            </p>
            <p
              className={`text-xl font-black ${accuracyPercentage < 40 ? "text-red-500" : "text-[#4a9cb0]"}`}
            >
              {Number(accuracyPercentage).toFixed(2)}%
            </p>
          </div>
          <div
            className={`p-2 rounded-full transition-colors ${isExpanded ? "bg-slate-100 text-[#4a9cb0]" : "text-slate-300"}`}
          >
            {isExpanded ? <ChevronUp /> : <ChevronDown />}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-6 pb-8 pt-2 bg-slate-50/50 border-t border-slate-100 rounded-b-[2rem]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
            {/* CORRECT SOLUTION PANEL */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Correct Solution
                </p>
                {isMultiSelect && (
                  <p className="text-[9px] font-bold text-amber-600 uppercase tracking-widest italic">
                    * All must be selected
                  </p>
                )}
              </div>

              {question.questionType === "MATCH_FOLLOWING" ? (
                <div className="space-y-2">
                  {Object.entries(question.correctAnswer[0].matchPairs).map(
                    ([leftIdx, rightIdx]) => (
                      <div
                        key={leftIdx}
                        className="flex items-center gap-3 bg-white border border-emerald-100 p-3 rounded-xl shadow-sm"
                      >
                        <span className="flex-1 text-sm font-bold text-slate-600">
                          {question.options.left[leftIdx]}
                        </span>
                        <ArrowRightLeft className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="flex-1 text-sm font-black text-emerald-700">
                          {question.options.right[rightIdx]}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <div
                  className={`grid gap-2 ${isMultiSelect ? "grid-cols-1" : "grid-cols-1"}`}
                >
                  {correctValues.map((val, i) => (
                    <div
                      key={i}
                      className="bg-emerald-50 border-2 border-emerald-100 p-4 rounded-2xl flex items-center gap-4 transition-transform hover:scale-[1.01]"
                    >
                      <div className="bg-emerald-500 p-1.5 rounded-lg text-white shadow-lg shadow-emerald-200">
                        <CheckCircle2 size={18} />
                      </div>
                      <span className="text-base font-black text-emerald-900">
                        {val}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* METRICS PANEL */}
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <DetailBox
                  icon={<Users className="text-blue-500" />}
                  label="Total Responses"
                  value={analytics.totalAnswered}
                />
                <DetailBox
                  icon={<Target className="text-emerald-500" />}
                  label="Correct Hits"
                  value={analytics.correctAnswerCount}
                />
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between mt-auto">
                <div className="flex items-center gap-4">
                  <div className="bg-orange-100 p-3 rounded-2xl text-orange-600">
                    <Zap size={24} fill="currentColor" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                      Top Speed
                    </p>
                    <p className="text-lg font-black text-slate-800 uppercase tracking-tight">
                      {analytics.fastestUserId || "No Data"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                    Avg Response
                  </p>
                  <p className="text-xl font-black text-[#4a9cb0]">
                    {Number(analytics.averageTime).toFixed(2)}s
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ... HeaderStat and DetailBox components stay the same as your previous reference
function HeaderStat({ label, value }) {
  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl min-w-[120px]">
      <p className="text-[10px] font-black text-white/60 uppercase tracking-tighter">
        {label}
      </p>
      <p className="text-2xl font-black">{value}</p>
    </div>
  );
}

function DetailBox({ icon, label, value }) {
  return (
    <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
      <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0">
        {React.cloneElement(icon, { size: 18 })}
      </div>
      <div className="min-w-0">
        <p className="text-[8px] font-black text-slate-400 uppercase truncate tracking-widest">
          {label}
        </p>
        <p className="text-lg font-black text-slate-800 leading-none mt-1">
          {value}
        </p>
      </div>
    </div>
  );
}
