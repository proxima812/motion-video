import React from "react";
import { AbsoluteFill } from "remotion";
import { HeartHandshake } from "lucide-react";
import { SPRING, ease, lerp, progress, springAt } from "../stage/motion";
import { K, ReelShell, count, pop, shake, type SceneDef, type Sfx } from "../kit/reel";
import { TatAvatar, type AvatarKey, type Emotion, type StanceKey } from "../kit/TatAvatar";
import { DotOrbitBg } from "../kit/DotOrbitBg";
import { HEADING, INK, NUMBER, PARAGRAPH, SURFACE } from "../kit/design";
import { GlassPlate } from "../catalog/own/glass";
import { Mark } from "../catalog/own/text";
import { F, VO } from "./timeline";
import { WORDS } from "./words";

// "Не исправляй каждое слово" (@the_tatarverse, RU, host preset 2 Alicja). ~21 s.
// A friend tries Tatar for the first time -> you interrupt with corrections -> he goes quiet -> let him finish, answer in Tatar; fix later, support first.
// Own kit only. Palette: sage (gentle growth, patience). Dot Orbit variant 3 (output/bg-variant.txt).
const T = { main: "#4F6B3A", vivid: "#6E9450", glow: "#B9D3A3", pale: "#F0F6EA" };
const PLATE_SAGE = "linear-gradient(135deg, #8DB56A, #4F6B3A)";
const BG = <DotOrbitBg variant={3} />;
const RED = K.red;
const GRAY = "#E4E6E1";

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

/** Round "face" of a chat participant (no icon, just a colored disc with two eyes) */
const Face: React.FC<{ color: string; size?: number }> = ({ color, size = 124 }) => (
  <div style={{ width: size, height: size, borderRadius: size / 2, background: color, flex: "none", position: "relative", border: "6px solid #fff", boxShadow: SURFACE.boxShadow }}>
    {[0.34, 0.6].map((x) => (
      <div key={x} style={{ position: "absolute", left: `${x * 100}%`, top: "40%", width: size * 0.09, height: size * 0.09, borderRadius: size, background: INK }} />
    ))}
  </div>
);

/** Typing dots (three discs), pulsing; `life` 0..1 fades them */
const Dots: React.FC<{ frame: number; life?: number }> = ({ frame, life = 1 }) => (
  <span style={{ display: "inline-flex", gap: 10, alignItems: "center", padding: "0 6px", opacity: life }}>
    {[0, 1, 2].map((k) => (
      <span key={k} style={{ width: 14, height: 14, borderRadius: 7, background: T.glow, transform: `translateY(${Math.sin((frame - k * 6) / 6) * 5 * life}px)` }} />
    ))}
  </span>
);

/** Friend's bubble: words appear at their beats; gaps between them are typing dots */
const FRIEND_WORDS = ["мин", "татарча", "өйрәнәм"];
const FriendBubble: React.FC<{ frame: number; at: number[]; dots?: boolean; dotLife?: number; style?: React.CSSProperties; mark?: number }> = ({ frame, at, dots = true, dotLife = 1, style, mark }) => {
  const shown = at.filter((a) => frame >= a - 4).length;
  return (
    <div style={{ position: "absolute", left: 100, top: 520, display: "flex", alignItems: "flex-end", gap: 24, ...style }}>
      <Face color={T.glow} />
      <div style={{ ...SURFACE, borderBottomLeftRadius: 6, padding: 40, display: "flex", alignItems: "center", gap: 20, ...PARAGRAPH, fontSize: 68, lineHeight: 1 }}>
        {at.map((a, i) => {
          const p = pop(frame, a - 4, SPRING.bouncy);
          if (i >= shown) return null;
          return (
            <span key={i} style={{ position: "relative", ...p.style }}>
              {FRIEND_WORDS[i]}
              {mark !== undefined && i === 0 && <Squiggle frame={frame} at={mark} w={110} />}
            </span>
          );
        })}
        {dots && <Dots frame={frame} life={dotLife} />}
      </div>
    </div>
  );
};

