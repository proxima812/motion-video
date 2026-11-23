import React from "react";
import { AbsoluteFill } from "remotion";
import { Languages, MessageCircle } from "lucide-react";
import { SPRING, ease, lerp, progress, springAt } from "../stage/motion";
import { ReelShell, pop, shake, type SceneDef, type Sfx } from "../kit/reel";
import { TatAvatar, type AvatarKey, type Emotion, type StanceKey } from "../kit/TatAvatar";
import { DotOrbitBg } from "../kit/DotOrbitBg";
import { HEADING, INK, NUMBER, PARAGRAPH, SURFACE } from "../kit/design";
import { GlassPlate } from "../catalog/own/glass";
import { F, VO } from "./timeline";
import { WORDS } from "./words";

// "Перевод убил шутку" (@the_tatarverse, RU, host preset 2 Alicja). 20.7 s.
// Tatar humor can't be translated -> in Tatar the whole table laughed -> in Russian: five minutes of explaining, nobody laughed -> some jokes live only in their own language -> write an untranslatable Tatar phrase -> let's laugh together, no translation.
// Own kit only. Palette: sunflower (joy, laughter). Dot Orbit variant 1 (output/bg-variant.txt).
const T = { main: "#8C6D00", vivid: "#D9A800", glow: "#F5DC7A", pale: "#FEF8DD" };
const PLATE_SUN = "linear-gradient(135deg, #D9A800, #8C6D00)";
const BG = <DotOrbitBg variant={1} />;
const GRAY = "#E9E6DC";
const GRAY2 = "#F2F0EA";

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

/** Round face: `laugh` 0..1 morphs from a flat face (dot eyes, straight mouth) to a laughing one (^^ eyes, open mouth) */
const Face: React.FC<{ size: number; laugh: number; color: string }> = ({ size, laugh, color }) => {
  const l = Math.max(0, Math.min(1, laugh));
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: "block" }}>
      <circle cx={50} cy={50} r={46} fill={color} stroke="#fff" strokeWidth={5} />
      {l > 0.5 ? (
        <>
          <path d="M26 42 Q 33 32 40 42" fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />
          <path d="M60 42 Q 67 32 74 42" fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />
          <path d={`M28 58 Q 50 ${58 + 30 * l} 72 58 Z`} fill={INK} />
          <path d={`M38 ${62 + 12 * l} Q 50 ${66 + 16 * l} 62 ${62 + 12 * l}`} fill="none" stroke="#E87A6A" strokeWidth={5} strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx={34} cy={42} r={5} fill={INK} />
          <circle cx={66} cy={42} r={5} fill={INK} />
          <path d={`M34 66 Q 50 ${66 + 10 * l} 66 66`} fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />
        </>
      )}
    </svg>
  );
};

const FACE_COLORS = [T.glow, T.vivid, T.pale, T.glow, T.vivid, T.pale];

/* ───────── 1. Hook: the translator machine eats a laughing joke and spits out a flat one ───────── */

