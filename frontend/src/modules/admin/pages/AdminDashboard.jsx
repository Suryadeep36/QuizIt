import { useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Users,
  UserPlus,
  Trash2,
  Mail,
  Calendar,
  Search,
  UserCog,
} from "lucide-react";
import toast from "react-hot-toast";
import useAuth from "../../../stores/store";

const INITIAL_ADMINS = [
  {
    id: 1,
    firstName: "Sarah",
    email: "sarah.admin@quizit.com",
    joinedDate: "2024-01-15",
  },
  {
    id: 2,
    firstName: "Admin_Master",
    email: "root@quizit.com",
    joinedDate: "2023-11-02",
  },
];

const INITIAL_TEACHERS = [
  {
    id: 101,
    firstName: "Prof. Xavier",
    email: "charles@academy.edu",
    joinedDate: "2025-02-10",
  },
  {
    id: 102,
    firstName: "Walter White",
    email: "heisenberg@science.com",
    joinedDate: "2025-03-01",
  },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("admins");
  const [admins, setAdmins] = useState(INITIAL_ADMINS);
  const [teachers, setTeachers] = useState(INITIAL_TEACHERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [sendingInvite, setSendingInvite] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteRole, setDeleteRole] = useState(null);

  const handleInvite = async () => {
    if (!inviteEmail) {
      toast.error("Email is required");
      return;
    }

    try {
      setSendingInvite(true);

      const role = activeTab === "admins" ? "ADMIN" : "TEACHER";

      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: inviteEmail,
          role: role,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to send invite");
      }

      toast.success(`${role.toLowerCase()} invite sent`);

      setInviteEmail("");
      setInviteOpen(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSendingInvite(false);
    }
  };
  const user = useAuth((state) => state.user);

  const containerVars = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.07 } },
  };

  const itemVars = {
    hidden: { y: 10, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  const handleDeleteUser = (id, role) => {
    setDeleteTarget(id);
    setDeleteRole(role);
    setDeleteModalOpen(true);
  };

  const confirmDeleteUser = () => {
    if (!deleteTarget) return;

    if (deleteRole === "admin") {
      setAdmins((prev) => prev.filter((a) => a.id !== deleteTarget));
    } else {
      setTeachers((prev) => prev.filter((t) => t.id !== deleteTarget));
    }

    toast.success(`${deleteRole} removed`);

    setDeleteModalOpen(false);
    setDeleteTarget(null);
    setDeleteRole(null);
  };

  const currentList = activeTab === "admins" ? admins : teachers;

  const filteredList = currentList.filter(
    (u) =>
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.firstName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-cyan-600 to-cyan-700 px-6 py-10 font-sans selection:bg-orange-200">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                <ShieldCheck className="text-white" size={24} />
              </div>

              <h1 className="text-4xl font-extrabold text-white tracking-tight">
                Admin<span className="text-orange-300">Panel</span>
              </h1>
            </div>

            <p className="text-white/80 text-sm">
              System Governance •{" "}
              <span className="font-semibold text-white">
                {user?.username || "SuperAdmin"}
              </span>
            </p>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setInviteOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-white text-teal-700 rounded-xl font-bold shadow hover:bg-white/90 transition"
          >
            <UserPlus size={18} />
            Invite {activeTab === "admins" ? "Admin" : "Teacher"}
          </motion.button>
        </header>

        {/* CONTROLS */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
          {/* TABS */}
          <div className="flex p-1 bg-white/30 backdrop-blur-md rounded-2xl w-full md:w-auto">
            <button
              onClick={() => setActiveTab("admins")}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl font-semibold transition
                ${
                  activeTab === "admins"
                    ? "bg-white text-teal-700 shadow"
                    : "text-white/80 hover:text-white"
                }`}
            >
              <UserCog size={18} /> Admins
            </button>

            <button
              onClick={() => setActiveTab("teachers")}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl font-semibold transition
                ${
                  activeTab === "teachers"
                    ? "bg-white text-teal-700 shadow"
                    : "text-white/80 hover:text-white"
                }`}
            >
              <Users size={18} /> Teachers
            </button>
          </div>

          {/* SEARCH */}
          <div className="relative w-full md:w-72">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60"
              size={18}
            />

            <input
              type="text"
              placeholder="Search name or email"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/30 backdrop-blur-md text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* USER LIST */}
        <motion.div
          key={activeTab}
          variants={containerVars}
          initial="hidden"
          animate="show"
          className="grid md:grid-cols-2 gap-6"
        >
          {filteredList.map((item) => (
            <motion.div
              key={item.id}
              variants={itemVars}
              className="bg-white/95 rounded-2xl shadow-xl p-6 flex justify-between items-center hover:shadow-2xl transition"
            >
              {/* USER INFO */}
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-teal-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                  {item.firstName.charAt(0)}
                </div>

                <div>
                  <p className="font-bold text-slate-800">{item.firstName}</p>

                  <p className="text-sm text-slate-500 flex items-center gap-1">
                    <Mail size={12} /> {item.email}
                  </p>

                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                    <Calendar size={12} />
                    {new Date(item.joinedDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* ACTION */}
              <button
                onClick={() =>
                  handleDeleteUser(
                    item.id,
                    activeTab === "admins" ? "admin" : "teacher",
                  )
                }
                className="p-2 rounded-lg text-slate-500 hover:text-red-500 hover:bg-red-50 transition"
              >
                <Trash2 size={18} />
              </button>
            </motion.div>
          ))}
          {inviteOpen && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-8 w-[400px] shadow-xl">
                <h2 className="text-xl font-bold text-slate-800 mb-4">
                  Invite {activeTab === "admins" ? "Admin" : "Teacher"}
                </h2>

                <input
                  type="email"
                  placeholder="Enter email address"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setInviteOpen(false)}
                    className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleInvite}
                    disabled={sendingInvite}
                    className="px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-500"
                  >
                    {sendingInvite ? "Sending..." : "Send Invite"}
                  </button>
                </div>
              </div>
            </div>
          )}
          {deleteModalOpen && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-2xl shadow-xl p-8 w-[380px]"
              >
                <h2 className="text-xl font-bold text-slate-800 mb-2">
                  Remove {deleteRole === "admin" ? "Admin" : "Teacher"}
                </h2>

                <p className="text-slate-600 mb-6">
                  Are you sure you want to remove this {deleteRole}? This action
                  cannot be undone.
                </p>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setDeleteModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 transition"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={confirmDeleteUser}
                    className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
                  >
                    Remove
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>

        {filteredList.length === 0 && (
          <div className="text-center text-white/80 mt-20 italic">
            No {activeTab} found.
          </div>
        )}
      </div>
    </div>
  );
}
