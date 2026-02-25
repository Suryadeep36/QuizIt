import React, { useEffect, useState } from "react";
import {
    Calendar,
    ArrowRight,
    ClipboardCheck,
    User,
    Clock,
    Timer,
    LockKeyhole,
    AlertCircle,
    Loader2,
    RefreshCcw,
    XCircle,
} from "lucide-react";
import { useParams, useNavigate } from "react-router";
import toast from "react-hot-toast";
import useAuth from "../../../stores/store";
import {
  getQuizForParticipantById,
  verifyParticipant,
} from "../../../services/AuthService";

export default function PreQuizWaitingRoom() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const user = useAuth((state) => state.user);

  const [quiz, setQuiz] = useState({
    quizId: "ef7d764a-a550-429a-8dc4-79d19722dbbe",
    quizName: "bhul tari che",
    handleStartQuizost: "58142d30-76cb-4650-9d43-d366d93bf455",
    status: null,
    mode: "EXAM",
    startTime: "2026-02-25T13:15:00Z",
    endTime: "2026-02-26T13:01:00Z",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [birthDate, setBirthDate] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);

    // States for dynamic UI
    const [isEnded, setIsEnded] = useState(false);
    const [isTooEarly, setIsTooEarly] = useState(true);

    async function fetchQuiz() {
        try {
            setLoading(true);
            const response = await getQuizForParticipantById(quizId);
            setQuiz(response);
        } catch (error) {
            toast.error("Failed to load assessment details");
        } finally {
            // Delay slightly for smooth transition
            setTimeout(() => setLoading(false), 500);
        }
    }

    useEffect(() => {
        if (quizId) fetchQuiz();
    }, [quizId]);

  useEffect(() => {
    if (!quiz?.startTime || !quiz?.endTime) return;

    const calculateStatus = () => {
        const now = new Date().getTime();
        const start = new Date(quiz.startTime).getTime();
        const end = new Date(quiz.endTime).getTime();
        const diffToStart = start - now;

        if (now > end) {
            setIsEnded(true);
            setIsTooEarly(false);
        } else if (now >= start) {
            // QUIZ IS LIVE
            setIsTooEarly(false);
            setIsEnded(false);
            setTimeLeft(0); 
        } else if (diffToStart > 5 * 60 * 1000) {
            // TOO EARLY (> 5 mins)
            setIsTooEarly(true);
            setIsEnded(false);
            setTimeLeft(diffToStart);
        } else {
            // COUNTDOWN MODE (< 5 mins)
            setIsTooEarly(false);
            setIsEnded(false);
            setTimeLeft(diffToStart);
        }
    };

    calculateStatus();
    const interval = setInterval(calculateStatus, 1000);
    return () => clearInterval(interval);
}, [quiz]);

    const minutesLeft = Math.floor(timeLeft / (1000 * 60));
    const secondsLeft = Math.floor((timeLeft / 1000) % 60);

  // 3. Submit Verification
  const handleStartQuiz = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const data = await verifyParticipant({ quizId, birthDate, email: user.email });
      console.log(data);
      toast.success("Identity Verified! Starting...");
      navigate(`/exam/${quizId}/session`);
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message || "Verification failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#1b8599] animate-spin mb-4" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
          Synchronizing with Server...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-0 md:p-6 font-sans">
      <div className="w-full max-w-[1000px] bg-white md:rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row overflow-hidden border border-slate-100 min-h-[600px]">
        {/* LEFT SIDE: Quiz Metadata */}
        <div className="w-full md:w-[40%] bg-[#1b8599] p-8 md:p-12 text-white flex flex-col justify-between relative">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full mb-6 border border-white/10">
              <ClipboardCheck className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Pre-Exam Check
              </span>
            </div>

                        <h1 className="text-3xl md:text-4xl font-black uppercase leading-tight mb-8">
                            {quiz?.quizName || "Assessment"}
                        </h1>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase opacity-60">
                    Scheduled Date
                  </p>
                  <p className="font-bold">
                    {new Date(quiz?.startTime).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase opacity-60">
                    Start Time
                  </p>
                  <p className="font-bold">
                    {new Date(quiz?.startTime).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                  <Timer className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase opacity-60">
                    Duration
                  </p>
                  <p className="font-bold">60 Minutes</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-8 border-t border-white/10 mt-10">
            <p className="text-xs font-bold uppercase tracking-widest opacity-50 mb-2 text-white">
              Status
            </p>
            <p className="text-sm font-medium leading-relaxed">
              {isTooEarly
                ? "The portal is locked. Please return 5 minutes before the start time."
                : "The portal is open. Verify your identity to enter."}
            </p>
          </div>
        </div>

                {/* Right Side Logic Update */}
<div className="flex-1 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-white">
    {isEnded ? (
        /* ... Ended UI ... */
        <div className="text-center space-y-6 animate-in zoom-in-95 duration-300">
            <div className="flex justify-center">
                <div className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center text-red-500 shadow-inner">
                    <AlertCircle size={40} />
                </div>
            </div>
            <header>
                <h2 className="text-2xl font-black text-slate-800 uppercase">Quiz Ended</h2>
                <p className="text-slate-400 text-sm font-medium mt-2">The assessment window has closed.</p>
            </header>
            <button onClick={() => navigate('/')} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95">Return to Dashboard</button>
        </div>
    ) : isTooEarly ? (
        /* ... Too Early UI ... */
        <div className="text-center space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-center">
                <div className="w-20 h-20 rounded-3xl bg-amber-50 flex items-center justify-center text-amber-500">
                    <LockKeyhole size={40} />
                </div>
              </div>
              <header>
                <h2 className="text-2xl font-black text-slate-800 uppercase">
                  Access Restricted
                </h2>
                <p className="text-slate-400 text-sm font-medium mt-2">
                  Please return to this link 5 minutes before <br /> the exam
                  start time.
                </p>
              </header>
              <button
                onClick={() => window.location.reload()}
                className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all"
              >
                Refresh Status
              </button>
            </div>
          ) : (
            /* STATE 2: CHECK-IN OPEN (< 5 MINS) */
            <div className="w-full">
              <header className="mb-8 text-center md:text-left">
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
                  Identity Verification
                </h2>
                <p className="text-slate-400 text-sm font-medium">
                  Verify your credentials to initialize the proctored session.
                </p>
              </header>

              {/* Countdown Bar */}
              <div className="bg-slate-700 text-white p-6 rounded-[2rem] mb-10 flex items-center justify-center shadow-xl shadow-slate-200">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Time Remaining
                  </span>
                  <span className="text-3xl font-black font-mono tracking-tighter text-orange-500">
                    {String(minutesLeft).padStart(2, "0")}:
                    {String(secondsLeft).padStart(2, "0")}
                  </span>
                </div>
              </div>

            <form onSubmit={handleStartQuiz} className="space-y-6">
                {/* ... existing email and birthdate inputs ... */}
                <div className="bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#1b8599]">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">
                      Authenticated Email
                    </p>
                    <p className="text-sm font-black text-slate-800">
                      {user?.email || "student@example.com"}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1 flex items-center gap-2">
                    <LockKeyhole size={12} /> Security Key (Birthdate)
                  </label>
                  <input
                    type="date"
                    required
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 focus:border-[#1b8599] focus:bg-white outline-none px-6 py-4 rounded-2xl font-black text-slate-700 transition-all text-xl tracking-widest"
                  />
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#1b8599] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-[#166d7d] transition-all shadow-xl shadow-[#1b8599]/20 flex items-center justify-center gap-3 disabled:opacity-70 active:scale-[0.98]"
                >
                  {submitting ? "Verifying Identity..." : "Start Assessment"}{" "}
                  <ArrowRight className="w-5 h-5" />
                </button>
            </form>
        </div>
    )}
</div>
            </div>
        </div>
    );
}
