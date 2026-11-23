import React from "react";
import { AbsoluteFill } from "remotion";
import { MessageCircle } from "lucide-react";
import { SPRING, ease, lerp, progress, springAt } from "../stage/motion";
import { ReelShell, count, pop, type SceneDef, type Sfx } from "../kit/reel";
import { TatAvatar, type AvatarKey, type Emotion, type StanceKey } from "../kit/TatAvatar";
import { DotOrbitBg } from "../kit/DotOrbitBg";
import { HEADING, INK, NUMBER, PARAGRAPH, SURFACE } from "../kit/design";
import { GlassPlate } from "../catalog/own/glass";
import { F, VO } from "./timeline";
import { WORDS } from "./words";

// "Родной город, незнакомая карта" (@the_tatarverse, RU, main host preset Ahu). 21 s.
// From scratch I'd make a Tatar map of my city -> you know every coffee shop, but Tatar places? -> mosque, culture center, echpochmak cafe, a street with a Tatar name
// -> they're nearby, just not on your map -> name one place in the comments -> let's build a shared map together.
// Own kit only. Palette: grass. Dot Orbit variant 6 (output/bg-variant.txt).
const T = { main: "#3F6E12", vivid: "#5E9A1C", glow: "#B8DC8C", pale: "#F1F8E6" };
const PLATE_GRASS = "linear-gradient(135deg, #5E9A1C, #3F6E12)";
const BG = <DotOrbitBg variant={6} />;
const CAFE = "#8D8796";

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

/* ───────── The city map (drawn) ───────── */

const MX = 110;
const MY = 430;
const MW = 860;
const MH = 800;
const STREETS = [
  "M0 260 C 200 240 420 300 860 250",
  "M0 520 C 260 500 560 560 860 500",
  "M180 0 C 200 260 160 520 220 800",
  "M520 0 C 500 300 560 560 520 800",
  "M760 0 C 720 200 760 420 700 800",
  "M0 120 L 300 400 L 520 380",
  "M520 640 L 860 700",
];
const CityMap: React.FC<{ frame: number; draw?: number; dim?: number; style?: React.CSSProperties }> = ({ draw = 1, dim = 0, style }) => (
  <div style={{ position: "absolute", left: MX, top: MY, width: MW, height: MH, ...SURFACE, borderRadius: 40, overflow: "hidden", ...style }}>
    <svg width={MW} height={MH} style={{ position: "absolute", inset: 0, opacity: 1 - 0.5 * dim }}>
      <rect width={MW} height={MH} fill={T.pale} />
      {Array.from({ length: 12 }, (_, i) => (
        <line key={`v${i}`} x1={i * 80} y1={0} x2={i * 80} y2={MH} stroke="#fff" strokeWidth={2} />
      ))}
      {Array.from({ length: 11 }, (_, i) => (
        <line key={`h${i}`} x1={0} y1={i * 80} x2={MW} y2={i * 80} stroke="#fff" strokeWidth={2} />
      ))}
      <path d="M340 0 C 300 150 420 260 380 420 C 340 600 460 680 420 800" fill="none" stroke={T.glow} strokeWidth={46} strokeLinecap="round" opacity={0.55 * draw} />
      <ellipse cx={680} cy={140} rx={110} ry={70} fill={T.glow} opacity={0.5 * draw} />
      <ellipse cx={110} cy={660} rx={90} ry={110} fill={T.glow} opacity={0.5 * draw} />
      {STREETS.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="#fff" strokeWidth={22} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - Math.min(1, Math.max(0, draw * 1.6 - i * 0.1))} />
      ))}
    </svg>
  </div>
);

