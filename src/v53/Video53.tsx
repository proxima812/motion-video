import React from "react";
import { AbsoluteFill } from "remotion";
import { DARK, DarkShell, Tex, texSize, type DarkScene, type TexDef } from "../kit/dark";
import { SPRING, ease, lerp, progress, springAt } from "../stage/motion";
import { TEX } from "./tex";
import { F, VO, at } from "./timeline";

// Video 53 - «Будущее уже влияет на тебя», 30 s cut. Only formulas on black: no words, no frames, no decorations.
// Fast montage: a hard cut every 0.3-2 s (18-120 frames, lengths vary), every shot a formula from a 3D camera of its own -
// wide, macro on the spoken part, low / high angle, side tilts, dutch, orbit, roll, pull-back. The spoken part is
// sharp, the rest racks out of focus; a few single glyphs are red; a far blurred formula behind gives depth. Emotional swings through the shot
// mood: quiet lows (dim, blurred, linear drift) against hits (glow, flash, glitch). No SFX. Hard cut at the end.

type St = React.CSSProperties;
const glowF = (k: number) => (k > 0.01 ? `drop-shadow(0 0 ${6 * k}px rgba(255,255,255,${0.9 * k})) drop-shadow(0 0 ${22 * k}px rgba(255,255,255,${0.45 * k}))` : undefined);

/* ───────── formulas: TeX parts, left to right on one baseline ───────── */

const FX = {
  hook: ["tf", "neq", "tp"],
  pfp: ["Pl", "wFut", "mid", "wPast", "rp"],
  rec: ["x1r", "eq", "fx"],
  imp: ["wPast", "imp", "wFut"],
  rimp: ["wPast", "rimp", "wFut"],
  dfdp: ["dfdp"],
  rev: ["t", "mapsto", "mt"],
  finv: ["finv"],
  xhat: ["xhat"],
  Et: ["Et"],
  gar: ["G", "to", "A", "to", "R"],
  plan: ["tf", "to", "atoday"],
  pol: ["at", "eq", "pi"],
  dadx: ["dadx", "neq", "zero"],
  util: ["uL", "eq", "uR"],
  sum: ["sum"],
  integ: ["integ"],
  best: ["astar", "eq", "argmax", "uR"],
  outs: ["a", "to", "set"],
  bell: ["Vs", "eq", "mx", "br", "gV", "rb"],
  gamma: ["gamma"],
  none: ["wFut", "eq", "empty"],
  dpda: ["dpda", "eq", "zero"],
  dpast: ["Dpast", "eq", "zero"],
  chain: ["future", "to", "present", "to", "past"],
  dp1: ["dp1", "neq", "zero"],
  dp1r: ["dp1r", "neq", "zero"],
  becomes: ["pt1", "eq", "prt"],
  last: ["tf", "lt", "tp"],
  lim: ["lim", "ft"],
  start: ["tstart", "ll", "tarr"],
} satisfies Record<string, (keyof typeof TEX)[]>;
type FxName = keyof typeof FX;
/** Secondary parts (arrows, relations) are light gray unless they are the accent. */
/** Rare red accent: one glyph per shot, a few shots per reel. */
const RED = "#FF2D2D";
const SECONDARY = new Set(["to", "imp", "rimp", "mapsto", "mid", "eq", "Pl", "rp"]);

/* ───────── camera presets: from -> to state inside one shot ───────── */

