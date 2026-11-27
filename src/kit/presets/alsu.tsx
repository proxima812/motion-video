import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { loadFont as loadMontserrat } from "@remotion/google-fonts/Montserrat";
import { SPRING, ease, progress, springAt } from "../../stage/motion";
import { DotPattern, INTER, MONO, MONT, UNB, grad } from "../../cover/CoverLab";
import { QUAD_FIT } from "../quadFit";
import { makeTitle, plate } from "./shared";
import type { HostPreset, Palette } from "./types";

// Alsu - «студентка». Light jacket, navy kalfak with blue flowers. Continues her covers sticker / big-type:
// a bright background with turning rays and dots, sticker words with a white outline and a hard shadow, tilted pills
// with a black border, round badges, huge two-line type. Motion: lively and springy - pops with a bounce and a tilt,
// swipe transitions. Telling: a question to the viewer -> «проверь себя» -> the answer. The fastest pace of all.
// Elements: StickerWord, Pill, RoundBadge, QuizCard, BigType, Confetti.

// Tatar letters (ә ө ү ң җ һ): Rubik Mono has no cyrillic-ext, so such words switch to Montserrat 900 (cyrillic-ext loaded here)
loadMontserrat("normal", { weights: ["900"], subsets: ["cyrillic-ext"] });
const TATAR = /[әөүңҗһӘӨҮҢҖҺ]/;

export const INK_ALSU = "#1D1A14";
const RED = "#E5484D";
export const ALSU_PALETTES: readonly Palette[] = [
  { name: "cobalt", main: "#1B2F7A", vivid: "#2F55D4", glow: "#A9BEF5", pale: "#EDF2FE", plate: plate("#4A6FE6", "#1B2F7A"), gray: "#DCE2F2", muted: "#6C7590", bright: "#9DB8FF" },
  { name: "sky", main: "#145A86", vivid: "#2E9BD6", glow: "#A8DDF5", pale: "#EAF7FD", plate: plate("#45AEE3", "#145A86"), gray: "#D8E8F0", muted: "#67808E", bright: "#8FD3F5" },
  { name: "indigo", main: "#3A2F8A", vivid: "#6A5CE0", glow: "#C7C0F7", pale: "#F1EFFE", plate: plate("#7B6EEA", "#3A2F8A"), gray: "#E2DFF4", muted: "#77739A", bright: "#B7ADFF" },
];

const SPR = SPRING.bouncy;

/** Words pop with a bounce and an alternating tilt; key words become a tilted vivid pill with a black border and a hard shadow */
const Title = makeTitle(SPR, 3, (t, i, key, pal) => ({
  opacity: Math.min(1, t * 2),
  transform: `scale(${0.4 + 0.6 * t}) rotate(${(i % 2 ? 6 : -6) * (1 - Math.min(t, 1)) + (key ? (i % 2 ? 3 : -3) : 0)}deg)`,
  ...(key ? { fontFamily: MONT, fontWeight: 900, color: "#fff", background: pal.vivid, border: `5px solid ${INK_ALSU}`, borderRadius: 22, padding: "0.02em 0.22em 0.08em", boxShadow: `8px 9px 0 ${INK_ALSU}`, letterSpacing: "-0.02em" } : null),
}));

/** Sticker-cover background: bright color, white rays turning slowly, dark dots */
const Bg: React.FC<{ pal: Palette }> = ({ pal }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: pal.bright ?? pal.glow, overflow: "hidden" }}>
      <DotPattern color="rgba(29,26,20,0.14)" size={40} r={3} mask={false} />
      <svg viewBox="-100 -100 200 200" width={2400} height={2400} style={{ position: "absolute", left: 540 - 1200, top: 700 - 1200, opacity: 0.2, transform: `rotate(${frame * 0.08}deg)` }}>
        {Array.from({ length: 24 }, (_, i) => <path key={i} d="M0 0 L-9 -100 L9 -100Z" fill="#fff" transform={`rotate(${i * 15})`} />)}
      </svg>
      <AbsoluteFill style={{ background: "radial-gradient(60% 40% at 50% 30%, rgba(255,255,255,0.45), transparent 70%)" }} />
    </AbsoluteFill>
  );
};

