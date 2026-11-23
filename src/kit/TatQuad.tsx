import React from "react";
import { SPRING, lerp, springAt } from "../stage/motion";
import { TatAvatar, type AvatarKey, type Emotion, type SpokenWord } from "./TatAvatar";

// Four @the_tatarverse hosts in one reel ("quad" series), standing in a row along the bottom edge, cut by it like TatAvatar.
// Slots 0-1 (left half) look right, slots 2-3 (right half) are mirrored and look left - everyone faces the middle.
// The one who talks steps forward: bigger, a little toward the middle, in front, nods on her words, her word pills fly
// toward the middle. The others are smaller and listen (their own keys: listening / reaction poses).
// Pose rules stay TatAvatar's: a key every ~1.5-2 s by meaning, never the same photo twice in a row.
// Scene content stays above ~1380 px: the speaker's pills float at ~1420-1600.
export type QuadSlot = { keys: AvatarKey[]; words: SpokenWord[]; dir: string; fit?: Partial<Record<Emotion, number>> };
export type QuadTurn = { from: number; who: number }; // who = slot 0..3, -1 = nobody talks (all listen)

const TALK = 0.74; // scale of the speaker
const LISTEN = 0.52; // scale of a listener
const CX = [150, 405, 675, 930]; // slot centers
const STEP = 24; // the speaker moves this much toward the middle
const LEAD = 8; // the next speaker steps forward this many frames before her line

export const TatQuad: React.FC<{ frame: number; slots: readonly QuadSlot[]; turns: QuadTurn[]; frameW?: number; frameH?: number }> = ({ frame, slots, turns, frameW = 1080, frameH = 1920 }) => {
  const i = turns.reduce((acc, t, k) => (frame >= t.from - LEAD ? k : acc), -1);
  // how much slot h is the speaker now, 0..1: a spring at every change of turn
  const focus = (h: number) => {
    if (i < 0) return turns[0]?.who === h ? 1 : 0;
    const cur = turns[i].who === h ? 1 : 0;
    const prev = i > 0 ? (turns[i - 1].who === h ? 1 : 0) : cur;
    return cur === prev ? cur : lerp(prev, cur, Math.min(1, springAt(frame, turns[i].from - LEAD, SPRING.smooth)));
  };
  return (
    <>
      {slots.map((s, h) => {
        const f = focus(h);
        const left = h < 2;
        const cx = (CX[h] * frameW) / 1080 + (left ? 1 : -1) * STEP * f;
        return (
          <div key={h} style={{ position: "absolute", inset: 0, zIndex: f > 0.5 ? 5 : h === 1 || h === 2 ? 2 : 1 }}>
            <TatAvatar frame={frame} keys={s.keys} words={s.words} cx={cx} scale={lerp(LISTEN, TALK, f)} frameW={frameW} frameH={frameH} mirror={!left} dir={s.dir} fit={s.fit} />
          </div>
        );
      })}
    </>
  );
};
