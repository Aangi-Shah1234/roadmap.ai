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
  GitBranch,
  Clock,
  Compass,
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

interface GraphNode {
  id: string;
  label: string;
  category: string;
  status: "done" | "active" | "queued";
  x: number;
  y: number;
  color: string;
  time: string;
  deliverables: string[];
  command: string;
  trackSlug: string;
}

const GRAPH_NODES: GraphNode[] = [
  {
    id: "linux",
    label: "Linux & OS",
    category: "Foundation",
    status: "done",
    x: 80,
    y: 190,
    color: "#7FAE7B",
    time: "6 hrs",
    deliverables: ["POSIX Syscalls", "File Descriptors", "Process Management"],
    command: "strace -c -e trace=process ./main",
    trackSlug: "devops",
  },
  {
    id: "net",
    label: "TCP/IP & Networks",
    category: "Foundation",
    status: "done",
    x: 230,
    y: 190,
    color: "#7FAE7B",
    time: "8 hrs",
    deliverables: ["DNS Resolution", "TLS 1.3 Handshake", "Packet Inspection"],
    command: "tcpdump -nnvv -i eth0 port 443",
    trackSlug: "devops",
  },
  {
    id: "docker",
    label: "Docker & OCI",
    category: "Containers",
    status: "active",
    x: 390,
    y: 190,
    color: "#6B82CE",
    time: "14 hrs",
    deliverables: ["cgroups & namespaces", "Multi-stage Builds", "Rootless Containers"],
    command: "docker build --no-cache -t prod/app:v1 .",
    trackSlug: "devops",
  },
  {
    id: "k8s",
    label: "Kubernetes Cluster",
    category: "Orchestration",
    status: "queued",
    x: 560,
    y: 110,
    color: "#7890DC",
    time: "22 hrs",
    deliverables: ["etcd Raft Consensus", "CRDs & Operators", "Ingress Controllers"],
    command: "kubectl get nodes -o wide --show-labels",
    trackSlug: "devops",
  },
  {
    id: "cloud",
    label: "AWS / Cloud Inf",
    category: "Cloud Ops",
    status: "queued",
    x: 560,
    y: 270,
    color: "#E8A468",
    time: "18 hrs",
    deliverables: ["VPC Subnet Peering", "IAM Role Policies", "ECS Fargate Deployments"],
    command: "aws sts get-caller-identity",
    trackSlug: "devops",
  },
  {
    id: "iac",
    label: "Terraform & IaC",
    category: "Automation",
    status: "queued",
    x: 720,
    y: 190,
    color: "#6B82CE",
    time: "12 hrs",
    deliverables: ["State Lock with DynamoDB", "Modular Blueprints", "Drift Detection"],
    command: "terraform plan -out=tfplan.binary",
    trackSlug: "devops",
  },
];

