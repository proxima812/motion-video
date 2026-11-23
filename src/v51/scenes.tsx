import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Bookmark, Camera, CircleCheck, CircleDashed, Globe, Link, MapPin, MessageCircle, Search, Send, Tag } from "lucide-react";
import { SPRING, ease, lerp, progress, springAt } from "../stage/motion";
import { Pointer, ReelShell, count, pop, shake, type SceneDef, type Sfx, type Vo } from "../kit/reel";
import { TatDuo, type DuoHost, type Turn } from "../kit/TatDuo";
import { DotOrbitBg, type DotOrbitVariant } from "../kit/DotOrbitBg";
import { HEADING, INK, NUMBER, PARAGRAPH, SHADOW, SURFACE, WHITE } from "../kit/design";
import { GlassPlate } from "../catalog/own/glass";
import { Chip } from "../catalog/own/surfaces";
import { Mark } from "../catalog/own/text";

// Scenes of the tatarverse.cc presentation by two hosts in a dialog, written once for every language version
// (V51 RU emerald, V52 EN blue, ...): each version passes its beats (timeline.ts), voice, host keys, palette and
// on-screen strings through <Reel51 cfg>. Hook "this changes how you look for your people" -> where? right here:
// tatarverse.cc, a catalog of three peoples -> 410 centers in 53 countries, even Peru and Japan -> «Рядом с тобой»
// -> search by country / city / category -> links in the card -> save or print -> honestly, 151 cards are incomplete
// -> «Помочь дополнить» -> find your people nearby. Own kit only; the site UI is redrawn in the style of the site's own
// mockups (bars instead of text). GlassPlate x3: status (saved), CTA (help complete), link tatarverse.cc.

/** Named beats (frames, 60 fps): the same keys in every language, each at that language's word */
export type Beats = {
  duration: number;
  change: number; how: number; search: number; own: number;
  whereIn: number; where: number; look: number;
  hereIn: number; here: number; site: number; catalog: number; tatar: number; bashkir: number; crimean: number; centers: number; world: number;
  numIn: number; n410: number; centers2: number; n53: number; countries: number;
  evenIn: number; peru: number; japan: number;
  nearIn: number; nearest: number; open: number; nearby: number; siteSelf: number; gets: number; whereYou: number;
  searchIn: number; seek: number; country: number; city: number; category: number;
  cardIn: number; card: number; links: number; sites: number; socials: number; write: number; direct: number;
  saveIn: number; liked: number; save: number; print: number; list: number;
  honestIn: number; n151: number; cards: number; incomplete: number;
  helpIn: number; know: number; tap: number; help: number; fill: number; update: number; cardUpd: number;
  endIn: number; findIn: number; yours: number; near: number;
};
/** Heading on screen: *key* words in 700 + accent; `at` = one start (stagger) or a start per word */
export type TitleSpec = { text: string; at: number | number[]; size?: number };
export type Strings = {
  hook: TitleSpec; where: TitleSpec;
  hero: string; // the site's own slogan, inside the phone
  centers: string; countries: string; lima: string; tokyo: string;
  nearBtn: string; nearTitle: string; place: string; all: string; city: string;
  search: TitleSpec; chips: [string, string, string]; found: string;
  write: TitleSpec; hello: string;
  save: TitleSpec; saved: string;
  honest: TitleSpec; honestRest: TitleSpec;
  know: TitleSpec; incomplete: string; complete: string; cta: string; left: string;
  final: TitleSpec;
};
/** Accent triple + faces + the light neutrals tinted to it (gray dots, text bars, wells, muted icons) */
export type Palette = {
  main: string; vivid: string; glow: string; pale: string; mid: string; soft: string; plate: string;
  n: { gray: string; bar: string; barDark: string; well: string; wellHi: string; rim: string; muted: string; dash: string; dotFill: string };
};
export type Cfg51 = { F: Beats; VO: Vo[]; turns: Turn[]; T: Palette; bg: DotOrbitVariant; music: string; hosts: readonly [DuoHost, DuoHost]; S: Strings };

const Ctx = React.createContext<Cfg51 | null>(null);
const useCfg = () => {
  const c = React.useContext(Ctx);
  if (!c) throw new Error("Reel51: no config");
  return c;
};
const facesOf = (T: Palette) => [T.vivid, T.glow, T.main, T.mid, T.soft];
const EMOJI: React.CSSProperties = { fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", sans-serif', lineHeight: 1 };

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
const Title: React.FC<{ text: string; frame: number; at: number | number[]; stagger?: number; size?: number; top?: number; style?: React.CSSProperties }> = ({ text, frame, at, stagger = 3, size = 84, top = 170, style }) => {
  const { T } = useCfg();
  return (
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
};

const fadeOut = (frame: number, at: number, len = 10) => 1 - progress(frame, at, at + len);

/** Position along keyframes {f, x, y}, eased between neighbours */
const path = (keys: { f: number; x: number; y: number }[], frame: number) => {
  let x = keys[0].x;
  let y = keys[0].y;
  for (let i = 1; i < keys.length; i++) {
    if (frame < keys[i - 1].f) break;
    const t = ease.inOut(progress(frame, keys[i - 1].f, keys[i].f));
    x = lerp(keys[i - 1].x, keys[i].x, t);
    y = lerp(keys[i - 1].y, keys[i].y, t);
  }
  return { x, y };
};

/** A center's face (the site gives every center its own blob face): circle, two eyes, a smile */
const Face: React.FC<{ color: string; size: number; smile?: number; look?: [number, number]; style?: React.CSSProperties }> = ({ color, size, smile = 0.6, look = [0, 0], style }) => (
  <div style={{ position: "absolute", width: size, height: size, borderRadius: size / 2, background: color, ...style }}>
    {[0.33, 0.58].map((x) => (
      <div key={x} style={{ position: "absolute", left: `${(x + look[0] * 0.05) * 100}%`, top: `${(0.37 + look[1] * 0.05) * 100}%`, width: size * 0.09, height: size * 0.11, borderRadius: size, background: INK }} />
    ))}
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ position: "absolute", left: 0, top: 0 }}>
      <path d={`M37 ${64 - smile * 2} Q 50 ${64 + smile * 12} 63 ${64 - smile * 2}`} fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />
    </svg>
  </div>
);

/** Grey placeholder line of text (the site's own mockups draw text as bars) */
const Bar: React.FC<{ w: number | string; h?: number; c?: string; style?: React.CSSProperties }> = ({ w, h = 16, c, style }) => {
  const { T } = useCfg();
  return <div style={{ width: w, height: h, borderRadius: h / 2, background: c ?? T.n.bar, flex: "none", ...style }} />;
};

/** Country flag: emoji, Abkhazia drawn (no emoji flag for it) */
const Flag: React.FC<{ code: string; size: number }> = ({ code, size }) =>
  code === "AB" ? (
    <div style={{ width: size * 1.1, height: size * 0.78, borderRadius: size * 0.08, overflow: "hidden", position: "relative", background: `repeating-linear-gradient(180deg, #1F8A3B 0 ${size * 0.111}px, #fff ${size * 0.111}px ${size * 0.222}px)` }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: size * 0.44, height: size * 0.333, background: "#D52B1E" }} />
    </div>
  ) : (
    <span style={{ ...EMOJI, fontSize: size }}>{code}</span>
  );

