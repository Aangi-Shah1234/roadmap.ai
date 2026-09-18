"use client";

import { useState } from "react";
import { X, CheckCircle2, Circle, ExternalLink, BookOpen, Video, FileText, Sparkles } from "lucide-react";

export interface TopicResource {
  title: string;
  url: string;
  type: "doc" | "video" | "tutorial" | string;
}

export interface SelectedTopic {
  id: string;
  title: string;
  description: string | null;
  milestoneTitle: string;
  level: string;
  resources: TopicResource[];
  isCompleted: boolean;
}

interface TopicDrawerProps {
  topic: SelectedTopic | null;
  onClose: () => void;
  onToggleComplete: (topicId: string, newState: boolean) => Promise<void>;
  isLoggedIn: boolean;
}

export default function TopicDrawer({
  topic,
  onClose,
  onToggleComplete,
  isLoggedIn,
}: TopicDrawerProps) {
  const [updating, setUpdating] = useState(false);

  if (!topic) return null;

  const handleToggle = async () => {
    if (!isLoggedIn) {
      window.location.href = "/login";
      return;
    }
    setUpdating(true);
    try {
      await onToggleComplete(topic.id, !topic.isCompleted);
    } finally {
      setUpdating(false);
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4 text-rose-400" />;
      case "tutorial":
        return <Sparkles className="h-4 w-4 text-amber-400" />;
      default:
        return <BookOpen className="h-4 w-4 text-blue-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end transition-opacity">
      {/* Backdrop click to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Drawer Content */}
      <div className="w-full max-w-md bg-zinc-900 border-l border-zinc-800 shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-start justify-between bg-zinc-950/40">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                {topic.milestoneTitle}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                {topic.level}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {topic.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Completion Status Box */}
          <div
            className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
              topic.isCompleted
                ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-300"
                : "bg-zinc-800/40 border-zinc-700/60 text-zinc-300"
            }`}
          >
            <div className="flex items-center gap-3">
              {topic.isCompleted ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              ) : (
                <Circle className="h-5 w-5 text-zinc-500 shrink-0" />
              )}
              <div>
                <p className="text-sm font-semibold">
                  {topic.isCompleted ? "Topic Completed" : "Not Completed Yet"}
                </p>
                <p className="text-xs text-zinc-400">
                  {isLoggedIn
                    ? topic.isCompleted
                      ? "Great job! This is marked on your roadmap."
                      : "Mark complete once you've learned this concept."
                    : "Sign in to save and track your progress."}
                </p>
              </div>
            </div>

            <button
              onClick={handleToggle}
              disabled={updating}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition disabled:opacity-50 ${
                topic.isCompleted
                  ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-600/30"
              }`}
            >
              {updating ? "Saving..." : topic.isCompleted ? "Mark Incomplete" : "Mark Done"}
            </button>
          </div>

          {/* Overview & Description */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-indigo-400" />
              About this Topic
            </h3>
            <div className="text-sm text-zinc-300 leading-relaxed bg-zinc-950/50 p-4 rounded-xl border border-zinc-800">
              {topic.description || "No description provided for this topic yet."}
            </div>
          </div>

          {/* Learning Resources */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
              Curated Free Resources ({topic.resources?.length || 0})
            </h3>
            {topic.resources && topic.resources.length > 0 ? (
              <div className="space-y-2">
                {topic.resources.map((res, i) => (
                  <a
                    key={i}
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-lg bg-zinc-950/40 hover:bg-zinc-800/80 border border-zinc-800 hover:border-zinc-700 text-sm group transition"
                  >
                    <div className="flex items-center gap-2.5">
                      {getResourceIcon(res.type)}
                      <span className="font-medium text-zinc-200 group-hover:text-indigo-300 transition-colors">
                        {res.title}
                      </span>
                    </div>
                    <ExternalLink className="h-4 w-4 text-zinc-500 group-hover:text-zinc-300 transition-colors shrink-0" />
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 italic">No resources added yet.</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-between text-xs text-zinc-400">
          <span>Roadmap AI Learning Path</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-md hover:bg-zinc-800 text-zinc-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
