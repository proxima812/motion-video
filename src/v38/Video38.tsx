import React from "react";
import { AbsoluteFill } from "remotion";
import { MessageCircle, Music } from "lucide-react";
import { SPRING, ease, lerp, progress, springAt } from "../stage/motion";
import { ReelShell, pop, type SceneDef, type Sfx } from "../kit/reel";
import { TatAvatar, type AvatarKey, type Emotion, type StanceKey } from "../kit/TatAvatar";
import { DotOrbitBg } from "../kit/DotOrbitBg";
import { HEADING, INK, PARAGRAPH, SURFACE } from "../kit/design";
import { GlassPlate } from "../catalog/own/glass";
import { F, VO } from "./timeline";
import { WORDS } from "./words";

// "Что ты передашь дальше?" (@the_tatarverse, RU, main host preset Ahu). ~20 s.
// Small family things matter -> one day you decide what to pass on -> recipe, language, family story, a song at the table -> pick one, write it in the comments -> culture lives while it's passed on.
// Own kit only. Palette: midnight (time, generations). Dot Orbit variant 2 (output/bg-variant.txt).
const T = { main: "#283A5E", vivid: "#3F5A93", glow: "#A8B8DA", pale: "#ECF0F8" };
const MID = "#7387B5";
const PLATE_MIDNIGHT = "linear-gradient(135deg, #6178AD, #283A5E)";
const BG = <DotOrbitBg variant={2} />;
const GRAY = "#E4E7EE";

/* ───────── Shared bits ───────── */

const keyWords = (text: string) => {
  let on = false;
  return text.split(" ").map((raw): [string, boolean] => {
    const open = on || raw.startsWith("*");
    on = open && !raw.endsWith("*");
    return [raw.replace(/\*/g, ""), open];
  });
};

/** Heading: Inter 400, *key* words 700 in the accent; `at` = one start (stagger) or a start per word */
const Title: React.FC<{ text: string; frame: number; at: number | number[]; stagger?: number; size?: number; top?: number; style?: React.CSSProperties }> = ({ text, frame, at, stagger = 3, size = 88, top = 170, style }) => (
  <div style={{ ...HEADING, position: "absolute", left: 100, right: 100, top, textAlign: "center", fontSize: size, ...style }}>
    {keyWords(text).map(([raw, key], i, all) => {
      const t = springAt(frame, Array.isArray(at) ? at[i] : at + i * stagger, SPRING.smooth);
      return (
        <span key={i} style={{ display: "inline-block", marginRight: i < all.length - 1 ? "0.24em" : 0, fontWeight: key ? 700 : 400, color: key ? T.main : undefined, opacity: Math.min(1, t * 1.3), transform: `translateY(${(1 - t) * 30}px)`, filter: `blur(${Math.max(0, (1 - t) * 8)}px)` }}>
          {raw}
        </span>
      );
    })}
  </div>
);

const fadeOut = (frame: number, at: number) => 1 - progress(frame, at, at + 10);

/** A round "face" (no icon): colored disc with two eyes; `dashed` = a generation still to come */
const Face: React.FC<{ color: string; size: number; dashed?: boolean; style?: React.CSSProperties }> = ({ color, size, dashed, style }) => (
  <div style={{ position: "absolute", width: size, height: size, borderRadius: size / 2, boxSizing: "border-box", background: dashed ? "#fff" : color, border: dashed ? `5px dashed ${T.glow}` : "6px solid #fff", boxShadow: dashed ? undefined : SURFACE.boxShadow, ...style }}>
    {!dashed &&
      [0.33, 0.58].map((x) => (
        <div key={x} style={{ position: "absolute", left: `${x * 100}%`, top: "40%", width: size * 0.09, height: size * 0.09, borderRadius: size, background: INK }} />
      ))}
  </div>
);

