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
        return <Video className="h-4 w-4 text-rose-500" />;
      case "tutorial":
        return <Sparkles className="h-4 w-4 text-amber-500" />;
      default:
        return <BookOpen className="h-4 w-4 text-indigo-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end transition-opacity">
      {/* Backdrop click to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Drawer Container */}
      <div className="w-full max-w-md bg-[var(--bg-surface)] border-l border-[var(--border-color)] shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-250">
        {/* Header */}
        <div className="p-6 border-b border-[var(--border-color)] flex items-start justify-between bg-[var(--bg-subtle)]/40">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-color)]">
                {topic.milestoneTitle}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                {topic.level}
              </span>
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
              {topic.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Completion Status Card */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between transition ${
              topic.isCompleted
                ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300"
                : "bg-[var(--bg-subtle)] border-[var(--border-color)] text-[var(--text-primary)]"
            }`}
          >
            <div className="flex items-center gap-3">
              {topic.isCompleted ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
              ) : (
                <Circle className="h-5 w-5 text-[var(--text-secondary)] shrink-0" />
              )}
              <div>
                <p className="text-xs font-bold">
                  {topic.isCompleted ? "Topic Completed" : "Not Finished Yet"}
                </p>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  {isLoggedIn
                    ? topic.isCompleted
                      ? "Saved on your roadmap."
                      : "Mark complete once learned."
                    : "Sign in to save progress."}
                </p>
              </div>
            </div>

            <button
              onClick={handleToggle}
              disabled={updating}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition disabled:opacity-50 ${
                topic.isCompleted
                  ? "bg-[var(--bg-surface)] border border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs shadow-indigo-600/20"
              }`}
            >
              {updating ? "Saving..." : topic.isCompleted ? "Undo" : "Mark Done"}
            </button>
          </div>

          {/* Overview */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-indigo-500" />
              Concept Overview
            </h3>
            <div className="text-sm text-[var(--text-primary)] leading-relaxed bg-[var(--bg-subtle)]/60 p-4 rounded-2xl border border-[var(--border-color)]">
              {topic.description || "No detailed notes provided for this topic yet."}
            </div>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2.5 flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-indigo-500" />
              Free Resources ({topic.resources?.length || 0})
            </h3>
            {topic.resources && topic.resources.length > 0 ? (
              <div className="space-y-2">
                {topic.resources.map((res, i) => (
                  <a
                    key={i}
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--bg-subtle)]/60 hover:bg-[var(--bg-subtle)] border border-[var(--border-color)] hover:border-indigo-400 text-xs font-semibold group transition shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      {getResourceIcon(res.type)}
                      <span className="text-[var(--text-primary)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {res.title}
                      </span>
                    </div>
                    <ExternalLink className="h-4 w-4 text-[var(--text-secondary)] group-hover:text-indigo-500 transition-colors shrink-0" />
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[var(--text-secondary)] italic">No links added yet.</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-subtle)]/40 flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <span className="font-bold text-[var(--text-primary)]">Roadmap AI</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-primary)] transition text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
