import React from "react";
import { AbsoluteFill } from "remotion";
import { BookOpen } from "lucide-react";
import { SPRING, ease, lerp, progress, springAt } from "../stage/motion";
import { ReelShell, pop, type SceneDef, type Sfx } from "../kit/reel";
import { TatAvatar, type AvatarKey, type Emotion, type StanceKey } from "../kit/TatAvatar";
import { DotOrbitBg } from "../kit/DotOrbitBg";
import { HEADING, INK, NUMBER, PARAGRAPH, SURFACE } from "../kit/design";
import { GlassPlate } from "../catalog/own/glass";
import { F, VO } from "./timeline";
import { WORDS } from "./words";

// "У твоей семьи есть история вне фотоальбома" (@the_tatarverse, RU, host preset 2 Alicja). ~21 s.
// This changes how you see family photos -> every photo hides a story that isn't in the album -> how did grandma and grandpa meet?
// -> one question = a whole evening of talk -> write it down (notes or a notebook) -> that's how a family archive starts.
// Own kit only. Palette: sepia (old photos, family memory). Dot Orbit variant 1 (output/bg-variant.txt).
const S = { main: "#6B4226", vivid: "#9A6236", glow: "#DDB896", pale: "#F7EEE6" };
const PLATE_S = "linear-gradient(135deg, #B98256, #6B4226)";
const BG = <DotOrbitBg variant={1} />;
const W = 1080;
const MUTED = "#8A8792";
const LINE = "#EEE6DE";

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
        <span key={i} style={{ display: "inline-block", marginRight: i < all.length - 1 ? "0.24em" : 0, fontWeight: key ? 700 : 400, color: key ? S.main : undefined, opacity: Math.min(1, t * 1.3), transform: `translateY(${(1 - t) * 30}px)`, filter: `blur(${Math.max(0, (1 - t) * 8)}px)` }}>
          {raw}
        </span>
      );
    })}
  </div>
);

/** Two silhouettes side by side (a couple), drawn inside a w x h box */
const Couple: React.FC<{ w: number; h: number }> = ({ w, h }) => (
  <>
    {[0.36, 0.64].map((cx, i) => (
      <React.Fragment key={cx}>
        <div style={{ position: "absolute", left: w * cx - h * 0.1, top: h * 0.28, width: h * 0.2, height: h * 0.2, borderRadius: "50%", background: i ? S.main : S.vivid }} />
        <div style={{ position: "absolute", left: w * cx - h * 0.19, top: h * 0.52, width: h * 0.38, height: h * 0.6, borderRadius: `${h * 0.19}px ${h * 0.19}px 0 0`, background: i ? S.main : S.vivid }} />
      </React.Fragment>
    ))}
  </>
);

/** Old photo print: white border, sepia picture of a couple */
const Photo: React.FC<{ w: number; h: number; style?: React.CSSProperties }> = ({ w, h, style }) => (
  <div style={{ ...SURFACE, borderRadius: 14, width: w, height: h, padding: w * 0.05, paddingBottom: w * 0.16, ...style }}>
    <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 6, overflow: "hidden", background: `linear-gradient(170deg, ${S.pale}, ${S.glow})` }}>
      <Couple w={w * 0.9} h={h - w * 0.21} />
    </div>
  </div>
);

/* ───────── 1. Hook: three old photos drop onto the table one after another ───────── */

const DROP = [
  { at: 6, x: -150, y: 40, r: -9 },
  { at: 26, x: 150, y: 70, r: 7 },
  { at: 46, x: 0, y: 0, r: -2 },
];
const Hook: React.FC<{ frame: number }> = ({ frame }) => {
  const glow = springAt(frame, F.photos, SPRING.bouncy);
  return (
    <>
      <Title text="это изменит твое отношение к *семейным фотографиям*" frame={frame} at={[-30, -27, -24, -21, -18, F.family - 6, F.photos]} size={76} style={{ left: 70, right: 70 }} />
      {DROP.map((d, i) => {
        const t = springAt(frame, d.at, SPRING.bouncy);
        const top = i === 2 ? 1 + 0.05 * Math.min(glow, 1) : 1;
        return (
          <div key={i} style={{ position: "absolute", left: 540 - 210 + d.x, top: 600 + d.y, opacity: Math.min(1, t * 2), transform: `translateY(${(1 - Math.min(t, 1)) * -500}px) rotate(${d.r + (1 - Math.min(t, 1)) * 20}deg) scale(${(1.25 - 0.25 * Math.min(t, 1)) * top})` }}>
            <Photo w={420} h={500} />
          </div>
        );
      })}
    </>
  );
};

