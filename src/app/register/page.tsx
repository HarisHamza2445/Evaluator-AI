"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Registration failed. Please try again.");
      return;
    }

    router.push("/login?registered=1");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      {/* background blobs */}
      <div className="fixed top-0 right-0 -z-10 w-[600px] h-[600px] bg-indigo-50/60 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 -z-10 w-[500px] h-[500px] bg-teal-50/40 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md fade-in">
        {/* logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              dataset
            </span>
          </div>
          <span className="text-2xl font-bold text-slate-800 tracking-tight" style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>
            Evaluator AI
          </span>
        </div>

        <div className="air-card rounded-2xl p-8 border border-white/60 bg-white/70 backdrop-blur-xl shadow-xl shadow-slate-200/50">
          <h1 className="text-2xl font-bold text-slate-800 mb-1" style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>
            Create account
          </h1>
          <p className="text-slate-500 text-sm mb-6 font-medium">
            Start evaluating AI agents in seconds
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600 font-semibold animate-pulse">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-655 mb-1.5">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all focus:bg-white text-slate-800 placeholder:text-slate-400 font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-655 mb-1.5">
                Email
              </label>
              <input
                id="register-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all focus:bg-white text-slate-800 placeholder:text-slate-400 font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-655 mb-1.5">
                Password
              </label>
              <input
                id="register-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                required
                minLength={6}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all focus:bg-white text-slate-800 placeholder:text-slate-400 font-medium"
              />
            </div>

            <button
              id="register-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-tr from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-605 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-600/15 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5 font-medium">
            Already have an account?{" "}
            <Link href="/login" className="text-indigo-600 font-bold hover:underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
