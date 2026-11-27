import React from "react";
import { AbsoluteFill } from "remotion";
import { SPRING, ease, progress, springAt } from "../../stage/motion";
import { PARAGRAPH } from "../design";
import { HOST_FIT } from "./fit";
import { CreamWash, makeTitle, plate, tatarverseCover } from "./shared";
import type { HostPreset, Palette } from "./types";

// Alicja - «подруга». White blouse with gold embroidery. Soft: things appear out of blur, words float up one by one,
// light parallax. Elements: chat bubbles, quote cards, polaroids. Decor: a gold embroidery line that draws itself,
// warm glow. Telling: a story / a case from life -> the feeling -> a soft conclusion.

export const ALICJA_PALETTES: readonly Palette[] = [
  { name: "honey", main: "#8A5A12", vivid: "#D49A2A", glow: "#F2D79B", pale: "#FCF5E6", plate: plate("#E0A93C", "#A86F14"), bg: ["#fdf7ec", "#f0cf8c", "#D49A2A"] },
  { name: "terracotta", main: "#9A4527", vivid: "#D2693F", glow: "#F3C2A6", pale: "#FCF1EA", plate: plate("#E07A50", "#A9502E"), bg: ["#fdf3ee", "#efb397", "#D2693F"] },
  { name: "caramel", main: "#7A4B2A", vivid: "#C07A45", glow: "#EBC9A8", pale: "#FAF2EA", plate: plate("#CC8A55", "#86532E"), bg: ["#fbf4ec", "#e2bb95", "#B8743F"] },
];

const SPR = SPRING.soft;

/** Words float up out of blur one by one; key words glow softly */
const Title = makeTitle(SPR, 5, (t, i, key, pal) => ({
  opacity: Math.min(1, t * 1.2),
  transform: `translateY(${(1 - t) * 26}px)`,
  filter: t < 0.98 ? `blur(${Math.max(0, (1 - t) * 12)}px)` : undefined,
  textShadow: key ? `0 0 ${28 * Math.min(1, t)}px ${pal.glow}` : undefined,
}));

export const ALICJA: HostPreset = {
  id: "alicja",
  name: "Alicja",
  role: "подруга",
  voice: { id: "iCzRDxXsrROcDYzWimM9", name: "Alicja - Warm & Understanding", stability: 0.5, similarity: 0.75, tags: ["[warm]", "[soft]", "[light laugh]", "[sincere]"] },
  avatarDir: "hosts/alicja",
  fit: HOST_FIT.alicja,
  palettes: ALICJA_PALETTES,
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
  },
  Title,
  Bg: ({ pal }) => <CreamWash pal={pal} from={900} strength={0.7} speed={0.45} />,
  cover: (pal) => tatarverseCover(pal),
  Showcase: ({ frame, pal }) => (
    <AbsoluteFill>
      <Title text="Alicja *подруга*" frame={frame} at={10} pal={pal} top={700} size={120} />
      <div style={{ ...PARAGRAPH, position: "absolute", left: 0, right: 0, top: 900, textAlign: "center", fontSize: 44, ...ALICJA.motion.enter(frame, 50) }}>история чувство вывод</div>
    </AbsoluteFill>
  ),
};