export default function HomePage() {
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState("ALL");
  const [activeNodeId, setActiveNodeId] = useState("docker");
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

  const activeNode = GRAPH_NODES.find((n) => n.id === activeNodeId) || GRAPH_NODES[2];
  const filtered = selectedCat === "ALL" ? subjects : subjects.filter((s) => s.category === selectedCat);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      {/* ══════════════════════════════════════════════
          HERO: OPTION A — THE LIVING VISUAL NODE TREE
      ══════════════════════════════════════════════ */}
      <section className="relative px-4 sm:px-6 lg:px-12 pt-6 sm:pt-12 pb-16 overflow-hidden">
        {/* Subtle Tech Grid Background */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04] dark:opacity-[0.08] bg-[radial-gradient(#6B82CE_1px,transparent_1px)] [background-size:24px_24px]" />

        {/* Animated Ambient Light Aura */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-[var(--periwinkle)]/25 via-emerald-500/15 to-transparent rounded-full blur-[110px] pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--line)] bg-[var(--surface)] text-xs font-mono font-medium text-[var(--ink-soft)] mb-5 shadow-sm hover:border-[var(--periwinkle)] transition">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="tracking-wide">LIVING VISUAL NODE TREE · v3.2</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] mb-4 max-w-4xl text-[var(--ink)]">
            Visualize Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--periwinkle-deep)] via-indigo-500 to-[var(--periwinkle)]">
              Engineering Mastery.
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-[var(--ink-soft)] max-w-2xl leading-relaxed mb-6 sm:mb-8">
            Interactive, milestone-driven skill graphs connecting real production concepts.
            Tap any node to explore prerequisites, estimated velocity, and hands-on commands.
          </p>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-8 sm:mb-10">
            <a
              href="#pathways"
              className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-[var(--periwinkle-deep)] text-white font-semibold text-xs sm:text-sm hover:opacity-90 transition shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              Explore Pathways <ArrowRight className="w-4 h-4" />
            </a>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] font-semibold text-xs sm:text-sm hover:bg-[var(--bg-alt)] hover:border-[var(--periwinkle)] transition hover:-translate-y-0.5"
            >
              Start Free Trail
            </Link>
          </div>

          {/* ── THE LIVING VISUAL GRAPH CANVAS (THE SHOWSTOPPER) ── */}
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-2xl p-4 sm:p-6 relative overflow-hidden">
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between pb-4 mb-4 border-b border-[var(--line)] gap-2">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[var(--ink)]">
                <GitBranch className="w-4 h-4 text-[var(--periwinkle-deep)]" />
                <span>TRAJECTORY_GRAPH // DEVOPS_ENGINEERING</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-mono text-[var(--ink-soft)]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Completed
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--periwinkle-deep)] animate-pulse" /> Active Node
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--line)] border border-[var(--ink-soft)]" /> Queued
                </span>
              </div>
            </div>

            {/* SVG Visual Node Graph (Fluidly scales on any screen) */}
            <div className="w-full bg-[var(--bg)]/70 rounded-xl border border-[var(--line)] p-2 sm:p-4 relative">
              <svg
                viewBox="0 0 800 380"
                className="w-full h-auto max-h-[380px] select-none"
              >
                <defs>
                  {/* Glowing filter */}
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <linearGradient id="gradPath" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#7FAE7B" />
                    <stop offset="50%" stopColor="#6B82CE" />
                    <stop offset="100%" stopColor="#E8A468" />
                  </linearGradient>
                </defs>

                {/* Connecting Connecting Paths */}
                {/* Linux -> Net */}
                <line x1="80" y1="190" x2="230" y2="190" stroke="#7FAE7B" strokeWidth="3" strokeDasharray="4 4" />
                {/* Net -> Docker */}
                <line x1="230" y1="190" x2="390" y2="190" stroke="#6B82CE" strokeWidth="3.5" />
                {/* Docker -> K8s */}
                <path d="M 390 190 C 460 190, 480 110, 560 110" fill="none" stroke="#6B82CE" strokeWidth="2.5" />
                {/* Docker -> Cloud */}
                <path d="M 390 190 C 460 190, 480 270, 560 270" fill="none" stroke="#E8A468" strokeWidth="2.5" />
                {/* K8s -> IaC */}
                <path d="M 560 110 C 630 110, 650 190, 720 190" fill="none" stroke="#7890DC" strokeWidth="2.5" strokeDasharray="5 5" />
                {/* Cloud -> IaC */}
                <path d="M 560 270 C 630 270, 650 190, 720 190" fill="none" stroke="#E8A468" strokeWidth="2.5" strokeDasharray="5 5" />

                {/* Graph Nodes */}
                {GRAPH_NODES.map((node) => {
                  const isSelected = activeNodeId === node.id;
                  return (
                    <g
                      key={node.id}
                      onClick={() => setActiveNodeId(node.id)}
                      className="cursor-pointer transition-transform hover:scale-105"
                    >
                      {/* Outer pulse ring for active node */}
                      {node.status === "active" && (
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r="32"
                          fill="none"
                          stroke={node.color}
                          strokeWidth="2"
                          opacity="0.6"
                          className="animate-ping"
                          style={{ transformOrigin: `${node.x}px ${node.y}px` }}
                        />
                      )}

                      {/* Main Node Circle */}
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={isSelected ? 26 : 22}
                        fill="var(--surface)"
                        stroke={node.color}
                        strokeWidth={isSelected ? "4" : "3"}
                        filter={isSelected ? "url(#glow)" : undefined}
                      />

                      {/* Inner Status Indicator */}
                      {node.status === "done" && (
                        <circle cx={node.x} cy={node.y} r="10" fill="#7FAE7B" />
                      )}
                      {node.status === "active" && (
                        <circle cx={node.x} cy={node.y} r="10" fill="#6B82CE" />
                      )}
                      {node.status === "queued" && (
                        <circle cx={node.x} cy={node.y} r="6" fill="var(--ink-soft)" opacity="0.4" />
                      )}

                      {/* Node Label Text */}
                      <text
                        x={node.x}
                        y={node.y > 190 ? node.y + 36 : node.y - 32}
                        textAnchor="middle"
                        fill="var(--ink)"
                        fontSize="12"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        {node.label}
                      </text>

                      {/* Sub-label Category */}
                      <text
                        x={node.x}
                        y={node.y > 190 ? node.y + 48 : node.y - 18}
                        textAnchor="middle"
                        fill="var(--ink-soft)"
                        fontSize="9"
                        fontFamily="monospace"
                      >
                        [{node.category}]
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Mobile Node Selector Pills (Quick touch target for phone users) */}
            <div className="flex sm:hidden overflow-x-auto gap-2 py-3 mt-2 border-b border-[var(--line)]">
              {GRAPH_NODES.map((n) => (
                <button
                  key={n.id}
                  onClick={() => setActiveNodeId(n.id)}
                  className={`px-3 py-1 rounded-full text-xs font-mono font-bold whitespace-nowrap transition ${
                    activeNodeId === n.id
                      ? "bg-[var(--periwinkle-deep)] text-white"
                      : "border border-[var(--line)] text-[var(--ink-soft)] bg-[var(--bg)]"
                  }`}
                >
                  {n.label}
                </button>
              ))}
            </div>

            {/* ── INTERACTIVE NODE INSPECTION PANEL ── */}
            <div className="mt-4 p-4 sm:p-5 rounded-xl border border-[var(--line)] bg-[var(--surface)] shadow-sm grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-4 border-b md:border-b-0 md:border-r border-[var(--line)] pb-3 md:pb-0 md:pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider" style={{ background: `${activeNode.color}20`, color: activeNode.color }}>
                    {activeNode.category}
                  </span>
                  <span className="text-xs font-mono text-[var(--ink-soft)] flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {activeNode.time}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[var(--ink)]">{activeNode.label}</h3>
                <p className="text-xs text-[var(--ink-soft)] mt-1">
                  Status: <strong className="uppercase" style={{ color: activeNode.color }}>{activeNode.status}</strong>
                </p>
              </div>

              <div className="md:col-span-5 border-b md:border-b-0 md:border-r border-[var(--line)] pb-3 md:pb-0 md:pr-4">
                <span className="text-[11px] font-mono font-bold uppercase text-[var(--ink-soft)] block mb-1">
                  Production Deliverables:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeNode.deliverables.map((d, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md text-[11px] font-medium border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)]"
                    >
                      ✓ {d}
                    </span>
                  ))}
                </div>
                <div className="mt-2 text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded truncate">
                  <span className="text-cyan-400">$</span> {activeNode.command}
                </div>
              </div>

              <div className="md:col-span-3 flex flex-col justify-center gap-2">
                <Link
                  href={`/roadmap/${activeNode.trackSlug}`}
                  className="w-full py-2.5 px-4 rounded-xl bg-[var(--periwinkle-deep)] text-white text-xs font-bold text-center hover:opacity-90 transition shadow-xs flex items-center justify-center gap-1.5"
                >
                  Launch Milestone <ArrowRight className="w-3.5 h-3.5" />
                </Link>
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
