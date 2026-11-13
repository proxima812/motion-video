import React, { useCallback, useState } from "react";
import { DotOrbit } from "@paper-design/shaders-react";
import { continueRender, delayRender, useCurrentFrame, useVideoConfig } from "remotion";

// Default light background for every reel: paper.design Dot Orbit
// (shaders.paper.design/dot-orbit#colors=faf5fa,ffffff57&colorBack=ffffff&stepsPerColor=3&size=1&sizeRange=0.72&spreading=1&speed=2.1&scale=0.72),
// driven by the Remotion frame so renders are deterministic.
// 6 variants: each differs a little (dot tint, density, dot size, spread) - noticeable side by side, never loud.
// Rotate them between reels (see the background rule in .claude/skills/new-v/SKILL.md).
type OrbitLook = { color: string; scale: number; size: number; sizeRange: number; spreading: number; stepsPerColor: number; speed: number };
export const DOT_ORBIT_VARIANTS: Record<1 | 2 | 3 | 4 | 5 | 6, OrbitLook & { name: string }> = {
  1: { name: "base", color: "#faf5fa", scale: 0.72, size: 1, sizeRange: 0.72, spreading: 1, stepsPerColor: 3, speed: 2.1 },
  2: { name: "lavender", color: "#f4effd", scale: 0.64, size: 0.95, sizeRange: 0.62, spreading: 1, stepsPerColor: 3, speed: 1.9 },
  3: { name: "mint", color: "#f1f8f4", scale: 0.84, size: 0.9, sizeRange: 0.72, spreading: 0.9, stepsPerColor: 3, speed: 2.1 },
  4: { name: "sky", color: "#f0f4fc", scale: 0.72, size: 1.05, sizeRange: 0.86, spreading: 0.8, stepsPerColor: 3, speed: 2.3 },
  5: { name: "peach", color: "#fcf3ef", scale: 0.66, size: 1, sizeRange: 0.7, spreading: 1, stepsPerColor: 2, speed: 1.7 },
  6: { name: "pearl", color: "#f4f3f6", scale: 0.8, size: 1.15, sizeRange: 0.66, spreading: 1, stepsPerColor: 3, speed: 2.1 },
};
export type DotOrbitVariant = keyof typeof DOT_ORBIT_VARIANTS;

export const DotOrbitBg: React.FC<{ variant?: DotOrbitVariant; speed?: number }> = ({ variant = 1, speed }) => {
  const v = DOT_ORBIT_VARIANTS[variant];
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const [handle] = useState(() => delayRender("dot-orbit"));
  const gate = useCallback(
    (el: HTMLDivElement | null) => {
      if (el) requestAnimationFrame(() => requestAnimationFrame(() => continueRender(handle)));
    },
    [handle],
  );
  return (
    <div ref={gate} style={{ position: "absolute", inset: 0 }}>
      <DotOrbit
        speed={0}
        frame={(frame / fps) * (speed ?? v.speed) * 1000}
        colors={[v.color, "#ffffff57"]}
        colorBack="#ffffff"
        stepsPerColor={v.stepsPerColor}
        size={v.size}
        sizeRange={v.sizeRange}
        spreading={v.spreading}
        scale={v.scale}
        fit="cover"
        width={width}
        height={height}
      />
    </div>
  );
};
