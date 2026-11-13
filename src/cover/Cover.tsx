import React from "react";
import { AbsoluteFill, Img, staticFile, useVideoConfig } from "remotion";
import { fontFamily } from "../ui/theme";
import { FONT_PAIRS, type FontPair } from "../ui/coverFonts";
import { GlassPlate } from "../catalog/own/glass";
import { ShaderWarpCream } from "@/components/remocn/shader-warp-cream";

// variant 1 - accent words in solid orange
// variant 2 - gradient title (orange -> pink)
// variant 3 - orange pill badge above the title
// variant 4 - warm gradient glow behind the text
// variant 5 - marker highlight under accent words
// accent2/accent3 - gradient stops (variants 2, 4); logos - staticFile paths shown in a row under the description
// background "shader-warp-cream" - Remocn ShaderWarpCream behind everything instead of white
export type CoverProps = { background?: "white" | "shader-warp-cream"; title: string; description: string; badge?: string; variant?: 1 | 2 | 3 | 4 | 5; accent?: string; accent2?: string; accent3?: string; logos?: string[]; avatar?: string; accentFont?: "inter" | "caveat"; fontPair?: FontPair; avatarHeight?: number; titleWeight?: number; handTilt?: number; descPlate?: string };
// titleWeight - title font weight (default 800); handTilt - handwritten accent rotation in deg (default -3)
// descPlate - CSS background: description becomes white weight-500 text on a GlassPlate of this color

const GRAD = (a: string, b: string, c: string) => `linear-gradient(100deg, ${a} 0%, ${b} 55%, ${c} 100%)`;

// "*word*" -> accent span
const rich = (text: string, accent: (s: string, i: number) => React.ReactNode) =>
  text.split(/(\*[^*]+\*)/).map((p, i) => (p.startsWith("*") ? accent(p.slice(1, -1), i) : <React.Fragment key={i}>{p}</React.Fragment>));

// Instagram cover: white background, short title + short description, avatar at the bottom.
export const Cover: React.FC<CoverProps> = ({ background = "white", title, description, badge, variant = 1, accent = "#FF6A13", accent2 = "#FF3D6E", accent3 = "#B44DFF", logos = [], avatar = "avatar.png", accentFont = "inter", fontPair, avatarHeight, titleWeight = 800, handTilt = -3, descPlate }) => {
  // fontPair: accent words in a handwritten font, bigger and slightly tilted, the rest in the pair's body font.
  // accentFont "caveat" = legacy alias of fontPair "caveat-inter".
  // 16:9 still (CoverWide): text block on the left, avatar bottom right
  const { width, height } = useVideoConfig();
  const wide = width > height;
  const pair = fontPair ? FONT_PAIRS[fontPair] : accentFont === "caveat" ? FONT_PAIRS["caveat-inter"] : null;
  const hand: React.CSSProperties = pair ? { fontFamily: pair.accent, fontWeight: pair.accentWeight, fontSize: "1.2em", letterSpacing: "0", display: "inline-block", transform: `rotate(${handTilt}deg)`, lineHeight: 0.9 } : {};
  const bodyFont = pair ? pair.body : fontFamily;
  const gradText: React.CSSProperties = { backgroundImage: GRAD(accent, accent2, accent3), WebkitBackgroundClip: "text", color: "transparent" };
  const titleAccent = (s: string, i: number) =>
    variant === 2 || variant === 4 ? (
      <span key={i} style={gradText}>{s}</span>
    ) : variant === 5 ? (
      <span key={i} style={{ backgroundImage: `linear-gradient(transparent 58%, ${accent}66 58%, ${accent}66 92%, transparent 92%)`, padding: "0 6px" }}>{s}</span>
    ) : (
      <span key={i} style={{ color: accent, ...hand }}>{s}</span>
    );
  const descAccent = (s: string, i: number) => (
    <span key={i} style={{ color: variant === 5 ? "#0A0A0C" : accent, fontWeight: 700 }}>{s}</span>
  );

  return (
    <AbsoluteFill style={{ background: "#FFFFFF", fontFamily: bodyFont, WebkitFontSmoothing: "antialiased" }}>
      {background === "shader-warp-cream" && <ShaderWarpCream />}
      {variant === 4 && (
        <AbsoluteFill
          style={{
            background: `radial-gradient(60% 34% at 50% 30%, ${accent}38 0%, ${accent2}1A 45%, transparent 100%), radial-gradient(40% 22% at 80% 18%, ${accent3}1F 0%, transparent 100%)`,
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          ...(wide ? { top: 0, bottom: 0, left: 120, width: 1080, justifyContent: "center" } : { top: 420, left: 80, right: 80 }),
          display: "flex",
          flexDirection: "column",
          alignItems: wide ? "flex-start" : "center",
          gap: 40,
          textAlign: wide ? "left" : "center",
        }}
      >
        {variant === 3 && badge && (
          <div style={{ padding: "12px 28px", borderRadius: 999, border: `2px solid ${accent}55`, color: accent, fontSize: 30, fontWeight: 600, letterSpacing: "0.14em" }}>{badge}</div>
        )}
        <div style={{ fontSize: 124, fontWeight: titleWeight, lineHeight: 1.02, letterSpacing: "-0.045em", color: "#0A0A0C" }}>{rich(title, titleAccent)}</div>
        {descPlate ? (
          <div style={{ transform: "scale(2.4)", transformOrigin: wide ? "left center" : "center", margin: "36px 0" }}>
            <GlassPlate bg={descPlate}>
              <span style={{ fontFamily: bodyFont, fontWeight: 500, fontSize: 19 }}>{description.replace(/\*/g, "")}</span>
            </GlassPlate>
          </div>
        ) : (
          <div style={{ fontSize: 52, fontWeight: 500, lineHeight: 1.25, letterSpacing: "-0.01em", color: "#5E626B" }}>{rich(description, descAccent)}</div>
        )}
        {logos.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 28 }}>
            {logos.map((l) => (
              <div key={l} style={{ height: 104, padding: "0 30px", borderRadius: 28, background: "#fff", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 20px 40px -24px rgba(0,0,0,0.25)", display: "grid", placeItems: "center" }}>
                <Img src={staticFile(l)} style={{ height: 52, maxWidth: 240, objectFit: "contain" }} />
              </div>
            ))}
          </div>
        )}
      </div>
      <Img
        src={staticFile(avatar)}
        // avatarHeight: fixed height (width follows the photo), so tatarverse covers match video 13 whatever the photo
        style={{ position: "absolute", bottom: 0, ...(wide ? { right: 20 } : { left: "50%", transform: "translateX(-50%)" }), ...(avatarHeight ? { height: avatarHeight, width: "auto" } : { width: 1000 }) }}
      />
    </AbsoluteFill>
  );
};