// pop with overshoot and a small tilt; i alternates the tilt in staggered groups
const enter = (frame: number, at: number, i = 0): React.CSSProperties => {
  const t = springAt(frame, at, SPR);
  return { opacity: Math.min(1, t * 2), transform: `translateY(${(1 - t) * 60}px) scale(${0.4 + 0.6 * t}) rotate(${(i % 2 ? 5 : -5) * (1 - Math.min(t, 1))}deg)` };
};
const exit = (frame: number, at: number): React.CSSProperties => {
  const o = ease.in(progress(frame, at, at + 8));
  return o <= 0 ? {} : { opacity: 1 - o, transform: `scale(${1 - 0.4 * o})` };
};
/** pop scale (with overshoot) and opacity; out = shrink away from that frame */
const popT = (frame: number, at: number, out?: number) => {
  const t = springAt(frame, at, SPR);
  const o = out == null ? 0 : ease.in(progress(frame, out, out + 8));
  return { s: (0.3 + 0.7 * t) * (1 - 0.5 * o), o: Math.min(1, t * 2) * (1 - o), t };
};
/** horizontal shake for a wrong answer */
const shakeX = (frame: number, at: number) => {
  const d = frame - at;
  return d < 0 || d > 18 ? 0 : Math.sin(d * 1.9) * 16 * (1 - d / 18);
};
const outline = (o: number, c = "#fff") => [`${o}px ${o}px 0 ${c}`, `-${o}px -${o}px 0 ${c}`, `${o}px -${o}px 0 ${c}`, `-${o}px ${o}px 0 ${c}`, `0 ${o}px 0 ${c}`, `0 -${o}px 0 ${c}`, `${o}px 0 0 ${c}`, `-${o}px 0 0 ${c}`];

/* ───────── Elements ───────── */

/** A sticker word (sticker cover): Rubik Mono with a white outline and a hard ink shadow; Tatar words fall back to Montserrat 900 */
export const StickerWord: React.FC<{ frame: number; at: number; out?: number; text: string; x?: number; y: number; size?: number; rot?: number; color?: string }> = ({ frame, at, out, text, x = 540, y, size = 120, rot = -4, color = INK_ALSU }) => {
  const { s, o } = popT(frame, at, out);
  const tatar = TATAR.test(text);
  return (
    <div style={{ position: "absolute", left: x - 520, width: 1040, top: y, textAlign: "center", opacity: o, transform: `rotate(${rot}deg) scale(${s})` }}>
      <span style={{ fontFamily: tatar ? MONT : MONO, fontWeight: tatar ? 900 : 400, fontSize: size, lineHeight: 1.1, color, whiteSpace: "nowrap", textShadow: [...outline(Math.round(size / 20)), `${Math.round(size / 8.5)}px ${Math.round(size / 7.5)}px 0 ${INK_ALSU}`].join(", ") }}>{text}</span>
    </div>
  );
};

/** Tilted pill with a black border and a hard shadow (sticker cover). bg defaults to the palette vivid */
export const Pill: React.FC<{ frame: number; at: number; out?: number; pal: Palette; text: string; x?: number; y: number; size?: number; rot?: number; bg?: string; color?: string; icon?: React.ReactNode }> = ({ frame, at, out, pal, text, x = 540, y, size = 64, rot = 5, bg, color = "#fff", icon }) => {
  const { s, o } = popT(frame, at, out);
  return (
    <div style={{ position: "absolute", left: x - 520, width: 1040, top: y, display: "flex", justifyContent: "center", opacity: o }}>
      <div style={{ display: "flex", alignItems: "center", gap: size * 0.25, transform: `rotate(${rot}deg) scale(${s})`, background: bg ?? pal.vivid, color, fontFamily: MONT, fontWeight: 900, fontSize: size, lineHeight: 1.1, padding: `${size * 0.26}px ${size * 0.6}px`, borderRadius: size * 0.42, border: `${Math.max(4, size / 11)}px solid ${INK_ALSU}`, boxShadow: `${size / 6.5}px ${size / 5.5}px 0 ${INK_ALSU}`, whiteSpace: "nowrap" }}>
        {icon}
        {text}
      </div>
    </div>
  );
};

