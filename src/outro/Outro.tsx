import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, staticFile, useCurrentFrame } from "remotion";
import { SPRING, springAt } from "../stage/motion";
import { fontFamily } from "../ui/theme";
import { TatarverseOutro } from "./TatarverseOutro";

// Shared end card for every video (60 fps): @const_proxima, "не подписывайся.", meme photos, avatar.
export const OUTRO_FRAMES = 180;

type Lang = "ru" | "en";
const SUB: Record<Lang, string> = { ru: "не подписывайся.", en: "don't subscribe." };

// cx/cy - card center, from = fly-in direction, at = start frame
const PHOTOS = [
  { src: "outro/chimp.jpg", cx: 125, cy: 150, w: 290, h: 310, rot: -3, from: [-1, -1], at: 12 },
  { src: "outro/official.jpg", cx: 965, cy: 235, w: 300, h: 380, rot: 7, from: [1, -1], at: 18 },
  { src: "outro/shrek.jpg", cx: 75, cy: 1085, w: 220, h: 220, rot: -28, from: [-1, 0], at: 24 },
  { src: "outro/cat.jpg", cx: 965, cy: 1280, w: 290, h: 330, rot: -9, from: [1, 0.3], at: 30 },
] as const;
const SELFIE = { src: "outro/selfie.jpg", cx: 600, cy: 1048, w: 180, h: 180, rot: 3, at: 46 };

const card: React.CSSProperties = {
  position: "absolute",
  borderRadius: 22,
  overflow: "hidden",
  boxShadow: "0 30px 60px -30px rgba(0,0,0,0.35), 0 2px 6px rgba(0,0,0,0.08)",
  background: "#eee",
};

const Photo: React.FC<{ src: string; cx: number; cy: number; w: number; h: number; style: React.CSSProperties }> = ({ src, cx, cy, w, h, style }) => (
  <div style={{ ...card, left: cx - w / 2, top: cy - h / 2, width: w, height: h, ...style }}>
    <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
  </div>
);

export const Outro: React.FC<{ lang?: Lang }> = ({ lang = "ru" }) => {
  const frame = useCurrentFrame();
  const ava = springAt(frame, 0, SPRING.smooth);
  const handle = springAt(frame, 6, SPRING.smooth);
  const sub = springAt(frame, 16, SPRING.smooth);
  const wave = Math.sin(Math.max(0, frame - 22) / 5) * 14 * Math.exp(-Math.max(0, frame - 22) / 50);
  const selfie = springAt(frame, SELFIE.at, SPRING.bouncy);

  const rise = (t: number, d = 40): React.CSSProperties => ({
    opacity: Math.min(1, t * 1.5),
    transform: `translateY(${(1 - t) * d}px)`,
    filter: t < 0.98 ? `blur(${Math.max(0, (1 - t) * 10)}px)` : undefined,
  });

  return (
    <AbsoluteFill style={{ background: "#FFFFFF", fontFamily, WebkitFontSmoothing: "antialiased", opacity: Math.min(1, frame / OVERLAP) }}>
      {PHOTOS.map((p, i) => {
        const t = springAt(frame, p.at, SPRING.bouncy);
        const float = Math.sin((frame + i * 37) / 38) * 6;
        return (
          <Photo
            key={p.src}
            {...p}
            style={{
              opacity: Math.min(1, t * 2),
              transform: `translate(${p.from[0] * (1 - t) * 420}px, ${p.from[1] * (1 - t) * 420 + float}px) rotate(${p.rot + (1 - t) * p.from[0] * 25}deg) scale(${0.7 + 0.3 * t})`,
            }}
          />
        );
      })}

      <div style={{ position: "absolute", top: 480, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
        <div style={{ ...rise(handle), fontSize: 76, fontWeight: 800, letterSpacing: "-0.03em", color: "#3A3A3D" }}>@const_proxima</div>
        <div style={{ ...rise(sub), fontSize: 54, fontWeight: 400, color: "#4A4A4F", display: "flex", alignItems: "center", gap: 20 }}>
          <span style={{ display: "inline-block", transform: `rotate(${wave}deg)`, transformOrigin: "70% 90%" }}>🤚</span>
          {SUB[lang]}
        </div>
      </div>

      <Img
        src={staticFile("avatar.png")}
        style={{ position: "absolute", bottom: 0, left: "50%", width: 1000, transform: `translate(-50%, ${(1 - ava) * 520}px)` }}
      />
      <Photo
        {...SELFIE}
        style={{
          opacity: Math.min(1, selfie * 3),
          transform: `translateY(${(1 - selfie) * -700}px) rotate(${SELFIE.rot + (1 - selfie) * -20}deg)`,
        }}
      />

      <Sequence from={0} layout="none"><Audio src={staticFile("sfx2/whoosh.mp3")} volume={0.45} /></Sequence>
      {PHOTOS.map((p) => (
        <Sequence key={p.src} from={p.at + 4} layout="none"><Audio src={staticFile("sfx2/pop.mp3")} volume={0.35} /></Sequence>
      ))}
      <Sequence from={SELFIE.at + 8} layout="none"><Audio src={staticFile("sfx2/click.mp3")} volume={0.6} /></Sequence>
    </AbsoluteFill>
  );
};

// Main video + shared outro, overlapping by OVERLAP frames (outro fades in over the last beat)
export const OVERLAP = 12;
export const outroTotal = (mainFrames: number) => mainFrames - OVERLAP + OUTRO_FRAMES;
export const withOutro = (Main: React.FC, mainFrames: number, lang: Lang, account: "proxima" | "tatarverse" | "tatarverse-tataro" = "proxima"): React.FC => {
  const C: React.FC = () => (
    <AbsoluteFill style={{ background: "#fff" }}>
      <Sequence durationInFrames={mainFrames}>
        <Main />
      </Sequence>
      <Sequence from={mainFrames - OVERLAP}>
        {account === "proxima" ? <Outro lang={lang} /> : <TatarverseOutro collab={account === "tatarverse-tataro"} />}
      </Sequence>
    </AbsoluteFill>
  );
  return C;
};
