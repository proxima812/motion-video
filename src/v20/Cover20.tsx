import React from "react";
import { AbsoluteFill } from "remotion";
import { C, Canvas, MONO, hash, rng, textGlow } from "./kit";
import { Expansion } from "./shots-finale";
import { InfiniteFormulas } from "./shots-math";

// Cover for video 20 in the reel's own look, no avatar: black, neon net exploding from behind the centred title,
// formula walls top and bottom, glitched mono title (like the ERROR shot), terminal-line description, grain + scanlines.

const GlitchWord: React.FC<{ text: string; size: number; top: number; spacing?: string; seed: number; amount: number; glowColor: string }> = ({ text, size, top, spacing = "0", seed, amount, glowColor }) => {
  const r = rng(seed);
  const bands = 6;
  const base: React.CSSProperties = { position: "absolute", left: 0, right: 0, top, textAlign: "center", fontFamily: MONO, fontWeight: 700, fontSize: size, lineHeight: 1, letterSpacing: spacing, whiteSpace: "nowrap" };
  return (
    <>
      <div style={{ ...base, color: "#00E1FF", opacity: 0.55, transform: `translateX(${-amount * 0.6}px)` }}>{text}</div>
      <div style={{ ...base, color: C.violet, opacity: 0.6, transform: `translateX(${amount * 0.6}px)` }}>{text}</div>
      {Array.from({ length: bands }, (_, i) => {
        const a = (i / bands) * 100;
        const dx = r() < 0.5 ? 0 : (r() - 0.5) * amount * 3;
        return (
          <div key={i} style={{ ...base, color: C.white, textShadow: textGlow(glowColor, 22), clipPath: `inset(${a}% 0 ${100 - a - 100 / bands}% 0)`, transform: `translateX(${dx.toFixed(1)}px)` }}>
            {text}
          </div>
        );
      })}
    </>
  );
};

export const Cover20: React.FC = () => (
  <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
    {/* neural net bursting out from behind the title */}
    <AbsoluteFill style={{ transform: "scale(1.12)", opacity: 0.95 }}>
      <Expansion f={9} d={52} />
    </AbsoluteFill>
    {/* formula walls framing the frame top and bottom */}
    <AbsoluteFill style={{ opacity: 0.17, filter: "blur(1.5px)", maskImage: "linear-gradient(#000 0%, #000 14%, transparent 34%, transparent 66%, #000 86%, #000 100%)", WebkitMaskImage: "linear-gradient(#000 0%, #000 14%, transparent 34%, transparent 66%, #000 86%, #000 100%)" }}>
      <InfiniteFormulas f={0} d={10} />
    </AbsoluteFill>
    {/* dark pool behind the type */}
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 64% 21% at 50% 50%, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.6) 55%, transparent 100%)" }} />

    <GlitchWord text="AI" size={330} top={655} seed={20} amount={16} glowColor={C.blue} />
    <GlitchWord text="OVERLOAD" size={128} top={995} spacing="0.04em" seed={21} amount={12} glowColor={C.violet} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 1175, display: "flex", justifyContent: "center", alignItems: "center", fontFamily: MONO, fontSize: 38, color: C.ink, whiteSpace: "pre", textShadow: textGlow(C.blue, 10) }}>
      <span style={{ color: C.cyan, fontWeight: 700 }}>{"> "}</span>
      inside a neural network at full load
      <span style={{ display: "inline-block", width: 20, height: 40, marginLeft: 6, background: C.white, boxShadow: `0 0 16px ${C.blue}` }} />
    </div>

    {/* film grain, scanlines, vignette */}
    <Canvas
      w={270}
      h={480}
      style={{ opacity: 0.18, mixBlendMode: "overlay", imageRendering: "pixelated" }}
      draw={(ctx, w, h) => {
        const img = ctx.createImageData(w, h);
        for (let i = 0; i < w * h; i++) {
          const v = hash(i * 1.37 + 20) * 255;
          img.data[i * 4] = v;
          img.data[i * 4 + 1] = v;
          img.data[i * 4 + 2] = v;
          img.data[i * 4 + 3] = 255;
        }
        ctx.putImageData(img, 0, 0);
      }}
    />
    <AbsoluteFill style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.16) 0px, rgba(0,0,0,0.16) 2px, transparent 2px, transparent 5px)" }} />
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, transparent 58%, rgba(0,0,0,0.55) 100%)" }} />
  </AbsoluteFill>
);
