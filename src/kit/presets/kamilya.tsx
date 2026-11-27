import React from "react";
import { AbsoluteFill } from "remotion";
import { ease, progress } from "../../stage/motion";
import { PARAGRAPH } from "../design";
import { HOST_FIT } from "./fit";
import { CreamWash, makeTitle, plate, tatarverseCover } from "./shared";
import type { HostPreset, Palette } from "./types";

// Kamilya - «хранительница». Burgundy velvet with embroidered tulips. Slow and cinematic: slow camera push-ins,
// dissolves between scenes, pauses. Elements: timeline, «было / стало», archive photos in a frame, a big quote.
// Decor: tulip ornament, light velvet grain, vignette. Telling: «раньше -> сейчас», the meaning of a tradition,
// a moral at the end. Measured pace.

export const KAMILYA_PALETTES: readonly Palette[] = [
  { name: "garnet", main: "#6E1630", vivid: "#A3264B", glow: "#E7A9BA", pale: "#F9ECEF", plate: plate("#B8355C", "#6E1630"), bg: ["#faeef1", "#d98aa0", "#8E1D3E"] },
  { name: "rose", main: "#8A3A50", vivid: "#C46A84", glow: "#F0C4D0", pale: "#FBF0F3", plate: plate("#D27C95", "#8A3A50"), bg: ["#fcf2f5", "#e9a9bb", "#C46A84"] },
  { name: "olive", main: "#4E5A24", vivid: "#7D8B3A", glow: "#D3DBA8", pale: "#F4F6E8", plate: plate("#8E9C47", "#4E5A24"), bg: ["#f6f7ec", "#c4cf8e", "#7D8B3A"] },
];

const SLOW = { stiffness: 45, damping: 18 };

/** Words fade in slowly while their letter spacing settles from wide to tight */
const Title = makeTitle(SLOW, 8, (t) => {
  const k = Math.min(1, Math.max(0, t));
  return { opacity: ease.inOut(k), letterSpacing: `${0.18 * (1 - k) - 0.03}em`, filter: k < 0.98 ? `blur(${(1 - k) * 6}px)` : undefined };
});

export const KAMILYA: HostPreset = {
  id: "kamilya",
  name: "Камиля",
  role: "хранительница",
  voice: { id: "Phc1KhVrCoW3CD0K7bUS", name: "Victoria - Premium Warm Female Voice", stability: 0.5, similarity: 0.75, tags: ["[measured]", "[warm]", "[serious]", "[quietly]"] },
  avatarDir: "hosts/kamilya",
  fit: HOST_FIT.kamilya,
  palettes: KAMILYA_PALETTES,
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
    // 24-frame dissolve + a slow push-in over the whole scene
    scene: (frame, [a, b]) => {
      const t = a === 0 ? 1 : ease.inOut(progress(frame, a - 12, a + 12));
      const out = ease.inOut(progress(frame, b - 12, b + 12));
      const push = 1 + 0.03 * progress(frame, a, b);
      return { opacity: t * (1 - out), transform: `scale(${push})` };
    },
    scenePad: [12, 12],
  },
  Title,
  Bg: ({ pal }) => <CreamWash pal={pal} from={880} strength={0.66} speed={0.3} />,
  cover: (pal) => tatarverseCover(pal),
  Showcase: ({ frame, pal }) => (
    <AbsoluteFill>
      <Title text="Камиля *хранительница*" frame={frame} at={10} pal={pal} top={700} size={104} />
      <div style={{ ...PARAGRAPH, position: "absolute", left: 0, right: 0, top: 900, textAlign: "center", fontSize: 44, ...KAMILYA.motion.enter(frame, 60) }}>раньше сейчас мораль</div>
    </AbsoluteFill>
  ),
};
