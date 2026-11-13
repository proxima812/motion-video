import React from "react";
import { interpolateColors } from "remotion";
import { X } from "lucide-react";
import { SPRING, ease, progress, springAt } from "../../stage/motion";
import { HEADING, INK, PARAGRAPH, SAFE, WHITE } from "../../kit/design";
import { K } from "../../kit/reel";

// default accent for Mark (the reels' violet); pass the video's accent via color
const ACCENT_VIOLET = "#6E33CC";

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

/** Accent mark from `at`: phone-style text selection - thin bars with filled dots (left dot on top, right at the bottom)
 * sweep from the start to the end of the word, then handles, word and a soft fill turn `color` (default the accent violet) */
export const Mark: React.FC<{ frame: number; at: number; color?: string; children: React.ReactNode }> = ({ frame, at, color = ACCENT_VIOLET, children }) => {
  const show = Math.min(1, springAt(frame, at, SPRING.snappy) * 1.5);
  const sweep = ease.inOut(progress(frame, at + 4, at + 20));
  const tint = ease.inOut(progress(frame, at + 24, at + 34));
  const c = interpolateColors(tint, [0, 1], [INK, color]);
  const fill = `color-mix(in srgb, ${c} ${Math.round(10 + tint * 6)}%, transparent)`;
  const bar = (left: string): React.CSSProperties => ({ position: "absolute", left, top: "0.02em", bottom: "-0.02em", width: "0.035em", marginLeft: "-0.0175em", background: c, opacity: show });
  const dot = (side: "top" | "bottom"): React.CSSProperties => ({ position: "absolute", left: "50%", [side]: "-0.15em", width: "0.16em", height: "0.16em", marginLeft: "-0.08em", borderRadius: "50%", background: c });
  return (
    <span style={{ position: "relative", display: "inline-block", margin: "0 0.08em" }}>
      <span style={{ position: "absolute", left: "-0.04em", top: "0.02em", bottom: "-0.02em", width: `calc((100% + 0.08em) * ${sweep})`, background: fill }} />
      <span style={bar("-0.04em")}>
        <span style={dot("top")} />
      </span>
      <span style={bar(`calc(-0.04em + (100% + 0.08em) * ${sweep})`)}>
        <span style={dot("bottom")} />
      </span>
      <span style={{ position: "relative", color: c }}>{children}</span>
    </span>
  );
};

/** "No / not this": the Mark selection in red, then a red cross pops in next to the word */
export const Strike: React.FC<{ frame: number; at: number; color?: string; children: React.ReactNode }> = ({ frame, at, color = K.red, children }) => {
  const x = springAt(frame, at + 30, SPRING.bouncy);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.18em" }}>
      <Mark frame={frame} at={at} color={color}>
        {children}
      </Mark>
      <X size="0.75em" strokeWidth={3.2} color={color} style={{ flex: "none", opacity: Math.min(1, x * 1.5), transform: `scale(${x}) rotate(${(1 - Math.min(x, 1)) * -90}deg)` }} />
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
