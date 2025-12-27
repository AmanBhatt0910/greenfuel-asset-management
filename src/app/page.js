"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Leaf, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-950 relative overflow-hidden">
      {/* Background dots */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-2 h-2 bg-green-400/30 rounded-full animate-pulse" />
        <div className="absolute top-40 right-20 w-1 h-1 bg-green-300/40 rounded-full animate-pulse delay-1000" />
        <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-green-500/25 rounded-full animate-pulse delay-2000" />
      </div>

      {/* Left branding */}
      <div className="hidden lg:flex flex-col justify-center items-center w-1/2 px-10 text-white">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-green-400/20 rounded-full blur-xl scale-150 animate-pulse" />
          <div className="relative bg-green-400/10 p-4 rounded-2xl border border-green-400/30">
            <Leaf size={60} className="text-green-400" />
          </div>
        </div>

        <h1 className="text-5xl font-bold mb-6 text-center">
          <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            Greenfuel
          </span>
          <span className="block text-2xl text-gray-300 mt-2">
            Asset Management
          </span>
        </h1>

        <p className="text-lg text-gray-300 text-center max-w-md">
          Securely manage and transfer company assets with confidence.
        </p>
      </div>

      {/* Login form */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="relative p-8 rounded-2xl shadow-2xl border border-gray-700/50 bg-gray-900/70 backdrop-blur-xl">

            <div className="flex justify-center mb-8">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-green-400/10 border border-green-400/20">
                  <Lock className="text-green-400" size={24} />
                </div>
                <h2 className="text-3xl font-bold text-white">Login</h2>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center animate-shake">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-gray-300 mb-2 text-sm font-medium">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@greenfuel.com"
                  className="w-full px-4 py-4 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white focus:ring-2 focus:ring-green-500/50"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2 text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                    className="w-full px-4 py-4 pr-12 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white focus:ring-2 focus:ring-green-500/50"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-400"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group w-full py-4 bg-gradient-to-r from-green-600 to-green-700 rounded-xl font-semibold text-white hover:from-green-500 hover:to-green-600 transition-all disabled:opacity-50"
              >
                <span className="flex items-center justify-center space-x-2">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Logging in...</span>
                    </>
                  ) : (
                    <>
                      <span>Login</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </span>
              </button>
            </form>

            {/* ✅ Forgot password REMOVED */}
            <p className="mt-8 text-xs text-gray-500 text-center">
              Authorized personnel only
            </p>
          </div>

          {/* Mobile branding */}
          <div className="lg:hidden mt-8 text-center">
            <Leaf size={22} className="text-green-400 inline-block mr-2" />
            <span className="text-lg font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Greenfuel
            </span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
}
