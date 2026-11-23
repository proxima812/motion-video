import React from "react";
import { AbsoluteFill } from "remotion";
import { CalendarHeart } from "lucide-react";
import { SPRING, ease, lerp, progress, springAt } from "../stage/motion";
import { ReelShell, pop, shake, type SceneDef, type Sfx } from "../kit/reel";
import { TatAvatar, type AvatarKey, type Emotion, type StanceKey } from "../kit/TatAvatar";
import { DotOrbitBg } from "../kit/DotOrbitBg";
import { HEADING, INK, NUMBER, PARAGRAPH, SURFACE } from "../kit/design";
import { GlassPlate } from "../catalog/own/glass";
import { F, VO } from "./timeline";
import { WORDS } from "./words";

// "Рецепт без граммов" (@the_tatarverse, RU, main host preset Ahu). 21 s.
// Grandma's recipes have no grams -> flour "so the dough works" -> salt "by eye, кызым" -> can't be copied, only repeated next to her -> cook one dish this weekend and film it -> the taste stays in the family.
// Own kit only. Palette: olive (kitchen, herbs, home cooking). Dot Orbit variant 4 (output/bg-variant.txt).
const T = { main: "#5E6B12", vivid: "#8A9A1E", glow: "#D3DC8E", pale: "#F5F8E1" };
const PLATE_OLIVE = "linear-gradient(135deg, #8A9A1E, #5E6B12)";
const BG = <DotOrbitBg variant={4} />;
const GRAY = "#E7E8E0";

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

/** Grandma, drawn: round face, headscarf, eyes (`wink` 0..1 closes the right eye) */
const Grandma: React.FC<{ size: number; frame: number; wink?: number }> = ({ size, frame, wink = 0 }) => {
  const blink = Math.abs(((frame + 20) % 160) - 80) < 3 ? 0.15 : 1;
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" style={{ flex: "none" }}>
      <path d="M10 70 Q 10 8 60 8 Q 110 8 110 70 L 118 112 Q 60 96 2 112 Z" fill={T.vivid} />
      <circle cx={60} cy={64} r={36} fill={T.pale} />
      <path d="M24 52 Q 60 18 96 52 Q 60 36 24 52 Z" fill={T.main} />
      <ellipse cx={47} cy={64} rx={4.5} ry={4.5 * blink} fill={INK} />
      {wink > 0.5 ? <path d="M66 64 Q 73 58 80 64" fill="none" stroke={INK} strokeWidth={3.5} strokeLinecap="round" /> : <ellipse cx={73} cy={64} rx={4.5} ry={4.5 * blink} fill={INK} />}
      <path d="M48 80 Q 60 89 72 80" fill="none" stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
      <circle cx={38} cy={76} r={6} fill={T.glow} opacity={0.8} />
      <circle cx={82} cy={76} r={6} fill={T.glow} opacity={0.8} />
    </svg>
  );
};

/** Grandma's answer: her face + a quote bubble */
const Answer: React.FC<{ frame: number; at: number; wink?: number; children: React.ReactNode; top?: number }> = ({ frame, at, wink, children, top = 960 }) => {
  const p = pop(frame, at, SPRING.bouncy);
  return (
    <div style={{ position: "absolute", left: 100, right: 100, top, display: "flex", alignItems: "center", gap: 28, ...p.style }}>
      <Grandma size={170} frame={frame} wink={wink} />
      <div style={{ position: "relative", ...SURFACE, borderRadius: 40, padding: "34px 40px", flex: 1 }}>
        <svg width={34} height={40} style={{ position: "absolute", left: -26, top: 56 }}>
          <path d="M34 0 V40 L0 20 Z" fill="#fff" />
        </svg>
        <span style={{ ...PARAGRAPH, fontSize: 56, lineHeight: 1.1, display: "block" }}>{children}</span>
      </div>
    </div>
  );
};

