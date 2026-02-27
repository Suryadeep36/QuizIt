import React, { useState, useEffect } from "react";
import {
    Clock, Timer, User, ChevronLeft, ChevronRight,
    Send, Maximize, Menu, X, Loader2, AlertCircle,
    ArrowRight
} from "lucide-react";
import { useParams, useNavigate } from "react-router";
import { useNavigationStore, useParticipant, useQuestionList } from "../../../stores/store";
import toast from "react-hot-toast";
import { submitAnswer, switchQuestion } from "../../../services/AuthService";

export default function ExamRoom() {
    const { quizId } = useParams();
    const navigate = useNavigate();

    // Store Selectors
    const participant = useParticipant((s) => s.participant);
    const navigationData = useNavigationStore((state) => state.getNavigationData());
    const questionIds = useQuestionList((state) => state.getQuizIds());
    const setNavigationData = useNavigationStore((state) => state.setNavigationData);

    /* ================= STATES ================= */
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [fetchingQuestion, setFetchingQuestion] = useState(false);

    const [globalTime, setGlobalTime] = useState(0);
    const [questionTime, setQuestionTime] = useState(0);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Local state for answers to ensure smooth UI before server sync
    const [currentAnswer, setCurrentAnswer] = useState(null);


    const [activeLeft, setActiveLeft] = useState(null);

    const handleLeftClick = (index) => {
        setActiveLeft(index === activeLeft ? null : index);
    };

    const handleRightClick = (rightIndex) => {
        if (activeLeft === null) {
            toast.error("Select an item from Column A first");
            return;
        }
        // handleMatchLink already handles the { "0": 0 } structure for your backend
        handleMatchLink(activeLeft, rightIndex);
        setActiveLeft(null); // Reset for next connection
    };

    /* ================= INITIAL LOAD ================= */
    useEffect(() => {
        if (navigationData) {
            syncStateWithNavigation(navigationData);
            setLoading(false);
        }
    }, []);

    const syncStateWithNavigation = (data) => {
        setCurrentQuestion(data.question);
        setCurrentQIndex(data.currentIndex);
        setGlobalTime(Math.floor(data.globalRemainingTimeMillis / 1000));
        setQuestionTime(Math.floor(data.remainingTimeMillis / 1000));

        // Sync answer from server into local state
        setCurrentAnswer(data.selectedAnswer || null);
    };

    /* ================= NAVIGATION & FETCHING ================= */

    const handleNavigateToIndex = async (targetIndex) => {
        if (targetIndex < 0 || targetIndex >= questionIds.length) return;

        setFetchingQuestion(true);
        try {
            //   * * SERVICE CALL LOGIC:
            const response = await switchQuestion(participant.quizId, participant.id, targetIndex);
            setNavigationData(response);
            syncStateWithNavigation(response);
            // Temporary simulated update for UI testing
            console.log(`Fetching question at index: ${targetIndex}`);
            // In production: replace this with actual service call response
        } catch (error) {
            console.log(error)
            toast.error("Could not fetch question");
        } finally {
            setFetchingQuestion(false);
        }
    };



    /* ================= TIMERS ================= */
    useEffect(() => {
        const timer = setInterval(() => {
            setGlobalTime(prev => (prev > 0 ? prev - 1 : 0));
            setQuestionTime(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const renderOptions = () => {
        if (!currentQuestion) return null;
        const { questionType, options, questionId, allowMultipleAnswers } = currentQuestion;
        const selected = currentAnswer; // This is now an object like { value: ... } or { keys: [...] }

        switch (questionType) {
            case "MCQ":
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(options).map(([key, value]) => {
                            // Updated: Access keys from the object structure
                            const isSelected = selected?.keys?.includes(key);

                            return (
                                <button
                                    key={key}
                                    onClick={() => handleOptionClick(key)}
                                    className={`p-6 rounded-2xl border-2 text-left transition-all flex items-center gap-4 ${isSelected ? "border-[#1b8599] bg-[#1b8599]/5 shadow-md scale-[1.01]" : "border-slate-100 hover:border-slate-200"
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center font-bold transition-colors ${isSelected ? "bg-[#1b8599] text-white border-[#1b8599]" : "text-slate-400 border-slate-200"
                                        }`}>
                                        {allowMultipleAnswers && isSelected ? "✓" : key}
                                    </div>
                                    <span className={`font-bold text-lg ${isSelected ? "text-slate-900" : "text-slate-600"}`}>
                                        {value}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                );

            case "SHORT_ANSWER":
            case "NUMERICAL":
                return (
                    <div className="max-w-md">
                        <input
                            type={questionType === "NUMERICAL" ? "number" : "text"}
                            // Updated: Access value from { value: "hello" }
                            value={selected?.value || ""}
                            onChange={(e) => handleOptionClick(e.target.value)}
                            className="w-full p-6 rounded-2xl border-2 border-slate-100 focus:border-[#1b8599] outline-none text-xl font-black text-slate-800 transition-all"
                            placeholder="Enter your response..."
                        />
                    </div>
                );

            case "MATCH_FOLLOWING":
                return (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="grid grid-cols-2 gap-10 relative">
                            {/* Column A */}
                            <div className="space-y-3">
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Column A</p>
                                {options.left.map((item, i) => {
                                    const matchObj = selected?.matchPairs?.find(p => Object.keys(p)[0] === String(i));
                                    const isMatched = !!matchObj;
                                    const isActive = activeLeft === i;

                                    return (
                                        <button
                                            key={i}
                                            onClick={() => handleLeftClick(i)}
                                            className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex justify-between items-center group
                  ${isActive ? 'border-[#1b8599] bg-[#1b8599]/5 shadow-md scale-[1.02]' :
                                                    isMatched ? 'border-emerald-100 bg-emerald-50/50 opacity-80' : 'border-slate-100 bg-white hover:border-slate-200'}
                `}
                                        >
                                            <span className={`font-bold ${isActive ? 'text-[#1b8599]' : 'text-slate-700'}`}>{item}</span>
                                            <div className={`w-2 h-2 rounded-full transition-all ${isActive ? 'bg-[#1b8599] scale-150' : isMatched ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Column B */}
                            <div className="space-y-3">
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Column B</p>
                                {options.right.map((item, i) => {
                                    const isMatchedToCurrentLeft = activeLeft !== null &&
                                        selected?.matchPairs?.some(p => p[String(activeLeft)] === i);

                                    return (
                                        <button
                                            key={i}
                                            onClick={() => handleRightClick(i)}
                                            className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-4 group
                  ${activeLeft !== null ? 'hover:border-[#1b8599] hover:bg-[#1b8599]/5 border-slate-200 cursor-pointer' : 'border-slate-100 bg-slate-50 cursor-default'}
                `}
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:text-[#1b8599] group-hover:border-[#1b8599]">
                                                {i}
                                            </div>
                                            <span className="font-bold text-slate-600">{item}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ACTIVE CONNECTIONS SUMMARY: Best for UX Clarity */}
                        {selected?.matchPairs?.length > 0 && (
                            <div className="mt-10 p-6 bg-slate-50 rounded-[2rem] border border-slate-200">
                                <div className="flex justify-between items-center mb-4">
                                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Connections</h5>
                                    <button
                                        onClick={() => setUserAnswers(prev => ({ ...prev, [questionId]: { matchPairs: [] } }))}
                                        className="text-[10px] font-bold text-red-500 hover:underline"
                                    >
                                        Clear All
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {selected.matchPairs.map((pair, idx) => {
                                        const leftIdx = Object.keys(pair)[0];
                                        const rightIdx = pair[leftIdx];
                                        return (
                                            <div key={idx} className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 animate-in zoom-in-95">
                                                <span className="text-sm font-bold text-slate-700">{options.left[leftIdx]}</span>
                                                <ArrowRight size={14} className="text-[#1b8599]" />
                                                <span className="text-sm font-bold text-[#1b8599]">{options.right[rightIdx]}</span>
                                                <button
                                                    onClick={() => {
                                                        const filtered = selected.matchPairs.filter((_, i) => i !== idx);
                                                        setUserAnswers(prev => ({ ...prev, [questionId]: { matchPairs: filtered } }));
                                                    }}
                                                    className="ml-2 text-slate-300 hover:text-red-500 transition-colors"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                );
            case "TRUE_FALSE":
                return (
                    <div className="grid grid-cols-2 gap-4">
                        {Object.entries(options).map(([key, value]) => {
                            // Updated: Map "TRUE" key to boolean true, "FALSE" to boolean false
                            const isSelected = selected?.value === (key === "TRUE");

                            return (
                                <button key={key} onClick={() => handleOptionClick(key)}
                                    className={`p-6 rounded-2xl border-2 transition-all flex items-center gap-4 ${isSelected ? "border-[#1b8599] bg-[#1b8599]/5" : "border-slate-100"}`}>
                                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${isSelected ? "bg-[#1b8599] text-white" : "text-slate-300"}`}>{key[0]}</div>
                                    <span className="font-bold">{value}</span>
                                </button>
                            );
                        })}
                    </div>
                );

            default:
                return <AlertCircle className="text-slate-200" />;
        }
    };

    /* ================= UPDATED SELECTION LOGIC ================= */
    const handleOptionClick = (val) => {
        if (!currentQuestion) return;
        const { questionType, allowMultipleAnswers } = currentQuestion;
        let updated;

        if (questionType === "MCQ") {
            if (allowMultipleAnswers) {
                // Updated to use currentAnswer state
                const currentKeys = currentAnswer?.keys || [];
                const updatedKeys = currentKeys.includes(val)
                    ? currentKeys.filter((k) => k !== val)
                    : [...currentKeys, val];
                updated = { keys: updatedKeys };
            } else {
                updated = { keys: [val] };
            }
        } else if (questionType === "TRUE_FALSE") {
            updated = { value: val === "TRUE" };
        } else if (questionType === "NUMERICAL") {
            updated = { value: Number(val) };
        } else {
            updated = { value: val };
        }

        setCurrentAnswer(updated);
    };

    /* ================= MATCH FOLLOWING SPECIAL HANDLING ================= */
  const handleMatchLink = (leftIndex, rightIndex) => {
    const currentPairs = currentAnswer?.matchPairs || [];
    const updatedPairs = [
        ...currentPairs.filter(p => Object.keys(p)[0] !== String(leftIndex)),
        { [String(leftIndex)]: rightIndex }
    ];
    
    setCurrentAnswer({ matchPairs: updatedPairs });
    setActiveLeft(null); 
};
    /* ================= SERVICE SUBMISSION ================= */
    const handleSaveAndNext = async () => {
        const qId = currentQuestion.questionId;
    

        if (currentAnswer) {
            try {

                // The 'selectedAnswer' object already matches your required Map structure
                await submitAnswer(participant.quizId, participant.id, currentAnswer)
                console.log("Submitting to Backend:", {
                    quizId: quizId,
                    participantId: participant?.id,
                    selectedAnswer: currentAnswer
                });
            } catch (error) {
                toast.error("Sync failed");
            }
        }

        handleNavigateToIndex(currentQIndex + 1);
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-[#1b8599]" size={40} /></div>;

    return (
        <div className="h-screen w-full bg-slate-100 flex flex-col overflow-hidden select-none">
            {/* HEADER */}
            <header className="bg-[#1b8599] text-white px-6 py-4 flex justify-between items-center z-20 shadow-md">
                <div className="flex items-center gap-4">
                    <h1 className="font-black uppercase tracking-tighter text-xl italic">QuizIt Live</h1>
                    <div className="h-6 w-px bg-white/20" />
                    <span className="text-xs font-bold opacity-80 uppercase tracking-widest">{quizId}</span>
                </div>
                <div className="flex items-center gap-8">
                    <div className="text-right">
                        <p className="text-[9px] font-black uppercase opacity-60 leading-none mb-1">Time Left</p>
                        <p className="text-xl font-mono font-black text-orange-300">{formatTime(globalTime)}</p>
                    </div>
                    <button onClick={() => document.documentElement.requestFullscreen()} className="p-2 hover:bg-white/10 rounded-full transition-all"><Maximize size={20} /></button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden relative">
                {/* MAIN AREA */}
                <main className="flex-1 flex flex-col bg-white overflow-y-auto p-6 md:p-12 lg:p-16">
                    <div className="max-w-4xl w-full mx-auto flex flex-col h-full">
                        <div className="flex justify-between items-center mb-8 border-b pb-4">
                            <div className="flex items-center gap-4">
                                <span className="bg-slate-900 text-white px-4 py-1.5 rounded-xl font-black text-xs">Question {currentQIndex + 1}</span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{currentQuestion?.questionType.replace('_', ' ')}</span>
                            </div>
                            <div className={`flex items-center gap-2 font-mono font-bold text-lg ${questionTime < 10 ? 'text-red-500 animate-pulse' : 'text-slate-500'}`}>
                                <Timer size={18} /> {formatTime(questionTime)}
                            </div>
                        </div>

                        {fetchingQuestion ? (
                            <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-slate-200" size={48} /></div>
                        ) : (
                            <div className="flex-1 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <h2 className="text-2xl md:text-4xl font-black text-slate-800 leading-tight">{currentQuestion?.content}</h2>
                                {currentQuestion?.imageUrl && (
                                    <div className="rounded-3xl overflow-hidden border border-slate-100 max-w-lg shadow-xl">
                                        <img src={currentQuestion.imageUrl} alt="Context" className="w-full h-auto object-cover" />
                                    </div>
                                )}
                                <div className="mt-10">{renderOptions()}</div>
                            </div>
                        )}

                        <footer className="mt-12 pt-8 border-t flex flex-wrap gap-4 justify-between">
                            <button onClick={() => handleNavigateToIndex(currentQIndex - 1)} className="px-8 py-4 rounded-2xl border-2 border-slate-100 font-black text-slate-500 hover:bg-slate-50 flex items-center gap-2">
                                <ChevronLeft size={18} /> PREVIOUS
                            </button>
                            <div className="flex gap-4">
                                <button onClick={() => setUserAnswers(prev => ({ ...prev, [currentQuestion.questionId]: null }))} className="px-6 py-4 rounded-2xl font-black text-slate-400 hover:text-slate-600 uppercase text-xs tracking-widest">Clear</button>
                                <button onClick={handleSaveAndNext} className="px-10 py-4 rounded-2xl bg-[#1b8599] text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-[#1b8599]/20 hover:bg-[#166d7d] flex items-center gap-2">
                                    Save & Next <ChevronRight size={18} />
                                </button>
                            </div>
                        </footer>
                    </div>
                </main>

                {/* SIDEBAR PALETTE */}
                <aside className={`${isSidebarOpen ? 'w-80' : 'w-0'} bg-slate-50 border-l transition-all duration-300 overflow-hidden flex flex-col shadow-2xl`}>
                    <div className="p-8 bg-white border-b">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-[#1b8599]"><User size={28} /></div>
                            <div className="flex-1 truncate">
                                <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1 text-slate-400">Candidate</p>
                                <h3 className="font-black text-slate-800 truncate">{participant?.name || "Parth"}</h3>
                                <p className="text-[10px] font-bold text-[#1b8599] uppercase">{participant?.enrollmentId || "Student"}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 p-8 overflow-y-auto">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Question Palette</h4>
                        <div className="grid grid-cols-4 gap-3">
                            {questionIds.map((id, idx) => (
                                <button key={id} onClick={() => handleNavigateToIndex(idx)} className={`h-12 w-12 rounded-xl text-xs font-black transition-all ${currentQIndex === idx ? 'bg-[#1b8599] text-white ring-4 ring-[#1b8599]/20 shadow-lg' : 'bg-white border-2 border-slate-100 text-slate-400'}`}>
                                    {idx + 1}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-8 bg-white border-t">
                        <button onClick={() => confirm("Submit Test?") && navigate('/')} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl">
                            Submit Test <Send size={16} />
                        </button>
                    </div>
                </aside>
            </div>
        </div>
    );
}