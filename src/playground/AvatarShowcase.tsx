import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { DotOrbitBg } from "../kit/DotOrbitBg";
import { HEADING, INK, PARAGRAPH, SAFE } from "../kit/design";
import { TatAvatar, type AvatarKey, type Emotion, type SpokenWord, type Stance, type StanceKey } from "../kit/TatAvatar";
import { SPRING, progress, springAt } from "../stage/motion";

// Studio demo (silent): every TatAvatar emotion and movement, driven by the meaning of the words.
// Each beat = one phrase: emotion picked by its sense, stance switch on a change of thought,
// a nod on every word, words flying out as glass pills.

type Beat = { e: Emotion; s: Stance; title: string; note: string; phrase: string };

const BEATS: Beat[] = [
  { e: "portrait-green", s: "right", title: "Радость", note: "широкая улыбка  смотрит вправо", phrase: "Сәлам всем рада вас видеть" },
  { e: "confident-emerald", s: "left", title: "Тепло", note: "смена позиции  смотрит влево", phrase: "Сегодня расскажу кое что приятное" },
  { e: "kalpak-green", s: "left", title: "Скепсис", note: "руки скрещены", phrase: "Думаете татарский это сложно" },
  { e: "portrait-traditional", s: "center", title: "Задумчивость", note: "по центру  слова в обе стороны", phrase: "Хм а если подумать иначе" },
  { e: "smile-green", s: "right", title: "Мечта", note: "взгляд вверх  смотрит вправо", phrase: "Представьте вы свободно говорите" },
  { e: "confident-traditional", s: "left", title: "Хитрость", note: "лукавая улыбка  смотрит влево", phrase: "У меня есть один секрет" },
  { e: "portrait-green", s: "center", title: "Финал", note: "кивок на каждое слово", phrase: "Рәхмәт до встречи" },
];

const BEAT = 150; // 2.5 s per beat at 60 fps
const START = 12;
const WORD_GAP = 14;
export const AVATAR_SHOWCASE_FRAMES = START + BEATS.length * BEAT + 30;

const at = (i: number) => START + i * BEAT;
const KEYS: AvatarKey[] = BEATS.map((b, i) => ({ at: at(i), e: b.e }));
// stance key only when the side actually changes
const STANCES: StanceKey[] = BEATS.reduce<StanceKey[]>((acc, b, i) => (acc.length && acc[acc.length - 1].s === b.s ? acc : [...acc, { at: at(i), s: b.s }]), []);
const WORDS: SpokenWord[] = BEATS.flatMap((b, i) => b.phrase.split(" ").map((w, j) => ({ f: at(i) + 24 + j * WORD_GAP, w })));

const Label: React.FC<{ frame: number }> = ({ frame }) => {
  const i = Math.max(0, Math.min(BEATS.length - 1, Math.floor((frame - START) / BEAT)));
  const b = BEATS[i];
  const t = springAt(frame, at(i), SPRING.smooth);
  const out = progress(frame, at(i) + BEAT - 12, at(i) + BEAT);
  const vis = Math.min(1, t) * (i === BEATS.length - 1 ? 1 : 1 - out);
  return (
    <div style={{ position: "absolute", left: SAFE.x, right: SAFE.x, top: SAFE.y + 120, textAlign: "center", opacity: vis, transform: `translateY(${(1 - t) * 40}px)`, filter: vis < 1 ? `blur(${(1 - vis) * 10}px)` : undefined }}>
      <div style={{ ...PARAGRAPH, fontSize: 30, color: "rgba(37, 27, 58, 0.5)" }}>
        {i + 1} из {BEATS.length}
      </div>
      <div style={{ ...HEADING, fontSize: 120, fontWeight: 700, marginTop: 12 }}>{b.title}</div>
      <div style={{ ...PARAGRAPH, fontSize: 36, marginTop: 24, color: INK }}>{b.note}</div>
    </div>
  );
};

export const AvatarShowcase: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#fff", color: INK }}>
      <DotOrbitBg />
      <Label frame={frame} />
      <TatAvatar frame={frame} keys={KEYS} words={WORDS} stances={STANCES} />
    </AbsoluteFill>
  );
};
