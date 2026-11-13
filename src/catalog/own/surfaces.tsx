import React from "react";
import { interpolate } from "remotion";
import { SPRING, lerp, springAt } from "../../stage/motion";
import type { LucideIcon } from "lucide-react";
import { ACCENT_WEIGHT, GLASS_PILL, INK, INTER, NUMBER, PARAGRAPH, SHADOW, SURFACE, WHITE } from "../../kit/design";
import { K, pop } from "../../kit/reel";

// Cards, pills, bubbles and stickers in the design system (src/kit/design.ts):
// one surface (white, radius 24, the one shadow), INK / white text, Raleway paragraphs, Inter numbers,
// padding equal on all sides (top/bottom never bigger than the sides), lineHeight ~1 inside.
// `accent` = the video's accent color (default INK).

const HAIRLINE = "0.5px solid rgba(0,0,0,0.06)";
const TRACK = "rgba(37, 27, 58, 0.07)";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Base card: the design-system surface */
export const Card: React.FC<{ style?: React.CSSProperties; children: React.ReactNode }> = ({ style, children }) => (
  <div style={{ ...SURFACE, ...PARAGRAPH, padding: 40, boxSizing: "border-box", ...style }}>{children}</div>
);

/** Small tag: text weight 500, accent = text color, glass = frosted surface, icon = lucide icon by meaning */
export const Pill: React.FC<{ size?: number; accent?: string; glass?: boolean; icon?: LucideIcon; style?: React.CSSProperties; children: React.ReactNode }> = ({ size = 30, accent, glass, icon: Icon, style, children }) => (
  <span style={{ ...SURFACE, ...PARAGRAPH, border: HAIRLINE, ...(glass ? GLASS_PILL : null), fontWeight: ACCENT_WEIGHT, ...(accent ? { color: accent } : null), fontSize: size, lineHeight: 1, padding: size * 0.6, whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: size * 0.35, ...style }}>
    {Icon && <Icon size={size * 1.05} strokeWidth={2} color={accent ?? INK} />}
    {children}
  </span>
);

/** Filter chip (text weight 500, icon = lucide icon by meaning of the word): pops in at `at`, gets selected (accent fill, white text, bump) at `on` */
export const Chip: React.FC<{ frame: number; at: number; on?: number; accent?: string; size?: number; icon?: LucideIcon; children: React.ReactNode }> = ({ frame, at, on, accent = INK, size = 38, icon: Icon, children }) => {
  const p = pop(frame, at, SPRING.bouncy);
  const sel = on === undefined ? 0 : springAt(frame, on, SPRING.snappy);
  if (p.t <= 0) return null;
  const onNow = sel > 0.5;
  return (
    <div style={{ ...p.style, ...SURFACE, ...PARAGRAPH, fontSize: size, fontWeight: ACCENT_WEIGHT, lineHeight: 1, padding: size * 0.65, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: size * 0.35, background: onNow ? accent : WHITE, color: onNow ? WHITE : INK, scale: String(1 + Math.sin(Math.min(sel, 1) * Math.PI) * 0.08) }}>
      {Icon && <Icon size={size * 1.05} strokeWidth={2} color={onNow ? WHITE : INK} />}
      {children}
    </div>
  );
};

/** Comment bubble with a tag above it: left = white surface, right = accent fill */
export const Bubble: React.FC<{ frame: number; at: number; side: "l" | "r"; tag?: string; accent?: string; children: React.ReactNode }> = ({ frame, at, side, tag, accent = INK, children }) => {
  const p = pop(frame, at, SPRING.bouncy);
  if (p.t <= 0) return null;
  const left = side === "l";
  return (
    <div style={{ ...p.style, alignSelf: left ? "flex-start" : "flex-end", display: "flex", flexDirection: "column", alignItems: left ? "flex-start" : "flex-end", gap: 16 }}>
      {tag && <Pill>{tag}</Pill>}
      <div style={{ ...SURFACE, ...PARAGRAPH, fontSize: 48, lineHeight: 1.1, padding: 36, background: left ? WHITE : accent, color: left ? INK : WHITE, maxWidth: 760 }}>{children}</div>
    </div>
  );
};

