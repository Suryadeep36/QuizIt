import { useState, useEffect, useRef } from "react";
import { Zap, Users, Share2, Play, Settings, ChevronRight } from "lucide-react";
import ParticipantsList from "./Components/ParticipantsList";

import QuestionDisplay from "./Components/QuestionDisplay";
import QuestionSidebar from "./Components/QuestionSidebar";
import LiveIndicator from "./Components/LiveIndicator";
import ResponseStats from "./Components/ResponseStats";
import { useWS } from "./stores/webSocketStore";
import {
  createQuizSession,
  getQuestionsByQuizId,
} from "./services/AuthService";
import useAuth from "./auth/store";
import { useParams } from "react-router";

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
  const { quizId } = useParams();
  const user = useAuth((state) => state.user);
  const hostId = user.id;
  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([
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
  ]);
  const isQuizSessionCreated = useRef(false);
  const { client } = useWS();

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

  useEffect(() => {
    async function init() {
      const questions = await getQuestionsByQuizId(quizId);
      console.log(questions);
      setQuestions(questions);

      if (!isQuizSessionCreated.current) {
        isQuizSessionCreated.current = true;
        const sessionData = await createQuizSession({ quizId, hostId });
        console.log(sessionData);
        setSessionId(sessionData.sessionId);
      }
    }

    init();
  }, []);

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
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-[#4a9cb0] via-[#5fb4c7] to-[#4a9cb0] text-slate-800 font-sans selection:bg-white/30">
      <header className="border-b border-white/20 bg-white/10 backdrop-blur-md px-8 py-4 shadow-sm sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-[#f5a65b] to-[#f59843] rounded-lg shadow-md">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm text-white/80 mb-1">
                <span className="font-medium">Quizlt</span>
                <ChevronRight className="w-4 h-4" />
                <span className="text-white font-medium">Quiz</span>
              </div>
              <h1 className="text-2xl font-bold text-white">Live Quiz Host</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <LiveIndicator
              isLive={stage === "question"}
              participantCount={participants.length}
            />
            <button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 border border-white/30 text-white px-4 py-2 rounded-lg transition-all text-sm font-medium hover:shadow-md">
              <Share2 className="w-4 h-4" />
              Share Link
            </button>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-all">
              <Settings className="w-5 h-5 text-white/80" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex gap-6 p-8">
        {/* Left Sidebar - Questions Navigation */}
        <QuestionSidebar
          questions={questions}
          currentQuestion={currentQuestion}
          stage={stage}
        />

        {/* Main Content Area - scrollable */}
        <div className="flex-1 flex flex-col gap-6 min-w-0 overflow-y-auto pr-4">
          {stage === "waiting" && (
            <div className="flex-1 flex flex-col items-center justify-center gap-8 py-12">
              <div className="text-center mb-4">
                <h2 className="text-4xl font-bold mb-3 text-white">
                  Ready to Start?
                </h2>
                <p className="text-lg text-white/80">
                  Waiting for participants to join your quiz
                </p>
              </div>

              <ParticipantsList participants={participants} maxShow={6} />

              <button
                onClick={startQuiz}
                className="group relative px-8 py-3 bg-white text-[#4a9cb0] font-bold text-lg rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:bg-gray-50 overflow-hidden"
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

                <div className="bg-slate-50/90 backdrop-blur-sm border border-white/30 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Response Progress
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-600">Answered</span>
                        <span className="font-semibold text-slate-800">
                          {answeredCount}/{participants.length}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#4a9cb0] to-[#f5a65b] rounded-full transition-all duration-500"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-xs text-slate-600 mt-4 pt-4 border-t border-slate-200">
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
              <div className="flex-1 flex flex-col items-center justify-center gap-8 py-12">
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-6 text-white">
                    Correct Answer
                  </h2>
                  <div className="inline-block bg-white border border-white/30 px-8 py-6 rounded-2xl shadow-lg">
                    <p className="text-3xl font-bold text-[#4a9cb0]">
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
                className="group relative px-8 py-3 bg-white text-[#4a9cb0] font-bold text-lg rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:bg-gray-50 w-full"
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
            <div className="flex-1 flex flex-col items-center justify-center gap-8 py-12">
              <div className="text-center mb-4">
                <h2 className="text-4xl font-bold mb-2 text-white">
                  Final Leaderboard
                </h2>
                <p className="text-white/80">Quiz Completed!</p>
              </div>

              <div className="w-full max-w-2xl space-y-3 mb-8">
                {[...participants]
                  .sort((a, b) => b.score - a.score)
                  .map((p, i) => (
                    <div
                      key={p.id}
                      className="bg-slate-50/90 border border-white/30 rounded-xl p-4 flex items-center justify-between hover:border-white/50 transition-all shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-2xl font-bold w-8 text-center">
                          {i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">
                            {p.name}
                          </p>
                          <p className="text-xs text-slate-600">
                            Position #{i + 1}
                          </p>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-[#4a9cb0]">
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
                className="group relative px-8 py-3 bg-white text-[#4a9cb0] font-bold text-lg rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:bg-gray-50"
              >
                Start New Quiz
              </button>
            </div>
          )}
        </div>

        {/* Right Sidebar - Live Participants, sticky and scrollable internally */}
        {stage !== "waiting" && (
          <div className="w-72 bg-slate-50/90 backdrop-blur-sm border border-white/30 rounded-2xl p-6 flex flex-col shadow-sm sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto">
            <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Live Participants
            </h3>
            <div className="space-y-2">
              {participants.map((p) => (
                <div
                  key={p.id}
                  className={`p-3 rounded-lg transition-all ${
                    p.answered
                      ? "bg-emerald-100 border border-emerald-300"
                      : "bg-gray-100 border border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-800">
                      {p.name}
                    </span>
                    {p.answered && (
                      <span className="text-xs font-semibold text-emerald-700">
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
