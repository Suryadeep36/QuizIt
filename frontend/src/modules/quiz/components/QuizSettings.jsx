import React, { useState, useEffect } from "react";
import {
    Save,
    Settings2,
    ShieldAlert,
    Clock,
    Layout,
    UserCheck,
    X,
    Edit3,
    Calendar,
    Sparkles
} from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import { deleteQuiz } from "../../../services/AuthService";
import DeleteConfirmationModal from "../../dashboard/component/DeleteConfirmationModal";

export default function QuizSettings({ quiz }) {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [emailInput, setEmailInput] = useState("");

    // Local State for Form
    const [formData, setFormData] = useState({
        quizName: quiz?.quizName || "",
        mode: quiz?.mode || "SERVER",
        startTime: quiz?.startTime ? new Date(quiz.startTime).toISOString().slice(0, 16) : "",
        endTime: quiz?.endTime ? new Date(quiz.endTime).toISOString().slice(0, 16) : "",
        allowGuest: quiz?.allowGuest ?? true,
        allowedEmails: quiz?.allowedEmails || [],
        shuffleQuestions: quiz?.shuffleQuestions ?? false,
        showLeaderboard: quiz?.showLeaderboard ?? true,
        allowAllAuthenticated: quiz?.allowAllAuthenticated ?? true,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const addEmail = () => {
        const trimmed = emailInput.trim().toLowerCase();
        if (trimmed && /^\S+@\S+\.\S+$/.test(trimmed)) {
            if (!formData.allowedEmails.includes(trimmed)) {
                setFormData(prev => ({ ...prev, allowedEmails: [...prev.allowedEmails, trimmed] }));
                setEmailInput("");
            } else { toast.error("Email already added"); }
        }
    };

    const removeEmail = (index) => {
        setFormData(prev => ({
            ...prev,
            allowedEmails: prev.allowedEmails.filter((_, i) => i !== index)
        }));
    };

    const handleUpdateQuiz = async () => {
        try {
            setIsUpdating(true);
            const payload = {
                ...formData,
                startTime: new Date(formData.startTime).toISOString(),
                endTime: new Date(formData.endTime).toISOString(),
            };
            // await updateQuizById(quiz.quizId, payload);
            toast.success("Settings updated");
            setIsEditing(false);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteConfirm = async () => {
        try {
            await deleteQuiz(quiz.quizId);
            toast.success("Quiz deleted");
            navigate("/dashboard");
        } catch (err) {
            toast.error(err.response?.data?.message || "Delete failed");
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 px-4 pb-20 animate-in fade-in slide-in-from-bottom-4">

            {/* Header with Edit Toggle */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2 uppercase tracking-tight">
                        <Settings2 className="w-6 h-6" /> Configuration
                    </h2>
                    <p className="text-white/60 text-xs font-medium tracking-widest uppercase mt-1">Status: {isEditing ? 'Editing Mode' : 'View Only'}</p>
                </div>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-xl flex items-center gap-2 font-bold transition-all border border-white/10"
                    >
                        <Edit3 className="w-4 h-4" /> Edit Quiz
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="bg-slate-800 text-white px-5 py-2 rounded-xl font-bold hover:bg-slate-700"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleUpdateQuiz}
                            disabled={isUpdating}
                            className="bg-[#4a9cb0] text-white px-5 py-2 rounded-xl font-bold shadow-lg flex items-center gap-2"
                        >
                            {isUpdating ? "Saving..." : <Save className="w-4 h-4" />} Save
                        </button>
                    </div>
                )}
            </div>

            {/* Main Content Layout */}
            <div className="flex flex-col lg:flex-row gap-6">

                {/* Left Side: Form/Settings */}
                <div className="flex-1 space-y-6">
                    <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-xl border border-white/20">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Quiz Name */}
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quiz Title</label>
                                {isEditing ? (
                                    <input
                                        name="quizName"
                                        value={formData.quizName}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border-2 border-slate-100 focus:border-[#4a9cb0] rounded-2xl px-5 py-3.5 font-bold text-slate-700 outline-none transition-all"
                                    />
                                ) : (
                                    <div className="px-5 py-3.5 bg-slate-50 rounded-2xl border-2 border-transparent font-bold text-slate-800 text-lg">
                                        {formData.quizName}
                                    </div>
                                )}
                            </div>

                            {/* Mode */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mode</label>
                                {isEditing ? (
                                    <select
                                        name="mode"
                                        value={formData.mode}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border-2 border-slate-100 focus:border-[#4a9cb0] rounded-2xl px-5 py-3.5 font-bold text-slate-700 outline-none appearance-none"
                                    >
                                        <option value="SERVER">SERVER</option>
                                        <option value="EXAM">EXAM</option>
                                    </select>
                                ) : (
                                    <div className="px-5 py-3.5 bg-slate-50 rounded-2xl font-bold text-slate-700 flex items-center gap-2">
                                        <Layout className="w-4 h-4 text-[#4a9cb0]" /> {formData.mode}
                                    </div>
                                )}
                            </div>

                            {/* Dynamic Toggle: Access Control OR Guest Entry */}
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase ml-1">
                                    {formData.mode === 'EXAM' ? 'Access Control' : 'Guest Entry'}
                                </label>

                                {formData.mode === 'EXAM' ? (
                                    /* ACCESS CONTROL TOGGLE (Shown only in EXAM) */
                                    <div
                                        onClick={() => {
                                            // Prevent click if not editing
                                            if (!isEditing) return;
                                            setFormData(prev => ({ ...prev, allowAllAuthenticated: !prev.allowAllAuthenticated }));
                                        }}
                                        className={`flex items-center justify-between px-5 py-3 md:py-4 rounded-2xl border-2 transition-all duration-300 
                                         ${!isEditing ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'}
                                         ${formData.allowAllAuthenticated
                                                ? 'border-[#1b8599] bg-[#1b8599]/5'
                                                : 'border-slate-100 bg-slate-50'
                                            }`}
                                    >
                                        <span className="text-sm font-bold text-slate-600">
                                            {"All Authenticated User"}
                                        </span>

                                        <div className={`w-10 h-5 rounded-full relative transition-colors ${formData.allowAllAuthenticated ? 'bg-[#1b8599]' : 'bg-slate-300'
                                            }`}>
                                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.allowAllAuthenticated ? 'right-1' : 'left-1'
                                                }`} />
                                        </div>
                                    </div>
                                ) : (
                                    /* GUEST ENTRY TOGGLE (Shown in SERVER/LAN) */
                                    <div className="flex items-center justify-between px-5 py-3 md:py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 transition-all">
                                        <span className="text-sm font-bold text-slate-600">Allow Guests</span>
                                        <input
                                            type="checkbox"
                                            name="allowGuest"
                                            disabled={!isEditing}
                                            checked={formData.allowGuest}
                                            onChange={handleChange}
                                            className="w-5 h-5 accent-[#1b8599] cursor-pointer"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Timing */}
                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-[#4a9cb0]/5 rounded-[1.5rem] border border-[#4a9cb0]/10">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[#4a9cb0] uppercase flex items-center gap-1">
                                        <Calendar className="w-3 h-3" /> Start Window
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="datetime-local"
                                            name="startTime"
                                            value={formData.startTime}
                                            onChange={handleChange}
                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 font-bold text-sm outline-none focus:ring-2 ring-[#4a9cb0]/20"
                                        />
                                    ) : (
                                        <p className="font-bold text-slate-700 text-sm ml-1">{new Date(formData.startTime).toLocaleString()}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[#4a9cb0] uppercase flex items-center gap-1">
                                        <Calendar className="w-3 h-3" /> End Window
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="datetime-local"
                                            name="endTime"
                                            value={formData.endTime}
                                            onChange={handleChange}
                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 font-bold text-sm outline-none focus:ring-2 ring-[#4a9cb0]/20"
                                        />
                                    ) : (
                                        <p className="font-bold text-slate-700 text-sm ml-1">{new Date(formData.endTime).toLocaleString()}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-red-50/50 border border-red-100 rounded-[2rem] p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-red-500 border border-red-50 shadow-sm"><ShieldAlert /></div>
                            <div>
                                <h3 className="text-sm font-black text-red-700 uppercase tracking-tighter">Danger Zone</h3>
                                <p className="text-[11px] text-red-600/70 font-medium max-w-[280px]">Permanent action. All quiz data and participant history will be lost.</p>
                            </div>
                        </div>
                        <button onClick={() => setIsModalOpen(true)} className="w-full md:w-auto px-6 py-3 bg-red-100 text-red-600 border border-red-200 rounded-2xl hover:bg-red-600 hover:text-white font-black text-xs transition-all shadow-sm uppercase tracking-widest">
                            Delete Permanently
                        </button>
                    </div>
                </div>

                {/* Right Side: Email Access List */}
                <div className={`w-full lg:w-[380px] space-y-4 transition-all duration-500 ${(formData.mode === 'EXAM' && !formData.allowAllAuthenticated) ? 'opacity-100 translate-x-0' : 'opacity-0 hidden lg:block pointer-events-none'}`}>
                    <div className="bg-slate-50/50 rounded-[2rem] p-6 border border-slate-200 h-full flex flex-col">
                        <div className="mb-4">
                            <h3 className="font-black text-slate-800 uppercase text-xs tracking-tighter">Access Registry</h3>
                            <p className="text-[10px] text-slate-500 font-medium">Participants restricted to this list.</p>
                        </div>

                        {isEditing && (
                            <div className="relative mb-4">
                                <input
                                    placeholder="Add email..."
                                    value={emailInput}
                                    onChange={(e) => setEmailInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addEmail()}
                                    className="w-full bg-white border-2 border-slate-100 focus:border-[#4a9cb0] rounded-xl pl-4 pr-10 py-3 text-xs font-bold transition-all outline-none shadow-sm"
                                />
                                <button onClick={addEmail} className="absolute right-2 top-2 bg-[#4a9cb0] text-white p-1.5 rounded-lg"><Sparkles className="w-3.5 h-3.5" /></button>
                            </div>
                        )}

                        <div className="flex-1 bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col shadow-inner max-h-[400px]">
                            <div className="p-3 border-b bg-slate-50/50 flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                <span>Whitelist</span>
                                <span>{formData.allowedEmails.length} Users</span>
                            </div>
                            <div className="p-3 overflow-y-auto space-y-2 flex-1 scrollbar-thin">
                                {formData.allowedEmails.length === 0 ? (
                                    <div className="text-center py-10 opacity-30"><UserCheck className="mx-auto w-8 h-8 mb-2" /><p className="text-[10px] font-bold">No restrictions</p></div>
                                ) : (
                                    formData.allowedEmails.map((email, idx) => (
                                        <div key={idx} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-100 group animate-in slide-in-from-right-2">
                                            <span className="text-[10px] font-bold text-slate-600 truncate mr-2">{email}</span>
                                            {isEditing && <button onClick={() => removeEmail(idx)} className="text-slate-300 hover:text-red-500"><X className="w-3.5 h-3.5" /></button>}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <DeleteConfirmationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={handleDeleteConfirm} quizName={quiz?.quizName} />
        </div>
    );
}