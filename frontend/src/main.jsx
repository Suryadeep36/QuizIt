import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Dashboard from './Dashboard.jsx'
import CreateQuiz from './CreateQuiz.jsx'
import RunQuiz from './RunQuiz.jsx'
import UserAnalytics from "./UserAnalytics.jsx";
import { createBrowserRouter, RouterProvider } from 'react-router'
import LandingPage from './LandingPage.jsx'
import AuthPage from './AuthPage.jsx'
import QuizManagementDashboard from './QuizManagementDashboard.jsx'
import { Toaster } from 'react-hot-toast'
import ProtectedRoute from './auth/ProtectedRoute.jsx'
import UnprotectedRoute from './auth/unprotectedRoute.jsx'
import RunningQuiz from './RunningQuiz.jsx'
import QuizPlayer from './QuizPlayer.jsx'
import JoinQuizPage from './JoinQuizPage.jsx'
import QuizRoom from './QuizRoom.jsx'
import HostLiveQuiz from './HostLiveQuiz.jsx'


const router = createBrowserRouter([
  {
    element: <UnprotectedRoute />,
    children: [
      {
        path: "/auth",
        element: <AuthPage />
      }
    ]
  },



  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "quiz/:quizId/join",
    element: <JoinQuizPage />
  },
  {
    path: "/quiz/:quizId/quizroom",
    element: <QuizRoom />,
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


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Toaster />
    <RouterProvider router={router} />
  </StrictMode>,
)
