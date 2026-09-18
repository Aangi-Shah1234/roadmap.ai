"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Compass, ShieldCheck, User, LogOut, LayoutDashboard, ChevronRight } from "lucide-react";

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
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Compass className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg text-white tracking-tight flex items-center gap-1.5">
              Roadmap<span className="text-indigo-400">AI</span>
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link
            href="/"
            className={`transition-colors hover:text-white ${
              pathname === "/" ? "text-white" : "text-zinc-400"
            }`}
          >
            Explore Roadmaps
          </Link>
          <Link
            href="/roadmap/devops"
            className={`transition-colors hover:text-white ${
              pathname.includes("/roadmap/devops") ? "text-white" : "text-zinc-400"
            }`}
          >
            DevOps Track
          </Link>
          <Link
            href="/roadmap/cloud"
            className={`transition-colors hover:text-white ${
              pathname.includes("/roadmap/cloud") ? "text-white" : "text-zinc-400"
            }`}
          >
            Cloud Track
          </Link>
          {user?.role === "admin" && (
            <Link
              href="/admin"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                pathname === "/admin"
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                  : "bg-zinc-800 text-zinc-300 hover:text-white"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
              Admin Portal
            </Link>
          )}
        </nav>

        {/* User Auth Buttons */}
        <div className="flex items-center gap-3">
          {loading ? (
            <div className="h-8 w-20 bg-zinc-800 animate-pulse rounded-md" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-sm text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg hover:border-zinc-700 transition"
              >
                <LayoutDashboard className="h-4 w-4 text-indigo-400" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800/80 px-3 py-1.5 rounded-lg">
                <div className="h-6 w-6 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-xs font-bold text-indigo-300">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs text-zinc-300 font-medium hidden sm:inline">
                  {user.name}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                  {user.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                title="Log Out"
                className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-900 transition"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                href="/login"
                className="text-sm font-medium text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-zinc-900 transition"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-1.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-3.5 py-1.5 rounded-lg shadow-sm shadow-indigo-600/30 transition hover:scale-102"
              >
                Get Started
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
