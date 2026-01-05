import { useState } from "react";
import toast from "react-hot-toast";
import { registerUser ,loginUser} from "./services/AuthService";
import { useNavigate } from "react-router";
import CircularProgress from "@mui/material/CircularProgress";
import useAuth from "./auth/store";
export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const login = useAuth(state=>state.login);
  
  const [signupData, setSignupData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [signupLoading, setSignupLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  const [signupError, setSignupError] = useState("");
  const [loginError, setLoginError] = useState("");


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


  const handleSignup = async () => {
    if (signupLoading) return;

    setSignupLoading(true);
    setSignupError("");

    if (!signupData.username.trim() || !signupData.email.trim() || !signupData.password.trim()) {
      toast.error("Please fill in all fields");
      setSignupLoading(false);
      return;
    }

    try {
      await registerUser({
        email: signupData.email,
        username: signupData.username,
        password: signupData.password,
        enable: true,
      });

      toast.success("Registration successful! Please sign in.");

      setSignupData({
        username: "",
        email: "",
        password: "",
      });

      setIsSignUp(false);
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

      setLoginData({
        email: "",
        password: "",
      });

      navigate("/dashboard");
    } catch (err) {
      setLoginError(
        err.response?.data?.message || err.message || "Login failed"
      );
    } finally {
      setLoginLoading(false);
    }
  };



  return (
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
              className="bg-orange-400 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded"
            >
              {loginLoading ? <CircularProgress size={24} color="inherit" />: "Login"}
            </button>
          </div>

          <div className="w-1/2 flex flex-col justify-center px-12 bg-gray-50">
            <h2 className="text-3xl font-bold mb-2">Create Account</h2>
            <p className="text-gray-500 mb-6">Start creating smarter quizzes</p>

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
              className="bg-orange-400 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded"
            >
              {signupLoading ? <CircularProgress size={24} color="inherit" /> : "Sign Up"}
            </button>

          </div>
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
              onClick={() => setIsSignUp(!isSignUp)}
              className="border border-white px-6 py-2 rounded-lg hover:bg-white hover:text-cyan-700 transition"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
