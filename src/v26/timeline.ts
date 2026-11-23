// Video 26 - "Бабушкино голосовое" (RU, @the_tatarverse, main host preset Ahu). 60 fps.
// VO: Ahu (xyqF3vGMQlPk3e7yA4DI), Eleven v4, trimmed x1.15 by scripts/trim-vo.py; beats = word starts (scripts/beats-vo.py 26).
export const F = {
  duration: 1260,
  // 1. hook: nobody talks about it, grandma's voice won't save itself
  talk: 56,
  voice: 131,
  save1: 185,
  alone: 231,
  // 2. record her voice message, ask about her childhood
  recIn: 269,
  record: 271,
  ask: 351,
  child: 454,
  // 3. how she says words, your family expressions
  sayIn: 498,
  say: 527,
  family: 604,
  phrases: 652,
  // 4. not an interview, five minutes in the kitchen
  kitchenIn: 710,
  interview: 734,
  five: 780,
  kitchen: 817,
  // 5. save and label it: әби, детство
  saveIn: 864,
  sign: 899,
  abi: 950,
  childhood: 989,
  // 6. one day it will be the most precious sound
  soundIn: 1046,
  most: 1132,
  dear: 1157,
  sound: 1182,
};

export const VO = [
  { src: "v26/vo/l1.mp3", from: 8, dur: 247 },
  { src: "v26/vo/l2.mp3", from: 269, dur: 215 },
  { src: "v26/vo/l3.mp3", from: 498, dur: 198 },
  { src: "v26/vo/l4.mp3", from: 710, dur: 140 },
  { src: "v26/vo/l5.mp3", from: 864, dur: 168 },
  { src: "v26/vo/l6.mp3", from: 1046, dur: 178 },
];
