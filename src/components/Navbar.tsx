"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Compass, ShieldCheck, LogOut, LayoutDashboard, Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface UserSession {
  userId: string;
  name: string;
  email: string;
  role: "admin" | "learner";
}

export default function Navbar() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 sm:px-12 py-5 bg-[var(--surface)] border-b border-[var(--line)]">
      {/* Brand */}
      <Link href="/" className="brand">
        <span className="dot">R</span>
        <span>
          Roadmap<span style={{ color: "var(--periwinkle-deep)" }}>.ai</span>
        </span>
      </Link>

      {/* Nav Links */}
      <div className="hidden md:flex items-center gap-7 text-sm font-semibold text-[var(--ink-soft)]">
        <Link
          href="/"
          className={`transition-colors hover:text-[var(--ink)] ${
            pathname === "/" ? "text-[var(--periwinkle-deep)] font-bold" : ""
          }`}
        >
          Home
        </Link>
        <Link
          href="/roadmap/devops"
          className={`transition-colors hover:text-[var(--ink)] ${
            pathname.includes("/roadmap/devops")
              ? "text-[var(--periwinkle-deep)] font-bold"
              : ""
          }`}
        >
          DevOps
        </Link>
        <Link
          href="/roadmap/fullstack"
          className={`transition-colors hover:text-[var(--ink)] ${
            pathname.includes("/roadmap/fullstack")
              ? "text-[var(--periwinkle-deep)] font-bold"
              : ""
          }`}
        >
          Full Stack
        </Link>
        <Link
          href="/roadmap/ai-ml"
          className={`transition-colors hover:text-[var(--ink)] ${
            pathname.includes("/roadmap/ai-ml")
              ? "text-[var(--periwinkle-deep)] font-bold"
              : ""
          }`}
        >
          AI &amp; ML
        </Link>
        <Link
          href="/#pathways"
          className="transition-colors hover:text-[var(--ink)] flex items-center gap-1"
        >
          All IT Tracks
        </Link>
        {user?.role === "admin" && (
          <Link
            href="/admin"
            className={`transition-colors hover:text-[var(--ink)] flex items-center gap-1 ${
              pathname === "/admin"
                ? "text-[var(--periwinkle-deep)] font-bold"
                : ""
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Admin
          </Link>
        )}
      </div>

      {/* Nav Right */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full border border-[var(--line)] text-[var(--ink-soft)] hover:text-[var(--ink)] bg-[var(--bg)] transition hover:scale-105"
          title={theme === "light" ? "Switch to Dark theme" : "Switch to Pastel theme"}
        >
          {theme === "light" ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4 text-amber-400" />
          )}
        </button>

        {loading ? (
          <div className="h-9 w-24 bg-[var(--bg-alt)] animate-pulse rounded-full" />
        ) : user ? (
          <div className="flex items-center gap-2.5">
            <span className="ghost-pill hidden sm:inline-flex">{user.name}</span>
            <Link href="/dashboard" className="pill-btn">
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              title="Log Out"
              className="p-2 rounded-full text-[var(--ink-soft)] hover:text-rose-500 transition"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <Link href="/login" className="ghost-pill">
              Sign In
            </Link>
            <Link href="/register" className="pill-btn">
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