/** Map pin (drawn), tip at (0, 0) of its container */
const Pin: React.FC<{ s?: number; color?: string; dashed?: boolean }> = ({ s = 1, color = T.vivid, dashed }) => (
  <svg width={64 * s} height={84 * s} viewBox="0 0 64 84" style={{ position: "absolute", left: -32 * s, top: -82 * s, overflow: "visible" }}>
    <path d="M32 82 C 32 82 4 50 4 32 A 28 28 0 0 1 60 32 C 60 50 32 82 32 82 Z" fill={dashed ? "rgba(255,255,255,0.6)" : color} stroke={dashed ? T.vivid : "#fff"} strokeWidth={dashed ? 4 : 5} strokeDasharray={dashed ? "8 7" : undefined} />
    {!dashed && <circle cx={32} cy={31} r={11} fill="#fff" />}
  </svg>
);
const At: React.FC<{ x: number; y: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ x, y, style, children }) => <div style={{ position: "absolute", left: MX + x, top: MY + y, width: 0, height: 0, ...style }}>{children}</div>;

/** Coffee marker (drawn cup in a circle) */
const CafeMark: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <svg width={64 * s} height={64 * s} viewBox="0 0 64 64" style={{ position: "absolute", left: -32 * s, top: -32 * s }}>
    <circle cx={32} cy={32} r={29} fill="#fff" stroke={CAFE} strokeWidth={3} />
    <path d="M18 26 H40 V36 A11 11 0 0 1 18 36 Z" fill={CAFE} />
    <circle cx={43} cy={32} r={5} fill="none" stroke={CAFE} strokeWidth={3} />
  </svg>
);

const PLACES = [
  { x: 200, y: 200 },
  { x: 640, y: 170 },
  { x: 270, y: 600 },
  { x: 660, y: 560 },
];
const CAFES = [
  [120, 110], [440, 140], [560, 300], [790, 330], [130, 420], [430, 540], [600, 690], [790, 720], [230, 720], [700, 60],
];

/* ───────── 1. Hook: a blank city map draws itself, the first Tatar pin drops on "карту" ───────── */

const Hook: React.FC<{ frame: number }> = ({ frame }) => {
  const first = fadeOut(frame, F.make - 10);
  const map = pop(frame, 4, SPRING.smooth);
  const draw = ease.inOut(progress(frame, 20, F.tatarMap));
  const pin = springAt(frame, F.map - 6, SPRING.bouncy);
  const pin2 = springAt(frame, F.city - 4, SPRING.bouncy);
  return (
    <>
      {first > 0 && <Title text="если бы я начинала *с нуля*" frame={frame} at={[-30, -26, -22, -18, F.scratch - 6, F.scratch]} size={80} style={{ opacity: first }} />}
      {frame >= F.make - 8 && <Title text="татарскую *карту* города" frame={frame} at={[F.tatarMap - 4, F.map, F.city]} size={88} />}
      <CityMap frame={frame} draw={draw} style={map.style} />
      {pin > 0 && (
        <At x={PLACES[0].x} y={PLACES[0].y} style={{ transform: `translateY(${(1 - Math.min(pin, 1)) * -200}px) scale(${Math.min(pin, 1.1)})` }}>
          <Pin s={1.6} />
        </At>
      )}
      {pin2 > 0 && (
        <At x={PLACES[3].x} y={PLACES[3].y} style={{ transform: `translateY(${(1 - Math.min(pin2, 1)) * -200}px) scale(${Math.min(pin2, 1.1)})` }}>
          <Pin s={1.6} />
        </At>
      )}
    </>
  );
};

/* ───────── 2. All the coffee shops nearby: 10 cups pop, Tatar places: 0 ───────── */

