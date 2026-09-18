"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  Trophy,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Sparkles,
  Terminal,
  Cloud,
  LayoutDashboard,
} from "lucide-react";

interface SubjectProgress {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon: string;
  category: string;
  milestonesCount: number;
  topicsCount: number;
  completedCount: number;
  progressPercent: number;
}

interface UserInfo {
  userId: string;
  name: string;
  email: string;
  role: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [subjects, setSubjects] = useState<SubjectProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) {
          router.push("/login");
          return;
        }
        setUser(data.user);

        fetch("/api/subjects")
          .then((res) => res.json())
          .then((subData) => {
            if (subData.subjects) setSubjects(subData.subjects);
            setLoading(false);
          });
      })
      .catch(() => {
        router.push("/login");
      });
  }, [router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const totalTopicsOverall = subjects.reduce((acc, s) => acc + s.topicsCount, 0);
  const completedTopicsOverall = subjects.reduce((acc, s) => acc + s.completedCount, 0);
  const overallPercent =
    totalTopicsOverall > 0
      ? Math.round((completedTopicsOverall / totalTopicsOverall) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 w-full flex-1">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-8 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/50">
                Learner Dashboard
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user.name} 👋
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Track your milestones, review learned topics, and keep progressing.
            </p>
          </div>

          <Link
            href="/"
            className="self-start sm:self-auto flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-sm font-medium text-white transition"
          >
            Explore Roadmaps
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 my-8">
          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Active Tracks</span>
              <BookOpen className="h-5 w-5 text-indigo-400" />
            </div>
            <div className="text-3xl font-bold text-white">{subjects.length}</div>
            <p className="text-xs text-zinc-500 mt-1">DevOps & Cloud pathways</p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Topics Mastered</span>
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="text-3xl font-bold text-white">
              {completedTopicsOverall}{" "}
              <span className="text-base font-normal text-zinc-500">/ {totalTopicsOverall}</span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">Checklist items marked complete</p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Overall Progress</span>
              <Trophy className="h-5 w-5 text-amber-400" />
            </div>
            <div className="text-3xl font-bold text-indigo-400">{overallPercent}%</div>
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden mt-3">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full"
                style={{ width: `${overallPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tracks Progress List */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4 tracking-tight flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-indigo-400" />
            Your Learning Tracks
          </h2>

          <div className="space-y-4">
            {subjects.map((sub) => (
              <div
                key={sub.id}
                className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700/80 transition flex flex-col md:flex-row md:items-center md:justify-between gap-6"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                      {sub.category}
                    </span>
                    <span className="text-xs text-zinc-400">
                      {sub.milestonesCount} Milestones • {sub.topicsCount} Topics
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{sub.title}</h3>
                  <p className="text-xs text-zinc-400 line-clamp-1">{sub.description}</p>

                  <div className="pt-2">
                    <div className="flex justify-between text-xs text-zinc-400 mb-1">
                      <span>Completion</span>
                      <span className="font-semibold text-emerald-400">
                        {sub.completedCount} of {sub.topicsCount} done ({sub.progressPercent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${sub.progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                <Link
                  href={`/roadmap/${sub.slug}`}
                  className="self-start md:self-center flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 transition whitespace-nowrap"
                >
                  Continue Learning
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
