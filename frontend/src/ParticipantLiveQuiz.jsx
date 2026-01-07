import { useState, useEffect } from "react";
import { 
  Zap, Timer, CheckCircle2, Trophy, XCircle, 
  Flame, Users, Wifi, WifiOff, Loader2 
} from "lucide-react";

const DUMMY_QUESTIONS = [
  {
    id: 1,
    text: "Which hook is used for side effects in React?",
    type: "MCQ",
    options: ["useState", "useEffect", "useContext", "useReducer"],
    correctAnswer: 1,
  },
  {
    id: 2,
    text: "React is a framework, not a library.",
    type: "TRUE_FALSE",
    options: ["True", "False"],
    correctAnswer: 1,
  },
];

export default function ParticipantLiveQuiz() {
  /* ================= STATES ================= */
  const [stage, setStage] = useState("waiting"); // waiting | question | reveal
  const [connected, setConnected] = useState(true);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [timer, setTimer] = useState(15);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(1250);

  const currentQuestion = DUMMY_QUESTIONS[currentQIndex];
  const TOTAL_TIME = 15;

  /* ================= DUMMY FLOW LOGIC ================= */
  useEffect(() => {
    // Simulate host starting the quiz after 3 seconds
    const startTimeout = setTimeout(() => {
      setStage("question");
    }, 3000);
    return () => clearTimeout(startTimeout);
  }, []);

  useEffect(() => {
    let interval;
    if (stage === "question" && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    } else if (timer === 0 && stage === "question") {
      setStage("reveal");
    }
    return () => clearInterval(interval);
  }, [stage, timer]);

  const handleOptionClick = (index) => {
    if (stage === "question" && timer > 0) {
      setSelectedOption(index);
      setIsSubmitted(true); // From your logic: marks as submitted but allows changes
    }
  };

  /* ================= CONDITIONAL SCREENS ================= */
  if (!connected) return <DisconnectedScreen />;
  if (stage === "waiting") return <WaitingScreen quizName="Java Basics Quiz" />;

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-[#4a9cb0] via-[#5fb4c7] to-[#4a9cb0] text-slate-800 font-sans selection:bg-white/30 overflow-x-hidden">
      
      {/* HEADER */}
      <header className="border-b border-white/20 bg-white/10 backdrop-blur-md px-4 md:px-8 py-4 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-[#f5a65b] to-[#f59843] rounded-lg shadow-md">
              <Zap className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-white leading-none">Quizlt Live</h1>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                <span className="text-[10px] text-white/80 font-bold uppercase tracking-widest">Live Connection</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
             <div className="hidden xs:flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-xl border border-white/30 text-white">
              <Flame className="w-4 h-4 text-orange-300 fill-orange-300" />
              <span className="font-bold text-sm">3</span>
            </div>
            <div className="bg-white px-4 py-1.5 rounded-xl text-[#4a9cb0] text-sm font-bold shadow-md">
              {score} pts
            </div>
          </div>
        </div>
      </header>

      {/* PROGRESS TIMER BAR */}
      {stage === "question" && (
        <div className="h-1.5 w-full bg-black/10">
          <div 
            className={`h-full transition-all duration-1000 ease-linear ${timer < 5 ? 'bg-red-400' : 'bg-white'}`}
            style={{ width: `${(timer / TOTAL_TIME) * 100}%` }}
          />
        </div>
      )}

      <main className="flex-1 flex flex-col items-center p-4 md:p-8 w-full max-w-4xl mx-auto">
        {stage === "question" && (
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <div className="flex justify-between items-center mb-6">
              <span className="bg-white/20 text-white text-[10px] md:text-xs uppercase tracking-widest px-3 py-1 rounded-full border border-white/20 font-bold">
                Question {currentQIndex + 1} of {DUMMY_QUESTIONS.length}
              </span>
              <div className={`flex items-center gap-2 font-mono font-bold text-xl md:text-2xl ${timer < 5 ? 'text-red-500 animate-bounce' : 'text-white'}`}>
                <Timer className="w-5 h-5 md:w-6 md:h-6" />
                {timer}s
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/30 rounded-[2rem] p-6 md:p-10 mb-8 shadow-xl text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                {currentQuestion.text}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 w-full">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleOptionClick(index)}
                  className={`
                    w-full p-5 md:p-6 rounded-2xl text-left transition-all duration-200 border-2 flex justify-between items-center active:scale-95
                    ${selectedOption === index 
                      ? "bg-white border-white text-[#4a9cb0] shadow-2xl scale-[1.02]" 
                      : "bg-white/10 border-white/20 text-white hover:bg-white/20"}
                  `}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold ${selectedOption === index ? "border-[#4a9cb0] bg-[#4a9cb0]/10" : "border-white/30"}`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="text-lg font-bold">{option}</span>
                  </div>
                  {selectedOption === index && <CheckCircle2 className="w-6 h-6 text-[#4a9cb0]" />}
                </button>
              ))}
            </div>

            <div className="mt-8 text-center min-h-[24px]">
                {isSubmitted && timer > 0 && (
                    <p className="text-white font-bold text-sm animate-pulse">
                        ✔ Response recorded! You can still change it.
                    </p>
                )}
            </div>
          </div>
        )}

        {stage === "reveal" && (
          <div className="w-full max-w-lg flex flex-col items-center animate-in zoom-in duration-300 mt-10 md:mt-16">
            <div className="bg-white/95 backdrop-blur-lg rounded-[2.5rem] p-8 md:p-12 shadow-2xl w-full text-center border border-white">
              {selectedOption === currentQuestion.correctAnswer ? (
                <>
                  <div className="bg-emerald-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-12">
                    <Trophy className="w-12 h-12 text-emerald-600" />
                  </div>
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight">EXCELLENT!</h2>
                  <p className="text-emerald-600 font-bold text-xl mt-2">+100 Points</p>
                </>
              ) : (
                <>
                  <div className="bg-red-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 -rotate-12">
                    <XCircle className="w-12 h-12 text-red-600" />
                  </div>
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight">TIME'S UP</h2>
                  <p className="text-slate-500 mt-4 font-semibold uppercase tracking-widest text-xs">Correct Answer:</p>
                  <div className="mt-2 p-4 bg-[#4a9cb0]/10 rounded-2xl font-bold text-[#4a9cb0] text-lg border border-[#4a9cb0]/20">
                    {currentQuestion.options[currentQuestion.correctAnswer]}
                  </div>
                </>
              )}
            </div>

            <button 
              onClick={() => {
                if(currentQIndex + 1 < DUMMY_QUESTIONS.length) {
                   setCurrentQIndex(currentQIndex + 1);
                   setStage("question");
                   setTimer(15);
                   setSelectedOption(null);
                   setIsSubmitted(false);
                }
              }}
              className="mt-8 bg-white text-[#4a9cb0] px-12 py-4 rounded-2xl font-black text-lg shadow-xl hover:scale-105 transition-all w-full md:w-auto"
            >
              NEXT QUESTION
            </button>
          </div>
        )}
      </main>

      {/* FOOTER STATS */}
      <footer className="p-6 mt-auto bg-white/10 backdrop-blur-md border-t border-white/20">
        <div className="max-w-4xl mx-auto flex justify-around items-center">
            <div className="text-center">
                <p className="text-[10px] text-white/60 uppercase font-black">Answering As</p>
                <p className="text-white font-bold">Parth</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
                <p className="text-[10px] text-white/60 uppercase font-black">Live Players</p>
                <div className="flex items-center gap-1.5 justify-center">
                    <Users className="w-3.5 h-3.5 text-white" />
                    <span className="text-white font-bold">22</span>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
}

/* ================= EXTRA SCREENS ================= */

function WaitingScreen({ quizName }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4a9cb0] to-[#5fb4c7] flex items-center justify-center p-6">
      <div className="text-white text-center max-w-sm">
        <div className="relative mb-8">
            <Loader2 className="w-16 h-16 animate-spin mx-auto opacity-20" />
            <Zap className="w-8 h-8 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 fill-current" />
        </div>
        <h2 className="text-2xl font-black tracking-tight mb-2">{quizName}</h2>
        <p className="opacity-80 font-medium">
          The host is getting things ready. <br/> Relax, the quiz will start shortly!
        </p>
      </div>
    </div>
  );
}

function DisconnectedScreen() {
  return (
    <div className="min-h-screen bg-red-500 flex items-center justify-center p-6 text-center">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl max-w-xs w-full">
        <div className="bg-red-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <WifiOff className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-xl font-black text-slate-800">CONNECTION LOST</h2>
        <p className="text-slate-500 text-sm mt-2 mb-6">We're trying to get you back into the game...</p>
        <div className="flex items-center justify-center gap-2 text-red-600 font-bold text-xs animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin" />
            RECONNECTING
        </div>
      </div>
    </div>
  );
}