const Legend: React.FC<{ frame: number; cafes: number; tatar: number; showTatar: number }> = ({ cafes, tatar, showTatar }) => (
  <div style={{ position: "absolute", left: MX + 40, right: 1080 - MX - MW + 40, top: MY + MH - 140, height: 110, ...SURFACE, borderRadius: 55, display: "flex", alignItems: "center", justifyContent: "space-around" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
      <div style={{ position: "relative", width: 64, height: 64 }}>
        <div style={{ position: "absolute", left: 32, top: 32 }}>
          <CafeMark />
        </div>
      </div>
      <span style={{ ...NUMBER, fontSize: 64, color: INK }}>{cafes}</span>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 26, opacity: showTatar, transform: `scale(${0.8 + 0.2 * showTatar})` }}>
      <div style={{ position: "relative", width: 50, height: 66 }}>
        <div style={{ position: "absolute", left: 25, top: 66 }}>
          <Pin s={0.8} />
        </div>
      </div>
      <span style={{ ...NUMBER, fontSize: 64, color: T.main }}>{tatar}</span>
    </div>
  </div>
);
const Cafes: React.FC<{ frame: number }> = ({ frame }) => {
  const first = fadeOut(frame, F.places - 14);
  const n = count(frame, F.all, F.near + 14, 0, CAFES.length, (t) => t);
  const tatar = springAt(frame, F.tatars, SPRING.bouncy);
  const search = progress(frame, F.places, F.tatars + 10);
  return (
    <>
      {first > 0 && <Title text="все *кофейни* рядом" frame={frame} at={[F.all - 4, F.cafes, F.near]} size={96} style={{ opacity: first }} />}
      {frame >= F.places - 12 && <Title text="а *татарские* места" frame={frame} at={[F.places - 8, F.tatars - 10, F.tatars]} size={96} />}
      <CityMap frame={frame} />
      {CAFES.map(([x, y], i) => {
        const p = springAt(frame, F.all + i * ((F.near + 14 - F.all) / CAFES.length), SPRING.bouncy);
        return (
          <At key={i} x={x} y={y} style={{ transform: `scale(${p})` }}>
            <CafeMark s={1.5} />
          </At>
        );
      })}
      {/* search ring sweeping the map for Tatar places, finds nothing */}
      {search > 0 && search < 1 && <At x={430} y={360}><div style={{ position: "absolute", left: -560 * search, top: -560 * search, width: 1120 * search, height: 1120 * search, borderRadius: "50%", border: `6px solid ${T.vivid}`, opacity: 1 - search }} /></At>}
      <Legend frame={frame} cafes={n} tatar={0} showTatar={Math.min(1, tatar)} />
    </>
  );
};

/* ───────── 3. Mosque, culture center, echpochmak cafe, a street with a Tatar name: four place cards ───────── */

