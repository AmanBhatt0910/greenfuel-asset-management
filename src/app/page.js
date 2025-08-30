// src/app/page.js

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
    setError("");
    setLoading(true);

    try {
      // Original API call logic preserved
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

      // Original localStorage and navigation logic preserved
      localStorage.setItem("token", data.token);
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Something went wrong!");
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-950 relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-2 h-2 bg-green-400/30 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-green-300/40 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-green-500/25 rounded-full animate-pulse delay-2000"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-green-400/35 rounded-full animate-pulse delay-500"></div>
      </div>

      {/* Left branding section - Enhanced with preserved motion */}
      <div
        className="hidden lg:flex flex-col justify-center items-center w-1/2 px-10 text-white"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateX(0)' : 'translateX(-40px)',
          transition: 'all 0.6s ease-out'
        }}
      >
        <div className="relative mb-8">
          {/* Enhanced glow effect */}
          <div className="absolute inset-0 bg-green-400/20 rounded-full blur-xl scale-150 animate-pulse"></div>
          <div className="relative bg-gradient-to-br from-green-400/20 to-green-600/20 p-4 rounded-2xl backdrop-blur-sm border border-green-400/30">
            <Leaf size={60} className="text-green-400 drop-shadow-lg" />
          </div>
        </div>
        
        <h1 className="text-5xl font-bold mb-6 text-center">
          <span className="bg-gradient-to-r from-green-400 via-green-300 to-emerald-400 bg-clip-text text-transparent">
            Greenfuel
          </span>
          <span className="block text-2xl font-medium text-gray-300 mt-2">Asset Management</span>
        </h1>
        
        <p className="text-lg text-gray-300 text-center max-w-md leading-relaxed">
          Manage and transfer assets seamlessly with a secure and modern platform.
        </p>
        
        {/* Feature indicators */}
        <div className="mt-8 space-y-3">
          {["Secure Authentication", "Real-time Processing", "Advanced Analytics"].map((feature, index) => (
            <div 
              key={feature}
              className="flex items-center space-x-3 text-gray-400 text-sm"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                transition: `all 0.6s ease-out ${(index + 2) * 0.1}s`
              }}
            >
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right login form - Enhanced with preserved motion */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div
          className="w-full max-w-md"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(40px)',
            transition: 'all 0.5s ease-out'
          }}
        >
          {/* Enhanced glassmorphism card */}
          <div className="relative group">
            {/* Subtle glow effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
            
            <div className="relative p-8 rounded-2xl shadow-2xl border border-gray-700/50 bg-gray-900/70 backdrop-blur-xl">
              {/* Enhanced header */}
              <div className="flex items-center justify-center mb-8">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-green-400/10 border border-green-400/20">
                    <Lock className="text-green-400" size={24} />
                  </div>
                  <h2 className="text-3xl font-bold text-white">Login</h2>
                </div>
              </div>

              {/* Enhanced error message with preserved motion logic */}
              {error && (
                <div 
                  className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center backdrop-blur-sm"
                  style={{
                    opacity: 1,
                    animation: 'shake 0.5s ease-in-out'
                  }}
                >
                  {error}
                </div>
              )}

              {/* Original form with enhanced styling */}
              <div className="space-y-6">
                {/* Enhanced Email Input */}
                <div>
                  <label className="block text-gray-300 mb-2 text-sm font-medium">Email</label>
                  <div className="relative group">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@greenfuel.com"
                      className="w-full px-4 py-4 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-300 backdrop-blur-sm group-hover:border-gray-600/50"
                      required
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-500/0 to-green-500/0 group-focus-within:from-green-500/5 group-focus-within:to-green-500/5 transition-all duration-300 pointer-events-none"></div>
                  </div>
                </div>

                {/* Enhanced Password Input with toggle */}
                <div>
                  <label className="block text-gray-300 mb-2 text-sm font-medium">Password</label>
                  <div className="relative group">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="********"
                      className="w-full px-4 py-4 pr-12 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-300 backdrop-blur-sm group-hover:border-gray-600/50"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-400 transition-colors duration-200"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-500/0 to-green-500/0 group-focus-within:from-green-500/5 group-focus-within:to-green-500/5 transition-all duration-300 pointer-events-none"></div>
                  </div>
                </div>

                {/* Enhanced button with preserved motion and functionality */}
                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="group relative w-full py-4 mt-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 rounded-xl font-semibold text-white shadow-lg hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  style={{
                    transform: loading ? 'scale(0.98)' : 'scale(1)'
                  }}
                >
                  <span className="flex items-center justify-center space-x-2">
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Logging in...</span>
                      </>
                    ) : (
                      <>
                        <span>Login</span>
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-200" />
                      </>
                    )}
                  </span>
                  
                  {/* Button shine effect */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </button>
              </div>

              {/* Enhanced footer with preserved functionality */}
              <p
                className="mt-8 text-sm text-gray-400 cursor-pointer hover:text-green-400 text-center transition-all duration-300 hover:underline underline-offset-2"
                onClick={() => router.push("/forgot-password")}
              >
                Forgot Password?
              </p>
            </div>
          </div>

          {/* Mobile branding */}
          <div className="lg:hidden mt-8 text-center">
            <div className="inline-flex items-center space-x-3">
              <Leaf size={24} className="text-green-400" />
              <span className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Greenfuel
              </span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
}