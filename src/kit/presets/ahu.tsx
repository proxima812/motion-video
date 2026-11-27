import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { SPRING, ease, progress, springAt } from "../../stage/motion";
import { GridPattern, Sparkles, grad } from "../../cover/CoverLab";
import { PARAGRAPH } from "../design";
import { QUAD_FIT } from "../quadFit";
import { makeTitle, plate, rgba, tint } from "./shared";
import type { HostPreset, Palette } from "./types";

// Ahu - «эксперт». Black blazer, emerald kalfak with gold. Continues her covers timer / giant-number:
// white -> pale -> glow gradient, a grid, a ripple from the bottom, sparkles; huge gradient numbers, struck small values.
// Motion: clear and fast - words rise from under a mask, cuts on the beat with a small punch-in.
// Telling: thesis -> fact / number -> short conclusion.

export const AHU_PALETTES: readonly Palette[] = [
  { name: "emerald", main: "#0F5E45", vivid: "#1E8C64", glow: "#9FD9BF", pale: "#E8F5EF", plate: plate("#2AA176", "#0F5E45"), gray: "#DCE7E2", muted: "#6F837B" },
  { name: "gold", main: "#7A5A12", vivid: "#C9962B", glow: "#EED9A4", pale: "#FBF4E2", plate: plate("#D4A440", "#8C6714"), gray: "#ECE4D2", muted: "#8C7F64" },
  { name: "forest", main: "#22433A", vivid: "#3E7A68", glow: "#B9D8CC", pale: "#EEF4F1", plate: plate("#4E8C78", "#22433A"), gray: "#DDE6E2", muted: "#6E7F79" },
];

const SPR = SPRING.snappy;

/** Words rise from under a mask; key words 700 in a vivid -> main gradient with a thin rule drawn under them */
const Title = makeTitle(
  SPR,
  2,
  (t, i, key, pal) => ({
    clipPath: "inset(-10% -4% -22% -4%)",
    transform: `translateY(${(1 - Math.min(t, 1)) * 0.9}em)`,
    opacity: t > 0 ? 1 : 0,
    fontWeight: key ? 700 : 400,
    ...(key ? grad(`linear-gradient(180deg, ${pal.vivid}, ${pal.main})`) : null),
  }),
  (t, i, key, pal) =>
    key ? <span style={{ position: "absolute", left: 0, right: 0, bottom: "-0.06em", height: 5, borderRadius: 3, background: pal.vivid, transformOrigin: "0 50%", transform: `scaleX(${ease.out(Math.max(0, Math.min(1, (t - 0.6) / 0.4)))})` }} /> : null,
);

/** Timer-cover background: white -> pale -> glow, a grid around the content, ripple rings rising from the host, twinkling sparkles */
const Bg: React.FC<{ pal: Palette }> = ({ pal }) => {
  const frame = useCurrentFrame();
  const RING = 150; // a new ring every 150 frames, rings grow and fade
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, #FFFFFF 0%, ${pal.pale} 62%, ${tint(pal.glow, 0.7)} 100%)`, overflow: "hidden" }}>
      <GridPattern color={tint(pal.vivid, 0.14)} at="50% 30%" />
      {Array.from({ length: 6 }, (_, i) => {
        const age = ((frame + i * RING) % (RING * 6)) / (RING * 6);
        const r = 200 + age * 900;
        return <div key={i} style={{ position: "absolute", left: 540 - r, top: 1700 - r, width: r * 2, height: r * 2, borderRadius: "50%", border: `2px solid ${rgba(pal.vivid, 0.3)}`, opacity: Math.sin(age * Math.PI) }} />;
      })}
      {[[150, 640, 40, 0], [930, 560, 32, 40], [880, 980, 24, 80], [200, 1100, 28, 120]].map(([x, y, s, ph], i) => (
        <AbsoluteFill key={i} style={{ opacity: 0.35 + 0.35 * Math.sin((frame + ph) / 24) }}>
          <Sparkles color={pal.vivid} items={[[x, y, s]]} />
        </AbsoluteFill>
      ))}
    </AbsoluteFill>
  );
};

export const AHU: HostPreset = {
  id: "ahu",
  name: "Ahu",
  role: "эксперт",
  palettes: AHU_PALETTES,
  covers: ["giant-number", "timer"],
  tags: ["[confident]", "[measured]", "[warm]", "[curious]"],
  fit: QUAD_FIT.ahu,
  motion: {
    spring: SPR,
    stagger: 2,
    // slide up from under a mask, no blur
    enter: (frame, at) => {
      const t = Math.min(1, springAt(frame, at, SPR));
      return { opacity: t > 0 ? 1 : 0, clipPath: `inset(${(1 - t) * 100}% 0 -20% 0)`, transform: `translateY(${(1 - t) * 40}px)` };
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
    drift: 0,
  },
  Title,
  Bg,
  Showcase: ({ frame, pal }) => (
    <AbsoluteFill>
      <Title text="Ahu *эксперт*" frame={frame} at={10} pal={pal} top={700} size={120} />
      <div style={{ ...PARAGRAPH, position: "absolute", left: 0, right: 0, top: 900, textAlign: "center", fontSize: 44, ...AHU.motion.enter(frame, 40) }}>тезис факт вывод</div>
    </AbsoluteFill>
  ),
};