/* ───────── 1. Hook: a kitchen scale under grandma's bowl can't settle on a number ───────── */

const Hook: React.FC<{ frame: number }> = ({ frame }) => {
  const first = fadeOut(frame, F.grandmas - 14);
  const scale = pop(frame, 6, SPRING.smooth);
  const bowl = springAt(frame, F.grandmas - 4, SPRING.bouncy);
  const lost = frame >= F.grams - 2;
  const s = shake(frame, F.grams, 12, 22);
  const flick = frame >= F.recipes - 6 && !lost ? String(100 + ((frame * 7919) % 900)) : "0";
  const blink = Math.floor(frame / 12) % 2;
  return (
    <>
      {first > 0 && <Title text="никто об этом *не говорит*" frame={frame} at={[-30, -24, -18, F.not - 4, F.talks]} size={92} style={{ opacity: first }} />}
      {frame >= F.grandmas - 8 && <Title text="бабушкины рецепты без *граммов*" frame={frame} at={[F.grandmas - 4, F.recipes, F.written, F.grams]} size={92} />}
      <div style={{ position: "absolute", left: 190, top: 470, width: 700, height: 720, ...scale.style }}>
        {/* the bowl lands on the scale */}
        <svg width={460} height={230} viewBox="0 0 460 230" style={{ position: "absolute", left: 120, top: 40 - (1 - Math.min(bowl, 1)) * 300, opacity: Math.min(1, bowl * 2) }}>
          <ellipse cx={230} cy={60} rx={180} ry={34} fill={T.glow} />
          <path d="M40 60 H420 Q 410 200 230 210 Q 50 200 40 60 Z" fill={T.vivid} />
          <path d="M80 92 Q 230 120 380 92" fill="none" stroke={T.glow} strokeWidth={10} strokeLinecap="round" opacity={0.7} />
        </svg>
        <div style={{ position: "absolute", left: 60, right: 60, top: 260, height: 34, borderRadius: 17, background: T.main }} />
        <div style={{ position: "absolute", left: 20, right: 20, top: 310, height: 380, ...SURFACE, borderRadius: 60, border: `6px solid ${T.glow}`, boxSizing: "border-box", transform: `translateX(${s}px)` }}>
          <div style={{ position: "absolute", left: 90, right: 90, top: 70, height: 200, borderRadius: 30, background: INK, display: "flex", alignItems: "center", justifyContent: "center", gap: 26 }}>
            {lost ? (
              [0, 1, 2].map((k) => <div key={k} style={{ width: 70, height: 16, borderRadius: 8, background: T.glow, opacity: blink ? 1 : 0.25 }} />)
            ) : (
              <span style={{ ...NUMBER, fontSize: 130, color: T.glow, width: 260, textAlign: "right" }}>{flick}</span>
            )}
            <span style={{ ...NUMBER, fontSize: 80, color: T.glow, fontWeight: 400, opacity: 0.8 }}>г</span>
          </div>
        </div>
      </div>
    </>
  );
};

/* ───────── 2. How much flour? Flour pours until "the dough works" - a dough ball pops up ───────── */

