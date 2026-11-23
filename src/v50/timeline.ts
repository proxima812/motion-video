// Video 50 - "Мероприятие закончилось. А знакомство?" (RU, @the_tatarverse, main host preset Ahu). 60 fps.
// VO: Ahu (xyqF3vGMQlPk3e7yA4DI), Eleven v4, trimmed x1.08 by scripts/trim-vo.py; beats = word starts (scripts/beats-vo.py 50).
export const F = {
  duration: 1129,
  // 1. hook: you should never leave an event with just a group photo
  never: 28,
  leave: 86,
  event: 108,
  just: 152,
  common: 184,
  photo: 206,
  // 2. you met, laughed, took a picture
  metIn: 259,
  met: 270,
  laughed: 323,
  took: 381,
  shot: 408,
  // 3. and never met again
  neverIn: 453,
  again: 500,
  meet: 533,
  // 4. a community starts with the second meeting
  commIn: 599,
  starts: 640,
  second: 689,
  meeting: 709,
  // 5. text your new acquaintance today: "coffee?"
  textIn: 772,
  newOne: 796,
  today: 845,
  go: 890,
  coffee: 916,
  // 6. one coffee and you're already friends
  oneIn: 962,
  coffee2: 982,
  you: 1026,
  already: 1035,
  own: 1049,
};

export const VO = [
  { src: "v50/vo/l1.mp3", from: 8, dur: 237 },
  { src: "v50/vo/l2.mp3", from: 259, dur: 180 },
  { src: "v50/vo/l3.mp3", from: 453, dur: 132 },
  { src: "v50/vo/l4.mp3", from: 599, dur: 159 },
  { src: "v50/vo/l5.mp3", from: 772, dur: 176 },
  { src: "v50/vo/l6.mp3", from: 962, dur: 127 },
];
