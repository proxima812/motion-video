// Dark preset kit (@const_proxima "Тёмный"): no avatar, no Outro - the reel ends on a hard cut (or an optional fade).
// Near-black background, white + light-gray type, very subtle film grain, scanlines and short glitches.
// Everything is a pure function of `frame` (60 fps), seek-safe. See .claude/skills/new-v/SKILL.md, preset «Тёмный».
import React, { useLayoutEffect, useRef } from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { INTER, RALEWAY } from "./design";
import { SPRING, progress, springAt } from "../stage/motion";

export const { fontFamily: MONO_FAMILY } = loadMono("normal", { weights: ["400", "500"], subsets: ["latin", "cyrillic"] });

export const DARK = {
  bg: "#060607",
  white: "#FFFFFF",
  gray: "#C3C6CC", // light gray - second text color
  dim: "#7E828A", // HUD / chrome only
  line: "rgba(255,255,255,0.16)",
};
export const D_MONO = `${MONO_FAMILY}, monospace`;
export const D_HEADING: React.CSSProperties = { fontFamily: `${INTER}, sans-serif`, fontWeight: 400, color: DARK.white, letterSpacing: "-0.03em", lineHeight: 1.05 };
export const D_PARAGRAPH: React.CSSProperties = { fontFamily: `${RALEWAY}, sans-serif`, fontWeight: 400, color: DARK.gray, lineHeight: 1.3, fontVariantNumeric: "lining-nums proportional-nums" };
export const D_HUD: React.CSSProperties = { fontFamily: D_MONO, fontSize: 26, color: DARK.dim, letterSpacing: "0.16em", textTransform: "uppercase", whiteSpace: "pre" };

/* ───────── deterministic noise ───────── */

export const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};
export const rng = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/* ───────── TeX (pre-rendered MathJax SVG from scripts/gen-tex.mjs) ───────── */

export type TexDef = { readonly vb: string; readonly body: string };
const vbOf = (t: TexDef) => t.vb.split(" ").map(Number);
/** em = font size in px (MathJax units: 1000 per em). */
export const Tex: React.FC<{ t: TexDef; em: number; color?: string; style?: React.CSSProperties }> = ({ t, em, color = DARK.white, style }) => {
  const [, , vw, vh] = vbOf(t);
  return <svg viewBox={t.vb} width={(vw * em) / 1000} height={(vh * em) / 1000} style={{ color, overflow: "visible", display: "block", ...style }} dangerouslySetInnerHTML={{ __html: t.body }} />;
};
export const texSize = (t: TexDef, em: number) => {
  const [, , vw, vh] = vbOf(t);
  return { w: (vw * em) / 1000, h: (vh * em) / 1000 };
};
/** Biggest em (<= maxEm) that keeps the formula within maxW px. */
export const fitEm = (t: TexDef, maxW: number, maxEm: number) => Math.min(maxEm, (maxW * 1000) / vbOf(t)[2]);

/* ───────── reveals ───────── */

/** Soft fade + blur-in from `at` (0..1 progress returned with the style). */
export const reveal = (frame: number, at: number, dy = 24) => {
  const t = springAt(frame, at, SPRING.soft);
  return {
    t,
    style: { opacity: Math.min(1, t * 1.25), transform: `translateY(${(1 - Math.min(t, 1)) * dy}px)`, filter: t < 0.98 ? `blur(${Math.max(0, (1 - t) * 14)}px)` : undefined } as React.CSSProperties,
  };
};
export const fadeOut = (frame: number, at: number, len = 12): React.CSSProperties => {
  const o = progress(frame, at, at + len);
  return o <= 0 ? {} : { opacity: 1 - o, filter: `blur(${o * 12}px)` };
};

/** Words appear one by one (blur + rise). */
export const DWords: React.FC<{ text: string; frame: number; at: number; stagger?: number; style?: React.CSSProperties }> = ({ text, frame, at, stagger = 4, style }) => (
  <span style={style}>
    {text.split(" ").map((w, i, all) => {
      const { style: s } = reveal(frame, at + i * stagger, 18);
      return (
        <span key={i} style={{ display: "inline-block", marginRight: i < all.length - 1 ? "0.26em" : 0, ...s }}>
          {w}
        </span>
      );
    })}
  </span>
);

const GLYPHS = "01<>/#%&*+=ABCDEFΔΣΨλ";
/** Mono text that "decodes" from random glyphs, char by char, starting at `at`. */
export const Decode: React.FC<{ text: string; frame: number; at: number; speed?: number; style?: React.CSSProperties }> = ({ text, frame, at, speed = 1.2, style }) => {
  const t = frame - at;
  if (t < 0) return null;
  return (
    <span style={{ ...D_HUD, ...style }}>
      {[...text].map((c, i) => {
        if (c === " ") return " ";
        const done = t >= i * speed + 6;
        const ch = done ? c : GLYPHS[Math.floor(hash(i * 13 + Math.floor(frame / 2)) * GLYPHS.length)];
        return <span key={i} style={{ opacity: t >= i * speed ? 1 : 0 }}>{ch}</span>;
      })}
    </span>
  );
};

