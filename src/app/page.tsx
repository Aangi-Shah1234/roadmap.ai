"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  BookOpen,
  Award,
  TrendingUp
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

      <section className="new-hero">
        <div>
          <div className="hero-badge">✨ 8 Engineering Tracks · 400+ Topics</div>
          <h1 className="hero-headline">Engineer your future,<br/>one milestone at a time.</h1>
          <p className="hero-sub">Personalized, milestone-driven learning trails across the full IT spectrum.</p>
          <div className="flex gap-4 items-center">
            <Link href="/roadmap/devops" className="cta-primary-new">Start Learning &rarr;</Link>
            <a href="#pathways" className="cta-ghost-new">Browse all tracks</a>
          </div>
          <div className="mt-8 flex items-center gap-4">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-[var(--periwinkle)] flex items-center justify-center text-white text-xs font-bold ring-2 ring-white">A</div>
              <div className="w-8 h-8 rounded-full bg-[var(--sage)] flex items-center justify-center text-white text-xs font-bold ring-2 ring-white">S</div>
              <div className="w-8 h-8 rounded-full bg-[var(--peach)] flex items-center justify-center text-white text-xs font-bold ring-2 ring-white">L</div>
            </div>
            <span className="text-sm text-[var(--ink-soft)] font-medium">Join learners building real skills</span>
          </div>
        </div>
        
        <div>
          <div className="hero-card">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg">DevOps Engineering</h3>
              <span className="px-3 py-1 bg-[var(--periwinkle)]/10 text-[var(--periwinkle-deep)] rounded-full text-xs font-bold">7 steps</span>
            </div>
            
            <div className="hero-trail-nodes">
              <div className="hero-node done">✓</div>
              <div className="hero-node done">✓</div>
              <div className="hero-node done">✓</div>
              <div className="hero-node active"></div>
              <div className="hero-node upcoming"></div>
              <div className="hero-node upcoming"></div>
              <div className="hero-node upcoming"></div>
            </div>
            
            <div className="text-xs text-[var(--ink-soft)] font-semibold mt-4 mb-2">Active: Containerization (Docker)</div>
            <div className="w-full bg-[var(--line)] h-2 rounded-full mb-6">
              <div className="bg-[var(--periwinkle)] h-2 rounded-full" style={{ width: '42%' }}></div>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-[var(--ink-soft)]">Continue Trail &rarr;</span>
            </div>
          </div>
        </div>
      </section>

      <section className="feature-strip">
        <div className="inner">
          <div className="item">
            <TrendingUp className="w-8 h-8" />
            <span className="font-semibold">Track your progress across every milestone</span>
          </div>
          <div className="item">
            <BookOpen className="w-8 h-8" />
            <span className="font-semibold">Interactive concept readers with real examples</span>
          </div>
          <div className="item">
            <Award className="w-8 h-8" />
            <span className="font-semibold">Earn verified certificates on 100% completion</span>
          </div>
        </div>
      </section>

      <section id="pathways" className="max-w-[1240px] mx-auto px-6 py-20 w-full">
        <h2 className="font-display text-3xl font-bold text-center mb-10 text-[var(--ink)]">Explore all engineering pathways</h2>
        
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs font-semibold px-4 py-2 rounded-full transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[var(--periwinkle-deep)] text-white shadow-sm"
                  : "bg-[var(--surface)] border border-[var(--line)] text-[var(--ink-soft)] hover:text-[var(--ink)]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-48 rounded-2xl bg-[var(--surface)] border border-[var(--line)] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSubjects.map((sub) => {
              const themeColor = sub.category.includes('DevOps') ? 'periwinkle' : sub.category.includes('Security') ? 'peach' : 'sage';
              
              return (
                <Link key={sub.id} href={`/roadmap/${sub.slug}`} className={`track-card-new ${themeColor}`}>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-[var(--line)] text-[var(--ink-soft)]">
                      {sub.category}
                    </span>
                    <span className="text-xs font-bold text-[var(--ink-soft)]">
                      {sub.milestonesCount} Steps · {sub.topicsCount} Topics
                    </span>
                  </div>
                  
                  <h3 className="font-display text-2xl font-bold mb-2">{sub.title}</h3>
                  <p className="text-sm text-[var(--ink-soft)] line-clamp-2 mb-4 flex-1">{sub.description}</p>
                  
                  {sub.progressPercent > 0 && (
                    <div className="w-full h-1 bg-[var(--line)] rounded-full mb-4">
                      <div className="h-full bg-[var(--periwinkle-deep)] rounded-full" style={{ width: `${sub.progressPercent}%` }} />
                    </div>
                  )}
                  
                  <div className="text-right text-sm font-bold mt-auto pt-4 border-t border-[var(--line)] text-[var(--ink-soft)]">
                    Start trail &rarr;
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
      
      <footer className="border-t border-[var(--line)] py-8 text-center text-xs text-[var(--ink-soft)] font-medium">
        <p>Roadmap.ai &copy; 2026. Empowering learners across the entire Information Technology spectrum.</p>
      </footer>
    </div>
  );
}
