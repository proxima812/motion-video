import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { SPRING, ease, progress, springAt } from "../../stage/motion";
import { DotPattern, HAND, Sparkles } from "../../cover/CoverLab";
import { PARAGRAPH } from "../design";
import { QUAD_FIT } from "../quadFit";
import { makeTitle, plate, tint } from "./shared";
import type { HostPreset, Palette } from "./types";

// Alicja - «подруга». White blouse with gold embroidery. Continues her bubble cover: pale background with soft
// radial glows and a dot pattern, a handwritten kicker, giant speech bubbles pointing at her, hearts / sparkles.
// Motion: soft - things come out of blur, words float up one by one, blurred crossfades.
// Telling: a story / a case from life -> the feeling -> a soft conclusion.

export const ALICJA_PALETTES: readonly Palette[] = [
  { name: "honey", main: "#8A5A12", vivid: "#D49A2A", glow: "#F2D79B", pale: "#FCF5E6", plate: plate("#E0A93C", "#A86F14"), gray: "#EFE6D6", muted: "#8F8270" },
  { name: "terracotta", main: "#9A4527", vivid: "#D2693F", glow: "#F3C2A6", pale: "#FCF1EA", plate: plate("#E07A50", "#A9502E"), gray: "#EFE2DA", muted: "#8E7A70" },
  { name: "caramel", main: "#7A4B2A", vivid: "#C07A45", glow: "#EBC9A8", pale: "#FAF2EA", plate: plate("#CC8A55", "#86532E"), gray: "#ECE2D8", muted: "#887868" },
];

const SPR = SPRING.soft;

/** Words float up out of blur one by one; key words are handwritten (Caveat), bigger, slightly tilted */
const Title = makeTitle(SPR, 5, (t, i, key, pal) => ({
  opacity: Math.min(1, t * 1.2),
  transform: `translateY(${(1 - t) * 26}px)${key ? " rotate(-3deg)" : ""}`,
  filter: t < 0.98 ? `blur(${Math.max(0, (1 - t) * 12)}px)` : undefined,
  ...(key ? { fontFamily: HAND, fontWeight: 700, fontSize: "1.32em", lineHeight: 0.8, letterSpacing: 0, color: pal.main } : null),
}));

/** Bubble-cover background: pale + two soft glows that breathe, a dot pattern, a few drifting sparkles */
const Bg: React.FC<{ pal: Palette }> = ({ pal }) => {
  const frame = useCurrentFrame();
  const b = Math.sin(frame / 90);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(70% 50% at ${20 + b * 4}% ${20 + b * 3}%, ${pal.glow}AA 0%, transparent 70%), radial-gradient(60% 45% at ${90 - b * 4}% 60%, ${pal.glow} 0%, transparent 70%), ${pal.pale}` }}>
      <DotPattern color={tint(pal.main, 0.16)} size={34} />
      {[[140, 900, 34, 0], [930, 1010, 46, 50], [880, 600, 28, 100]].map(([x, y, s, ph], i) => (
        <AbsoluteFill key={i} style={{ transform: `translateY(${Math.sin((frame + ph) / 60) * 14}px)`, opacity: 0.45 + 0.25 * Math.sin((frame + ph) / 40) }}>
          <Sparkles color={pal.vivid} items={[[x, y, s]]} />
        </AbsoluteFill>
      ))}
    </AbsoluteFill>
  );
};

export const ALICJA: HostPreset = {
  id: "alicja",
  name: "Alicja",
  role: "подруга",
  palettes: ALICJA_PALETTES,
  covers: ["bubble"],
  tags: ["[warm]", "[soft]", "[light laugh]", "[sincere]"],
  fit: QUAD_FIT.alicja,
  motion: {
    spring: SPR,
    stagger: 5,
    enter: (frame, at) => {
      const t = springAt(frame, at, SPR);
      return { opacity: Math.min(1, t * 1.3), transform: `translateY(${(1 - t) * 30}px) scale(${0.97 + 0.03 * t})`, filter: t < 0.98 ? `blur(${Math.max(0, (1 - t) * 14)}px)` : undefined };
    },
    exit: (frame, at) => {
      const o = ease.inOut(progress(frame, at, at + 14));
      return o <= 0 ? {} : { opacity: 1 - o, filter: `blur(${o * 14}px)`, transform: `translateY(${-o * 16}px)` };
    },
    // blurred crossfade, scenes overlap by ~16 frames
    scene: (frame, [a, b]) => {
      const t = a === 0 ? 1 : ease.inOut(progress(frame, a - 4, a + 14));
      const out = ease.inOut(progress(frame, b - 2, b + 14));
      return { opacity: t * (1 - out), filter: t < 1 || out > 0 ? `blur(${(1 - t) * 16 + out * 16}px)` : undefined, transform: `translateY(${(1 - t) * 24 - out * 18}px)` };
    },
    scenePad: [4, 14],
    drift: 0.02,
  },
  Title,
  Bg,
  Showcase: ({ frame, pal }) => (
    <AbsoluteFill>
      <Title text="Alicja *подруга*" frame={frame} at={10} pal={pal} top={700} size={120} />
      <div style={{ ...PARAGRAPH, position: "absolute", left: 0, right: 0, top: 900, textAlign: "center", fontSize: 44, ...ALICJA.motion.enter(frame, 50) }}>история чувство вывод</div>
    </AbsoluteFill>
  ),
};
