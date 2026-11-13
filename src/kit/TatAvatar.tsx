import React from "react";
import { Img, staticFile } from "remotion";
import { SPRING, ease, progress, springAt } from "../stage/motion";
import type { LucideIcon } from "lucide-react";
import { ACCENT_WEIGHT, GLASS_PILL, INK, PARAGRAPH, SURFACE } from "./design";

// @the_tatarverse host: transparent cutout pinned to the bottom center for the whole video (not in the outro).
// She is "alive": emotion swaps every ~2 s by context, a small nod on every spoken word, sway + breathing,
// and the spoken words pop out of her in small pills on the side she looks to (right; left when mirrored) and vanish right away.
export type Emotion = "confident-emerald" | "confident-traditional" | "kalpak-green" | "portrait-green" | "portrait-traditional" | "smile-green"
  | "pensive" | "dreamy" | "displeased" | "surprised" | "waving" | "inspired" | "explaining" | "delighted" | "skeptical" | "laughing" | "puzzled" | "disappointed" | "smile-up" | "thinking" | "soft-smile";
export type AvatarKey = { at: number; e: Emotion };
// Subtitles only: plain words on a frosted glass pill, no icons. accent = accent text color (weight 500).
// icon / glass are ignored (kept so existing videos compile).
export type SpokenWord = { f: number; w: string; icon?: LucideIcon; accent?: string; glass?: boolean };
// Stance: "right" = she looks right, stands left (100 px from the left edge), words fly right;
// "left" = mirrored, stands right, words fly left; "center" = middle, words alternate left/right.
// Alternate right / left through the video, with an occasional center.
export type Stance = "right" | "left" | "center";
export type StanceKey = { at: number; s: Stance };

export const AVATAR = { w: 540, h: 590, sink: 40 }; // keep scene content above 1920 - AVATAR.h
// sink: the cutout starts below the frame edge, so nod (up to 7 px) + sway (up to ~2deg = ~10 px at the corners) never lift its bottom and show white

const SWAP = 12;
// source photos are framed differently: scale so the head reads the same size
const FIT: Partial<Record<Emotion, number>> = { "kalpak-green": 1.18, "portrait-traditional": 1.18 };

// word pills
const LIFE = 42; // frames on screen
const HEAD = { x: 540, y: 1470 }; // screen point the words leave from

const nodAt = (frame: number, words: SpokenWord[]) =>
  words.reduce((m, w) => {
    const d = frame - w.f;
    return d < 0 || d > 16 ? m : Math.max(m, Math.sin((d / 16) * Math.PI));
  }, 0);

// Word pills: one fixed style in every video - glass pill (GLASS_PILL over the surface radius), #251B3A Raleway text, no icons.
// Background is never the accent color; the text may be (then weight 500).
const PILL: React.CSSProperties = {
  ...SURFACE,
  fontFamily: PARAGRAPH.fontFamily,
  color: INK,
  border: "0.5px solid rgba(0,0,0,0.06)",
  fontWeight: 400,
  whiteSpace: "nowrap",
};

const WordPills: React.FC<{ frame: number; words: SpokenWord[]; head?: { x: number; y: number }; headX?: (f: number) => number; size?: number; dirAt: (f: number, i: number) => 1 | -1 }> = ({ frame, words, head = HEAD, headX, size = 1, dirAt }) => (
  <>
    {words.map((w, i) => {
      const d = frame - w.f;
      if (d < 0 || d > LIFE || w.w.length < 2) return null;
      const dir = dirAt(w.f, i);
      const hx = headX ? headX(w.f) : head.x;
      const lane = (i * 37) % 3; // vary height so neighbours don't stack
      const fly = ease.outExpo(Math.min(1, d / 22));
      const pop = springAt(frame, w.f, SPRING.bouncy);
      const fade = progress(frame, w.f + LIFE - 12, w.f + LIFE);
      const x = hx + dir * (60 + fly * (210 + lane * 30)) * size;
      const y = head.y - (10 + fly * (30 + lane * 40) + fade * 24) * size;
      return (
        <div
          key={i}
          style={{
            ...PILL,
            ...GLASS_PILL,
            ...(w.accent ? { color: w.accent, fontWeight: ACCENT_WEIGHT } : null),
            position: "absolute",
            left: x,
            top: y,
            transform: `translate(-50%, -50%) scale(${0.5 + 0.5 * Math.min(pop, 1.1)}) rotate(${dir * (1 - fly) * 8}deg)`,
            opacity: Math.min(1, d / 5) * (1 - fade),
            filter: fade > 0 ? `blur(${fade * 8}px)` : undefined,
            padding: `${10 * size}px ${22 * size}px`,
            fontSize: 32 * size,
          }}
        >
          {w.w}
        </div>
      );
    })}
  </>
);

