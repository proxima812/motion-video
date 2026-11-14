// Video 20 - AI OVERLOAD (@const_proxima, EN). No voice, no SFX, no on-screen titles: 75 hard cuts on music.
// Music: HighThere - AC130 from 5:00 (public/v20/music/bed.wav, 15.34 s, -4.5 dB). Measured tempo 172.00 BPM,
// beat grid at t = k * 60/172 s from the song start, so 5:00.000 is the downbeat of bar 215 (frame 0 here).
// Bars here (song bar): 0 = bar 215 (last bar of a phrase), 1-8 = phrase 216-223 (bar 8 = fill, bass drop-out
// at 12.21-12.38 s), 9 = bar 224 downbeat (new section, 12.56 s), 11 = bar 226 downbeat (15.35 s) - music stops.
export const FPS = 60;
export const BPM = 172;
export const BEAT = (60 / BPM) * FPS; // 20.93 frames
export const HALF = BEAT / 2; // 10.47 frames - one cut
export const STEP = BEAT / 4; // 16th note
export const BAR = BEAT * 4;

/** Half-beat index -> frame */
export const h = (n: number) => Math.round(n * HALF);

// Shot lengths in half-beats. 1-5: intro bar (bar 215); 6-69: one shot per half-beat over the 8-bar phrase;
// 70: white flash on the section downbeat; 71-75: finale (dot, net, expansion, blinding flash, black).
const LEN = [2, 1, 1, 1, 3, ...Array<number>(64).fill(1), 2, 3, 3, 5, 3, 2];

export type ShotSlot = { i: number; hs: number; from: number; dur: number };
export const SLOTS: ShotSlot[] = (() => {
  let hs = 0;
  return LEN.map((len, i) => {
    const s = { i, hs, from: h(hs), dur: h(hs + len) - h(hs) };
    hs += len;
    return s;
  });
})();

export const F = {
  phrase: h(8), // bar 216 downbeat, shot 6
  fill: h(64), // bar 223: fill bar
  dropout: h(70), // bass drop-out (shot 68)
  flash: h(72), // bar 224 downbeat: white flash (shot 70)
  dot: h(74),
  net: h(77),
  expand: h(80),
  blind: h(85),
  black: h(88), // bar 226 downbeat: music cut, absolute black
  duration: h(90),
};

// Drum hits (two-step): kick on 16th steps 0 and 10, snare on 4 and 12 of every bar.
export const HITS: { f: number; kind: "kick" | "snare" }[] = [];
for (let bar = 0; bar < 11; bar++) {
  for (const [s, kind] of [[0, "kick"], [4, "snare"], [10, "kick"], [12, "snare"]] as const) {
    const f = Math.round(bar * BAR + s * STEP);
    if (f < F.black) HITS.push({ f, kind });
  }
}

/** Overall intensity 0..1 (drives shake, punch, glitch). */
export const energy = (frame: number) => {
  const pts: [number, number][] = [[0, 0.35], [F.phrase, 0.45], [h(26), 0.55], [h(46), 0.7], [h(56), 0.85], [F.fill, 1], [F.flash, 1], [F.flash + 1, 0]];
  for (let i = 1; i < pts.length; i++) {
    const [a, va] = pts[i - 1];
    const [b, vb] = pts[i];
    if (frame < b) return va + ((vb - va) * (frame - a)) / (b - a);
  }
  return 0;
};
