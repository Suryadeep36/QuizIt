import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from 'react-router'
import { Toaster } from 'react-hot-toast'
import "./styles/index.css";

import Dashboard from "./modules/dashboard/pages/Dashboard.jsx"
import CreateQuiz from "./modules/quiz/pages/CreateQuiz.jsx";
import UserAnalytics from "./modules/analytics/pages/UserAnalytics.jsx"
import LandingPage from "./modules/landing/pages/LandingPage.jsx";
import AuthPage from './modules/auth/pages/AuthPage.jsx'
import QuizManagementDashboard from './modules/quiz/pages/QuizManagementDashboard.jsx'
import ProtectedRoute from "./modules/auth/components/ProtectedRoute.jsx"
import Unprotected from "./modules/auth/components/Unprotected.jsx"
import JoinQuizPage from './modules/quiz/pages/JoinQuizPage.jsx'
import QuizRoom from './modules/quiz/pages/QuizRoom.jsx'
import HostLiveQuiz from './modules/quiz/pages/HostLiveQuiz.jsx'
import ParticipantLiveQuiz from './modules/quiz/pages/ParticipantLiveQuiz.jsx'
import Leaderboard from "./modules/analytics/pages/Leaderboard.jsx"


const router = createBrowserRouter([
  {
    element: <Unprotected/>,
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
        path: "/quizAnalytics/:quizId",
        element: <UserAnalytics />,
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
