// Fable 5.2 reel — single source of truth for timing (60 fps, 960 frames = 16 s).
// Beats are pinned to the pauses inside each Kyle (Eleven v4) voice line.
export const F = {
  duration: 960,

  // 1. "Fable 5.2 is here."
  introWord: 10,
  introGlass: 34,
  introSub: 70,

  // 2. "Ask it to fix a typo… it rewrites your app. In Rust."
  promptIn: 138,
  typeStart: 150,
  typeEnd: 204,
  submit: 222,
  rewrite: 247,
  rust: 350,

  // 3. "Think Harder mode. Forty minutes later: hmm."
  thinkIn: 400,
  toggle: 436,
  timerStart: 470,
  timerEnd: 584,
  hmm: 593,

  // 4. "Wrong? You're absolutely right!"
  wrongIn: 622,
  apologize: 662,
  right: 670,

  // 5. "Fable 5.2. Point one better."
  endIn: 756,
  endSub: 872,
  endCta: 892,
};

export const SCENES = {
  intro: [0, F.promptIn],
  prompt: [F.promptIn, F.thinkIn],
  think: [F.thinkIn, F.wrongIn],
  wrong: [F.wrongIn, F.endIn],
  end: [F.endIn, F.duration + 30],
} as const;

export const HEADLINES = [
  { from: F.promptIn + 6, text: "Fix one typo." },
  { from: F.rewrite, text: "Rewrites your app." },
  { from: F.rust, text: "In Rust." },
  { from: F.thinkIn + 6, text: "Think Harder mode" },
  { from: F.timerStart + 30, text: "40 minutes later…" },
  { from: F.hmm, text: "" },
  { from: F.wrongIn + 6, text: "Wrong?" },
  { from: F.right, text: "You're absolutely right!" },
  { from: F.endIn, text: "" },
];

export const VO = [
  { src: "vo2/f_l1.mp3", from: 12 },
  { src: "vo2/f_l2.mp3", from: 140 },
  { src: "vo2/f_l3.mp3", from: 405 },
  { src: "vo2/f_l4.mp3", from: 628 },
  { src: "vo2/f_l5.mp3", from: 762 },
];

export const SFX = [
  { src: "sfx/07_CineStrike.wav", from: 6, volume: 0.32 },
  { src: "sfx2/pop.mp3", from: F.introGlass + 2, volume: 0.5 },
  { src: "sfx2/whoosh.mp3", from: F.promptIn - 8, volume: 0.45 },
  { src: "sfx2/typing.mp3", from: F.typeStart, volume: 0.55 },
  { src: "sfx2/click.mp3", from: F.submit - 2, volume: 0.7 },
  { src: "sfx2/glitch.mp3", from: F.rewrite - 2, volume: 0.3 },
  { src: "sfx2/ding.mp3", from: F.rust, volume: 0.5 },
  { src: "sfx2/whoosh.mp3", from: F.thinkIn - 8, volume: 0.45 },
  { src: "sfx2/click.mp3", from: F.toggle - 2, volume: 0.7 },
  { src: "sfx/04_Cyber_Shift.wav", from: F.timerStart, volume: 0.22 },
  { src: "sfx2/crickets.mp3", from: F.hmm + 6, volume: 0.55 },
  { src: "sfx2/error.mp3", from: F.wrongIn + 4, volume: 0.55 },
  { src: "sfx2/click.mp3", from: F.apologize - 2, volume: 0.7 },
  { src: "sfx2/pop.mp3", from: F.right + 10, volume: 0.45 },
  { src: "sfx2/pop.mp3", from: F.right + 30, volume: 0.45 },
  { src: "sfx2/pop.mp3", from: F.right + 50, volume: 0.45 },
  { src: "sfx2/whoosh.mp3", from: F.endIn - 8, volume: 0.45 },
  { src: "sfx2/rimshot.mp3", from: 920, volume: 0.6 },
];
