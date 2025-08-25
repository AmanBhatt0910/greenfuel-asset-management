// app/forgot-password/page.jsx
export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-900 via-gray-900 to-black">
      <div className="w-full max-w-md rounded-2xl bg-white/10 backdrop-blur-lg p-8 shadow-2xl border border-gray-700">
        
        {/* Title */}
        <h2 className="text-3xl font-bold text-white text-center mb-2">
          Forgot Password
        </h2>
        <p className="text-gray-400 text-center mb-6 text-sm">
          Enter your registered email address and we’ll send you reset instructions.
        </p>

        {/* Form */}
        <form className="space-y-5">
          <div>
            <label className="text-white text-sm mb-2 block">Email</label>
            <input
              type="email"
              className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="you@greenfuel.com"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 rounded-lg text-white font-semibold shadow-md transition-all"
          >
            Send Reset Link
          </button>
        </form>

        {/* Links */}
        <div className="flex justify-center mt-6">
          <a href="/login" className="text-green-400 hover:text-green-300 text-sm">
            ← Back to Login
          </a>
        </div>
      </div>
    </div>
  );
}
