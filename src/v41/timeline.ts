// Video 41 - "Имя без сокращений" (RU, @the_tatarverse, host preset 2 Alicja). 60 fps.
// VO: Alicja (iCzRDxXsrROcDYzWimM9), Eleven v4, trimmed x1.12 by scripts/trim-vo.py; beats = word starts (scripts/beats-vo.py 41 10, gap 10 to fit 21 s).
export const F = {
  duration: 1253,
  // 1. hook: you should never shorten your name to make it easier for others
  never: 29,
  not: 53,
  should: 62,
  cut: 77,
  name: 128,
  so: 143,
  others: 160,
  was: 179,
  easier: 197,
  // 2. Ильдар became Дима, Гульнара - Галя. And nobody even asked
  swapIn: 248,
  ildar: 250,
  became: 276,
  dima: 293,
  gulnara: 336,
  galya: 373,
  nobody: 424,
  even: 437,
  asked: 456,
  // 3. a name has a meaning; it was chosen for you
  meanIn: 513,
  nameHas: 532,
  meaning: 575,
  chosen: 639,
  forYou: 667,
  you: 676,
  // 4. do you know what your name means?
  knowIn: 714,
  know: 725,
  what: 755,
  means: 768,
  yourName: 789,
  nameQ: 806,
  // 5. ask your parents and write your name and its meaning in the comments
  ctaIn: 851,
  ask: 853,
  parents: 879,
  write: 924,
  comments: 947,
  myName: 980,
  itsName: 1005,
  its: 1037,
  value: 1055,
  // 6. let them call you by your real name
  realIn: 1099,
  let: 1101,
  call: 1127,
  real: 1144,
};

export const VO = [
  { src: "v41/vo/l1.mp3", from: 8, dur: 230 },
  { src: "v41/vo/l2.mp3", from: 248, dur: 255 },
  { src: "v41/vo/l3.mp3", from: 513, dur: 191 },
  { src: "v41/vo/l4.mp3", from: 714, dur: 127 },
  { src: "v41/vo/l5.mp3", from: 851, dur: 238 },
  { src: "v41/vo/l6.mp3", from: 1099, dur: 114 },
];
