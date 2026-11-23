import React from "react";
import { AbsoluteFill } from "remotion";
import { Flag, Gavel } from "lucide-react";
import { SPRING, ease, lerp, progress, springAt } from "../stage/motion";
import { ReelShell, count, pop, shake, type SceneDef, type Sfx } from "../kit/reel";
import { TatAvatar, type AvatarKey, type Emotion, type StanceKey } from "../kit/TatAvatar";
import { DotOrbitBg } from "../kit/DotOrbitBg";
import { HEADING, INK, NUMBER, PARAGRAPH, SURFACE } from "../kit/design";
import { GlassPlate, PLATE } from "../catalog/own/glass";
import { Mark, Strike } from "../catalog/own/text";
import { F, VO } from "./timeline";
import { WORDS } from "./words";

// "Я татарин, но языка не знаю" (@the_tatarverse, RU, main host preset Ahu). ~20 s.
// Don't say it as an apology -> it's not a verdict, it's a starting point -> one phrase today, one more tomorrow -> the language comes back word by word.
// Own kit only. Palette: cobalt blue (language, knowledge). Dot Orbit variant 6 (output/bg-variant.txt).
const B = { main: "#1F3F94", vivid: "#3461D9", glow: "#9DB3F0", pale: "#EAF0FD" };
const BG = <DotOrbitBg variant={6} />;
const W = 1080;
const MUTED = "#8A8792";

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
        <span key={i} style={{ display: "inline-block", marginRight: i < all.length - 1 ? "0.24em" : 0, fontWeight: key ? 700 : 400, color: key ? B.main : undefined, opacity: Math.min(1, t * 1.3), transform: `translateY(${(1 - t) * 30}px)`, filter: `blur(${Math.max(0, (1 - t) * 8)}px)` }}>
          {raw}
        </span>
      );
    })}
  </div>
);

/* ───────── 1. Hook: the phrase people say as an apology ───────── */

const QUOTE: [string, number][] = [["я", 170], ["татарин", 186], ["но", 226], ["языка", 237], ["не", 259], ["знаю", 264]];
const Hook: React.FC<{ frame: number }> = ({ frame }) => {
  const out = progress(frame, F.quote - 24, F.quote - 10);
  const card = pop(frame, F.quote - 10, SPRING.smooth);
  // the card bows its head on "извинение"
  const bow = ease.inOut(progress(frame, F.apology, F.apology + 24));
  const sorry = pop(frame, F.apology - 6, SPRING.bouncy);
  return (
    <>
      {out < 1 && <Title text="не совершай эту *ошибку*" frame={frame} at={[-30, -24, -18, F.mistake - 6]} size={96} style={{ opacity: 1 - out }} />}
      {sorry.t > 0 && (
        <div style={{ ...HEADING, position: "absolute", top: 190, left: 0, right: 0, textAlign: "center", fontSize: 100, ...sorry.style }}>
          <Strike frame={frame} at={F.apology + 24}>
            извинение
          </Strike>
        </div>
      )}
      <div style={{ position: "absolute", top: 470, left: 60, right: 60, display: "flex", justifyContent: "center", ...card.style }}>
        <div style={{ ...SURFACE, padding: 56, borderBottomLeftRadius: 6, transformOrigin: "50% 100%", transform: `rotate(${-3 * bow}deg) scale(${1 - 0.06 * bow})`, ...PARAGRAPH, fontSize: 56, lineHeight: 1.2, textAlign: "center", whiteSpace: "nowrap" }}>
          {QUOTE.map(([w, at], i) => {
            const t = springAt(frame, at - 4, SPRING.smooth);
            return (
              <span key={i} style={{ display: "inline-block", marginRight: i < QUOTE.length - 1 ? "0.26em" : 0, opacity: Math.min(1, t * 1.4), transform: `translateY(${(1 - t) * 16}px)`, fontWeight: w === "языка" ? 700 : 400, color: w === "языка" ? B.main : INK }}>
                {w}
              </span>
            );
          })}
        </div>
      </div>
    </>
  );
};

/* ───────── 2. As if you had to justify yourself: the judge's gavel ───────── */

const Excuse: React.FC<{ frame: number }> = ({ frame }) => {
  const tile = pop(frame, F.excuseIn + 4, SPRING.bouncy);
  // gavel lifts, then hits on "оправдываться"
  const lift = ease.out(progress(frame, F.excuseIn + 10, F.justify - 4));
  const hit = springAt(frame, F.justify - 4, SPRING.bouncy);
  const angle = lift * -38 * (1 - Math.min(hit, 1));
  const s = shake(frame, F.justify + 2, 14, 18);
  return (
    <>
      <Title text="будто нужно *оправдываться*" frame={frame} at={[F.excuseIn + 2, F.excuseIn + 12, F.justify]} size={84} />
      <div style={{ position: "absolute", top: 520, left: 0, right: 0, display: "flex", justifyContent: "center", ...tile.style }}>
        <div style={{ ...SURFACE, width: 360, height: 360, display: "grid", placeItems: "center", transform: `translateX(${s}px)` }}>
          <div style={{ transform: `rotate(${angle}deg)`, transformOrigin: "80% 80%" }}>
            <Gavel size={170} color={B.vivid} strokeWidth={1.7} />
          </div>
        </div>
      </div>
    </>
  );
};

