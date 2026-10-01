"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ShieldCheck, LogOut, Sun, Moon, Menu, X, ArrowRight } from "lucide-react";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  };

  return (
    <header className="navbar-new sticky top-0 z-50 transition-colors">
      <div className="flex items-center justify-between px-4 sm:px-8 lg:px-12 py-4">
        {/* Brand */}
        <Link href="/" className="brand flex items-center gap-2">
          <span className="dot">R</span>
          <span className="font-bold text-lg sm:text-xl">
            Roadmap<span style={{ color: "var(--periwinkle-deep)" }}>.ai</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-semibold text-[var(--ink-soft)]">
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
              pathname.includes("/roadmap/devops") ? "text-[var(--periwinkle-deep)] font-bold" : ""
            }`}
          >
            DevOps
          </Link>
          <Link
            href="/roadmap/fullstack"
            className={`transition-colors hover:text-[var(--ink)] ${
              pathname.includes("/roadmap/fullstack") ? "text-[var(--periwinkle-deep)] font-bold" : ""
            }`}
          >
            Full Stack
          </Link>
          <Link
            href="/roadmap/ai-ml"
            className={`transition-colors hover:text-[var(--ink)] ${
              pathname.includes("/roadmap/ai-ml") ? "text-[var(--periwinkle-deep)] font-bold" : ""
            }`}
          >
            AI &amp; ML
          </Link>
          <Link
            href="/#pathways"
            className="transition-colors hover:text-[var(--ink)]"
          >
            All Tracks
          </Link>
          {user?.role === "admin" && (
            <Link
              href="/admin"
              className={`transition-colors hover:text-[var(--ink)] flex items-center gap-1 ${
                pathname === "/admin" ? "text-[var(--periwinkle-deep)] font-bold" : ""
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin
            </Link>
          )}
        </nav>

        {/* Nav Right & Mobile Hamburger */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full border border-[var(--line)] text-[var(--ink-soft)] hover:text-[var(--ink)] bg-[var(--surface)] transition hover:scale-105"
            title={theme === "light" ? "Switch to Dark theme" : "Switch to Light theme"}
          >
            {theme === "light" ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4 text-amber-400" />
            )}
          </button>

          {loading ? (
            <div className="h-8 w-20 bg-[var(--line)] animate-pulse rounded-full" />
          ) : user ? (
            <div className="flex items-center gap-2">
              <Link href="/dashboard" className="pill-btn text-xs sm:text-sm px-3.5 py-1.5 sm:px-4 sm:py-2">
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
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link href="/login" className="ghost-pill text-xs sm:text-sm px-3 py-1.5 hidden sm:inline-block">
                Sign In
              </Link>
              <Link href="/register" className="pill-btn text-xs sm:text-sm px-3.5 py-1.5 sm:px-4 sm:py-2">
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl border border-[var(--line)] text-[var(--ink)] bg-[var(--surface)] hover:bg-[var(--bg-alt)] transition"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[var(--line)] bg-[var(--surface)] px-4 py-5 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-3 font-semibold text-sm">
            <Link
              href="/"
              className={`p-2.5 rounded-xl transition ${
                pathname === "/" ? "bg-[var(--bg-alt)] text-[var(--periwinkle-deep)] font-bold" : "text-[var(--ink)]"
              }`}
            >
              Home
            </Link>
            <Link
              href="/roadmap/devops"
              className={`p-2.5 rounded-xl transition ${
                pathname.includes("/roadmap/devops") ? "bg-[var(--bg-alt)] text-[var(--periwinkle-deep)] font-bold" : "text-[var(--ink)]"
              }`}
            >
              DevOps Engineering
            </Link>
            <Link
              href="/roadmap/fullstack"
              className={`p-2.5 rounded-xl transition ${
                pathname.includes("/roadmap/fullstack") ? "bg-[var(--bg-alt)] text-[var(--periwinkle-deep)] font-bold" : "text-[var(--ink)]"
              }`}
            >
              Full Stack Development
            </Link>
            <Link
              href="/roadmap/ai-ml"
              className={`p-2.5 rounded-xl transition ${
                pathname.includes("/roadmap/ai-ml") ? "bg-[var(--bg-alt)] text-[var(--periwinkle-deep)] font-bold" : "text-[var(--ink)]"
              }`}
            >
              AI &amp; Machine Learning
            </Link>
            <Link
              href="/#pathways"
              className="p-2.5 rounded-xl text-[var(--ink)] transition hover:bg-[var(--bg-alt)]"
            >
              All IT Tracks
            </Link>
            {user?.role === "admin" && (
              <Link
                href="/admin"
                className={`p-2.5 rounded-xl transition flex items-center justify-between ${
                  pathname === "/admin" ? "bg-[var(--bg-alt)] text-[var(--periwinkle-deep)] font-bold" : "text-[var(--ink)]"
                }`}
              >
                <span>Admin Studio</span>
                <ShieldCheck className="h-4 w-4" />
              </Link>
            )}

            {!user && (
              <div className="pt-3 border-t border-[var(--line)] flex gap-2">
                <Link
                  href="/login"
                  className="flex-1 py-2 text-center rounded-xl border border-[var(--line)] text-sm font-bold text-[var(--ink)]"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="flex-1 py-2 text-center rounded-xl bg-[var(--periwinkle-deep)] text-sm font-bold text-white"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
