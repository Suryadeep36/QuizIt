import React from 'react';
import { 
  Timer, Menu, X, ChevronLeft, ChevronRight, Send, User 
} from "lucide-react";
import { useQuestionList } from "../../../stores/store";

const MobileExamRoom = ({
    currentQuestion, currentQIndex, questionTime, globalTime,
    formatTime, renderOptions, handlePrevious, handleSaveAndNext,
    handleMarkForReview, questionIds, handleNavigateToIndex,
    isSidebarOpen, setIsSidebarOpen, participant, quizId, handleSubmitTest
}) => {
    const getStatus = useQuestionList((s) => s.getStatus);

    return (
        <div className="md:hidden h-screen w-full bg-white flex flex-col overflow-hidden select-none font-sans">
            {/* 1. Header */}
            <header className="bg-[#1b8599] text-white px-4 py-3 flex justify-between items-center z-30 shadow-md">
                <div className="flex flex-col">
                    <h1 className="font-black uppercase text-sm italic leading-none tracking-tighter">QuizIt Live</h1>
                    <span className="text-[10px] opacity-70 mt-1 font-bold">ID: {quizId?.substring(0, 8)}</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-[9px] font-black uppercase opacity-60 leading-none mb-0.5">Global Time</p>
                        <p className="text-lg font-mono font-black text-orange-300 leading-none">{formatTime(globalTime)}</p>
                    </div>
                    <button 
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 bg-white/10 rounded-xl active:scale-90 transition-transform"
                    >
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </header>

            {/* 2. Main Question Area */}
            <main className="flex-1 overflow-y-auto px-5 py-6 bg-white">
                <div className="flex justify-between items-center mb-6">
                    <span className="bg-slate-900 text-white px-3 py-1 rounded-lg font-black text-[10px] uppercase tracking-wider">
                        Question {currentQIndex + 1} / {questionIds.length}
                    </span>
                    <div className={`flex items-center gap-1 font-mono font-bold ${questionTime < 10 ? 'text-red-500 animate-pulse' : 'text-slate-500'}`}>
                        <Timer size={14} /> <span className="text-sm">{formatTime(questionTime)}</span>
                    </div>
                </div>

                <div className="flex-1">
                    {getStatus(currentQuestion?.questionId) === 'time_up' ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12 animate-in fade-in duration-500">
                            <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-3xl flex items-center justify-center">
                                <Timer size={40} />
                            </div>
                            <h2 className="text-xl font-black text-slate-800 uppercase">Time Expired</h2>
                            <p className="text-sm text-slate-400 px-6 font-medium">You can no longer modify this response.</p>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-xl font-black text-slate-800 leading-tight mb-8">
                                {currentQuestion?.content}
                            </h2>
                            {currentQuestion?.imageUrl && (
                                <img src={currentQuestion.imageUrl} alt="Context" className="w-full h-auto rounded-2xl mb-8 shadow-sm border border-slate-100" />
                            )}
                            <div className="pb-32"> {/* Bottom padding for sticky footer */}
                                {renderOptions()}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* 3. Mobile Palette Drawer (Bottom Sheet) */}
            <div className={`fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsSidebarOpen(false)}>
                <div 
                    className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-[3rem] p-8 pb-10 transition-transform duration-500 ease-out shadow-2xl ${isSidebarOpen ? 'translate-y-0' : 'translate-y-full'}`}
                    onClick={e => e.stopPropagation()}
                >
                    <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-8" />
                    
                    <div className="flex items-center gap-4 mb-8 p-4 bg-slate-50 rounded-2xl">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#1b8599] shadow-sm"><User size={24} /></div>
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Candidate</p>
                            <h3 className="font-black text-slate-800 text-sm">{participant?.name || "Parth"}</h3>
                        </div>
                    </div>

                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 px-1">Question Palette</h4>
                    <div className="grid grid-cols-5 gap-3 max-h-[35vh] overflow-y-auto p-1">
                        {questionIds.map((id, idx) => {
                            const status = getStatus(id);
                            const statusClasses = {
                                answered: 'bg-emerald-500 text-white border-emerald-500',
                                marked: 'bg-orange-500 text-white border-orange-500',
                                visited: 'bg-white border-slate-400 text-slate-700',
                                not_visited: 'bg-white border-slate-100 text-slate-300',
                                time_up: 'bg-slate-200 text-slate-400 border-slate-200'
                            };
                            return (
                                <button
                                    key={id}
                                    onClick={() => { handleNavigateToIndex(idx); setIsSidebarOpen(false); }}
                                    className={`h-11 rounded-xl text-xs font-black border-2 transition-all ${statusClasses[status]} ${currentQIndex === idx ? 'ring-4 ring-[#1b8599]/20 scale-110 z-10' : ''}`}
                                >
                                    {idx + 1}
                                </button>
                            );
                        })}
                    </div>

                    <button 
                        onClick={handleSubmitTest}
                        className="w-full mt-8 bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl shadow-slate-200"
                    >
                        Submit Assessment <Send size={16} />
                    </button>
                </div>
            </div>

            {/* 4. Sticky Bottom Action Bar */}
            <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-slate-100 p-4 flex gap-2 z-20">
                <button onClick={handlePrevious} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase flex items-center justify-center gap-1 active:bg-slate-200 transition-colors">
                    <ChevronLeft size={16} /> Prev
                </button>
                
                {getStatus(currentQuestion?.questionId) !== 'time_up' ? (
                    <button onClick={handleSaveAndNext} className="flex-[2.5] py-4 bg-[#1b8599] text-white rounded-2xl font-black text-[10px] uppercase flex items-center justify-center gap-1 shadow-lg shadow-[#1b8599]/20 active:bg-[#166d7d] transition-all">
                        Save & Next <ChevronRight size={16} />
                    </button>
                ) : (
                    <button onClick={() => handleNavigateToIndex(currentQIndex + 1)} className="flex-[2.5] py-4 bg-slate-800 text-white rounded-2xl font-black text-[10px] uppercase flex items-center justify-center gap-1">
                        Next <ChevronRight size={16} />
                    </button>
                )}

                <button onClick={handleMarkForReview} className="flex-1 py-4 border-2 border-orange-100 text-orange-500 rounded-2xl font-black text-[10px] uppercase flex items-center justify-center active:bg-orange-50 transition-colors">
                    Review
                </button>
            </footer>
        </div>
    );
};

export default MobileExamRoom;