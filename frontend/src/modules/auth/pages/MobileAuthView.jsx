import React from "react";
import CircularProgress from "@mui/material/CircularProgress";
import VerificationForm from "../components/VerificationForm";
import { NavLink } from "react-router";


// Internal Mobile-Specific Components for better theme matching
const MobileGoogleButton = () => (



  <NavLink
    to={`${import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"}/oauth2/authorization/google`}
    className="block w-full mt-4"
  >
    <button
      type="button"
      className="w-full flex items-center justify-center gap-3 border border-gray-200 bg-white h-14 rounded-2xl text-gray-700 font-semibold shadow-sm active:bg-gray-50 transition-all"
    >
      <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
      Continue with Google
    </button>
  </NavLink>
);

const MobileDivider = () => (
  <div className="flex items-center gap-4 my-6">
    <div className="h-[1px] bg-gray-200 flex-1"></div>
    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Or</span>
    <div className="h-[1px] bg-gray-200 flex-1"></div>
  </div>
);

const MobileAuthView = ({
  isSignUp, setIsSignUp, loginData, handleLoginChange, handleLogin, loginLoading,
  signupData, handleSignupChange, handleSignup, signupLoading, step, setStep,
  handleVerify, verificationLoading, signupError, loginError, verificationError
}) => {

  const roles = ["STUDENT", "TEACHER", "ADMIN"];

  return (
    <div className="md:hidden min-h-screen bg-white flex flex-col overflow-x-hidden">

      {/* 1. Themed Header */}
      <div className="bg-gradient-to-br from-cyan-600 to-teal-500 pt-12 pb-10 px-6 rounded-b-[40px] shadow-lg">
        <h1 className="text-3xl font-black text-white text-center mb-6 tracking-tight">QuizIt</h1>

        {/* Sliding Tab Selector */}
        <div className="relative flex bg-white/20 backdrop-blur-md rounded-2xl p-1 h-14">
          <div
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-xl shadow-lg transition-transform duration-300 ease-out ${isSignUp ? 'translate-x-full' : 'translate-x-0'
              }`}
          />

          <button
            onClick={() => { setIsSignUp(false); setStep("auth") }}
            className={`relative z-10 w-1/2 font-bold text-sm transition-colors duration-300 ${!isSignUp ? 'text-cyan-700' : 'text-white'
              }`}
          >
            Login
          </button>

          <button
            onClick={() => { setIsSignUp(true); setStep("auth") }}
            className={`relative z-10 w-1/2 font-bold text-sm transition-colors duration-300 ${isSignUp ? 'text-cyan-700' : 'text-white'
              }`}
          >
            Sign Up
          </button>
        </div>
      </div>

      {/* 2. Content Slider */}
      <div className="flex-1 relative mt-8">
        <div
          className={`flex h-full transition-transform duration-500 ease-in-out ${isSignUp ? "-translate-x-1/2" : "translate-x-0"
            }`}
          style={{ width: "200%" }}
        >

          {/* --- LOGIN PANE --- */}
          <div className="w-1/2 px-8 flex flex-col">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
              <p className="text-gray-500 text-sm">Sign in to manage your quizzes</p>
            </div>

            <div className="space-y-4">
              <input
                type="email"
                name="email"
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl h-14 px-5 outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-50 transition-all text-gray-700"
                placeholder="Email Address"
                value={loginData.email}
                onChange={handleLoginChange}
              />
              <input
                type="password"
                name="password"
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl h-14 px-5 outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-50 transition-all text-gray-700"
                placeholder="Password"
                value={loginData.password}
                onChange={handleLoginChange}
              />
            </div>

            {loginError && <p className="text-red-500 text-xs mt-3 font-medium ml-1">{loginError}</p>}

            <button
              onClick={handleLogin}
              disabled={loginLoading}
              className="w-full bg-orange-400 hover:bg-orange-500 text-white h-14 rounded-2xl font-bold shadow-xl shadow-orange-200 mt-8 flex justify-center items-center active:scale-[0.97] transition-all"
            >
              {loginLoading ? <CircularProgress size={24} color="inherit" /> : "Login"}
            </button>

            <MobileDivider />
            <MobileGoogleButton />
          </div>

          {/* --- SIGNUP / VERIFY PANE --- */}
          <div className="w-1/2 px-8 flex flex-col">
            {step === "verify" ? (
              <div className="bg-white rounded-3xl">
                <VerificationForm
                  email={signupData.email}
                  loading={verificationLoading}
                  error={verificationError}
                  onCancel={() => setStep("auth")}
                  onVerify={handleVerify}
                />
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Create Account</h2>
                  <p className="text-gray-500 text-sm">Start creating smarter quizzes</p>
                </div>

                <div className="flex gap-2 mb-4 bg-gray-100 p-1 rounded-lg border border-gray-200">
                  {/* ROLE SELECTION TABS */}
                  {["STUDENT", "TEACHER", "ADMIN"].map((role) => (
                    <button
                      key={role}
                      type="button"
                      // We trigger handleSignupChange manually for the 'role' field
                      onClick={() => handleSignupChange({ target: { name: "role", value: role } })}
                      className={`flex-1 py-2 text-xs font-bold rounded-md transition-all duration-200 ${signupData.role === role
                          ? "bg-cyan-600 text-white shadow-md"
                          : "text-gray-500 hover:bg-gray-200"
                        }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
                <div className="space-y-4">


                  <input
                    type="text"
                    name="username"
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl h-14 px-5 outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-50 transition-all text-gray-700"
                    placeholder="Username"
                    value={signupData.username}
                    onChange={handleSignupChange}
                  />
                  <input
                    type="email"
                    name="email"
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl h-14 px-5 outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-50 transition-all text-gray-700"
                    placeholder="Email Address"
                    value={signupData.email}
                    onChange={handleSignupChange}
                  />
                  <input
                    type="password"
                    name="password"
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl h-14 px-5 outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-50 transition-all text-gray-700"
                    placeholder="Password"
                    value={signupData.password}
                    onChange={handleSignupChange}
                  />
                </div>

                {signupError && <p className="text-red-500 text-xs mt-3 font-medium ml-1">{signupError}</p>}

                <button
                  onClick={handleSignup}
                  disabled={signupLoading}
                  className="w-full bg-orange-400 hover:bg-orange-500 text-white h-14 rounded-2xl font-bold shadow-xl shadow-orange-200 mt-8 flex justify-center items-center active:scale-[0.97] transition-all"
                >
                  {signupLoading ? <CircularProgress size={24} color="inherit" /> : "Sign Up"}
                </button>

                <p className="mt-6 text-center text-xs text-gray-400 font-medium">
                  Already have a code?{" "}
                  <button onClick={() => setStep("verify")} className="text-cyan-600 font-bold underline decoration-2 underline-offset-4">
                    Verify here
                  </button>
                </p>

                <MobileDivider />
                <MobileGoogleButton />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileAuthView;