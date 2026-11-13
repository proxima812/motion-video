import React from "react";
import { CHART } from "../stage/layout";
import { SPRING, ease, lerp, progress, springAt } from "../stage/motion";
import { T } from "../stage/timeline";
import { C } from "./theme";

const VALUES = [42, 45, 44, 49, 53, 52, 58, 61, 60, 66, 71, 80];
const MONTHS = ["Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"];
const W = CHART.w - 56;
const H = 190;
const MIN = 34;
const MAX = 86;

const pts = VALUES.map((v, i) => ({ x: (i / (VALUES.length - 1)) * W, y: H - ((v - MIN) / (MAX - MIN)) * H }));

// Catmull-Rom → cubic bezier for a smooth premium curve
const linePath = pts
  .map((p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const p0 = pts[i - 2] ?? pts[i - 1];
    const p1 = pts[i - 1];
    const p3 = pts[i + 1] ?? p;
    const c1 = { x: p1.x + (p.x - p0.x) / 6, y: p1.y + (p.y - p0.y) / 6 };
    const c2 = { x: p.x - (p3.x - p1.x) / 6, y: p.y - (p3.y - p1.y) / 6 };
    return `C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${p.x} ${p.y}`;
  })
  .join(" ");
const areaPath = `${linePath} L ${W} ${H} L 0 ${H} Z`;

export const Chart: React.FC<{ frame: number }> = ({ frame }) => {
  // Intro draws to the 11th point; the update extends to the 12th.
  const introW = lerp(0, pts[10].x, ease.inOut(progress(frame, 50, 140)));
  const extend = springAt(frame, T.metricsUpdate - 4, SPRING.smooth);
  const clipW = introW + (W - pts[10].x) * Math.min(extend, 1) + 4;
  const last = pts[10 + (extend > 0.5 ? 1 : 0)];
  const dotPop = frame < 140 ? 0 : extend > 0.5 ? springAt(frame, T.metricsUpdate + 14, SPRING.bouncy) : springAt(frame, 132, SPRING.bouncy);
  const pulse = progress(frame, T.metricsUpdate + 14, T.metricsUpdate + 74);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        padding: 28,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 26, fontWeight: 600, color: C.text, letterSpacing: -0.4 }}>Revenue growth</div>
          <div style={{ fontSize: 18, color: C.muted, marginTop: 6 }}>Last 12 months</div>
        </div>
        <div style={{ display: "flex", gap: 18, fontSize: 17, color: C.muted, alignItems: "center", marginTop: 4 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 10, height: 10, borderRadius: 5, background: C.accent }} /> Revenue
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 10, height: 10, borderRadius: 5, background: C.dim }} /> Target
          </span>
        </div>
      </div>
      <svg width={W} height={H + 40} style={{ marginTop: 34, overflow: "visible" }}>
        <defs>
          <linearGradient id="area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={C.accent} stopOpacity={0.34} />
            <stop offset="100%" stopColor={C.accent} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="line" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor={C.accent2} />
            <stop offset="100%" stopColor={C.accent} />
          </linearGradient>
          <clipPath id="reveal">
            <rect x={-6} y={-30} width={clipW + 6} height={H + 60} />
          </clipPath>
        </defs>
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1={0} x2={W} y1={(H / 3) * i} y2={(H / 3) * i} stroke="rgba(255,255,255,0.06)" strokeDasharray="4 6" />
        ))}
        <path d={`M 0 ${H * 0.62} C ${W * 0.4} ${H * 0.5}, ${W * 0.7} ${H * 0.25}, ${W} ${H * 0.12}`} stroke={C.dim} strokeWidth={2} fill="none" strokeDasharray="6 8" opacity={0.7} />
        <g clipPath="url(#reveal)">
          <path d={areaPath} fill="url(#area)" />
          <path d={linePath} stroke="url(#line)" strokeWidth={4} fill="none" strokeLinecap="round" />
        </g>
        <circle cx={last.x} cy={last.y} r={8 + pulse * 26} fill={C.accent} opacity={(1 - pulse) * 0.35 * (pulse > 0 ? 1 : 0)} />
        <circle cx={last.x} cy={last.y} r={9 * dotPop} fill={C.text} stroke={C.accent} strokeWidth={4} />
        {MONTHS.map((m, i) =>
          i % 2 === 1 ? (
            <text key={m} x={pts[i].x} y={H + 34} fill={C.dim} fontSize={16} textAnchor={i === 11 ? "end" : "middle"}>
              {m}
            </text>
          ) : null,
        )}
      </svg>
    </div>
  );
};
