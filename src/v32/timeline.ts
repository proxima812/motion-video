// Video 32 - "Приглашение, на которое хочется ответить" (RU, @the_tatarverse, main host preset Ahu). 60 fps.
// VO: Ahu (xyqF3vGMQlPk3e7yA4DI), Eleven v4, trimmed x1.08 by scripts/trim-vo.py; beats = word starts (scripts/beats-vo.py).
export const F = {
  duration: 1250,
  // 1. hook: why nobody comes to your meetups
  why: 24,
  meets: 61,
  nobody: 126,
  come: 152,
  // 2. "we invite you to the event" - and what's in it for me?
  flyerIn: 201,
  event: 248,
  what: 333,
  me: 399,
  // 3. be concrete: we'll get acquainted, drink tea with chak-chak
  concreteIn: 441,
  concrete: 468,
  meet: 514,
  tea: 577,
  chak: 617,
  // 4. and learn five phrases together
  fiveIn: 670,
  learn: 717,
  five: 748,
  tatar: 790,
  // 5. a person sees themselves at that table
  tableIn: 846,
  sees: 908,
  self: 924,
  table: 964,
  // 6. you want to answer: I'll come
  replyIn: 1018,
  invite: 1047,
  answer: 1109,
  come2: 1162,
};

export const VO = [
  { src: "v32/vo/l1.mp3", from: 8, dur: 179 },
  { src: "v32/vo/l2.mp3", from: 201, dur: 226 },
  { src: "v32/vo/l3.mp3", from: 441, dur: 215 },
  { src: "v32/vo/l4.mp3", from: 670, dur: 162 },
  { src: "v32/vo/l5.mp3", from: 846, dur: 158 },
  { src: "v32/vo/l6.mp3", from: 1018, dur: 193 },
];
