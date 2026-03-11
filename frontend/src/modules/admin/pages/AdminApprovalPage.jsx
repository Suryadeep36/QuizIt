import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import CircularProgress from "@mui/material/CircularProgress";
import { CheckCircle, XCircle, User, Mail, Shield, Search, RefreshCw } from "lucide-react";
import { approveTeacherByEmail, getPendingTeachers } from "../../../services/AuthService";


const AdminApprovalPage = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const data = await getPendingTeachers();
      setPendingUsers(data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const onApprove = async (email, allow) => {
    setActionLoading(email); // Lock the specific card by email
    try {
      await approveTeacherByEmail(email, allow);
      toast.success(allow ? "Teacher access granted!" : "Request rejected");
      setPendingUsers(prev => prev.filter(u => u.email !== email));
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  // Filter logic for search
  const filteredUsers = pendingUsers.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <CircularProgress size={40} className="text-cyan-600" />
        <p className="text-gray-500 font-medium animate-pulse">Loading requests...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* HEADER SECTION */}
      <div className="bg-gradient-to-br from-cyan-600 to-teal-500 pt-10 pb-20 md:pt-16 md:pb-24 px-6 rounded-b-[40px] shadow-lg">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-black text-white tracking-tight">Teacher Approvals</h1>
              <p className="text-cyan-50 font-medium opacity-90">Securely verify and enable educator accounts</p>
            </div>
            <button 
              onClick={fetchTeachers}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md p-3 rounded-2xl border border-white/30 text-white transition-all active:rotate-180"
            >
              <RefreshCw size={20} />
            </button>
          </div>

          {/* SEARCH BAR */}
          <div className="relative max-w-xl mx-auto md:mx-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
            <input 
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/50 outline-none focus:bg-white/20 transition-all shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="max-w-5xl mx-auto px-4 -mt-10">
        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-[32px] p-12 text-center shadow-xl border border-gray-100">
             <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={40} className="text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">No Pending Requests</h3>
            <p className="text-gray-500">All teachers have been processed. Great job!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredUsers.map((user) => (
              <div 
                key={user.email} 
                className="bg-white p-5 md:p-6 rounded-[28px] shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all hover:border-cyan-200 hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="shrink-0 w-14 h-14 bg-cyan-50 rounded-2xl flex items-center justify-center text-cyan-600 border border-cyan-100">
                    <User size={28} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-bold text-gray-800 text-lg truncate">{user.username}</h3>
                        <span className="bg-orange-100 text-orange-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">
                           {user.status?.replace('TEACHER_', '') || "Pending"}
                        </span>
                    </div>
                    <p className="text-gray-500 text-sm truncate flex items-center gap-1.5">
                      <Mail size={14} className="shrink-0" />
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex items-center gap-2 md:gap-3 border-t border-gray-50 pt-4 md:pt-0 md:border-none">
                  <button
                    disabled={actionLoading === user.email}
                    onClick={() => onApprove(user.email, false)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gray-50 text-gray-500 font-bold px-5 py-3 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all active:scale-95 text-sm"
                  >
                    <XCircle size={18} />
                    Reject
                  </button>
                  <button
                    disabled={actionLoading === user.email}
                    onClick={() => onApprove(user.email, true)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-orange-400 text-white font-bold px-8 py-3 rounded-2xl shadow-lg shadow-orange-100 hover:bg-orange-500 transition-all active:scale-95 disabled:bg-gray-300 text-sm"
                  >
                    {actionLoading === user.email ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <>
                        <CheckCircle size={18} />
                        Approve
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminApprovalPage;