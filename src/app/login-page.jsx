// src/app/LoginPage.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Leaf, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("admin@greenfuelenergy.in");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        setLoading(false);
        return;
      }

      // Give the browser time to process the Set-Cookie header
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Force a full page reload to ensure cookie is sent with request
      window.location.href = "/dashboard";
    } catch (err) {
      console.error(err);
      setError("Something went wrong!");
      setLoading(false);
    }
  };

  return (
    <div
      className={`
        flex min-h-screen relative overflow-hidden
        bg-gradient-to-br
        from-[color:var(--background)]
        via-[color:var(--surface)]
        to-[color:var(--accent-soft)]
      `}
    >
      {/* Background dots */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-2 h-2 rounded-full animate-pulse bg-[color:var(--accent)]/30" />
        <div className="absolute top-40 right-20 w-1 h-1 rounded-full animate-pulse delay-1000 bg-[color:var(--accent)]/40" />
        <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 rounded-full animate-pulse delay-2000 bg-[color:var(--accent)]/25" />
      </div>

      {/* Left branding */}
      <div className="hidden lg:flex flex-col justify-center items-center w-1/2 px-10">
        <div className="relative mb-8">
          <div className="absolute inset-0 accent-bg rounded-full blur-xl scale-150 animate-pulse" />
          <div className="relative accent-bg p-4 rounded-2xl border border-[color:var(--accent)]/30">
            <Leaf size={60} className="accent" />
          </div>
        </div>

        <h1 className="text-5xl font-bold mb-6 text-center">
          <span className="gradient-accent bg-clip-text text-transparent">
            Greenfuel
          </span>
          <span className="block text-2xl text-secondary mt-2">
            Asset Management
          </span>
        </h1>

        <p className="text-lg text-secondary text-center max-w-md">
          Securely manage and transfer company assets with confidence.
        </p>
      </div>

      {/* Login form */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="relative p-8 rounded-2xl shadow-2xl surface backdrop-blur-xl border border-[color:var(--border)]/50">
            <div className="flex justify-center mb-8">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg accent-bg border border-[color:var(--accent)]/20">
                  <Lock className="accent" size={24} />
                </div>
                <h2 className="text-3xl font-bold text-primary">Login</h2>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-[color:var(--danger)]/10 border border-[color:var(--danger)]/20 text-danger text-sm text-center animate-shake">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-secondary mb-2 text-sm font-medium">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@greenfuelenergy.in"
                  className="w-full px-4 py-4 rounded-xl surface-muted border border-[color:var(--border)]/50 text-primary focus:ring-2 focus:ring-[color:var(--accent)]/50 focus:outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-secondary mb-2 text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                    className="w-full px-4 py-4 pr-12 rounded-xl surface-muted border border-[color:var(--border)]/50 text-primary focus:ring-2 focus:ring-[color:var(--accent)]/50 focus:outline-none transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:accent transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`
                  group w-full py-4 rounded-xl font-semibold
                  transition-all disabled:opacity-50
                  gradient-accent
                  text-white
                  hover:opacity-90
                  shadow-lg hover:shadow-xl
                `}
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
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </button>
            </form>

            <p className="mt-8 text-xs text-secondary text-center">
              Authorized personnel only
            </p>
          </div>

          {/* Mobile branding */}
          <div className="lg:hidden mt-8 text-center">
            <Leaf size={22} className="accent inline-block mr-2" />
            <span className="text-lg font-bold gradient-accent bg-clip-text text-transparent">
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
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
}