"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import RoadmapCanvas from "@/components/RoadmapCanvas";
import { ArrowLeft, CheckCircle2, Sparkles, Trophy, BookOpen } from "lucide-react";

interface RoadmapData {
  subject: {
    id: string;
    title: string;
    slug: string;
    description: string;
    category: string;
  };
  milestones: any[];
  stats: {
    totalMilestones: number;
    totalTopics: number;
    completedCount: number;
    progressPercent: number;
  };
  currentUser: {
    userId: string;
    name: string;
    role: "admin" | "learner";
  } | null;
}

export default function RoadmapPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [data, setData] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoadmap = async () => {
    try {
      const res = await fetch(`/api/roadmaps/${slug}`);
      if (!res.ok) throw new Error("Roadmap not found");
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || "Failed to load roadmap");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, [slug]);

  const handleToggleComplete = async (topicId: string, newState: boolean) => {
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId, completed: newState }),
      });

      if (res.ok) {
        // Refresh roadmap data to update progress bars and node states
        await fetchRoadmap();
      }
    } catch (err) {
      console.error("Failed to toggle progress", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <div className="h-8 w-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-zinc-400">Loading interactive roadmap canvas...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-4">
          <div className="p-3 rounded-full bg-red-950/40 border border-red-800 text-red-400">
            <BookOpen className="h-8 w-8" />
          </div>
          <h1 className="text-xl font-bold text-white">Roadmap Not Found</h1>
          <p className="text-sm text-zinc-400 max-w-md">
            The roadmap &quot;{slug}&quot; doesn&apos;t exist yet or has been removed.
          </p>
          <Link
            href="/"
            className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-semibold text-white transition"
          >
            &larr; Back to all roadmaps
          </Link>
        </div>
      </div>
    );
  }

  const { subject, milestones, stats, currentUser } = data;

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col overflow-hidden">
      <Navbar />

      {/* Roadmap Sticky Header & Progress Bar */}
      <div className="border-b border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4 z-20">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            title="Back to all roadmaps"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">
                {subject.title}
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/50">
                {subject.category}
              </span>
            </div>
            <p className="text-xs text-zinc-400 hidden sm:block">
              {subject.description}
            </p>
          </div>
        </div>

        {/* Progress Display */}
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-zinc-400">Track Progress:</span>
              <span className="font-bold text-indigo-400">
                {stats.progressPercent}%
              </span>
              <span className="text-zinc-500">
                ({stats.completedCount}/{stats.totalTopics} topics)
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-48 h-2 bg-zinc-800 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${stats.progressPercent}%` }}
              />
            </div>
          </div>

          {!currentUser && (
            <Link
              href="/login"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition whitespace-nowrap shadow-sm shadow-indigo-600/30"
            >
              Sign in to save progress
            </Link>
          )}
        </div>
      </div>

      {/* React Flow Interactive Canvas */}
      <div className="flex-1 w-full relative">
        <RoadmapCanvas
          milestones={milestones}
          onToggleComplete={handleToggleComplete}
          isLoggedIn={!!currentUser}
        />
      </div>
    </div>
  );
}
