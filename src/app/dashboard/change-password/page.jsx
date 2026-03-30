// src/app/dashboard/change-password/page.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, ShieldCheck, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function ChangePasswordPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew,      setShowNew]     = useState(false);
  const [showConfirm,  setShowConfirm] = useState(false);
  const [loading,      setLoading]     = useState(false);
  const [error,        setError]       = useState("");
  const [success,      setSuccess]     = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.newPassword !== form.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (form.newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (form.newPassword === form.currentPassword) {
      setError("New password must be different from the current one.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to change password.");
        return;
      }

      setSuccess(true);
      // Redirect to dashboard after a short delay
      setTimeout(() => router.replace("/dashboard"), 2000);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="mx-auto mb-6 p-5 rounded-full bg-green-500/15 border border-green-500/30 w-fit">
            <ShieldCheck size={48} className="text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-primary mb-2">Password Changed!</h2>
          <p className="text-secondary">Redirecting you to the dashboard…</p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex min-h-[70vh] items-center justify-center"
    >
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="surface rounded-2xl shadow-xl border border-default p-8">
          {/* Icon + Title */}
          <div className="flex flex-col items-center mb-8">
            <div className="p-3 rounded-xl accent-bg border border-default mb-4">
              <Lock size={28} className="accent" />
            </div>
            <h2 className="text-2xl font-bold text-primary">Set Your Password</h2>
            <p className="text-secondary text-sm mt-2 text-center">
              You&apos;re using a temporary password. Please set a permanent
              password to continue.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Current (temporary) password */}
            <div>
              <label className="block text-sm text-secondary mb-1">
                Current (Temporary) Password
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  name="currentPassword"
                  value={form.currentPassword}
                  onChange={handleChange}
                  required
                  placeholder="Enter temporary password"
                  className="w-full px-4 py-3 pr-12 rounded-xl surface-muted border border-default text-primary focus:ring-2 focus:ring-[color:var(--accent)]/50 focus:outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:accent transition"
                >
                  {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* New password */}
            <div>
              <label className="block text-sm text-secondary mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  name="newPassword"
                  value={form.newPassword}
                  onChange={handleChange}
                  required
                  minLength={8}
                  placeholder="Min. 8 characters"
                  className="w-full px-4 py-3 pr-12 rounded-xl surface-muted border border-default text-primary focus:ring-2 focus:ring-[color:var(--accent)]/50 focus:outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:accent transition"
                >
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm new password */}
            <div>
              <label className="block text-sm text-secondary mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={8}
                  placeholder="Re-enter new password"
                  className="w-full px-4 py-3 pr-12 rounded-xl surface-muted border border-default text-primary focus:ring-2 focus:ring-[color:var(--accent)]/50 focus:outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:accent transition"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl gradient-accent text-white font-semibold hover:opacity-90 transition shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving…
                </span>
              ) : (
                "Set New Password"
              )}
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
