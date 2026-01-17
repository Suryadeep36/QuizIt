import React from "react";

export default function Card({
  title,
  children,
  header,
  headerClass = "",
  className = ""
}) {
  return (
    <div
      className={`w-56 bg-white rounded-2xl shadow-lg overflow-hidden ${className}`}
    >
      {header && <div className={`px-3 py-2 ${headerClass}`}>{header}</div>}

      <div className="p-4">
        <h3 className="text-sm font-semibold mb-3 text-gray-700">{title}</h3>
        {children}
      </div>
    </div>
  );
}
