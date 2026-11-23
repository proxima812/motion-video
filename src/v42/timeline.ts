// Video 42 - "Татарский с акцентом" (RU, @the_tatarverse, main host preset Ahu). 60 fps.
// VO: Ahu (xyqF3vGMQlPk3e7yA4DI), Eleven v4, trimmed x1.12 by scripts/trim-vo.py; beats = word starts (scripts/beats-vo.py 42 10, gap 10 to fit 21 s).
// Note: in line 2 the model swallows "с акцентом" (4 tries); the screen keeps the idea.
export const F = {
  duration: 1251,
  // 1. hook: nobody wants to admit it, but we're shy to speak our native language with an accent
  nobody: 10,
  wants: 40,
  admit: 62,
  but: 113,
  ashamed: 130,
  speak: 169,
  native: 199,
  accent: 244,
  // 2. in English with an accent it's fine; you try, they praise you
  enIn: 294,
  english: 305,
  fine: 352,
  you: 403,
  trying: 412,
  youObj: 461,
  praise: 474,
  // 3. but in Tatar it's somehow shameful
  ttIn: 521,
  tatar: 536,
  somehow: 575,
  shame: 609,
  // 4. an accent means only one thing: you started speaking
  meansIn: 654,
  accentW: 656,
  means: 686,
  only: 710,
  one: 729,
  youStart: 772,
  started: 785,
  speaking: 806,
  // 5. say one phrase in Tatar out loud today, with any accent
  ctaIn: 849,
  say: 851,
  today: 868,
  onePhrase: 900,
  phrase: 920,
  inTatar: 943,
  aloud: 973,
  any: 1025,
  anyAccent: 1040,
  // 6. the native language doesn't give grades
  gradesIn: 1088,
  nativeL: 1090,
  lang: 1115,
  not: 1143,
  gives: 1151,
  grades: 1173,
};

export const VO = [
  { src: "v42/vo/l1.mp3", from: 8, dur: 276 },
  { src: "v42/vo/l2.mp3", from: 294, dur: 217 },
  { src: "v42/vo/l3.mp3", from: 521, dur: 123 },
  { src: "v42/vo/l4.mp3", from: 654, dur: 185 },
  { src: "v42/vo/l5.mp3", from: 849, dur: 229 },
  { src: "v42/vo/l6.mp3", from: 1088, dur: 123 },
];
