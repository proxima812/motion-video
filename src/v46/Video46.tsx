import React from "react";
import { AbsoluteFill } from "remotion";
import { Check } from "lucide-react";
import { SPRING, ease, lerp, progress, springAt } from "../stage/motion";
import { ReelShell, pop, shake, type SceneDef, type Sfx } from "../kit/reel";
import { TatAvatar, type AvatarKey, type Emotion, type StanceKey } from "../kit/TatAvatar";
import { DotOrbitBg } from "../kit/DotOrbitBg";
import { HEADING, INK, PARAGRAPH, SURFACE } from "../kit/design";
import { GlassPlate } from "../catalog/own/glass";
import { F, VO } from "./timeline";
import { WORDS } from "./words";

// "Не назначай меня представителем народа" (@the_tatarverse, RU, main host preset Ahu). ~20.8 s.
// Don't expect one Tatar to answer for all -> "how is it done among you Tatars?", everyone looks at you -> you only know grandma's way
// -> that's fine, traditions differ even inside one family -> better ask "how was it at your home?" -> that's how a real conversation starts.
// Own kit only. Palette: petrol. Dot Orbit variant 4 (output/bg-variant.txt).
const T = { main: "#0B5566", vivid: "#13839B", glow: "#8FCFDC", pale: "#E5F5F8" };
const MID = "#4FA8BA";
const PLATE_PETROL = "linear-gradient(135deg, #13839B, #0B5566)";
const BG = <DotOrbitBg variant={4} />;
const GRAY = "#E3E9EB";

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

/** A round face with two eyes; `look` shifts the pupils (-1..1 on x and y) */
const Face: React.FC<{ color: string; size: number; look?: [number, number]; ring?: boolean; style?: React.CSSProperties }> = ({ color, size, look = [0, 0], ring = true, style }) => (
  <div style={{ position: "absolute", width: size, height: size, borderRadius: size / 2, boxSizing: "border-box", background: color, border: ring ? `${Math.max(3, size * 0.045)}px solid #fff` : undefined, boxShadow: ring ? SURFACE.boxShadow : undefined, ...style }}>
    {[0.33, 0.58].map((x) => (
      <div key={x} style={{ position: "absolute", left: `${(x + look[0] * 0.06) * 100}%`, top: `${(0.4 + look[1] * 0.06) * 100}%`, width: size * 0.09, height: size * 0.09, borderRadius: size, background: INK }} />
    ))}
  </div>
);

/* ───────── 1. Hook: one face out of the crowd gets the sash "представитель", everyone's lines land on him ───────── */