/* Drawn little things (shapes, not icons) */
const Cup: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <svg width={130 * s} height={110 * s} viewBox="0 0 130 110">
    <path d="M14 30 H94 V62 A40 40 0 0 1 14 62 Z" fill={T.vivid} />
    <circle cx={102} cy={52} r={16} fill="none" stroke={T.vivid} strokeWidth={9} />
    <rect x={4} y={96} width={110} height={10} rx={5} fill={T.glow} />
  </svg>
);
const Photo: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <svg width={120 * s} height={120 * s} viewBox="0 0 120 120">
    <rect x={8} y={8} width={104} height={104} rx={12} fill="#fff" stroke={T.glow} strokeWidth={6} />
    <rect x={20} y={20} width={80} height={62} rx={6} fill={T.pale} />
    <circle cx={46} cy={46} r={12} fill={MID} />
    <circle cx={74} cy={50} r={10} fill={T.vivid} />
  </svg>
);
const Key: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <svg width={140 * s} height={70 * s} viewBox="0 0 140 70">
    <circle cx={32} cy={35} r={22} fill="none" stroke={T.main} strokeWidth={10} />
    <rect x={52} y={30} width={80} height={10} rx={5} fill={T.main} />
    <rect x={106} y={30} width={10} height={26} rx={4} fill={T.main} />
    <rect x={122} y={30} width={10} height={20} rx={4} fill={T.main} />
  </svg>
);
const Spool: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <svg width={90 * s} height={120 * s} viewBox="0 0 90 120">
    <rect x={6} y={6} width={78} height={16} rx={6} fill={T.main} />
    <rect x={6} y={98} width={78} height={16} rx={6} fill={T.main} />
    <rect x={18} y={22} width={54} height={76} fill={T.glow} />
    {[34, 50, 66, 82].map((y) => (
      <line key={y} x1={18} y1={y} x2={72} y2={y - 6} stroke={T.vivid} strokeWidth={4} />
    ))}
  </svg>
);
const Bowl: React.FC = () => (
  <svg width={160} height={130} viewBox="0 0 160 130">
    {[50, 80, 110].map((x, i) => (
      <path key={x} d={`M${x} 46 q 10 -14 0 -26 q -10 -12 0 -24`} fill="none" stroke={T.glow} strokeWidth={6} strokeLinecap="round" transform={`translate(0 ${i % 2 ? 4 : 0})`} />
    ))}
    <path d="M10 62 H150 A70 60 0 0 1 10 62 Z" fill={T.vivid} />
  </svg>
);
const Bubble: React.FC = () => (
  <svg width={160} height={130} viewBox="0 0 160 130">
    <path d="M14 14 H146 A10 10 0 0 1 156 24 V84 A10 10 0 0 1 146 94 H60 L34 118 V94 H14 A10 10 0 0 1 4 84 V24 A10 10 0 0 1 14 14 Z" fill={T.vivid} />
    {[50, 80, 110].map((x) => (
      <circle key={x} cx={x} cy={54} r={9} fill="#fff" />
    ))}
  </svg>
);
const BookOpen: React.FC = () => (
  <svg width={170} height={130} viewBox="0 0 170 130">
    <path d="M85 26 Q 50 8 10 18 V110 Q 50 100 85 118 Z" fill={T.pale} stroke={T.vivid} strokeWidth={6} strokeLinejoin="round" />
    <path d="M85 26 Q 120 8 160 18 V110 Q 120 100 85 118 Z" fill={T.pale} stroke={T.vivid} strokeWidth={6} strokeLinejoin="round" />
    {[44, 64, 84].map((y) => (
      <React.Fragment key={y}>
        <line x1={24} y1={y} x2={70} y2={y + 6} stroke={T.glow} strokeWidth={5} strokeLinecap="round" />
        <line x1={100} y1={y + 6} x2={146} y2={y} stroke={T.glow} strokeWidth={5} strokeLinecap="round" />
      </React.Fragment>
    ))}
  </svg>
);

/* ───────── 1. Hook: small family things on a table, they light up on "мелочам" ───────── */

