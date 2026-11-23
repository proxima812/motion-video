import React from "react";
import { AbsoluteFill } from "remotion";
import { MessageCircle } from "lucide-react";
import { SPRING, ease, lerp, progress, springAt } from "../stage/motion";
import { ReelShell, count, pop, shake, type SceneDef, type Sfx } from "../kit/reel";
import { TatAvatar, type AvatarKey, type Emotion, type StanceKey } from "../kit/TatAvatar";
import { DotOrbitBg } from "../kit/DotOrbitBg";
import { HEADING, INK, NUMBER, PARAGRAPH, SURFACE } from "../kit/design";
import { GlassPlate } from "../catalog/own/glass";
import { F, VO } from "./timeline";
import { WORDS } from "./words";

// "Гость, который уже наелся" (@the_tatarverse, RU, host preset 2 Alicja). ~19.6 s.
// "I'm full" -> you said "thanks, I'm full" -> they gave you more, chak-chak and tea -> Tatars don't let a guest leave hungry, even if he's full
// -> how is it at yours, write in the comments -> just finish your plate first.
// Own kit only. Palette: cherry. Dot Orbit variant 5 (output/bg-variant.txt).
const T = { main: "#9B1B30", vivid: "#CC2E48", glow: "#F0A3B0", pale: "#FCE8EC" };
const PLATE_CHERRY = "linear-gradient(135deg, #CC2E48, #9B1B30)";
const BG = <DotOrbitBg variant={5} />;
const GRAY = "#EDE7E8";

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

const Face: React.FC<{ color: string; size: number; style?: React.CSSProperties }> = ({ color, size, style }) => (
  <div style={{ position: "absolute", width: size, height: size, borderRadius: size / 2, boxSizing: "border-box", background: color, border: `${Math.max(3, size * 0.045)}px solid #fff`, boxShadow: SURFACE.boxShadow, ...style }}>
    {[0.33, 0.58].map((x) => (
      <div key={x} style={{ position: "absolute", left: `${x * 100}%`, top: "40%", width: size * 0.09, height: size * 0.09, borderRadius: size, background: INK }} />
    ))}
  </div>
);

/* Drawn food and table things (shapes, not icons) */

/** Top-view plate, centered on (x, y) */
const Plate: React.FC<{ x: number; y: number; r: number; style?: React.CSSProperties; children?: React.ReactNode }> = ({ x, y, r, style, children }) => (
  <div style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: r, background: "#fff", boxShadow: SURFACE.boxShadow, ...style }}>
    <div style={{ position: "absolute", inset: r * 0.16, borderRadius: r, background: T.pale, border: `4px solid ${T.glow}` }} />
    {children}
  </div>
);

/** White flag of surrender, waving */
const Flag: React.FC<{ frame: number; s?: number }> = ({ frame, s = 1 }) => {
  const w = Math.sin(frame / 6) * 8;
  return (
    <svg width={150 * s} height={170 * s} viewBox="0 0 150 170">
      <rect x={14} y={10} width={9} height={158} rx={4} fill={T.main} />
      <path d={`M23 16 Q 60 ${4 + w} 90 16 T 146 16 V 84 Q 118 ${72 - w} 90 84 T 23 84 Z`} fill="#fff" stroke={T.glow} strokeWidth={5} strokeLinejoin="round" />
    </svg>
  );
};

/** Chak-chak: a mound of honey balls */
const CHAK = [
  [0, 0], [-26, 4], [26, 4], [-50, 10], [50, 10], [-13, -20], [13, -20], [-38, -14], [38, -14], [0, -40], [-24, -36], [24, -36], [0, 22], [-30, 26], [30, 26],
];
const ChakChak: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <svg width={160 * s} height={130 * s} viewBox="-80 -70 160 130">
    {CHAK.map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r={15} fill={[T.glow, "#F7C3CB", T.glow][i % 3]} stroke={T.vivid} strokeWidth={3} />
    ))}
    <path d="M-50 -10 Q -10 -40 40 -20 M-40 16 Q 0 -6 46 12" fill="none" stroke={T.main} strokeWidth={4} strokeLinecap="round" opacity={0.7} />
  </svg>
);