const CROWD = Array.from({ length: 21 }, (_, i) => ({ x: 170 + (i % 7) * 123, y: 960 + Math.floor(i / 7) * 110 + ((i % 7) % 2) * 18, c: [T.glow, MID, T.pale, T.glow, MID][i % 5] }));
const ONE = { x: 540, y: 620, size: 220 };
const Hook: React.FC<{ frame: number }> = ({ frame }) => {
  const first = fadeOut(frame, F.dont - 8);
  const one = springAt(frame, F.one - 6, SPRING.bouncy);
  const sash = springAt(frame, F.tatar, SPRING.bouncy);
  const lines = ease.out(progress(frame, F.all - 8, F.all + 18));
  const sx = shake(frame, F.all + 10, 10, 30);
  const drop = progress(frame, F.all + 16, F.all + 40);
  return (
    <>
      {first > 0 && <Title text="не совершай эту *ошибку*" frame={frame} at={[-30, -24, -18, F.mistake - 4]} size={84} style={{ opacity: first }} />}
      {frame >= F.dont - 6 && <Title text="один *за всех*" frame={frame} at={[F.one - 4, F.answer + 18, F.all]} size={100} />}
      <svg width={1080} height={1300} style={{ position: "absolute", inset: 0 }}>
        {CROWD.map((c, i) => (
          <line key={i} x1={c.x} y1={c.y} x2={lerp(c.x, ONE.x, lines)} y2={lerp(c.y, ONE.y + 60, lines)} stroke={T.glow} strokeWidth={4} opacity={lines > 0 ? 0.8 : 0} />
        ))}
      </svg>
      {CROWD.map((c, i) => {
        const p = springAt(frame, 6 + (i % 7) * 3 + Math.floor(i / 7) * 4, SPRING.bouncy);
        const dx = Math.sign(ONE.x - c.x) * Math.min(1, Math.abs(ONE.x - c.x) / 200);
        return <Face key={i} color={c.c} size={88} look={lines > 0.3 ? [dx, -1] : [0, 0]} style={{ left: c.x - 44, top: c.y - 44, transform: `scale(${p})` }} />;
      })}
      {one > 0 && (
        <div style={{ position: "absolute", left: ONE.x - ONE.size / 2 + sx, top: ONE.y - ONE.size / 2, width: ONE.size, height: ONE.size, transform: `scale(${Math.min(one, 1.1)})` }}>
          <Face color={T.vivid} size={ONE.size} look={lines > 0.5 ? [0, 1] : [0, 0]} style={{ left: 0, top: 0 }} />
          {/* sweat drop */}
          {drop > 0 && (
            <svg width={40} height={56} viewBox="0 0 40 56" style={{ position: "absolute", left: ONE.size - 34, top: 20 + drop * 30, opacity: 1 - progress(drop, 0.8, 1) * 0.5 }}>
              <path d="M20 2 C 30 20 38 30 38 38 A 18 18 0 0 1 2 38 C 2 30 10 20 20 2 Z" fill={T.glow} stroke="#fff" strokeWidth={3} />
            </svg>
          )}
          {sash > 0 && (
            <div style={{ position: "absolute", left: -90, right: -90, top: ONE.size * 0.66, display: "flex", justifyContent: "center", transform: `rotate(-8deg) scale(${Math.min(sash, 1.08)})` }}>
              <div style={{ background: T.main, ...PARAGRAPH, color: "#fff", fontWeight: 700, fontSize: 42, lineHeight: 1, padding: "20px 36px", borderRadius: 18, boxShadow: SURFACE.boxShadow, whiteSpace: "nowrap" }}>представитель</div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

/* ───────── 2. "How is it done among you?" on a video call: every tile turns its eyes to you ───────── */

const TW = 260;
const TH = 220;
const Call: React.FC<{ frame: number }> = ({ frame }) => {
  const bubble = pop(frame, F.askIn + 6, SPRING.smooth);
  const bubbleOut = fadeOut(frame, F.everyone - 14);
  const look = ease.inOut(progress(frame, F.look - 8, F.look + 6));
  const you = springAt(frame, F.you - 4, SPRING.bouncy);
  return (
    <>
      {bubbleOut > 0 && bubble.t > 0 && (
        <div style={{ position: "absolute", left: 130, right: 130, top: 170, ...bubble.style, opacity: (bubble.style.opacity as number) * bubbleOut }}>
          <div style={{ ...SURFACE, borderRadius: 40, padding: 40, textAlign: "center", ...PARAGRAPH, fontSize: 60, lineHeight: 1.1 }}>
            а как у вас <b style={{ color: T.main }}>принято</b>
          </div>
          <svg width={60} height={50} viewBox="0 0 60 50" style={{ position: "absolute", left: 120, bottom: -44 }}>
            <path d="M0 0 H60 L10 50 Z" fill="#fff" />
          </svg>
        </div>
      )}
      {frame >= F.everyone - 8 && <Title text="*все* смотрят" frame={frame} at={[F.everyone, F.look]} size={100} />}
      {Array.from({ length: 9 }, (_, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const center = i === 4;
        const p = springAt(frame, F.askIn + 4 + i * 3, SPRING.smooth);
        const lx = (1 - col) * look;
        const ly = (1 - row) * look;
        return (
          <div key={i} style={{ position: "absolute", left: 130 + col * (TW + 20), top: 440 + row * (TH + 20), width: TW, height: TH, borderRadius: 28, background: center ? T.pale : "#fff", boxShadow: SURFACE.boxShadow, outline: center && you > 0 ? `${8 * Math.min(you, 1)}px solid ${T.vivid}` : undefined, outlineOffset: -4, transform: `scale(${p * (center ? 1 + 0.06 * Math.min(you, 1) : 1)})`, opacity: Math.min(1, p * 1.5), zIndex: center ? 2 : 1 }}>
            <Face color={center ? T.vivid : [T.glow, MID, T.glow, MID, 0, MID, T.glow, MID, T.glow][i] as string} size={120} ring={false} look={center ? [0, 0.6 * look] : [lx, ly]} style={{ left: TW / 2 - 60, top: TH / 2 - 60 - 10 }} />
            <div style={{ position: "absolute", left: 24, bottom: 18, width: center ? 70 : 90, height: 14, borderRadius: 7, background: center ? T.glow : GRAY }} />
          </div>
        );
      })}
    </>
  );
};

/* ───────── 3. You only know grandma's way: zoom from "all Tatars" to one tiny dot ───────── */

const DOTS = Array.from({ length: 70 }, (_, i) => {
  const a = i * 2.39996;
  const r = 300 * Math.sqrt((i + 0.5) / 70);
  return { x: Math.cos(a) * r, y: Math.sin(a) * r, c: [T.glow, MID, T.pale, T.glow][i % 4] };
});
const GD = { x: 120, y: 90 }; // grandma's dot, relative to the circle center
const Granny: React.FC<{ size: number }> = ({ size }) => (
  <div style={{ position: "relative", width: size, height: size }}>
    <Face color={T.glow} size={size} style={{ left: 0, top: 0 }} />
    <svg width={size} height={size * 1.12} viewBox="0 0 100 112" style={{ position: "absolute", left: 0, top: -size * 0.06 }}>
      <path d="M4 66 C 0 -4 100 -4 96 66 L 84 60 C 82 24 18 24 16 60 Z" fill={T.vivid} />
      <path d="M40 100 L 60 100 L 50 112 Z" fill={T.vivid} />
      <path d="M16 60 C 14 80 30 98 42 101 L 58 101 C 70 98 86 80 84 60" fill="none" stroke={T.vivid} strokeWidth={6} />
      {[30, 50, 70].map((x) => (
        <circle key={x} cx={x} cy={16} r={3.5} fill={T.pale} />
      ))}
    </svg>
  </div>
);
const Only: React.FC<{ frame: number }> = ({ frame }) => {
  const circle = pop(frame, F.onlyIn + 4, SPRING.smooth);
  const zoom = ease.inOut(progress(frame, F.only + 10, F.grandma + 6));
  const s = lerp(1, 4, zoom);
  const CX = 540;
  const CY = 800;
  const lit = springAt(frame, F.only, SPRING.bouncy);
  const gran = springAt(frame, F.grandma - 4, SPRING.bouncy);
  return (
    <>
      <Title text="только *у бабушки*" frame={frame} at={[F.only, F.grandma - 6, F.grandma]} size={100} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 380, height: 900, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: -380, width: 1080, height: 1300, transformOrigin: `${CX + GD.x}px ${CY + GD.y}px`, transform: `translate(${-GD.x * zoom}px, ${-GD.y * zoom}px) scale(${s})`, ...{ opacity: circle.style.opacity } }}>
          <div style={{ position: "absolute", left: CX - 330, top: CY - 330, width: 660, height: 660, borderRadius: 330, border: `5px dashed ${T.glow}`, background: "rgba(229,245,248,0.5)", boxSizing: "border-box", opacity: 1 - zoom }} />
          {DOTS.map((d, i) => {
            const p = springAt(frame, F.onlyIn + 6 + i * 0.6, SPRING.bouncy);
            return <div key={i} style={{ position: "absolute", left: CX + d.x - 13, top: CY + d.y - 13, width: 26, height: 26, borderRadius: 13, background: d.c, transform: `scale(${p})`, opacity: 1 - 0.85 * zoom }} />;
          })}
          <div style={{ position: "absolute", left: CX + GD.x - 16, top: CY + GD.y - 16, width: 32, height: 32, borderRadius: 16, background: T.main, transform: `scale(${Math.min(lit, 1.15) * (1 - Math.min(gran, 1))})`, boxShadow: `0 0 ${24 * Math.min(lit, 1)}px ${T.vivid}` }} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 410, textAlign: "center", ...PARAGRAPH, fontSize: 54, lineHeight: 1, fontWeight: 700, color: T.main, opacity: (circle.style.opacity as number) * (1 - zoom) }}>все татары</div>
      {gran > 0 && (
        <div style={{ position: "absolute", left: CX - 110, top: CY - 150, transform: `scale(${Math.min(gran, 1.1)})` }}>
          <Granny size={220} />
          <div style={{ position: "absolute", left: -60, right: -60, top: 270, textAlign: "center", ...PARAGRAPH, fontSize: 56, lineHeight: 1, fontWeight: 700, color: T.main }}>бабушка</div>
        </div>
      )}
    </>
  );
};

/* ───────── 4. That's fine: one house, four people, four different "ways" ───────── */

const WAYS = [
  { x: 330, y: 790, c: T.vivid, d: "M10 45 Q 30 15 50 45 T 90 45 T 130 45" },
  { x: 750, y: 790, c: MID, d: "M10 60 L 34 26 L 58 60 L 82 26 L 106 60 L 130 26" },
  { x: 330, y: 1060, c: T.main, d: "" },
  { x: 750, y: 1060, c: T.glow, d: "M20 45 C 20 15 60 15 60 45 C 60 75 100 75 100 45 C 100 15 140 15 130 45" },
];
const Fine: React.FC<{ frame: number }> = ({ frame }) => {
  const first = fadeOut(frame, F.traditions - 10);
  const plate = pop(frame, F.fine - 4, SPRING.bouncy);
  const house = ease.inOut(progress(frame, F.traditions - 8, F.traditions + 26));
  return (
    <>
      {first > 0 && <Title text="и это *нормально*" frame={frame} at={[F.okIn + 2, F.okIn + 9, F.fine]} size={100} style={{ opacity: first }} />}
      {first > 0 && plate.t > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 720, display: "flex", justifyContent: "center", ...plate.style, opacity: (plate.style.opacity as number) * first }}>
          <div style={{ transform: "scale(2.5)" }}>
            <GlassPlate bg={PLATE_PETROL}>
              <Check size={20} strokeWidth={2.6} /> нормально
            </GlassPlate>
          </div>
        </div>
      )}
      {frame >= F.traditions - 10 && <Title text="традиции *разные*" frame={frame} at={[F.traditions - 4, F.differ]} size={92} />}
      {frame >= F.even - 6 && <Title text="даже в одной *семье*" frame={frame} at={[F.even - 2, F.even + 8, F.oneFam, F.family]} size={68} top={280} style={{ color: INK }} />}
      {house > 0 && (
        <svg width={1080} height={1300} style={{ position: "absolute", inset: 0 }}>
          <path d="M140 640 L 540 420 L 940 640 V 1220 H 140 Z" fill="rgba(255,255,255,0.9)" stroke={T.glow} strokeWidth={10} strokeLinejoin="round" strokeDasharray={3200} strokeDashoffset={3200 * (1 - house)} />
        </svg>
      )}
      {WAYS.map((w, i) => {
        const p = springAt(frame, F.differ - 10 + i * 8, SPRING.bouncy);
        const b = springAt(frame, F.differ + 4 + i * 8, SPRING.bouncy);
        return (
          <React.Fragment key={i}>
            <Face color={w.c} size={120} style={{ left: w.x - 60, top: w.y, transform: `scale(${p})` }} />
            <div style={{ position: "absolute", left: w.x - 90, top: w.y - 110, width: 180, height: 90, borderRadius: 28, background: T.pale, display: "grid", placeItems: "center", transform: `scale(${b})`, transformOrigin: "50% 100%" }}>
              <svg width={150} height={90} viewBox="0 0 150 90">
                {w.d ? <path d={w.d} fill="none" stroke={w.c} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" /> : [30, 60, 90, 120].map((x) => <circle key={x} cx={x} cy={45} r={10} fill={w.c} />)}
              </svg>
            </div>
          </React.Fragment>
        );
      })}
    </>
  );
};

