import React from "react";
import { AbsoluteFill } from "remotion";
import { MapPin, Plane, ShoppingBasket } from "lucide-react";
import { SPRING, ease, lerp, progress, springAt } from "../stage/motion";
import { ReelShell, count, pop, type SceneDef, type Sfx } from "../kit/reel";
import { TatAvatar, type AvatarKey, type Emotion, type StanceKey } from "../kit/TatAvatar";
import { DotOrbitBg } from "../kit/DotOrbitBg";
import { HEADING, INK, NUMBER, PARAGRAPH, SURFACE } from "../kit/design";
import { GlassPlate, PLATE } from "../catalog/own/glass";
import { Mark } from "../catalog/own/text";
import { F, VO } from "./timeline";
import { WORDS } from "./words";

// "Свои, которых ты еще не встретил" (@the_tatarverse, RU, host preset 2 Alicja). ~20 s.
// Neighbours on the next street, same shop, Tatar at home - and you meet only in another city, by chance -> find yours earlier: city + wave in the comments.
// Own kit only. Palette: terracotta (home, family, "свои"). Dot Orbit variant 1 (output/bg-variant.txt).
const T = { main: "#A4472A", vivid: "#D4693F", glow: "#F0B394", pale: "#FCEEE6" };
const BG = <DotOrbitBg variant={1} />;
const W = 1080;
const ROAD = "#E6E3E1";

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

/** Flat house: white body (SURFACE shadow), colored roof, two windows that light up */
const House: React.FC<{ x: number; y: number; s?: number; roof?: string; lit?: number; style?: React.CSSProperties }> = ({ x, y, s = 1, roof = "#D9D5D2", lit = 0, style }) => (
  <div style={{ position: "absolute", left: x - 90 * s, top: y - 170 * s, width: 180 * s, height: 190 * s, ...style }}>
    <div style={{ position: "absolute", left: 0, top: 0, width: 0, height: 0, borderLeft: `${90 * s}px solid transparent`, borderRight: `${90 * s}px solid transparent`, borderBottom: `${70 * s}px solid ${roof}` }} />
    <div style={{ ...SURFACE, borderRadius: 18 * s, position: "absolute", left: 14 * s, top: 70 * s, width: 152 * s, height: 120 * s, display: "flex", justifyContent: "center", alignItems: "center", gap: 22 * s }}>
      {[0, 1].map((k) => (
        <div key={k} style={{ width: 38 * s, height: 38 * s, borderRadius: 8 * s, background: lit > 0.5 ? T.glow : "#EEECEA", boxShadow: lit > 0.5 ? `0 0 ${18 * s}px ${T.glow}` : undefined }} />
      ))}
    </div>
  </div>
);

const Dot: React.FC<{ x: number; y: number; t: number; color?: string; r?: number }> = ({ x, y, t, color = T.vivid, r = 26 }) => (
  <div style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: r, background: color, border: "7px solid #fff", boxShadow: `0 0 0 ${8 * Math.min(t, 1)}px ${T.glow}66, ${SURFACE.boxShadow}`, transform: `scale(${t})` }} />
);

/* ───────── 1. Hook: a street of houses, two of them are "yours" ───────── */

const STREET = [140, 340, 540, 740, 940];
const Hook: React.FC<{ frame: number }> = ({ frame }) => (
  <>
    <Title text="это изменит твое отношение к *соседям*" frame={frame} at={[-30, -24, -18, -12, -6, F.neighbours - 4]} size={84} />
    <div style={{ position: "absolute", top: 900, left: 60, right: 60, height: 16, borderRadius: 8, background: ROAD }} />
    {STREET.map((x, i) => {
      const p = springAt(frame, 10 + i * 6, SPRING.bouncy);
      const mine = i === 1 || i === 3;
      const on = mine ? springAt(frame, F.neighbours + (i === 3 ? 8 : 0), SPRING.bouncy) : 0;
      return <House key={i} x={x} y={880} s={0.95} roof={on > 0.5 ? T.vivid : undefined} lit={on} style={{ transform: `scale(${p * (1 + 0.08 * Math.min(on, 1))})`, transformOrigin: "50% 100%", opacity: Math.min(1, p * 1.5) }} />;
    })}
  </>
);

/* ───────── 2. You live on neighbouring streets: two pins, 300 m apart ───────── */