/* ───────── glitch ───────── */

/** 0..1 glitch strength: short decaying bursts at `hits`, plus rare 1-frame micro-glitches. */
export const glitchAt = (frame: number, hits: number[], len = 7) => {
  const burst = hits.reduce((m, h) => (frame >= h && frame < h + len ? Math.max(m, 1 - (frame - h) / len) : m), 0);
  const micro = hash(Math.floor(frame) * 0.731 + 9) > 0.988 ? 0.22 : 0;
  return Math.max(burst, micro);
};

/** Re-draws children with horizontal slice offsets and a faint chroma split while `amount` > 0. */
export const Glitch: React.FC<{ frame: number; amount: number; children: React.ReactNode }> = ({ frame, amount, children }) => {
  if (amount < 0.02) return <>{children}</>;
  const r = rng(Math.floor(frame) * 31 + 7);
  const bands = 7;
  const off = amount * 7;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: 0.35 * amount, transform: `translateX(${-off}px)`, filter: "sepia(1) saturate(7) hue-rotate(-50deg)", mixBlendMode: "screen" }}>{children}</AbsoluteFill>
      <AbsoluteFill style={{ opacity: 0.35 * amount, transform: `translateX(${off}px)`, filter: "sepia(1) saturate(7) hue-rotate(150deg)", mixBlendMode: "screen" }}>{children}</AbsoluteFill>
      {Array.from({ length: bands }, (_, i) => {
        const a = (i / bands) * 100;
        const dx = r() < 0.55 ? 0 : (r() - 0.5) * amount * 32;
        return (
          <AbsoluteFill key={i} style={{ clipPath: `inset(${a}% 0 ${100 - a - 100 / bands}% 0)`, transform: `translateX(${dx.toFixed(1)}px)` }}>
            {children}
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};

/* ───────── camera: punch-ins, cuts, pans ───────── */

/** Camera key: from frame `f` look at point (x, y) of the 1080x1920 scene at zoom `s`; `cut` = jump, else a fast spring. */
export type CamKey = { f: number; x?: number; y?: number; s?: number; cut?: boolean; soft?: boolean };
export const camAt = (frame: number, keys: CamKey[]) => {
  let x = keys[0].x ?? 540;
  let y = keys[0].y ?? 960;
  let s = keys[0].s ?? 1;
  for (const k of keys.slice(1)) {
    if (frame < k.f) break;
    const t = k.cut ? 1 : Math.min(1, springAt(frame, k.f, k.soft ? SPRING.soft : SPRING.snappy));
    x += ((k.x ?? 540) - x) * t;
    y += ((k.y ?? 960) - y) * t;
    s += ((k.s ?? 1) - s) * t;
  }
  return { x, y, s };
};
/** Moves the scene so that the camera point sits in the frame centre; `drift` adds a slow zoom per frame. */
export const Cam: React.FC<{ frame: number; keys: CamKey[]; drift?: number; children: React.ReactNode }> = ({ frame, keys, drift = 0, children }) => {
  const { x, y, s: s0 } = camAt(frame, keys);
  const s = s0 * (1 + drift * Math.max(0, frame - keys[0].f));
  return <AbsoluteFill style={{ transform: `translate(${(540 - x) * s}px, ${(960 - y) * s}px) scale(${s})`, transformOrigin: "540px 960px" }}>{children}</AbsoluteFill>;
};

/* ───────── focus: the accent element is sharp, everything else blurs back ───────── */

/** From frame `f` only the ids in `on` are in focus ("all" = everything sharp). */
export type FocusKey = { f: number; on: string[] | "all" };
const isOn = (k: FocusKey | undefined, id: string) => !k || k.on === "all" || k.on.includes(id);
/** Style for element `id`: 0 = in focus (sharp), 1 = out of focus (blurred, dimmed); 8-frame rack focus between keys. */
export const focus = (frame: number, keys: FocusKey[], id: string, blur = 11, dim = 0.32): React.CSSProperties => {
  let cur = -1;
  keys.forEach((k, i) => frame >= k.f && (cur = i));
  const now = isOn(keys[cur], id) ? 0 : 1;
  const was = cur > 0 ? (isOn(keys[cur - 1], id) ? 0 : 1) : now;
  const t = cur >= 0 ? progress(frame, keys[cur].f, keys[cur].f + 8) : 1;
  const v = was + (now - was) * t;
  return v < 0.01 ? {} : { filter: `blur(${(v * blur).toFixed(1)}px)`, opacity: 1 - v * (1 - dim) };
};

/* ───────── texture: grain, scanlines, vignette ───────── */

const GW = 360;
const GH = 640;
/** Animated film grain (new pattern every 2 frames), screen-blended, barely visible. */
export const Grain: React.FC<{ frame: number; opacity?: number }> = ({ frame, opacity = 0.065 }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const seed = Math.floor(frame / 2);
  useLayoutEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    const img = ctx.createImageData(GW, GH);
    const r = rng(seed * 7919 + 1);
    for (let i = 0; i < GW * GH; i++) {
      const v = Math.pow(r(), 2.2) * 255;
      img.data[i * 4] = v;
      img.data[i * 4 + 1] = v;
      img.data[i * 4 + 2] = v;
      img.data[i * 4 + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  }, [seed]);
  return <canvas ref={ref} width={GW} height={GH} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity, mixBlendMode: "screen", imageRendering: "pixelated" }} />;
};

export const Texture: React.FC<{ frame: number; grain?: number }> = ({ frame, grain }) => (
  <>
    <Grain frame={frame} opacity={grain} />
    <AbsoluteFill style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,0.018) 0px, rgba(255,255,255,0.018) 1px, transparent 1px, transparent 4px)" }} />
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 46%, transparent 52%, rgba(0,0,0,0.6) 100%)" }} />
  </>
);

