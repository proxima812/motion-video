import React from "react";
import { AbsoluteFill } from "remotion";
import { DoorOpen } from "lucide-react";
import { progress } from "../stage/motion";
import { Face, SoloReel, at, type TalkScene } from "../kit/talk";
import type { AvatarKey, StanceKey } from "../kit/TatAvatar";
import type { Sfx } from "../kit/reel";
import { GlassPlate } from "../catalog/own/glass";
import { ALICJA, ALICJA_PALETTES, ChatBubbles, FloatingHearts, Kicker, Polaroid, SpeechBubble } from "../kit/presets/alicja";
import { LINES, END } from "./lines";

// V76 «Татарский вечер» - host preset demo: Alicja («подруга», palette honey, cover bubble).
// A story -> the feeling -> a soft conclusion: I was scared to go to a Tatar evening -> I thought everyone talks and I stay
// silent like a guest -> they just asked me to dance, no words needed -> sometimes it's enough to come.
// Preset look: SoloReel look (bubble background, blurred crossfades, soft drift), preset Title (handwritten key words),
// elements from src/kit/presets/alicja.tsx.

// the conclusion holds 0.6 s after the last word before the outro
const HOLD = END + 36;
export const F = { duration: HOLD };
const pal = ALICJA_PALETTES.find((p) => p.name === "honey")!;
const { Title } = ALICJA;
const w = (i: number, word: string, nth = 0) => at(LINES, i, word, nth);
const S2 = LINES[1].from;
const S3 = LINES[2].from;
const S4 = LINES[3].from;

/** Exit wrapper: the child fades out into blur from `out` */
const Out: React.FC<{ frame: number; out: number; children: React.ReactNode }> = ({ frame, out, children }) => <AbsoluteFill style={ALICJA.motion.exit(frame, out)}>{children}</AbsoluteFill>;

/* ───────── 1. Nobody admits it, but I was scared to go to a Tatar evening: an invitation in the chat, «мне страшно» ───────── */

const Scared: React.FC<{ frame: number }> = ({ frame }) => {
  const hook = w(1, "но") - 16;
  const nervous = frame >= w(1, "страшно") ? Math.sin(frame / 2.2) * 4 * (1 - progress(frame, w(1, "страшно") + 20, w(1, "вечер"))) : 0;
  return (
    <>
      <Out frame={frame} out={hook}>
        <Title text="никто не хочет *признавать*" frame={frame} at={[w(1, "никто"), w(1, "не"), w(1, "хочет"), w(1, "признавать")]} pal={pal} top={300} size={92} />
      </Out>
      <AbsoluteFill style={{ transform: `translateX(${nervous}px)` }}>
        <ChatBubbles
          frame={frame}
          pal={pal}
          y={470}
          w={900}
          size={64}
          items={[
            { at: w(1, "но"), side: "in", text: "пойдем на татарский вечер", typing: 26 },
            { at: w(1, "страшно"), side: "out", text: "мне страшно", typing: 30 },
          ]}
        />
      </AbsoluteFill>
    </>
  );
};

/* ───────── 2. I thought everyone talks and I stay silent like a guest: three faces chat in Tatar, her bubble is only dots ───────── */

const TABLE = [
  { x: 230, y: 800, c: pal.vivid, word: "Сәлам", d: 0 },
  { x: 540, y: 720, c: pal.main, word: "Рәхмәт", d: 14 },
  { x: 850, y: 800, c: "#B9822A", word: "Әйе", d: 28 },
];
const Silent: React.FC<{ frame: number }> = ({ frame }) => {
  const talk = w(2, "говорят");
  return (
    <>
      <Out frame={frame} out={w(2, "а") - 8}>
        <Title text="все *говорят*" frame={frame} at={[w(2, "все"), talk]} pal={pal} top={180} size={92} />
      </Out>
      {frame >= w(2, "а") - 6 && <Title text="я *молчу* как гостья" frame={frame} at={[w(2, "я", 1), w(2, "молчу"), w(2, "как"), w(2, "гостья")]} pal={pal} top={180} size={92} />}
      {TABLE.map((p, i) => (
        <React.Fragment key={i}>
          <AbsoluteFill style={ALICJA.motion.enter(frame, S2 - 2 + i * 6)}>
            <Face color={p.c} size={170} smile={0.7} style={{ left: p.x, top: p.y, transform: `translateY(${Math.sin(frame / 9 + i * 2) * (frame > talk ? 5 : 1)}px)` }} />
          </AbsoluteFill>
          <SpeechBubble frame={frame} at={talk + p.d} pal={pal} x={p.x} y={p.y - 290} size={56} text={p.word} tail={0.5} />
        </React.Fragment>
      ))}
      {/* her own bubble: only dots, she stays silent (stance left: the host stands right, x ≈ 710) */}
      <SpeechBubble frame={frame} at={w(2, "молчу") - 4} pal={pal} x={720} y={1080} size={64} dots tail={0.5} />
    </>
  );
};

/* ───────── 3. They just asked me to dance, no words needed: a polaroid develops, two faces dance, hearts ───────── */

