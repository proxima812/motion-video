import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { MapPin, type LucideIcon } from "lucide-react";
import { ease, lerp, progress } from "../../stage/motion";
import { HAND, INTER, RUSSO, SERIF } from "../../cover/CoverLab";
import { INK } from "../design";
import { QUAD_FIT } from "../quadFit";
import { makeTitle, plate, rgba } from "./shared";
import type { HostPreset, Palette } from "./types";

// Kamilya - «хранительница». Burgundy velvet with embroidered tulips. Continues her covers form-stamp / map:
// ruled paper, documents and forms with handwritten answers, round stamps, drawn maps with a dashed route.
// Motion: slow and cinematic - dissolves, slow push-ins, words settle from wide letter spacing, pauses.
// Telling: «раньше -> сейчас», the meaning of a tradition, a moral at the end. Measured pace.

export const KAMILYA_PALETTES: readonly Palette[] = [
  { name: "garnet", main: "#6E1630", vivid: "#A3264B", glow: "#E7A9BA", pale: "#F9ECEF", plate: plate("#B8355C", "#6E1630"), gray: "#EADDE0", muted: "#8A7378" },
  { name: "rose", main: "#8A3A50", vivid: "#C46A84", glow: "#F0C4D0", pale: "#FBF0F3", plate: plate("#D27C95", "#8A3A50"), gray: "#EEE0E4", muted: "#8F7A80" },
  { name: "olive", main: "#4E5A24", vivid: "#7D8B3A", glow: "#D3DBA8", pale: "#F4F6E8", plate: plate("#8E9C47", "#4E5A24"), gray: "#E3E6D6", muted: "#7C8068" },
];

const SLOW = { stiffness: 45, damping: 18 };

/** Words fade in slowly while their letter spacing settles from wide to tight; key words in the Prata serif */
const Title = makeTitle(SLOW, 8, (t, i, key, pal) => {
  const k = Math.min(1, Math.max(0, t));
  return {
    opacity: ease.inOut(k),
    letterSpacing: `${0.18 * (1 - k) - (key ? 0.01 : 0.03)}em`,
    filter: k < 0.98 ? `blur(${(1 - k) * 6}px)` : undefined,
    ...(key ? { fontFamily: SERIF, fontWeight: 400, color: pal.main } : null),
  };
});

/** Form-cover background: warm paper with ruled lines and a soft vignette; the paper breathes very slowly */
const Bg: React.FC<{ pal: Palette }> = ({ pal }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, #FFFDF8 0%, ${pal.pale} 100%)` }}>
      <AbsoluteFill style={{ backgroundImage: `linear-gradient(${rgba(pal.main, 0.09)} 2px, transparent 2px)`, backgroundSize: "100% 56px", backgroundPosition: `0 ${(frame * 0.15) % 56}px` }} />
      <AbsoluteFill style={{ left: 96, width: 3, background: rgba(pal.vivid, 0.22) }} />
      <AbsoluteFill style={{ background: `radial-gradient(120% 80% at 50% 40%, transparent 55%, ${rgba(pal.main, 0.12)} 100%)` }} />
    </AbsoluteFill>
  );
};

/* ───────── Elements (form-stamp / map cover language, slow) ───────── */

/** slow 0..1 over `len` frames from `at` */
const slow = (frame: number, at: number, len = 26) => ease.inOut(progress(frame, at, at + len));
const PAPER = "#FFFDF7";
const LINE = "#CBD3E1";

export const TULIP_PATH = "M20 4C14 10 12 18 14 26c-4-4-10-5-14-3 2 8 9 14 18 14h4c9 0 16-6 18-14-4-2-10-1-14 3 2-8 0-16-6-22Z";
/** Embroidered tulip (the tatar ornament on her velvet): grows from its stem base, `grow` 0..1 */
export const TulipMark: React.FC<{ size: number; color: string; leaf?: string; grow?: number; style?: React.CSSProperties }> = ({ size, color, leaf, grow = 1, style }) => (
  <svg viewBox="0 0 40 64" width={size} height={size * 1.6} style={{ overflow: "visible", ...style }}>
    <g style={{ transformOrigin: "20px 62px", transform: `scale(${grow})` }}>
      <path d="M20 40 V62" stroke={leaf ?? color} strokeWidth={3} strokeLinecap="round" />
      <path d="M20 56 C 10 54 6 46 6 40 C 14 42 18 48 20 56 Z M20 52 C 30 50 34 44 34 38 C 26 40 22 46 20 52 Z" fill={leaf ?? color} opacity={0.85} />
      <path d={TULIP_PATH} fill={color} />
    </g>
  </svg>
);

