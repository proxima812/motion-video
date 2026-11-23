import React from "react";
import { AbsoluteFill } from "remotion";
import { Phone, Volume2 } from "lucide-react";
import { SPRING, ease, lerp, progress, springAt } from "../stage/motion";
import { ReelShell, pop, type SceneDef, type Sfx } from "../kit/reel";
import { TatAvatar, type AvatarKey, type Emotion, type StanceKey } from "../kit/TatAvatar";
import { DotOrbitBg } from "../kit/DotOrbitBg";
import { HEADING, INK, NUMBER, PARAGRAPH, SURFACE } from "../kit/design";
import { GlassPlate } from "../catalog/own/glass";
import { Strike } from "../catalog/own/text";
import { F, VO } from "./timeline";
import { WORDS } from "./words";

// "Детская версия тебя" (@the_tatarverse, RU, host preset 2 Alicja). ~20.9 s.
// As kids many were shy of their native language -> "mom, don't speak Tatar in front of my friends" -> now you want to hear these words
// -> not too late, it means you've grown up -> call mom, ask her to say something in Tatar -> the child inside you will finally smile.
// Own kit only. Palette: lilac. Dot Orbit variant 1 (output/bg-variant.txt). Tatar words on screen: сәлам, кызым, Әни.
const T = { main: "#5D4A9C", vivid: "#8069C9", glow: "#C9BDF0", pale: "#F2EFFC" };
const PLATE_LILAC = "linear-gradient(135deg, #8069C9, #5D4A9C)";
const BG = <DotOrbitBg variant={1} />;
const BLUSH = "#E9A3C4";
const GRAY = "#E7E4EE";

/* ───────── Shared bits ───────── */

const keyWords = (text: string) => {
  let on = false;
  return text.split(" ").map((raw): [string, boolean] => {
    const open = on || raw.startsWith("*");
    on = open && !raw.endsWith("*");
    return [raw.replace(/\*/g, ""), open];
  });
};

/** Heading: Inter 400, *key* words 700 in the accent; `at` = one start (stagger) or a start per word */
const Title: React.FC<{ text: string; frame: number; at: number | number[]; stagger?: number; size?: number; top?: number; style?: React.CSSProperties }> = ({ text, frame, at, stagger = 3, size = 88, top = 170, style }) => (
  <div style={{ ...HEADING, position: "absolute", left: 100, right: 100, top, textAlign: "center", fontSize: size, ...style }}>
    {keyWords(text).map(([raw, key], i, all) => {
      const t = springAt(frame, Array.isArray(at) ? at[i] : at + i * stagger, SPRING.smooth);
      return (
        <span key={i} style={{ display: "inline-block", marginRight: i < all.length - 1 ? "0.24em" : 0, fontWeight: key ? 700 : 400, color: key ? T.main : undefined, opacity: Math.min(1, t * 1.3), transform: `translateY(${(1 - t) * 30}px)`, filter: `blur(${Math.max(0, (1 - t) * 8)}px)` }}>
          {raw}
        </span>
      );
    })}
  </div>
);

const fadeOut = (frame: number, at: number) => 1 - progress(frame, at, at + 10);

/** A face with eyes (look -1..1), a mouth (smile -1 frown .. 1 smile) and optional blush */
const Face: React.FC<{ color: string; size: number; look?: [number, number]; smile?: number; blush?: number; mouth?: boolean; style?: React.CSSProperties }> = ({ color, size, look = [0, 0], smile = 0, blush = 0, mouth = true, style }) => (
  <div style={{ position: "absolute", width: size, height: size, borderRadius: size / 2, boxSizing: "border-box", background: color, border: `${Math.max(3, size * 0.04)}px solid #fff`, boxShadow: SURFACE.boxShadow, ...style }}>
    {[0.33, 0.58].map((x) => (
      <div key={x} style={{ position: "absolute", left: `${(x + look[0] * 0.05) * 100}%`, top: `${(0.38 + look[1] * 0.05) * 100}%`, width: size * 0.09, height: size * 0.09, borderRadius: size, background: INK }} />
    ))}
    {blush > 0 &&
      [0.2, 0.68].map((x) => <div key={x} style={{ position: "absolute", left: `${x * 100}%`, top: "56%", width: size * 0.14, height: size * 0.08, borderRadius: size, background: BLUSH, opacity: blush }} />)}
    {mouth && (
      <svg width={size} height={size} viewBox="0 0 100 100" style={{ position: "absolute", left: -size * 0.04, top: -size * 0.04 }}>
        <path d={`M38 ${68 - smile * 2} Q 50 ${68 + smile * 12} 62 ${68 - smile * 2}`} fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />
      </svg>
    )}
  </div>
);