const Card: React.FC<{ laugh: number; frame: number }> = ({ laugh, frame }) => (
  <div style={{ ...SURFACE, width: 230, height: 270, padding: 30, boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
    <div style={{ transform: `rotate(${laugh > 0.5 ? Math.sin(frame / 4) * 8 : 0}deg)` }}>
      <Face size={120} laugh={laugh} color={laugh > 0.5 ? T.vivid : GRAY} />
    </div>
    <div style={{ width: 150, height: 16, borderRadius: 8, background: laugh > 0.5 ? T.glow : GRAY }} />
    <div style={{ width: 100, height: 14, borderRadius: 7, background: GRAY2 }} />
  </div>
);

const Hook: React.FC<{ frame: number }> = ({ frame }) => {
  const first = fadeOut(frame, F.it - 14);
  const machine = pop(frame, 6, SPRING.smooth);
  const feed = ease.inOut(progress(frame, F.humor - 10, F.humor + 30));
  const churn = progress(frame, F.humor + 20, F.translate);
  const out = ease.out(progress(frame, F.translate - 6, F.translate + 26));
  const s = shake(frame, F.humor + 30, 6, F.translate - F.humor - 30);
  const puff = progress(frame, F.translate, F.translate + 40);
  const MY = 640;
  return (
    <>
      {first > 0 && <Title text="вся правда *о татарском юморе*" frame={frame} at={[-30, F.truth, F.tatar, F.humor]} size={88} style={{ opacity: first }} />}
      {frame >= F.it - 8 && <Title text="его *невозможно перевести*" frame={frame} at={[F.it - 4, F.impossible, F.translate]} size={92} />}
      {/* the joke card goes in from the left */}
      <div style={{ position: "absolute", left: lerp(60, 330, feed), top: MY + 40, opacity: 1 - progress(frame, F.humor + 22, F.humor + 30), transform: `scale(${lerp(1, 0.6, feed)})` }}>
        <Card laugh={1} frame={frame} />
      </div>
      <div style={{ position: "absolute", left: 330, top: MY, width: 420, height: 420, ...machine.style, transform: `${machine.style.transform} translateX(${s}px)` }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: 50, background: `linear-gradient(160deg, ${T.vivid}, ${T.main})`, boxShadow: SURFACE.boxShadow }} />
        <div style={{ position: "absolute", left: -14, top: 120, width: 28, height: 180, borderRadius: 14, background: INK }} />
        <div style={{ position: "absolute", right: -14, top: 120, width: 28, height: 180, borderRadius: 14, background: INK }} />
        <div style={{ position: "absolute", left: 40, right: 40, top: 40, height: 90, borderRadius: 24, background: "rgba(255,255,255,0.92)", display: "flex", alignItems: "center", justifyContent: "center", gap: 30 }}>
          <span style={{ ...NUMBER, fontSize: 52, color: T.main }}>TT</span>
          <svg width={70} height={30} viewBox="0 0 70 30">
            <path d="M2 15 H60 M48 4 L62 15 L48 26" fill="none" stroke={T.main} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ ...NUMBER, fontSize: 52, color: T.main }}>RU</span>
        </div>
        {/* gears */}
        {[
          { x: 140, y: 270, r: 70, d: 1 },
          { x: 270, y: 290, r: 52, d: -1.35 },
        ].map((g, k) => (
          <svg key={k} width={g.r * 2 + 30} height={g.r * 2 + 30} viewBox={`${-g.r - 15} ${-g.r - 15} ${g.r * 2 + 30} ${g.r * 2 + 30}`} style={{ position: "absolute", left: g.x - g.r - 15, top: g.y - g.r - 15, transform: `rotate(${(frame * 2 + churn * 600) * g.d}deg)` }}>
            {Array.from({ length: 10 }, (_, i) => (
              <rect key={i} x={-9} y={-g.r - 12} width={18} height={24} rx={4} fill={T.pale} transform={`rotate(${i * 36})`} />
            ))}
            <circle r={g.r} fill={T.pale} />
            <circle r={g.r * 0.35} fill={T.vivid} />
          </svg>
        ))}
        {puff > 0 &&
          [0, 1, 2].map((k) => (
            <div key={k} style={{ position: "absolute", left: 300 + k * 30, top: -30 - puff * 120 - k * 20, width: 50 + puff * 40, height: 50 + puff * 40, borderRadius: "50%", background: GRAY, opacity: (1 - puff) * 0.9 }} />
          ))}
      </div>
      {/* a flat one comes out on the right */}
      {out > 0 && (
        <div style={{ position: "absolute", left: lerp(640, 790, out), top: MY + 60, transform: `scale(${lerp(0.5, 0.95, out)}) rotate(${out * 6}deg)`, opacity: Math.min(1, out * 3) }}>
          <Card laugh={0} frame={frame} />
        </div>
      )}
    </>
  );
};

/* ───────── 2. In Tatar the whole table laughed: a row of faces bouncing with laughter ───────── */

