import React from "react";
import { AbsoluteFill } from "remotion";
import { DoorOpen } from "lucide-react";
import { SPRING, ease, lerp, progress, springAt } from "../stage/motion";
import { ReelShell, pop, shake, type SceneDef, type Sfx } from "../kit/reel";
import { TatAvatar, type AvatarKey, type Emotion, type StanceKey } from "../kit/TatAvatar";
import { DotOrbitBg } from "../kit/DotOrbitBg";
import { HEADING, INK, NUMBER, PARAGRAPH, SURFACE } from "../kit/design";
import { GlassPlate } from "../catalog/own/glass";
import { Mark, Strike } from "../catalog/own/text";
import { F, VO } from "./timeline";
import { WORDS } from "./words";

// "Тебе не нужно сдавать экзамен на татарина" (@the_tatarverse, RU, main host preset Ahu). ~21 s.
// Never wait until you're "Tatar enough" -> imperfect language, partial history: may I? -> yes, no exam here
// -> nobody asks when Kazan was founded -> no score needed, only the wish to be near -> come as you are.
// Own kit only. Palette: violet (belonging, warmth without tests). Dot Orbit variant 4 (output/bg-variant.txt).
const V = { main: "#5B2BB5", vivid: "#7C4DDB", glow: "#C3AEF2", pale: "#F1ECFD" };
const PLATE_V = "linear-gradient(135deg, #9B76EA, #5B2BB5)";
const BG = <DotOrbitBg variant={4} />;
const W = 1080;
const MUTED = "#8A8792";
const LINE = "#ECE8F3";

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
        <span key={i} style={{ display: "inline-block", marginRight: i < all.length - 1 ? "0.24em" : 0, fontWeight: key ? 700 : 400, color: key ? V.main : undefined, opacity: Math.min(1, t * 1.3), transform: `translateY(${(1 - t) * 30}px)`, filter: `blur(${Math.max(0, (1 - t) * 8)}px)` }}>
          {raw}
        </span>
      );
    })}
  </div>
);

/** Flat person: round head + rounded body; (x, y) = bottom center */
const Person: React.FC<{ x: number; y: number; s?: number; c: string }> = ({ x, y, s = 1, c }) => (
  <div style={{ position: "absolute", left: x - 50 * s, top: y - 170 * s, width: 100 * s, height: 170 * s }}>
    <div style={{ position: "absolute", left: 22 * s, top: 0, width: 56 * s, height: 56 * s, borderRadius: 28 * s, background: c }} />
    <div style={{ position: "absolute", left: 0, top: 66 * s, width: 100 * s, height: 104 * s, borderRadius: `${50 * s}px ${50 * s}px ${18 * s}px ${18 * s}px`, background: c }} />
  </div>
);

/* ───────── 1. Hook: the "Tatar enough" loading bar crawls and gets stuck at 87% ───────── */

