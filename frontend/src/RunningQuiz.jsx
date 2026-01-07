import { useEffect, useState } from "react";
import {
  Clock,
  CheckCircle2,
  WifiOff,
  Loader2,
} from "lucide-react";

/* ================= DUMMY SERVER EVENTS ================= */
const mockServer = {
  listeners: {},
  emit(event, payload) {
    console.log("📤 emit:", event, payload);
  },
  on(event, cb) {
    this.listeners[event] = cb;
  },
  trigger(event, data) {
    this.listeners[event]?.(data);
  },
};

export default function RunningQuiz() {
  /* ---------------- STATES ---------------- */
  const [connected, setConnected] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [status, setStatus] = useState("WAITING"); 
  // WAITING | LIVE | SUBMITTED | ENDED

  /* ---------------- SIMULATED SERVER FLOW ---------------- */
  useEffect(() => {
    // question arrives
    setTimeout(() => {
      mockServer.trigger("question-start", {
        questionId: "q1",
        content: "What is JavaScript?",
        questionType: "MCQ",
        duration: 15,
        options: {
          A: "Compiled language",
          B: "Interpreted language",
          C: "Markup language",
          D: "Database",
        },
      });
    }, 1500);

    // question changes
    setTimeout(() => {
      mockServer.trigger("question-start", {
        questionId: "q2",
        content: "Which data structure follows FIFO?",
        questionType: "MCQ",
        duration: 15,
        options: {
          A: "Stack",
          B: "Queue",
          C: "Tree",
          D: "Graph",
        },
      });
    }, 20000);
  }, []);

  /* ---------------- SERVER LISTENERS ---------------- */
  useEffect(() => {
    mockServer.on("question-start", (question) => {
      setCurrentQuestion(question);
      setTimeLeft(question.duration);
      setSelectedAnswer(null);
      setSubmitted(false);
      setStatus("LIVE");
    });
  }, []);

  /* ---------------- TIMER UI ---------------- */
  useEffect(() => {
    if (status !== "LIVE") return;

    if (timeLeft <= 0) {
      setStatus("ENDED");
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, status]);

  /* ---------------- SUBMIT ANSWER ---------------- */
  const submitAnswer = (answer) => {
    if (submitted || status !== "LIVE") return;

    setSelectedAnswer(answer);
    setSubmitted(true);
    setStatus("SUBMITTED");

    mockServer.emit("submit-answer", {
      questionId: currentQuestion.questionId,
      answer,
    });
  };

  /* ---------------- UI STATES ---------------- */
  if (!connected) {
    return (
      <DisconnectedScreen />
    );
  }

  if (!currentQuestion) {
    return <WaitingScreen />;
  }

  /* ---------------- MAIN UI ---------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4a9cb0] to-[#5fb4c7] flex items-center justify-center p-4">

      <div className="bg-white w-full max-w-xl rounded-[2rem] shadow-2xl p-8">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <span className="text-xs font-bold tracking-widest text-[#4a9cb0] uppercase">
            Live Question
          </span>

          <div className="flex items-center gap-2 text-slate-600">
            <Clock className="w-4 h-4" />
            {timeLeft}s
          </div>
        </div>

        {/* TIMER BAR */}
        <div className="w-full h-2 bg-slate-200 rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-[#4a9cb0] transition-all"
            style={{
              width: `${(timeLeft / currentQuestion.duration) * 100}%`,
            }}
          />
        </div>

        {/* QUESTION */}
        <h1 className="text-2xl font-bold mb-6 text-slate-800">
          {currentQuestion.content}
        </h1>

        {/* OPTIONS */}
        <div className="grid gap-4">
          {Object.entries(currentQuestion.options).map(([key, value]) => (
            <button
              key={key}
              onClick={() => submitAnswer(key)}
              disabled={submitted || status === "ENDED"}
              className={`p-4 rounded-2xl border flex items-center gap-4 transition
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

        {/* FOOTER STATUS */}
        <div className="mt-6 text-center font-bold text-sm">
          {status === "SUBMITTED" && (
            <span className="text-green-600">
              Answer submitted ✔ Waiting for next question
            </span>
          )}

          {status === "ENDED" && (
            <span className="text-orange-500">
              Time up ⏰ Waiting for host
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= EXTRA UI SCREENS ================= */

function WaitingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4a9cb0] to-[#5fb4c7] flex items-center justify-center">
      <div className="text-white text-center">
        <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4" />
        <p className="font-bold text-xl">
          Waiting for host to start quiz…
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
          Trying to reconnect…
        </p>
      </div>
    </div>
  );
}
