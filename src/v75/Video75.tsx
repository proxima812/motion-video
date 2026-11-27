import React from "react";
import { CalendarDays, Repeat } from "lucide-react";
import { SPRING, progress, springAt } from "../stage/motion";
import { GlassPlate } from "../catalog/own/glass";
import { UNB } from "../cover/CoverLab";
import type { AvatarKey, StanceKey } from "../kit/TatAvatar";
import { SoloReel, at, lineAt, type TalkScene } from "../kit/talk";
import type { Sfx } from "../kit/reel";
import { AHU, AHU_PALETTES, Checklist, FactChip, GiantNumber, StruckToBig } from "../kit/presets/ahu";
import { END, LINES as L } from "./lines";

// V75 «Пять минут в день» (@the_tatarverse, host preset demo: Ahu - «эксперт», RU). Hook #5.
// Thesis -> number -> short conclusion: you learn Tatar once a month for an hour -> 5 minutes a day = 30 hours a year
// -> a word in the morning, a song on the way, a phrase to mom (1 + 3 + 1 = 5:00) -> language is a habit, not a talent.
// Preset: Ahu, palette emerald; her look = timer / giant-number covers (grid, ripple, gradient Unbounded numbers).
const pal = AHU_PALETTES[0];
const { Title, motion } = AHU;
const f = (i: number, w: string, n = 0) => at(L, i, w, n);
const S = (i: number) => lineAt(L, i);
const TAIL = 20; // a breath after the last word

/* 1. Hook: this is why it doesn't work -> once a month for an hour: one filled day of 30 */
const MonthGrid: React.FC<{ frame: number; a: number; fill: number; dim: number }> = ({ frame, a, fill, dim }) => {
  const COLS = 6;
  const CELL = 100;
  const GAP = 16;
  const w = COLS * CELL + (COLS - 1) * GAP + 80;
  const filled = springAt(frame, fill, SPRING.bouncy);
  const fade = progress(frame, dim, dim + 16);
  return (
    <div style={{ position: "absolute", left: 540 - w / 2, top: 470, width: w, background: "#fff", borderRadius: 44, boxShadow: "-1px -6px 55px -11px rgba(144, 142, 142, 0.2)", padding: 40, boxSizing: "border-box", display: "grid", gridTemplateColumns: `repeat(${COLS}, ${CELL}px)`, gap: GAP, ...motion.enter(frame, a) }}>
      {Array.from({ length: 30 }, (_, i) => {
        const t = Math.min(1, springAt(frame, a + 4 + i, SPRING.snappy));
        const on = i === 0 && frame >= fill;
        return (
          <div key={i} style={{ width: CELL, height: CELL, borderRadius: 22, boxSizing: "border-box", background: on ? pal.vivid : pal.pale, border: on ? "none" : `3px solid ${pal.gray}`, transform: `scale(${(0.5 + 0.5 * t) * (on ? 1 + 0.12 * Math.sin(Math.min(1, filled) * Math.PI) : 1)})`, opacity: t * (on ? 1 : 1 - 0.55 * fade), display: "grid", placeItems: "center" }}>
            {on && <span style={{ fontFamily: UNB, fontWeight: 700, fontSize: 38, color: "#fff", letterSpacing: "-0.04em" }}>60</span>}
          </div>
        );
      })}
    </div>
  );
};

const Hook: React.FC<{ frame: number }> = ({ frame }) => (
  <>
    {frame < f(1, "ты") + 6 && <Title text="вот почему *не получается*" frame={frame} at={[0, 3, 6, 9]} pal={pal} size={104} top={240} style={motion.exit(frame, f(1, "ты") - 4)} />}
    {frame >= f(1, "ты") - 6 && (
      <>
        <MonthGrid frame={frame} a={f(1, "ты") - 6} fill={f(1, "раз")} dim={f(1, "часу")} />
        <Title text="раз в месяц *по часу*" frame={frame} at={[f(1, "раз"), f(1, "в"), f(1, "месяц"), f(1, "по"), f(1, "часу")]} pal={pal} size={92} top={220} />
      </>
    )}
  </>
);

/* 2. Five minutes a day = 30 hours a year (12 h a year once a month - struck) */
const Thirty: React.FC<{ frame: number }> = ({ frame }) => (
  <>
    <Title text="*5 минут* в день" frame={frame} at={[f(2, "пять"), f(2, "минут"), f(2, "в"), f(2, "день")]} pal={pal} size={104} top={210} />
    <StruckToBig frame={frame} pal={pal} struck="12 ч" big="30 ч" at={f(2, "это") - 14} strikeAt={f(2, "это")} bigAt={f(2, "тридцать")} y={470} bigSize={250} />
    <FactChip frame={frame} at={f(2, "год") - 6} pal={pal} icon={CalendarDays} text="за год" y={900} size={50} />
  </>
);

