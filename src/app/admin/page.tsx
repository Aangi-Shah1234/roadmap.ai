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

  // Load milestones when selectedSubject changes
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

  // 1. Create Subject
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

      notify("success", "Subject created successfully!");
      setSubjTitle("");
      setSubjSlug("");
      setSubjDesc("");
      loadData();
    } catch (err: any) {
      notify("error", err.message || "Failed to create subject");
    }
  };

  // Delete Subject
  const handleDeleteSubject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this entire subject and all its milestones?")) return;
    try {
      const res = await fetch(`/api/admin/subjects?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      notify("success", "Subject deleted");
      loadData();
    } catch (err: any) {
      notify("error", err.message);
    }
  };

  // 2. Create Milestone
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

      notify("success", "Milestone created!");
      setMTitle("");
      setMDesc("");
      loadData();
    } catch (err: any) {
      notify("error", err.message);
    }
  };

  const handleDeleteMilestone = async (id: string) => {
    if (!confirm("Delete this milestone and its topics?")) return;
    try {
      const res = await fetch(`/api/admin/milestones?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      notify("success", "Milestone deleted");
      loadData();
    } catch (err: any) {
      notify("error", err.message);
    }
  };

  // 3. Create Topic
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

      notify("success", "Topic added to milestone!");
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
      <div className="min-h-screen bg-zinc-950 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const currentMilestone = milestones.find((m) => m.id === selectedMilestoneId);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-purple-500 selection:text-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 w-full flex-1">
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800/50 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" />
                Administrator Portal
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Roadmap Content Manager
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Create and manage subjects, sequential milestones, and topics with learning resources.
            </p>
          </div>
        </div>

        {/* Status Notification Toast */}
        {statusMsg && (
          <div
            className={`my-4 p-3 rounded-xl border flex items-center gap-2 text-xs font-semibold ${
              statusMsg.type === "success"
                ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-300"
                : "bg-red-950/40 border-red-500/50 text-red-300"
            }`}
          >
            {statusMsg.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-zinc-800 my-6 gap-2">
          <button
            onClick={() => setActiveTab("subjects")}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition border-b-2 flex items-center gap-2 ${
              activeTab === "subjects"
                ? "border-purple-500 text-purple-400 bg-zinc-900/40"
                : "border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            <Compass className="h-4 w-4" />
            1. Subjects & Tracks ({subjects.length})
          </button>
          <button
            onClick={() => setActiveTab("milestones")}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition border-b-2 flex items-center gap-2 ${
              activeTab === "milestones"
                ? "border-purple-500 text-purple-400 bg-zinc-900/40"
                : "border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            <Layers className="h-4 w-4" />
            2. Milestones Flow
          </button>
          <button
            onClick={() => setActiveTab("topics")}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition border-b-2 flex items-center gap-2 ${
              activeTab === "topics"
                ? "border-purple-500 text-purple-400 bg-zinc-900/40"
                : "border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            <FileText className="h-4 w-4" />
            3. Topics & Resources
          </button>
        </div>

        {/* TAB 1: SUBJECTS */}
        {activeTab === "subjects" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Create Subject Form */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl h-fit">
              <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Plus className="h-4 w-4 text-purple-400" />
                Add New Subject / Track
              </h2>
              <form onSubmit={handleCreateSubject} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Subject Title</label>
                  <input
                    type="text"
                    required
                    value={subjTitle}
                    onChange={(e) => setSubjTitle(e.target.value)}
                    placeholder="e.g. SRE & Reliability"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">URL Slug</label>
                  <input
                    type="text"
                    required
                    value={subjSlug}
                    onChange={(e) => setSubjSlug(e.target.value)}
                    placeholder="e.g. sre"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Category</label>
                  <select
                    value={subjCategory}
                    onChange={(e) => setSubjCategory(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="DevOps">DevOps</option>
                    <option value="Cloud">Cloud</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Security">Security</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Description</label>
                  <textarea
                    required
                    rows={3}
                    value={subjDesc}
                    onChange={(e) => setSubjDesc(e.target.value)}
                    placeholder="What will learners achieve in this track?"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition shadow-md shadow-purple-600/20"
                >
                  Create Subject
                </button>
              </form>
            </div>

            {/* List Existing Subjects */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-base font-bold text-white mb-2">Existing Tracks</h2>
              {subjects.map((sub) => (
                <div
                  key={sub.id}
                  className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800/40">
                        {sub.category}
                      </span>
                      <span className="text-xs text-zinc-400 font-mono">/roadmap/{sub.slug}</span>
                    </div>
                    <h3 className="text-base font-bold text-white">{sub.title}</h3>
                    <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">{sub.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/roadmap/${sub.slug}`}
                      target="_blank"
                      className="p-2 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white transition"
                      title="View live canvas"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDeleteSubject(sub.id)}
                      className="p-2 rounded-lg bg-red-950/40 text-red-400 hover:bg-red-900/60 transition"
                      title="Delete Subject"
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
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-zinc-300">Select Subject Track:</label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Add Milestone Form */}
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl h-fit">
                <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <Plus className="h-4 w-4 text-purple-400" />
                  Add Milestone to Track
                </h2>
                <form onSubmit={handleCreateMilestone} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">Milestone Title</label>
                    <input
                      type="text"
                      required
                      value={mTitle}
                      onChange={(e) => setMTitle(e.target.value)}
                      placeholder="e.g. Container Orchestration"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">Order #</label>
                      <input
                        type="number"
                        required
                        value={mOrder}
                        onChange={(e) => setMOrder(Number(e.target.value))}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">Level</label>
                      <select
                        value={mLevel}
                        onChange={(e) => setMLevel(e.target.value as any)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={mDesc}
                      onChange={(e) => setMDesc(e.target.value)}
                      placeholder="What is covered in this milestone?"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition"
                  >
                    Add Milestone
                  </button>
                </form>
              </div>

              {/* Milestones Flow List */}
              <div className="lg:col-span-2 space-y-3">
                <h2 className="text-base font-bold text-white mb-2">
                  Milestones Flow in this Track ({milestones.length})
                </h2>
                {milestones.length === 0 ? (
                  <p className="text-xs text-zinc-500">No milestones yet in this subject.</p>
                ) : (
                  milestones.map((m) => (
                    <div
                      key={m.id}
                      className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <span className="h-8 w-8 rounded-lg bg-purple-950/80 border border-purple-800/40 text-purple-300 flex items-center justify-center text-xs font-bold shrink-0">
                          #{m.order}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white">{m.title}</h4>
                            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                              {m.level}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400 line-clamp-1">{m.description}</p>
                          <span className="text-[11px] text-zinc-500">
                            {m.topics?.length || 0} subtopics attached
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteMilestone(m.id)}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-950/40 transition"
                        title="Delete milestone"
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
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-zinc-300">Subject:</label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-zinc-300">Milestone:</label>
                <select
                  value={selectedMilestoneId}
                  onChange={(e) => setSelectedMilestoneId(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
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
              {/* Add Topic Form */}
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl h-fit">
                <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <Plus className="h-4 w-4 text-purple-400" />
                  Add Subtopic to Milestone
                </h2>
                <form onSubmit={handleCreateTopic} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">Topic Title</label>
                    <input
                      type="text"
                      required
                      value={tTitle}
                      onChange={(e) => setTTitle(e.target.value)}
                      placeholder="e.g. Docker Compose & Volumes"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">Order #</label>
                    <input
                      type="number"
                      required
                      value={tOrder}
                      onChange={(e) => setTOrder(Number(e.target.value))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">Topic Description</label>
                    <textarea
                      rows={2}
                      value={tDesc}
                      onChange={(e) => setTDesc(e.target.value)}
                      placeholder="Explanation and learning objectives"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div className="pt-2 border-t border-zinc-800 space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                      Curated Resource Link
                    </span>
                    <div>
                      <input
                        type="text"
                        value={tResourceTitle}
                        onChange={(e) => setTResourceTitle(e.target.value)}
                        placeholder="Resource Title (e.g. Official Docker Docs)"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none mb-2"
                      />
                      <input
                        type="url"
                        value={tResourceUrl}
                        onChange={(e) => setTResourceUrl(e.target.value)}
                        placeholder="https://docs.docker.com/..."
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition"
                  >
                    Add Topic
                  </button>
                </form>
              </div>

              {/* Topics List for selected milestone */}
              <div className="lg:col-span-2 space-y-3">
                <h2 className="text-base font-bold text-white mb-2">
                  Topics in {currentMilestone?.title || "selected milestone"} ({currentMilestone?.topics?.length || 0})
                </h2>
                {!currentMilestone?.topics || currentMilestone.topics.length === 0 ? (
                  <p className="text-xs text-zinc-500">No topics in this milestone yet.</p>
                ) : (
                  currentMilestone.topics.map((top: any) => (
                    <div
                      key={top.id}
                      className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between gap-4"
                    >
                      <div>
                        <h4 className="text-sm font-bold text-white">{top.title}</h4>
                        <p className="text-xs text-zinc-400 line-clamp-1">{top.description}</p>
                        {top.resources?.length > 0 && (
                          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-indigo-400">
                            <ExternalLink className="h-3 w-3" />
                            <span>{top.resources[0].title}</span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteTopic(top.id)}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-950/40 transition"
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
