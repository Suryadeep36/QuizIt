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
import AfterQuizAnalytics from "./modules/dashboard/component/AfterQuizAnalytics.jsx";
import MainLayout from "./MainLayout.jsx";
import UserProfile from "./modules/profile/pages/UserProfile.jsx";
import OAuth2Success from "./modules/auth/pages/OAuth2Success.jsx";
import BulkQuestionCreator from "./modules/quiz/pages/BulkQuestionCreator.jsx";


const router = createBrowserRouter([
  // 1. NO NAVBAR ROUTES (Landing, Auth, Live Quiz Taking)
  
  {
    path: "/",
    element: <LandingPage />, // Landing page has its own internal nav
  },
  {
    path: "/oauth2/login/success",
    element: <OAuth2Success />,
  },
  {
    element: <Unprotected />,
    children: [
      {
        path: "/auth",
        element: <AuthPage />,
      },
    ],
  },
  // Live Quiz Rooms (Distraction-free, no navbar)
  {
    path: "/quiz/:sessionId/quizroom",
    element: <QuizRoom />,
  },
  {
    path: "/play/quiz/:sessionId",
    element: <ParticipantLiveQuiz />,
  },
  {
    path: "quiz/:quizId/join/:sessionId",
    element: <JoinQuizPage />,
  },
  {
    path: "/afterQuizAnalytics/:quizId",
    element: <AfterQuizAnalytics />,
  },


  // 2. ROUTES WITH NAVBAR (Dashboard, Management, Analytics)
  {
    element: <MainLayout />, // Wraps everything below with Navbar
    children: [

      {
        path: "/quiz/leaderboard/:quizId",
        element: <Leaderboard />
      },

      {
        path: "/quizAnalytics/:quizId/participant/:participantId",
        element: <UserAnalytics />,
      },

      // Protected Routes (Require Login + Have Navbar)
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "/profile/:username",
            element: <UserProfile/>
          },
          {
            path: "/create",
            element: <BulkQuestionCreator/>
          },
          {
            path: "/run-quiz-host/:quizId",
            element: <HostLiveQuiz />
          },
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
        ],
      },
    ]
  }
]);

// const router = createBrowserRouter([
//   {
//     element: <Unprotected/>,
//     children: [
//       {
//         path: "/auth",
//         element: <AuthPage />,
//       },
//     ],
//   },

//   {
//     path: "/",
//     element: <LandingPage />,
//   },
//   {
//     path: "quiz/:quizId/join/:sessionId",
//     element: <JoinQuizPage />,
//   },
//   {
//     path: "/quiz/:sessionId/quizroom",
//     element: <QuizRoom />,
//   },
//   {
//     path: "/play/quiz/:sessionId",
//     element: <ParticipantLiveQuiz />,
//   },
//   {
//     path: "/quiz/leaderboard/:quizId",
//     element: <Leaderboard />
//   },
//   {
//   path: "/afterQuizAnalytics/:quizId",
//   element:<AfterQuizAnalytics/>,
// },
//   {
//         path: "/quizAnalytics/:quizId/participant/:participantId",
//         element: <UserAnalytics />,
//       },
//   // 🔒 PROTECTED ROUTES
//   {
//     element: <ProtectedRoute />,
//     children: [
//       {
//         path: "/dashboard",
//         element: <Dashboard />,
//       },
//       {
//         path: "/createQuiz",
//         element: <CreateQuiz />,
//       },
//       {
//         path: "/quiz/:quizId",
//         element: <QuizManagementDashboard />,
//       },
//       {
//         path: "/run-quiz-host/:quizId",
//         element: <HostLiveQuiz />
//       }
//     ],
//   },
// ]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Toaster />
    <RouterProvider router={router} />
  </StrictMode>
);