/* ───────── 2. Behind every photo is a story: the photo flips, the back gets written ───────── */

const Story: React.FC<{ frame: number }> = ({ frame }) => {
  const flip = ease.inOut(progress(frame, F.story - 20, F.story + 10));
  const back = flip > 0.5;
  const sx = Math.abs(Math.cos(flip * Math.PI));
  const write = progress(frame, F.story + 10, F.notIn + 10);
  const empty = pop(frame, F.album - 6, SPRING.bouncy);
  return (
    <>
      <Title text="за каждым снимком *история*" frame={frame} at={[F.storyIn + 2, F.storyIn + 12, F.shot, F.story]} size={92} />
      <div style={{ position: "absolute", top: 450, left: 200, width: 460, height: 560, transform: `scaleX(${Math.max(0.02, sx)}) rotate(-3deg)`, ...pop(frame, F.storyIn + 4, SPRING.smooth).style }}>
        {!back ? (
          <Photo w={460} h={560} />
        ) : (
          <div style={{ ...SURFACE, borderRadius: 14, width: 460, height: 560, padding: 44, background: "#FFFDF9", display: "flex", flexDirection: "column", gap: 30 }}>
            <div style={{ ...NUMBER, fontSize: 64, color: S.vivid }}>1968</div>
            {[0.95, 0.8, 0.9, 0.6, 0.75].map((wd, k) => {
              const t = Math.max(0, Math.min(1, write * 5 - k));
              return <div key={k} style={{ width: `${wd * 100 * t}%`, height: 10, borderRadius: 5, background: S.main, opacity: 0.85 }} />;
            })}
          </div>
        )}
      </div>
      {/* the album page: the same photo slot, no story */}
      {empty.t > 0 && (
        <div style={{ position: "absolute", left: 700, top: 760, width: 260, height: 300, ...SURFACE, padding: 26, ...empty.style, transform: `${empty.style.transform} rotate(4deg)` }}>
          <div style={{ width: "100%", height: 170, borderRadius: 8, background: S.pale }} />
          <div style={{ marginTop: 26, height: 12, width: "70%", borderRadius: 6, border: `3px dashed ${S.glow}` }} />
          <div style={{ marginTop: 16, height: 12, width: "45%", borderRadius: 6, border: `3px dashed ${S.glow}` }} />
        </div>
      )}
    </>
  );
};

/* ───────── 3. How did grandma and grandpa meet: two portraits, a path draws between them to an empty spot ───────── */