/** Assistant reply: avatar circle + bubble whose words pop in one by one; gone after `until` */
export const AiBubble: React.FC<{ frame: number; at: number; until: number; text: string; y?: number; who?: string; accent?: string }> = ({ frame, at, until, text, y = 1300, who = "ИИ", accent = INK }) => {
  if (frame < at || frame > until) return null;
  const p = springAt(frame, at, SPRING.bouncy);
  const out = interpolate(frame, [until - 6, until], [1, 0], clamp);
  const words = text.split(" ");
  return (
    <div style={{ position: "absolute", left: 100, right: 100, top: y, display: "flex", alignItems: "flex-end", gap: 18, opacity: out, transform: `scale(${0.6 + 0.4 * p})`, transformOrigin: "0% 100%" }}>
      <div style={{ width: 84, height: 84, borderRadius: 42, flex: "none", background: accent, color: WHITE, fontFamily: `${INTER}, sans-serif`, fontWeight: 700, fontSize: 30, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: SHADOW }}>{who}</div>
      <div style={{ ...SURFACE, ...PARAGRAPH, fontSize: 44, lineHeight: 1.1, padding: 32 }}>
        {words.map((w, i) => {
          const wp = interpolate(frame, [at + i * 5, at + i * 5 + 6], [0, 1], clamp);
          return (
            <span key={i} style={{ opacity: wp, display: "inline-block", transform: `translateY(${(1 - wp) * 14}px)` }}>
              {w}
              {i < words.length - 1 ? " " : ""}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/** Tilted accent sticker for a punchline, pops in at `at` (the key word: Inter 700) */
export const Sticker: React.FC<{ frame: number; at: number; rot?: number; accent?: string; size?: number; children: React.ReactNode }> = ({ frame, at, rot = -3, accent = INK, size = 54, children }) => {
  if (frame < at) return null;
  const p = springAt(frame, at, SPRING.bouncy);
  return (
    <div style={{ ...SURFACE, fontFamily: `${INTER}, sans-serif`, fontWeight: 700, fontSize: size, lineHeight: 1, letterSpacing: "-0.02em", color: WHITE, background: accent, padding: size * 0.55, transform: `scale(${p}) rotate(${rot}deg)`, whiteSpace: "nowrap", display: "inline-block" }}>
      {children}
    </div>
  );
};

/** Rubber stamp that slams in at `at`: outline only, no shadow */
export const Stamp: React.FC<{ frame: number; at: number; color?: string; rot?: number; size?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ frame, at, color = K.red, rot = -10, size = 54, style, children }) => {
  const s = springAt(frame, at, SPRING.bouncy);
  if (s <= 0) return null;
  return (
    <div
      style={{
        display: "inline-block",
        opacity: Math.min(1, s * 1.6),
        transform: `rotate(${lerp(rot - 20, rot, s)}deg) scale(${lerp(1.8, 1, Math.min(s, 1.1))})`,
        padding: size * 0.4,
        border: `8px solid ${color}`,
        borderRadius: 24,
        color,
        fontFamily: `${INTER}, sans-serif`,
        fontSize: size,
        fontWeight: 700,
        lineHeight: 1,
        background: WHITE,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Stat tile: label (Raleway) on top, big number (Inter) below */
export const StatTile: React.FC<{ label: string; tone?: string; style?: React.CSSProperties; children: React.ReactNode }> = ({ label, tone, style, children }) => (
  <Card style={{ width: 420, display: "flex", flexDirection: "column", gap: 28, ...style }}>
    <div style={{ ...PARAGRAPH, fontSize: 32, lineHeight: 1 }}>{label}</div>
    <div style={{ ...NUMBER, fontSize: 88, color: tone ?? INK, whiteSpace: "nowrap" }}>{children}</div>
  </Card>
);

/** Horizontal meter with a % readout; turns red below `low` */
export const Meter: React.FC<{ value: number; label: string; accent?: string; low?: number }> = ({ value, label, accent = INK, low = 0.4 }) => {
  const c = value < low ? K.red : accent;
  return (
    <Card style={{ width: 880, display: "flex", flexDirection: "column", gap: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ ...PARAGRAPH, fontSize: 38, lineHeight: 1 }}>{label}</span>
        <span style={{ ...NUMBER, fontSize: 44, color: c }}>{Math.round(value * 100)}%</span>
      </div>
      <div style={{ height: 24, borderRadius: 12, background: TRACK, overflow: "hidden" }}>
        <div style={{ width: `${value * 100}%`, height: "100%", borderRadius: 12, background: c }} />
      </div>
    </Card>
  );
};

const LIGHTS = ["#FF5F57", "#FEBC2E", "#28C840"];
const WindowBar: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 24, borderBottom: `1px solid ${TRACK}` }}>
    {LIGHTS.map((c) => (
      <span key={c} style={{ width: 16, height: 16, borderRadius: 8, background: c, flex: "none" }} />
    ))}
    {children}
  </div>
);

/** Browser window: traffic lights + URL bar */
export const Browser: React.FC<{ url: string; style?: React.CSSProperties; children: React.ReactNode }> = ({ url, style, children }) => (
  <div style={{ ...SURFACE, width: 880, overflow: "hidden", ...style }}>
    <WindowBar>
      <span style={{ ...PARAGRAPH, marginLeft: 16, flex: 1, padding: 14, borderRadius: 14, background: TRACK, fontSize: 26, lineHeight: 1 }}>{url}</span>
    </WindowBar>
    <div style={{ ...PARAGRAPH, padding: 40 }}>{children}</div>
  </div>
);

/** Terminal window (light): monospace INK text on the surface */
export const Terminal: React.FC<{ style?: React.CSSProperties; children: React.ReactNode }> = ({ style, children }) => (
  <div style={{ ...SURFACE, width: 880, overflow: "hidden", ...style }}>
    <WindowBar />
    <div style={{ padding: 40, fontFamily: K.mono, color: INK, fontSize: 34, lineHeight: 1.5 }}>{children}</div>
  </div>
);
