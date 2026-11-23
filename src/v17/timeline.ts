// Video 17 - vibe projects (RU), v2 "gen Z" cut. Single source of truth for timing (60 fps).
// VO: Kyle (narrator) + Callie ("ИИ:" lines), Eleven v4; scripts/trim-vo.py 17 1.25 + scripts/tighten-vo.py 17 0.22.
export const VO = [
  { src: "v17/vo/l1.mp3", from: 6, dur: 235 },
  { src: "v17/vo/l2.mp3", from: 247, dur: 210 },
  { src: "v17/vo/l3.mp3", from: 461, dur: 134 },
  { src: "v17/vo/l4.mp3", from: 601, dur: 114 },
  { src: "v17/vo/l5.mp3", from: 719, dur: 117 },
  { src: "v17/vo/l6.mp3", from: 842, dur: 262 },
  { src: "v17/vo/l7.mp3", from: 1110, dur: 91 },
  { src: "v17/vo/l8.mp3", from: 1205, dur: 81 },
  { src: "v17/vo/l9.mp3", from: 1292, dur: 197 },
  { src: "v17/vo/l10.mp3", from: 1495, dur: 109 },
  { src: "v17/vo/l11.mp3", from: 1610, dur: 78 },
];

export const F = {
  duration: 1750,
  // scene starts
  hook: 0,
  pov: 247,
  chat: 333,
  app: 461,
  restyle: 601,
  stack: 842,
  speedrun: 1110,
  many: 1292,
  stat: 1414,
  crash: 1495,
  rank: 1610,
  // beats (absolute frames, word onsets)
  wrapper: 164, // "обертка"
  write: 381, // "сделай Uber для котов"
  startup: 561, // "стартап!"
  prettier: 663, // "еще красивее"
  ready: 721, // "Готово!"
  masterpiece: 784, // "шедевр!"
  gradient: 880,
  gpt: 928,
  gpt2: 983,
  hope: 1064, // "надежда"
  record: 1207, // "Мировой рекорд!"
  ochen: 1342,
  twelve: 1420,
  million: 1447,
  one: 1545, // "Один."
  mom: 1577, // "Мама."
  numberOne: 1662, // "номер один"
  powerOff: 1708,
};
