import React from "react";
import { Heart, Mic, Scale, Shield, Trophy, X, Zap } from "lucide-react";
import { SPRING, ease, lerp, progress, springAt } from "../stage/motion";
import { GlassPlate } from "../catalog/own/glass";
import { NUMBER, PARAGRAPH, SURFACE } from "../kit/design";
import type { AvatarKey } from "../kit/TatAvatar";
import { Comment, Face, TalkReel, Title, VoiceNote, appear, at, fadeOut, lineAt, lineEnd, usePalette, type Palette, type TalkCfg, type TalkScene } from "../kit/talk";
import { END, LINES as L } from "./lines";

// V54 «Хватит войны полов» (@the_tatarverse, talk series #1, RU). Ahu + Alicja (TatDuo) and a man's voice message
// (Alex - Calm Russian Analyst, from a real comment): "I speak about tendencies, both sexes are good... under every post
// men are not the same, women are not the same, and then nobody finds a pair". Hook #3. Moral: who defends only his own stays alone.
// Palette: garnet (serious, warm). Dot Orbit variant 5 (peach).
const T: Palette = { main: "#8E2A3B", vivid: "#C2384F", glow: "#F2A7B2", pale: "#FBEDEF", plate: "linear-gradient(135deg, #C2384F, #8E2A3B)", gray: "#E9E1E3", muted: "#8C7C80" };
const MEN = "#4A5B7A"; // the other side: cool slate next to the garnet

const f = (i: number, w: string, n = 0) => at(L, i, w, n);

/* 1. Hook: a scoreboard of the war - both sides keep scoring, it resets to 0 : 0, the trophy is crossed out */
const Hook: React.FC<{ frame: number }> = ({ frame }) => {
  const T = usePalette();
  const reset = f(1, "не", 1); // "не бывает"
  const ticks = [30, 60, 84, 110, 135, 160];
  const score = (side: 0 | 1) => (frame >= reset ? 0 : ticks.filter((t, k) => k % 2 === side && frame >= t).length);
  const bump = (side: 0 | 1) => ticks.filter((t, k) => k % 2 === side).reduce((m, t) => Math.max(m, frame >= t && frame < reset ? 1 - progress(frame, t, t + 14) : 0), 0);
  const shake = frame >= reset && frame < reset + 18 ? Math.sin((frame - reset) * 2.4) * (1 - (frame - reset) / 18) * 16 : 0;
  const trophy = springAt(frame, f(1, "победителей"), SPRING.bouncy);
  const cross = springAt(frame, f(1, "победителей") + 16, SPRING.bouncy);
  const side = (s: 0 | 1, color: string) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
      <div style={{ position: "relative", width: 120, height: 120 }}>
        <Face color={color} size={120} smile={-0.4} style={{ left: 60, top: 60 }} />
      </div>
      <div style={{ ...NUMBER, fontSize: 190, color, transform: `scale(${1 + 0.18 * bump(s)})` }}>{score(s)}</div>
    </div>
  );
  return (
    <>
      <Title text="в войне полов нет *победителей*" frame={frame} at={[0, 3, 6, f(1, "не", 1), f(1, "победителей")]} size={88} />
      <div style={{ ...SURFACE, position: "absolute", left: 190, top: 470, width: 700, padding: 50, boxSizing: "border-box", display: "flex", justifyContent: "space-between", alignItems: "flex-end", transform: `translateX(${shake}px)`, ...appear(frame, 0) }}>
        {side(0, MEN)}
        <div style={{ ...NUMBER, fontSize: 150, color: T.gray, marginBottom: 20 }}>:</div>
        {side(1, T.main)}
      </div>
      <div style={{ position: "absolute", left: 540, top: 1020, width: 190, height: 190, marginLeft: -95, opacity: Math.min(1, trophy * 1.4), transform: `scale(${0.6 + 0.4 * trophy})` }}>
        <Trophy size={190} color={T.muted} strokeWidth={1.6} />
        <X size={210} color="#FF3B30" strokeWidth={2.6} style={{ position: "absolute", left: -10, top: -10, opacity: Math.min(1, cross * 1.5), transform: `scale(${cross})` }} />
      </div>
    </>
  );
};