const THINGS = [
  { El: Cup, x: 170, y: 560, r: -6 },
  { El: Photo, x: 600, y: 520, r: 8 },
  { El: Key, x: 380, y: 800, r: -14 },
  { El: Spool, x: 760, y: 790, r: 10 },
  { El: Photo, x: 170, y: 930, r: -10 },
];
const Hook: React.FC<{ frame: number }> = ({ frame }) => {
  const first = fadeOut(frame, F.family - 14);
  const glow = springAt(frame, F.small, SPRING.bouncy);
  return (
    <>
      {first > 0 && <Title text="это изменит твое *отношение*" frame={frame} at={[-30, -24, -18, F.relation - 6]} size={92} style={{ opacity: first }} />}
      {frame >= F.family - 8 && <Title text="к семейным *мелочам*" frame={frame} at={[F.family - 6, F.family, F.small]} size={92} />}
      <div style={{ position: "absolute", left: 110, right: 110, top: 470, height: 680, ...SURFACE, borderRadius: 40, ...pop(frame, 4, SPRING.smooth).style }} />
      {THINGS.map((t, i) => {
        const p = springAt(frame, 8 + i * 7, SPRING.bouncy);
        const g = Math.min(1, glow) * (0.6 + 0.4 * Math.sin((frame - F.small) / 8 + i));
        return (
          <div key={i} style={{ position: "absolute", left: t.x, top: t.y, transform: `rotate(${t.r}deg) scale(${p * (1 + 0.12 * Math.min(glow, 1))})`, filter: glow > 0 ? `drop-shadow(0 0 ${22 * g}px ${T.glow})` : undefined }}>
            <t.El s={1.25} />
          </div>
        );
      })}
    </>
  );
};

/* ───────── 2. One day it's you who decides: a chain of generations, a parcel moves on from you ───────── */

const GEN = [
  { x: 180, size: 120, c: T.glow },
  { x: 390, size: 150, c: MID },
  { x: 640, size: 200, c: T.vivid },
  { x: 900, size: 130, c: T.pale, dashed: true },
];
const CY = 760;
const Gift: React.FC<{ size?: number }> = ({ size = 90 }) => (
  <div style={{ width: size, height: size, borderRadius: 18, background: T.main, position: "relative", boxShadow: SURFACE.boxShadow }}>
    <div style={{ position: "absolute", left: size / 2 - 8, top: 0, bottom: 0, width: 16, background: T.glow }} />
    <div style={{ position: "absolute", top: size / 2 - 8, left: 0, right: 0, height: 16, background: T.glow }} />
  </div>
);
const Decide: React.FC<{ frame: number }> = ({ frame }) => {
  const line = ease.inOut(progress(frame, F.decideIn + 6, F.decideIn + 50));
  const you = springAt(frame, F.you - 4, SPRING.bouncy);
  const go = ease.inOut(progress(frame, F.further, F.further + 34));
  const gift = springAt(frame, F.pass - 10, SPRING.bouncy);
  const arrive = springAt(frame, F.further + 30, SPRING.bouncy);
  return (
    <>
      <Title text="однажды *ты*" frame={frame} at={[F.decideIn + 2, F.you]} size={100} />
      {frame >= F.pass - 16 && <Title text="что передать *дальше*" frame={frame} at={[F.pass - 12, F.pass, F.further]} size={80} top={290} />}
      <svg width={1080} height={1300} style={{ position: "absolute", inset: 0 }}>
        <line x1={180} y1={CY} x2={lerp(180, 900, line)} y2={CY} stroke={T.glow} strokeWidth={8} strokeDasharray="4 20" strokeLinecap="round" />
      </svg>
      {GEN.map((g, i) => {
        const p = springAt(frame, F.decideIn + 8 + i * 8, SPRING.bouncy);
        const isYou = i === 2;
        const filled = i === 3 && arrive > 0.5;
        return (
          <Face key={i} color={filled ? T.glow : g.c} size={g.size} dashed={g.dashed && !filled} style={{ left: g.x - g.size / 2, top: CY - g.size / 2, transform: `scale(${p * (isYou ? 1 + 0.1 * Math.min(you, 1) : 1)})`, outline: isYou && you > 0 ? `${8 * Math.min(you, 1)}px solid ${T.pale}` : undefined, outlineOffset: 6 }} />
        );
      })}
      {gift > 0 && (
        <div style={{ position: "absolute", left: lerp(640, 900, go) - 45, top: CY + 120 - Math.sin(go * Math.PI) * 120, transform: `scale(${Math.min(gift, 1.1)}) rotate(${go * 12}deg)` }}>
          <Gift />
        </div>
      )}
    </>
  );
};

