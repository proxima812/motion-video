import React from "react";
import { AbsoluteFill } from "remotion";
import { ShaderWarpCream } from "@/components/remocn/shader-warp-cream";
import type { CoverProps } from "../../cover/Cover";
import { springAt, type SpringConfig } from "../../stage/motion";
import { HEADING, SAFE } from "../design";
import type { Palette, TitleProps } from "./types";

// Shared bits of the host presets. The reel background repeats the approved cover: the cream shader in the reel palette
// rises from the bottom (behind the host) and fades into white at the top, where the scene content lives.

/** "*key* words" -> [word, isKey][] (a key may span several words: "*татарский язык*") */
export const keyWords = (text: string) => {
  let on = false;
  return text.split(" ").map((raw): [string, boolean] => {
    const open = on || raw.startsWith("*");
    on = open && !raw.endsWith("*");
    return [raw.replace(/\*/g, ""), open];
  });
};

/** Cream shader wash in the palette: `from` = y where it starts, `strength` = opacity, fades in over the top `fade` of its height */
export const CreamWash: React.FC<{ pal: Palette; from?: number; strength?: number; fade?: number; speed?: number }> = ({ pal, from = 900, strength = 0.7, fade = 0.45, speed = 0.6 }) => (
  <AbsoluteFill style={{ top: from, opacity: strength, maskImage: `linear-gradient(transparent, #000 ${fade * 100}%)`, WebkitMaskImage: `linear-gradient(transparent, #000 ${fade * 100}%)` }}>
    <ShaderWarpCream colors={[...pal.bg]} speed={speed} />
  </AbsoluteFill>
);

/** The approved tatarverse cover (new-v, 2026-11-14) recolored to a palette */
export const tatarverseCover = (pal: Palette): Partial<CoverProps> => ({
  background: "shader-warp-cream",
  bgColors: [...pal.bg],
  topLogo: "tatarverse/logo.svg",
  fontPair: "caveat-inter",
  titleWeight: 400,
  accentWeight: 700,
  maxTitleLines: 2,
  descPlate: pal.plate,
  avatarHeight: 941,
});

export const plate = (a: string, b: string) => `linear-gradient(135deg, ${a}, ${b})`;

/** Heading factory: Inter 400 centered line, *key* words 700 in pal.main; `word` styles one word from its spring t
 *  (t = springAt(frame, start of the word, spring)); `extra` draws something under/over a word (underline, glow). */
export const makeTitle =
  (spring: SpringConfig, stagger: number, word: (t: number, i: number, key: boolean, pal: Palette) => React.CSSProperties, extra?: (t: number, i: number, key: boolean, pal: Palette, frame: number, start: number) => React.ReactNode): React.FC<TitleProps> =>
  ({ text, frame, at, pal, size = 88, top = 170, style }) => (
    <div style={{ ...HEADING, position: "absolute", left: SAFE.x, right: SAFE.x, top, textAlign: "center", fontSize: size, ...style }}>
      {keyWords(text).map(([raw, key], i, all) => {
        const start = Array.isArray(at) ? (at[i] ?? at[at.length - 1]) : at + i * stagger;
        const t = springAt(frame, start, spring);
        return (
          <span key={i} style={{ position: "relative", display: "inline-block", marginRight: i < all.length - 1 ? "0.24em" : 0, fontWeight: key ? 700 : 400, color: key ? pal.main : undefined, ...word(t, i, key, pal) }}>
            {raw}
            {extra?.(t, i, key, pal, frame, start)}
          </span>
        );
      })}
    </div>
  );
