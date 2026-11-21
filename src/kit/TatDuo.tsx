import React from "react";
import { SPRING, lerp, springAt } from "../stage/motion";
import { TatAvatar, type AvatarKey, type Emotion, type SpokenWord } from "./TatAvatar";

// Two @the_tatarverse hosts in one reel, talking in turns (a dialog). Host 0 stands at the left edge and looks right,
// host 1 at the right edge and looks left (mirrored); both are cut by the bottom edge like TatAvatar.
// The one who talks steps forward: bigger, a little closer to the middle, in front, nods on her words, and her word
// pills fly out toward the middle. The other one steps back and listens (her own keys: listening / reaction poses).
// Pose rules stay TatAvatar's: a key every ~2 s by meaning, never the same photo twice in a row.
// Scene content stays above ~1330 px: the pills of the speaker float in the middle at 1350-1460.
export type DuoHost = { keys: AvatarKey[]; words: SpokenWord[]; dir?: string; fit?: Partial<Record<Emotion, number>> };
export type Turn = { from: number; who: 0 | 1 | -1 }; // -1: nobody of the two talks (e.g. a voice message plays) - both listen

const TALK = 0.94; // scale of the speaker
const LISTEN = 0.82; // scale of the listener
const EDGE = 254; // host center from her frame edge
const STEP = 20; // the speaker moves this much toward the middle
const LEAD = 8; // the next speaker steps forward this many frames before her line

export const TatDuo: React.FC<{ frame: number; hosts: readonly [DuoHost, DuoHost]; turns: Turn[]; frameW?: number; frameH?: number }> = ({ frame, hosts, turns, frameW = 1080, frameH = 1920 }) => {
  // how much host h is the speaker now, 0..1: a spring at every change of turn
  const focus = (h: 0 | 1) => {
    const i = turns.reduce((acc, t, k) => (frame >= t.from - LEAD ? k : acc), -1);
    if (i < 0) return turns[0]?.who === h ? 1 : 0;
    // who -1 = both listen (small), nobody steps forward
    const cur = turns[i].who === h ? 1 : 0;
    const prev = i > 0 ? (turns[i - 1].who === h ? 1 : 0) : cur;
    return cur === prev ? cur : lerp(prev, cur, Math.min(1, springAt(frame, turns[i].from - LEAD, SPRING.smooth)));
  };
  return (
    <>
      {([0, 1] as const).map((h) => {
        const f = focus(h);
        const { keys, words, dir, fit } = hosts[h];
        const cx = h === 0 ? EDGE + STEP * f : frameW - EDGE - STEP * f;
        return (
          <div key={h} style={{ position: "absolute", inset: 0, zIndex: f > 0.5 ? 2 : 1 }}>
            <TatAvatar frame={frame} keys={keys} words={words} cx={cx} scale={lerp(LISTEN, TALK, f)} frameW={frameW} frameH={frameH} mirror={h === 1} dir={dir} fit={fit} />
          </div>
        );
      })}
    </>
  );
};