/* ───────── 5. Better ask: the question types itself, a little home appears in the friend's thought bubble ───────── */

const QUESTION = "как было у тебя дома";
const AskHome: React.FC<{ frame: number }> = ({ frame }) => {
  const faces = pop(frame, F.askBetterIn + 4, SPRING.smooth);
  const bubble = pop(frame, F.ask + 10, SPRING.smooth);
  const typed = Math.round(lerp(0, QUESTION.length, progress(frame, F.ask + 26, F.home + 14)));
  const think = springAt(frame, F.home + 4, SPRING.bouncy);
  const cursor = typed < QUESTION.length && Math.floor(frame / 12) % 2 === 0;
  return (
    <>
      <Title text="лучше *спроси*" frame={frame} at={[F.askBetterIn + 2, F.ask]} size={100} />
      <div style={{ ...faces.style }}>
        <Face color={T.vivid} size={170} look={[1, 0]} style={{ left: 170, top: 900 }} />
        <Face color={T.glow} size={170} look={[-1, 0]} style={{ left: 740, top: 900 }} />
      </div>
      {bubble.t > 0 && (
        <div style={{ position: "absolute", left: 130, top: 430, width: 620, ...bubble.style }}>
          <div style={{ ...SURFACE, borderRadius: 40, padding: 40, minHeight: 140, boxSizing: "border-box", ...PARAGRAPH, fontSize: 58, lineHeight: 1.15 }}>
            {QUESTION.slice(0, typed)}
            <span style={{ display: "inline-block", width: 4, height: 54, marginLeft: 4, verticalAlign: "-8px", background: T.vivid, opacity: cursor ? 1 : 0 }} />
          </div>
          <svg width={60} height={70} viewBox="0 0 60 70" style={{ position: "absolute", left: 90, bottom: -64 }}>
            <path d="M0 0 H60 L14 70 Z" fill="#fff" />
          </svg>
        </div>
      )}
      {think > 0 && (
        <div style={{ position: "absolute", left: 700, top: 620, transform: `scale(${Math.min(think, 1.1)})`, transformOrigin: "60% 100%" }}>
          <div style={{ position: "absolute", left: 120, top: 250, width: 26, height: 26, borderRadius: 13, ...SURFACE }} />
          <div style={{ position: "absolute", left: 140, top: 205, width: 40, height: 40, borderRadius: 20, ...SURFACE }} />
          <div style={{ width: 250, height: 200, borderRadius: 100, ...SURFACE, display: "grid", placeItems: "center" }}>
            <svg width={130} height={120} viewBox="0 0 130 120">
              <path d="M10 58 L 65 12 L 120 58" fill="none" stroke={T.main} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
              <rect x={24} y={52} width={82} height={60} rx={6} fill={T.vivid} />
              <rect x={54} y={78} width={22} height={34} rx={4} fill={T.pale} />
              <rect x={34} y={64} width={16} height={14} rx={3} fill={T.glow} />
              <rect x={82} y={64} width={16} height={14} rx={3} fill={T.glow} />
            </svg>
          </div>
        </div>
      )}
    </>
  );
};