/* 3. A word in the morning, a song on the way, a phrase to mom: 1 + 3 + 1 minutes -> the timer reaches 5:00 */
const Habit: React.FC<{ frame: number }> = ({ frame }) => {
  const c1 = f(3, "утром") + 4;
  const c2 = f(3, "дороге") + 4;
  const c3 = f(3, "маме") + 4;
  const seg = frame < c2 ? { from: 0, to: 1, at: c1 } : frame < c3 ? { from: 1, to: 4, at: c2 } : { from: 4, to: 5, at: c3 };
  return (
    <>
      <GiantNumber frame={frame} pal={pal} appear={S(3) + 2} at={seg.at} from={seg.from} to={seg.to} dur={16} suffix=":00" size={210} y={190} />
      <Checklist
        frame={frame}
        pal={pal}
        y={500}
        size={60}
        rows={[
          { text: "слово утром", at: f(3, "одно"), check: c1, note: "1" },
          { text: "песня в дороге", at: f(3, "одна"), check: c2, note: "3" },
          { text: "фраза маме", at: f(3, "одна", 1), check: c3, note: "1" },
        ]}
      />
    </>
  );
};

/* 4. Language is a habit, not a talent */
const Habit2: React.FC<{ frame: number }> = ({ frame }) => {
  const plate = springAt(frame, f(4, "привычка") + 18, SPRING.bouncy);
  return (
    <>
      <Title text="язык это *привычка*" frame={frame} at={[f(4, "язык"), f(4, "это"), f(4, "привычка")]} pal={pal} size={116} top={330} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 690, display: "flex", justifyContent: "center", opacity: Math.min(1, plate * 2), transform: `scale(${0.7 + 0.3 * Math.min(plate, 1.06)})` }}>
        <div style={{ transform: "scale(2.3)" }}>
          <GlassPlate bg={pal.plate}>
            <Repeat size={19} strokeWidth={2.4} /> каждый день
          </GlassPlate>
        </div>
      </div>
      <StruckToBig frame={frame} pal={pal} struck="талант" at={f(4, "не")} strikeAt={f(4, "талант") + 8} y={900} struckSize={110} />
    </>
  );
};

const SCENES: TalkScene[] = [
  [[0, S(2)], Hook],
  [[S(2), S(3)], Thirty],
  [[S(3), S(4)], Habit],
  [[S(4), END + TAIL + 30], Habit2],
];

const SFX: Sfx[] = [
  { src: "sfx/07_CineStrike.wav", from: 2, volume: 0.14 },
  { src: "sfx2/pop.mp3", from: f(1, "не"), volume: 0.14 },
  { src: "sfx2/click.mp3", from: f(1, "ты") - 6, volume: 0.2 },
  { src: "sfx2/ding.mp3", from: f(1, "раз"), volume: 0.16 },
  { src: "sfx/01_Ripple_Textures.wav", from: S(2) - 8, volume: 0.16 },
  { src: "sfx/05_Distortion_Glitch.wav", from: f(2, "это"), volume: 0.04 },
  { src: "sfx/03_Basscrack.wav", from: f(2, "тридцать"), volume: 0.07 },
  { src: "sfx2/pop.mp3", from: f(2, "год") - 6, volume: 0.16 },
  { src: "sfx/04_Cyber_Shift.wav", from: S(3) - 8, volume: 0.16 },
  { src: "sfx2/click.mp3", from: f(3, "утром") + 4, volume: 0.2 },
  { src: "sfx2/click.mp3", from: f(3, "дороге") + 4, volume: 0.2 },
  { src: "sfx2/ding.mp3", from: f(3, "маме") + 4, volume: 0.18 },
  { src: "sfx/06_Ripple_Textures_II.wav", from: S(4) - 8, volume: 0.16 },
  { src: "sfx2/pop.mp3", from: f(4, "привычка") + 18, volume: 0.18 },
  { src: "sfx/05_Distortion_Glitch.wav", from: f(4, "талант") + 8, volume: 0.04 },
  { src: "sfx/07_CineStrike.wav", from: f(4, "талант") + 12, volume: 0.1 },
];

// 11 poses by meaning, a change every ~1-2 s, never twice in a row
const KEYS: AvatarKey[] = [
  { at: 0, e: "skeptical" },
  { at: f(1, "не") - 2, e: "eye-roll" },
  { at: f(1, "ты"), e: "explaining" },
  { at: f(1, "по") - 4, e: "shrug" },
  { at: S(2), e: "point-up" },
  { at: f(2, "тридцать"), e: "delighted" },
  { at: S(3), e: "smile-up" },
  { at: f(3, "одна"), e: "listening" },
  { at: f(3, "одна", 1), e: "hand-on-heart" },
  { at: S(4), e: "thumbs-up" },
  { at: f(4, "а"), e: "wink" },
];

const STANCES: StanceKey[] = [
  { at: 0, s: "right" },
  { at: S(2), s: "left" },
  { at: S(3), s: "right" },
  { at: S(4), s: "center" },
];

export const F = { duration: END + TAIL };

export const Video75: React.FC = () => (
  <SoloReel cfg={{ host: "ahu", look: true, T: pal, bg: 1, music: "v75/music/bed.mp3", lines: L, end: F.duration, keys: KEYS, stances: STANCES, scenes: SCENES, sfx: SFX }} />
);
