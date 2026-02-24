import React, { useEffect, useState, useCallback } from "react";
import {
    Mail,
    Send,
    XCircle,
    Clock,
    AlertCircle,
    UserPlus,
    RefreshCcw,
    Search,
    UserCheck,
    ChevronRight,
    Users
} from "lucide-react";
import toast from "react-hot-toast";
import { getAllAllowedUser, sendInvitation, sendInvitationToAll } from "../../../services/AuthService";

export default function InvitationManager({ quiz }) {
    const [isSendingAll, setIsSendingAll] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = useCallback(async () => {
        if (!quiz?.quizId) return;
        try {
            setLoading(true);
            const data = await getAllAllowedUser(quiz.quizId);
            setUsers(data || []);
        } catch (err) {
             console.log(err)
                    toast.error(
                      err.response?.data?.message ||
                      err.message ||
                      "Could not sync participant list"
                    );
         
        } finally {
            setLoading(false);
        }
    }, [quiz?.quizId]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleInviteAll = async () => {
        setIsSendingAll(true);
        const loadId = toast.loading("Processing bulk invitations...");
        try {
            await sendInvitationToAll(quiz.quizId);
            toast.success("All invitations sent!", { id: loadId });
            fetchUsers();
        } catch (err) {
              console.log(err)
                    toast.error(
                      err.response?.data?.message ||
                      err.message ||
                      "Bulk send failed"
                    );
        } finally {
            setIsSendingAll(false);
        }
    };

    const handleSendInvite = async (userId) => {
        try {
            toast.loading("Sending...", { id: userId });
            await sendInvitation(quiz.quizId,userId);
            toast.success("Sent!", { id: userId });
            fetchUsers();
        } catch (err) {
                console.log(err)
                    toast.error(
                      err.response?.data?.message ||
                      err.message ||
                      "Send failed"
                    );
        }
    };

    const getStatusBadge = (user) => {
        if (user.registered) return (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-black uppercase tracking-wider">
                <UserCheck className="w-3 h-3" /> Registered
            </div>
        );

        const statuses = {
            'SENT': { color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', icon: <Clock className="w-3 h-3" />, label: 'Sent' },
            'FAILED': { color: 'bg-red-500/10 text-red-600 border-red-500/20', icon: <AlertCircle className="w-3 h-3" />, label: 'Failed' }
        };

        const current = statuses[user.invitationStatus] || { color: 'bg-slate-500/10 text-slate-500 border-slate-500/10', icon: null, label: 'Pending' };

        return (
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${current.color} text-[10px] font-black uppercase tracking-wider`}>
                {current.icon} {current.label}
            </div>
        );
    };

    const filteredUsers = users.filter(u => u.email?.toLowerCase().includes(searchQuery.toLowerCase()));

    if (loading) return (
        <div className="flex-1 flex items-center justify-center p-20">
            <RefreshCcw className="w-8 h-8 text-white/50 animate-spin" />
        </div>
    );

    return (
        <div className="flex-1 p-2 max-w-5l mx-auto w-full animate-in fade-in slide-in-from-bottom-4">
            <div className="flex flex-col gap-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-white/20 backdrop-blur-md rounded-lg text-white">
                                <Users className="w-5 h-5" />
                            </div>
                            <h1 className="text-3xl font-bold text-white">Registry</h1>
                        </div>
                        <p className="text-white/70">Managing <span className="text-white font-bold">{users.length}</span> whitelisted participants for <span className="italic">{quiz?.quizName}</span>.</p>
                    </div>

                    <button
                        onClick={handleInviteAll}
                        disabled={isSendingAll || users.length === 0}
                        className="bg-[#f5a65b] hover:bg-[#f59843] disabled:opacity-50 text-white px-8 py-3 rounded-2xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95"
                    >
                        {isSendingAll ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        Send All Invites
                    </button>
                </div>

                {/* Main Card */}
                <div className="bg-slate-50/90 backdrop-blur-md rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden flex flex-col">

                    {/* Search Strip */}
                    <div className="p-4 md:px-8 md:py-6 border-b border-slate-200/50 bg-white/50">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#4a9cb0] transition-colors" />
                            <input
                                type="text"
                                placeholder="Filter by email address..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/80 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm font-bold outline-none focus:ring-4 ring-[#4a9cb0]/10 focus:border-[#4a9cb0] transition-all"
                            />
                        </div>
                    </div>

                    {/* Table / Responsive List */}
                    <div className="overflow-hidden">
                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-100/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                        <th className="px-8 py-5">Participant</th>
                                        <th className="px-4 py-5 text-center">Current Status</th>
                                        <th className="px-4 py-5">Send At</th>
                                        <th className="px-8 py-5 text-right">Invite</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-white/80 transition-all group">
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-700">{user.email}</span>
                                                    {user.deliveryErrorMessage && (
                                                        <span className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1">
                                                            <XCircle className="w-3 h-3" /> {user.deliveryErrorMessage}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-5">
                                                <div className="flex justify-center">{getStatusBadge(user)}</div>
                                            </td>
                                            <td className="px-4 py-5">
                                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                                                    {user.invitationSentAt ? new Date(user.invitationSentAt).toLocaleDateString() : '—'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                {!user.registered && (
                                                    <button
                                                        onClick={() => handleSendInvite(user.id)}
                                                        className="p-2.5 bg-slate-100 text-slate-400 hover:bg-[#4a9cb0] hover:text-white rounded-xl transition-all active:scale-90"
                                                    >
                                                        <Send className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile List View */}
                        <div className="md:hidden divide-y divide-slate-100">
                            {filteredUsers.map((user) => (
                                <div key={user.id} className="p-6 flex flex-col gap-4 bg-white/40">
                                    <div className="flex justify-between items-start">
                                        <div className="flex flex-col max-w-[70%]">
                                            <span className="text-sm font-black text-slate-800 truncate">{user.email}</span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase">{user.invitationSentAt ? `Sent: ${new Date(user.invitationSentAt).toLocaleDateString()}` : 'Never invited'}</span>
                                        </div>
                                        {getStatusBadge(user)}
                                    </div>
                                    {!user.registered && (
                                        <button
                                            onClick={() => handleSendInvite(user.id)}
                                            className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
                                        >
                                            <Send className="w-3 h-3" /> Resend Invite
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Empty States */}
                        {filteredUsers.length === 0 && (
                            <div className="py-24 text-center">
                                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <UserPlus className="w-10 h-10 text-slate-300" />
                                </div>
                                <h3 className="text-slate-800 font-black uppercase text-sm tracking-widest">No Matches Found</h3>
                                <p className="text-slate-500 text-xs font-medium mt-2">Try searching for a different email address.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}