// tgt: look at the accent part ("focus", s = share of the macro fit) or the whole formula ("all", s = share of frame width);
// ox / oy: where that point sits on screen relative to the centre (off-centre framing)
type CamState = { tgt: "focus" | "all"; s: number; rx?: number; ry?: number; rz?: number; dx?: number; ox?: number; oy?: number };
type Preset = { a: CamState; b: CamState; spring?: boolean };
const CAMS = {
  wide: { a: { tgt: "all", s: 0.97 }, b: { tgt: "all", s: 1.06 } },
  push: { a: { tgt: "all", s: 0.85 }, b: { tgt: "all", s: 1.2 } },
  macro: { a: { tgt: "focus", s: 0.85, dx: -24 }, b: { tgt: "focus", s: 0.95, dx: 24 } },
  xmacro: { a: { tgt: "focus", s: 1.25 }, b: { tgt: "focus", s: 1.34 } },
  macroL: { a: { tgt: "focus", s: 0.85, ry: 38, ox: -40 }, b: { tgt: "focus", s: 0.92, ry: 22, ox: -40 } },
  macroR: { a: { tgt: "focus", s: 0.85, ry: -38, ox: 40 }, b: { tgt: "focus", s: 0.92, ry: -22, ox: 40 } },
  low: { a: { tgt: "all", s: 1.4, rx: 60, oy: 260 }, b: { tgt: "all", s: 1.4, rx: 42, oy: 220 } },
  high: { a: { tgt: "all", s: 1.35, rx: -56, oy: -300 }, b: { tgt: "all", s: 1.35, rx: -38, oy: -260 } },
  tiltL: { a: { tgt: "all", s: 1.3, ry: 58 }, b: { tgt: "all", s: 1.3, ry: 38 } },
  tiltR: { a: { tgt: "all", s: 1.3, ry: -58 }, b: { tgt: "all", s: 1.3, ry: -38 } },
  dutch: { a: { tgt: "focus", s: 0.8, rz: -15, oy: -240 }, b: { tgt: "focus", s: 0.88, rz: -9, oy: -240 } },
  dutchR: { a: { tgt: "focus", s: 0.8, rz: 13, oy: 260 }, b: { tgt: "focus", s: 0.88, rz: 7, oy: 260 } },
  swing: { a: { tgt: "all", s: 1.3, ry: -46 }, b: { tgt: "all", s: 1.3, ry: 46 } },
  orbit: { a: { tgt: "all", s: 1.35, rx: 48, ry: -44, oy: 160 }, b: { tgt: "all", s: 1.35, rx: 22, ry: -16, oy: 160 } },
  rise: { a: { tgt: "focus", s: 0.85, rx: 72 }, b: { tgt: "focus", s: 0.9, rx: 10 } },
  roll: { a: { tgt: "all", s: 1.9, rz: 90 }, b: { tgt: "all", s: 1.9, rz: 84 } },
  pull: { a: { tgt: "focus", s: 1.2 }, b: { tgt: "all", s: 1.0 } },
  flip: { a: { tgt: "all", s: 1.1, rz: -180 }, b: { tgt: "all", s: 1.1 }, spring: true },
  corner: { a: { tgt: "focus", s: 1.0, rz: -4, ox: -150, oy: -420 }, b: { tgt: "focus", s: 1.08, rz: -2, ox: -170, oy: -440 } },
  cornerR: { a: { tgt: "focus", s: 1.0, rz: 4, ox: 150, oy: 420 }, b: { tgt: "focus", s: 1.08, rz: 2, ox: 170, oy: 440 } },
} satisfies Record<string, Preset>;
type CamName = keyof typeof CAMS;

/* ───────── shot list: a cut every 0.3-2 s, accents on the spoken words ───────── */

