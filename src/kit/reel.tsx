// Shared light-theme reel kit (extracted from src/v1/Video1.tsx) for videos 3-8.
// Everything is a pure function of `frame` (60 fps), seek-safe.
import "../fable/clock";
import React, { useLayoutEffect, useState } from "react";
import { AbsoluteFill, Audio, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame } from "remotion";
import { SPRING, ease, lerp, progress, springAt } from "../stage/motion";
import { setClock } from "../fable/clock";

export const K = {
  text: "#000",
  muted: "#6E7179",
  dim: "#A3A6AC",
  border: "rgba(0,0,0,0.08)",
  surface: "#FFFFFF",
  elevated: "rgba(0,0,0,0.045)",
  red: "#FF3B30",
  green: "#1FA855",
  accent: "#FF6A13",
  font: "var(--font-sans)",
  mono: "var(--font-mono)",
};

export const tokens = {
  "--text-primary": K.text,
  "--text-secondary": K.muted,
  "--text-muted": K.dim,
  "--bg-elevated": K.elevated,
  "--bg-elevated-hover": "rgba(0,0,0,0.07)",
  "--bg-elevated-active": "rgba(0,0,0,0.1)",
  "--bg-surface": "rgba(255,255,255,0.9)",
  "--border-subtle": K.border,
} as React.CSSProperties;

// Shared Tactile glass preset (all Tactile components)
export const GLASS = {
  refraction: 55,
  thickness: 24,
  bevelWidth: 9,
  frost: 32,
  dispersion: 5,
  sheen: 48,
  lightAngle: -46,
  rim: 100,
  fluidBrightness: 19,
  fluidSpeed: 15,
  fluidScale: 66,
  fluidAuraWidth: 32,
  fluidCenter: 31,
  hoverBrightness: 128,
  lightTrackingStrength: 81,
};

export const pop = (frame: number, at: number, cfg = SPRING.bouncy) => {
  const t = springAt(frame, at, cfg);
  return {
    t,
    style: {
      opacity: Math.min(1, t * 1.6),
      transform: `translateY(${(1 - t) * 40}px) scale(${0.85 + 0.15 * t})`,
      filter: t < 0.98 ? `blur(${Math.max(0, (1 - t) * 12)}px)` : undefined,
    } as React.CSSProperties,
  };
};

/** Fade + blur out over [at, at + 8] */
export const leave = (frame: number, at: number): React.CSSProperties => {
  const o = progress(frame, at, at + 8);
  return o <= 0 ? {} : { opacity: 1 - o, filter: `blur(${o * 14}px)`, transform: `translateY(${-o * 30}px) scale(${1 - o * 0.05})` };
};

export type Range = readonly [number, number];

const sceneStyle = (frame: number, [a, b]: Range): React.CSSProperties => {
  const inT = a === 0 ? 1 : springAt(frame, a, SPRING.smooth);
  const out = progress(frame, b - 8, b + 3);
  return {
    opacity: Math.min(1, inT * 1.5) * (1 - out),
    transform: `translateY(${(1 - inT) * 60 - out * 40}px) scale(${1 - out * 0.06})`,
    filter: out > 0 || inT < 0.98 ? `blur(${Math.max(out * 18, (1 - Math.min(inT, 1)) * 14)}px)` : undefined,
  };
};

export const Center: React.FC<{ y: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ y, children, style }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: y, display: "flex", justifyContent: "center", ...style }}>{children}</div>
);

export const Words: React.FC<{ text: string; frame: number; at: number; stagger?: number }> = ({ text, frame, at, stagger = 2 }) => (
  <>
    {text.split(" ").map((w, i, all) => {
      const t = springAt(frame, at + i * stagger, SPRING.smooth);
      return (
        <span
          key={i}
          style={{
            display: "inline-block",
            marginRight: i < all.length - 1 ? "0.24em" : 0,
            opacity: Math.min(1, t * 1.3),
            transform: `translateY(${(1 - t) * 30}px)`,
            filter: `blur(${Math.max(0, (1 - t) * 8)}px)`,
          }}
        >
          {w}
        </span>
      );
    })}
  </>
);

export type HeadlineItem = { from: number; text: string };