const Portrait: React.FC<{ x: number; c: string; scarf?: boolean; t: number; label: string; lt: number }> = ({ x, c, scarf, t, label, lt }) => (
  <>
    <div style={{ position: "absolute", left: x - 130, top: 600, width: 260, height: 260, ...SURFACE, borderRadius: 130, overflow: "hidden", border: "8px solid #fff", background: S.pale, transform: `scale(${t})` }}>
      <div style={{ position: "absolute", left: 92, top: 50, width: 76, height: 76, borderRadius: 38, background: c }} />
      {scarf && <div style={{ position: "absolute", left: 78, top: 40, width: 104, height: 60, borderRadius: "52px 52px 10px 10px", background: S.glow }} />}
      <div style={{ position: "absolute", left: 50, top: 140, width: 160, height: 160, borderRadius: 80, background: c }} />
    </div>
    <div style={{ position: "absolute", left: x - 160, width: 320, top: 890, textAlign: "center", ...PARAGRAPH, fontSize: 52, lineHeight: 1, opacity: lt, transform: `translateY(${(1 - lt) * 20}px)` }}>{label}</div>
  </>
);
const Met: React.FC<{ frame: number }> = ({ frame }) => {
  const draw = ease.inOut(progress(frame, F.met, F.grandpa + 10));
  const spot = springAt(frame, F.grandpa + 10, SPRING.bouncy);
  return (
    <>
      <Title text="как они *познакомились*" frame={frame} at={[F.metIn + 30, F.metIn + 40, F.met]} size={92} />
      <svg width={W} height={1300} style={{ position: "absolute", inset: 0 }}>
        <path d="M290 600 C 330 420, 470 420, 540 470 S 760 420, 790 600" fill="none" stroke={S.glow} strokeWidth={8} strokeLinecap="round" strokeDasharray="2 22" />
        <path d="M290 600 C 330 420, 470 420, 540 470 S 760 420, 790 600" fill="none" stroke={S.vivid} strokeWidth={8} strokeLinecap="round" pathLength={1} strokeDasharray={`${draw} 1`} />
        {spot > 0 && <circle cx={540} cy={470} r={44 * Math.min(spot, 1.2)} fill="#fff" stroke={S.vivid} strokeWidth={6} strokeDasharray="10 10" transform={`rotate(${frame * 2} 540 470)`} />}
      </svg>
      <Portrait x={290} c={S.vivid} scarf t={springAt(frame, F.metIn + 6, SPRING.bouncy)} label="бабушка" lt={springAt(frame, F.grandma - 6, SPRING.smooth)} />
      <Portrait x={790} c={S.main} t={springAt(frame, F.metIn + 14, SPRING.bouncy)} label="дедушка" lt={springAt(frame, F.grandpa - 6, SPRING.smooth)} />
    </>
  );
};

/* ───────── 4. One question -> a conversation for the whole evening: the sun goes down, 18:00 -> 23:00 ───────── */

const Ask: React.FC<{ frame: number }> = ({ frame }) => {
  const swap = progress(frame, F.talk - 16, F.talk);
  const q = pop(frame, F.question - 6, SPRING.bouncy);
  const eve = ease.inOut(progress(frame, F.talk + 6, F.evening + 30));
  const mins = Math.round(lerp(18 * 60, 23 * 60, eve) / 10) * 10;
  const hh = Math.floor(mins / 60);
  const mm = String(mins % 60).padStart(2, "0");
  const a = Math.PI * (1 - eve);
  const sun = { x: 540 + 300 * Math.cos(a), y: 840 - 300 * Math.sin(a) };
  return (
    <>
      {swap < 1 && (
        <div style={{ position: "absolute", inset: 0, opacity: 1 - swap }}>
          <Title text="спроси *один* вопрос" frame={frame} at={[F.askIn + 2, F.one, F.question]} size={96} />
          {q.t > 0 && (
            <div style={{ position: "absolute", top: 560, left: 0, right: 0, display: "flex", justifyContent: "center", ...q.style }}>
              <div style={{ ...SURFACE, borderBottomLeftRadius: 6, padding: 50, ...PARAGRAPH, fontSize: 62, lineHeight: 1, whiteSpace: "nowrap" }}>
                как вы <b style={{ color: S.main }}>познакомились</b>
              </div>
            </div>
          )}
        </div>
      )}
      {swap > 0 && (
        <>
          <Title text="разговор на целый *вечер*" frame={frame} at={[F.talk - 2, F.talk + 26, F.talk + 42, F.evening]} size={92} />
          <svg width={W} height={1300} style={{ position: "absolute", inset: 0 }}>
            <path d="M240 840 A 300 300 0 0 1 840 840" fill="none" stroke={LINE} strokeWidth={8} strokeDasharray="2 20" strokeLinecap="round" />
            <line x1={160} y1={840} x2={920} y2={840} stroke={LINE} strokeWidth={10} strokeLinecap="round" />
            <circle cx={sun.x} cy={sun.y} r={58} fill={eve < 0.5 ? S.glow : S.vivid} />
            <circle cx={sun.x} cy={sun.y} r={58 + 16} fill="none" stroke={S.glow} strokeWidth={6} opacity={0.5} />
          </svg>
          <div style={{ position: "absolute", top: 900, left: 0, right: 0, textAlign: "center", ...NUMBER, fontSize: 120, color: S.main }}>
            {hh}:{mm}
          </div>
        </>
      )}
    </>
  );
};

