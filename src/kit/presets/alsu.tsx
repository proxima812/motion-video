import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { SPRING, ease, progress, springAt } from "../../stage/motion";
import { DotPattern, MONT } from "../../cover/CoverLab";
import { PARAGRAPH } from "../design";
import { QUAD_FIT } from "../quadFit";
import { makeTitle, plate } from "./shared";
import type { HostPreset, Palette } from "./types";

// Alsu - «студентка». Light jacket, navy kalfak with blue flowers. Continues her covers sticker / big-type:
// a bright background with turning rays and dots, sticker words with a white outline and a hard shadow, tilted pills
// with a black border, round badges, huge two-line type. Motion: lively and springy - pops with a bounce and a tilt,
// swipe transitions. Telling: a question to the viewer -> «проверь себя» -> the answer. The fastest pace of all.

export const INK_ALSU = "#1D1A14";
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
    // pop with overshoot and a small tilt; i alternates the tilt in staggered groups
    enter: (frame, at, i = 0) => {
      const t = springAt(frame, at, SPR);
      return { opacity: Math.min(1, t * 2), transform: `translateY(${(1 - t) * 60}px) scale(${0.4 + 0.6 * t}) rotate(${(i % 2 ? 5 : -5) * (1 - Math.min(t, 1))}deg)` };
    },
    exit: (frame, at) => {
      const o = ease.in(progress(frame, at, at + 8));
      return o <= 0 ? {} : { opacity: 1 - o, transform: `scale(${1 - 0.4 * o})` };
    },
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
  Showcase: ({ frame, pal }) => (
    <AbsoluteFill>
      <Title text="Алсу *студентка*" frame={frame} at={10} pal={pal} top={700} size={110} />
      <div style={{ ...PARAGRAPH, position: "absolute", left: 0, right: 0, top: 900, textAlign: "center", fontSize: 44, ...ALSU.motion.enter(frame, 40) }}>вопрос проверь себя ответ</div>
    </AbsoluteFill>
  ),
};
