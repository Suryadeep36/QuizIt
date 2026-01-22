import { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard,
  Settings,
  PlusCircle,
  ChevronRight,
  Clock,
  CheckCircle2,
  Trash2,
  Copy,
  Eye,
  Type,
  Hash,
  ListTodo,
  AlertCircle,
  Trophy,
  MessageSquare,
  ArrowLeftRight,
  ImageIcon,
  ListChecks,
} from "lucide-react";
import { useParams } from "react-router";
import {
  createQuestion,
  deleteQuestionById,
  getQuestionsByQuizId,
  getQuizById,
  getQuizsByHostId,
  updateQuestionById,
} from "../../../services/AuthService";

export default function QuizManagementDashboard() {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [activeTab, setActiveTab] = useState("questions");
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);

  const normalizeQuestionFromApi = (q) => {
    const baseQuestion = {
      questionId: q.questionId,
      quizId: q.quizId,
      content: q.content ?? "",
      questionType: q.questionType,
      duration: q.duration ?? 30,
      points: q.points ?? 1,
      difficultyLevel: q.difficultyLevel,
      correctAnswer: q.correctAnswer,
      imageUrl: q.imageUrl ?? null,
      caseSensitive: q.caseSensitive ?? false,
      acceptableAnswers: q.acceptableAnswers ?? [],
      maxAnswerLength: q.maxAnswerLength ?? 200,
      allowMultipleAnswers: q.allowMultipleAnswers ?? false,
    };

    // Normalize options based on question type
    switch (q.questionType) {
      case "MCQ":
      case "IMAGE_BASED":
        baseQuestion.options = q.options
          ? ["A", "B", "C", "D"].map((key) => q.options[key] ?? "")
          : ["", "", "", ""];
        break;

      case "TRUE_FALSE":
        baseQuestion.options = q.options ?? { TRUE: "True", FALSE: "False" };
        break;

      case "MATCH_FOLLOWING":
        baseQuestion.options = {
          left: q.options?.left ?? ["", "", ""],
          right: q.options?.right ?? ["", "", ""],
        };
        break;

      case "NUMERICAL":
      case "SHORT_ANSWER":
        baseQuestion.options = q.options ?? {};
        break;

      default:
        baseQuestion.options = q.options ?? {};
    }

    return baseQuestion;
  };

  const mapOptionsToApi = (optionsArray) => ({
    A: optionsArray[0],
    B: optionsArray[1],
    C: optionsArray[2],
    D: optionsArray[3],
  });

  function debounce(fn, delay = 500) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        fn(...args);
      }, delay);
    };
  }

  const addQuestion = async (type) => {
    const newQuestion = {
      quizId: quizId,
      content: "",
      questionType: type,
      duration: 30,
      difficultyLevel: "NORMAL",
      options: {},
      correctAnswer: [],
      imageUrl: null,
      caseSensitive: false,
      exactMatch: true,
      acceptableAnswers: [],
      maxAnswerLength: null,
      allowMultipleAnswers: false,
    };

    switch (type) {
      case "MCQ":
        newQuestion.options = {
          A: "",
          B: "",
          C: "",
          D: "",
        };
        newQuestion.correctAnswer = [{ key: "A" }];
        break;

      case "NUMERICAL":
        newQuestion.correctAnswer = [{ key: 0 }];
        break;

      case "TRUE_FALSE":
        newQuestion.options = {
          TRUE: "True",
          FALSE: "False",
        };
        newQuestion.correctAnswer = [{ key: "TRUE" }];
        break;

      case "SHORT_ANSWER":
        newQuestion.correctAnswer = [{ key: "" }];
        newQuestion.acceptableAnswers = [""];
        newQuestion.caseSensitive = false;
        newQuestion.exactMatch = true;
        newQuestion.maxAnswerLength = 200;
        break;

      case "MATCH_FOLLOWING":
        newQuestion.options = {
          left: ["", "", ""],
          right: ["", "", ""],
        };
        newQuestion.correctAnswer = [
          {
            key: {
              0: "0",
              1: "1",
              2: "2",
            },
          },
        ];
        break;

      case "IMAGE_BASED":
        newQuestion.imageUrl = "";
        newQuestion.options = {
          A: "",
          B: "",
          C: "",
          D: "",
        };
        newQuestion.correctAnswer = [{ key: "A" }];
        break;

      default:
        break;
    }

    const savedQuestion = await createQuestion(newQuestion);
    setQuestions((prev) => [...prev, normalizeQuestionFromApi(savedQuestion)]);
  };

  const deleteQuestion = async (questionId) => {
    setQuestions((prev) => prev.filter((q) => q.questionId !== questionId));

    try {
      await deleteQuestionById(questionId);
    } catch (err) {
      console.error("Failed to delete question");
    }
  };

  const updateLocalQuestion = (questionId, patch) => {
    setQuestions((prev) =>
      prev.map((q) => (q.questionId === questionId ? { ...q, ...patch } : q)),
    );
  };
  const updateQuestion = useRef(
    debounce(async (questionId, patch) => {
      await updateQuestionById(questionId, patch);
    }, 600),
  ).current;

  useEffect(() => {
    if (!quizId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [quizData, quesData] = await Promise.all([
          getQuizById(quizId),
          getQuestionsByQuizId(quizId),
        ]);
        setQuiz(quizData);
        setQuestions(quesData.map(normalizeQuestionFromApi));
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [quizId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading quiz…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4a9cb0] via-[#5fb4c7] to-[#4a9cb0] text-slate-800 font-sans selection:bg-white/30">
      {/* Top Navigation */}
      <nav className="border-b border-white/20 bg-white/10 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center font-bold text-[#4a9cb0] shadow-lg">
                Q
              </div>
              <span className="font-bold text-white">QuizIt</span>
            </div>
            <div className="h-4 w-px bg-white/30" />
            <div className="flex items-center gap-2 text-sm text-white/80">
              <span>My Quizzes</span>
              <ChevronRight className="w-4 h-4" />
              <span className="text-white font-medium">{quiz.quizName}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/30 hover:bg-blue-500/20 bg-blue-600/10 text-sm text-white">
              <Eye className="w-4 h-4" />
              Preview
            </button>

            <button className="bg-[#f5a65b] text-white px-6 py-2 rounded-full font-bold hover:bg-[#f59843] shadow-lg">
              Publish
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-[1400px] mx-auto flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-white/20 p-6 sticky top-16 hidden lg:block">
          <div className="space-y-1">
            <button
              onClick={() => setActiveTab("questions")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm ${
                activeTab === "questions"
                  ? "bg-white text-[#4a9cb0] shadow-lg"
                  : "hover:bg-white/20 text-white/80 hover:text-white"
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              Questions
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm ${
                activeTab === "settings"
                  ? "bg-white text-[#4a9cb0] shadow-lg"
                  : "hover:bg-white/20 text-white/80 hover:text-white"
              }`}
            >
              <Settings className="w-5 h-5" />
              Settings
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 p-6 md:p-10">
          {activeTab === "questions" ? (
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    Manage Questions
                  </h1>
                  <p className="text-white/70 mt-1">
                    Add, edit, and organize your quiz content.
                  </p>
                </div>

                <div className="relative group">
                  <button className="bg-white text-[#4a9cb0] px-5 py-3 rounded-2xl font-bold flex items-center gap-2 hover:shadow-xl transition-all">
                    <PlusCircle className="w-5 h-5" />
                    Add Question
                  </button>

                  <div className="absolute right-0 mt-2 w-52 bg-slate-50/95 backdrop-blur-md border border-slate-200 rounded-2xl p-2 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <button
                      onClick={() => addQuestion("MCQ")}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 text-sm text-slate-700"
                    >
                      <ListTodo className="w-4 h-4 text-[#f5a65b]" />
                      Multiple Choice
                    </button>

                    <button
                      onClick={() => addQuestion("NUMERICAL")}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 text-sm text-slate-700"
                    >
                      <Hash className="w-4 h-4 text-blue-500" />
                      Numerical
                    </button>

                    <button
                      onClick={() => addQuestion("TRUE_FALSE")}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 text-sm text-slate-700"
                    >
                      <Type className="w-4 h-4 text-emerald-500" />
                      True / False
                    </button>
                    <button
                      onClick={() => addQuestion("SHORT_ANSWER")}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 text-sm text-slate-700"
                    >
                      <MessageSquare className="w-4 h-4 text-purple-500" />
                      Short Answer
                    </button>

                    <button
                      onClick={() => addQuestion("MATCH_FOLLOWING")}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 text-sm text-slate-700"
                    >
                      <ArrowLeftRight className="w-4 h-4 text-pink-500" />
                      Match the Following
                    </button>

                    <button
                      onClick={() => addQuestion("IMAGE_BASED")}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 text-sm text-slate-700"
                    >
                      <ImageIcon className="w-4 h-4 text-indigo-500" />
                      Image Based
                    </button>
                  </div>
                </div>
              </div>

              {/* Questions */}
              <div className="space-y-6">
                {questions.map((q, index) => (
                  <div
                    key={q.questionId}
                    className="bg-slate-50/90 backdrop-blur-sm border border-slate-200/50 rounded-[2rem] p-8 hover:shadow-xl transition-all group"
                  >
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1 space-y-6">
                        <div className="flex items-center gap-3">
                          <span className="bg-[#4a9cb0] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                            Question {index + 1}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-600 text-xs font-medium uppercase tracking-widest">
                            {q.questionType.replace(/_/g, " ")}
                          </span>
                        </div>

                        <input
                          type="text"
                          placeholder="What would you like to ask?"
                          className="text-xl md:text-2xl font-semibold bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-300 w-full"
                          value={q.content || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            updateLocalQuestion(q.questionId, {
                              content: value,
                            });
                            updateQuestion(q.questionId, { content: value });
                          }}
                        />

                        {/* IMAGE UPLOAD FOR IMAGE_BASED */}
                        {q.questionType === "IMAGE_BASED" && (
                          <div className="mt-4">
                            <label className="text-sm font-bold text-slate-600 mb-2 block">
                              Question Image
                            </label>
                            <div className="space-y-4">
                              <div className="flex items-center gap-4">
                                <input
                                  type="text"
                                  placeholder="Enter image URL"
                                  className="flex-1 bg-white/80 border border-slate-200 rounded-2xl p-3 outline-none text-slate-700 focus:border-[#4a9cb0]"
                                  value={q.imageUrl || ""}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    updateLocalQuestion(q.questionId, {
                                      imageUrl: value,
                                    });
                                    updateQuestion(q.questionId, {
                                      imageUrl: value,
                                    });
                                  }}
                                />
                              </div>

                              {q.imageUrl && (
                                <div className="w-full flex justify-center">
                                  <div className="w-full max-w-md">
                                    <img
                                      src={q.imageUrl}
                                      alt="Question"
                                      className="w-full h-auto object-contain rounded-2xl border-2 border-slate-200 bg-white/50 p-2"
                                      onError={(e) => {
                                        e.target.style.display = "none";
                                      }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* MCQ */}
                        {(q.questionType === "MCQ" ||
                          q.questionType === "IMAGE_BASED") && (
                          <div className="grid md:grid-cols-2 gap-4 mt-6">
                            {q.options.map((value, i) => {
                              const key = String.fromCharCode(65 + i);
                              const isCorrect = q.correctAnswer?.some(
                                (ans) => ans.key === key,
                              );
                              const selectCorrectAnswer = () => {
                                let newCorrect;

                                if (q.allowMultipleAnswers) {
                                  const exists = q.correctAnswer.some(
                                    (ans) => ans.key === key,
                                  );

                                  newCorrect = exists
                                    ? q.correctAnswer.filter(
                                        (ans) => ans.key !== key,
                                      )
                                    : [...q.correctAnswer, { key }];
                                } else {
                                  newCorrect = [{ key }];
                                }

                                updateLocalQuestion(q.questionId, {
                                  correctAnswer: newCorrect,
                                });

                                updateQuestion(q.questionId, {
                                  correctAnswer: newCorrect,
                                });
                              };
                              return (
                                <div
                                  key={key}
                                  className={`flex items-center gap-3 bg-white/80 border border-slate-200 rounded-2xl p-4 transition-all focus-within:border-[#4a9cb0] focus-within:bg-white cursor-pointer`}
                                  onClick={selectCorrectAnswer}
                                >
                                  <div
                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
    ${
      isCorrect
        ? "border-[#f5a65b] bg-[#f5a65b] text-white"
        : "border-slate-300 text-slate-400"
    }
  `}
                                  >
                                    {isCorrect ? "✓" : key}
                                  </div>

                                  <input
                                    type="text"
                                    placeholder={`Option ${key}`}
                                    className="bg-transparent border-none outline-none flex-1 text-sm text-slate-700"
                                    value={value}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => {
                                      const updatedOptions = [...q.options];
                                      updatedOptions[i] = e.target.value;

                                      updateLocalQuestion(q.questionId, {
                                        options: updatedOptions,
                                      });

                                      updateQuestion(q.questionId, {
                                        options:
                                          mapOptionsToApi(updatedOptions),
                                      });
                                    }}
                                  />

                                  {isCorrect && (
                                    <CheckCircle2 className="w-4 h-4 text-[#4a9cb0]" />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* NUMERICAL */}
                        {q.questionType === "NUMERICAL" && (
                          <div className="mt-4">
                            <label className="text-sm font-bold text-slate-600 mb-2 block">
                              Correct Answer
                            </label>
                            <input
                              type="number"
                              className="w-48 bg-white/80 border border-slate-200 rounded-2xl p-3 outline-none text-slate-800 focus:border-[#4a9cb0]"
                              value={q.correctAnswer[0]?.key || ""}
                              placeholder="Enter correct answer"
                              onChange={(e) => {
                                const value = e.target.value;
                                console.log(e.target.value)
                                const newCorrect = [{ key :value }];
                                updateLocalQuestion(q.questionId, {
                                  correctAnswer: newCorrect,
                                });
                                updateQuestion(q.questionId, {
                                  correctAnswer: newCorrect,
                                });
                              }}
                            />
                          </div>
                        )}

                        {/* TRUE/FALSE */}
                        {q.questionType === "TRUE_FALSE" && (
                          <div className="flex items-center gap-4 mt-4">
                            {["TRUE", "FALSE"].map((val) => {
                              const isSelected = q.correctAnswer[0]?.key === val;
                              return (
                                <button
                                  key={val}
                                  className={`px-6 py-3 rounded-xl font-bold transition-all ${
                                    isSelected
                                      ? "bg-[#4a9cb0] text-white shadow-lg"
                                      : "bg-white/80 text-slate-800 border border-slate-200 hover:border-[#4a9cb0]"
                                  }`}
                                  onClick={() => {
                                    const newCorrect = [{ key: val }];
                                    updateLocalQuestion(q.questionId, {
                                      correctAnswer: newCorrect,
                                    });
                                    updateQuestion(q.questionId, {
                                      correctAnswer: newCorrect,
                                    });
                                  }}
                                >
                                  {val}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* SHORT ANSWER */}
                        {q.questionType === "SHORT_ANSWER" && (
                          <div className="space-y-4 mt-4">
                            <div>
                              <label className="text-sm font-bold text-slate-600 mb-2 block">
                                Correct Answer
                              </label>
                              <input
                                type="text"
                                className="w-full bg-white/80 border border-slate-200 rounded-2xl p-3 outline-none text-slate-800 focus:border-[#4a9cb0]"
                                value={q.correctAnswer[0]?.key || ""}
                                placeholder="Enter the correct answer"
                                onChange={(e) => {
                                  const value = e.target.value;
                                  const newCorrect = { answer: value };
                                  updateLocalQuestion(q.questionId, {
                                    correctAnswer: newCorrect,
                                  });
                                  updateQuestion(q.questionId, {
                                    correctAnswer: newCorrect,
                                  });
                                }}
                              />
                            </div>

                            <div>
                              <label className="text-sm font-bold text-slate-600 mb-2 block">
                                Acceptable Answers
                              </label>
                              <div className="space-y-2">
                                {(q.acceptableAnswers || [""]).map(
                                  (answer, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center gap-2"
                                    >
                                      <input
                                        type="text"
                                        placeholder={`Answer ${idx + 1}`}
                                        className="flex-1 bg-white/80 border border-slate-200 rounded-xl p-2 text-sm outline-none text-slate-700 focus:border-[#4a9cb0]"
                                        value={answer}
                                        onChange={(e) => {
                                          const newAnswers = [
                                            ...(q.acceptableAnswers || []),
                                          ];
                                          newAnswers[idx] = e.target.value;
                                          updateLocalQuestion(q.questionId, {
                                            acceptableAnswers: newAnswers,
                                          });
                                          updateQuestion(q.questionId, {
                                            acceptableAnswers: newAnswers,
                                          });
                                        }}
                                      />
                                      {idx > 0 && (
                                        <button
                                          onClick={() => {
                                            const newAnswers = (
                                              q.acceptableAnswers || []
                                            ).filter((_, i) => i !== idx);
                                            updateLocalQuestion(q.questionId, {
                                              acceptableAnswers:
                                                newAnswers.length > 0
                                                  ? newAnswers
                                                  : [""],
                                            });
                                            updateQuestion(q.questionId, {
                                              acceptableAnswers:
                                                newAnswers.length > 0
                                                  ? newAnswers
                                                  : [""],
                                            });
                                          }}
                                          className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      )}
                                    </div>
                                  ),
                                )}

                                <button
                                  onClick={() => {
                                    const newAnswers = [
                                      ...(q.acceptableAnswers || [""]),
                                      "",
                                    ];
                                    updateLocalQuestion(q.questionId, {
                                      acceptableAnswers: newAnswers,
                                    });
                                    updateQuestion(q.questionId, {
                                      acceptableAnswers: newAnswers,
                                    });
                                  }}
                                  className="flex items-center gap-2 text-sm text-[#4a9cb0] hover:text-[#3a8c9f] font-medium transition-colors"
                                >
                                  <PlusCircle className="w-4 h-4" />
                                  Add Another Answer
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center gap-6">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 rounded border-slate-300 text-[#4a9cb0] focus:ring-[#4a9cb0]"
                                  checked={q.caseSensitive || false}
                                  onChange={(e) => {
                                    const value = e.target.checked;
                                    updateLocalQuestion(q.questionId, {
                                      caseSensitive: value,
                                    });
                                    updateQuestion(q.questionId, {
                                      caseSensitive: value,
                                    });
                                  }}
                                />
                                <span className="text-sm text-slate-700">
                                  Case Sensitive
                                </span>
                              </label>

                              <div className="flex items-center gap-2">
                                <label className="text-sm text-slate-700">
                                  Max Length:
                                </label>
                                <input
                                  type="number"
                                  className="w-20 bg-white/80 border border-slate-200 rounded-xl p-2 outline-none text-sm text-slate-800 focus:border-[#4a9cb0]"
                                  value={q.maxAnswerLength || 200}
                                  onChange={(e) => {
                                    const value = Number(e.target.value);
                                    updateLocalQuestion(q.questionId, {
                                      maxAnswerLength: value,
                                    });
                                    updateQuestion(q.questionId, {
                                      maxAnswerLength: value,
                                    });
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* MATCH THE FOLLOWING */}
                        {q.questionType === "MATCH_FOLLOWING" && (
                          <div className="mt-6">
                            <div className="grid md:grid-cols-2 gap-8 relative">
                              {/* SVG Canvas for drawing lines */}
                              <svg
                                className="absolute inset-0 pointer-events-none"
                                style={{ width: "100%", height: "100%" }}
                              >
                                {Object.entries(q.correctAnswer || {}).map(
                                  ([rightIdx, leftIdx]) => {
                                    const leftDot = document.getElementById(
                                      `left-${q.questionId}-${leftIdx}`,
                                    );
                                    const rightDot = document.getElementById(
                                      `right-${q.questionId}-${rightIdx}`,
                                    );

                                    if (leftDot && rightDot) {
                                      const leftRect =
                                        leftDot.getBoundingClientRect();
                                      const rightRect =
                                        rightDot.getBoundingClientRect();
                                      const containerRect = leftDot
                                        .closest(".grid")
                                        ?.getBoundingClientRect();

                                      if (containerRect) {
                                        const x1 =
                                          leftRect.left +
                                          leftRect.width / 2 -
                                          containerRect.left;
                                        const y1 =
                                          leftRect.top +
                                          leftRect.height / 2 -
                                          containerRect.top;
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
                                            key={`${leftIdx}-${rightIdx}`}
                                            x1={x1}
                                            y1={y1}
                                            x2={x2}
                                            y2={y2}
                                            stroke="#4a9cb0"
                                            strokeWidth="2"
                                            strokeDasharray="4,4"
                                          />
                                        );
                                      }
                                    }
                                    return null;
                                  },
                                )}
                              </svg>

                              {/* Left Column */}
                              <div>
                                <label className="text-sm font-bold text-slate-600 mb-3 block">
                                  Left Column
                                </label>
                                <div className="space-y-3">
                                  {(q.options?.left || []).map((item, i) => (
                                    <div
                                      key={i}
                                      className="flex items-center gap-2"
                                    >
                                      <input
                                        type="text"
                                        placeholder={`Item ${i + 1}`}
                                        className="flex-1 bg-white/80 border border-slate-200 rounded-xl p-3 outline-none text-sm text-slate-700 focus:border-[#4a9cb0]"
                                        value={item}
                                        onChange={(e) => {
                                          const newLeft = [
                                            ...(q.options?.left || []),
                                          ];
                                          newLeft[i] = e.target.value;
                                          const newOptions = {
                                            ...q.options,
                                            left: newLeft,
                                          };
                                          updateLocalQuestion(q.questionId, {
                                            options: newOptions,
                                          });
                                          updateQuestion(q.questionId, {
                                            options: newOptions,
                                          });
                                        }}
                                      />
                                      <div
                                        id={`left-${q.questionId}-${i}`}
                                        className="w-4 h-4 rounded-full bg-[#4a9cb0] cursor-pointer hover:scale-125 transition-transform flex-shrink-0 relative z-10"
                                        onMouseDown={(e) => {
                                          const svg = e.currentTarget
                                            .closest(".grid")
                                            .querySelector("svg");
                                          const tempLine =
                                            document.createElementNS(
                                              "http://www.w3.org/2000/svg",
                                              "line",
                                            );
                                          tempLine.setAttribute(
                                            "stroke",
                                            "#4a9cb0",
                                          );
                                          tempLine.setAttribute(
                                            "stroke-width",
                                            "2",
                                          );
                                          tempLine.setAttribute(
                                            "stroke-dasharray",
                                            "4,4",
                                          );
                                          tempLine.setAttribute(
                                            "id",
                                            `temp-line-${q.questionId}`,
                                          );

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
                                            const currentX =
                                              moveE.clientX -
                                              containerRect.left;
                                            const currentY =
                                              moveE.clientY - containerRect.top;
                                            tempLine.setAttribute(
                                              "x2",
                                              currentX,
                                            );
                                            tempLine.setAttribute(
                                              "y2",
                                              currentY,
                                            );
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
                                          document.addEventListener(
                                            "mouseup",
                                            handleMouseUp,
                                          );
                                        }}
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Right Column */}
                              <div>
                                <label className="text-sm font-bold text-slate-600 mb-3 block">
                                  Right Column
                                </label>
                                <div className="space-y-3">
                                  {(q.options?.right || []).map((item, i) => (
                                    <div
                                      key={i}
                                      className="flex items-center gap-2"
                                    >
                                      <div
                                        id={`right-${q.questionId}-${i}`}
                                        className="w-4 h-4 rounded-full bg-[#f5a65b] cursor-pointer hover:scale-125 transition-transform flex-shrink-0 relative z-10"
                                        onMouseUp={(e) => {
                                          const tempLine =
                                            document.getElementById(
                                              `temp-line-${q.questionId}`,
                                            );
                                          if (
                                            tempLine &&
                                            tempLine.dataset.leftIndex !==
                                              undefined
                                          ) {
                                            const leftIdx =
                                              tempLine.dataset.leftIndex;
                                            const newCorrect = {
                                              ...q.correctAnswer,
                                              [i]: leftIdx,
                                            };
                                            updateLocalQuestion(q.questionId, {
                                              correctAnswer: newCorrect,
                                            });
                                            updateQuestion(q.questionId, {
                                              correctAnswer: newCorrect,
                                            });
                                          }
                                        }}
                                      />
                                      <input
                                        type="text"
                                        placeholder={`Match ${i + 1}`}
                                        className="flex-1 bg-white/80 border border-slate-200 rounded-xl p-3 outline-none text-sm text-slate-700 focus:border-[#4a9cb0]"
                                        value={item}
                                        onChange={(e) => {
                                          const newRight = [
                                            ...(q.options?.right || []),
                                          ];
                                          newRight[i] = e.target.value;
                                          const newOptions = {
                                            ...q.options,
                                            right: newRight,
                                          };
                                          updateLocalQuestion(q.questionId, {
                                            options: newOptions,
                                          });
                                          updateQuestion(q.questionId, {
                                            options: newOptions,
                                          });
                                        }}
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Display Current Matches */}
                            <div className="mt-4 p-4 bg-white/60 rounded-xl border border-slate-200">
                              <p className="text-xs font-bold text-slate-600 mb-2">
                                Current Matches:
                              </p>
                              <div className="space-y-1 text-sm text-slate-700">
                                {Object.entries(q.correctAnswer || {}).map(
                                  ([rightIdx, leftIdx]) => (
                                    <div
                                      key={rightIdx}
                                      className="flex items-center gap-2"
                                    >
                                      <span className="text-[#4a9cb0] font-medium">
                                        {q.options?.left?.[leftIdx] ||
                                          `Item ${parseInt(leftIdx) + 1}`}
                                      </span>
                                      <span className="text-slate-400">→</span>
                                      <span className="text-[#f5a65b] font-medium">
                                        {q.options?.right?.[rightIdx] ||
                                          `Match ${parseInt(rightIdx) + 1}`}
                                      </span>
                                      <button
                                        onClick={() => {
                                          const newCorrect = {
                                            ...q.correctAnswer,
                                          };
                                          delete newCorrect[rightIdx];
                                          updateLocalQuestion(q.questionId, {
                                            correctAnswer: newCorrect,
                                          });
                                          updateQuestion(q.questionId, {
                                            correctAnswer: newCorrect,
                                          });
                                        }}
                                        className="ml-auto text-slate-400 hover:text-red-500 transition-colors"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ),
                                )}
                                {Object.keys(q.correctAnswer || {}).length ===
                                  0 && (
                                  <p className="text-slate-400 italic">
                                    No matches set. Drag from blue dot to orange
                                    dot.
                                  </p>
                                )}
                              </div>
                            </div>

                            <p className="text-xs text-slate-500 mt-3 italic">
                              💡 Drag from a blue dot on the left to an orange
                              dot on the right to create a match
                            </p>
                          </div>
                        )}
                        <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-slate-200 mt-8">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-slate-500" />
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                Time Limit
                              </span>
                            </div>

                            <div className="flex items-center gap-3 flex-1 max-w-xs">
                              <input
                                type="range"
                                min="10"
                                max="120"
                                step="5"
                                value={q.duration}
                                onChange={(e) => {
                                  const duration = Number(e.target.value);
                                  updateLocalQuestion(q.questionId, {
                                    duration,
                                  });
                                  updateQuestion(q.questionId, { duration });
                                }}
                                className="flex-1 h-2 bg-slate-200 rounded-full appearance-none cursor-pointer
        [&::-webkit-slider-thumb]:appearance-none
        [&::-webkit-slider-thumb]:w-4
        [&::-webkit-slider-thumb]:h-4
        [&::-webkit-slider-thumb]:rounded-full
        [&::-webkit-slider-thumb]:bg-[#4a9cb0]
        [&::-webkit-slider-thumb]:cursor-pointer
        [&::-webkit-slider-thumb]:shadow-md
        [&::-webkit-slider-thumb]:hover:scale-110
        [&::-webkit-slider-thumb]:transition-transform
        [&::-moz-range-thumb]:w-4
        [&::-moz-range-thumb]:h-4
        [&::-moz-range-thumb]:rounded-full
        [&::-moz-range-thumb]:bg-[#4a9cb0]
        [&::-moz-range-thumb]:border-0
        [&::-moz-range-thumb]:cursor-pointer
        [&::-moz-range-thumb]:shadow-md
        [&::-moz-range-thumb]:hover:scale-110
        [&::-moz-range-thumb]:transition-transform"
                              />
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  min="10"
                                  max="120"
                                  value={q.duration}
                                  onChange={(e) => {
                                    let duration = Number(e.target.value);
                                    // Clamp between 10 and 120
                                    if (duration < 10) duration = 10;
                                    if (duration > 120) duration = 120;
                                    updateLocalQuestion(q.questionId, {
                                      duration,
                                    });
                                    updateQuestion(q.questionId, { duration });
                                  }}
                                  className="w-14 bg-white/80 border border-slate-200 rounded-lg px-2 py-1 text-sm font-bold text-[#4a9cb0] text-center outline-none focus:border-[#4a9cb0]"
                                />
                                <span className="text-xs font-medium text-slate-500">
                                  s
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-slate-500" />
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                              Points
                            </span>
                            <input
                              type="number"
                              className="w-12 bg-transparent text-sm font-bold text-[#4a9cb0] border-none focus:ring-0 p-0"
                              value={q.points || 0}
                              onChange={(e) => {
                                const points = Number(e.target.value);
                                updateLocalQuestion(q.questionId, { points });
                                updateQuestion(q.questionId, { points });
                              }}
                            />
                          </div>
                          {(q.questionType === "MCQ" ||
                            q.questionType === "IMAGE_BASED") && (
                            <div className="flex items-center gap-4">
                              {/* Label */}
                              <div className="flex items-center gap-2">
                                <ListChecks className="w-4 h-4 text-slate-500" />
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                  Multiple Answers
                                </span>
                              </div>

                              {/* Toggle */}
                              <button
                                type="button"
                                onClick={() => {
                                  const allowMultiple = !q.allowMultipleAnswers;

                                  updateLocalQuestion(q.questionId, {
                                    allowMultipleAnswers: allowMultiple,
                                    correctAnswer: allowMultiple
                                      ? q.correctAnswer
                                      : q.correctAnswer?.slice(0, 1),
                                  });

                                  updateQuestion(q.questionId, {
                                    allowMultipleAnswers: allowMultiple,
                                    correctAnswer: allowMultiple
                                      ? q.correctAnswer
                                      : q.correctAnswer?.slice(0, 1),
                                  });
                                }}
                                className={`relative w-11 h-6 rounded-full transition-colors
      ${q.allowMultipleAnswers ? "bg-[#4a9cb0]" : "bg-slate-300"}
    `}
                              >
                                <span
                                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform
        ${q.allowMultipleAnswers ? "translate-x-5" : ""}
      `}
                                />
                              </button>

                              {/* Status */}
                              <span
                                className={`text-xs font-semibold ${
                                  q.allowMultipleAnswers
                                    ? "text-[#4a9cb0]"
                                    : "text-slate-400"
                                }`}
                              >
                                {q.allowMultipleAnswers ? "ON" : "OFF"}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700 transition-colors">
                          <Copy className="w-5 h-5" />
                        </button>
                        <button
                          className="p-2 hover:bg-red-50 rounded-lg text-slate-500 hover:text-red-500 transition-colors"
                          onClick={() => deleteQuestion(q.questionId)}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Empty State / Add Suggestion */}
                <button
                  onClick={() => addQuestion("MCQ")}
                  className="w-full h-32 border-2 border-dashed border-white/50 rounded-[2rem] flex flex-col items-center justify-center gap-3 hover:border-white hover:bg-white/20 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center text-white group-hover:bg-white group-hover:text-[#4a9cb0] transition-colors">
                    <PlusCircle className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-bold text-white group-hover:text-white transition-colors uppercase tracking-widest">
                    Click to add another question
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl font-bold text-white">Quiz Settings</h1>
              <p className="text-white/70 mt-1 mb-8">
                Update your assessment's core behavior and security.
              </p>

              <div className="bg-slate-50/90 backdrop-blur-sm border border-slate-200/50 rounded-3xl p-8 flex justify-between shadow-xl">
                <div className="flex items-center gap-4">
                  <AlertCircle className="w-6 h-6 text-[#f5a65b]" />
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">
                      Delete Quiz
                    </h3>
                    <p className="text-sm text-slate-600">
                      Permanently remove this quiz.
                    </p>
                  </div>
                </div>
                <button className="px-6 py-3 border-2 border-red-400 text-red-500 rounded-xl hover:bg-red-50 font-medium">
                  Delete Permanently
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
