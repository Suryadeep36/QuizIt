import { useState } from "react";
import toast from "react-hot-toast";
import { NavLink, useNavigate } from "react-router";
import CircularProgress from "@mui/material/CircularProgress";
import { registerUser, loginUser, addUserToParticipant, verifyEmail } from "../../../services/AuthService";
import useAuth, { useParticipant } from "../../../stores/store";
import VerificationForm from "../components/VerificationForm";
import MobileAuthView from "./MobileAuthView";



export const GoogleButton = () => (
  <NavLink
    to={`${import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"}/oauth2/authorization/google`}
    className="block w-full "
  >
    <button
      type="button"
      className="w-full flex items-center justify-center gap-2 border border-gray-300 bg-white py-2 px-4 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition mb-4 shadow-sm"
    >
      <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
      Continue with Google
    </button>
  </NavLink>
);

export const Divider = () => (
  <div className="flex p-2 items-center gap-4 m-2 ">
    <div className="h-[1px] bg-gray-300 flex-1 min-w-[40px] block"></div>
    <span className="text-[10px] text-white-400 font-bold uppercase">Or</span>
    <div className="h-[1px] bg-gray-300 flex-1 min-w-[40px] block"></div>
  </div>
);

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const login = useAuth(state => state.login);

  const [step, setStep] = useState("verify"); // "auth" or "verify"
  const [verificationError, setVerificationError] = useState("");
  const [verificationLoading, setVerificationLoading] = useState(false);

  const isParticipant = useParticipant((state) => state.isParticipant);
  const participant = useParticipant((state) => state.participant);
  const setParticipant = useParticipant((state) => state.setParticipant);
  const [signupData, setSignupData] = useState({
    username: "",
    email: "",
    password: "",
    role: "STUDENT",
  });
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const ROLE_MAP = {
    STUDENT: "USER",
    TEACHER: "TEACHER",
    ADMIN: "ADMIN"
  };


  const [signupLoading, setSignupLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  const [signupError, setSignupError] = useState("");
  const [loginError, setLoginError] = useState("");


  const handleRoleSelect = (role) => {
    setSignupData(prev => ({ ...prev, role }));
  };
  const handleSignupChange = (e) => {
    setSignupData({
      ...signupData,
      [e.target.name]: e.target.value,
    });
  };
  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  const handleVerify = async (otp) => {
    setVerificationLoading(true);
    try {
      await verifyEmail({ email: signupData.email, otp });
      toast.success("Email verified! You can now login.");
      setStep("auth");
      setSignupData({
        username: "",
        email: "",
        password: "",
      });

      setIsSignUp(false);
    } catch (err) {
      console.log(err)
      setVerificationError(err.response?.data?.message || "Invalid Code");
    } finally {
      setVerificationLoading(false);
    }
  }

  const handleSignup = async () => {
    if (signupLoading) return;

    setSignupLoading(true);
    setSignupError("");

    // Basic validation
    if (!signupData.username.trim() || !signupData.email.trim() || !signupData.password.trim()) {
      toast.error("Please fill in all fields");
      setSignupLoading(false);
      return;
    }


    try {
      const assignedRole = signupData.role === "STUDENT" ? "USER" : signupData.role;
    
    // 1. Rename this to something like 'signupPayload'
    const signupPayload = {
      email: signupData.email,
      username: signupData.username,
      password: signupData.password,
      enable: true,
      roles: [assignedRole],
    };
      console.log(signupPayload)
      const userdata = await registerUser(signupPayload);
      console.log("Registration successful:", userdata);

      toast.success("Code sent to your email!");
      setStep("verify");


      // setIsSignUp(false);
    } catch (err) {
      setSignupError(
        err.response?.data?.message || err.message || "Registration failed"
      );
    } finally {
      setSignupLoading(false);
    }
  };


  const handleLogin = async () => {
    if (loginLoading) return;

    setLoginLoading(true);
    setLoginError("");

    if (!loginData.email.trim() || !loginData.password.trim()) {
      toast.error("Please fill in all fields");
      setLoginLoading(false);
      return;
    }

    try {
      //   const userData  =   await loginUser({
      //     email: loginData.email,
      //     password: loginData.password,
      //   });
      const userData = await login(loginData)

      console.log(userData)

      toast.success("Login successful!");

      // console.log("AuthPage: " + participant.id + "," + userData.user.id)

      try {
        if (isParticipant()) {
          const participantData = await addUserToParticipant(participant.id, userData.user.id);

          setParticipant({
            id: participantData.participantId,
            name: participantData.participantName,
            quizId: participantData.quizId,
            status: participantData.status,
            userId: participantData.userId,
            sessionId: null,
          });
        }
      } catch (err) {
        toast.error(err.response?.data?.message || err.message || "Participant not linked!")
      }

      setLoginData({
        email: "",
        password: "",
      });

      navigate("/dashboard");
    } catch (err) {
      console.log("login error", err);
      setLoginError(
        err.response?.data?.message || err.message || "Login failed"
      );
    } finally {
      setLoginLoading(false);
    }
  };



  return (
    <>
      <div className="hidden md:block">
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-600 to-teal-500 px-4">
          <div className="relative w-full max-w-4xl h-[520px] bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="absolute inset-0 flex">
              <div className="w-1/2 flex flex-col justify-center px-12">
                <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
                <p className="text-gray-500 mb-6">Sign in to manage your quizzes</p>


                <input
                  type="email"
                  className="auth-input"
                  placeholder="Email"
                  name="email"
                  value={loginData.email}
                  onChange={handleLoginChange}
                />
                <input
                  className="auth-input"
                  placeholder="Password"
                  type="password"
                  name="password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                />
                {loginError && (
                  <p className="text-red-500 text-sm mb-2">{loginError}</p>
                )}

                <button
                  type="button"
                  onClick={handleLogin}
                  disabled={loginLoading}
                  className="w-full bg-orange-400 hover:bg-orange-500 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl shadow-lg shadow-teal-200 transition-all active:scale-[0.98] mb-6 flex justify-center items-center"
                >
                  {loginLoading ? <CircularProgress size={24} color="inherit" /> : "Login"}
                </button>
              </div>

              {step === "verify" ? (
                <VerificationForm
                  email={signupData.email}
                  loading={verificationLoading}
                  error={verificationError}
                  onCancel={() => setStep("auth")}
                  onVerify={handleVerify}
                />
              ) : (
                <div className="w-1/2 flex flex-col justify-center px-12 bg-gray-50">
                  <h2 className="text-3xl font-bold mb-2">Create Account</h2>
                  <p className="text-gray-500 mb-6">Start creating smarter quizzes</p>
                  <div className="flex gap-2 mb-4 bg-gray-100 p-1 rounded-lg border border-gray-200">
                    {["STUDENT", "TEACHER", "ADMIN"].map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setSignupData({ ...signupData, role })}
                        className={`flex-1 py-2 text-xs font-bold rounded-md transition-all duration-200 ${signupData.role === role
                            ? "bg-cyan-600 text-white shadow-md"
                            : "text-gray-500 hover:bg-gray-200"
                          }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>


                  <input
                    type="name"
                    className="auth-input"
                    placeholder="Username"
                    name="username"
                    value={signupData.username}
                    onChange={handleSignupChange}
                  />
                  <input
                    type="email"
                    className="auth-input"
                    placeholder="Email"
                    name="email"
                    value={signupData.email}
                    onChange={handleSignupChange}
                  />
                  <input
                    className="auth-input"
                    placeholder="Password"
                    type="password"
                    name="password"
                    value={signupData.password}
                    onChange={handleSignupChange}
                  />

                  {signupError && <p className="text-red-500 text-sm mb-2">{signupError}</p>}

                  <button
                    onClick={handleSignup}
                    disabled={signupLoading}
                    className="w-full bg-orange-400 hover:bg-orange-500 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl shadow-lg shadow-teal-200 transition-all active:scale-[0.98] mb-6 flex justify-center items-center"
                  >
                    {signupLoading ? <CircularProgress size={24} color="inherit" /> : "Sign Up"}
                  </button>

                  {/* ADD THIS SECTION BELOW THE BUTTON */}
                  <p className="mt-4 text-xs text-center text-gray-400">
                    Already have a verification code?{" "}
                    <button
                      onClick={() => setStep("verify")}
                      className="text-cyan-600 hover:underline font-medium"
                    >
                      Verify here
                    </button>
                  </p>
                </div>
              )}
            </div>

            <div
              className={`absolute top-0 left-1/2 w-1/2 h-full bg-gradient-to-br from-cyan-600 to-teal-500 text-white
          transition-transform duration-700 ease-in-out
          ${isSignUp ? "-translate-x-full" : "translate-x-0"}`}
            >
              <div className="h-full flex flex-col items-center justify-center px-10 text-center">
                <h2 className="text-3xl font-bold mb-4">
                  {isSignUp ? "Already have an account?" : "New here?"}
                </h2>
                <p className="mb-6 text-white/80">
                  {isSignUp
                    ? "Sign in and continue building quizzes"
                    : "Create an account and start instantly"}
                </p>

                <button
                  onClick={() => { setIsSignUp(!isSignUp); setStep("auth") }}
                  className="border border-white px-6 py-2 rounded-lg hover:bg-white hover:text-cyan-700 transition"
                >
                  {isSignUp ? "Sign In" : "Sign Up"}
                </button>

                <Divider />
                <GoogleButton />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE VERSION */}
      <div className="block md:hidden">
        <MobileAuthView
          isSignUp={isSignUp}
          setIsSignUp={setIsSignUp}
          loginData={loginData}
          handleLoginChange={handleLoginChange}
          handleLogin={handleLogin}
          loginLoading={loginLoading}
          signupData={signupData}
          handleSignupChange={handleSignupChange}
          handleSignup={handleSignup}
          signupLoading={signupLoading}
          step={step}
          setStep={setStep}
          handleVerify={handleVerify}
          verificationLoading={verificationLoading}
          signupError={signupError}
          loginError={loginError}
          verificationError={verificationError}
        />
      </div>
    </>
  );
}