const Flour: React.FC<{ frame: number }> = ({ frame }) => {
  const scene = pop(frame, F.flourIn + 4, SPRING.smooth);
  const pour = progress(frame, F.flour - 10, F.flour) * (1 - progress(frame, F.works - 6, F.works + 4));
  const fill = ease.inOut(progress(frame, F.flour - 6, F.works));
  const ball = springAt(frame, F.works + 2, SPRING.bouncy);
  const tilt = lerp(0, -52, ease.inOut(progress(frame, F.flourIn + 10, F.flour)));
  return (
    <>
      <Title text="сколько *муки*" frame={frame} at={[F.much, F.flour]} size={104} />
      <div style={{ position: "absolute", inset: 0, ...scene.style }}>
        {/* flour sack */}
        <div style={{ position: "absolute", left: 600, top: 450, width: 260, height: 300, transform: `rotate(${tilt}deg)`, transformOrigin: "50% 50%", opacity: 1 - progress(frame, F.works - 4, F.works + 6) }}>
          <svg width={260} height={300} viewBox="0 0 260 300">
            <path d="M40 40 Q 30 20 60 14 H200 Q 230 20 220 40 L 240 270 Q 240 292 216 292 H44 Q 20 292 20 270 Z" fill={T.pale} stroke={T.glow} strokeWidth={8} />
            <rect x={60} y={130} width={140} height={70} rx={16} fill={T.vivid} />
            <circle cx={130} cy={165} r={18} fill={T.pale} />
          </svg>
        </div>
        {/* flour stream */}
        {pour > 0 &&
          Array.from({ length: 14 }, (_, k) => {
            const r = ((frame / 18 + k / 14) % 1 + 1) % 1;
            return <div key={k} style={{ position: "absolute", left: 628 + Math.sin(k * 3.1) * 12, top: 540 + r * 190, width: 18, height: 18, borderRadius: 9, background: T.glow, opacity: pour * (1 - r * 0.4) }} />;
          })}
        {/* bowl with a rising heap */}
        <svg width={520} height={260} viewBox="0 0 520 260" style={{ position: "absolute", left: 280, top: 640 }}>
          <path d={`M90 ${90 - 70 * fill} Q 260 ${40 - 120 * fill} 430 ${90 - 70 * fill} L 430 100 H90 Z`} fill={T.pale} />
          <path d="M30 90 H490 Q 470 240 260 250 Q 50 240 30 90 Z" fill={T.vivid} />
          <rect x={20} y={80} width={480} height={20} rx={10} fill={T.main} />
        </svg>
        {ball > 0 && (
          <div style={{ position: "absolute", left: 540 - 120, top: 520 - Math.sin(Math.min(ball, 1) * Math.PI) * 60, width: 240, height: 200, borderRadius: "50% 50% 46% 46%", background: `radial-gradient(circle at 35% 30%, #fff, ${T.pale} 40%, ${T.glow})`, transform: `scale(${ball})`, boxShadow: SURFACE.boxShadow }} />
        )}
      </div>
      <Answer frame={frame} at={F.so - 8}>
        чтобы тесто <b style={{ color: T.main }}>получилось</b>
      </Answer>
    </>
  );
};

/* ───────── 3. How much salt? The shaker shakes, grandma winks: "на глаз кызым" ───────── */

const Salt: React.FC<{ frame: number }> = ({ frame }) => {
  const scene = pop(frame, F.saltIn + 4, SPRING.smooth);
  const shaking = progress(frame, F.salt - 6, F.salt) * (1 - progress(frame, F.na, F.na + 8));
  const rot = 160 + Math.sin(frame / 2.2) * 14 * shaking;
  const wink = progress(frame, F.eye + 4, F.eye + 6) * (1 - progress(frame, F.eye + 30, F.eye + 32));
  return (
    <>
      <Title text="сколько *соли*" frame={frame} at={[F.muchSalt, F.salt]} size={104} />
      <div style={{ position: "absolute", inset: 0, ...scene.style }}>
        <div style={{ position: "absolute", left: 580, top: 330, width: 160, height: 230, transform: `rotate(${rot}deg)`, transformOrigin: "50% 50%" }}>
          <svg width={160} height={230} viewBox="0 0 160 230">
            <rect x={20} y={70} width={120} height={150} rx={30} fill="#fff" stroke={T.glow} strokeWidth={8} />
            <path d="M30 76 Q 30 10 80 10 Q 130 10 130 76 Z" fill={T.main} />
            {[[62, 40], [80, 30], [98, 40], [80, 52]].map(([x, y]) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r={5} fill={T.pale} />
            ))}
          </svg>
        </div>
        {Array.from({ length: 16 }, (_, k) => {
          const r = ((frame / 24 + k / 16) % 1 + 1) % 1;
          return <div key={k} style={{ position: "absolute", left: 600 + Math.sin(k * 2.3) * 40 + r * 10, top: 560 + r * 160, width: 10, height: 10, borderRadius: 3, background: INK, opacity: shaking * 0.5 * (1 - r) }} />;
        })}
        <svg width={560} height={280} viewBox="0 0 560 280" style={{ position: "absolute", left: 260, top: 640 }}>
          {[0, 1, 2].map((k) => (
            <path key={k} d={`M${200 + k * 80} 40 q 14 -18 0 -34`} fill="none" stroke={T.glow} strokeWidth={8} strokeLinecap="round" transform={`translate(0 ${Math.sin(frame / 10 + k) * 5})`} />
          ))}
          <rect x={10} y={80} width={60} height={22} rx={11} fill={T.main} />
          <rect x={490} y={80} width={60} height={22} rx={11} fill={T.main} />
          <path d="M60 60 H500 V200 Q 500 260 440 260 H120 Q 60 260 60 200 Z" fill={T.main} />
          <rect x={44} y={52} width={472} height={24} rx={12} fill={T.vivid} />
        </svg>
      </div>
      <Answer frame={frame} at={F.na - 8} wink={wink}>
        на <b style={{ color: T.main }}>глаз</b> кызым
      </Answer>
    </>
  );
};