/** Speech bubble with the tail at the bottom-left (or right) */
const Bubble: React.FC<{ children: React.ReactNode; tail?: "left" | "right"; style?: React.CSSProperties }> = ({ children, tail = "left", style }) => (
  <div style={{ position: "absolute", ...style }}>
    <div style={{ ...SURFACE, borderRadius: 40, padding: "30px 44px", ...PARAGRAPH, fontWeight: 700, fontSize: 72, lineHeight: 1.1, color: T.main, whiteSpace: "nowrap" }}>{children}</div>
    <svg width={60} height={56} viewBox="0 0 60 56" style={{ position: "absolute", [tail]: 60, bottom: -50 }}>
      <path d={tail === "left" ? "M0 0 H60 L8 56 Z" : "M0 0 H60 L52 56 Z"} fill="#fff" />
    </svg>
  </div>
);

/* ───────── 1. Hook: a kid says "сәлам", gets shy, the word shrinks and hides ───────── */

const Hook: React.FC<{ frame: number }> = ({ frame }) => {
  const first = fadeOut(frame, F.but - 8);
  const kid = pop(frame, 4, SPRING.smooth);
  const say = springAt(frame, 14, SPRING.bouncy);
  const shy = ease.inOut(progress(frame, F.shy - 6, F.shy + 40));
  const blush = progress(frame, F.shy - 10, F.shy + 20);
  return (
    <>
      {first > 0 && <Title text="никто об этом *не говорит*" frame={frame} at={[-30, -26, -22, F.talk - 8, F.talk]} size={84} style={{ opacity: first }} />}
      {frame >= F.but - 6 && <Title text="в детстве многие *стеснялись*" frame={frame} at={[F.child - 10, F.child, F.many, F.shy]} size={84} />}
      {say > 0 && (
        <div style={{ position: "absolute", left: lerp(560, 520, shy), top: lerp(470, 760, shy), transformOrigin: "0 100%", transform: `scale(${Math.min(say, 1.05) * lerp(1, 0.35, shy)})`, opacity: 1 - 0.7 * shy, zIndex: 0 }}>
          <Bubble>сәлам</Bubble>
        </div>
      )}
      <div style={{ ...kid.style, position: "absolute", inset: 0, zIndex: 1 }}>
        <Face color={T.glow} size={260} look={[0.6 * shy, 1.2 * shy]} smile={lerp(0.6, -0.4, shy)} blush={blush} style={{ left: 540 - 130 - 60, top: 700 + 30 * shy }} />
      </div>
    </>
  );
};

/* ───────── 2. "Mom, don't speak Tatar in front of my friends": mom's "кызым" gets struck, the friends look over ───────── */

const Mom: React.FC<{ frame: number }> = ({ frame }) => {
  const first = fadeOut(frame, F.friends - 14);
  const fam = pop(frame, F.momIn + 4, SPRING.smooth);
  const bubble = pop(frame, F.momIn + 14, SPRING.bouncy);
  const friends = ease.inOut(progress(frame, F.tatar, F.friends));
  const tug = Math.sin((frame - F.momIn) / 4) * 6 * progress(frame, F.only - 10, F.only) * (1 - progress(frame, F.tatar + 20, F.tatar + 30));
  return (
    <>
      {first > 0 && <Title text="мам только *не говори*" frame={frame} at={[F.momIn + 2, F.only, F.dont, F.speak]} size={76} style={{ opacity: first }} />}
      {frame >= F.friends - 14 && <Title text="*при друзьях*" frame={frame} at={[F.friends - 8, F.friends]} size={100} />}
      {bubble.t > 0 && (
        <div style={{ position: "absolute", left: 140, top: 430, ...bubble.style }}>
          <Bubble>
            <Strike frame={frame} at={F.dont}>
              кызым
            </Strike>
          </Bubble>
        </div>
      )}
      <div style={{ ...fam.style, position: "absolute", inset: 0 }}>
        <Face color={T.vivid} size={240} look={[0.6, 0.4]} smile={0.5 - 0.7 * progress(frame, F.dont, F.dont + 20)} style={{ left: 150, top: 700 }} />
        <Face color={T.glow} size={150} look={[-1, -0.6]} smile={-0.3} blush={0.8} style={{ left: 420 + tug, top: 880 }} />
      </div>
      {[0, 1, 2].map((i) => {
        const p = springAt(frame, F.tatar - 10 + i * 6, SPRING.bouncy);
        return <Face key={i} color={[T.pale, T.glow, T.vivid][i]} size={130} look={[-1 * friends, 0.2]} smile={0.3} style={{ left: 760 + (i % 2) * 60, top: 640 + i * 170, transform: `translateX(${(1 - Math.min(p, 1)) * 300}px) scale(${Math.min(p, 1.05)})` }} />;
      })}
    </>
  );
};

