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
  Users,
  CheckCircle,
  MinusCircle,
  Filter,
  CheckSquare // <-- Added new icon for the send selected button
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getAllAllowedUser,
  sendInvitation,
  sendInvitationToAll,
  sendJoinLinkToRegistered,
  sendInvitationToSelected // <-- Imported your new service
} from "../../../services/AuthService";

export default function InvitationManager({ quiz }) {
  const [isSendingAll, setIsSendingAll] = useState(false);
  const [isSendingSelected, setIsSendingSelected] = useState(false); // <-- Track loading state for selected
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSendingLinksAll, setIsSendingLinksAll] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState([]); // <-- State to hold checked users

  const handleSendJoinLinksToRegistered = async () => {
    setIsSendingLinksAll(true);
    const loadId = toast.loading("Sending join links to registered users...");
    try {
      await sendJoinLinkToRegistered(quiz.quizId);
      toast.success("Join links sent to all registered participants!", {
        id: loadId,
      });
      fetchUsers();
    } catch (err) {
      toast.error(err.message || "Failed to send join links", { id: loadId });
    } finally {
      setIsSendingLinksAll(false);
    }
  };

  const fetchUsers = useCallback(
    async (isSilent = false) => {
      if (!quiz?.quizId) return;

      try {
        if (!isSilent) setLoading(true);

        const data = await getAllAllowedUser(quiz.quizId);
        setUsers(data || []);
      } catch (err) {
        console.log(err);

        if (!isSilent) {
          toast.error(
            err.response?.data?.message ||
              err.message ||
              "Could not sync participant list",
          );
        }
      } finally {
        if (!isSilent) setLoading(false);
      }
    },
    [quiz?.quizId],
  );

  useEffect(() => {
    fetchUsers();

    const interval = setInterval(() => {
      fetchUsers(true);
    }, 4000);

    return () => clearInterval(interval);
  }, [fetchUsers]);

  const handleInviteAll = async () => {
    setIsSendingAll(true);
    const loadId = toast.loading("Processing bulk invitations...");
    try {
      await sendInvitationToAll(quiz.quizId);
      toast.success("All invitations sent!", { id: loadId });
      fetchUsers();
    } catch (err) {
      console.log(err);
      toast.error(
        err.response?.data?.message || err.message || "Bulk send failed",
      );
    } finally {
      setIsSendingAll(false);
    }
  };

  const handleSendInvite = async (userId) => {
    try {
      toast.loading("Sending...", { id: userId });
      await sendInvitation(quiz.quizId, userId);
      toast.success("Sent!", { id: userId });
      fetchUsers();
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message || err.message || "Send failed");
    }
  };

  const handleSendSelected = async () => {
    if (selectedUserIds.length === 0) return;
    
    setIsSendingSelected(true);
    const loadId = toast.loading(`Sending invitations to ${selectedUserIds.length} selected users...`);
    try {
      await sendInvitationToSelected(quiz.quizId, selectedUserIds);
      toast.success(`Sent ${selectedUserIds.length} invitations!`, { id: loadId });
      setSelectedUserIds([]); 
      fetchUsers();
    } catch (err) {
      console.log(err);
      toast.error(
        err.response?.data?.message || err.message || "Bulk send selected failed",
        { id: loadId }
      );
    } finally {
      setIsSendingSelected(false);
    }
  };

  const getStatusBadge = (user) => {
    let status = user.invitationStatus || "NOT_SENT";
    if (user.registered && status !== "QUIZ_SUBMITTED") {
      status = "REGISTERED";
    }

    const badges = {
      NOT_SENT: {
        color: "bg-slate-500/10 text-slate-500 border-slate-500/20",
        icon: <MinusCircle className="w-3 h-3" />,
        label: "Not Sent",
      },
      SENT: {
        color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
        icon: <Clock className="w-3 h-3" />,
        label: "Sent",
      },
      FAILED: {
        color: "bg-red-500/10 text-red-600 border-red-500/20",
        icon: <AlertCircle className="w-3 h-3" />,
        label: "Failed",
      },
      REGISTERED: {
        color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
        icon: <UserCheck className="w-3 h-3" />,
        label: "Registered",
      },
      QUIZ_SUBMITTED: {
        color: "bg-purple-500/10 text-purple-600 border-purple-500/20",
        icon: <CheckCircle className="w-3 h-3" />,
        label: "Submitted",
      },
    };

    const current = badges[status] || badges["NOT_SENT"];

    return (
      <div
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${current.color} text-[10px] font-black uppercase tracking-wider`}
      >
        {current.icon} {current.label}
      </div>
    );
  };

  // Filter by both search query AND Enum status
  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.email
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());

    let effectiveStatus = u.invitationStatus || "NOT_SENT";
    if (u.registered && effectiveStatus !== "QUIZ_SUBMITTED") {
      effectiveStatus = "REGISTERED";
    }

    const matchesStatus =
      statusFilter === "ALL" || effectiveStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const canBeInvited = (user) => {
    return !(
      user.registered ||
      user.invitationStatus === "REGISTERED" ||
      user.invitationStatus === "QUIZ_SUBMITTED"
    );
  };

  const eligibleFilteredUsers = filteredUsers.filter(canBeInvited);
  const isAllSelected = eligibleFilteredUsers.length > 0 && selectedUserIds.length === eligibleFilteredUsers.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(eligibleFilteredUsers.map(u => u.id));
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };


  if (loading)
    return (
      <div className="flex-1 flex items-center justify-center p-20">
        <RefreshCcw className="w-8 h-8 text-white/50 animate-spin" />
      </div>
    );

  return (
    <div className="flex-1 p-2 max-w-5xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 backdrop-blur-md rounded-lg text-white">
                <Users className="w-5 h-5" />
              </div>
              <h1 className="text-3xl font-bold text-white">Registry</h1>
            </div>
            <p className="text-white/70">
              Managing{" "}
              <span className="text-white font-bold">{users.length}</span>{" "}
              whitelisted participants.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleSendJoinLinksToRegistered}
              disabled={
                isSendingLinksAll ||
                !users.some(
                  (u) => u.registered || u.invitationStatus === "REGISTERED",
                )
              }
              className="bg-[#1b8599] hover:bg-[#166d7d] disabled:opacity-50 text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95"
            >
              {isSendingLinksAll ? (
                <RefreshCcw className="w-4 h-4 animate-spin" />
              ) : (
                <Mail className="w-4 h-4" />
              )}
              Send Join Links
            </button>

            {/* NEW: Send Selected Button */}
            {selectedUserIds.length > 0 && (
              <button
                onClick={handleSendSelected}
                disabled={isSendingSelected}
                className="bg-[#4a9cb0] hover:bg-[#3d8394] disabled:opacity-50 text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 animate-in zoom-in-95"
              >
                {isSendingSelected ? (
                  <RefreshCcw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckSquare className="w-4 h-4" />
                )}
                Send Selected ({selectedUserIds.length})
              </button>
            )}

            <button
              onClick={handleInviteAll}
              disabled={isSendingAll || users.length === 0}
              className="bg-[#f5a65b] hover:bg-[#f59843] disabled:opacity-50 text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95"
            >
              {isSendingAll ? (
                <RefreshCcw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Invite All
            </button>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-slate-50/90 backdrop-blur-md rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden flex flex-col">
          {/* Search & Filter Strip */}
          <div className="p-4 md:px-8 md:py-6 border-b border-slate-200/50 bg-white/50">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative group flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#4a9cb0] transition-colors" />
                <input
                  type="text"
                  placeholder="Filter by email address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/80 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm font-bold outline-none focus:ring-4 ring-[#4a9cb0]/10 focus:border-[#4a9cb0] transition-all"
                />
              </div>
              <div className="relative group min-w-[200px]">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#4a9cb0] transition-colors" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-white/80 border border-slate-200 rounded-2xl pl-11 pr-10 py-3 text-sm font-bold outline-none focus:ring-4 ring-[#4a9cb0]/10 focus:border-[#4a9cb0] transition-all appearance-none cursor-pointer text-slate-700"
                >
                  <option value="ALL">All</option>
                  <option value="NOT_SENT">Not Sent</option>
                  <option value="SENT">Sent</option>
                  <option value="FAILED">Failed</option>
                  <option value="REGISTERED">Registered</option>
                  <option value="QUIZ_SUBMITTED">Submitted</option>
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                  <ChevronRight className="w-4 h-4 text-slate-400 rotate-90" />
                </div>
              </div>
            </div>
          </div>

          {/* Table / Responsive List */}
          <div className="overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-100/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    {/* NEW: Checkbox Header */}
                    <th className="px-6 py-5 w-12 text-center">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={handleSelectAll}
                        disabled={eligibleFilteredUsers.length === 0}
                        className="w-4 h-4 rounded border-slate-300 text-[#4a9cb0] focus:ring-[#4a9cb0] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        title="Select all eligible users"
                      />
                    </th>
                    <th className="px-4 py-5">Participant</th>
                    <th className="px-4 py-5 text-center">Current Status</th>
                    <th className="px-4 py-5">Send At</th>
                    <th className="px-8 py-5 text-right">Invite</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-white/80 transition-all group"
                    >
                      {/* NEW: Checkbox Body Cell */}
                      <td className="px-6 py-5 text-center">
                        {canBeInvited(user) ? (
                          <input
                            type="checkbox"
                            checked={selectedUserIds.includes(user.id)}
                            onChange={() => handleSelectUser(user.id)}
                            className="w-4 h-4 rounded border-slate-300 text-[#4a9cb0] focus:ring-[#4a9cb0] cursor-pointer transition-all"
                          />
                        ) : (
                          <span className="w-4 h-4 inline-block"></span> // Placeholder spacer
                        )}
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-700">
                            {user.email}
                          </span>
                          {user.deliveryErrorMessage && (
                            <span className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1">
                              <XCircle className="w-3 h-3" />{" "}
                              {user.deliveryErrorMessage}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex justify-center">
                          {getStatusBadge(user)}
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                          {user.invitationSentAt
                            ? new Date(
                                user.invitationSentAt,
                              ).toLocaleDateString()
                            : "—"}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        {canBeInvited(user) && (
                          <button
                            onClick={() => handleSendInvite(user.id)}
                            className="p-2.5 bg-slate-100 text-slate-400 hover:bg-[#4a9cb0] hover:text-white rounded-xl transition-all active:scale-90"
                            title="Send/Resend Invite"
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
              {/* Optional: Mobile "Select All" toggle strip */}
              {eligibleFilteredUsers.length > 0 && (
                <div className="p-4 bg-slate-50 flex items-center justify-between border-b border-slate-100">
                  <label className="flex items-center gap-3 text-xs font-bold text-slate-500 uppercase cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 text-[#4a9cb0] focus:ring-[#4a9cb0]"
                    />
                    Select All Eligible
                  </label>
                </div>
              )}
              
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="p-6 flex flex-col gap-4 bg-white/40"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-start gap-4 flex-1 overflow-hidden">
                      {/* NEW: Mobile Checkbox */}
                      {canBeInvited(user) ? (
                        <div className="pt-1">
                           <input
                            type="checkbox"
                            checked={selectedUserIds.includes(user.id)}
                            onChange={() => handleSelectUser(user.id)}
                            className="w-5 h-5 rounded border-slate-300 text-[#4a9cb0] focus:ring-[#4a9cb0]"
                          />
                        </div>
                      ) : (
                         <div className="w-5" /> // Spacer
                      )}
                      
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-sm font-black text-slate-800 truncate">
                          {user.email}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                          {user.invitationSentAt
                            ? `Sent: ${new Date(user.invitationSentAt).toLocaleDateString()}`
                            : "Never invited"}
                        </span>
                      </div>
                    </div>
                    {getStatusBadge(user)}
                  </div>
                  {canBeInvited(user) && (
                    <button
                      onClick={() => handleSendInvite(user.id)}
                      className="w-full mt-2 py-3 bg-slate-100 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      <Send className="w-3 h-3" /> Resend Invite
                    </button>
                  )}
                </div>
              ))}
            </div>

            {filteredUsers.length === 0 && (
              <div className="py-24 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <UserPlus className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-slate-800 font-black uppercase text-sm tracking-widest">
                  No Matches Found
                </h3>
                <p className="text-slate-500 text-xs font-medium mt-2">
                  Try searching for a different email or changing the status
                  filter.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}