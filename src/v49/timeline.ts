// Video 49 - "Детская версия тебя" (RU, @the_tatarverse, host preset 2 Alicja). 60 fps.
// VO: Alicja (iCzRDxXsrROcDYzWimM9), Eleven v4, trimmed x1.08 by scripts/trim-vo.py; beats = word starts (scripts/beats-vo.py 49 10), 10-frame gaps.
export const F = {
  duration: 1254,
  // 1. hook: nobody talks about it, but as kids many were shy of their native language
  talk: 55,
  but: 104,
  child: 128,
  many: 152,
  shy: 179,
  lang: 237,
  // 2. "mom, just don't speak Tatar in front of my friends"
  momIn: 291,
  only: 329,
  dont: 347,
  speak: 358,
  tatar: 371,
  friends: 415,
  // 3. and now you yourself want to hear these words
  nowIn: 472,
  now: 481,
  want: 532,
  hear: 552,
  words: 590,
  // 4. it's not too late. It means you've grown up
  lateIn: 640,
  late: 662,
  means: 709,
  grew: 776,
  // 5. call mom and ask her to say something to you in Tatar
  callIn: 830,
  mom: 859,
  ask: 899,
  say: 921,
  inTatar: 983,
  // 6. the child inside you will finally smile
  smileIn: 1042,
  inside: 1070,
  finally: 1121,
  smile: 1154,
};

export const VO = [
  { src: "v49/vo/l1.mp3", from: 8, dur: 273 },
  { src: "v49/vo/l2.mp3", from: 291, dur: 171 },
  { src: "v49/vo/l3.mp3", from: 472, dur: 158 },
  { src: "v49/vo/l4.mp3", from: 640, dur: 180 },
  { src: "v49/vo/l5.mp3", from: 830, dur: 202 },
  { src: "v49/vo/l6.mp3", from: 1042, dur: 172 },
];
