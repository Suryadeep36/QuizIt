import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { deleteQuiz, getQuizsByHostId } from "../../../services/AuthService";
import useAuth from "../../../stores/store";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import DeleteConfirmationModal from "../component/DeleteConfirmationModal";
import AttendedQuizzes from "../../profile/components/AttendedQuizzes";
import { Badge, BarChart3, ChevronRight, Clock, Copy, Edit3, ExternalLink, Layout, Play, Plus, Settings, Trash2 } from "lucide-react";
import CloneQuizModal from "../component/CloneQuizModal";
export default function Dashboard() {
  const [quizzes, setQuizzes] = useState([
    {
      idx: 0,
      quizId: "41d1237d-8a7f-4472-a14c-dffc7f48ef84",
      createdAt: "2025-12-18T17:27:47.399Z",
      startTime: "2025-12-20T10:00:00Z",
      endTime: "2025-12-20T11:00:00Z",
      mode: "SERVER",
      quizName: "Java Basics Quiz",
      quizType: "MCQ",
      hostUserId: "a94d6b81-bfff-4742-8dbe-92d684a93000",
    },
    {
      idx: 1,
      quizId: "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      createdAt: null,
      startTime: null,
      endTime: null,
      mode: null, // Draft quiz
      quizName: "Parth",
      quizType: null,
      hostUserId: "a94d6b81-bfff-4742-8dbe-92d684a93000",
    },
    {
      idx: 2,
      quizId: "f3a2c1d4-9b72-4c11-babc-71a0e6e91234",
      createdAt: "2025-12-19T09:00:00Z",
      startTime: null,
      endTime: "2025-12-25T23:59:00Z",
      mode: "EXAM",
      quizName: "DSA Practice Quiz",
      quizType: "MCQ",
      hostUserId: "a94d6b81-bfff-4742-8dbe-92d684a93000",
    },
  ]);

  const checkLogin = useAuth((state) => state.checkLogin);
  const user = useAuth((state) => state.user);

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const hostId = (user && user.id) ? user.id : null;;
  const isDraftQuiz = (quiz) => !quiz.mode;
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);
  const isServerQuiz = (quiz) => quiz.mode === "SERVER";
  const isRandomizedQuiz = (quiz) => quiz.mode === "EXAM";
  // 1. State to track which quiz is being deleted (null = modal closed)
  const [quizToDelete, setQuizToDelete] = useState(null);
  // 2. The actual function that runs AFTER the user types the name and clicks "Delete" in the modal
  const handleDeleteQuiz = async () => {
    if (!quizToDelete) return;

    const { quizId } = quizToDelete; // Get ID from the state object

    try {
      setLoading(true);

      // Call your API
      const data = await deleteQuiz(quizId);

      // Update UI
      setQuizzes((currentQuizzes) =>
        currentQuizzes.filter((quiz) => quiz.quizId !== quizId)
      );

      toast.success(data?.message || "Quiz deleted successfully");

      // 3. Close the modal on success
      setQuizToDelete(null);

    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        err.message ||
        "Quiz can not be deleted!"
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!checkLogin()) {
      navigate("/auth", { replace: true });
      return;
    }


    if (!user?.id) return;

    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        const data = await getQuizsByHostId(user.id);
        const activeQuizzes = data.filter(quiz => quiz.status !== "ENDED");
        setQuizzes(activeQuizzes);
      } catch (err) {
        console.log(err)
        toast.error(
          err.response?.data?.message ||
          err.message ||
          "Quizzes are not loaded!"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [user?.id, checkLogin, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-cyan-700">
        Loading your quizzes...
      </div>
    );
  }

const containerVars = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardVars = {
    hidden: { y: 20, opacity: 0 },
    show: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

return (
    <div className="min-h-screen bg-linear-to-br from-cyan-600 to-cyan-700 px-6 py-10 font-sans selection:bg-orange-200">
      <div className="max-w-6xl mx-auto">
        {/* Top Navigation / Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <motion.div 
            initial={{ x: -20, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                <Layout className="text-white" size={24} />
              </div>
              <h1 className="text-4xl font-extrabold text-white tracking-tight">
                Quiz<span className="text-orange-300">It</span> Dashboard
              </h1>
            </div>
            <p className="text-cyan-100 flex items-center gap-2 text-sm md:text-base">
              Welcome back, <span className="font-bold text-white uppercase tracking-wider text-xs bg-white/10 px-2 py-0.5 rounded-md">{user?.username}</span>
            </p>
          </motion.div>

          <motion.div 
            initial={{ x: 20, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }}
            className="flex flex-wrap items-center gap-3"
          >
            <button
              onClick={() => setIsCloneModalOpen(true)}
              className="group flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20 backdrop-blur-sm transition-all active:scale-95"
            >
              <Copy className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              <span className="font-medium">Clone from Code</span>
            </button>
            
            <Link to="/createQuiz">
              <button className="flex items-center gap-2 px-6 py-2.5 bg-orange-400 text-white rounded-xl font-bold shadow-lg shadow-black/10 hover:bg-orange-500 hover:-translate-y-0.5 transition-all active:scale-95">
                <Plus size={20} strokeWidth={3} />
                Create Quiz
              </button>
            </Link>
          </motion.div>
        </header>

        {/* Main Section Heading */}
        <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Active Assessments
                <span className="bg-white/20 text-xs px-2 py-1 rounded-full">{quizzes.length}</span>
            </h2>
        </div>

        {/* Quizzes List / Grid */}
        {quizzes.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/10 backdrop-blur-lg border-2 border-dashed border-white/20 rounded-3xl p-16 text-center"
          >
            <div className="bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
               <Plus className="text-white/50" size={40} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Your library is empty</h3>
            <p className="text-cyan-100 mb-8 max-w-sm mx-auto">
                Transform your Google Forms or let our AI generate a fresh assessment for you.
            </p>
            <Link to="/createQuiz">
                <button className="px-8 py-3 bg-white text-cyan-700 font-bold rounded-xl hover:bg-cyan-50 transition-colors">
                    Get Started
                </button>
            </Link>
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVars}
            initial="hidden"
            animate="show"
            className="grid md:grid-cols-2 lg:grid-cols-2 gap-8"
          >
            {quizzes.map((quiz) => (
              <motion.div
                key={quiz.quizId}
                variants={cardVars}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="group relative bg-white rounded-2xl p-6 shadow-2xl shadow-black/10 overflow-hidden border border-white/20"
              >
                {/* Visual Accent Strip based on Mode */}
                <div className={`absolute top-0 left-0 w-2 h-full transition-colors ${
                    isServerQuiz(quiz) ? 'bg-cyan-500' : isDraftQuiz(quiz) ? 'bg-gray-300' : 'bg-orange-400'
                }`} />

                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] font-bold uppercase tracking-[0.1em] px-2 py-1 rounded-md ${
                        isDraftQuiz(quiz) 
                        ? 'bg-gray-100 text-gray-500' 
                        : 'bg-cyan-50 text-cyan-600 border border-cyan-100'
                      }`}>
                        {quiz.mode}
                      </span>
                      {isServerQuiz(quiz) && (
                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md uppercase border border-emerald-100 animate-pulse">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Live
                        </span>
                      )}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 group-hover:text-cyan-600 transition-colors">
                      {quiz.quizName}
                    </h3>
                  </div>
                  
                  <button 
                    onClick={() => setQuizToDelete(quiz)}
                    className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    title="Delete Quiz"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

                {/* Meta Info */}
                <div className="flex gap-6 mb-8 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                        <Clock size={16} className="text-gray-400" />
                        <span>Self-paced</span>
                    </div>
                    {/* Placeholder for more metadata like 'Questions: 12' or 'Responses: 45' */}
                </div>

                {/* Footer Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-gray-100">
                  <div className="flex items-center gap-4">
                    <Link to={`/quiz/${quiz.quizId}`} className="flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-cyan-600 transition-colors group/edit">
                      <Settings size={18} className="group-hover/edit:rotate-45 transition-transform" /> 
                      Edit
                    </Link>
                    {(isServerQuiz(quiz) || isRandomizedQuiz(quiz)) && (
                        <button className="flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-cyan-600 transition-colors">
                            <BarChart3 size={18} /> Analytics 
                        </button>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {isServerQuiz(quiz) ? (
                      <Link to={`/run-quiz-host/${quiz.quizId}`}>
                        <button className="flex items-center gap-2 px-6 py-2.5 bg-cyan-600 text-white text-sm font-bold rounded-xl hover:bg-cyan-700 shadow-lg shadow-cyan-100 hover:shadow-cyan-200 transition-all active:scale-95">
                          <Play size={14} fill="currentColor" /> Run Quiz
                        </button>
                      </Link>
                    ) : (
                      <div className="flex gap-2">
                        {isRandomizedQuiz(quiz) && (
                            <button 
                                onClick={() => navigator.clipboard.writeText(`${window.location.origin}/quiz/${quiz.quizId}`)}
                                className="p-2.5 text-cyan-600 bg-cyan-50 rounded-xl hover:bg-cyan-100 transition-colors"
                                title="Copy Quiz Link"
                            >
                                <ExternalLink size={18} />
                            </button>
                        )}
                        <Link to={`/quiz/${quiz.quizId}/preview`}>
                            <button className="flex items-center gap-2 px-6 py-2.5 bg-white border-2 border-cyan-600 text-cyan-600 text-sm font-bold rounded-xl hover:bg-cyan-50 transition-all active:scale-95">
                                Preview <ChevronRight size={14} />
                            </button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Modals with matching modern design */}
      <CloneQuizModal
        isOpen={isCloneModalOpen}
        onClose={() => setIsCloneModalOpen(false)}
        onRefresh={() => {/* Add refresh logic */}}
      />

      <DeleteConfirmationModal
        isOpen={!!quizToDelete}
        onClose={() => setQuizToDelete(null)}
        onConfirm={handleDeleteQuiz}
        quizName={quizToDelete?.quizName || ""}
      />
    </div>
  );
}