/* ───────── shell ───────── */

export type Range = readonly [number, number];
export type Vo = { src: string; from: number; dur: number };
export type Sfx = { src: string; from: number; volume: number };
export type DarkScene = { range: Range; El: React.FC<{ frame: number }> };

const sceneStyle = (frame: number, [a, b]: Range, last: boolean): React.CSSProperties => {
  const inT = a === 0 ? 1 : progress(frame, a, a + 6);
  const out = last ? 0 : progress(frame, b - 4, b + 1);
  const v = Math.min(inT, 1 - out);
  return { opacity: v, filter: v < 0.99 ? `blur(${(1 - v) * 14}px)` : undefined };
};

/** Music: baked fade-in in the file; ducked under the voice; fades out with the picture. */
export const darkMusicVolume = (vo: Vo[], duration: number, [low, high]: readonly [number, number], fadeLen: number) => (f: number) => {
  const talk = vo.reduce((m, v) => Math.max(m, progress(f, v.from - 14, v.from) * (1 - progress(f, v.from + v.dur, v.from + v.dur + 24))), 0);
  const base = high + (low - high) * talk;
  return fadeLen > 0 ? base * interpolate(f, [duration - fadeLen, duration], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : base;
};

export const DarkShell: React.FC<{
  scenes: DarkScene[];
  vo: Vo[];
  sfx: Sfx[];
  duration: number;
  /** frames where the picture glitches (scene changes, punch words) */
  glitches?: number[];
  /** layer over the scenes, under the texture (e.g. a persistent signal line) */
  overlay?: React.FC<{ frame: number }>;
  music?: string | null;
  musicLevel?: readonly [number, number];
  /** soft white flashes on punch moments (frames) */
  flashes?: number[];
  /** picture fade-out at the end (frames); 0 = hard cut (preset default: the reel just stops) */
  fadeOut?: number;
  /** music fade-out length (frames); 0 = the song is cut with the picture */
  musicFade?: number;
}> = ({ scenes, vo, sfx, duration, glitches = [], flashes = [], overlay: Overlay, music, musicLevel = [0.2, 0.42], fadeOut: fade = 0, musicFade = 0 }) => {
  const frame = useCurrentFrame();
  const g = glitchAt(frame, glitches);
  const black = fade > 0 ? interpolate(frame, [duration - fade, duration - 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
  const flash = flashes.reduce((m, h) => (frame >= h && frame < h + 8 ? Math.max(m, 0.12 * (1 - (frame - h) / 8)) : m), 0);
  return (
    <AbsoluteFill style={{ background: DARK.bg, color: DARK.white, WebkitFontSmoothing: "antialiased", overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 70% 45% at 50% 46%, rgba(255,255,255,0.035) 0%, transparent 70%)" }} />
      <Glitch frame={frame} amount={g}>
        {scenes.map(({ range, El }, i) =>
          frame >= range[0] && frame < range[1] + 1 ? (
            <AbsoluteFill key={i} style={sceneStyle(frame, range, i === scenes.length - 1)}>
              <El frame={frame} />
            </AbsoluteFill>
          ) : null,
        )}
        {Overlay && <Overlay frame={frame} />}
      </Glitch>
      <Texture frame={frame} grain={0.065 + g * 0.08} />
      {flash > 0 && <AbsoluteFill style={{ background: "#fff", opacity: flash, mixBlendMode: "screen" }} />}
      {black > 0 && <AbsoluteFill style={{ background: "#000", opacity: black }} />}

      {music && <Audio src={staticFile(music)} volume={darkMusicVolume(vo, duration, musicLevel, musicFade)} />}
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