/** A side-view cup with steam */
const Cup: React.FC<{ frame: number; s?: number }> = ({ frame, s = 1 }) => (
  <svg width={150 * s} height={170 * s} viewBox="0 0 150 170">
    {[44, 74].map((x, i) => (
      <path key={x} d={`M${x} 60 q 12 -14 0 -28 q -12 -14 0 -28`} fill="none" stroke={T.glow} strokeWidth={6} strokeLinecap="round" opacity={0.6 + 0.4 * Math.sin(frame / 8 + i)} />
    ))}
    <path d="M14 76 H104 V110 A45 45 0 0 1 14 110 Z" fill={T.vivid} />
    <circle cx={112} cy={98} r={17} fill="none" stroke={T.vivid} strokeWidth={9} />
    <rect x={4} y={154} width={120} height={11} rx={5} fill={T.glow} />
  </svg>
);

/** A portion of food (top view): a mound */
const Portion: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <svg width={220 * s} height={170 * s} viewBox="0 0 220 170">
    <path d="M20 110 C 10 60 60 20 110 24 C 170 20 214 62 200 112 C 190 150 40 156 20 110 Z" fill={T.vivid} />
    {[[70, 70], [110, 54], [150, 76], [96, 100], [138, 110], [60, 108]].map(([x, y], i) => (
      <ellipse key={i} cx={x} cy={y} rx={14} ry={9} fill={T.glow} transform={`rotate(${i * 30} ${x} ${y})`} />
    ))}
  </svg>
);

/** A palm, fingers up (drawn) - the "enough" gesture over the cup */
const Palm: React.FC = () => (
  <svg width={220} height={200} viewBox="0 0 220 200">
    {[36, 78, 120, 160].map((x, i) => (
      <rect key={x} x={x} y={[34, 10, 14, 40][i]} width={36} height={120} rx={18} fill="#F6D2D8" stroke={T.vivid} strokeWidth={5} />
    ))}
    <rect x={30} y={90} width={170} height={100} rx={46} fill="#F6D2D8" stroke={T.vivid} strokeWidth={5} />
    <rect x={0} y={110} width={90} height={36} rx={18} fill="#F6D2D8" stroke={T.vivid} strokeWidth={5} transform="rotate(-24 45 128)" />
  </svg>
);