// Kinetic headline in the top safe zone; doubles as sound-off captions
export const Headline: React.FC<{ frame: number; items: HeadlineItem[]; size?: number }> = ({ frame, items, size = 84 }) => {
  const idx = items.reduce((acc, h, i) => (frame >= h.from ? i : acc), -1);
  if (idx < 0) return null;
  const cur = items[idx];
  const prev = items[idx - 1];
  const fade = progress(frame, cur.from, cur.from + 5);
  const line = (style: React.CSSProperties, children: React.ReactNode) => (
    <Center y={250} style={style}>
      <div style={{ fontSize: size, fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1.05, color: K.text, maxWidth: 960, textAlign: "center" }}>{children}</div>
    </Center>
  );
  return (
    <>
      {prev && prev.text && fade < 1 && line({ opacity: 1 - fade, filter: `blur(${fade * 10}px)`, transform: `translateY(${-fade * 24}px)` }, prev.text)}
      {cur.text && line({}, <Words text={cur.text} frame={frame} at={cur.from} />)}
    </>
  );
};

export const Card: React.FC<{ style?: React.CSSProperties; children: React.ReactNode }> = ({ style, children }) => (
  <div
    style={{
      background: K.surface,
      border: `1px solid ${K.border}`,
      borderRadius: 40,
      boxShadow: "0 40px 80px -40px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.04)",
      boxSizing: "border-box",
      ...style,
    }}
  >
    {children}
  </div>
);

export const Pill: React.FC<{ style?: React.CSSProperties; children: React.ReactNode }> = ({ style, children }) => (
  <span style={{ padding: "10px 22px", borderRadius: 999, background: K.elevated, fontSize: 30, fontWeight: 500, color: K.muted, whiteSpace: "nowrap", ...style }}>{children}</span>
);

/** Number that eases from `from` to `to` over [a, b] */
export const count = (frame: number, a: number, b: number, from: number, to: number, fn = ease.out) => Math.round(lerp(from, to, fn(progress(frame, a, b))));

export const shake = (frame: number, at: number, amp = 18, len = 24) => {
  const t = frame - at;
  if (t < 0 || t > len) return 0;
  return Math.sin(t * 1.9) * amp * (1 - t / len);
};

/* ───────── Cursor ───────── */

export type CursorKey = { f: number; x: number; y: number };

// Screen-space pointer gliding between keyframes; `clicks` add a press + ripple
export const Pointer: React.FC<{ frame: number; keys: CursorKey[]; clicks?: number[]; show: Range }> = ({ frame, keys, clicks = [], show }) => {
  const vis = Math.min(springAt(frame, show[0], SPRING.smooth), 1 - progress(frame, show[1] - 5, show[1]));
  if (vis <= 0.01) return null;
  let x = keys[0].x;
  let y = keys[0].y;
  for (let i = 1; i < keys.length; i++) {
    const t = ease.inOut(progress(frame, keys[i - 1].f, keys[i].f));
    if (frame >= keys[i - 1].f) {
      x = lerp(keys[i - 1].x, keys[i].x, t);
      y = lerp(keys[i - 1].y, keys[i].y, t);
    }
  }
  const press = clicks.reduce((m, c) => Math.max(m, springAt(frame, c - 4, SPRING.snappy) * (1 - springAt(frame, c + 4, SPRING.snappy))), 0);
  const ripple = clicks.map((c) => progress(frame, c, c + 19)).find((r) => r > 0 && r < 1) ?? 0;
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: Math.min(1, vis), pointerEvents: "none" }}>
      {ripple > 0 && (
        <div
          style={{
            position: "absolute",
            left: -50 * (0.4 + ripple),
            top: -50 * (0.4 + ripple),
            width: 100 * (0.4 + ripple),
            height: 100 * (0.4 + ripple),
            borderRadius: "50%",
            border: "4px solid rgba(0,0,0,0.35)",
            opacity: 1 - ripple,
          }}
        />
      )}
      <svg width={72} height={72} viewBox="0 0 24 24" style={{ transform: `translate(-8px, -5px) scale(${1 - 0.16 * press})`, transformOrigin: "6px 4px", filter: "drop-shadow(0 8px 12px rgba(0,0,0,0.25))" }}>
        <path d="M5.5 3.2v16.1c0 .5.6.7.9.4l3.9-4 2.6 5.8c.2.4.6.5 1 .4l1.8-.8c.4-.2.5-.6.4-1l-2.6-5.7h5.6c.5 0 .7-.6.4-.9L6.4 2.8c-.3-.3-.9-.1-.9.4z" fill="#000" stroke="#fff" strokeWidth={1.3} strokeLinejoin="round" />
      </svg>
    </div>
  );
};

