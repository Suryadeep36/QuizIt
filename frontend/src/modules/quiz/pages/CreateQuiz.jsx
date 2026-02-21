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
} from "lucide-react";
import toast from "react-hot-toast"
import { useNavigate } from "react-router";
import { createQuiz } from "../../../services/AuthService";
import useAuth from "../../../stores/store";

export default function CreateQuiz() {
  const navigate = useNavigate();
  const toInstant = (dateTimeLocal) => {
    return dateTimeLocal ? new Date(dateTimeLocal).toISOString() : null;
  };
  const checkLogin = useAuth((state) => state.checkLogin);
  const user = useAuth((state) => state.user);
  const hostId = user.id;
  const [emailInput, setEmailInput] = useState("");
  const [quiz, setQuiz] = useState({
    quizName: "",
    mode: "SERVER",
    startTime: "",
    endTime: "",
    allowGuest: true,
    shuffleQuestions: false,
    showLeaderboard: true,
    passPercentage: 50,
    allowedEmails: [],
  });



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
      allowedEmails: [],
    };
    console.log(payload.allowedEmails);
    try {
      const data = await createQuiz(payload);
      console.log("Quiz Created:", data);
      navigate(`/quiz/${data.quizId}`);
    } catch (error) {
      console.error("Quiz creation failed:", error);
      toast.error(error.response?.data?.message || error.message || "Quiz are not loaded!")
      // alert(`❌ Error: ${error.message}`);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Don't let standard change handler touch allowedEmails
    if (name === "allowedEmails") return;
    setQuiz((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleKeyDown = (e) => {
    if (["Enter", "Tab", ","].includes(e.key)) {
      e.preventDefault();
      addEmail();
    }
  };

  const addEmail = () => {
    const trimmed = emailInput.trim().toLowerCase();
    // Validate email format and check for duplicates
    if (trimmed && /^\S+@\S+\.\S+$/.test(trimmed)) {
      if (!quiz.allowedEmails.includes(trimmed)) {
        setQuiz(prev => ({
          ...prev,
          allowedEmails: [...prev.allowedEmails, trimmed]
        }));
        setEmailInput("");
      } else {
        toast.error("Email already added");
      }
    } else if (trimmed !== "") {
      toast.error("Please enter a valid email");
    }
  };

  const removeEmail = (indexToRemove) => {
    setQuiz(prev => ({
      ...prev,
      allowedEmails: prev.allowedEmails.filter((_, index) => index !== indexToRemove)
    }));
  };

  return (
  <div className="min-h-screen bg-[#f1f5f9] p-2 md:p-10 flex items-center justify-center font-sans">
    {/* Max-width increased to 6xl for desktop, width-full for mobile */}
    <div className="w-full max-w-6xl bg-white rounded-[1.5rem] md:rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-200 overflow-hidden flex flex-col lg:flex-row">
      
      {/* LEFT COLUMN: Main Settings */}
      <div className="flex-1 p-6 md:p-12 border-b lg:border-b-0 lg:border-r border-slate-100">
        <header className="mb-8 md:mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#1b8599] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#1b8599]/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="font-bold text-[#1b8599] tracking-widest text-xs uppercase">New Assessment</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 uppercase">Configuration</h1>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
          {/* Quiz Name */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase ml-1">Quiz Title</label>
            <input
              type="text"
              name="quizName"
              value={quiz.quizName}
              onChange={handleChange}
              required
              placeholder="Enter quiz name..."
              className="w-full bg-slate-50 border-2 border-slate-100 focus:border-[#1b8599] focus:bg-white outline-none px-5 py-3 md:px-6 md:py-4 rounded-2xl transition-all font-bold text-slate-800 shadow-sm"
            />
          </div>

          {/* Mode & Toggle Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase ml-1">Mode</label>
              <select
                name="mode"
                value={quiz.mode}
                onChange={handleChange}
                className="w-full bg-slate-50 border-2 border-slate-100 focus:border-[#1b8599] outline-none px-5 py-3 md:py-4 rounded-2xl font-bold text-slate-700 appearance-none cursor-pointer"
              >
                <option value="SERVER">SERVER</option>
                <option value="RANDOMIZED">RANDOMIZED</option>
                <option value="LAN">LAN</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase ml-1">Guest Entry</label>
              <div className={`flex items-center justify-between px-5 py-3 md:py-4 rounded-2xl border-2 transition-all ${quiz.mode === 'RANDOMIZED' ? 'bg-slate-100 border-transparent opacity-50' : 'bg-slate-50 border-slate-100'}`}>
                <span className="text-sm font-bold text-slate-600">Allow Guests</span>
                <input 
                  type="checkbox" 
                  name="allowGuest" 
                  disabled={quiz.mode === 'RANDOMIZED'}
                  checked={quiz.mode === 'RANDOMIZED' ? false : quiz.allowGuest} 
                  onChange={handleChange}
                  className="w-5 h-5 accent-[#1b8599]"
                />
              </div>
            </div>
          </div>

          {/* Timing Section */}
          <div className="p-4 md:p-6 bg-[#1b8599]/5 rounded-[1.5rem] md:rounded-[2rem] border border-[#1b8599]/10 space-y-4">
            <div className="flex items-center gap-2 text-[#1b8599] mb-2">
              <Calendar className="w-4 h-4" />
              <span className="text-xs font-black uppercase">Availability Window</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 ml-1">START</span>
                <input type="datetime-local" name="startTime" value={quiz.startTime} onChange={handleChange} className="w-full bg-white px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:ring-2 ring-[#1b8599]/20" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 ml-1">END</span>
                <input type="datetime-local" name="endTime" value={quiz.endTime} onChange={handleChange} className="w-full bg-white px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:ring-2 ring-[#1b8599]/20" />
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 p-4 border border-slate-100 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors bg-white md:bg-transparent">
              <input type="checkbox" name="shuffleQuestions" checked={quiz.shuffleQuestions} onChange={handleChange} className="w-4 h-4 accent-[#1b8599]" />
              <span className="text-sm font-bold text-slate-700">Shuffle Questions</span>
            </label>
            <label className="flex items-center gap-3 p-4 border border-slate-100 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors bg-white md:bg-transparent">
              <input type="checkbox" name="showLeaderboard" checked={quiz.showLeaderboard} onChange={handleChange} className="w-4 h-4 accent-[#1b8599]" />
              <span className="text-sm font-bold text-slate-700">Show Leaderboard</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col md:flex-row gap-3">
            <button type="submit" className="flex-1 order-1 md:order-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95">
              Launch Quiz
            </button>
            <button type="button" onClick={() => navigate('/dashboard')} className="flex-1 order-2 md:order-2 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all">
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* RIGHT COLUMN: Email Management (Responsive) */}
      <div className={`w-full lg:w-[400px] bg-slate-50 p-6 md:p-8 flex flex-col transition-all duration-500 ${quiz.mode === 'RANDOMIZED' ? 'block' : 'hidden'}`}>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-black text-slate-900 uppercase text-sm tracking-tighter">Access Registry</h3>
            <span className="bg-[#ff9d5c] text-white text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">ANTI-CHEAT</span>
          </div>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">Limit entry to specific participants.</p>
        </div>

        {/* Input Area */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Add participant email..."
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-white border-2 border-slate-200 focus:border-[#1b8599] outline-none pl-4 pr-12 py-3 md:py-4 rounded-2xl text-sm font-bold transition-all"
          />
          <button 
            type="button"
            onClick={addEmail}
            className="absolute right-2 top-1.5 bottom-1.5 px-3 bg-[#1b8599] text-white rounded-xl flex items-center justify-center hover:bg-[#166d7d] transition-colors"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Email List Container */}
        <div className="flex-1 flex flex-col min-h-[300px] lg:min-h-0">
          <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] border border-slate-200 border-dashed overflow-hidden flex flex-col max-h-[400px] lg:max-h-[540px] shadow-inner">
            <div className="p-4 border-b border-slate-100 bg-white/80 flex justify-between items-center sticky top-0 z-10">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enrolled</span>
                <span className="text-[10px] font-black text-[#1b8599]">{quiz.allowedEmails.length} Users</span>
              </div>
              {quiz.allowedEmails.length > 0 && (
                <button type="button" onClick={() => setQuiz(prev => ({...prev, allowedEmails: []}))} className="text-[10px] font-bold text-red-400 hover:text-red-600 uppercase">
                  Clear
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar bg-slate-50/30">
              {quiz.allowedEmails.length === 0 ? (
                <div className="py-8 flex flex-col items-center justify-center text-center opacity-40">
                  <UserCheck className="w-8 h-8 mb-2 text-slate-400" />
                  <p className="text-[10px] font-bold px-6">List is empty.</p>
                </div>
              ) : (
                quiz.allowedEmails.map((email, index) => (
                  <div key={index} className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-100 shadow-sm transition-all">
                    <span className="text-xs font-bold text-slate-700 truncate mr-2">{email}</span>
                    <button type="button" onClick={() => removeEmail(index)} className="text-slate-300 hover:text-red-500 p-1">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}
