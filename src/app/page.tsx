"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  Terminal,
  Cloud,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Compass,
  Layers,
  ShieldCheck,
  Flame,
} from "lucide-react";

interface SubjectItem {
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

export default function HomePage() {
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/subjects")
      .then((res) => res.json())
      .then((data) => {
        if (data.subjects) setSubjects(data.subjects);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getTrackIcon = (iconName: string) => {
    switch (iconName) {
      case "Cloud":
        return <Cloud className="h-6 w-6 text-sky-400" />;
      case "Terminal":
      default:
        return <Terminal className="h-6 w-6 text-indigo-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 sm:px-6 max-w-7xl mx-auto w-full text-center overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300 mb-6 shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
          <span>Interactive DevOps & Cloud Learning Paths</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
          Master Modern Tech with{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Visual Roadmaps
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Step-by-step, milestone-driven roadmaps to take you from fundamentals to production readiness.
          Track your progress, explore curated documentation, and level up your skills.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/roadmap/devops"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 transition hover:scale-102"
          >
            <Terminal className="h-4 w-4" />
            Explore DevOps Track
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/roadmap/cloud"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-white font-semibold text-sm transition"
          >
            <Cloud className="h-4 w-4 text-sky-400" />
            Explore Cloud Track
          </Link>
        </div>
      </section>

      {/* Roadmaps Grid */}
      <section className="py-12 px-4 sm:px-6 max-w-7xl mx-auto w-full flex-1">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Compass className="h-6 w-6 text-indigo-400" />
              Available Learning Tracks
            </h2>
            <p className="text-sm text-zinc-400 mt-1">
              Select a track to launch its interactive milestone flowchart
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((n) => (
              <div
                key={n}
                className="h-64 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 animate-pulse p-6"
              />
            ))}
          </div>
        ) : subjects.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900/40 rounded-2xl border border-zinc-800">
            <p className="text-zinc-400">No roadmaps available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {subjects.map((sub) => (
              <Link
                key={sub.id}
                href={`/roadmap/${sub.slug}`}
                className="group relative rounded-2xl bg-zinc-900/70 hover:bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 p-6 transition-all duration-300 shadow-xl hover:shadow-indigo-500/10 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="h-12 w-12 rounded-xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center group-hover:scale-105 transition-transform">
                      {getTrackIcon(sub.icon)}
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                      {sub.category}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">
                    {sub.title}
                  </h3>
                  <p className="text-sm text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                    {sub.description}
                  </p>
                </div>

                <div className="mt-6 pt-5 border-t border-zinc-800/80 space-y-3">
                  {/* Stats Badges */}
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 font-medium">
                        <Layers className="h-3.5 w-3.5 text-zinc-500" />
                        {sub.milestonesCount} Milestones
                      </span>
                      <span>•</span>
                      <span>{sub.topicsCount} Topics</span>
                    </div>

                    <span className="font-semibold text-indigo-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Open Canvas &rarr;
                    </span>
                  </div>

                  {/* Progress bar */}
                  {sub.progressPercent > 0 && (
                    <div>
                      <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                        <span>Progress</span>
                        <span className="font-bold text-emerald-400">
                          {sub.progressPercent}% Completed
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full"
                          style={{ width: `${sub.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Feature Highlights */}
      <section className="border-t border-zinc-800 bg-zinc-900/30 py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800">
            <div className="h-10 w-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
              <Layers className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">
              Milestone Progression
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Step through structured, sequential phases. From Linux and Bash basics to full-blown Kubernetes clusters and Terraform infrastructure.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">
              Personal Progress Tracker
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Mark topics completed as you study. Your progress is saved in SQLite and Turso, showing clear completion stats on your personal dashboard.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800">
            <div className="h-10 w-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">
              Admin Roadmap Builder
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Administrators can easily create new tracks, configure milestones, add topic resources, and expand curriculum from the dedicated admin dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8 px-4 text-center text-xs text-zinc-500">
        <p>Roadmap AI &copy; 2026. Built with Next.js 15, React Flow, Drizzle ORM & Turso.</p>
      </footer>
    </div>
  );
}
