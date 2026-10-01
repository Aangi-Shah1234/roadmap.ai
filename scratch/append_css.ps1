$css = @'

@keyframes lp2-drift-1 {
  0%,100% { transform: translate(0,0) scale(1); }
  33%      { transform: translate(30px,-20px) scale(1.06); }
  66%      { transform: translate(-15px,15px) scale(0.96); }
}
@keyframes lp2-drift-2 {
  0%,100% { transform: translate(0,0) scale(1); }
  40%     { transform: translate(-25px,20px) scale(1.04); }
  70%     { transform: translate(20px,-10px) scale(0.97); }
}
@keyframes lp2-drift-3 {
  0%,100% { transform: translate(0,0) scale(1); }
  50%     { transform: translate(15px,25px) scale(1.05); }
}
@keyframes lp2-float {
  0%,100% { transform: rotate(-2.5deg) translateY(0px); }
  50%     { transform: rotate(-2.5deg) translateY(-10px); }
}
@keyframes lp2-pulse-ring {
  0%   { transform: scale(0.85); opacity: 1; }
  100% { transform: scale(1.55); opacity: 0; }
}
@keyframes lp2-pulse {
  0%,100% { opacity: 1; }
  50%     { opacity: 0.5; }
}

/* HERO */
.lp2-hero {
  position: relative;
  overflow: hidden;
  min-height: 92vh;
  display: flex;
  align-items: center;
  background: var(--bg);
}
.lp2-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  z-index: 0;
}
.lp2-orb-1 {
  width: 520px; height: 520px;
  background: radial-gradient(circle, rgba(143,163,227,0.22) 0%, transparent 70%);
  top: -80px; right: 5%;
  animation: lp2-drift-1 14s ease-in-out infinite;
}
.lp2-orb-2 {
  width: 400px; height: 400px;
  background: radial-gradient(circle, rgba(168,201,165,0.18) 0%, transparent 70%);
  bottom: -60px; left: 2%;
  animation: lp2-drift-2 18s ease-in-out infinite;
}
.lp2-orb-3 {
  width: 260px; height: 260px;
  background: radial-gradient(circle, rgba(242,196,160,0.16) 0%, transparent 70%);
  top: 40px; right: 30%;
  animation: lp2-drift-3 11s ease-in-out infinite;
}
.lp2-hero-inner {
  position: relative;
  z-index: 1;
  max-width: 1240px;
  margin: 0 auto;
  width: 100%;
  padding: 80px 48px;
  display: grid;
  grid-template-columns: 55% 45%;
  gap: 48px;
  align-items: center;
}
@media (max-width: 900px) {
  .lp2-hero-inner { grid-template-columns: 1fr; padding: 60px 24px; }
}
.lp2-copy {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.7s ease, transform 0.7s ease;
}
.lp2-copy-in { opacity: 1; transform: translateY(0); }
.lp2-right {
  opacity: 0;
  transform: translateY(32px);
  transition: opacity 0.8s ease 0.15s, transform 0.8s ease 0.15s;
}
.lp2-right-in { opacity: 1; transform: translateY(0); }
.lp2-eyebrow {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink-soft);
  margin-bottom: 20px;
}
.lp2-h1 {
  font-family: var(--font-display);
  font-size: clamp(52px, 7vw, 80px);
  line-height: 1.05;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--ink);
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
}
.lp2-word {
  display: block;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.55s ease, transform 0.55s ease;
}
.lp2-copy-in .lp2-word { opacity: 1; transform: translateY(0); }
.lp2-em {
  font-style: italic;
  background: linear-gradient(135deg, var(--periwinkle) 0%, var(--periwinkle-deep) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.lp2-lead {
  font-size: 16px;
  line-height: 1.65;
  color: var(--ink-soft);
  max-width: 480px;
  margin-bottom: 32px;
}
.lp2-cta-row {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 32px;
}
.lp2-btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--periwinkle-deep);
  color: white;
  padding: 13px 24px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
  transition: opacity 0.2s, transform 0.2s;
  text-decoration: none;
}
.lp2-btn-primary:hover { opacity: 0.88; transform: translateY(-1px); }
.lp2-btn-ghost {
  font-size: 14px;
  font-weight: 600;
  color: var(--ink-soft);
  text-decoration: none;
  transition: color 0.2s;
}
.lp2-btn-ghost:hover { color: var(--ink); }
.lp2-avatars {
  display: flex;
  align-items: center;
  gap: 10px;
}
.lp2-av {
  width: 30px; height: 30px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; color: white;
  margin-left: -8px;
  border: 2px solid var(--surface);
  flex-shrink: 0;
}
.lp2-av:first-child { margin-left: 0; }
.lp2-av-label { font-size: 13px; color: var(--ink-soft); font-weight: 500; }