/** Fullness gauge 0-200 %, the 100 % mark in the middle */
const Gauge: React.FC<{ value: number; y: number; frame: number; at: number }> = ({ value, y, frame, at }) => {
  const p = pop(frame, at, SPRING.smooth);
  const W = 760;
  const over = value > 100;
  return (
    <div style={{ position: "absolute", left: 160, top: y, width: W, ...p.style }}>
      <div style={{ position: "absolute", left: Math.min(W - 180, (Math.min(value, 200) / 200) * W - 90), width: 180, top: -100, textAlign: "center", ...NUMBER, fontSize: 76, color: over ? T.vivid : T.main }}>{`${Math.round(value)}%`}</div>
      <div style={{ position: "relative", height: 44, borderRadius: 22, background: GRAY, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${(Math.min(value, 200) / 200) * 100}%`, borderRadius: 22, background: over ? `linear-gradient(90deg, ${T.glow}, ${T.vivid})` : T.glow }} />
      </div>
      <div style={{ position: "absolute", left: W / 2 - 3, top: -12, width: 6, height: 68, borderRadius: 3, background: T.main }} />
    </div>
  );
};

/* ───────── 1. Hook: an empty plate, a white flag goes up on "я сыт" ───────── */

const Hook: React.FC<{ frame: number }> = ({ frame }) => {
  const first = fadeOut(frame, F.words - 12);
  const plate = pop(frame, 4, SPRING.smooth);
  const flag = springAt(frame, F.me - 4, SPRING.bouncy);
  return (
    <>
      {first > 0 && <Title text="это изменит твое *отношение*" frame={frame} at={[-30, -24, -18, F.relation - 6]} size={84} style={{ opacity: first }} />}
      {frame >= F.words - 8 && <Title text="к словам *я сыт*" frame={frame} at={[F.words - 4, F.words + 2, F.me, F.full]} size={100} />}
      <div style={{ position: "absolute", inset: 0, ...plate.style }}>
        <Plate x={540} y={800} r={270} />
        <div style={{ position: "absolute", left: 150, top: 620, width: 26, height: 360, borderRadius: 13, background: T.glow }} />
        <div style={{ position: "absolute", left: 904, top: 620, width: 26, height: 360, borderRadius: 13, background: T.glow }} />
      </div>
      {flag > 0 && (
        <div style={{ position: "absolute", left: 540 - 20, top: 800 - 170 * 1.6 + 30, transformOrigin: "20px 100%", transform: `scale(${Math.min(flag, 1.1)}) rotate(${(1 - Math.min(flag, 1)) * -40}deg)` }}>
          <Flag frame={frame} s={1.6} />
        </div>
      )}
    </>
  );
};

/* ───────── 2. "Thank you, I'm full": a palm covers the cup, the fullness gauge hits 100 ───────── */

const Said: React.FC<{ frame: number }> = ({ frame }) => {
  const cup = pop(frame, F.saidIn + 6, SPRING.smooth);
  const palm = springAt(frame, F.ate - 10, SPRING.smooth);
  const value = lerp(40, 100, ease.out(progress(frame, F.saidIn + 20, F.ate + 20)));
  return (
    <>
      <Title text="спасибо *я наелся*" frame={frame} at={[F.thanks - 4, F.ate - 6, F.ate]} size={100} />
      <div style={{ position: "absolute", left: 540 - 150, top: 470, ...cup.style }}>
        <Cup frame={frame} s={2} />
      </div>
      {palm > 0 && (
        <div style={{ position: "absolute", left: 540 - 150, top: lerp(260, 430, Math.min(palm, 1.05)), opacity: Math.min(1, palm * 2), transform: "scale(1.35)", transformOrigin: "50% 100%" }}>
          <Palm />
        </div>
      )}
      <Gauge value={value} y={1050} frame={frame} at={F.saidIn + 14} />
    </>
  );
};

/* ───────── 3. More on the plate, then chak-chak, then tea: the gauge goes past 100 ───────── */

const More: React.FC<{ frame: number }> = ({ frame }) => {
  const plate = pop(frame, F.moreIn + 4, SPRING.smooth);
  const portion = springAt(frame, F.put + 4, SPRING.bouncy);
  const chak = springAt(frame, F.chak - 6, SPRING.bouncy);
  const tea = springAt(frame, F.tea - 6, SPRING.bouncy);
  const value = 100 + 30 * Math.min(1, progress(frame, F.put, F.put + 20)) + 35 * Math.min(1, progress(frame, F.chak - 4, F.chak + 16)) + 30 * Math.min(1, progress(frame, F.tea - 4, F.tea + 16));
  const sx = shake(frame, F.tea + 10, 12, 26);
  return (
    <>
      <Title text="тебе положили *еще*" frame={frame} at={[F.moreIn + 2, F.put, F.more]} size={96} />
      <div style={{ position: "absolute", inset: 0, ...plate.style }}>
        <Plate x={470} y={700} r={250} />
      </div>
      {portion > 0 && (
        <div style={{ position: "absolute", left: 470 - 150, top: lerp(380, 600, Math.min(portion, 1)), transform: `scale(${1.35 * Math.min(1, portion)})` }}>
          <Portion />
        </div>
      )}
      {chak > 0 && (
        <div style={{ position: "absolute", left: 370, top: lerp(380, 640, Math.min(chak, 1)), transform: `scale(${Math.min(chak, 1.1)})`, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <ChakChak s={1.4} />
        </div>
      )}
      {chak > 0 && <div style={{ position: "absolute", left: 120, top: 440, ...PARAGRAPH, fontWeight: 700, fontSize: 54, lineHeight: 1, color: T.main, opacity: Math.min(1, chak), transform: `rotate(-6deg)` }}>чак-чак</div>}
      {tea > 0 && (
        <div style={{ position: "absolute", left: lerp(1100, 740, Math.min(tea, 1)), top: 640, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <Cup frame={frame} s={1.3} />
          <span style={{ ...PARAGRAPH, fontWeight: 700, fontSize: 54, lineHeight: 1, color: T.main }}>чай</span>
        </div>
      )}
      <div style={{ position: "absolute", inset: 0, transform: `translateX(${sx}px)` }}>
        <Gauge value={value} y={1100} frame={frame} at={F.moreIn + 4} />
      </div>
    </>
  );
};

/* ───────── 4. A guest is not let go hungry: the door shuts gently, even with the white flag up ───────── */

const Door: React.FC<{ frame: number }> = ({ frame }) => {
  const first = fadeOut(frame, F.even - 12);
  const walk = ease.inOut(progress(frame, F.guest - 10, F.letGo - 4));
  const shut = ease.out(progress(frame, F.letGo - 6, F.letGo + 10));
  const back = springAt(frame, F.letGo + 6, SPRING.bouncy);
  const gx = lerp(200, 520, walk) - 90 * Math.min(back, 1);
  const bob = Math.abs(Math.sin(walk * Math.PI * 4)) * -24 * (walk < 1 ? 1 : 0);
  const flag = springAt(frame, F.full2 - 6, SPRING.bouncy);
  const plate = springAt(frame, F.hungry, SPRING.bouncy);
  return (
    <>
      {first > 0 && <Title text="у татар *гостя*" frame={frame} at={[F.tatars - 6, F.tatars, F.guest]} size={96} style={{ opacity: first }} />}
      {first > 0 && <Title text="не *отпускают*" frame={frame} at={[F.letGo - 6, F.letGo]} size={96} top={285} style={{ opacity: first }} />}
      {frame >= F.even - 10 && <Title text="даже если *сыт*" frame={frame} at={[F.even - 4, F.even + 10, F.full2]} size={100} />}
      {/* door frame + the outside light + the door panel */}
      <div style={{ position: "absolute", left: 640, top: 470, width: 300, height: 640, borderRadius: "24px 24px 0 0", background: T.pale, border: `14px solid ${T.main}`, boxSizing: "border-box", ...pop(frame, F.whyIn + 4, SPRING.smooth).style }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "100%", transformOrigin: "0 50%", transform: `scaleX(${lerp(0.12, 1, shut)})`, background: T.vivid, borderRadius: "10px 10px 0 0" }}>
          <div style={{ position: "absolute", right: 30, top: 300, width: 26, height: 26, borderRadius: 13, background: T.glow, opacity: shut }} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 120, right: 120, top: 1110, height: 10, borderRadius: 5, background: T.glow }} />
      <Face color={T.glow} size={160} style={{ left: gx, top: 950 + bob }} />
      {flag > 0 && (
        <div style={{ position: "absolute", left: gx + 110, top: 760, transformOrigin: "20px 100%", transform: `scale(${Math.min(flag, 1.1)})` }}>
          <Flag frame={frame} s={1.1} />
        </div>
      )}
      {plate > 0 && (
        <div style={{ position: "absolute", left: 0, top: 0, transform: `translate(${lerp(-300, 0, Math.min(plate, 1))}px, 0)` }}>
          <Plate x={170} y={760} r={95} />
          <div style={{ position: "absolute", left: 105, top: 705 }}>
            <ChakChak s={0.8} />
          </div>
        </div>
      )}
    </>
  );
};

/* ───────── 5. How is it at yours? Comments fill in, a new one is being written ───────── */

const COMMENTS = [
  { c: T.glow, w: [420, 300] },
  { c: T.vivid, w: [480, 240] },
  { c: "#E7788A", w: [380, 0] },
];
const Comments: React.FC<{ frame: number }> = ({ frame }) => {
  const card = pop(frame, F.ctaIn + 6, SPRING.smooth);
  const mine = springAt(frame, F.comments - 4, SPRING.bouncy);
  const typing = progress(frame, F.comments + 6, F.comments + 46);
  const plate = pop(frame, F.write - 4, SPRING.bouncy);
  return (
    <>
      <Title text="а как *у вас*" frame={frame} at={[F.ctaIn + 2, F.ctaIn + 10, F.yours]} size={100} />
      <div style={{ position: "absolute", left: 130, right: 130, top: 400, ...SURFACE, borderRadius: 40, padding: 40, boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 34, ...card.style }}>
        <span style={{ ...PARAGRAPH, fontWeight: 700, fontSize: 48, lineHeight: 1 }}>комментарии</span>
        {COMMENTS.map((c, i) => {
          const p = springAt(frame, F.ctaIn + 14 + i * 8, SPRING.smooth);
          return (
            <div key={i} style={{ display: "flex", gap: 24, alignItems: "flex-start", opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * 30}px)` }}>
              <Face color={c.c} size={84} style={{ position: "relative", flex: "none", boxShadow: "none" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingTop: 14 }}>
                {c.w.filter(Boolean).map((w, k) => (
                  <div key={k} style={{ width: w, height: 20, borderRadius: 10, background: GRAY }} />
                ))}
              </div>
            </div>
          );
        })}
        <div style={{ display: "flex", gap: 24, alignItems: "center", padding: 20, margin: -20, borderRadius: 28, border: `4px solid ${T.glow}`, background: T.pale, transform: `scale(${mine})`, opacity: Math.min(1, mine * 2), transformOrigin: "0 50%" }}>
          <Face color={T.main} size={84} style={{ position: "relative", flex: "none", boxShadow: "none" }} />
          <div style={{ width: 460 * typing, height: 20, borderRadius: 10, background: T.glow }} />
          <div style={{ width: 4, height: 50, background: T.vivid, opacity: Math.floor(frame / 12) % 2 }} />
        </div>
      </div>
      {plate.t > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 1100, display: "flex", justifyContent: "center", ...plate.style }}>
          <div style={{ transform: "scale(2.3)" }}>
            <GlassPlate bg={PLATE_CHERRY}>
              <MessageCircle size={20} strokeWidth={2.2} /> написать
            </GlassPlate>
          </div>
        </div>
      )}
    </>
  );
};