/* ───────── 4. Can't be copied: the copy comes out blank. Only next to her: two cooks knead together ───────── */

const RecipeCard: React.FC<{ frame: number; at: number; blank?: boolean }> = ({ frame, at, blank }) => (
  <div style={{ ...SURFACE, width: 420, height: 520, padding: 44, boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 30, border: blank ? `5px dashed ${T.glow}` : undefined }}>
    <div style={{ width: 240, height: 30, borderRadius: 15, background: blank ? GRAY : T.vivid }} />
    {[300, 250, 280, 200, 260].map((w, i) => {
      const t = blank ? 1 : ease.out(progress(frame, at + i * 8, at + i * 8 + 14));
      return (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 22, height: 22, borderRadius: 11, background: blank ? GRAY : T.glow, flex: "none" }} />
          <div style={{ width: w * t, height: 18, borderRadius: 9, background: blank ? "#F1F2EC" : GRAY }} />
        </div>
      );
    })}
  </div>
);

const Cook: React.FC<{ frame: number; grandma?: boolean; phase: number }> = ({ frame, grandma, phase }) => {
  const knead = Math.sin(frame / 7 + phase);
  return (
    <div style={{ position: "relative", width: 300, height: 420 }}>
      <div style={{ position: "absolute", left: 60, top: 0 }}>
        {grandma ? (
          <Grandma size={180} frame={frame} />
        ) : (
          <svg width={180} height={180} viewBox="0 0 120 120">
            <path d="M18 70 Q 14 10 60 10 Q 106 10 102 70 Q 104 104 92 112 L 28 112 Q 16 104 18 70 Z" fill={T.main} />
            <circle cx={60} cy={64} r={36} fill={T.pale} />
            <path d="M24 50 Q 50 22 96 46 Q 60 40 24 50 Z" fill={T.main} />
            <ellipse cx={47} cy={64} rx={4.5} ry={4.5} fill={INK} />
            <ellipse cx={73} cy={64} rx={4.5} ry={4.5} fill={INK} />
            <path d="M48 80 Q 60 89 72 80" fill="none" stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
          </svg>
        )}
      </div>
      <div style={{ position: "absolute", left: 30, top: 190, width: 240, height: 230, borderRadius: "110px 110px 24px 24px", background: grandma ? T.vivid : T.glow }} />
      {[0, 1].map((h) => (
        <div key={h} style={{ position: "absolute", left: 70 + h * 110, top: 330 + knead * (h ? -14 : 14), width: 56, height: 56, borderRadius: 28, background: T.pale, border: `5px solid ${grandma ? T.main : T.vivid}`, boxSizing: "border-box" }} />
      ))}
    </div>
  );
};

