import React from "react";

export default function Legend({color, label}) {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
      <span className="text-gray-600">{label}</span>
    </div>
  );
}
