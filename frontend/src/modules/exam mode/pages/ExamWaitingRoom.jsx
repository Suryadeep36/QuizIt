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
    Mail,
    Fingerprint,
    PlayCircle
} from "lucide-react";
import { useParams, useNavigate, Navigate } from "react-router";
import toast from "react-hot-toast";
import useAuth, { useNavigationStore, useParticipant } from "../../../stores/store";
// Ensure path is correct
import { getQuizForParticipantById, startExamQuiz } from "../../../services/AuthService";

export default function ExamWaitingRoom() {
    const { quizId } = useParams();
    const navigate = useNavigate();

    // Zustand Store Selectors
    const participant = useParticipant((state) => state.participant);
    const isParticipantForExam = useParticipant((state) => state.isParticipantForExam());
 const isPhysicallyInStorage = useParticipant((state) => state.isPhysicallyInStorage());
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isEnded, setIsEnded] = useState(false);
    const [isTooEarly, setIsTooEarly] = useState(true);

    // 1. Guard: If not a participant, redirect to verification room

    async function fetchQuiz() {
        try {
            setLoading(true);
            const response = await getQuizForParticipantById(quizId);
            setQuiz(response);
        } catch (error) {
            toast.error("Failed to load assessment details");
        } finally {
            setTimeout(() => setLoading(false), 500);
        }
    }

    useEffect(() => {
        // console.log("running...")
        if (!isPhysicallyInStorage ) {
   
            console.log(isPhysicallyInStorage);
            navigate(`/waiting-room/${quizId}`);
        }
        if (quizId) fetchQuiz();
    }, [quizId,navigate]);

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
                setIsTooEarly(false);
                setIsEnded(false);
                setTimeLeft(0);
            } else {
                setIsTooEarly(diffToStart > 5 * 60 * 1000);
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

   const setNavigationData = useNavigationStore((state)=>state.setNavigationData);
const handleBeginAssessment = async () => {
  try {
    const data = await startExamQuiz(participant.quizId,participant.id);
    toast.dismiss();
    setNavigationData(data);
    console.log(data);
    toast.success("Exam Started 🚀");
    navigate(`/exam/${quizId}/room`)
  } catch (error) {
    toast.dismiss();
    toast.error("Failed to start exam ❌");
    console.error(error);
  }
};
   

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
                <Loader2 className="w-16 h-16 text-[#1b8599] animate-spin" />
                <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px] mt-6">
                    Syncing Participant Data...
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
                                     {quiz?.duration ? quiz.duration/60 + " Minutes" : "N/A"}
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

                {/* RIGHT SIDE: Details & Begin Action */}
                <div className="flex-1 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-white relative">

                    {/* Floating Countdown / Status Badge (Top Right) */}
                    {!isEnded && (
                        <div className="absolute top-6 right-6 md:top-10 md:right-10 flex flex-col items-end animate-in fade-in slide-in-from-top-2 duration-700">
                            {timeLeft > 0 ? (
                                <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 px-4 py-2 rounded-2xl shadow-sm">
                                    <div className="flex flex-col items-end">
                                        <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 leading-none mb-1">Unlocks In</span>
                                        <span className="text-xl font-black font-mono tracking-tighter text-orange-500 tabular-nums animate-pulse">
                                            {String(minutesLeft).padStart(2, '0')}:{String(secondsLeft).padStart(2, '0')}
                                        </span>
                                    </div>
                                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
                                        <Timer size={18} />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-2xl shadow-sm">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Session Live</span>
                                </div>
                            )}
                        </div>
                    )}

                    {isEnded ? (
                        <div className="text-center space-y-6">
                            <AlertCircle size={40} className="mx-auto text-red-500" />
                            <h2 className="text-2xl font-black text-slate-800 uppercase">Window Closed</h2>
                            <p className="text-slate-400 text-sm font-medium">This assessment has concluded.</p>
                            <button onClick={() => navigate('/')} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all">Return Home</button>
                        </div>
                    ) : (
                        <div className="w-full animate-in fade-in duration-500">
                            <header className="mb-10 text-center md:text-left">
                                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Candidate Profile</h2>
                                <p className="text-slate-400 text-sm font-medium">Verify your details before entering the exam.</p>
                            </header>

                            {/* Participant Info Cards */}
                            <div className="space-y-3 mb-10">
                                <div className="bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl flex items-center gap-4 transition-all hover:border-[#1b8599]/30">
                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#1b8599]"><User size={20} /></div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Full Name</p>
                                        <p className="text-sm font-black text-slate-800">{participant.name}</p>
                                    </div>
                                </div>
                                <div className="bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl flex items-center gap-4 transition-all hover:border-[#1b8599]/30">
                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#1b8599]"><Mail size={20} /></div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Email</p>
                                        <p className="text-sm font-black text-slate-800">{participant.email}</p>
                                    </div>
                                </div>
                                <div className="bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl flex items-center gap-4 transition-all hover:border-[#1b8599]/30">
                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#1b8599]"><Fingerprint size={20} /></div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Enrollment ID</p>
                                        <p className="text-sm font-black text-slate-800">{participant.enrollmentId || "N/A"}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Section */}
                            <div className="w-full">
                                {timeLeft > 0 ? (
                                    <div className="w-full py-5 bg-slate-100 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1 opacity-60">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Portal Restricted</span>
                                        <p className="text-[11px] font-bold text-slate-500">Access will enable automatically at start time</p>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleBeginAssessment}
                                        className="w-full bg-[#1b8599] hover:bg-[#166d7d] text-white py-5 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-[#1b8599]/20 group"
                                    >
                                        <PlayCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                        <span className="font-black uppercase tracking-[0.2em] text-xs">Begin</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}