const Mosque: React.FC = () => (
  <svg width={200} height={170} viewBox="0 0 200 170">
    <rect x={30} y={96} width={140} height={66} rx={6} fill={T.vivid} />
    <path d="M50 98 C 50 50 150 50 150 98 Z" fill={T.main} />
    <path d="M100 34 V 52" stroke={T.main} strokeWidth={5} />
    <path d="M106 22 A 10 10 0 1 0 106 36 A 8 8 0 1 1 106 22 Z" fill={T.glow} />
    <rect x={160} y={40} width={22} height={122} rx={6} fill={T.main} />
    <path d="M158 42 L 171 14 L 184 42 Z" fill={T.vivid} />
    <path d="M86 162 V 128 A 14 14 0 0 1 114 128 V 162 Z" fill={T.pale} />
  </svg>
);
const Center: React.FC = () => (
  <svg width={200} height={170} viewBox="0 0 200 170">
    <path d="M14 62 L 100 14 L 186 62 Z" fill={T.main} />
    <rect x={20} y={62} width={160} height={14} fill={T.vivid} />
    {[36, 72, 108, 144].map((x) => (
      <rect key={x} x={x} y={80} width={20} height={66} rx={4} fill={T.glow} />
    ))}
    <rect x={10} y={146} width={180} height={16} rx={4} fill={T.vivid} />
  </svg>
);
const Echpochmak: React.FC = () => (
  <svg width={200} height={170} viewBox="0 0 200 170">
    <ellipse cx={100} cy={140} rx={90} ry={22} fill={T.pale} stroke={T.glow} strokeWidth={5} />
    <path d="M100 30 C 108 30 168 120 160 128 C 152 136 48 136 40 128 C 32 120 92 30 100 30 Z" fill={T.vivid} />
    <path d="M100 34 V 128 M44 126 L 100 92 L 156 126" fill="none" stroke={T.main} strokeWidth={5} strokeLinecap="round" />
    <circle cx={100} cy={92} r={8} fill={T.glow} />
  </svg>
);
const StreetSign: React.FC = () => (
  <svg width={200} height={170} viewBox="0 0 200 170">
    <rect x={94} y={70} width={12} height={96} rx={5} fill={T.main} />
    <rect x={14} y={14} width={172} height={74} rx={14} fill={T.vivid} stroke={T.main} strokeWidth={5} />
    <rect x={34} y={36} width={110} height={12} rx={6} fill="#fff" />
    <rect x={34} y={56} width={70} height={10} rx={5} fill={T.glow} />
    <path d="M154 38 L 170 51 L 154 64 Z" fill="#fff" />
  </svg>
);
const CARDS = [
  { G: Mosque, w: "мечеть", at: F.mosque - 4, x: 120, y: 420 },
  { G: Center, w: "центр", at: F.center + 10, x: 560, y: 420 },
  { G: Echpochmak, w: "кафе", at: F.cafe - 4, x: 120, y: 820 },
  { G: StreetSign, w: "улица", at: F.street - 4, x: 560, y: 820 },
];
const Places: React.FC<{ frame: number }> = ({ frame }) => (
  <>
    <Title text="татарские *места*" frame={frame} at={[F.listIn + 2, F.listIn + 8]} size={96} />
    {CARDS.map((c, i) => {
      const p = springAt(frame, c.at, SPRING.bouncy);
      const hop = i === 2 ? Math.max(0, Math.sin((frame - F.cafe - 14) / 5)) * 10 * progress(frame, F.cafe + 10, F.cafe + 20) * (1 - progress(frame, F.street - 10, F.street)) : 0;
      return (
        <div key={c.w} style={{ position: "absolute", left: c.x, top: c.y, width: 400, height: 360, ...SURFACE, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, transform: `translateY(${(1 - Math.min(p, 1)) * 120}px) scale(${0.8 + 0.2 * Math.min(p, 1.05)}) rotate(${(i % 2 ? 2 : -2) * Math.min(p, 1)}deg)`, opacity: Math.min(1, p * 1.6) }}>
          <div style={{ transform: `translateY(${-hop}px)` }}>
            <c.G />
          </div>
          <span style={{ ...PARAGRAPH, fontSize: 56, lineHeight: 1, fontWeight: 700, color: T.main }}>{c.w}</span>
        </div>
      );
    })}
  </>
);

/* ───────── 4. They're nearby: pins around "you", then they fade to dashed ghosts - not on your map ───────── */

const YOU = { x: 430, y: 380 };
const Near: React.FC<{ frame: number }> = ({ frame }) => {
  const ghost = ease.inOut(progress(frame, F.not - 6, F.not + 14));
  const pulse = ((frame - F.nearIn) / 50) % 1;
  return (
    <>
      <Title text="они *рядом*" frame={frame} at={[F.nearIn + 2, F.nearby]} size={96} />
      {frame >= F.just - 6 && <Title text="их *нет* на твоей карте" frame={frame} at={[F.just, F.not, F.not + 8, F.yourMap - 6, F.yourMap]} size={76} top={280} />}
      <CityMap frame={frame} dim={ghost * 0.4} />
      <At x={YOU.x} y={YOU.y}>
        {[0, 0.5].map((k) => {
          const r = ((pulse + k) % 1) * 300;
          return <div key={k} style={{ position: "absolute", left: -r, top: -r, width: r * 2, height: r * 2, borderRadius: "50%", border: `5px solid ${T.vivid}`, opacity: (1 - (pulse + k) % 1) * 0.7 }} />;
        })}
        <div style={{ position: "absolute", left: -30, top: -30, width: 60, height: 60, borderRadius: 30, background: T.main, border: "8px solid #fff", boxShadow: SURFACE.boxShadow, boxSizing: "border-box" }} />
      </At>
      {PLACES.map((pl, i) => {
        const p = springAt(frame, F.nearby - 6 + i * 5, SPRING.bouncy);
        return (
          <At key={i} x={pl.x} y={pl.y} style={{ transform: `scale(${Math.min(p, 1.1) * 1.5})` }}>
            <div style={{ position: "absolute", inset: 0, opacity: 1 - ghost }}>
              <Pin />
            </div>
            <div style={{ position: "absolute", inset: 0, opacity: ghost }}>
              <Pin dashed />
            </div>
          </At>
        );
      })}
    </>
  );
};

