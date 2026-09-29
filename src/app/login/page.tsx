"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";

function LoginForm() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") === "admin" ? "admin" : "learner";
  const [role, setRole] = useState<"learner" | "admin">(initialRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      if (data.user?.role === "admin" || role === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="flex gap-2 mb-8 bg-[var(--bg)] p-1 rounded-full border border-[var(--line)]">
        <button
          type="button"
          onClick={() => handleRoleTab("learner")}
          className={`flex-1 py-2 text-sm font-semibold rounded-full transition ${
            role === "learner"
              ? "bg-[var(--periwinkle-deep)] text-white"
              : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
          }`}
        >
          Learner
        </button>
        <button
          type="button"
          onClick={() => handleRoleTab("admin")}
          className={`flex-1 py-2 text-sm font-semibold rounded-full transition ${
            role === "admin"
              ? "bg-[var(--periwinkle-deep)] text-white"
              : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
          }`}
        >
          Admin
        </button>
      </div>

      <h2 className="font-display text-3xl font-semibold text-[var(--ink)] mb-2">Sign in to Roadmap.ai</h2>
      <p className="text-[var(--ink-soft)] mb-8">Welcome back — pick up where you left off</p>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-[var(--ink)] mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="auth-input"
            placeholder="name@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[var(--ink)] mb-1">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="auth-input"
              placeholder="••••••••"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-soft)] hover:text-[var(--ink)]"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="auth-submit-btn mt-6"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className="relative flex py-5 items-center">
        <div className="flex-grow border-t border-[var(--line)]"></div>
        <span className="flex-shrink-0 mx-4 text-[var(--ink-soft)] text-sm">or</span>
        <div className="flex-grow border-t border-[var(--line)]"></div>
      </div>

      <div className="text-center text-sm text-[var(--ink-soft)]">
        Don't have an account?{" "}
        <Link href={`/register?role=${role}`} className="text-[var(--periwinkle-deep)] font-semibold hover:underline">
          Register here
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="auth-shell">
      <div className="auth-panel-left hidden md:flex">
        <Link href="/" className="brand-on-dark">
          <span className="dot">R</span>
          <span>Roadmap<span className="ai-suffix">.ai</span></span>
        </Link>
        
        <div>
          <h1 className="text-3xl font-display font-semibold mb-2 text-white">Your engineering journey starts here</h1>
          <p className="text-white/80 text-lg mb-12">Join learners building real engineering skills</p>
          
          <div className="auth-trail-card w-full max-w-sm mb-12">
            <h3 className="font-bold text-lg mb-4">DevOps Engineering</h3>
            <div className="auth-trail-nodes mb-2">
              <div className="auth-node done"><span className="text-xs font-bold text-white">✓</span></div>
              <div className="h-1 flex-1 bg-[var(--line)]"></div>
              <div className="auth-node done"><span className="text-xs font-bold text-white">✓</span></div>
              <div className="h-1 flex-1 bg-[var(--line)]"></div>
              <div className="auth-node done"><span className="text-xs font-bold text-white">✓</span></div>
              <div className="h-1 flex-1 bg-[var(--line)]"></div>
              <div className="auth-node active"></div>
              <div className="h-1 flex-1 bg-[var(--line)]"></div>
              <div className="auth-node upcoming"></div>
              <div className="h-1 flex-1 bg-[var(--line)]"></div>
              <div className="auth-node upcoming"></div>
              <div className="h-1 flex-1 bg-[var(--line)]"></div>
              <div className="auth-node upcoming"></div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-white" />
              <span className="text-white font-medium">Interactive milestone trails</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-white" />
              <span className="text-white font-medium">Concept readers & resources</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-white" />
              <span className="text-white font-medium">Verified completion certificates</span>
            </div>
          </div>
        </div>
        
        <div className="text-white/60 text-sm">
          &copy; 2026 Roadmap.ai
        </div>
      </div>
      
      <div className="auth-panel-right flex-1 md:flex-none md:w-[45%] bg-[var(--surface)]">
        <Suspense fallback={
          <div className="flex items-center justify-center h-full">
            <div className="h-7 w-7 border-2 border-[var(--periwinkle-deep)] border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
