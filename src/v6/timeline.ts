// Video 6 - "Vibe startup" (EN). Same beats as src/v5/timeline.ts, EN voice (public/v6/vo, trimmed x1.04).
export const F = {
  duration: 1600,
  // 1. "I asked AI to build me a startup in ten seconds. And it actually did it!" (vo 10)
  submit: 110,
  ten: 155,
  done: 220,
  // 2. "Beautiful UI, perfect architecture, Stripe connected. All that's left is testing." (vo 315)
  uiIn: 309,
  ui: 357,
  arch: 444,
  stripe: 509,
  testing: 587,
  // 3. "I hit sign up. Error five hundred. Okay, let's ask it to fix that." (vo 699)
  signupIn: 693,
  click: 729,
  error: 789,
  fixAsk: 891,
  // 4. "The AI rebuilt the whole app. Zero files changed. Eight hundred forty-seven deleted." (vo 1030)
  rebuildIn: 1024,
  rebuilt: 1074,
  zero: 1171,
  deleted: 1258,
  n847: 1258,
  // 5. "Now the app is production ready." (vo 1400)
  prodIn: 1394,
  prod: 1458,
};

export const VO = [
  { src: "v6/vo/l1.mp3", from: 10, dur: 289 },
  { src: "v6/vo/l2.mp3", from: 315, dur: 369 },
  { src: "v6/vo/l3.mp3", from: 699, dur: 316 },
  { src: "v6/vo/l4.mp3", from: 1030, dur: 344 },
  { src: "v6/vo/l5.mp3", from: 1400, dur: 131 },
];