/** Catalog card in miniature, as on the site's home: place, face, title, two lines, footer */
const MiniCard: React.FC<{ w: number; color: string; flag?: string; place?: string; style?: React.CSSProperties; corner?: React.ReactNode }> = ({ w, color, flag, place, style, corner }) => {
  const { F, T, S } = useCfg();
  const FACES = facesOf(T);
  const k = w / 440;
  return (
    <div style={{ ...SURFACE, width: w, padding: 26 * k, boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 16 * k, position: "relative", ...style }}>
      {corner}
      <div style={{ display: "flex", alignItems: "center", gap: 10 * k, height: 30 * k }}>
        {flag && <Flag code={flag} size={30 * k} />}
        {place ? <span style={{ ...PARAGRAPH, fontWeight: 500, fontSize: 26 * k, lineHeight: 1 }}>{place}</span> : <Bar w={130 * k} h={14 * k} />}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 * k }}>
        <Face color={color} size={64 * k} style={{ position: "relative", flex: "none" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 10 * k, flex: 1 }}>
          <Bar w="92%" h={18 * k} c={T.n.barDark} />
          <Bar w="58%" h={18 * k} c={T.n.barDark} />
        </div>
      </div>
      <Bar w="100%" h={13 * k} />
      <Bar w="70%" h={13 * k} />
    </div>
  );
};

/** Phone mockup rising into place at `at`: silver rim, thin dark bezel, white screen */
const PHONE = { x: 280, y: 280, w: 520, h: 980 };
const Phone: React.FC<{ frame: number; at: number; children: React.ReactNode }> = ({ frame, at, children }) => {
  const { F, T, S } = useCfg();
  const FACES = facesOf(T);
  const t = springAt(frame, at, SPRING.smooth);
  return (
    <div style={{ position: "absolute", left: PHONE.x, top: lerp(1950, PHONE.y, Math.min(t, 1.02)), width: PHONE.w, height: PHONE.h, borderRadius: 78, background: WHITE, border: "11px solid #1D1D22", boxShadow: `0 0 0 5px ${T.n.rim}, ${SHADOW}, 0 40px 80px -40px rgba(24,60,45,0.35)`, boxSizing: "border-box", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: "50%", top: 18, width: 132, height: 36, marginLeft: -66, borderRadius: 18, background: "#1D1D22", zIndex: 3 }} />
      {children}
    </div>
  );
};

/** Loading page: grey blocks that shimmer until the real page comes in */
const Skeleton: React.FC<{ frame: number; top: number }> = ({ frame, top }) => {
  const { F, T, S } = useCfg();
  const FACES = facesOf(T);
  const sh = (frame % 50) / 50;
  const block = (h: number, w: string | number, mt: number) => <div style={{ width: w, height: h, marginTop: mt, borderRadius: 18, background: `linear-gradient(100deg, ${T.n.well} ${sh * 100 - 30}%, ${T.n.wellHi} ${sh * 100}%, ${T.n.well} ${sh * 100 + 30}%)` }} />;
  return (
    <div style={{ position: "absolute", left: 38, right: 38, top, display: "flex", flexDirection: "column", alignItems: "center" }}>
      {block(54, "80%", 40)}
      {block(54, "56%", 16)}
      {block(190, "100%", 50)}
      {block(190, "100%", 26)}
    </div>
  );
};

/** One of the three peoples' signs (tt, bs, qt) on a white tile */
const Sign: React.FC<{ name: "tt" | "bs" | "qt"; size: number; style?: React.CSSProperties }> = ({ name, size, style }) => (
  <div style={{ ...SURFACE, borderRadius: size * 0.26, width: size, height: size, display: "grid", placeItems: "center", ...style }}>
    <Img src={staticFile(`tatarverse/icons/${name}.svg`)} style={{ width: size * 0.66, height: size * 0.66, objectFit: "contain" }} />
  </div>
);

/* ───────── 1. Hook: a magnifier over a grey crowd - inside it your people light up; "and where do I look?" ───────── */

const COLS = 9;
const crowdOf = (faces: string[]) => Array.from({ length: COLS * 8 }, (_, i) => ({ x: 140 + (i % COLS) * 100, y: 470 + Math.floor(i / COLS) * 100, own: (i * 37 + 11) % 7 < 3, c: faces[(i * 3) % faces.length] }));
// the lens path, tied to the words: wanders while the hook is spoken, rests on "своих", darts around on "where", dives in
const lensOf = (F: Beats) => [
  { f: 0, x: 330, y: 650 },
  { f: F.change + 30, x: 560, y: 770 },
  { f: F.own - 8, x: 700, y: 900 },
  { f: F.whereIn + 1, x: 700, y: 900 },
  { f: F.where + 10, x: 380, y: 1010 },
  { f: F.look + 7, x: 760, y: 640 },
  { f: F.hereIn - 26, x: 540, y: 820 },
];
const Hook: React.FC<{ frame: number }> = ({ frame }) => {
  const { F, T, S } = useCfg();
  const FACES = facesOf(T);
  const CROWD = crowdOf(FACES);
  const { x: lx, y: ly } = path(lensOf(F), frame);
  const found = springAt(frame, F.own, SPRING.bouncy);
  const dive = ease.in(progress(frame, F.hereIn - 24, F.hereIn + 2));
  const R = 150 + 22 * Math.min(found, 1) + dive * 1300;
  const jx = shake(frame, F.look, 14, 22);
  const cx = lx + jx;
  const zoom = 1.3;
  const q = springAt(frame, F.look - 2, SPRING.bouncy);
  const first = fadeOut(frame, F.whereIn - 8);
  return (
    <>
      {first > 0 && <Title text={S.hook.text} frame={frame} at={S.hook.at} size={S.hook.size ?? 80} style={{ opacity: first }} />}
      {frame >= F.whereIn - 8 && <Title text={S.where.text} frame={frame} at={S.where.at} size={S.where.size ?? 92} />}
      {/* the grey crowd */}
      {CROWD.map((d, i) => {
        const p = springAt(frame, -40 + i * 0.3, SPRING.smooth);
        return <div key={i} style={{ position: "absolute", left: d.x - 22, top: d.y - 22, width: 44, height: 44, borderRadius: 22, background: T.n.gray, transform: `scale(${Math.min(p, 1)})` }} />;
      })}
      {/* inside the lens: magnified, your people have faces */}
      <div style={{ position: "absolute", inset: 0, clipPath: `circle(${R}px at ${cx}px ${ly}px)` }}>
        <div style={{ position: "absolute", inset: 0, background: T.pale }} />
        <div style={{ position: "absolute", inset: 0, transformOrigin: `${cx}px ${ly}px`, transform: `scale(${zoom})` }}>
          {CROWD.map((d, i) => {
            if (!d.own) return <div key={i} style={{ position: "absolute", left: d.x - 22, top: d.y - 22, width: 44, height: 44, borderRadius: 22, background: T.n.gray }} />;
            const near = Math.hypot(d.x - cx, d.y - ly) < R / zoom + 60;
            const b = near ? 1 + 0.18 * Math.sin(Math.min(found, 1) * Math.PI) : 1;
            return <Face key={i} color={d.c} size={62} smile={0.4 + 0.5 * Math.min(found, 1)} look={[Math.sign(cx - d.x) * 0.6, 0]} style={{ left: d.x - 31, top: d.y - 31, transform: `scale(${b})` }} />;
          })}
        </div>
      </div>
      {/* the lens: rim + handle */}
      <div style={{ position: "absolute", left: cx - R, top: ly - R, width: R * 2, height: R * 2, borderRadius: R, border: "12px solid #fff", boxShadow: `${SHADOW}, inset 0 0 0 2px ${T.glow}`, boxSizing: "border-box", opacity: 1 - dive }} />
      <div style={{ position: "absolute", left: cx + R * 0.7 - 20, top: ly + R * 0.7 - 10, width: 40, height: 170, borderRadius: 20, background: T.main, transformOrigin: "20px 10px", transform: "rotate(-45deg)", opacity: 1 - dive }} />
      {/* "?" bubble on "искать" */}
      {q > 0 && (
        <div style={{ position: "absolute", left: cx + R * 0.55, top: ly - R - 70, width: 130, height: 130, borderRadius: 65, ...SURFACE, display: "grid", placeItems: "center", transform: `scale(${Math.min(q, 1.1)})`, opacity: 1 - dive }}>
          <span style={{ ...NUMBER, fontSize: 92, color: T.main }}>?</span>
        </div>
      )}
    </>
  );
};

