"use client";

import { Handle, Position, NodeProps } from "@xyflow/react";
import { CheckCircle2, Circle, Sparkles } from "lucide-react";
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

  const getLevelBadge = () => {
    switch (level) {
      case "Beginner":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "Intermediate":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "Advanced":
        return "bg-purple-500/10 text-purple-400 border-purple-500/30";
      default:
        return "bg-zinc-800 text-zinc-300 border-zinc-700";
    }
  };

  const completedCount = topics.filter((t) => t.isCompleted).length;

  return (
    <div
      className={`w-80 sm:w-96 rounded-2xl border transition-all duration-300 shadow-xl backdrop-blur-md ${
        isCompleted
          ? "bg-zinc-900/90 border-emerald-500/50 shadow-emerald-500/10"
          : "bg-zinc-900/90 border-zinc-800 hover:border-indigo-500/40 hover:shadow-indigo-500/10"
      }`}
    >
      {/* Target Handle (Incoming connection) */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-zinc-950 -top-1.5"
      />

      {/* Node Header */}
      <div className="p-4 border-b border-zinc-800/80 bg-zinc-950/40 rounded-t-2xl">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md bg-indigo-950/80 text-indigo-300 border border-indigo-800/50">
              Milestone {order}
            </span>
            <span
              className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md border ${getLevelBadge()}`}
            >
              {level}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            {isCompleted ? (
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Done
              </span>
            ) : (
              <span className="text-zinc-400 font-medium">
                {completedCount}/{topics.length} Done
              </span>
            )}
          </div>
        </div>

        <h3 className="text-base font-bold text-white tracking-tight leading-snug">
          {title}
        </h3>
        {description && (
          <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{description}</p>
        )}
      </div>

      {/* Subtopics / Learning Concepts */}
      <div className="p-3.5 space-y-2">
        <div className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 px-1">
          Core Topics to Master
        </div>
        <div className="space-y-1.5">
          {topics.map((t) => (
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
              className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-medium text-left transition ${
                t.isCompleted
                  ? "bg-emerald-950/30 text-emerald-200 border border-emerald-500/30 hover:bg-emerald-950/50"
                  : "bg-zinc-950/50 text-zinc-300 border border-zinc-800/80 hover:border-indigo-500/40 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2 truncate pr-2">
                {t.isCompleted ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <Circle className="h-3.5 w-3.5 text-zinc-600 shrink-0" />
                )}
                <span className="truncate">{t.title}</span>
              </div>
              <span className="text-[10px] text-zinc-500 shrink-0">Details &rarr;</span>
            </button>
          ))}
        </div>
      </div>

      {/* Source Handle (Outgoing connection) */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-zinc-950 -bottom-1.5"
      />
    </div>
  );
}
