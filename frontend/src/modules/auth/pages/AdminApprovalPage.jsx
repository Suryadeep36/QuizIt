import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import CircularProgress from "@mui/material/CircularProgress";
import { CheckCircle, XCircle, User, Mail, Shield } from "lucide-react";
// Import your axios instance/service
// import { getPendingTeachers, handleTeacherApproval } from "../services/AdminService";

const AdminApprovalPage = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // Track which ID is being processed

  useEffect(() => {
    fetchPendingTeachers();
  }, []);

  const fetchPendingTeachers = async () => {
    try {
      // Replace with your actual API call
      // const data = await getPendingTeachers();
      // setPendingUsers(data);
      
      // Mock data for UI demonstration
      setPendingUsers([
        { id: "1", username: "JohnTeacher", email: "john@school.com", createdAt: "2026-03-11" },
        { id: "2", username: "SarahMath", email: "sarah@edu.com", createdAt: "2026-03-10" }
      ]);
    } catch (err) {
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  const onApprove = async (userId, allow) => {
    setActionLoading(userId);
    try {
      // await handleTeacherApproval(userId, allow);
      toast.success(allow ? "Teacher approved!" : "Request rejected");
      setPendingUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      toast.error("Operation failed");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <CircularProgress size={40} className="text-cyan-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-cyan-600 to-teal-500 pt-16 pb-24 px-6 rounded-b-[40px] shadow-lg mb-[-60px]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-black text-white tracking-tight">Teacher Approvals</h1>
            <p className="text-cyan-50 font-medium">Manage pending access requests</p>
          </div>
          <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/30 text-white flex items-center gap-2">
            <Shield size={20} />
            <span className="font-bold text-sm">Admin Access</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4">
        {pendingUsers.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-xl shadow-gray-200/50">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={40} className="text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">No Pending Requests</h3>
            <p className="text-gray-500">All caught up! Check back later.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {pendingUsers.map((user) => (
              <div 
                key={user.id} 
                className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6 transition-all hover:shadow-md"
              >
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="w-14 h-14 bg-cyan-50 rounded-2xl flex items-center justify-center text-cyan-600">
                    <User size={28} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">{user.username}</h3>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <Mail size={14} />
                      <span>{user.email}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button
                    disabled={actionLoading === user.id}
                    onClick={() => onApprove(user.id, false)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 border-2 border-gray-100 text-gray-500 font-bold px-6 py-3 rounded-2xl hover:bg-gray-50 transition-all active:scale-95"
                  >
                    <XCircle size={18} />
                    Reject
                  </button>
                  <button
                    disabled={actionLoading === user.id}
                    onClick={() => onApprove(user.id, true)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-orange-400 text-white font-bold px-8 py-3 rounded-2xl shadow-lg shadow-orange-200 hover:bg-orange-500 transition-all active:scale-95 disabled:bg-gray-300"
                  >
                    {actionLoading === user.id ? (
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