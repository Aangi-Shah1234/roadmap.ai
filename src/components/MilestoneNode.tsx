"use client";

import { Handle, Position } from "@xyflow/react";
import {
  CheckCircle2,
  Circle,
  ArrowUpRight,
  Terminal,
  Network,
  GitBranch,
  Box,
  Workflow,
  Layers,
  Cpu,
  Cloud,
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

  // Dribbble pastel color palettes that cycle based on step order
  const getPastelTheme = (stepOrder: number) => {
    const palettes = [
      {
        bg: "bg-[#e8ecff] dark:bg-[#151932]",
        border: "border-[#cbd5ff] dark:border-[#2e366b]",
        pillBg: "bg-[#2563eb] text-white",
        textTitle: "text-[#1e255e] dark:text-[#c7d2fe]",
        accent: "#2563eb",
      },
      {
        bg: "bg-[#eafaf1] dark:bg-[#0e2319]",
        border: "border-[#bbf0d4] dark:border-[#1e4d38]",
        pillBg: "bg-[#10b981] text-white",
        textTitle: "text-[#0e3b26] dark:text-[#a7f3d0]",
        accent: "#10b981",
      },
      {
        bg: "bg-[#faeee7] dark:bg-[#261812]",
        border: "border-[#f5d3c1] dark:border-[#522c1d]",
        pillBg: "bg-[#f97316] text-white",
        textTitle: "text-[#4a2412] dark:text-[#fed7aa]",
        accent: "#f97316",
      },
      {
        bg: "bg-[#e8f4fc] dark:bg-[#0e2033]",
        border: "border-[#c4e4f8] dark:border-[#1a4166]",
        pillBg: "bg-[#0284c7] text-white",
        textTitle: "text-[#0f344d] dark:text-[#bae6fd]",
        accent: "#0284c7",
      },
      {
        bg: "bg-[#faeaee] dark:bg-[#28121a]",
        border: "border-[#f8c8d3] dark:border-[#521f32]",
        pillBg: "bg-[#e11d48] text-white",
        textTitle: "text-[#4a1423] dark:text-[#fecdd3]",
        accent: "#e11d48",
      },
      {
        bg: "bg-[#f3eafd] dark:bg-[#1e122d]",
        border: "border-[#dfc4fa] dark:border-[#422067]",
        pillBg: "bg-[#9333ea] text-white",
        textTitle: "text-[#3b1263] dark:text-[#e9d5ff]",
        accent: "#9333ea",
      },
    ];
    return palettes[(stepOrder - 1) % palettes.length];
  };

  const theme = getPastelTheme(order);
  const completedCount = topics?.filter((t) => t.isCompleted).length || 0;
  const totalCount = topics?.length || 0;

  return (
    <div
      className={`w-[390px] rounded-3xl border-2 p-6 transition-all duration-300 shadow-sm hover:shadow-lg ${theme.bg} ${
        isCompleted
          ? "border-emerald-500 shadow-emerald-500/10"
          : `${theme.border} hover:scale-[1.01]`
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3.5 !h-3.5 !bg-[#2563eb] !border-2 !border-white -top-2 shadow-xs"
      />

      {/* Card Header with Diagonal Arrow Button ↗ from screenshot */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${theme.pillBg}`}>
            Step 0{order}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-[var(--text-secondary)]">
            {level}
          </span>
        </div>

        {/* Circular Arrow Button from Dribbble shot */}
        <div className="dribbble-arrow-btn text-[var(--text-primary)] cursor-pointer" title="View details">
          <ArrowUpRight className="h-4 w-4" />
        </div>
      </div>

      {/* Title */}
      <h3 className={`text-2xl font-extrabold tracking-tight mb-1.5 ${theme.textTitle}`}>
        {title}
      </h3>

      {description && (
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2 mb-4 font-medium">
          {description}
        </p>
      )}

      {/* Subtopics Pills (Dribbble capsule style) */}
      <div className="space-y-1.5 pt-2 border-t border-black/5 dark:border-white/10">
        <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
          <span>Concepts to Learn</span>
          <span>{completedCount}/{totalCount} Done</span>
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
              className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-xs font-semibold transition ${
                t.isCompleted
                  ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30"
                  : "bg-white/80 dark:bg-white/5 text-[var(--text-primary)] border border-black/5 dark:border-white/10 hover:bg-white dark:hover:bg-white/10 shadow-2xs"
              }`}
            >
              <div className="flex items-center gap-2 truncate pr-2">
                {t.isCompleted ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <Circle className="h-3.5 w-3.5 text-[var(--text-secondary)] shrink-0" />
                )}
                <span className="truncate">{t.title}</span>
              </div>
              <span className="text-[10px] text-[var(--text-secondary)] font-bold">Details &rarr;</span>
            </button>
          ))}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3.5 !h-3.5 !bg-[#2563eb] !border-2 !border-white -bottom-2 shadow-xs"
      />
    </div>
  );
}
