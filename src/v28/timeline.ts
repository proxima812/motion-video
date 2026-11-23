// Video 28 - "Тебе не нужно сдавать экзамен на татарина" (RU, @the_tatarverse, main host preset Ahu). 60 fps.
// VO: Ahu (xyqF3vGMQlPk3e7yA4DI), Eleven v4, trimmed x1.1 by scripts/trim-vo.py; beats = word starts (scripts/beats-vo.py 28).
export const F = {
  duration: 1252,
  // 1. hook: never wait until you're "Tatar enough"
  wait: 90,
  become: 141,
  enough: 172,
  tatar: 219,
  // 2. language not perfect, history not all - may I join?
  doubtIn: 287,
  ideal: 320,
  history: 378,
  all: 431,
  can: 476,
  us: 503,
  // 3. yes. there's no exam here
  examIn: 534,
  yes: 536,
  no: 608,
  exam: 622,
  examTatar: 655,
  // 4. nobody will ask the year Kazan was founded
  quizIn: 715,
  ask: 748,
  year: 779,
  founding: 797,
  kazan: 824,
  // 5. you don't need a score, only the wish to be near
  scoreIn: 878,
  score: 925,
  need: 960,
  wish: 1002,
  near: 1049,
  // 6. come as you are
  comeIn: 1094,
  such: 1121,
  are: 1181,
};

export const VO = [
  { src: "v28/vo/l1.mp3", from: 8, dur: 265 },
  { src: "v28/vo/l2.mp3", from: 287, dur: 233 },
  { src: "v28/vo/l3.mp3", from: 534, dur: 167 },
  { src: "v28/vo/l4.mp3", from: 715, dur: 149 },
  { src: "v28/vo/l5.mp3", from: 878, dur: 202 },
  { src: "v28/vo/l6.mp3", from: 1094, dur: 118 },
];
