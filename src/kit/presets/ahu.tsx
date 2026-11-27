import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { CalendarDays, type LucideIcon } from "lucide-react";
import { SPRING, ease, lerp, progress, springAt } from "../../stage/motion";
import { GridPattern, INTER, Sparkles, UNB, grad } from "../../cover/CoverLab";
import { INK, SURFACE } from "../design";
import { QUAD_FIT } from "../quadFit";
import { makeTitle, plate, rgba, tint } from "./shared";
import type { HostPreset, Palette } from "./types";

// Ahu - «эксперт». Black blazer, emerald kalfak with gold. Continues her covers timer / giant-number:
// white -> pale -> glow gradient, a grid, a ripple from the bottom, sparkles; huge gradient numbers, struck small values.
// Motion: clear and fast - words rise from under a mask, cuts on the beat with a small punch-in.
// Telling: thesis -> fact / number -> short conclusion.

export const AHU_PALETTES: readonly Palette[] = [
  { name: "emerald", main: "#0F5E45", vivid: "#1E8C64", glow: "#9FD9BF", pale: "#E8F5EF", plate: plate("#2AA176", "#0F5E45"), gray: "#DCE7E2", muted: "#6F837B" },
  { name: "gold", main: "#7A5A12", vivid: "#C9962B", glow: "#EED9A4", pale: "#FBF4E2", plate: plate("#D4A440", "#8C6714"), gray: "#ECE4D2", muted: "#8C7F64" },
  { name: "forest", main: "#22433A", vivid: "#3E7A68", glow: "#B9D8CC", pale: "#EEF4F1", plate: plate("#4E8C78", "#22433A"), gray: "#DDE6E2", muted: "#6E7F79" },
];

const SPR = SPRING.snappy;

/** Words rise from under a mask; key words 700 in a vivid -> main gradient with a thin rule drawn under them */
const Title = makeTitle(
  SPR,
  2,
  (t, i, key, pal) => ({
    clipPath: "inset(-10% -4% -22% -4%)",
    transform: `translateY(${(1 - Math.min(t, 1)) * 0.9}em)`,
    opacity: t > 0 ? 1 : 0,
    fontWeight: key ? 700 : 400,
    ...(key ? grad(`linear-gradient(180deg, ${pal.vivid}, ${pal.main})`) : null),
  }),
  (t, i, key, pal) =>
    key ? <span style={{ position: "absolute", left: 0, right: 0, bottom: "-0.06em", height: 5, borderRadius: 3, background: pal.vivid, transformOrigin: "0 50%", transform: `scaleX(${ease.out(Math.max(0, Math.min(1, (t - 0.6) / 0.4)))})` }} /> : null,
);

/** Timer-cover background: white -> pale -> glow, a grid around the content, ripple rings rising from the host, twinkling sparkles */
const Bg: React.FC<{ pal: Palette }> = ({ pal }) => {
  const frame = useCurrentFrame();
  const RING = 150; // a new ring every 150 frames, rings grow and fade
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, #FFFFFF 0%, ${pal.pale} 62%, ${tint(pal.glow, 0.7)} 100%)`, overflow: "hidden" }}>
      <GridPattern color={tint(pal.vivid, 0.14)} at="50% 30%" />
      {Array.from({ length: 6 }, (_, i) => {
        const age = ((frame + i * RING) % (RING * 6)) / (RING * 6);
        const r = 200 + age * 900;
        return <div key={i} style={{ position: "absolute", left: 540 - r, top: 1700 - r, width: r * 2, height: r * 2, borderRadius: "50%", border: `2px solid ${rgba(pal.vivid, 0.3)}`, opacity: Math.sin(age * Math.PI) }} />;
      })}
      {[[150, 640, 40, 0], [930, 560, 32, 40], [880, 980, 24, 80], [200, 1100, 28, 120]].map(([x, y, s, ph], i) => (
        <AbsoluteFill key={i} style={{ opacity: 0.35 + 0.35 * Math.sin((frame + ph) / 24) }}>
          <Sparkles color={pal.vivid} items={[[x, y, s]]} />
        </AbsoluteFill>
      ))}
    </AbsoluteFill>
  );
};

/* ───────── Elements (timer / giant-number cover language) ───────── */

const STRUCK_RED = "#E5484D";
/** mask slide-up used by every Ahu element */
const rise = (frame: number, at: number) => {
  const t = Math.min(1, springAt(frame, at, SPR));
  return { t, style: { opacity: t > 0 ? 1 : 0, clipPath: `inset(${(1 - t) * 100}% -10% -30% -10%)`, transform: `translateY(${(1 - t) * 40}px)` } as React.CSSProperties };
};