/* ───────── 6. A real conversation: two cups of tea, the reply bubbles pile up in turns ───────── */

const Cup: React.FC = () => (
  <svg width={130} height={110} viewBox="0 0 130 110">
    <path d="M14 30 H94 V62 A40 40 0 0 1 14 62 Z" fill={T.vivid} />
    <circle cx={102} cy={52} r={16} fill="none" stroke={T.vivid} strokeWidth={9} />
    <rect x={4} y={96} width={110} height={10} rx={5} fill={T.glow} />
  </svg>
);
const BUBBLES = Array.from({ length: 9 }, (_, i) => ({ at: F.talkIn + 16 + i * 17, left: i % 2 === 0, w: [300, 360, 250, 330, 280, 360, 240, 320, 300][i] }));
const Talk: React.FC<{ frame: number }> = ({ frame }) => {
  const n = BUBBLES.filter((b) => frame >= b.at).length;
  const STEP = 96;
  return (
    <>
      <Title text="так *начинается*" frame={frame} at={[F.talkIn + 2, F.starts]} size={84} />
      <Title text="настоящий *разговор*" frame={frame} at={[F.real, F.talk]} size={84} top={275} />
      <Face color={T.vivid} size={170} look={[1, -0.5]} style={{ left: 120, top: 1000 }} />
      <Face color={T.glow} size={170} look={[-1, -0.5]} style={{ left: 790, top: 1000 }} />
      <div style={{ position: "absolute", left: 300, top: 1110, transform: `scale(${springAt(frame, F.talkIn + 6, SPRING.bouncy)})` }}>
        <Cup />
      </div>
      <div style={{ position: "absolute", left: 650, top: 1110, transform: `scaleX(-1) scale(${springAt(frame, F.talkIn + 10, SPRING.bouncy)})` }}>
        <Cup />
      </div>
      <div style={{ position: "absolute", left: 120, right: 120, top: 420, height: 560, overflow: "hidden" }}>
        {BUBBLES.map((b, i) => {
          if (frame < b.at) return null;
          const p = springAt(frame, b.at, SPRING.bouncy);
          const lift = springAt(frame, BUBBLES[Math.min(n - 1, BUBBLES.length - 1)].at, SPRING.smooth);
          const slot = n - 1 - i - (1 - Math.min(1, lift)) * (i < n - 1 ? 1 : 0);
          const y = 560 - 100 - slot * STEP;
          return (
            <div key={i} style={{ position: "absolute", top: y, [b.left ? "left" : "right"]: 0, width: b.w, height: 80, borderRadius: 40, background: b.left ? T.vivid : "#fff", boxShadow: SURFACE.boxShadow, display: "flex", alignItems: "center", padding: "0 30px", boxSizing: "border-box", gap: 14, transform: `scale(${p})`, transformOrigin: b.left ? "0 100%" : "100% 100%" }}>
              <div style={{ flex: 1, height: 16, borderRadius: 8, background: b.left ? "rgba(255,255,255,0.6)" : GRAY }} />
              <div style={{ width: 50, height: 16, borderRadius: 8, background: b.left ? "rgba(255,255,255,0.6)" : GRAY }} />
            </div>
          );
        })}
      </div>
    </>
  );
};