const A = { x: 300, y: 560 };
const Bp = { x: 780, y: 900 };
const Streets: React.FC<{ frame: number }> = ({ frame }) => {
  const map = pop(frame, F.streetsIn + 4, SPRING.smooth);
  const line = ease.inOut(progress(frame, F.streets, F.streets + 40));
  const chip = pop(frame, F.streets + 30, SPRING.bouncy);
  return (
    <>
      <Title text="*соседние* улицы" frame={frame} at={[F.streets - 4, F.streets + 10]} size={96} />
      <div style={{ position: "absolute", inset: 0, ...map.style }}>
        {[A.y, Bp.y].map((y) => (
          <div key={y} style={{ position: "absolute", top: y - 12, left: 60, right: 60, height: 24, borderRadius: 12, background: ROAD }} />
        ))}
        <div style={{ position: "absolute", top: 420, bottom: 620, left: 520, width: 24, borderRadius: 12, background: ROAD }} />
        {[160, 420, 680, 900].map((x, i) => (
          <React.Fragment key={x}>
            <House x={x} y={A.y - 30} s={0.55} />
            <House x={x + (i % 2 ? -40 : 40)} y={Bp.y - 30} s={0.55} />
          </React.Fragment>
        ))}
      </div>
      <svg width={W} height={1300} style={{ position: "absolute", inset: 0 }}>
        <line x1={A.x} y1={A.y} x2={lerp(A.x, Bp.x, line)} y2={lerp(A.y, Bp.y, line)} stroke={T.vivid} strokeWidth={7} strokeDasharray="4 18" strokeLinecap="round" opacity={line > 0 ? 1 : 0} />
      </svg>
      <Dot x={A.x} y={A.y} t={springAt(frame, F.live - 10, SPRING.bouncy)} />
      <Dot x={Bp.x} y={Bp.y} t={springAt(frame, F.live + 4, SPRING.bouncy)} color={T.main} />
      {chip.t > 0 && (
        <div style={{ position: "absolute", left: (A.x + Bp.x) / 2 - 90, top: (A.y + Bp.y) / 2 - 50, width: 180, ...SURFACE, padding: "24px 0", textAlign: "center", ...NUMBER, fontSize: 48, color: T.main, ...chip.style }}>300 м</div>
      )}
    </>
  );
};

/* ───────── 3. Same shop, Tatar at home: two paths cross at the shop but never meet ───────── */

const Shop: React.FC<{ frame: number }> = ({ frame }) => {
  const shop = pop(frame, F.shopIn + 6, SPRING.bouncy);
  const homeT = progress(frame, F.home - 10, F.home + 6);
  const bubbleL = pop(frame, F.tatar - 8, SPRING.bouncy);
  const bubbleR = pop(frame, F.tatar + 12, SPRING.bouncy);
  // they walk to the shop in turns: one leaves as the other comes
  const walk = (k: number) => 0.5 - 0.5 * Math.cos((frame - F.shopIn) / 26 + k * Math.PI);
  const bubble = (side: "l" | "r"): React.CSSProperties => ({ ...SURFACE, padding: "22px 30px", ...PARAGRAPH, fontSize: 46, lineHeight: 1, position: "absolute", top: 650, ...(side === "l" ? { left: 70, borderBottomLeftRadius: 6 } : { right: 70, borderBottomRightRadius: 6 }) });
  return (
    <>
      <Title text="один *магазин*" frame={frame} at={[F.shop - 16, F.shop]} size={96} style={{ opacity: 1 - homeT }} />
      {homeT > 0 && <Title text="дома на *татарском*" frame={frame} at={[F.home, F.home + 8, F.tatar]} size={92} />}
      <div style={{ position: "absolute", top: 1010, left: 60, right: 60, height: 16, borderRadius: 8, background: ROAD }} />
      <House x={170} y={1000} s={0.9} roof={T.vivid} lit={homeT} />
      <House x={910} y={1000} s={0.9} roof={T.main} lit={homeT} />
      <div style={{ position: "absolute", top: 760, left: 0, right: 0, display: "flex", justifyContent: "center", ...shop.style, opacity: (shop.style.opacity as number) * (1 - 0.6 * homeT) }}>
        <div style={{ ...SURFACE, width: 220, height: 220, display: "grid", placeItems: "center" }}>
          <ShoppingBasket size={100} color={T.vivid} strokeWidth={1.7} />
        </div>
      </div>
      {homeT < 1 && (
        <>
          <Dot x={lerp(240, 440, walk(0))} y={1018} t={shop.t} r={20} />
          <Dot x={lerp(840, 640, walk(1))} y={1018} t={shop.t} r={20} color={T.main} />
        </>
      )}
      {bubbleL.t > 0 && <div style={{ ...bubble("l"), ...bubbleL.style }}>сәлам</div>}
      {bubbleR.t > 0 && <div style={{ ...bubble("r"), ...bubbleR.style }}>сәлам</div>}
    </>
  );
};

