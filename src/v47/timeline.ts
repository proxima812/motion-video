// Video 47 - "Гость, который уже наелся" (RU, @the_tatarverse, host preset 2 Alicja). 60 fps.
// VO: Alicja (iCzRDxXsrROcDYzWimM9), Eleven v4, trimmed x1.08 by scripts/trim-vo.py; beats = word starts (scripts/beats-vo.py 47).
export const F = {
  duration: 1175,
  // 1. hook: this will change how you see the words "I'm full"
  change: 24,
  relation: 68,
  words: 104,
  me: 139,
  full: 152,
  // 2. you said: "thank you, I'm full"
  saidIn: 207,
  thanks: 254,
  ate: 308,
  // 3. they gave you more. And chak-chak. And tea.
  moreIn: 375,
  put: 395,
  more: 433,
  chak: 484,
  tea: 546,
  // 4. because Tatars don't let a guest leave hungry. Even if he's full.
  whyIn: 588,
  tatars: 621,
  guest: 644,
  letGo: 675,
  hungry: 708,
  even: 759,
  full2: 804,
  // 5. how does it go at yours? write in the comments
  ctaIn: 844,
  yours: 908,
  write: 944,
  comments: 968,
  // 6. just finish your plate first
  eatIn: 1029,
  first: 1047,
  finish: 1079,
};

export const VO = [
  { src: "v47/vo/l1.mp3", from: 8, dur: 185 },
  { src: "v47/vo/l2.mp3", from: 207, dur: 154 },
  { src: "v47/vo/l3.mp3", from: 375, dur: 199 },
  { src: "v47/vo/l4.mp3", from: 588, dur: 242 },
  { src: "v47/vo/l5.mp3", from: 844, dur: 171 },
  { src: "v47/vo/l6.mp3", from: 1029, dur: 106 },
];
