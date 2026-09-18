"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Compass, KeyRound, Mail, AlertCircle, ArrowRight, ShieldCheck, User } from "lucide-react";

export default function LoginPage() {
  const [role, setRole] = useState<"learner" | "admin">("learner");
  const [email, setEmail] = useState(role === "learner" ? "learner@roadmap.ai" : "admin@roadmap.ai");
  const [password, setPassword] = useState(role === "learner" ? "LearnerPassword123!" : "AdminPassword123!");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRoleTab = (newRole: "learner" | "admin") => {
    setRole(newRole);
    if (newRole === "admin") {
      setEmail("admin@roadmap.ai");
      setPassword("AdminPassword123!");
    } else {
      setEmail("learner@roadmap.ai");
      setPassword("LearnerPassword123!");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      if (data.user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex h-12 w-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 items-center justify-center text-white mb-3 shadow-lg shadow-indigo-500/20">
              <Compass className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Welcome back
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Log in to your Roadmap AI account
            </p>
          </div>

          {/* Role Tabs */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-zinc-950 rounded-xl border border-zinc-800 mb-6">
            <button
              type="button"
              onClick={() => handleRoleTab("learner")}
              className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition ${
                role === "learner"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <User className="h-3.5 w-3.5" />
              Learner Login
            </button>
            <button
              type="button"
              onClick={() => handleRoleTab("admin")}
              className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition ${
                role === "admin"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin Portal
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-950/40 border border-red-800/80 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@domain.com"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Password
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition disabled:opacity-50"
            >
              {loading ? (
                "Logging in..."
              ) : (
                <>
                  Sign In as {role === "admin" ? "Admin" : "Learner"}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Tip */}
          <div className="mt-6 p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80 text-[11px] text-zinc-400 space-y-1">
            <span className="font-semibold text-zinc-300">💡 Pre-seeded Test Credentials:</span>
            <div>• <strong className="text-zinc-300">Learner</strong>: learner@roadmap.ai / LearnerPassword123!</div>
            <div>• <strong className="text-zinc-300">Admin</strong>: admin@roadmap.ai / AdminPassword123!</div>
          </div>

          <div className="mt-6 text-center text-xs text-zinc-400">
            Don&apos;t have an account yet?{" "}
            <Link href="/register" className="text-indigo-400 hover:underline font-semibold">
              Create Learner Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