const Copy: React.FC<{ frame: number }> = ({ frame }) => {
  const outA = progress(frame, F.can - 14, F.can - 2);
  const card = pop(frame, F.copyIn + 4, SPRING.smooth);
  const slide = ease.inOut(progress(frame, F.rewrite - 4, F.rewrite + 26));
  const b = pop(frame, F.can - 4, SPRING.smooth);
  const together = springAt(frame, F.near - 4, SPRING.bouncy);
  const dough = 1 + 0.06 * Math.sin(frame / 7);
  return (
    <>
      {outA < 1 && (
        <div style={{ opacity: 1 - outA, filter: `blur(${outA * 10}px)` }}>
          <Title text="рецепт *не переписать*" frame={frame} at={[F.recipe - 4, F.rewrite - 10, F.rewrite]} size={96} />
          <div style={{ position: "absolute", top: 520, left: lerp(330, 130, slide), transform: `rotate(${-4 * slide}deg)`, ...card.style }}>
            <RecipeCard frame={frame} at={F.copyIn + 10} />
          </div>
          {slide > 0 && (
            <div style={{ position: "absolute", top: 560, left: lerp(330, 540, slide), transform: `rotate(${5 * slide}deg)`, opacity: Math.min(1, slide * 3), zIndex: -1 }}>
              <RecipeCard frame={frame} at={0} blank />
            </div>
          )}
        </div>
      )}
      {b.t > 0 && (
        <>
          <Title text="только *рядом с ней*" frame={frame} at={[F.only, F.near, F.near + 6, F.her]} size={96} />
          <div style={{ position: "absolute", top: 520, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 120 - 60 * Math.min(together, 1), ...b.style }}>
            <Cook frame={frame} grandma phase={0} />
            <Cook frame={frame} phase={0} />
          </div>
          <div style={{ position: "absolute", left: 140, right: 140, top: 990, height: 40, borderRadius: 20, background: T.main, ...b.style }} />
          <div style={{ position: "absolute", left: 540 - 110, top: 880, width: 220, height: 130, borderRadius: "50% 50% 40% 40%", background: `radial-gradient(circle at 35% 30%, #fff, ${T.pale} 40%, ${T.glow})`, transform: `scale(${dough * Math.min(1, b.t)}, ${(2 - dough) * Math.min(1, b.t)})`, boxShadow: SURFACE.boxShadow }} />
        </>
      )}
    </>
  );
};

/* ───────── 5. Cook one dish this weekend and film it: a phone records the pot ───────── */

