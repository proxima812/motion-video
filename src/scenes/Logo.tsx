import React from "react";
import { AbsoluteFill } from "remotion";
import { SPRING, ease, progress, springAt } from "../stage/motion";
import { T } from "../stage/timeline";
import { C, fontFamily } from "../ui/theme";

export const Logo: React.FC<{ frame: number }> = ({ frame }) => {
  if (frame < T.logoIn - 10) return null;
  const mark = springAt(frame, T.logoIn, SPRING.bouncy);
  const ring = ease.outExpo(progress(frame, T.logoIn + 4, T.logoIn + 60));
  const orbit = (frame - T.logoIn) * 0.045;
  const glow = springAt(frame, T.logoIn, SPRING.soft);
  const tag = springAt(frame, T.tagline, SPRING.smooth);
  const drift = 1 + progress(frame, T.logoIn, 900) * 0.035;
  const letters = "Orbit".split("");

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily, transform: `scale(${drift})` }}>
      <div
        style={{
          position: "absolute",
          width: 760,
          height: 760,
          borderRadius: "50%",
          background: "radial-gradient(closest-side, rgba(124,108,255,0.35), transparent)",
          opacity: glow,
          transform: `scale(${0.6 + 0.4 * glow})`,
        }}
      />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: -40 }}>
        <svg width={180} height={180} viewBox="0 0 180 180" style={{ opacity: Math.min(1, mark * 1.5), transform: `scale(${0.5 + 0.5 * mark})` }}>
          <defs>
            <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#9C8FFF" />
              <stop offset="1" stopColor={C.accent2} />
            </linearGradient>
          </defs>
          <rect x={10} y={10} width={160} height={160} rx={44} fill="url(#lg)" />
          <rect x={10.5} y={10.5} width={159} height={159} rx={43.5} fill="none" stroke="rgba(255,255,255,0.35)" />
          <circle cx={90} cy={90} r={22} fill="#fff" />
          <ellipse cx={90} cy={90} rx={56} ry={24} fill="none" stroke="#fff" strokeWidth={6} transform="rotate(-24 90 90)" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - ring} strokeLinecap="round" opacity={0.95} />
          <g transform="rotate(-24 90 90)" opacity={ring}>
            <circle cx={90 + 56 * Math.cos(orbit)} cy={90 + 24 * Math.sin(orbit)} r={8} fill="#fff" />
          </g>
        </svg>
        <div style={{ display: "flex", marginTop: 44, fontSize: 132, fontWeight: 600, letterSpacing: -5, color: C.text, lineHeight: 1.15 }}>
          {letters.map((l, i) => {
            const t = springAt(frame, T.logoIn + 12 + i * 4, SPRING.smooth);
            return (
              <span key={i} style={{ display: "inline-block", opacity: Math.min(1, t * 1.3), transform: `translateY(${(1 - t) * 50}px)`, filter: `blur(${Math.max(0, (1 - t) * 12)}px)` }}>
                {l}
              </span>
            );
          })}
        </div>
        <div style={{ marginTop: 18, fontSize: 40, fontWeight: 500, color: C.muted, letterSpacing: -0.4, opacity: tag, transform: `translateY(${(1 - tag) * 20}px)` }}>
          Продажи без хаоса.
        </div>
      </div>
    </AbsoluteFill>
  );
};