/* ───────── 5. Name one place: a big pin drops on the map, a label is being written ───────── */

const Name: React.FC<{ frame: number }> = ({ frame }) => {
  const drop = springAt(frame, F.place - 14, SPRING.bouncy);
  const hover = Math.sin((frame - F.ctaIn) / 10) * 14 * (1 - Math.min(1, drop));
  const label = pop(frame, F.place + 10, SPRING.bouncy);
  const typing = progress(frame, F.place + 18, F.yourCity + 20);
  const plate = pop(frame, F.comments - 4, SPRING.bouncy);
  const px = 430;
  const py = 470;
  return (
    <>
      <Title text="напиши одно *место*" frame={frame} at={[F.ctaIn + 2, F.one, F.place]} size={96} />
      <CityMap frame={frame} dim={0.5} />
      <At x={px} y={lerp(py - 230, py, Math.min(drop, 1.04)) + hover}>
        <Pin s={2.6} />
      </At>
      {/* shadow on the map */}
      <At x={px} y={py}>
        <div style={{ position: "absolute", left: -50, top: -14, width: 100, height: 28, borderRadius: "50%", background: "rgba(63,110,18,0.25)", transform: `scale(${0.5 + 0.5 * Math.min(drop, 1)})` }} />
      </At>
      {label.t > 0 && (
        <At x={px + 80} y={py - 210} style={label.style}>
          <div style={{ position: "absolute", left: 0, top: 0, width: 360, height: 120, ...SURFACE, borderRadius: 30, display: "flex", alignItems: "center", padding: "0 34px", boxSizing: "border-box", gap: 12 }}>
            <div style={{ width: 260 * typing, height: 22, borderRadius: 11, background: T.glow }} />
            <div style={{ width: 4, height: 50, background: T.vivid, opacity: Math.floor(frame / 12) % 2 }} />
          </div>
        </At>
      )}
      {plate.t > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 1080, display: "flex", justifyContent: "center", ...plate.style }}>
          <div style={{ transform: "scale(2.3)" }}>
            <GlassPlate bg={PLATE_GRASS}>
              <MessageCircle size={20} strokeWidth={2.2} /> в комментарии
            </GlassPlate>
          </div>
        </div>
      )}
    </>
  );
};

/* ───────── 6. A shared map: pins rain in from everyone, a path links them ───────── */

