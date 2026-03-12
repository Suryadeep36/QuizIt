import React, { useState, useEffect } from "react";
import {
  Clock,
  Timer,
  User,
  ChevronLeft,
  ChevronRight,
  Send,
  Maximize,
  Menu,
  X,
  Loader2,
  AlertCircle,
  ArrowRight,
  ClipboardCheck,
} from "lucide-react";
import { useParams, useNavigate } from "react-router";
import useAuth, {
  useNavigationStore,
  useParticipant,
  useQuestionList,
} from "../../../stores/store";
import toast from "react-hot-toast";
import {
  submitAnswer,
  submitTest,
  switchQuestion,
} from "../../../services/AuthService";
import Arrow from "../../landing/components/Arrow";
import MobileExamRoom from "./MobileExamRoom";

export default function ExamRoom() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  /* ================= STATES ================= */
  const [quizEnded, setQuizEnded] = useState(false);
  const [newTabSwitches, setNewTabSwitches] = useState(0);
  // Store Selectors
  const participant = useParticipant((s) => s.participant);
  const clearNavigationData = useNavigationStore(
    (state) => state.clearNavigationData,
  );
  const clearQuestionIds = useQuestionList((state) => state.clearQuestionIds);
  const navigationData = useNavigationStore((state) =>
    state.getNavigationData(),
  );
  const questionIds = useQuestionList((state) => state.getQuizIds());
  const setNavigationData = useNavigationStore(
    (state) => state.setNavigationData,
  );

  /* ================= STATES ================= */
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetchingQuestion, setFetchingQuestion] = useState(false);

  const [globalTime, setGlobalTime] = useState(0);
  const [questionTime, setQuestionTime] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const setStatus = useQuestionList((s) => s.setStatus);

  // Local state for answers to ensure smooth UI before server sync
  const [currentAnswer, setCurrentAnswer] = useState(null);
  const { user } = useAuth();
  const [activeLeft, setActiveLeft] = useState(null);
  const role = user?.roles?.[0];
  const dashboardRoute =
    role === "ROLE_ADMIN"
      ? "/admin"
      : role === "ROLE_STUDENT"
        ? "/student/dashboard"
        : "/dashboard";

  const handleLeftClick = (index) => {
    setActiveLeft(index === activeLeft ? null : index);
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        setNewTabSwitches((prev) => prev + 1);
        toast.warn("Tab switch detected!");
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

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
      //     syncStateWithNavigation(navigationData);
      setLoading(false);
      handleNavigateToIndex(navigationData.currentIndex);
    }
  }, []);

  const currentIndexRef = React.useRef(currentQIndex);

  // 2. Keep the ref updated whenever the index changes
  useEffect(() => {
    currentIndexRef.current = currentQIndex;
  }, [currentQIndex]);

  useEffect(() => {
    // We only start the interval if we have the necessary data

    const autoSync = setInterval(async () => {
      const targetIndex = currentIndexRef.current;
      const response = await switchQuestion(
        participant.quizId,
        participant.id,
        targetIndex,
        newTabSwitches
      );
      setNavigationData(response);
      syncStateWithNavigation(response, true);
      console.log("Background sync: Refreshing question data...", targetIndex);
    }, 15000);

    return () => clearInterval(autoSync);
  }, []);

  const syncStateWithNavigation = (data, autoSync = false) => {
    setCurrentQuestion(data.question);
    setCurrentQIndex(data.currentIndex);
    const globalRemTime = Math.floor(data.globalRemainingTimeMillis / 1000);
    setGlobalTime(globalRemTime);
    const remTime = Math.floor(data.remainingTimeMillis / 1000);
    setQuestionTime(remTime);
    setNewTabSwitches(data.currentQuestionTabSwitches)
    const qId = data.question.questionId;
    if (remTime <= 0) {
      setStatus(qId, "time_up");
    }
    if (globalRemTime <= 0) setQuizEnded(true);

    // Sync answer from server into local state
    // Only update answer if NOT autoSync
    if (!autoSync) {
      setCurrentAnswer(data.selectedAnswer || null);
    }
  };

  const handleMarkForReview = () => {
    const qId = currentQuestion.questionId;
    setStatus(qId, "marked");
    toast.success("Marked for review");
    handleNavigateToIndex(currentQIndex + 1);
  };
  /* ================= NAVIGATION & FETCHING ================= */

  const handleNavigateToIndex = async (targetIndex) => {
    // 2. CHECK STATUS: Get the ID of the target question
    let targetQuestionId = questionIds[targetIndex];
    let targetStatus = useQuestionList.getState().getStatus(targetQuestionId);

    // 3. BLOCK NAVIGATION: If time is up, don't let them enter
    while (targetStatus === "time_up") {
      targetIndex++;
      targetQuestionId = questionIds[targetIndex];
      targetStatus = useQuestionList.getState().getStatus(targetQuestionId);
      return;
    }

    if (targetIndex < 0 || targetIndex >= questionIds.length) return;

    // setFetchingQuestion(true);
    try {
      //   * * SERVICE CALL LOGIC:
      const response = await switchQuestion(
        participant.quizId,
        participant.id,
        targetIndex,
        newTabSwitches
      );
      setNewTabSwitches(0);
      setNavigationData(response);
      syncStateWithNavigation(response);

      setStatus(questionIds[targetIndex], "visited");
      // Temporary simulated update for UI testing
      console.log(`Fetching question at index: ${targetIndex}`);
      // In production: replace this with actual service call response
    } catch (error) {
      console.log(error);
      toast.error("Could not fetch question");
    } finally {
      // setFetchingQuestion(false);
    }
  };

  const handleQuizEnd = () => {
    setQuizEnded(true);
    clearNavigationData();
    clearQuestionIds();
  };

  /* ================= TIMERS ================= */
  const submittingRef = React.useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setGlobalTime((prev) => {
        if (!quizEnded && prev <= 1 && prev > 0 && !submittingRef.current) {
          submittingRef.current = true;

          handleQuizEnd();
          handleSubmitTest();
          toast.success("The quiz has ended!");
          return 0;
        }
        return prev > 0 ? prev - 1 : 0;
      });

      setQuestionTime((prev) => {
        const rem = prev > 0 ? prev - 1 : 0;
        if (rem <= 0) {
          const qId = currentQuestion?.questionId;
          if (qId) setStatus(qId, "time_up");
        }
        return rem;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion, quizEnded]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const renderOptions = () => {
    if (!currentQuestion) return null;
    const {
      questionType,
      options = {},
      questionId,
      allowMultipleAnswers,
    } = currentQuestion;
    const selected = currentAnswer; // This is now an object like { value: ... } or { keys: [...] }

    switch (questionType) {
      case "MCQ":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(options || {}).map(([key, value]) => {
              // Updated: Access keys from the object structure
              const isSelected = selected?.keys?.includes(key);

              return (
                <button
                  key={key}
                  onClick={() => handleOptionClick(key)}
                  className={`p-6 rounded-2xl border-2 text-left transition-all flex items-center gap-4 ${isSelected
                      ? "border-[#1b8599] bg-[#1b8599]/5 shadow-md scale-[1.01]"
                      : "border-slate-100 hover:border-slate-200"
                    }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center font-bold transition-colors ${isSelected
                        ? "bg-[#1b8599] text-white border-[#1b8599]"
                        : "text-slate-400 border-slate-200"
                      }`}
                  >
                    {allowMultipleAnswers && isSelected ? "✓" : key}
                  </div>
                  <span
                    className={`font-bold text-lg ${isSelected ? "text-slate-900" : "text-slate-600"}`}
                  >
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
            {/* Mobile: grid-cols-1 (stacked) 
          Laptop: md:grid-cols-2 (side-by-side) 
      */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 relative">
              {/* Column A */}
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
                  Column A
                </p>
                {options.left.map((item, i) => {
                  const matchObj = selected?.matchPairs?.find(
                    (p) => Object.keys(p)[0] === String(i),
                  );
                  const isMatched = !!matchObj;
                  const isActive = activeLeft === i;

                  return (
                    <button
                      key={i}
                      onClick={() => handleLeftClick(i)}
                      className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex justify-between items-center group
                  ${isActive
                          ? "border-[#1b8599] bg-[#1b8599]/5 shadow-md scale-[1.01]"
                          : isMatched
                            ? "border-emerald-100 bg-emerald-50/50 opacity-80"
                            : "border-slate-100 bg-white hover:border-slate-200"
                        }
                `}
                    >
                      <span
                        className={`font-bold text-sm md:text-base ${isActive ? "text-[#1b8599]" : "text-slate-700"}`}
                      >
                        {item}
                      </span>
                      <div
                        className={`w-2.5 h-2.5 rounded-full transition-all ${isActive ? "bg-[#1b8599] scale-125" : isMatched ? "bg-emerald-500" : "bg-slate-200"}`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Column B */}
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
                  Column B
                </p>
                {options.right.map((item, i) => {
                  const isMatchedToCurrentLeft =
                    activeLeft !== null &&
                    selected?.matchPairs?.some(
                      (p) => p[String(activeLeft)] === i,
                    );

                  return (
                    <button
                      key={i}
                      onClick={() => handleRightClick(i)}
                      className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-4 group
                  ${activeLeft !== null ? "hover:border-[#1b8599] hover:bg-[#1b8599]/5 border-slate-200 cursor-pointer active:scale-[0.98]" : "border-slate-100 bg-slate-50 cursor-default"}
                `}
                    >
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:text-[#1b8599] group-hover:border-[#1b8599]">
                        {String.fromCharCode(65 + i)}
                      </div>
                      <span className="font-bold text-sm md:text-base text-slate-600">
                        {item}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ACTIVE CONNECTIONS SUMMARY */}
            {selected?.matchPairs?.length > 0 && (
              <div className="mt-6 md:mt-10 p-5 md:p-6 bg-slate-50 rounded-2xl md:rounded-[2rem] border border-slate-200">
                <div className="flex justify-between items-center mb-4">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Active Connections
                  </h5>
                  <button
                    onClick={() => setCurrentAnswer({ matchPairs: [] })}
                    className="text-[10px] font-bold text-red-500 hover:underline"
                  >
                    Clear All
                  </button>
                </div>

                {/* Mobile: flex-col (vertical list) 
              Laptop: md:flex-row (wrapped chips) 
          */}
                <div className="flex flex-col md:flex-row md:flex-wrap gap-3">
                  {selected.matchPairs.map((pair, idx) => {
                    const leftIdx = Object.keys(pair)[0];
                    const rightIdx = pair[leftIdx];
                    return (
                      <div
                        key={idx}
                        className="bg-white px-4 py-3 md:py-2 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between md:justify-start gap-3 animate-in zoom-in-95"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs md:text-sm font-bold text-slate-700">
                            {options.left[leftIdx]}
                          </span>
                          <ArrowRight size={14} className="text-[#1b8599]" />
                          <span className="text-xs md:text-sm font-bold text-[#1b8599]">
                            {options.right[rightIdx]}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            const filtered = selected.matchPairs.filter(
                              (_, i) => i !== idx,
                            );
                            setCurrentAnswer({ matchPairs: filtered });
                          }}
                          className="p-1 text-slate-300 hover:text-red-500 transition-colors"
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
            {Object.entries(options || {}).map(([key, value]) => {
              // Updated: Map "TRUE" key to boolean true, "FALSE" to boolean false
              const isSelected = selected?.value === (key === "TRUE");

              return (
                <button
                  key={key}
                  onClick={() => handleOptionClick(key)}
                  className={`p-6 rounded-2xl border-2 transition-all flex items-center gap-4 ${isSelected ? "border-[#1b8599] bg-[#1b8599]/5" : "border-slate-100"}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${isSelected ? "bg-[#1b8599] text-white" : "text-slate-300"}`}
                  >
                    {key[0]}
                  </div>
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
      ...currentPairs.filter((p) => Object.keys(p)[0] !== String(leftIndex)),
      { [String(leftIndex)]: rightIndex },
    ];

    setCurrentAnswer({ matchPairs: updatedPairs });
    setActiveLeft(null);
  };
  /* ================= SERVICE SUBMISSION ================= */
  const handleSaveAndNext = async () => {
    const qId = currentQuestion.questionId;

    // if (currentAnswer) {
    try {
      // The 'selectedAnswer' object already matches your required Map structure
      await submitAnswer(participant.quizId, participant.id, currentAnswer);

      console.log("Submitting to Backend:", {
        quizId: quizId,
        participantId: participant?.id,
        selectedAnswer: currentAnswer,
      });
      if (!currentAnswer) {
        setStatus(qId, "visited");
        toast.success("Response cleared on server");
      } else {
        setStatus(qId, "answered");
        toast.success("Response saved");
      }
    } catch (error) {
      console.error("Sync error:", error);
      toast.error("Failed to sync with server");
    }
    // }

    handleNavigateToIndex(currentQIndex + 1);
  };

  const handlePrevious = () => {
    let targetIndex = currentQIndex - 1;
    // Loop backwards to find the first question that is NOT 'time_up'
    while (targetIndex >= 0) {
      const targetId = questionIds[targetIndex];
      const targetStatus = useQuestionList.getState().getStatus(targetId);
      if (targetStatus !== "time_up") {
        // Found a valid question!
        handleNavigateToIndex(targetIndex);
        return;
      }
      targetIndex--;
    }
    // If the loop finishes without returning, no previous valid questions exist
    toast.error("No previous accessible questions available");
  };

  const handleSubmitTest = async () => {
    try {
      await submitTest(quizId, participant?.id);
      setQuizEnded(true);
      // navigate(`/afterQuizAnalytics/${quizId}`);
    } catch (error) {
      console.error("final submit error:", error);
      toast.error("final test submit failed");
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-[#1b8599]" size={40} />
      </div>
    );

  if (quizEnded || !questionIds || !navigationData) {
    return (
      <div className="h-screen w-full bg-slate-50 flex items-center justify-center p-6 select-none font-sans">
        <div className="max-w-md w-full bg-white rounded-[3rem] p-10 shadow-2xl shadow-slate-200 text-center animate-in zoom-in-95 duration-500 border border-slate-100 relative overflow-hidden">
          {/* Decorative Background Element */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#1b8599]/5 rounded-full" />

          {/* Visual Icon Section */}
          <div className="relative">
            <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 ring-8 ring-emerald-50/50 transition-transform hover:scale-110 duration-500">
              <ClipboardCheck size={48} />
            </div>
            {/* Floating check badge */}
            <div className="absolute top-0 right-[35%] bg-[#1b8599] text-white p-1.5 rounded-full border-4 border-white shadow-lg">
              <Send size={12} />
            </div>
          </div>

          {/* Text Content */}
          <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tight uppercase">
            Assessment Complete
          </h2>
          <p className="text-slate-400 font-medium leading-relaxed mb-10 text-sm">
            Your responses have been successfully synced with our servers. You
            can now review your performance or return to the main portal.
          </p>

          {/* Action Buttons: The Three-Way Navigation */}
          <div className="space-y-4">
            {/* 1. PRIMARY: Navigate to User Analytics */}
            <button
              onClick={() => navigate(`/afterQuizAnalytics/${quizId}`)}
              className="w-full py-5 bg-[#1b8599] text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-[#1b8599]/30 hover:bg-[#166d7d] transition-all active:scale-95 flex items-center justify-center gap-3 group"
            >
              <span>View Detailed Analytics</span>
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>

            {/* Secondary Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* 2. SECONDARY: Navigate to Dashboard */}
              <button
                onClick={() => navigate({ dashboardRoute })}
                className="py-4 bg-slate-700 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-slate-900 transition-all active:scale-95 flex items-center justify-center gap-2 border-b-4 border-slate-950"
              >
                <Menu size={14} />
                Dashboard
              </button>

              {/* 3. TERTIARY: Navigate Home */}
              <button
                onClick={() => navigate(-1)}
                className="py-4 bg-white border-2 border-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-slate-50 hover:border-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <ChevronLeft size={14} />
                Back
              </button>
            </div>

            {/* Meta Info */}
            <div className="pt-6 mt-6 border-t border-slate-50 flex items-center justify-between opacity-40">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Session ID: {quizId?.substring(0, 8)}...
              </p>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                <span className="text-[9px] font-black text-slate-400 uppercase">
                  Securely Submitted
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <>
      <div className="hidden md:block">
        <div className="h-screen w-full bg-slate-100 flex flex-col overflow-hidden select-none">
          {/* HEADER */}
          <header className="bg-[#1b8599] text-white px-6 py-4 flex justify-between items-center z-20 shadow-md">
            <div className="flex items-center gap-4">
              <h1 className="font-black uppercase tracking-tighter text-xl italic">
                QuizIt Live
              </h1>
              <div className="h-6 w-px bg-white/20" />
              <span className="text-xs font-bold opacity-80 uppercase tracking-widest">
                {quizId}
              </span>
            </div>
            <div className="flex items-center gap-8">
              <div className="text-right">
                <p className="text-[9px] font-black uppercase opacity-60 leading-none mb-1">
                  Time Left
                </p>
                <p className="text-xl font-mono font-black text-orange-300">
                  {formatTime(globalTime)}
                </p>
              </div>
              <button
                onClick={() => document.documentElement.requestFullscreen()}
                className="p-2 hover:bg-white/10 rounded-full transition-all"
              >
                <Maximize size={20} />
              </button>
            </div>
          </header>

          <div className="flex flex-1 overflow-hidden relative">
            {/* MAIN AREA */}
            <main className="flex-1 flex flex-col bg-white overflow-y-auto p-6 md:p-12 lg:p-16">
              {/* ... inside main ... */}
              <div className="max-w-4xl w-full mx-auto flex flex-col h-full">
                {/* Question Header */}
                <div className="flex justify-between items-center mb-8 border-b pb-4">
                  <div className="flex items-center gap-4">
                    <span className="bg-slate-900 text-white px-4 py-1.5 rounded-xl font-black text-xs">
                      Question {currentQIndex + 1}
                    </span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {currentQuestion?.questionType.replace("_", " ")}
                    </span>
                  </div>
                  <div
                    className={`flex items-center gap-2 font-mono font-bold text-lg ${questionTime < 10 ? "text-red-500 animate-pulse" : "text-slate-500"}`}
                  >
                    <Timer size={18} /> {formatTime(questionTime)}
                  </div>
                </div>

                {fetchingQuestion ? (
                  <div className="flex-1 flex items-center justify-center">
                    <Loader2
                      className="animate-spin text-slate-200"
                      size={48}
                    />
                  </div>
                ) : useQuestionList
                  .getState()
                  .getStatus(currentQuestion?.questionId) === "time_up" ? (
                  /* TIME EXPIRED VIEW for CURRENT QUESTION */
                  <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
                    <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-3xl flex items-center justify-center mb-6">
                      <Timer size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 mb-2">
                      Time Expired
                    </h2>
                    <p className="text-slate-500 max-w-xs font-medium">
                      The time limit for this specific question has reached
                      zero. You can no longer modify or view this response.
                    </p>
                  </div>
                ) : (
                  /* NORMAL QUESTION CONTENT */
                  <div className="flex-1 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <h2 className="text-2xl md:text-4xl font-black text-slate-800 leading-tight">
                      {currentQuestion?.content}
                    </h2>
                    {currentQuestion?.imageUrl && (
                      <div className="rounded-3xl overflow-hidden border border-slate-100 max-w-lg shadow-xl">
                        <img
                          src={currentQuestion.imageUrl}
                          alt="Context"
                          className="w-full h-auto object-cover"
                        />
                      </div>
                    )}
                    <div className="mt-10">{renderOptions()}</div>
                  </div>
                )}

                {/* Footer buttons should also be disabled or modified if time_up */}
                <footer className="mt-12 pt-8 border-t flex flex-wrap gap-4 justify-between">
                  <button
                    onClick={handlePrevious}
                    className="px-8 py-4 rounded-2xl border-2 border-slate-100 font-black text-slate-500 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <ChevronLeft size={18} /> PREVIOUS
                  </button>
                  <div className="flex gap-4">
                    {useQuestionList
                      .getState()
                      .getStatus(currentQuestion?.questionId) !== "time_up" && (
                        <>
                          <button
                            onClick={handleMarkForReview}
                            className="px-6 py-4 rounded-2xl border-2 border-orange-200 text-orange-600 font-black uppercase text-xs tracking-widest hover:bg-orange-50"
                          >
                            Mark for Review
                          </button>
                          <button
                            onClick={() => setCurrentAnswer({})}
                            className="px-6 py-4 rounded-2xl font-black text-slate-400 hover:text-slate-600 uppercase text-xs tracking-widest"
                          >
                            Clear
                          </button>
                          <button
                            onClick={handleSaveAndNext}
                            className="px-10 py-4 rounded-2xl bg-[#1b8599] text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-[#1b8599]/20 hover:bg-[#166d7d] flex items-center gap-2"
                          >
                            Save & Next <ChevronRight size={18} />
                          </button>
                        </>
                      )}
                    {useQuestionList
                      .getState()
                      .getStatus(currentQuestion?.questionId) === "time_up" && (
                        <button
                          onClick={() => handleNavigateToIndex(currentQIndex + 1)}
                          className="px-10 py-4 rounded-2xl bg-slate-900 text-white font-black uppercase text-xs tracking-widest flex items-center gap-2"
                        >
                          SKIP TO NEXT <ChevronRight size={18} />
                        </button>
                      )}
                  </div>
                </footer>
              </div>
            </main>

            {/* SIDEBAR PALETTE */}
            <aside
              className={`${isSidebarOpen ? "w-80" : "w-0"} bg-slate-50 border-l transition-all duration-300 overflow-hidden flex flex-col shadow-2xl`}
            >
              <div className="p-8 bg-white border-b">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-[#1b8599]">
                    <User size={28} />
                  </div>
                  <div className="flex-1 truncate">
                    <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1 text-slate-400">
                      Candidate
                    </p>
                    <h3 className="font-black text-slate-800 truncate">
                      {participant?.name || "Parth"}
                    </h3>
                    <div className="flex items-center gap-1 mt-1">
                      <AlertCircle size={10} className={navigationData?.tabSwitches > 0 ? "text-orange-500" : "text-slate-300"} />
                      <p className="text-[9px] font-bold text-slate-500 uppercase">
                        Tab Switches: {navigationData?.tabSwitches || 0}
                      </p>
                    </div>
                    <p className="text-[10px] font-bold text-[#1b8599] uppercase">
                      {participant?.enrollmentId || "Student"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex-1 p-8 overflow-y-auto">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">
                  Question Palette
                </h4>
                <div className="grid grid-cols-4 gap-3">
                  {/* In the Sidebar Palette map */}
                  {questionIds.map((id, idx) => {
                    const status = useQuestionList.getState().getStatus(id); // Simple way to get status

                    // Status-based colors
                    const statusClasses = {
                      answered: "bg-emerald-500 text-white border-emerald-500",
                      marked: "bg-orange-500 text-white border-orange-500",
                      visited: "bg-white border-slate-400 text-slate-700",
                      not_visited: "bg-white border-slate-100 text-slate-300",
                      time_up:
                        "bg-slate-200 text-slate-400 border-slate-200 cursor-not-allowed", // Greyed out
                    };
                    const isLocked = status === "time_up";

                    return (
                      <button
                        key={id}
                        disabled={isLocked}
                        onClick={() => handleNavigateToIndex(idx)}
                        className={`h-12 w-12 rounded-xl text-xs font-black transition-all border-2 
                ${currentQIndex === idx ? "ring-4 ring-[#1b8599]/20 shadow-lg scale-110 z-10" : ""} 
                ${statusClasses[status]}`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>{" "}
              </div>
              <div className="mt-6 px-5 pt-2 pb-2 border-t border-slate-200">
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase">
                      Answered
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3  rounded-full bg-orange-500" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase">
                      Review
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3  rounded-full border border-slate-400 bg-white" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase">
                      Visited
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full border border-slate-200 bg-white" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase">
                      Not Open
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white border-t">
                <button
                  onClick={handleSubmitTest}
                  className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl"
                >
                  Submit Test <Send size={16} />
                </button>
              </div>
            </aside>
          </div>
        </div>
      </div>
      <div className="block md:hidden">
        <MobileExamRoom
          currentQuestion={currentQuestion}
          currentQIndex={currentQIndex}
          questionTime={questionTime}
          globalTime={globalTime}
          formatTime={formatTime}
          renderOptions={renderOptions}
          handlePrevious={handlePrevious}
          handleSaveAndNext={handleSaveAndNext}
          handleMarkForReview={handleMarkForReview}
          questionIds={questionIds}
          handleNavigateToIndex={handleNavigateToIndex}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          participant={participant}
          quizId={quizId}
          handleSubmitTest={handleSubmitTest}
          navigationData={navigationData}
        />
      </div>
    </>
  );
}
