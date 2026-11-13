// Frame-deterministic wrappers around Motion (motion.dev) primitives.
// Motion's spring generator is analytical, so sampling it at t = frame / fps
// gives the same physics as in the browser while staying seek-safe for Remotion.
import { clamp, cubicBezier, mix, spring } from "motion";

export const FPS = 60;

/** Global motion tempo: springs play this many times faster. Beats stay pinned to the voiceover. */
export const SPEED = 1.5;

export type SpringConfig = { stiffness?: number; damping?: number; mass?: number };

const generators = new Map<string, (ms: number) => number>();

const getSpring = (cfg: SpringConfig) => {
  const key = `${cfg.stiffness}-${cfg.damping}-${cfg.mass}`;
  let fn = generators.get(key);
  if (!fn) {
    const gen = spring({
      keyframes: [0, 1],
      stiffness: cfg.stiffness ?? 170,
      damping: cfg.damping ?? 26,
      mass: cfg.mass ?? 1,
    });
    fn = (ms) => gen.next(ms).value as number;
    generators.set(key, fn);
  }
  return fn;
};

/** Spring progress 0 → 1 (may overshoot) starting at `start` frame. */
export const springAt = (frame: number, start: number, cfg: SpringConfig = {}) =>
  frame <= start ? 0 : getSpring(cfg)((frame - start) * SPEED * (1000 / FPS));

export const SPRING = {
  soft: { stiffness: 90, damping: 20 },
  smooth: { stiffness: 140, damping: 26 },
  snappy: { stiffness: 260, damping: 24 },
  bouncy: { stiffness: 220, damping: 15 },
  camera: { stiffness: 55, damping: 16, mass: 1 },
} satisfies Record<string, SpringConfig>;

export const ease = {
  outExpo: cubicBezier(0.16, 1, 0.3, 1),
  inOut: cubicBezier(0.65, 0, 0.35, 1),
  out: cubicBezier(0.22, 1, 0.36, 1),
  in: cubicBezier(0.55, 0, 1, 0.45),
};

/** Linear progress of `frame` through [start, end], clamped to 0..1. */
export const progress = (frame: number, start: number, end: number) =>
  clamp(0, 1, (frame - start) / (end - start));

export const lerp = (a: number, b: number, t: number) => mix(a, b, t);

export const tween = (
  frame: number,
  start: number,
  end: number,
  from: number,
  to: number,
  easing: (t: number) => number = ease.inOut,
) => lerp(from, to, easing(progress(frame, start, end)));
