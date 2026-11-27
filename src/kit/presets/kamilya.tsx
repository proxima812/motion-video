import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ease, progress } from "../../stage/motion";
import { SERIF } from "../../cover/CoverLab";
import { PARAGRAPH } from "../design";
import { QUAD_FIT } from "../quadFit";
import { makeTitle, plate, rgba } from "./shared";
import type { HostPreset, Palette } from "./types";

// Kamilya - «хранительница». Burgundy velvet with embroidered tulips. Continues her covers form-stamp / map:
// ruled paper, documents and forms with handwritten answers, round stamps, drawn maps with a dashed route.
// Motion: slow and cinematic - dissolves, slow push-ins, words settle from wide letter spacing, pauses.
// Telling: «раньше -> сейчас», the meaning of a tradition, a moral at the end. Measured pace.

export const KAMILYA_PALETTES: readonly Palette[] = [
  { name: "garnet", main: "#6E1630", vivid: "#A3264B", glow: "#E7A9BA", pale: "#F9ECEF", plate: plate("#B8355C", "#6E1630"), gray: "#EADDE0", muted: "#8A7378" },
  { name: "rose", main: "#8A3A50", vivid: "#C46A84", glow: "#F0C4D0", pale: "#FBF0F3", plate: plate("#D27C95", "#8A3A50"), gray: "#EEE0E4", muted: "#8F7A80" },
  { name: "olive", main: "#4E5A24", vivid: "#7D8B3A", glow: "#D3DBA8", pale: "#F4F6E8", plate: plate("#8E9C47", "#4E5A24"), gray: "#E3E6D6", muted: "#7C8068" },
];

const SLOW = { stiffness: 45, damping: 18 };

/** Words fade in slowly while their letter spacing settles from wide to tight; key words in the Prata serif */
const Title = makeTitle(SLOW, 8, (t, i, key, pal) => {
  const k = Math.min(1, Math.max(0, t));
  return {
    opacity: ease.inOut(k),
    letterSpacing: `${0.18 * (1 - k) - (key ? 0.01 : 0.03)}em`,
    filter: k < 0.98 ? `blur(${(1 - k) * 6}px)` : undefined,
    ...(key ? { fontFamily: SERIF, fontWeight: 400, color: pal.main } : null),
  };
});

/** Form-cover background: warm paper with ruled lines and a soft vignette; the paper breathes very slowly */
const Bg: React.FC<{ pal: Palette }> = ({ pal }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, #FFFDF8 0%, ${pal.pale} 100%)` }}>
      <AbsoluteFill style={{ backgroundImage: `linear-gradient(${rgba(pal.main, 0.09)} 2px, transparent 2px)`, backgroundSize: "100% 56px", backgroundPosition: `0 ${(frame * 0.15) % 56}px` }} />
      <AbsoluteFill style={{ left: 96, width: 3, background: rgba(pal.vivid, 0.22) }} />
      <AbsoluteFill style={{ background: `radial-gradient(120% 80% at 50% 40%, transparent 55%, ${rgba(pal.main, 0.12)} 100%)` }} />
    </AbsoluteFill>
  );
};

export const KAMILYA: HostPreset = {
  id: "kamilya",
  name: "Камиля",
  role: "хранительница",
  palettes: KAMILYA_PALETTES,
  covers: ["form-stamp", "map"],
  tags: ["[measured]", "[warm]", "[serious]", "[quietly]"],
  fit: QUAD_FIT.kamilya,
  motion: {
    spring: SLOW,
    stagger: 8,
    // slow fade with a settle from 1.04
    enter: (frame, at) => {
      const t = ease.inOut(progress(frame, at, at + 26));
      return { opacity: t, transform: `scale(${1.04 - 0.04 * t})`, filter: t < 1 ? `blur(${(1 - t) * 6}px)` : undefined };
    },
    exit: (frame, at) => {
      const o = ease.inOut(progress(frame, at, at + 20));
      return o <= 0 ? {} : { opacity: 1 - o };
    },
    // 24-frame dissolve
    scene: (frame, [a, b]) => {
      const t = a === 0 ? 1 : ease.inOut(progress(frame, a - 12, a + 12));
      const out = ease.inOut(progress(frame, b - 12, b + 12));
      return { opacity: t * (1 - out) };
    },
    scenePad: [12, 12],
    drift: 0.045,
  },
  Title,
  Bg,
  Showcase: ({ frame, pal }) => (
    <AbsoluteFill>
      <Title text="Камиля *хранительница*" frame={frame} at={10} pal={pal} top={700} size={100} />
      <div style={{ ...PARAGRAPH, position: "absolute", left: 0, right: 0, top: 900, textAlign: "center", fontSize: 44, ...KAMILYA.motion.enter(frame, 60) }}>раньше сейчас мораль</div>
    </AbsoluteFill>
  ),
};
