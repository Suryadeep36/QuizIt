import { useState, useEffect } from "react";
import {
  Zap,
  Timer,
  CheckCircle2,
  Trophy,
  XCircle,
  Flame,
  Users,
  Wifi,
  WifiOff,
  Loader2,
  Trash2,
} from "lucide-react";
import { useWS } from "../../../stores/webSocketStore";
import { useNavigate, useParams } from "react-router";
import { joinSession } from "../../../services/stompService";
import { createQuestionAnalyticsUser } from "../../../services/AuthService";
import { useParticipant } from "../../../stores/store";

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
  const [selectedOption, setSelectedOption] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(1250);

  const { sessionId } = useParams();

  const { client, isConnected, connect } = useWS();

  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(null);
  const participant = useParticipant((s) => s.participant);
  const [hasJoined, setHasJoined] = useState(false);

  const [userMatchPairs, setUserMatchPairs] = useState([]);
  const [zoomedImage, setZoomedImage] = useState(null);

  const navigator = useNavigate();

  const TOTAL_TIME = 15;

  const renderPlayableOptions = (
    type,
    options,
    selectedOption,
    handleOptionClick,
  ) => {
    switch (type) {
      case "MCQ":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 w-full">
            {Object.entries(options).map(([key, value]) => (
              <button
                key={key}
                onClick={() => handleOptionClick(key)}
                className={`
                w-full p-5 md:p-6 rounded-2xl text-left transition-all duration-200 border-2 flex justify-between items-center active:scale-95
                ${
                  Array.isArray(selectedOption) && selectedOption.includes(key)
                    ? "bg-white border-white text-[#4a9cb0] shadow-2xl scale-[1.02]"
                    : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                }
              `}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold ${
                      Array.isArray(selectedOption) &&
                      selectedOption.includes(key)
                        ? "border-[#4a9cb0] bg-[#4a9cb0]/10"
                        : "border-white/30"
                    }`}
                  >
                    {key}
                  </div>
                  <span className="text-lg font-bold">{value}</span>
                </div>
                {Array.isArray(selectedOption) &&
                  selectedOption.includes(key) && (
                    <CheckCircle2 className="w-6 h-6 text-[#4a9cb0]" />
                  )}
              </button>
            ))}
          </div>
        );

      case "TRUE_FALSE":
        return (
          <div className="grid grid-cols-2 gap-4">
            {["TRUE", "FALSE"].map((value) => (
              <button
                key={value}
                onClick={() => handleOptionClick(value)}
                className={`
                p-5 md:p-6 rounded-2xl border-2 text-center transition-all duration-200 active:scale-95
                ${
                  selectedOption === value
                    ? "bg-white border-white text-[#4a9cb0] shadow-2xl scale-[1.02]"
                    : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                }
              `}
              >
                <span className="text-lg font-bold">{value}</span>
              </button>
            ))}
          </div>
        );

      case "NUMERICAL":
        return (
          <div className="flex justify-center">
            <input
              type="number"
              onChange={(e) => handleOptionClick(e.target.value)}
              className="w-full max-w-sm p-4 rounded-xl bg-white/10 border border-white/20 text-white text-center text-xl focus:outline-none focus:ring-2 focus:ring-teal-400"
              placeholder="Enter your answer..."
            />
          </div>
        );

      case "MATCH_FOLLOWING": {
        return (
          <div className="w-full mt-2">
            <div className="grid md:grid-cols-2 gap-12 relative">
              <svg
                className="absolute inset-0 pointer-events-none z-0"
                style={{ width: "100%", height: "100%", overflow: "visible" }}
              >
                {userMatchPairs.map((pair, idx) => {
                  const leftDot = document.getElementById(
                    `left-${currentQuestion.questionId}-${pair.left}`,
                  );
                  const rightDot = document.getElementById(
                    `right-${currentQuestion.questionId}-${pair.right}`,
                  );

                  if (leftDot && rightDot) {
                    const leftRect = leftDot.getBoundingClientRect();
                    const rightRect = rightDot.getBoundingClientRect();
                    const containerRect = leftDot
                      .closest(".grid")
                      ?.getBoundingClientRect();

                    if (containerRect) {
                      const x1 =
                        leftRect.left + leftRect.width / 2 - containerRect.left;
                      const y1 =
                        leftRect.top + leftRect.height / 2 - containerRect.top;
                      const x2 =
                        rightRect.left +
                        rightRect.width / 2 -
                        containerRect.left;
                      const y2 =
                        rightRect.top +
                        rightRect.height / 2 -
                        containerRect.top;

                      return (
                        <line
                          key={`line-${idx}`}
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke="#4a9cb0"
                          strokeWidth="3"
                          strokeDasharray="6,4"
                        />
                      );
                    }
                  }
                  return null;
                })}
              </svg>

              <div>
                <p className="text-sm font-semibold text-white/80 mb-3 text-center">
                  Left Column
                </p>
                <div className="space-y-4">
                  {(options?.left || []).map((item, i) => (
                    <div
                      key={`left-${i}`}
                      className="relative bg-white/10 border border-white/20 rounded-xl flex items-center p-4 transition-all hover:bg-white/20 min-h-[64px]"
                    >
                      <span className="text-white font-bold text-lg">
                        {item}
                      </span>
                      <div
                        id={`left-${currentQuestion.questionId}-${i}`}
                        className="w-5 h-5 rounded-full bg-[#4a9cb0] border-2 border-white cursor-grab hover:scale-125 transition-transform absolute -right-2.5 z-10 shadow-lg"
                        onMouseDown={(e) => {
                          const svg = e.currentTarget
                            .closest(".grid")
                            .querySelector("svg");
                          const tempLine = document.createElementNS(
                            "http://www.w3.org/2000/svg",
                            "line",
                          );

                          tempLine.setAttribute("stroke", "#4a9cb0");
                          tempLine.setAttribute("stroke-width", "3");
                          tempLine.setAttribute("stroke-dasharray", "6,4");
                          tempLine.setAttribute("id", `temp-line`);

                          const containerRect = e.currentTarget
                            .closest(".grid")
                            .getBoundingClientRect();
                          const dotRect =
                            e.currentTarget.getBoundingClientRect();
                          const startX =
                            dotRect.left +
                            dotRect.width / 2 -
                            containerRect.left;
                          const startY =
                            dotRect.top +
                            dotRect.height / 2 -
                            containerRect.top;

                          tempLine.setAttribute("x1", startX);
                          tempLine.setAttribute("y1", startY);
                          tempLine.setAttribute("x2", startX);
                          tempLine.setAttribute("y2", startY);
                          tempLine.dataset.leftIndex = i;

                          svg.appendChild(tempLine);

                          const handleMouseMove = (moveE) => {
                            const currentX = moveE.clientX - containerRect.left;
                            const currentY = moveE.clientY - containerRect.top;
                            tempLine.setAttribute("x2", currentX);
                            tempLine.setAttribute("y2", currentY);
                          };

                          const handleMouseUp = () => {
                            document.removeEventListener(
                              "mousemove",
                              handleMouseMove,
                            );
                            document.removeEventListener(
                              "mouseup",
                              handleMouseUp,
                            );
                            tempLine.remove();
                          };

                          document.addEventListener(
                            "mousemove",
                            handleMouseMove,
                          );
                          document.addEventListener("mouseup", handleMouseUp);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-white/80 mb-3 text-center">
                  Right Column
                </p>
                <div className="space-y-4">
                  {(options?.right || []).map((item, i) => (
                    <div
                      key={`right-${i}`}
                      className="relative bg-white/10 border border-white/20 rounded-xl flex items-center justify-end p-4 transition-all hover:bg-white/20 min-h-[64px]"
                    >
                      {/* Connection Dot (Left Edge) */}
                      <div
                        id={`right-${currentQuestion.questionId}-${i}`}
                        className="w-5 h-5 rounded-full bg-[#f5a65b] border-2 border-white cursor-pointer hover:scale-125 transition-transform absolute -left-2.5 z-10 shadow-lg"
                        onMouseUp={(e) => {
                          const tempLine = document.getElementById(`temp-line`);
                          if (
                            tempLine &&
                            tempLine.dataset.leftIndex !== undefined
                          ) {
                            const leftIdx = parseInt(
                              tempLine.dataset.leftIndex,
                            );
                            const rightIdx = i;
                            setUserMatchPairs((prev) => {
                              const filtered = prev.filter(
                                (p) =>
                                  p.left !== leftIdx && p.right !== rightIdx,
                              );
                              return [
                                ...filtered,
                                { left: leftIdx, right: rightIdx },
                              ];
                            });
                          }
                        }}
                      />
                      <span className="text-white font-bold text-lg text-right">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col items-center">
              <p className="text-xs text-white/50 italic mb-4">
                💡 Drag from Blue to Orange to connect
              </p>

              {userMatchPairs.length > 0 && (
                <div className="w-full bg-black/20 p-4 rounded-xl border border-white/10">
                  <p className="text-xs font-bold text-white/70 mb-2 uppercase tracking-wider">
                    Your Connections
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {userMatchPairs.map((pair, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-sm bg-white/5 p-2 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[#4a9cb0] font-bold">
                            {options.left[pair.left]}
                          </span>
                          <span className="text-white/30">→</span>
                          <span className="text-[#f5a65b] font-bold">
                            {options.right[pair.right]}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setUserMatchPairs((prev) =>
                              prev.filter((_, i) => i !== idx),
                            );
                          }}
                          className="text-white/40 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      }

      case "SHORT_ANSWER":
        return (
          <div className="flex justify-center w-full">
            <input
              type="text"
              value={selectedOption || ""}
              onChange={(e) => handleOptionClick(e.target.value)}
              disabled={isSubmitted}
              className="
              w-full max-w-lg
              p-4 md:p-5
              rounded-2xl
              bg-white/10
              border-2 border-white/20
              text-white text-lg
              text-center font-bold
              placeholder-white/50
              focus:outline-none
              focus:ring-2
              focus:ring-teal-400
              transition-all
              disabled:opacity-60
              disabled:cursor-not-allowed
              "
              placeholder="Enter your answer"
            />
          </div>
        );

      default:
        return null;
    }
  };

  useEffect(() => {
    if (stage !== "question") return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          console.log("reveal");
          setStage("reveal");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [stage]);

  /* ========================= CONNECT WS ========================= */
  useEffect(() => {
    console.log("Connecting WebSocket...");
    connect();

    return () => {
      console.log("Disconnecting WebSocket...");
    };
  }, [connect]);

  useEffect(() => {
    console.log("Join Effect - Checking conditions:", {
      isConnected,
      clientConnected: client?.connected,
      participantId: participant?.id,
      sessionId,
      hasJoined,
    });

    if (!isConnected) {
      console.log("Not connected yet");
      return;
    }

    if (!client?.connected) {
      console.log("Client not connected");
      return;
    }

    if (!participant?.id) {
      console.log("No participant ID");
      return;
    }

    if (!sessionId) {
      console.log("No session ID");
      return;
    }

    if (hasJoined) {
      console.log("Already joined");
      return;
    }

    console.log("✅ All conditions met - Joining session!", {
      sessionId,
      participantId: participant.id,
    });

    joinSession(sessionId, participant.id);
    setHasJoined(true);
  }, [isConnected, client?.connected, participant?.id, sessionId, hasJoined]);

  /* ========================= SUBSCRIBE ========================= */
  useEffect(() => {
    if (!isConnected || !client?.connected || !hasJoined) return;
    console.log("SUBCRIBING TO WS");
    const subscription = client.subscribe(
      `/topic/quiz/${sessionId}`,
      (message) => {
        const msg = JSON.parse(message.body);
        console.log("Participant WS message:", msg);

        switch (msg.messageType) {
          case "START_QUIZ": {
            const q = msg.payload;
            setCurrentQuestion(q);
            setTimer(q.duration);
            setStage("question");
            setSelectedOption(null);
            setUserMatchPairs([]);
            setIsSubmitted(false);
            break;
          }

          case "NEXT_QUESTION": {
            const q = msg.payload;
            setCurrentQuestion(q);
            setTimer(q.duration);
            setStage("question");
            setSelectedOption(null);
            setUserMatchPairs([]);
            setIsSubmitted(false);
            setCorrectAnswer(null)
            setIsAnswerCorrect(null);
            break;
          }

          case "TIMER_UPDATE":
            setTimer(msg.payload.remainingSeconds);
            break;

          case "REVEAL_ANSWER":
            setStage("reveal");
            setCorrectAnswer(msg.payload);
            break;

          case "QUIZ_ENDED":
            setStage("end");
            navigator(`/afterQuizAnalytics/${msg.payload.quizId}`);
            break;

          default:
            console.warn("Unknown WS event:", msg);
        }
      },
    );

    return () => subscription.unsubscribe();
  }, [isConnected, client?.connected, hasJoined]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setZoomedImage(null);
      }
    };

    if (zoomedImage) {
      document.addEventListener("keydown", handleEsc);
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [zoomedImage]);

  const handleOptionClick = (index) => {
    if (stage !== "question" || timer <= 0) return;
    if (currentQuestion.questionType === "MCQ") {
      if (currentQuestion.allowMultipleAnswers) {
        setSelectedOption((prev) => {
          const safePrev = prev || [];
          const exists = safePrev.includes(index);
          const updated = exists
            ? safePrev.filter((v) => v !== index)
            : [...safePrev, index];
          return updated;
        });
      } else {
        const updated = [index];
        setSelectedOption(updated);
      }
      return;
    }
    setSelectedOption(index);
  };

  const submitAnswer = async (selectedValue) => {
    if (!currentQuestion || !participant) return;

    const timeSpent = currentQuestion.duration - timer;

    let selectedAnswer = {};

    switch (currentQuestion.questionType) {
      case "MCQ":
        selectedAnswer = {
          keys: Array.isArray(selectedValue) ? selectedValue : [selectedValue],
        };
        break;

      case "MATCH_FOLLOWING":
        const matchMap = [];
        if (Array.isArray(selectedValue)) {
          selectedValue.forEach((pair) => {
            matchMap.push({
              [pair.right] : pair.left
            })
          });
        }
        console.log(matchMap)
        selectedAnswer = {
          matchPairs: matchMap,
        };
        break;

      case "TRUE_FALSE":
        selectedAnswer = {
          value: Boolean(selectedValue),
        };
        break;

      case "NUMERICAL":
        selectedAnswer = {
          value: Number(selectedValue),
        };
        break;
      default:
        selectedAnswer = {
          value: selectedValue,
        };
    }

    const payload = {
      questionId: currentQuestion.questionId,
      participantId: participant.id,
      timeSpent,
      selectedAnswer,
      tabSwitchCount: 0,
    };

    try {
      const response = await createQuestionAnalyticsUser(payload);
      setIsAnswerCorrect(response.isCorrect);
      console.log("Analytics saved:", payload);
    } catch (err) {
      console.error("Failed to save analytics", err);
    }
  };

  const renderCorrectText = (question) => {
    if (
      !question ||
      !question.correctAnswer ||
      question.correctAnswer.length === 0
    ) {
      return "—";
    }

    const { questionType, options, correctAnswer } = question;

    switch (questionType) {
      case "MCQ":
        return correctAnswer
          .map((ans) => {
            const optionText = options[ans.key];
            return optionText;
          })
          .join(", ");

      case "TRUE_FALSE":
        return String(correctAnswer[0].key).toUpperCase();

      case "NUMERICAL":
        return correctAnswer[0].key;

      case "SHORT_ANSWER":
        return correctAnswer[0].key;

      case "MATCH_FOLLOWING":
        const pairs = correctAnswer[0].matchPairs || {};
        return Object.entries(pairs)
          .map(([rightIdx, leftIdx]) => {
            const leftText = options.left?.[leftIdx] || "Left";
            const rightText = options.right?.[rightIdx] || "Right";
            return `${leftText} → ${rightText}`;
          })
          .join(" | ");

      default:
        return "—";
    }
  };

  const handleFinalSubmit = () => {
    if (isSubmitted) return;

    if (currentQuestion.questionType === "MATCH_FOLLOWING") {
      submitAnswer(userMatchPairs);
    } else {
      submitAnswer(selectedOption);
    }

    setIsSubmitted(true);
  };

  /* ================= CONDITIONAL SCREENS ================= */
  if (!connected) return <DisconnectedScreen />;
  if (stage === "waiting" || !hasJoined)
    return <WaitingScreen quizName="Java Basics Quiz" />;

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
              <h1 className="text-lg md:text-xl font-bold text-white leading-none">
                Quizlt Live
              </h1>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                <span className="text-[10px] text-white/80 font-bold uppercase tracking-widest">
                  Live Connection
                </span>
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
            className={`h-full transition-all duration-1000 ease-linear ${
              timer < 5 ? "bg-red-400" : "bg-white"
            }`}
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
              <div
                className={`flex items-center gap-2 font-mono font-bold text-xl md:text-2xl ${
                  timer < 5 ? "text-red-500 animate-bounce" : "text-white"
                }`}
              >
                <Timer className="w-5 h-5 md:w-6 md:h-6" />
                {timer}s
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/30 rounded-[2rem] p-6 md:p-10 mb-8 shadow-xl text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                {currentQuestion.content}
              </h2>
              {currentQuestion.imageUrl && (
                <div className="flex justify-center">
                  <img
                    src={currentQuestion.imageUrl}
                    alt="Question visual"
                    className="
                    max-h-[320px]
                    max-w-full
                    rounded-2xl
                    border border-white/20
                    shadow-lg
                    object-contain
                    bg-white/5
                    cursor-zoom-in
                    hover:scale-[1.02]
                    transition-transform
                    w-auto
                  "
                    loading="lazy"
                    onClick={() => setZoomedImage(currentQuestion.imageUrl)}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 w-full">
              {renderPlayableOptions(
                currentQuestion.questionType,
                currentQuestion.options,
                selectedOption,
                handleOptionClick,
              )}
            </div>

            <div className="mt-8 text-center min-h-[24px]">
              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleFinalSubmit}
                  disabled={isSubmitted}
                  className={`
                      px-8 py-3 rounded-2xl font-black tracking-wide
                      transition-all duration-200 active:scale-95
                      ${
                        isSubmitted
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-white text-[#4a9cb0] shadow-xl hover:shadow-2xl hover:scale-[1.03]"
                      }
                    `}
                >
                  {isSubmitted ? "Answer Locked" : "Final Submit"}
                </button>
              </div>
              {isSubmitted && timer > 0 && (
                <p className="text-white font-bold text-sm animate-pulse">
                  ✔ Response recorded! You can still change it.
                </p>
              )}
            </div>
          </div>
        )}

        {(() => {
          if (stage !== "reveal" || !correctAnswer) return null;

          if (isAnswerCorrect == null) return null;
          return (
            <div className="w-full max-w-lg flex flex-col items-center animate-in zoom-in duration-300 mt-10 md:mt-16">
              <div className="bg-white/95 backdrop-blur-lg rounded-[2.5rem] p-8 md:p-12 shadow-2xl w-full text-center border border-white">
                {isAnswerCorrect ? (
                  <>
                    <div className="bg-emerald-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-12">
                      <Trophy className="w-12 h-12 text-emerald-600" />
                    </div>

                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                      EXCELLENT!
                    </h2>
                    <p className="text-emerald-600 font-bold text-xl mt-2">
                      +100 Points
                    </p>
                  </>
                ) : (
                  <>
                    <div className="bg-red-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 -rotate-12">
                      <XCircle className="w-12 h-12 text-red-600" />
                    </div>

                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                      WRONG ANSWER
                    </h2>

                    <p className="text-slate-500 mt-4 font-semibold uppercase tracking-widest text-xs">
                      Correct Answer:
                    </p>

                    <div className="mt-2 p-4 bg-[#4a9cb0]/10 rounded-2xl font-bold text-[#4a9cb0] text-lg border border-[#4a9cb0]/20">
                      {renderCorrectText(currentQuestion)}
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })()}
        {zoomedImage && (
          <div
            className="
            fixed inset-0 z-50
            bg-black/80 backdrop-blur-sm
            flex items-center justify-center
            p-4
            animate-in fade-in duration-200
            "
            onClick={() => setZoomedImage(null)}
          >
            <img
              src={zoomedImage}
              alt="Zoomed question visual"
              className="
              max-w-[90vw]
              max-h-[90vh]
              object-contain
              rounded-2xl
              shadow-2xl
              cursor-zoom-out
              animate-in zoom-in-95 duration-200
              "
              onClick={(e) => e.stopPropagation()}
            />

            {/* Close hint */}
            <div className="absolute top-4 right-4 text-white/80 text-xs md:text-sm">
              Click outside or press ESC to close
            </div>
          </div>
        )}
      </main>

      {/* FOOTER STATS */}
      <footer className="p-6 mt-auto bg-white/10 backdrop-blur-md border-t border-white/20">
        <div className="max-w-4xl mx-auto flex justify-around items-center">
          <div className="text-center">
            <p className="text-[10px] text-white/60 uppercase font-black">
              Answering As
            </p>
            <p className="text-white font-bold">Parth</p>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div className="text-center">
            <p className="text-[10px] text-white/60 uppercase font-black">
              Live Players
            </p>
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
          The host is getting things ready. <br /> Relax, the quiz will start
          shortly!
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
        <p className="text-slate-500 text-sm mt-2 mb-6">
          We're trying to get you back into the game...
        </p>
        <div className="flex items-center justify-center gap-2 text-red-600 font-bold text-xs animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin" />
          RECONNECTING
        </div>
      </div>
    </div>
  );
}
