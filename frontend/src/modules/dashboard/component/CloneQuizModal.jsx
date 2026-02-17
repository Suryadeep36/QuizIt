import { useState } from "react";
import { Search, Copy, Save, X, Loader2 } from "lucide-react";
// import { 
//   getQuizByCode, // Assume this exists
//   createQuiz, 
//   saveBulkQuestions 
// } from "../../../services/AuthService";
import toast from "react-hot-toast";

export default function CloneQuizModal({ isOpen, onClose, onRefresh }) {
  const [identifier, setIdentifier] = useState(""); // Quiz ID or Code
  const [sourceQuestions, setSourceQuestions] = useState([]);
  const [sourceQuiz, setSourceQuiz] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSearch = async () => {
    if (!identifier) return;
    setIsSearching(true);
    try {
      // Step 1: Fetch source quiz and its questions
    //   const data = await getQuizByCode(identifier); 
      setSourceQuiz(data.quiz);
      setSourceQuestions(data.questions);
      toast.success("Quiz found!");
    } catch (err) {
      toast.error("Quiz not found with that code/ID");
    } finally {
      setIsSearching(false);
    }
  };

  const handleClone = async () => {
    if (!window.confirm(`Clone "${sourceQuiz.quizName}" as a new quiz?`)) return;

    setIsSaving(true);
    try {
      // Step 2: Create the new Quiz entry first
      const newQuizData = {
        quizName: `${sourceQuiz.quizName} (Copy)`,
        description: sourceQuiz.description,
        // Add other metadata as needed
      };
    //   const createdQuiz = await createQuiz(newQuizData);
      const newQuizId = createdQuiz.quizId;

      // Step 3: Prepare questions for bulk save (remove old IDs)
      const formattedQuestions = sourceQuestions.map(q => ({
        ...q,
        quizId: newQuizId,
        questionId: null // Ensure backend creates new IDs
      }));

      // Step 4: Bulk save
    //   await saveBulkQuestions(newQuizId, formattedQuestions);
      
      toast.success("Quiz cloned successfully!");
      onRefresh(); // Refresh dashboard list
      onClose();
    } catch (err) {
      toast.error("Failed to clone quiz");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">Clone Existing Quiz</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Search Input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Enter Quiz ID or Access Code..."
                className="w-full pl-10 pr-4 py-3 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-[#4a9cb0] outline-none"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>
            <button 
              onClick={handleSearch}
              disabled={isSearching}
              className="bg-[#4a9cb0] text-white px-6 rounded-2xl font-bold hover:bg-[#3a8c9f] disabled:opacity-50"
            >
              {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : "Search"}
            </button>
          </div>

          {/* Preview Section */}
          {sourceQuiz && (
            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <p className="text-sm font-bold text-blue-600">Source Quiz Found:</p>
                <h3 className="text-lg font-bold text-slate-800">{sourceQuiz.quizName}</h3>
                <p className="text-xs text-slate-500">{sourceQuestions.length} Questions</p>
              </div>
              
              <div className="space-y-2">
                {sourceQuestions.map((q, i) => (
                  <div key={i} className="text-sm p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600">
                    {i + 1}. {q.content || "Untitled Question"}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-slate-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 text-slate-600 font-medium">Cancel</button>
          <button 
            onClick={handleClone}
            disabled={!sourceQuiz || isSaving}
            className="flex items-center gap-2 bg-[#f5a65b] text-white px-8 py-2 rounded-xl font-bold hover:bg-[#e4954a] disabled:opacity-50 shadow-lg"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Copy className="w-5 h-5" />}
            Clone & Save New Quiz
          </button>
        </div>
      </div>
    </div>
  );
}