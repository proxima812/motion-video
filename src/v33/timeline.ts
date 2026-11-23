// Video 33 - "Не исправляй каждое слово" (RU, @the_tatarverse, host preset 2 Alicja). 60 fps.
// VO: Alicja (iCzRDxXsrROcDYzWimM9), Eleven v4, trimmed; beats = word starts (python3 scripts/beats-vo.py 33).
export const F = {
  duration: 1248,
  // 1. hook: don't make this mistake - don't correct every word
  mistake: 57,
  every: 112,
  each: 152,
  word: 176,
  // 2. a friend speaks Tatar for the first time
  friendIn: 218,
  first: 235,
  tatar: 286,
  min: 348,
  tatarcha: 386,
  oyrenem: 433,
  // 3. you interrupt: not like that, like this
  cutIn: 493,
  interrupt: 512,
  notSo: 567,
  right: 614,
  likeThis: 640,
  // 4. he goes quiet, for long
  quietIn: 692,
  quiet: 708,
  long: 776,
  // 5. let him finish, smile, answer in Tatar
  finishIn: 841,
  finish: 864,
  smile: 920,
  answer: 971,
  inTatar: 994,
  // 6. fix later, support first
  laterIn: 1048,
  fix: 1050,
  later: 1099,
  firstly: 1135,
  support: 1165,
};

export const VO = [
  { src: "v33/vo/l1.mp3", from: 8, dur: 196 },
  { src: "v33/vo/l2.mp3", from: 218, dur: 261 },
  { src: "v33/vo/l3.mp3", from: 493, dur: 185 },
  { src: "v33/vo/l4.mp3", from: 692, dur: 135 },
  { src: "v33/vo/l5.mp3", from: 841, dur: 193 },
  { src: "v33/vo/l6.mp3", from: 1048, dur: 160 },
];
