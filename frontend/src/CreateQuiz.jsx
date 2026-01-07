import { useState } from "react";
import {
  Calendar,
  Clock,
  Layout,
  Sparkles,
  X,
  UserCheck,
  ShieldCheck,
  Trophy,
  Settings2,
} from "lucide-react";
import { useNavigate } from "react-router";
import { createQuiz } from "./services/AuthService";
import useAuth from "./auth/store";

export default function CreateQuiz() {
  const navigate = useNavigate();
  const toInstant = (dateTimeLocal) => {
    return dateTimeLocal ? new Date(dateTimeLocal).toISOString() : null;
  };
  const checkLogin = useAuth((state) => state.checkLogin);
  const user = useAuth((state) => state.user);
  const hostId = user.id;

  const [quiz, setQuiz] = useState({
    quizName: "",
    mode: "SERVER",
    startTime: "",
    endTime: "",
    allowGuest: true,
    shuffleQuestions: false,
    showLeaderboard: true,
    passPercentage: 50,
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const val = type === "checkbox" ? e.target.checked : value;
    setQuiz((prev) => ({
      ...prev,
      [name]: val,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      quizName: quiz.quizName,
      mode: quiz.mode,
      startTime: toInstant(quiz.startTime),
      endTime: toInstant(quiz.endTime),
      allowGuest: quiz.mode === "SERVER" ? quiz.allowGuest : false,
      shuffleQuestions: quiz.shuffleQuestions,
      showLeaderboard: quiz.showLeaderboard,
      host: hostId,
    };

    try {
      const data = await createQuiz(payload);
      console.log("Quiz Created:", data);
      navigate(`/quiz/${data.quizId}`);
    } catch (error) {
      console.error("Quiz creation failed:", error);
      alert(`❌ Error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#1b8599] bg-[radial-gradient(circle_at_top_right,_#26a2ba,_transparent)] p-4 md:p-8 flex items-center justify-center font-sans">
      <div className="w-full max-w-2xl bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-8 md:p-12 pb-6">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1e293b] leading-tight">
            Create your next <span className="text-[#ff9d5c]">Quiz</span>
          </h1>
          <p className="text-slate-500 mt-4 text-lg">
            Set up your assessment parameters to start evaluating your students
            or candidates.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 md:p-8 pt-0 space-y-8">
          <div className="grid gap-6">
            {/* Quiz Name */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 ml-1">
                <Layout className="w-4 h-4 text-[#1b8599]" />
                QUIZ NAME
              </label>
              <input
                type="text"
                name="quizName"
                value={quiz.quizName}
                onChange={handleChange}
                required
                placeholder="e.g. Advanced Mathematics Final"
                className="w-full bg-slate-50 border-2 border-slate-100 focus:border-[#1b8599] focus:bg-white outline-none px-5 py-4 rounded-2xl transition-all text-slate-800 placeholder:text-slate-400"
              />
            </div>

            {/* Quiz Mode */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 ml-1">
                <Clock className="w-4 h-4 text-[#1b8599]" />
                ASSESSMENT MODE
              </label>
              <div className="relative">
                <select
                  name="mode"
                  value={quiz.mode}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border-2 border-slate-100 focus:border-[#1b8599] focus:bg-white outline-none px-5 py-4 rounded-2xl transition-all text-slate-800 appearance-none cursor-pointer"
                >
                  <option value="SERVER">SERVER (Standard Proctored)</option>
                  <option value="RANDOMIZED">RANDOMIZED (Anti-Cheat)</option>
                  <option value="LAN">LAN (Local Network)</option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {quiz.mode === "SERVER" && (
              <div className="bg-[#1b8599]/5 p-6 rounded-[2rem] border border-[#1b8599]/10 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-xl shadow-sm text-[#1b8599]">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">Guest Access</h4>
                      <p className="text-xs text-slate-500">
                        Allow participants to join without signing in
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="allowGuest"
                      checked={quiz.allowGuest}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1b8599]"></div>
                  </label>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              {/* Shuffle Questions */}
              <div className="flex items-center justify-between p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-[#1b8599]" />
                  <span className="text-sm font-bold text-slate-700">
                    Shuffle Questions
                  </span>
                </div>
                <input
                  type="checkbox"
                  name="shuffleQuestions"
                  checked={quiz.shuffleQuestions}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-slate-300 text-[#1b8599] focus:ring-[#1b8599]"
                />
              </div>

              {/* Show Leaderboard */}
              <div className="flex items-center justify-between p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl">
                <div className="flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-[#1b8599]" />
                  <span className="text-sm font-bold text-slate-700">
                    Leaderboard
                  </span>
                </div>
                <input
                  type="checkbox"
                  name="showLeaderboard"
                  checked={quiz.showLeaderboard}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-slate-300 text-[#1b8599] focus:ring-[#1b8599]"
                />
              </div>
            </div>

            {/* Pass Percentage */}
            {/* <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 ml-1">
                <Settings2 className="w-4 h-4 text-[#1b8599]" />
                PASSING PERCENTAGE ({quiz.passPercentage}%)
              </label>
              <input
                type="range"
                name="passPercentage"
                min="0"
                max="100"
                step="5"
                value={quiz.passPercentage}
                onChange={handleChange}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1b8599]"
              />
            </div> */}

            {/* Time Settings */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 ml-1">
                  <Calendar className="w-4 h-4 text-[#1b8599]" />
                  START TIME
                </label>
                <input
                  type="datetime-local"
                  name="startTime"
                  value={quiz.startTime}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border-2 border-slate-100 focus:border-[#1b8599] focus:bg-white outline-none px-5 py-4 rounded-2xl transition-all text-slate-800"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 ml-1">
                  <Calendar className="w-4 h-4 text-[#1b8599]" />
                  END TIME
                </label>
                <input
                  type="datetime-local"
                  name="endTime"
                  value={quiz.endTime}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border-2 border-slate-100 focus:border-[#1b8599] focus:bg-white outline-none px-5 py-4 rounded-2xl transition-all text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col md:flex-row justify-end gap-4 pt-4">
            <button
              type="button"
              className="px-8 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
              onClick={() => navigate(`/dashboard`)}
            >
              <X className="w-5 h-5" />
              Cancel
            </button>
            <button
              type="submit"
              className="px-10 py-4 bg-[#ff9d5c] text-white rounded-2xl font-bold shadow-lg shadow-orange-200 hover:bg-[#f88d45] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 group"
            >
              Create Quiz
              <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