/* ───────── 5. Write the answer down: phone notes or a paper notebook, lines get written ───────── */

const Lines: React.FC<{ t: number; color: string; gap: number; n: number }> = ({ t, color, gap, n }) => (
  <div style={{ display: "flex", flexDirection: "column", gap }}>
    {Array.from({ length: n }, (_, k) => {
      const p = Math.max(0, Math.min(1, t * n - k));
      return <div key={k} style={{ width: `${(k % 3 === 2 ? 60 : 90) * p}%`, height: 12, borderRadius: 6, background: color }} />;
    })}
  </div>
);
const Write: React.FC<{ frame: number }> = ({ frame }) => {
  const phone = pop(frame, F.notes - 14, SPRING.bouncy);
  const book = pop(frame, F.notebook - 14, SPRING.bouncy);
  return (
    <>
      <Title text="запиши *ответ*" frame={frame} at={[F.writeIn + 2, F.answer]} size={110} />
      {phone.t > 0 && (
        <div style={{ position: "absolute", left: 130, top: 440, ...phone.style }}>
          <div style={{ ...SURFACE, borderRadius: 48, width: 340, height: 560, padding: 34, border: `8px solid ${INK}`, display: "flex", flexDirection: "column", gap: 30, transform: "rotate(-4deg)" }}>
            <div style={{ alignSelf: "center", width: 110, height: 14, borderRadius: 7, background: INK }} />
            <div style={{ width: 120, height: 16, borderRadius: 8, background: S.vivid }} />
            <Lines t={progress(frame, F.notes, F.notes + 70)} color={S.glow} gap={24} n={6} />
          </div>
          <div style={{ marginTop: 34, textAlign: "center", ...PARAGRAPH, fontSize: 52, lineHeight: 1 }}>заметки</div>
        </div>
      )}
      {book.t > 0 && (
        <div style={{ position: "absolute", right: 130, top: 480, ...book.style }}>
          <div style={{ position: "relative", borderRadius: 20, width: 360, height: 480, padding: "44px 34px 34px 64px", background: S.pale, boxShadow: SURFACE.boxShadow, transform: "rotate(3deg)", backgroundImage: `repeating-linear-gradient(to bottom, transparent 0 43px, ${S.glow} 43px 46px)`, backgroundPositionY: 20 }}>
            {Array.from({ length: 8 }, (_, k) => (
              <div key={k} style={{ position: "absolute", left: 16, top: 30 + k * 56, width: 26, height: 26, borderRadius: 13, border: `5px solid ${S.vivid}`, background: "#fff" }} />
            ))}
            <Lines t={progress(frame, F.notebook, F.notebook + 50)} color={S.main} gap={34} n={7} />
          </div>
          <div style={{ marginTop: 34, textAlign: "center", ...PARAGRAPH, fontSize: 52, lineHeight: 1 }}>тетрадь</div>
        </div>
      )}
    </>
  );
};

/* ───────── 6. A family archive starts with one story: the photo slides into an archive box, "глава 1" ───────── */