type Mood = "hit" | "low";
type Shot = { f: number; fx: FxName; on?: string[]; cam: CamName; mood?: Mood; red?: string[] };
// cut lengths vary at random between 0.3 s and 2 s (18-120 frames); `red` = parts drawn in red (single glyphs)
const SHOTS: Shot[] = [
  // 1 «Ты думаешь, что прошлое определяет твоё будущее?» - from frame 0
  { f: 0, fx: "hook", cam: "push" },
  { f: 52, fx: "rec", cam: "tiltL" },
  { f: at(1, 1.24) - 2, fx: "pfp", on: ["wPast"], cam: "xmacro" },
  { f: 96, fx: "pfp", on: ["mid"], cam: "high" },
  { f: at(1, 1.88) - 2, fx: "imp", on: ["imp"], cam: "dutch" },
  { f: at(1, 2.92) - 2, fx: "hook", on: ["tf"], cam: "macroL", mood: "hit" },
  { f: 205, fx: "hook", on: ["tf"], cam: "pull" },
  // 2 «Иногда всё наоборот.»
  { f: 238, fx: "imp", cam: "low" },
  { f: 262, fx: "rev", on: ["t"], cam: "macroR" },
  { f: at(2, 0.92) - 2, fx: "rimp", on: ["rimp"], cam: "flip", mood: "hit", red: ["rimp"] },
  // 3 «Именно представление о будущем определяет то, что ты делаешь сегодня.»
  { f: 358, fx: "xhat", cam: "dutchR" },
  { f: at(3, 0.48) - 2, fx: "Et", cam: "tiltR" },
  { f: 436, fx: "gar", cam: "low" },
  { f: at(3, 1.6) - 2, fx: "gar", on: ["G"], cam: "xmacro", red: ["G"] },
  { f: 478, fx: "plan", on: ["tf"], cam: "tiltL" },
  { f: at(3, 2.28) - 1, fx: "pol", on: ["pi"], cam: "dutch" },
  { f: at(3, 3.48) - 3, fx: "gar", on: ["A"], cam: "macroL" },
  { f: 590, fx: "pol", on: ["at"], cam: "orbit" },
  { f: at(3, 4.2) - 2, fx: "plan", on: ["atoday"], cam: "xmacro", mood: "hit" },
  // 4 «Это не фантастика, а математика.» - one long dreamy low, then sharp on «математика»
  { f: 662, fx: "util", cam: "tiltL", mood: "low" },
  { f: at(4, 1.46) - 2, fx: "util", on: ["uR"], cam: "macroR", mood: "hit" },
  { f: 776, fx: "integ", cam: "high" },
  // 5 «Ты оцениваешь возможные результаты... и выбираешь шаг с учётом будущего, которого ещё нет.»
  { f: 815, fx: "best", on: ["uR"], cam: "wide" },
  { f: 838, fx: "outs", cam: "tiltR" },
  { f: at(5, 0.84) - 2, fx: "outs", on: ["set"], cam: "corner" },
  { f: 888, fx: "sum", cam: "roll" },
  { f: at(5, 1.51) - 2, fx: "outs", on: ["set"], cam: "low" },
  { f: 930, fx: "integ", cam: "macroL" },
  { f: at(5, 2.44) - 2, fx: "best", on: ["argmax"], cam: "dutch", mood: "hit" },
  { f: 985, fx: "best", on: ["astar"], cam: "tiltL" },
  { f: 1004, fx: "bell", cam: "orbit" },
  { f: at(5, 3.72) - 2, fx: "bell", on: ["gV"], cam: "macroR" },
  { f: 1062, fx: "gamma", cam: "high" },
  { f: at(5, 4.48) - 2, fx: "none", on: ["wFut"], cam: "swing", mood: "low" },
  { f: at(5, 5.24) - 2, fx: "none", on: ["empty"], cam: "xmacro", mood: "low", red: ["empty"] },
  // 6 «Ты не можешь изменить своё прошлое. Но можешь изменить то, каким оно станет.»
  { f: 1175, fx: "chain", cam: "push" },
  { f: at(6, 0.77) - 2, fx: "dpda", cam: "tiltR" },
  { f: 1246, fx: "dpast", on: ["zero"], cam: "dutchR", red: ["zero"] },
  { f: at(6, 1.53) - 2, fx: "chain", on: ["past"], cam: "high", mood: "low" },
  { f: at(6, 2.44) - 2, fx: "dp1", on: ["neq"], cam: "rise", mood: "hit" },
  { f: 1345, fx: "dp1r", cam: "tiltL" },
  { f: 1368, fx: "becomes", on: ["prt"], cam: "macroR" },
  { f: at(6, 3.52) - 1, fx: "dp1", on: ["dp1"], cam: "dutch" },
  { f: at(6, 4.04) - 2, fx: "becomes", on: ["pt1"], cam: "orbit" },
  { f: 1438, fx: "chain", on: ["present"], cam: "dutchR" },
  { f: at(6, 4.68) - 2, fx: "chain", on: ["past"], cam: "macroL", mood: "hit" },
  // 7 whisper «Возможно, твоё будущее начинается задолго до того, как наступает.» - a 2 s drift, then cuts
  { f: 1494, fx: "last", cam: "push", mood: "low" },
  { f: 1608, fx: "lim", on: ["ft"], cam: "macroR" },
  { f: at(7, 2.24) - 2, fx: "start", on: ["tstart"], cam: "tiltL" },
  { f: at(7, 2.92) - 2, fx: "start", on: ["ll"], cam: "rise", mood: "hit", red: ["ll"] },
  { f: at(7, 3.56) - 2, fx: "last", on: ["lt"], cam: "dutch" },
  { f: at(7, 4.2) - 2, fx: "last", on: ["tp"], cam: "macroL" },
];

/* ───────── layout + camera fit (pure, computed once) ───────── */

