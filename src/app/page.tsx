"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  ArrowRight,
  CheckCircle2,
  Terminal,
  Code2,
  Cpu,
  Layers,
  Sparkles,
  Copy,
  Check,
  ChevronRight,
  Shield,
  Activity,
} from "lucide-react";

interface SubjectItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon: string;
  category: string;
  milestonesCount: number;
  topicsCount: number;
  completedCount: number;
  progressPercent: number;
}

const CAT_COLORS: Record<string, { accent: string; bg: string; text: string; tag: string }> = {
  "DevOps & Cloud":       { accent: "#7890DC", bg: "rgba(120,144,220,0.12)", text: "#6B82CE", tag: "CLOUD_OPS" },
  "Software Engineering": { accent: "#7BA877", bg: "rgba(123,168,119,0.12)", text: "#7FAE7B", tag: "FULL_STACK" },
  "Data & AI":            { accent: "#9EC09B", bg: "rgba(158,192,155,0.12)", text: "#7BA877", tag: "DATA_AI" },
  "Security & Systems":   { accent: "#E8A468", bg: "rgba(232,164,104,0.12)", text: "#E8A468", tag: "SEC_SYS" },
};

function getCatMeta(cat: string) {
  return CAT_COLORS[cat] ?? { accent: "#7890DC", bg: "rgba(120,144,220,0.12)", text: "#6B82CE", tag: "ENGINEERING" };
}

