import React from "react";
import { springAt, type SpringConfig } from "../../stage/motion";
import { HEADING, SAFE } from "../design";
import type { Palette, TitleProps } from "./types";

// Shared bits of the host presets. Cover fonts and web-effect patterns (GridPattern, DotPattern, Ripple, Sparkles,
// grad, UNB / HAND / MONT / MONO / RUSSO / SERIF) come from src/cover/CoverLab.tsx, so reels and covers match.

/** "*key* words" -> [word, isKey][] (a key may span several words: "*татарский язык*") */
export const keyWords = (text: string) => {
  let on = false;
  return text.split(" ").map((raw): [string, boolean] => {
    const open = on || raw.startsWith("*");
    on = open && !raw.endsWith("*");
    return [raw.replace(/\*/g, ""), open];
  });
};

/** "#RRGGBB" + alpha 0..1 -> "#RRGGBBAA" */
export const tint = (hex: string, a: number) => `${hex}${Math.round(a * 255).toString(16).padStart(2, "0")}`;
/** "#RRGGBB" -> "rgba(r,g,b,a)" */
export const rgba = (hex: string, a: number) => `rgba(${parseInt(hex.slice(1, 3), 16)},${parseInt(hex.slice(3, 5), 16)},${parseInt(hex.slice(5, 7), 16)},${a})`;

export const plate = (a: string, b: string) => `linear-gradient(135deg, ${a}, ${b})`;

/** Heading factory: Inter 400 centered line in the safe zone; `word` styles one word from its spring t
 *  (t = springAt(frame, word start, spring)), `key` words get the preset's key style; `extra` draws over/under a word. */
export const makeTitle =
  (spring: SpringConfig, stagger: number, word: (t: number, i: number, key: boolean, pal: Palette) => React.CSSProperties, extra?: (t: number, i: number, key: boolean, pal: Palette) => React.ReactNode): React.FC<TitleProps> =>
  ({ text, frame, at, pal, size = 88, top = 170, style }) => (
    <div style={{ ...HEADING, position: "absolute", left: SAFE.x, right: SAFE.x, top, textAlign: "center", fontSize: size, ...style }}>
      {keyWords(text).map(([raw, key], i, all) => {
        const start = Array.isArray(at) ? (at[i] ?? at[at.length - 1]) : at + i * stagger;
        const t = springAt(frame, start, spring);
        return (
          <span key={i} style={{ position: "relative", display: "inline-block", marginRight: i < all.length - 1 ? "0.24em" : 0, ...word(t, i, key, pal) }}>
            {raw}
            {extra?.(t, i, key, pal)}
          </span>
        );
      })}
    </div>
  );
