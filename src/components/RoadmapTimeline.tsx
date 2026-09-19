"use client";

import { useState } from "react";
import { CheckCircle2, Circle, ChevronRight } from "lucide-react";
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

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="relative border-l-2 border-indigo-400/40 ml-4 sm:ml-8 space-y-12">
        {milestones.map((m) => {
          const completedCount = m.topics?.filter((t) => t.isCompleted).length || 0;
          const totalCount = m.topics?.length || 0;
          const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

          return (
            <div key={m.id} className="relative pl-8 sm:pl-10 group">
              {/* Stepper Indicator */}
              <div
                className={`absolute -left-[17px] top-3 h-8 w-8 rounded-full border-2 flex items-center justify-center font-bold text-xs shadow-xs transition-all duration-200 ${
                  m.isCompleted
                    ? "bg-emerald-500 border-white text-white"
                    : "bg-indigo-600 border-white text-white group-hover:scale-110"
                }`}
              >
                {m.isCompleted ? <CheckCircle2 className="h-4 w-4" /> : m.order}
              </div>

              {/* Milestone Card */}
              <div
                className={`bg-[var(--bg-surface)] rounded-3xl border-2 p-6 transition-all duration-250 shadow-sm hover:shadow-md ${
                  m.isCompleted
                    ? "border-emerald-400 dark:border-emerald-500/60"
                    : "border-[var(--border-color)] hover:border-indigo-400"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-[var(--border-color)]">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-1">
                      Step {m.order} • {m.level}
                    </span>
                    <h3 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
                      {m.title}
                    </h3>
                  </div>

                  <span className="text-xs font-semibold text-[var(--text-secondary)] bg-[var(--bg-subtle)] border border-[var(--border-color)] px-3 py-1 rounded-full">
                    {completedCount} / {totalCount} Done ({progressPct}%)
                  </span>
                </div>

                {m.description && (
                  <p className="text-sm text-[var(--text-secondary)] mt-2.5 leading-relaxed">
                    {m.description}
                  </p>
                )}

                {/* Topics Grid */}
                <div className="mt-5 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] block">
                    Topics to master:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                        className={`flex items-center justify-between p-3 rounded-xl text-left text-xs font-semibold transition ${
                          topic.isCompleted
                            ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50"
                            : "bg-[var(--bg-subtle)]/60 text-[var(--text-primary)] border border-[var(--border-color)] hover:border-indigo-400 hover:bg-[var(--bg-subtle)]"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          {topic.isCompleted ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          ) : (
                            <Circle className="h-3.5 w-3.5 text-[var(--text-secondary)] shrink-0" />
                          )}
                          <span className="truncate">{topic.title}</span>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-[var(--text-secondary)] shrink-0" />
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