type Part = { id: string; key: string; t: TexDef; x: number; top: number; w: number; h: number };
type Box = { x0: number; y0: number; x1: number; y1: number };
const GAP = 0.28;
/** Parts left to right on one baseline, fitted into `maxW`, the whole formula centred on (540, 960). */
const layoutFx = (keys: readonly string[], maxW = 900, maxEm = 170) => {
  const defs = keys.map((k) => TEX[k as keyof typeof TEX] as TexDef);
  const units = defs.reduce((s, t) => s + Number(t.vb.split(" ")[2]) / 1000, 0) + GAP * (defs.length - 1);
  const em = Math.min(maxEm, maxW / units);
  let x = 540 - (units * em) / 2;
  const parts = defs.map((t, i) => {
    const { w, h } = texSize(t, em);
    const asc = (-Number(t.vb.split(" ")[1]) * em) / 1000;
    const p = { id: `${keys[i]}#${i}`, key: keys[i], t, x, top: -asc, w, h };
    x += w + GAP * em;
    return p;
  });
  const y0 = Math.min(...parts.map((p) => p.top));
  const y1 = Math.max(...parts.map((p) => p.top + p.h));
  const shift = 960 - (y0 + y1) / 2;
  return { em, parts: parts.map((p) => ({ ...p, top: p.top + shift })) as Part[] };
};
const boxOf = (ps: Part[]): Box => ({ x0: Math.min(...ps.map((p) => p.x)), y0: Math.min(...ps.map((p) => p.top)), x1: Math.max(...ps.map((p) => p.x + p.w)), y1: Math.max(...ps.map((p) => p.top + p.h)) });

type Cam = { x: number; y: number; s: number; rx: number; ry: number; rz: number; ox: number; oy: number };
const PERSP = 1200;
const R = Math.PI / 180;
/** Screen point of scene point (px, py) - the same math as the CSS transform in <Stage>. */
const project = (px: number, py: number, c: Cam): [number, number] | null => {
  const X = (px - c.x) * c.s;
  const Y = (py - c.y) * c.s;
  const X1 = X * Math.cos(c.ry * R);
  const Z1 = -X * Math.sin(c.ry * R);
  const Y2 = Y * Math.cos(c.rx * R) - Z1 * Math.sin(c.rx * R);
  const Z2 = Y * Math.sin(c.rx * R) + Z1 * Math.cos(c.rx * R);
  const X3 = X1 * Math.cos(c.rz * R) - Y2 * Math.sin(c.rz * R);
  const Y3 = X1 * Math.sin(c.rz * R) + Y2 * Math.cos(c.rz * R);
  if (PERSP - Z2 < 200) return null;
  const k = PERSP / (PERSP - Z2);
  return [540 + c.ox + X3 * k, 960 + c.oy + Y3 * k];
};
const fits = (b: Box, c: Cam) =>
  [[b.x0, b.y0], [b.x1, b.y0], [b.x0, b.y1], [b.x1, b.y1]].every(([x, y]) => {
    const p = project(x, y, c);
    return p !== null && p[0] >= 50 && p[0] <= 1030 && p[1] >= 200 && p[1] <= 1720;
  });
/** Camera for a preset state, shrunk until the accent (or the whole formula) stays inside the frame. */
const fitCam = (st: CamState, all: Box, foc: Box, accent: boolean): Cam => {
  // a wide angle on a formula with an accent keeps only the accent in frame - the blurred rest may bleed off
  const b = st.tgt === "focus" || accent ? foc : all;
  const bw = b.x1 - b.x0;
  const bh = b.y1 - b.y0;
  const macroFit = Math.min(3.6, 760 / bw, 700 / bh);
  const base = st.tgt === "focus" ? macroFit : accent ? Math.max(1, macroFit * 0.62) : 1;
  const c: Cam = { x: (b.x0 + b.x1) / 2 + (st.dx ?? 0), y: (b.y0 + b.y1) / 2, s: base * st.s, rx: st.rx ?? 0, ry: st.ry ?? 0, rz: st.rz ?? 0, ox: st.ox ?? 0, oy: st.oy ?? 0 };
  for (let i = 0; i < 40 && !fits(b, c); i++) c.s *= 0.95;
  return c;
};

const BG_OFF = [[-260, -520], [300, 560], [-340, 480], [280, -600], [0, 640], [-200, -640]];
const PLAN = SHOTS.map((sh, i) => {
  const end = SHOTS[i + 1]?.f ?? F.duration;
  const { em, parts } = layoutFx(FX[sh.fx]);
  const on = sh.on ?? null;
  const focParts = on ? parts.filter((p) => on.includes(p.key)) : parts;
  const all = boxOf(parts);
  const foc = boxOf(focParts);
  const pr: Preset = CAMS[sh.cam];
  // far formula behind for depth: the next different formula, on two shots of three
  const next = SHOTS.slice(i + 1).find((s) => s.fx !== sh.fx)?.fx ?? "hook";
  const bg = i % 3 !== 2 ? { ...layoutFx(FX[next], 2000, 420), off: BG_OFF[i % BG_OFF.length] } : null;
  return { ...sh, end, em, parts, on, a: fitCam(pr.a, all, foc, !!on), b: fitCam(pr.b, all, foc, !!on), spring: !!pr.spring, bg };
});
// every shot must be 0.3-2 s
const BAD = PLAN.filter((p) => p.end - p.f < 18 || p.end - p.f > 120);
if (BAD.length) throw new Error(`V53 shots out of 18-120 frames: ${BAD.map((p) => `${p.f}(${p.end - p.f})`).join(", ")}`);

