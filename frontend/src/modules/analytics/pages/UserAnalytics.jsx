import { useEffect, useState } from "react";
import { useParams } from "react-router";
import {
  Zap, Clock, Target, AlertTriangle,
  ChevronLeft, CheckCircle2, XCircle,
  TrendingUp, BarChart3, Brain, Activity, Loader2, Info
} from "lucide-react";
import toast from "react-hot-toast";
import { useParticipant } from "../../../stores/store";
import { getParticipantAnalytics, getQuestionsByQuizId } from "../../../services/AuthService";


export default function UserAnalytics() {
  const [analytics, setAnalytics] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const { quizId } = useParams();
  let {participantId} = useParams();
   participantId =  participantId? participantId:useParticipant((state) => state.participant?.id);
  console.log(participantId);
   useEffect(() => {
    if (!quizId || !participantId) return;

    const fetchAnalyticsAndQuestions = async () => {
      try {
        setLoading(true);
        const [analyticsData, questionData] = await Promise.all([
          getParticipantAnalytics(participantId),
          getQuestionsByQuizId(quizId),
        ]);
        setAnalytics(analyticsData);
        setQuestions(questionData);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsAndQuestions();
  }, [quizId, participantId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#4a9cb0] flex flex-col items-center justify-center text-white p-6">
        <Loader2 className="w-12 h-12 animate-spin mb-4 text-[#f5a65b]" />
        <p className="font-bold tracking-widest uppercase text-xs text-center">Analysing Results...</p>
      </div>
    );
  }

  const analyticsMap = analytics.reduce((acc, a) => {
    acc[a.questionId] = a;
    return acc;
  }, {});

  const totalCorrect = analytics.filter((a) => a.isCorrect).length;
  const totalQuestions = questions.length;
  const scorePercentage = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const totalTimeSpent = analytics.reduce((sum, a) => sum + (a.timeSpent || 0), 0);
  const totalTabSwitches = analytics.reduce((sum, a) => sum + (a.tabSwitchCount || 0), 0);
  const fastAnswers = analytics.filter(a => a.timeSpent < 5 && a.isCorrect).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4a9cb0] via-[#5fb4c7] to-[#4a9cb0] pb-10 md:pb-20">

      {/* RESPONSIVE HEADER */}
      <header className="bg-white/10 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50 shadow-xl">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-3 md:py-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button onClick={() => window.history.back()} className="p-2 hover:bg-white/20 rounded-full transition text-white active:scale-90">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div className="h-8 w-[1px] bg-white/20 hidden xs:block" />
              <div>
                <h1 className="text-white font-black text-lg md:text-xl leading-none">QUIZ REPORT</h1>
                <p className="text-white/60 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] mt-1 truncate max-w-[150px] md:max-w-none">
                  Session Analytics
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 bg-black/10 sm:bg-black/20 p-1 md:p-1.5 rounded-2xl border border-white/10">
              <div className="flex items-center gap-2 md:gap-3 px-2 md:px-3">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#f5a65b] flex items-center justify-center text-white font-bold text-xs">
                  {useParticipant.getState().participant?.name?.charAt(0) || "U"}
                </div>
                <div className="text-left">
                  <p className="text-white text-xs font-bold leading-none truncate max-w-[80px]">
                    {useParticipant.getState().participant?.name || "User"}
                  </p>
                  <p className="text-white/40 text-[8px] md:text-[9px] uppercase font-bold">Participant</p>
                </div>
              </div>
              <div className="bg-white px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-[#4a9cb0] font-black text-xs md:text-sm shadow-lg">
                {scorePercentage}% SCORE
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-8 mt-6 md:mt-10">

        {/* INSIGHTS GRID: 2 columns on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-10">
          <StatCard icon={<Target className="text-green-400 w-4 h-4 md:w-5 md:h-5" />} label="Accuracy" value={`${totalCorrect}/${totalQuestions}`} />
          <StatCard icon={<Clock className="text-blue-300 w-4 h-4 md:w-5 md:h-5" />} label="Duration" value={`${Math.floor(totalTimeSpent / 60)}m ${totalTimeSpent % 60}s`} />
          <StatCard icon={<TrendingUp className="text-[#f5a65b] w-4 h-4 md:w-5 md:h-5" />} label="Quick Wins" value={fastAnswers} />
          <StatCard icon={<Activity className="text-red-400 w-4 h-4 md:w-5 md:h-5" />} label="Integrity" value={totalTabSwitches === 0 ? "High" : "Alert"} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-12">
          {/* TIME CHART */}
          <div className="lg:col-span-2 bg-white/90 backdrop-blur-md rounded-[1.5rem] md:rounded-[2.5rem] p-5 md:p-8 border border-white/50 shadow-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-8 gap-4">
              <h3 className="text-slate-800 font-black text-sm md:text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-[#4a9cb0]" />
                TIME PER QUESTION
              </h3>

              <div className="flex gap-3 text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-400">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#4a9cb0]" /> Correct
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#f5a65b]" /> Incorrect
                </div>
              </div>
            </div>

            {/* Main Container: Fixed Height is Mandatory for Percentages to Work */}
            <div className="flex items-end gap-1.5 md:gap-3 h-48 md:h-64 px-1 relative border-b border-slate-100">
              {questions.map((q, i) => {
                // 1. DATA CHECK: Try multiple possible ID formats from your store
                const questionId = q.questionId || q.id || q._id;
                const qa = analyticsMap[questionId];

                // 2. LOGGING: Open your browser console (F12) to see if these numbers exist
                console.log(`Q${i + 1} ID: ${questionId}`, "Analytics:", qa);

                const time = qa?.timeSpent || 0;
                const isCorrect = qa?.isCorrect || false;

                // 3. HEIGHT LOGIC: Using 40s as max scale to handle longer answers
                const maxScale = 40;
                const calculatedHeight = (time / maxScale) * 100;
                const finalHeight = Math.min(Math.max(calculatedHeight, 4), 100);

                return (
                  <div key={questionId || i} className="flex-1 flex flex-col items-center group relative h-full justify-end">

                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-30 w-32 pointer-events-none">
                      <div className="bg-slate-800 text-white text-[10px] p-2 rounded-lg shadow-xl text-center shadow-black/20">
                        <p className="font-bold border-b border-white/10 mb-1 pb-1 uppercase">Question {i + 1}</p>
                        <p className="font-black text-sm">{time}s</p>
                        <p className={isCorrect ? "text-emerald-400" : "text-orange-400 font-bold"}>
                          {isCorrect ? "Correct" : "Incorrect"}
                        </p>
                      </div>
                      <div className="w-2 h-2 bg-slate-800 rotate-45 -mt-1" />
                    </div>

                    {/* THE BAR: Ensure background colors are solid for testing */}
                    <div
                      className={`w-full rounded-t-lg transition-all duration-700 ease-out origin-bottom
              ${isCorrect
                          ? "bg-[#4a9cb0] shadow-[0_-4px_10px_rgba(74,156,176,0.2)]"
                          : "bg-[#f5a65b] shadow-[0_-4px_10px_rgba(245,166,91,0.2)]"
                        } 
              group-hover:brightness-110 group-hover:scale-x-110 z-10
            `}
                      style={{
                        height: `${finalHeight}%`,
                        transitionDelay: `${i * 50}ms`
                      }}
                    />

                    {/* Question Label */}
                    <span className="text-[9px] md:text-[11px] font-black text-slate-400 mt-2 uppercase tracking-tighter">
                      Q{i + 1}
                    </span>
                  </div>
                );
              })}
            </div>

            <p className="mt-6 text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center opacity-60">
              * Based on a {40} second response scale
            </p>
          </div>
          {/* DIAGNOSTIC */}
          <div className="bg-gradient-to-br from-[#f5a65b] to-[#f59843] rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-8 text-white shadow-2xl shadow-[#f5a65b]/30">
            <Brain className="w-8 h-8 md:w-10 md:h-10 mb-4 opacity-90" />
            <h3 className="text-lg md:text-xl font-black mb-2 leading-tight uppercase">Performance <br />Diagnostic</h3>
            <p className="text-white/90 text-xs md:text-sm mb-6 leading-relaxed">
              {scorePercentage > 70
                ? "Excellent concept retention! Focus on reducing response time to master competitive levels."
                : "Strong start, but core fundamentals need review. You are taking longer on MCQ sections."}
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
              <div className="bg-white/20 p-3 rounded-xl flex justify-between items-center text-[10px] md:text-xs font-bold">
                <span className="opacity-70">Tab Switches</span>
                <span className={totalTabSwitches > 0 ? "text-red-900 bg-white/40 px-2 py-0.5 rounded" : ""}>{totalTabSwitches}</span>
              </div>
              <div className="bg-white/20 p-3 rounded-xl flex justify-between items-center text-[10px] md:text-xs font-bold">
                <span className="opacity-70">Avg. Response</span>
                <span>{totalQuestions > 0 ? Math.round(totalTimeSpent / totalQuestions) : 0}s</span>
              </div>
            </div>
          </div>
        </div>

        {/* STEP BY STEP REVIEW */}
        <div className="space-y-4 md:space-y-6">
          <div className="flex items-center gap-3 mb-2 px-1">
            <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-white" />
            <h2 className="text-white font-black text-lg md:text-xl tracking-tight uppercase italic">Step-by-Step Review</h2>
          </div>

          {questions.map((q, index) => {
            const qa = analyticsMap[q.questionId];
            return (
              <div
                key={q.questionId || index}
                className="mx-auto max-w-4xl bg-white/95 backdrop-blur-sm rounded-[1.2rem] md:rounded-[2rem] p-4 md:p-6 shadow-lg border border-white relative overflow-hidden mb-4 md:mb-6"
              >
                {/* Result Pill */}
                <div className={`absolute top-0 right-0 px-4 md:px-6 py-1.5 md:py-2 rounded-bl-2xl font-black text-[8px] md:text-[10px] uppercase tracking-[0.2em] text-white shadow-md ${qa?.isCorrect ? "bg-emerald-500" : "bg-red-500"}`}>
                  {qa?.isCorrect ? "PASSED" : "FAILED"}
                </div>

                <div className="mb-6 md:mb-8 pr-12 md:pr-0">
                  <span className="text-[#4a9cb0] font-black text-[10px] md:text-xs tracking-[0.3em] uppercase">Question {index + 1}</span>
                  <h2 className="text-base md:text-2xl font-black text-slate-800 mt-2 leading-snug">{q.content}</h2>
                </div>

                {/* MCQ GRID */}
                {q.questionType === "MCQ" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    {Object.entries(q.options || {}).map(([key, value]) => {
                      const isSelected = qa?.selectedAnswer?.key === key;
                      const isCorrect = q.correctAnswer?.key === key;

                      let style = "bg-slate-50 border-slate-100 text-slate-500";
                      if (isCorrect) style = "bg-emerald-50 border-emerald-400 text-emerald-800 ring-2 ring-emerald-500/10";
                      if (isSelected && !isCorrect) style = "bg-red-50 border-red-400 text-red-800 ring-2 ring-red-500/10";

                      return (
                        <div key={key} className={`p-4 md:p-5 rounded-2xl md:rounded-3xl border-2 flex justify-between items-center transition-all ${style}`}>
                          <span className="text-sm md:text-base font-bold"><b className="mr-2 md:mr-3 opacity-40">{key}</b> {value}</span>
                          {isCorrect && <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" />}
                          {isSelected && !isCorrect && <XCircle className="w-4 h-4 md:w-5 md:h-5" />}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ================= TRUE / FALSE ================= */}
                {q.questionType === "TRUE_FALSE" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                    {/* User's Selection */}
                    <div className={`p-4 rounded-2xl border-2 flex flex-col justify-center ${qa?.isCorrect
                      ? "bg-emerald-50 border-emerald-400 text-emerald-800"
                      : "bg-red-50 border-red-400 text-red-800"
                      }`}>
                      <span className="text-[10px] font-black uppercase opacity-60 tracking-widest mb-1">
                        Your Selection
                      </span>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold uppercase tracking-tight">
                          {qa?.selectedAnswer?.value ?? "No Selection"}
                        </span>
                        {qa?.isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                    </div>

                    {/* Correct Answer */}
                    <div className="p-4 rounded-2xl border-2 bg-emerald-50 border-emerald-400 text-emerald-800 flex flex-col justify-center ring-2 ring-emerald-500/10">
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">
                        Correct Answer
                      </span>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold">
                          {q.correctAnswer?.value}
                        </span>
                        <div className="p-1 bg-emerald-100 rounded-lg">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ================= NUMERICAL ================= */}
                {q.questionType === "NUMERICAL" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                    {/* User's Attempt */}
                    <div className={`p-4 rounded-2xl border-2 flex flex-col justify-center ${qa?.isCorrect
                      ? "bg-emerald-50 border-emerald-400 text-emerald-800"
                      : "bg-red-50 border-red-400 text-red-800"
                      }`}>
                      <span className="text-[10px] font-black uppercase opacity-60 tracking-widest mb-1">
                        Your Answer
                      </span>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold">
                          {qa?.selectedAnswer?.value ?? "No Answer"}
                        </span>
                        {qa?.isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                    </div>

                    {/* Correct Answer - Green Theme */}
                    <div className="p-4 rounded-2xl border-2 bg-emerald-50 border-emerald-400 text-emerald-800 flex flex-col justify-center ring-2 ring-emerald-500/10">
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Correct Answer</span>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold uppercase tracking-tight">{q.correctAnswer?.value}</span>
                        <div className="p-1 bg-emerald-100 rounded-lg">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* METRICS FOOTER */}
                <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-slate-100 flex flex-wrap gap-4 md:gap-8">
                  <div className="flex items-center gap-2 text-slate-400 font-bold text-[8px] md:text-[10px] tracking-widest uppercase">
                    <Clock className="w-3 h-3 md:w-4 md:h-4 text-[#4a9cb0]" /> Time Spent: {qa?.timeSpent || 0}s
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 font-bold text-[8px] md:text-[10px] tracking-widest uppercase">
                    <AlertTriangle className={`w-3 h-3 md:w-4 md:h-4 ${qa?.tabSwitchCount > 0 ? "text-red-500" : "text-emerald-500"}`} /> Switches: {qa?.tabSwitchCount || 0}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-white/20 backdrop-blur-lg rounded-2xl md:rounded-3xl p-3 md:p-5 border border-white/20 shadow-lg group hover:bg-white transition-all duration-300">
      <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
        <div className="p-1.5 md:p-2 bg-white/20 rounded-lg md:rounded-xl group-hover:bg-[#4a9cb0]/10 transition-colors">
          {icon}
        </div>
        <span className="text-[8px] md:text-[10px] font-black text-white/60 group-hover:text-slate-400 uppercase tracking-widest truncate">{label}</span>
      </div>
      <div className="text-sm md:text-2xl font-black text-white group-hover:text-slate-800 transition-colors">{value}</div>
    </div>
  );
}