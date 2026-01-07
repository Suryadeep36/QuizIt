import { useState, useEffect } from "react";
import { Zap, Timer, CheckCircle2, Trophy, XCircle, Users, Flame } from "lucide-react";

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
  {
    id: 3,
    text: "Which of these are styling solutions for React?",
    type: "MULTIPLE_CHOICE",
    options: ["Tailwind", "Sass", "Cinnabon", "Styled Components"],
    correctAnswer: [0, 1, 3],
  },
];

export default function ParticipantLiveQuiz() {
  const [stage, setStage] = useState("question");
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [timer, setTimer] = useState(15);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);

  const currentQuestion = DUMMY_QUESTIONS[currentQIndex];
  const TOTAL_TIME = 15;

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
    // Allows changing answer until timer hits 0
    if (stage === "question" && timer > 0) {
      setSelectedOption(index);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-[#4a9cb0] via-[#5fb4c7] to-[#4a9cb0] text-slate-800 font-sans selection:bg-white/30 overflow-x-hidden">
      
      {/* Header - Matches Host Style */}
      <header className="border-b border-white/20 bg-white/10 backdrop-blur-md px-4 md:px-8 py-4 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-[#f5a65b] to-[#f59843] rounded-lg shadow-md">
              <Zap className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-white leading-none">Quizlt Live</h1>
              <p className="text-[10px] text-white/70 uppercase tracking-widest mt-1 hidden xs:block">Participant Mode</p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-xl border border-white/30 text-white">
              <Flame className="w-4 h-4 text-orange-300 fill-orange-300" />
              <span className="font-bold text-sm">3</span>
            </div>
            <div className="bg-white px-4 py-1.5 rounded-xl text-[#4a9cb0] text-sm font-bold shadow-md">
              {score} pts
            </div>
          </div>
        </div>
      </header>

      {/* Responsive Timer Bar */}
      {stage === "question" && (
        <div className="h-1.5 w-full bg-black/10">
          <div 
            className="h-full bg-white transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(255,255,255,0.5)]"
            style={{ width: `${(timer / TOTAL_TIME) * 100}%` }}
          />
        </div>
      )}

      <main className="flex-1 flex flex-col items-center p-4 md:p-8 w-full max-w-4xl mx-auto">
        {stage === "question" && (
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Question Info Header */}
            <div className="flex justify-between items-center mb-6">
              <span className="bg-white/20 text-white text-[10px] md:text-xs uppercase tracking-widest px-3 py-1 rounded-full border border-white/20 font-bold">
                {currentQuestion.type.replace("_", " ")}
              </span>
              <div className={`flex items-center gap-2 font-mono font-bold text-xl md:text-2xl ${timer < 5 ? 'text-red-500 animate-bounce' : 'text-white'}`}>
                <Timer className="w-5 h-5 md:w-6 md:h-6" />
                {timer}s
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/30 rounded-[2rem] p-6 md:p-12 mb-8 shadow-xl text-center">
              <h2 className="text-2xl md:text-4xl font-bold text-white leading-tight">
                {currentQuestion.text}
              </h2>
            </div>

            {/* Options Grid - 1 Col Mobile, 2 Col Desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 w-full">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleOptionClick(index)}
                  className={`
                    w-full p-5 md:p-6 rounded-2xl text-left transition-all duration-200 border-2 flex justify-between items-center active:scale-95
                    ${selectedOption === index 
                      ? "bg-white border-white text-[#4a9cb0] shadow-2xl scale-[1.02]" 
                      : "bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/40"}
                  `}
                >
                  <span className="text-lg md:text-xl font-bold">{option}</span>
                  <div className={`h-6 w-6 md:h-7 md:w-7 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedOption === index ? "bg-[#4a9cb0] border-[#4a9cb0]" : "border-white/30"
                  }`}>
                    {selectedOption === index && <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-white" />}
                  </div>
                </button>
              ))}
            </div>
            
            <p className="text-center text-white/60 text-sm mt-8 italic font-medium">
              You can change your selection until the clock runs out!
            </p>
          </div>
        )}

        {stage === "reveal" && (
          <div className="w-full max-w-lg flex flex-col items-center animate-in zoom-in duration-300 mt-10 md:mt-20">
            <div className="bg-white/95 backdrop-blur-lg rounded-[2.5rem] p-8 md:p-12 shadow-2xl w-full text-center border border-white">
              {selectedOption === currentQuestion.correctAnswer ? (
                <>
                  <div className="bg-emerald-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-12">
                    <Trophy className="w-12 h-12 text-emerald-600" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">CORRECT!</h2>
                  <p className="text-emerald-600 font-bold text-xl mt-2">+100 Points</p>
                </>
              ) : (
                <>
                  <div className="bg-red-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 -rotate-12">
                    <XCircle className="w-12 h-12 text-red-600" />
                  </div>
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight">TIME'S UP</h2>
                  <p className="text-slate-500 mt-4 font-semibold uppercase tracking-widest text-xs">The Correct Answer:</p>
                  <div className="mt-2 p-5 bg-[#4a9cb0]/10 rounded-2xl font-bold text-[#4a9cb0] text-xl border border-[#4a9cb0]/20">
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
                }
              }}
              className="mt-10 bg-white text-[#4a9cb0] px-12 py-4 rounded-2xl font-black text-lg shadow-xl hover:bg-slate-50 hover:scale-105 transition-all w-full md:w-auto"
            >
              CONTINUE
            </button>
          </div>
        )}
      </main>

      {/* Footer / Connection Status */}
      <footer className="p-6 text-center mt-auto">
        <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full shadow-lg">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-white" />
            <span className="text-white text-xs font-bold uppercase tracking-tighter">24 Players</span>
          </div>
          <div className="w-[1px] h-3 bg-white/30" />
          <span className="text-white/80 text-xs font-medium">Session #12345</span>
        </div>
      </footer>
    </div>
  );
}