/** Round white badge with a big score / number and a small line (sticker cover). `big` may change over time (0/2 -> 1/2) */
export const RoundBadge: React.FC<{ frame: number; at: number; out?: number; big: string; small?: string; x: number; y: number; d?: number; rot?: number; bumpAt?: number[]; color?: string }> = ({ frame, at, out, big, small, x, y, d = 250, rot = -10, bumpAt = [], color = INK_ALSU }) => {
  const { s, o } = popT(frame, at, out);
  const bump = bumpAt.reduce((m, b) => Math.max(m, frame >= b ? Math.sin(Math.min(1, (frame - b) / 14) * Math.PI) * 0.18 : 0), 0);
  return (
    <div style={{ position: "absolute", left: x - d / 2, top: y - d / 2, width: d, height: d, borderRadius: "50%", background: "#fff", border: `${d / 40}px solid ${INK_ALSU}`, boxShadow: `${d / 30}px ${d / 25}px 0 ${INK_ALSU}`, opacity: o, transform: `rotate(${rot}deg) scale(${s * (1 + bump)})`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: UNB, fontWeight: 900, color, boxSizing: "border-box" }}>
      <div style={{ fontSize: big.length > 3 ? d * 0.26 : d * 0.36, lineHeight: 1, letterSpacing: "-0.04em" }}>{big}</div>
      {small && <div style={{ fontSize: d * 0.12, fontWeight: 700, marginTop: d * 0.03 }}>{small}</div>}
    </div>
  );
};

/** Quiz: a question card (a sticker word + a small lead) and answer buttons that pop in; at `judge` the correct answer
 *  fills with the vivid color and gets a ✓, a wrong one shakes, turns red and gets a ✕. */
export type QuizOption = { text: string; at: number; correct?: boolean; judge?: number };
export const QuizCard: React.FC<{ frame: number; at: number; out?: number; pal: Palette; question: string; lead?: string; options: QuizOption[]; y: number; w?: number }> = ({ frame, at, out, pal, question, lead, options, y, w = 820 }) => {
  const card = popT(frame, at, out);
  return (
    <div style={{ position: "absolute", left: 540 - w / 2, width: w, top: y, opacity: card.o }}>
      <div style={{ transform: `rotate(-2deg) scale(${card.s})`, background: "#fff", borderRadius: 48, border: `6px solid ${INK_ALSU}`, boxShadow: `12px 14px 0 ${INK_ALSU}`, padding: "50px 40px 44px", textAlign: "center" }}>
        <div style={{ fontFamily: TATAR.test(question) ? MONT : MONO, fontWeight: TATAR.test(question) ? 900 : 400, fontSize: 120, lineHeight: 1, letterSpacing: "-0.02em", ...grad(`linear-gradient(180deg, ${pal.vivid}, ${pal.main})`) }}>{question}</div>
        {lead && <div style={{ fontFamily: INTER, fontWeight: 500, fontSize: 44, color: "#6C7590", marginTop: 14 }}>{lead}</div>}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 30, marginTop: 46, alignItems: "center" }}>
        {options.map((op, i) => {
          const { s, o } = popT(frame, op.at, out);
          const judged = op.judge != null && frame >= op.judge;
          const jt = judged ? springAt(frame, op.judge!, SPR) : 0;
          const good = judged && op.correct;
          const bad = judged && !op.correct;
          const bg = good ? pal.vivid : bad ? "#FFE3E3" : "#fff";
          return (
            <div key={i} style={{ position: "relative", width: w - 120, opacity: o * (bad ? 1 - 0.35 * Math.min(1, jt) : 1), transform: `translateX(${bad ? shakeX(frame, op.judge!) : 0}px) rotate(${(i % 2 ? 1.5 : -1.5)}deg) scale(${s * (good ? 1 + Math.sin(Math.min(1, jt) * Math.PI) * 0.08 : 1)})` }}>
              <div style={{ background: bg, color: good ? "#fff" : bad ? RED : INK_ALSU, fontFamily: MONT, fontWeight: 900, fontSize: 64, lineHeight: 1, padding: "30px 40px", borderRadius: 30, border: `6px solid ${INK_ALSU}`, boxShadow: `9px 11px 0 ${INK_ALSU}`, textAlign: "center", textDecoration: bad ? "line-through" : undefined, textDecorationThickness: 7 }}>{op.text}</div>
              {judged && (
                <div style={{ position: "absolute", right: -34, top: -30, width: 92, height: 92, borderRadius: "50%", background: good ? "#2FA572" : RED, border: `5px solid ${INK_ALSU}`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: MONT, fontWeight: 900, fontSize: 54, transform: `scale(${Math.min(1.15, jt)}) rotate(${good ? 8 : -8}deg)` }}>{good ? "✓" : "✕"}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** Two huge Unbounded lines in a vivid -> main gradient (big-type cover); each line pops at its own frame */
export const BigType: React.FC<{ frame: number; at: [number, number]; out?: number; pal: Palette; lines: [string, string]; y: number; size?: number }> = ({ frame, at, out, pal, lines, y, size }) => {
  const fs = size ?? Math.min(170, Math.floor(940 / (Math.max(lines[0].length, lines[1].length) * 0.95)));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, textAlign: "center", fontFamily: UNB, fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 0.98, fontSize: fs }}>
      {lines.map((l, i) => {
        const { s, o } = popT(frame, at[i], out);
        return (
          <div key={i} style={{ opacity: o, transform: `scale(${s}) rotate(${(i % 2 ? 2 : -2) * (1 - Math.min(1, s))}deg)` }}>
            <span style={{ ...grad(`linear-gradient(180deg, ${pal.vivid} 0%, ${pal.main} 100%)`), filter: `drop-shadow(0 6px 0 #fff)` }}>{l}</span>
          </div>
        );
      })}
    </div>
  );
};

/** Confetti burst from (x, y) at `at`: pieces fly out and fall (giant-number cover colors + the palette) */
export const Confetti: React.FC<{ frame: number; at: number; pal: Palette; x: number; y: number; n?: number; power?: number }> = ({ frame, at, pal, x, y, n = 36, power = 1 }) => {
  const d = frame - at;
  if (d < 0 || d > 110) return null;
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2 + (i % 3) * 0.3;
        const v = (9 + ((i * 37) % 7)) * power;
        const px = x + Math.cos(a) * v * d * 0.9;
        const py = y + Math.sin(a) * v * d * 0.7 + 0.09 * d * d;
        const wpx = 14 + (i % 3) * 6;
        return <div key={i} style={{ position: "absolute", left: px, top: py, width: wpx, height: wpx * 0.45, borderRadius: 3, background: [pal.vivid, "#F2A900", "#7A4DFF", "#2FA572", "#fff"][i % 5], transform: `rotate(${d * (6 + (i % 5)) + i * 40}deg)`, opacity: 1 - progress(frame, at + 70, at + 110) }} />;
      })}
    </>
  );
};