const Film: React.FC<{ frame: number }> = ({ frame }) => {
  const phone = pop(frame, F.ctaIn + 6, SPRING.smooth);
  const rec = frame >= F.film - 4;
  const secs = rec ? Math.floor((frame - F.film + 4) / 60) + 1 : 0;
  const plate = pop(frame, F.weekend - 6, SPRING.bouncy);
  const zoom = 1 + 0.08 * ease.inOut(progress(frame, F.film, F.film + 60));
  return (
    <>
      <Title text="приготовь *одно блюдо*" frame={frame} at={[F.cook, F.one, F.dish]} size={96} />
      <div style={{ position: "absolute", left: 540 - 230, top: 400, width: 460, height: 690, borderRadius: 64, background: INK, padding: 18, boxSizing: "border-box", ...phone.style }}>
        <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 48, overflow: "hidden", background: T.pale }}>
          <div style={{ position: "absolute", inset: 0, transform: `scale(${zoom})` }}>
            <svg width={424} height={654} viewBox="0 0 424 654">
              {[0, 1, 2].map((k) => {
                const r = ((frame / 50 + k / 3) % 1 + 1) % 1;
                return <circle key={k} cx={170 + k * 44 + Math.sin(r * 5) * 10} cy={330 - r * 160} r={16 + r * 18} fill="#fff" opacity={(1 - r) * 0.9} />;
              })}
              <rect x={40} y={370} width={44} height={22} rx={11} fill={T.main} />
              <rect x={340} y={370} width={44} height={22} rx={11} fill={T.main} />
              <path d="M80 350 H344 V500 Q 344 550 294 550 H130 Q 80 550 80 500 Z" fill={T.main} />
              <rect x={64} y={340} width={296} height={24} rx={12} fill={T.vivid} />
              <rect x={0} y={570} width={424} height={90} fill={T.glow} />
            </svg>
          </div>
          {[[30, 30, 1, 1], [394, 30, -1, 1], [30, 624, 1, -1], [394, 624, -1, -1]].map(([x, y, sx, sy]) => (
            <div key={`${x}-${y}`} style={{ position: "absolute", left: sx > 0 ? x : x - 50, top: sy > 0 ? y : y - 50, width: 50, height: 50, borderLeft: sx > 0 ? "6px solid #fff" : undefined, borderRight: sx < 0 ? "6px solid #fff" : undefined, borderTop: sy > 0 ? "6px solid #fff" : undefined, borderBottom: sy < 0 ? "6px solid #fff" : undefined, opacity: 0.9 }} />
          ))}
          <div style={{ position: "absolute", left: 0, right: 0, top: 44, display: "flex", justifyContent: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 24px", borderRadius: 30, background: "rgba(37,27,58,0.55)" }}>
              <div style={{ width: 22, height: 22, borderRadius: 11, background: rec ? T.glow : "#999", opacity: rec ? 0.5 + 0.5 * Math.abs(Math.sin(frame / 10)) : 1 }} />
              <span style={{ ...NUMBER, fontSize: 38, color: "#fff", fontWeight: 500 }}>00:{String(secs).padStart(2, "0")}</span>
            </div>
          </div>
        </div>
      </div>
      {plate.t > 0 && (
        <div style={{ position: "absolute", top: 1140, left: 0, right: 0, display: "flex", justifyContent: "center", ...plate.style }}>
          <div style={{ transform: "scale(2.1)", transformOrigin: "50% 0" }}>
            <GlassPlate bg={PLATE_OLIVE}>
              <CalendarHeart size={18} strokeWidth={2.4} /> в выходные
            </GlassPlate>
          </div>
        </div>
      )}
    </>
  );
};

/* ───────── 6. The taste stays in the family: a jar fills with layers, the lid closes on "семье" ───────── */

const LAYERS = [T.pale, T.glow, T.vivid, T.glow, T.main];
const Jar: React.FC<{ frame: number }> = ({ frame }) => {
  const jar = pop(frame, F.tasteIn + 2, SPRING.smooth);
  const lid = springAt(frame, F.family - 8, SPRING.bouncy);
  const label = pop(frame, F.family + 6, SPRING.bouncy);
  const H = 440;
  return (
    <>
      <Title text="вкус *останется* в семье" frame={frame} at={[F.taste, F.stays, F.family - 4, F.family]} size={96} />
      <div style={{ position: "absolute", left: 540 - 200, top: 430, width: 400, height: 640, ...jar.style }}>
        <div style={{ position: "absolute", left: 30, right: 30, top: 140 - (1 - Math.min(lid, 1)) * 260, height: 70, borderRadius: 20, background: T.main, transform: `rotate(${(1 - Math.min(lid, 1)) * -25}deg)`, opacity: Math.min(1, lid * 2) }}>
          {[0, 1, 2, 3, 4, 5].map((k) => (
            <div key={k} style={{ position: "absolute", top: 12, bottom: 12, left: 30 + k * 52, width: 8, borderRadius: 4, background: T.vivid }} />
          ))}
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 200, height: H, borderRadius: 60, background: "#fff", border: `8px solid ${T.glow}`, boxSizing: "border-box", overflow: "hidden", boxShadow: SURFACE.boxShadow }}>
          {LAYERS.map((c, i) => {
            const t = ease.out(progress(frame, F.tasteIn + 10 + i * 12, F.tasteIn + 30 + i * 12));
            return <div key={i} style={{ position: "absolute", left: 0, right: 0, bottom: i * 76, height: 76 * t, background: c, borderRadius: i === LAYERS.length - 1 ? "40px 40px 0 0" : 0 }} />;
          })}
          <div style={{ position: "absolute", left: 30, top: 30, width: 22, height: 220, borderRadius: 11, background: "rgba(255,255,255,0.55)" }} />
        </div>
        <div style={{ position: "absolute", left: 70, right: 70, top: 330, height: 150, ...SURFACE, borderRadius: 26, display: "flex", alignItems: "center", justifyContent: "center", gap: 18, ...label.style }}>
          {[56, 44, 32].map((s, k) => (
            <div key={k} style={{ width: s, height: s, borderRadius: s, background: [T.main, T.vivid, T.glow][k], alignSelf: "flex-end", marginBottom: 40 }} />
          ))}
        </div>
      </div>
    </>
  );
};

