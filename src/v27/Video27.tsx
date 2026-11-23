import React from "react";
import { AbsoluteFill } from "remotion";
import { Check } from "lucide-react";
import { SPRING, ease, lerp, progress, springAt } from "../stage/motion";
import { ReelShell, pop, type SceneDef, type Sfx } from "../kit/reel";
import { TatAvatar, type AvatarKey, type Emotion, type StanceKey } from "../kit/TatAvatar";
import { DotOrbitBg } from "../kit/DotOrbitBg";
import { HEADING, INK, NUMBER, PARAGRAPH, SURFACE } from "../kit/design";
import { GlassPlate } from "../catalog/own/glass";
import { Strike } from "../catalog/own/text";
import { F, VO } from "./timeline";
import { WORDS } from "./words";

// "Первый раз в татарском сообществе" (@the_tatarverse, RU, host preset 2 Alicja). ~19 s.
// If I started from scratch I'd just come alone -> "everyone there knows each other" -> many are there for the first time too
// -> nobody checks who you are, they pour you tea -> find the nearest meetup and come -> after the first one you're already one of us.
// Own kit only. Palette: emerald (life, community, brand). Dot Orbit variant 3 (output/bg-variant.txt).
const E = { main: "#18734F", vivid: "#1C8259", glow: "#7CC5A6", pale: "#E8F5EE" };
const PLATE_E = "linear-gradient(135deg, #3FA57A, #18734F)";
const BG = <DotOrbitBg variant={3} />;
const W = 1080;
const MUTED = "#8A8792";
const LINE = "#E4ECE8";
const GREY = "#C9CCD0";

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
        <span key={i} style={{ display: "inline-block", marginRight: i < all.length - 1 ? "0.24em" : 0, fontWeight: key ? 700 : 400, color: key ? E.main : undefined, opacity: Math.min(1, t * 1.3), transform: `translateY(${(1 - t) * 30}px)`, filter: `blur(${Math.max(0, (1 - t) * 8)}px)` }}>
          {raw}
        </span>
      );
    })}
  </div>
);

/** Flat person: round head + rounded body; (x, y) = bottom center */
const Person: React.FC<{ x: number; y: number; s?: number; c: string; style?: React.CSSProperties }> = ({ x, y, s = 1, c, style }) => (
  <div style={{ position: "absolute", left: x - 50 * s, top: y - 170 * s, width: 100 * s, height: 170 * s, ...style }}>
    <div style={{ position: "absolute", left: 22 * s, top: 0, width: 56 * s, height: 56 * s, borderRadius: 28 * s, background: c }} />
    <div style={{ position: "absolute", left: 0, top: 66 * s, width: 100 * s, height: 104 * s, borderRadius: `${50 * s}px ${50 * s}px ${18 * s}px ${18 * s}px`, background: c }} />
  </div>
);

const TONES = [E.main, E.glow, E.vivid, E.glow, E.main, E.vivid];
// six people around a table; the bottom slot (90 deg) is left free for the newcomer
const OLD_A = [-60, 0, 60, 120, 180, 240];
const ringPos = (deg: number, cx: number, cy: number, r: number) => ({ x: cx + r * Math.cos((deg * Math.PI) / 180), y: cy + r * Math.sin((deg * Math.PI) / 180) });

/* ───────── 1. Hook: one person walks to the door alone, the door opens ───────── */

