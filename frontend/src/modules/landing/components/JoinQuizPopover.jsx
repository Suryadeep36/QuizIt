import { useState } from "react";
import { useNavigate } from "react-router"; // 1. Added import
import { X, ArrowRight, Hash } from "lucide-react";
import toast from "react-hot-toast";
import { getQuizIdSessionIdByCode } from "../../../services/AuthService";

export default function JoinQuizPopover({ onClose }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false); // Added loading state
  const navigate = useNavigate(); // 2. Initialize navigate

  const handleChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (value.length <= 6) {
      setCode(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // 3. Important: Prevent page refresh

    if (code.length !== 6) {
      return toast.error("Join code should be 6 letters.");
    }

    try {
      setLoading(true);
      const data = await getQuizIdSessionIdByCode(code);

      if (data && data.quizId && data.sessionId) {
        onClose();
        // 4. Navigate to the dynamic route
        navigate(`/quiz/${data.quizId}/join/${data.sessionId}`);
      } else {
        toast.error("Invalid response from server.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Invalid Join Code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute right-0 top-full mt-3 w-72 bg-white text-slate-700 p-5 rounded-2xl shadow-2xl border border-slate-200 z-50 animate-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
          <Hash className="w-4 h-4 text-cyan-600" />
          Enter Join Code
        </h4>
        <button
          type="button" // Set type to button to avoid form submission
          onClick={onClose}
          className="p-1 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="relative mb-4">
          <input
            autoFocus
            type="text"
            value={code}
            onChange={handleChange}
            placeholder="EX: AB12CD"
            disabled={loading}
            className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-3 px-4 text-center text-2xl font-black tracking-[0.2em] text-cyan-700 outline-none focus:border-cyan-500 focus:bg-white transition-all placeholder:text-slate-300 placeholder:tracking-normal placeholder:text-sm placeholder:font-medium disabled:opacity-50"
          />
          {code.length === 6 && !loading && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 animate-in fade-in slide-in-from-right-2">
              <div className="bg-cyan-500 text-white p-1 rounded-full">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={code.length !== 6 || loading}
          className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
            code.length === 6 && !loading
              ? "bg-cyan-600 text-white shadow-lg shadow-cyan-200 hover:bg-cyan-700 active:scale-[0.98]"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          }`}
        >
          {loading ? "Verifying..." : "Join Session"}
        </button>
      </form>

      <p className="mt-3 text-[10px] text-center text-slate-400 uppercase font-bold tracking-tight">
        Ask your host for the 6-digit code
      </p>
    </div>
  );
}