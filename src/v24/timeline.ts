// Video 24 - "Я татарин, но языка не знаю" (RU, @the_tatarverse, main host preset Ahu). 60 fps.
// VO: Ahu (xyqF3vGMQlPk3e7yA4DI), Eleven v4, trimmed x1.08 by scripts/trim-vo.py; beats = word starts (scripts/words-v24.py).
export const F = {
  duration: 1190,
  // 1. hook: don't say it as an apology
  mistake: 68,
  quote: 170,
  apology: 308,
  // 2. as if you had to justify yourself
  excuseIn: 366,
  justify: 402,
  // 3. not a verdict, a starting point
  startIn: 480,
  verdict: 532,
  point: 594,
  start: 616,
  // 4. start with one phrase
  phraseIn: 675,
  phrase: 722,
  tatar: 771,
  meaning: 842,
  // 5. tomorrow one more
  tomorrowIn: 900,
  more: 954,
  // 6. the language comes back word by word
  backIn: 1018,
  back: 1038,
  word: 1114,
};

export const VO = [
  { src: "v24/vo/l1.mp3", from: 8, dur: 344 },
  { src: "v24/vo/l2.mp3", from: 366, dur: 100 },
  { src: "v24/vo/l3.mp3", from: 480, dur: 181 },
  { src: "v24/vo/l4.mp3", from: 675, dur: 211 },
  { src: "v24/vo/l5.mp3", from: 900, dur: 104 },
  { src: "v24/vo/l6.mp3", from: 1018, dur: 131 },
];