/** A quote in the Prata serif, line by line; *key* words in pal.main; a line with `strike` gets crossed and dims.
 *  No quote marks (no punctuation on screen): a short garnet rule draws above instead. */
export const SerifQuote: React.FC<{ frame: number; pal: Palette; lines: { text: string; at: number; strike?: number }[]; y: number; size?: number }> = ({ frame, pal, lines, y, size = 104 }) => {
  const rule = slow(frame, lines[0]?.at ?? 0, 30);
  return (
    <div style={{ position: "absolute", left: 100, right: 100, top: y, display: "flex", flexDirection: "column", alignItems: "center", gap: size * 0.22 }}>
      <div style={{ width: 140, height: 4, borderRadius: 2, background: pal.vivid, transform: `scaleX(${rule})`, marginBottom: size * 0.2 }} />
      {lines.map((l, i) => {
        const t = slow(frame, l.at, 30);
        const cross = l.strike === undefined ? 0 : ease.out(progress(frame, l.strike, l.strike + 14));
        return (
          <div key={i} style={{ position: "relative", fontFamily: SERIF, fontSize: size, lineHeight: 1.08, color: INK, textAlign: "center", opacity: t * (1 - 0.55 * cross), letterSpacing: `${0.14 * (1 - t) - 0.01}em`, filter: t < 1 ? `blur(${(1 - t) * 6}px)` : undefined }}>
            {l.text.split(/(\*[^*]+\*)/).map((part, k) => (part.startsWith("*") ? <span key={k} style={{ color: pal.main }}>{part.slice(1, -1)}</span> : <React.Fragment key={k}>{part}</React.Fragment>))}
            {l.strike !== undefined && <span style={{ position: "absolute", left: -12, right: -12, top: "56%", height: 7, borderRadius: 4, background: pal.vivid, transformOrigin: "0 50%", transform: `scaleX(${cross})` }} />}
          </div>
        );
      })}
    </div>
  );
};

/** Round stamp that thumps onto the page at `at` (2.4x -> 1x in 8 frames, a tiny shake), double ring, Russo One text */
export const Stamp: React.FC<{ frame: number; at: number; pal: Palette; text: string; x: number; y: number; size?: number; rot?: number; color?: string }> = ({ frame, at, pal, text, x, y, size = 250, rot = -14, color }) => {
  if (frame < at) return null;
  const c = color ?? pal.vivid;
  const hit = ease.in(progress(frame, at, at + 8));
  const shake = frame - at > 8 && frame - at < 16 ? Math.sin((frame - at) * 2.4) * 3 * (1 - (frame - at - 8) / 8) : 0;
  return (
    <div style={{ position: "absolute", left: x - size / 2, top: y - size / 2, width: size, height: size, borderRadius: "50%", border: `${size * 0.035}px solid ${c}`, boxShadow: `inset 0 0 0 ${size * 0.025}px rgba(255,255,255,0.6), inset 0 0 0 ${size * 0.045}px ${c}`, display: "flex", alignItems: "center", justifyContent: "center", transform: `translate(${shake}px, ${shake * 0.5}px) rotate(${rot}deg) scale(${lerp(2.4, 1, hit)})`, opacity: lerp(0, 0.92, hit), zIndex: 6 }}>
      <div style={{ fontFamily: RUSSO, fontSize: size * (text.length > 7 ? 0.15 : 0.19), lineHeight: 1.05, color: c, letterSpacing: "0.04em", textAlign: "center", padding: size * 0.12 }}>{text}</div>
    </div>
  );
};

/** Tilted paper form (FormCover): a spaced header, rows with a checkbox (✓ / ✕), the question and a handwritten answer
 *  that writes itself left to right at `write` (HAND with an Inter fallback for Tatar letters) */