const Table: React.FC<{ frame: number }> = ({ frame }) => {
  const laugh = progress(frame, F.laughed - 8, F.laughed + 4);
  const all = springAt(frame, F.whole, SPRING.bouncy);
  return (
    <>
      <Title text="смеялся *весь стол*" frame={frame} at={[F.laughed, F.whole]} size={96} />
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const row = i < 3 ? 0 : 1;
        const col = i % 3;
        const p = springAt(frame, F.tableIn + 6 + i * 5, SPRING.bouncy);
        const bob = laugh * Math.abs(Math.sin(frame / 5 + i * 1.3)) * 26;
        const x = 160 + col * 270 + (row ? 135 : 0) - (row ? 135 : 0);
        const y = row ? 700 : 470;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y - bob, transform: `scale(${p * (1 + 0.05 * Math.min(all, 1))}) rotate(${laugh * Math.sin(frame / 6 + i) * 6}deg)` }}>
            <Face size={220} laugh={laugh} color={FACE_COLORS[i]} />
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 100, right: 100, top: 960, height: 70, borderRadius: 35, background: T.main, boxShadow: SURFACE.boxShadow }} />
      <div style={{ position: "absolute", left: 150, right: 150, top: 1030, height: 120, borderRadius: "0 0 40px 40px", background: T.glow }} />
      {/* laughter sparks */}
      {laugh > 0 &&
        Array.from({ length: 8 }, (_, k) => {
          const r = ((frame - F.laughed) / 40 + k / 8) % 1;
          const a = (k / 8) * Math.PI * 2;
          return <div key={k} style={{ position: "absolute", left: 540 + Math.cos(a) * (300 + r * 160) - 10, top: 700 + Math.sin(a) * (220 + r * 120) - 10, width: 20, height: 20, borderRadius: 10, background: T.vivid, opacity: (1 - r) * laugh }} />;
        })}
    </>
  );
};

/* ───────── 3. In Russian: a whiteboard of explanations, a 5-minute timer, nobody laughs ───────── */

const Explain: React.FC<{ frame: number }> = ({ frame }) => {
  const t1 = fadeOut(frame, F.five - 12);
  const t2 = frame >= F.five - 6 ? fadeOut(frame, F.nobody - 12) : 0;
  const board = pop(frame, F.ruIn + 4, SPRING.smooth);
  const draw = (a: number, b: number) => ease.inOut(progress(frame, a, b));
  const secs = Math.round(lerp(0, 300, ease.inOut(progress(frame, F.five - 4, F.minutes + 40))));
  const timer = pop(frame, F.five - 6, SPRING.bouncy);
  const faces = pop(frame, F.nobody - 6, SPRING.smooth);
  return (
    <>
      {t1 > 0 && <Title text="на русском *объяснять*" frame={frame} at={[F.russian - 4, F.russian + 2, F.explain]} size={100} style={{ opacity: t1 }} />}
      {t2 > 0 && <Title text="*пять минут*" frame={frame} at={[F.five, F.minutes]} size={110} style={{ opacity: t2 }} />}
      {frame >= F.nobody - 8 && <Title text="никто *не засмеялся*" frame={frame} at={[F.nobody - 4, F.notLaughed - 4, F.notLaughed]} size={100} />}
      <div style={{ position: "absolute", left: 100, right: 100, top: 400, height: 470, ...SURFACE, borderRadius: 36, border: `8px solid ${GRAY}`, boxSizing: "border-box", ...board.style }}>
        <svg width={864} height={454} viewBox="0 0 864 454" style={{ position: "absolute", inset: 0 }}>
          {[
            { d: "M60 90 H260 V190 H60 Z", a: F.ruIn + 14, b: F.ruIn + 40 },
            { d: "M260 140 C 330 140 340 80 410 80", a: F.had, b: F.had + 20 },
            { d: "M410 40 H620 V130 H410 Z", a: F.had + 16, b: F.explain },
            { d: "M520 130 V 240 M500 220 L520 245 L540 220", a: F.explain, b: F.explain + 20 },
            { d: "M380 250 H680 V360 H380 Z", a: F.explain + 14, b: F.explain + 40 },
            { d: "M160 190 C 160 320 260 330 380 310", a: F.explain + 30, b: F.five },
            { d: "M720 60 Q 790 120 720 180 Q 650 240 720 300", a: F.five - 10, b: F.minutes + 20 },
          ].map((p, k) => (
            <path key={k} d={p.d} fill="none" stroke={k % 3 === 2 ? T.vivid : INK} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw(p.a, p.b)} />
          ))}
          {[[90, 120, 140], [440, 70, 150], [410, 285, 230]].map(([x, y, w], k) => (
            <rect key={k} x={x} y={y} width={w * draw(F.explain + k * 10, F.explain + k * 10 + 24)} height={14} rx={7} fill={T.glow} />
          ))}
        </svg>
      </div>
      {timer.t > 0 && (
        <div style={{ position: "absolute", right: 120, top: 830, ...timer.style }}>
          <div style={{ ...SURFACE, borderRadius: 40, padding: "24px 36px", display: "flex", alignItems: "center", gap: 18 }}>
            <svg width={56} height={56} viewBox="0 0 56 56">
              <circle cx={28} cy={28} r={23} fill="none" stroke={T.glow} strokeWidth={6} />
              <path d={`M28 28 L ${28 + Math.sin(secs / 30) * 16} ${28 - Math.cos(secs / 30) * 16}`} stroke={T.main} strokeWidth={6} strokeLinecap="round" />
            </svg>
            <span style={{ ...NUMBER, fontSize: 64, color: T.main }}>
              {String(Math.floor(secs / 60)).padStart(2, "0")}:{String(secs % 60).padStart(2, "0")}
            </span>
          </div>
        </div>
      )}
      {faces.t > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 990, display: "flex", justifyContent: "center", gap: 30, ...faces.style }}>
          {[0, 1, 2, 3].map((i) => (
            <Face key={i} size={150} laugh={0} color={GRAY} />
          ))}
        </div>
      )}
    </>
  );
};

