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
} from "lucide-react";
import { useParams } from "react-router";

export default function QuizManagementDashboard() {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [activeTab, setActiveTab] = useState("questions");
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([
    {
      id: "1",
      type: "MCQ",
      text: "What is the derivative of sin(x)?",
      points: 5,
      timeLimit: 60,
      correctAnswer: "cos(x)",
      options: ["cos(x)", "-cos(x)", "sin(x)", "tan(x)"],
    },
  ]);

  const normalizeQuestionFromApi = (q) => ({
    questionId: q.questionId,
    quizId: q.quizId,
    content: q.content ?? "",
    questionType: q.questionType,
    duration: q.duration ?? 30,
    points: q.points ?? 1,
    difficultyLevel: q.difficultyLevel,

    options: q.options
      ? ["A", "B", "C", "D"].map((key) => q.options[key] ?? "")
      : undefined,

    correctAnswer: q.correctAnswer,
  });

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
      options:
        type === "MCQ"
          ? {
              A: "",
              B: "",
              C: "",
              D: "",
            }
          : {},
      correctAnswer: type === "MCQ" ? { key: "A" } : {},
    };
    const res = await fetch(`http://localhost:3000/quizit/question`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newQuestion),
    });

    const savedQuestion = await res.json();
    setQuestions((prev) => [...prev, normalizeQuestionFromApi(savedQuestion)]);
  };

  const deleteQuestion = async (questionId) => {
    setQuestions((prev) => prev.filter((q) => q.questionId !== questionId));

    try {
      await fetch(`http://localhost:3000/quizit/question/${questionId}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Failed to delete question");
    }
  };

  const updateLocalQuestion = (questionId, patch) => {
    setQuestions((prev) =>
      prev.map((q) => (q.questionId === questionId ? { ...q, ...patch } : q))
    );
  };
  const updateQuestion = useRef(
    debounce(async (questionId, patch) => {
      console.log(patch);
      await fetch(`http://localhost:3000/quizit/question/${questionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
    }, 600)
  ).current;

  useEffect(() => {
    if (!quizId) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const [quizRes, quesRes] = await Promise.all([
          fetch(`http://localhost:3000/quizit/quiz/${quizId}`),
          fetch(`http://localhost:3000/quizit/questions/${quizId}`),
        ]);

        const quizData = await quizRes.json();
        const quesData = await quesRes.json();

        if (!quizRes.ok) throw new Error(quizData.message);
        if (!quesRes.ok) throw new Error(quesData.message);

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

                  <div className="absolute right-0 mt-2 w-48 bg-slate-50/95 backdrop-blur-md border border-slate-200 rounded-2xl p-2 shadow-xl hidden group-hover:block z-50">
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
                            {q.questionType}
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

                        {q.questionType === "MCQ" && (
                          <div className="grid md:grid-cols-2 gap-4 mt-6">
                            {q.options.map((value, i) => {
                              const key = String.fromCharCode(65 + i);
                              const isCorrect = q.correctAnswer?.key === key;
                              const selectCorrectAnswer = () => {
                                const newCorrect = { key };
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
                                  className={`flex items-center gap-3 bg-white/80 border border-slate-200 rounded-2xl p-4 transition-all focus-within:border-[#4a9cb0] focus-within:bg-white`}
                                  onClick={selectCorrectAnswer}
                                >
                                  <div
                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${
                                      isCorrect
                                        ? "border-[#f5a65b] text-[#f5a65b] bg-[#f5a65b]/10"
                                        : "border-slate-300 text-slate-400"
                                    }`}
                                  >
                                    {key}
                                  </div>

                                  <input
                                    type="text"
                                    placeholder={`Option ${key}`}
                                    className="bg-transparent border-none outline-none flex-1 text-sm text-slate-700"
                                    value={value}
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

                        {q.questionType === "NUMERICAL" && (
                          <div className="mt-4">
                            <label className="text-sm font-bold text-slate-600 mb-2 block">
                              Correct Answer
                            </label>
                            <input
                              type="number"
                              className="w-48 bg-white/80 border border-slate-200 rounded-2xl p-3 outline-none text-slate-800 focus:border-[#4a9cb0]"
                              value={q.correctAnswer?.value || ""}
                              placeholder="Enter correct answer"
                              onChange={(e) => {
                                const value = e.target.value;
                                const newCorrect = { value };
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

                        {q.questionType === "TRUE_FALSE" && (
                          <div className="flex items-center gap-4 mt-4">
                            {["TRUE", "FALSE"].map((val) => {
                              const isSelected = q.correctAnswer?.value === val;
                              return (
                                <button
                                  key={val}
                                  className={`px-4 py-2 rounded-xl font-bold transition-colors ${
                                    isSelected
                                      ? "bg-[#4a9cb0] text-white"
                                      : "bg-white/80 text-slate-800 border border-slate-200"
                                  }`}
                                  onClick={() => {
                                    const newCorrect = { value: val };
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
                        <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-slate-200 mt-8">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-500" />
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                              Time Limit
                            </span>
                            <select
                              className="bg-transparent text-sm font-bold text-[#4a9cb0] border-none focus:ring-0 cursor-pointer"
                              defaultValue={q.duration}
                              onChange={(e) => {
                                const duration = Number(e.target.value);
                                updateLocalQuestion(q.questionId, { duration });
                                updateQuestion(q.questionId, { duration });
                              }}
                            >
                              <option value={30}>30s</option>
                              <option value={60}>60s</option>
                              <option value={120}>2m</option>
                            </select>
                          </div>
                          <div className="flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-slate-500" />
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                              Points
                            </span>
                            <input
                              type="number"
                              className="w-12 bg-transparent text-sm font-bold text-[#4a9cb0] border-none focus:ring-0 p-0"
                              defaultValue={q.points}
                              onChange={(e) => {
                                const points = Number(e.target.value);
                                updateLocalQuestion(q.questionId, { points });
                                updateQuestion(q.questionId, { points });
                              }}
                            />
                          </div>
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