const NOTE = "M9 3v10.6A3.5 3.5 0 1 0 11 17V7h6V3z";
const Dance: React.FC<{ frame: number }> = ({ frame }) => {
  const sway = Math.sin(frame / 7);
  const garland = Array.from({ length: 9 }, (_, i) => ({ x: 30 + i * 58, y: 54 + Math.sin((i / 8) * Math.PI) * 46 }));
  return (
    <>
      <Title text="позвали *танцевать*" frame={frame} at={[w(3, "позвали"), w(3, "танцевать")]} pal={pal} top={170} size={92} />
      <Polaroid frame={frame} at={S3 + 6} pal={pal} y={380} w={600} rot={-4} develop={S3 + 24} caption="без слов" captionAt={w(3, "слова")}>
        <svg width={528} height={528} style={{ position: "absolute", inset: 0 }}>
          <path d={`M10 40 Q 264 ${150} 518 40`} stroke={pal.main} strokeWidth={3} fill="none" opacity={0.5} />
          {garland.map((g, i) => (
            <circle key={i} cx={g.x} cy={g.y + 10} r={11} fill={i % 2 ? pal.vivid : "#fff"} opacity={0.65 + 0.35 * Math.sin(frame / 8 + i)} />
          ))}
          {[0, 1, 2].map((i) => {
            const y = 230 - ((frame * 0.9 + i * 60) % 180);
            return <path key={i} d={NOTE} transform={`translate(${90 + i * 170} ${y}) scale(2.4)`} fill={pal.main} opacity={0.55 * Math.sin(((frame * 0.9 + i * 60) % 180) / 180 * Math.PI)} />;
          })}
        </svg>
        <Face color={pal.vivid} size={170} smile={0.9} style={{ left: 180, top: 340, transform: `rotate(${sway * 10}deg) translateY(${-Math.abs(sway) * 16}px)` }} />
        <Face color={pal.main} size={170} smile={0.9} style={{ left: 350, top: 340, transform: `rotate(${-sway * 10}deg) translateY(${-Math.abs(sway) * 16}px)` }} />
      </Polaroid>
      <FloatingHearts frame={frame} at={w(3, "танцевать") + 6} pal={pal} x={540} y={760} n={9} spread={520} every={8} />
    </>
  );
};

/* ───────── 4. Sometimes it's enough to come: a giant bubble pointing at her, a glass plate «приходи» ───────── */

const Come: React.FC<{ frame: number }> = ({ frame }) => {
  const plate = ALICJA.motion.enter(frame, w(4, "прийти") + 14);
  return (
    <>
      <Kicker frame={frame} at={w(4, "иногда")} pal={pal} text="иногда" y={250} size={92} />
      <SpeechBubble frame={frame} at={S4 + 8} pal={pal} x={540} y={400} w={900} size={110} text="достаточно прийти" textAt={[w(4, "достаточно"), w(4, "прийти")]} sub="чтобы стать своей" subAt={w(4, "чтобы")} tail={0.5} typing />
      <FloatingHearts frame={frame} at={w(4, "прийти")} pal={pal} x={540} y={980} n={6} spread={600} every={10} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1060, display: "flex", justifyContent: "center", ...plate }}>
        <div style={{ transform: "scale(2.1)" }}>
          <GlassPlate bg={pal.plate}>
            <DoorOpen size={20} strokeWidth={2.2} /> приходи
          </GlassPlate>
        </div>
      </div>
    </>
  );
};

/* ───────── Composition ───────── */

const SCENES: TalkScene[] = [
  [[0, S2], Scared],
  [[S2, S3], Silent],
  [[S3, S4], Dance],
  [[S4, HOLD + 40], Come],
];

// 11 poses by meaning, never twice in a row, a change every ~1.2-2 s
const KEYS: AvatarKey[] = [
  { at: 0, e: "shush" }, // nobody admits it
  { at: w(1, "но"), e: "anxious" }, // I was scared
  { at: S2, e: "thinking" }, // I thought
  { at: w(2, "говорят"), e: "listening" }, // everyone talks
  { at: w(2, "молчу") + 6, e: "embarrassed" }, // silent like a guest
  { at: S3, e: "surprised" }, // and there
  { at: w(3, "танцевать"), e: "laughing" }, // asked me to dance
  { at: w(3, "не") - 4, e: "delighted" }, // no words needed
  { at: S4 + 6, e: "soft-smile" }, // sometimes
  { at: w(4, "своей"), e: "hand-on-heart" }, // to become one of us
  { at: w(4, "прийти") - 6, e: "heart-hands" }, // enough to come
];

const STANCES: StanceKey[] = [
  { at: 0, s: "right" },
  { at: S2, s: "left" },
  { at: S3, s: "right" },
  { at: S4, s: "center" },
];

const SFX: Sfx[] = [
  { src: "sfx2/pop.mp3", from: 12, volume: 0.12 },
  { src: "sfx2/ding.mp3", from: w(1, "но"), volume: 0.13 },
  { src: "sfx2/pop.mp3", from: w(1, "страшно"), volume: 0.15 },
  { src: "sfx/01_Ripple_Textures.wav", from: S2 - 8, volume: 0.12 },
  ...TABLE.map((p) => ({ src: "sfx2/pop.mp3", from: w(2, "говорят") + p.d, volume: 0.1 })),
  { src: "sfx/06_Ripple_Textures_II.wav", from: S3 - 8, volume: 0.13 },
  { src: "sfx2/click.mp3", from: S3 + 22, volume: 0.18 },
  { src: "sfx2/ding.mp3", from: w(3, "танцевать") + 6, volume: 0.12 },
  { src: "sfx/02_Alienated_Warpes.wav", from: S4 - 8, volume: 0.09 },
  { src: "sfx2/pop.mp3", from: w(4, "достаточно"), volume: 0.14 },
  { src: "sfx/07_CineStrike.wav", from: w(4, "прийти"), volume: 0.06 },
  { src: "sfx2/ding.mp3", from: w(4, "прийти") + 14, volume: 0.15 },
];

export const Video76: React.FC = () => (
  <SoloReel cfg={{ host: "alicja", look: true, T: pal, bg: 1, music: "v76/music/bed.mp3", lines: LINES, end: HOLD, keys: KEYS, stances: STANCES, scenes: SCENES, sfx: SFX }} />
);
