import React from "react";
import { SoloReel, at, type TalkScene } from "../kit/talk";
import type { AvatarKey, StanceKey } from "../kit/TatAvatar";
import type { Sfx } from "../kit/reel";
import { ALSU, ALSU_PALETTES, BigType, Confetti, INK_ALSU, Pill, QuizCard, RoundBadge, StickerWord } from "../kit/presets/alsu";
import { LINES, END } from "./lines";

// V78 «Проверь себя» - host preset demo: Alsu («студентка», palette cobalt, cover sticker).
// A question to the viewer -> «проверь себя» -> the answer: most people don't realize they already know Tatar, let's check ->
// Рәхмәт = спасибо or привет? -> Әйе = да -> two of two, you know more than you think.
// Preset look: SoloReel look (sticker background with turning rays, swipe transitions), preset Title (key word = sticker pill),
// elements from src/kit/presets/alsu.tsx. The voice says «Рахмэт», «эйе»; the screen shows the real Tatar spelling.

// the conclusion holds 0.6 s after the last word before the outro
const HOLD = END + 36;
export const F = { duration: HOLD };
const pal = ALSU_PALETTES.find((p) => p.name === "cobalt")!;
const { Title } = ALSU;
const w = (i: number, word: string, nth = 0) => at(LINES, i, word, nth);
const S2 = LINES[1].from;
const S3 = w(3, "а");
const S4 = LINES[3].from;
const RIGHT = w(3, "спасибо"); // line 3: «Спасибо!»
const YES = w(3, "да");

/* ───────── 1. Most people don't realize they already know Tatar. Let's check ───────── */

const Hook: React.FC<{ frame: number }> = ({ frame }) => {
  const out = w(1, "уже") - 10;
  return (
    <>
      <StickerWord frame={frame} at={w(1, "большинство")} out={out} text="большинство" y={330} size={88} rot={-4} />
      <Pill frame={frame} at={w(1, "не")} out={out} pal={pal} text="не понимает" y={540} size={70} rot={5} />
      {frame >= out && <Title text="уже знаешь *татарский*" frame={frame} at={[w(1, "уже"), w(1, "знает"), w(1, "татарский")]} pal={pal} top={330} size={100} />}
      <Pill frame={frame} at={w(1, "проверим")} pal={pal} text="проверим" y={720} size={78} rot={-4} bg="#fff" color={INK_ALSU} />
      <RoundBadge frame={frame} at={w(1, "проверим") + 8} big="0/2" small="верно" x={190} y={650} d={190} rot={-12} />
    </>
  );
};

/* ───────── 2. Рәхмәт - спасибо or привет? -> спасибо ───────── */

const Q1: React.FC<{ frame: number }> = ({ frame }) => (
  <>
    <RoundBadge frame={frame} at={S2 + 4} big={frame >= RIGHT ? "1/2" : "0/2"} small="верно" x={900} y={255} d={170} rot={10} bumpAt={[RIGHT]} />
    <QuizCard
      frame={frame}
      at={w(2, "рахмэт")}
      pal={pal}
      question="Рәхмәт"
      lead="это"
      y={360}
      options={[
        { text: "спасибо", at: w(2, "спасибо"), correct: true, judge: RIGHT },
        { text: "привет", at: w(2, "привет"), judge: RIGHT + 16 },
      ]}
    />
    <Confetti frame={frame} at={RIGHT + 4} pal={pal} x={540} y={760} n={30} />
  </>
);

/* ───────── 3. And Әйе? It's «да» ───────── */

const Q2: React.FC<{ frame: number }> = ({ frame }) => (
  <>
    <RoundBadge frame={frame} at={S3} big={frame >= YES ? "2/2" : "1/2"} small="верно" x={900} y={255} d={170} rot={10} bumpAt={[YES]} />
    <QuizCard
      frame={frame}
      at={S3 + 4}
      pal={pal}
      question="Әйе"
      lead="это"
      y={360}
      options={[
        { text: "нет", at: w(3, "эйе") + 8, judge: w(3, "это") },
        { text: "да", at: w(3, "эйе") + 16, correct: true, judge: YES },
      ]}
    />
    <Confetti frame={frame} at={YES + 4} pal={pal} x={540} y={900} n={30} />
  </>
);

/* ───────── 4. Two of two - you know more than you think ───────── */

