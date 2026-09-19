"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { KeyRound, Mail, AlertCircle, ArrowRight, ShieldCheck, User } from "lucide-react";

export default function LoginPage() {
  const [role, setRole] = useState<"learner" | "admin">("learner");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRoleTab = (newRole: "learner" | "admin") => {
    setRole(newRole);
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
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col transition-colors duration-200">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-[var(--surface)] border border-[var(--line)] rounded-[28px] shadow-sm p-8">
          {/* Brand Header */}
          <div className="text-center mb-6">
            <span className="ghost-pill mb-3 inline-flex text-[11px] font-semibold">
              Member Portal
            </span>
            <h1 className="font-display text-3xl font-semibold text-[var(--ink)] tracking-tight">
              Welcome back
            </h1>
            <p className="text-xs text-[var(--ink-soft)] mt-1.5 font-medium">
              Log in to continue your learning journey
            </p>
          </div>

          {/* Role Tabs */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-[var(--bg-alt)] rounded-full border border-[var(--line)] mb-6">
            <button
              type="button"
              onClick={() => handleRoleTab("learner")}
              className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-full transition ${
                role === "learner"
                  ? "bg-[var(--periwinkle-deep)] text-white shadow-sm"
                  : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
              }`}
            >
              <User className="h-3.5 w-3.5" />
              Learner
            </button>
            <button
              type="button"
              onClick={() => handleRoleTab("admin")}
              className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-full transition ${
                role === "admin"
                  ? "bg-[var(--periwinkle-deep)] text-white shadow-sm"
                  : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--ink-soft)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  className="w-full bg-[var(--bg-alt)] border border-[var(--line)] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[var(--ink)] placeholder-[var(--ink-soft)]/60 focus:outline-none focus:border-[var(--periwinkle-deep)] transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                Password
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--ink-soft)]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-[var(--bg-alt)] border border-[var(--line)] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[var(--ink)] placeholder-[var(--ink-soft)]/60 focus:outline-none focus:border-[var(--periwinkle-deep)] transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="pill-btn w-full justify-center py-2.5 text-sm font-semibold flex items-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? (
                "Logging In..."
              ) : (
                <>
                  Enter as {role === "admin" ? "Admin" : "Learner"}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-[var(--ink-soft)] font-medium">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-[var(--periwinkle-deep)] font-semibold hover:underline">
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
