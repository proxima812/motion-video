// Video 48 - "Родной город, незнакомая карта" (RU, @the_tatarverse, main host preset Ahu). 60 fps.
// VO: Ahu (xyqF3vGMQlPk3e7yA4DI), Eleven v4, trimmed x1.12 by scripts/trim-vo.py, inner pauses > 0.18 s shortened to 0.1 s (fits the 21 s body limit);
// beats = word starts (scripts/beats-vo.py 48 6), 6-frame gaps between lines.
export const F = {
  duration: 1260,
  // 1. hook: if I were starting from scratch, I'd make a Tatar map of my city
  scratch: 74,
  make: 126,
  tatarMap: 152,
  map: 186,
  city: 229,
  // 2. you know every coffee shop nearby. And places connected with Tatars?
  cafesIn: 264,
  all: 297,
  cafes: 318,
  near: 350,
  places: 390,
  tatars: 442,
  // 3. a mosque, a culture center, a cafe with echpochmaks, a street with a Tatar name
  listIn: 487,
  mosque: 489,
  center: 528,
  cafe: 596,
  street: 677,
  name: 733,
  // 4. they're nearby. They're just not on your map
  nearIn: 768,
  nearby: 783,
  just: 814,
  not: 844,
  yourMap: 878,
  // 5. write one such place in your city in the comments
  ctaIn: 923,
  comments: 949,
  one: 989,
  place: 1032,
  yourCity: 1075,
  // 6. let's build a shared map together
  buildIn: 1120,
  shared: 1148,
  map2: 1169,
  together: 1191,
};

export const VO = [
  { src: "v48/vo/l1.mp3", from: 8, dur: 250 },
  { src: "v48/vo/l2.mp3", from: 264, dur: 217 },
  { src: "v48/vo/l3.mp3", from: 487, dur: 275 },
  { src: "v48/vo/l4.mp3", from: 768, dur: 149 },
  { src: "v48/vo/l5.mp3", from: 923, dur: 191 },
  { src: "v48/vo/l6.mp3", from: 1120, dur: 113 },
];
