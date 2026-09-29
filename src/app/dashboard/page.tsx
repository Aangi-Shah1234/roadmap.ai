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
          <Link href="/dashboard" className="active"><LayoutDashboard className="w-4 h-4" /> Overview</Link>
          <Link href="/dashboard"><Map className="w-4 h-4" /> My Tracks</Link>
          <Link href="/dashboard"><TrendingUp className="w-4 h-4" /> Progress</Link>
          <Link href="/dashboard"><Award className="w-4 h-4" /> Certificates</Link>
        </div>
        
        <div className="dash-nav mt-auto">
          <Link href="/dashboard"><Settings className="w-4 h-4" /> Settings</Link>
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 text-sm font-semibold text-rose-500 hover:bg-rose-50 rounded-lg text-left w-full">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>
      
      <div className="dash-main">
        <div className="mb-10">
          <h1 className="font-display text-4xl font-bold text-[var(--ink)] mb-2">Welcome back, {user.name}</h1>
          <p className="text-[var(--ink-soft)] font-medium">Pick up where you left off</p>
        </div>
        
        <div className="dash-stats">
          <div className="bg-[#E9F3E8] p-6 rounded-2xl flex items-center justify-between border border-[#CFE3CE]">
            <div>
              <div className="text-[11px] font-bold text-[var(--sage-deep)] uppercase mb-2">Active Tracks</div>
              <div className="text-3xl font-bold text-[var(--ink)]">{subjects.length}</div>
            </div>
            <BookOpen className="w-8 h-8 text-[var(--sage-deep)] opacity-50" />
          </div>
          
          <div className="bg-[#EDEFFA] p-6 rounded-2xl flex items-center justify-between border border-[#D3DBF4]">
            <div>
              <div className="text-[11px] font-bold text-[var(--periwinkle-deep)] uppercase mb-2">Topics Mastered</div>
              <div className="text-3xl font-bold text-[var(--ink)]">{completedTopicsOverall} <span className="text-lg text-[var(--ink-soft)]">/ {totalTopicsOverall}</span></div>
            </div>
            <CheckCircle2 className="w-8 h-8 text-[var(--periwinkle-deep)] opacity-50" />
          </div>
          
          <div className="bg-[#FBEADA] p-6 rounded-2xl flex items-center justify-between border border-[#F0D7C3]">
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
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display text-2xl font-bold text-[var(--ink)]">Your Enrolled Tracks</h2>
          {user.role === 'admin' && (
            <Link href="/admin" className="text-sm font-bold text-[var(--periwinkle-deep)] hover:underline">Go to Admin Studio &rarr;</Link>
          )}
        </div>
        
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
                  </div>
                  <h3 className="font-display text-xl font-bold mb-4 text-[var(--ink)]">{sub.title}</h3>
                  <div className="flex items-center gap-4 text-xs font-semibold text-[var(--ink-soft)] mb-2">
                    <span>{sub.completedCount} / {sub.topicsCount} completed</span>
                    <span>{sub.progressPercent}%</span>
                  </div>
                  <div className="w-full bg-[var(--line)] h-1.5 rounded-full">
                    <div className="bg-[var(--periwinkle-deep)] h-1.5 rounded-full" style={{ width: `${sub.progressPercent}%` }}></div>
                  </div>
                </div>
                <div className="flex flex-col justify-center gap-3 border-l border-[var(--line)] pl-6 min-w-[200px]">
                  {sub.progressPercent === 100 ? (
                    <button
                      onClick={() => setCertTrack(sub)}
                      className="text-xs font-bold px-4 py-2 bg-[#E9F3E8] text-[var(--sage-deep)] rounded-lg flex items-center justify-center gap-2"
                    >
                      <Award className="w-4 h-4" /> Claim Certificate
                    </button>
                  ) : (
                    <div className="text-xs font-bold px-4 py-2 bg-[var(--bg)] text-[var(--ink-soft)] rounded-lg flex items-center justify-center gap-2 opacity-70">
                      <Lock className="w-4 h-4" /> Certificate Locked
                    </div>
                  )}
                  <Link href={`/roadmap/${sub.slug}`} className="text-xs font-bold px-4 py-2 bg-[var(--ink)] text-[var(--bg)] rounded-lg flex items-center justify-center text-center hover:bg-[var(--periwinkle-deep)] transition">
                    Continue Trail &rarr;
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
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
