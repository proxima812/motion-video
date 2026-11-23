// Video 29 - "Татарский в обычном чате" (RU, @the_tatarverse, host preset 2 Alicja). 60 fps.
// VO: Alicja (iCzRDxXsrROcDYzWimM9), Eleven v4, trimmed x1.1 by scripts/trim-vo.py; beats = word starts (scripts/beats-vo.py).
export const F = {
  duration: 1231,
  // 1. hook: Tatar starts right in the chat
  tatar: 104,
  starts: 141,
  chat: 198,
  // 2. we promise to learn the language someday
  promiseIn: 242,
  promise: 250,
  lang: 315,
  someday: 363,
  // 3. what if today you write mom one phrase
  momIn: 430,
  today: 458,
  mom: 506,
  phrase: 554,
  // 4. the phrase itself
  phraseIn: 607,
  ani: 609,
  nichek: 640,
  hallar: 658,
  mama: 710,
  dela: 749,
  // 5. she replies and is very surprised
  replyIn: 798,
  answer: 822,
  surprise: 905,
  // 6. a small step beats a big promise
  stepIn: 971,
  step: 999,
  bigPromise: 1069,
  write: 1126,
  now: 1156,
};

export const VO = [
  { src: "v29/vo/l1.mp3", from: 8, dur: 220 },
  { src: "v29/vo/l2.mp3", from: 242, dur: 174 },
  { src: "v29/vo/l3.mp3", from: 430, dur: 163 },
  { src: "v29/vo/l4.mp3", from: 607, dur: 177 },
  { src: "v29/vo/l5.mp3", from: 798, dur: 159 },
  { src: "v29/vo/l6.mp3", from: 971, dur: 220 },
];