/* ───────── 3. Grandma's recipe? Language? Family story? Three cards dealt on the beats ───────── */

const OPTS = [
  { G: Bowl, w: "бабушкин\nрецепт", at: F.recipe + 16, x: 130, r: -7 },
  { G: Bubble, w: "язык", at: F.lang - 6, x: 400, r: 0 },
  { G: BookOpen, w: "история", at: F.story - 6, x: 670, r: 7 },
];
const Options: React.FC<{ frame: number }> = ({ frame }) => (
  <>
    <Title text="что *передать*" frame={frame} at={[F.optsIn + 2, F.optsIn + 10]} size={100} />
    {OPTS.map((o, i) => {
      const p = springAt(frame, o.at, SPRING.bouncy);
      return (
        <div key={o.w} style={{ position: "absolute", left: o.x, top: 520, width: 280, height: 400, ...SURFACE, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "50px 0 44px", boxSizing: "border-box", transform: `translateY(${(1 - Math.min(p, 1)) * 500}px) rotate(${o.r * Math.min(p, 1.2)}deg)`, opacity: Math.min(1, p * 2) }}>
          <o.G />
          <span style={{ ...PARAGRAPH, fontSize: i === 0 ? 42 : 50, lineHeight: 1.1, fontWeight: 700, color: T.main, whiteSpace: "pre-line", textAlign: "center" }}>{o.w}</span>
        </div>
      );
    })}
  </>
);

/* ───────── 4. Or one song they sing at the table: a round table seen from above, waves from the middle ───────── */

const SEATS = 6;
const Song: React.FC<{ frame: number }> = ({ frame }) => {
  const table = pop(frame, F.songIn + 6, SPRING.smooth);
  const sing = progress(frame, F.sing - 10, F.sing + 10);
  const lit = springAt(frame, F.table, SPRING.bouncy);
  const CX = 540;
  const CYt = 830;
  return (
    <>
      <Title text="или одну *песню*" frame={frame} at={[F.songIn + 2, F.one, F.song]} size={100} />
      <div style={{ position: "absolute", inset: 0, ...table.style }}>
        <svg width={1080} height={1300} style={{ position: "absolute", inset: 0 }}>
          {[0, 0.33, 0.66].map((k) => {
            const r = ((frame - F.song) / 60 + k + 3) % 1;
            return <circle key={k} cx={CX} cy={CYt} r={120 + r * 300} fill="none" stroke={T.glow} strokeWidth={6} opacity={(1 - r) * progress(frame, F.song - 6, F.song + 10)} />;
          })}
        </svg>
        <div style={{ position: "absolute", left: CX - 230, top: CYt - 230, width: 460, height: 460, borderRadius: 230, background: "#fff", boxShadow: `${SURFACE.boxShadow}, 0 0 ${60 * Math.min(lit, 1)}px ${T.glow}` }} />
        {Array.from({ length: SEATS }, (_, i) => {
          const a = (i / SEATS) * Math.PI * 2 - Math.PI / 2;
          const bob = sing * Math.sin(frame / 7 + i * 1.1) * 0.08;
          const sz = 110;
          return <Face key={i} color={[T.glow, MID, T.vivid, T.glow, MID, T.vivid][i]} size={sz} style={{ left: CX + Math.cos(a) * 310 - sz / 2, top: CYt + Math.sin(a) * 310 - sz / 2, transform: `scale(${springAt(frame, F.songIn + 10 + i * 4, SPRING.bouncy) * (1 + bob)})` }} />;
        })}
        {[0, 1, 2, 3].map((k) => {
          const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
          return <div key={k} style={{ position: "absolute", left: CX + Math.cos(a) * 140 - 30, top: CYt + Math.sin(a) * 140 - 30, width: 60, height: 60, borderRadius: 30, background: T.pale, border: `6px solid ${T.glow}` }} />;
        })}
        <div style={{ position: "absolute", left: CX - 60, top: CYt - 60, width: 120, height: 120, borderRadius: 60, background: T.vivid, display: "grid", placeItems: "center", transform: `scale(${1 + 0.08 * sing * Math.sin(frame / 5)})` }}>
          <Music size={60} color="#fff" strokeWidth={2.2} />
        </div>
      </div>
    </>
  );
};

