"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { KeyRound, Mail, User, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";

function RegisterForm() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") === "admin" ? "admin" : "learner";
  const [role, setRole] = useState<"learner" | "admin">(initialRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const qRole = searchParams.get("role");
    if (qRole === "admin") {
      setRole("admin");
    } else if (qRole === "learner") {
      setRole("learner");
    }
  }, [searchParams]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      // Direct admin registration straight to Admin Studio, learner to Dashboard
      if (data.user?.role === "admin" || role === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-[var(--surface)] border border-[var(--line)] rounded-[28px] shadow-sm p-8">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <span className="ghost-pill mb-3 inline-flex text-[11px] font-semibold">
          {role === "admin" ? "Admin Portal" : "Free Membership"}
        </span>
        <h1 className="font-display text-3xl font-semibold text-[var(--ink)] tracking-tight">
          {role === "admin" ? "Admin Studio Access" : "Start your journey"}
        </h1>
        <p className="text-xs text-[var(--ink-soft)] mt-1.5 font-medium">
          {role === "admin"
            ? "Create an administrator account to build & manage roadmap trails"
            : "Create an account to track your progress across all trails"}
        </p>
      </div>

      {/* Role Tabs */}
      <div className="grid grid-cols-2 gap-1 p-1 bg-[var(--bg-alt)] rounded-full border border-[var(--line)] mb-6">
        <button
          type="button"
          onClick={() => setRole("learner")}
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
          onClick={() => setRole("admin")}
          className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-full transition ${
            role === "admin"
              ? "bg-[var(--periwinkle-deep)] text-white shadow-sm"
              : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          Admin Studio
        </button>
      </div>

      {/* Error Notification */}
      {error && (
        <div className="mb-4 p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--ink-soft)]" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder={role === "admin" ? "e.g. Administrator" : "e.g. Alex Rivera"}
              className="w-full bg-[var(--bg-alt)] border border-[var(--line)] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[var(--ink)] placeholder-[var(--ink-soft)]/60 focus:outline-none focus:border-[var(--periwinkle-deep)] transition"
            />
          </div>
        </div>

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
              minLength={6}
              placeholder="Minimum 6 characters"
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
            "Setting up account..."
          ) : (
            <>
              {role === "admin" ? "Create Admin Account & Enter Studio" : "Create Account & Start Trail"}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-[var(--ink-soft)] font-medium">
        Already have an account?{" "}
        <Link
          href={`/login?role=${role}`}
          className="text-[var(--periwinkle-deep)] font-semibold hover:underline"
        >
          Log in here
        </Link>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col transition-colors duration-200">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <Suspense
          fallback={
            <div className="w-full max-w-md bg-[var(--surface)] border border-[var(--line)] rounded-[28px] p-8 flex items-center justify-center">
              <div className="h-7 w-7 border-2 border-[var(--periwinkle-deep)] border-t-transparent rounded-full animate-spin" />
            </div>
          }
        >
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
