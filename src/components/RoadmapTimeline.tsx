"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Circle,
  Terminal,
  Network,
  GitBranch,
  Box,
  Workflow,
  Layers,
  Cpu,
  Cloud,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import TopicDrawer, { SelectedTopic } from "./TopicDrawer";

interface MilestoneData {
  id: string;
  order: number;
  title: string;
  description: string | null;
  level: "Beginner" | "Intermediate" | "Advanced";
  topics: Array<{
    id: string;
    title: string;
    description: string | null;
    resources: any[];
    isCompleted: boolean;
  }>;
  isCompleted: boolean;
}

interface RoadmapTimelineProps {
  milestones: MilestoneData[];
  onToggleComplete: (topicId: string, newState: boolean) => Promise<void>;
  isLoggedIn: boolean;
}

export default function RoadmapTimeline({
  milestones,
  onToggleComplete,
  isLoggedIn,
}: RoadmapTimelineProps) {
  const [selectedTopic, setSelectedTopic] = useState<SelectedTopic | null>(null);

  const handleTopicDrawerComplete = async (topicId: string, newState: boolean) => {
    await onToggleComplete(topicId, newState);
    if (selectedTopic && selectedTopic.id === topicId) {
      setSelectedTopic({ ...selectedTopic, isCompleted: newState });
    }
  };

  const getMilestoneIcon = (titleStr: string) => {
    const t = titleStr.toLowerCase();
    if (t.includes("linux") || t.includes("os")) return <Terminal className="h-6 w-6 text-emerald-400" />;
    if (t.includes("network")) return <Network className="h-6 w-6 text-sky-400" />;
    if (t.includes("git")) return <GitBranch className="h-6 w-6 text-orange-400" />;
    if (t.includes("docker") || t.includes("container")) return <Box className="h-6 w-6 text-cyan-400" />;
    if (t.includes("ci/cd") || t.includes("pipeline")) return <Workflow className="h-6 w-6 text-pink-400" />;
    if (t.includes("kubernetes")) return <Layers className="h-6 w-6 text-blue-400" />;
    if (t.includes("terraform") || t.includes("infrastructure")) return <Cpu className="h-6 w-6 text-purple-400" />;
    if (t.includes("cloud") || t.includes("aws")) return <Cloud className="h-6 w-6 text-amber-400" />;
    return <Terminal className="h-6 w-6 text-indigo-400" />;
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case "Beginner":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
      case "Intermediate":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
      case "Advanced":
        return "bg-purple-500/20 text-purple-300 border-purple-500/40";
      default:
        return "bg-zinc-800 text-zinc-300 border-zinc-700";
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="relative border-l-2 border-indigo-500/30 ml-4 sm:ml-8 space-y-12">
        {milestones.map((m, index) => {
          const completedCount = m.topics?.filter((t) => t.isCompleted).length || 0;
          const totalCount = m.topics?.length || 0;
          const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

          return (
            <div key={m.id} className="relative pl-8 sm:pl-10 group">
              {/* Step indicator circle on the timeline */}
              <div
                className={`absolute -left-[19px] top-1.5 h-9 w-9 rounded-full border-2 flex items-center justify-center font-bold text-xs shadow-lg transition-all duration-300 ${
                  m.isCompleted
                    ? "bg-emerald-600 border-emerald-400 text-white shadow-emerald-600/30"
                    : "bg-zinc-900 border-indigo-500 text-indigo-300 shadow-indigo-500/20 group-hover:scale-110"
                }`}
              >
                {m.isCompleted ? <CheckCircle2 className="h-4 w-4" /> : m.order}
              </div>

              {/* Milestone Card */}
              <div
                className={`rounded-2xl border-2 p-6 transition-all duration-300 shadow-xl ${
                  m.isCompleted
                    ? "bg-zinc-900/90 border-emerald-500/50 shadow-emerald-500/5"
                    : "bg-zinc-900/90 border-zinc-800 hover:border-indigo-500/60 hover:shadow-indigo-500/10"
                }`}
              >
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-zinc-800/80">
                  <div className="flex items-center gap-3.5">
                    <div className="p-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700/80">
                      {getMilestoneIcon(m.title)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-800/50">
                          Step {m.order}
                        </span>
                        <span
                          className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getLevelBadge(
                            m.level
                          )}`}
                        >
                          {m.level}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-white tracking-tight">
                        {m.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-zinc-400 bg-zinc-800/80 px-2.5 py-1 rounded-lg">
                      {completedCount} / {totalCount} Completed ({progressPct}%)
                    </span>
                  </div>
                </div>

                {m.description && (
                  <p className="text-sm text-zinc-300 mt-3 leading-relaxed">
                    {m.description}
                  </p>
                )}

                {/* Progress Bar */}
                <div className="mt-4 w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      m.isCompleted
                        ? "bg-emerald-400"
                        : "bg-gradient-to-r from-indigo-500 to-emerald-400"
                    }`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>

                {/* Topics List */}
                <div className="mt-5 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                    Topics & Concepts in this Milestone
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {m.topics?.map((topic) => (
                      <button
                        key={topic.id}
                        onClick={() =>
                          setSelectedTopic({
                            id: topic.id,
                            title: topic.title,
                            description: topic.description,
                            milestoneTitle: m.title,
                            level: m.level,
                            resources: topic.resources || [],
                            isCompleted: topic.isCompleted,
                          })
                        }
                        className={`flex items-center justify-between p-3 rounded-xl text-left text-xs font-semibold transition group ${
                          topic.isCompleted
                            ? "bg-emerald-950/30 text-emerald-200 border border-emerald-500/40 hover:bg-emerald-950/50"
                            : "bg-zinc-950/70 text-zinc-300 border border-zinc-800 hover:border-indigo-500/60 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate pr-2">
                          {topic.isCompleted ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                          ) : (
                            <Circle className="h-4 w-4 text-zinc-600 group-hover:text-zinc-400 shrink-0 transition-colors" />
                          )}
                          <span className="truncate">{topic.title}</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-zinc-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Topic Drawer */}
      <TopicDrawer
        topic={selectedTopic}
        onClose={() => setSelectedTopic(null)}
        onToggleComplete={handleTopicDrawerComplete}
        isLoggedIn={isLoggedIn}
      />
    </div>
  );
}
