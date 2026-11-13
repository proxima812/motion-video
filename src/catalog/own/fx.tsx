import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import { SPRING, ease, lerp, progress, springAt } from "../../stage/motion";
import { pop } from "../../kit/reel";
import { INK, INTER, SURFACE, WHITE } from "../../kit/design";

// Layout wrappers, transitions and pointer in the design system (surfaces = SURFACE, INK by default, no extra shadows).

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Hard cut in with a short punch-in, 1.06 -> 1 over 7 frames */
export const Punch: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const f = useCurrentFrame();
  const k = interpolate(f, [0, 7], [1.06, 1], clamp);
  return <AbsoluteFill style={{ transform: `scale(${k})` }}>{children}</AbsoluteFill>;
};

/** Start a component `frames` into its own timeline */
export const Skip: React.FC<{ frames: number; children: React.ReactNode }> = ({ frames, children }) => (
  <Sequence from={-frames} layout="none">
    {children}
  </Sequence>
);

/** Scale a full-frame component around the center, e.g. a 16:9 Remocn scene in 9:16 */
export const ScaleFill: React.FC<{ k: number; y?: number; children: React.ReactNode }> = ({ k, y = 0, children }) => (
  <AbsoluteFill style={{ transform: `translateY(${y}px) scale(${k})` }}>{children}</AbsoluteFill>
);

/** Web UI (shadcn, sized for 16 px) laid out at native width `w` and scaled by `s`, centered horizontally */
export const WebScale: React.FC<{ top: number; w: number; s: number; frameW?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ top, w, s, frameW = 1080, style, children }) => (
  <div style={{ position: "absolute", top, left: (frameW - w * s) / 2, width: w, transform: `scale(${s})`, transformOrigin: "0 0" }}>
    <div style={style}>{children}</div>
  </div>
);

/** A full-frame Remocn component in its own box: the Sequence width/height become the frame it sees */
export const FrameBox: React.FC<{ at: number; top: number; h: number; w?: number; len?: number; children: React.ReactNode }> = ({ at, top, h, w = 1080, len, children }) => (
  <div style={{ position: "absolute", left: 0, top, width: w, height: h }}>
    <Sequence from={at} durationInFrames={len} width={w} height={h} layout="none">
      <AbsoluteFill>{children}</AbsoluteFill>
    </Sequence>
  </div>
);

/** TV switch-off (light): picture squashes to a line, pinches to a dot, the INK dot fades on white */
export const PowerOff: React.FC<{ at: number; len?: number; dot?: string; children: React.ReactNode }> = ({ at, len = 30, dot = INK, children }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + len], [0, 1], clamp);
  if (p <= 0) return <AbsoluteFill>{children}</AbsoluteFill>;
  const sy = interpolate(p, [0, 0.6], [1, 0.006], { ...clamp, easing: (x) => x * x });
  const sx = interpolate(p, [0.6, 0.82], [1, 0.012], clamp);
  const fade = interpolate(p, [0.82, 1], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ background: WHITE }}>
      {p < 0.82 ? (
        <AbsoluteFill style={{ transform: `scale(${sx}, ${sy})`, background: WHITE, overflow: "hidden" }}>
          {children}
          <AbsoluteFill style={{ background: dot, opacity: interpolate(p, [0.35, 0.6], [0, 1], clamp) }} />
        </AbsoluteFill>
      ) : (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 26, height: 26, borderRadius: 13, background: dot, opacity: fade }} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

/** Card that pops in at `enter` and flips (Y axis) to its back at `flipAt`: front = white surface, back = accent fill */
export const FlipCard: React.FC<{ frame: number; enter: number; flipAt: number; front: React.ReactNode; back: React.ReactNode; w?: number; h?: number; accent?: string }> = ({ frame, enter, flipAt, front, back, w = 430, h = 330, accent = INK }) => {
  const p = pop(frame, enter, SPRING.smooth);
  const flip = Math.min(1, springAt(frame, flipAt, SPRING.snappy));
  const isBack = flip > 0.5;
  return (
    <div style={{ ...p.style, width: w, height: h, perspective: 1200 }}>
      <div style={{ ...SURFACE, width: "100%", height: "100%", transform: `rotateY(${flip * 180}deg)`, background: isBack ? accent : WHITE, color: isBack ? WHITE : INK, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, transform: isBack ? "scaleX(-1)" : undefined, display: "grid", placeItems: "center" }}>{isBack ? back : front}</div>
      </div>
    </div>
  );
};

