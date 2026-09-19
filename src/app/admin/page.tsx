"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  ShieldCheck,
  Plus,
  Trash2,
  Layers,
  FileText,
  Compass,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"subjects" | "milestones" | "topics">("subjects");
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [milestones, setMilestones] = useState<any[]>([]);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // New Subject form state
  const [subjTitle, setSubjTitle] = useState("");
  const [subjSlug, setSubjSlug] = useState("");
  const [subjDesc, setSubjDesc] = useState("");
  const [subjCategory, setSubjCategory] = useState("Engineering");
  const [subjIcon, setSubjIcon] = useState("Terminal");

  // New Milestone form state
  const [mTitle, setMTitle] = useState("");
  const [mDesc, setMDesc] = useState("");
  const [mOrder, setMOrder] = useState(1);
  const [mLevel, setMLevel] = useState<"Beginner" | "Intermediate" | "Advanced">("Beginner");

  // New Topic form state
  const [tTitle, setTTitle] = useState("");
  const [tDesc, setTDesc] = useState("");
  const [tOrder, setTOrder] = useState(1);
  const [tResourceTitle, setTResourceTitle] = useState("");
  const [tResourceUrl, setTResourceUrl] = useState("");

  const router = useRouter();

  const loadData = async () => {
    try {
      const authRes = await fetch("/api/auth/me");
      const authJson = await authRes.json();
      if (!authJson.user || authJson.user.role !== "admin") {
        router.push("/login");
        return;
      }

      const res = await fetch("/api/subjects");
      const json = await res.json();
      if (json.subjects) {
        setSubjects(json.subjects);
        if (json.subjects.length > 0 && !selectedSubjectId) {
          setSelectedSubjectId(json.subjects[0].id);
        }
      }
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [router]);

  useEffect(() => {
    if (!selectedSubjectId) return;
    const sub = subjects.find((s) => s.id === selectedSubjectId);
    if (!sub) return;

    fetch(`/api/roadmaps/${sub.slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.milestones) {
          setMilestones(data.milestones);
          if (data.milestones.length > 0) {
            setSelectedMilestoneId(data.milestones[0].id);
          }
        }
      })
      .catch(console.error);
  }, [selectedSubjectId, subjects]);

  const notify = (type: "success" | "error", text: string) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: subjTitle,
          slug: subjSlug,
          description: subjDesc,
          category: subjCategory,
          icon: subjIcon,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      notify("success", "Track created successfully!");
      setSubjTitle("");
      setSubjSlug("");
      setSubjDesc("");
      loadData();
    } catch (err: any) {
      notify("error", err.message || "Failed to create track");
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this track?")) return;
    try {
      const res = await fetch(`/api/admin/subjects?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      notify("success", "Track deleted");
      loadData();
    } catch (err: any) {
      notify("error", err.message);
    }
  };

  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/milestones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: selectedSubjectId,
          title: mTitle,
          description: mDesc,
          order: mOrder,
          level: mLevel,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      notify("success", "Step created!");
      setMTitle("");
      setMDesc("");
      loadData();
    } catch (err: any) {
      notify("error", err.message);
    }
  };

  const handleDeleteMilestone = async (id: string) => {
    if (!confirm("Delete this step?")) return;
    try {
      const res = await fetch(`/api/admin/milestones?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      notify("success", "Step deleted");
      loadData();
    } catch (err: any) {
      notify("error", err.message);
    }
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const resources = tResourceUrl
        ? [{ title: tResourceTitle || "Documentation", url: tResourceUrl, type: "doc" }]
        : [];

      const res = await fetch("/api/admin/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          milestoneId: selectedMilestoneId,
          title: tTitle,
          description: tDesc,
          order: tOrder,
          resources,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      notify("success", "Topic added to step!");
      setTTitle("");
      setTDesc("");
      setTResourceTitle("");
      setTResourceUrl("");
      loadData();
    } catch (err: any) {
      notify("error", err.message);
    }
  };

  const handleDeleteTopic = async (id: string) => {
    if (!confirm("Delete this topic?")) return;
    try {
      const res = await fetch(`/api/admin/topics?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      notify("success", "Topic deleted");
      loadData();
    } catch (err: any) {
      notify("error", err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col transition-colors duration-200">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 border-3 border-[var(--periwinkle-deep)] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const currentMilestone = milestones.find((m) => m.id === selectedMilestoneId);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col transition-colors duration-200">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 sm:px-12 py-10 w-full flex-1">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[var(--line)]">
          <div>
            <span className="ghost-pill mb-2 inline-flex text-[11px] font-semibold items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin Studio
            </span>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[var(--ink)] tracking-tight mt-2">
              Track Content Manager
            </h1>
            <p className="text-xs text-[var(--ink-soft)] mt-1 font-medium">
              Add and arrange tracks, sequential milestones, and topics with learning resources.
            </p>
          </div>
        </div>

          {/* Status Toast */}
          {statusMsg && (
            <div
              className={`my-4 p-3 rounded-2xl border flex items-center gap-2 text-xs font-bold ${
                statusMsg.type === "success"
                  ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                  : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300"
              }`}
            >
              {statusMsg.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 my-6 p-1.5 bg-[var(--bg-subtle)] rounded-2xl border border-[var(--border-color)] w-fit">
            <button
              onClick={() => setActiveTab("subjects")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
                activeTab === "subjects"
                  ? "bg-[#2563eb] text-white shadow-sm shadow-blue-500/30"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Compass className="h-4 w-4" />
              1. Tracks ({subjects.length})
            </button>
            <button
              onClick={() => setActiveTab("milestones")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
                activeTab === "milestones"
                  ? "bg-[#2563eb] text-white shadow-sm shadow-blue-500/30"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Layers className="h-4 w-4" />
              2. Steps Flow
            </button>
            <button
              onClick={() => setActiveTab("topics")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
                activeTab === "topics"
                  ? "bg-[#2563eb] text-white shadow-sm shadow-blue-500/30"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <FileText className="h-4 w-4" />
              3. Topics & Resources
            </button>
          </div>

          {/* TAB 1: SUBJECTS */}
          {activeTab === "subjects" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="bg-[var(--bg-surface)] border-2 border-[var(--border-color)] rounded-3xl p-6 shadow-sm h-fit">
                <h2 className="text-base font-extrabold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                  <Plus className="h-4 w-4 text-[#2563eb]" />
                  Add New Track
                </h2>
                <form onSubmit={handleCreateSubject} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">Track Title</label>
                    <input
                      type="text"
                      required
                      value={subjTitle}
                      onChange={(e) => setSubjTitle(e.target.value)}
                      placeholder="e.g. SRE Engineering"
                      className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-2xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:border-[#2563eb] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">URL Slug</label>
                    <input
                      type="text"
                      required
                      value={subjSlug}
                      onChange={(e) => setSubjSlug(e.target.value)}
                      placeholder="e.g. sre"
                      className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-2xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:border-[#2563eb] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">Category</label>
                    <select
                      value={subjCategory}
                      onChange={(e) => setSubjCategory(e.target.value)}
                      className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-2xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:border-[#2563eb] focus:outline-none"
                    >
                      <option value="DevOps">DevOps</option>
                      <option value="Cloud">Cloud</option>
                      <option value="Engineering">Engineering</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">Description</label>
                    <textarea
                      required
                      rows={3}
                      value={subjDesc}
                      onChange={(e) => setSubjDesc(e.target.value)}
                      placeholder="Summary of this trail"
                      className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-2xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:border-[#2563eb] focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="dribbble-btn-blue w-full py-3 text-xs font-bold"
                  >
                    Create Track
                  </button>
                </form>
              </div>

              <div className="lg:col-span-2 space-y-3">
                <h2 className="text-base font-extrabold text-[var(--text-primary)] mb-2">Existing Tracks</h2>
                {subjects.map((sub, idx) => (
                  <div
                    key={sub.id}
                    className={`p-5 rounded-3xl border-2 flex items-center justify-between gap-4 shadow-sm ${
                      idx % 2 === 0
                        ? "bg-[#e8ecff] dark:bg-[#151932] border-[#cbd5ff] dark:border-[#2e366b]"
                        : "bg-[#eafaf1] dark:bg-[#0e2319] border-[#bbf0d4] dark:border-[#1e4d38]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white dark:bg-black/40 text-[var(--text-primary)] shadow-2xs">
                          {sub.category}
                        </span>
                        <span className="text-xs text-[var(--text-secondary)] font-mono">/roadmap/{sub.slug}</span>
                      </div>
                      <h3 className="text-lg font-extrabold text-[var(--text-primary)]">{sub.title}</h3>
                      <p className="text-xs text-[var(--text-secondary)] font-medium line-clamp-1 mt-0.5">{sub.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/roadmap/${sub.slug}`}
                        target="_blank"
                        className="dribbble-arrow-btn text-[var(--text-primary)]"
                        title="View live trail"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteSubject(sub.id)}
                        className="p-2 rounded-full text-rose-500 hover:bg-rose-500/15 transition"
                        title="Delete Track"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: MILESTONES */}
          {activeTab === "milestones" && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 bg-[var(--bg-surface)] p-3 rounded-2xl border border-[var(--border-color)] w-fit">
                <label className="text-xs font-bold text-[var(--text-primary)]">Select Track:</label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none font-bold"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-[var(--bg-surface)] border-2 border-[var(--border-color)] rounded-3xl p-6 shadow-sm h-fit">
                  <h2 className="text-base font-extrabold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                    <Plus className="h-4 w-4 text-[#2563eb]" />
                    Add Step to Track
                  </h2>
                  <form onSubmit={handleCreateMilestone} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">Step Title</label>
                      <input
                        type="text"
                        required
                        value={mTitle}
                        onChange={(e) => setMTitle(e.target.value)}
                        placeholder="e.g. Containerization"
                        className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-2xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:border-[#2563eb] focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">Order #</label>
                        <input
                          type="number"
                          required
                          value={mOrder}
                          onChange={(e) => setMOrder(Number(e.target.value))}
                          className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-2xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:border-[#2563eb] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">Level</label>
                        <select
                          value={mLevel}
                          onChange={(e) => setMLevel(e.target.value as any)}
                          className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-2xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:border-[#2563eb] focus:outline-none"
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">Description</label>
                      <textarea
                        rows={2}
                        value={mDesc}
                        onChange={(e) => setMDesc(e.target.value)}
                        placeholder="Brief topic overview"
                        className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-2xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:border-[#2563eb] focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="dribbble-btn-blue w-full py-3 text-xs font-bold"
                    >
                      Add Step
                    </button>
                  </form>
                </div>

                <div className="lg:col-span-2 space-y-3">
                  <h2 className="text-base font-extrabold text-[var(--text-primary)] mb-2">
                    Steps on this Track ({milestones.length})
                  </h2>
                  {milestones.length === 0 ? (
                    <p className="text-xs text-[var(--text-secondary)] font-medium">No steps added yet.</p>
                  ) : (
                    milestones.map((m) => (
                      <div
                        key={m.id}
                        className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] flex items-center justify-between gap-4 shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <span className="h-8 w-8 rounded-full bg-[#e8ecff] dark:bg-[#151932] text-[#2563eb] font-extrabold text-xs flex items-center justify-center shrink-0 border border-[#cbd5ff] dark:border-[#2e366b]">
                            #{m.order}
                          </span>
                          <div>
                            <h4 className="text-sm font-extrabold text-[var(--text-primary)]">{m.title}</h4>
                            <p className="text-xs text-[var(--text-secondary)] font-medium line-clamp-1">{m.description}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteMilestone(m.id)}
                          className="p-2 rounded-full text-rose-500 hover:bg-rose-500/15 transition"
                          title="Delete step"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TOPICS */}
          {activeTab === "topics" && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-4 bg-[var(--bg-surface)] p-3 rounded-2xl border border-[var(--border-color)] w-fit">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-[var(--text-primary)]">Track:</label>
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    className="bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-1.5 text-xs text-[var(--text-primary)] font-bold"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-[var(--text-primary)]">Step:</label>
                  <select
                    value={selectedMilestoneId}
                    onChange={(e) => setSelectedMilestoneId(e.target.value)}
                    className="bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-1.5 text-xs text-[var(--text-primary)] font-bold"
                  >
                    {milestones.map((m) => (
                      <option key={m.id} value={m.id}>
                        #{m.order} - {m.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-[var(--bg-surface)] border-2 border-[var(--border-color)] rounded-3xl p-6 shadow-sm h-fit">
                  <h2 className="text-base font-extrabold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                    <Plus className="h-4 w-4 text-[#2563eb]" />
                    Add Subtopic to Step
                  </h2>
                  <form onSubmit={handleCreateTopic} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">Topic Title</label>
                      <input
                        type="text"
                        required
                        value={tTitle}
                        onChange={(e) => setTTitle(e.target.value)}
                        placeholder="e.g. Docker Compose"
                        className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-2xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:border-[#2563eb] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">Order #</label>
                      <input
                        type="number"
                        required
                        value={tOrder}
                        onChange={(e) => setTOrder(Number(e.target.value))}
                        className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-2xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:border-[#2563eb] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">Description</label>
                      <textarea
                        rows={2}
                        value={tDesc}
                        onChange={(e) => setTDesc(e.target.value)}
                        placeholder="Notes for learners"
                        className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-2xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:border-[#2563eb] focus:outline-none"
                      />
                    </div>
                    <div className="pt-2 border-t border-[var(--border-color)] space-y-2">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-secondary)]">
                        Resource Link
                      </span>
                      <div>
                        <input
                          type="text"
                          value={tResourceTitle}
                          onChange={(e) => setTResourceTitle(e.target.value)}
                          placeholder="Link title (e.g. Official Docs)"
                          className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-2xl px-3.5 py-2 text-xs text-[var(--text-primary)] focus:border-[#2563eb] focus:outline-none mb-2"
                        />
                        <input
                          type="url"
                          value={tResourceUrl}
                          onChange={(e) => setTResourceUrl(e.target.value)}
                          placeholder="https://..."
                          className="w-full bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-2xl px-3.5 py-2 text-xs text-[var(--text-primary)] focus:border-[#2563eb] focus:outline-none"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="dribbble-btn-blue w-full py-3 text-xs font-bold"
                    >
                      Add Topic
                    </button>
                  </form>
                </div>

                <div className="lg:col-span-2 space-y-3">
                  <h2 className="text-base font-extrabold text-[var(--text-primary)] mb-2">
                    Topics in {currentMilestone?.title || "selected step"} ({currentMilestone?.topics?.length || 0})
                  </h2>
                  {!currentMilestone?.topics || currentMilestone.topics.length === 0 ? (
                    <p className="text-xs text-[var(--text-secondary)] font-medium">No topics added yet.</p>
                  ) : (
                    currentMilestone.topics.map((top: any) => (
                      <div
                        key={top.id}
                        className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] flex items-center justify-between gap-4 shadow-sm"
                      >
                        <div>
                          <h4 className="text-sm font-extrabold text-[var(--text-primary)]">{top.title}</h4>
                          <p className="text-xs text-[var(--text-secondary)] font-medium line-clamp-1">{top.description}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteTopic(top.id)}
                          className="p-2 rounded-full text-rose-500 hover:bg-rose-500/15 transition"
                          title="Delete topic"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
    </div>
  );
}
