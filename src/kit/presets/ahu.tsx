import React from "react";
import { AbsoluteFill } from "remotion";
import { SPRING, ease, progress, springAt } from "../../stage/motion";
import { PARAGRAPH } from "../design";
import { HOST_FIT } from "./fit";
import { CreamWash, makeTitle, plate, tatarverseCover } from "./shared";
import type { HostPreset, Palette } from "./types";

// Ahu - «эксперт». Black blazer, emerald kalfak with gold. Clear and fast: words slide up from under a mask,
// cuts on the beat, punch-in on the key word. Elements: numbers with counters, checklists, fact plates,
// a big kinetic heading. Decor: almost none, thin gold rules. Telling: thesis -> fact / number -> short conclusion.

export const AHU_PALETTES: readonly Palette[] = [
  { name: "emerald", main: "#0F5E45", vivid: "#1E8C64", glow: "#9FD9BF", pale: "#E8F5EF", plate: plate("#2AA176", "#0F5E45"), bg: ["#eef8f3", "#8fd0b3", "#1E8C64"] },
  { name: "gold", main: "#7A5A12", vivid: "#C9962B", glow: "#EED9A4", pale: "#FBF4E2", plate: plate("#D4A440", "#8C6714"), bg: ["#fbf6ea", "#e3c27a", "#B8892A"] },
  { name: "forest", main: "#22433A", vivid: "#3E7A68", glow: "#B9D8CC", pale: "#EEF4F1", plate: plate("#4E8C78", "#22433A"), bg: ["#f1f5f3", "#a9c9bd", "#3E7A68"] },
];

const SPR = SPRING.snappy;
const GOLD = "#C9962B";

/** Words rise from under a mask; key words get a thin gold rule drawn under them */
const Title = makeTitle(
  SPR,
  2,
  (t) => ({ clipPath: "inset(-10% -4% -18% -4%)", transform: `translateY(${(1 - Math.min(t, 1)) * 0.9}em)`, opacity: t > 0 ? 1 : 0 }),
  (t, i, key, pal) =>
    key ? <span style={{ position: "absolute", left: 0, right: 0, bottom: "-0.08em", height: 5, borderRadius: 3, background: pal === AHU_PALETTES[1] ? pal.main : GOLD, transformOrigin: "0 50%", transform: `scaleX(${ease.out(Math.max(0, Math.min(1, (t - 0.6) / 0.4)))})` }} /> : null,
);

export const AHU: HostPreset = {
  id: "ahu",
  name: "Ahu",
  role: "эксперт",
  voice: { id: "xyqF3vGMQlPk3e7yA4DI", name: "Ahu - Cheerful, Encouraging and Inviting", stability: 0.5, similarity: 0.75, tags: ["[confident]", "[measured]", "[warm]", "[curious]"] },
  avatarDir: "hosts/ahu",
  fit: HOST_FIT.ahu,
  palettes: AHU_PALETTES,
  motion: {
    spring: SPR,
    stagger: 2,
    // slide up from under a mask, no blur
    enter: (frame, at) => {
      const t = springAt(frame, at, SPR);
      return { opacity: t > 0 ? 1 : 0, clipPath: `inset(${(1 - Math.min(t, 1)) * 100}% 0 0 0)`, transform: `translateY(${(1 - Math.min(t, 1)) * 40}px)` };
    },
    exit: (frame, at) => {
      const o = progress(frame, at, at + 6);
      return o <= 0 ? {} : { opacity: 1 - o, transform: `translateY(${-o * 40}px)` };
    },
    // a cut with a small punch-in (1.05 -> 1 in 10 frames), out in 4 frames
    scene: (frame, [a, b]) => {
      const p = a === 0 ? 1 : ease.outExpo(progress(frame, a, a + 10));
      const out = progress(frame, b, b + 4);
      return { opacity: (frame >= a ? 1 : 0) * (1 - out), transform: `scale(${1.05 - 0.05 * p})` };
    },
    scenePad: [0, 4],
  },
  Title,
  Bg: ({ pal }) => <CreamWash pal={pal} from={960} strength={0.62} />,
  cover: (pal) => tatarverseCover(pal),
  Showcase: ({ frame, pal }) => (
    <AbsoluteFill>
      <Title text="Ahu *эксперт*" frame={frame} at={10} pal={pal} top={700} size={120} />
      <div style={{ ...PARAGRAPH, position: "absolute", left: 0, right: 0, top: 900, textAlign: "center", fontSize: 44, ...AHU.motion.enter(frame, 40) }}>тезис факт вывод</div>
    </AbsoluteFill>
  ),
};
