import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { ShieldAlert, Monitor } from 'lucide-react';

const SecurityProvider = () => {
  // const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);

  // useEffect(() => {
  //   // 1. DISABLE RIGHT CLICK (Context Menu)
  //   const handleContextMenu = (e) => e.preventDefault();

  //   // 2. DISABLE REFRESH & NAVIGATION KEYS
  //   const handleKeyDown = (e) => {
  //     if (
  //       e.key === "F5" ||                       // Standard Refresh
  //       e.key === "F11" ||                      // Browser Fullscreen toggle
  //       e.key === "F12" ||                      // DevTools
  //       (e.ctrlKey && e.key === "r") ||         // Windows/Linux Refresh
  //       (e.metaKey && e.key === "r") ||         // Mac Refresh
  //       (e.ctrlKey && e.shiftKey && e.key === "r") || // Hard Refresh
  //       (e.altKey && e.key === "ArrowLeft") ||  // Alt + Left (Back)
  //       (e.altKey && e.key === "ArrowRight") || // Alt + Right (Forward)
  //       (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C")) || // Inspect
  //       (e.ctrlKey && e.key === "u")            // View Source
  //     ) {
  //       e.preventDefault();
  //       e.stopPropagation();
  //     }
  //   };

  //   // 3. FORCE BROWSER CONFIRMATION ON EXIT/REFRESH
  //   const handleBeforeUnload = (e) => {
  //     e.preventDefault();
  //     // Most browsers don't show the custom text anymore, but the 
  //     // presence of this string triggers the "Cancel/Leave" dialog.
  //     e.returnValue = "STAY IN EXAM"; 
  //   };

  //   // 4. FULLSCREEN TRACKING
  //   const handleFsChange = () => {
  //     setIsFullscreen(!!document.fullscreenElement);
  //   };

  //   // Apply listeners
  //   document.addEventListener("contextmenu", handleContextMenu);
  //   document.addEventListener("keydown", handleKeyDown);
  //   window.addEventListener("beforeunload", handleBeforeUnload);
  //   document.addEventListener("fullscreenchange", handleFsChange);

  //   return () => {
  //     document.removeEventListener("contextmenu", handleContextMenu);
  //     document.removeEventListener("keydown", handleKeyDown);
  //     window.removeEventListener("beforeunload", handleBeforeUnload);
  //     document.removeEventListener("fullscreenchange", handleFsChange);
  //   };
  // }, []);

  // const enableSecureMode = () => {
  //   const elem = document.documentElement;
  //   if (elem.requestFullscreen) {
  //     elem.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
  //   }
  // };

  // if (!isFullscreen) {
  //   return (
  //     <div className="fixed inset-0 bg-[#1b8599] z-[9999] flex items-center justify-center p-6 text-center">
  //       <div className="max-w-md w-full bg-white rounded-[2rem] p-10 shadow-2xl">
  //         <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
  //           <ShieldAlert size={40} />
  //         </div>
  //         <h2 className="text-2xl font-black text-slate-800 uppercase mb-2">Security Breach</h2>
  //         <p className="text-slate-500 font-medium mb-8 text-sm">
  //           Refresh, navigation, and inspection are disabled. You must stay in fullscreen to prevent disqualification.
  //         </p>
  //         <button
  //           onClick={enableSecureMode}
  //           className="w-full bg-[#1b8599] text-white py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#166d7d] transition-all"
  //         >
  //           <Monitor size={20} /> Re-Enter Fullscreen
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }

  return <Outlet />;
};

export default SecurityProvider;