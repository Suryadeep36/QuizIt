import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Dashboard from "./Dashboard.jsx";
import CreateQuiz from "./CreateQuiz.jsx";
import RunQuiz from "./RunQuiz.jsx";
import UserAnalytics from "./UserAnalytics.jsx";
import { createBrowserRouter, RouterProvider } from 'react-router'
import LandingPage from './LandingPage.jsx'
import AuthPage from './AuthPage.jsx'
import QuizManagementDashboard from './QuizManagementDashboard.jsx'
import { Toaster } from 'react-hot-toast'
import ProtectedRoute from './auth/ProtectedRoute.jsx'
import QuizPlayer from './QuizPlayer.jsx'
import JoinQuizPage from './JoinQuizPage.jsx'
import QuizRoom from './QuizRoom.jsx'
import HostLiveQuiz from './HostLiveQuiz.jsx'
import ParticipantLiveQuiz from './ParticipantLiveQuiz.jsx'
import Analytics from './Analytics.jsx'
import UnprotectedRoute from "./auth/unprotectedRoute.jsx";
import Leaderboard from "./Leaderboard.jsx";


const router = createBrowserRouter([
  {
    element: <UnprotectedRoute/>,
    children: [
      {
        path: "/auth",
        element: <AuthPage />,
      },
    ],
  },

  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "quiz/:quizId/join/:sessionId",
    element: <JoinQuizPage />,
  },
  {
    path: "/quiz/:sessionId/quizroom",
    element: <QuizRoom />,
  },
  {
    path: "/play/quiz/:sessionId",
    element: <ParticipantLiveQuiz />,
  },
  {
    path: "/quiz/leaderboard/:quizId",
    element: <Leaderboard />
  },
  // 🔒 PROTECTED ROUTES
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
      {
        path: "/createQuiz",
        element: <CreateQuiz />,
      },
      {
        path: "/quiz/:quizId",
        element: <QuizManagementDashboard />,
      },
      {
        path: "/runQuiz/:quizId",
        element: <RunQuiz />,
      },
      {
        path: "/quizAnalytics/:quizId",
        //use this quiz id: 729d508f-6a8f-4301-99b0-31be74959bef
        element: <UserAnalytics />,
      },
      {
        path: "/runningQuiz",
        element: <QuizPlayer />,
      },
      {
        path: "/run-quiz-host/:quizId",
        element: <HostLiveQuiz />
      }
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Toaster />
    <RouterProvider router={router} />
  </StrictMode>
);
