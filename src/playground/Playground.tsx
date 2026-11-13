import React from "react";
import { AbsoluteFill, type CalculateMetadataFunction, Series, useCurrentFrame } from "remotion";
import { z } from "zod";
import "../fable/clock";
import { setClock } from "../fable/clock";
import { DotOrbitBg } from "../kit/DotOrbitBg";
import { INK, INTER, PARAGRAPH, SAFE } from "../kit/design";
import { tokens, useEnginePaint } from "../kit/reel";
import { ENTRIES, IDS, entryById, type Entry } from "../catalog/entries";

// Studio-only playground (never rendered), light mode only: every reusable component of the catalog.
// Pick one in the props panel (name). The big title on top is the component's name - use it when asking for style changes.
// Index with descriptions: src/catalog/CATALOG.md, demos: src/catalog/entries.tsx.

export const playgroundSchema = z.object({
  name: z.enum(IDS),
  safeZone: z.boolean(),
  title: z.boolean(),
});
export type PlaygroundProps = z.infer<typeof playgroundSchema>;

export const playgroundMetadata: CalculateMetadataFunction<PlaygroundProps> = ({ props }) => ({ durationInFrames: entryById(props.name).frames ?? 300 });

const GROUP: Record<Entry["group"], string> = { own: "свой", shared: "свой общий", remocn: "Remocn", tactile: "Tactile", shadcn: "shadcn", paper: "paper.design" };

const TactileGate: React.FC<{ frame: number }> = ({ frame }) => {
  useEnginePaint(frame);
  return null;
};

const SafeZone: React.FC = () => (
  <div style={{ position: "absolute", left: SAFE.x, right: SAFE.x, top: SAFE.y, bottom: SAFE.y, border: "2px dashed rgba(226, 85, 43, 0.55)", borderRadius: 8, pointerEvents: "none" }} />
);

/** Component name in the top margin (above the safe zone), so it never covers the demo */
const Title: React.FC<{ e: Entry }> = ({ e }) => {
  const n = ENTRIES.indexOf(e) + 1;
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: 26, display: "flex", flexDirection: "column", gap: 8, pointerEvents: "none" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
        <span style={{ fontFamily: `${INTER}, sans-serif`, fontWeight: 700, fontSize: 52, letterSpacing: "-0.03em", lineHeight: 1, color: INK }}>{e.id}</span>
        <span style={{ fontFamily: `${INTER}, sans-serif`, fontSize: 24, lineHeight: 1, color: "rgba(37, 27, 58, 0.5)" }}>
          {GROUP[e.group]} · {n}/{ENTRIES.length}
        </span>
      </div>
      <div style={{ ...PARAGRAPH, fontSize: 22, lineHeight: 1.25, color: "rgba(37, 27, 58, 0.6)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.use}</div>
    </div>
  );
};

export const Playground: React.FC<PlaygroundProps> = ({ name, safeZone, title }) => {
  const frame = useCurrentFrame();
  setClock(frame, 60);
  const e = entryById(name);
  const bg = e.bg ?? (e.group === "remocn" || e.group === "paper" ? "none" : "orbit");
  return (
    <AbsoluteFill style={{ ...tokens, background: "#fff", color: INK, fontFamily: PARAGRAPH.fontFamily, fontVariantNumeric: PARAGRAPH.fontVariantNumeric, WebkitFontSmoothing: "antialiased" }}>
      {bg === "orbit" && <DotOrbitBg />}
      {e.tactile && <TactileGate frame={frame} />}
      <AbsoluteFill>{e.render(frame)}</AbsoluteFill>
      {safeZone && <SafeZone />}
      {title && <Title e={e} />}
    </AbsoluteFill>
  );
};

// Showreel: every catalog component back-to-back (avatar with sample words first), no props to pick.
const ALL = [...ENTRIES.filter((e) => e.id === "tat-avatar"), ...ENTRIES.filter((e) => e.id !== "tat-avatar")];
// each demo capped at 2.5 s so the whole reel flies by (full length: Playground with name)
const len = (e: Entry) => Math.min(e.frames ?? 300, e.id === "tat-avatar" ? 300 : 150);
export const PLAYGROUND_ALL_FRAMES = ALL.reduce((n, e) => n + len(e), 0);

export const PlaygroundAll: React.FC = () => (
  <Series>
    {ALL.map((e) => (
      <Series.Sequence key={e.id} durationInFrames={len(e)} name={e.id}>
        <Playground name={e.id} safeZone={false} title />
      </Series.Sequence>
    ))}
  </Series>
);
