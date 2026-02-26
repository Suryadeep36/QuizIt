import React, { useState, useEffect, useMemo } from "react";
import { 
  Clock, Timer, User, Fingerprint, ChevronLeft, ChevronRight, 
  Send, AlertCircle, Loader2, Maximize, Menu, X, Trash2
} from "lucide-react";
import { useParams, useNavigate } from "react-router";
import { useParticipant } from "../../../stores/store";
import toast from "react-hot-toast";

// Dummy Data provided in prompt
const DUMMY_EXAM_DATA = [
  {
    "questionId": "71f19bb9-25d4-4af0-996b-396095604bb3",
    "content": "one : write next ",
    "options": {},
    "duration": 30,
    "questionType": "SHORT_ANSWER",
    "imageUrl": null,
    "allowMultipleAnswers": false
  },
  {
    "questionId": "ac37316e-6372-46f1-bbbf-28acabbb8d4d",
    "content": "match respectively",
    "options": {
      "left": ["school", "hospital", "court"],
      "right": ["teacher", "doctor", "lawyer"]
    },
    "duration": 30,
    "questionType": "MATCH_FOLLOWING",
    "imageUrl": null,
    "allowMultipleAnswers": false
  },
  {
    "questionId": "f5ea1322-1ae6-4fb8-8a0a-f578d20e2e68",
    "content": "moon is black.",
    "options": { "TRUE": "True", "FALSE": "False" },
    "duration": 30,
    "questionType": "TRUE_FALSE",
    "imageUrl": null,
    "allowMultipleAnswers": false
  },
  {
    "questionId": "9599b72c-ad10-48e7-9ac4-e9b55d2f0806",
    "content": "who is wife of jethalal? guess?",
    "options": { "A": "maya", "B": "kaya", "C": "dya", "D": "babita" },
    "duration": 120,
    "questionType": "MCQ",
    "imageUrl": null,
    "allowMultipleAnswers": true
  },
  {
    "questionId": "7f9e19b5-773f-4210-8bd1-b27562098fa2",
    "content": "how much 5 + 6? ",
    "options": {},
    "duration": 30,
    "questionType": "NUMERICAL",
    "imageUrl": "https://plus.unsplash.com/premium_photo-1683865776032-07bf70b0add1?q=80&w=1332&auto=format&fit=crop",
    "allowMultipleAnswers": false
  }
];