const Archive: React.FC<{ frame: number }> = ({ frame }) => {
  const out = progress(frame, F.oneStory - 24, F.oneStory - 10);
  const box = pop(frame, F.archiveIn + 6, SPRING.smooth);
  const drop = ease.inOut(progress(frame, F.archive - 30, F.archive + 6));
  const plate = pop(frame, F.storyEnd - 4, SPRING.bouncy);
  return (
    <>
      {out < 1 && <Title text="так начинается *семейный архив*" frame={frame} at={[F.archiveIn + 2, F.archiveIn + 11, F.archive - 26, F.archive]} size={92} style={{ opacity: 1 - out }} />}
      {out > 0 && <Title text="с *одной* истории" frame={frame} at={[F.oneStory - 9, F.oneStory, F.storyEnd]} size={100} />}
      <div style={{ position: "absolute", left: 540 - 280, top: 640, width: 560, height: 420, ...box.style }}>
        <div style={{ position: "absolute", left: 20, right: 20, top: 0, height: 140, borderRadius: "24px 24px 0 0", background: S.glow }} />
        <div style={{ position: "absolute", left: 140, top: lerp(-560, 40, drop), opacity: drop > 0 ? 1 : 0 }}>
          <Photo w={280} h={330} style={{ transform: `rotate(${(1 - drop) * -10}deg)` }} />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 120, bottom: 0, borderRadius: 28, background: `linear-gradient(160deg, ${S.vivid}, ${S.main})`, display: "grid", placeItems: "center" }}>
          <div style={{ width: 220, height: 90, borderRadius: 16, background: "#fff", display: "grid", placeItems: "center" }}>
            <span style={{ ...NUMBER, fontSize: 52, color: S.main }}>{drop >= 1 ? 1 : 0}</span>
          </div>
        </div>
      </div>
      {plate.t > 0 && (
        <div style={{ position: "absolute", top: 1110, left: 0, right: 0, display: "flex", justifyContent: "center", ...plate.style }}>
          <div style={{ transform: "scale(2.2)" }}>
            <GlassPlate bg={PLATE_S}>
              <BookOpen size={18} strokeWidth={2.2} /> глава 1
            </GlassPlate>
          </div>
        </div>
      )}
    </>
  );
};

/* ───────── Composition ───────── */

const SCENES: SceneDef[] = [
  { range: [0, F.storyIn], El: Hook },
  { range: [F.storyIn, F.metIn], El: Story },
  { range: [F.metIn, F.askIn], El: Met },
  { range: [F.askIn, F.writeIn], El: Ask },
  { range: [F.writeIn, F.archiveIn], El: Write },
  { range: [F.archiveIn, F.duration + 30], El: Archive },
];

const SFX: Sfx[] = [
  { src: "sfx/07_CineStrike.wav", from: 2, volume: 0.18 },
  ...DROP.map((d) => ({ src: "sfx2/pop.mp3", from: d.at + 8, volume: 0.2 })),
  // scene changes: textures from the SFX/ library (no whoosh)
  { src: "sfx/06_Ripple_Textures_II.wav", from: F.storyIn - 8, volume: 0.2 },
  { src: "sfx/01_Ripple_Textures.wav", from: F.metIn - 8, volume: 0.18 },
  { src: "sfx/04_Cyber_Shift.wav", from: F.askIn - 8, volume: 0.2 },
  { src: "sfx/02_Alienated_Warpes.wav", from: F.writeIn - 8, volume: 0.14 },
  { src: "sfx/06_Ripple_Textures_II.wav", from: F.archiveIn - 8, volume: 0.2 },
  // 2. flip, empty album slot
  { src: "sfx2/click.mp3", from: F.story - 6, volume: 0.2 },
  { src: "sfx2/pop.mp3", from: F.album - 6, volume: 0.2 },
  // 3. path reaches the unknown spot
  { src: "sfx/03_Basscrack.wav", from: F.grandpa + 10, volume: 0.08 },
  // 4. question, evening
  { src: "sfx2/pop.mp3", from: F.question - 6, volume: 0.24 },
  { src: "sfx2/ding.mp3", from: F.evening + 30, volume: 0.18 },
  // 5. notes, notebook
  { src: "sfx2/click.mp3", from: F.notes - 14, volume: 0.2 },
  { src: "sfx2/click.mp3", from: F.notebook - 14, volume: 0.2 },
  // 6. into the archive, chapter 1
  { src: "sfx2/pop.mp3", from: F.archive + 6, volume: 0.22 },
  { src: "sfx/07_CineStrike.wav", from: F.storyEnd, volume: 0.12 },
];

