// Cursor path in window-local coordinates.
import { CARD, KPI, slotPos } from "./layout";
import { ease, lerp, progress, springAt, SPRING } from "./motion";
import { T } from "./timeline";

export const GRAB = { x: 172, y: 46 };
const a0 = slotPos("a", 0);
const b0 = slotPos("b", 0);

const P = {
  enter: { x: 640, y: 760 },
  kpiBadge: { x: KPI.ax + 300, y: KPI.y + 132 },
  grab: { x: a0.x + GRAB.x, y: a0.y + GRAB.y },
  drop: { x: b0.x + GRAB.x + 8, y: b0.y + GRAB.y - 10 },
  rest: { x: b0.x + CARD.w - 40, y: b0.y + 3 * (CARD.h + CARD.gap) + 30 },
};

const seg = (frame: number, s: number, e: number, a: { x: number; y: number }, b: { x: number; y: number }, fn = ease.inOut) => {
  const t = fn(progress(frame, s, e));
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
};

export const cursorAt = (frame: number) => {
  let pos;
  if (frame < T.toPipeline) pos = seg(frame, T.cursorIn, T.hoverKpi, P.enter, P.kpiBadge, ease.outExpo);
  else if (frame < T.dragStart) pos = seg(frame, T.toPipeline + 6, T.press - 2, P.kpiBadge, P.grab);
  else if (frame < T.toMetrics) {
    // Arc drag (quadratic bezier) between columns
    const t = ease.inOut(progress(frame, T.dragStart, T.dragEnd));
    const c = { x: (P.grab.x + P.drop.x) / 2, y: P.grab.y - 110 };
    pos = {
      x: (1 - t) ** 2 * P.grab.x + 2 * (1 - t) * t * c.x + t ** 2 * P.drop.x,
      y: (1 - t) ** 2 * P.grab.y + 2 * (1 - t) * t * c.y + t ** 2 * P.drop.y,
    };
  } else pos = seg(frame, T.toMetrics, T.toMetrics + 50, P.drop, P.rest, ease.out);

  const visible =
    springAt(frame, T.cursorIn, SPRING.smooth) * (1 - progress(frame, T.cursorOut, T.cursorOut + 24));
  const pressed = frame >= T.press && frame < T.release;
  const press = pressed
    ? springAt(frame, T.press, SPRING.snappy)
    : frame >= T.release
      ? 1 - springAt(frame, T.release, SPRING.snappy)
      : 0;
  return { ...pos, visible, press, pressed };
};