/* ───────── 6. Just finish your plate first: bites vanish one by one, the plate shines... and one more chak-chak lands ───────── */

const BITES = [
  { x: -110, y: -60, r: 52, c: T.vivid },
  { x: 40, y: -110, r: 46, c: T.glow },
  { x: 120, y: 10, r: 50, c: T.vivid },
  { x: -40, y: 40, r: 58, c: "#E7788A" },
  { x: 60, y: 110, r: 42, c: T.glow },
  { x: -130, y: 90, r: 40, c: T.vivid },
];
const Finish: React.FC<{ frame: number }> = ({ frame }) => {
  const plate = pop(frame, F.eatIn + 4, SPRING.smooth);
  const shine = springAt(frame, F.finish + 22, SPRING.bouncy);
  const extra = springAt(frame, F.finish + 62, SPRING.bouncy);
  const CX = 540;
  const CY = 760;
  return (
    <>
      <Title text="только сначала *доешь*" frame={frame} at={[F.eatIn + 2, F.first, F.finish]} size={92} />
      <div style={{ position: "absolute", inset: 0, ...plate.style }}>
        <Plate x={CX} y={CY} r={270} />
        <div style={{ position: "absolute", left: 160, top: 580, width: 26, height: 360, borderRadius: 13, background: T.glow }} />
        <div style={{ position: "absolute", left: 894, top: 580, width: 26, height: 360, borderRadius: 13, background: T.glow }} />
      </div>
      {BITES.map((b, i) => {
        const gone = progress(frame, F.first + 6 + i * 8, F.first + 12 + i * 8);
        return <div key={i} style={{ position: "absolute", left: CX + b.x - b.r, top: CY + b.y - b.r, width: b.r * 2, height: b.r * 2, borderRadius: b.r, background: b.c, transform: `scale(${(1 - gone) * (1 + 0.15 * Math.sin(gone * Math.PI))})`, opacity: plate.style.opacity as number }} />;
      })}
      {shine > 0 && extra < 0.05 &&
        [
          [-150, -150, 1],
          [160, -120, 0.7],
          [120, 150, 0.9],
        ].map(([x, y, k], i) => (
          <svg key={i} width={90} height={90} viewBox="-45 -45 90 90" style={{ position: "absolute", left: CX + x - 45, top: CY + y - 45, transform: `scale(${Math.min(shine, 1.1) * k}) rotate(${frame * 2}deg)` }}>
            <path d="M0 -42 Q 6 -6 42 0 Q 6 6 0 42 Q -6 6 -42 0 Q -6 -6 0 -42 Z" fill={T.glow} />
          </svg>
        ))}
      {extra > 0 && (
        <div style={{ position: "absolute", left: CX - 112, top: lerp(380, CY - 90, Math.min(extra, 1)), transform: `scale(${Math.min(extra, 1.1)})` }}>
          <ChakChak s={1.4} />
        </div>
      )}
    </>
  );
};

