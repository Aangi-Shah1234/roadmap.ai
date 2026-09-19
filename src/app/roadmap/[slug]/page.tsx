"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Lock, ArrowRight, ExternalLink } from "lucide-react";
import { getLessonContent, LessonData } from "@/lib/lessons";

interface TopicResource {
  title: string;
  url: string;
  type?: string;
}

interface TopicData {
  id: string;
  title: string;
  description: string | null;
  order: number;
  resources: TopicResource[] | string;
  isCompleted: boolean;
}

interface MilestoneData {
  id: string;
  order: number;
  title: string;
  description: string | null;
  level: "Beginner" | "Intermediate" | "Advanced";
  topics: TopicData[];
  isCompleted: boolean;
}

interface RoadmapData {
  subject: {
    id: string;
    title: string;
    slug: string;
    description: string;
    category: string;
  };
  milestones: MilestoneData[];
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
  const [requireLogin, setRequireLogin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active milestone index (for the horizontal trail)
  const [activeMilestoneIndex, setActiveMilestoneIndex] = useState<number>(0);

  // Active topic/lesson (when user clicks a concept row or is reading a lesson)
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  const fetchRoadmap = async () => {
    try {
      const res = await fetch(`/api/roadmaps/${slug}`);
      const json = await res.json();

      if (res.status === 401 || json.requireLogin) {
        setRequireLogin(true);
        setLoading(false);
        return;
      }

      if (!res.ok) throw new Error(json.error || "Roadmap not found");
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
      <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <div className="h-9 w-9 border-3 border-[var(--periwinkle-deep)] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-[var(--ink-soft)] font-semibold">Loading trail...</p>
        </div>
      </div>
    );
  }

  // 🔒 AUTH GATE: Unauthenticated visitors cannot view roadmaps!
  if (requireLogin) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="max-w-md w-full p-8 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-xl text-center">
            <div className="inline-flex h-14 w-14 rounded-2xl bg-[#EDEFFA] dark:bg-[var(--line)] text-[var(--periwinkle-deep)] items-center justify-center mb-4">
              <Lock className="h-6 w-6" />
            </div>

            <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full tag-peach block w-fit mx-auto mb-2">
              Member-Only Learning Trail
            </span>

            <h1 className="text-2xl font-bold font-display text-[var(--ink)] tracking-tight">
              Sign In to View Roadmap
            </h1>

            <p className="text-xs text-[var(--ink-soft)] mt-2 leading-relaxed font-medium">
              This interactive roadmap and progress tracker is reserved for members.
              Please log in or create a free account to unlock the full trail.
            </p>

            <div className="mt-6 space-y-2.5">
              <Link
                href="/login"
                className="pill-btn w-full py-3 px-4 text-xs font-bold flex items-center justify-center gap-2"
              >
                Sign In
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/register"
                className="ghost-pill w-full py-3 px-4 text-xs font-bold flex items-center justify-center"
              >
                Create Free Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-4">
          <h1 className="text-2xl font-display font-bold text-[var(--ink)]">Roadmap Not Found</h1>
          <p className="text-sm text-[var(--ink-soft)] max-w-md">
            The roadmap &quot;{slug}&quot; doesn&apos;t exist yet or has been removed.
          </p>
          <Link href="/" className="pill-btn text-xs">
            &larr; Back to all roadmaps
          </Link>
        </div>
      </div>
    );
  }

  const { subject, milestones, stats } = data;
  const currentMilestone = milestones[activeMilestoneIndex] || milestones[0];

  // Find currently selected topic if any
  const currentTopic = currentMilestone?.topics?.find((t) => t.id === selectedTopicId);
  const currentTopicIndex = currentMilestone?.topics?.findIndex((t) => t.id === selectedTopicId);

  // Parse resources if needed
  const parseResources = (resources: any): TopicResource[] => {
    if (!resources) return [];
    if (Array.isArray(resources)) return resources;
    try {
      return JSON.parse(resources);
    } catch {
      return [];
    }
  };

  // ==========================================
  // VIEW 2: LESSON / CONCEPT READER (Document 2)
  // ==========================================
  if (currentTopic && selectedTopicId) {
    const lesson: LessonData = getLessonContent(currentTopic.title, currentTopic.description);
    const resourcesList = parseResources(currentTopic.resources);

    // Prev / Next topic navigation
    const allMilestoneTopics = currentMilestone.topics;
    const prevTopic = currentTopicIndex > 0 ? allMilestoneTopics[currentTopicIndex - 1] : null;
    const nextTopic =
      currentTopicIndex < allMilestoneTopics.length - 1
        ? allMilestoneTopics[currentTopicIndex + 1]
        : null;

    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col">
        <Navbar />

        <div className="shell">
          {/* Breadcrumb / back-to-trail */}
          <div className="crumb">
            <button
              onClick={() => setSelectedTopicId(null)}
              className="back-chip cursor-pointer hover:border-[var(--periwinkle)] transition"
            >
              &larr; Back to trail
            </button>
            <span className="sep">/</span>
            <span>{subject.title}</span>
            <span className="sep">/</span>
            <span>
              Step {currentMilestone.order < 10 ? `0${currentMilestone.order}` : currentMilestone.order} ·{" "}
              {currentMilestone.title}
            </span>
            <span className="sep">/</span>
            <span className="current">{currentTopic.title}</span>
          </div>

          {/* Mini trail progress within the step */}
          <div className="mini-trail">
            {allMilestoneTopics.map((topic, i) => (
              <div
                key={topic.id}
                onClick={() => setSelectedTopicId(topic.id)}
                className={`mini-node cursor-pointer ${
                  topic.isCompleted ? "done" : topic.id === currentTopic.id ? "active" : ""
                }`}
              >
                <div className="mini-dot">
                  {topic.isCompleted ? "✓" : i + 1}
                </div>
                <div className="mini-label">{topic.title.split(" ")[0]}</div>
              </div>
            ))}
          </div>

          {/* Lesson Header */}
          <div className="lesson-eyebrow">
            <span className="step-num">
              Concept {currentTopicIndex + 1} of {allMilestoneTopics.length}
            </span>
            <span className="step-level">{currentMilestone.level}</span>
            <span className="time-est">🕐 {lesson.timeEst}</span>
          </div>
          <h1 className="lesson-title">{currentTopic.title}</h1>
          <p className="lesson-intro">{lesson.intro}</p>

          {/* Body layout: content + sticky sidebar */}
          <div className="lesson-grid">
            <div className="lesson-main">
              {lesson.sections.map((sec, idx) => (
                <div key={idx} className="content-block">
                  <h2>{sec.title}</h2>
                  {sec.paragraphs.map((p, pIdx) => (
                    <p key={pIdx}>{p}</p>
                  ))}
                  {sec.code && (
                    <div className="code-block">
                      {sec.code.comment && <div className="comment">{sec.code.comment}</div>}
                      <div className="cmd">{sec.code.cmd}</div>
                      {sec.code.result && <div className="result">{sec.code.result}</div>}
                    </div>
                  )}
                  {sec.mutedNote && <p className="muted">{sec.mutedNote}</p>}
                </div>
              ))}

              {/* Callout */}
              <div className="callout">
                <span className="emoji">{lesson.callout.emoji}</span>
                <p>
                  <strong>{lesson.callout.strong}</strong> {lesson.callout.text}
                </p>
              </div>
            </div>

            {/* Sidebar */}
            <div className="sidebar">
              <div className="side-card">
                <h4>RESOURCES</h4>
                {resourcesList && resourcesList.length > 0 ? (
                  resourcesList.map((r, rIdx) => (
                    <a
                      key={rIdx}
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="resource-row group"
                    >
                      <span
                        className={`r-icon ${
                          r.type === "video" ? "video" : r.type === "doc" ? "doc" : ""
                        }`}
                      >
                        {r.type === "video" ? "▶" : r.type === "tutorial" ? "💻" : "📄"}
                      </span>
                      <span className="truncate group-hover:text-[var(--periwinkle-deep)]">
                        {r.title}
                      </span>
                    </a>
                  ))
                ) : (
                  <div className="text-xs text-[var(--ink-soft)] py-2">
                    Official documentation and guide links will appear here.
                  </div>
                )}
              </div>

              {/* Mark Done Button */}
              <button
                onClick={() => handleToggleComplete(currentTopic.id, !currentTopic.isCompleted)}
                className={`mark-done-btn ${currentTopic.isCompleted ? "completed" : ""}`}
              >
                {currentTopic.isCompleted ? "Completed ✓ (Click to undo)" : "Mark as complete ✓"}
              </button>

              {/* Up Next Card */}
              {nextTopic && (
                <div
                  onClick={() => setSelectedTopicId(nextTopic.id)}
                  className="up-next-card cursor-pointer hover:border-[var(--periwinkle)] transition"
                >
                  <span className="tag">Up next</span>
                  <h5>{nextTopic.title}</h5>
                  <p className="line-clamp-2">{nextTopic.description || "Continue to next concept"}</p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Nav Bar */}
          <div className="lesson-footer">
            {prevTopic ? (
              <button
                onClick={() => setSelectedTopicId(prevTopic.id)}
                className="foot-btn"
              >
                <span className="arrow-circle">←</span> {prevTopic.title}
              </button>
            ) : (
              <div />
            )}

            {nextTopic ? (
              <button
                onClick={() => setSelectedTopicId(nextTopic.id)}
                className="foot-btn next"
              >
                {nextTopic.title} <span className="arrow-circle">→</span>
              </button>
            ) : (
              <button
                onClick={() => setSelectedTopicId(null)}
                className="foot-btn next"
              >
                Finish Milestone <span className="arrow-circle">✓</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 1: ROADMAP SHELL & TRAIL (Document 1)
  // ==========================================
  const completedInActiveMilestone =
    currentMilestone?.topics?.filter((t) => t.isCompleted).length || 0;
  const totalInActiveMilestone = currentMilestone?.topics?.length || 0;

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col">
      <Navbar />

      <section className="roadmap-shell">
        {/* Roadmap Header */}
        <div className="roadmap-header">
          <div>
            <h2>
              {subject.title} <span className="level-tag">{subject.category}</span>
            </h2>
            <p>{subject.description}</p>
          </div>
          <div className="progress-box">
            <span className="num">{stats.progressPercent}%</span>{" "}
            <span className="label">
              · {stats.completedCount} of {stats.totalTopics} waypoints
            </span>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${Math.max(stats.progressPercent, 4)}%` }}
              />
            </div>
          </div>
        </div>

        {/* The Horizontal Trail */}
        <div className="trail-wrap">
          <svg className="trail-svg" viewBox="0 0 1000 60" preserveAspectRatio="none">
            <line
              x1="55"
              y1="26"
              x2="945"
              y2="26"
              stroke="var(--line)"
              strokeWidth="3"
              strokeDasharray="1 10"
              strokeLinecap="round"
            />
          </svg>

          <div className="trail-nodes">
            {milestones.map((m, idx) => {
              const isDone = m.topics?.length > 0 && m.topics.every((t) => t.isCompleted);
              const isActive = idx === activeMilestoneIndex;

              return (
                <button
                  key={m.id}
                  onClick={() => setActiveMilestoneIndex(idx)}
                  className={`trail-node ${isDone ? "done" : ""} ${isActive ? "active" : ""}`}
                >
                  <div className="node-circle">
                    {isDone ? "✓" : m.order}
                  </div>
                  <div className="node-label">
                    {m.title.split(" ")[0]}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step Detail Card */}
        {currentMilestone && (
          <div className="step-card">
            <div className="step-card-top">
              <div className="step-eyebrow">
                <span className="step-num">
                  Step {currentMilestone.order < 10 ? `0${currentMilestone.order}` : currentMilestone.order}
                </span>
                <span className="step-level">{currentMilestone.level}</span>
              </div>
              <div
                className="expand-btn"
                title="Active Milestone"
              >
                ⤢
              </div>
            </div>

            <h3>{currentMilestone.title}</h3>
            {currentMilestone.description && (
              <p className="desc">{currentMilestone.description}</p>
            )}

            <div className="concepts-head">
              <span className="label">CONCEPTS TO LEARN</span>
              <span className="count">
                {completedInActiveMilestone} / {totalInActiveMilestone} done
              </span>
            </div>

            <div className="space-y-2">
              {currentMilestone.topics?.map((topic) => (
                <div
                  key={topic.id}
                  className={`concept-row ${topic.isCompleted ? "done" : "todo"}`}
                >
                  <div
                    onClick={() => handleToggleComplete(topic.id, !topic.isCompleted)}
                    className="concept-left flex-1 cursor-pointer"
                    title={topic.isCompleted ? "Mark as incomplete" : "Mark as complete"}
                  >
                    <span className="check">
                      {topic.isCompleted ? "✓" : ""}
                    </span>
                    <span className="name">{topic.title}</span>
                  </div>

                  <button
                    onClick={() => setSelectedTopicId(topic.id)}
                    className="chev cursor-pointer hover:border-[var(--periwinkle)] transition"
                    title="Open lesson and documentation"
                  >
                    &rarr;
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
