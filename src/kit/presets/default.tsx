import React from "react";
import { AbsoluteFill } from "remotion";
import { SPRING, progress, springAt } from "../../stage/motion";
import { DotOrbitBg } from "../DotOrbitBg";
import { PARAGRAPH } from "../design";
import { leave, pop, sceneStyle } from "../reel";
import { makeTitle, plate } from "./shared";
import type { HostPreset, Palette } from "./types";

// Default preset = the shared kit exactly as before host presets: Dot Orbit background, soft blur-rise motion,
// violet accent. For @const_proxima and any reel without a host preset. Old reels don't import presets at all.

const VIOLET: Palette = { name: "violet", main: "#6E33CC", vivid: "#8B5CF6", glow: "#C9B5F5", pale: "#F3EEFD", plate: plate("#8B5CF6", "#6E33CC"), bg: ["#f4eeff", "#b48cf2", "#6E33CC"] };

const Title = makeTitle(SPRING.smooth, 3, (t) => ({ opacity: Math.min(1, t * 1.3), transform: `translateY(${(1 - t) * 30}px)`, filter: `blur(${Math.max(0, (1 - t) * 8)}px)` }));

export const DEFAULT_PRESET: HostPreset = {
  id: "default",
  name: "Основной",
  role: "основной",
  voice: null,
  avatarDir: null,
  fit: {},
  palettes: [VIOLET],
  motion: {
    spring: SPRING.smooth,
    stagger: 3,
    enter: (frame, at) => pop(frame, at, SPRING.smooth).style,
    exit: leave,
    scene: sceneStyle,
    scenePad: [2, 6],
  },
  Title,
  Bg: () => <DotOrbitBg variant={1} />,
  cover: () => ({}),
  Showcase: ({ frame, pal }) => (
    <AbsoluteFill>
      <Title text="Основной *пресет*" frame={frame} at={10} pal={pal} top={760} size={110} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 960, textAlign: "center", ...PARAGRAPH, fontSize: 44, opacity: progress(frame, 40, 60) * springAt(frame, 40, SPRING.smooth) }}>как раньше</div>
    </AbsoluteFill>
  ),
};