/* ───────── 4. Some jokes live only in their own language: a joke creature in its own glass globe ───────── */

const Globe: React.FC<{ frame: number }> = ({ frame }) => {
  const g = pop(frame, F.liveIn + 4, SPRING.smooth);
  const swim = (frame - F.liveIn) / 30;
  const cx = 540 + Math.sin(swim) * 110;
  const cy = 700 + Math.sin(swim * 1.7) * 50;
  const happy = springAt(frame, F.live, SPRING.bouncy);
  return (
    <>
      <Title text="шутки живут *в своем языке*" frame={frame} at={[F.jokes, F.live, F.own, F.language]} size={96} />
      <div style={{ position: "absolute", inset: 0, ...g.style }}>
        <div style={{ position: "absolute", left: 540 - 300, top: 420, width: 600, height: 560, borderRadius: "50% 50% 46% 46%", background: `radial-gradient(circle at 35% 30%, #fff, ${T.pale} 60%, ${T.glow})`, border: `8px solid ${T.glow}`, boxSizing: "border-box", boxShadow: SURFACE.boxShadow, overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 120, background: T.glow, opacity: 0.6 }} />
          <div style={{ position: "absolute", left: 70, top: 60, width: 60, height: 200, borderRadius: 30, background: "rgba(255,255,255,0.7)", transform: "rotate(18deg)" }} />
        </div>
        {/* bubbles */}
        {Array.from({ length: 6 }, (_, k) => {
          const r = ((frame / 70 + k / 6) % 1 + 1) % 1;
          return <div key={k} style={{ position: "absolute", left: 360 + k * 70 + Math.sin(r * 8 + k) * 12, top: 920 - r * 420, width: 18 + (k % 3) * 8, height: 18 + (k % 3) * 8, borderRadius: "50%", border: `4px solid ${T.vivid}`, opacity: (1 - r) * 0.7 }} />;
        })}
        <div style={{ position: "absolute", left: cx - 90, top: cy - 90, transform: `scale(${0.8 + 0.2 * Math.min(happy, 1)}) rotate(${Math.sin(swim * 2) * 12}deg)` }}>
          <svg width={180} height={180} viewBox="0 0 100 100">
            <path d="M50 4 L61 34 L94 36 L68 56 L77 90 L50 71 L23 90 L32 56 L6 36 L39 34 Z" fill={T.vivid} stroke={T.main} strokeWidth={3} strokeLinejoin="round" />
            <path d="M38 46 Q 42 40 46 46" fill="none" stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
            <path d="M54 46 Q 58 40 62 46" fill="none" stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
            <path d="M40 54 Q 50 66 60 54 Z" fill={INK} />
          </svg>
        </div>
        <div style={{ position: "absolute", left: 540 - 220, top: 960, width: 440, height: 110, borderRadius: 30, background: `linear-gradient(135deg, ${T.vivid}, ${T.main})`, display: "grid", placeItems: "center", boxShadow: SURFACE.boxShadow }}>
          <span style={{ ...NUMBER, fontSize: 60, color: "#fff" }}>TT</span>
        </div>
      </div>
    </>
  );
};