/* ───────── 2. "Right here": a phone rises, the URL types itself, the site opens; the three peoples' signs ───────── */

const URL_TEXT = "tatarverse.cc";
const CARD_FLAGS = ["🇷🇺", "🇰🇿", "🇹🇷", "🇩🇪", "🇺🇸", "🇺🇿", "🇫🇮"];
const Reveal: React.FC<{ frame: number }> = ({ frame }) => {
  const { F, T, S } = useCfg();
  const FACES = facesOf(T);
  const typed = Math.round(lerp(0, URL_TEXT.length, progress(frame, F.site - 2, F.site + 74)));
  const hero = F.catalog - 10;
  const scroll = ease.inOut(progress(frame, F.centers - 6, F.world + 40)) * 340;
  const signs: ["tt" | "bs" | "qt", number, number, number][] = [
    ["tt", F.tatar, 110, 420],
    ["bs", F.bashkir, 820, 600],
    ["qt", F.crimean, 110, 790],
  ];
  return (
    <>
      <Phone frame={frame} at={F.here - 6}>
        {/* URL bar */}
        <div style={{ position: "absolute", left: 36, right: 36, top: 84, height: 76, borderRadius: 38, background: T.n.well, display: "flex", alignItems: "center", gap: 14, padding: "0 28px", boxSizing: "border-box" }}>
          <Globe size={30} color={T.main} strokeWidth={2.2} />
          <span style={{ ...PARAGRAPH, fontWeight: 500, fontSize: 34, lineHeight: 1 }}>{URL_TEXT.slice(0, typed)}</span>
          {frame < hero && <span style={{ width: 3, height: 36, background: T.vivid, opacity: Math.floor(frame / 12) % 2 }} />}
        </div>
        {/* page: shimmer while loading, then hero + catalog cards scrolling */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 190, bottom: 0, overflow: "hidden" }}>
          {frame < hero + 8 && (
            <div style={{ position: "absolute", inset: 0, opacity: fadeOut(frame, hero - 2, 10) }}>
              <Skeleton frame={frame} top={0} />
            </div>
          )}
          <div style={{ position: "absolute", left: 0, right: 0, top: -scroll }}>
            <Title text={S.hero} frame={frame} at={hero} stagger={6} size={70} top={40} style={{ left: 30, right: 30, lineHeight: 1.05 }} />
            {CARD_FLAGS.map((fl, i) => {
              const p = pop(frame, hero + 16 + i * 10, SPRING.smooth);
              return <MiniCard key={i} w={420} color={FACES[i % FACES.length]} flag={fl} style={{ position: "absolute", left: 38, top: 260 + i * 225, ...p.style }} />;
            })}
          </div>
        </div>
      </Phone>
      {signs.map(([name, at, x, y], i) => {
        const p = springAt(frame, at - 4, SPRING.bouncy);
        if (p <= 0) return null;
        return <Sign key={name} name={name} size={150} style={{ position: "absolute", left: x, top: y + Math.sin(frame / 28 + i * 2) * 8, transform: `scale(${Math.min(p, 1.08)}) rotate(${(i - 1) * 6 * (1 - Math.min(p, 1)) + (i === 1 ? 4 : -4)}deg)` }} />;
      })}
    </>
  );
};

/* ───────── 3. 410 centers in 53 countries: counters, a wall of flags; even Peru and Japan ───────── */

const FLAGS = ["🇷🇺", "🇰🇿", "🇺🇿", "🇹🇷", "🇺🇦", "🇰🇬", "🇺🇸", "🇩🇪", "🇵🇱", "🇱🇹", "🇨🇦", "🇦🇺", "🇫🇮", "🇪🇪", "🇧🇾", "🇦🇿", "🇹🇯", "🇱🇻", "🇦🇪", "🇬🇧", "🇧🇬", "🇷🇴", "🇨🇳", "AB", "🇦🇹", "🇦🇷", "🇦🇲", "🇦🇫", "🇧🇪", "🇭🇺", "🇬🇪", "🇪🇬", "🇮🇱", "🇮🇳", "🇮🇷", "🇮🇪", "🇪🇸", "🇮🇹", "🇲🇩", "🇳🇱", "🇵🇪", "🇵🇹", "🇷🇸", "🇸🇰", "🇸🇮", "🇹🇲", "🇫🇷", "🇨🇿", "🇨🇭", "🇸🇪", "🇿🇦", "🇰🇷", "🇯🇵"];
const PERU = FLAGS.indexOf("🇵🇪");
const JAPAN = FLAGS.indexOf("🇯🇵");
const TILE = 84;
const GAP = 12;
const tileXY = (i: number) => {
  const row = Math.floor(i / 9);
  const inRow = row === 5 ? FLAGS.length - 45 : 9;
  const x0 = 540 - (inRow * TILE + (inRow - 1) * GAP) / 2;
  return { x: x0 + (i % 9) * (TILE + GAP), y: 600 + row * (TILE + GAP) };
};
const Numbers: React.FC<{ frame: number }> = ({ frame }) => {
  const { F, T, S } = useCfg();
  const FACES = facesOf(T);
  const n410 = count(frame, F.n410 - 2, F.centers2 + 4, 0, 410);
  const n53 = count(frame, F.n53 - 2, F.countries + 6, 0, 53);
  const show53 = springAt(frame, F.n53 - 8, SPRING.smooth);
  const dim = 1 - 0.8 * ease.inOut(progress(frame, F.evenIn, F.evenIn + 20));
  const out = (i: number, at: number, to: { x: number; y: number }) => {
    const t = ease.inOut(progress(frame, at - 10, at + 14));
    const s = springAt(frame, at - 10, SPRING.bouncy);
    return { t, s, ...to };
  };
  const peru = out(PERU, F.peru, { x: 270, y: 830 });
  const japan = out(JAPAN, F.japan, { x: 810, y: 830 });
  const arc = progress(frame, F.japan + 6, F.japan + 40);
  return (
    <>
      {/* counters */}
      <div style={{ position: "absolute", left: 100, width: 420, top: 190, textAlign: "center", ...pop(frame, F.numIn + 2, SPRING.smooth).style }}>
        <div style={{ ...NUMBER, fontSize: 200, color: T.main }}>{n410}</div>
        <div style={{ ...PARAGRAPH, fontSize: 54, lineHeight: 1, marginTop: 22 }}>{S.centers}</div>
      </div>
      {show53 > 0 && (
        <div style={{ position: "absolute", left: 560, width: 420, top: 190, textAlign: "center", opacity: Math.min(1, show53 * 1.4), transform: `translateY(${(1 - Math.min(show53, 1)) * 40}px)` }}>
          <div style={{ ...NUMBER, fontSize: 200, color: T.main }}>{n53}</div>
          <div style={{ ...PARAGRAPH, fontSize: 54, lineHeight: 1, marginTop: 22 }}>{S.countries}</div>
        </div>
      )}
      {/* the wall: empty slots first (one per country), each fills with its flag as the counter runs */}
      {FLAGS.map((fl, i) => {
        const slot = springAt(frame, F.numIn + 8 + i * 0.8, SPRING.smooth);
        const born = F.n53 - 2 + ((F.countries + 6 - (F.n53 - 2)) * i) / 53;
        const p = springAt(frame, born, SPRING.bouncy);
        const { x, y } = tileXY(i);
        const fly = i === PERU ? peru : i === JAPAN ? japan : null;
        if (fly && fly.t > 0) return null;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, width: TILE, height: TILE, borderRadius: 22, background: p > 0 ? WHITE : T.n.well, border: "1px solid rgba(0,0,0,0.05)", display: "grid", placeItems: "center", opacity: dim * Math.min(1, slot * 1.5), transform: `scale(${Math.min(slot, 1) * (p > 0 ? 0.9 + 0.1 * Math.min(p, 1.1) : 0.92)})` }}>
            {p > 0 && (
              <div style={{ transform: `scale(${Math.min(p, 1.15)})` }}>
                <Flag code={fl} size={50} />
              </div>
            )}
          </div>
        );
      })}
      {/* Peru and Japan leave the wall: Lima and Tokyo, a dotted route with a plane between them */}
      {arc > 0 && (
        <svg width={1080} height={1300} style={{ position: "absolute", inset: 0 }}>
          <path d="M 270 630 Q 540 420 810 630" fill="none" stroke={T.vivid} strokeWidth={8} strokeLinecap="round" pathLength={1} strokeDasharray={`${arc} 1`} opacity={0.9} />
          {(() => {
            const u = arc;
            const px = (1 - u) * (1 - u) * 270 + 2 * (1 - u) * u * 540 + u * u * 810;
            const py = (1 - u) * (1 - u) * 630 + 2 * (1 - u) * u * 420 + u * u * 630;
            const ang = (Math.atan2(2 * (1 - u) * (420 - 630) + 2 * u * (630 - 420), 2 * (1 - u) * (540 - 270) + 2 * u * (810 - 540)) * 180) / Math.PI;
            return (
              <g transform={`translate(${px} ${py}) rotate(${ang + 45})`} opacity={1 - progress(arc, 0.92, 1)}>
                <circle r={34} fill={T.main} />
                <g transform="translate(-16 -16) scale(1.35)">
                  <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" fill="none" stroke={WHITE} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </g>
              </g>
            );
          })()}
        </svg>
      )}
      {[
        [peru, PERU, "🇵🇪", S.lima],
        [japan, JAPAN, "🇯🇵", S.tokyo],
      ].map(([fly, idx, fl, city]) => {
        const f = fly as typeof peru;
        if (f.t <= 0) return null;
        const from = tileXY(idx as number);
        const x = lerp(from.x + TILE / 2, f.x, f.t);
        const y = lerp(from.y + TILE / 2, f.y, f.t);
        const k = lerp(TILE, 340, f.t) / 340;
        return (
          <div key={city as string} style={{ position: "absolute", left: x - 170, top: y - 190, width: 340, height: 380, ...SURFACE, borderRadius: 40, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 30, transform: `scale(${k * Math.min(f.s, 1.06) / Math.max(Math.min(f.s, 1.06), 0.01)})` }}>
            <Flag code={fl as string} size={150} />
            <span style={{ ...PARAGRAPH, fontWeight: 700, fontSize: 60, lineHeight: 1, opacity: progress(f.t, 0.6, 1) }}>{city as string}</span>
          </div>
        );
      })}
    </>
  );
};