/* ───────── Composition ───────── */

const SCENES: SceneDef[] = [
  { range: [0, F.flourIn], El: Hook },
  { range: [F.flourIn, F.saltIn], El: Flour },
  { range: [F.saltIn, F.copyIn], El: Salt },
  { range: [F.copyIn, F.ctaIn], El: Copy },
  { range: [F.ctaIn, F.tasteIn], El: Film },
  { range: [F.tasteIn, F.duration + 30], El: Jar },
];

const SFX: Sfx[] = [
  { src: "sfx/07_CineStrike.wav", from: 2, volume: 0.16 },
  { src: "sfx2/pop.mp3", from: F.grandmas + 4, volume: 0.2 },
  { src: "sfx/05_Distortion_Glitch.wav", from: F.grams - 2, volume: 0.05 },
  // scene changes: textures from the SFX/ library (no whoosh)
  { src: "sfx/06_Ripple_Textures_II.wav", from: F.flourIn - 8, volume: 0.2 },
  { src: "sfx/02_Alienated_Warpes.wav", from: F.saltIn - 8, volume: 0.14 },
  { src: "sfx/01_Ripple_Textures.wav", from: F.copyIn - 8, volume: 0.18 },
  { src: "sfx/04_Cyber_Shift.wav", from: F.ctaIn - 8, volume: 0.2 },
  { src: "sfx/06_Ripple_Textures_II.wav", from: F.tasteIn - 8, volume: 0.2 },
  // 2. dough ball, grandma's answer
  { src: "sfx2/pop.mp3", from: F.so - 8, volume: 0.2 },
  { src: "sfx2/ding.mp3", from: F.works + 2, volume: 0.18 },
  // 3. salt, wink
  { src: "sfx2/pop.mp3", from: F.na - 8, volume: 0.2 },
  { src: "sfx2/click.mp3", from: F.eye + 4, volume: 0.22 },
  // 4. blank copy, two cooks
  { src: "sfx/05_Distortion_Glitch.wav", from: F.rewrite + 10, volume: 0.04 },
  { src: "sfx2/pop.mp3", from: F.near - 4, volume: 0.2 },
  // 5. plate, recording
  { src: "sfx2/pop.mp3", from: F.weekend - 6, volume: 0.24 },
  { src: "sfx2/click.mp3", from: F.film - 4, volume: 0.22 },
  // 6. the lid closes
  { src: "sfx/03_Basscrack.wav", from: F.family - 2, volume: 0.1 },
  { src: "sfx2/ding.mp3", from: F.family + 6, volume: 0.2 },
];

