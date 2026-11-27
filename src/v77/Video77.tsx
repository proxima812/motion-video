import React from "react";
import { ease, lerp, progress } from "../stage/motion";
import type { AvatarKey, StanceKey } from "../kit/TatAvatar";
import { SoloReel, at, lineAt, type TalkScene } from "../kit/talk";
import type { Sfx } from "../kit/reel";
import { BeforeAfter, KAMILYA, KAMILYA_PALETTES, SerifQuote, Stamp, TulipMark } from "../kit/presets/kamilya";
import { END, LINES as L } from "./lines";

// V77 «Бабушкин сундук» (@the_tatarverse, host preset demo: Kamilya - «хранительница», RU). Hook #6.
// Раньше -> сейчас -> мораль: brides embroidered towels with tulips (a sign of life) -> today they lie folded for years
// -> a tradition dies not when it is forgotten but when it is hidden -> take the towel out, let the tulips be seen.
// Preset: Kamilya, palette garnet; her look = form-stamp / map covers (ruled paper, Prata serif, stamps), slow dissolves.
const pal = KAMILYA_PALETTES[0];
const { Title, motion } = KAMILYA;
const f = (i: number, w: string, n = 0) => at(L, i, w, n);
const S = (i: number) => lineAt(L, i);
const TAIL = 24; // a breath after the last word
const GOLD = "#C9962B";
const LEAF = "#7D8B3A";
const LINEN = "#FBF7EF";
const slow = (frame: number, a: number, len = 30) => ease.inOut(progress(frame, a, a + len));

/* ───────── Drawn props ───────── */

/** Grandmother's chest: garnet body with gold bands and a gold tulip; `open` 0..1 lifts the lid with a warm glow */
const Chest: React.FC<{ open: number; scale?: number; x?: number; y: number; style?: React.CSSProperties }> = ({ open, scale = 1, x = 540, y, style }) => {
  const W = 560;
  return (
    <div style={{ position: "absolute", left: x - (W / 2) * scale, top: y, width: W, height: 420, transform: `scale(${scale})`, transformOrigin: "0 0", ...style }}>
      <div style={{ position: "absolute", left: 40, right: 40, top: 60, height: 140, borderRadius: "50%", background: `radial-gradient(closest-side, ${pal.glow}, transparent)`, opacity: open * 0.9, filter: "blur(6px)" }} />
      {/* body */}
      <div style={{ position: "absolute", left: 0, top: 130, width: W, height: 280, borderRadius: "0 0 26px 26px", background: `linear-gradient(180deg, ${pal.vivid}, ${pal.main})`, boxShadow: `0 30px 50px -24px ${pal.main}` }}>
        {[60, W - 96].map((l) => <div key={l} style={{ position: "absolute", left: l, top: 0, width: 36, height: 280, background: GOLD, opacity: 0.9 }} />)}
        <div style={{ position: "absolute", left: 0, right: 0, top: 120, height: 14, background: GOLD, opacity: 0.55 }} />
        <TulipMark size={62} color={GOLD} leaf={GOLD} style={{ position: "absolute", left: W / 2 - 31, top: 40 }} />
      </div>
      {/* lid, hinged at the back left */}
      <div style={{ position: "absolute", left: 0, top: 30, width: W, height: 104, borderRadius: "30px 30px 6px 6px", background: `linear-gradient(180deg, ${pal.vivid}, ${pal.main})`, transformOrigin: "0% 100%", transform: `translateY(${-open * 34}px) rotate(${-open * 9}deg)` }}>
        {[60, W - 96].map((l) => <div key={l} style={{ position: "absolute", left: l, top: 0, width: 36, height: 104, background: GOLD, opacity: 0.9, borderRadius: "8px 8px 0 0" }} />)}
      </div>
    </div>
  );
};

