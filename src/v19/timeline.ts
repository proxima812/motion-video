// Video 19 - tatarverse.cc presentation (RU, @the_tatarverse, 9:16). Single source of truth for timing (60 fps).
// VO: Ahu (xyqF3vGMQlPk3e7yA4DI), Eleven v4, trimmed x1.1 by scripts/trim-vo.py; beats = word starts (scripts/words-v19.py).
export const F = {
  duration: 2830,
  // 1. hook
  newCity: 77,
  open: 190,
  site: 229,
  // 2. intro (phone-scroll)
  introIn: 279,
  brand: 338,
  catalog: 447,
  // 3. map (dot-map)
  mapIn: 695,
  centers: 782,
  countries: 924,
  // 4. search (screenshot-tour)
  searchIn: 1028,
  country: 1069,
  category: 1134,
  geo: 1228,
  nearest: 1337,
  // 5. what's inside (spec-sheet)
  specIn: 1386,
  links: 1433,
  direct: 1559,
  save: 1652,
  pdf: 1752,
  // 6. honest: data incomplete (fraction-split)
  dataIn: 1827,
  incomplete: 1946,
  third: 2005,
  noContacts: 2154,
  noAbout: 2208,
  // 7. help: "Помочь дополнить"
  helpIn: 2282,
  press: 2399,
  sendLink: 2473,
  update: 2543,
  // 8. final
  finalIn: 2610,
  find: 2727,
  near: 2773,
};

export const VO = [
  { src: "v19/vo/l1.mp3", from: 8, dur: 261 },
  { src: "v19/vo/l2.mp3", from: 285, dur: 400 },
  { src: "v19/vo/l3.mp3", from: 701, dur: 317 },
  { src: "v19/vo/l4.mp3", from: 1034, dur: 342 },
  { src: "v19/vo/l5.mp3", from: 1392, dur: 425 },
  { src: "v19/vo/l6.mp3", from: 1833, dur: 439 },
  { src: "v19/vo/l7.mp3", from: 2288, dur: 312 },
  { src: "v19/vo/l8.mp3", from: 2616, dur: 181 },
];