/* ───────── 5. Write the untranslatable phrase: a comment card gets a big stamp ───────── */

const Stamp: React.FC<{ frame: number }> = ({ frame }) => {
  const card = pop(frame, F.ctaIn + 6, SPRING.smooth);
  const typed = ease.out(progress(frame, F.tatarPhrase - 6, F.phrase + 30));
  const down = progress(frame, F.cant - 14, F.cant);
  const up = progress(frame, F.cant + 10, F.cant + 30);
  const hit = frame >= F.cant;
  const s = shake(frame, F.cant, 8, 14);
  const plate = pop(frame, F.translated + 10, SPRING.bouncy);
  const sy = lerp(-260, 0, ease.in(down)) - up * 300;
  return (
    <>
      <Title text="напиши *непереводимое*" frame={frame} at={[F.write, F.cant - 30]} size={96} />
      <div style={{ position: "absolute", left: 100, right: 100, top: 470, ...card.style, transform: `${card.style.transform} translateX(${s}px)` }}>
        <div style={{ ...SURFACE, borderRadius: 40, padding: 44, display: "flex", flexDirection: "column", gap: 26, position: "relative", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <div style={{ width: 90, height: 90, borderRadius: 45, background: `linear-gradient(135deg, ${T.glow}, ${T.vivid})` }} />
            <div style={{ width: 220, height: 22, borderRadius: 11, background: GRAY }} />
          </div>
          <div style={{ height: 120, borderRadius: 30, background: T.pale, display: "flex", alignItems: "center", gap: 20, padding: "0 34px" }}>
            <div style={{ width: 300 * typed, height: 28, borderRadius: 14, background: T.main }} />
            <div style={{ width: 160 * Math.max(0, typed * 2 - 1), height: 28, borderRadius: 14, background: T.vivid }} />
          </div>
          {hit && (
            <div style={{ position: "absolute", right: 60, top: 40, width: 220, height: 220, borderRadius: 110, border: `10px solid ${T.vivid}`, boxSizing: "border-box", display: "grid", placeItems: "center", transform: `rotate(-14deg) scale(${1 + 0.2 * (1 - progress(frame, F.cant, F.cant + 6))})`, opacity: 0.85 }}>
              <div style={{ width: 160, height: 160, borderRadius: 80, border: `5px dashed ${T.vivid}`, boxSizing: "border-box", display: "grid", placeItems: "center" }}>
                <svg width={110} height={50} viewBox="0 0 110 50">
                  <path d="M30 25 C 30 5 50 5 55 25 C 60 45 80 45 80 25 C 80 5 60 5 55 25 C 50 45 30 45 30 25 Z" fill="none" stroke={T.vivid} strokeWidth={8} />
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>
      {up < 1 && down > 0 && (
        <div style={{ position: "absolute", right: 150, top: 450 + sy, width: 200, height: 240 }}>
          <div style={{ position: "absolute", left: 70, top: 0, width: 60, height: 120, borderRadius: 30, background: T.main }} />
          <div style={{ position: "absolute", left: 10, top: 110, width: 180, height: 60, borderRadius: 20, background: T.vivid }} />
          <div style={{ position: "absolute", left: 0, top: 170, width: 200, height: 40, borderRadius: 10, background: INK }} />
        </div>
      )}
      {plate.t > 0 && (
        <div style={{ position: "absolute", top: 960, left: 0, right: 0, display: "flex", justifyContent: "center", ...plate.style }}>
          <div style={{ transform: "scale(2.2)", transformOrigin: "50% 0" }}>
            <GlassPlate bg={PLATE_SUN}>
              <MessageCircle size={18} strokeWidth={2.4} /> в комментарии
            </GlassPlate>
          </div>
        </div>
      )}
    </>
  );
};

/* ───────── 6. Laugh together: a wave of laughter runs through a crowd of faces ───────── */

const Together: React.FC<{ frame: number }> = ({ frame }) => {
  const plate = pop(frame, F.without - 6, SPRING.bouncy);
  const COLS = 5;
  const ROWS = 3;
  return (
    <>
      <Title text="посмеемся *вместе*" frame={frame} at={[F.laugh, F.together]} size={104} />
      {Array.from({ length: COLS * ROWS }, (_, i) => {
        const c = i % COLS;
        const r = Math.floor(i / COLS);
        const x = 130 + c * 165 + (r % 2 ? 40 : 0);
        const y = 420 + r * 190;
        const d = Math.hypot(c - 2, r - 1);
        const p = springAt(frame, F.laughIn + 4 + i * 2, SPRING.bouncy);
        const lg = progress(frame, F.laugh + 10 + d * 10, F.laugh + 18 + d * 10);
        const bob = lg * Math.abs(Math.sin(frame / 5 + i)) * 18;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y - bob, transform: `scale(${p})` }}>
            <Face size={150} laugh={lg} color={lg > 0.5 ? FACE_COLORS[i % 6] : GRAY} />
          </div>
        );
      })}
      {plate.t > 0 && (
        <div style={{ position: "absolute", top: 1030, left: 0, right: 0, display: "flex", justifyContent: "center", ...plate.style }}>
          <div style={{ transform: "scale(2.2)", transformOrigin: "50% 0" }}>
            <GlassPlate bg={PLATE_SUN}>
              <Languages size={18} strokeWidth={2.4} /> без перевода
            </GlassPlate>
          </div>
        </div>
      )}
    </>
  );
};

/* ───────── Composition ───────── */

const SCENES: SceneDef[] = [
  { range: [0, F.tableIn], El: Hook },
  { range: [F.tableIn, F.ruIn], El: Table },
  { range: [F.ruIn, F.liveIn], El: Explain },
  { range: [F.liveIn, F.ctaIn], El: Globe },
  { range: [F.ctaIn, F.laughIn], El: Stamp },
  { range: [F.laughIn, F.duration + 30], El: Together },
];

const SFX: Sfx[] = [
  { src: "sfx/07_CineStrike.wav", from: 2, volume: 0.16 },
  { src: "sfx2/click.mp3", from: F.humor + 20, volume: 0.2 },
  { src: "sfx/05_Distortion_Glitch.wav", from: F.translate - 4, volume: 0.05 },
  { src: "sfx2/pop.mp3", from: F.translate + 4, volume: 0.2 },
  // scene changes: textures from the SFX/ library (no whoosh)
  { src: "sfx/01_Ripple_Textures.wav", from: F.tableIn - 8, volume: 0.18 },
  { src: "sfx/02_Alienated_Warpes.wav", from: F.ruIn - 8, volume: 0.14 },
  { src: "sfx/06_Ripple_Textures_II.wav", from: F.liveIn - 8, volume: 0.2 },
  { src: "sfx/04_Cyber_Shift.wav", from: F.ctaIn - 8, volume: 0.2 },
  { src: "sfx/01_Ripple_Textures.wav", from: F.laughIn - 8, volume: 0.18 },
  // 2. the table laughs
  { src: "sfx2/ding.mp3", from: F.laughed - 6, volume: 0.18 },
  // 3. timer, flat faces
  { src: "sfx2/click.mp3", from: F.five - 4, volume: 0.2 },
  { src: "sfx/03_Basscrack.wav", from: F.notLaughed, volume: 0.1 },
  // 4. globe
  { src: "sfx2/pop.mp3", from: F.live, volume: 0.18 },
  // 5. stamp
  { src: "sfx/07_CineStrike.wav", from: F.cant, volume: 0.14 },
  { src: "sfx2/pop.mp3", from: F.translated + 10, volume: 0.24 },
  // 6. laughter wave
  { src: "sfx2/ding.mp3", from: F.laugh + 12, volume: 0.18 },
  { src: "sfx2/pop.mp3", from: F.without - 6, volume: 0.22 },
];

// All 30 poses of the Alicja set, each at least once, by the meaning of the line; never the same photo twice in a row
const AVATAR_KEYS: AvatarKey[] = [
  // 1. hook: the truth about Tatar humor
  { at: 0, e: "point-up" },
  { at: 35, e: "arms-crossed" },
  { at: 75, e: "explaining" },
  { at: 110, e: "smile-up" },
  { at: 145, e: "skeptical" },
  { at: 185, e: "shrug" },
  { at: 215, e: "puzzled" },
  // 2. the table laughed
  { at: F.tableIn, e: "laughing" },
  { at: 290, e: "delighted" },
  { at: 335, e: "clapping" },
  { at: 365, e: "heart-hands" },
  // 3. explaining in Russian, nobody laughed
  { at: F.ruIn, e: "present-left" },
  { at: 440, e: "point-right" },
  { at: 480, e: "pensive" },
  { at: 520, e: "disappointed" },
  { at: 565, e: "facepalm" },
  { at: 610, e: "displeased" },
  // 4. jokes live in their own language
  { at: F.liveIn, e: "dreamy" },
  { at: 700, e: "hand-on-heart" },
  { at: 745, e: "inspired" },
  { at: 790, e: "soft-smile" },
  // 5. write an untranslatable phrase
  { at: F.ctaIn, e: "point-down" },
  { at: 870, e: "listening" },
  { at: 910, e: "thinking" },
  { at: 955, e: "shush" },
  { at: 1000, e: "surprised" },
  { at: 1030, e: "thumbs-up" },
  // 6. laugh together
  { at: F.laughIn, e: "waving" },
  { at: 1095, e: "victory" },
  { at: 1140, e: "stop" },
  { at: 1185, e: "laughing" },
];

const STANCES: StanceKey[] = [
  { at: 0, s: "center" },
  { at: F.tableIn, s: "right" },
  { at: F.ruIn, s: "left" },
  { at: F.liveIn, s: "right" },
  { at: F.ctaIn, s: "left" },
  { at: F.laughIn, s: "center" },
];

// Alicja set photos: scale the wide-framed ones so every photo fills the 540x590 box by height (same as V37)
const SIZE: Record<string, [number, number]> = {
  pensive: [1129, 1393], dreamy: [1293, 1216], displeased: [1254, 1254], surprised: [1280, 1229], waving: [1312, 1199], inspired: [1199, 1312], explaining: [1312, 1199], delighted: [1312, 1199], skeptical: [1312, 1199], laughing: [1385, 1136],
  puzzled: [1129, 1393], disappointed: [1278, 1230], "smile-up": [1199, 1312], thinking: [1129, 1393], "soft-smile": [1164, 1351], "point-up": [1312, 1199], "point-down": [1312, 1199], "present-left": [1312, 1199], "point-right": [1312, 1199], shrug: [1312, 1199],
  "hand-on-heart": [1312, 1199], stop: [1312, 1199], shush: [1199, 1312], clapping: [1312, 1199], "thumbs-up": [1312, 1199], "arms-crossed": [1199, 1312], facepalm: [1312, 1199], "heart-hands": [1312, 1199], victory: [1312, 1199], listening: [1312, 1199],
};
const FIT = Object.fromEntries(Object.entries(SIZE).map(([e, [w, h]]) => [e, Math.max(1, w / h / (540 / 590))])) as Partial<Record<Emotion, number>>;

const Host: React.FC<{ frame: number }> = ({ frame }) => <TatAvatar frame={frame} keys={AVATAR_KEYS} words={WORDS} stances={STANCES} dir="v43/avatar" fit={FIT} />;

export const Video43: React.FC = () => (
  <AbsoluteFill style={{ background: "#fff", fontFamily: PARAGRAPH.fontFamily, color: INK }}>
    <ReelShell scenes={SCENES} headlines={[]} vo={VO} sfx={SFX} duration={F.duration} music="v43/music/bed.mp3" musicLevel={[0.045, 0.11]} overlay={Host} bg={BG} />
  </AbsoluteFill>
);