/* 2-3. The voice message arrives and plays; the man's key thoughts appear above it */
const Voice: React.FC<{ frame: number }> = ({ frame }) => {
  const T = usePalette();
  const play = [lineAt(L, 3), lineEnd(L, 3)] as const;
  const badge = springAt(frame, f(2, "прислали"), SPRING.bouncy);
  const badgeOut = fadeOut(frame, f(2, "послушай") + 20);
  // the note sits in the middle, then moves down to make room for the quotes
  const down = ease.inOut(progress(frame, play[0] - 10, play[0] + 20));
  const quotes: [number, number, React.ReactNode][] = [
    [f(3, "только"), f(3, "я", 1), <Title key="a" text="только *женщины* или только *мужчины*" frame={frame} at={[f(3, "только"), f(3, "женщины"), f(3, "или"), f(3, "только", 1), f(3, "мужчины")]} size={80} />],
    [f(3, "я", 1), f(3, "оба"), <Title key="b" text="я говорю о _тенденциях_" frame={frame} at={[f(3, "я", 1), f(3, "говорю"), f(3, "о"), f(3, "тенденциях")]} size={92} />],
    [f(3, "оба"), f(3, "а"), <Title key="c" text="оба пола *хороши* каждый по своему" frame={frame} at={[f(3, "оба"), f(3, "пола"), f(3, "хороши"), f(3, "каждый"), f(3, "по-своему"), f(3, "по-своему") + 4]} size={80} />],
    [f(3, "а"), f(3, "а", 1), <Title key="d" text="под каждым *постом*" frame={frame} at={[f(3, "под"), f(3, "каждым"), f(3, "постом")]} size={92} />],
    [f(3, "а", 1), play[1] + 30, <Title key="e" text="пару ~не найти~" frame={frame} at={[f(3, "пару"), f(3, "не", 2), f(3, "найти")]} size={100} />],
  ];
  const posts = [
    { at: f(3, "мужчины", 1), text: "мужчины не те", color: T.main, x: 520, y: 400, rot: -2 },
    { at: f(3, "женщины", 1), text: "женщины не те", color: MEN, x: 560, y: 600, rot: 2 },
  ];
  const postsOut = fadeOut(frame, f(3, "а", 1) - 6, 12);
  return (
    <>
      <div style={{ position: "absolute", left: 540, top: 250, whiteSpace: "nowrap", transform: `translateX(-50%) scale(${2.4 * Math.min(1, badge)})`, opacity: Math.min(1, badge * 1.5) * badgeOut }}>
        <GlassPlate bg={T.plate}>
          <Mic size={20} /> Новое голосовое
        </GlassPlate>
      </div>
      {quotes.map(([a, b, el], i) => (frame >= a - 2 && frame < b + 10 ? <div key={i} style={{ opacity: fadeOut(frame, b - 6) }}>{el}</div> : null))}
      {posts.map((p, i) => (
        <Comment key={i} frame={frame} at={p.at} text={p.text} color={p.color} likes={[214, 198][i]} x={p.x} y={p.y} w={680} rot={p.rot} struck={f(3, "те", i) + 4} style={{ opacity: postsOut }} />
      ))}
      <VoiceNote frame={frame} at={f(2, "голосовое")} play={play} y={lerp(640, 900, down)} />
    </>
  );
};

