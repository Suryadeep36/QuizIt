import { Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'; // Added for that AI feel
import { useState } from "react";

export default function AiPromptModal({ open, onClose, onGenerate }) {
  const [prompt, setPrompt] = useState("");

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    onGenerate(prompt);
    // setPrompt("");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        style: { borderRadius: "24px", padding: "8px" },
        className: "bg-white shadow-2xl",
      }}
    >
      {/* Header with Gradient Background */}
      <DialogTitle className="flex justify-between items-center pb-2">
        <div className="flex items-center gap-2">
          <div className="bg-orange-100 p-2 rounded-xl">
            <AutoAwesomeIcon className="text-orange-500" />
          </div>
          <div>
            <h3 className="font-bold text-xl text-gray-800">Generate with AI</h3>
            <p className="text-xs text-gray-500 font-normal">Fuel your quiz with magic ✨</p>
          </div>
        </div>
        <IconButton 
          onClick={onClose}
          className="hover:bg-gray-100 transition-colors"
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <div className="flex flex-col gap-6 mt-4">
          
          {/* Enhanced Textarea Container */}
          <div className="relative group">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Generate 10 Physics MCQs about Black Holes for high school level..."
              className="w-full h-40 p-5 rounded-3xl border-2 border-gray-100 bg-gray-50 
                         focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-100 
                         outline-none resize-none text-gray-700 transition-all duration-300 
                         placeholder:text-gray-400 shadow-inner"
            />
            {/* Subtle glow effect on focus */}
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-3xl blur opacity-0 group-focus-within:opacity-10 transition duration-500 -z-10"></div>
          </div>

          {/* Action Button with Pulse Effect */}
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim()}
            className={`
              relative overflow-hidden py-4 rounded-2xl font-bold text-lg shadow-lg transition-all duration-300 active:scale-95
              ${!prompt.trim() 
                ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                : "bg-gradient-to-r from-[#f5a65b] to-[#f59843] text-white hover:shadow-orange-200 hover:-translate-y-1"}
            `}
          >
            <span className="flex items-center justify-center gap-2">
              {prompt.trim() ? "🚀 Blast Off!" : "Waiting for Prompt..."}
            </span>
          </button>

          <p className="text-center text-[10px] text-gray-400 uppercase tracking-widest font-semibold">
            Powered by QuizIt Intelligence
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}