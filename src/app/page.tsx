"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  Terminal,
  Cloud,
  ArrowRight,
  ArrowUpRight,
  Users,
  Compass,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Layers,
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

export default function HomePage() {
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = [
    "All",
    "Software Engineering",
    "DevOps & Cloud",
    "Data & AI",
    "Security & Systems",
  ];

  useEffect(() => {
    fetch("/api/subjects")
      .then((res) => res.json())
      .then((data) => {
        if (data.subjects) setSubjects(data.subjects);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredSubjects =
    selectedCategory === "All"
      ? subjects
      : subjects.filter((s) => s.category === selectedCategory);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col transition-colors duration-200">
      <Navbar />

      {/* HERO SECTION */}
      <section className="hero">
        <div>
          <h1>
            Your path to
            <br />
            modern IT &amp; tech
            <br />
            mastery
          </h1>
          <p className="lede">
            Follow visual, milestone-driven trails across the whole IT spectrum — from
            Software Engineering and DevOps to AI, Cloud Architecture, Cybersecurity, and
            System Design.
          </p>
          <div className="cta-row">
            <Link href="/roadmap/devops" className="cta-primary">
              Start the trail &rarr;
            </Link>
            <a href="#pathways" className="cta-secondary">
              See all IT tracks
            </a>
          </div>
        </div>

        {/* Hero Trail Illustration with Exact Dot-Dot Connectors */}
        <div className="hero-trail">
          <svg viewBox="0 0 460 490" fill="none" className="w-full h-full pointer-events-none">
            {/* Dot connector 1: from wp-1 (Linux & Docker) down-right to wp-2 (Learning Velocity) */}
            <line
              x1="180"
              y1="85"
              x2="330"
              y2="225"
              strokeWidth="4.5"
              strokeDasharray="0 14"
              strokeLinecap="round"
              className="trail-dot-line"
            />
            {/* Dot connector 2: from wp-2 (Learning Velocity) down-left to wp-3 (Kubernetes Basics) */}
            <line
              x1="300"
              y1="260"
              x2="150"
              y2="380"
              strokeWidth="4.5"
              strokeDasharray="0 14"
              strokeLinecap="round"
              className="trail-dot-line"
            />
          </svg>

          <div className="waypoint-card done wp-1">
            <span
              className="tag"
              style={{ background: "#E9F3E8", color: "var(--sage-deep)" }}
            >
              Step 04 · live
            </span>
            <h4>Linux &amp; Docker Fundamentals</h4>
            <p>Bash scripting, container orchestration, and CI/CD pipelines.</p>
          </div>

          <div className="waypoint-card wp-2">
            <span className="tag tag-sage">
              Learning velocity
            </span>
            <h4 className="flex items-center gap-1.5">
              +84%{" "}
              <span className="text-[11px] text-[var(--sage-deep)] font-bold">
                this week
              </span>
            </h4>
            <p>You&apos;re moving faster than 8 in 10 learners on this trail.</p>
          </div>

          <div className="waypoint-card wp-3">
            <span className="tag tag-peach">
              Up next
            </span>
            <h4>Kubernetes Basics</h4>
            <p>Pods, services, and your first cluster deploy.</p>
          </div>
        </div>
      </section>

      {/* SECTION DIVIDER */}
      <div className="section-divider">why learners stay on the trail</div>

      {/* 3 STRIP FEATURE CARDS */}
      <section className="strip">
        <div className="strip-grid">
          <div className="strip-card">
            <div className="icon">🌿</div>
            <h3>Join the community</h3>
            <p>
              Connect with other developers walking the same trail, trade notes,
              and get unstuck faster.
            </p>
          </div>
          <div className="strip-card">
            <div className="icon">🧭</div>
            <h3>Interactive trails</h3>
            <p>
              A step navigator with automatic layout — no zooming or dragging
              required to find your place.
            </p>
          </div>
          <div className="strip-card">
            <div className="icon">🍑</div>
            <h3>Whole IT spectrum</h3>
            <p>
              8 structured career tracks across Software Engineering, DevOps, Cloud, AI/ML, Security, and Architecture.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION DIVIDER */}
      <div id="pathways" className="section-divider">
        explore all IT career tracks
      </div>

      {/* CATEGORY FILTER TABS */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8 max-w-[1240px] mx-auto px-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`text-xs font-semibold px-4 py-2 rounded-full transition-all cursor-pointer ${
              selectedCategory === cat
                ? "bg-[var(--periwinkle-deep)] text-white shadow-sm"
                : "ghost-pill hover:text-[var(--ink)]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* FEATURED TRACKS LIST */}
      <section className="max-w-[1240px] mx-auto px-6 sm:px-12 pb-24 w-full">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-48 rounded-2xl bg-[var(--surface)] border border-[var(--line)] animate-pulse p-6"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSubjects.map((sub) => (
              <Link
                key={sub.id}
                href={`/roadmap/${sub.slug}`}
                className="p-8 rounded-2xl bg-[var(--surface)] border border-[var(--line)] hover:border-[var(--periwinkle)] transition-all duration-200 flex flex-col justify-between group shadow-sm hover:shadow-md hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#EDEFFA] dark:bg-[var(--line)] text-[var(--periwinkle-deep)]">
                      {sub.category}
                    </span>
                    <span className="text-xs font-bold text-[var(--ink-soft)]">
                      {sub.milestonesCount} Steps · {sub.topicsCount} Topics
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold font-display text-[var(--ink)] tracking-tight mb-2">
                    {sub.title}
                  </h3>
                  <p className="text-sm text-[var(--ink-soft)] leading-relaxed line-clamp-2">
                    {sub.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-[var(--line)] flex items-center justify-between text-xs font-semibold text-[var(--ink-soft)]">
                  <span>Structured learning trail</span>
                  <span className="text-[var(--periwinkle-deep)] font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Start trail &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[var(--line)] py-8 px-8 text-center text-xs text-[var(--ink-soft)] font-medium">
        <p>Roadmap.ai &copy; 2026. Empowering learners across the entire Information Technology spectrum.</p>
      </footer>
    </div>
  );
}