/* ───────── Composition ───────── */

const SCENES: SceneDef[] = [
  { range: [0, F.askIn], El: Hook },
  { range: [F.askIn, F.onlyIn], El: Call },
  { range: [F.onlyIn, F.okIn], El: Only },
  { range: [F.okIn, F.askBetterIn], El: Fine },
  { range: [F.askBetterIn, F.talkIn], El: AskHome },
  { range: [F.talkIn, F.duration + 30], El: Talk },
];

const SFX: Sfx[] = [
  { src: "sfx/07_CineStrike.wav", from: 2, volume: 0.18 },
  { src: "sfx2/pop.mp3", from: F.one - 6, volume: 0.22 },
  { src: "sfx2/click.mp3", from: F.tatar, volume: 0.2 },
  { src: "sfx/03_Basscrack.wav", from: F.all, volume: 0.08 },
  // scene changes: textures from the SFX/ library (no whoosh)
  { src: "sfx/01_Ripple_Textures.wav", from: F.askIn - 8, volume: 0.18 },
  { src: "sfx/04_Cyber_Shift.wav", from: F.onlyIn - 8, volume: 0.2 },
  { src: "sfx/06_Ripple_Textures_II.wav", from: F.okIn - 8, volume: 0.2 },
  { src: "sfx/02_Alienated_Warpes.wav", from: F.askBetterIn - 8, volume: 0.14 },
  { src: "sfx/01_Ripple_Textures.wav", from: F.talkIn - 8, volume: 0.18 },
  // 2. the call
  { src: "sfx2/pop.mp3", from: F.askIn + 6, volume: 0.2 },
  { src: "sfx/05_Distortion_Glitch.wav", from: F.look - 4, volume: 0.04 },
  { src: "sfx2/click.mp3", from: F.you - 4, volume: 0.2 },
  // 3. zoom to grandma
  { src: "sfx2/ding.mp3", from: F.only, volume: 0.16 },
  { src: "sfx2/pop.mp3", from: F.grandma - 4, volume: 0.22 },
  // 4. fine, different ways
  { src: "sfx2/ding.mp3", from: F.fine - 4, volume: 0.18 },
  ...WAYS.map((_, i) => ({ src: "sfx2/pop.mp3", from: F.differ - 10 + i * 8, volume: 0.16 })),
  // 5. typing, the home
  { src: "sfx2/click.mp3", from: F.ask + 10, volume: 0.18 },
  { src: "sfx2/pop.mp3", from: F.home + 4, volume: 0.22 },
  // 6. the conversation
  ...BUBBLES.filter((_, i) => i % 2 === 0).map((b) => ({ src: "sfx2/pop.mp3", from: b.at, volume: 0.12 })),
  { src: "sfx/07_CineStrike.wav", from: F.talk, volume: 0.12 },
];

