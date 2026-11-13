// Single source of truth for scene timing (60 fps, 900 frames = 15 s).
export const T = {
  duration: 900,

  // 1. Interface appears
  introStart: 0,
  buildStagger: 6,

  // 2. Camera pushes into MRR card
  pushIn: 150,
  cursorIn: 235,
  hoverKpi: 282,

  // 3. Cursor drags a deal
  toPipeline: 300,
  press: 372,
  dragStart: 384,
  dragEnd: 462,
  release: 464,

  // 4. Metrics update
  toMetrics: 476,
  metricsUpdate: 520,
  cursorOut: 590,

  // 5. Pull out + logo
  pullOut: 650,
  uiFadeStart: 672,
  uiFadeEnd: 760,
  logoIn: 708,
  tagline: 762,
};

export const CAPTIONS = [
  { from: 28, to: 186, text: "Вся выручка — в одном окне." },
  { from: 326, to: 440, text: "Перетащите сделку…" },
  { from: 466, to: 640, text: "…и каждая метрика обновится мгновенно." },
];

export const VO = [
  { src: "vo/l1.mp3", from: 30 },
  { src: "vo/l2.mp3", from: 328 },
  { src: "vo/l3.mp3", from: 470 },
  { src: "vo/l4.mp3", from: 736 },
];

export const SFX = [
  { src: "sfx/01_Ripple_Textures.wav", from: 0, volume: 0.35 },
  { src: "sfx/04_Cyber_Shift.wav", from: 146, volume: 0.28 },
  { src: "sfx/06_Ripple_Textures_II.wav", from: 298, volume: 0.3 },
  { src: "sfx/03_Basscrack.wav", from: 462, volume: 0.32 },
  { src: "sfx/02_Alienated_Warpes.wav", from: 646, volume: 0.22 },
  { src: "sfx/07_CineStrike.wav", from: 706, volume: 0.45 },
];