/* STATS */
.lp2-stats { display: flex; gap: 40px; margin-bottom: 28px; }
.lp2-stat { display: flex; flex-direction: column; }
.lp2-stat-num {
  font-family: var(--font-display);
  font-size: 52px;
  font-weight: 700;
  line-height: 1;
  color: var(--ink);
  letter-spacing: -0.02em;
}
.lp2-stat-label { font-size: 13px; color: var(--ink-soft); margin-top: 4px; font-weight: 500; }

/* GLASS CARD */
.lp2-glass-card {
  background: rgba(255,255,255,0.62);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1px solid rgba(255,255,255,0.82);
  border-radius: 24px;
  padding: 28px;
  box-shadow: 0 24px 64px rgba(107,130,206,0.16), inset 0 1px 0 rgba(255,255,255,0.9);
  transform: rotate(-2.5deg);
  animation: lp2-float 5s ease-in-out infinite;
}
.dark .lp2-glass-card {
  background: rgba(30,34,53,0.65);
  border-color: rgba(255,255,255,0.1);
  box-shadow: 0 24px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06);
}
.lp2-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.lp2-card-title { font-weight: 700; font-size: 15px; color: var(--ink); }
.lp2-card-badge {
  font-size: 11px; font-weight: 700;
  background: rgba(143,163,227,0.18);
  color: var(--periwinkle-deep);
  padding: 3px 10px;
  border-radius: 999px;
}
.lp2-trail-row {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.lp2-trail-line {
  position: absolute;
  top: 50%; left: 0; right: 0;
  height: 2px;
  background: var(--line);
  transform: translateY(-50%);
  z-index: 0;
}
.lp2-tnode {
  width: 28px; height: 28px;
  border-radius: 50%;
  position: relative; z-index: 1;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.lp2-tnode.done     { background: var(--sage); border: 2px solid var(--sage-deep); }
.lp2-tnode.upcoming { background: var(--surface); border: 2px solid var(--line); }
.lp2-tnode.active   { background: var(--periwinkle); border: 2px solid var(--periwinkle-deep); }
.lp2-tnode.active::after {
  content: "";
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  border: 2px solid var(--periwinkle);
  animation: lp2-pulse-ring 2s ease-out infinite;
}
.lp2-progress-bar {
  width: 100%; height: 5px;
  background: var(--line);
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 10px;
}
.lp2-progress-fill {
  width: 43%; height: 100%;
  background: linear-gradient(90deg, var(--periwinkle), var(--periwinkle-deep));
  border-radius: 999px;
}
.lp2-card-meta { font-size: 12px; color: var(--ink-soft); margin-bottom: 14px; }
.lp2-card-cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px; font-weight: 600;
  color: var(--ink);
  border: 1px solid var(--line);
  padding: 8px 16px;
  border-radius: 999px;
  text-decoration: none;
  transition: border-color 0.2s, color 0.2s;
}
.lp2-card-cta:hover { border-color: var(--periwinkle); color: var(--periwinkle-deep); }

/* SECTION TRANSITIONS */
.lp2-sec-out { opacity: 0; transform: translateY(28px); transition: opacity 0.65s ease, transform 0.65s ease; }
.lp2-sec-in  { opacity: 1; transform: translateY(0);    transition: opacity 0.65s ease, transform 0.65s ease; }

/* HOW IT WORKS */
.lp2-how {
  background: var(--surface);
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
}
.lp2-how-inner { max-width: 1240px; margin: 0 auto; padding: 64px 48px; }
.lp2-sec-tag {
  font-size: 11px; font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--periwinkle-deep);
  margin-bottom: 32px;
}
.lp2-steps { display: flex; flex-direction: column; }
.lp2-step {
  display: grid;
  grid-template-columns: 72px 1px 1fr 2fr auto;
  align-items: center;
  gap: 0 28px;
  padding: 32px 0;
  border-top: 2px solid var(--step-color, var(--periwinkle-deep));
}
.lp2-step:last-child { border-bottom: 2px solid; }
.lp2-step-n {
  font-family: var(--font-display);
  font-size: 42px; font-weight: 700; line-height: 1;
  flex-shrink: 0;
}
.lp2-step-divider {
  width: 1px; height: 40px;
  background: var(--line);
  flex-shrink: 0;
}
.lp2-step-title {
  font-family: var(--font-display);
  font-size: 20px; font-weight: 700;
  color: var(--ink);
}
.lp2-step-body { font-size: 14px; color: var(--ink-soft); line-height: 1.6; }
.lp2-step-arrow { color: var(--ink-soft); flex-shrink: 0; }
@media (max-width: 760px) {
  .lp2-step {
    grid-template-columns: 52px 1fr;
    grid-template-rows: auto auto;
    gap: 8px 16px;
  }
  .lp2-step-divider, .lp2-step-arrow { display: none; }
  .lp2-step-body { grid-column: 1 / -1; }
}

