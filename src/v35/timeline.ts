// Video 35 - "Когда-нибудь спрошу у бабушки" (RU, @the_tatarverse, host preset 2 Alicja). 60 fps.
// VO: Alicja (iCzRDxXsrROcDYzWimM9), Eleven v4, trimmed x1.08 by scripts/trim-vo.py; beats = word starts (scripts/beats-vo.py 35).
export const F = {
  duration: 1226,
  // 1. hook: the real reason you still haven't asked
  reason: 66,
  why: 90,
  asked: 152,
  grandma: 186,
  // 2. you think you'll make it - someday, later
  laterIn: 246,
  think: 257,
  make: 299,
  someday: 364,
  later: 399,
  // 3. the questions pile up - what was the village called
  pileIn: 445,
  questions: 454,
  pile: 487,
  how: 554,
  village: 612,
  // 4. what did they sing at home - where is the surname from
  songIn: 662,
  sang: 678,
  home: 695,
  whence: 735,
  surname: 777,
  // 5. "someday" is not a date in the calendar
  calIn: 834,
  not: 935,
  date: 946,
  calendar: 968,
  // 6. pick one question and ask it today
  pickIn: 1033,
  one: 1057,
  question: 1071,
  ask: 1111,
  today: 1142,
};

export const VO = [
  { src: "v35/vo/l1.mp3", from: 8, dur: 224 },
  { src: "v35/vo/l2.mp3", from: 246, dur: 185 },
  { src: "v35/vo/l3.mp3", from: 445, dur: 203 },
  { src: "v35/vo/l4.mp3", from: 662, dur: 158 },
  { src: "v35/vo/l5.mp3", from: 834, dur: 185 },
  { src: "v35/vo/l6.mp3", from: 1033, dur: 153 },
];