export const FormCard: React.FC<{ frame: number; pal: Palette; at: number; header: string; rows: { q: string; a: string; ok?: boolean; at: number; write: number }[]; y: number; w?: number; rot?: number }> = ({ frame, pal, at, header, rows, y, w = 840, rot = -2.5 }) => {
  const t = slow(frame, at, 30);
  return (
    <div style={{ position: "absolute", left: 540 - w / 2, top: y, width: w, boxSizing: "border-box", transform: `rotate(${rot}deg) translateY(${(1 - t) * 30}px)`, opacity: t, background: PAPER, borderRadius: 20, padding: "40px 48px", boxShadow: `0 30px 60px -24px ${rgba(pal.main, 0.45)}` }}>
      <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 30, letterSpacing: "0.22em", color: "#7A869A", marginBottom: 18 }}>{header}</div>
      {rows.map((r, i) => {
        const row = slow(frame, r.at, 22);
        const pen = progress(frame, r.write, r.write + 24);
        const mark = progress(frame, r.write + 20, r.write + 30);
        return (
          <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 18, borderBottom: `2px dashed ${LINE}`, padding: "16px 0", opacity: row }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, border: `3px solid ${INK}`, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: INTER, fontSize: 28, lineHeight: 1, fontWeight: 800, color: r.ok === false ? "#E5484D" : pal.vivid }}>
              <span style={{ opacity: mark, transform: `scale(${0.5 + 0.5 * mark})` }}>{r.ok === false ? "✕" : "✓"}</span>
            </div>
            <div style={{ fontFamily: INTER, fontWeight: 500, fontSize: 42, color: INK, flex: 1 }}>{r.q}</div>
            <div style={{ fontFamily: `${HAND}, ${INTER}`, fontWeight: 700, fontSize: 60, color: pal.main, whiteSpace: "nowrap", clipPath: `inset(-20% ${(1 - pen) * 100}% -20% -5%)` }}>{r.a}</div>
          </div>
        );
      })}
    </div>
  );
};

/** Two panels side by side: «раньше» on the left, «сейчас» on the right (any labels); the right one and the thin arrow
 *  between them come in slowly at right.at. Labels in the serif. */
export const BeforeAfter: React.FC<{ frame: number; pal: Palette; y: number; h?: number; left: { label: string; at: number; children: React.ReactNode }; right: { label: string; at: number; children: React.ReactNode } }> = ({ frame, pal, y, h = 620, left, right }) => {
  const a = slow(frame, left.at, 30);
  const b = slow(frame, right.at, 30);
  const W = 400;
  const panel = (t: number, x: number, label: string, children: React.ReactNode, dim: boolean) => (
    <div style={{ position: "absolute", left: x, top: y, width: W, height: h, opacity: t, transform: `scale(${1.03 - 0.03 * t})` }}>
      <div style={{ fontFamily: SERIF, fontSize: 60, lineHeight: 1, color: dim ? pal.muted : pal.main, textAlign: "center", marginBottom: 24 }}>{label}</div>
      <div style={{ position: "relative", height: h - 84, borderRadius: 32, background: dim ? "#F4F1EC" : PAPER, boxShadow: `0 26px 50px -26px ${rgba(pal.main, 0.4)}`, overflow: "hidden" }}>{children}</div>
    </div>
  );
  return (
    <>
      {panel(a, 540 - W - 30, left.label, left.children, false)}
      {panel(b, 540 + 30, right.label, right.children, true)}
      <svg width={60} height={40} viewBox="0 0 60 40" style={{ position: "absolute", left: 510, top: y + h / 2 + 20, opacity: b }}>
        <path d="M6 20 H48 M38 10 L50 20 L38 30" stroke={pal.vivid} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - b} />
      </svg>
    </>
  );
};