/** Huge Unbounded 900 gradient number counting from `from` to `to` over `dur` frames from `at` (it rises at `appear`, default `at`);
 *  `suffix` = glued in the same type (":00" -> a time), `unit` = smaller word after it */
export const GiantNumber: React.FC<{ frame: number; at: number; pal: Palette; to: number; from?: number; dur?: number; appear?: number; suffix?: string; unit?: string; size?: number; y: number; x?: number }> = ({ frame, at, pal, to, from = 0, dur = 40, appear, suffix = "", unit, size = 300, y, x = 540 }) => {
  const r = rise(frame, appear ?? at);
  const v = Math.round(lerp(from, to, ease.out(progress(frame, at, at + dur))));
  const land = springAt(frame, at + dur, SPRING.bouncy); // a small kick when the count lands
  const kick = frame >= at + dur ? 1 + 0.06 * Math.sin(Math.min(1, land) * Math.PI) : 1;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: "max-content", transform: `translateX(-50%) scale(${kick})`, transformOrigin: "50% 60%" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: size * 0.08, whiteSpace: "nowrap", ...r.style }}>
      <span style={{ fontFamily: UNB, fontWeight: 900, fontSize: size, letterSpacing: "-0.06em", lineHeight: 1, fontVariantNumeric: "tabular-nums", ...grad(`linear-gradient(180deg, ${pal.vivid} 10%, ${pal.main} 70%)`) }}>{v}{suffix}</span>
      {unit && <span style={{ fontFamily: UNB, fontWeight: 700, fontSize: size * 0.3, color: pal.main, letterSpacing: "-0.03em" }}>{unit}</span>}
      </div>
    </div>
  );
};

/** A struck small value (gray, a red line draws through it at `strikeAt`) that gives way to a giant gradient value at `bigAt` (TimerCover);
 *  without `big` it is just a word that gets struck out */
export const StruckToBig: React.FC<{ frame: number; pal: Palette; struck: string; big?: string; at: number; strikeAt: number; bigAt?: number; y: number; bigSize?: number; struckSize?: number }> = ({ frame, pal, struck, big, at, strikeAt, bigAt = Infinity, y, bigSize = 220, struckSize = 84 }) => {
  const a = rise(frame, at);
  const line = ease.out(progress(frame, strikeAt, strikeAt + 10));
  const b = rise(frame, bigAt);
  const shrink = big ? ease.inOut(progress(frame, bigAt, bigAt + 14)) : 0;
  return (
    <>
      <div style={{ position: "absolute", left: 540, top: y - shrink * 30, width: "max-content", transform: `translateX(-50%) scale(${1 - shrink * 0.25})`, whiteSpace: "nowrap" }}>
        <div style={a.style}>
        <span style={{ position: "relative", display: "inline-block", fontFamily: UNB, fontWeight: 500, fontSize: struckSize, color: "#B3A7A2", letterSpacing: "-0.03em", lineHeight: 1 }}>
          {struck}
          <span style={{ position: "absolute", left: -10, right: -10, top: "52%", height: 9, borderRadius: 5, background: STRUCK_RED, transformOrigin: "0 50%", transform: `scaleX(${line})` }} />
        </span>
        </div>
      </div>
      {big && b.t > 0 && (
        <div style={{ position: "absolute", left: 540, top: y + 90, width: "max-content", transform: "translateX(-50%)", whiteSpace: "nowrap" }}>
          <div style={b.style}>
            <span style={{ fontFamily: UNB, fontWeight: 900, fontSize: bigSize, letterSpacing: "-0.05em", lineHeight: 1, ...grad(`linear-gradient(180deg, ${pal.vivid}, ${pal.main})`) }}>{big}</span>
          </div>
        </div>
      )}
    </>
  );
};

/** A drawn check in a rounded square: the box appears at `at`, the tick draws at `check` */
export const CheckBox: React.FC<{ frame: number; at: number; check: number; pal: Palette; size?: number }> = ({ frame, at, check, pal, size = 64 }) => {
  const box = springAt(frame, at, SPR);
  const tick = ease.out(progress(frame, check, check + 12));
  const filled = progress(frame, check, check + 4);
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" style={{ flex: "none", transform: `scale(${0.6 + 0.4 * Math.min(1, box)})` }}>
      <rect x={4} y={4} width={56} height={56} rx={16} fill={filled > 0 ? pal.vivid : "#fff"} stroke={filled > 0 ? pal.vivid : pal.gray} strokeWidth={5} />
      <path d="M17 33 L28 44 L47 21" fill="none" stroke="#fff" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - tick} />
    </svg>
  );
};

