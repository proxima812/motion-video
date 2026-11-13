import React from "react";
import { INK, INTER, WHITE } from "../../kit/design";
import { K } from "../../kit/reel";

// Icons and marks in the design system: INK by default, status colors only for ok / fail, no glows or extra shadows.

const OFF = "rgba(37, 27, 58, 0.12)";

/** Round check whose tick draws in as `t` goes 0..1 */
export const CheckCircle: React.FC<{ t: number; size?: number; color?: string }> = ({ t, size = 56, color = K.green }) => (
  <div style={{ width: size, height: size, borderRadius: size / 2, border: `4px solid ${t > 0 ? color : OFF}`, background: t > 0 ? color : "transparent", display: "grid", placeItems: "center", flex: "none", boxSizing: "border-box" }}>
    <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24">
      <path d="M4 12.5l5 5L20 6.5" fill="none" stroke={WHITE} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={30} strokeDashoffset={30 * (1 - Math.min(1, t))} />
    </svg>
  </div>
);

/** Green ✓ or red ✕ in a circle */
export const Verdict: React.FC<{ ok: boolean; size?: number }> = ({ ok, size = 64 }) => (
  <div style={{ width: size, height: size, borderRadius: size / 2, flex: "none", display: "grid", placeItems: "center", fontFamily: `${INTER}, sans-serif`, fontSize: size * 0.5, fontWeight: 700, lineHeight: 1, color: WHITE, background: ok ? K.green : K.red }}>{ok ? "✓" : "✕"}</div>
);

/** Database cylinder (viewBox fits the whole drawing + stroke, nothing cropped) */
export const DbIcon: React.FC<{ size: number; color?: string }> = ({ size, color = INK }) => (
  <svg width={size} height={size * 1.34} viewBox="0 0 100 134" style={{ overflow: "visible", flex: "none" }}>
    {[0, 1, 2].map((i) => (
      <path key={i} d={`M8 ${22 + i * 32} v26 c0 10 19 16 42 16 s42 -6 42 -16 v-26`} fill="none" stroke={color} strokeWidth={7} />
    ))}
    <ellipse cx={50} cy={20} rx={42} ry={14} fill="none" stroke={color} strokeWidth={7} />
  </svg>
);

/** Site wordmark "name.tld": name INK, dot + tld in the accent */
export const Wordmark: React.FC<{ name: string; tld: string; size: number; color?: string; accent?: string }> = ({ name, tld, size, color = INK, accent = INK }) => (
  <span style={{ fontFamily: `${INTER}, sans-serif`, fontSize: size, fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1, color, whiteSpace: "nowrap" }}>
    {name}
    <span style={{ color: accent }}>.</span>
    <span style={{ color: accent, fontWeight: 400 }}>{tld}</span>
  </span>
);
