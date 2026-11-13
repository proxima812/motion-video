import React from "react";
import { TactileButton } from "tactile-glass-ui";
import { PARAGRAPH } from "../../kit/design";

// Colored TactileButton: the glass hull stays transparent (library rule), the color is a plate under it that the glass refracts.
// Priority component for reels: at most 3 per video, each with a different meaning (CTA / status / badge / icon action).

export const GLASS_PLATE = { refraction: 30, thickness: 40, bevelWidth: 6, frost: 20, dispersion: 60, sheen: 40, lightAngle: -46, darkness: 0, rim: 90, fluidBrightness: 44, fluidSpeed: 40, fluidScale: 30, fluidAuraWidth: 14, fluidCenter: 20, auroraFlow: 60 };

export const PLATE = {
  violet: "linear-gradient(135deg, #8B5CF6, #6E33CC)",
  emerald: "linear-gradient(135deg, #34D399, #0B5C45)",
  sunset: "linear-gradient(135deg, #FB923C, #EC4899)",
  ocean: "linear-gradient(135deg, #38BDF8, #1D4ED8)",
  smoke: "linear-gradient(135deg, #3A3A44, #111114)",
};

const label: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 10, color: "#fff", fontFamily: PARAGRAPH.fontFamily, fontVariantNumeric: PARAGRAPH.fontVariantNumeric, fontWeight: 600, fontSize: 17, letterSpacing: "-0.01em" };

/** White text (+ optional lucide icon) on a colored glass pill; scale it up with a wrapper transform (native height 56 px). */
export const GlassPlate: React.FC<{ bg: string; children: React.ReactNode; circle?: boolean; glass?: Record<string, number> }> = ({ bg, children, circle, glass }) => (
  <div style={{ display: "inline-flex", borderRadius: 9999, background: bg, boxShadow: "0 18px 40px -18px rgba(40,20,80,0.45)" }}>
    <TactileButton {...GLASS_PLATE} {...glass} shape={circle ? "circle" : "pill"}>
      <span style={label}>{children}</span>
    </TactileButton>
  </div>
);
