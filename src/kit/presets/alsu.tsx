import React from "react";
import { AbsoluteFill } from "remotion";
import { SPRING, ease, progress, springAt } from "../../stage/motion";
import { PARAGRAPH } from "../design";
import { HOST_FIT } from "./fit";
import { CreamWash, makeTitle, plate, tatarverseCover } from "./shared";
import type { HostPreset, Palette } from "./types";

// Alsu - «студентка». Light jacket, navy kalfak with blue flowers. Lively and springy: things pop in one after
// another with a bounce, swipe transitions, stickers drop into the frame. Elements: quiz (question + answers),
// «миф / правда», a card stack, progress bars. Decor: blue flower pattern, dots, small sparks.
// Telling: a question to the viewer -> «проверь себя» -> the answer. The fastest pace of all.

export const ALSU_PALETTES: readonly Palette[] = [
  { name: "cobalt", main: "#1B2F7A", vivid: "#2F55D4", glow: "#A9BEF5", pale: "#EDF2FE", plate: plate("#4A6FE6", "#1B2F7A"), bg: ["#eef3fe", "#9db5f2", "#2F55D4"] },
  { name: "sky", main: "#145A86", vivid: "#2E9BD6", glow: "#A8DDF5", pale: "#EAF7FD", plate: plate("#45AEE3", "#145A86"), bg: ["#ecf8fe", "#9ed6f2", "#2E9BD6"] },
  { name: "indigo", main: "#3A2F8A", vivid: "#6A5CE0", glow: "#C7C0F7", pale: "#F1EFFE", plate: plate("#7B6EEA", "#3A2F8A"), bg: ["#f2f0fe", "#b9b0f3", "#6A5CE0"] },
];

const SPR = SPRING.bouncy;

/** Words pop with a bounce and an alternating tilt; key words sit on a pale highlight */
const Title = makeTitle(SPR, 3, (t, i, key, pal) => ({
  opacity: Math.min(1, t * 2),
  transform: `scale(${0.4 + 0.6 * t}) rotate(${(i % 2 ? 6 : -6) * (1 - Math.min(t, 1))}deg)`,
  ...(key ? { background: pal.pale, borderRadius: 18, padding: "0 0.16em", boxShadow: `inset 0 -0.18em 0 ${pal.glow}` } : null),
}));

export const ALSU: HostPreset = {
  id: "alsu",
  name: "Алсу",
  role: "студентка",
  voice: { id: "YjESejviApN7SHrbfnA2", name: "Nastya", stability: 0.4, similarity: 0.75, tags: ["[excited]", "[curious]", "[playful]", "[laughs]"] },
  avatarDir: "hosts/alsu",
  fit: HOST_FIT.alsu,
  palettes: ALSU_PALETTES,
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
  },
  Title,
  Bg: ({ pal }) => <CreamWash pal={pal} from={940} strength={0.66} speed={0.9} />,
  cover: (pal) => tatarverseCover(pal),
  Showcase: ({ frame, pal }) => (
    <AbsoluteFill>
      <Title text="Алсу *студентка*" frame={frame} at={10} pal={pal} top={700} size={120} />
      <div style={{ ...PARAGRAPH, position: "absolute", left: 0, right: 0, top: 900, textAlign: "center", fontSize: 44, ...ALSU.motion.enter(frame, 40) }}>вопрос проверь себя ответ</div>
    </AbsoluteFill>
  ),
};
