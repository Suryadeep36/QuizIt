import { useState, useEffect } from "react";
import { Zap, Users, Share2, Play, Settings, ChevronRight } from "lucide-react";
import ParticipantsList from "./Components/ParticipantsList";

import QuestionDisplay from "./Components/QuestionDisplay";
import QuestionSidebar from "./Components/QuestionSidebar";
import LiveIndicator from "./Components/LiveIndicator";
import ResponseStats from "./Components/ResponseStats";

export default function HostLiveQuiz() {
  const [stage, setStage] = useState("waiting");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timer, setTimer] = useState(30);
  const [isPaused, setIsPaused] = useState(false);
  const [participants, setParticipants] = useState([
    { id: 1, name: "Jay", score: 0, answered: false, correct: false },
    { id: 2, name: "Ravi", score: 0, answered: false, correct: false },
    { id: 3, name: "Sneha", score: 0, answered: false, correct: false },
    { id: 4, name: "Priya", score: 0, answered: false, correct: false },
  ]);

  const questions = [
    {
      id: 1,
      text: "Is Suryadeep smart?",
      type: "TRUE_FALSE",
      options: ["True", "False"],
      correctAnswer: 0,
      responses: { 0: 3, 1: 1 },
    },
    {
      id: 2,
      text: "What is JavaScript?",
      type: "MCQ",
      options: ["Language", "Framework", "Library", "Compiler"],
      correctAnswer: 0,
      responses: { 0: 2, 1: 1, 2: 1, 3: 0 },
    },
    {
      id: 3,
      text: "Which framework is this quiz built with?",
      type: "MCQ",
      options: ["React", "Vue", "Angular", "Svelte"],
      correctAnswer: 0,
      responses: { 0: 4, 1: 0, 2: 0, 3: 0 },
    },
  ];

  useEffect(() => {
    let interval;
    if (stage === "question" && !isPaused) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setStage("reveal");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [stage, isPaused]);

  const startQuiz = () => {
    setStage("question");
    setTimer(30);
    setParticipants((prev) =>
      prev.map((p) => ({ ...p, answered: false, correct: false }))
    );
  };

  const nextQuestion = () => {
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setTimer(30);
      setStage("question");
      setParticipants((prev) =>
        prev.map((p) => ({ ...p, answered: false, correct: false }))
      );
    } else {
      setStage("leaderboard");
    }
  };

  const revealAnswer = () => {
    setStage("reveal");
  };

  const answeredCount = participants.filter((p) => p.answered).length;
  const progressPercent = (answeredCount / participants.length) * 100;

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-[#020617] via-[#0A1124] to-[#020617] text-white overflow-hidden">
      {/* Header */}
      <header className="border-b bg-[#0B122A]/40 border-[#2969FF]/20 backdrop-blur-sm px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <span>Quizlt</span>
                <ChevronRight className="w-4 h-4" />
                <span>Quiz Name</span>
              </div>
              <h1 className="text-2xl font-bold">Live Quiz Host</h1>
              <p className="text-xs text-slate-400">
                Question {currentQuestion + 1} of {questions.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <LiveIndicator
              isLive={stage === "question"}
              participantCount={participants.length}
            />
            <button className="flex items-center gap-2 bg-[#2969FF]/20 hover:bg-[#2969FF]/30 border border-[#2969FF]/50 text-[#7BB0FF] px-4 py-2 rounded-lg transition-all text-sm font-medium">
              <Share2 className="w-4 h-4" />
              Share Link
            </button>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-all">
              <Settings className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex gap-6 p-8 overflow-hidden">
        {/* Left Sidebar - Questions Navigation */}
        <QuestionSidebar
          questions={questions}
          currentQuestion={currentQuestion}
          stage={stage}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col gap-6 min-w-0">
          {stage === "waiting" && (
            <div className="flex-1 flex flex-col items-center justify-center gap-8">
              <div className="text-center mb-4">
                <h2 className="text-4xl font-bold mb-3">Ready to Start?</h2>
                <p className="text-lg text-slate-400">
                  Waiting for participants to join your quiz
                </p>
              </div>

              <ParticipantsList participants={participants} maxShow={6} />

              <button
                onClick={startQuiz}
                className="group relative px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold text-lg rounded-xl transition-all duration-300 shadow-lg hover:shadow-cyan-500/50 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Start Quiz
                </span>
              </button>
            </div>
          )}

          {stage === "question" && (
            <>
              <QuestionDisplay
                question={questions[currentQuestion]}
                timer={timer}
                isPaused={isPaused}
                onPauseToggle={() => setIsPaused(!isPaused)}
                onReveal={revealAnswer}
              />

              <div className="grid grid-cols-2 gap-6">
                <ResponseStats
                  question={questions[currentQuestion]}
                  answeredCount={answeredCount}
                  totalParticipants={participants.length}
                  progressPercent={progressPercent}
                />

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Response Progress
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-400">Answered</span>
                        <span className="font-semibold">
                          {answeredCount}/{participants.length}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-xs text-slate-400 mt-4 pt-4 border-t border-slate-700">
                      <p>
                        Waiting for {participants.length - answeredCount}{" "}
                        participants
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {stage === "reveal" && (
            <>
              <div className="flex-1 flex flex-col items-center justify-center gap-8 py-8">
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-6">Correct Answer</h2>
                  <div className="inline-block bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border border-emerald-500/50 backdrop-blur-xl px-8 py-6 rounded-2xl">
                    <p className="text-3xl font-bold text-emerald-300">
                      {
                        questions[currentQuestion].options[
                          questions[currentQuestion].correctAnswer
                        ]
                      }
                    </p>
                  </div>
                </div>

                <ResponseStats
                  question={questions[currentQuestion]}
                  answeredCount={participants.length}
                  totalParticipants={participants.length}
                  progressPercent={100}
                  showResults={true}
                />
              </div>

              <button
                onClick={nextQuestion}
                className="group relative px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold text-lg rounded-xl transition-all duration-300 shadow-lg hover:shadow-cyan-500/50 w-full"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {currentQuestion + 1 === questions.length
                    ? "View Leaderboard"
                    : "Next Question"}
                </span>
              </button>
            </>
          )}

          {stage === "leaderboard" && (
            <div className="flex-1 flex flex-col items-center justify-center gap-8">
              <div className="text-center mb-4">
                <h2 className="text-4xl font-bold mb-2">
                  🏆 Final Leaderboard
                </h2>
                <p className="text-slate-400">Quiz Completed!</p>
              </div>

              <div className="w-full max-w-2xl overflow-y-auto space-y-3">
                {[...participants]
                  .sort((a, b) => b.score - a.score)
                  .map((p, i) => (
                    <div
                      key={p.id}
                      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 flex items-center justify-between hover:border-cyan-500/50 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-2xl font-bold text-cyan-400 w-8 text-center">
                          {i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}
                        </div>
                        <div>
                          <p className="font-semibold">{p.name}</p>
                          <p className="text-xs text-slate-400">
                            Position #{i + 1}
                          </p>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-cyan-300">
                        {45 - i * 8} pts
                      </div>
                    </div>
                  ))}
              </div>

              <button
                onClick={() => {
                  setStage("waiting");
                  setCurrentQuestion(0);
                  setTimer(30);
                }}
                className="group relative px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold text-lg rounded-xl transition-all duration-300 shadow-lg hover:shadow-cyan-500/50"
              >
                Start New Quiz
              </button>
            </div>
          )}
        </div>

        {/* Right Sidebar - Live Participants */}
        {stage !== "waiting" && (
          <div className="w-72 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col">
            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Live Participants
            </h3>
            <div className="flex-1 overflow-y-auto space-y-2 overflow-y-auto">
              {participants.map((p) => (
                <div
                  key={p.id}
                  className={`p-3 rounded-lg transition-all backdrop-blur-sm ${
                    p.answered
                      ? "bg-emerald-500/20 border border-emerald-500/50"
                      : "bg-white/5 border border-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{p.name}</span>
                    {p.answered && (
                      <span className="text-xs font-semibold text-emerald-300">
                        ✓ Answered
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