/* ───────── 4. «Рядом с тобой»: tap it, the page figures out the country and city, Almaty's centers come up ───────── */

const Nearby: React.FC<{ frame: number }> = ({ frame }) => {
  const { F, T, S } = useCfg();
  const FACES = facesOf(T);
  const tap = F.nearby + 4;
  const page = ease.inOut(progress(frame, tap + 4, tap + 22));
  const located = springAt(frame, F.gets - 2, SPRING.bouncy);
  const radar = frame < F.gets ? 1 : 1 - progress(frame, F.gets, F.gets + 10);
  const PX = PHONE.x + 12;
  const PY = PHONE.y + 12;
  return (
    <>
      <Phone frame={frame} at={F.nearIn + 2}>
        {/* before the tap: the home page with the «Рядом с тобой» button */}
        <div style={{ position: "absolute", inset: 0, transform: `translateX(${-page * 100}%)` }}>
          <div style={{ position: "absolute", left: 36, top: 84, display: "flex", alignItems: "center", gap: 14 }}>
            <Img src={staticFile("tatarverse/logo.svg")} style={{ width: 52, height: 52 }} />
          </div>
          <Title text={S.hero} frame={frame} at={F.nearIn + 10} size={66} top={190} style={{ left: 30, right: 30 }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 420, display: "flex", justifyContent: "center", ...pop(frame, F.open - 20, SPRING.bouncy).style }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "26px 34px", borderRadius: 999, background: frame >= tap ? T.main : INK, color: WHITE, ...PARAGRAPH, fontWeight: 500, fontSize: 34, lineHeight: 1, transform: `scale(${1 - 0.06 * Math.sin(progress(frame, tap - 4, tap + 6) * Math.PI)})` }}>
              <MapPin size={34} color={WHITE} strokeWidth={2.2} />
              <span style={{ color: WHITE }}>{S.nearBtn}</span>
            </div>
          </div>
          {[0, 1].map((i) => (
            <MiniCard key={i} w={420} color={FACES[i + 2]} style={{ position: "absolute", left: 38, top: 560 + i * 225 }} />
          ))}
        </div>
        {/* after the tap: «Центры рядом» */}
        <div style={{ position: "absolute", inset: 0, transform: `translateX(${(1 - page) * 100}%)` }}>
          <div style={{ ...HEADING, fontWeight: 700, position: "absolute", left: 36, top: 92, fontSize: 52 }}>{S.nearTitle}</div>
          {/* detecting: the pin pulses */}
          {radar > 0 && (
            <div style={{ position: "absolute", left: 0, right: 0, top: 230, height: 360, opacity: radar }}>
              {[0, 1, 2].map((k) => {
                const r = ((frame + k * 20) % 60) / 60;
                return <div key={k} style={{ position: "absolute", left: 248 - 30 - r * 140, top: 180 - 30 - r * 140, width: 60 + r * 280, height: 60 + r * 280, borderRadius: "50%", border: `5px solid ${T.glow}`, opacity: 1 - r }} />;
              })}
              <div style={{ position: "absolute", left: 248 - 50, top: 180 - 50, width: 100, height: 100, borderRadius: 50, background: T.main, display: "grid", placeItems: "center" }}>
                <MapPin size={52} color={WHITE} strokeWidth={2.2} />
              </div>
            </div>
          )}
          {/* found: Kazakhstan, Almaty, city chips, the cards */}
          {located > 0 && (
            <>
              <div style={{ position: "absolute", left: 36, top: 190, display: "flex", alignItems: "center", gap: 16, transform: `scale(${Math.min(located, 1.06)})`, transformOrigin: "0 50%" }}>
                <Flag code="🇰🇿" size={48} />
                <span style={{ ...PARAGRAPH, fontWeight: 700, fontSize: 40, lineHeight: 1 }}>{S.place}</span>
              </div>
              <div style={{ position: "absolute", left: 36, top: 278, display: "flex", gap: 14 }}>
                {[
                  [S.all, "44", false],
                  [S.city, "4", true],
                ].map(([name, n, on], i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 24px", borderRadius: 999, background: on ? T.main : T.n.well, color: on ? WHITE : INK, ...PARAGRAPH, fontWeight: 500, fontSize: 30, lineHeight: 1, ...pop(frame, F.gets + 6 + i * 6, SPRING.bouncy).style }}>
                    <span style={{ color: on ? WHITE : INK }}>{name as string}</span>
                    <span style={{ ...NUMBER, fontSize: 26, fontWeight: 500, color: on ? T.pale : T.n.muted }}>{n as string}</span>
                  </div>
                ))}
              </div>
              {[0, 1, 2].map((i) => (
                <MiniCard key={i} w={420} color={FACES[(i + 1) % FACES.length]} flag="🇰🇿" style={{ position: "absolute", left: 38, top: 380 + i * 225, ...pop(frame, F.gets + 18 + i * 7, SPRING.smooth).style }} />
              ))}
            </>
          )}
        </div>
      </Phone>
      <Pointer frame={frame} keys={[{ f: F.nearIn + 30, x: 860, y: 1150 }, { f: tap - 8, x: PX + 330, y: PY + 450 }, { f: tap + 30, x: PX + 380, y: PY + 520 }]} clicks={[tap]} show={[F.open - 26, tap + 34]} />
    </>
  );
};

