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
  Layers,
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
      <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col transition-colors duration-200">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 border-3 border-[var(--periwinkle-deep)] border-t-transparent rounded-full animate-spin" />
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
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col transition-colors duration-200">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 sm:px-12 py-10 w-full flex-1">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-8 border-b border-[var(--line)]">
          <div>
            <span className="ghost-pill mb-2 inline-flex text-[11px] font-semibold">
              Learner Profile
            </span>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[var(--ink)] tracking-tight mt-2">
              Welcome back, {user.name} 👋
            </h1>
            <p className="text-xs sm:text-sm text-[var(--ink-soft)] mt-1 font-medium">
              Track your milestones, review learned concepts, and keep progressing.
            </p>
          </div>

          <Link
            href="/"
            className="pill-btn self-start sm:self-auto inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold"
          >
            Explore Tracks
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* 3 Pastel Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 my-8">
          {/* Card 1: Periwinkle */}
          <div className="p-6 rounded-2xl stat-card-periwinkle flex flex-col justify-between shadow-xs transition-colors">
            <div className="flex items-center justify-between text-[var(--periwinkle-deep)] mb-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Active Trails</span>
              <BookOpen className="h-4 w-4" />
            </div>
            <div className="font-display text-3xl font-semibold text-[var(--ink)]">{subjects.length}</div>
            <p className="text-xs text-[var(--ink-soft)] mt-1 font-medium">DevOps &amp; Cloud engineering</p>
          </div>

          {/* Card 2: Sage */}
          <div className="p-6 rounded-2xl stat-card-sage flex flex-col justify-between shadow-xs transition-colors">
            <div className="flex items-center justify-between text-[var(--sage-deep)] mb-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Topics Mastered</span>
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div className="font-display text-3xl font-semibold text-[var(--ink)]">
              {completedTopicsOverall}{" "}
              <span className="text-sm font-normal text-[var(--ink-soft)]">/ {totalTopicsOverall}</span>
            </div>
            <p className="text-xs text-[var(--ink-soft)] mt-1 font-medium">Milestone checklist items</p>
          </div>

          {/* Card 3: Peach */}
          <div className="p-6 rounded-2xl stat-card-peach flex flex-col justify-between shadow-xs transition-colors">
            <div className="flex items-center justify-between text-[var(--peach-deep)] mb-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Overall Completion</span>
              <Trophy className="h-4 w-4" />
            </div>
            <div className="font-display text-3xl font-semibold text-[var(--ink)]">{overallPercent}%</div>
            <div className="w-full h-2 bg-black/10 dark:bg-white/15 rounded-full overflow-hidden mt-3">
              <div
                className="h-full bg-gradient-to-r from-[var(--peach-deep)] to-[var(--peach)] rounded-full transition-all duration-500"
                style={{ width: `${overallPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tracks List */}
        <div className="mt-10">
          <h2 className="font-display text-2xl font-semibold text-[var(--ink)] mb-6 tracking-tight flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-[var(--periwinkle-deep)]" />
            Your Enrolled Tracks
          </h2>

          <div className="space-y-4">
            {subjects.map((sub) => (
              <div
                key={sub.id}
                className="p-6 rounded-2xl border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--periwinkle)] transition-all flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-xs"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="ghost-pill text-[10px] font-semibold">
                      {sub.category}
                    </span>
                    <span className="text-xs text-[var(--ink-soft)] font-medium">
                      {sub.milestonesCount} Steps • {sub.topicsCount} Topics
                    </span>
                  </div>
                  <h3 className="font-display text-2xl font-semibold text-[var(--ink)] tracking-tight">{sub.title}</h3>
                  <p className="text-xs text-[var(--ink-soft)] font-medium line-clamp-1">{sub.description}</p>

                  <div className="pt-2">
                    <div className="flex justify-between text-xs text-[var(--ink-soft)] mb-1.5 font-medium">
                      <span>Progress</span>
                      <span className="text-[var(--periwinkle-deep)] font-semibold">
                        {sub.completedCount} of {sub.topicsCount} completed ({sub.progressPercent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[var(--line)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[var(--periwinkle-deep)] to-[var(--periwinkle)] rounded-full transition-all duration-500"
                        style={{ width: `${sub.progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                <Link
                  href={`/roadmap/${sub.slug}`}
                  className="pill-btn self-start md:self-center flex items-center gap-2 px-5 py-2.5 text-xs font-semibold whitespace-nowrap"
                >
                  Continue Trail
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