/* Animated counter */
function useCounter(target: number, active: boolean, ms = 1200) {
  const [val, setVal] = useState(0);
  const done = useRef(false);
  useEffect(() => {
    if (!active || done.current || target === 0) return;
    done.current = true;
    const steps = Math.ceil(ms / 16);
    let i = 0;
    const id = setInterval(() => {
      i++;
      setVal(Math.round((i / steps) * target));
      if (i >= steps) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [target, active, ms]);
  return val;
}

export default function HomePage() {
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState("ALL");
  const [activeTab, setActiveTab] = useState<"terminal" | "manifest" | "architecture">("terminal");
  const [activeStep, setActiveStep] = useState(2);
  const [copied, setCopied] = useState(false);
  const [countersActive, setCountersActive] = useState(false);

  const categories = ["ALL", "DevOps & Cloud", "Software Engineering", "Data & AI", "Security & Systems"];

  const trackCount = useCounter(subjects.length || 8, countersActive);
  const nodeCount = useCounter(400, countersActive);

  useEffect(() => {
    fetch("/api/subjects")
      .then((r) => r.json())
      .then((d) => {
        if (d.subjects) setSubjects(d.subjects);
        setLoading(false);
        setCountersActive(true);
      })
      .catch(() => {
        setLoading(false);
        setCountersActive(true);
      });
  }, []);

  const handleCopyCmd = () => {
    navigator.clipboard.writeText("curl -sL https://roadmap.ai/install.sh | bash");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filtered = selectedCat === "ALL" ? subjects : subjects.filter((s) => s.category === selectedCat);

  const WORKBENCH_STEPS = [
    { id: 0, tag: "[01]", title: "Linux Kernel & System Calls", status: "DONE", time: "6 hrs", cmd: "strace -c -e trace=network" },
    { id: 1, tag: "[02]", title: "TCP/IP & Network Architecture", status: "DONE", time: "8 hrs", cmd: "tcpdump -nnvv -i eth0 port 443" },
    { id: 2, tag: "[03]", title: "Container Runtimes (Docker & OCI)", status: "ACTIVE", time: "14 hrs", cmd: "docker build --no-cache -t app:v1 ." },
    { id: 3, tag: "[04]", title: "Orchestration & Kubernetes Raft", status: "UPCOMING", time: "20 hrs", cmd: "kubectl get pods -A -o wide" },
    { id: 4, tag: "[05]", title: "Infrastructure as Code (Terraform)", status: "UPCOMING", time: "12 hrs", cmd: "terraform plan -out=tfplan" },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      {/* ══════════════════════════════════════════════
          HERO: THE DEVELOPER COCKPIT / CONSOLE
      ══════════════════════════════════════════════ */}
      <section className="relative px-4 sm:px-6 lg:px-12 pt-8 sm:pt-14 pb-16 overflow-hidden">
        {/* Subtle Tech Grid Background */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04] dark:opacity-[0.07] bg-[radial-gradient(#6B82CE_1px,transparent_1px)] [background-size:24px_24px]" />

        {/* Animated Ambient Light Aura */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[380px] bg-gradient-to-tr from-[var(--periwinkle)]/25 via-emerald-500/15 to-transparent rounded-full blur-[110px] pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--line)] bg-[var(--surface)] text-xs font-mono font-medium text-[var(--ink-soft)] mb-6 shadow-sm hover:border-[var(--periwinkle)] transition">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="tracking-wide">LIVE TRAJECTORY ENGINE v3.0</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-5 max-w-4xl text-[var(--ink)]">
            The Engineering Engine for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--periwinkle-deep)] via-indigo-500 to-[var(--periwinkle)] animate-gradient">
              High-Velocity
            </span>{" "}
            Careers.
          </h1>

          <p className="text-base sm:text-lg text-[var(--ink-soft)] max-w-2xl leading-relaxed mb-8">
            Deterministic milestone pathways engineered by principal developers.
            Zero fluff, production concepts, interactive readers, and verified proof of mastery.
          </p>

          {/* Quick Launch Buttons */}
          <div className="flex flex-wrap items-center gap-4 mb-12">
            <a
              href="#pathways"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--periwinkle-deep)] text-white font-semibold text-sm hover:opacity-90 transition shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              Explore Pathways <ArrowRight className="w-4 h-4" />
            </a>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] font-semibold text-sm hover:bg-[var(--bg-alt)] hover:border-[var(--periwinkle)] transition hover:-translate-y-0.5"
            >
              Create Free Account
            </Link>
          </div>

          {/* ── THE INTERACTIVE WORKBENCH (CENTERPIECE WITH GLOW BORDER) ── */}
          <div className="relative rounded-2xl p-[1px] bg-gradient-to-b from-[var(--line)] via-[var(--periwinkle)]/30 to-[var(--line)] shadow-2xl">
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] overflow-hidden">
            {/* Top Window Bar */}
            <div className="flex flex-wrap items-center justify-between border-b border-[var(--line)] px-4 py-2.5 bg-[var(--bg-alt)]/60 gap-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-400/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-400/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-400/80 inline-block" />
                <span className="ml-2 text-xs font-mono text-[var(--ink-soft)] font-medium hidden sm:inline">
                  roadmap-cli // devops-core
                </span>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveTab("terminal")}
                  className={`px-3 py-1 rounded-md text-xs font-mono transition flex items-center gap-1.5 ${
                    activeTab === "terminal"
                      ? "bg-[var(--surface)] text-[var(--ink)] font-semibold shadow-xs"
                      : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
                  }`}
                >
                  <Terminal className="w-3 h-3" />
                  session.sh
                </button>
                <button
                  onClick={() => setActiveTab("manifest")}
                  className={`px-3 py-1 rounded-md text-xs font-mono transition flex items-center gap-1.5 ${
                    activeTab === "manifest"
                      ? "bg-[var(--surface)] text-[var(--ink)] font-semibold shadow-xs"
                      : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
                  }`}
                >
                  <Code2 className="w-3 h-3" />
                  Dockerfile
                </button>
                <button
                  onClick={() => setActiveTab("architecture")}
                  className={`px-3 py-1 rounded-md text-xs font-mono transition flex items-center gap-1.5 ${
                    activeTab === "architecture"
                      ? "bg-[var(--surface)] text-[var(--ink)] font-semibold shadow-xs"
                      : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
                  }`}
                >
                  <Layers className="w-3 h-3" />
                  architecture.json
                </button>
              </div>
            </div>

            {/* Split Screen Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[var(--line)]">
              {/* Left Pane: Interactive Milestone Stream (7 cols) */}
              <div className="lg:col-span-6 p-4 sm:p-6 bg-[var(--surface)] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono text-[var(--ink-soft)] font-semibold uppercase tracking-wider">
                      Interactive Pathway Stream
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                      TRACK: DEVOPS
                    </span>
                  </div>

                  {/* Step List */}
                  <div className="space-y-2.5">
                    {WORKBENCH_STEPS.map((s) => {
                      const isSelected = activeStep === s.id;
                      return (
                        <div
                          key={s.id}
                          onClick={() => setActiveStep(s.id)}
                          className={`p-3 rounded-xl border text-left cursor-pointer transition flex items-center justify-between ${
                            isSelected
                              ? "border-[var(--periwinkle-deep)] bg-[var(--periwinkle)]/10 shadow-xs"
                              : "border-[var(--line)] hover:border-[var(--periwinkle)]/50 bg-[var(--bg)]/50"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="font-mono text-xs font-bold text-[var(--periwinkle-deep)]">
                              {s.tag}
                            </span>
                            <div className="truncate">
                              <p className="text-xs sm:text-sm font-semibold text-[var(--ink)] truncate">
                                {s.title}
                              </p>
                              <p className="text-[11px] font-mono text-[var(--ink-soft)]">
                                {s.time} · {s.cmd}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                            {s.status === "DONE" && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                DONE
                              </span>
                            )}
                            {s.status === "ACTIVE" && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[var(--periwinkle-deep)] text-white">
                                ACTIVE
                              </span>
                            )}
                            {s.status === "UPCOMING" && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[var(--bg-alt)] text-[var(--ink-soft)] border border-[var(--line)]">
                                QUEUED
                              </span>
                            )}
                            <ChevronRight className="w-4 h-4 text-[var(--ink-soft)]" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Stream Status */}
                <div className="mt-4 pt-3 border-t border-[var(--line)] flex items-center justify-between text-xs font-mono text-[var(--ink-soft)]">
                  <span>Selected: {WORKBENCH_STEPS[activeStep].title}</span>
                  <Link
                    href="/roadmap/devops"
                    className="text-[var(--periwinkle-deep)] font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    Open Live Trail <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Right Pane: Code / Terminal View (5 cols) */}
              <div className="lg:col-span-6 p-4 sm:p-6 bg-[#0E111A] text-slate-200 font-mono text-xs overflow-x-auto min-h-[300px] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{activeTab === "terminal" ? "bash ~ roadmap" : activeTab === "manifest" ? "Dockerfile" : "arch.json"}</span>
                    </span>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      SYNTAX: VERIFIED
                    </span>
                  </div>

                  {activeTab === "terminal" && (
                    <div className="space-y-1.5 text-slate-300">
                      <p className="text-slate-500"># Current Milestone Execution</p>
                      <p>
                        <span className="text-cyan-400">$</span> roadmap track devops --step={activeStep + 1}
                      </p>
                      <p className="text-emerald-400">✔ Loading verified learning curriculum...</p>
                      <p className="text-slate-400">
                        → Concept: <span className="text-white">{WORKBENCH_STEPS[activeStep].title}</span>
                      </p>
                      <p className="text-slate-400">
                        → Verification Command: <span className="text-amber-300">{WORKBENCH_STEPS[activeStep].cmd}</span>
                      </p>
                      <p className="text-slate-400">
                        → Estimated Velocity: <span className="text-purple-300">{WORKBENCH_STEPS[activeStep].time}</span>
                      </p>
                      <div className="mt-3 p-2.5 rounded bg-slate-900 border border-slate-800 text-[11px]">
                        <p className="text-cyan-300 font-semibold mb-1">Production Challenge:</p>
                        <p className="text-slate-300">
                          Configure multi-stage container build with scratch base image. Reduce footprint by 84%.
                        </p>
                      </div>
                    </div>
                  )}

                  {activeTab === "manifest" && (
                    <div className="space-y-1 text-slate-300">
                      <p><span className="text-purple-400">FROM</span> golang:1.24-alpine <span className="text-purple-400">AS</span> builder</p>
                      <p><span className="text-purple-400">WORKDIR</span> /app</p>
                      <p><span className="text-purple-400">COPY</span> go.mod go.sum ./</p>
                      <p><span className="text-purple-400">RUN</span> go mod download</p>
                      <p><span className="text-purple-400">COPY</span> . .</p>
                      <p><span className="text-purple-400">RUN</span> CGO_ENABLED=0 GOOS=linux go build -o main .</p>
                      <p className="text-slate-500 pt-2"># Multi-stage minimal production layer</p>
                      <p><span className="text-purple-400">FROM</span> gcr.io/distroless/static-debian12</p>
                      <p><span className="text-purple-400">COPY</span> --from=builder /app/main /main</p>
                      <p><span className="text-purple-400">ENTRYPOINT</span> [&quot;/main&quot;]</p>
                    </div>
                  )}

                  {activeTab === "architecture" && (
                    <div className="space-y-1 text-slate-300">
                      <p>{`{`}</p>
                      <p className="pl-4"><span className="text-cyan-300">&quot;track&quot;</span>: <span className="text-amber-300">&quot;DevOps Engineering&quot;</span>,</p>
                      <p className="pl-4"><span className="text-cyan-300">&quot;milestones_total&quot;</span>: <span className="text-purple-300">7</span>,</p>
                      <p className="pl-4"><span className="text-cyan-300">&quot;topics_total&quot;</span>: <span className="text-purple-300">40</span>,</p>
                      <p className="pl-4"><span className="text-cyan-300">&quot;status&quot;</span>: <span className="text-emerald-400">&quot;PRODUCTION_READY&quot;</span>,</p>
                      <p className="pl-4"><span className="text-cyan-300">&quot;verification&quot;</span>: <span className="text-amber-300">&quot;100%_MERKLE_CERTIFICATE&quot;</span></p>
                      <p>{`}`}</p>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Container Ready
                  </span>
                  <Link
                    href={`/roadmap/devops`}
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
                  >
                    Start Milestone <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          METRIC TELEMETRY HUD (HIGH DENSITY)
      ══════════════════════════════════════════════ */}
      <section className="border-y border-[var(--line)] bg-[var(--surface)] py-6 px-4 sm:px-6 lg:px-12">
        <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 font-mono">
          <div className="flex flex-col">
            <span className="text-2xl sm:text-3xl font-bold text-[var(--ink)]">
              {loading ? "8" : trackCount}
            </span>
            <span className="text-xs text-[var(--ink-soft)] uppercase tracking-wider mt-1">
              [ CORE_TRACKS ]
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-2xl sm:text-3xl font-bold text-[var(--ink)]">
              {loading ? "400+" : `${nodeCount}+`}
            </span>
            <span className="text-xs text-[var(--ink-soft)] uppercase tracking-wider mt-1">
              [ VERIFIED_NODES ]
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              100%
            </span>
            <span className="text-xs text-[var(--ink-soft)] uppercase tracking-wider mt-1">
              [ CERTIFICATE_CRITERIA ]
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-2xl sm:text-3xl font-bold text-[var(--periwinkle-deep)]">
              0%
            </span>
            <span className="text-xs text-[var(--ink-soft)] uppercase tracking-wider mt-1">
              [ MARKETING_FLUFF ]
            </span>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          PATHWAYS: MODULAR ENGINEERING GRID
      ══════════════════════════════════════════════ */}
      <section id="pathways" className="px-4 sm:px-6 lg:px-12 py-16 bg-[var(--bg)]">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-[var(--periwinkle-deep)] font-bold">
                Trajectory Catalog
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[var(--ink)] mt-1">
                Engineering Pathways
              </h2>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-[var(--surface)] border border-[var(--line)]">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCat(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition ${
                    selectedCat === cat
                      ? "bg-[var(--periwinkle-deep)] text-white shadow-xs"
                      : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
                  }`}
                >
                  {cat === "ALL" ? "[ ALL ]" : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {loading
              ? [1, 2, 3, 4, 5, 6].map((n) => (
                  <div
                    key={n}
                    className="h-56 rounded-2xl bg-[var(--surface)] border border-[var(--line)] animate-pulse"
                  />
                ))
              : filtered.map((sub, idx) => {
                  const meta = getCatMeta(sub.category);
                  return (
                    <Link
                      key={sub.id}
                      href={`/roadmap/${sub.slug}`}
                      className="group rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between"
                      style={{ borderTop: `4px solid ${meta.accent}` }}
                    >
                      <div>
                        {/* Top row */}
                        <div className="flex items-center justify-between mb-3 text-xs font-mono">
                          <span className="font-bold text-[var(--ink-soft)]">
                            [TK-0{idx + 1}]
                          </span>
                          <span
                            className="px-2 py-0.5 rounded font-semibold text-[10px]"
                            style={{ background: meta.bg, color: meta.text }}
                          >
                            {meta.tag}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-bold text-[var(--ink)] group-hover:text-[var(--periwinkle-deep)] transition mb-2">
                          {sub.title}
                        </h3>

                        {/* Description */}
                        <p className="text-xs text-[var(--ink-soft)] leading-relaxed line-clamp-2 mb-4">
                          {sub.description}
                        </p>
                      </div>

                      {/* Bottom Meta */}
                      <div>
                        {sub.progressPercent > 0 && (
                          <div className="mb-3">
                            <div className="flex justify-between text-[11px] font-mono text-[var(--ink-soft)] mb-1">
                              <span>Progress</span>
                              <span className="font-bold" style={{ color: meta.text }}>
                                {sub.progressPercent}%
                              </span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-[var(--line)] overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${sub.progressPercent}%`,
                                  background: meta.accent,
                                }}
                              />
                            </div>
                          </div>
                        )}

                        <div className="pt-3 border-t border-[var(--line)] flex items-center justify-between text-xs font-mono">
                          <span className="text-[var(--ink-soft)]">
                            {sub.milestonesCount} milestones · {sub.topicsCount} topics
                          </span>
                          <span className="font-bold text-[var(--periwinkle-deep)] group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5">
                            Launch <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          BOTTOM TERMINAL BANNER (CTA)
      ══════════════════════════════════════════════ */}
      <section className="px-4 sm:px-6 lg:px-12 py-16 bg-[var(--surface)] border-t border-[var(--line)]">
        <div className="max-w-4xl mx-auto rounded-2xl border border-[var(--line)] bg-[#0E111A] text-slate-100 p-6 sm:p-10 shadow-xl relative overflow-hidden">
          {/* Subtle Glow in background */}
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider mb-2 block">
              // CLOUD INITIALIZER
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-3 tracking-tight">
              Initialize your engineering roadmap.
            </h2>
            <p className="text-sm text-slate-400 max-w-xl mb-6">
              Track progress, test production concepts, and earn non-dilutable verified credentials.
            </p>

            {/* Interactive Shell Box */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6 font-mono text-xs">
              <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 flex items-center justify-between">
                <span className="text-slate-300 truncate">
                  <span className="text-cyan-400">$</span> curl -sL https://roadmap.ai/install.sh | bash
                </span>
                <button
                  onClick={handleCopyCmd}
                  className="ml-3 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition flex-shrink-0"
                  title="Copy command"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <Link
                href="/register"
                className="px-6 py-3 rounded-xl bg-white text-slate-950 font-bold hover:bg-slate-100 transition text-center whitespace-nowrap"
              >
                Claim Free Account →
              </Link>
            </div>

            <p className="text-[11px] font-mono text-slate-500">
              * Zero credit card required · Free community tier available forever · 100% open syllabus
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          MINIMALIST MONO FOOTER
      ══════════════════════════════════════════════ */}
      <footer className="px-4 sm:px-6 lg:px-12 py-6 border-t border-[var(--line)] bg-[var(--bg)] font-mono text-xs text-[var(--ink-soft)] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Roadmap.ai // Infrastructure for engineers.</span>
        </div>
        <span>© 2026 Roadmap.ai · Verified Mastery</span>
      </footer>
    </div>
  );
}
