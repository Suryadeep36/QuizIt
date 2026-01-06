import { useState, useEffect } from "react";
import { Link } from "react-router";
import useAuth from "./auth/store";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { getQuizsByHostId } from "./services/AuthService";
import toast from "react-hot-toast";
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
      mode: "RANDOMIZED",
      quizName: "DSA Practice Quiz",
      quizType: "MCQ",
      hostUserId: "a94d6b81-bfff-4742-8dbe-92d684a93000",
    },
  ]);

  const checkLogin = useAuth((state) => state.checkLogin);
  const user = useAuth((state) => state.user);

  const [loading, setLoading] = useState(false);

  const hostId = user.id;
  const isDraftQuiz = (quiz) => !quiz.mode;
  const isServerQuiz = (quiz) => quiz.mode === "SERVER";
  const isRandomizedQuiz = (quiz) => quiz.mode === "RANDOMIZED";

  useEffect(() => {
  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const data = await getQuizsByHostId(hostId);
      setQuizzes(data);
    } catch (err) {
      toast.error(  err.response?.data?.message || err.message || "Quiz are not loaded!")
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  fetchQuizzes();
}, []);


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-cyan-700">
        Loading your quizzes...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-teal-50 px-6 py-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Quiz Dashboard</h1>
            <p className="text-gray-500 mt-1">
              Create, manage, and run your quizzes
            </p>
          </div>

          <div className="flex gap-3 mt-4 md:mt-0">

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AccountCircleIcon color="primary" />
              <Typography variant="subtitle1" fontWeight={500}>
                {user.username}
              </Typography>
            </Box>


            <button
              className="px-5 py-2 rounded-lg bg-white border border-cyan-200
              text-cyan-700 hover:bg-cyan-50 transition"
            >
              Join Quiz
            </button>
            <Link to="/createQuiz">
              <button
                className="px-5 py-2 rounded-lg bg-orange-500 text-white
                hover:bg-orange-600 transition shadow"
              >
                Create Quiz
              </button>
            </Link>
          </div>
        </div>

        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Your Quizzes
        </h2>

        {quizzes.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center shadow-sm">
            <p className="text-gray-500 mb-4">
              You haven’t created any quizzes yet
            </p>
            <button className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition">
              Create Your First Quiz
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {quizzes.map((quiz) => (
              <div
                key={quiz.quizId}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {quiz.quizName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Mode: <span className="font-medium">{quiz.mode}</span>
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs rounded-full ${isDraftQuiz(quiz)
                        ? "bg-gray-100 text-gray-600"
                        : isServerQuiz(quiz)
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                  >
                    {isDraftQuiz(quiz)
                      ? "Draft"
                      : isServerQuiz(quiz)
                        ? "Live (Host-controlled)"
                        : "Self-paced"}
                  </span>
                </div>

                <div className="flex gap-3 flex-wrap">
                  <Link to={`/quiz/${quiz.quizId}`}>
                    <button className="dashboard-btn">Edit</button>
                  </Link>
                  {isDraftQuiz(quiz) && (
                    <button className="dashboard-btn-primary">
                      Complete Setup
                    </button>
                  )}

                  {/* Server-based quiz actions */}
                  {isServerQuiz(quiz) && (
                    <>
                      <button className="dashboard-btn">Analytics</button>

                      <Link to={`/runQuiz/${quiz.quizId}`}>
                        <button className="dashboard-btn-primary">
                          Run Quiz
                        </button>
                      </Link>
                    </>
                  )}

                  {/* Randomized quiz actions */}
                  {isRandomizedQuiz(quiz) && (
                    <>
                      <button className="dashboard-btn">Analytics</button>

                      <Link to={`/quiz/${quiz.quizId}/preview`}>
                        <button className="dashboard-btn-primary">
                          Preview
                        </button>
                      </Link>

                      <button
                        className="dashboard-btn"
                        onClick={() =>
                          navigator.clipboard.writeText(
                            `${window.location.origin}/quiz/${quiz.quizId}`
                          )
                        }
                      >
                        Copy Link
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