/** Rows on one white card; each row rises at `at`, its box gets a drawn check at `check`. No icons per row (one icon per frame). */
export const Checklist: React.FC<{ frame: number; pal: Palette; rows: { text: string; at: number; check: number; note?: string }[]; y: number; width?: number; size?: number }> = ({ frame, pal, rows, y, width = 820, size = 58 }) => {
  const card = rise(frame, rows[0]?.at ?? 0);
  return (
    <div style={{ position: "absolute", left: 540 - width / 2, top: y, width, ...SURFACE, borderRadius: 40, padding: 36, boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 10, ...card.style }}>
      {rows.map((r, i) => {
        const row = rise(frame, r.at);
        const done = progress(frame, r.check, r.check + 8);
        const h = (size + 46) * row.t; // the card grows with each new row
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 28, padding: `${18 * row.t}px 8px`, height: h, boxSizing: "border-box", overflow: "hidden", borderTop: i && row.t > 0 ? `2px dashed ${pal.gray}` : undefined, marginTop: i ? -10 * (1 - row.t) : 0, ...row.style }}>
            <CheckBox frame={frame} at={r.at} check={r.check} pal={pal} />
            <span style={{ fontFamily: INTER, fontWeight: 500, fontSize: size, lineHeight: 1, color: INK, flex: 1, letterSpacing: "-0.02em", opacity: 0.55 + 0.45 * done }}>{r.text}</span>
            {r.note && <span style={{ fontFamily: UNB, fontWeight: 700, fontSize: size * 0.7, lineHeight: 1, color: done > 0 ? pal.main : pal.gray }}>{r.note}</span>}
          </div>
        );
      })}
    </div>
  );
};

/** Main-colored pill with one lucide icon and white Inter 700 text (GiantNumberCover chip) */
export const FactChip: React.FC<{ frame: number; at: number; pal: Palette; icon?: LucideIcon; text: string; y: number; x?: number; size?: number }> = ({ frame, at, pal, icon: I = CalendarDays, text, y, x = 540, size = 46 }) => {
  const t = springAt(frame, at, SPRING.bouncy);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: "max-content", transform: `translateX(-50%) scale(${0.6 + 0.4 * Math.min(t, 1.08)})`, opacity: Math.min(1, t * 2), display: "flex", alignItems: "center", gap: 16, background: pal.main, color: "#fff", fontFamily: INTER, fontWeight: 700, fontSize: size, lineHeight: 1, padding: `${size * 0.36}px ${size * 0.8}px`, borderRadius: 999, whiteSpace: "nowrap", boxShadow: `0 20px 40px -18px ${tint(pal.main, 0.7)}` }}>
      <I size={size} color="#fff" strokeWidth={2.2} /> {text}
    </div>
  );
};

export const AHU: HostPreset = {
  id: "ahu",
  name: "Ahu",
  role: "эксперт",
  palettes: AHU_PALETTES,
  covers: ["giant-number", "timer"],
  tags: ["[confident]", "[measured]", "[warm]", "[curious]"],
  fit: QUAD_FIT.ahu,
  motion: {
    spring: SPR,
    stagger: 2,
    // slide up from under a mask, no blur
    enter: (frame, at) => {
      const t = Math.min(1, springAt(frame, at, SPR));
      return { opacity: t > 0 ? 1 : 0, clipPath: `inset(${(1 - t) * 100}% 0 -20% 0)`, transform: `translateY(${(1 - t) * 40}px)` };
    },
    exit: (frame, at) => {
      const o = progress(frame, at, at + 6);
      return o <= 0 ? {} : { opacity: 1 - o, transform: `translateY(${-o * 40}px)` };
    },
    // a cut with a small punch-in (1.05 -> 1 in 10 frames), out in 4 frames
    scene: (frame, [a, b]) => {
      const p = a === 0 ? 1 : ease.outExpo(progress(frame, a, a + 10));
      const out = progress(frame, b, b + 4);
      return { opacity: (frame >= a ? 1 : 0) * (1 - out), transform: `scale(${1.05 - 0.05 * p})` };
    },
    scenePad: [0, 4],
    drift: 0,
  },
  Title,
  Bg,
  Showcase: ({ frame, pal }) => (
    <AbsoluteFill>
      <Title text="пять минут *в день*" frame={frame} at={10} pal={pal} top={230} size={96} />
      <StruckToBig frame={frame} pal={pal} struck="12 ч" big="30 ч" at={40} strikeAt={80} bigAt={100} y={420} />
      <FactChip frame={frame} at={150} pal={pal} text="за год" y={790} />
      <Checklist frame={frame} pal={pal} y={950} rows={[{ text: "слово утром", at: 200, check: 240, note: "1" }, { text: "песня в дороге", at: 260, check: 300, note: "3" }, { text: "фраза маме", at: 320, check: 360, note: "1" }]} />
    </AbsoluteFill>
  ),
};