/* ───────── Preset ───────── */

const Showcase: React.FC<{ frame: number; pal: Palette }> = ({ frame, pal }) => (
  <AbsoluteFill>
    <StickerWord frame={frame} at={10} text="проверь" y={190} size={110} />
    <RoundBadge frame={frame} at={30} big={frame >= 170 ? "1/1" : "0/1"} small="верно" x={890} y={260} d={200} bumpAt={[170]} />
    <QuizCard frame={frame} at={50} pal={pal} question="Рәхмәт" lead="это" y={420} options={[{ text: "спасибо", at: 80, correct: true, judge: 170 }, { text: "привет", at: 90, judge: 150 }]} />
    <Confetti frame={frame} at={170} pal={pal} x={540} y={800} />
    <BigType frame={frame} at={[240, 252]} pal={pal} lines={["знаешь", "больше"]} y={1120} size={130} />
  </AbsoluteFill>
);

export const ALSU: HostPreset = {
  id: "alsu",
  name: "Алсу",
  role: "студентка",
  palettes: ALSU_PALETTES,
  covers: ["sticker", "big-type"],
  tags: ["[excited]", "[curious]", "[playful]", "[laughs]"],
  fit: QUAD_FIT.alsu,
  motion: {
    spring: SPR,
    stagger: 3,
    enter,
    exit,
    // swipe: the new scene comes in from the right, the old one leaves to the left
    scene: (frame, [a, b]) => {
      const t = a === 0 ? 1 : springAt(frame, a, SPRING.snappy);
      const out = ease.in(progress(frame, b, b + 10));
      return { transform: `translateX(${(1 - t) * 1080 - out * 1080}px)` };
    },
    scenePad: [0, 10],
    drift: 0,
  },
  Title,
  Bg,
  Showcase,
};