/* ───────── Composition ───────── */

const SCENES: SceneDef[] = [
  { range: [0, F.saidIn], El: Hook },
  { range: [F.saidIn, F.moreIn], El: Said },
  { range: [F.moreIn, F.whyIn], El: More },
  { range: [F.whyIn, F.ctaIn], El: Door },
  { range: [F.ctaIn, F.eatIn], El: Comments },
  { range: [F.eatIn, F.duration + 30], El: Finish },
];

const SFX: Sfx[] = [
  { src: "sfx/07_CineStrike.wav", from: 2, volume: 0.18 },
  { src: "sfx2/pop.mp3", from: F.me - 4, volume: 0.22 },
  // scene changes: textures from the SFX/ library (no whoosh)
  { src: "sfx/01_Ripple_Textures.wav", from: F.saidIn - 8, volume: 0.18 },
  { src: "sfx/04_Cyber_Shift.wav", from: F.moreIn - 8, volume: 0.2 },
  { src: "sfx/06_Ripple_Textures_II.wav", from: F.whyIn - 8, volume: 0.2 },
  { src: "sfx/02_Alienated_Warpes.wav", from: F.ctaIn - 8, volume: 0.14 },
  { src: "sfx/01_Ripple_Textures.wav", from: F.eatIn - 8, volume: 0.18 },
  // 2. the palm
  { src: "sfx2/click.mp3", from: F.ate, volume: 0.2 },
  { src: "sfx2/ding.mp3", from: F.ate + 20, volume: 0.16 },
  // 3. more, chak-chak, tea
  { src: "sfx2/pop.mp3", from: F.put + 4, volume: 0.22 },
  { src: "sfx2/pop.mp3", from: F.chak - 6, volume: 0.22 },
  { src: "sfx2/pop.mp3", from: F.tea - 6, volume: 0.22 },
  { src: "sfx/03_Basscrack.wav", from: F.tea + 10, volume: 0.08 },
  // 4. the door
  { src: "sfx2/click.mp3", from: F.letGo - 4, volume: 0.24 },
  { src: "sfx2/pop.mp3", from: F.hungry, volume: 0.18 },
  { src: "sfx2/pop.mp3", from: F.full2 - 6, volume: 0.2 },
  // 5. comments
  { src: "sfx2/pop.mp3", from: F.write - 4, volume: 0.22 },
  { src: "sfx2/click.mp3", from: F.comments - 4, volume: 0.18 },
  // 6. bites, shine, one more
  ...BITES.filter((_, i) => i % 2 === 0).map((_, k) => ({ src: "sfx2/click.mp3", from: F.first + 6 + k * 16, volume: 0.12 })),
  { src: "sfx2/ding.mp3", from: F.finish + 22, volume: 0.18 },
  { src: "sfx/07_CineStrike.wav", from: F.finish + 62, volume: 0.12 },
];