/* ───────── 3. Not a verdict, a starting point: day 1 on an empty track ───────── */

const Start: React.FC<{ frame: number }> = ({ frame }) => {
  const a = pop(frame, F.verdict - 8, SPRING.smooth);
  const b = pop(frame, F.point - 6, SPRING.smooth);
  const track = ease.out(progress(frame, F.startIn + 10, F.startIn + 50));
  const go = ease.inOut(progress(frame, F.start, F.start + 50));
  const ring = (frame - F.start) / 40;
  const plate = pop(frame, F.start + 6, SPRING.bouncy);
  const X0 = 180;
  const X1 = 900;
  return (
    <>
      <div style={{ ...HEADING, position: "absolute", top: 170, left: 0, right: 0, textAlign: "center", fontSize: 92, lineHeight: 1.3 }}>
        <div style={a.style}>
          <Strike frame={frame} at={F.verdict + 18}>
            приговор
          </Strike>
        </div>
        <div style={b.style}>
          точка <b style={{ color: B.main }}>старта</b>
        </div>
      </div>
      <svg width={W} height={1300} style={{ position: "absolute", inset: 0 }}>
        <line x1={X0} y1={820} x2={lerp(X0, X1, track)} y2={820} stroke="#E3E5EC" strokeWidth={10} strokeLinecap="round" />
        <line x1={X0} y1={820} x2={lerp(X0, X1, go)} y2={820} stroke={B.vivid} strokeWidth={10} strokeLinecap="round" strokeDasharray="2 26" opacity={go > 0 ? 1 : 0} />
        {frame >= F.start &&
          [0, 0.5].map((k) => {
            const r = (ring + k) % 1;
            return <circle key={k} cx={X0} cy={820} r={30 + r * 70} fill="none" stroke={B.glow} strokeWidth={5} opacity={1 - r} />;
          })}
        <circle cx={X0} cy={820} r={30} fill={B.vivid} stroke="#fff" strokeWidth={8} />
      </svg>
      {plate.t > 0 && (
        <div style={{ position: "absolute", top: 630, left: X0 - 40, ...plate.style }}>
          <div style={{ transform: "scale(2.1)", transformOrigin: "0 50%" }}>
            <GlassPlate bg={PLATE.cobalt}>
              <Flag size={18} strokeWidth={2.2} /> день 1
            </GlassPlate>
          </div>
        </div>
      )}
    </>
  );
};

/* ───────── 4. Start with one phrase: Хәерле көн ───────── */

const Phrase: React.FC<{ frame: number }> = ({ frame }) => {
  const card = pop(frame, F.tatar - 12, SPRING.bouncy);
  const mean = pop(frame, F.meaning - 6, SPRING.smooth);
  // voice bars move while she says the phrase
  const talking = progress(frame, F.tatar - 4, F.tatar + 6) * (1 - progress(frame, F.meaning - 10, F.meaning + 4));
  return (
    <>
      <Title text="*одна* фраза" frame={frame} at={[F.phrase - 16, F.phrase]} size={100} />
      <div style={{ position: "absolute", top: 440, left: 100, right: 100, display: "flex", justifyContent: "center", ...card.style }}>
        <div style={{ ...SURFACE, padding: 64, display: "flex", flexDirection: "column", alignItems: "center", gap: 34 }}>
          <div style={{ ...HEADING, fontSize: 124, lineHeight: 1, whiteSpace: "nowrap" }}>
            <Mark frame={frame} at={F.tatar + 26} color={B.main}>
              <b>Хәерле көн</b>
            </Mark>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, height: 70 }}>
            {Array.from({ length: 15 }, (_, i) => {
              const h = 14 + talking * 50 * Math.abs(Math.sin(frame / 5 + i * 1.3) * Math.cos(i * 0.7));
              return <div key={i} style={{ width: 12, height: h, borderRadius: 6, background: i % 3 === 0 ? B.vivid : B.glow }} />;
            })}
          </div>
          <div style={{ ...PARAGRAPH, fontSize: 60, lineHeight: 1, color: MUTED, ...mean.style }}>добрый день</div>
        </div>
      </div>
    </>
  );
};

