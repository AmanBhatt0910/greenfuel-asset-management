"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Leaf, Lock } from "lucide-react"; // for icons

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Something went wrong!");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-950">
      {/* Left branding section */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex flex-col justify-center items-center w-1/2 px-10 text-white"
      >
        <Leaf size={60} className="text-green-400 mb-6" />
        <h1 className="text-4xl font-bold mb-4">Greenfuel Asset Management</h1>
        <p className="text-lg text-gray-300 text-center max-w-md">
          Manage and transfer assets seamlessly with a secure and modern platform.
        </p>
      </motion.div>

      {/* Right login form */}
      <div className="flex flex-1 items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md p-8 rounded-2xl shadow-2xl border border-gray-700 bg-gray-900/60 backdrop-blur-lg"
        >
          <div className="flex items-center justify-center mb-6">
            <Lock className="text-green-400 mr-2" size={24} />
            <h2 className="text-2xl font-semibold text-white">Login</h2>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-sm mb-4 text-center"
            >
              {error}
            </motion.p>
          )}

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-gray-300 mb-1 text-sm">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@greenfuel.com"
                className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-1 text-sm">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                required
              />
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </motion.button>
          </form>

          <p
            className="mt-6 text-sm text-gray-400 cursor-pointer hover:text-green-400 text-center"
            onClick={() => router.push("/forgot-password")}
          >
            Forgot Password?
          </p>
        </motion.div>
      </div>
    </div>
  );
}