const Hook: React.FC<{ frame: number }> = ({ frame }) => {
  const out = progress(frame, F.just - 22, F.just - 6);
  const walk = ease.inOut(progress(frame, F.just - 10, F.alone + 10));
  const bob = Math.abs(Math.sin((frame - F.just) / 6)) * 14 * (walk > 0 && walk < 1 ? 1 : 0);
  const open = ease.out(progress(frame, F.alone + 4, F.alone + 34));
  const door = pop(frame, 12, SPRING.smooth);
  const ring = springAt(frame, F.alone, SPRING.bouncy);
  const px = lerp(170, 520, walk);
  return (
    <>
      {out < 1 && <Title text="если бы я начинала с *нуля*" frame={frame} at={[-30, -26, -22, -18, F.scratch - 10, F.scratch]} size={92} style={{ opacity: 1 - out }} />}
      {out > 0 && <Title text="просто пришла бы *одна*" frame={frame} at={[F.just - 4, F.came, F.came + 14, F.alone]} size={92} />}
      <div style={{ position: "absolute", top: 1000, left: 100, right: 100, height: 14, borderRadius: 7, background: LINE }} />
      <div style={{ position: "absolute", left: 640, top: 520, width: 280, height: 480, ...door.style }}>
        <div style={{ ...SURFACE, position: "absolute", inset: 0, borderRadius: "28px 28px 0 0" }} />
        <div style={{ position: "absolute", left: 24, top: 24, right: 24, bottom: 0, borderRadius: "18px 18px 0 0", background: E.pale, overflow: "hidden", boxShadow: open > 0 ? `inset 0 0 ${80 * open}px ${E.glow}` : undefined }}>
          <Person x={80} y={456} s={0.62} c={E.glow} style={{ opacity: open }} />
          <Person x={160} y={456} s={0.7} c={E.vivid} style={{ opacity: open }} />
        </div>
        <div style={{ position: "absolute", left: 24, top: 24, right: 24, bottom: 0, borderRadius: "18px 18px 0 0", background: E.main, transformOrigin: "0 50%", transform: `perspective(900px) rotateY(${-62 * open}deg)` }}>
          <div style={{ position: "absolute", right: 26, top: 230, width: 22, height: 22, borderRadius: 11, background: E.glow }} />
        </div>
      </div>
      {ring > 0 && <div style={{ position: "absolute", left: px - 90, top: 1000 - 220, width: 180, height: 180, borderRadius: 90, border: `6px solid ${E.glow}`, opacity: Math.max(0, 1 - progress(frame, F.alone + 20, F.alone + 60)), transform: `scale(${Math.min(ring, 1.2)})` }} />}
      <Person x={px} y={1000 - bob} s={1.05} c={E.vivid} style={door.style} />
    </>
  );
};

/* ───────── 2. The thought: a cloud where everyone is already connected, you stand outside ───────── */

const Thought: React.FC<{ frame: number }> = ({ frame }) => {
  const cloud = pop(frame, F.thoughtIn + 8, SPRING.smooth);
  const link = ease.inOut(progress(frame, F.all, F.know + 20));
  const shy = ease.inOut(progress(frame, F.know, F.know + 24));
  const C = { x: 540, y: 700 };
  const pts = OLD_A.map((a) => ringPos(a, C.x, C.y, 170));
  const pairs: [number, number][] = [];
  pts.forEach((_, i) => pts.forEach((__, j) => j > i && pairs.push([i, j])));
  return (
    <>
      <Title text="все друг друга *знают*" frame={frame} at={[F.thought - 4, F.all + 10, F.all + 22, F.know]} size={96} />
      <div style={{ position: "absolute", inset: 0, ...cloud.style }}>
        <div style={{ ...SURFACE, position: "absolute", left: 150, right: 150, top: 430, height: 520, borderRadius: 120 }} />
        <div style={{ ...SURFACE, position: "absolute", left: 250, top: 980, width: 56, height: 56, borderRadius: 28 }} />
        <div style={{ ...SURFACE, position: "absolute", left: 210, top: 1060, width: 30, height: 30, borderRadius: 15 }} />
        <svg width={W} height={1300} style={{ position: "absolute", inset: 0 }}>
          {pairs.map(([i, j], k) => {
            const t = Math.max(0, Math.min(1, link * pairs.length - k));
            const a = pts[i];
            const b = pts[j];
            return t > 0 ? <line key={k} x1={a.x} y1={a.y} x2={lerp(a.x, b.x, t)} y2={lerp(a.y, b.y, t)} stroke={E.glow} strokeWidth={5} strokeLinecap="round" /> : null;
          })}
        </svg>
        {pts.map((p, i) => (
          <Person key={i} x={p.x} y={p.y + 50} s={0.62} c={TONES[i]} style={{ transform: `scale(${springAt(frame, F.thoughtIn + 14 + i * 4, SPRING.bouncy)})` }} />
        ))}
      </div>
      <Person x={lerp(860, 900, shy)} y={1200} s={lerp(0.9, 0.72, shy)} c={GREY} style={pop(frame, F.thought, SPRING.bouncy).style} />
    </>
  );
};

/* ───────── 3. In fact many are there for the first time: "1" badges light up ───────── */

