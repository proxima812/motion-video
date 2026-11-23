import React from "react";
import { AbsoluteFill } from "remotion";
import { DARK, D_HEADING, Tex, Texture, texSize } from "../kit/dark";
import { TEX } from "./tex";

// Cover for video 53 in the reel's own look: black, grain, the hook formula without a frame, a short title. No avatar.
export const Cover53: React.FC = () => {
  const em = 118;
  const parts = [TEX.tf, TEX.neq, TEX.tp];
  const gap = 0.28 * em;
  const total = parts.reduce((s, t) => s + texSize(t, em).w, 0) + gap * 2;
  return (
    <AbsoluteFill style={{ background: DARK.bg, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 70% 45% at 50% 46%, rgba(255,255,255,0.05) 0%, transparent 70%)" }} />
      <div style={{ position: "absolute", left: 540 - total / 2, top: 560, display: "flex", alignItems: "baseline", gap }}>
        {parts.map((t, i) => (
          <Tex key={i} t={t} em={em} color={i === 0 ? DARK.white : DARK.gray} style={{ filter: i === 0 ? "drop-shadow(0 0 8px rgba(255,255,255,0.6))" : "blur(1.5px)" }} />
        ))}
      </div>
      <div style={{ position: "absolute", left: 100, right: 100, top: 860, ...D_HEADING, fontSize: 124, textAlign: "center", letterSpacing: "-0.05em" }}>
        Будущее <b style={{ fontWeight: 700 }}>уже влияет</b>
        <div style={{ color: DARK.gray, fontSize: 104, marginTop: 18 }}>на тебя</div>
      </div>
      <Texture frame={7} grain={0.08} />
    </AbsoluteFill>
  );
};
