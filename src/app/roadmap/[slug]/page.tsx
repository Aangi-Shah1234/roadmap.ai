"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import CertificateModal from "@/components/CertificateModal";
import {
  Lock,
  ArrowRight,
  ExternalLink,
  Award,
  Clock,
  AlertCircle,
  FileText,
  Terminal,
  Play,
} from "lucide-react";
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
    email?: string;
    role: "admin" | "learner";
  } | null;
}

const LOCAL_PROGRESS_KEY = "roadmap_local_progress_v1";

function getLocalProgress(userKey: string): { added: string[]; removed: string[] } {
  if (typeof window === "undefined") return { added: [], removed: [] };
  try {
    const raw = localStorage.getItem(LOCAL_PROGRESS_KEY);
    if (!raw) return { added: [], removed: [] };
    const parsed = JSON.parse(raw);
    return parsed[userKey] || { added: [], removed: [] };
  } catch {
    return { added: [], removed: [] };
  }
}

function setLocalProgress(userKey: string, topicId: string, completed: boolean) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(LOCAL_PROGRESS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    const current = parsed[userKey] || { added: [], removed: [] };
    const addedSet = new Set<string>(current.added || []);
    const removedSet = new Set<string>(current.removed || []);

    if (completed) {
      addedSet.add(topicId);
      removedSet.delete(topicId);
    } else {
      addedSet.delete(topicId);
      removedSet.add(topicId);
    }

    parsed[userKey] = {
      added: Array.from(addedSet),
      removed: Array.from(removedSet),
    };
    localStorage.setItem(LOCAL_PROGRESS_KEY, JSON.stringify(parsed));
  } catch {
    // ignore storage errors
  }
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
  const [showCertModal, setShowCertModal] = useState(false);

  const applyLocalProgressToData = (raw: RoadmapData): RoadmapData => {
    const userKey = raw.currentUser?.email || raw.currentUser?.userId || "default";
    const local = getLocalProgress(userKey);
    if (local.added.length === 0 && local.removed.length === 0) return raw;

    const addedSet = new Set(local.added);
    const removedSet = new Set(local.removed);

    const updatedMilestones = raw.milestones.map((m) => {
      const updatedTopics = (m.topics || []).map((t) => {
        let isCompleted = t.isCompleted;
        if (addedSet.has(t.id)) isCompleted = true;
        if (removedSet.has(t.id)) isCompleted = false;
        return { ...t, isCompleted };
      });
      const isCompleted =
        updatedTopics.length > 0 && updatedTopics.every((t) => t.isCompleted);
      return { ...m, topics: updatedTopics, isCompleted };
    });

    const allTopics = updatedMilestones.flatMap((m) => m.topics);
    const totalTopics = allTopics.length;
    const completedCount = allTopics.filter((t) => t.isCompleted).length;
    const progressPercent =
      totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

    return {
      ...raw,
      milestones: updatedMilestones,
      stats: {
        ...raw.stats,
        totalTopics,
        completedCount,
        progressPercent,
      },
    };
  };

  const fetchRoadmap = async () => {
    try {
      const res = await fetch(`/api/roadmaps/${slug}`, { cache: "no-store" });
      const json = await res.json();

      if (res.status === 401 || json.requireLogin) {
        setRequireLogin(true);
        setLoading(false);
        return;
      }

      if (!res.ok) throw new Error(json.error || "Roadmap not found");
      setData(applyLocalProgressToData(json));
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
    const userKey = data?.currentUser?.email || data?.currentUser?.userId || "default";
    setLocalProgress(userKey, topicId, newState);

    // 1. Instant optimistic UI update
    setData((prev) => {
      if (!prev) return prev;
      const updatedMilestones = prev.milestones.map((m) => {
        const updatedTopics = (m.topics || []).map((t) =>
          t.id === topicId ? { ...t, isCompleted: newState } : t
        );
        const isCompleted =
          updatedTopics.length > 0 && updatedTopics.every((t) => t.isCompleted);
        return { ...m, topics: updatedTopics, isCompleted };
      });

      const allTopics = updatedMilestones.flatMap((m) => m.topics);
      const totalTopics = allTopics.length;
      const completedCount = allTopics.filter((t) => t.isCompleted).length;
      const progressPercent =
        totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

      return {
        ...prev,
        milestones: updatedMilestones,
        stats: {
          ...prev.stats,
          totalTopics,
          completedCount,
          progressPercent,
        },
      };
    });

    // 2. Persist to server (cookie + SQLite)
    try {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId, completed: newState }),
      });
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
            <span className="time-est inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {lesson.timeEst}
            </span>
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
                <AlertCircle className="h-4 w-4 text-[var(--peach-deep)] shrink-0 mt-0.5" />
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
                        {r.type === "video" ? (
                          <Play className="h-3.5 w-3.5" />
                        ) : r.type === "tutorial" ? (
                          <Terminal className="h-3.5 w-3.5" />
                        ) : (
                          <FileText className="h-3.5 w-3.5" />
                        )}
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
                type="button"
                onClick={() => handleToggleComplete(currentTopic.id, !currentTopic.isCompleted)}
                className={`mark-done-btn cursor-pointer ${currentTopic.isCompleted ? "completed" : ""}`}
              >
                {currentTopic.isCompleted ? "Completed (Click to undo)" : "Mark as complete"}
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
            {stats.progressPercent === 100 ? (
              <button
                onClick={() => setShowCertModal(true)}
                className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold text-[var(--sage-deep)] hover:underline cursor-pointer"
              >
                <Award className="h-3.5 w-3.5" />
                Claim Verified Certificate
              </button>
            ) : (
              <div
                className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-[var(--ink-soft)] opacity-75 select-none"
                title="Complete all waypoints (100%) to unlock your Verified Certificate"
              >
                <Lock className="h-3.5 w-3.5" />
                Complete 100% to unlock certificate
              </div>
            )}
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

      <CertificateModal
        isOpen={showCertModal && stats.progressPercent === 100}
        onClose={() => setShowCertModal(false)}
        userName={data.currentUser?.name || "Engineering Learner"}
        trackTitle={subject.title}
        category={subject.category}
        milestonesCount={stats.totalMilestones}
        topicsCount={stats.totalTopics}
        completedCount={stats.completedCount}
        progressPercent={stats.progressPercent}
      />
    </div>
  );
}