// All 30 poses of the main set, each at least once; never the same photo twice in a row
const AVATAR_KEYS: AvatarKey[] = [
  // 1. hook: don't make one Tatar answer for all
  { at: 0, e: "stop" },
  { at: 45, e: "explaining" },
  { at: 95, e: "disappointed" },
  { at: 140, e: "skeptical" },
  { at: 185, e: "arms-crossed" },
  { at: 230, e: "displeased" },
  // 2. "how is it done among you?"
  { at: F.askIn, e: "puzzled" },
  { at: 315, e: "surprised" },
  { at: 355, e: "listening" },
  { at: 395, e: "pensive" },
  { at: 425, e: "shrug" },
  { at: 460, e: "facepalm" },
  // 3. only grandma's way
  { at: F.onlyIn, e: "laughing" },
  { at: 530, e: "shush" },
  { at: 565, e: "present-left" },
  { at: 600, e: "smile-up" },
  { at: 630, e: "point-down" },
  // 4. that's fine, traditions differ
  { at: F.okIn, e: "soft-smile" },
  { at: 705, e: "hand-on-heart" },
  { at: 750, e: "thinking" },
  { at: 795, e: "point-right" },
  { at: 845, e: "delighted" },
  // 5. better ask
  { at: F.askBetterIn, e: "inspired" },
  { at: 925, e: "point-up" },
  { at: 960, e: "dreamy" },
  { at: 1015, e: "thumbs-up" },
  // 6. a real conversation
  { at: F.talkIn, e: "waving" },
  { at: 1100, e: "clapping" },
  { at: 1140, e: "heart-hands" },
  { at: 1185, e: "victory" },
];

