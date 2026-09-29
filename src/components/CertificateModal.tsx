"use client";

import { useState } from "react";
import { Award, Download, X, Check, Share2, ShieldCheck, Sparkles } from "lucide-react";

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  trackTitle: string;
  category: string;
  milestonesCount: number;
  topicsCount: number;
  completedCount: number;
  progressPercent: number;
}

export default function CertificateModal({
  isOpen,
  onClose,
  userName,
  trackTitle,
  category,
  milestonesCount,
  topicsCount,
  completedCount,
  progressPercent,
}: CertificateModalProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  const issueDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const certId = `RMAI-${new Date().getFullYear()}-${trackTitle
    .replace(/[^A-Za-z]/g, "")
    .slice(0, 4)
    .toUpperCase()}-${Math.abs(
    (userName + trackTitle).split("").reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0)
  )
    .toString(16)
    .slice(0, 5)
    .toUpperCase()}`;

  const handleDownloadPng = () => {
    setDownloading(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1600;
      canvas.height = 1120;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // 1. Background
      const grad = ctx.createLinearGradient(0, 0, 1600, 1120);
      grad.addColorStop(0, "#FAF7F2");
      grad.addColorStop(0.5, "#FFFFFF");
      grad.addColorStop(1, "#EEF2FC");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1600, 1120);

      // 2. Outer Decorative Border
      ctx.strokeStyle = "#5C66C9";
      ctx.lineWidth = 8;
      ctx.strokeRect(45, 45, 1510, 1030);

      // Inner Subtle Border
      ctx.strokeStyle = "#D3DBF4";
      ctx.lineWidth = 2;
      ctx.strokeRect(65, 65, 1470, 990);

      // Corner Accents
      const corners = [
        [45, 45],
        [1555, 45],
        [45, 1075],
        [1555, 1075],
      ];
      ctx.fillStyle = "#5C66C9";
      corners.forEach(([cx, cy]) => {
        ctx.beginPath();
        ctx.arc(cx, cy, 12, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Brand Header
      ctx.fillStyle = "#5C66C9";
      ctx.font = "bold 28px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("ROADMAP.AI  •  ENGINEERING ACADEMY", 800, 155);

      // Pill Subtitle
      ctx.fillStyle = "#4E8A47";
      ctx.font = "bold 20px sans-serif";
      ctx.fillText(`VERIFIED ${category.toUpperCase()} CREDENTIAL`, 800, 205);

      // 4. Main Certificate Title
      ctx.fillStyle = "#1E2235";
      ctx.font = "bold 64px Georgia, serif";
      ctx.fillText("Certificate of Mastery", 800, 300);

      // Divider line
      ctx.strokeStyle = "#8590F2";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(620, 335);
      ctx.lineTo(980, 335);
      ctx.stroke();

      // 5. Presented To
      ctx.fillStyle = "#5E6478";
      ctx.font = "italic 26px Georgia, serif";
      ctx.fillText("This is proudly presented to", 800, 405);

      // 6. Recipient Name
      ctx.fillStyle = "#1E2235";
      ctx.font = "bold 72px Georgia, serif";
      ctx.fillText(userName, 800, 500);

      // Name Underline
      ctx.strokeStyle = "#D3DBF4";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(450, 525);
      ctx.lineTo(1150, 525);
      ctx.stroke();

      // 7. Achievement Description
      ctx.fillStyle = "#5E6478";
      ctx.font = "26px sans-serif";
      ctx.fillText(
        "for successfully completing the structured engineering curriculum and milestones in",
        800,
        595
      );

      // 8. Track Title
      ctx.fillStyle = "#5C66C9";
      ctx.font = "bold 54px sans-serif";
      ctx.fillText(trackTitle, 800, 675);

      // 9. Metrics Pill
      ctx.fillStyle = "#1E2235";
      ctx.font = "bold 24px sans-serif";
      ctx.fillText(
        `${milestonesCount} Sequential Milestones   •   ${topicsCount} Engineering Topics   •   ${
          progressPercent === 100 ? "100% Completed" : `${progressPercent}% Trail Progress (${completedCount}/${topicsCount})`
        }`,
        800,
        745
      );

      // 10. Footer Metadata (Date, Seal, Certificate ID)
      // Left: Issue Date
      ctx.fillStyle = "#1E2235";
      ctx.font = "bold 24px sans-serif";
      ctx.fillText(issueDate, 340, 920);
      ctx.strokeStyle = "#C5CADB";
      ctx.beginPath();
      ctx.moveTo(200, 940);
      ctx.lineTo(480, 940);
      ctx.stroke();
      ctx.fillStyle = "#5E6478";
      ctx.font = "20px sans-serif";
      ctx.fillText("Date of Issuance", 340, 975);

      // Center: Verified Gold/Periwinkle Seal
      ctx.beginPath();
      ctx.arc(800, 915, 65, 0, Math.PI * 2);
      ctx.fillStyle = "#EEF2FC";
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#5C66C9";
      ctx.stroke();

      ctx.fillStyle = "#5C66C9";
      ctx.font = "bold 20px sans-serif";
      ctx.fillText("VERIFIED", 800, 910);
      ctx.font = "bold 16px sans-serif";
      ctx.fillText("ROADMAP.AI", 800, 935);

      // Right: Certificate ID
      ctx.fillStyle = "#1E2235";
      ctx.font = "bold 24px monospace";
      ctx.fillText(certId, 1260, 920);
      ctx.strokeStyle = "#C5CADB";
      ctx.beginPath();
      ctx.moveTo(1120, 940);
      ctx.lineTo(1400, 940);
      ctx.stroke();
      ctx.fillStyle = "#5E6478";
      ctx.font = "20px sans-serif";
      ctx.fillText("Credential ID", 1260, 975);

      // Trigger download
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `Roadmap-AI-Certificate-${trackTitle.replace(/\s+/g, "-")}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyShareText = () => {
    const shareText = `🎓 Excited to share my "${trackTitle}" credential on Roadmap.ai!\n\n✅ Track: ${trackTitle} (${milestonesCount} Milestones • ${topicsCount} Engineering Topics)\n🆔 Credential ID: ${certId}\n🔗 Explore the interactive platform: https://roadmap-ai-steel.vercel.app\n\n#DevOps #CloudEngineering #FullStack #SoftwareEngineering #RoadmapAI`;
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-2xl p-6 sm:p-8 my-8">
        {/* Top Action Bar */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-[var(--line)]">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-[var(--periwinkle-deep)]" />
            <span className="font-display text-lg font-semibold text-[var(--ink)]">
              Official Track Credential
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[var(--bg-alt)] text-[var(--ink-soft)] hover:text-[var(--ink)] transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Visual Certificate Preview Card */}
        <div className="relative rounded-2xl border-4 border-[var(--periwinkle-deep)] bg-gradient-to-br from-[#FAF7F2] via-white to-[#EEF2FC] dark:from-[#161929] dark:via-[#1E2235] dark:to-[#192038] p-6 sm:p-10 text-center shadow-inner">
          <div className="border border-[var(--periwinkle)]/40 rounded-xl p-6 sm:p-8">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest tag-periwinkle mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              Roadmap.ai Engineering Academy
            </div>

            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[var(--ink)] tracking-tight mt-1">
              Certificate of Mastery
            </h2>

            <p className="text-xs sm:text-sm italic text-[var(--ink-soft)] mt-3 font-serif">
              This credential is proudly awarded to
            </p>

            <div className="font-display text-3xl sm:text-5xl font-bold text-[var(--periwinkle-deep)] my-4 pb-3 border-b border-[var(--line)] max-w-md mx-auto">
              {userName}
            </div>

            <p className="text-xs sm:text-sm text-[var(--ink-soft)] max-w-lg mx-auto leading-relaxed">
              for completing the hands-on engineering roadmap, architectural milestones, and technical topics in
            </p>

            <h3 className="font-display text-2xl sm:text-3xl font-bold text-[var(--ink)] mt-3">
              {trackTitle}
            </h3>

            <div className="mt-4 inline-flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-[var(--ink-soft)]">
              <span className="px-3 py-1 rounded-full bg-[var(--bg-alt)] border border-[var(--line)]">
                {milestonesCount} Sequential Milestones
              </span>
              <span className="px-3 py-1 rounded-full bg-[var(--bg-alt)] border border-[var(--line)]">
                {topicsCount} Core Topics
              </span>
              <span className="px-3 py-1 rounded-full tag-sage">
                {progressPercent === 100
                  ? "100% Verified Mastery"
                  : `${progressPercent}% Active Trail Progress`}
              </span>
            </div>

            {/* Certificate Footer */}
            <div className="mt-8 pt-6 border-t border-[var(--line)] grid grid-cols-1 sm:grid-cols-3 gap-4 items-center text-xs">
              <div>
                <div className="font-bold text-[var(--ink)]">{issueDate}</div>
                <div className="text-[11px] text-[var(--ink-soft)]">Date of Issuance</div>
              </div>

              <div className="flex flex-col items-center justify-center">
                <div className="h-12 w-12 rounded-full bg-[var(--periwinkle)]/20 border-2 border-[var(--periwinkle-deep)] flex items-center justify-center text-[var(--periwinkle-deep)]">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--periwinkle-deep)] mt-1">
                  Verified Seal
                </span>
              </div>

              <div>
                <div className="font-mono font-bold text-[var(--ink)]">{certId}</div>
                <div className="text-[11px] text-[var(--ink-soft)]">Credential ID</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Export & Share Actions */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            onClick={handleCopyShareText}
            className="ghost-pill w-full sm:w-auto px-5 py-2.5 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-600" />
                Copied LinkedIn Post!
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4" />
                Copy LinkedIn Share Text
              </>
            )}
          </button>

          <button
            onClick={handleDownloadPng}
            disabled={downloading}
            className="pill-btn w-full sm:w-auto px-6 py-2.5 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="h-4 w-4" />
            {downloading ? "Generating PNG..." : "Download Certificate (PNG)"}
          </button>
        </div>
      </div>
    </div>
  );
}
