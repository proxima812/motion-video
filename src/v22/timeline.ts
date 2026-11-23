// Video 22 - "Почему не знают о центрах" (RU, @the_tatarverse, host preset 2 Alicja). Single source of truth for timing (60 fps).
// VO: Alicja (iCzRDxXsrROcDYzWimM9), Eleven v4, trimmed x1.1 by scripts/trim-vo.py; beats = word starts (scripts/words-v22.py).
export const F = {
  duration: 1625,
  // 1. hook: a center in your city
  tatar: 161,
  center: 189,
  // 2. it exists, events happen
  existsIn: 232,
  exists: 262,
  events: 327,
  pass: 371,
  // 3. info hidden in old places
  hiddenIn: 427,
  group: 496,
  chat: 553,
  post: 634,
  // 4. "nothing in my city"
  thinkIn: 727,
  thinks: 766,
  maybe: 818,
  nothing: 905,
  // 5. a few km away
  nearIn: 970,
  community: 996,
  km: 1065,
  // 6. Tatarverse catalog
  tvIn: 1139,
  tatarverse: 1213,
  open: 1275,
  catalog: 1300,
  tatars: 1385,
  bashkirs: 1416,
  crimean: 1479,
  // 7. find yours nearby
  finalIn: 1521,
  find: 1529,
  near: 1569,
};

export const VO = [
  { src: "v22/vo/l1.mp3", from: 8, dur: 220 },
  { src: "v22/vo/l2.mp3", from: 238, dur: 185 },
  { src: "v22/vo/l3.mp3", from: 433, dur: 290 },
  { src: "v22/vo/l4.mp3", from: 733, dur: 233 },
  { src: "v22/vo/l5.mp3", from: 976, dur: 159 },
  { src: "v22/vo/l6.mp3", from: 1145, dur: 370 },
  { src: "v22/vo/l7.mp3", from: 1527, dur: 76 },
];
