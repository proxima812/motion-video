// Video 25 - "Свои, которых ты еще не встретил" (RU, @the_tatarverse, host preset 2 Alicja). 60 fps.
// VO: Alicja (iCzRDxXsrROcDYzWimM9), Eleven v4, trimmed x1.08 by scripts/trim-vo.py; beats = word starts (scripts/words-v25.py).
export const F = {
  duration: 1180,
  // 1. hook: neighbours
  neighbours: 106,
  // 2. next streets
  streetsIn: 167,
  live: 231,
  streets: 258,
  // 3. one shop, Tatar at home
  shopIn: 347,
  shop: 400,
  home: 438,
  tatar: 491,
  // 4. you meet only in another city, by chance
  cityIn: 551,
  meet: 571,
  other: 631,
  chance: 695,
  // 5. CTA: city + wave in the comments
  ctaIn: 754,
  earlier: 805,
  write: 845,
  city: 923,
  wave: 952,
  // 6. closer than it seems
  closeIn: 1024,
  closer: 1048,
  seems: 1088,
};

export const VO = [
  { src: "v25/vo/l1.mp3", from: 8, dur: 145 },
  { src: "v25/vo/l2.mp3", from: 167, dur: 166 },
  { src: "v25/vo/l3.mp3", from: 347, dur: 190 },
  { src: "v25/vo/l4.mp3", from: 551, dur: 189 },
  { src: "v25/vo/l5.mp3", from: 754, dur: 256 },
  { src: "v25/vo/l6.mp3", from: 1024, dur: 112 },
];
