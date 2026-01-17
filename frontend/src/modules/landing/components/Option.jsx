import React from "react";

export default function Option({ correct = false }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-3.5 h-3.5 rounded-full border ${
          correct ? "border-teal-500 bg-teal-500" : "border-gray-400"
        }`}
      />
      <div
        className={`flex-1 h-3 rounded ${
          correct ? "bg-teal-100" : "bg-gray-200"
        }`}
      />
    </div>
  );
}
