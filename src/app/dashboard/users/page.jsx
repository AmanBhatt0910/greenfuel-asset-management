// src/app/dashboard/users/page.jsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  UserPlus,
  Pencil,
  Trash2,
  RefreshCw,
  X,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";

/* ===========================
   Helpers
=========================== */
const ROLES = ["admin", "manager", "employee"];

const ROLE_BADGE = {
  admin:    "bg-purple-500/15 text-purple-400 border-purple-500/30",
  manager:  "bg-blue-500/15 text-blue-400 border-blue-500/30",
  employee: "bg-green-500/15 text-green-400 border-green-500/30",
};

const STATUS_BADGE = {
  active:   "bg-green-500/15 text-green-400 border-green-500/30",
  inactive: "bg-red-500/15 text-red-400 border-red-500/30",
};

function Badge({ label, className }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${className}`}
    >
      {label}
    </span>
  );
}

/* ===========================
   Create / Edit Modal
=========================== */
function UserModal({ mode, user, onClose, onSaved }) {
  const isEdit = mode === "edit";

  const [form, setForm] = useState(
    isEdit
      ? {
          userId:     user.id,
          first_name: user.first_name || "",
          last_name:  user.last_name  || "",
          department: user.department || "",
          role_name:  user.role       || "employee",
          status:     user.status     || "active",
        }
      : {
          email:      "",
          first_name: "",
          last_name:  "",
          department: "",
          role_name:  "employee",
        }
  );

  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [tempPass,  setTempPass]  = useState("");
  const [showPass,  setShowPass]  = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let res, data;
      if (isEdit) {
        res = await fetch("/api/users/update", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(form),
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.message || "Update failed");
        onSaved();
        onClose();
      } else {
        res = await fetch("/api/users/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(form),
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.message || "Creation failed");
        setTempPass(data.tempPassword || "");
        onSaved();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // After creation, show the temp password screen
  if (tempPass) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md surface rounded-2xl p-8 shadow-2xl border border-default"
        >
          <div className="flex flex-col items-center text-center gap-4">
            <div className="p-4 rounded-full bg-green-500/15 border border-green-500/30">
              <CheckCircle size={36} className="text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-primary">User Created!</h3>
            <p className="text-secondary text-sm">
              The account has been created and an invitation email has been sent.
              If email delivery fails, share the temporary password below manually.
            </p>

            <div className="w-full bg-[color:var(--surface-muted)] rounded-xl p-4 border border-default">
              <p className="text-xs text-secondary mb-1">Temporary Password</p>
              <div className="flex items-center gap-2">
                <span className="font-mono text-primary text-lg flex-1 break-all">
                  {showPass ? tempPass : "•".repeat(tempPass.length)}
                </span>
                <button
                  onClick={() => setShowPass((v) => !v)}
                  className="text-secondary hover:accent transition"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <p className="text-xs text-secondary">
              The user will be prompted to change this password on first login.
            </p>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl gradient-accent text-white font-semibold hover:opacity-90 transition"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg surface rounded-2xl shadow-2xl border border-default overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-default">
          <h3 className="text-lg font-semibold text-primary">
            {isEdit ? "Edit User" : "Create New User"}
          </h3>
          <button onClick={onClose} className="text-secondary hover:accent transition">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          {!isEdit && (
            <div>
              <label className="block text-sm text-secondary mb-1">Email *</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl surface-muted border border-default text-primary focus:ring-2 focus:ring-[color:var(--accent)]/50 focus:outline-none"
                placeholder="user@greenfuelenergy.in"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-secondary mb-1">First Name</label>
              <input
                type="text"
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl surface-muted border border-default text-primary focus:ring-2 focus:ring-[color:var(--accent)]/50 focus:outline-none"
                placeholder="Aman"
              />
            </div>
            <div>
              <label className="block text-sm text-secondary mb-1">Last Name</label>
              <input
                type="text"
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl surface-muted border border-default text-primary focus:ring-2 focus:ring-[color:var(--accent)]/50 focus:outline-none"
                placeholder="Bhatt"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-secondary mb-1">Department</label>
            <input
              type="text"
              name="department"
              value={form.department}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl surface-muted border border-default text-primary focus:ring-2 focus:ring-[color:var(--accent)]/50 focus:outline-none"
              placeholder="IT / Operations / Finance …"
            />
          </div>

          <div>
            <label className="block text-sm text-secondary mb-1">Role *</label>
            <select
              name="role_name"
              value={form.role_name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl surface-muted border border-default text-primary focus:ring-2 focus:ring-[color:var(--accent)]/50 focus:outline-none"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {isEdit && (
            <div>
              <label className="block text-sm text-secondary mb-1">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl surface-muted border border-default text-primary focus:ring-2 focus:ring-[color:var(--accent)]/50 focus:outline-none"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-default text-secondary hover:surface-muted transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl gradient-accent text-white font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Saving…" : isEdit ? "Save Changes" : "Create User"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

/* ===========================
   Reset Password Modal
=========================== */
function ResetPasswordModal({ user, onClose }) {
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [tempPass, setTempPass] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleReset = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Reset failed");
      setTempPass(data.tempPassword || "");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md surface rounded-2xl p-8 shadow-2xl border border-default"
      >
        {tempPass ? (
          <div className="flex flex-col items-center text-center gap-4">
            <div className="p-4 rounded-full bg-blue-500/15 border border-blue-500/30">
              <CheckCircle size={36} className="text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-primary">Password Reset!</h3>
            <p className="text-secondary text-sm">
              A password reset email has been sent to <strong>{user.email}</strong>.
              Share the temporary password below if the email doesn&apos;t arrive.
            </p>
            <div className="w-full bg-[color:var(--surface-muted)] rounded-xl p-4 border border-default">
              <p className="text-xs text-secondary mb-1">New Temporary Password</p>
              <div className="flex items-center gap-2">
                <span className="font-mono text-primary text-lg flex-1 break-all">
                  {showPass ? tempPass : "•".repeat(tempPass.length)}
                </span>
                <button
                  onClick={() => setShowPass((v) => !v)}
                  className="text-secondary hover:accent transition"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl gradient-accent text-white font-semibold hover:opacity-90 transition"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center gap-4">
            <div className="p-4 rounded-full bg-yellow-500/15 border border-yellow-500/30">
              <RefreshCw size={36} className="text-yellow-400" />
            </div>
            <h3 className="text-xl font-bold text-primary">Reset Password</h3>
            <p className="text-secondary text-sm">
              This will generate a new temporary password for{" "}
              <strong>{user.email}</strong> and send it by email.
              The user will be required to change it on next login.
            </p>
            {error && (
              <div className="w-full flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <AlertCircle size={16} />
                {error}
              </div>
            )}
            <div className="flex gap-3 w-full pt-2">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-default text-secondary hover:surface-muted transition"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-yellow-500 text-white font-semibold hover:bg-yellow-600 transition disabled:opacity-50"
              >
                {loading ? "Resetting…" : "Reset Password"}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

/* ===========================
   Main Page
=========================== */
export default function UsersPage() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [modal,   setModal]   = useState(null); // { type: 'create'|'edit'|'reset', user? }

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/users/list", { credentials: "include" });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message || "Failed to load users");
      }
      setUsers(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleDeactivate = async (user) => {
    if (!confirm(`Deactivate ${user.email}?`)) return;
    try {
      const res = await fetch("/api/users/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId: user.id }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message);
      }
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold gradient-accent bg-clip-text text-transparent">
            User Management
          </h2>
          <p className="text-secondary mt-1">
            Create, edit and manage user accounts and their roles
          </p>
        </div>
        <button
          onClick={() => setModal({ type: "create" })}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-accent text-white font-semibold hover:opacity-90 transition shadow-lg"
        >
          <UserPlus size={18} />
          Add User
        </button>
      </div>

      {/* Table */}
      <div className="surface rounded-2xl border border-default overflow-hidden shadow">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-[color:var(--accent)]/30 border-t-[color:var(--accent)] rounded-full animate-spin mx-auto mb-3" />
              <p className="text-secondary">Loading users…</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 p-6 text-red-400">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-secondary">
            <Users size={48} className="opacity-20 mb-4" />
            <p>No users found. Create the first one!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="surface-muted border-b border-default">
                <tr>
                  {["Name", "Email", "Role", "Department", "Status", "Actions"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-6 py-4 text-left text-xs font-semibold text-secondary uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--border)]">
                {users.map((user) => (
                  <tr key={user.id} className="hover:surface-muted transition-colors">
                    <td className="px-6 py-4 text-primary font-medium">
                      {user.first_name || user.last_name
                        ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
                        : "—"}
                      {user.must_change_password ? (
                        <span className="ml-2 text-xs text-yellow-400">(temp password)</span>
                      ) : null}
                    </td>
                    <td className="px-6 py-4 text-secondary">{user.email}</td>
                    <td className="px-6 py-4">
                      <Badge
                        label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        className={ROLE_BADGE[user.role] || ""}
                      />
                    </td>
                    <td className="px-6 py-4 text-secondary">{user.department || "—"}</td>
                    <td className="px-6 py-4">
                      <Badge
                        label={user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        className={STATUS_BADGE[user.status] || ""}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setModal({ type: "edit", user })}
                          title="Edit"
                          className="p-1.5 rounded-lg text-secondary hover:accent transition"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => setModal({ type: "reset", user })}
                          title="Reset password"
                          className="p-1.5 rounded-lg text-secondary hover:text-blue-400 transition"
                        >
                          <RefreshCw size={16} />
                        </button>
                        {user.status === "active" && (
                          <button
                            onClick={() => handleDeactivate(user)}
                            title="Deactivate"
                            className="p-1.5 rounded-lg text-secondary hover:text-red-400 transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {modal?.type === "create" && (
          <UserModal
            mode="create"
            onClose={() => setModal(null)}
            onSaved={fetchUsers}
          />
        )}
        {modal?.type === "edit" && (
          <UserModal
            mode="edit"
            user={modal.user}
            onClose={() => setModal(null)}
            onSaved={fetchUsers}
          />
        )}
        {modal?.type === "reset" && (
          <ResetPasswordModal
            user={modal.user}
            onClose={() => setModal(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
