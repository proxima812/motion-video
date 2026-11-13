import React from "react";
import { interpolateColors } from "remotion";
import { SPRING, ease, progress, springAt } from "../../stage/motion";
import { HEADING, INK, PARAGRAPH, SAFE, WHITE } from "../../kit/design";
import { K } from "../../kit/reel";

// Text components in the design system (src/kit/design.ts): headings Inter 400 with the key word 700,
// paragraphs Raleway 400 with accent words 700, all dark text INK. Mark a key word as *word* in text props.

const parse = (w: string) => (w.length > 2 && w.startsWith("*") && w.endsWith("*") ? { w: w.slice(1, -1), b: true } : { w, b: false });

/** Phrase rises in word by word from `at`, `stagger` frames apart; *word* = key word (700) */
export const Words: React.FC<{ text: string; frame: number; at: number; stagger?: number }> = ({ text, frame, at, stagger = 2 }) => (
  <>
    {text.split(" ").map((raw, i, all) => {
      const { w, b } = parse(raw);
      const t = springAt(frame, at + i * stagger, SPRING.smooth);
      return (
        <span
          key={i}
          style={{
            display: "inline-block",
            fontWeight: b ? 700 : undefined,
            marginRight: i < all.length - 1 ? "0.24em" : 0,
            opacity: Math.min(1, t * 1.3),
            transform: `translateY(${(1 - t) * 30}px)`,
            filter: `blur(${Math.max(0, (1 - t) * 8)}px)`,
          }}
        >
          {w}
        </span>
      );
    })}
  </>
);

export type SaidWord = { w: string; at: number; hi?: boolean };

/** Words rise in at their spoken frame (words.ts / VO timings); `hi` = key word (700, optional accent color) */
export const Said: React.FC<{ frame: number; words: SaidWord[]; color?: string }> = ({ frame, words, color }) => (
  <>
    {words.map(({ w, at, hi }, i) => {
      const t = springAt(frame, at, SPRING.smooth);
      return (
        <span key={i} style={{ display: "inline-block", marginRight: "0.24em", fontWeight: hi ? 700 : undefined, color: hi ? color : undefined, opacity: Math.min(1, t * 1.3), transform: `translateY(${(1 - t) * 30}px)`, filter: `blur(${Math.max(0, (1 - t) * 8)}px)` }}>
          {w}
        </span>
      );
    })}
  </>
);

export type HeadlineItem = { from: number; text: string };

/** Heading at the top of the safe zone that swaps at each item's `from`; doubles as sound-off captions */
export const Headline: React.FC<{ frame: number; items: HeadlineItem[]; size?: number; y?: number }> = ({ frame, items, size = 84, y = SAFE.y }) => {
  const idx = items.reduce((acc, h, i) => (frame >= h.from ? i : acc), -1);
  if (idx < 0) return null;
  const cur = items[idx];
  const prev = items[idx - 1];
  const fade = progress(frame, cur.from, cur.from + 5);
  const line = (style: React.CSSProperties, children: React.ReactNode) => (
    <div style={{ position: "absolute", left: SAFE.x, right: SAFE.x, top: y, display: "flex", justifyContent: "center", ...style }}>
      <div style={{ ...HEADING, fontSize: size, textAlign: "center" }}>{children}</div>
    </div>
  );
  return (
    <>
      {prev && prev.text && fade < 1 && line({ opacity: 1 - fade, filter: `blur(${fade * 10}px)`, transform: `translateY(${-fade * 24}px)` }, prev.text.replace(/\*/g, ""))}
      {cur.text && line({}, <Words text={cur.text} frame={frame} at={cur.from} />)}
    </>
  );
};

/** "Not this" mark from `at`: the word turns red, red [ ] brackets close in on its sides with a red fill behind it
 * (word white), then the fill fades away, leaving the red word in red brackets */
export const Strike: React.FC<{ frame: number; at: number; color?: string; children: React.ReactNode }> = ({ frame, at, color = K.red, children }) => {
  const red = progress(frame, at, at + 10);
  const br = springAt(frame, at + 8, SPRING.bouncy);
  const fill = ease.out(progress(frame, at + 14, at + 24)) * (1 - ease.inOut(progress(frame, at + 50, at + 64)));
  const ink = interpolateColors(red, [0, 1], [INK, color]);
  const bracket = (side: "l" | "r"): React.CSSProperties => ({
    position: "absolute",
    top: "-0.06em",
    bottom: "-0.06em",
    width: "0.2em",
    [side === "l" ? "left" : "right"]: "-0.32em",
    border: `0.075em solid ${color}`,
    [side === "l" ? "borderRight" : "borderLeft"]: "none",
    opacity: Math.min(1, br * 1.5),
    transform: `translateX(${(side === "l" ? -1 : 1) * (1 - br) * 0.4}em) scaleY(${0.6 + 0.4 * br})`,
  });
  return (
    <span style={{ position: "relative", display: "inline-block", margin: "0 0.34em" }}>
      <span style={{ position: "absolute", inset: "0.02em -0.06em", background: color, opacity: fill, transform: `scaleX(${0.4 + 0.6 * Math.min(1, fill * 2)})` }} />
      <span style={bracket("l")} />
      <span style={bracket("r")} />
      <span style={{ position: "relative", color: interpolateColors(fill, [0, 1], [ink, WHITE]) }}>{children}</span>
    </span>
  );
};

/** Huge centered heading; wrap the key word in <b> */
export const Big: React.FC<{ size?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ size = 120, style, children }) => (
  <div style={{ ...HEADING, fontSize: size, textAlign: "center", ...style }}>{children}</div>
);

/** Scene heading at the top of the safe zone that pops in at `at`; wrap the key word in <b> */
export const Header: React.FC<{ frame: number; at: number; top?: number; size?: number; children: React.ReactNode }> = ({ frame, at, top = SAFE.y, size = 68, children }) => {
  const p = springAt(frame, at, SPRING.bouncy);
  return <div style={{ ...HEADING, position: "absolute", left: SAFE.x, right: SAFE.x, top, textAlign: "center", fontSize: size, opacity: Math.min(1, p), transform: `translateY(${(1 - p) * 40}px)` }}>{children}</div>;
};

/** Paragraph (Raleway); wrap accent words in <b> */
export const Paragraph: React.FC<{ size?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ size = 40, style, children }) => (
  <div style={{ ...PARAGRAPH, fontSize: size, color: INK, ...style }}>{children}</div>
);
