import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { ShieldAlert, Monitor } from 'lucide-react';

const SecurityProvider = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    const handleKeyDown = (e) => {
      if (e.key === "F12" || (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C")) || (e.ctrlKey && e.key === "u")) {
        e.preventDefault();
      }
    };

    // Track if user exits fullscreen
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("fullscreenchange", handleFsChange);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("fullscreenchange", handleFsChange);
    };
  }, []);

  const enableSecureMode = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().then(() => setIsFullscreen(true)).catch(err => console.error(err));
    }
  };

  if (!isFullscreen) {
    return (
      <div className="fixed inset-0 bg-[#1b8599] z-[9999] flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white rounded-[2rem] p-10 shadow-2xl">
          <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <ShieldAlert size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 uppercase mb-2">Secure Environment</h2>
          <p className="text-slate-500 font-medium mb-8">
            To prevent exam malpractice, this assessment requires a locked fullscreen environment.
          </p>
          <button
            onClick={enableSecureMode}
            className="w-full bg-[#1b8599] text-white py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#166d7d] transition-all"
          >
            <Monitor size={20} /> Enter Fullscreen
          </button>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default SecurityProvider;