/** Embroidered linen towel: a garnet border, a row of tulips that grow in one by one (`bloom` = start frame), fringe */
const Towel: React.FC<{ frame: number; bloom: number; w?: number; h?: number; style?: React.CSSProperties }> = ({ frame, bloom, w = 300, h = 520, style }) => (
  <div style={{ position: "relative", width: w, height: h, background: LINEN, borderRadius: 6, boxShadow: "0 16px 30px -18px rgba(60,20,30,0.45)", ...style }}>
    {[28, h - 96].map((t) => <div key={t} style={{ position: "absolute", left: 14, right: 14, top: t, height: 8, background: pal.vivid, opacity: 0.85 }} />)}
    <div style={{ position: "absolute", left: 0, right: 0, top: h - 230, display: "flex", justifyContent: "center", gap: w * 0.06 }}>
      {[0, 1, 2].map((i) => <TulipMark key={i} size={w * 0.22} color={pal.vivid} leaf={LEAF} grow={ease.out(progress(frame, bloom + i * 12, bloom + i * 12 + 24))} />)}
    </div>
    <div style={{ position: "absolute", left: 10, right: 10, bottom: -26, height: 26, backgroundImage: `repeating-linear-gradient(90deg, ${pal.glow} 0 3px, transparent 3px 11px)` }} />
  </div>
);

/** Folded towels: three flat linen blocks in the middle of the panel, only a faded edge of embroidery with tulips peeks out */
const Folded: React.FC = () => (
  <div style={{ position: "absolute", left: 40, right: 40, top: 150, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
    {[0, 1, 2].map((i) => (
      <div key={i} style={{ position: "relative", width: 280 - i * 8, height: 86, borderRadius: 10, background: "#EFE9DF", boxShadow: "0 8px 14px -10px rgba(60,40,30,0.4)", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 14, height: 6, background: pal.vivid, opacity: 0.3 }} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 22, display: "flex", justifyContent: "center", gap: 30, opacity: 0.35 }}>
          {[0, 1, 2].map((k) => <TulipMark key={k} size={22} color={pal.vivid} leaf={LEAF} />)}
        </div>
      </div>
    ))}
  </div>
);

/* 1. Hook: the whole truth about grandmother's chest - it opens a little, light comes out */
const Hook: React.FC<{ frame: number }> = ({ frame }) => (
  <>
    <Title text="вся правда о *бабушкином сундуке*" frame={frame} at={0} pal={pal} size={86} top={220} />
    <div style={{ ...motion.enter(frame, 14) }}>
      <Chest open={slow(frame, f(1, "сундуке"), 40)} y={660} />
    </div>
  </>
);

/* 2-3. Раньше / сейчас: a towel with tulips being embroidered -> today the towels lie folded for years */
const ThenNow: React.FC<{ frame: number }> = ({ frame }) => {
  const tulipEnd = S(3) - 8;
  return (
    <>
      {frame < tulipEnd + 22 && <Title text="*тюльпан* знак жизни" frame={frame} at={[f(2, "тюльпанами"), f(2, "знаком"), f(2, "жизни")]} pal={pal} size={84} top={200} style={motion.exit(frame, tulipEnd)} />}
      {frame >= S(3) && <Title text="годами *сложены*" frame={frame} at={[f(3, "годами"), f(3, "сложенными")]} pal={pal} size={84} top={200} />}
      <BeforeAfter
        frame={frame}
        pal={pal}
        y={430}
        h={680}
        left={{ label: "раньше", at: S(2) + 2, children: <Towel frame={frame} bloom={f(2, "тюльпанами")} w={260} h={470} style={{ position: "absolute", left: 70, top: 50 }} /> }}
        right={{ label: "сейчас", at: f(3, "сегодня"), children: <Folded /> }}
      />
    </>
  );
};

/* 4. A tradition dies not when it is forgotten (struck) but when it is hidden - the chest closes */
const Moral: React.FC<{ frame: number }> = ({ frame }) => (
  <>
    <SerifQuote
      frame={frame}
      pal={pal}
      y={300}
      size={104}
      lines={[
        { text: "традиция умирает", at: f(4, "традиция") },
        { text: "забывают", at: f(4, "забывают") - 6, strike: f(4, "а") },
        { text: "когда *прячут*", at: f(4, "когда", 1) },
      ]}
    />
    <div style={{ ...motion.enter(frame, f(4, "забывают")) }}>
      <Chest open={1 - slow(frame, f(4, "прячут") - 4, 22)} scale={0.62} y={880} />
    </div>
  </>
);

