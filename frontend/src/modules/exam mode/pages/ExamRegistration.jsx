import React, { useEffect, useState } from "react";
import {
  Calendar,
  IdCard,
  ArrowRight,
  ClipboardCheck,
  User,
  Clock,
  Timer,
} from "lucide-react";
import toast from "react-hot-toast";
import useAuth from "../../../stores/store";
import { useParams } from "react-router";
import { getQuizById, getQuizForParticipantById, registerExam } from "../../../services/AuthService";

export default function ExamRegistration() {
  const user = useAuth((state) => state.user);
  const { quizId, token } = useParams();
  const [quiz, setQuiz] = useState(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    birthDate: "",
    enrollmentId: "",
  });

  useEffect(() => {
    async function fetchQuiz() {
      try {
        const response = await getQuizForParticipantById(quizId);
        console.log(response)
        setQuiz(response);
      } catch (error) {
        toast.error("Unable to load quiz details");
      }
    }

    if (quizId) {
      fetchQuiz();
    }
  }, [quizId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const registrationData = {
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      email: user.email,
      birthDate: formData.birthDate, 
      enrollmentId: formData.enrollmentId,
      registrationToken: token,
      quizId: quizId, 
    };

    try {
      const registrateredData = await registerExam(registrationData);
      console.log(registrateredData);
      toast.success("Details saved successfully!");
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message || err.message || "Send failed");
    }
  };

  if (!quiz) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  const formatDate = (iso) => {
    if (!iso) return "TBA";
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (iso) => {
    if (!iso) return "TBA";
    return new Date(iso).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-0 md:p-6 font-sans">
      {/* Container: Full width on mobile, max-width on desktop */}
      <div className="w-full max-w-[1000px] bg-white md:rounded-[2.5rem] shadow-2xl shadow-slate-200/50 flex flex-col md:flex-row overflow-hidden border border-slate-100">
        {/* LEFT SIDE: Assessment Info (Teal Sidebar) */}
        <div className="w-full md:w-[40%] bg-[#1b8599] p-8 md:p-12 text-white flex flex-col justify-between relative">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full mb-6 border border-white/10">
              <ClipboardCheck className="w-4 h-4 text-white" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Registration Portal
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-black uppercase leading-tight mb-8">
              {quiz.quizName}
            </h1>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase opacity-60">
                    Date
                  </p>
                  <p className="font-bold">{formatDate(quiz.startTime)}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                  <Timer className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase opacity-60">
                    Start Time
                  </p>
                  <p className="font-bold">{formatTime(quiz.startTime)}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase opacity-60">
                    Duration
                  </p>
                  <p className="font-bold">
                    {quiz.startTime && quiz.endTime
                      ? Math.round(
                          (new Date(quiz.endTime) - new Date(quiz.startTime)) /
                            60000,
                        ) + " Mins"
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden md:block relative z-10 pt-10 border-t border-white/10 mt-10">
            <p className="text-xs font-medium leading-relaxed opacity-70">
              Ensure you have a stable internet connection before proceeding.
              Good luck!
            </p>
          </div>

          {/* Decorative Background Elements */}
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        </div>

        {/* RIGHT SIDE: Registration Form */}
        <div className="flex-1 p-8 md:p-12 lg:p-16">
          <header className="mb-10">
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
              Candidate Profile
            </h2>
            <p className="text-slate-400 text-sm font-medium">
              Verify your details to gain access.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Identity Card */}
            <div className="group transition-all">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                Identity
              </label>
              <div className="flex items-center gap-4 bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl group-focus-within:border-[#1b8599]/30 transition-all">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#1b8599]">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">
                    Signed in as
                  </p>
                  <p className="text-sm font-black text-slate-800 break-all">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                  First Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: David"
                  className="w-full bg-slate-50 border-2 border-slate-100 focus:border-[#1b8599] focus:bg-white outline-none px-5 py-4 rounded-2xl font-bold text-slate-700 transition-all placeholder:text-slate-300"
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                  Last Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Miller"
                  className="w-full bg-slate-50 border-2 border-slate-100 focus:border-[#1b8599] focus:bg-white outline-none px-5 py-4 rounded-2xl font-bold text-slate-700 transition-all placeholder:text-slate-300"
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  required
                  className="w-full bg-slate-50 border-2 border-slate-100 focus:border-[#1b8599] focus:bg-white outline-none px-5 py-4 rounded-2xl font-bold text-slate-700 transition-all"
                  onChange={(e) =>
                    setFormData({ ...formData, birthDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                  Student / Roll ID
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 2024-ARCH-01"
                  className="w-full bg-slate-50 border-2 border-slate-100 focus:border-[#1b8599] focus:bg-white outline-none px-5 py-4 rounded-2xl font-bold text-slate-700 transition-all placeholder:text-slate-300"
                  onChange={(e) =>
                    setFormData({ ...formData, enrollmentId: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl hover:shadow-slate-300 flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                Register <ArrowRight className="w-5 h-5" />
              </button>
              <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest mt-6">
                Identity Verification Required • Secure Session
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
