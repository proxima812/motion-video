import type { AvatarKey } from "../kit/TatAvatar";
import { AHU_KEYS, AHU_NODS, ALICJA_KEYS, ALICJA_NODS, nods } from "../v51/hosts";
import { F as RU_F, VO as RU_VO } from "../v51/timeline";
import { F, VO } from "./timeline";
import { WORDS_AHU, WORDS_ALICJA } from "./words";

// Same pose plan as V51 (all 30 poses per host), moved onto the EN lines: piecewise-linear time warp between
// the start and end of every line, so a pose keeps its place inside its line (and the listener stays 10-15 frames behind).
const anchors: [number, number][] = [[0, 0], ...RU_VO.flatMap((v, i): [number, number][] => [[v.from, VO[i].from], [v.from + v.dur, VO[i].from + VO[i].dur]]), [RU_F.duration, F.duration]];
export const warp = (f: number) => {
  if (f <= 0) return f;
  for (let k = 1; k < anchors.length; k++) {
    const [a0, b0] = anchors[k - 1];
    const [a1, b1] = anchors[k];
    if (f <= a1) return Math.round(b0 + ((f - a0) * (b1 - b0)) / Math.max(1, a1 - a0));
  }
  return f;
};
const moved = (keys: AvatarKey[]) => keys.map((k) => ({ ...k, at: warp(k.at) }));

export const AHU_KEYS_EN = moved(AHU_KEYS);
export const ALICJA_KEYS_EN = moved(ALICJA_KEYS);
export const AHU_WORDS_EN = [...WORDS_AHU, ...nods(AHU_NODS.map(warp))];
export const ALICJA_WORDS_EN = [...WORDS_ALICJA, ...nods(ALICJA_NODS.map(warp))];