// All 30 poses of the Alicja set, each at least once; swaps by the meaning of the line, never the same photo twice in a row
const AVATAR_KEYS: AvatarKey[] = [
  // 1. hook: family photos
  { at: 0, e: "point-up" },
  { at: 40, e: "surprised" },
  { at: 80, e: "explaining" },
  { at: 120, e: "present-left" },
  { at: 160, e: "smile-up" },
  // 2. a story behind every photo, not in the album
  { at: F.storyIn, e: "thinking" },
  { at: 235, e: "pensive" },
  { at: 275, e: "point-right" },
  { at: 310, e: "shrug" },
  { at: 345, e: "displeased" },
  { at: 380, e: "disappointed" },
  // 3. how did they meet
  { at: F.metIn, e: "puzzled" },
  { at: 450, e: "dreamy" },
  { at: 490, e: "heart-hands" },
  { at: 530, e: "delighted" },
  { at: 565, e: "laughing" },
  // 4. one question, a whole evening
  { at: F.askIn, e: "inspired" },
  { at: 640, e: "shush" },
  { at: 680, e: "listening" },
  { at: 720, e: "soft-smile" },
  { at: 765, e: "hand-on-heart" },
  { at: 810, e: "facepalm" },
  // 5. write it down
  { at: F.writeIn, e: "point-down" },
  { at: 895, e: "stop" },
  { at: 935, e: "skeptical" },
  { at: 975, e: "thumbs-up" },
  { at: 1005, e: "arms-crossed" },
  // 6. family archive
  { at: F.archiveIn, e: "clapping" },
  { at: 1080, e: "victory" },
  { at: 1130, e: "hand-on-heart" },
  { at: 1185, e: "waving" },
];

const STANCES: StanceKey[] = [
  { at: 0, s: "center" },
  { at: F.storyIn, s: "right" },
  { at: F.metIn, s: "left" },
  { at: F.askIn, s: "right" },
  { at: F.writeIn, s: "left" },
  { at: F.archiveIn, s: "center" },
];

// Alicja photos: scale the wide-framed ones so every photo fills the 540x590 box by height (as in V25)
const SIZE: Record<string, [number, number]> = {
  pensive: [1129, 1393], dreamy: [1293, 1216], displeased: [1254, 1254], surprised: [1280, 1229], waving: [1312, 1199], inspired: [1199, 1312], explaining: [1312, 1199], delighted: [1312, 1199], skeptical: [1312, 1199], laughing: [1385, 1136],
  puzzled: [1129, 1393], disappointed: [1278, 1230], "smile-up": [1199, 1312], thinking: [1129, 1393], "soft-smile": [1164, 1351], "point-up": [1312, 1199], "point-down": [1312, 1199], "present-left": [1312, 1199], "point-right": [1312, 1199], shrug: [1312, 1199],
  "hand-on-heart": [1312, 1199], stop: [1312, 1199], shush: [1199, 1312], clapping: [1312, 1199], "thumbs-up": [1312, 1199], "arms-crossed": [1199, 1312], facepalm: [1312, 1199], "heart-hands": [1312, 1199], victory: [1312, 1199], listening: [1312, 1199],
};
const FIT = Object.fromEntries(Object.entries(SIZE).map(([e, [w, h]]) => [e, Math.max(1, w / h / (540 / 590))])) as Partial<Record<Emotion, number>>;

const Host: React.FC<{ frame: number }> = ({ frame }) => <TatAvatar frame={frame} keys={AVATAR_KEYS} words={WORDS} stances={STANCES} dir="v31/avatar" fit={FIT} />;

export const Video31: React.FC = () => (
  <AbsoluteFill style={{ background: "#fff", fontFamily: PARAGRAPH.fontFamily, color: INK }}>
    <ReelShell scenes={SCENES} headlines={[]} vo={VO} sfx={SFX} duration={F.duration} music="v31/music/bed.mp3" musicLevel={[0.045, 0.11]} overlay={Host} bg={BG} />
  </AbsoluteFill>
);
