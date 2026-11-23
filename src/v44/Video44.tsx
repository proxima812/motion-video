import React from "react";
import { AbsoluteFill } from "remotion";
import { MessageCircle } from "lucide-react";
import { SPRING, ease, lerp, progress, springAt } from "../stage/motion";
import { ReelShell, pop, shake, type SceneDef, type Sfx } from "../kit/reel";
import { TatAvatar, type AvatarKey, type Emotion, type StanceKey } from "../kit/TatAvatar";
import { DotOrbitBg } from "../kit/DotOrbitBg";
import { HEADING, INK, NUMBER, PARAGRAPH, SURFACE } from "../kit/design";
import { GlassPlate } from "../catalog/own/glass";
import { F, VO } from "./timeline";
import { WORDS } from "./words";

// "Культура в будний вторник" (@the_tatarverse, RU, main host preset Ahu). 21 s.
// You remember culture only on Sabantuy (one lit dot in a year) -> today is an ordinary Tuesday, no holiday -> what Tatar is left? (empty slots) -> tea with jam, a song, "сәлам" to mom (slots fill) -> culture lives on weekdays, not only on stage -> write what Tatar was in your today (today's dot lights up).
// Own kit only. Palette: pine (everyday life, calm). Dot Orbit variant 2 (output/bg-variant.txt).
const T = { main: "#24563B", vivid: "#357A55", glow: "#9CCBB0", pale: "#E9F4EE" };
const PLATE_PINE = "linear-gradient(135deg, #357A55, #24563B)";
const BG = <DotOrbitBg variant={2} />;
const GRAY = "#E2E6E3";

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

/* ───────── The year as dots: 12 rows (months) of day dots ───────── */

const DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const SABANTUY: [number, number] = [5, 20]; // a June weekend
const TODAY: [number, number] = [10, 16]; // Tuesday, November 17
const STEP = 27;
const DOT = 17;