/* ───────── 4. You meet only in another city: a flight arc, two pins meet at the far end ───────── */

const P0 = { x: 190, y: 1050 };
const P1 = { x: 870, y: 560 };
const C = { x: 260, y: 520 };
const arc = (t: number) => ({ x: (1 - t) ** 2 * P0.x + 2 * (1 - t) * t * C.x + t * t * P1.x, y: (1 - t) ** 2 * P0.y + 2 * (1 - t) * t * C.y + t * t * P1.y });
const City: React.FC<{ frame: number }> = ({ frame }) => {
  const fly = ease.inOut(progress(frame, F.meet, F.other + 30));
  const p = arc(fly);
  const q = arc(Math.min(1, fly + 0.01));
  const ang = (Math.atan2(q.y - p.y, q.x - p.x) * 180) / Math.PI + 45; // lucide plane points up-right
  const meet = springAt(frame, F.other + 30, SPRING.bouncy);
  const sub = pop(frame, F.chance - 8, SPRING.smooth);
  const km = count(frame, F.meet, F.other + 30, 0, 3000);
  const path = Array.from({ length: 41 }, (_, i) => arc(i / 40));
  return (
    <>
      <div style={{ ...HEADING, position: "absolute", top: 170, left: 60, right: 60, textAlign: "center", fontSize: 92 }}>
        <Title text="в *другом* городе" frame={frame} at={[F.cityIn + 4, F.other, F.other + 10]} size={92} top={0} style={{ left: 0, right: 0 }} />
        <div style={{ marginTop: 130, ...sub.style }}>
          <Mark frame={frame} at={F.chance + 4} color={T.main}>
            случайно
          </Mark>
        </div>
      </div>
      <svg width={W} height={1300} style={{ position: "absolute", inset: 0 }}>
        <polyline points={path.map((a) => `${a.x},${a.y}`).join(" ")} fill="none" stroke={ROAD} strokeWidth={7} strokeDasharray="4 18" strokeLinecap="round" />
        <polyline points={path.filter((_, i) => i / 40 <= fly).map((a) => `${a.x},${a.y}`).join(" ")} fill="none" stroke={T.glow} strokeWidth={7} strokeDasharray="4 18" strokeLinecap="round" />
        {meet > 0 && <circle cx={P1.x} cy={P1.y} r={40 + 80 * Math.min(meet, 1.2)} fill="none" stroke={T.glow} strokeWidth={5} opacity={Math.max(0, 1 - progress(frame, F.other + 30, F.other + 70))} />}
      </svg>
      <Dot x={P0.x} y={P0.y} t={springAt(frame, F.cityIn + 6, SPRING.bouncy)} color="#C9C4C0" r={20} />
      {fly < 1 && (
        <div style={{ position: "absolute", left: p.x - 50, top: p.y - 50, width: 100, height: 100, ...SURFACE, borderRadius: 50, display: "grid", placeItems: "center" }}>
          <Plane size={48} color={T.vivid} strokeWidth={2} style={{ transform: `rotate(${ang}deg)` }} />
        </div>
      )}
      <Dot x={P1.x - 26} y={P1.y} t={meet} r={24} />
      <Dot x={P1.x + 26} y={P1.y} t={meet} r={24} color={T.main} />
      <div style={{ position: "absolute", left: 560, top: 820, ...NUMBER, fontSize: 64, color: T.main, opacity: fly > 0 ? 1 : 0 }}>{km} км</div>
    </>
  );
};

/* ───────── 5. CTA: write your city in the comments and wave ───────── */