/* TRACKS */
.lp2-tracks { background: #F0EEFA; }
.dark .lp2-tracks { background: var(--bg-alt); }
.lp2-tracks-inner { max-width: 1240px; margin: 0 auto; padding: 72px 48px; }
.lp2-tracks-hdr { margin-bottom: 40px; }
.lp2-tracks-title {
  font-family: var(--font-display);
  font-size: clamp(32px,4vw,48px);
  font-weight: 700; color: var(--ink);
  margin-bottom: 28px;
}
.lp2-tab-row { display: flex; gap: 0; border-bottom: 1px solid var(--line); }
.lp2-tab {
  font-size: 13px; font-weight: 600;
  color: var(--ink-soft);
  padding: 10px 18px;
  background: none; border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: color 0.18s, border-color 0.18s;
  white-space: nowrap;
}
.lp2-tab:hover { color: var(--ink); }
.lp2-tab.active { color: var(--ink); border-bottom-color: var(--periwinkle-deep); font-weight: 700; }

.lp2-track-list { margin-top: 8px; }
.lp2-track-row {
  display: grid;
  grid-template-columns: 36px 14px 1fr auto;
  align-items: center;
  gap: 16px;
  padding: 22px 16px;
  border-bottom: 1px solid var(--line);
  text-decoration: none;
  color: var(--ink);
  transition: background-color 0.22s ease;
  border-radius: 10px;
}
.lp2-track-row:first-child { border-top: 1px solid var(--line); }
.lp2-row-idx { font-size: 12px; font-weight: 700; color: var(--ink-soft); }
.lp2-row-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.lp2-row-content { min-width: 0; }
.lp2-row-top { display: flex; align-items: baseline; gap: 16px; flex-wrap: wrap; margin-bottom: 4px; }
.lp2-row-name { font-family: var(--font-display); font-size: 18px; font-weight: 700; color: var(--ink); }
.lp2-row-meta { font-size: 12px; color: var(--ink-soft); font-weight: 500; white-space: nowrap; }
.lp2-row-desc { font-size: 13.5px; color: var(--ink-soft); line-height: 1.5; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.lp2-row-prog { display: flex; align-items: center; gap: 10px; margin-top: 8px; }
.lp2-row-prog-fill { height: 3px; border-radius: 999px; }
.lp2-row-prog-label { font-size: 11px; font-weight: 700; }
.lp2-row-arrow { transition: color 0.2s, transform 0.2s; }
.lp2-track-row:hover .lp2-row-arrow { transform: translateX(3px); }
.lp2-track-skeleton {
  height: 72px; background: var(--surface);
  border-radius: 10px; margin-bottom: 2px;
  animation: lp2-pulse 1.5s ease-in-out infinite;
  border-bottom: 1px solid var(--line);
}

/* CTA OPTION A — DARK SPLIT */
.lp2-cta { display: grid; grid-template-columns: 60% 40%; min-height: 340px; }
@media (max-width: 760px) { .lp2-cta { grid-template-columns: 1fr; } }

.lp2-cta-left {
  background: #1E2340;
  padding: 72px 56px;
  display: flex; flex-direction: column;
  justify-content: center; gap: 16px;
}
.lp2-cta-h2 {
  font-family: var(--font-display);
  font-size: clamp(28px,3.5vw,44px);
  font-weight: 700; color: #fff;
  line-height: 1.1; letter-spacing: -0.02em;
}
.lp2-cta-sub { font-size: 15px; color: rgba(255,255,255,0.55); }
.lp2-cta-btns { display: flex; align-items: center; gap: 20px; margin-top: 8px; flex-wrap: wrap; }
.lp2-cta-primary {
  display: inline-flex; align-items: center; gap: 8px;
  background: #fff; color: #1E2340;
  padding: 12px 24px; border-radius: 999px;
  font-size: 14px; font-weight: 700;
  text-decoration: none;
  transition: opacity 0.2s, transform 0.2s;
}
.lp2-cta-primary:hover { opacity: 0.9; transform: translateY(-1px); }
.lp2-cta-ghost {
  font-size: 14px; font-weight: 600;
  color: rgba(255,255,255,0.55);
  text-decoration: none; transition: color 0.2s;
}
.lp2-cta-ghost:hover { color: #fff; }

.lp2-cta-right {
  background: linear-gradient(160deg, var(--periwinkle) 0%, var(--sage) 100%);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 56px 40px; gap: 20px;
}
.lp2-cta-trail-label {
  font-size: 11px; font-weight: 700;
  color: rgba(255,255,255,0.75);
  letter-spacing: 0.06em; text-transform: uppercase;
}
.lp2-cta-trail {
  position: relative;
  display: flex; align-items: center;
  justify-content: space-between;
  width: 100%; max-width: 300px;
}
.lp2-cta-trail-line {
  position: absolute;
  top: 50%; left: 0; right: 0;
  height: 3px;
  background: rgba(255,255,255,0.45);
  transform: translateY(-50%); z-index: 0;
  border-radius: 2px;
}
.lp2-cta-node {
  width: 40px; height: 40px; border-radius: 50%;
  position: relative; z-index: 1;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.lp2-cta-node.done     { background: rgba(255,255,255,0.92); border: 2px solid rgba(255,255,255,0.5); }
.lp2-cta-node.upcoming { background: rgba(255,255,255,0.28); border: 2px solid rgba(255,255,255,0.4); }
.lp2-cta-node.active   { background: var(--periwinkle-deep); border: 3px solid rgba(255,255,255,0.7); }
.lp2-cta-node.active::after {
  content: "";
  position: absolute; inset: -7px;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.6);
  animation: lp2-pulse-ring 2s ease-out infinite;
}
.lp2-cta-labels { display: flex; justify-content: space-between; width: 100%; max-width: 300px; }
.lp2-cta-labels span { font-size: 10px; font-weight: 600; color: rgba(255,255,255,0.8); text-align: center; flex: 1; }

/* FOOTER */
.lp2-footer {
  background: #141622;
  padding: 20px 48px;
  display: flex; justify-content: space-between; align-items: center;
  font-size: 12px; color: rgba(255,255,255,0.32); font-weight: 500;
}
'@

Add-Content -Path "src\app\globals.css" -Value $css
Write-Host "CSS appended successfully"
