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
  CheckCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  BookOpen,
  Layers,
  X,
  HelpCircle,
  Sparkles,
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

  // Cockpit Studio interactive state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<number | null>(null);
  const [quizSelectedOption, setQuizSelectedOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

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

  // Flatten all topics across all milestones for seamless continuous traversal:
  const allTopicsFlat = milestones.flatMap((m, mIdx) =>
    (m.topics || []).map((t, tIdx) => ({
      ...t,
      milestoneIndex: mIdx,
      milestoneOrder: m.order,
      milestoneTitle: m.title,
      milestoneLevel: m.level,
      topicIndexInMilestone: tIdx,
      totalTopicsInMilestone: m.topics.length,
    }))
  );

  const currentFlatIndex = allTopicsFlat.findIndex((t) => t.id === selectedTopicId);
  const currentFlatTopic = currentFlatIndex !== -1 ? allTopicsFlat[currentFlatIndex] : null;

  const currentMilestone =
    currentFlatTopic != null
      ? milestones[currentFlatTopic.milestoneIndex]
      : milestones[activeMilestoneIndex] || milestones[0];

  const currentTopic =
    currentFlatTopic != null
      ? currentMilestone?.topics?.find((t) => t.id === selectedTopicId) || null
      : null;

  // Navigation targets across boundaries
  const prevFlatTopic = currentFlatIndex > 0 ? allTopicsFlat[currentFlatIndex - 1] : null;
  const nextFlatTopic =
    currentFlatIndex !== -1 && currentFlatIndex < allTopicsFlat.length - 1
      ? allTopicsFlat[currentFlatIndex + 1]
      : null;

  const isNextMilestone =
    nextFlatTopic != null &&
    currentFlatTopic != null &&
    nextFlatTopic.milestoneIndex !== currentFlatTopic.milestoneIndex;

  const handleGoToTopic = (topicId: string, milestoneIdx: number) => {
    setSelectedTopicId(topicId);
    setActiveMilestoneIndex(milestoneIdx);
    setQuizSelectedOption(null);
    setQuizSubmitted(false);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleCopyCode = (text: string, idx: number) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedCodeIdx(idx);
      setTimeout(() => setCopiedCodeIdx(null), 2000);
    }
  };

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

  const getQuickQuiz = (topicTitle: string) => {
    const t = (topicTitle || "").toLowerCase();
    if (t.includes("permission") || t.includes("chmod") || t.includes("chown")) {
      return {
        question: "Which command grants the owner execute permission on script.sh?",
        options: ["chmod u+x script.sh", "chmod 700 script.sh", "chown +x script.sh", "chmod 777 script.sh"],
        correct: 0,
        explanation: "'u+x' specifically targets the user (owner) without altering group or world permissions.",
      };
    }
    if (t.includes("systemd") || t.includes("service") || t.includes("process")) {
      return {
        question: "Which command reloads systemd after editing a .service unit file?",
        options: ["systemctl restart daemon", "systemctl daemon-reload", "service reload-all", "init 6"],
        correct: 1,
        explanation: "'systemctl daemon-reload' tells systemd to scan unit paths and pick up modified definitions.",
      };
    }
    if (t.includes("bash") || t.includes("shell") || t.includes("script")) {
      return {
        question: "What does the shebang '#!/bin/bash' at the top of a script specify?",
        options: [
          "Sets file execute permissions",
          "Tells the OS which interpreter executes the script",
          "Spawns a background worker process",
          "Encrypts script environment variables",
        ],
        correct: 1,
        explanation: "The program loader uses the shebang directive to launch the appropriate execution binary.",
      };
    }
    if (t.includes("network") || t.includes("dns") || t.includes("ip") || t.includes("port")) {
      return {
        question: "Which DNS record type maps a domain name directly to an IPv4 address?",
        options: ["CNAME record", "A record", "MX record", "TXT record"],
        correct: 1,
        explanation: "An 'A' (Address) record maps a fully qualified hostname to an IPv4 address.",
      };
    }
    if (t.includes("docker") || t.includes("container") || t.includes("image")) {
      return {
        question: "What is the primary difference between a Docker image and a Docker container?",
        options: [
          "Images are immutable templates; containers are running instances",
          "Containers are compiled binaries; images are script files",
          "Images run on Linux; containers run on any OS",
          "They are synonymous terms in cloud-native systems",
        ],
        correct: 0,
        explanation: "A container is an isolated execution namespace instantiated from an immutable image layer.",
      };
    }
    if (t.includes("git") || t.includes("branch") || t.includes("commit")) {
      return {
        question: "Which command creates and switches to a new Git branch in one step?",
        options: ["git branch -new", "git checkout -b <name>", "git switch --all", "git merge --branch"],
        correct: 1,
        explanation: "'git checkout -b <name>' (or 'git switch -c <name>') creates the ref and checks it out immediately.",
      };
    }
    return {
      question: `What is the architectural objective when mastering ${topicTitle}?`,
      options: [
        "Mastering core primitives and production reliability patterns",
        "Memorizing syntactical options without end-to-end testing",
        "Avoiding automated testing pipelines",
        "Hardcoding configuration parameters into source files",
      ],
      correct: 0,
      explanation: "Deep conceptual mastery allows engineers to diagnose bottlenecks and architect resilient systems.",
    };
  };

  // ==========================================
  // VIEW 2: COCKPIT DEVELOPER STUDIO (Template B)
  // ==========================================
  if (currentTopic && selectedTopicId && currentFlatTopic) {
    const lesson: LessonData = getLessonContent(currentTopic.title, currentTopic.description);
    const parsedResourcesList = parseResources(currentTopic.resources);
    const defaultResources: TopicResource[] = [
      {
        title: `${currentTopic.title} Documentation`,
        url: `https://www.google.com/search?q=${encodeURIComponent(currentTopic.title + " official documentation")}`,
        type: "doc",
      },
      {
        title: `${currentTopic.title} Video Guide`,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(currentTopic.title + " tutorial")}`,
        type: "video",
      },
    ];
    const resourcesList = parsedResourcesList && parsedResourcesList.length > 0 ? parsedResourcesList : defaultResources;
    const quiz = getQuickQuiz(currentTopic.title);

    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col selection:bg-[var(--periwinkle)]/30">
        <Navbar />

        {/* Mobile Slide-over Curriculum Drawer */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="relative w-4/5 max-w-sm bg-[var(--surface)] border-r border-[var(--line)] p-4 flex flex-col h-full shadow-2xl z-10 overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--line)] mb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--periwinkle-deep)]">
                    Curriculum Explorer
                  </span>
                  <h3 className="text-sm font-bold text-[var(--ink)]">{subject.title}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 rounded-lg hover:bg-[var(--bg)] text-[var(--ink-soft)] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {milestones.map((m, mIdx) => {
                  const isCurrentMilestone = currentFlatTopic.milestoneIndex === mIdx;
                  const mCompleted = (m.topics || []).filter((t) => t.isCompleted).length;
                  const mTotal = m.topics?.length || 0;
                  const isAllDone = mTotal > 0 && mCompleted === mTotal;

                  return (
                    <div
                      key={m.id}
                      className="rounded-xl border border-[var(--line)] bg-[var(--bg)]/40 overflow-hidden"
                    >
                      <div className="px-3 py-2 flex items-center justify-between bg-[var(--surface)] border-b border-[var(--line)]/50">
                        <span className="text-xs font-bold text-[var(--ink)] truncate">
                          Step {m.order}: {m.title}
                        </span>
                        <span className="text-[10px] text-[var(--ink-soft)] font-medium">
                          {mCompleted}/{mTotal}
                        </span>
                      </div>
                      <div className="p-1 space-y-0.5">
                        {(m.topics || []).map((t) => {
                          const isActive = t.id === currentTopic.id;
                          return (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => {
                                handleGoToTopic(t.id, mIdx);
                                setSidebarOpen(false);
                              }}
                              className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center gap-2 text-xs transition cursor-pointer ${
                                isActive
                                  ? "bg-[var(--periwinkle-deep)] text-white font-semibold"
                                  : "text-[var(--ink-soft)] hover:bg-[var(--surface)]"
                              }`}
                            >
                              <span className="shrink-0">{t.isCompleted ? "✓" : "•"}</span>
                              <span className="truncate">{t.title}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Cockpit Sub-Navbar / Breadcrumb & Status Bar */}
        <div className="w-full bg-[var(--surface)]/80 backdrop-blur-md border-b border-[var(--line)] sticky top-0 z-30 px-4 sm:px-8 py-2.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={() => setSelectedTopicId(null)}
                className="px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--bg)] text-xs font-semibold text-[var(--ink-soft)] hover:text-[var(--ink)] flex items-center gap-1.5 transition cursor-pointer shrink-0 shadow-xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Back to Trail</span>
              </button>

              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-xs font-semibold text-[var(--ink)] flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Curriculum</span>
              </button>

              <div className="hidden md:flex items-center gap-1.5 text-xs text-[var(--ink-soft)] min-w-0 truncate">
                <span className="truncate">{subject.title}</span>
                <span>/</span>
                <span className="truncate">Step {currentMilestone.order < 10 ? `0${currentMilestone.order}` : currentMilestone.order}</span>
                <span>/</span>
                <span className="text-[var(--ink)] font-bold truncate">{currentTopic.title}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-[var(--ink-soft)]">
                <span>Waypoint {currentFlatIndex + 1} of {allTopicsFlat.length}</span>
                <div className="w-20 bg-[var(--line)] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[var(--periwinkle-deep)] h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(stats.progressPercent, 4)}%` }}
                  />
                </div>
                <span className="text-[var(--periwinkle-deep)] font-bold">{stats.progressPercent}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cockpit 3-Column Studio Layout */}
        <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 gap-6 relative">
          {/* Left Column: Persistent Curriculum Sidebar (Desktop) */}
          <aside className="hidden lg:flex flex-col w-72 shrink-0 bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-4 h-[calc(100vh-130px)] sticky top-16 overflow-y-auto shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)] mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--periwinkle-deep)]">
                  Curriculum Tree
                </span>
                <h3 className="text-xs font-bold text-[var(--ink)] truncate max-w-[170px]">{subject.title}</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--bg)] text-[var(--ink-soft)] border border-[var(--line)]">
                {stats.progressPercent}%
              </span>
            </div>

            <div className="space-y-3">
              {milestones.map((m, mIdx) => {
                const isCurrentMilestone = currentFlatTopic.milestoneIndex === mIdx;
                const mCompleted = (m.topics || []).filter((t) => t.isCompleted).length;
                const mTotal = m.topics?.length || 0;
                const isAllDone = mTotal > 0 && mCompleted === mTotal;

                return (
                  <div
                    key={m.id}
                    className={`rounded-xl border transition overflow-hidden ${
                      isCurrentMilestone
                        ? "border-[var(--periwinkle)]/50 bg-[var(--periwinkle)]/5"
                        : "border-[var(--line)] bg-[var(--bg)]/30"
                    }`}
                  >
                    <div className="px-3 py-2 flex items-center justify-between bg-[var(--surface)] border-b border-[var(--line)]/50">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                            isAllDone
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                              : isCurrentMilestone
                              ? "bg-[var(--periwinkle-deep)] text-white"
                              : "bg-[var(--line)] text-[var(--ink-soft)]"
                          }`}
                        >
                          {isAllDone ? "✓" : m.order}
                        </span>
                        <span className="text-xs font-bold text-[var(--ink)] truncate">
                          {m.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-[var(--ink-soft)] font-medium shrink-0">
                        {mCompleted}/{mTotal}
                      </span>
                    </div>

                    <div className="p-1 space-y-0.5">
                      {(m.topics || []).map((t) => {
                        const isActive = t.id === currentTopic.id;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => handleGoToTopic(t.id, mIdx)}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 text-xs transition cursor-pointer ${
                              isActive
                                ? "bg-[var(--periwinkle-deep)] text-white font-semibold shadow-xs"
                                : "text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-[var(--surface)]"
                            }`}
                          >
                            <span
                              className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] shrink-0 ${
                                t.isCompleted
                                  ? isActive
                                    ? "bg-white/20 text-white font-bold"
                                    : "text-emerald-500 font-bold"
                                  : "text-[var(--ink-soft)]"
                              }`}
                            >
                              {t.isCompleted ? "✓" : "•"}
                            </span>
                            <span className="truncate">{t.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>

          {/* Center Column: Deep Reading & Code Studio */}
          <main className="flex-1 min-w-0 pb-36">
            {/* Topic Metadata Eyebrow */}
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-full font-bold bg-[var(--line)] text-[var(--ink-soft)] text-[11px]">
                  Concept {currentFlatTopic.topicIndexInMilestone + 1} of {currentFlatTopic.totalTopicsInMilestone}
                </span>
                <span className="px-2.5 py-1 rounded-full font-bold bg-[#FBEADA] text-[var(--peach-deep)] dark:bg-[rgba(242,196,160,0.15)] text-[11px]">
                  {currentMilestone.level}
                </span>
                <span className="inline-flex items-center gap-1 text-[var(--ink-soft)] font-medium text-[11px]">
                  <Clock className="w-3.5 h-3.5" />
                  {lesson.timeEst}
                </span>
              </div>
            </div>

            {/* Lesson Title & Intro */}
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[var(--ink)] tracking-tight mb-3">
              {currentTopic.title}
            </h1>
            <p className="text-sm sm:text-base text-[var(--ink-soft)] leading-relaxed mb-8">
              {lesson.intro}
            </p>

            {/* Lesson Sections & Code Snippets */}
            <div className="space-y-6">
              {lesson.sections.map((sec, sIdx) => (
                <div
                  key={sIdx}
                  className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 sm:p-6 shadow-xs"
                >
                  <h2 className="font-display text-xl font-bold text-[var(--ink)] mb-3">
                    {sec.title}
                  </h2>
                  <div className="space-y-3 text-sm text-[var(--ink-soft)] leading-relaxed mb-4">
                    {sec.paragraphs.map((p, pIdx) => (
                      <p key={pIdx}>{p}</p>
                    ))}
                  </div>

                  {sec.code && (
                    <div className="rounded-xl overflow-hidden border border-[#2d334e] bg-[#141622] my-4 shadow-md">
                      {/* macOS Terminal Title Bar */}
                      <div className="px-4 py-2.5 bg-[#1b1e2e] border-b border-[#2d334e] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                          <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                          <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
                          <span className="ml-2 font-mono text-[11px] text-[#9197B8] font-medium">
                            {sec.code.comment ? sec.code.comment.replace(/^#\s*/, "") : "bash terminal"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(sec.code!.cmd, sIdx)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-medium text-[#9197B8] hover:text-white bg-[#25293d] hover:bg-[#313752] transition cursor-pointer"
                        >
                          {copiedCodeIdx === sIdx ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Code Command */}
                      <div className="p-4 font-mono text-xs sm:text-sm text-[#8FA3E3] leading-relaxed overflow-x-auto whitespace-pre">
                        {sec.code.cmd}
                      </div>

                      {/* Execution Output */}
                      {sec.code.result && (
                        <div className="px-4 py-2.5 bg-[#0f111a] border-t border-[#23273a] font-mono text-xs text-emerald-400/90 whitespace-pre overflow-x-auto">
                          {sec.code.result}
                        </div>
                      )}
                    </div>
                  )}

                  {sec.mutedNote && (
                    <p className="text-xs text-[var(--ink-soft)] bg-[var(--bg)] p-3 rounded-lg border-l-2 border-[var(--periwinkle)] italic">
                      {sec.mutedNote}
                    </p>
                  )}
                </div>
              ))}

              {/* Callout / Pro Tip */}
              <div className="bg-[var(--peach)]/10 border-l-4 border-[var(--peach-deep)] p-5 rounded-r-2xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[var(--peach-deep)] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-[var(--ink)] mb-1">
                    {lesson.callout.strong}
                  </h4>
                  <p className="text-xs sm:text-sm text-[var(--ink-soft)] leading-relaxed">
                    {lesson.callout.text}
                  </p>
                </div>
              </div>
            </div>
          </main>

          {/* Right Column: Knowledge Studio & Resources (Desktop XL) */}
          <aside className="hidden xl:flex flex-col w-80 shrink-0 gap-6 h-[calc(100vh-130px)] sticky top-16 overflow-y-auto">
            {/* Quick Knowledge Check Widget */}
            <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--periwinkle-deep)] uppercase tracking-wider mb-2">
                <HelpCircle className="w-4 h-4" />
                <span>Knowledge Check</span>
              </div>
              <p className="text-xs font-semibold text-[var(--ink)] mb-3 leading-snug">
                {quiz.question}
              </p>

              <div className="space-y-2 mb-4">
                {quiz.options.map((opt, oIdx) => {
                  const isSelected = quizSelectedOption === oIdx;
                  const isCorrect = oIdx === quiz.correct;
                  let btnStyle = "border-[var(--line)] bg-[var(--bg)] text-[var(--ink-soft)] hover:bg-[var(--surface)]";

                  if (quizSubmitted) {
                    if (isCorrect) {
                      btnStyle = "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold";
                    } else if (isSelected && !isCorrect) {
                      btnStyle = "border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400";
                    }
                  } else if (isSelected) {
                    btnStyle = "border-[var(--periwinkle-deep)] bg-[var(--periwinkle)]/10 text-[var(--ink)] font-bold";
                  }

                  return (
                    <button
                      key={oIdx}
                      type="button"
                      onClick={() => {
                        setQuizSelectedOption(oIdx);
                        setQuizSubmitted(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl border text-xs transition cursor-pointer flex items-center gap-2.5 ${btnStyle}`}
                    >
                      <span
                        className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] shrink-0 ${
                          isSelected
                            ? "border-[var(--periwinkle-deep)] bg-[var(--periwinkle-deep)] text-white"
                            : "border-[var(--ink-soft)]/40"
                        }`}
                      >
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span className="leading-snug">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {!quizSubmitted ? (
                <button
                  type="button"
                  disabled={quizSelectedOption === null}
                  onClick={() => setQuizSubmitted(true)}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition ${
                    quizSelectedOption !== null
                      ? "bg-[var(--ink)] hover:bg-[var(--periwinkle-deep)] text-white cursor-pointer"
                      : "bg-[var(--line)] text-[var(--ink-soft)] cursor-not-allowed opacity-60"
                  }`}
                >
                  Check Answer
                </button>
              ) : (
                <div
                  className={`p-3 rounded-xl text-xs ${
                    quizSelectedOption === quiz.correct
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                      : "bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30"
                  }`}
                >
                  <div className="font-bold mb-1">
                    {quizSelectedOption === quiz.correct ? "✓ Correct!" : "Notice:"}
                  </div>
                  <p className="leading-relaxed">{quiz.explanation}</p>
                </div>
              )}
            </div>

            {/* Curated Resources */}
            <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--ink-soft)] uppercase tracking-wider mb-3">
                <BookOpen className="w-4 h-4 text-[var(--periwinkle)]" />
                <span>Curated Resources</span>
              </div>

              <div className="space-y-2">
                {resourcesList.map((r, rIdx) => (
                  <a
                    key={rIdx}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-2.5 p-2 rounded-xl hover:bg-[var(--bg)] transition border border-transparent hover:border-[var(--line)]"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[var(--bg)] group-hover:bg-[var(--surface)] border border-[var(--line)] flex items-center justify-center shrink-0 mt-0.5 text-[var(--ink-soft)] group-hover:text-[var(--periwinkle-deep)]">
                      {r.type === "video" ? (
                        <Play className="w-3.5 h-3.5" />
                      ) : r.type === "tutorial" ? (
                        <Terminal className="w-3.5 h-3.5" />
                      ) : (
                        <FileText className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-[var(--ink)] group-hover:text-[var(--periwinkle-deep)] truncate flex items-center gap-1">
                        <span className="truncate">{r.title}</span>
                        <ExternalLink className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-100 transition" />
                      </div>
                      <span className="text-[10px] text-[var(--ink-soft)] uppercase font-mono tracking-wider">
                        {r.type || "Documentation"}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {/* Floating Cockpit Command Dock (ALWAYS Visible Next Action!) */}
        <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-4xl bg-[var(--surface)]/95 backdrop-blur-md border border-[var(--line)] shadow-2xl rounded-2xl p-2.5 sm:px-6 sm:py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Left: Previous Concept */}
          <div className="w-full sm:w-auto flex justify-start order-2 sm:order-1">
            {prevFlatTopic ? (
              <button
                type="button"
                onClick={() => handleGoToTopic(prevFlatTopic.id, prevFlatTopic.milestoneIndex)}
                className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-semibold text-[var(--ink-soft)] hover:text-[var(--ink)] flex items-center justify-center gap-1.5 border border-[var(--line)] rounded-xl bg-[var(--surface)] hover:bg-[var(--bg)] transition cursor-pointer shadow-xs"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev Concept</span>
              </button>
            ) : (
              <div className="hidden sm:block w-24" />
            )}
          </div>

          {/* Center: Mark as Complete */}
          <div className="w-full sm:w-auto flex justify-center order-1 sm:order-2">
            <button
              type="button"
              onClick={() => handleToggleComplete(currentTopic.id, !currentTopic.isCompleted)}
              className={`w-full sm:w-auto px-7 py-2.5 sm:px-8 sm:py-3 rounded-xl font-bold text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm ${
                currentTopic.isCompleted
                  ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/25"
                  : "bg-[var(--periwinkle-deep)] hover:bg-[var(--periwinkle)] shadow-indigo-500/25"
              }`}
            >
              {currentTopic.isCompleted ? (
                <>
                  <CheckCheck className="w-4 h-4 text-white" />
                  <span>Completed (Click to undo)</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Mark as Complete</span>
                </>
              )}
            </button>
          </div>

          {/* Right: CONTINUOUS NEXT ACTION (Never missing!) */}
          <div className="w-full sm:w-auto flex justify-end order-3">
            {nextFlatTopic ? (
              <button
                type="button"
                onClick={() => handleGoToTopic(nextFlatTopic.id, nextFlatTopic.milestoneIndex)}
                className={`w-full sm:w-auto px-5 py-2.5 text-xs sm:text-sm font-bold text-white flex items-center justify-center gap-2 rounded-xl transition shadow-md cursor-pointer ${
                  isNextMilestone
                    ? "bg-[var(--periwinkle-deep)] hover:bg-[var(--periwinkle)] shadow-indigo-500/25"
                    : "bg-[var(--ink)] hover:bg-[var(--periwinkle-deep)] shadow-xs"
                }`}
              >
                {isNextMilestone ? (
                  <>
                    <span>Next: Step 0{nextFlatTopic.milestoneOrder} ({nextFlatTopic.milestoneTitle})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Next Concept</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowCertModal(true)}
                className="w-full sm:w-auto px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center gap-2 rounded-xl transition shadow-md shadow-emerald-500/25 cursor-pointer"
              >
                <Award className="w-4 h-4" />
                <span>Finish Track & Claim Certificate</span>
              </button>
            )}
          </div>
        </div>

        {/* Certificate Modal inside Cockpit */}
        <CertificateModal
          isOpen={showCertModal}
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

  // ==========================================
  // VIEW 1: ROADMAP SHELL & TRAIL (Document 1)
  // ==========================================
  const completedInActiveMilestone =
    currentMilestone?.topics?.filter((t) => t.isCompleted).length || 0;
  const totalInActiveMilestone = currentMilestone?.topics?.length || 0;

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col">
      <Navbar />

      <section className="roadmap-shell p-0 max-w-full">
        {/* Roadmap Header Band */}
        <div className="trail-header-band">
          <div className="inner">
            <div>
              <h1 className="font-display text-4xl font-bold text-[var(--ink)] mb-2">
                {subject.title} <span className="text-[10px] tracking-wider uppercase bg-[var(--line)] text-[var(--ink-soft)] px-3 py-1 rounded-full align-middle ml-2">{subject.category}</span>
              </h1>
              <p className="text-sm text-[var(--ink-soft)] max-w-2xl">{subject.description}</p>
            </div>
            
            <div className="bg-[var(--surface)] p-4 rounded-xl border border-[var(--line)] flex flex-col gap-2 min-w-[240px]">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-[var(--ink-soft)]">{stats.completedCount} of {stats.totalTopics} waypoints</span>
                <span className="text-[var(--periwinkle-deep)] text-lg">{stats.progressPercent}%</span>
              </div>
              <div className="w-full bg-[var(--line)] h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-[var(--periwinkle)] h-full rounded-full"
                  style={{ width: `${Math.max(stats.progressPercent, 2)}%` }}
                ></div>
              </div>
              
              {stats.progressPercent === 100 ? (
                <button
                  onClick={() => setShowCertModal(true)}
                  className="mt-2 text-xs font-bold text-center py-2 bg-[var(--sage)] text-white rounded-lg flex items-center justify-center gap-1.5"
                >
                  <Award className="h-3.5 w-3.5" /> Claim Certificate
                </button>
              ) : (
                <div className="mt-2 text-xs font-bold text-center py-2 bg-[var(--bg)] text-[var(--ink-soft)] rounded-lg flex items-center justify-center gap-1.5 opacity-75">
                  <Lock className="h-3.5 w-3.5" /> Certificate Locked
                </div>
              )}
            </div>
          </div>
        </div>

        {/* TWO COLUMN layout */}
        <div className="trail-columns">
          {/* LEFT COLUMN */}
          <div className="trail-timeline">
            {milestones.map((m, idx) => {
              const isDone = m.topics?.length > 0 && m.topics.every((t) => t.isCompleted);
              const isActive = idx === activeMilestoneIndex;

              return (
                <div key={m.id} className="timeline-milestone">
                  <div className={`timeline-step-num ${isDone ? "done" : isActive ? "active" : "upcoming"}`}>
                    {isDone ? "✓" : m.order}
                  </div>
                  <div className={`milestone-card${isActive ? " is-active" : ""}`}>
                    <div
                      className="milestone-card-header"
                      onClick={() => setActiveMilestoneIndex(idx)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-bold font-display text-lg">{m.title}</span>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-[var(--line)] text-[var(--ink-soft)]">{m.level}</span>
                      </div>
                      <div className="text-[var(--ink-soft)]">
                        {isActive ? '−' : '+'}
                      </div>
                    </div>

                    {isActive && (
                      <div className="pb-4">
                        {m.topics?.map((topic) => (
                          <div key={topic.id} className="topic-row">
                            <button
                              onClick={() => handleToggleComplete(topic.id, !topic.isCompleted)}
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center ${topic.isCompleted ? 'bg-[var(--sage)] border-[var(--sage)] text-white' : 'border-[var(--line)] text-transparent'}`}
                            >
                              <span className="text-xs">✓</span>
                            </button>
                            <span className={`flex-1 text-sm ${topic.isCompleted ? 'text-[var(--ink-soft)] line-through' : 'font-medium'}`}>{topic.title}</span>
                            <button
                              onClick={() => setSelectedTopicId(topic.id)}
                              className="text-xs font-bold text-[var(--periwinkle-deep)] hover:underline"
                            >
                              Read &rarr;
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT COLUMN */}
          <div className="trail-sidebar">
            <div className="text-xs font-bold text-[var(--ink-soft)] uppercase tracking-wider mb-2">
              Step {activeMilestoneIndex + 1} of {milestones.length}
            </div>
            <h3 className="font-display text-xl font-bold mb-4">{currentMilestone?.title}</h3>
            
            <div className="mb-6">
              <div className="flex justify-between text-xs font-semibold text-[var(--ink-soft)] mb-2">
                <span>{completedInActiveMilestone} of {totalInActiveMilestone} topics done</span>
                <span>{Math.round((completedInActiveMilestone / (totalInActiveMilestone || 1)) * 100)}%</span>
              </div>
              <div className="w-full bg-[var(--line)] h-1.5 rounded-full">
                <div 
                  className="bg-[var(--periwinkle-deep)] h-1.5 rounded-full" 
                  style={{ width: `${Math.round((completedInActiveMilestone / (totalInActiveMilestone || 1)) * 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-1 mb-8">
              {currentMilestone?.topics?.map(topic => (
                <div 
                  key={topic.id}
                  onClick={() => setSelectedTopicId(topic.id)}
                  className={`sidebar-topic-row ${topic.id === selectedTopicId ? 'active' : ''} ${topic.isCompleted ? 'done' : ''}`}
                >
                  <span className="text-sm truncate flex-1">{topic.title}</span>
                  {topic.isCompleted && <span className="text-xs ml-2">✓</span>}
                </div>
              ))}
            </div>

            {selectedTopicId && (
              <div className="bg-[var(--bg)] border border-[var(--line)] p-4 rounded-xl">
                <div className="text-[10px] font-bold text-[var(--ink-soft)] uppercase mb-1">Currently Reading</div>
                <div className="font-bold text-sm mb-3 line-clamp-2">{currentTopic?.title}</div>
                <button 
                  onClick={() => window.scrollTo(0, 0)}
                  className="w-full py-2 bg-[var(--ink)] text-[var(--bg)] rounded-lg text-xs font-bold text-center"
                >
                  Focus Lesson &rarr;
                </button>
              </div>
            )}
          </div>
        </div>
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
