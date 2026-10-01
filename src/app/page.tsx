"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { ArrowRight, CheckCheck, CheckCircle2 } from "lucide-react";

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

const CAT_ACCENT: Record<string, { dot: string; rowBg: string; label: string }> = {
  "DevOps & Cloud":       { dot: "#8FA3E3", rowBg: "rgba(143,163,227,0.09)", label: "#6B82CE" },
  "Software Engineering": { dot: "#A8C9A5", rowBg: "rgba(168,201,165,0.11)", label: "#7FAE7B" },
  "Data & AI":            { dot: "#A8C9A5", rowBg: "rgba(168,201,165,0.11)", label: "#7FAE7B" },
  "Security & Systems":   { dot: "#F2C4A0", rowBg: "rgba(242,196,160,0.13)", label: "#E8A468" },
};
function accentFor(cat: string) {
  return CAT_ACCENT[cat] ?? { dot: "#8FA3E3", rowBg: "rgba(143,163,227,0.09)", label: "#6B82CE" };
}

/* animated counter */
function useCounter(target: number, active: boolean, ms = 1400) {
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

/* scroll fade-in */
function useFadeIn(threshold = 0.12) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

const STEPS = [
  {
    n: "01", color: "#6B82CE", title: "Choose a track",
    body: "Pick any engineering discipline. Each track is a curated milestone trail built for real job readiness.",
  },
  {
    n: "02", color: "#7FAE7B", title: "Follow milestones",
    body: "Every milestone has concept readers, code examples, and curated resources. Mark topics done as you go.",
  },
  {
    n: "03", color: "#E8A468", title: "Earn certificate",
    body: "Finish 100% of a track to unlock a shareable verified certificate. No shortcuts — 100% means 100%.",
  },
];

const TRAIL_NODES = ["Linux", "Networking", "Git & CI/CD", "Docker", "Kubernetes"];
const HERO_NODES  = ["Linux & OS", "Networking", "Git & CI/CD", "Docker", "Kubernetes", "Terraform", "Monitoring"];

export default function HomePage() {
  const [subjects, setSubjects]         = useState<SubjectItem[]>([]);
  const [loading, setLoading]           = useState(true);
  const [selectedCat, setSelectedCat]   = useState("All");
  const [heroReady, setHeroReady]       = useState(false);
  const [countersActive, setCountersActive] = useState(false);

  const categories = ["All", "Software Engineering", "DevOps & Cloud", "Data & AI", "Security & Systems"];

  const trackCount  = useCounter(subjects.length || 6, countersActive);
  const topicCount  = useCounter(400, countersActive);

  const howRef    = useFadeIn();
  const tracksRef = useFadeIn();
  const ctaRef    = useFadeIn();

  useEffect(() => {
    const t = setTimeout(() => setHeroReady(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    fetch("/api/subjects")
      .then(r => r.json())
      .then(d => {
        if (d.subjects) setSubjects(d.subjects);
        setLoading(false);
        setCountersActive(true);
      })
      .catch(() => { setLoading(false); setCountersActive(true); });
  }, []);

  const filtered = selectedCat === "All" ? subjects : subjects.filter(s => s.category === selectedCat);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col overflow-x-hidden">
      <Navbar />

      {/* ══════════════ HERO ══════════════ */}
      <section className="lp2-hero">
        {/* ambient orbs */}
        <div className="lp2-orb lp2-orb-1" />
        <div className="lp2-orb lp2-orb-2" />
        <div className="lp2-orb lp2-orb-3" />

        <div className="lp2-hero-inner">

          {/* copy */}
          <div className={`lp2-copy${heroReady ? " lp2-copy-in" : ""}`}>
            <p className="lp2-eyebrow">Learning infrastructure for engineers</p>

            <h1 className="lp2-h1">
              <span className="lp2-word" style={{ transitionDelay: "0ms"   }}>Build your</span>
              <em   className="lp2-word lp2-em" style={{ transitionDelay: "110ms" }}>engineering</em>
              <span className="lp2-word" style={{ transitionDelay: "220ms" }}>career.</span>
            </h1>

            <p className="lp2-lead">
              Structured milestone trails across DevOps, Cloud, AI, Full&nbsp;Stack,
              Cybersecurity and more — with concept readers, real resources,
              and verified certificates.
            </p>

            <div className="lp2-cta-row">
              <Link href="/roadmap/devops" className="lp2-btn-primary">
                Pick a track <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/login" className="lp2-btn-ghost">Sign in</Link>
            </div>

            <div className="lp2-avatars">
              <div className="lp2-av" style={{ background: "var(--periwinkle)" }}>A</div>
              <div className="lp2-av" style={{ background: "var(--sage)" }}>S</div>
              <div className="lp2-av" style={{ background: "var(--peach)", color: "var(--ink)" }}>L</div>
              <span className="lp2-av-label">Join learners building real skills</span>
            </div>
          </div>

          {/* stats + glass card */}
          <div className={`lp2-right${heroReady ? " lp2-right-in" : ""}`}>
            <div className="lp2-stats">
              <div className="lp2-stat">
                <span className="lp2-stat-num">
                  {loading ? "—" : trackCount}
                </span>
                <span className="lp2-stat-label">engineering tracks</span>
              </div>
              <div className="lp2-stat">
                <span className="lp2-stat-num">
                  {loading ? "—" : `${topicCount}+`}
                </span>
                <span className="lp2-stat-label">concepts &amp; topics</span>
              </div>
            </div>

            <div className="lp2-glass-card">
              <div className="lp2-card-header">
                <span className="lp2-card-title">DevOps Engineering</span>
                <span className="lp2-card-badge">7 steps</span>
              </div>

              <div className="lp2-trail-row">
                <div className="lp2-trail-line" />
                {HERO_NODES.map((name, i) => (
                  <div
                    key={i}
                    className={`lp2-tnode ${i < 3 ? "done" : i === 3 ? "active" : "upcoming"}`}
                    title={name}
                  >
                    {i < 3 && <CheckCheck className="w-3 h-3 text-white" />}
                  </div>
                ))}
              </div>

              <div className="lp2-progress-bar">
                <div className="lp2-progress-fill" />
              </div>
              <p className="lp2-card-meta">Active: Containerization (Docker) &middot; 43%</p>
              <Link href="/roadmap/devops" className="lp2-card-cta">
                Continue Trail <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════ HOW IT WORKS ══════════════ */}
      <section
        className={`lp2-how${howRef.visible ? " lp2-sec-in" : " lp2-sec-out"}`}
        ref={howRef.ref as React.RefObject<HTMLElement>}
      >
        <div className="lp2-how-inner">
          <p className="lp2-sec-tag">How it works</p>
          <div className="lp2-steps">
            {STEPS.map((s) => (
              <div key={s.n} className="lp2-step" style={{ "--step-color": s.color } as React.CSSProperties}>
                <span className="lp2-step-n" style={{ color: s.color }}>{s.n}</span>
                <div className="lp2-step-divider" />
                <h3 className="lp2-step-title">{s.title}</h3>
                <p className="lp2-step-body">{s.body}</p>
                <ArrowRight className="lp2-step-arrow w-4 h-4" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ TRACKS ══════════════ */}
      <section
        id="pathways"
        className={`lp2-tracks${tracksRef.visible ? " lp2-sec-in" : " lp2-sec-out"}`}
        ref={tracksRef.ref as React.RefObject<HTMLElement>}
      >
        <div className="lp2-tracks-inner">
          <div className="lp2-tracks-hdr">
            <h2 className="lp2-tracks-title">Engineering pathways</h2>
            <nav className="lp2-tab-row">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCat(cat)}
                  className={`lp2-tab${selectedCat === cat ? " active" : ""}`}
                >
                  {cat}
                </button>
              ))}
            </nav>
          </div>

          <div className="lp2-track-list">
            {loading
              ? [1,2,3,4].map(n => <div key={n} className="lp2-track-skeleton" />)
              : filtered.map((sub, i) => {
                  const a = accentFor(sub.category);
                  return (
                    <Link
                      key={sub.id}
                      href={`/roadmap/${sub.slug}`}
                      className="lp2-track-card"
                      style={{ borderLeftColor: a.dot }}
                    >
                      <span className="lp2-card-idx" style={{ color: a.dot }}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="lp2-card-body">
                        <div className="lp2-card-title-row">
                          <span className="lp2-card-name">{sub.title}</span>
                          <span className="lp2-cat-pill" style={{ background: a.rowBg, color: a.label }}>
                            {sub.category}
                          </span>
                        </div>
                        <p className="lp2-card-desc">{sub.description}</p>
                        {sub.progressPercent > 0 && (
                          <div className="lp2-row-prog" style={{ marginTop: "8px" }}>
                            <div className="lp2-row-prog-fill" style={{ width: `${sub.progressPercent}%`, background: a.dot }} />
                            <span className="lp2-row-prog-label" style={{ color: a.label }}>{sub.progressPercent}%</span>
                          </div>
                        )}
                      </div>
                      <div className="lp2-card-chips">
                        <span className="lp2-chip" style={{ borderColor: a.dot, color: a.label }}>
                          {sub.milestonesCount} milestones
                        </span>
                        <span className="lp2-chip" style={{ borderColor: "var(--sage-deep)", color: "var(--sage-deep)" }}>
                          {sub.topicsCount} topics
                        </span>
                      </div>
                      <ArrowRight className="lp2-card-arrow w-5 h-5 flex-shrink-0" style={{ color: a.dot }} />
                    </Link>
                  );
                })}
          </div>
        </div>
      </section>

      {/* ══════════════ CTA — OPTION A ══════════════ */}
      <section
        className={`lp2-cta${ctaRef.visible ? " lp2-sec-in" : " lp2-sec-out"}`}
        ref={ctaRef.ref as React.RefObject<HTMLElement>}
      >
        {/* left dark panel */}
        <div className="lp2-cta-left">
          <h2 className="lp2-cta-h2">Start your engineering journey.</h2>
          <p className="lp2-cta-sub">
            {subjects.length || 6} tracks.&nbsp;400+ topics.&nbsp;Verified certificates.
          </p>
          <div className="lp2-cta-btns">
            <Link href="/register" className="lp2-cta-primary">
              Create account <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/login" className="lp2-cta-ghost">Sign in</Link>
          </div>
        </div>

        {/* right gradient panel */}
        <div className="lp2-cta-right">
          <p className="lp2-cta-trail-label">DevOps Engineering milestone trail</p>
          <div className="lp2-cta-trail">
            <div className="lp2-cta-trail-line" />
            {TRAIL_NODES.map((name, i) => (
              <div
                key={i}
                className={`lp2-cta-node ${i < 3 ? "done" : i === 3 ? "active" : "upcoming"}`}
                title={name}
              >
                {i < 3 && <CheckCircle2 className="w-5 h-5 text-white" />}
              </div>
            ))}
          </div>
          <div className="lp2-cta-labels">
            {TRAIL_NODES.map(n => <span key={n}>{n}</span>)}
          </div>
        </div>
      </section>

      {/* ══════════════ FOOTER ══════════════ */}
      <footer className="lp2-footer">
        <span>Roadmap.ai &copy; 2026</span>
        <span>Built for engineers, by engineers.</span>
      </footer>
    </div>
  );
}