const FIRST = [
  { i: 0, at: F.many },
  { i: 2, at: F.many + 18 },
  { i: 4, at: F.too },
  { i: 3, at: F.first + 8 },
];
const First: React.FC<{ frame: number }> = ({ frame }) => (
  <>
    <Title text="многие тоже *впервые*" frame={frame} at={[F.many - 6, F.too, F.first]} size={100} />
    <div style={{ position: "absolute", top: 460, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 230px)", gap: 30 }}>
        {TONES.map((c, i) => {
          const p = springAt(frame, F.firstIn + 6 + i * 4, SPRING.bouncy);
          const b = FIRST.find((f) => f.i === i);
          const on = b ? springAt(frame, b.at, SPRING.bouncy) : 0;
          return (
            <div key={i} style={{ ...SURFACE, position: "relative", width: 230, height: 250, transform: `scale(${p})`, opacity: Math.min(1, p * 1.5), boxShadow: on > 0.5 ? `0 0 0 6px ${E.pale}, ${SURFACE.boxShadow}` : SURFACE.boxShadow }}>
              <Person x={115} y={226} s={1.1} c={c} />
              {on > 0 && (
                <div style={{ position: "absolute", right: -16, top: -16, width: 76, height: 76, borderRadius: 38, background: E.vivid, border: "6px solid #fff", display: "grid", placeItems: "center", transform: `scale(${on})` }}>
                  <span style={{ ...NUMBER, fontSize: 40, color: "#fff" }}>1</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  </>
);

/* ───────── 4. Nobody checks who you are (the ID card slides away), they just pour you tea ───────── */

const SPOUT = { x: 168, y: -52 };
const POT = { x: 390, y: 640 };
const Tea: React.FC<{ frame: number }> = ({ frame }) => {
  const card = pop(frame, F.teaIn + 8, SPRING.smooth);
  const away = ease.inOut(progress(frame, F.who + 20, F.who + 44));
  const pot = pop(frame, F.who + 34, SPRING.smooth);
  const tilt = ease.inOut(progress(frame, F.pour - 14, F.pour + 10)) * (1 - ease.inOut(progress(frame, F.tea + 40, F.tea + 60)));
  const th = (40 * tilt * Math.PI) / 180;
  const tip = { x: POT.x + SPOUT.x * Math.cos(th) - SPOUT.y * Math.sin(th), y: POT.y + SPOUT.x * Math.sin(th) + SPOUT.y * Math.cos(th) };
  const stream = tilt > 0.95 ? ease.out(progress(frame, F.pour + 8, F.pour + 22)) : 0;
  const fill = ease.inOut(progress(frame, F.pour + 16, F.tea + 40));
  const steam = progress(frame, F.tea + 30, F.tea + 50);
  return (
    <>
      {away < 1 && (
        <div style={{ position: "absolute", inset: 0, opacity: 1 - away, transform: `translateX(${-away * 320}px) rotate(${-away * 6}deg)` }}>
          <div style={{ ...HEADING, position: "absolute", top: 170, left: 0, right: 0, textAlign: "center", fontSize: 96, lineHeight: 1.2 }}>
            <div style={pop(frame, F.teaIn + 2, SPRING.smooth).style}>никто не</div>
            <div style={pop(frame, F.check - 4, SPRING.smooth).style}>
              <Strike frame={frame} at={F.check + 12}>
                проверяет
              </Strike>
            </div>
          </div>
          <div style={{ position: "absolute", top: 560, left: 190, right: 190, height: 300, ...SURFACE, padding: 40, display: "flex", gap: 36, ...card.style }}>
            <div style={{ width: 190, height: 220, borderRadius: 20, background: LINE, position: "relative", overflow: "hidden", flex: "none" }}>
              <Person x={95} y={236} s={1.15} c={GREY} />
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 26, paddingTop: 16 }}>
              {[0.9, 0.7, 0.8, 0.5].map((wd, k) => (
                <div key={k} style={{ width: `${wd * 100}%`, height: 20, borderRadius: 10, background: k === 0 ? GREY : LINE }} />
              ))}
            </div>
          </div>
        </div>
      )}
      {away > 0 && (
        <>
          <Title text="просто нальют *чай*" frame={frame} at={[F.who + 30, F.pour, F.tea]} size={100} />
          <svg width={W} height={1300} style={{ position: "absolute", inset: 0, ...pot.style }}>
            <defs>
              <clipPath id="v27cup">
                <path d="M560 900 L760 900 L742 1040 Q737 1070 707 1070 L613 1070 Q583 1070 578 1040 Z" />
              </clipPath>
            </defs>
            {stream > 0 && fill < 1 && (
              <path d={`M${tip.x} ${tip.y} Q 652 ${tip.y + 10} 660 1060`} fill="none" stroke={E.glow} strokeWidth={12} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - stream} />
            )}
            <ellipse cx={660} cy={1080} rx={160} ry={16} fill={LINE} />
            <circle cx={778} cy={962} r={34} fill="none" stroke={E.vivid} strokeWidth={16} />
            <path d="M560 900 L760 900 L742 1040 Q737 1070 707 1070 L613 1070 Q583 1070 578 1040 Z" fill="#fff" stroke={E.vivid} strokeWidth={10} strokeLinejoin="round" />
            <rect x={540} y={1070 - fill * 150} width={240} height={200} fill={E.glow} clipPath="url(#v27cup)" />
            {[620, 660, 700].map((x, i) => (
              <path key={x} d={`M${x} ${880 - ((frame / 3 + i * 12) % 30)} q 16 -20 0 -40 q -16 -20 0 -40`} fill="none" stroke={E.glow} strokeWidth={7} strokeLinecap="round" opacity={steam * (0.5 + 0.5 * Math.sin(frame / 9 + i))} />
            ))}
            <g transform={`translate(${POT.x} ${POT.y}) rotate(${40 * tilt})`}>
              <path d="M-118 -10 C -205 -18, -205 100, -110 86" fill="none" stroke={E.main} strokeWidth={22} strokeLinecap="round" />
              <path d="M104 4 Q 150 20 172 -56 L 158 -60 Q 136 0 100 -14 Z" fill={E.main} />
              <ellipse cx={0} cy={22} rx={132} ry={106} fill={E.main} />
              <ellipse cx={0} cy={-80} rx={66} ry={18} fill={E.vivid} />
              <circle cx={0} cy={-100} r={15} fill={E.vivid} />
              <path d="M-96 30 Q 0 60 96 30" fill="none" stroke={E.glow} strokeWidth={10} strokeLinecap="round" />
            </g>
          </svg>
        </>
      )}
    </>
  );
};

/* ───────── 5. Find the nearest meetup: a list of dates, the nearest lights up, "иду" ───────── */

const DATES = [
  { d: 16, at: F.meetIn + 8 },
  { d: 23, at: F.meetIn + 18 },
  { d: 30, at: F.meetIn + 28 },
];
const Meet: React.FC<{ frame: number }> = ({ frame }) => {
  const near = springAt(frame, F.meetup, SPRING.bouncy);
  const go = pop(frame, F.come - 4, SPRING.bouncy);
  return (
    <>
      <Title text="найди *ближайшую* встречу" frame={frame} at={[F.meetIn + 2, F.nearest, F.meetup]} size={92} />
      <div style={{ position: "absolute", top: 450, left: 130, right: 130, ...SURFACE, padding: 40, display: "flex", flexDirection: "column", gap: 28, ...pop(frame, F.meetIn + 4, SPRING.smooth).style }}>
        {DATES.map((r, i) => {
          const p = pop(frame, r.at, SPRING.smooth);
          const hi = i === 0 ? Math.min(near, 1) : 0;
          return (
            <div key={r.d} style={{ display: "flex", alignItems: "center", gap: 30, padding: 18, borderRadius: 24, background: hi > 0.5 ? E.pale : "transparent", boxShadow: hi > 0 ? `0 0 0 ${5 * hi}px ${E.glow}` : undefined, transform: `scale(${1 + 0.04 * hi})`, opacity: i === 0 ? 1 : 1 - 0.45 * Math.min(near, 1), ...p.style }}>
              <div style={{ width: 120, height: 120, borderRadius: 22, background: i === 0 ? E.vivid : LINE, display: "grid", placeItems: "center", flex: "none" }}>
                <span style={{ ...NUMBER, fontSize: 60, color: i === 0 ? "#fff" : MUTED }}>{r.d}</span>
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 18 }}>
                <div style={{ width: "85%", height: 20, borderRadius: 10, background: i === 0 ? E.glow : LINE }} />
                <div style={{ width: "55%", height: 20, borderRadius: 10, background: LINE }} />
              </div>
              <span style={{ ...NUMBER, fontWeight: 500, fontSize: 40, color: i === 0 ? E.main : MUTED }}>19:00</span>
            </div>
          );
        })}
      </div>
      {go.t > 0 && (
        <div style={{ position: "absolute", top: 1110, left: 0, right: 0, display: "flex", justifyContent: "center", ...go.style }}>
          <div style={{ transform: "scale(2.3)" }}>
            <GlassPlate bg={PLATE_E}>
              <Check size={18} strokeWidth={2.6} /> приду
            </GlassPlate>
          </div>
        </div>
      )}
    </>
  );
};

/* ───────── 6. After the first meetup you're one of us: the newcomer joins the circle ───────── */

const Own: React.FC<{ frame: number }> = ({ frame }) => {
  const join = ease.inOut(progress(frame, F.firstMeet + 10, F.already));
  const link = ease.out(progress(frame, F.own, F.own + 30));
  const C = { x: 540, y: 780 };
  const R = 230;
  const olds = OLD_A.map((a, i) => {
    const from = a < 90 ? a + 360 : a;
    const to = 90 + (((i + 3) % 6) + 1) * (360 / 7);
    return ringPos(lerp(from, to, join), C.x, C.y, R);
  });
  const slot = ringPos(90, C.x, C.y, R);
  const me = { x: lerp(900, slot.x, join), y: lerp(1180, slot.y, join) };
  const mine = springAt(frame, F.own, SPRING.bouncy);
  return (
    <>
      <div style={{ ...PARAGRAPH, position: "absolute", top: 170, left: 100, right: 100, textAlign: "center", fontSize: 60, color: MUTED, ...pop(frame, F.ownIn + 6, SPRING.smooth).style }}>после первой встречи</div>
      <Title text="ты уже *свой*" frame={frame} at={[F.already - 14, F.already, F.own]} size={120} top={270} />
      <svg width={W} height={1300} style={{ position: "absolute", inset: 0 }}>
        <circle cx={C.x} cy={C.y} r={R} fill="none" stroke={LINE} strokeWidth={6} />
        {olds.map((p, i) => (link > 0 ? <line key={i} x1={me.x} y1={me.y} x2={lerp(me.x, p.x, link)} y2={lerp(me.y, p.y, link)} stroke={E.glow} strokeWidth={6} strokeLinecap="round" /> : null))}
      </svg>
      {olds.map((p, i) => (
        <Person key={i} x={p.x} y={p.y + 50} s={0.62} c={TONES[i]} style={{ transform: `scale(${springAt(frame, F.ownIn + 4 + i * 3, SPRING.bouncy)})` }} />
      ))}
      <Person x={me.x} y={me.y + 50} s={0.62 * (1 + 0.15 * Math.max(0, Math.sin(Math.min(mine, 1) * Math.PI)))} c={mine > 0.5 ? E.main : GREY} />
      {mine > 0 && (
        <div style={{ position: "absolute", left: C.x - 70, top: C.y - 70, width: 140, height: 140, borderRadius: 70, background: E.pale, display: "grid", placeItems: "center", transform: `scale(${mine})` }}>
          <svg width={70} height={64} viewBox="0 0 24 22">
            <path d="M12 21 C 5 15, 1 11, 1 6.5 A 5.5 5.5 0 0 1 12 4 A 5.5 5.5 0 0 1 23 6.5 C 23 11, 19 15, 12 21 Z" fill={E.vivid} />
          </svg>
        </div>
      )}
    </>
  );
};

/* ───────── Composition ───────── */

const SCENES: SceneDef[] = [
  { range: [0, F.thoughtIn], El: Hook },
  { range: [F.thoughtIn, F.firstIn], El: Thought },
  { range: [F.firstIn, F.teaIn], El: First },
  { range: [F.teaIn, F.meetIn], El: Tea },
  { range: [F.meetIn, F.ownIn], El: Meet },
  { range: [F.ownIn, F.duration + 30], El: Own },
];

const SFX: Sfx[] = [
  { src: "sfx/07_CineStrike.wav", from: 2, volume: 0.18 },
  { src: "sfx2/pop.mp3", from: F.alone + 2, volume: 0.24 },
  // scene changes: textures from the SFX/ library (no whoosh)
  { src: "sfx/04_Cyber_Shift.wav", from: F.thoughtIn - 8, volume: 0.2 },
  { src: "sfx/01_Ripple_Textures.wav", from: F.firstIn - 8, volume: 0.18 },
  { src: "sfx/06_Ripple_Textures_II.wav", from: F.teaIn - 8, volume: 0.2 },
  { src: "sfx/02_Alienated_Warpes.wav", from: F.meetIn - 8, volume: 0.14 },
  { src: "sfx/01_Ripple_Textures.wav", from: F.ownIn - 8, volume: 0.18 },
  // 2. everyone connected
  { src: "sfx2/click.mp3", from: F.know, volume: 0.2 },
  // 3. "1" badges
  ...FIRST.map((b) => ({ src: "sfx2/pop.mp3", from: b.at, volume: 0.2 })),
  // 4. check struck, tea
  { src: "sfx/05_Distortion_Glitch.wav", from: F.check + 42, volume: 0.05 },
  { src: "sfx2/ding.mp3", from: F.tea + 40, volume: 0.2 },
  // 5. nearest date, "приду"
  { src: "sfx2/click.mp3", from: F.meetup, volume: 0.22 },
  { src: "sfx2/pop.mp3", from: F.come - 2, volume: 0.24 },
  // 6. one of us
  { src: "sfx/07_CineStrike.wav", from: F.own, volume: 0.12 },
];

// All 30 poses of the Alicja set, each at least once; swaps by the meaning of the line, never the same photo twice in a row
const AVATAR_KEYS: AvatarKey[] = [
  // 1. hook: from scratch, come alone
  { at: 0, e: "explaining" },
  { at: 35, e: "thinking" },
  { at: 70, e: "pensive" },
  { at: 105, e: "dreamy" },
  { at: 140, e: "point-right" },
  { at: 178, e: "soft-smile" },
  // 2. "everyone knows each other"
  { at: F.thoughtIn, e: "listening" },
  { at: 250, e: "skeptical" },
  { at: 284, e: "puzzled" },
  { at: 318, e: "displeased" },
  { at: 350, e: "facepalm" },
  { at: 382, e: "disappointed" },
  // 3. many are new too
  { at: F.firstIn, e: "shrug" },
  { at: 445, e: "shush" },
  { at: 480, e: "surprised" },
  { at: 515, e: "point-up" },
  { at: 550, e: "delighted" },
  // 4. nobody checks, tea
  { at: F.teaIn, e: "stop" },
  { at: 625, e: "arms-crossed" },
  { at: 660, e: "laughing" },
  { at: 695, e: "present-left" },
  { at: 730, e: "smile-up" },
  { at: 765, e: "hand-on-heart" },
  // 5. find the nearest, come
  { at: F.meetIn, e: "point-down" },
  { at: 832, e: "inspired" },
  { at: 866, e: "thumbs-up" },
  { at: 900, e: "waving" },
  { at: 940, e: "clapping" },
  // 6. one of us
  { at: F.ownIn, e: "heart-hands" },
  { at: 1030, e: "victory" },
  { at: 1090, e: "soft-smile" },
];

const STANCES: StanceKey[] = [
  { at: 0, s: "center" },
  { at: F.thoughtIn, s: "right" },
  { at: F.firstIn, s: "left" },
  { at: F.teaIn, s: "right" },
  { at: F.meetIn, s: "left" },
  { at: F.ownIn, s: "center" },
];

// Alicja photos: scale the wide-framed ones so every photo fills the 540x590 box by height (as in V25)
const SIZE: Record<string, [number, number]> = {
  pensive: [1129, 1393], dreamy: [1293, 1216], displeased: [1254, 1254], surprised: [1280, 1229], waving: [1312, 1199], inspired: [1199, 1312], explaining: [1312, 1199], delighted: [1312, 1199], skeptical: [1312, 1199], laughing: [1385, 1136],
  puzzled: [1129, 1393], disappointed: [1278, 1230], "smile-up": [1199, 1312], thinking: [1129, 1393], "soft-smile": [1164, 1351], "point-up": [1312, 1199], "point-down": [1312, 1199], "present-left": [1312, 1199], "point-right": [1312, 1199], shrug: [1312, 1199],
  "hand-on-heart": [1312, 1199], stop: [1312, 1199], shush: [1199, 1312], clapping: [1312, 1199], "thumbs-up": [1312, 1199], "arms-crossed": [1199, 1312], facepalm: [1312, 1199], "heart-hands": [1312, 1199], victory: [1312, 1199], listening: [1312, 1199],
};
const FIT = Object.fromEntries(Object.entries(SIZE).map(([e, [w, h]]) => [e, Math.max(1, w / h / (540 / 590))])) as Partial<Record<Emotion, number>>;

const Host: React.FC<{ frame: number }> = ({ frame }) => <TatAvatar frame={frame} keys={AVATAR_KEYS} words={WORDS} stances={STANCES} dir="v27/avatar" fit={FIT} />;

export const Video27: React.FC = () => (
  <AbsoluteFill style={{ background: "#fff", fontFamily: PARAGRAPH.fontFamily, color: INK }}>
    <ReelShell scenes={SCENES} headlines={[]} vo={VO} sfx={SFX} duration={F.duration} music="v27/music/bed.mp3" musicLevel={[0.045, 0.11]} overlay={Host} bg={BG} />
  </AbsoluteFill>
);
