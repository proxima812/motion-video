import React from "react";
import { AbsoluteFill } from "remotion";
import { GlassPlate, PLATE } from "../catalog/own/glass";
import { PARAGRAPH } from "../kit/design";

// Cover badges (the description plate of tatarverse covers), one per Still frame on a transparent canvas -> PNG.
// "plate-*": our GlassPlate (tactile glass over a colored plate) with different glass params and colors.
// "glass-*": frosted glass pill (backdrop blur + tint + light rim) - meant to sit over the wave background.
// Sizes match Cover.tsx: font 30, the plate scaled 1.7. Render all: bun scripts/badges.mjs.

type PlateVariant = { kind: "plate"; bg: string; glass?: Record<string, number> };
type GlassVariant = { kind: "glass"; style: React.CSSProperties; color: string };
export const BADGES: Record<string, PlateVariant | GlassVariant> = {
  // the current cover plate: violet, default glass
  "plate-1-violet": { kind: "plate", bg: PLATE.violet },
  // strong rainbow edge, more refraction
  "plate-2-sunset-prism": { kind: "plate", bg: PLATE.sunset, glass: { dispersion: 100, refraction: 45, rim: 100, sheen: 60 } },
  // thick calm glass, almost no rainbow, heavy frost
  "plate-3-emerald-frost": { kind: "plate", bg: PLATE.emerald, glass: { frost: 55, dispersion: 15, thickness: 70, sheen: 25, refraction: 20 } },
  // bright moving aurora inside, light from the right
  "plate-4-ocean-aurora": { kind: "plate", bg: PLATE.ocean, glass: { fluidBrightness: 80, auroraFlow: 100, fluidAuraWidth: 28, lightAngle: 40, sheen: 70 } },
  // dark glossy smoke with a hard rim
  "plate-5-smoke-gloss": { kind: "plate", bg: PLATE.smoke, glass: { sheen: 90, rim: 100, bevelWidth: 10, dispersion: 40, frost: 10 } },

  // clear white glass, dark text (GLASS_PILL family)
  "glass-1-clear": {
    kind: "glass",
    color: "#251B3A",
    style: { background: "rgba(255,255,255,0.38)", backdropFilter: "blur(18px) saturate(1.6)", border: "1.5px solid rgba(255,255,255,0.75)", boxShadow: "0 18px 40px -18px rgba(40,20,80,0.35), inset 0 1px 0 rgba(255,255,255,0.9)" },
  },
  // violet tinted glass, white text
  "glass-2-violet-tint": {
    kind: "glass",
    color: "#FFFFFF",
    style: { background: "linear-gradient(135deg, rgba(139,92,246,0.82), rgba(110,51,204,0.7))", backdropFilter: "blur(20px) saturate(1.8)", border: "1.5px solid rgba(255,255,255,0.45)", boxShadow: "0 18px 40px -16px rgba(110,51,204,0.55), inset 0 1px 0 rgba(255,255,255,0.55), inset 0 -8px 16px -8px rgba(60,20,120,0.35)" },
  },
  // thick milky frost with a gradient rim
  "glass-3-milk": {
    kind: "glass",
    color: "#3B2A66",
    style: { background: "linear-gradient(180deg, rgba(255,255,255,0.78), rgba(255,255,255,0.5))", backdropFilter: "blur(30px) saturate(1.3)", border: "2px solid transparent", backgroundClip: "padding-box", boxShadow: "0 0 0 2px rgba(180,140,242,0.55), 0 22px 44px -18px rgba(40,20,80,0.4), inset 0 2px 0 #fff" },
  },
  // dark smoked glass, white text
  "glass-4-smoke": {
    kind: "glass",
    color: "#FFFFFF",
    style: { background: "rgba(20,18,30,0.42)", backdropFilter: "blur(22px) saturate(1.4)", border: "1.5px solid rgba(255,255,255,0.22)", boxShadow: "0 20px 40px -16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.3)" },
  },
  // warm glass with an inner glow (sunset tint)
  "glass-5-sunset-glow": {
    kind: "glass",
    color: "#FFFFFF",
    style: { background: "linear-gradient(120deg, rgba(251,146,60,0.85), rgba(236,72,153,0.8))", backdropFilter: "blur(20px) saturate(1.7)", border: "1.5px solid rgba(255,255,255,0.5)", boxShadow: "0 18px 40px -18px rgba(236,72,153,0.4), inset 0 1px 0 rgba(255,255,255,0.7), inset 0 0 24px rgba(255,220,180,0.45)" },
  },
};

export const Badge: React.FC<{ variant: string; text: string }> = ({ variant, text }) => {
  const v = BADGES[variant] ?? BADGES["plate-1-violet"];
  const font: React.CSSProperties = { fontFamily: PARAGRAPH.fontFamily, fontWeight: 500, fontSize: 30, letterSpacing: "-0.01em", whiteSpace: "nowrap" };
  return (
    <AbsoluteFill style={{ background: "transparent", alignItems: "center", justifyContent: "center" }}>
      <div style={{ transform: "scale(1.7)" }}>
        {v.kind === "plate" ? (
          <GlassPlate bg={v.bg} glass={v.glass}>
            <span style={font}>{text}</span>
          </GlassPlate>
        ) : (
          <div style={{ ...v.style, WebkitBackdropFilter: v.style.backdropFilter, borderRadius: 9999, padding: "14px 30px", color: v.color, ...font }}>{text}</div>
        )}
      </div>
    </AbsoluteFill>
  );
};