const SHARED = Array.from({ length: 22 }, (_, i) => {
  const a = i * 2.39996;
  const r = 60 + 330 * Math.sqrt((i + 0.5) / 22);
  return { x: 430 + Math.cos(a) * r * 1.05, y: 400 + Math.sin(a) * r * 0.95, c: [T.vivid, T.main][i % 2] };
}).filter((p) => p.x > 60 && p.x < MW - 60 && p.y > 100 && p.y < MH - 40);
const Build: React.FC<{ frame: number }> = ({ frame }) => {
  const link = ease.inOut(progress(frame, F.together - 10, F.together + 30));
  const order = [...SHARED].sort((a, b) => Math.atan2(a.y - 400, a.x - 430) - Math.atan2(b.y - 400, b.x - 430));
  return (
    <>
      <Title text="соберем общую *карту*" frame={frame} at={[F.buildIn + 2, F.shared, F.map2]} size={76} />
      <Title text="*вместе*" frame={frame} at={F.together} size={76} top={265} />
      <CityMap frame={frame} />
      <svg width={MW} height={MH} style={{ position: "absolute", left: MX, top: MY }}>
        <polyline points={order.map((p) => `${p.x},${p.y - 40}`).join(" ")} fill="none" stroke={T.main} strokeWidth={5} strokeDasharray="4 14" strokeLinecap="round" pathLength={1} opacity={0.6 * link} />
      </svg>
      {SHARED.map((p, i) => {
        const s = springAt(frame, F.buildIn + 4 + i * 4, SPRING.bouncy);
        return (
          <At key={i} x={p.x} y={p.y} style={{ transform: `translateY(${(1 - Math.min(s, 1)) * -160}px) scale(${Math.min(s, 1.1) * (1 + 0.12 * link * Math.max(0, Math.sin(frame / 6 + i)))})`, opacity: Math.min(1, s * 2) }}>
            <Pin s={1.1} color={p.c} />
          </At>
        );
      })}
    </>
  );
};

/* ───────── Composition ───────── */

const SCENES: SceneDef[] = [
  { range: [0, F.cafesIn], El: Hook },
  { range: [F.cafesIn, F.listIn], El: Cafes },
  { range: [F.listIn, F.nearIn], El: Places },
  { range: [F.nearIn, F.ctaIn], El: Near },
  { range: [F.ctaIn, F.buildIn], El: Name },
  { range: [F.buildIn, F.duration + 30], El: Build },
];

const SFX: Sfx[] = [
  { src: "sfx/07_CineStrike.wav", from: 2, volume: 0.18 },
  { src: "sfx2/pop.mp3", from: F.map - 6, volume: 0.22 },
  { src: "sfx2/pop.mp3", from: F.city - 4, volume: 0.2 },
  // scene changes: textures from the SFX/ library (no whoosh)
  { src: "sfx/01_Ripple_Textures.wav", from: F.cafesIn - 6, volume: 0.18 },
  { src: "sfx/04_Cyber_Shift.wav", from: F.listIn - 6, volume: 0.2 },
  { src: "sfx/06_Ripple_Textures_II.wav", from: F.nearIn - 6, volume: 0.2 },
  { src: "sfx/02_Alienated_Warpes.wav", from: F.ctaIn - 6, volume: 0.14 },
  { src: "sfx/01_Ripple_Textures.wav", from: F.buildIn - 6, volume: 0.18 },
  // 2. cafes pop, the search finds 0
  ...[0, 3, 6, 9].map((i) => ({ src: "sfx2/click.mp3", from: Math.round(F.all + i * ((F.near + 14 - F.all) / CAFES.length)), volume: 0.12 })),
  { src: "sfx/05_Distortion_Glitch.wav", from: F.tatars, volume: 0.04 },
  // 3. the four places
  ...CARDS.map((c) => ({ src: "sfx2/pop.mp3", from: c.at, volume: 0.2 })),
  // 4. nearby -> ghosts
  { src: "sfx2/ding.mp3", from: F.nearby, volume: 0.16 },
  { src: "sfx/03_Basscrack.wav", from: F.not, volume: 0.08 },
  // 5. the big pin
  { src: "sfx2/pop.mp3", from: F.comments - 4, volume: 0.2 },
  { src: "sfx2/click.mp3", from: F.place - 4, volume: 0.22 },
  // 6. pins rain in
  ...[0, 5, 10, 15].map((i) => ({ src: "sfx2/pop.mp3", from: F.buildIn + 4 + i * 4, volume: 0.12 })),
  { src: "sfx/07_CineStrike.wav", from: F.together, volume: 0.12 },
];