// All 30 poses of the Alicja set, each at least once; never the same photo twice in a row
const AVATAR_KEYS: AvatarKey[] = [
  // 1. hook: "я сыт"
  { at: 0, e: "explaining" },
  { at: 35, e: "point-up" },
  { at: 70, e: "thinking" },
  { at: 105, e: "skeptical" },
  { at: 140, e: "displeased" },
  { at: 170, e: "stop" },
  // 2. thanks, I'm full
  { at: F.saidIn, e: "soft-smile" },
  { at: 245, e: "hand-on-heart" },
  { at: 290, e: "shrug" },
  { at: 335, e: "puzzled" },
  // 3. more, chak-chak, tea
  { at: F.moreIn, e: "surprised" },
  { at: 410, e: "laughing" },
  { at: 450, e: "facepalm" },
  { at: 490, e: "smile-up" },
  { at: 525, e: "delighted" },
  { at: 560, e: "disappointed" },
  // 4. a guest is not let go hungry
  { at: F.whyIn, e: "present-left" },
  { at: 640, e: "point-right" },
  { at: 690, e: "arms-crossed" },
  { at: 740, e: "pensive" },
  { at: 790, e: "dreamy" },
  // 5. comments
  { at: F.ctaIn, e: "listening" },
  { at: 885, e: "point-down" },
  { at: 925, e: "inspired" },
  { at: 965, e: "heart-hands" },
  { at: 1000, e: "waving" },
  // 6. finish first
  { at: F.eatIn, e: "shush" },
  { at: 1065, e: "thumbs-up" },
  { at: 1100, e: "clapping" },
  { at: 1135, e: "victory" },
];

