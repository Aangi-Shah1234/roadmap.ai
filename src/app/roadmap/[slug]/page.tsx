"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import RoadmapCanvas from "@/components/RoadmapCanvas";
import RoadmapTimeline from "@/components/RoadmapTimeline";
import { ArrowLeft, GitGraph, ListOrdered, Sparkles, BookOpen, CheckCircle2 } from "lucide-react";

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
  const [viewMode, setViewMode] = useState<"canvas" | "timeline">("canvas");

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
          <p className="text-sm text-zinc-400">Loading roadmap...</p>
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
    <div className="min-h-screen bg-zinc-950 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />

      {/* Top Banner & Controls */}
      <div className="border-b border-zinc-800 bg-zinc-900/90 backdrop-blur-md px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4 z-20">
        {/* Subject Info */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-xl text-zinc-400 hover:text-white bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition"
            title="Back to all roadmaps"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold text-white tracking-tight">
                {subject.title}
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                {subject.category}
              </span>
            </div>
            <p className="text-xs text-zinc-400 hidden sm:block mt-0.5">
              {subject.description}
            </p>
          </div>
        </div>

        {/* View Mode Toggle & Progress */}
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          {/* Toggle between Canvas & Timeline View */}
          <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode("canvas")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === "canvas"
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <GitGraph className="h-3.5 w-3.5" />
              Flow Canvas
            </button>
            <button
              onClick={() => setViewMode("timeline")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === "timeline"
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <ListOrdered className="h-3.5 w-3.5" />
              Timeline Path
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-zinc-400 font-medium">Track Progress:</span>
              <span className="font-extrabold text-emerald-400">
                {stats.progressPercent}%
              </span>
              <span className="text-zinc-500 font-medium">
                ({stats.completedCount}/{stats.totalTopics} done)
              </span>
            </div>
            <div className="w-44 h-2 bg-zinc-950 border border-zinc-800 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${stats.progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main View */}
      <div className="flex-1 w-full relative">
        {viewMode === "canvas" ? (
          <RoadmapCanvas
            milestones={milestones}
            onToggleComplete={handleToggleComplete}
            isLoggedIn={!!currentUser}
          />
        ) : (
          <RoadmapTimeline
            milestones={milestones}
            onToggleComplete={handleToggleComplete}
            isLoggedIn={!!currentUser}
          />
        )}
      </div>
    </div>
  );
}
