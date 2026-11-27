import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { SPRING, ease, progress, springAt } from "../../stage/motion";
import { DotPattern, HAND, INTER, Sparkles, grad } from "../../cover/CoverLab";
import { INK } from "../design";
import { QUAD_FIT } from "../quadFit";
import { makeTitle, plate, rgba, tint } from "./shared";
import type { HostPreset, Palette } from "./types";

// Alicja - «подруга». White blouse with gold embroidery. Continues her bubble cover: pale background with soft
// radial glows and a dot pattern, a handwritten kicker, giant speech bubbles pointing at her, hearts / sparkles.
// Motion: soft - things come out of blur, words float up one by one, blurred crossfades.
// Telling: a story / a case from life -> the feeling -> a soft conclusion.
// Elements: Kicker, SpeechBubble (+ dots = she is silent), ChatBubbles, Polaroid, FloatingHearts, TypingDots.

// Tatar letters (ә ө ү ң җ һ) live in Inter's cyrillic-ext subset - bubbles say «Сәлам», «Рәхмәт»
loadInter("normal", { weights: ["500", "800"], subsets: ["cyrillic-ext"] });

export const ALICJA_PALETTES: readonly Palette[] = [
  { name: "honey", main: "#8A5A12", vivid: "#D49A2A", glow: "#F2D79B", pale: "#FCF5E6", plate: plate("#E0A93C", "#A86F14"), gray: "#EFE6D6", muted: "#8F8270" },
  { name: "terracotta", main: "#9A4527", vivid: "#D2693F", glow: "#F3C2A6", pale: "#FCF1EA", plate: plate("#E07A50", "#A9502E"), gray: "#EFE2DA", muted: "#8E7A70" },
  { name: "caramel", main: "#7A4B2A", vivid: "#C07A45", glow: "#EBC9A8", pale: "#FAF2EA", plate: plate("#CC8A55", "#86532E"), gray: "#ECE2D8", muted: "#887868" },
];

const SPR = SPRING.soft;

/** Words float up out of blur one by one; key words are handwritten (Caveat), bigger, slightly tilted */
const Title = makeTitle(SPR, 5, (t, i, key, pal) => ({
  opacity: Math.min(1, t * 1.2),
  transform: `translateY(${(1 - t) * 26}px)${key ? " rotate(-3deg)" : ""}`,
  filter: t < 0.98 ? `blur(${Math.max(0, (1 - t) * 12)}px)` : undefined,
  ...(key ? { fontFamily: HAND, fontWeight: 700, fontSize: "1.32em", lineHeight: 0.8, letterSpacing: 0, color: pal.main } : null),
}));