/* ───────── 5. Or search: country, city, category chips, the result count shrinks to Almaty's own ───────── */

const stepsOf = (F: Beats) => [
  { at: F.country, n: 44, cards: 4 },
  { at: F.city, n: 4, cards: 3 },
  { at: F.category, n: 3, cards: 2 },
];
const SearchScene: React.FC<{ frame: number }> = ({ frame }) => {
  const { F, T, S } = useCfg();
  const FACES = facesOf(T);
  const STEPS = stepsOf(F);
  const done = STEPS.filter((s) => frame >= s.at + 8);
  const n = done.length ? done[done.length - 1].n : 410;
  const from = done.length > 1 ? done[done.length - 2].n : 410;
  const last = done.length ? done[done.length - 1].at + 8 : 0;
  const shown = count(frame, last, last + 18, from, n);
  const cards = done.length ? done[done.length - 1].cards : 6;
  const bar = pop(frame, F.searchIn + 4, SPRING.smooth);
  return (
    <>
      <Title text={S.search.text} frame={frame} at={S.search.at} size={S.search.size ?? 92} />
      {/* search field */}
      <div style={{ position: "absolute", left: 100, right: 100, top: 330, height: 120, ...SURFACE, borderRadius: 60, display: "flex", alignItems: "center", gap: 24, padding: "0 40px", boxSizing: "border-box", ...bar.style }}>
        <Search size={48} color={T.main} strokeWidth={2.4} />
        <Bar w={360} h={20} />
        <span style={{ width: 4, height: 50, background: T.vivid, opacity: Math.floor(frame / 12) % 2 }} />
      </div>
      {/* filter chips: each pops and gets selected on its word */}
      <div style={{ position: "absolute", left: 100, right: 100, top: 500, display: "flex", justifyContent: "center", gap: 18 }}>
        <Chip frame={frame} at={F.country - 6} on={F.country + 6} accent={T.main} size={36} icon={Globe}>{S.chips[0]}</Chip>
        <Chip frame={frame} at={F.city - 6} on={F.city + 6} accent={T.main} size={36} icon={MapPin}>{S.chips[1]}</Chip>
      </div>
      <div style={{ position: "absolute", left: 100, right: 100, top: 610, display: "flex", justifyContent: "center" }}>
        <Chip frame={frame} at={F.category - 6} on={F.category + 6} accent={T.main} size={36} icon={Tag}>{S.chips[2]}</Chip>
      </div>
      {/* found: N, the cards thin out (the last ones slide to the middle) */}
      <div style={{ position: "absolute", left: 100, right: 100, top: 760, display: "flex", alignItems: "baseline", justifyContent: "center", gap: 24, ...pop(frame, F.searchIn + 10, SPRING.smooth).style }}>
        <span style={{ ...PARAGRAPH, fontSize: 56, lineHeight: 1 }}>{S.found}</span>
        <span style={{ ...NUMBER, fontSize: 120, color: T.main, transform: `scale(${1 + 0.12 * Math.sin(progress(frame, last, last + 14) * Math.PI)})`, display: "inline-block" }}>{shown}</span>
      </div>
      {Array.from({ length: 6 }, (_, i) => {
        const gone = i >= cards;
        const goneAt = STEPS.find((s) => s.cards <= i)?.at ?? 99999;
        const o = gone ? 1 - progress(frame, goneAt + 8, goneAt + 18) : 1;
        if (o <= 0) return null;
        const p = pop(frame, F.searchIn + 14 + i * 4, SPRING.smooth);
        // when only 2-3 cards are left they gather into one centered column
        const gather = ease.inOut(progress(frame, F.category + 10, F.category + 30));
        const x = lerp(i % 2 ? 560 : 120, 340, gather);
        const y = lerp(930 + Math.floor(i / 2) * 140, 930 + i * 140, gather);
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, opacity: o, filter: o < 1 ? `blur(${(1 - o) * 10}px)` : undefined }}>
            <div style={p.style}>
              <div style={{ ...SURFACE, width: 400, height: 126, padding: 24, boxSizing: "border-box", display: "flex", alignItems: "center", gap: 20 }}>
                <Face color={FACES[i % FACES.length]} size={76} style={{ position: "relative", flex: "none" }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
                  <Bar w="90%" h={18} c={T.n.barDark} />
                  <Bar w="60%" h={14} />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};

/* ───────── 6. In the card: links to websites and socials; write directly - «Сәлам» goes out ───────── */

const linksOf = (F: Beats, T: Palette) => [
  { icon: Globe, at: F.sites, c: T.main },
  { icon: Send, at: F.socials, c: "#1E8FD6" },
  { icon: Camera, at: F.socials + 7, c: "#D9417C" },
  { icon: MessageCircle, at: F.socials + 14, c: "#1DA851" },
];
const CardScene: React.FC<{ frame: number }> = ({ frame }) => {
  const { F, T, S } = useCfg();
  const FACES = facesOf(T);
  const card = pop(frame, F.cardIn + 4, SPRING.smooth);
  const click = F.direct + 4;
  const bubble = springAt(frame, click + 8, SPRING.bouncy);
  const read = springAt(frame, click + 34, SPRING.snappy);
  return (
    <>
      <Title text={S.write.text} frame={frame} at={S.write.at} size={S.write.size ?? 92} />
      <div style={{ position: "absolute", left: 140, right: 140, top: 330, ...SURFACE, borderRadius: 40, padding: 44, boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 30, ...card.style }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Flag code="🇰🇿" size={44} />
          <Bar w={220} h={20} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
          <Face color={T.vivid} size={130} smile={0.8} style={{ position: "relative", flex: "none" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
            <Bar w="95%" h={30} c={T.n.barDark} />
            <Bar w="62%" h={30} c={T.n.barDark} />
          </div>
        </div>
        <Bar w="100%" h={18} />
        <Bar w="82%" h={18} />
        {/* links */}
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 6, ...pop(frame, F.links - 6, SPRING.smooth).style }}>
          <Link size={34} color={T.main} strokeWidth={2.4} />
          <Bar w={150} h={18} c={T.glow} />
        </div>
        <div style={{ display: "flex", gap: 26 }}>
          {linksOf(F, T).map(({ icon: Icon, at, c }, i) => {
            const p = springAt(frame, at - 4, SPRING.bouncy);
            const press = i === 1 ? Math.sin(progress(frame, click - 4, click + 8) * Math.PI) : 0;
            return (
              <div key={i} style={{ width: 128, height: 128, borderRadius: 64, background: c, display: "grid", placeItems: "center", transform: `scale(${Math.min(p, 1.1) * (1 - 0.08 * press)})`, boxShadow: "0 18px 36px -18px rgba(0,0,0,0.35)" }}>
                <Icon size={58} color={WHITE} strokeWidth={2.2} />
              </div>
            );
          })}
        </div>
      </div>
      {/* the message leaves the Telegram button */}
      {bubble > 0 && (
        <div style={{ position: "absolute", left: 360, top: lerp(900, 940, Math.min(1, bubble)), display: "flex", alignItems: "center", gap: 16, padding: "28px 40px", borderRadius: "10px 40px 40px 40px", background: "#1E8FD6", transform: `scale(${Math.min(bubble, 1.06)})`, transformOrigin: "0% 0%" }}>
          <span style={{ ...PARAGRAPH, fontWeight: 700, fontSize: 56, lineHeight: 1, color: WHITE }}>{S.hello}</span>
          <svg width={52} height={30} viewBox="0 0 52 30" style={{ opacity: Math.min(1, read * 1.4) }}>
            <path d="M3 16 L11 25 L27 5 M21 21 L25 25 L45 5" fill="none" stroke={WHITE} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
      {/* Telegram button center: card x 140 + padding 44 + (128 + 26) + 64 = 402, y 768 + 64 = 832 */}
      <Pointer frame={frame} keys={[{ f: F.write - 20, x: 900, y: 1180 }, { f: click - 8, x: 408, y: 840 }, { f: click + 40, x: 640, y: 1150 }]} clicks={[click]} show={[F.write - 20, F.duration]} />
    </>
  );
};

/* ───────── 7. Like it? Bookmark it (saved +1) or print the list (sheets with a PDF tag) ───────── */

const SaveScene: React.FC<{ frame: number }> = ({ frame }) => {
  const { F, T, S } = useCfg();
  const FACES = facesOf(T);
  const click = F.save + 6;
  const saved = springAt(frame, click, SPRING.bouncy);
  const plate = pop(frame, click + 10, SPRING.bouncy);
  const sheets = [0, 1, 2].map((i) => ease.out(progress(frame, F.print - 6 + i * 8, F.print + 24 + i * 8)));
  const pdf = springAt(frame, F.list - 2, SPRING.bouncy);
  return (
    <>
      <Title text={S.save.text} frame={frame} at={S.save.at} size={S.save.size ?? 84} />
      {/* the card with a bookmark */}
      <div style={{ position: "absolute", left: 100, top: 380, ...pop(frame, F.saveIn + 4, SPRING.smooth).style }}>
        <MiniCard
          w={430}
          color={T.vivid}
          flag="🇰🇿"
          corner={
            <div style={{ position: "absolute", right: 22, top: 18, width: 70, height: 70, borderRadius: 35, background: saved > 0.5 ? T.pale : T.n.well, display: "grid", placeItems: "center", transform: `scale(${1 + 0.25 * Math.sin(Math.min(saved, 1) * Math.PI)})` }}>
              <Bookmark size={38} color={saved > 0.5 ? T.main : T.n.muted} fill={saved > 0.5 ? T.main : "none"} strokeWidth={2.4} />
            </div>
          }
        />
        {plate.t > 0 && (
          <div style={{ position: "absolute", left: 0, right: 0, top: 340, display: "flex", justifyContent: "center", ...plate.style }}>
            <div style={{ transform: "scale(1.9)" }}>
              <GlassPlate bg={T.plate}>
                <Bookmark size={19} strokeWidth={2.4} /> {S.saved}
              </GlassPlate>
            </div>
          </div>
        )}
      </div>
      {/* the printed list */}
      <div style={{ position: "absolute", left: 590, top: 360, width: 390, height: 560 }}>
        {[2, 1, 0].map((i) => {
          const t = sheets[i];
          if (t <= 0) return null;
          return (
            <div key={i} style={{ position: "absolute", left: i * 14, top: lerp(-200, i * 22, t), width: 340, height: 460, ...SURFACE, borderRadius: 18, padding: 30, boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 22, opacity: Math.min(1, t * 2), transform: `rotate(${(i - 1) * 3}deg)` }}>
              <Bar w="70%" h={20} c={T.n.barDark} />
              {["🇷🇺", "🇰🇿", "🇺🇿", "🇹🇷", "🇩🇪", "🇺🇸"].map((fl, k) => (
                <div key={k} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <Flag code={fl} size={30} />
                  <Bar w={`${80 - (k % 3) * 14}%`} h={14} />
                </div>
              ))}
            </div>
          );
        })}
        {pdf > 0 && (
          <div style={{ position: "absolute", left: 230, top: 400, padding: "18px 26px", borderRadius: 20, background: "#D93F3F", transform: `scale(${Math.min(pdf, 1.08)}) rotate(-6deg)`, boxShadow: "0 18px 36px -18px rgba(0,0,0,0.35)" }}>
            <span style={{ ...NUMBER, fontSize: 52, color: WHITE, letterSpacing: "0" }}>PDF</span>
          </div>
        )}
      </div>
      <Pointer frame={frame} keys={[{ f: F.saveIn + 20, x: 620, y: 1180 }, { f: click - 8, x: 470, y: 440 }, { f: click + 40, x: 520, y: 520 }]} clicks={[click]} show={[F.saveIn + 20, F.print - 10]} />
    </>
  );
};

/* ───────── 8. Honestly: 410 dots, 259 fill in, 151 stay grey - those cards need help ───────── */

const GRID_COLS = 20;
const ORDER = Array.from({ length: 410 }, (_, i) => i).sort((a, b) => ((a * 7919) % 410) - ((b * 7919) % 410));
const RANK = new Map(ORDER.map((d, k) => [d, k]));
const dotXY = (i: number) => ({ x: 158 + (i % GRID_COLS) * 39, y: 520 + Math.floor(i / GRID_COLS) * 37 });
const Honest: React.FC<{ frame: number }> = ({ frame }) => {
  const { F, T, S } = useCfg();
  const FACES = facesOf(T);
  const fillA = F.honestIn + 26;
  const filled = Math.round(lerp(0, 259, ease.inOut(progress(frame, fillA, F.n151 - 4))));
  const pulse = frame >= F.n151 ? 1 + 0.25 * Math.sin(progress(frame, F.n151, F.n151 + 20) * Math.PI) : 1;
  const first = fadeOut(frame, F.n151 - 10);
  return (
    <>
      {first > 0 && <Title text={S.honest.text} frame={frame} at={S.honest.at} size={S.honest.size ?? 100} style={{ opacity: first }} />}
      {frame >= F.n151 - 10 && (
        <div style={{ ...HEADING, position: "absolute", left: 100, right: 100, top: 170, textAlign: "center", fontSize: 84 }}>
          <span style={{ ...pop(frame, F.n151 - 6, SPRING.bouncy).style, display: "inline-block" }}>
            <Mark frame={frame} at={F.n151} color={T.main}>
              <span style={{ ...NUMBER, fontSize: 96, color: undefined }}>151</span>
            </Mark>
          </span>{" "}
          <Title text={S.honestRest.text} frame={frame} at={S.honestRest.at} size={S.honestRest.size ?? 84} top={110} style={{ left: 0, right: 0, position: "absolute" }} />
        </div>
      )}
      {Array.from({ length: 410 }, (_, i) => {
        const { x, y } = dotXY(i);
        const p = springAt(frame, F.honestIn + 2 + (i % GRID_COLS) * 0.6 + Math.floor(i / GRID_COLS) * 0.6, SPRING.smooth);
        const done = (RANK.get(i) ?? 0) < filled;
        const empty = (RANK.get(i) ?? 0) >= 259;
        const help = frame >= F.n151 && empty;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: 28, height: 28, borderRadius: 14, boxSizing: "border-box", background: done ? T.vivid : help ? T.n.dotFill : WHITE, border: done ? "none" : `3px ${help ? "dashed" : "solid"} ${help ? T.n.dash : T.n.gray}`, transform: `scale(${Math.min(p, 1) * (empty ? pulse : 1)})` }} />;
      })}
    </>
  );
};

/* ───────── 9. Know such a center? «Помочь дополнить» -> the card is filled in: 151 -> 150 ───────── */

const Help: React.FC<{ frame: number }> = ({ frame }) => {
  const { F, T, S } = useCfg();
  const FACES = facesOf(T);
  const click = F.fill + 4;
  const plate = pop(frame, F.tap - 4, SPRING.bouncy);
  const press = Math.sin(progress(frame, click - 4, click + 8) * Math.PI);
  const send = ease.inOut(progress(frame, click + 6, F.update - 4));
  const fixed = springAt(frame, F.update, SPRING.bouncy);
  const on = fixed > 0.5;
  const left = count(frame, F.cardUpd, F.cardUpd + 16, 151, 150);
  const counter = pop(frame, F.update + 14, SPRING.bouncy);
  return (
    <>
      <Title text={S.know.text} frame={frame} at={S.know.at} size={S.know.size ?? 84} />
      <div style={{ position: "absolute", left: 140, right: 140, top: 310, ...SURFACE, borderRadius: 40, padding: 44, boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 28, ...pop(frame, F.helpIn + 4, SPRING.smooth).style }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Flag code="🇰🇿" size={44} />
          <Bar w={220} h={20} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
          <Face color={on ? T.vivid : T.n.gray} size={120} smile={on ? 0.8 : -0.2} style={{ position: "relative", flex: "none", transform: `scale(${on ? 1 + 0.1 * Math.sin(Math.min(fixed, 1) * Math.PI) : 1})` }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
            <Bar w="92%" h={28} c={T.n.barDark} />
            <Bar w="58%" h={28} c={T.n.barDark} />
          </div>
        </div>
        <Bar w="100%" h={18} />
        {on ? <Bar w="86%" h={18} style={{ transform: `scaleX(${Math.min(1, fixed)})`, transformOrigin: "0 50%" }} /> : <Bar w="86%" h={18} c="transparent" style={{ border: `3px dashed ${T.n.gray}`, boxSizing: "border-box" }} />}
        <div style={{ display: "flex", gap: 18, height: 92 }}>
          {[Globe, Send].map((Icon, i) =>
            on ? (
              <div key={i} style={{ width: 92, height: 92, borderRadius: 46, background: i ? "#1E8FD6" : T.main, display: "grid", placeItems: "center", transform: `scale(${Math.min(springAt(frame, F.update + 6 + i * 6, SPRING.bouncy), 1.1)})` }}>
                <Icon size={44} color={WHITE} strokeWidth={2.2} />
              </div>
            ) : (
              <div key={i} style={{ width: 92, height: 92, borderRadius: 46, border: `3px dashed ${T.n.gray}`, boxSizing: "border-box" }} />
            ),
          )}
        </div>
        {/* status: incomplete -> complete */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, padding: 26, borderRadius: 24, background: on ? T.pale : T.n.well }}>
          {on ? <CircleCheck size={52} color={T.main} strokeWidth={2.4} /> : <CircleDashed size={52} color={T.n.muted} strokeWidth={2.4} />}
          <span style={{ ...PARAGRAPH, fontWeight: 700, fontSize: 44, lineHeight: 1, color: on ? T.main : INK }}>{on ? S.complete : S.incomplete}</span>
        </div>
      </div>
      {/* CTA, then the count of cards that still need help */}
      {plate.t > 0 && frame < F.update + 24 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 1040, display: "flex", justifyContent: "center", ...plate.style, opacity: (plate.style.opacity as number) * fadeOut(frame, F.update + 8, 14) }}>
          <div style={{ transform: `scale(${2.2 * (1 - 0.06 * press)})` }}>
            <GlassPlate bg={T.plate}>
              <Send size={19} strokeWidth={2.4} /> {S.cta}
            </GlassPlate>
          </div>
        </div>
      )}
      {counter.t > 0 && (
        <div style={{ position: "absolute", left: 100, right: 100, top: 1030, display: "flex", alignItems: "baseline", justifyContent: "center", gap: 24, ...counter.style }}>
          <span style={{ ...NUMBER, fontSize: 130, color: T.main }}>{left}</span>
          <span style={{ ...PARAGRAPH, fontSize: 56, lineHeight: 1 }}>{S.left}</span>
        </div>
      )}
      {/* the link flies from the button into the card */}
      {send > 0 && send < 1 && (
        <div style={{ position: "absolute", left: 540 - 50, top: lerp(1060, 700, send) - 50, width: 100, height: 100, borderRadius: 50, background: "#1E8FD6", display: "grid", placeItems: "center", transform: `scale(${1 - 0.4 * send})`, opacity: 1 - progress(send, 0.8, 1) }}>
          <Link size={48} color={WHITE} strokeWidth={2.4} />
        </div>
      )}
      <Pointer frame={frame} keys={[{ f: F.tap - 20, x: 880, y: 1290 }, { f: click - 8, x: 690, y: 1080 }, { f: click + 40, x: 760, y: 1170 }]} clicks={[click]} show={[F.tap - 20, F.update + 6]} />
    </>
  );
};

/* ───────── 10. tatarverse.cc - find your people nearby ───────── */

// your people: faces run in from both sides and gather under the title
const gatherOf = (T: Palette) => [
  { x: 210, y: 1010, s: 120, c: T.vivid },
  { x: 380, y: 1120, s: 100, c: T.glow },
  { x: 540, y: 990, s: 130, c: T.main },
  { x: 700, y: 1120, s: 100, c: T.mid },
  { x: 870, y: 1010, s: 120, c: T.glow },
  { x: 290, y: 1230, s: 84, c: T.soft },
  { x: 540, y: 1200, s: 96, c: T.vivid },
  { x: 790, y: 1230, s: 84, c: T.main },
];
const Final: React.FC<{ frame: number }> = ({ frame }) => {
  const { F, T, S } = useCfg();
  const FACES = facesOf(T);
  const logo = springAt(frame, F.endIn, SPRING.bouncy);
  const plate = pop(frame, F.endIn + 8, SPRING.bouncy);
  return (
    <>
      <Img src={staticFile("tatarverse/logo.svg")} style={{ position: "absolute", left: 540 - 70, top: 190, width: 140, height: 153, opacity: Math.min(1, logo * 2), transform: `scale(${0.6 + 0.4 * Math.min(logo, 1.05)}) rotate(${(1 - Math.min(logo, 1)) * -30}deg)` }} />
      {plate.t > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 420, display: "flex", justifyContent: "center", ...plate.style }}>
          <div style={{ transform: "scale(2.6)" }}>
            <GlassPlate bg={T.plate}>
              <Globe size={19} strokeWidth={2.4} /> tatarverse.cc
            </GlassPlate>
          </div>
        </div>
      )}
      <Title text={S.final.text} frame={frame} at={S.final.at} size={S.final.size ?? 104} top={620} />
      {gatherOf(T).map((g, i) => {
        const from = g.x < 540 ? -260 : g.x > 540 ? 1340 : 540;
        const t = ease.out(progress(frame, F.findIn - 30 + i * 5, F.near + 4 + i * 3));
        if (t <= 0) return null;
        const x = lerp(from, g.x, t);
        const y = g.x === 540 ? lerp(1500, g.y, t) : g.y - Math.sin(t * Math.PI) * 60;
        const happy = springAt(frame, F.near + 6 + i * 2, SPRING.bouncy);
        return <Face key={i} color={g.c} size={g.s} smile={0.3 + 0.6 * Math.min(happy, 1)} look={[Math.sign(540 - g.x) * 0.7, -0.4]} style={{ left: x - g.s / 2, top: y - g.s / 2 + Math.sin(frame / 14 + i) * 4, border: "6px solid #fff", boxSizing: "border-box", boxShadow: SHADOW }} />;
      })}
    </>
  );
};

