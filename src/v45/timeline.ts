// Video 45 - "Семейный чат против афиши" (RU, @the_tatarverse, host preset 2 Alicja). 60 fps.
// VO: Alicja (iCzRDxXsrROcDYzWimM9), Eleven v4, trimmed x1.08 by scripts/trim-vo.py; beats = word starts (scripts/beats-vo.py 45).
export const F = {
  duration: 1215,
  // 1. hook: this is why nobody opens your poster
  why: 24,
  poster: 59,
  nobody: 112,
  opens: 135,
  // 2. a meme from your cousin you opened in a second
  memeIn: 192,
  cousin: 256,
  opened: 288,
  second: 316,
  // 3. and scrolled past a beautiful event poster
  scrollIn: 377,
  beautiful: 384,
  poster2: 419,
  event: 450,
  scrolled: 493,
  // 4. people share what is funny, warm and about their own
  shareIn: 563,
  share: 578,
  funny: 631,
  warm: 678,
  own: 731,
  // 5. make a culture post you want to drop into the family chat
  postIn: 781,
  post: 803,
  culture: 821,
  drop: 932,
  family: 952,
  chat: 976,
  // 6. and send this reel there right now
  sendIn: 1025,
  reel: 1052,
  send: 1072,
  there: 1097,
  right: 1118,
  now: 1136,
};

export const VO = [
  { src: "v45/vo/l1.mp3", from: 8, dur: 170 },
  { src: "v45/vo/l2.mp3", from: 192, dur: 171 },
  { src: "v45/vo/l3.mp3", from: 377, dur: 172 },
  { src: "v45/vo/l4.mp3", from: 563, dur: 204 },
  { src: "v45/vo/l5.mp3", from: 781, dur: 230 },
  { src: "v45/vo/l6.mp3", from: 1025, dur: 150 },
];