/* ───────── 3. Now you want to hear these words: the volume slider goes up, the faded "кызым" comes back ───────── */

const Hear: React.FC<{ frame: number }> = ({ frame }) => {
  const card = pop(frame, F.nowIn + 8, SPRING.smooth);
  const vol = ease.inOut(progress(frame, F.want, F.hear + 24));
  const waves = progress(frame, F.hear, F.hear + 20);
  return (
    <>
      <Title text="теперь ты *хочешь услышать*" frame={frame} at={[F.now, F.now + 14, F.want, F.hear]} size={84} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 470, display: "flex", justifyContent: "center", opacity: lerp(0.25, 1, vol), filter: `blur(${(1 - vol) * 4}px)`, transform: `scale(${lerp(0.9, 1.1, vol)})` }}>
        <Bubble style={{ position: "relative" }}>кызым</Bubble>
      </div>
      <svg width={1080} height={1300} style={{ position: "absolute", inset: 0 }}>
        {[0, 1, 2].map((k) => {
          const r = ((frame - F.hear) / 40 + k / 3 + 3) % 1;
          return <ellipse key={k} cx={540} cy={545} rx={240 + r * 200} ry={110 + r * 90} fill="none" stroke={T.glow} strokeWidth={5} opacity={(1 - r) * waves} />;
        })}
      </svg>
      <div style={{ position: "absolute", left: 140, right: 140, top: 900, height: 170, ...SURFACE, borderRadius: 85, display: "flex", alignItems: "center", gap: 40, padding: "0 60px", boxSizing: "border-box", ...card.style }}>
        <Volume2 size={70} color={T.main} strokeWidth={2.2} style={{ flex: "none" }} />
        <div style={{ position: "relative", flex: 1, height: 22, borderRadius: 11, background: GRAY }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${vol * 100}%`, borderRadius: 11, background: `linear-gradient(90deg, ${T.glow}, ${T.vivid})` }} />
          <div style={{ position: "absolute", left: `calc(${vol * 100}% - 32px)`, top: -21, width: 64, height: 64, borderRadius: 32, background: "#fff", border: `8px solid ${T.vivid}`, boxSizing: "border-box", boxShadow: SURFACE.boxShadow }} />
        </div>
      </div>
    </>
  );
};

/* ───────── 4. Not too late, you've grown up: a height chart on the door frame, the face climbs the marks ───────── */

const MARKS = [
  { age: "5", y: 1130 },
  { age: "8", y: 990 },
  { age: "12", y: 850 },
  { age: "16", y: 720 },
  { age: "25", y: 560 },
];
const Grow: React.FC<{ frame: number }> = ({ frame }) => {
  const first = fadeOut(frame, F.means - 10);
  const ruler = pop(frame, F.lateIn + 6, SPRING.smooth);
  const g = ease.inOut(progress(frame, F.means - 10, F.grew + 6));
  const fy = lerp(MARKS[0].y, MARKS[4].y, g);
  const size = lerp(130, 230, g);
  const top = springAt(frame, F.grew, SPRING.bouncy);
  return (
    <>
      {first > 0 && <Title text="это *не поздно*" frame={frame} at={[F.lateIn + 2, F.late - 6, F.late]} size={100} style={{ opacity: first }} />}
      {frame >= F.means - 8 && <Title text="ты *вырос*" frame={frame} at={[F.grew - 14, F.grew]} size={110} />}
      <div style={{ ...ruler.style, position: "absolute", inset: 0 }}>
        <div style={{ position: "absolute", left: 360, top: 430, width: 70, height: 800, borderRadius: 18, background: T.pale, border: `5px solid ${T.glow}`, boxSizing: "border-box" }} />
        {Array.from({ length: 26 }, (_, i) => (
          <div key={i} style={{ position: "absolute", left: 365, top: 450 + i * 30, width: i % 5 === 0 ? 40 : 22, height: 4, borderRadius: 2, background: T.glow }} />
        ))}
      </div>
      {MARKS.map((m, i) => {
        const reached = fy <= m.y + 4 || i === 0;
        const p = springAt(frame, i === 0 ? F.lateIn + 14 : F.means - 10 + ((F.grew + 6 - (F.means - 10)) * (MARKS[0].y - m.y)) / (MARKS[0].y - MARKS[4].y), SPRING.bouncy);
        const last = i === MARKS.length - 1;
        return (
          <React.Fragment key={m.age}>
            <div style={{ position: "absolute", left: 340, top: m.y - 4, width: 230, height: 8, borderRadius: 4, background: last ? T.main : T.vivid, transformOrigin: "0 50%", transform: `scaleX(${reached ? Math.min(p, 1) : 0})` }} />
            <div style={{ position: "absolute", left: 160, width: 160, top: m.y - 40, textAlign: "right", ...NUMBER, fontSize: 72, color: last ? T.main : T.vivid, opacity: reached ? Math.min(1, p) : 0, transform: `scale(${last ? 1 + 0.15 * Math.min(top, 1) : 1})`, transformOrigin: "100% 50%" }}>{m.age}</div>
          </React.Fragment>
        );
      })}
      <Face color={T.glow} size={size} smile={0.4 + 0.5 * g} look={[-0.6, 0]} style={{ left: 600, top: fy - size + 10, transform: `rotate(${Math.sin(frame / 6) * 3 * (g > 0 && g < 1 ? 1 : 0)}deg)` }} />
    </>
  );
};

/* ───────── 5. Call mom: «Әни» on the call screen, it connects, she speaks ───────── */

const Call: React.FC<{ frame: number }> = ({ frame }) => {
  const card = pop(frame, F.callIn + 6, SPRING.smooth);
  const plate = pop(frame, F.mom - 6, SPRING.bouncy);
  const press = progress(frame, F.ask - 14, F.ask - 10) * (1 - progress(frame, F.ask - 8, F.ask));
  const on = frame >= F.ask;
  const secs = Math.max(0, Math.floor((frame - F.ask) / 60));
  const talk = progress(frame, F.inTatar - 6, F.inTatar + 6);
  return (
    <>
      <Title text="позвони *маме*" frame={frame} at={[F.callIn + 2, F.mom]} size={100} />
      <div style={{ position: "absolute", left: 220, right: 220, top: 400, height: 780, ...SURFACE, borderRadius: 56, ...card.style }}>
        {/* ringing waves, then the call is on */}
        <svg width={640} height={500} style={{ position: "absolute", left: 0, top: 0 }}>
          {!on &&
            [0, 0.5].map((k) => {
              const r = ((frame - F.callIn) / 40 + k) % 1;
              return <circle key={k} cx={320} cy={220} r={110 + r * 120} fill="none" stroke={T.glow} strokeWidth={5} opacity={1 - r} />;
            })}
        </svg>
        <Face color={T.vivid} size={220} smile={on ? 0.8 : 0.4} look={[0, 0.2]} style={{ left: 320 - 110, top: 110 }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 370, textAlign: "center", ...PARAGRAPH, fontWeight: 700, fontSize: 80, lineHeight: 1, color: INK }}>Әни</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 470, textAlign: "center", ...NUMBER, fontWeight: 400, fontSize: 56, color: T.vivid, opacity: on ? 1 : 0 }}>{`00:0${Math.min(9, secs)}`}</div>
        {/* her voice: bars dance when she speaks Tatar */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 560, height: 120, display: "flex", alignItems: "center", justifyContent: "center", gap: 14, opacity: talk }}>
          {Array.from({ length: 11 }, (_, i) => (
            <div key={i} style={{ width: 16, height: 20 + Math.abs(Math.sin(frame / 5 + i * 0.9)) * 90 * talk, borderRadius: 8, background: i % 2 ? T.vivid : T.glow }} />
          ))}
        </div>
      </div>
      {plate.t > 0 && !on && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 1010, display: "flex", justifyContent: "center", ...plate.style }}>
          <div style={{ transform: `scale(${2.3 - 0.2 * press})` }}>
            <GlassPlate bg={PLATE_LILAC}>
              <Phone size={20} strokeWidth={2.2} /> позвонить
            </GlassPlate>
          </div>
        </div>
      )}
    </>
  );
};

/* ───────── 6. The child inside you smiles: a small face inside the big circle, the mouth turns up ───────── */

const Inside: React.FC<{ frame: number }> = ({ frame }) => {
  const big = pop(frame, F.smileIn + 4, SPRING.smooth);
  const kid = springAt(frame, F.inside, SPRING.bouncy);
  const sm = ease.out(progress(frame, F.smile - 6, F.smile + 14));
  const glow = springAt(frame, F.smile + 6, SPRING.bouncy);
  const breathe = 1 + 0.02 * Math.sin(frame / 12);
  return (
    <>
      <Title text="ребенок *внутри* тебя" frame={frame} at={[F.smileIn + 2, F.inside, F.inside + 14]} size={80} />
      <Title text="наконец *улыбнется*" frame={frame} at={[F.finally, F.smile]} size={80} top={270} />
      <div style={{ position: "absolute", left: 540 - 300, top: 480, width: 600, height: 600, borderRadius: 300, background: T.pale, border: `8px solid ${T.glow}`, boxSizing: "border-box", boxShadow: `0 0 ${80 * Math.min(glow, 1)}px ${T.glow}`, transform: `scale(${breathe})`, ...{ opacity: big.style.opacity } }} />
      <Face color={T.glow} size={250} smile={lerp(-0.3, 1, sm)} blush={sm} look={[0, lerp(0.8, -0.2, sm)]} style={{ left: 540 - 125, top: 780 - 125, transform: `scale(${Math.min(kid, 1.05) * (1 + 0.08 * Math.min(glow, 1))})` }} />
      {[
        [300, 560, 1],
        [770, 600, 0.75],
        [760, 960, 0.9],
        [320, 980, 0.7],
      ].map(([x, y, k], i) => {
        const p = springAt(frame, F.smile + 4 + i * 5, SPRING.bouncy);
        return (
          <svg key={i} width={90} height={90} viewBox="-45 -45 90 90" style={{ position: "absolute", left: x - 45, top: y - 45, transform: `scale(${p * k}) rotate(${frame * 1.5}deg)` }}>
            <path d="M0 -42 Q 6 -6 42 0 Q 6 6 0 42 Q -6 6 -42 0 Q -6 -6 0 -42 Z" fill={i % 2 ? T.glow : T.vivid} />
          </svg>
        );
      })}
    </>
  );
};

/* ───────── Composition ───────── */

const SCENES: SceneDef[] = [
  { range: [0, F.momIn], El: Hook },
  { range: [F.momIn, F.nowIn], El: Mom },
  { range: [F.nowIn, F.lateIn], El: Hear },
  { range: [F.lateIn, F.callIn], El: Grow },
  { range: [F.callIn, F.smileIn], El: Call },
  { range: [F.smileIn, F.duration + 30], El: Inside },
];

const SFX: Sfx[] = [
  { src: "sfx/07_CineStrike.wav", from: 2, volume: 0.18 },
  { src: "sfx2/pop.mp3", from: 14, volume: 0.2 },
  { src: "sfx/03_Basscrack.wav", from: F.shy, volume: 0.07 },
  // scene changes: textures from the SFX/ library (no whoosh)
  { src: "sfx/01_Ripple_Textures.wav", from: F.momIn - 8, volume: 0.18 },
  { src: "sfx/04_Cyber_Shift.wav", from: F.nowIn - 8, volume: 0.2 },
  { src: "sfx/06_Ripple_Textures_II.wav", from: F.lateIn - 8, volume: 0.2 },
  { src: "sfx/02_Alienated_Warpes.wav", from: F.callIn - 8, volume: 0.14 },
  { src: "sfx/01_Ripple_Textures.wav", from: F.smileIn - 8, volume: 0.18 },
  // 2. the strike, the friends
  { src: "sfx2/pop.mp3", from: F.momIn + 14, volume: 0.2 },
  { src: "sfx/05_Distortion_Glitch.wav", from: F.dont + 4, volume: 0.05 },
  { src: "sfx2/pop.mp3", from: F.tatar - 10, volume: 0.16 },
  // 3. volume up
  { src: "sfx2/click.mp3", from: F.want, volume: 0.18 },
  { src: "sfx2/ding.mp3", from: F.hear + 20, volume: 0.18 },
  // 4. growing marks
  ...MARKS.slice(1).map((m) => ({ src: "sfx2/click.mp3", from: Math.round(F.means - 10 + ((F.grew + 6 - (F.means - 10)) * (MARKS[0].y - m.y)) / (MARKS[0].y - MARKS[4].y)), volume: 0.14 })),
  { src: "sfx/07_CineStrike.wav", from: F.grew, volume: 0.1 },
  // 5. the call
  { src: "sfx2/pop.mp3", from: F.mom - 6, volume: 0.2 },
  { src: "sfx2/click.mp3", from: F.ask - 14, volume: 0.22 },
  { src: "sfx2/ding.mp3", from: F.ask, volume: 0.16 },
  // 6. the smile
  { src: "sfx2/pop.mp3", from: F.inside, volume: 0.2 },
  { src: "sfx2/ding.mp3", from: F.smile, volume: 0.2 },
];

// All 30 poses of the Alicja set, each at least once; never the same photo twice in a row
const AVATAR_KEYS: AvatarKey[] = [
  // 1. hook: shy of the native language
  { at: 0, e: "shush" },
  { at: 45, e: "thinking" },
  { at: 95, e: "pensive" },
  { at: 140, e: "dreamy" },
  { at: 185, e: "disappointed" },
  { at: 235, e: "facepalm" },
  // 2. "mom, don't"
  { at: F.momIn, e: "stop" },
  { at: 335, e: "displeased" },
  { at: 375, e: "arms-crossed" },
  { at: 415, e: "skeptical" },
  { at: 445, e: "shrug" },
  // 3. now you want to hear
  { at: F.nowIn, e: "listening" },
  { at: 515, e: "surprised" },
  { at: 560, e: "puzzled" },
  { at: 600, e: "explaining" },
  // 4. not late, grown up
  { at: F.lateIn, e: "soft-smile" },
  { at: 690, e: "point-up" },
  { at: 735, e: "thumbs-up" },
  { at: 780, e: "delighted" },
  // 5. call mom
  { at: F.callIn, e: "point-right" },
  { at: 870, e: "present-left" },
  { at: 910, e: "point-down" },
  { at: 950, e: "inspired" },
  { at: 990, e: "waving" },
  // 6. the child smiles
  { at: F.smileIn, e: "hand-on-heart" },
  { at: 1080, e: "smile-up" },
  { at: 1115, e: "heart-hands" },
  { at: 1150, e: "laughing" },
  { at: 1185, e: "clapping" },
  { at: 1220, e: "victory" },
];

const STANCES: StanceKey[] = [
  { at: 0, s: "center" },
  { at: F.momIn, s: "right" },
  { at: F.nowIn, s: "left" },
  { at: F.lateIn, s: "right" },
  { at: F.callIn, s: "left" },
  { at: F.smileIn, s: "center" },
];

// Alicja photos: scale the wide-framed ones so every photo fills the 540x590 box by height (same as V37)
const SIZE: Record<string, [number, number]> = {
  pensive: [1129, 1393], dreamy: [1293, 1216], displeased: [1254, 1254], surprised: [1280, 1229], waving: [1312, 1199], inspired: [1199, 1312], explaining: [1312, 1199], delighted: [1312, 1199], skeptical: [1312, 1199], laughing: [1385, 1136],
  puzzled: [1129, 1393], disappointed: [1278, 1230], "smile-up": [1199, 1312], thinking: [1129, 1393], "soft-smile": [1164, 1351], "point-up": [1312, 1199], "point-down": [1312, 1199], "present-left": [1312, 1199], "point-right": [1312, 1199], shrug: [1312, 1199],
  "hand-on-heart": [1312, 1199], stop: [1312, 1199], shush: [1199, 1312], clapping: [1312, 1199], "thumbs-up": [1312, 1199], "arms-crossed": [1199, 1312], facepalm: [1312, 1199], "heart-hands": [1312, 1199], victory: [1312, 1199], listening: [1312, 1199],
};
const FIT = Object.fromEntries(Object.entries(SIZE).map(([e, [w, h]]) => [e, Math.max(1, w / h / (540 / 590))])) as Partial<Record<Emotion, number>>;

const Host: React.FC<{ frame: number }> = ({ frame }) => <TatAvatar frame={frame} keys={AVATAR_KEYS} words={WORDS} stances={STANCES} dir="v49/avatar" fit={FIT} />;

export const Video49: React.FC = () => (
  <AbsoluteFill style={{ background: "#fff", fontFamily: PARAGRAPH.fontFamily, color: INK }}>
    <ReelShell scenes={SCENES} headlines={[]} vo={VO} sfx={SFX} duration={F.duration} music="v49/music/bed.mp3" musicLevel={[0.045, 0.11]} overlay={Host} bg={BG} />
  </AbsoluteFill>
);
