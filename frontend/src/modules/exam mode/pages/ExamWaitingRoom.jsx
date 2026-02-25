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
import useAuth, { useParticipant } from "../../../stores/store";
 // Ensure path is correct
import { getQuizForParticipantById } from "../../../services/AuthService";

export default function ExamWaitingRoom() {
    const { quizId } = useParams();
    const navigate = useNavigate();
    
    // Zustand Store Selectors
    const participant = useParticipant((state) => state.participant);
    const isParticipant = useParticipant((state) => state.isParticipant());

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
          if (!isParticipant) {
       navigate(`/waiting-room/${quizId}`);
    }
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

    const handleBeginAssessment = () => {
        toast.success("Initializing Environment...");
        navigate(`/exam/${quizId}/session`);
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

                {/* LEFT SIDE: Metadata (Unchanged) */}
                <div className="w-full md:w-[40%] bg-[#1b8599] p-8 md:p-12 text-white flex flex-col justify-between relative">
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full mb-6 border border-white/10">
                            <ClipboardCheck className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Identity Verified</span>
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
                                    <p className="text-[10px] font-bold uppercase opacity-60">Date</p>
                                    <p className="font-bold">{new Date(quiz?.startTime).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                                    <Timer className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase opacity-60">Duration</p>
                                    <p className="font-bold">{quiz?.startTime && quiz?.endTime ? `${Math.round((new Date(quiz.endTime) - new Date(quiz.startTime)) / 60000)} Mins` : "--"}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 pt-8 border-t border-white/10 mt-10">
                        <p className="text-xs font-bold uppercase tracking-widest opacity-50 mb-2">Participant ID</p>
                        <p className="text-sm font-mono font-medium">{participant.id}</p>
                    </div>
                </div>

                {/* RIGHT SIDE: Details & Begin Action */}
                <div className="flex-1 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-white">
                    {isEnded ? (
                        <div className="text-center space-y-6">
                            <AlertCircle size={40} className="mx-auto text-red-500" />
                            <h2 className="text-2xl font-black text-slate-800 uppercase">Window Closed</h2>
                            <button onClick={() => navigate('/')} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest">Return Home</button>
                        </div>
                    ) : (
                        <div className="w-full animate-in fade-in duration-500">
                            <header className="mb-8 text-center md:text-left">
                                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Candidate Profile</h2>
                                <p className="text-slate-400 text-sm font-medium">Verify your details before entering the exam.</p>
                            </header>

                            {/* Participant Info Cards */}
                            <div className="space-y-3 mb-8">
                                <div className="bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#1b8599]"><User size={20} /></div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Full Name</p>
                                        <p className="text-sm font-black text-slate-800">{participant.name}</p>
                                    </div>
                                </div>
                                <div className="bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#1b8599]"><Mail size={20} /></div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Email</p>
                                        <p className="text-sm font-black text-slate-800">{participant.email}</p>
                                    </div>
                                </div>
                                <div className="bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#1b8599]"><Fingerprint size={20} /></div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Enrollment ID</p>
                                        <p className="text-sm font-black text-slate-800">{participant.entrollmentId || "N/A"}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Status & Action */}
                            <div className="bg-slate-700 text-white p-6 rounded-[2rem] flex flex-col items-center justify-center shadow-xl border-b-4 border-[#1b8599]">
                                {timeLeft > 0 ? (
                                    <>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Unlocks In</span>
                                        <span className="text-3xl font-black font-mono tracking-tighter text-orange-500 animate-pulse">
                                            {String(minutesLeft).padStart(2, '0')}:{String(secondsLeft).padStart(2, '0')}
                                        </span>
                                    </>
                                ) : (
                                    <button 
                                        onClick={handleBeginAssessment}
                                        className="w-full bg-[#1b8599] hover:bg-[#166d7d] text-white py-4 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-95"
                                    >
                                        <PlayCircle className="w-6 h-6" />
                                        <span className="font-black uppercase tracking-widest text-sm">Begin Assessment</span>
                                    </button>
                                )}
                            </div>
                            
                            <p className="text-center text-[10px] text-slate-400 font-bold uppercase mt-6 tracking-widest">
                                {timeLeft > 0 ? "Waiting for window to open..." : "Click button above to start"}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}