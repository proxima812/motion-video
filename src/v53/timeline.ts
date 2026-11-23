// Video 53 - «Будущее уже влияет на тебя» (@const_proxima, RU, dark preset: no avatar, no Outro, hard cut at the end).
// Voice: Taras Vovk 11JUpgNlQsWfppULB2T8, eleven_v4, natural tempo, cheap-mic filter. Music: Ludwig Goransson - Ithaca
// from 1:52 (public/v53/music/bed.mp3). 60 fps. No SFX.
// 30 s cut: lines 2, 4, 6 are trimmed at natural pauses (public/v53/vo/cut/, ffmpeg from public/v53/vo/l<N>.mp3):
//   c2  = l2 [0, 1.86]          «Иногда всё наоборот.»
//   c4a = l4 [0, 2.40]          «Это не фантастика, а математика.»
//   c4b = l4 [4.98, end]        «Ты оцениваешь возможные результаты... и выбираешь шаг с учётом будущего, которого ещё нет.»
//   c6  = l6 [0, 2.20] + [2.50, end]  (pause before «Но» shortened)
//   line 5 («Будущее рождает решения...») is dropped.
import type { Vo } from "../kit/dark";

const SRC = ["l1", "cut/c2", "l3", "cut/c4a", "cut/c4b", "cut/c6", "l7"];
const DUR = [3.8, 1.86, 4.91, 2.4, 5.8, 5.15, 4.92]; // ffprobe
const FROM = [4, 240, 360, 665, 817, 1177, 1496];

export const VO: Vo[] = FROM.map((from, i) => ({ src: `v53/vo/${SRC[i]}.mp3`, from, dur: Math.round(DUR[i] * 60) }));

/** Absolute frame of `sec` seconds into voice line `n` (1-based). */
export const at = (n: number, sec: number) => FROM[n - 1] + Math.round(sec * 60);

export const F = {
  duration: 1798, // «наступает» ends ~1791 -> the reel just stops (no fade, no Outro), 29.97 s
};