const Score: React.FC<{ frame: number }> = ({ frame }) => (
  <>
    <RoundBadge frame={frame} at={w(4, "два")} big="2/2" small="верно" x={540} y={440} d={330} rot={-8} bumpAt={[w(4, "двух")]} />
    <Confetti frame={frame} at={w(4, "двух")} pal={pal} x={540} y={440} n={44} power={1.3} />
    <BigType frame={frame} at={[w(4, "знаешь"), w(4, "больше")]} pal={pal} lines={["знаешь", "больше"]} y={700} size={156} />
    <Pill frame={frame} at={w(4, "думаешь")} pal={pal} text="чем думаешь" y={1080} size={66} rot={-4} />
  </>
);

/* ───────── Composition ───────── */

const SCENES: TalkScene[] = [
  [[0, S2], Hook],
  [[S2, S3], Q1],
  [[S3, S4], Q2],
  [[S4, HOLD + 40], Score],
];

// 11 poses by meaning, never twice in a row, the fastest changes of the four hosts (~1-1.7 s)
const KEYS: AvatarKey[] = [
  { at: 0, e: "point-up" }, // most people
  { at: w(1, "что"), e: "wink" }, // already know Tatar
  { at: w(1, "проверим"), e: "clapping" }, // let's check
  { at: S2, e: "thinking" }, // Рәхмәт is
  { at: w(2, "или"), e: "puzzled" }, // or привет?
  { at: RIGHT, e: "thumbs-up" }, // спасибо!
  { at: S3, e: "skeptical" }, // and Әйе?
  { at: w(3, "это") + 6, e: "delighted" }, // it's да
  { at: S4, e: "victory" }, // two of two
  { at: w(4, "ты"), e: "proud" }, // you know more
  { at: w(4, "чем"), e: "air-kiss" }, // than you think
];

const STANCES: StanceKey[] = [
  { at: 0, s: "right" },
  { at: S2, s: "left" },
  { at: S3, s: "right" },
  { at: S4, s: "center" },
];

const SFX: Sfx[] = [
  { src: "sfx/07_CineStrike.wav", from: 2, volume: 0.1 },
  { src: "sfx2/pop.mp3", from: w(1, "большинство"), volume: 0.16 },
  { src: "sfx2/pop.mp3", from: w(1, "не"), volume: 0.16 },
  { src: "sfx2/pop.mp3", from: w(1, "татарский"), volume: 0.18 },
  { src: "sfx2/ding.mp3", from: w(1, "проверим"), volume: 0.16 },
  { src: "sfx/04_Cyber_Shift.wav", from: S2 - 8, volume: 0.15 },
  { src: "sfx2/pop.mp3", from: w(2, "рахмэт"), volume: 0.18 },
  { src: "sfx2/click.mp3", from: w(2, "спасибо"), volume: 0.18 },
  { src: "sfx2/click.mp3", from: w(2, "привет"), volume: 0.18 },
  { src: "sfx2/ding.mp3", from: RIGHT, volume: 0.18 },
  { src: "sfx/05_Distortion_Glitch.wav", from: RIGHT + 16, volume: 0.04 },
  { src: "sfx/01_Ripple_Textures.wav", from: S3 - 8, volume: 0.14 },
  { src: "sfx2/pop.mp3", from: S3 + 4, volume: 0.18 },
  { src: "sfx/05_Distortion_Glitch.wav", from: w(3, "это"), volume: 0.04 },
  { src: "sfx2/ding.mp3", from: YES, volume: 0.18 },
  { src: "sfx/06_Ripple_Textures_II.wav", from: S4 - 8, volume: 0.14 },
  { src: "sfx/03_Basscrack.wav", from: w(4, "два"), volume: 0.08 },
  { src: "sfx2/ding.mp3", from: w(4, "двух"), volume: 0.18 },
  { src: "sfx2/pop.mp3", from: w(4, "знаешь"), volume: 0.18 },
  { src: "sfx2/pop.mp3", from: w(4, "больше"), volume: 0.18 },
  { src: "sfx2/pop.mp3", from: w(4, "думаешь"), volume: 0.16 },
];

export const Video78: React.FC = () => (
  <SoloReel cfg={{ host: "alsu", look: true, T: pal, bg: 1, music: "v78/music/bed.mp3", lines: LINES, end: HOLD, keys: KEYS, stances: STANCES, scenes: SCENES, sfx: SFX }} />
);
