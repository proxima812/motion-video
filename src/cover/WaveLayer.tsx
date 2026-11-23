import React from "react";
import { AbsoluteFill } from "remotion";
import { ShaderWarpCream } from "@/components/remocn/shader-warp-cream";

// The cover's wave-gradient layer alone (background="shader-warp-cream" in Cover.tsx), same placement and fade:
// white page, shader shifted down 260 px, 75% opacity, faded in from the top. colors = 3 stops light -> accent.
// Still "WaveLayer" in Root: render one PNG per palette with --props='{"colors":[...]}'.
export const WaveLayer: React.FC<{ colors?: string[] }> = ({ colors }) => (
  <AbsoluteFill style={{ background: "#FFFFFF" }}>
    <AbsoluteFill style={{ top: 260, opacity: 0.75, maskImage: "linear-gradient(transparent, #000 30%)", WebkitMaskImage: "linear-gradient(transparent, #000 30%)" }}>
      <ShaderWarpCream {...(colors ? { colors } : null)} />
    </AbsoluteFill>
  </AbsoluteFill>
);
