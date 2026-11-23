// Video 31 - "У твоей семьи есть история вне фотоальбома" (RU, @the_tatarverse, host preset 2 Alicja). 60 fps.
// VO: Alicja (iCzRDxXsrROcDYzWimM9), Eleven v4, trimmed x1.15 by scripts/trim-vo.py; beats = word starts (scripts/beats-vo.py 31).
export const F = {
  duration: 1260,
  // 1. hook: this will change how you see family photos
  family: 106,
  photos: 130,
  // 2. behind every photo there's a story that isn't in the album
  storyIn: 195,
  shot: 228,
  story: 276,
  notIn: 337,
  album: 354,
  // 3. do you know how your grandma and grandpa met?
  metIn: 411,
  met: 466,
  grandma: 516,
  grandpa: 544,
  // 4. ask them: one question, a conversation for the whole evening
  askIn: 602,
  one: 683,
  question: 700,
  talk: 744,
  evening: 805,
  // 5. write the answer down: in notes or a notebook
  writeIn: 858,
  answer: 882,
  notes: 932,
  notebook: 980,
  // 6. that's how a family archive starts. with one story
  archiveIn: 1035,
  archive: 1107,
  oneStory: 1164,
  storyEnd: 1183,
};

export const VO = [
  { src: "v31/vo/l1.mp3", from: 8, dur: 173 },
  { src: "v31/vo/l2.mp3", from: 195, dur: 202 },
  { src: "v31/vo/l3.mp3", from: 411, dur: 177 },
  { src: "v31/vo/l4.mp3", from: 602, dur: 242 },
  { src: "v31/vo/l5.mp3", from: 858, dur: 163 },
  { src: "v31/vo/l6.mp3", from: 1035, dur: 190 },
];
