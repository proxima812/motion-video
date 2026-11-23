// Video 37 - "Татарская культура в твоем плейлисте" (RU, @the_tatarverse, host preset 2 Alicja). 60 fps.
// VO: Alicja (iCzRDxXsrROcDYzWimM9), Eleven v4, trimmed x1.15 by scripts/trim-vo.py; beats = word starts (scripts/beats-vo.py 37).
export const F = {
  duration: 1237,
  // 1. hook: most people don't even realize there are no Tatar songs in their playlist
  notGet: 52,
  playlist: 112,
  none: 148,
  tatar: 163,
  // 2. hundreds of tracks: English, Russian, Korean
  tracksIn: 240,
  tracks: 260,
  en: 306,
  ru: 362,
  kr: 402,
  // 3. when did a Tatar song last land in your favorites
  favIn: 457,
  fav: 497,
  last: 526,
  song: 586,
  // 4. one song, and the language sounds next to you every day
  oneIn: 669,
  one: 671,
  lang: 740,
  day: 796,
  // 5. let's swap: write your favorite Tatar track in the comments
  ctaIn: 869,
  swap: 884,
  write: 941,
  comments: 961,
  track: 1048,
  // 6. and I'll add it to my playlist
  addIn: 1086,
  add: 1111,
  list: 1157,
};

export const VO = [
  { src: "v37/vo/l1.mp3", from: 8, dur: 218 },
  { src: "v37/vo/l2.mp3", from: 240, dur: 203 },
  { src: "v37/vo/l3.mp3", from: 457, dur: 198 },
  { src: "v37/vo/l4.mp3", from: 669, dur: 186 },
  { src: "v37/vo/l5.mp3", from: 869, dur: 203 },
  { src: "v37/vo/l6.mp3", from: 1086, dur: 111 },
];