/** A drawn map (MapCover): land, a river, blocks, roads; a dashed route draws itself over `draw` and a pin drops at its end */
export const MapRoute: React.FC<{ frame: number; pal: Palette; at: number; draw: readonly [number, number]; y: number; h?: number; pin?: LucideIcon }> = ({ frame, pal, at, draw, y, h = 700, pin: Pin = MapPin }) => {
  const t = slow(frame, at, 30);
  const d = ease.inOut(progress(frame, draw[0], draw[1]));
  const drop = slow(frame, draw[1] - 4, 16);
  const W = 880;
  const id = React.useId().replace(/:/g, "");
  const route = `M${W * 0.12} ${h * 0.88} C ${W * 0.14} ${h * 0.6}, ${W * 0.42} ${h * 0.66}, ${W * 0.44} ${h * 0.42} S ${W * 0.7} ${h * 0.2}, ${W * 0.8} ${h * 0.2}`;
  return (
    <div style={{ position: "absolute", left: 540 - W / 2, top: y, width: W, height: h, borderRadius: 40, overflow: "hidden", background: "#EEF3E6", opacity: t, boxShadow: `0 30px 60px -30px ${rgba(pal.main, 0.5)}` }}>
      <svg width={W} height={h} style={{ position: "absolute", inset: 0 }}>
        <path d={`M-40 ${h * 0.62} C 160 ${h * 0.5}, 300 ${h * 0.78}, ${W * 0.55} ${h * 0.64} S ${W * 0.9} ${h * 0.48}, ${W + 40} ${h * 0.58}`} stroke="#A9D4F0" strokeWidth={56} fill="none" />
        {Array.from({ length: 16 }, (_, i) => <rect key={i} x={(i % 4) * 230 + 20 + ((i * 37) % 30)} y={Math.floor(i / 4) * 190 - 40 + ((i * 53) % 40)} width={150} height={120} rx={16} fill="#fff" opacity={0.7} />)}
        <path d={`M-20 ${h * 0.3} H${W + 20} M${W * 0.3} -20 V${h + 20} M${W * 0.72} -20 V${h + 20}`} stroke="#fff" strokeWidth={22} />
        <defs>
          <mask id={`route${id}`}>
            <path d={route} stroke="#fff" strokeWidth={30} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - d} />
          </mask>
        </defs>
        <path d={route} stroke={pal.vivid} strokeWidth={10} strokeDasharray="4 22" strokeLinecap="round" fill="none" mask={`url(#route${id})`} />
      </svg>
      <div style={{ position: "absolute", left: W * 0.8 - 50, top: h * 0.2 - 100 - (1 - drop) * 60, opacity: drop }}>
        <Pin size={100} color="#fff" fill={pal.vivid} strokeWidth={1.5} style={{ filter: "drop-shadow(0 12px 12px rgba(0,0,0,0.25))" }} />
      </div>
    </div>
  );
};

export const KAMILYA: HostPreset = {
  id: "kamilya",
  name: "Камиля",
  role: "хранительница",
  palettes: KAMILYA_PALETTES,
  covers: ["form-stamp", "map"],
  tags: ["[measured]", "[warm]", "[serious]", "[quietly]"],
  fit: QUAD_FIT.kamilya,
  motion: {
    spring: SLOW,
    stagger: 8,
    // slow fade with a settle from 1.04
    enter: (frame, at) => {
      const t = ease.inOut(progress(frame, at, at + 26));
      return { opacity: t, transform: `scale(${1.04 - 0.04 * t})`, filter: t < 1 ? `blur(${(1 - t) * 6}px)` : undefined };
    },
    exit: (frame, at) => {
      const o = ease.inOut(progress(frame, at, at + 20));
      return o <= 0 ? {} : { opacity: 1 - o };
    },
    // 24-frame dissolve
    scene: (frame, [a, b]) => {
      const t = a === 0 ? 1 : ease.inOut(progress(frame, a - 12, a + 12));
      const out = ease.inOut(progress(frame, b - 12, b + 12));
      return { opacity: t * (1 - out) };
    },
    scenePad: [12, 12],
    drift: 0.045,
  },
  Title,
  Bg,
  Showcase: ({ frame, pal }) => (
    <AbsoluteFill>
      <Title text="бабушкин *сундук*" frame={frame} at={10} pal={pal} top={200} size={100} />
      <FormCard frame={frame} pal={pal} at={40} header="ОПИСЬ" y={380} rows={[{ q: "полотенце", a: "сложено", at: 60, write: 90 }, { q: "тюльпаны", a: "24", at: 110, write: 140 }, { q: "на виду", a: "нет", ok: false, at: 160, write: 190 }]} />
      <Stamp frame={frame} at={240} pal={pal} text="АРХИВ" x={870} y={930} size={190} />
      <SerifQuote frame={frame} pal={pal} y={1020} size={84} lines={[{ text: "традиция живет", at: 280 }, { text: "пока *на виду*", at: 320 }]} />
      <MapRoute frame={frame} pal={pal} at={380} draw={[400, 470]} y={1340} h={460} />
    </AbsoluteFill>
  ),
};