/* ───────── 5. Tomorrow one more: a streak of days fills up ───────── */

const DAYS = [F.tomorrowIn + 8, F.more, F.more + 34];
const Tomorrow: React.FC<{ frame: number }> = ({ frame }) => (
  <>
    <Title text="завтра *еще* одна" frame={frame} at={[F.tomorrowIn + 2, F.more - 2, F.more + 10]} size={96} />
    <div style={{ position: "absolute", top: 520, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 18 }}>
      {Array.from({ length: 7 }, (_, i) => {
        const p = springAt(frame, F.tomorrowIn + 4 + i * 3, SPRING.bouncy);
        const on = i < DAYS.length ? springAt(frame, DAYS[i], SPRING.bouncy) : 0;
        const lit = on > 0.5;
        return (
          <div key={i} style={{ ...SURFACE, width: 112, height: 150, display: "grid", placeItems: "center", background: lit ? B.vivid : "#fff", boxShadow: lit ? `0 0 0 ${6 * Math.min(on, 1)}px ${B.pale}, ${SURFACE.boxShadow}` : SURFACE.boxShadow, transform: `scale(${p * (1 + 0.12 * Math.max(0, Math.sin(Math.min(on, 1) * Math.PI)))})`, opacity: Math.min(1, p * 1.5) }}>
            <span style={{ ...NUMBER, fontSize: 64, color: lit ? "#fff" : "#C9CCD6" }}>{i + 1}</span>
          </div>
        );
      })}
    </div>
  </>
);

/* ───────── 6. The language comes back word by word: dots fill, the word counter grows ───────── */