/** Bubble-cover background: pale + two soft glows that breathe, a dot pattern, a few drifting sparkles */
const Bg: React.FC<{ pal: Palette }> = ({ pal }) => {
  const frame = useCurrentFrame();
  const b = Math.sin(frame / 90);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(70% 50% at ${20 + b * 4}% ${20 + b * 3}%, ${pal.glow}AA 0%, transparent 70%), radial-gradient(60% 45% at ${90 - b * 4}% 60%, ${pal.glow} 0%, transparent 70%), ${pal.pale}` }}>
      <DotPattern color={tint(pal.main, 0.16)} size={34} />
      {[[140, 900, 34, 0], [930, 1010, 46, 50], [880, 600, 28, 100]].map(([x, y, s, ph], i) => (
        <AbsoluteFill key={i} style={{ transform: `translateY(${Math.sin((frame + ph) / 60) * 14}px)`, opacity: 0.45 + 0.25 * Math.sin((frame + ph) / 40) }}>
          <Sparkles color={pal.vivid} items={[[x, y, s]]} />
        </AbsoluteFill>
      ))}
    </AbsoluteFill>
  );
};

const enter = (frame: number, at: number): React.CSSProperties => {
  const t = springAt(frame, at, SPR);
  return { opacity: Math.min(1, t * 1.3), transform: `translateY(${(1 - t) * 30}px) scale(${0.97 + 0.03 * t})`, filter: t < 0.98 ? `blur(${Math.max(0, (1 - t) * 14)}px)` : undefined };
};
const exit = (frame: number, at: number): React.CSSProperties => {
  const o = ease.inOut(progress(frame, at, at + 14));
  return o <= 0 ? {} : { opacity: 1 - o, filter: `blur(${o * 14}px)`, transform: `translateY(${-o * 16}px)` };
};
/** enter at `at`, leave at `out` (both styles merged; opacity multiplied) */
const life = (frame: number, at: number, out?: number): React.CSSProperties => {
  const a = enter(frame, at);
  if (out == null || frame < out) return a;
  const b = exit(frame, out);
  return { ...a, ...b, opacity: Number(a.opacity ?? 1) * Number(b.opacity ?? 1), transform: `${a.transform ?? ""} ${b.transform ?? ""}` };
};

/* ───────── Elements ───────── */

/** Three dots bouncing in turn (someone is typing / she has nothing to say) */
export const TypingDots: React.FC<{ frame: number; color: string; size?: number }> = ({ frame, color, size = 18 }) => (
  <div style={{ display: "flex", gap: size * 0.6, alignItems: "center", height: size * 2 }}>
    {[0, 1, 2].map((i) => (
      <div key={i} style={{ width: size, height: size, borderRadius: "50%", background: color, transform: `translateY(${-Math.max(0, Math.sin(frame / 6 - i * 0.9)) * size * 0.55}px)`, opacity: 0.55 + 0.45 * Math.max(0, Math.sin(frame / 6 - i * 0.9)) }} />
    ))}
  </div>
);

/** Handwritten kicker line (Caveat 700, tilted), centered at x */
export const Kicker: React.FC<{ frame: number; at: number; out?: number; pal: Palette; text: string; y: number; x?: number; size?: number; rot?: number }> = ({ frame, at, out, pal, text, y, x = 540, size = 76, rot = -3 }) => (
  <div style={{ position: "absolute", left: x - 470, width: 940, top: y, textAlign: "center", ...life(frame, at, out) }}>
    <span style={{ display: "inline-block", fontFamily: HAND, fontWeight: 700, fontSize: size, lineHeight: 1, color: pal.main, transform: `rotate(${rot}deg)` }}>{text}</span>
  </div>
);

/** Speech bubble from the bubble cover: white, round, a tail pointing down (at the host) at `tail` (0..1 of the width).
 *  text = Inter 800 in a vivid -> main gradient, words appear at `textAt` (one start or a start per word); sub = gray line under it.
 *  dots = no text, only typing dots (she wants to speak but stays silent); typing = dots in the empty bubble until the first word. */
export const SpeechBubble: React.FC<{
  frame: number; at: number; out?: number; pal: Palette; x: number; y: number; w?: number; size?: number;
  text?: string; textAt?: number | number[]; sub?: string; subAt?: number; tail?: number | null; dots?: boolean; typing?: boolean; rot?: number;
}> = ({ frame, at, out, pal, x, y, w, size = 112, text, textAt, sub, subAt, tail = 0.5, dots, typing, rot = 0 }) => {
  const words = text ? text.split(" ") : [];
  const breathe = 1 + Math.sin((frame - at) / 50) * 0.008;
  const tw = size * 0.85;
  const first = Array.isArray(textAt) ? textAt[0] : (textAt ?? at);
  const wait = typing && !dots ? 1 - progress(frame, first - 6, first + 4) : 0;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, transform: `translateX(-50%) rotate(${rot}deg)`, ...(w ? null : { whiteSpace: "nowrap" }) }}>
      <div style={{ ...life(frame, at, out), transformOrigin: `${(tail ?? 0.5) * 100}% 100%` }}>
        <div style={{ position: "relative", background: "#fff", borderRadius: size * 0.58, padding: `${size * 0.5}px ${size * 0.42}px ${size * 0.44}px`, textAlign: "center", boxShadow: `0 40px 70px -30px ${rgba(pal.main, 0.45)}`, transform: `scale(${breathe})` }}>
          {dots ? (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <TypingDots frame={frame} color={tint(pal.main, 0.45)} size={size * 0.2} />
            </div>
          ) : (
            <div style={{ position: "relative", fontFamily: INTER, fontWeight: 800, fontSize: size, letterSpacing: "-0.04em", lineHeight: 1.02 }}>
              {wait > 0 && (
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: wait }}>
                  <TypingDots frame={frame} color={tint(pal.main, 0.45)} size={size * 0.2} />
                </div>
              )}
              {words.map((wd, i) => {
                const a = Array.isArray(textAt) ? (textAt[i] ?? textAt[textAt.length - 1]) : (textAt ?? at) + i * 5;
                const t = springAt(frame, a, SPR);
                return (
                  <span key={i} style={{ display: "inline-block", marginRight: i < words.length - 1 ? "0.24em" : 0, ...grad(`linear-gradient(90deg, ${pal.vivid}, ${pal.main})`), opacity: Math.min(1, t * 1.3), transform: `translateY(${(1 - t) * 20}px)`, filter: t < 0.98 ? `blur(${(1 - t) * 10}px)` : undefined }}>
                    {wd}
                  </span>
                );
              })}
            </div>
          )}
          {sub && <div style={{ fontFamily: INTER, fontWeight: 500, fontSize: size * 0.4, color: "#6E6870", marginTop: size * 0.2, ...enter(frame, subAt ?? at) }}>{sub}</div>}
          {tail != null && (
            <svg viewBox="0 0 80 70" width={tw} height={tw * 0.875} style={{ position: "absolute", left: `${tail * 100}%`, marginLeft: -tw / 2, bottom: -tw * 0.72 }}>
              <path d="M0 0 H80 L18 70 Z" fill="#fff" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
};

/** Chat messages: "in" = white bubble on the left (a friend), "out" = palette plate on the right (Alicja).
 *  Each message shows typing dots for `typing` frames, then the text floats in. Rows stack from y down. */
export type ChatMsg = { at: number; side: "in" | "out"; text: string; typing?: number };
export const ChatBubbles: React.FC<{ frame: number; pal: Palette; items: ChatMsg[]; y: number; x?: number; w?: number; size?: number; out?: number }> = ({ frame, pal, items, y, x = 540, w = 860, size = 52, out }) => (
  <div style={{ position: "absolute", left: x - w / 2, width: w, top: y, display: "flex", flexDirection: "column", gap: size * 0.5, ...(out != null ? exit(frame, out) : null) }}>
    {items.map((m, i) => {
      const typing = m.typing ?? 24;
      if (frame < m.at - typing) return null;
      const isIn = m.side === "in";
      const shown = frame >= m.at;
      const r = size * 0.85;
      const bubble: React.CSSProperties = {
        maxWidth: w * 0.82, padding: `${size * 0.46}px ${size * 0.62}px`, fontFamily: INTER, fontWeight: 500, fontSize: size, lineHeight: 1.15, letterSpacing: "-0.01em",
        borderRadius: isIn ? `${r}px ${r}px ${r}px ${size * 0.2}px` : `${r}px ${r}px ${size * 0.2}px ${r}px`,
        background: isIn ? "#fff" : pal.plate, color: isIn ? INK : "#fff",
        boxShadow: isIn ? `0 24px 50px -28px ${rgba(pal.main, 0.45)}` : `0 24px 50px -24px ${rgba(pal.main, 0.6)}`,
      };
      return (
        <div key={i} style={{ display: "flex", justifyContent: isIn ? "flex-start" : "flex-end", ...enter(frame, m.at - typing) }}>
          <div style={{ ...bubble, transformOrigin: isIn ? "0 100%" : "100% 100%" }}>
            {shown ? <span style={{ display: "inline-block", ...enter(frame, m.at) }}>{m.text}</span> : <TypingDots frame={frame} color={isIn ? tint(pal.main, 0.4) : "rgba(255,255,255,0.85)"} size={size * 0.32} />}
          </div>
        </div>
      );
    })}
  </div>
);

const HEART = "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z";

/** Hearts drifting up from (x, y) from `at`, one every `every` frames, each lives `lifeF` frames */
export const FloatingHearts: React.FC<{ frame: number; at: number; pal: Palette; x: number; y: number; n?: number; spread?: number; every?: number; lifeF?: number }> = ({ frame, at, pal, x, y, n = 7, spread = 260, every = 9, lifeF = 100 }) => (
  <>
    {Array.from({ length: n }, (_, i) => {
      const a = at + i * every;
      const p = (frame - a) / lifeF;
      if (p < 0 || p > 1) return null;
      const s = 34 + ((i * 37) % 4) * 9;
      const dx = (((i * 53) % 11) / 10 - 0.5) * spread + Math.sin(p * 6 + i) * 18;
      const c = [pal.vivid, pal.main, pal.glow][i % 3];
      return (
        <svg key={i} viewBox="0 0 24 24" width={s} height={s} style={{ position: "absolute", left: x + dx - s / 2, top: y - p * 320 - s / 2, opacity: Math.min(1, p * 6) * (1 - ease.in(p)), transform: `scale(${0.6 + 0.4 * Math.min(1, p * 4)}) rotate(${(i % 2 ? 1 : -1) * 12}deg)` }}>
          <path d={HEART} fill={c} />
        </svg>
      );
    })}
  </>
);

/** Polaroid: drops in tilted, the photo develops from gray at `develop`, a handwritten caption under it.
 *  children = drawn content of the photo (positioned inside a box of w-2pad by the same height). */
export const Polaroid: React.FC<{ frame: number; at: number; out?: number; pal: Palette; x?: number; y: number; w?: number; rot?: number; develop?: number; caption?: string; captionAt?: number; children?: React.ReactNode }> = ({ frame, at, out, pal, x = 540, y, w = 600, rot = -4, develop, caption, captionAt, children }) => {
  const t = springAt(frame, at, SPR);
  const pad = w * 0.06;
  const inner = w - pad * 2;
  const dev = develop == null ? 1 : ease.inOut(progress(frame, develop, develop + 50));
  const o = out != null ? exit(frame, out) : {};
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y, width: w, opacity: Math.min(1, t * 1.4) * Number(o.opacity ?? 1), filter: o.filter, transform: `translateY(${(1 - t) * -70}px) rotate(${rot + (1 - t) * 7}deg)` }}>
      <div style={{ background: "#fff", borderRadius: w * 0.03, padding: pad, paddingBottom: pad * 3.4, boxShadow: `0 40px 70px -30px ${rgba(pal.main, 0.5)}` }}>
        <div style={{ position: "relative", width: inner, height: inner, borderRadius: w * 0.012, overflow: "hidden", background: `linear-gradient(180deg, ${pal.pale}, ${pal.glow})` }}>
          {children}
          <div style={{ position: "absolute", inset: 0, background: "#D9D4CC", opacity: 1 - dev }} />
        </div>
        {caption && (
          <div style={{ position: "absolute", left: 0, right: 0, bottom: pad * 0.9, textAlign: "center", fontFamily: HAND, fontWeight: 700, fontSize: w * 0.11, lineHeight: 1, color: pal.main, ...enter(frame, captionAt ?? at + 30) }}>{caption}</div>
        )}
      </div>
    </div>
  );
};

/* ───────── Preset ───────── */

const Showcase: React.FC<{ frame: number; pal: Palette }> = ({ frame, pal }) => (
  <AbsoluteFill>
    <Title text="Alicja *подруга*" frame={frame} at={10} pal={pal} top={200} size={110} />
    <ChatBubbles frame={frame} pal={pal} y={420} items={[{ at: 60, side: "in", text: "пойдем на татарский вечер" }, { at: 120, side: "out", text: "мне страшно" }]} />
    <SpeechBubble frame={frame} at={190} pal={pal} x={540} y={820} w={860} size={96} text="достаточно прийти" textAt={200} sub="чтобы стать своей" subAt={240} />
    <FloatingHearts frame={frame} at={260} pal={pal} x={540} y={1200} />
  </AbsoluteFill>
);

export const ALICJA: HostPreset = {
  id: "alicja",
  name: "Alicja",
  role: "подруга",
  palettes: ALICJA_PALETTES,
  covers: ["bubble"],
  tags: ["[warm]", "[soft]", "[light laugh]", "[sincere]"],
  fit: QUAD_FIT.alicja,
  motion: {
    spring: SPR,
    stagger: 5,
    enter,
    exit,
    // blurred crossfade, scenes overlap by ~16 frames
    scene: (frame, [a, b]) => {
      const t = a === 0 ? 1 : ease.inOut(progress(frame, a - 4, a + 14));
      const out = ease.inOut(progress(frame, b - 2, b + 14));
      return { opacity: t * (1 - out), filter: t < 1 || out > 0 ? `blur(${(1 - t) * 16 + out * 16}px)` : undefined, transform: `translateY(${(1 - t) * 24 - out * 18}px)` };
    },
    scenePad: [4, 14],
    drift: 0.02,
  },
  Title,
  Bg,
  Showcase,
};
