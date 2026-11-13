// Tactile Glass UI animates from performance.now(). During renders we drive that
// clock from the Remotion frame so every frame is deterministic (and seek-safe).
import { getRemotionEnvironment } from "remotion";

const w = window as unknown as { __fableMs?: number };
if (getRemotionEnvironment().isRendering) {
  w.__fableMs = 0;
  performance.now = () => w.__fableMs ?? 0;
}

export const setClock = (frame: number, fps: number) => {
  if (getRemotionEnvironment().isRendering) w.__fableMs = (frame * 1000) / fps;
};
