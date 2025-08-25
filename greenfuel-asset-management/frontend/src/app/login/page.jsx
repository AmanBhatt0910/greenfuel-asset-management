import React from "react";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-900 via-gray-900 to-black">
      <div className="w-full max-w-md rounded-2xl bg-white/10 backdrop-blur-lg p-8 shadow-2xl border border-gray-700">
        <h2 className="text-3xl font-bold text-white text-center mb-6">
          Greenfuel Asset Management
        </h2>
        <form className="space-y-5">
          <div>
            <label className="text-white text-sm mb-2 block">Email</label>
            <input
              type="email"
              className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="admin@greenfuel.com"
            />
          </div>
          <div>
            <label className="text-white text-sm mb-2 block">Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 rounded-lg text-white font-semibold shadow-md transition-all"
          >
            Login
          </button>
        </form>
        <p className="text-center text-gray-400 mt-6 text-sm">
          © 2025 Greenfuel Asset Management
        </p>
      </div>
    </div>
  );
}
