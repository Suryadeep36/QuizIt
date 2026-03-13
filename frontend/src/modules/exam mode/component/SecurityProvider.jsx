import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { ShieldAlert, Monitor } from 'lucide-react';

const SecurityProvider = () => {
  // const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);

  // useEffect(() => {
  //   // 1. DISABLE RIGHT CLICK
  //   const handleContextMenu = (e) => e.preventDefault();

  //   // 2. DISABLE REFRESH, NAVIGATION, AND DEVTOOLS
  //   const handleKeyDown = (e) => {
  //     const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  //     const modifier = isMac ? e.metaKey : e.ctrlKey; // Cmd for Mac, Ctrl for Windows/Linux
  //     const key = e.key.toLowerCase();

  //     // Block F-Keys (F5: Refresh, F11: Fullscreen, F12: DevTools)
  //     const isFKey = ["f5", "f11", "f12"].includes(key);

  //     // Block Refresh (Cmd/Ctrl + R)
  //     const isRefresh = modifier && key === "r";

  //     // Block View Source (Cmd/Ctrl + U)
  //     const isViewSource = modifier && key === "u";

  //     // Block Print (Cmd/Ctrl + P) - common way to "save" exam questions
  //     const isPrint = modifier && key === "p";

  //     // Block DevTools Shortcuts (Cmd/Ctrl + Shift + I/J/C)
  //     const isInspect = modifier && e.shiftKey && ["i", "j", "c"].includes(key);

  //     // Block Navigation
  //     // Alt + Arrows (Windows/Linux) or Cmd + [ / ] (Mac)
  //     const isBrowserNav = (e.altKey && (key === "arrowleft" || key === "arrowright")) ||
  //                          (isMac && modifier && (key === "[" || key === "]"));

  //     // Block System Quit/Hide attempts (Cmd + Q, Cmd + W, Cmd + H)
  //     // Note: Browsers usually protect Cmd+Q/W, but we prevent the default behavior where possible.
  //     const isMacSystemExit = isMac && modifier && ["q", "w", "h"].includes(key);

  //     if (isFKey || isRefresh || isViewSource || isPrint || isInspect || isBrowserNav || isMacSystemExit) {
  //       e.preventDefault();
  //       e.stopPropagation();
  //     }
  //   };

  //   // 3. FORCE BROWSER CONFIRMATION ON EXIT/REFRESH
  //   const handleBeforeUnload = (e) => {
  //     e.preventDefault();
  //     e.returnValue = "STAY IN EXAM"; // Standard trigger for "Leave site?" popup
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
  //     elem.requestFullscreen()
  //       .then(() => setIsFullscreen(true))
  //       .catch((err) => console.error(`Error attempting to enable full-screen mode: ${err.message}`));
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