/* 4-5. Confessions: their own comments, struck out; then the mirror question */
const Confess: React.FC<{ frame: number }> = ({ frame }) => {
  const T = usePalette();
  const out = fadeOut(frame, f(5, "и") - 4, 12);
  const mirror = springAt(frame, f(5, "какой"), SPRING.smooth);
  return (
    <>
      {frame < f(5, "и") + 10 && (
        <div style={{ opacity: out }}>
          <Title text="он *прав*" frame={frame} at={f(4, "прав")} size={100} />
          <Comment frame={frame} at={f(4, "писала")} text="нормальных мужчин не осталось" color={T.main} likes={512} y={440} w={820} rot={-1.5} struck={f(4, "осталось") + 6} />
          <Comment frame={frame} at={f(5, "парни")} text="парни разучились ухаживать" color={T.vivid} likes={347} y={790} w={820} rot={1.5} struck={f(5, "ухаживать") + 6} />
        </div>
      )}
      {frame >= f(5, "и") - 2 && (
        <>
          <Title text="а какой прихожу *сама*" frame={frame} at={[f(5, "и"), f(5, "какой"), f(5, "прихожу"), f(5, "сама")]} size={92} />
          <div style={{ position: "absolute", left: 540, top: 470, width: 380, height: 520, marginLeft: -190, borderRadius: "50%", border: `14px solid ${T.glow}`, background: `radial-gradient(circle at 35% 30%, #fff, ${T.pale})`, opacity: Math.min(1, mirror * 1.4), transform: `scale(${0.85 + 0.15 * mirror})` }}>
            <Face color={T.main} size={200} smile={lerp(-0.2, 0.3, progress(frame, f(5, "сама"), f(5, "сама") + 30))} style={{ left: 176, top: 250 }} />
          </div>
        </>
      )}
    </>
  );
};

/* 6. Each side defends its own: two camps behind shields; then flaws light up on both sides */
const Camps: React.FC<{ frame: number }> = ({ frame }) => {
  const T = usePalette();
  const t2 = f(6, "хотя");
  const camp = (cx: number, color: string, k: number) => (
    <>
      {[0, 1, 2, 3, 4].map((i) => {
        const x = cx + [-110, 0, 110, -55, 55][i];
        const y = [650, 620, 650, 780, 780][i];
        const a = f(6, "каждый") + k * 10 + i * 4;
        const flaw = springAt(frame, f(6, "придраться") + (i + k * 5) * 5, SPRING.bouncy);
        return (
          <React.Fragment key={i}>
            <div style={{ position: "absolute", left: x, top: y, ...appear(frame, a, SPRING.bouncy) }}>
              <Face color={color} size={96} smile={0.1} style={{ left: 0, top: 0 }} />
            </div>
            {[1, 3].includes(i) && <div style={{ position: "absolute", left: x + 34, top: y - 56, width: 26, height: 26, borderRadius: "50%", background: "#FF3B30", opacity: Math.min(1, flaw * 1.5), transform: `scale(${flaw})` }} />}
          </React.Fragment>
        );
      })}
      <div style={{ position: "absolute", left: cx - 150, top: 720, opacity: Math.min(1, springAt(frame, f(6, "своих") - 6 + k * 8, SPRING.bouncy) * 1.3), transform: `translateX(${(k ? -1 : 1) * 40 * (1 - Math.min(1, springAt(frame, f(6, "своих") - 6 + k * 8, SPRING.bouncy)))}px)` }}>
        <Shield size={300} color={color} fill={k ? T.pale : "#EDF0F5"} strokeWidth={1.4} />
      </div>
    </>
  );
  return (
    <>
      {frame < t2 + 10 && <div style={{ opacity: fadeOut(frame, t2 - 4) }}><Title text="каждый выгораживает *своих*" frame={frame} at={[f(6, "каждый"), f(6, "выгораживает"), f(6, "своих")]} size={88} /></div>}
      {frame >= t2 - 2 && <Title text="есть к чему придраться у *обеих*" frame={frame} at={[f(6, "есть"), f(6, "есть") + 4, f(6, "чему"), f(6, "придраться"), f(6, "у"), f(6, "обеих")]} size={80} />}
      {camp(300, MEN, 0)}
      {camp(780, T.main, 1)}
    </>
  );
};

