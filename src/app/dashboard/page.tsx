"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import CertificateModal from "@/components/CertificateModal";
import {
  Trophy,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  LayoutDashboard,
  ShieldCheck,
  Award,
  Lock,
  Settings,
  LogOut,
  Map,
  TrendingUp
} from "lucide-react";

interface SubjectProgress {
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
  topicIds?: string[];
  completedTopicIds?: string[];
}

interface UserInfo {
  userId: string;
  name: string;
  email: string;
  role: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [subjects, setSubjects] = useState<SubjectProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [certTrack, setCertTrack] = useState<SubjectProgress | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "tracks" | "progress" | "certificates">("overview");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) {
          router.push("/login");
          return;
        }
        setUser(data.user);
        const userKey = data.user.email || data.user.userId || "default";

        fetch("/api/subjects", { cache: "no-store" })
          .then((res) => res.json())
          .then((subData) => {
            if (subData.subjects) {
              let localAdded = new Set<string>();
              let localRemoved = new Set<string>();
              try {
                const raw = localStorage.getItem("roadmap_local_progress_v1");
                if (raw) {
                  const parsed = JSON.parse(raw);
                  const entry = parsed[userKey];
                  if (entry) {
                    localAdded = new Set(entry.added || []);
                    localRemoved = new Set(entry.removed || []);
                  }
                }
              } catch {
                // ignore
              }

              const mergedSubjects = (subData.subjects as SubjectProgress[]).map((s) => {
                if (!s.topicIds || s.topicIds.length === 0) return s;
                const set = new Set(s.completedTopicIds || []);
                for (const tId of s.topicIds) {
                  if (localAdded.has(tId)) set.add(tId);
                  if (localRemoved.has(tId)) set.delete(tId);
                }
                const completedCount = set.size;
                const progressPercent =
                  s.topicsCount > 0 ? Math.round((completedCount / s.topicsCount) * 100) : 0;
                return {
                  ...s,
                  completedCount,
                  progressPercent,
                };
              });

              setSubjects(mergedSubjects);
            }
            setLoading(false);
          });
      })
      .catch(() => {
        router.push("/login");
      });
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
  };

  if (loading || !user) return null;

  const totalTopicsOverall = subjects.reduce((acc, s) => acc + s.topicsCount, 0);
  const completedTopicsOverall = subjects.reduce((acc, s) => acc + s.completedCount, 0);
  const overallPercent =
    totalTopicsOverall > 0
      ? Math.round((completedTopicsOverall / totalTopicsOverall) * 100)
      : 0;

  const activeCircumference = 2 * Math.PI * 16;
  const activeOffset = activeCircumference - (overallPercent / 100) * activeCircumference;

  return (
    <div className="dashboard-shell bg-[var(--bg)]">
      <div className="dash-sidebar">
        <div className="flex flex-col items-center">
          <div className="dash-avatar">{user.name.charAt(0).toUpperCase()}</div>
          <div className="font-bold text-[var(--ink)]">{user.name}</div>
          <div className="text-[10px] uppercase tracking-wide font-bold px-3 py-1 bg-[var(--line)] rounded-full mt-2 text-[var(--ink-soft)]">
            {user.role === 'admin' ? 'Admin Studio' : 'Learner'}
          </div>
        </div>
        
        <div className="w-full h-px bg-[var(--line)] my-6"></div>
        
        <div className="dash-nav flex-1">
          <button onClick={() => setActiveTab("overview")} className={activeTab === "overview" ? "active" : ""}><LayoutDashboard className="w-4 h-4" /> Overview</button>
          <button onClick={() => setActiveTab("tracks")} className={activeTab === "tracks" ? "active" : ""}><Map className="w-4 h-4" /> My Tracks</button>
          <button onClick={() => setActiveTab("progress")} className={activeTab === "progress" ? "active" : ""}><TrendingUp className="w-4 h-4" /> Progress</button>
          <button onClick={() => setActiveTab("certificates")} className={activeTab === "certificates" ? "active" : ""}><Award className="w-4 h-4" /> Certificates</button>
        </div>
        
        <div className="dash-nav mt-auto">
          <button onClick={() => setActiveTab("overview")} className="flex items-center gap-3 px-3 py-2 text-sm font-semibold text-[var(--ink-soft)] hover:bg-[var(--bg)] rounded-lg text-left w-full"><Settings className="w-4 h-4" /> Settings</button>
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 text-sm font-semibold text-rose-500 hover:bg-rose-50 rounded-lg text-left w-full">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>
      
      <div className="dash-main">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-4xl font-bold text-[var(--ink)] mb-1">Welcome back, {user.name}</h1>
            <p className="text-[var(--ink-soft)] font-medium">Pick up where you left off</p>
          </div>
          {user.role === 'admin' && (
            <Link href="/admin" className="text-sm font-bold text-[var(--periwinkle-deep)] hover:underline">Admin Studio &rarr;</Link>
          )}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <>
            <div className="dash-stats">
              <div className="bg-[#E9F3E8] dark:bg-[rgba(168,201,165,0.15)] p-6 rounded-2xl flex items-center justify-between border border-[#CFE3CE] dark:border-[rgba(168,201,165,0.2)]">
                <div>
                  <div className="text-[11px] font-bold text-[var(--sage-deep)] uppercase mb-2">Active Tracks</div>
                  <div className="text-3xl font-bold text-[var(--ink)]">{subjects.length}</div>
                </div>
                <BookOpen className="w-8 h-8 text-[var(--sage-deep)] opacity-50" />
              </div>
              <div className="bg-[#EDEFFA] dark:bg-[rgba(143,163,227,0.15)] p-6 rounded-2xl flex items-center justify-between border border-[#D3DBF4] dark:border-[rgba(143,163,227,0.2)]">
                <div>
                  <div className="text-[11px] font-bold text-[var(--periwinkle-deep)] uppercase mb-2">Topics Mastered</div>
                  <div className="text-3xl font-bold text-[var(--ink)]">{completedTopicsOverall} <span className="text-lg text-[var(--ink-soft)]">/ {totalTopicsOverall}</span></div>
                </div>
                <CheckCircle2 className="w-8 h-8 text-[var(--periwinkle-deep)] opacity-50" />
              </div>
              <div className="bg-[#FBEADA] dark:bg-[rgba(242,196,160,0.15)] p-6 rounded-2xl flex items-center justify-between border border-[#F0D7C3] dark:border-[rgba(242,196,160,0.2)]">
                <div>
                  <div className="text-[11px] font-bold text-[var(--peach-deep)] uppercase mb-2">Overall</div>
                  <div className="text-3xl font-bold text-[var(--ink)]">{overallPercent}%</div>
                </div>
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-[var(--peach-deep)] absolute" />
                  <svg className="w-12 h-12 transform -rotate-90">
                    <circle cx="24" cy="24" r="16" fill="transparent" stroke="rgba(0,0,0,0.05)" strokeWidth="4" />
                    <circle cx="24" cy="24" r="16" fill="transparent" stroke="var(--peach-deep)" strokeWidth="4" strokeDasharray={activeCircumference} strokeDashoffset={activeOffset} strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6 mt-10">
              <h2 className="font-display text-2xl font-bold text-[var(--ink)]">Your Enrolled Tracks</h2>
            </div>
            <div className="flex flex-col gap-4">
              {subjects.slice(0, 3).map((sub, i) => {
                const colors = ['bg-[var(--periwinkle)]', 'bg-[var(--sage)]', 'bg-[var(--peach)]'];
                const colorClass = colors[i % colors.length];
                return (
                  <div key={sub.id} className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-6 flex gap-6 shadow-sm hover:border-[var(--periwinkle)] transition-colors">
                    <div className={`track-accent-bar ${colorClass}`}></div>
                    <div className="flex-1">
                      <div className="flex gap-2 items-center mb-2">
                        <span className="text-[10px] font-bold px-2 py-1 bg-[var(--line)] rounded text-[var(--ink-soft)] uppercase">{sub.category}</span>
                      </div>
                      <h3 className="font-display text-xl font-bold mb-3 text-[var(--ink)]">{sub.title}</h3>
                      <div className="flex items-center gap-4 text-xs font-semibold text-[var(--ink-soft)] mb-2">
                        <span>{sub.completedCount} / {sub.topicsCount} completed</span>
                        <span>{sub.progressPercent}%</span>
                      </div>
                      <div className="w-full bg-[var(--line)] h-1.5 rounded-full">
                        <div className="bg-[var(--periwinkle-deep)] h-1.5 rounded-full" style={{ width: `${sub.progressPercent}%` }}></div>
                      </div>
                    </div>
                    <div className="flex flex-col justify-center gap-3 border-l border-[var(--line)] pl-6 min-w-[180px]">
                      <Link href={`/roadmap/${sub.slug}`} className="text-xs font-bold px-4 py-2 bg-[var(--periwinkle-deep)] text-white rounded-lg flex items-center justify-center text-center hover:opacity-90 transition">
                        Continue Trail &rarr;
                      </Link>
                    </div>
                  </div>
                );
              })}
              {subjects.length > 3 && (
                <button onClick={() => setActiveTab("tracks")} className="text-sm font-semibold text-[var(--periwinkle-deep)] hover:underline mt-2 text-left">
                  View all {subjects.length} tracks &rarr;
                </button>
              )}
            </div>
          </>
        )}

        {/* MY TRACKS TAB */}
        {activeTab === "tracks" && (
          <>
            <h2 className="font-display text-2xl font-bold text-[var(--ink)] mb-6">All My Tracks</h2>
            <div className="flex flex-col gap-4">
              {subjects.map((sub, i) => {
                const colors = ['bg-[var(--periwinkle)]', 'bg-[var(--sage)]', 'bg-[var(--peach)]'];
                const colorClass = colors[i % colors.length];
                return (
                  <div key={sub.id} className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-6 flex gap-6 shadow-sm hover:border-[var(--periwinkle)] transition-colors">
                    <div className={`track-accent-bar ${colorClass}`}></div>
                    <div className="flex-1">
                      <div className="flex gap-2 items-center mb-2">
                        <span className="text-[10px] font-bold px-2 py-1 bg-[var(--line)] rounded text-[var(--ink-soft)] uppercase">{sub.category}</span>
                        <span className="text-[10px] text-[var(--ink-soft)]">{sub.milestonesCount} milestones · {sub.topicsCount} topics</span>
                      </div>
                      <h3 className="font-display text-xl font-bold mb-3 text-[var(--ink)]">{sub.title}</h3>
                      <p className="text-sm text-[var(--ink-soft)] mb-3 line-clamp-1">{sub.description}</p>
                      <div className="flex items-center gap-4 text-xs font-semibold text-[var(--ink-soft)] mb-2">
                        <span>{sub.completedCount} / {sub.topicsCount} completed</span>
                        <span>{sub.progressPercent}%</span>
                      </div>
                      <div className="w-full bg-[var(--line)] h-1.5 rounded-full">
                        <div className="bg-[var(--periwinkle-deep)] h-1.5 rounded-full" style={{ width: `${sub.progressPercent}%` }}></div>
                      </div>
                    </div>
                    <div className="flex flex-col justify-center gap-3 border-l border-[var(--line)] pl-6 min-w-[180px]">
                      <Link href={`/roadmap/${sub.slug}`} className="text-xs font-bold px-4 py-2 bg-[var(--periwinkle-deep)] text-white rounded-lg flex items-center justify-center text-center hover:opacity-90 transition">
                        Open Trail &rarr;
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* PROGRESS TAB */}
        {activeTab === "progress" && (
          <>
            <h2 className="font-display text-2xl font-bold text-[var(--ink)] mb-6">Progress Overview</h2>
            <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-8 mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="font-bold text-[var(--ink)]">Overall Completion</span>
                <span className="text-2xl font-bold text-[var(--periwinkle-deep)]">{overallPercent}%</span>
              </div>
              <div className="w-full bg-[var(--line)] h-3 rounded-full mb-2">
                <div className="bg-[var(--periwinkle-deep)] h-3 rounded-full transition-all" style={{ width: `${overallPercent}%` }}></div>
              </div>
              <p className="text-sm text-[var(--ink-soft)] mt-2">{completedTopicsOverall} of {totalTopicsOverall} total topics completed across all tracks</p>
            </div>
            <div className="flex flex-col gap-3">
              {subjects.map((sub, i) => {
                const barColors = ['var(--periwinkle-deep)', 'var(--sage-deep)', 'var(--peach-deep)'];
                const barColor = barColors[i % barColors.length];
                return (
                  <div key={sub.id} className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="font-bold text-[var(--ink)] text-sm">{sub.title}</div>
                        <div className="text-xs text-[var(--ink-soft)]">{sub.completedCount} / {sub.topicsCount} topics</div>
                      </div>
                      <span className="font-bold text-lg" style={{ color: barColor }}>{sub.progressPercent}%</span>
                    </div>
                    <div className="w-full bg-[var(--line)] h-2 rounded-full">
                      <div className="h-2 rounded-full transition-all" style={{ width: `${sub.progressPercent}%`, backgroundColor: barColor }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* CERTIFICATES TAB */}
        {activeTab === "certificates" && (
          <>
            <h2 className="font-display text-2xl font-bold text-[var(--ink)] mb-6">My Certificates</h2>
            <div className="flex flex-col gap-4">
              {subjects.map((sub) => (
                <div key={sub.id} className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-6 flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${sub.progressPercent === 100 ? 'bg-[#E9F3E8]' : 'bg-[var(--bg)]'}`}>
                    {sub.progressPercent === 100
                      ? <Award className="w-7 h-7 text-[var(--sage-deep)]" />
                      : <Lock className="w-7 h-7 text-[var(--ink-soft)] opacity-40" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-lg font-bold text-[var(--ink)]">{sub.title}</h3>
                    <p className="text-xs text-[var(--ink-soft)] mt-1">
                      {sub.progressPercent === 100
                        ? 'Track completed — certificate available'
                        : `${sub.progressPercent}% complete — finish the track to unlock`}
                    </p>
                    {sub.progressPercent < 100 && (
                      <div className="w-full bg-[var(--line)] h-1.5 rounded-full mt-3">
                        <div className="bg-[var(--periwinkle-deep)] h-1.5 rounded-full" style={{ width: `${sub.progressPercent}%` }}></div>
                      </div>
                    )}
                  </div>
                  {sub.progressPercent === 100 ? (
                    <button
                      onClick={() => setCertTrack(sub)}
                      className="text-xs font-bold px-5 py-2.5 bg-[var(--sage)] text-white rounded-xl flex items-center gap-2 hover:opacity-90 transition flex-shrink-0"
                    >
                      <Award className="w-4 h-4" /> Claim
                    </button>
                  ) : (
                    <Link href={`/roadmap/${sub.slug}`} className="text-xs font-bold px-5 py-2.5 bg-[var(--periwinkle-deep)] text-white rounded-xl hover:opacity-90 transition flex-shrink-0">
                      Continue &rarr;
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      
      {certTrack && certTrack.progressPercent === 100 && (
        <CertificateModal
          isOpen={!!certTrack}
          onClose={() => setCertTrack(null)}
          userName={user.name}
          trackTitle={certTrack.title}
          category={certTrack.category}
          milestonesCount={certTrack.milestonesCount}
          topicsCount={certTrack.topicsCount}
          completedCount={certTrack.completedCount}
          progressPercent={certTrack.progressPercent}
        />
      )}
    </div>
  );
}