const Year: React.FC<{ frame: number; at: number; lit: { m: number; d: number; t: number }[]; top?: number }> = ({ frame, at, lit, top = 470 }) => {
  const card = pop(frame, at, SPRING.smooth);
  return (
    <div style={{ position: "absolute", left: 100, right: 100, top, ...card.style }}>
      <div style={{ ...SURFACE, borderRadius: 36, padding: 26, position: "relative" }}>
        {DAYS.map((n, m) => (
          <div key={m} style={{ display: "flex", gap: STEP - DOT, height: STEP, alignItems: "center" }}>
            {Array.from({ length: 31 }, (_, d) => {
              const appear = progress(frame, at + 4 + m * 2, at + 14 + m * 2);
              const l = lit.find((x) => x.m === m && x.d === d);
              const on = l ? Math.min(1, l.t) : 0;
              return (
                <div key={d} style={{ position: "relative", width: DOT, height: DOT, flex: "none" }}>
                  {d < n && <div style={{ position: "absolute", inset: 0, borderRadius: DOT, background: on > 0 ? T.vivid : GRAY, opacity: appear, transform: `scale(${1 + 0.7 * on})` }} />}
                  {on > 0 && <div style={{ position: "absolute", left: -18, top: -18, width: DOT + 36, height: DOT + 36, borderRadius: "50%", border: `5px solid ${T.glow}`, boxSizing: "border-box", transform: `scale(${0.6 + 0.4 * on + 0.08 * Math.sin(frame / 7)})`, opacity: on }} />}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ───────── 1. Hook: a whole year of dots, only the Sabantuy dot lights up ───────── */

const Hook: React.FC<{ frame: number }> = ({ frame }) => {
  const first = fadeOut(frame, F.remember - 14);
  const sab = springAt(frame, F.sabantuy, SPRING.bouncy);
  const s = shake(frame, F.sabantuy + 4, 6, 14);
  const tag = pop(frame, F.sabantuy + 6, SPRING.bouncy);
  return (
    <>
      {first > 0 && <Title text="вот *настоящая причина*" frame={frame} at={[-30, F.real, F.reason]} size={96} style={{ opacity: first }} />}
      {frame >= F.remember - 8 && <Title text="культура только *на Сабантуй*" frame={frame} at={[F.culture - 10, F.only, F.sabantuy]} size={92} />}
      <div style={{ transform: `translateX(${s}px)` }}>
        <Year frame={frame} at={6} lit={[{ m: SABANTUY[0], d: SABANTUY[1], t: sab }]} />
      </div>
      {tag.t > 0 && (
        <div style={{ position: "absolute", left: 100 + 26 + SABANTUY[1] * STEP - 60, top: 470 + 26 + SABANTUY[0] * STEP - 150, ...tag.style }}>
          <svg width={140} height={130} viewBox="0 0 140 130">
            {/* a little festive flag garland over the day */}
            <path d="M6 20 Q 70 50 134 20" fill="none" stroke={T.main} strokeWidth={4} />
            {[0, 1, 2, 3, 4].map((k) => {
              const x = 18 + k * 26;
              const y = 20 + Math.sin((x / 140) * Math.PI) * 26;
              return <path key={k} d={`M${x - 10} ${y} L${x + 10} ${y} L${x} ${y + 26} Z`} fill={k % 2 ? T.glow : T.vivid} />;
            })}
          </svg>
        </div>
      )}
    </>
  );
};

/* ───────── 2. An ordinary Tuesday: a tear-off calendar page, the party popper only fizzles ───────── */

const Tuesday: React.FC<{ frame: number }> = ({ frame }) => {
  const page = pop(frame, F.todayIn + 4, SPRING.smooth);
  const tear = ease.in(progress(frame, F.today, F.today + 30));
  const popper = pop(frame, F.holiday - 16, SPRING.bouncy);
  const fizz = progress(frame, F.no - 4, F.no + 40);
  const tilt = lerp(-30, -50, ease.out(progress(frame, F.no - 6, F.no + 4)));
  return (
    <>
      <Title text="обычный *вторник*" frame={frame} at={[F.ordinary, F.tuesday]} size={96} />
      <div style={{ position: "absolute", left: 540 - 260, top: 430, width: 520, height: 640, ...page.style }}>
        {/* the page underneath */}
        <div style={{ position: "absolute", inset: 0, ...SURFACE, borderRadius: 36, overflow: "hidden" }}>
          <div style={{ height: 120, background: `linear-gradient(90deg, ${T.vivid}, ${T.main})` }} />
          <div style={{ height: 360, display: "grid", placeItems: "center" }}>
            <span style={{ ...NUMBER, fontSize: 280, color: INK }}>17</span>
          </div>
          <div style={{ margin: "0 60px", height: 90, borderRadius: 24, border: `5px dashed ${GRAY}` }} />
        </div>
        {/* yesterday's page tears off and falls */}
        {tear < 1 && (
          <div style={{ position: "absolute", inset: 0, ...SURFACE, borderRadius: 36, overflow: "hidden", transform: `translate(${tear * 120}px, ${tear * 700}px) rotate(${tear * 30}deg)`, opacity: 1 - tear }}>
            <div style={{ height: 120, background: `linear-gradient(90deg, ${T.vivid}, ${T.main})` }} />
            <div style={{ height: 360, display: "grid", placeItems: "center" }}>
              <span style={{ ...NUMBER, fontSize: 280, color: INK }}>16</span>
            </div>
          </div>
        )}
        {[120, 260, 400].map((x) => (
          <div key={x} style={{ position: "absolute", left: x - 14, top: -22, width: 28, height: 60, borderRadius: 14, background: INK }} />
        ))}
      </div>
      {popper.t > 0 && (
        <div style={{ position: "absolute", left: 750, top: 900, ...popper.style }}>
          <div style={{ transform: `rotate(${tilt}deg)`, transformOrigin: "50% 100%" }}>
            <svg width={120} height={170} viewBox="0 0 120 170">
              <path d="M60 168 L18 30 Q 60 10 102 30 Z" fill={T.vivid} />
              {[50, 90, 130].map((y) => (
                <path key={y} d={`M${60 - (168 - y) * 0.3} ${y} L${60 + (168 - y) * 0.3} ${y - 8}`} stroke={T.glow} strokeWidth={8} strokeLinecap="round" />
              ))}
              <ellipse cx={60} cy={30} rx={42} ry={12} fill={T.main} />
            </svg>
          </div>
          {fizz > 0 &&
            [0, 1, 2].map((k) => (
              <div key={k} style={{ position: "absolute", left: -10 + k * 24, top: -20 - Math.sin(fizz * Math.PI) * (30 + k * 10) + fizz * 60, width: 14, height: 14, borderRadius: 7, background: GRAY, opacity: 1 - fizz }} />
            ))}
        </div>
      )}
    </>
  );
};

/* ───────── 3-4. What Tatar is left? Three empty slots, then they fill: tea + jam, headphones, "сәлам" ───────── */

const Tea: React.FC = () => (
  <svg width={200} height={180} viewBox="0 0 200 180">
    {[60, 95].map((x) => (
      <path key={x} d={`M${x} 50 q 12 -16 0 -32`} fill="none" stroke={T.glow} strokeWidth={7} strokeLinecap="round" />
    ))}
    <path d="M30 60 H130 V110 A50 50 0 0 1 30 110 Z" fill={T.vivid} />
    <circle cx={138} cy={92} r={18} fill="none" stroke={T.vivid} strokeWidth={9} />
    <rect x={20} y={164} width={124} height={10} rx={5} fill={T.glow} />
    <rect x={150} y={100} width={44} height={64} rx={12} fill={T.pale} stroke={T.main} strokeWidth={5} />
    <rect x={146} y={90} width={52} height={16} rx={6} fill={T.main} />
    <rect x={155} y={124} width={34} height={36} rx={8} fill={T.main} opacity={0.85} />
  </svg>
);
const Phones: React.FC<{ frame: number }> = ({ frame }) => (
  <svg width={200} height={180} viewBox="0 0 200 180">
    <path d="M40 110 V90 A60 60 0 0 1 160 90 V110" fill="none" stroke={T.main} strokeWidth={14} strokeLinecap="round" />
    <rect x={22} y={96} width={44} height={70} rx={18} fill={T.vivid} />
    <rect x={134} y={96} width={44} height={70} rx={18} fill={T.vivid} />
    {[0, 1].map((k) => {
      const y = 70 - ((frame / 3 + k * 20) % 40);
      return (
        <g key={k} transform={`translate(${86 + k * 22} ${y})`} opacity={0.9}>
          <circle cx={0} cy={20} r={7} fill={T.glow} />
          <rect x={5} y={-4} width={4} height={24} fill={T.glow} />
        </g>
      );
    })}
  </svg>
);
const Hello: React.FC = () => (
  <svg width={200} height={180} viewBox="0 0 200 180">
    <path d="M20 30 H180 A14 14 0 0 1 194 44 V120 A14 14 0 0 1 180 134 H80 L50 164 V134 H20 A14 14 0 0 1 6 120 V44 A14 14 0 0 1 20 30 Z" fill={T.vivid} />
    <path d="M100 116 C 70 96 62 84 62 72 C 62 62 70 56 78 56 C 86 56 94 61 100 70 C 106 61 114 56 122 56 C 130 56 138 62 138 72 C 138 84 130 96 100 116 Z" fill="#fff" />
  </svg>
);

const SLOT_X = [100, 410, 720];
const Slots: React.FC<{ frame: number; fill: number[]; scan?: boolean; at: number }> = ({ frame, fill, scan, at }) => (
  <>
    {SLOT_X.map((x, i) => {
      const p = springAt(frame, at + i * 6, SPRING.bouncy);
      const f = fill[i] ?? 0;
      const empty = 0.5 + 0.5 * Math.sin(frame / 8 + i);
      return (
        <div key={i} style={{ position: "absolute", left: x, top: 560, width: 260, height: 320, transform: `scale(${p})` }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: 36, border: f > 0.5 ? undefined : `6px dashed ${T.glow}`, boxSizing: "border-box", background: f > 0.5 ? "#fff" : `rgba(233,244,238,${0.4 + 0.4 * (scan ? empty : 0)})`, boxShadow: f > 0.5 ? SURFACE.boxShadow : undefined }} />
          <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", transform: `scale(${Math.min(1.1, f)})`, opacity: Math.min(1, f * 2) }}>
            {i === 0 ? <Tea /> : i === 1 ? <Phones frame={frame} /> : <Hello />}
          </div>
        </div>
      );
    })}
  </>
);

const Left: React.FC<{ frame: number }> = ({ frame }) => {
  const scanY = 560 + (((frame - F.leftIn) / 50) % 1) * 320;
  return (
    <>
      <Title text="что осталось *татарского*" frame={frame} at={[F.what, F.left, F.tatarQ]} size={96} />
      <Slots frame={frame} fill={[0, 0, 0]} scan at={F.leftIn + 4} />
      <div style={{ position: "absolute", left: 90, right: 90, top: scanY, height: 6, borderRadius: 3, background: T.vivid, opacity: 0.5, boxShadow: `0 0 20px ${T.glow}` }} />
    </>
  );
};

const Items: React.FC<{ frame: number }> = ({ frame }) => (
  <>
    <Title text="чай песня *сәлам* маме" frame={frame} at={[F.tea, F.song, F.salam, F.mom]} size={96} />
    <Slots frame={frame} fill={[springAt(frame, F.tea - 4, SPRING.bouncy), springAt(frame, F.song - 4, SPRING.bouncy), springAt(frame, F.salam - 4, SPRING.bouncy)]} at={F.itemsIn - 40} />
    {/* a soft glow line ties the three slots into one day */}
    <div style={{ position: "absolute", left: 140, top: 940, height: 12, borderRadius: 6, width: 800 * ease.inOut(progress(frame, F.salam + 10, F.mom + 30)), background: `linear-gradient(90deg, ${T.glow}, ${T.vivid})` }} />
  </>
);

/* ───────── 5. Culture lives on weekdays: all seven days light up, the stage spotlight dims ───────── */

const Week: React.FC<{ frame: number }> = ({ frame }) => {
  const first = fadeOut(frame, F.notOnly - 14);
  const stage = pop(frame, F.weekIn + 8, SPRING.smooth);
  const dim = ease.inOut(progress(frame, F.stage - 6, F.stage + 20));
  return (
    <>
      {first > 0 && <Title text="культура живет *в будни*" frame={frame} at={[F.cultureW, F.lives, F.weekdays]} size={96} style={{ opacity: first }} />}
      {frame >= F.notOnly - 8 && <Title text="не только *на сцене*" frame={frame} at={[F.notOnly - 4, F.notOnly + 4, F.stage - 4, F.stage]} size={96} />}
      <div style={{ position: "absolute", left: 100, right: 100, top: 430, display: "flex", justifyContent: "space-between" }}>
        {Array.from({ length: 7 }, (_, k) => {
          const p = springAt(frame, F.weekIn + 4 + k * 3, SPRING.bouncy);
          const on = springAt(frame, F.weekdays - 6 + k * 6, SPRING.bouncy);
          return (
            <div key={k} style={{ width: 106, height: 106, borderRadius: 53, background: on > 0.5 ? (k === 1 ? T.main : T.vivid) : GRAY, border: "6px solid #fff", boxSizing: "border-box", boxShadow: SURFACE.boxShadow, transform: `scale(${p * (1 + 0.12 * Math.min(on, 1))})`, display: "grid", placeItems: "center" }}>
              {on > 0.5 && <div style={{ width: 26, height: 26, borderRadius: 13, background: T.pale }} />}
            </div>
          );
        })}
      </div>
      {/* the stage */}
      <div style={{ position: "absolute", left: 220, top: 620, width: 640, height: 540, ...stage.style, opacity: (stage.style.opacity as number) * lerp(1, 0.45, dim) }}>
        <svg width={640} height={540} viewBox="0 0 640 540">
          <defs>
            <linearGradient id="v44beam" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={T.glow} stopOpacity={0.9} />
              <stop offset="1" stopColor={T.glow} stopOpacity={0} />
            </linearGradient>
          </defs>
          <path d={`M300 10 L340 10 L${470 - 120 * dim} 440 L${170 + 120 * dim} 440 Z`} fill="url(#v44beam)" opacity={1 - dim * 0.9} />
          <path d="M0 0 H640 V40 Q 560 80 480 40 Q 400 80 320 40 Q 240 80 160 40 Q 80 80 0 40 Z" fill={T.main} />
          <path d="M0 40 Q 40 260 70 440 H0 Z" fill={T.vivid} />
          <path d="M640 40 Q 600 260 570 440 H640 Z" fill={T.vivid} />
          <rect x={0} y={440} width={640} height={60} rx={10} fill={T.main} />
          <ellipse cx={320} cy={440} rx={150 - 90 * dim} ry={22 - 12 * dim} fill={T.glow} opacity={0.8 - 0.6 * dim} />
        </svg>
      </div>
    </>
  );
};

/* ───────── 6. Write what Tatar was in your today: back to the year, today's dot lights up ───────── */

const Today: React.FC<{ frame: number }> = ({ frame }) => {
  const today = springAt(frame, F.todayW - 4, SPRING.bouncy);
  const plate = pop(frame, F.comments - 4, SPRING.bouncy);
  return (
    <>
      {fadeOut(frame, F.whatW - 12) > 0 && <Title text="*напиши*" frame={frame} at={[F.write]} size={104} style={{ opacity: fadeOut(frame, F.whatW - 12) }} />}
      {frame >= F.whatW - 6 && <Title text="что татарского *в твоем сегодня*" frame={frame} at={[F.whatW - 2, F.tatar, F.your, F.todayW]} size={92} />}
      <Year frame={frame} at={F.ctaIn + 2} lit={[{ m: SABANTUY[0], d: SABANTUY[1], t: 1 }, { m: TODAY[0], d: TODAY[1], t: today }]} />
      {plate.t > 0 && (
        <div style={{ position: "absolute", top: 1090, left: 0, right: 0, display: "flex", justifyContent: "center", ...plate.style }}>
          <div style={{ transform: "scale(2.2)", transformOrigin: "50% 0" }}>
            <GlassPlate bg={PLATE_PINE}>
              <MessageCircle size={18} strokeWidth={2.4} /> в комментарии
            </GlassPlate>
          </div>
        </div>
      )}
    </>
  );
};

/* ───────── Composition ───────── */

const SCENES: SceneDef[] = [
  { range: [0, F.todayIn], El: Hook },
  { range: [F.todayIn, F.leftIn], El: Tuesday },
  { range: [F.leftIn, F.itemsIn], El: Left },
  { range: [F.itemsIn, F.weekIn], El: Items },
  { range: [F.weekIn, F.ctaIn], El: Week },
  { range: [F.ctaIn, F.duration + 30], El: Today },
];

const SFX: Sfx[] = [
  { src: "sfx/07_CineStrike.wav", from: 2, volume: 0.16 },
  { src: "sfx2/ding.mp3", from: F.sabantuy, volume: 0.2 },
  // scene changes: textures from the SFX/ library (no whoosh)
  { src: "sfx/06_Ripple_Textures_II.wav", from: F.todayIn - 8, volume: 0.2 },
  { src: "sfx/04_Cyber_Shift.wav", from: F.leftIn - 8, volume: 0.2 },
  { src: "sfx/01_Ripple_Textures.wav", from: F.itemsIn - 8, volume: 0.18 },
  { src: "sfx/02_Alienated_Warpes.wav", from: F.weekIn - 8, volume: 0.14 },
  { src: "sfx/06_Ripple_Textures_II.wav", from: F.ctaIn - 8, volume: 0.2 },
  // 2. page tears, popper fizzles
  { src: "sfx2/click.mp3", from: F.today + 4, volume: 0.2 },
  { src: "sfx/05_Distortion_Glitch.wav", from: F.no - 2, volume: 0.04 },
  // 4. slots fill
  { src: "sfx2/pop.mp3", from: F.tea - 4, volume: 0.2 },
  { src: "sfx2/pop.mp3", from: F.song - 4, volume: 0.2 },
  { src: "sfx2/pop.mp3", from: F.salam - 4, volume: 0.22 },
  { src: "sfx2/ding.mp3", from: F.mom + 10, volume: 0.18 },
  // 5. days light up, the stage dims
  ...[0, 3, 6].map((k) => ({ src: "sfx2/click.mp3", from: F.weekdays - 6 + k * 6, volume: 0.16 })),
  { src: "sfx/03_Basscrack.wav", from: F.stage, volume: 0.08 },
  // 6. comments, today's dot
  { src: "sfx2/pop.mp3", from: F.comments - 4, volume: 0.24 },
  { src: "sfx2/ding.mp3", from: F.todayW - 4, volume: 0.2 },
  { src: "sfx/07_CineStrike.wav", from: F.todayW + 10, volume: 0.1 },
];

// All 30 poses of the main set, each at least once, by the meaning of the line; never the same photo twice in a row
const AVATAR_KEYS: AvatarKey[] = [
  // 1. hook: only on Sabantuy
  { at: 0, e: "point-up" },
  { at: 40, e: "explaining" },
  { at: 85, e: "skeptical" },
  { at: 125, e: "thinking" },
  { at: 165, e: "pensive" },
  { at: 210, e: "facepalm" },
  { at: 255, e: "delighted" },
  // 2. ordinary Tuesday, no holiday
  { at: F.todayIn, e: "shrug" },
  { at: 345, e: "arms-crossed" },
  { at: 405, e: "disappointed" },
  { at: 440, e: "puzzled" },
  // 3. what is left
  { at: F.leftIn, e: "surprised" },
  { at: 505, e: "point-right" },
  { at: 540, e: "displeased" },
  // 4. tea, song, сәлам
  { at: F.itemsIn, e: "smile-up" },
  { at: 630, e: "heart-hands" },
  { at: 684, e: "inspired" },
  { at: 730, e: "listening" },
  { at: 765, e: "waving" },
  { at: 800, e: "hand-on-heart" },
  // 5. weekdays, not only the stage
  { at: F.weekIn, e: "present-left" },
  { at: 880, e: "thumbs-up" },
  { at: 930, e: "stop" },
  { at: 965, e: "shush" },
  { at: 995, e: "dreamy" },
  // 6. write it
  { at: F.ctaIn, e: "point-down" },
  { at: 1065, e: "victory" },
  { at: 1110, e: "laughing" },
  { at: 1160, e: "clapping" },
  { at: 1210, e: "soft-smile" },
];

const STANCES: StanceKey[] = [
  { at: 0, s: "center" },
  { at: F.todayIn, s: "right" },
  { at: F.leftIn, s: "left" },
  { at: F.itemsIn, s: "right" },
  { at: F.weekIn, s: "left" },
  { at: F.ctaIn, s: "center" },
];

// Main set photos: scale the wide-framed ones so every photo fills the 540x590 box by height (same as V38)
const SIZE: Record<string, [number, number]> = {
  pensive: [1312, 1199], dreamy: [1293, 1217], displeased: [1254, 1254], surprised: [1280, 1229], waving: [1312, 1199], inspired: [1199, 1312], explaining: [1312, 1199], delighted: [1312, 1199], skeptical: [1312, 1199], laughing: [1385, 1136],
  puzzled: [1152, 1366], disappointed: [1278, 1230], "smile-up": [1199, 1312], thinking: [1190, 1322], "soft-smile": [1218, 1291], "point-up": [1312, 1199], "point-down": [1312, 1199], "present-left": [1312, 1199], "point-right": [1312, 1199], shrug: [1312, 1199],
  "hand-on-heart": [1312, 1199], stop: [1312, 1199], shush: [1312, 1199], clapping: [1278, 1230], "thumbs-up": [1312, 1199], "arms-crossed": [1312, 1199], facepalm: [1312, 1199], "heart-hands": [1312, 1199], victory: [1312, 1199], listening: [1312, 1199],
};
const FIT = Object.fromEntries(Object.entries(SIZE).map(([e, [w, h]]) => [e, Math.max(1, w / h / (540 / 590))])) as Partial<Record<Emotion, number>>;

const Host: React.FC<{ frame: number }> = ({ frame }) => <TatAvatar frame={frame} keys={AVATAR_KEYS} words={WORDS} stances={STANCES} fit={FIT} />;

export const Video44: React.FC = () => (
  <AbsoluteFill style={{ background: "#fff", fontFamily: PARAGRAPH.fontFamily, color: INK }}>
    <ReelShell scenes={SCENES} headlines={[]} vo={VO} sfx={SFX} duration={F.duration} music="v44/music/bed.mp3" musicLevel={[0.045, 0.11]} overlay={Host} bg={BG} />
  </AbsoluteFill>
);
