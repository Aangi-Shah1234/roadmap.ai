"use client";

import { Handle, Position } from "@xyflow/react";
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
  ExternalLink,
} from "lucide-react";
import { SelectedTopic } from "./TopicDrawer";

export interface MilestoneNodeData {
  milestoneId: string;
  order: number;
  title: string;
  description: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  topics: Array<{
    id: string;
    title: string;
    description: string | null;
    resources: any[];
    isCompleted: boolean;
  }>;
  isCompleted: boolean;
  onSelectTopic: (topic: SelectedTopic) => void;
}

export default function MilestoneNode({ data }: any) {
  const nodeData = data as MilestoneNodeData;
  const { order, title, description, level, topics, isCompleted, onSelectTopic } =
    nodeData;

  const getMilestoneIcon = (titleStr: string) => {
    const t = titleStr.toLowerCase();
    if (t.includes("linux") || t.includes("os")) return <Terminal className="h-5 w-5 text-emerald-400" />;
    if (t.includes("network")) return <Network className="h-5 w-5 text-sky-400" />;
    if (t.includes("git")) return <GitBranch className="h-5 w-5 text-orange-400" />;
    if (t.includes("docker") || t.includes("container")) return <Box className="h-5 w-5 text-cyan-400" />;
    if (t.includes("ci/cd") || t.includes("pipeline")) return <Workflow className="h-5 w-5 text-pink-400" />;
    if (t.includes("kubernetes")) return <Layers className="h-5 w-5 text-blue-400" />;
    if (t.includes("terraform") || t.includes("infrastructure")) return <Cpu className="h-5 w-5 text-purple-400" />;
    if (t.includes("cloud") || t.includes("aws")) return <Cloud className="h-5 w-5 text-amber-400" />;
    return <Terminal className="h-5 w-5 text-indigo-400" />;
  };

  const getLevelBadge = () => {
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

  const completedCount = topics?.filter((t) => t.isCompleted).length || 0;
  const totalCount = topics?.length || 0;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div
      className={`w-[400px] rounded-2xl border-2 transition-all duration-300 shadow-2xl backdrop-blur-xl ${
        isCompleted
          ? "bg-zinc-900 border-emerald-500/70 shadow-emerald-500/15"
          : "bg-zinc-900 border-zinc-700 hover:border-indigo-500 hover:shadow-indigo-500/20"
      }`}
    >
      {/* Target Handle (Incoming connection) */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-4 !h-4 !bg-indigo-500 !border-2 !border-zinc-900 -top-2 hover:scale-125 transition-transform"
      />

      {/* Header Banner */}
      <div
        className={`p-4 rounded-t-2xl border-b border-zinc-800 ${
          isCompleted
            ? "bg-gradient-to-r from-emerald-950/70 via-zinc-900 to-zinc-900"
            : "bg-gradient-to-r from-indigo-950/70 via-zinc-900 to-zinc-900"
        }`}
      >
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center h-7 px-2.5 rounded-lg bg-indigo-600 text-white font-extrabold text-xs shadow-md shadow-indigo-600/30">
              STEP {order}
            </span>
            <span
              className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getLevelBadge()}`}
            >
              {level}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold">
            {isCompleted ? (
              <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/60">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Completed
              </span>
            ) : (
              <span className="text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded-md">
                {completedCount}/{totalCount} Done
              </span>
            )}
          </div>
        </div>

        {/* Title & Icon */}
        <div className="flex items-start gap-3 mt-1">
          <div className="p-2 rounded-xl bg-zinc-800/80 border border-zinc-700/80 shrink-0">
            {getMilestoneIcon(title)}
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight leading-snug">
              {title}
            </h3>
            {description && (
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed line-clamp-2">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Mini progress bar inside node */}
        <div className="mt-3 w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              isCompleted
                ? "bg-emerald-400"
                : "bg-gradient-to-r from-indigo-500 to-emerald-400"
            }`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Subtopics Checklist */}
      <div className="p-4 space-y-2 bg-zinc-950/60 rounded-b-2xl">
        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-zinc-400 px-1">
          <span>Topics to Master</span>
          <span className="text-zinc-500">Click to explore</span>
        </div>

        <div className="space-y-1.5">
          {topics?.map((t) => (
            <button
              key={t.id}
              onClick={() =>
                onSelectTopic({
                  id: t.id,
                  title: t.title,
                  description: t.description,
                  milestoneTitle: title,
                  level,
                  resources: t.resources || [],
                  isCompleted: t.isCompleted,
                })
              }
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-medium text-left transition group ${
                t.isCompleted
                  ? "bg-emerald-950/30 text-emerald-200 border border-emerald-500/40 hover:bg-emerald-950/50"
                  : "bg-zinc-900 text-zinc-300 border border-zinc-800 hover:border-indigo-500/60 hover:text-white hover:bg-zinc-850"
              }`}
            >
              <div className="flex items-center gap-2.5 truncate pr-2">
                {t.isCompleted ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 text-zinc-600 group-hover:text-zinc-400 shrink-0 transition-colors" />
                )}
                <span className="truncate font-semibold">{t.title}</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-zinc-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Source Handle (Outgoing connection) */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-4 !h-4 !bg-indigo-500 !border-2 !border-zinc-900 -bottom-2 hover:scale-125 transition-transform"
      />
    </div>
  );
}
