import React from "react";

export default function GoogleFormsHeader() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-white/80 rounded-full" />
        <span className="w-2 h-2 bg-white/80 rounded-full" />
        <span className="w-2 h-2 bg-white/80 rounded-full" />
      </div>
      <span className="ml-2 text-xs font-medium text-white">Google Forms</span>
    </div>
  );
}