/* ───────── Composition ───────── */

/** Slow push-in over each scene, so the frame never stands still */
const drift = (El: React.FC<{ frame: number }>, [a, b]: readonly [number, number]): React.FC<{ frame: number }> => {
  const D: React.FC<{ frame: number }> = ({ frame }) => (
    <AbsoluteFill style={{ transformOrigin: "540px 720px", transform: `scale(${1 + 0.035 * ease.inOut(progress(frame, a, b))})` }}>
      <El frame={frame} />
    </AbsoluteFill>
  );
  return D;
};

const scenesOf = (F: Beats): SceneDef[] =>
  (
  [
    [[0, F.hereIn], Hook],
    [[F.hereIn, F.numIn], Reveal],
    [[F.numIn, F.nearIn], Numbers],
    [[F.nearIn, F.searchIn], Nearby],
    [[F.searchIn, F.cardIn], SearchScene],
    [[F.cardIn, F.saveIn], CardScene],
    [[F.saveIn, F.honestIn], SaveScene],
    [[F.honestIn, F.helpIn], Honest],
    [[F.helpIn, F.endIn], Help],
    [[F.endIn, F.duration + 30], Final],
  ] as const
).map(([range, El]) => ({ range, El: drift(El, range) }));

const sfxOf = (F: Beats): Sfx[] => [
  { src: "sfx/07_CineStrike.wav", from: 2, volume: 0.16 },
  { src: "sfx2/pop.mp3", from: F.own, volume: 0.2 },
  { src: "sfx2/pop.mp3", from: F.look - 2, volume: 0.18 },
  // scene changes: textures from the SFX/ library (no whoosh)
  { src: "sfx/01_Ripple_Textures.wav", from: F.hereIn - 10, volume: 0.18 },
  { src: "sfx/04_Cyber_Shift.wav", from: F.numIn - 8, volume: 0.2 },
  { src: "sfx/06_Ripple_Textures_II.wav", from: F.nearIn - 8, volume: 0.2 },
  { src: "sfx/02_Alienated_Warpes.wav", from: F.searchIn - 8, volume: 0.14 },
  { src: "sfx/01_Ripple_Textures.wav", from: F.cardIn - 8, volume: 0.18 },
  { src: "sfx/04_Cyber_Shift.wav", from: F.saveIn - 8, volume: 0.18 },
  { src: "sfx/06_Ripple_Textures_II.wav", from: F.honestIn - 8, volume: 0.2 },
  { src: "sfx/02_Alienated_Warpes.wav", from: F.helpIn - 8, volume: 0.14 },
  { src: "sfx/01_Ripple_Textures.wav", from: F.endIn - 8, volume: 0.18 },
  // 2. the URL, the site, three signs
  { src: "sfx2/typing.mp3", from: F.site, volume: 0.1 },
  { src: "sfx2/pop.mp3", from: F.catalog - 10, volume: 0.18 },
  { src: "sfx2/pop.mp3", from: F.tatar - 4, volume: 0.18 },
  { src: "sfx2/pop.mp3", from: F.bashkir - 4, volume: 0.18 },
  { src: "sfx2/pop.mp3", from: F.crimean - 4, volume: 0.18 },
  // 3. counters land, the wall, Peru and Japan
  { src: "sfx/03_Basscrack.wav", from: F.centers2 + 4, volume: 0.07 },
  { src: "sfx2/ding.mp3", from: F.countries + 6, volume: 0.16 },
  { src: "sfx2/pop.mp3", from: F.peru - 6, volume: 0.2 },
  { src: "sfx2/pop.mp3", from: F.japan - 6, volume: 0.2 },
  // 4. tap «Рядом с тобой», location found
  { src: "sfx2/click.mp3", from: F.nearby + 4, volume: 0.24 },
  { src: "sfx2/ding.mp3", from: F.gets - 2, volume: 0.18 },
  // 5. chips
  { src: "sfx2/click.mp3", from: F.country + 6, volume: 0.2 },
  { src: "sfx2/click.mp3", from: F.city + 6, volume: 0.2 },
  { src: "sfx2/click.mp3", from: F.category + 6, volume: 0.2 },
  // 6. link buttons, the message
  { src: "sfx2/pop.mp3", from: F.sites - 4, volume: 0.16 },
  { src: "sfx2/pop.mp3", from: F.socials - 4, volume: 0.16 },
  { src: "sfx2/click.mp3", from: F.direct + 4, volume: 0.24 },
  { src: "sfx2/pop.mp3", from: F.direct + 12, volume: 0.2 },
  // 7. bookmark, print
  { src: "sfx2/click.mp3", from: F.save + 6, volume: 0.24 },
  { src: "sfx2/pop.mp3", from: F.save + 16, volume: 0.2 },
  { src: "sfx2/typing.mp3", from: F.print - 4, volume: 0.1 },
  { src: "sfx2/pop.mp3", from: F.list - 2, volume: 0.2 },
  // 8. 151
  { src: "sfx/03_Basscrack.wav", from: F.n151, volume: 0.08 },
  // 9. help: CTA, click, the card is filled in
  { src: "sfx2/pop.mp3", from: F.tap - 4, volume: 0.2 },
  { src: "sfx2/click.mp3", from: F.fill + 4, volume: 0.24 },
  { src: "sfx2/ding.mp3", from: F.update, volume: 0.2 },
  { src: "sfx/07_CineStrike.wav", from: F.cardUpd + 4, volume: 0.1 },
  // 10. final
  { src: "sfx/07_CineStrike.wav", from: F.endIn + 2, volume: 0.14 },
  { src: "sfx2/pop.mp3", from: F.near + 6, volume: 0.18 },
];

const Hosts: React.FC<{ frame: number }> = ({ frame }) => {
  const { turns, hosts } = useCfg();
  return <TatDuo frame={frame} turns={turns} hosts={hosts} />;
};

/** The whole reel for one language version (no outro: withOutro adds it in Root) */
export const Reel51: React.FC<{ cfg: Cfg51 }> = ({ cfg }) => {
  const scenes = React.useMemo(() => scenesOf(cfg.F), [cfg]);
  const sfx = React.useMemo(() => sfxOf(cfg.F), [cfg]);
  return (
    <Ctx.Provider value={cfg}>
      <AbsoluteFill style={{ background: "#fff", fontFamily: PARAGRAPH.fontFamily, color: INK }}>
        <ReelShell scenes={scenes} headlines={[]} vo={cfg.VO} sfx={sfx} duration={cfg.F.duration} music={cfg.music} musicLevel={[0.045, 0.11]} overlay={Hosts} bg={<DotOrbitBg variant={cfg.bg} />} />
      </AbsoluteFill>
    </Ctx.Provider>
  );
};
