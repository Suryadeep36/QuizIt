import React, { useState, useEffect } from "react";

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, quizName }) => {
  const [inputValue, setInputValue] = useState("");

  // Reset input whenever the modal opens
  useEffect(() => {
    if (isOpen) setInputValue("");
  }, [isOpen]);

  if (!isOpen) return null;

  // The delete button is only enabled if the input matches the string exactly
  const confirmationString = "I want To DElete " + quizName + " QuiZ";
  const isMatch = inputValue === confirmationString;

  return (
    // Backdrop: Removed 'bg-black' and 'bg-opacity-50', increased blur to 'md'
    // Added 'bg-black/10' for a very subtle tint to help the blur stand out, 
    // but you can remove 'bg-black/10' if you want 100% pure blur.
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/10 p-4">
      
      {/* Modal Card */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 transform transition-all scale-100 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          Delete Quiz
        </h3>
        
        <p className="text-sm text-gray-600 mb-4">
          This action cannot be undone. This will permanently delete the quiz{" "}
          <strong className="text-gray-900">{quizName}</strong> and remove all associated data.
        </p>

        <label className="block text-xs font-medium text-gray-700 mb-2">
          To confirm, type <span className="font-mono font-bold select-all bg-gray-100 px-1 rounded">{confirmationString}</span> below:
        </label>

        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={confirmationString} 
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 mb-6 font-mono text-sm"
          autoFocus
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!isMatch}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-all ${
              isMatch
                ? "bg-red-600 hover:bg-red-700 shadow-sm"
                : "bg-red-200 cursor-not-allowed"
            }`}
          >
            I understand, delete this quiz
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;