const Hook: React.FC<{ frame: number }> = ({ frame }) => {
  const out = progress(frame, F.become - 22, F.become - 6);
  const card = pop(frame, 14, SPRING.smooth);
  // crawls up, then stalls and twitches between 87 and 88
  const pct = frame < F.enough ? Math.round(lerp(12, 87, ease.out(progress(frame, 20, F.enough)))) : 87 + (Math.floor((frame - F.enough) / 24) % 2);
  const dots = Math.floor(frame / 12) % 4;
  return (
    <>
      {out < 1 && <Title text="тебе никогда не стоит *ждать*" frame={frame} at={[-30, -26, -22, -18, F.wait - 6]} size={92} style={{ opacity: 1 - out }} />}
      {out > 0 && <Title text="пока станешь *достаточно* татарином" frame={frame} at={[F.become - 10, F.become, F.enough, F.tatar]} size={80} />}
      <div style={{ position: "absolute", top: 560, left: 130, right: 130, ...SURFACE, padding: 50, display: "flex", flexDirection: "column", gap: 34, ...card.style }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ ...PARAGRAPH, fontSize: 58, lineHeight: 1, fontWeight: 700 }}>татарин</div>
          <div style={{ ...NUMBER, fontSize: 92, color: V.main }}>{pct}%</div>
        </div>
        <div style={{ height: 44, borderRadius: 22, background: V.pale, overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", borderRadius: 22, background: `linear-gradient(90deg, ${V.glow}, ${V.vivid})` }} />
        </div>
        <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
          {[0, 1, 2].map((k) => (
            <div key={k} style={{ width: 22, height: 22, borderRadius: 11, background: k < dots ? V.vivid : LINE }} />
          ))}
        </div>
      </div>
    </>
  );
};

/* ───────── 2. Language not perfect, history not all: a self-check card with half-filled meters ───────── */

const ROWS = [
  { label: "язык", on: 3, at: F.ideal },
  { label: "история", on: 2, at: F.history + 30 },
];
const Doubt: React.FC<{ frame: number }> = ({ frame }) => {
  const swap = progress(frame, F.can - 20, F.can - 4);
  const card = pop(frame, F.doubtIn + 8, SPRING.smooth);
  const knock = shake(frame, F.us, 10, 20);
  return (
    <>
      {swap < 1 && <Title text="язык не *идеальный*" frame={frame} at={[F.doubtIn + 2, F.ideal - 8, F.ideal]} size={96} style={{ opacity: 1 - swap }} />}
      {swap > 0 && <Title text="можно ли *к нам*" frame={frame} at={[F.can - 4, F.can + 10, F.us - 4, F.us]} size={100} />}
      <div style={{ position: "absolute", top: 500, left: 140, right: 140, ...SURFACE, padding: 50, display: "flex", flexDirection: "column", gap: 50, transform: `translateX(${knock}px)`, ...card.style }}>
        {ROWS.map((r, i) => (
          <div key={r.label} style={{ display: "flex", flexDirection: "column", gap: 24, ...pop(frame, F.doubtIn + 12 + i * 8, SPRING.smooth).style }}>
            <div style={{ ...PARAGRAPH, fontSize: 56, lineHeight: 1 }}>{r.label}</div>
            <div style={{ display: "flex", gap: 22 }}>
              {[0, 1, 2, 3, 4].map((k) => {
                const t = k < r.on ? springAt(frame, r.at + k * 6, SPRING.bouncy) : 0;
                return (
                  <div key={k} style={{ width: 96, height: 30, borderRadius: 15, background: LINE, position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", inset: 0, borderRadius: 15, background: V.vivid, transform: `scaleX(${Math.min(1, t)})`, transformOrigin: "0 50%" }} />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

/* ───────── 3. Yes. No exam here: the answer sheet gets struck and flies away ───────── */

const Exam: React.FC<{ frame: number }> = ({ frame }) => {
  const yes = pop(frame, F.yes - 4, SPRING.bouncy);
  const sheet = pop(frame, F.no - 20, SPRING.smooth);
  const away = ease.in(progress(frame, F.examTatar + 16, F.examTatar + 44));
  return (
    <>
      <div style={{ ...HEADING, position: "absolute", top: 170, left: 0, right: 0, textAlign: "center", fontSize: 150, lineHeight: 1, ...yes.style }}>
        <Mark frame={frame} at={F.yes + 10} color={V.main}>
          <b>можно</b>
        </Mark>
      </div>
      {away < 1 && (
        <div style={{ position: "absolute", top: 470, left: 210, right: 210, ...SURFACE, padding: 48, display: "flex", flexDirection: "column", gap: 34, ...sheet.style, opacity: (sheet.style.opacity as number) * (1 - away), transform: `${sheet.style.transform} translate(${away * 420}px, ${away * 260}px) rotate(${away * 28}deg)` }}>
          <div style={{ ...PARAGRAPH, fontSize: 64, lineHeight: 1, fontWeight: 700 }}>
            <Strike frame={frame} at={F.exam}>
              экзамен
            </Strike>
          </div>
          {[0, 1, 2, 3].map((r) => (
            <div key={r} style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <span style={{ ...NUMBER, fontSize: 40, color: V.vivid, width: 30 }}>{r + 1}</span>
              {[0, 1, 2, 3].map((k) => (
                <div key={k} style={{ width: 52, height: 52, borderRadius: 26, border: `5px solid ${LINE}`, background: (r + k) % 3 === 0 ? V.glow : "#fff" }} />
              ))}
            </div>
          ))}
        </div>
      )}
    </>
  );
};

/* ───────── 4. Nobody will ask the year Kazan was founded: a quiz card falls away unanswered ───────── */

const OPTIONS = ["1005", "1177", "1438", "1552"];
const Quiz: React.FC<{ frame: number }> = ({ frame }) => {
  const card = pop(frame, F.quizIn + 8, SPRING.smooth);
  const q = pop(frame, F.year - 6, SPRING.smooth);
  const timer = progress(frame, F.year, F.kazan + 30);
  const drop = ease.in(progress(frame, F.kazan + 26, F.kazan + 52));
  return (
    <>
      <Title text="никто не *спросит*" frame={frame} at={[F.quizIn + 2, F.ask - 10, F.ask]} size={100} />
      <div style={{ position: "absolute", top: 440, left: 130, right: 130, ...SURFACE, padding: 44, display: "flex", flexDirection: "column", gap: 34, ...card.style, opacity: (card.style.opacity as number) * (1 - drop), transform: `${card.style.transform} translateY(${drop * 500}px) rotate(${-drop * 14}deg)` }}>
        <div style={{ height: 14, borderRadius: 7, background: LINE, overflow: "hidden" }}>
          <div style={{ width: `${(1 - timer) * 100}%`, height: "100%", borderRadius: 7, background: V.vivid }} />
        </div>
        <div style={{ ...PARAGRAPH, fontSize: 56, lineHeight: 1.15, textAlign: "center", ...q.style }}>
          год основания <b style={{ color: V.main }}>Казани</b>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {OPTIONS.map((o, i) => (
            <div key={o} style={{ height: 120, borderRadius: 24, background: V.pale, display: "grid", placeItems: "center", ...pop(frame, F.founding + i * 8, SPRING.bouncy).style }}>
              <span style={{ ...NUMBER, fontSize: 60, color: V.main }}>{o}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

/* ───────── 5. No score needed (the gauge drains), only the wish to be near (two circles meet) ───────── */

const Score: React.FC<{ frame: number }> = ({ frame }) => {
  const swap = progress(frame, F.need - 16, F.need);
  const gauge = pop(frame, F.scoreIn + 8, SPRING.smooth);
  const up = ease.out(progress(frame, F.scoreIn + 10, F.score));
  const drain = ease.inOut(progress(frame, F.score + 6, F.need - 10));
  const val = Math.round(100 * up * (1 - drain));
  const meet = ease.inOut(progress(frame, F.wish, F.near + 6));
  const heart = springAt(frame, F.near + 4, SPRING.bouncy);
  return (
    <>
      {swap < 1 && (
        <div style={{ position: "absolute", inset: 0, opacity: 1 - swap }}>
          <Title text="не нужен *балл*" frame={frame} at={[F.scoreIn + 14, F.scoreIn + 22, F.score]} size={100} />
          <div style={{ position: "absolute", top: 440, left: 0, right: 0, display: "flex", justifyContent: "center", ...gauge.style }}>
            <svg width={480} height={480} viewBox="0 0 480 480">
              <circle cx={240} cy={240} r={200} fill="#fff" stroke={LINE} strokeWidth={34} />
              <circle cx={240} cy={240} r={200} fill="none" stroke={V.vivid} strokeWidth={34} strokeLinecap="round" pathLength={1} strokeDasharray={`${(val / 100) * 0.999} 1`} transform="rotate(-90 240 240)" />
              <text x={240} y={282} textAnchor="middle" style={{ ...NUMBER, fontSize: 130 }} fill={val > 0 ? V.main : MUTED}>
                {val}
              </text>
            </svg>
          </div>
        </div>
      )}
      {swap > 0 && (
        <>
          <Title text="нужно только *желание* быть рядом" frame={frame} at={[F.need - 4, F.need + 22, F.wish, F.wish + 34, F.near]} size={88} />
          <svg width={W} height={1300} style={{ position: "absolute", inset: 0 }}>
            <circle cx={lerp(260, 430, meet)} cy={760} r={200} fill={V.glow} fillOpacity={0.55} transform={`scale(${springAt(frame, F.need + 4, SPRING.bouncy)})`} style={{ transformOrigin: `${lerp(260, 430, meet)}px 760px` }} />
            <circle cx={lerp(820, 650, meet)} cy={760} r={200} fill={V.vivid} fillOpacity={0.45} transform={`scale(${springAt(frame, F.need + 12, SPRING.bouncy)})`} style={{ transformOrigin: `${lerp(820, 650, meet)}px 760px` }} />
            <g transform={`translate(540 765) scale(${3.4 * Math.min(heart, 1.15)}) translate(-12 -11)`}>
              <path d="M12 21 C 5 15, 1 11, 1 6.5 A 5.5 5.5 0 0 1 12 4 A 5.5 5.5 0 0 1 23 6.5 C 23 11, 19 15, 12 21 Z" fill={V.main} />
            </g>
          </svg>
        </>
      )}
    </>
  );
};

/* ───────── 6. Come as you are: a mirror shows you, a check, the door is open ───────── */

const Come: React.FC<{ frame: number }> = ({ frame }) => {
  const mirror = pop(frame, F.comeIn + 6, SPRING.smooth);
  const ok = springAt(frame, F.are, SPRING.bouncy);
  const plate = pop(frame, F.such + 20, SPRING.bouncy);
  return (
    <>
      <Title text="приходи *таким* какой ты есть" frame={frame} at={[F.comeIn + 2, F.such, F.such + 30, F.are - 9, F.are]} size={92} />
      <div style={{ position: "absolute", top: 460, left: 0, right: 0, display: "flex", justifyContent: "center", ...mirror.style }}>
        <div style={{ ...SURFACE, width: 380, height: 480, borderRadius: 190, padding: 22, position: "relative" }}>
          <div style={{ position: "absolute", inset: 22, borderRadius: 170, background: `linear-gradient(160deg, ${V.pale}, #fff)`, overflow: "hidden" }}>
            <Person x={168} y={446} s={1.6} c={V.vivid} />
          </div>
          {ok > 0 && (
            <div style={{ position: "absolute", right: -10, top: 40, width: 110, height: 110, borderRadius: 55, background: V.main, border: "8px solid #fff", display: "grid", placeItems: "center", transform: `scale(${ok})` }}>
              <svg width={52} height={40} viewBox="0 0 52 40">
                <path d="M5 21 L19 34 L47 6" fill="none" stroke="#fff" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
        </div>
      </div>
      {plate.t > 0 && (
        <div style={{ position: "absolute", top: 1030, left: 0, right: 0, display: "flex", justifyContent: "center", ...plate.style }}>
          <div style={{ transform: "scale(2.2)" }}>
            <GlassPlate bg={PLATE_V}>
              <DoorOpen size={18} strokeWidth={2.2} /> вход свободный
            </GlassPlate>
          </div>
        </div>
      )}
    </>
  );
};

/* ───────── Composition ───────── */

const SCENES: SceneDef[] = [
  { range: [0, F.doubtIn], El: Hook },
  { range: [F.doubtIn, F.examIn], El: Doubt },
  { range: [F.examIn, F.quizIn], El: Exam },
  { range: [F.quizIn, F.scoreIn], El: Quiz },
  { range: [F.scoreIn, F.comeIn], El: Score },
  { range: [F.comeIn, F.duration + 30], El: Come },
];

const SFX: Sfx[] = [
  { src: "sfx/07_CineStrike.wav", from: 2, volume: 0.18 },
  { src: "sfx2/pop.mp3", from: 14, volume: 0.22 },
  { src: "sfx2/click.mp3", from: F.enough, volume: 0.18 },
  { src: "sfx2/click.mp3", from: F.enough + 48, volume: 0.16 },
  // scene changes: textures from the SFX/ library (no whoosh)
  { src: "sfx/06_Ripple_Textures_II.wav", from: F.doubtIn - 8, volume: 0.2 },
  { src: "sfx/04_Cyber_Shift.wav", from: F.examIn - 8, volume: 0.2 },
  { src: "sfx/01_Ripple_Textures.wav", from: F.quizIn - 8, volume: 0.18 },
  { src: "sfx/02_Alienated_Warpes.wav", from: F.scoreIn - 8, volume: 0.14 },
  { src: "sfx/06_Ripple_Textures_II.wav", from: F.comeIn - 8, volume: 0.2 },
  // 2. meters, knock
  { src: "sfx2/pop.mp3", from: F.ideal, volume: 0.2 },
  { src: "sfx2/pop.mp3", from: F.history + 30, volume: 0.2 },
  { src: "sfx2/click.mp3", from: F.us, volume: 0.24 },
  // 3. yes, exam struck
  { src: "sfx/03_Basscrack.wav", from: F.yes, volume: 0.12 },
  { src: "sfx/05_Distortion_Glitch.wav", from: F.exam + 30, volume: 0.05 },
  // 4. quiz options, card falls
  ...OPTIONS.map((_, i) => ({ src: "sfx2/click.mp3", from: F.founding + i * 8, volume: 0.16 })),
  // 5. heart
  { src: "sfx2/ding.mp3", from: F.near + 4, volume: 0.22 },
  // 6. check, door open
  { src: "sfx2/pop.mp3", from: F.such + 20, volume: 0.22 },
  { src: "sfx/07_CineStrike.wav", from: F.are, volume: 0.12 },
];

// All 30 poses of the main set, each at least once; swaps by the meaning of the line, never the same photo twice in a row
const AVATAR_KEYS: AvatarKey[] = [
  // 1. hook: never wait
  { at: 0, e: "stop" },
  { at: 40, e: "point-up" },
  { at: 80, e: "skeptical" },
  { at: 120, e: "thinking" },
  { at: 160, e: "arms-crossed" },
  { at: 200, e: "puzzled" },
  { at: 245, e: "displeased" },
  // 2. imperfect, may I?
  { at: F.doubtIn, e: "pensive" },
  { at: 325, e: "shrug" },
  { at: 365, e: "disappointed" },
  { at: 405, e: "facepalm" },
  { at: 445, e: "dreamy" },
  { at: 485, e: "listening" },
  // 3. yes, no exam
  { at: F.examIn, e: "thumbs-up" },
  { at: 575, e: "delighted" },
  { at: 615, e: "laughing" },
  { at: 655, e: "victory" },
  // 4. nobody will ask
  { at: F.quizIn, e: "explaining" },
  { at: 745, e: "shush" },
  { at: 780, e: "surprised" },
  { at: 815, e: "point-down" },
  { at: 848, e: "smile-up" },
  // 5. no score, wish to be near
  { at: F.scoreIn, e: "point-right" },
  { at: 915, e: "soft-smile" },
  { at: 955, e: "inspired" },
  { at: 1000, e: "hand-on-heart" },
  { at: 1045, e: "heart-hands" },
  // 6. come as you are
  { at: F.comeIn, e: "present-left" },
  { at: 1140, e: "waving" },
  { at: 1190, e: "clapping" },
];

const STANCES: StanceKey[] = [
  { at: 0, s: "center" },
  { at: F.doubtIn, s: "right" },
  { at: F.examIn, s: "left" },
  { at: F.quizIn, s: "right" },
  { at: F.scoreIn, s: "left" },
  { at: F.comeIn, s: "center" },
];

// Main set photos: scale the wide-framed ones so every photo fills the 540x590 box by height (as in V24)
const SIZE: Record<string, [number, number]> = {
  pensive: [1312, 1199], dreamy: [1293, 1217], displeased: [1254, 1254], surprised: [1280, 1229], waving: [1312, 1199], inspired: [1199, 1312], explaining: [1312, 1199], delighted: [1312, 1199], skeptical: [1312, 1199], laughing: [1385, 1136],
  puzzled: [1152, 1366], disappointed: [1278, 1230], "smile-up": [1199, 1312], thinking: [1190, 1322], "soft-smile": [1218, 1291], "point-up": [1312, 1199], "point-down": [1312, 1199], "present-left": [1312, 1199], "point-right": [1312, 1199], shrug: [1312, 1199],
  "hand-on-heart": [1312, 1199], stop: [1312, 1199], shush: [1312, 1199], clapping: [1278, 1230], "thumbs-up": [1312, 1199], "arms-crossed": [1312, 1199], facepalm: [1312, 1199], "heart-hands": [1312, 1199], victory: [1312, 1199], listening: [1312, 1199],
};
const FIT = Object.fromEntries(Object.entries(SIZE).map(([e, [w, h]]) => [e, Math.max(1, w / h / (540 / 590))])) as Partial<Record<Emotion, number>>;

const Host: React.FC<{ frame: number }> = ({ frame }) => <TatAvatar frame={frame} keys={AVATAR_KEYS} words={WORDS} stances={STANCES} fit={FIT} />;

export const Video28: React.FC = () => (
  <AbsoluteFill style={{ background: "#fff", fontFamily: PARAGRAPH.fontFamily, color: INK }}>
    <ReelShell scenes={SCENES} headlines={[]} vo={VO} sfx={SFX} duration={F.duration} music="v28/music/bed.mp3" musicLevel={[0.045, 0.11]} overlay={Host} bg={BG} />
  </AbsoluteFill>
);
