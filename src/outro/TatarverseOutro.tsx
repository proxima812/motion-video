import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { SPRING, springAt } from "../stage/motion";
import { fontFamily } from "../ui/theme";

// End card for @the_tatarverse videos (60 fps, 3 s): logo, handle, three big community logos (no plates)
// peeking in from three screen edges.
const FADE = 12; // = OVERLAP in Outro.tsx (not imported to avoid a cycle)
const ICONS = ["tt", "bs", "qt"] as const;
const LOGO_AT = 0;
const HANDLE_AT = 10;
const ICON_AT = (i: number) => 24 + i * 8;

// icon centers sit on/just past the frame edge; dx/dy = direction it slides in from (off-screen)
const PEEK = [
  { x: 10, y: 1340, dx: -260, dy: 0, rot: 18 },
  { x: 1075, y: 330, dx: 260, dy: 0, rot: -16 },
  { x: 760, y: 1830, dx: 0, dy: 260, rot: -10 },
];
const PEEK_WIDE = [
  { x: 10, y: 780, dx: -240, dy: 0, rot: 18 },
  { x: 1915, y: 260, dx: 240, dy: 0, rot: -16 },
  { x: 1380, y: 1010, dx: 0, dy: 240, rot: -10 },
];

const rise = (t: number, d = 40): React.CSSProperties => ({
  opacity: Math.min(1, t * 1.5),
  transform: `translateY(${(1 - t) * d}px)`,
  filter: t < 0.98 ? `blur(${Math.max(0, (1 - t) * 10)}px)` : undefined,
});

// Collab partner wordmark (Tataro / @TatarTalkBot), text-only like the Tataro slides: gold dot + name
const TATARO_GOLD = "#D9A93F";
const X_AT = 8;
const PARTNER_AT = 16;

/** collab: "the_tatarverse x TatarTalkBot" end card for joint videos */
export const TatarverseOutro: React.FC<{ collab?: boolean }> = ({ collab = false }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const wide = width > height; // 16:9 videos: same card, tighter vertical layout
  const logo = springAt(frame, LOGO_AT, SPRING.bouncy);
  const handle = springAt(frame, HANDLE_AT, SPRING.smooth);
  const breathe = 1 + Math.sin(Math.max(0, frame - 30) / 22) * 0.015;

  return (
    <AbsoluteFill style={{ background: "#FFFFFF", fontFamily, WebkitFontSmoothing: "antialiased", opacity: Math.min(1, frame / FADE) }}>
      {collab ? (
        <div style={{ position: "absolute", top: 380, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Img
            src={staticFile("tatarverse/logo.svg")}
            style={{ width: 230, opacity: Math.min(1, logo * 2), transform: `scale(${(0.6 + 0.4 * logo) * breathe}) rotate(${(1 - logo) * -40}deg)` }}
          />
          <div style={{ ...rise(handle), marginTop: 44, fontSize: 76, fontWeight: 700, letterSpacing: "-0.03em", color: "#2e2e2f" }}><span style={{ fontWeight: 400 }}>@</span>the_tatarverse</div>
          <div style={{ ...rise(springAt(frame, X_AT, SPRING.bouncy), 20), margin: "26px 0", fontSize: 90, fontWeight: 300, color: "#A3A6AC" }}>×</div>
          <div style={{ ...rise(springAt(frame, PARTNER_AT, SPRING.bouncy)), display: "flex", alignItems: "center", gap: 26, padding: "26px 52px", borderRadius: 999, background: "#2e2e2f" }}>
            <div style={{ width: 36, height: 36, borderRadius: 18, background: TATARO_GOLD }} />
            <div style={{ fontSize: 72, fontWeight: 800, letterSpacing: "-0.03em", color: "#fff" }}>@TatarTalkBot</div>
          </div>
        </div>
      ) : (
      <div style={{ position: "absolute", top: wide ? 150 : 520, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Img
          src={staticFile("tatarverse/logo.svg")}
          style={{ width: wide ? 230 : 300, opacity: Math.min(1, logo * 2), transform: `scale(${(0.6 + 0.4 * logo) * breathe}) rotate(${(1 - logo) * -40}deg)` }}
        />
        <div style={{ ...rise(handle), marginTop: wide ? 44 : 70, fontSize: wide ? 72 : 84, fontWeight: 700, letterSpacing: "-0.03em", color: "#2e2e2f" }}><span style={{ fontWeight: 400 }}>@</span>the_tatarverse</div>
      </div>
      )}

      {ICONS.map((k, i) => {
        const t = springAt(frame, ICON_AT(i), SPRING.bouncy);
        const p = (wide ? PEEK_WIDE : PEEK)[i];
        const size = wide ? 300 : 380;
        const bob = Math.sin((frame + i * 40) / 30) * 8;
        return (
          <Img
            key={k}
            src={staticFile(`tatarverse/icons/${k}.svg`)}
            style={{
              position: "absolute",
              left: p.x - size / 2,
              top: p.y - size / 2,
              width: size,
              height: size,
              opacity: Math.min(1, t * 2),
              transform: `translate(${(1 - t) * p.dx + p.dx * 0.04 * bob}px, ${(1 - t) * p.dy + p.dy * 0.04 * bob}px) rotate(${p.rot}deg)`,
            }}
          />
        );
      })}

      <Sequence from={0} layout="none"><Audio src={staticFile("sfx/06_Ripple_Textures_II.wav")} volume={0.22} /></Sequence>
      {collab && <Sequence from={PARTNER_AT + 2} layout="none"><Audio src={staticFile("sfx/03_Basscrack.wav")} volume={0.12} /></Sequence>}
      {ICONS.map((k, i) => (
        <Sequence key={k} from={ICON_AT(i) + 4} layout="none"><Audio src={staticFile("sfx2/pop.mp3")} volume={0.35} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};