/* 5. Take the towel out: it unrolls on a rod, tulips bloom, a stamp «на виду» */
const Out: React.FC<{ frame: number }> = ({ frame }) => {
  const unroll = slow(frame, f(5, "полотенце") - 6, 40);
  const W = 340;
  const H = 560;
  return (
    <>
      <Title text="*достань* полотенце" frame={frame} at={[f(5, "достань"), f(5, "полотенце")]} pal={pal} size={92} top={190} />
      <div style={{ position: "absolute", left: 540 - 230, top: 470, width: 460, height: 16, borderRadius: 8, background: "#8A5A3A", opacity: slow(frame, S(5), 20) }} />
      <div style={{ position: "absolute", left: 540 - W / 2, top: 482, width: W, height: H + 30, clipPath: `inset(0 -40px ${lerp(100, 0, unroll)}% -40px)` }}>
        <Towel frame={frame} bloom={f(5, "тюльпаны")} w={W} h={H} />
      </div>
      <Stamp frame={frame} at={f(5, "виду") - 2} pal={pal} text="НА ВИДУ" x={790} y={1000} size={250} rot={-14} />
    </>
  );
};

const SCENES: TalkScene[] = [
  [[0, S(2)], Hook],
  [[S(2), S(4)], ThenNow],
  [[S(4), S(5)], Moral],
  [[S(5), END + TAIL + 30], Out],
];

// fewer, softer sounds than the other presets
const SFX: Sfx[] = [
  { src: "sfx/07_CineStrike.wav", from: 2, volume: 0.08 },
  { src: "sfx/01_Ripple_Textures.wav", from: f(1, "сундуке"), volume: 0.12 },
  { src: "sfx/06_Ripple_Textures_II.wav", from: S(2) - 8, volume: 0.12 },
  { src: "sfx2/ding.mp3", from: f(2, "тюльпанами") + 8, volume: 0.12 },
  { src: "sfx/02_Alienated_Warpes.wav", from: f(3, "сегодня"), volume: 0.1 },
  { src: "sfx/01_Ripple_Textures.wav", from: S(4) - 8, volume: 0.12 },
  { src: "sfx/05_Distortion_Glitch.wav", from: f(4, "а"), volume: 0.035 },
  { src: "sfx/06_Ripple_Textures_II.wav", from: S(5) - 8, volume: 0.12 },
  { src: "sfx2/ding.mp3", from: f(5, "тюльпаны") + 10, volume: 0.12 },
  { src: "sfx/03_Basscrack.wav", from: f(5, "виду") + 4, volume: 0.06 },
];

// 11 poses by meaning, a change every ~1.2-2.3 s, never twice in a row
const KEYS: AvatarKey[] = [
  { at: 0, e: "whisper" },
  { at: f(1, "бабушкином") + 10, e: "pensive" },
  { at: S(2), e: "dreamy" },
  { at: f(2, "тюльпанами"), e: "touched" },
  { at: S(3), e: "disappointed" },
  { at: f(3, "лежат"), e: "shrug" },
  { at: S(4), e: "explaining" },
  { at: f(4, "забывают"), e: "point-up" },
  { at: f(4, "прячут") - 14, e: "shush" },
  { at: S(5), e: "point-right" },
  { at: f(5, "снова"), e: "heart-hands" },
];

const STANCES: StanceKey[] = [
  { at: 0, s: "right" },
  { at: S(2), s: "left" },
  { at: S(4), s: "right" },
  { at: S(5), s: "left" },
];

export const F = { duration: END + TAIL };

export const Video77: React.FC = () => (
  <SoloReel cfg={{ host: "kamilya", look: true, T: pal, bg: 1, music: "v77/music/bed.mp3", lines: L, end: F.duration, keys: KEYS, stances: STANCES, scenes: SCENES, sfx: SFX }} />
);
