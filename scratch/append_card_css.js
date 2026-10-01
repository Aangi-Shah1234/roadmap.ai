const fs = require('fs');
const path = require('path');

const css = `
/* Track Option-A Cards */
.lp2-track-card {
  display: grid;
  grid-template-columns: 52px 1fr auto auto;
  align-items: center;
  gap: 20px;
  padding: 22px 24px;
  background: var(--surface);
  border-radius: 16px;
  border-left: 5px solid var(--periwinkle);
  box-shadow: 0 2px 12px rgba(46,52,82,0.07);
  text-decoration: none;
  color: var(--ink);
  margin-bottom: 12px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.lp2-track-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 32px rgba(46,52,82,0.13);
}
.lp2-card-idx {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
  flex-shrink: 0;
  min-width: 40px;
}
.lp2-card-body { min-width: 0; }
.lp2-card-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}
.lp2-card-name {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  color: var(--ink);
}
.lp2-cat-pill {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 999px;
  white-space: nowrap;
}
.lp2-card-desc {
  font-size: 13.5px;
  color: var(--ink-soft);
  line-height: 1.5;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.lp2-card-chips {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-end;
  flex-shrink: 0;
}
.lp2-chip {
  font-size: 11px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 999px;
  border: 1.5px solid;
  white-space: nowrap;
}
.lp2-card-arrow {
  flex-shrink: 0;
  transition: transform 0.2s ease;
}
.lp2-track-card:hover .lp2-card-arrow { transform: translateX(4px); }
@media (max-width: 640px) {
  .lp2-track-card { grid-template-columns: 40px 1fr; }
  .lp2-card-chips, .lp2-card-arrow { display: none; }
}
`;

const cssPath = path.join(__dirname, '..', 'src', 'app', 'globals.css');
fs.appendFileSync(cssPath, css, 'utf8');
console.log('Card CSS appended. File size:', fs.statSync(cssPath).size, 'bytes');