const COMMENTS = [
  { at: F.write + 10, city: "Казань", c: T.vivid },
  { at: F.write + 40, city: "Уфа", c: T.main },
  { at: F.city, city: "Алматы", c: T.glow },
];
const Cta: React.FC<{ frame: number }> = ({ frame }) => {
  const card = pop(frame, F.write - 10, SPRING.smooth);
  const hand = springAt(frame, F.wave - 6, SPRING.bouncy);
  const wave = Math.sin((frame - F.wave) / 5) * 18 * Math.min(hand, 1);
  return (
    <>
      <Title text="найди *своих* раньше" frame={frame} at={[F.ctaIn + 4, F.ctaIn + 16, F.earlier]} size={96} />
      <div style={{ position: "absolute", top: 440, left: 140, right: 140, ...SURFACE, padding: 44, display: "flex", flexDirection: "column", gap: 34, ...card.style }}>
        {COMMENTS.map((m) => {
          const p = pop(frame, m.at, SPRING.bouncy);
          return (
            <div key={m.city} style={{ display: "flex", alignItems: "center", gap: 26, ...p.style }}>
              <div style={{ width: 84, height: 84, borderRadius: 42, background: m.c, flex: "none" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ width: 120, height: 12, borderRadius: 6, background: "#ECEAE8" }} />
                <div style={{ ...PARAGRAPH, fontSize: 54, lineHeight: 1, fontWeight: 700 }}>{m.city}</div>
              </div>
            </div>
          );
        })}
      </div>
      {hand > 0 && (
        <div style={{ position: "absolute", left: 760, top: 900, fontSize: 150, lineHeight: 1, transform: `scale(${hand}) rotate(${wave}deg)`, transformOrigin: "70% 90%" }}>👋</div>
      )}
    </>
  );
};

/* ───────── 6. Yours are closer than it seems: the two houses slide side by side ───────── */

const Close: React.FC<{ frame: number }> = ({ frame }) => {
  const near = ease.inOut(progress(frame, F.closer - 6, F.closer + 30));
  const plate = pop(frame, F.seems, SPRING.bouncy);
  return (
    <>
      <Title text="свои *ближе* чем кажется" frame={frame} at={[F.closeIn + 2, F.closer, F.seems - 14, F.seems]} size={96} />
      <div style={{ position: "absolute", top: 1010, left: 60, right: 60, height: 16, borderRadius: 8, background: ROAD }} />
      <House x={lerp(170, 430, near)} y={1000} s={1.1} roof={T.vivid} lit={1} />
      <House x={lerp(910, 650, near)} y={1000} s={1.1} roof={T.main} lit={1} />
      {plate.t > 0 && (
        <div style={{ position: "absolute", top: 560, left: 0, right: 0, display: "flex", justifyContent: "center", ...plate.style }}>
          <div style={{ transform: "scale(2.2)" }}>
            <GlassPlate bg={PLATE.clay}>
              <MapPin size={18} strokeWidth={2.2} /> рядом
            </GlassPlate>
          </div>
        </div>
      )}
    </>
  );
};

/* ───────── Composition ───────── */

const SCENES: SceneDef[] = [
  { range: [0, F.streetsIn], El: Hook },
  { range: [F.streetsIn, F.shopIn], El: Streets },
  { range: [F.shopIn, F.cityIn], El: Shop },
  { range: [F.cityIn, F.ctaIn], El: City },
  { range: [F.ctaIn, F.closeIn], El: Cta },
  { range: [F.closeIn, F.duration + 30], El: Close },
];

const SFX: Sfx[] = [
  { src: "sfx/07_CineStrike.wav", from: 2, volume: 0.18 },
  { src: "sfx2/pop.mp3", from: F.neighbours, volume: 0.24 },
  // scene changes: textures from the SFX/ library (no whoosh)
  { src: "sfx/01_Ripple_Textures.wav", from: F.streetsIn - 8, volume: 0.18 },
  { src: "sfx/04_Cyber_Shift.wav", from: F.shopIn - 8, volume: 0.2 },
  { src: "sfx/06_Ripple_Textures_II.wav", from: F.cityIn - 8, volume: 0.2 },
  { src: "sfx/02_Alienated_Warpes.wav", from: F.ctaIn - 8, volume: 0.14 },
  { src: "sfx/01_Ripple_Textures.wav", from: F.closeIn - 8, volume: 0.18 },
  // 2. pins, distance
  { src: "sfx2/pop.mp3", from: F.live - 8, volume: 0.24 },
  { src: "sfx2/pop.mp3", from: F.live + 6, volume: 0.22 },
  { src: "sfx2/click.mp3", from: F.streets + 32, volume: 0.2 },
  // 3. shop, hello bubbles
  { src: "sfx2/pop.mp3", from: F.shopIn + 6, volume: 0.22 },
  { src: "sfx2/pop.mp3", from: F.tatar - 6, volume: 0.24 },
  { src: "sfx2/pop.mp3", from: F.tatar + 14, volume: 0.22 },
  // 4. landing, meet
  { src: "sfx/03_Basscrack.wav", from: F.other + 30, volume: 0.1 },
  // 5. comments, wave
  ...COMMENTS.map((m) => ({ src: "sfx2/click.mp3", from: m.at + 2, volume: 0.2 })),
  { src: "sfx2/ding.mp3", from: F.wave - 4, volume: 0.22 },
  // 6. closer
  { src: "sfx/07_CineStrike.wav", from: F.seems, volume: 0.12 },
];