/* ───────── Reel shell ───────── */

export type Vo = { src: string; from: number; dur: number };
export type Sfx = { src: string; from: number; volume: number };
export type SceneDef = { range: Range; El: React.FC<{ frame: number }> };

// Let the shared WebGL engine paint each frame before Remotion screenshots it
export const useEnginePaint = (frame: number) => {
  const [warm] = useState(() => delayRender("tactile warmup"));
  useLayoutEffect(() => {
    const t = setTimeout(() => continueRender(warm), 600);
    return () => clearTimeout(t);
  }, [warm]);
  useLayoutEffect(() => {
    const h = delayRender(`tactile paint ${frame}`);
    const id = requestAnimationFrame(() => requestAnimationFrame(() => continueRender(h)));
    return () => {
      cancelAnimationFrame(id);
      continueRender(h);
    };
  }, [frame]);
};

/** Music bed ducked under voice; `silences` are [from, to] comedic dead-air gaps */
export const musicVolume = (vo: Vo[], duration: number, silences: Range[], [low, high]: readonly [number, number]) => (f: number) => {
  const talking = vo.some((v) => f >= v.from - 6 && f < v.from + v.dur);
  const base = talking ? low : high;
  const gag = silences.reduce((m, [a, b]) => m * (1 - progress(f, a - 10, a) * (1 - progress(f, b - 4, b + 6))), 1);
  const fadeIn = interpolate(f, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(f, [duration - 30, duration], [1, 0], { extrapolateLeft: "clamp" });
  return base * gag * fadeIn * fadeOut;
};

export const ReelShell: React.FC<{
  scenes: SceneDef[];
  headlines: HeadlineItem[];
  headlineSize?: number;
  vo: Vo[];
  sfx: Sfx[];
  duration: number;
  silences?: Range[];
  overlay?: React.FC<{ frame: number }>;
  /** push scene content down (px) to sit closer to the vertical center */
  shift?: number;
  /** music bed (staticFile path) and its volume [under voice, between lines]; null = the parent plays the music */
  music?: string | null;
  musicLevel?: readonly [number, number];
  /** background layer under the scenes (e.g. <DotOrbitBg />); default plain white */
  bg?: React.ReactNode;
}> = ({ scenes, headlines, headlineSize, vo, sfx, duration, silences = [], overlay: Overlay, shift = 0, music = "music/bed.mp3", musicLevel = [0.1, 0.2], bg }) => {
  const frame = useCurrentFrame();
  setClock(frame, 60);
  useEnginePaint(frame);
  return (
    <AbsoluteFill style={{ ...tokens, background: "#fff", color: K.text, fontFamily: K.font, WebkitFontSmoothing: "antialiased" }}>
      {bg}
      {scenes.map(({ range, El }, i) =>
        frame >= range[0] - 2 && frame < range[1] + 6 ? (
          <AbsoluteFill key={i} style={sceneStyle(frame, range)}>
            <AbsoluteFill style={{ transform: `translateY(${shift}px)` }}>
              <El frame={frame} />
            </AbsoluteFill>
          </AbsoluteFill>
        ) : null,
      )}
      <Headline frame={frame} items={headlines} size={headlineSize} />
      {Overlay && <Overlay frame={frame} />}

      {music && <Audio loop src={staticFile(music)} volume={musicVolume(vo, duration, silences, musicLevel)} />}
      {vo.map((v) => (
        <Sequence key={v.src} from={v.from} layout="none">
          <Audio src={staticFile(v.src)} volume={1} />
        </Sequence>
      ))}
      {sfx.map((s, i) => (
        <Sequence key={i} from={s.from} layout="none">
          <Audio src={staticFile(s.src)} volume={s.volume} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