const COLS = 12;
const ROWS = 6;
const Back: React.FC<{ frame: number }> = ({ frame }) => {
  const sub = pop(frame, F.word - 34, SPRING.smooth);
  const total = COLS * ROWS;
  // one by one, then faster and faster
  const filled = Math.floor(total * ease.in(progress(frame, F.backIn + 20, F.duration - 10)));
  const n = count(frame, F.backIn + 20, F.duration - 10, 1, 365, ease.in);
  return (
    <>
      <div style={{ ...HEADING, position: "absolute", top: 170, left: 60, right: 60, textAlign: "center", fontSize: 92 }}>
        <div style={pop(frame, F.backIn, SPRING.smooth).style}>
          язык{" "}
          <Mark frame={frame} at={F.back + 10} color={B.main}>
            <b>возвращается</b>
          </Mark>
        </div>
        <div style={{ ...PARAGRAPH, fontSize: 62, marginTop: 26, ...sub.style }}>по одному слову</div>
      </div>
      <div style={{ position: "absolute", top: 560, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${COLS}, 44px)`, gap: 22 }}>
          {Array.from({ length: total }, (_, i) => {
            const on = i < Math.max(1, filled);
            return <div key={i} style={{ width: 44, height: 44, borderRadius: 22, background: on ? (i % 5 === 0 ? B.main : B.vivid) : "#ECEEF3", transform: `scale(${on ? 1 : 0.7})` }} />;
          })}
        </div>
      </div>
      <div style={{ position: "absolute", top: 1010, left: 0, right: 0, textAlign: "center", ...NUMBER, fontSize: 150, color: B.main, ...sub.style }}>{n}</div>
    </>
  );
};

/* ───────── Composition ───────── */

const SCENES: SceneDef[] = [
  { range: [0, F.excuseIn], El: Hook },
  { range: [F.excuseIn, F.startIn], El: Excuse },
  { range: [F.startIn, F.phraseIn], El: Start },
  { range: [F.phraseIn, F.tomorrowIn], El: Phrase },
  { range: [F.tomorrowIn, F.backIn], El: Tomorrow },
  { range: [F.backIn, F.duration + 30], El: Back },
];

const SFX: Sfx[] = [
  { src: "sfx/07_CineStrike.wav", from: 2, volume: 0.18 },
  { src: "sfx2/pop.mp3", from: F.quote - 8, volume: 0.26 },
  { src: "sfx2/pop.mp3", from: F.apology - 4, volume: 0.24 },
  { src: "sfx/05_Distortion_Glitch.wav", from: F.apology + 54, volume: 0.05 },
  // scene changes: textures from the SFX/ library (no whoosh)
  { src: "sfx/06_Ripple_Textures_II.wav", from: F.excuseIn - 8, volume: 0.2 },
  { src: "sfx/04_Cyber_Shift.wav", from: F.startIn - 8, volume: 0.2 },
  { src: "sfx/01_Ripple_Textures.wav", from: F.phraseIn - 8, volume: 0.18 },
  { src: "sfx/02_Alienated_Warpes.wav", from: F.tomorrowIn - 8, volume: 0.14 },
  { src: "sfx/06_Ripple_Textures_II.wav", from: F.backIn - 8, volume: 0.2 },
  // 2. gavel
  { src: "sfx/03_Basscrack.wav", from: F.justify, volume: 0.14 },
  // 3. verdict struck, start
  { src: "sfx/05_Distortion_Glitch.wav", from: F.verdict + 48, volume: 0.04 },
  { src: "sfx2/ding.mp3", from: F.start + 4, volume: 0.22 },
  // 4. the phrase
  { src: "sfx2/pop.mp3", from: F.tatar - 10, volume: 0.26 },
  // 5. days light up
  ...DAYS.map((d) => ({ src: "sfx2/click.mp3", from: d, volume: 0.2 })),
  // 6. final hit
  { src: "sfx/07_CineStrike.wav", from: F.word, volume: 0.12 },
];

// All 30 poses of the main set, each at least once; a swap every ~0.6 s by the meaning of the line, never the same photo twice in a row
const AVATAR_KEYS: AvatarKey[] = [
  // 1. hook
  { at: 0, e: "stop" },
  { at: 42, e: "point-up" },
  { at: 85, e: "shush" },
  { at: 125, e: "explaining" },
  { at: 165, e: "shrug" },
  { at: 205, e: "facepalm" },
  { at: 245, e: "disappointed" },
  { at: 280, e: "arms-crossed" },
  { at: 315, e: "displeased" },
  // 2. justify
  { at: F.excuseIn, e: "puzzled" },
  { at: 400, e: "skeptical" },
  { at: 440, e: "pensive" },
  // 3. starting point
  { at: F.startIn, e: "thinking" },
  { at: 520, e: "surprised" },
  { at: 558, e: "listening" },
  { at: 592, e: "point-right" },
  { at: 628, e: "inspired" },
  // 4. one phrase
  { at: F.phraseIn, e: "explaining" },
  { at: 712, e: "point-down" },
  { at: 752, e: "soft-smile" },
  { at: 792, e: "smile-up" },
  { at: 832, e: "present-left" },
  { at: 866, e: "hand-on-heart" },
  // 5. tomorrow one more
  { at: F.tomorrowIn, e: "thumbs-up" },
  { at: 935, e: "delighted" },
  { at: 965, e: "clapping" },
  { at: 995, e: "laughing" },
  // 6. word by word
  { at: F.backIn, e: "victory" },
  { at: 1052, e: "dreamy" },
  { at: 1088, e: "heart-hands" },
  { at: 1124, e: "waving" },
];

const STANCES: StanceKey[] = [
  { at: 0, s: "center" },
  { at: F.excuseIn, s: "right" },
  { at: F.startIn, s: "left" },
  { at: F.phraseIn, s: "right" },
  { at: F.tomorrowIn, s: "left" },
  { at: F.backIn, s: "center" },
];

// Main set photos: scale the wide-framed ones so every photo fills the 540x590 box by height (as V21-V23 do for Alicja)
const SIZE: Record<string, [number, number]> = {
  pensive: [1312, 1199], dreamy: [1293, 1217], displeased: [1254, 1254], surprised: [1280, 1229], waving: [1312, 1199], inspired: [1199, 1312], explaining: [1312, 1199], delighted: [1312, 1199], skeptical: [1312, 1199], laughing: [1385, 1136],
  puzzled: [1152, 1366], disappointed: [1278, 1230], "smile-up": [1199, 1312], thinking: [1190, 1322], "soft-smile": [1218, 1291], "point-up": [1312, 1199], "point-down": [1312, 1199], "present-left": [1312, 1199], "point-right": [1312, 1199], shrug: [1312, 1199],
  "hand-on-heart": [1312, 1199], stop: [1312, 1199], shush: [1312, 1199], clapping: [1278, 1230], "thumbs-up": [1312, 1199], "arms-crossed": [1312, 1199], facepalm: [1312, 1199], "heart-hands": [1312, 1199], victory: [1312, 1199], listening: [1312, 1199],
};
const FIT = Object.fromEntries(Object.entries(SIZE).map(([e, [w, h]]) => [e, Math.max(1, w / h / (540 / 590))])) as Partial<Record<Emotion, number>>;

const Host: React.FC<{ frame: number }> = ({ frame }) => <TatAvatar frame={frame} keys={AVATAR_KEYS} words={WORDS} stances={STANCES} fit={FIT} />;

export const Video24: React.FC = () => (
  <AbsoluteFill style={{ background: "#fff", fontFamily: PARAGRAPH.fontFamily }}>
    <ReelShell scenes={SCENES} headlines={[]} vo={VO} sfx={SFX} duration={F.duration} music="v24/music/bed.mp3" musicLevel={[0.045, 0.11]} overlay={Host} bg={BG} />
  </AbsoluteFill>
);
