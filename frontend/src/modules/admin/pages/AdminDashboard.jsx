import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Users,
  UserPlus,
  UserX,
  Mail,
  Calendar,
  Search,
  UserCog,
  RefreshCw,
  X,
  Inbox
} from "lucide-react";
import toast from "react-hot-toast";
import { CircularProgress } from "@mui/material";
import useAuth from "../../../stores/store";
import { 
  getApprovedTeachers, 
  getApprovedAdmins, 
  revokeTeacher, 
  revokeAdmin
} from "../../../services/AuthService";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("admins");
  const [admins, setAdmins] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal/Action States
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [sendingInvite, setSendingInvite] = useState(false);
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [revokeTargetEmail, setRevokeTargetEmail] = useState(null);
  const [targetRole, setTargetRole] = useState(null);

  const user = useAuth((state) => state.user);

  // 1. Fetch Data from Spring Boot
  const loadData = async () => {
    try {
      setLoading(true);
      const [adminData, teacherData] = await Promise.all([
        getApprovedAdmins(),
        getApprovedTeachers()
      ]);
      setAdmins(adminData);
      setTeachers(teacherData);
    } catch (err) {
      toast.error("Failed to sync users with server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 2. Handle Invitation (Logic placeholder)
  const handleInvite = async () => {
    if (!inviteEmail) {
      toast.error("Email is required");
      return;
    }
    try {
      setSendingInvite(true);
      const role = activeTab === "admins" ? "ADMIN" : "TEACHER";
      // Logic for invitation endpoint would go here
      toast.success(`${role.toLowerCase()} invite sent to ${inviteEmail}`);
      setInviteEmail("");
      setInviteOpen(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSendingInvite(false);
    }
  };

  // 3. Revoke Logic
  const handleRevokeClick = (email, role) => {
    setRevokeTargetEmail(email);
    setTargetRole(role);
    setRevokeModalOpen(true);
  };

  const confirmRevokeUser = async () => {
    if (!revokeTargetEmail) return;
    
    try {
      if (targetRole === "admin") {
        await revokeAdmin(revokeTargetEmail);
        setAdmins((prev) => prev.filter((a) => a.email !== revokeTargetEmail));
      } else {
        await revokeTeacher(revokeTargetEmail);
        setTeachers((prev) => prev.filter((t) => t.email !== revokeTargetEmail));
      }

      toast.success(`${targetRole} access revoked`);
    } catch (err) {
      toast.error("Revoke failed: " + (err.response?.data?.message || "Server Error"));
    } finally {
      setRevokeModalOpen(false);
      setRevokeTargetEmail(null);
    }
  };

  // 4. Filter Logic
  const currentList = activeTab === "admins" ? admins : teachers;
  const filteredList = currentList.filter(
    (u) =>
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Animation Variants
  const containerVars = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const itemVars = {
    hidden: { y: 15, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-cyan-700">
        <CircularProgress size={50} thickness={4} style={{ color: "white" }} />
        <p className="mt-4 text-white font-bold animate-pulse tracking-widest">LOADING DATABASE...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-600 to-cyan-700 px-6 py-10 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md border border-white/30">
                <ShieldCheck className="text-white" size={28} />
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight">
                Admin<span className="text-orange-300">Panel</span>
              </h1>
            </div>
            <p className="text-white/80 text-sm flex items-center gap-2">
              System Control • <span className="font-bold text-white uppercase">{user?.username || "Admin"}</span>
              <button onClick={loadData} className="ml-2 hover:rotate-180 transition-transform duration-500">
                <RefreshCw size={14} />
              </button>
            </p>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setInviteOpen(true)}
            className="flex items-center gap-2 px-8 py-3 bg-white text-cyan-700 rounded-2xl font-black shadow-2xl hover:bg-cyan-50 transition-all"
          >
            <UserPlus size={20} />
            Invite {activeTab === "admins" ? "Admin" : "Teacher"}
          </motion.button>
        </header>

        {/* CONTROLS */}
        <div className="flex flex-col md:flex-row gap-6 justify-between items-center mb-10">
          <div className="flex p-1.5 bg-white/10 backdrop-blur-xl rounded-[22px] border border-white/20 w-full md:w-auto">
            <button
              onClick={() => setActiveTab("admins")}
              className={`flex items-center gap-2 px-8 py-2.5 rounded-2xl font-bold transition-all ${
                activeTab === "admins" ? "bg-white text-cyan-700 shadow-xl" : "text-white/70 hover:text-white"
              }`}
            >
              <UserCog size={18} /> Admins
            </button>
            <button
              onClick={() => setActiveTab("teachers")}
              className={`flex items-center gap-2 px-8 py-2.5 rounded-2xl font-bold transition-all ${
                activeTab === "teachers" ? "bg-white text-cyan-700 shadow-xl" : "text-white/70 hover:text-white"
              }`}
            >
              <Users size={18} /> Teachers
            </button>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              className="w-full pl-12 pr-4 py-3.5 rounded-[22px] bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* LIST AREA */}
        <motion.div
          key={activeTab}
          variants={containerVars}
          initial="hidden"
          animate="show"
          className="grid md:grid-cols-2 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredList.map((item) => (
              <motion.div
                key={item.email}
                layout
                variants={itemVars}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white/95 backdrop-blur-md rounded-[28px] shadow-lg p-6 flex justify-between items-center border border-white hover:shadow-2xl transition-all group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-teal-400 flex items-center justify-center text-white text-xl font-black shadow-inner">
                    {item.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-slate-800 text-lg truncate">{item.username}</p>
                    <p className="text-sm text-slate-500 flex items-center gap-1.5 truncate">
                      <Mail size={14} className="opacity-60" /> {item.email}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1.5 flex items-center gap-1">
                      <Calendar size={12} /> Joined {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleRevokeClick(item.email, activeTab === "admins" ? "admin" : "teacher")}
                  className="p-3 rounded-2xl text-slate-300 hover:text-orange-500 hover:bg-orange-50 transition-all active:scale-90"
                  title="Revoke Access"
                >
                  <UserX size={22} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredList.length === 0 && (
          <div className="text-center py-20 flex flex-col items-center">
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-4 border border-white/10">
               <Inbox size={40} className="text-white/20" />
            </div>
            <p className="text-white/40 font-bold italic">No {activeTab} match your search query</p>
          </div>
        )}
      </div>

      {/* REVOKE ACCESS MODAL */}
      <AnimatePresence>
        {revokeModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[32px] shadow-2xl p-8 w-full max-w-[400px] text-center"
            >
              <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <UserX size={32} />
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-3">Revoke Access</h2>
              <p className="text-slate-500 leading-relaxed mb-8">
                Are you sure you want to revoke <strong>{targetRole}</strong> privileges for this user? 
                Their dashboard access will be disabled and they will be moved to rejected status.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setRevokeModalOpen(false)}
                  className="flex-1 py-4 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRevokeUser}
                  className="flex-1 py-4 rounded-2xl bg-orange-500 text-white font-black shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all"
                >
                  Revoke
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* INVITE MODAL */}
      <AnimatePresence>
        {inviteOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[32px] p-8 w-full max-w-[420px]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Send Invite</h2>
                <button onClick={() => setInviteOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={24} className="text-slate-400" />
                </button>
              </div>
              <p className="text-slate-500 text-sm mb-6 font-medium">Invitation will grant <strong>{activeTab === 'admins' ? 'Admin' : 'Teacher'}</strong> privileges.</p>
              <input
                type="email"
                placeholder="email@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full px-5 py-4 border-2 border-slate-100 rounded-2xl mb-8 focus:outline-none focus:border-cyan-500 transition-colors"
              />
              <button
                onClick={handleInvite}
                disabled={sendingInvite}
                className="w-full py-4 bg-cyan-600 text-white font-black rounded-2xl shadow-xl shadow-cyan-100 hover:bg-cyan-700 transition-all active:scale-95 disabled:bg-slate-300"
              >
                {sendingInvite ? "SENDING..." : "SEND INVITATION"}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}