/* ───────── 5. Pick one and write it in the comments ───────── */

const CHOICES = ["рецепт", "язык", "история", "песня"];
const Pick: React.FC<{ frame: number }> = ({ frame }) => {
  const first = fadeOut(frame, F.write - 10);
  const chosen = 3;
  const sel = springAt(frame, F.pick, SPRING.bouncy);
  const fly = ease.inOut(progress(frame, F.write - 6, F.comments + 10));
  const box = pop(frame, F.write - 4, SPRING.smooth);
  const plate = pop(frame, F.comments - 6, SPRING.bouncy);
  return (
    <>
      {first > 0 && <Title text="выбери *одно*" frame={frame} at={[F.ctaIn + 2, F.pick]} size={100} style={{ opacity: first }} />}
      {frame >= F.write - 6 && <Title text="что ты *передашь*" frame={frame} at={[F.what - 20, F.what, F.passOn]} size={96} />}
      {box.t > 0 && (
        <div style={{ position: "absolute", left: 110, right: 110, top: 640, height: 210, ...SURFACE, padding: 40, boxSizing: "border-box", display: "flex", alignItems: "center", gap: 30, ...box.style }}>
          <Face color={T.glow} size={120} style={{ position: "relative", border: "none", boxShadow: "none" }} />
          <div style={{ width: 4, height: 60, background: T.vivid, marginLeft: 200, opacity: fly >= 1 ? Math.floor(frame / 15) % 2 : 0 }} />
        </div>
      )}
      {CHOICES.map((c, i) => {
        const p = pop(frame, F.ctaIn + 6 + i * 5, SPRING.bouncy);
        const on = i === chosen && sel > 0;
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x0 = 130 + col * 430;
        const y0 = 470 + row * 200;
        const fade = i === chosen ? 1 : 1 - fly;
        const x = i === chosen ? lerp(x0, 330, fly) : x0;
        const y = i === chosen ? lerp(y0, 670, fly) : y0;
        return (
          <div key={c} style={{ position: "absolute", left: x, top: y, width: 390, height: 150, borderRadius: 75, display: "grid", placeItems: "center", ...PARAGRAPH, fontSize: 56, lineHeight: 1, fontWeight: on ? 700 : 400, color: on ? "#fff" : INK, background: on ? T.vivid : "#fff", boxShadow: SURFACE.boxShadow, ...p.style, opacity: (p.style.opacity as number) * fade, transform: `${p.style.transform} scale(${on ? 1 + 0.06 * Math.min(sel, 1) - 0.25 * fly : 1})` }}>
            {c}
          </div>
        );
      })}
      {plate.t > 0 && (
        <div style={{ position: "absolute", top: 960, left: 0, right: 0, display: "flex", justifyContent: "center", ...plate.style }}>
          <div style={{ transform: "scale(2.3)" }}>
            <GlassPlate bg={PLATE_MIDNIGHT}>
              <MessageCircle size={20} strokeWidth={2.2} /> в комментарии
            </GlassPlate>
          </div>
        </div>
      )}
    </>
  );
};

/* ───────── 6. Culture lives while it's passed on: a light hops along a chain of generations ───────── */