// All 30 poses of the main set, each at least once, by the meaning of the line; never the same photo twice in a row
const AVATAR_KEYS: AvatarKey[] = [
  // 1. hook: nobody talks about it, no grams
  { at: 0, e: "shush" },
  { at: 45, e: "skeptical" },
  { at: 95, e: "explaining" },
  { at: 140, e: "thinking" },
  { at: 185, e: "puzzled" },
  { at: 225, e: "surprised" },
  // 2. how much flour
  { at: F.flourIn, e: "pensive" },
  { at: 315, e: "listening" },
  { at: 355, e: "facepalm" },
  { at: 400, e: "delighted" },
  { at: 440, e: "shrug" },
  // 3. how much salt, by eye
  { at: F.saltIn, e: "point-up" },
  { at: 510, e: "arms-crossed" },
  { at: 545, e: "laughing" },
  { at: 575, e: "heart-hands" },
  // 4. can't copy, only next to her
  { at: F.copyIn, e: "stop" },
  { at: 660, e: "displeased" },
  { at: 700, e: "disappointed" },
  { at: 745, e: "present-left" },
  { at: 790, e: "hand-on-heart" },
  { at: 830, e: "soft-smile" },
  // 5. cook one dish this weekend, film it
  { at: F.ctaIn, e: "point-right" },
  { at: 920, e: "inspired" },
  { at: 970, e: "clapping" },
  { at: 1010, e: "dreamy" },
  { at: 1040, e: "point-down" },
  { at: 1070, e: "thumbs-up" },
  // 6. the taste stays
  { at: F.tasteIn, e: "smile-up" },
  { at: 1150, e: "waving" },
  { at: 1200, e: "victory" },
];

const STANCES: StanceKey[] = [
  { at: 0, s: "center" },
  { at: F.flourIn, s: "right" },
  { at: F.saltIn, s: "left" },
  { at: F.copyIn, s: "right" },
  { at: F.ctaIn, s: "left" },
  { at: F.tasteIn, s: "center" },
];

// Main set photos: scale the wide-framed ones so every photo fills the 540x590 box by height (same as V38)
const SIZE: Record<string, [number, number]> = {
  pensive: [1312, 1199], dreamy: [1293, 1217], displeased: [1254, 1254], surprised: [1280, 1229], waving: [1312, 1199], inspired: [1199, 1312], explaining: [1312, 1199], delighted: [1312, 1199], skeptical: [1312, 1199], laughing: [1385, 1136],
  puzzled: [1152, 1366], disappointed: [1278, 1230], "smile-up": [1199, 1312], thinking: [1190, 1322], "soft-smile": [1218, 1291], "point-up": [1312, 1199], "point-down": [1312, 1199], "present-left": [1312, 1199], "point-right": [1312, 1199], shrug: [1312, 1199],
  "hand-on-heart": [1312, 1199], stop: [1312, 1199], shush: [1312, 1199], clapping: [1278, 1230], "thumbs-up": [1312, 1199], "arms-crossed": [1312, 1199], facepalm: [1312, 1199], "heart-hands": [1312, 1199], victory: [1312, 1199], listening: [1312, 1199],
};
const FIT = Object.fromEntries(Object.entries(SIZE).map(([e, [w, h]]) => [e, Math.max(1, w / h / (540 / 590))])) as Partial<Record<Emotion, number>>;

const Host: React.FC<{ frame: number }> = ({ frame }) => <TatAvatar frame={frame} keys={AVATAR_KEYS} words={WORDS} stances={STANCES} fit={FIT} />;

export const Video40: React.FC = () => (
  <AbsoluteFill style={{ background: "#fff", fontFamily: PARAGRAPH.fontFamily, color: INK }}>
    <ReelShell scenes={SCENES} headlines={[]} vo={VO} sfx={SFX} duration={F.duration} music="v40/music/bed.mp3" musicLevel={[0.045, 0.11]} overlay={Host} bg={BG} />
  </AbsoluteFill>
);
