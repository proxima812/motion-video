// Video 1 - Fable 5.2 (RU). Single source of truth for timing (60 fps).
// Beats are pinned to word starts from public/v1/vo/l*.json (Kyle, Eleven v4, with-timestamps).
export const F = {
  duration: 1560,

  // 1. "Фейбл пять точка два уже здесь." (vo 12)
  introWord: 20,
  introGlass: 55,
  introSub: 122,

  // 2. "Просишь исправить одну опечатку... а она переписывает все приложение. На Rust." (vo 205)
  promptIn: 200,
  typeStart: 210,
  typeEnd: 335,
  submit: 352,
  rewrite: 397,
  rust: 551,

  // 3. "Режим «Думай усерднее». Сорок минут спустя... хмм." (vo 605)
  thinkIn: 600,
  toggle: 653,
  timerStart: 792,
  timerEnd: 898,
  hmm: 927,

  // 4. "Ошибка? Вы абсолютно правы!" (vo 996)
  wrongIn: 990,
  apologize: 1058,
  right: 1065,

  // 5. "Фейбл пять точка два. Лучше на ноль целых одну." (vo 1196)
  endIn: 1190,
  endSub: 1374,
  endCta: 1394,
};

export const SCENES = {
  intro: [0, F.promptIn],
  prompt: [F.promptIn, F.thinkIn],
  think: [F.thinkIn, F.wrongIn],
  wrong: [F.wrongIn, F.endIn],
  end: [F.endIn, F.duration + 30],
} as const;

export const HEADLINES = [
  { from: F.promptIn + 6, text: "Исправь одну опечатку." },
  { from: F.rewrite, text: "Переписывает все приложение." },
  { from: F.rust, text: "На Rust." },
  { from: F.thinkIn + 6, text: "Режим «Думай усерднее»" },
  { from: F.timerStart, text: "40 минут спустя…" },
  { from: F.hmm, text: "" },
  { from: F.wrongIn + 6, text: "Ошибка?" },
  { from: F.right, text: "Вы абсолютно правы!" },
  { from: F.endIn, text: "" },
];

// dur = voice line length in frames (ffprobe * 60), used for music ducking
export const VO = [
  { src: "v1/vo/l1.mp3", from: 12, dur: 178 },
  { src: "v1/vo/l2.mp3", from: 205, dur: 384 },
  { src: "v1/vo/l3.mp3", from: 605, dur: 365 },
  { src: "v1/vo/l4.mp3", from: 996, dur: 182 },
  { src: "v1/vo/l5.mp3", from: 1196, dur: 283 },
];

export const SFX = [
  { src: "sfx/07_CineStrike.wav", from: 6, volume: 0.32 },
  { src: "sfx2/pop.mp3", from: F.introGlass + 2, volume: 0.5 },
  { src: "sfx2/whoosh.mp3", from: F.promptIn - 8, volume: 0.45 },
  { src: "sfx2/typing.mp3", from: F.typeStart, volume: 0.55 },
  { src: "sfx2/typing.mp3", from: F.typeStart + 70, volume: 0.55 },
  { src: "sfx2/click.mp3", from: F.submit - 2, volume: 0.7 },
  { src: "sfx2/glitch.mp3", from: F.rewrite - 2, volume: 0.3 },
  { src: "sfx2/ding.mp3", from: F.rust, volume: 0.5 },
  { src: "sfx2/whoosh.mp3", from: F.thinkIn - 8, volume: 0.45 },
  { src: "sfx2/click.mp3", from: F.toggle - 2, volume: 0.7 },
  { src: "sfx/04_Cyber_Shift.wav", from: F.timerStart, volume: 0.22 },
  { src: "sfx2/crickets.mp3", from: F.hmm + 6, volume: 0.55 },
  { src: "sfx2/error.mp3", from: F.wrongIn + 4, volume: 0.55 },
  { src: "sfx2/click.mp3", from: F.apologize - 2, volume: 0.7 },
  { src: "sfx2/pop.mp3", from: F.right + 10, volume: 0.45 },
  { src: "sfx2/pop.mp3", from: F.right + 30, volume: 0.45 },
  { src: "sfx2/pop.mp3", from: F.right + 50, volume: 0.45 },
  { src: "sfx2/whoosh.mp3", from: F.endIn - 8, volume: 0.45 },
  { src: "sfx2/rimshot.mp3", from: 1484, volume: 0.6 },
];