/* 7. Two people argue (lightning between them), stop - and come together */
const Pair: React.FC<{ frame: number }> = ({ frame }) => {
  const T = usePalette();
  const stop = f(7, "перестал");
  const t2 = f(7, "а");
  const close = ease.inOut(progress(frame, stop, stop + 40));
  const heart = springAt(frame, f(7, "спорить"), SPRING.bouncy);
  return (
    <>
      {frame < t2 + 10 && <div style={{ opacity: fadeOut(frame, t2 - 4) }}><Title text="не те кто ~победил~ в споре" frame={frame} at={[f(7, "не"), f(7, "те"), f(7, "кто"), f(7, "победил"), f(7, "в"), f(7, "споре")]} size={84} /></div>}
      {frame >= t2 - 2 && <Title text="а те кто *перестал спорить*" frame={frame} at={[f(7, "а"), f(7, "те", 1), f(7, "кто", 1), f(7, "перестал"), f(7, "спорить")]} size={84} />}
      {[0, 1].map((s) => {
        const x = s ? lerp(820, 640, close) : lerp(260, 440, close);
        return (
          <div key={s} style={{ position: "absolute", left: x, top: 800, ...appear(frame, lineAt(L, 7) + s * 8, SPRING.bouncy) }}>
            <Face color={s ? T.main : MEN} size={190} smile={lerp(-0.4, 0.7, close)} style={{ left: 0, top: 0 }} />
          </div>
        );
      })}
      {[0, 1, 2].map((i) => {
        const a = lineAt(L, 7) + 20 + i * 26;
        const t = springAt(frame, a, SPRING.bouncy);
        const gone = progress(frame, stop - 4, stop + 10);
        return (
          <div key={i} style={{ position: "absolute", left: 540 + [-60, 50, -5][i], top: [560, 600, 680][i], opacity: Math.min(1, t * 1.4) * (1 - gone), transform: `translate(-50%, -50%) scale(${t * (1 - gone * 0.6)}) rotate(${[-12, 14, -4][i] + Math.sin(frame / 4 + i) * 6}deg)` }}>
            <Zap size={110} color={i % 2 ? T.vivid : MEN} fill={i % 2 ? T.glow : "#C9D1DF"} strokeWidth={1.6} />
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 540, top: 600, opacity: Math.min(1, heart * 1.4), transform: `translate(-50%, -50%) scale(${heart})` }}>
        <Heart size={150} color={T.main} fill={T.vivid} strokeWidth={1.4} />
      </div>
    </>
  );
};

/* 8. Moral: the one who defends only his own - the others walk away, he stays alone */
const Alone: React.FC<{ frame: number }> = ({ frame }) => {
  const T = usePalette();
  const t2 = f(8, "остается");
  const leave = ease.in(progress(frame, f(8, "своих"), t2 + 20));
  const plate = springAt(frame, lineAt(L, 8) - 6, SPRING.bouncy);
  const around = Array.from({ length: 8 }, (_, i) => {
    const ang = (i / 8) * Math.PI * 2 - Math.PI / 2;
    return { ang, c: i % 2 ? MEN : T.glow };
  });
  return (
    <>
      <div style={{ position: "absolute", left: 540, top: 170, whiteSpace: "nowrap", transform: `translateX(-50%) scale(${2.2 * Math.min(1, plate)})`, opacity: Math.min(1, plate * 1.5) }}>
        <GlassPlate bg={T.plate}>
          <Scale size={20} /> Мораль
        </GlassPlate>
      </div>
      {frame < t2 + 10 && <div style={{ opacity: fadeOut(frame, t2 - 4) }}><Title text="кто защищает только *своих*" frame={frame} at={[f(8, "кто"), f(8, "защищает"), f(8, "только"), f(8, "своих")]} size={84} top={330} /></div>}
      {frame >= t2 - 2 && <Title text="остается *один*" frame={frame} at={[f(8, "остается"), f(8, "один")]} size={110} top={330} />}
      {around.map(({ ang, c }, i) => {
        const r = 230 + leave * 520;
        return (
          <div key={i} style={{ position: "absolute", left: 540 + Math.cos(ang) * r, top: 860 + Math.sin(ang) * r * 0.75, opacity: (1 - leave) * Math.min(1, springAt(frame, lineAt(L, 8) + i * 3, SPRING.bouncy) * 1.4) }}>
            <Face color={c} size={90} smile={0.3} style={{ left: 0, top: 0 }} />
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 540, top: 860 }}>
        <Face color={T.main} size={150} smile={lerp(0.4, -0.5, leave)} style={{ left: 0, top: 0, ...appear(frame, lineAt(L, 8)) }} />
      </div>
    </>
  );
};

/* 9. Final: stop the war - two faces side by side, a heart */
const Final: React.FC<{ frame: number }> = ({ frame }) => {
  const T = usePalette();
  const h = springAt(frame, f(9, "полов") + 10, SPRING.bouncy);
  return (
    <>
      <Title text="хватит войны *полов*" frame={frame} at={[f(9, "хватит"), f(9, "войны"), f(9, "полов")]} size={120} top={300} />
      {[0, 1].map((s) => (
        <div key={s} style={{ position: "absolute", left: 540 + (s ? 95 : -95), top: 860, ...appear(frame, lineAt(L, 9) + s * 6, SPRING.bouncy) }}>
          <Face color={s ? T.main : MEN} size={170} smile={0.8} style={{ left: 0, top: 0 }} />
        </div>
      ))}
      <div style={{ position: "absolute", left: 540, top: 690, opacity: Math.min(1, h * 1.4), transform: `translate(-50%, -50%) scale(${h})` }}>
        <Heart size={110} color={T.main} fill={T.vivid} strokeWidth={1.4} />
      </div>
    </>
  );
};

const AHU: AvatarKey[] = [
  { at: -40, e: "arms-crossed" }, { at: 110, e: "explaining" }, { at: 200, e: "shrug" },
  { at: 285, e: "listening" }, { at: 372, e: "pensive" },
  // the voice message
  { at: 560, e: "thinking" }, { at: 690, e: "skeptical" }, { at: 795, e: "soft-smile" }, { at: 880, e: "hand-on-heart" }, { at: 960, e: "point-down" },
  { at: 1080, e: "displeased" }, { at: 1160, e: "surprised" }, { at: 1290, e: "disappointed" }, { at: 1380, e: "puzzled" },
  // 4. he is right, I wrote it myself
  { at: 1440, e: "point-up" }, { at: 1505, e: "facepalm" }, { at: 1600, e: "laughing" },
  // 5. Alicja confesses
  { at: 1710, e: "point-right" }, { at: 1890, e: "dreamy" },
  // 6. each defends his own
  { at: 2030, e: "stop" }, { at: 2150, e: "present-left" }, { at: 2250, e: "inspired" },
  // 7. Alicja: those who stopped arguing
  { at: 2330, e: "smile-up" }, { at: 2410, e: "thumbs-up" }, { at: 2525, e: "delighted" },
  // 8. moral
  { at: 2605, e: "arms-crossed" }, { at: 2700, e: "pensive" },
  // 9. stop the war
  { at: 2780, e: "victory" }, { at: 2835, e: "heart-hands" }, { at: 2880, e: "waving" },
];
const ALICJA: AvatarKey[] = [
  { at: -34, e: "skeptical" }, { at: 130, e: "listening" }, { at: 220, e: "thinking" },
  // 2. we got a voice message - listen
  { at: 275, e: "explaining" }, { at: 360, e: "shush" },
  // the voice message
  { at: 470, e: "pensive" }, { at: 590, e: "surprised" }, { at: 700, e: "skeptical" }, { at: 805, e: "smile-up" }, { at: 895, e: "soft-smile" }, { at: 975, e: "point-down" },
  { at: 1090, e: "facepalm" }, { at: 1170, e: "disappointed" }, { at: 1300, e: "displeased" }, { at: 1390, e: "hand-on-heart" },
  // 4. Ahu: he is right
  { at: 1455, e: "thumbs-up" }, { at: 1560, e: "present-left" },
  // 5. me too: guys forgot how to court - and never asked how I come myself
  { at: 1700, e: "arms-crossed" }, { at: 1800, e: "laughing" }, { at: 1880, e: "puzzled" }, { at: 1960, e: "dreamy" },
  // 6. Ahu: each defends his own
  { at: 2040, e: "listening" }, { at: 2110, e: "stop" }, { at: 2200, e: "point-right" },
  // 7. those who stopped arguing
  { at: 2320, e: "inspired" }, { at: 2400, e: "point-up" }, { at: 2500, e: "heart-hands" }, { at: 2595, e: "clapping" },
  // 8. Ahu: moral
  { at: 2625, e: "shrug" }, { at: 2720, e: "pensive" },
  // 9. stop the war
  { at: 2800, e: "victory" }, { at: 2850, e: "delighted" }, { at: 2895, e: "waving" },
];

const S = (i: number) => lineAt(L, i);
const SCENES: TalkScene[] = [
  [[0, S(2)], Hook],
  [[S(2), S(4)], Voice],
  [[S(4), S(6)], Confess],
  [[S(6), S(7)], Camps],
  [[S(7), S(8)], Pair],
  [[S(8), S(9)], Alone],
  [[S(9), END + 30], Final],
];

const CFG: TalkCfg = {
  lines: L,
  end: END,
  T,
  bg: 5,
  music: "v54/music/bed.mp3",
  ahu: AHU,
  alicja: ALICJA,
  alicjaDir: "v54/avatar",
  // both nod on the man's key words
  nods: { ahu: [f(3, "тенденциях"), f(3, "хороши"), f(3, "те"), f(3, "найти")], alicja: [f(3, "тенденциях") + 8, f(3, "по-своему"), f(3, "те", 1), f(3, "найти") + 8] },
  scenes: SCENES,
  sfx: [
    { src: "sfx/07_CineStrike.wav", from: 2, volume: 0.14 },
    ...[30, 60, 84, 110, 135, 160].map((t) => ({ src: "sfx2/click.mp3", from: t, volume: 0.14 })),
    { src: "sfx/03_Basscrack.wav", from: f(1, "не", 1), volume: 0.08 },
    { src: "sfx/05_Distortion_Glitch.wav", from: f(1, "победителей") + 16, volume: 0.04 },
    // the voice message: ding, tap play
    { src: "sfx/01_Ripple_Textures.wav", from: S(2) - 8, volume: 0.16 },
    { src: "sfx2/ding.mp3", from: f(2, "прислали"), volume: 0.2 },
    { src: "sfx2/click.mp3", from: S(3) - 6, volume: 0.24 },
    { src: "sfx2/pop.mp3", from: f(3, "мужчины", 1), volume: 0.16 },
    { src: "sfx2/pop.mp3", from: f(3, "женщины", 1), volume: 0.16 },
    { src: "sfx/05_Distortion_Glitch.wav", from: f(3, "найти") + 6, volume: 0.035 },
    // confessions
    { src: "sfx/04_Cyber_Shift.wav", from: S(4) - 8, volume: 0.18 },
    { src: "sfx2/pop.mp3", from: f(4, "писала"), volume: 0.16 },
    { src: "sfx/05_Distortion_Glitch.wav", from: f(4, "осталось") + 6, volume: 0.035 },
    { src: "sfx2/pop.mp3", from: f(5, "парни"), volume: 0.16 },
    { src: "sfx/05_Distortion_Glitch.wav", from: f(5, "ухаживать") + 6, volume: 0.035 },
    // camps, flaws
    { src: "sfx/02_Alienated_Warpes.wav", from: S(6) - 8, volume: 0.14 },
    { src: "sfx/03_Basscrack.wav", from: f(6, "своих") - 4, volume: 0.07 },
    { src: "sfx2/pop.mp3", from: f(6, "придраться"), volume: 0.14 },
    // the pair
    { src: "sfx/06_Ripple_Textures_II.wav", from: S(7) - 8, volume: 0.18 },
    { src: "sfx2/ding.mp3", from: f(7, "спорить"), volume: 0.18 },
    // moral, final
    { src: "sfx/01_Ripple_Textures.wav", from: S(8) - 8, volume: 0.16 },
    { src: "sfx/03_Basscrack.wav", from: f(8, "один"), volume: 0.07 },
    { src: "sfx/07_CineStrike.wav", from: S(9), volume: 0.14 },
    { src: "sfx2/pop.mp3", from: f(9, "полов") + 10, volume: 0.18 },
  ],
};

export const F = { duration: END };
export const Video54: React.FC = () => <TalkReel cfg={CFG} />;