const NODES = [
  { x: 170, y: 760 },
  { x: 355, y: 640 },
  { x: 540, y: 760 },
  { x: 725, y: 640 },
  { x: 910, y: 760 },
];
const Live: React.FC<{ frame: number }> = ({ frame }) => {
  const t = Math.max(0, (frame - F.liveIn - 20) / 30);
  const i = Math.min(NODES.length - 1, Math.floor(t));
  const f = i >= NODES.length - 1 ? 0 : ease.inOut(t - i);
  const a = NODES[i];
  const b = NODES[Math.min(NODES.length - 1, i + 1)];
  const ox = lerp(a.x, b.x, f);
  const oy = lerp(a.y, b.y, f) - Math.sin(f * Math.PI) * 120;
  const pulse = 0.5 + 0.5 * Math.sin(frame / 6);
  return (
    <>
      <Title text="культура *живет*" frame={frame} at={[F.liveIn + 2, F.lives]} size={100} />
      {frame >= F.whileIn - 8 && <Title text="пока ее *передают*" frame={frame} at={[F.whileIn - 4, F.whileIn + 10, F.passed]} size={88} top={290} />}
      <svg width={1080} height={1300} style={{ position: "absolute", inset: 0 }}>
        <polyline points={NODES.map((n) => `${n.x},${n.y}`).join(" ")} fill="none" stroke={T.glow} strokeWidth={6} strokeDasharray="4 18" strokeLinecap="round" />
      </svg>
      {NODES.map((n, k) => {
        const p = springAt(frame, F.liveIn + 4 + k * 5, SPRING.bouncy);
        const on = t >= k;
        return <Face key={k} color={on ? [T.glow, MID, T.vivid, MID, T.glow][k] : GRAY} size={130} style={{ left: n.x - 65, top: n.y - 65, transform: `scale(${p})` }} />;
      })}
      <div style={{ position: "absolute", left: ox - 34, top: oy - 34 - 110, width: 68, height: 68, borderRadius: 34, background: `radial-gradient(circle, #fff 0%, ${T.glow} 55%, ${T.vivid} 100%)`, boxShadow: `0 0 ${30 + 20 * pulse}px ${T.glow}`, opacity: frame > F.liveIn + 14 ? 1 : 0 }} />
    </>
  );
};

/* ───────── Composition ───────── */

const SCENES: SceneDef[] = [
  { range: [0, F.decideIn], El: Hook },
  { range: [F.decideIn, F.optsIn], El: Decide },
  { range: [F.optsIn, F.songIn], El: Options },
  { range: [F.songIn, F.ctaIn], El: Song },
  { range: [F.ctaIn, F.liveIn], El: Pick },
  { range: [F.liveIn, F.duration + 30], El: Live },
];

const SFX: Sfx[] = [
  { src: "sfx/07_CineStrike.wav", from: 2, volume: 0.18 },
  { src: "sfx2/ding.mp3", from: F.small, volume: 0.2 },
  // scene changes: textures from the SFX/ library (no whoosh)
  { src: "sfx/01_Ripple_Textures.wav", from: F.decideIn - 8, volume: 0.18 },
  { src: "sfx/04_Cyber_Shift.wav", from: F.optsIn - 8, volume: 0.2 },
  { src: "sfx/06_Ripple_Textures_II.wav", from: F.songIn - 8, volume: 0.2 },
  { src: "sfx/02_Alienated_Warpes.wav", from: F.ctaIn - 8, volume: 0.14 },
  { src: "sfx/01_Ripple_Textures.wav", from: F.liveIn - 8, volume: 0.18 },
  // 2. you, the parcel
  { src: "sfx2/pop.mp3", from: F.you - 4, volume: 0.22 },
  { src: "sfx2/click.mp3", from: F.further, volume: 0.18 },
  { src: "sfx2/pop.mp3", from: F.further + 30, volume: 0.22 },
  // 3. cards dealt
  ...OPTS.map((o) => ({ src: "sfx2/pop.mp3", from: o.at, volume: 0.2 })),
  // 4. table
  { src: "sfx/03_Basscrack.wav", from: F.table, volume: 0.08 },
  // 5. pick, comment
  { src: "sfx2/click.mp3", from: F.pick, volume: 0.2 },
  { src: "sfx2/pop.mp3", from: F.comments - 6, volume: 0.24 },
  { src: "sfx2/ding.mp3", from: F.passOn, volume: 0.18 },
  // 6. the light hops
  ...[0, 1, 2, 3].map((k) => ({ src: "sfx2/click.mp3", from: F.liveIn + 20 + (k + 1) * 30, volume: 0.14 })),
  { src: "sfx/07_CineStrike.wav", from: F.passed, volume: 0.12 },
];