const STANCES: StanceKey[] = [
  { at: 0, s: "center" },
  { at: F.askIn, s: "right" },
  { at: F.onlyIn, s: "left" },
  { at: F.okIn, s: "right" },
  { at: F.askBetterIn, s: "left" },
  { at: F.talkIn, s: "center" },
];

// Main set photos: scale the wide-framed ones so every photo fills the 540x590 box by height (same as V38)
const SIZE: Record<string, [number, number]> = {
  pensive: [1312, 1199], dreamy: [1293, 1217], displeased: [1254, 1254], surprised: [1280, 1229], waving: [1312, 1199], inspired: [1199, 1312], explaining: [1312, 1199], delighted: [1312, 1199], skeptical: [1312, 1199], laughing: [1385, 1136],
  puzzled: [1152, 1366], disappointed: [1278, 1230], "smile-up": [1199, 1312], thinking: [1190, 1322], "soft-smile": [1218, 1291], "point-up": [1312, 1199], "point-down": [1312, 1199], "present-left": [1312, 1199], "point-right": [1312, 1199], shrug: [1312, 1199],
  "hand-on-heart": [1312, 1199], stop: [1312, 1199], shush: [1312, 1199], clapping: [1278, 1230], "thumbs-up": [1312, 1199], "arms-crossed": [1312, 1199], facepalm: [1312, 1199], "heart-hands": [1312, 1199], victory: [1312, 1199], listening: [1312, 1199],
};
const FIT = Object.fromEntries(Object.entries(SIZE).map(([e, [w, h]]) => [e, Math.max(1, w / h / (540 / 590))])) as Partial<Record<Emotion, number>>;

const Host: React.FC<{ frame: number }> = ({ frame }) => <TatAvatar frame={frame} keys={AVATAR_KEYS} words={WORDS} stances={STANCES} fit={FIT} />;

export const Video46: React.FC = () => (
  <AbsoluteFill style={{ background: "#fff", fontFamily: PARAGRAPH.fontFamily, color: INK }}>
    <ReelShell scenes={SCENES} headlines={[]} vo={VO} sfx={SFX} duration={F.duration} music="v46/music/bed.mp3" musicLevel={[0.045, 0.11]} overlay={Host} bg={BG} />
  </AbsoluteFill>
);