// All 30 poses of the main set, each at least once; never the same photo twice in a row
const AVATAR_KEYS: AvatarKey[] = [
  // 1. hook: from scratch, a Tatar map
  { at: 0, e: "dreamy" },
  { at: 40, e: "thinking" },
  { at: 80, e: "pensive" },
  { at: 120, e: "inspired" },
  { at: 160, e: "explaining" },
  { at: 200, e: "present-left" },
  { at: 235, e: "point-down" },
  // 2. coffee shops vs Tatar places
  { at: F.cafesIn, e: "smile-up" },
  { at: 300, e: "delighted" },
  { at: 340, e: "arms-crossed" },
  { at: 380, e: "puzzled" },
  { at: 420, e: "skeptical" },
  { at: 455, e: "shrug" },
  // 3. the four places
  { at: F.listIn, e: "point-up" },
  { at: 530, e: "surprised" },
  { at: 590, e: "laughing" },
  { at: 640, e: "thumbs-up" },
  { at: 690, e: "listening" },
  { at: 730, e: "hand-on-heart" },
  // 4. nearby, not on your map
  { at: F.nearIn, e: "point-right" },
  { at: 815, e: "disappointed" },
  { at: 855, e: "facepalm" },
  { at: 890, e: "displeased" },
  // 5. name one place
  { at: F.ctaIn, e: "stop" },
  { at: 960, e: "soft-smile" },
  { at: 1000, e: "shush" },
  { at: 1040, e: "heart-hands" },
  { at: 1080, e: "waving" },
  // 6. a shared map
  { at: F.buildIn, e: "clapping" },
  { at: 1180, e: "victory" },
];

const STANCES: StanceKey[] = [
  { at: 0, s: "center" },
  { at: F.cafesIn, s: "right" },
  { at: F.listIn, s: "left" },
  { at: F.nearIn, s: "right" },
  { at: F.ctaIn, s: "left" },
  { at: F.buildIn, s: "center" },
];

// Main set photos: scale the wide-framed ones so every photo fills the 540x590 box by height (same as V38)
const SIZE: Record<string, [number, number]> = {
  pensive: [1312, 1199], dreamy: [1293, 1217], displeased: [1254, 1254], surprised: [1280, 1229], waving: [1312, 1199], inspired: [1199, 1312], explaining: [1312, 1199], delighted: [1312, 1199], skeptical: [1312, 1199], laughing: [1385, 1136],
  puzzled: [1152, 1366], disappointed: [1278, 1230], "smile-up": [1199, 1312], thinking: [1190, 1322], "soft-smile": [1218, 1291], "point-up": [1312, 1199], "point-down": [1312, 1199], "present-left": [1312, 1199], "point-right": [1312, 1199], shrug: [1312, 1199],
  "hand-on-heart": [1312, 1199], stop: [1312, 1199], shush: [1312, 1199], clapping: [1278, 1230], "thumbs-up": [1312, 1199], "arms-crossed": [1312, 1199], facepalm: [1312, 1199], "heart-hands": [1312, 1199], victory: [1312, 1199], listening: [1312, 1199],
};
const FIT = Object.fromEntries(Object.entries(SIZE).map(([e, [w, h]]) => [e, Math.max(1, w / h / (540 / 590))])) as Partial<Record<Emotion, number>>;

const Host: React.FC<{ frame: number }> = ({ frame }) => <TatAvatar frame={frame} keys={AVATAR_KEYS} words={WORDS} stances={STANCES} fit={FIT} />;

export const Video48: React.FC = () => (
  <AbsoluteFill style={{ background: "#fff", fontFamily: PARAGRAPH.fontFamily, color: INK }}>
    <ReelShell scenes={SCENES} headlines={[]} vo={VO} sfx={SFX} duration={F.duration} music="v48/music/bed.mp3" musicLevel={[0.045, 0.11]} overlay={Host} bg={BG} />
  </AbsoluteFill>
);