// All 30 poses of the main set, each at least once; a swap every ~0.7 s by the meaning of the line, never the same photo twice in a row
const AVATAR_KEYS: AvatarKey[] = [
  // 1. hook: small family things
  { at: 0, e: "explaining" },
  { at: 30, e: "arms-crossed" },
  { at: 60, e: "skeptical" },
  { at: 95, e: "disappointed" },
  { at: 130, e: "surprised" },
  { at: 160, e: "pensive" },
  { at: 185, e: "soft-smile" },
  // 2. you decide what to pass on
  { at: F.decideIn, e: "dreamy" },
  { at: 250, e: "point-right" },
  { at: 295, e: "thinking" },
  { at: 345, e: "present-left" },
  { at: 390, e: "shrug" },
  // 3. recipe, language, story
  { at: F.optsIn, e: "delighted" },
  { at: 460, e: "puzzled" },
  { at: 500, e: "facepalm" },
  { at: 535, e: "smile-up" },
  { at: 565, e: "listening" },
  { at: 595, e: "laughing" },
  // 4. a song at the table
  { at: F.songIn, e: "inspired" },
  { at: 680, e: "waving" },
  { at: 740, e: "clapping" },
  // 5. pick one, comment
  { at: F.ctaIn, e: "stop" },
  { at: 845, e: "point-up" },
  { at: 885, e: "point-down" },
  { at: 925, e: "shush" },
  { at: 960, e: "displeased" },
  { at: 990, e: "thumbs-up" },
  // 6. culture lives
  { at: F.liveIn, e: "hand-on-heart" },
  { at: 1075, e: "heart-hands" },
  { at: 1130, e: "victory" },
];

const STANCES: StanceKey[] = [
  { at: 0, s: "center" },
  { at: F.decideIn, s: "right" },
  { at: F.optsIn, s: "left" },
  { at: F.songIn, s: "right" },
  { at: F.ctaIn, s: "left" },
  { at: F.liveIn, s: "center" },
];

// Main set photos: scale the wide-framed ones so every photo fills the 540x590 box by height (same as V24)
const SIZE: Record<string, [number, number]> = {
  pensive: [1312, 1199], dreamy: [1293, 1217], displeased: [1254, 1254], surprised: [1280, 1229], waving: [1312, 1199], inspired: [1199, 1312], explaining: [1312, 1199], delighted: [1312, 1199], skeptical: [1312, 1199], laughing: [1385, 1136],
  puzzled: [1152, 1366], disappointed: [1278, 1230], "smile-up": [1199, 1312], thinking: [1190, 1322], "soft-smile": [1218, 1291], "point-up": [1312, 1199], "point-down": [1312, 1199], "present-left": [1312, 1199], "point-right": [1312, 1199], shrug: [1312, 1199],
  "hand-on-heart": [1312, 1199], stop: [1312, 1199], shush: [1312, 1199], clapping: [1278, 1230], "thumbs-up": [1312, 1199], "arms-crossed": [1312, 1199], facepalm: [1312, 1199], "heart-hands": [1312, 1199], victory: [1312, 1199], listening: [1312, 1199],
};
const FIT = Object.fromEntries(Object.entries(SIZE).map(([e, [w, h]]) => [e, Math.max(1, w / h / (540 / 590))])) as Partial<Record<Emotion, number>>;

const Host: React.FC<{ frame: number }> = ({ frame }) => <TatAvatar frame={frame} keys={AVATAR_KEYS} words={WORDS} stances={STANCES} fit={FIT} />;

export const Video38: React.FC = () => (
  <AbsoluteFill style={{ background: "#fff", fontFamily: PARAGRAPH.fontFamily, color: INK }}>
    <ReelShell scenes={SCENES} headlines={[]} vo={VO} sfx={SFX} duration={F.duration} music="v38/music/bed.mp3" musicLevel={[0.045, 0.11]} overlay={Host} bg={BG} />
  </AbsoluteFill>
);