// Landscape / custom placement: cx = horizontal center of the cutout, scale = size factor, frameH = frame height
// (word pills leave from the head). Defaults = the 1080x1920 reel layout.
const STANCE_T = 10; // frames to fade out on the old side, then fade in on the new one (no slide)
const SIDE = 100; // gap between the cutout box and the frame edge

// The cutout looks to the right. stances = alternate sides over time (see Stance). Without stances:
// cx placement, words to the right; mirror = flip her to look left, words left;
// pillsLeft (legacy, wide layouts with her at the right edge) = words left without flipping.
// color is ignored by the pills (they never take the accent color); kept so existing videos compile.
export const TatAvatar: React.FC<{ frame: number; keys: AvatarKey[]; words?: SpokenWord[]; color?: string; cx?: number; scale?: number; frameH?: number; frameW?: number; pillsLeft?: boolean; mirror?: boolean; stances?: StanceKey[] }> = ({ frame, keys, words = [], cx: cx0 = 540, scale = 1, frameH = 1920, frameW = 1080, pillsLeft = false, mirror = false, stances }) => {
  const w = AVATAR.w * scale;
  const h = AVATAR.h * scale;
  const posX = (s: Stance) => (s === "right" ? SIDE + w / 2 : s === "left" ? frameW - SIDE - w / 2 : frameW / 2);
  const face = (s: Stance) => (s === "left" ? -1 : 1);
  // cx and facing (1 = looks right, -1 = left) at frame f, eased between stance keys
  const pose = (f: number) => {
    if (!stances?.length) return { cx: cx0, flip: mirror ? -1 : 1, s: null as Stance | null, vis: 1 };
    const i = stances.reduce((acc, k, j) => (f >= k.at ? j : acc), 0);
    const cur = stances[i];
    const prev = stances[i - 1] ?? cur;
    if (prev === cur) return { cx: posX(cur.s), flip: face(cur.s), s: cur.s, vis: 1 };
    const out = progress(f, cur.at, cur.at + STANCE_T);
    const back = progress(f, cur.at + STANCE_T, cur.at + STANCE_T * 2);
    const side = out < 1 ? prev : cur;
    return { cx: posX(side.s), flip: face(side.s), s: cur.s, vis: ease.inOut(out < 1 ? 1 - out : back) };
  };
  const { cx, flip, vis } = pose(frame);
  const dirAt = (f: number, i: number): 1 | -1 => {
    const p = pose(f);
    if (!p.s) return mirror || pillsLeft ? -1 : 1;
    return p.s === "center" ? (i % 2 === 0 ? -1 : 1) : p.s === "left" ? -1 : 1;
  };
  const head = { x: cx, y: frameH - h + AVATAR.sink * scale + 100 * scale };
  const idx = keys.reduce((acc, k, i) => (frame >= k.at ? i : acc), 0);
  const enter = springAt(frame, keys[0].at, SPRING.smooth);
  const breathe = Math.sin(frame / 45) * 0.008;
  const sway = Math.sin(frame / 70) * 1.2;
  const nod = nodAt(frame, words);
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: cx - w / 2,
          bottom: -AVATAR.sink * scale,
          width: w,
          height: h,
          transformOrigin: "50% 100%",
          opacity: vis,
          transform: `translateY(${(1 - enter) * h - nod * 7 * scale}px) rotate(${(sway + nod * 0.8) * Math.sign(flip || 1)}deg) scaleX(${flip})`,
        }}
      >
        {keys.map((k, i) => {
          if (i < idx - 1 || i > idx) return null;
          const next = keys[i + 1];
          const out = next ? progress(frame, next.at, next.at + SWAP) : 0;
          const t = i === 0 ? 1 : springAt(frame, k.at, SPRING.bouncy);
          return (
            <Img
              key={i}
              src={staticFile(`tatarverse/avatar/${k.e}.png`)}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "contain",
                objectPosition: "50% 100%",
                transformOrigin: "50% 100%",
                opacity: Math.min(1, t * 1.8) * (1 - out),
                filter: out > 0 || t < 0.98 ? `blur(${Math.max(out * 12, (1 - Math.min(t, 1)) * 8)}px)` : undefined,
                transform: `translateY(${(1 - t) * 24 + out * 16}px) scale(${(0.95 + 0.05 * t) * (1 + breathe) * (FIT[k.e] ?? 1)})`,
              }}
            />
          );
        })}
      </div>
      <WordPills frame={frame} words={words} head={head} headX={(f) => pose(f).cx} size={scale === 1 ? 1 : Math.max(0.75, scale)} dirAt={dirAt} />
    </>
  );
};