/** Red-pen wavy underline that draws itself */
const Squiggle: React.FC<{ frame: number; at: number; w: number; top?: number; left?: number }> = ({ frame, at, w, top, left = -4 }) => {
  const d = ease.out(progress(frame, at, at + 12));
  if (d <= 0) return null;
  const n = Math.max(3, Math.round(w / 26));
  const path = Array.from({ length: n * 2 + 1 }, (_, i) => `${(i / (n * 2)) * w},${i % 2 ? 0 : 14}`).join(" L ");
  return (
    <svg width={w + 8} height={22} style={{ position: "absolute", left, top: top ?? "100%", overflow: "visible" }}>
      <path d={`M ${path}`} fill="none" stroke={RED} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - d} transform="translate(4,4)" />
    </svg>
  );
};

/* ───────── 1. Hook: a sheet where every word gets a red-pen mark ───────── */

const ROWS = [
  [220, 150, 260],
  [180, 280, 140],
  [240, 130, 230],
];
const Hook: React.FC<{ frame: number }> = ({ frame }) => {
  const card = pop(frame, 6, SPRING.smooth);
  const first = fadeOut(frame, F.every - 12);
  const marks = ROWS.flat().map((_, i) => F.every + 8 + i * 9);
  const done = marks.filter((m) => frame >= m).length;
  return (
    <>
      {first > 0 && <Title text="не совершай эту *ошибку*" frame={frame} at={[-30, -24, -18, F.mistake - 6]} size={92} style={{ opacity: first }} />}
      {frame >= F.every - 4 && <Title text="не исправляй *каждое* слово" frame={frame} at={[F.every - 2, F.every + 6, F.each, F.word]} size={92} />}
      <div style={{ position: "absolute", top: 480, left: 110, right: 110, ...SURFACE, padding: 64, display: "flex", flexDirection: "column", gap: 92, ...card.style }}>
        {ROWS.map((row, r) => (
          <div key={r} style={{ display: "flex", gap: 34 }}>
            {row.map((w, c) => {
              const at = marks[r * 3 + c];
              return (
                <div key={c} style={{ position: "relative", width: w * 0.95, height: 44, borderRadius: 22, background: GRAY, transform: `translateX(${shake(frame, at, 4, 12)}px)` }}>
                  <Squiggle frame={frame} at={at} w={w * 0.95} top={56} />
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", top: 420, right: 80, width: 130, height: 130, borderRadius: 65, background: RED, color: "#fff", display: "grid", placeItems: "center", ...NUMBER, fontSize: 56, transform: `scale(${springAt(frame, marks[0], SPRING.bouncy) * (1 + 0.12 * Math.max(0, 1 - progress(frame, marks[Math.max(0, done - 1)], marks[Math.max(0, done - 1)] + 8)))})` }}>
        {done}
      </div>
    </>
  );
};

/* ───────── 2. A friend speaks Tatar for the first time: slow words, long pauses, a hesitant waveform ───────── */

const VOICED: [number, number][] = [
  [F.min, F.min + 28],
  [F.tatarcha, F.tatarcha + 36],
  [F.oyrenem, F.oyrenem + 42],
];
const BARS = 30;
const Wave: React.FC<{ frame: number; from: number; flat?: number; style?: React.CSSProperties }> = ({ frame, from, flat = 0, style }) => (
  <div style={{ position: "absolute", top: 900, left: 110, right: 110, height: 260, ...SURFACE, padding: 40, display: "flex", alignItems: "center", justifyContent: "space-between", ...style }}>
    {Array.from({ length: BARS }, (_, i) => {
      const t = from + i * 4.6;
      const on = frame >= t;
      const voiced = VOICED.some(([a, b]) => t >= a - 4 && t <= b);
      const h = voiced ? 40 + 70 * Math.abs(Math.sin(i * 1.7)) : 10;
      return <div key={i} style={{ width: 12, borderRadius: 6, height: on ? lerp(h, 10, flat) : 0, background: voiced ? T.vivid : GRAY }} />;
    })}
  </div>
);
const Friend: React.FC<{ frame: number }> = ({ frame }) => (
  <>
    <Title text="друг говорит *впервые*" frame={frame} at={[F.friendIn + 4, F.friendIn + 12, F.first]} size={92} />
    <FriendBubble frame={frame} at={[F.min, F.tatarcha, F.oyrenem]} dots={frame < F.oyrenem - 4} style={pop(frame, F.tatar, SPRING.smooth).style} />
    <Wave frame={frame} from={F.min - 20} style={pop(frame, F.tatar + 10, SPRING.smooth).style} />
  </>
);

/* ───────── 3. You interrupt: your bubble cuts in, his is pushed aside and marked red ───────── */

const Cut: React.FC<{ frame: number }> = ({ frame }) => {
  const mine = pop(frame, F.notSo - 6, SPRING.bouncy);
  const push = springAt(frame, F.notSo - 6, SPRING.bouncy);
  const swap = frame >= F.likeThis - 4;
  const swapT = pop(frame, F.likeThis - 4, SPRING.bouncy);
  return (
    <>
      <Title text="а ты *перебиваешь*" frame={frame} at={[F.cutIn + 4, F.cutIn + 10, F.interrupt]} size={92} />
      <FriendBubble frame={frame} at={[F.cutIn - 20]} dotLife={1 - 0.7 * Math.min(1, push)} mark={F.right} style={{ transform: `translate(${shake(frame, F.notSo - 2, 14, 24) - 30 * Math.min(1, push)}px, 0) scale(${1 - 0.1 * Math.min(1, push)})`, transformOrigin: "0% 100%", opacity: 1 - 0.35 * Math.min(1, push) }} />
      <div style={{ position: "absolute", right: 100, top: 860, display: "flex", alignItems: "flex-end", gap: 24, ...mine.style }}>
        <div style={{ ...SURFACE, borderBottomRightRadius: 6, padding: 44, background: T.vivid, ...PARAGRAPH, fontWeight: 700, fontSize: 92, lineHeight: 1, color: "#fff" }}>
          <span style={{ display: "inline-block", ...(swap ? swapT.style : {}) }}>{swap ? "вот так" : "не так"}</span>
        </div>
        <Face color={T.main} />
      </div>
    </>
  );
};

/* ───────── 4. He goes quiet: dots fade, the waveform goes flat, the day counter keeps running ───────── */

const Quiet: React.FC<{ frame: number }> = ({ frame }) => {
  const fade = ease.inOut(progress(frame, F.quiet, F.quiet + 60));
  const days = count(frame, F.long, F.long + 60, 1, 47);
  const counter = pop(frame, F.long - 4, SPRING.bouncy);
  return (
    <>
      <Title text="он *замолкает*" frame={frame} at={[F.quietIn + 4, F.quiet]} size={92} />
      <FriendBubble frame={frame} at={[]} dotLife={1 - fade} style={{ top: 460, opacity: 1 - 0.3 * fade }} />
      <Wave frame={frame} from={-1000} flat={fade} style={{ top: 700 }} />
      <div style={{ position: "absolute", top: 1030, left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "baseline", gap: 26, ...counter.style }}>
        <span style={{ ...NUMBER, fontSize: 150, color: T.main }}>{days}</span>
        <span style={{ ...HEADING, fontSize: 80 }}>
          <Mark frame={frame} at={F.long + 4} color={T.main}>
            дней
          </Mark>
        </span>
      </div>
    </>
  );
};

/* ───────── 5. Let him finish: the full phrase lands, you answer in Tatar ───────── */

const Finish: React.FC<{ frame: number }> = ({ frame }) => {
  const first = fadeOut(frame, F.smile + 10);
  const reply = pop(frame, F.inTatar - 6, SPRING.bouncy);
  const glow = ease.out(progress(frame, F.finish + 40, F.finish + 70));
  return (
    <>
      {first > 0 && <Title text="дай *договорить*" frame={frame} at={[F.finishIn + 4, F.finish]} size={96} style={{ opacity: first }} />}
      {frame >= F.smile + 14 && <Title text="ответь на *татарском*" frame={frame} at={[F.smile + 16, F.answer, F.inTatar]} size={92} />}
      <FriendBubble frame={frame} at={[F.finish, F.finish + 16, F.finish + 32]} dots={false} style={{ top: 540, filter: `drop-shadow(0 0 ${30 * glow}px ${T.glow})` }} />
      {reply.t > 0 && (
        <div style={{ position: "absolute", right: 100, top: 840, display: "flex", alignItems: "flex-end", gap: 24, ...reply.style }}>
          <div style={{ ...SURFACE, borderBottomRightRadius: 6, padding: 44, background: T.vivid, ...PARAGRAPH, fontWeight: 700, fontSize: 92, lineHeight: 1, color: "#fff" }}>афәрин</div>
          <Face color={T.main} />
        </div>
      )}
    </>
  );
};

/* ───────── 6. Fix later, support first: the two steps swap places ───────── */

const Later: React.FC<{ frame: number }> = ({ frame }) => {
  const s = ease.inOut(progress(frame, F.firstly - 6, F.firstly + 24));
  const enter = pop(frame, F.laterIn + 10, SPRING.smooth);
  const Y = [600, 900];
  const row = (y: number, n: number, child: React.ReactNode, dim: number) => (
    <div style={{ position: "absolute", left: 140, right: 140, top: y, height: 160, display: "flex", alignItems: "center", gap: 40 }}>
      <div style={{ width: 110, height: 110, borderRadius: 55, ...SURFACE, display: "grid", placeItems: "center", ...NUMBER, fontSize: 60, color: T.main, flex: "none" }}>{n}</div>
      <div style={{ opacity: dim }}>{child}</div>
    </div>
  );
  return (
    <>
      <Title text="исправить можно *потом*" frame={frame} at={[F.laterIn + 2, F.laterIn + 12, F.later]} size={92} />
      <div style={{ position: "absolute", inset: 0, ...enter.style }}>
        {row(lerp(Y[0], Y[1], s), s > 0.5 ? 2 : 1,
          <div style={{ ...SURFACE, padding: "40px 48px", ...PARAGRAPH, fontSize: 60, lineHeight: 1, position: "relative" }}>
            исправления
            <Squiggle frame={frame} at={F.laterIn + 30} w={330} top={104} left={44} />
          </div>,
          1 - 0.45 * s,
        )}
        {row(lerp(Y[1], Y[0], s), s > 0.5 ? 1 : 2,
          <div style={{ transform: `scale(${2.3 + 0.15 * Math.max(0, 1 - progress(frame, F.support, F.support + 16))})`, transformOrigin: "0% 50%", marginLeft: 6 }}>
            <GlassPlate bg={PLATE_SAGE}>
              <HeartHandshake size={20} strokeWidth={2.2} /> поддержка
            </GlassPlate>
          </div>,
          0.55 + 0.45 * s,
        )}
      </div>
    </>
  );
};

/* ───────── Composition ───────── */

const SCENES: SceneDef[] = [
  { range: [0, F.friendIn], El: Hook },
  { range: [F.friendIn, F.cutIn], El: Friend },
  { range: [F.cutIn, F.quietIn], El: Cut },
  { range: [F.quietIn, F.finishIn], El: Quiet },
  { range: [F.finishIn, F.laterIn], El: Finish },
  { range: [F.laterIn, F.duration + 30], El: Later },
];

const SFX: Sfx[] = [
  { src: "sfx/07_CineStrike.wav", from: 2, volume: 0.18 },
  // red-pen marks on every word (a few clicks, not all nine)
  ...[0, 3, 6, 8].map((k) => ({ src: "sfx2/click.mp3", from: F.every + 8 + k * 9, volume: 0.18 })),
  // scene changes: textures from the SFX/ library (no whoosh)
  { src: "sfx/01_Ripple_Textures.wav", from: F.friendIn - 8, volume: 0.18 },
  { src: "sfx/04_Cyber_Shift.wav", from: F.cutIn - 8, volume: 0.2 },
  { src: "sfx/06_Ripple_Textures_II.wav", from: F.quietIn - 8, volume: 0.2 },
  { src: "sfx/02_Alienated_Warpes.wav", from: F.finishIn - 8, volume: 0.14 },
  { src: "sfx/01_Ripple_Textures.wav", from: F.laterIn - 8, volume: 0.18 },
  // 2. friend's words
  { src: "sfx2/pop.mp3", from: F.min - 4, volume: 0.2 },
  { src: "sfx2/pop.mp3", from: F.tatarcha - 4, volume: 0.2 },
  { src: "sfx2/pop.mp3", from: F.oyrenem - 4, volume: 0.2 },
  // 3. you cut in, red pen
  { src: "sfx/03_Basscrack.wav", from: F.notSo - 6, volume: 0.1 },
  { src: "sfx/05_Distortion_Glitch.wav", from: F.right, volume: 0.05 },
  // 4. silence, days
  { src: "sfx2/click.mp3", from: F.long - 2, volume: 0.18 },
  // 5. full phrase, reply
  { src: "sfx2/ding.mp3", from: F.finish + 36, volume: 0.2 },
  { src: "sfx2/pop.mp3", from: F.inTatar - 6, volume: 0.24 },
  // 6. swap, support
  { src: "sfx2/click.mp3", from: F.firstly - 4, volume: 0.2 },
  { src: "sfx/07_CineStrike.wav", from: F.support, volume: 0.12 },
];

// All 30 poses of the Alicja set, each at least once; a swap every ~0.7 s by the meaning of the line, never the same photo twice in a row
const AVATAR_KEYS: AvatarKey[] = [
  // 1. hook: don't correct every word
  { at: 0, e: "stop" },
  { at: 40, e: "point-up" },
  { at: 80, e: "displeased" },
  { at: 120, e: "shush" },
  { at: 165, e: "skeptical" },
  // 2. a friend speaks Tatar for the first time
  { at: F.friendIn, e: "explaining" },
  { at: 260, e: "listening" },
  { at: 300, e: "delighted" },
  { at: 345, e: "soft-smile" },
  { at: 390, e: "smile-up" },
  { at: 435, e: "inspired" },
  // 3. you interrupt
  { at: F.cutIn, e: "surprised" },
  { at: 530, e: "puzzled" },
  { at: 565, e: "point-right" },
  { at: 605, e: "arms-crossed" },
  { at: 645, e: "facepalm" },
  // 4. he goes quiet
  { at: F.quietIn, e: "disappointed" },
  { at: 735, e: "pensive" },
  { at: 775, e: "thinking" },
  { at: 810, e: "shrug" },
  // 5. let him finish, answer in Tatar
  { at: F.finishIn, e: "point-down" },
  { at: 880, e: "waving" },
  { at: 920, e: "laughing" },
  { at: 965, e: "thumbs-up" },
  { at: 1005, e: "clapping" },
  // 6. fix later, support first
  { at: F.laterIn, e: "present-left" },
  { at: 1090, e: "hand-on-heart" },
  { at: 1135, e: "heart-hands" },
  { at: 1175, e: "victory" },
  { at: 1215, e: "dreamy" },
];

const STANCES: StanceKey[] = [
  { at: 0, s: "center" },
  { at: F.friendIn, s: "right" },
  { at: F.cutIn, s: "left" },
  { at: F.quietIn, s: "right" },
  { at: F.finishIn, s: "left" },
  { at: F.laterIn, s: "center" },
];

// Alicja photos: scale the wide-framed ones so every photo fills the 540x590 box by height (same as V25)
const SIZE: Record<string, [number, number]> = {
  pensive: [1129, 1393], dreamy: [1293, 1216], displeased: [1254, 1254], surprised: [1280, 1229], waving: [1312, 1199], inspired: [1199, 1312], explaining: [1312, 1199], delighted: [1312, 1199], skeptical: [1312, 1199], laughing: [1385, 1136],
  puzzled: [1129, 1393], disappointed: [1278, 1230], "smile-up": [1199, 1312], thinking: [1129, 1393], "soft-smile": [1164, 1351], "point-up": [1312, 1199], "point-down": [1312, 1199], "present-left": [1312, 1199], "point-right": [1312, 1199], shrug: [1312, 1199],
  "hand-on-heart": [1312, 1199], stop: [1312, 1199], shush: [1199, 1312], clapping: [1312, 1199], "thumbs-up": [1312, 1199], "arms-crossed": [1199, 1312], facepalm: [1312, 1199], "heart-hands": [1312, 1199], victory: [1312, 1199], listening: [1312, 1199],
};
const FIT = Object.fromEntries(Object.entries(SIZE).map(([e, [w, h]]) => [e, Math.max(1, w / h / (540 / 590))])) as Partial<Record<Emotion, number>>;

const Host: React.FC<{ frame: number }> = ({ frame }) => <TatAvatar frame={frame} keys={AVATAR_KEYS} words={WORDS} stances={STANCES} dir="v33/avatar" fit={FIT} />;

export const Video33: React.FC = () => (
  <AbsoluteFill style={{ background: "#fff", fontFamily: PARAGRAPH.fontFamily, color: INK }}>
    <ReelShell scenes={SCENES} headlines={[]} vo={VO} sfx={SFX} duration={F.duration} music="v33/music/bed.mp3" musicLevel={[0.045, 0.11]} overlay={Host} bg={BG} />
  </AbsoluteFill>
);
