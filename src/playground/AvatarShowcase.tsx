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
  { e: "waving", s: "right", title: "Привет", note: "машет рукой", phrase: "Сәлам всем привет" },
  { e: "soft-smile", s: "right", title: "Сдержанная улыбка", note: "смотрит вправо", phrase: "Рада что вы здесь" },
  { e: "explaining", s: "left", title: "Объясняет", note: "смена позиции  жест рукой", phrase: "Сейчас всё объясню" },
  { e: "pensive", s: "left", title: "Задумчивая", note: "рука у подбородка", phrase: "Как же это сказать" },
  { e: "thinking", s: "center", title: "Широкая улыбка", note: "по центру  слова в обе стороны", phrase: "Вот это мне нравится" },
  { e: "puzzled", s: "center", title: "Недоумение", note: "рука у подбородка", phrase: "Подождите а почему так" },
  { e: "skeptical", s: "right", title: "Скепсис", note: "руки на поясе", phrase: "Ну не знаю не верю" },
  { e: "displeased", s: "right", title: "Недовольная", note: "руки скрещены", phrase: "Опять эти ошибки" },
  { e: "disappointed", s: "left", title: "Разочарование", note: "руки скрещены  смотрит влево", phrase: "Жаль не получилось" },
  { e: "surprised", s: "left", title: "Удивление", note: "приоткрытый рот", phrase: "Ого вот это да" },
  { e: "delighted", s: "right", title: "Восторг", note: "раскрытая ладонь", phrase: "Это просто чудесно" },
  { e: "laughing", s: "center", title: "Смех", note: "руки в стороны", phrase: "Ха ха ну вы даете" },
  { e: "dreamy", s: "right", title: "Мечтательная", note: "взгляд вверх", phrase: "Представьте лето в деревне" },
  { e: "inspired", s: "left", title: "Вдохновение", note: "ладони у подбородка", phrase: "Я так хочу туда" },
  { e: "smile-up", s: "center", title: "Улыбка вверх", note: "финал  кивок на каждое слово", phrase: "Рәхмәт до встречи" },
];

const BEAT = 120; // 2 s per beat at 60 fps
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