const STANCES: StanceKey[] = [
  { at: 0, s: "center" },
  { at: F.saidIn, s: "right" },
  { at: F.moreIn, s: "left" },
  { at: F.whyIn, s: "right" },
  { at: F.ctaIn, s: "left" },
  { at: F.eatIn, s: "center" },
];

// Alicja photos: scale the wide-framed ones so every photo fills the 540x590 box by height (same as V37)
const SIZE: Record<string, [number, number]> = {
  pensive: [1129, 1393], dreamy: [1293, 1216], displeased: [1254, 1254], surprised: [1280, 1229], waving: [1312, 1199], inspired: [1199, 1312], explaining: [1312, 1199], delighted: [1312, 1199], skeptical: [1312, 1199], laughing: [1385, 1136],
  puzzled: [1129, 1393], disappointed: [1278, 1230], "smile-up": [1199, 1312], thinking: [1129, 1393], "soft-smile": [1164, 1351], "point-up": [1312, 1199], "point-down": [1312, 1199], "present-left": [1312, 1199], "point-right": [1312, 1199], shrug: [1312, 1199],
  "hand-on-heart": [1312, 1199], stop: [1312, 1199], shush: [1199, 1312], clapping: [1312, 1199], "thumbs-up": [1312, 1199], "arms-crossed": [1199, 1312], facepalm: [1312, 1199], "heart-hands": [1312, 1199], victory: [1312, 1199], listening: [1312, 1199],
};
const FIT = Object.fromEntries(Object.entries(SIZE).map(([e, [w, h]]) => [e, Math.max(1, w / h / (540 / 590))])) as Partial<Record<Emotion, number>>;

const Host: React.FC<{ frame: number }> = ({ frame }) => <TatAvatar frame={frame} keys={AVATAR_KEYS} words={WORDS} stances={STANCES} dir="v47/avatar" fit={FIT} />;

export const Video47: React.FC = () => (
  <AbsoluteFill style={{ background: "#fff", fontFamily: PARAGRAPH.fontFamily, color: INK }}>
    <ReelShell scenes={SCENES} headlines={[]} vo={VO} sfx={SFX} duration={F.duration} music="v47/music/bed.mp3" musicLevel={[0.045, 0.11]} overlay={Host} bg={BG} />
  </AbsoluteFill>
);