/* ───────── render ───────── */

const tf3d = (c: Cam) => `rotateZ(${c.rz}deg) rotateX(${c.rx}deg) rotateY(${c.ry}deg) scale(${c.s}) translate(${540 - c.x}px, ${960 - c.y}px)`;
const mixCam = (a: Cam, b: Cam, t: number): Cam => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), s: lerp(a.s, b.s, t), rx: lerp(a.rx, b.rx, t), ry: lerp(a.ry, b.ry, t), rz: lerp(a.rz, b.rz, t), ox: lerp(a.ox, b.ox, t), oy: lerp(a.oy, b.oy, t) });
const Stage: React.FC<{ cam: Cam; children: React.ReactNode; style?: St }> = ({ cam, children, style }) => (
  <AbsoluteFill style={{ perspective: PERSP, perspectiveOrigin: "540px 960px", transform: cam.ox || cam.oy ? `translate(${cam.ox}px, ${cam.oy}px)` : undefined, ...style }}>
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transformOrigin: "540px 960px", transform: tf3d(cam) }}>{children}</div>
  </AbsoluteFill>
);

const Montage: React.FC<{ frame: number }> = ({ frame }) => {
  let i = 0;
  while (i < PLAN.length - 1 && frame >= PLAN[i + 1].f) i++;
  const p = PLAN[i];
  const lin = progress(frame, p.f, p.end);
  const t = p.spring ? Math.min(1, springAt(frame, p.f, SPRING.snappy)) : p.mood === "low" ? lin : ease.out(lin);
  const cam = mixCam(p.a, p.b, t);
  const low = p.mood === "low";
  const rack = 1 - progress(frame, p.f, p.f + 5); // the accent snaps into focus at the cut
  const glow = p.mood === "hit" ? 1 - progress(frame, p.f + 4, p.end + 6) : 0;
  const partStyle = (q: Part): St => {
    const accent = !p.on || p.on.includes(q.key);
    if (accent) {
      const blur = (low ? 3 : 0) + rack * 7;
      const filters = [blur > 0.05 ? `blur(${blur.toFixed(1)}px)` : "", glowF(glow) ?? ""].filter(Boolean).join(" ");
      return { opacity: low ? 0.55 : 1, filter: filters || undefined };
    }
    return { opacity: low ? 0.18 : 0.3, filter: `blur(${low ? 14 : 10}px)` };
  };
  const bgCam: Cam = { x: 540 - (p.bg?.off[0] ?? 0) - lin * 50, y: 960 - (p.bg?.off[1] ?? 0), s: 0.9 + 0.1 * t, rx: cam.rx * 0.5, ry: cam.ry * 0.5, rz: cam.rz * 0.5, ox: 0, oy: 0 };
  return (
    <>
      {p.bg && (
        <Stage cam={bgCam} style={{ opacity: low ? 0.1 : 0.16, filter: "blur(16px)" }}>
          {p.bg.parts.map((q) => (
            <div key={q.id} style={{ position: "absolute", left: q.x, top: q.top }}>
              <Tex t={q.t} em={p.bg!.em} color={DARK.gray} />
            </div>
          ))}
        </Stage>
      )}
      <Stage cam={cam}>
        {p.parts.map((q) => {
          const accent = !p.on || p.on.includes(q.key);
          return (
            <div key={q.id} style={{ position: "absolute", left: q.x, top: q.top, ...partStyle(q) }}>
              <Tex t={q.t} em={p.em} color={p.red?.includes(q.key) ? RED : SECONDARY.has(q.key) && !(p.on && accent) ? DARK.gray : DARK.white} />
            </div>
          );
        })}
      </Stage>
    </>
  );
};

const SCENES: DarkScene[] = [{ range: [0, F.duration], El: Montage }];

const HITS = SHOTS.filter((s) => s.mood === "hit").map((s) => s.f);
const LINE_CUTS = [238, 358, 662, 815, 1175, 1494];
const GLITCHES = [...LINE_CUTS, ...HITS, F.duration - 22, F.duration - 9];

export const Video53: React.FC = () => (
  <DarkShell scenes={SCENES} vo={VO} sfx={[]} duration={F.duration} glitches={GLITCHES} flashes={HITS} music="v53/music/bed.mp3" musicLevel={[0.2, 0.42]} />
);
