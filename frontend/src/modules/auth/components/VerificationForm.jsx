import { useState, useRef } from "react";
import CircularProgress from "@mui/material/CircularProgress";

export default function VerificationForm({ email, onVerify, onCancel, loading, error }) {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const inputRefs = useRef([]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Focus next input
    if (element.value !== "" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = () => {
    onVerify(otp.join(""));
  };

  return (
    <div className="flex flex-col justify-center px-12 h-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Check your email</h2>
        <p className="text-gray-500 text-sm leading-relaxed">
          We've sent a 6-digit confirmation code to <br />
          <span className="font-semibold text-teal-600">{email}</span>
        </p>
      </div>

      {/* OTP Input Group */}
      <div className="flex justify-between gap-2 mb-6">
        {otp.map((data, index) => (
          <input
            key={index}
            type="text"
            maxLength="1"
            ref={(el) => (inputRefs.current[index] = el)}
            value={data}
            onChange={(e) => handleChange(e.target, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className="w-12 h-14 border-2 rounded-xl text-center text-xl font-bold text-gray-800 border-gray-200 focus:border-teal-500 focus:ring-0 transition-all outline-none"
          />
        ))}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs mb-4 flex items-center gap-2">
          <span>⚠️</span> {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading || otp.join("").length < 6}
        className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl shadow-lg shadow-teal-200 transition-all active:scale-[0.98] mb-6 flex justify-center items-center"
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : "Verify & Activate"}
      </button>

      <div className="text-center">
        <p className="text-gray-400 text-sm mb-2">Didn't get the code?</p>
        <button
          onClick={onCancel}
          className="text-teal-600 font-semibold text-sm hover:text-teal-700 hover:underline transition-all"
        >
          Try a different email
        </button>
      </div>
    </div>
  );
}