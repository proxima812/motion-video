// Stageshow-style camera: a chain of spring-driven shots in world space.
import { WIN, KPI } from "./layout";
import { SPRING, lerp, springAt, type SpringConfig } from "./motion";
import { T } from "./timeline";

export type Shot = { s: number; cx: number; cy: number; rx: number };
type Move = { at: number; to: Shot; spring: SpringConfig };

const kpiCenter = { x: WIN.x + KPI.ax + KPI.w / 2, y: WIN.y + KPI.y + KPI.h / 2 };

const INITIAL: Shot = { s: 0.84, cx: 540, cy: 640, rx: 26 };

const MOVES: Move[] = [
  { at: 4, to: { s: 1, cx: 540, cy: 880, rx: 0 }, spring: SPRING.soft },
  { at: T.pushIn, to: { s: 2.1, cx: kpiCenter.x, cy: kpiCenter.y + 70, rx: 0 }, spring: SPRING.camera },
  {
    at: T.toPipeline,
    to: { s: 1.24, cx: 540, cy: WIN.y + WIN.h - 600, rx: 0 },
    spring: SPRING.camera,
  },
  { at: T.toMetrics, to: { s: 1.22, cx: 540, cy: WIN.y + KPI.y + 330, rx: 0 }, spring: SPRING.camera },
  { at: T.pullOut, to: { s: 0.58, cx: 540, cy: 960, rx: 8 }, spring: { stiffness: 40, damping: 14 } },
];

export const cameraAt = (frame: number): Shot => {
  let cur = INITIAL;
  for (const m of MOVES) {
    const t = springAt(frame, m.at, m.spring);
    if (t === 0) break;
    cur = {
      s: lerp(cur.s, m.to.s, t),
      cx: lerp(cur.cx, m.to.cx, t),
      cy: lerp(cur.cy, m.to.cy, t),
      rx: lerp(cur.rx, m.to.rx, t),
    };
  }
  return cur;
};

/** World → screen (ignores rx; cursor only appears once the stage is flat). */
export const project = (shot: Shot, p: { x: number; y: number }) => ({
  x: 540 + (p.x - shot.cx) * shot.s,
  y: 960 + (p.y - shot.cy) * shot.s,
});

export const stageTransform = (shot: Shot) =>
  `translate(540px, 960px) rotateX(${shot.rx}deg) scale(${shot.s}) translate(${-shot.cx}px, ${-shot.cy}px)`;