export default function ExamRoom() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const participant = useParticipant((s) => s.participant);

  /* ================= STATES ================= */
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [questionStatuses, setQuestionStatuses] = useState({}); // not_visited | answered | marked | not_answered
  const [userAnswers, setUserAnswers] = useState({}); 
  const [userMatchPairs, setUserMatchPairs] = useState([]); // Temporary state for Match Following
  
  const [globalTime, setGlobalTime] = useState(3600); 
  const [questionTime, setQuestionTime] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    const initExam = async () => {
      setLoading(true);
      // await getQuestionsByQuizId(quizId); // Logic for later
      setQuestions(DUMMY_EXAM_DATA);
      
      const initialStatus = {};
      DUMMY_EXAM_DATA.forEach(q => initialStatus[q.questionId] = 'not_visited');
      setQuestionStatuses(initialStatus);

      loadQuestion(0, DUMMY_EXAM_DATA);
      setLoading(false);
    };
    initExam();
  }, [quizId]);

  const loadQuestion = (index, dataList = questions) => {
    const q = dataList[index];
    setCurrentQuestion(q);
    setCurrentQIndex(index);
    setQuestionTime(q.duration);
    
    // Reset or Load Match Pairs if applicable
    if (q.questionType === "MATCH_FOLLOWING") {
      setUserMatchPairs(userAnswers[q.questionId] || []);
    }

    if (questionStatuses[q.questionId] === 'not_visited') {
      setQuestionStatuses(prev => ({ ...prev, [q.questionId]: 'not_answered' }));
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

  /* ================= IMPROVED MCQ SELECTION LOGIC ================= */
const handleOptionClick = (val) => {
  const qId = currentQuestion.questionId;
  const isMultiple = currentQuestion.allowMultipleAnswers;

  if (currentQuestion.questionType === "MCQ" && isMultiple) {
    // Get current selection or initialize as empty array
    const currentSelections = Array.isArray(userAnswers[qId]) ? userAnswers[qId] : [];
    
    // Toggle the selection: remove if exists, add if not
    const updatedSelections = currentSelections.includes(val)
      ? currentSelections.filter((item) => item !== val)
      : [...currentSelections, val];

    setUserAnswers((prev) => ({ 
      ...prev, 
      [qId]: updatedSelections 
    }));
  } else {
    // Standard single-select behavior for TRUE_FALSE, NUMERICAL, or single-MCQ
    setUserAnswers((prev) => ({ 
      ...prev, 
      [qId]: val 
    }));
  }
};
  const renderOptions = () => {
    if (!currentQuestion) return null;
    const { questionType, options, questionId } = currentQuestion;
    const selected = userAnswers[questionId];

    switch (questionType) {
      /* ================= UPDATED MCQ RENDER BLOCK ================= */
// Inside the renderOptions switch statement:
case "MCQ":
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Object.entries(currentQuestion.options).map(([key, value]) => {
        const selected = userAnswers[currentQuestion.questionId];
        // Check if this specific key is active
        const isSelected = Array.isArray(selected) 
          ? selected.includes(key) 
          : selected === key;

        return (
          <button
            key={key}
            onClick={() => handleOptionClick(key)}
            className={`p-5 rounded-2xl border-2 text-left transition-all flex items-center gap-4 ${
              isSelected
                ? "border-[#1b8599] bg-[#1b8599]/5 shadow-md scale-[1.01]"
                : "border-slate-100 hover:border-slate-200"
            }`}
          >
            {/* Checkbox style for Multiple, Radio style for Single */}
            <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center font-bold transition-colors ${
              isSelected
                ? "bg-[#1b8599] text-white border-[#1b8599]"
                : "text-slate-400 border-slate-200"
            }`}>
              {currentQuestion.allowMultipleAnswers && isSelected ? "✓" : key}
            </div>
            <span className={`font-semibold ${isSelected ? "text-[#1b8599]" : "text-slate-700"}`}>
              {value}
            </span>
          </button>
        );
      })}
    </div>
  );
      case "TRUE_FALSE":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(options).map(([key, value]) => (
              <button
                key={key}
                onClick={() => handleOptionClick(key)}
                className={`p-5 rounded-2xl border-2 text-left transition-all flex items-center gap-4 ${
                  (Array.isArray(selected) ? selected.includes(key) : selected === key)
                  ? "border-[#1b8599] bg-[#1b8599]/5 shadow-sm"
                  : "border-slate-100 hover:border-slate-200"
                }`}
              >
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold ${
                  (Array.isArray(selected) ? selected.includes(key) : selected === key)
                  ? "bg-[#1b8599] text-white border-[#1b8599]"
                  : "text-slate-400 border-slate-200"
                }`}>{key}</div>
                <span className="font-semibold text-slate-700">{value}</span>
              </button>
            ))}
          </div>
        );

      case "NUMERICAL":
      case "SHORT_ANSWER":
        return (
          <div className="max-w-md mx-auto md:mx-0">
            <input
              type={questionType === "NUMERICAL" ? "number" : "text"}
              value={selected || ""}
              onChange={(e) => handleOptionClick(e.target.value)}
              className="w-full p-5 rounded-2xl border-2 border-slate-100 focus:border-[#1b8599] outline-none text-xl font-bold text-slate-700 transition-all"
              placeholder="Type your answer here..."
            />
          </div>
        );

      case "MATCH_FOLLOWING":
        return (
          <div className="space-y-6">
             <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                   <p className="text-[10px] font-black uppercase text-slate-400">Column A</p>
                   {options.left.map((item, i) => (
                     <div key={i} className="p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-700 flex justify-between items-center">
                        {item}
                        <button onClick={() => {
                           const right = prompt(`Match "${item}" with (index 0-${options.right.length-1}):`);
                           if(right !== null) {
                             const newPairs = [...userMatchPairs.filter(p => p.left !== i), {left: i, right: parseInt(right)}];
                             setUserMatchPairs(newPairs);
                             setUserAnswers(prev => ({...prev, [questionId]: newPairs}));
                           }
                        }} className="text-[10px] bg-[#1b8599] text-white px-2 py-1 rounded">Link</button>
                     </div>
                   ))}
                </div>
                <div className="space-y-3">
                   <p className="text-[10px] font-black uppercase text-slate-400">Column B</p>
                   {options.right.map((item, i) => (
                     <div key={i} className="p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-700">
                        <span className="text-[#1b8599] mr-2">({i})</span> {item}
                     </div>
                   ))}
                </div>
             </div>
             {userMatchPairs.length > 0 && (
               <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex flex-wrap gap-3">
                  {userMatchPairs.map((p, i) => (
                    <span key={i} className="bg-white px-3 py-1 rounded-full text-xs font-bold text-emerald-700 shadow-sm border border-emerald-100 flex items-center gap-2">
                      {options.left[p.left]} → {options.right[p.right]}
                      <X size={12} className="cursor-pointer" onClick={() => {
                        const filtered = userMatchPairs.filter((_, idx) => idx !== i);
                        setUserMatchPairs(filtered);
                        setUserAnswers(prev => ({...prev, [questionId]: filtered}));
                      }}/>
                    </span>
                  ))}
               </div>
             )}
          </div>
        );
      default: return null;
    }
  };

  /* ================= EXAM ACTIONS ================= */
  const saveAndNext = () => {
    const qId = currentQuestion.questionId;
    if (userAnswers[qId]) {
      setQuestionStatuses(prev => ({ ...prev, [qId]: 'answered' }));
    }
    if (currentQIndex < questions.length - 1) {
      loadQuestion(currentQIndex + 1);
    }
  };

  const markForReview = () => {
    setQuestionStatuses(prev => ({ ...prev, [currentQuestion.questionId]: 'marked' }));
    saveAndNext();
  };

  const handleSubmitFinal = () => {
    // await submitAnswer(userAnswers); // Logic for later
    if (confirm("Are you sure you want to end the test?")) {
      navigate(`/afterQuizAnalytics/${quizId}`);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#1b8599]" size={40}/></div>;

  return (
    <div className="h-screen w-full bg-slate-100 flex flex-col overflow-hidden select-none">
      {/* HEADER */}
      <header className="bg-[#1b8599] text-white px-6 py-4 flex justify-between items-center z-20">
        <div className="flex items-center gap-4">
          <h1 className="font-black uppercase tracking-tighter text-xl">QuizIt Live</h1>
          <div className="h-6 w-px bg-white/20" />
          <span className="text-sm font-bold opacity-80">{quizId || "Assessment Portal"}</span>
        </div>
        <div className="flex items-center gap-8">
          <div className="text-right">
            <p className="text-[9px] font-black uppercase opacity-60 leading-none mb-1">Total Remaining</p>
            <p className="text-xl font-mono font-black text-orange-300">{formatTime(globalTime)}</p>
          </div>
          <button onClick={() => document.documentElement.requestFullscreen()} className="p-2 hover:bg-white/10 rounded-full"><Maximize size={20}/></button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* MAIN AREA */}
        <main className="flex-1 flex flex-col bg-white overflow-y-auto p-6 md:p-12">
          <div className="max-w-4xl w-full mx-auto flex flex-col h-full">
            <div className="flex justify-between items-center mb-8 border-b pb-4">
              <div className="flex items-center gap-4">
                <span className="bg-slate-900 text-white px-4 py-1 rounded-lg font-black text-sm">Question {currentQIndex + 1}</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{currentQuestion.questionType.replace('_', ' ')}</span>
              </div>
              <div className={`flex items-center gap-2 font-mono font-bold ${questionTime < 10 ? 'text-red-500 animate-bounce' : 'text-slate-500'}`}>
                <Timer size={18}/> {formatTime(questionTime)}
              </div>
            </div>

            <div className="flex-1 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800 leading-tight">{currentQuestion.content}</h2>
              
              {currentQuestion.imageUrl && (
                <div className="rounded-2xl overflow-hidden border border-slate-100 max-w-lg">
                   <img src={currentQuestion.imageUrl} alt="Context" className="w-full h-auto object-cover"/>
                </div>
              )}

              <div className="mt-10">{renderOptions()}</div>
            </div>

            <footer className="mt-12 pt-8 border-t flex flex-wrap gap-4 justify-between">
              <div className="flex gap-3">
                <button onClick={() => currentQIndex > 0 && loadQuestion(currentQIndex - 1)} className="px-6 py-3 rounded-xl border-2 border-slate-100 font-bold text-slate-500 hover:bg-slate-50 transition-all flex items-center gap-2"><ChevronLeft size={18}/> Previous</button>
                <button onClick={markForReview} className="px-6 py-3 rounded-xl border-2 border-orange-100 bg-orange-50 text-orange-600 font-bold hover:bg-orange-100 transition-all">Mark for Review</button>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setUserAnswers(prev => ({...prev, [currentQuestion.questionId]: null}))} className="px-6 py-3 rounded-xl font-bold text-slate-400 hover:text-slate-600">Clear</button>
                <button onClick={saveAndNext} className="px-8 py-3 rounded-xl bg-[#1b8599] text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-[#1b8599]/20 hover:bg-[#166d7d] transition-all flex items-center gap-2">Save & Next <ChevronRight size={18}/></button>
              </div>
            </footer>
          </div>
        </main>

        {/* SIDEBAR PALETTE */}
        <aside className={`${isSidebarOpen ? 'w-80' : 'w-0'} bg-slate-50 border-l transition-all duration-300 overflow-hidden flex flex-col`}>
          <div className="p-6 bg-white border-b">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-[#1b8599]"><User size={24}/></div>
              <div className="flex-1 truncate">
                <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Candidate</p>
                <h3 className="font-black text-slate-800 truncate">{participant?.name || "Parth"}</h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase">{participant?.enrollmentId || "Student"}</p>
              </div>
            </div>
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Question Palette</h4>
            <div className="grid grid-cols-5 gap-3">
              {questions.map((q, idx) => {
                const status = questionStatuses[q.questionId];
                const isActive = currentQIndex === idx;
                let bg = "bg-slate-200 text-slate-400";
                if(status === 'answered') bg = "bg-emerald-500 text-white";
                if(status === 'marked') bg = "bg-orange-400 text-white";
                if(status === 'not_answered') bg = "bg-red-500 text-white";

                return (
                  <button key={q.questionId} onClick={() => loadQuestion(idx)} className={`h-10 w-10 rounded-lg text-xs font-black transition-all ${bg} ${isActive ? 'ring-2 ring-[#1b8599] ring-offset-2' : ''}`}>
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-6 bg-white border-t space-y-4">
             <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 text-[8px] font-black uppercase text-slate-400"><div className="w-2 h-2 bg-emerald-500 rounded-full"/> Answered</div>
                <div className="flex items-center gap-2 text-[8px] font-black uppercase text-slate-400"><div className="w-2 h-2 bg-red-500 rounded-full"/> Not Answered</div>
             </div>
             <button onClick={handleSubmitFinal} className="w-full bg-slate-900 text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-slate-800 transition-all">Submit Test <Send size={14}/></button>
          </div>
        </aside>
      </div>
    </div>
  );
}