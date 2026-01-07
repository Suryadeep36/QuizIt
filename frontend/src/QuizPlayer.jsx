import { useEffect, useState } from "react";
import {
  Clock,
  CheckCircle2,
  Wifi,
  WifiOff,
  Loader2,
} from "lucide-react";

export default function RunningQuiz() {
  /* ================= GLOBAL QUIZ INFO ================= */
  const quizMeta = {
    quizName: "Java Basics Quiz",
    totalQuestions: 10,
    participantName: "Parth",
  };

  /* ================= STATES ================= */
  const [connected, setConnected] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(1);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [status, setStatus] = useState("WAITING");
  // WAITING | LIVE | SUBMITTED | ENDED

  /* ================= DUMMY SERVER FLOW ================= */
  useEffect(() => {
    setTimeout(() => {
      startQuestion({
        questionId: "q1",
        content: "What is Java?",
        duration: 20,
        options: {
          A: "Programming language",
          B: "Database",
          C: "Operating system",
          D: "Browser",
        },
      });
    }, 1500);

    setTimeout(() => {
      setQuestionIndex(2);
      startQuestion({
        questionId: "q2",
        content: "Which keyword is used to inherit a class?",
        duration: 20,
        options: {
          A: "this",
          B: "super",
          C: "extends",
          D: "implements",
        },
      });
    }, 26000);
  }, []);

  const startQuestion = (question) => {
    setCurrentQuestion(question);
    setTimeLeft(question.duration);
    setSelectedAnswer(null);
    setSubmitted(false);
    setStatus("LIVE");
  };

  /* ================= TIMER ================= */
  useEffect(() => {
    if (status !== "LIVE") return;

    if (timeLeft === 0) {
      setStatus("ENDED");
      return;
    }

    const t = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, status]);

  /* ================= SUBMIT ================= */
  const submitAnswer = (key) => {
    if (submitted || status !== "LIVE") return;

    setSelectedAnswer(key);
    setSubmitted(true);
    setStatus("SUBMITTED");

    console.log("Answer sent:", {
      questionId: currentQuestion.questionId,
      answer: key,
    });
  };

  /* ================= SCREENS ================= */
  if (!connected) return <DisconnectedScreen />;
  if (!currentQuestion) return <WaitingScreen quizName={quizMeta.quizName} />;

  /* ================= MAIN UI ================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4a9cb0] to-[#5fb4c7] flex items-center justify-center p-4">

{/* TOP BAR */}
      {/* <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs opacity-70">Score</p>
              <p className="text-xl font-bold">{55}</p>
            </div>
            <div>
              <p className="text-xs opacity-70">Rank</p>
              <p className="text-xl font-bold">#{2}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
            {22} playing
          </div>
        </div>
      </header> */}

      <div className="bg-white w-full max-w-xl rounded-[2rem] shadow-2xl p-6 md:p-8">

        {/* TOP BAR */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {quizMeta.quizName}
            </h2>
            <p className="text-xs text-slate-500">
              Question {questionIndex} of {quizMeta.totalQuestions}
            </p>
          </div>

          <div className="flex items-center gap-2 text-green-600 text-sm font-bold">
            <Wifi className="w-4 h-4" />
            LIVE
          </div>
        </div>

        {/* TIMER */}
        <div className="mb-5">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Time left</span>
            <span>{timeLeft}s</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#4a9cb0] transition-all"
              style={{
                width: `${(timeLeft / currentQuestion.duration) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* QUESTION */}
        <h1 className="text-xl md:text-2xl font-bold mb-6 text-slate-800">
          {currentQuestion.content}
        </h1>

        {/* OPTIONS */}
        <div className="grid gap-4">
          {Object.entries(currentQuestion.options).map(([key, value]) => (
            <button
              key={key}
              onClick={() => submitAnswer(key)}
              disabled={submitted || status === "ENDED"}
              className={`flex items-center gap-4 p-4 rounded-2xl border transition
                ${
                  selectedAnswer === key
                    ? "bg-[#4a9cb0] text-white border-[#4a9cb0]"
                    : "bg-slate-100 hover:bg-slate-200 border-slate-200"
                }
              `}
            >
              <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold">
                {key}
              </div>
              <span>{value}</span>

              {selectedAnswer === key && (
                <CheckCircle2 className="w-5 h-5 ml-auto" />
              )}
            </button>
          ))}
        </div>

        {/* FOOTER */}
        <div className="mt-6 text-center text-sm font-bold">
          {status === "SUBMITTED" && (
            <span className="text-green-600">
              ✔ Response submitted — waiting for next question
            </span>
          )}
          {status === "ENDED" && (
            <span className="text-orange-500">
              ⏰ Time’s up — waiting for host
            </span>
          )}
        </div>

        {/* PARTICIPANT */}
        <div className="mt-4 text-center text-xs text-slate-400">
          Answering as <span className="font-bold">{quizMeta.participantName}</span>
        </div>
      </div>
    </div>
  );
}

/* ================= EXTRA SCREENS ================= */

function WaitingScreen({ quizName }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4a9cb0] to-[#5fb4c7] flex items-center justify-center">
      <div className="text-white text-center">
        <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-bold">{quizName}</h2>
        <p className="mt-1 opacity-80">
          Waiting for host to start…
        </p>
      </div>
    </div>
  );
}

function DisconnectedScreen() {
  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center">
      <div className="text-center">
        <WifiOff className="w-10 h-10 text-red-500 mx-auto mb-4" />
        <p className="text-lg font-bold text-red-600">
          Connection lost
        </p>
        <p className="text-sm text-red-400">
          Reconnecting to live quiz…
        </p>
      </div>
    </div>
  );
}