// All 30 poses of the Alicja set, each at least once; a swap every ~0.6 s by the meaning of the line, never the same photo twice in a row
const AVATAR_KEYS: AvatarKey[] = [
  // 1. hook
  { at: 0, e: "explaining" },
  { at: 40, e: "point-up" },
  { at: 80, e: "displeased" },
  { at: 122, e: "surprised" },
  // 2. next streets
  { at: F.streetsIn, e: "thinking" },
  { at: 205, e: "shush" },
  { at: 245, e: "point-right" },
  { at: 285, e: "point-down" },
  { at: 318, e: "listening" },
  // 3. shop, home
  { at: F.shopIn, e: "smile-up" },
  { at: 388, e: "soft-smile" },
  { at: 430, e: "hand-on-heart" },
  { at: 470, e: "delighted" },
  { at: 510, e: "thumbs-up" },
  // 4. another city, by chance
  { at: F.cityIn, e: "puzzled" },
  { at: 590, e: "shrug" },
  { at: 628, e: "arms-crossed" },
  { at: 665, e: "skeptical" },
  { at: 700, e: "facepalm" },
  { at: 730, e: "disappointed" },
  // 5. CTA
  { at: F.ctaIn, e: "stop" },
  { at: 790, e: "inspired" },
  { at: 830, e: "victory" },
  { at: 868, e: "pensive" },
  { at: 905, e: "dreamy" },
  { at: 945, e: "waving" },
  { at: 990, e: "laughing" },
  // 6. closer
  { at: F.closeIn, e: "heart-hands" },
  { at: 1062, e: "clapping" },
  { at: 1100, e: "present-left" },
];

const STANCES: StanceKey[] = [
  { at: 0, s: "center" },
  { at: F.streetsIn, s: "right" },
  { at: F.shopIn, s: "left" },
  { at: F.cityIn, s: "right" },
  { at: F.ctaIn, s: "left" },
  { at: F.closeIn, s: "center" },
];

// Alicja photos: scale the wide-framed ones so every photo fills the 540x590 box by height (same as V21-V23)
const SIZE: Record<string, [number, number]> = {
  pensive: [1129, 1393], dreamy: [1293, 1216], displeased: [1254, 1254], surprised: [1280, 1229], waving: [1312, 1199], inspired: [1199, 1312], explaining: [1312, 1199], delighted: [1312, 1199], skeptical: [1312, 1199], laughing: [1385, 1136],
  puzzled: [1129, 1393], disappointed: [1278, 1230], "smile-up": [1199, 1312], thinking: [1129, 1393], "soft-smile": [1164, 1351], "point-up": [1312, 1199], "point-down": [1312, 1199], "present-left": [1312, 1199], "point-right": [1312, 1199], shrug: [1312, 1199],
  "hand-on-heart": [1312, 1199], stop: [1312, 1199], shush: [1199, 1312], clapping: [1312, 1199], "thumbs-up": [1312, 1199], "arms-crossed": [1199, 1312], facepalm: [1312, 1199], "heart-hands": [1312, 1199], victory: [1312, 1199], listening: [1312, 1199],
};
const FIT = Object.fromEntries(Object.entries(SIZE).map(([e, [w, h]]) => [e, Math.max(1, w / h / (540 / 590))])) as Partial<Record<Emotion, number>>;

const Host: React.FC<{ frame: number }> = ({ frame }) => <TatAvatar frame={frame} keys={AVATAR_KEYS} words={WORDS} stances={STANCES} dir="v25/avatar" fit={FIT} />;

export const Video25: React.FC = () => (
  <AbsoluteFill style={{ background: "#fff", fontFamily: PARAGRAPH.fontFamily, color: INK }}>
    <ReelShell scenes={SCENES} headlines={[]} vo={VO} sfx={SFX} duration={F.duration} music="v25/music/bed.mp3" musicLevel={[0.045, 0.11]} overlay={Host} bg={BG} />
  </AbsoluteFill>
);