/** Year (or any count) as a grid of dots that ripple in from `at`; `lit(i)` 0..1 highlights a dot in `on` */
export const DotGrid: React.FC<{ frame: number; at: number; lit: (i: number) => number; count?: number; cols?: number; size?: number; on?: string; off?: string }> = ({
  frame,
  at,
  lit,
  count = 365,
  cols = 27,
  size = 26,
  on = INK,
  off = "rgba(37, 27, 58, 0.08)",
}) => (
  <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, ${size}px)`, gap: size * 0.22 }}>
    {Array.from({ length: count }, (_, i) => {
      const t = springAt(frame, at + (i % cols) * 0.6 + Math.floor(i / cols) * 1.2, SPRING.smooth);
      const g = lit(i);
      return <div key={i} style={{ width: size, height: size, borderRadius: size / 2, background: g > 0.5 ? on : off, opacity: Math.min(1, t * 1.6), transform: `scale(${t * (1 + (g > 0.5 ? 0.12 : 0))})` }} />;
    })}
  </div>
);

export type CursorKey = { f: number; x: number; y: number };

/** Screen-space mouse pointer gliding between keyframes; `clicks` add a press + ripple; visible over `show` */
export const Pointer: React.FC<{ frame: number; keys: CursorKey[]; clicks?: number[]; show: readonly [number, number] }> = ({ frame, keys, clicks = [], show }) => {
  const vis = Math.min(springAt(frame, show[0], SPRING.smooth), 1 - progress(frame, show[1] - 5, show[1]));
  if (vis <= 0.01) return null;
  let x = keys[0].x;
  let y = keys[0].y;
  for (let i = 1; i < keys.length; i++) {
    const t = ease.inOut(progress(frame, keys[i - 1].f, keys[i].f));
    if (frame >= keys[i - 1].f) {
      x = lerp(keys[i - 1].x, keys[i].x, t);
      y = lerp(keys[i - 1].y, keys[i].y, t);
    }
  }
  const press = clicks.reduce((m, c) => Math.max(m, springAt(frame, c - 4, SPRING.snappy) * (1 - springAt(frame, c + 4, SPRING.snappy))), 0);
  const ripple = clicks.map((c) => progress(frame, c, c + 19)).find((r) => r > 0 && r < 1) ?? 0;
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: Math.min(1, vis), pointerEvents: "none" }}>
      {ripple > 0 && (
        <div style={{ position: "absolute", left: -50 * (0.4 + ripple), top: -50 * (0.4 + ripple), width: 100 * (0.4 + ripple), height: 100 * (0.4 + ripple), borderRadius: "50%", border: "4px solid rgba(37, 27, 58, 0.3)", opacity: 1 - ripple }} />
      )}
      <svg width={72} height={72} viewBox="0 0 24 24" style={{ transform: `translate(-8px, -5px) scale(${1 - 0.16 * press})`, transformOrigin: "6px 4px", filter: "drop-shadow(-1px -4px 18px rgba(144, 142, 142, 0.35))" }}>
        <path d="M5.5 3.2v16.1c0 .5.6.7.9.4l3.9-4 2.6 5.8c.2.4.6.5 1 .4l1.8-.8c.4-.2.5-.6.4-1l-2.6-5.7h5.6c.5 0 .7-.6.4-.9L6.4 2.8c-.3-.3-.9-.1-.9.4z" fill={INK} stroke={WHITE} strokeWidth={1.3} strokeLinejoin="round" />
      </svg>
    </div>
  );
};

/** Forces the design-system font (Inter) on third-party components (Remocn, shadcn) that hardcode their own */
export const InterScope: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill className="ds-inter">
    <style>{`.ds-inter, .ds-inter * { font-family: ${INTER}, sans-serif !important; }`}</style>
    {children}
  </AbsoluteFill>
);
