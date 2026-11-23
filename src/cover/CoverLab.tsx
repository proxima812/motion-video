import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Clock, Croissant, Flame, Heart, MapPin, ShoppingBag, Soup, Sparkles as SparkIcon, Timer, Users } from "lucide-react";
import { loadFont as unbounded } from "@remotion/google-fonts/Unbounded";
import { loadFont as inter } from "@remotion/google-fonts/Inter";
import { loadFont as caveat } from "@remotion/google-fonts/Caveat";
import { loadFont as montserrat } from "@remotion/google-fonts/Montserrat";
import { loadFont as prata } from "@remotion/google-fonts/Prata";
import { loadFont as russo } from "@remotion/google-fonts/RussoOne";
import { loadFont as rubikMono } from "@remotion/google-fonts/RubikMonoOne";
import { ShaderWarpCream } from "@/components/remocn/shader-warp-cream";

// Cover lab: 10 cover concepts for @the_tatarverse (different structure and decoration), Still "CoverLab" with prop n = 1..10.
// Rules: the host photo stands at the bottom sunk 50 px (bottom: -50, the photo's cut never shows);
// everything except the host stays inside the safe zone 1010x1250 centered (x 35..1045, y 335..1585); safe = true draws it.
// Decorations are static SVG/CSS takes on web UI effects (grid / dot pattern, ripple, meteors, retro grid, border beam,
// sparkles, aurora text) plus topic SVG drawn by the meaning of each reel. Render: bun scripts/cover-lab.mjs.

const C = ["latin", "cyrillic"] as ("latin" | "cyrillic")[];
export const UNB = unbounded("normal", { weights: ["500", "700", "900"], subsets: C }).fontFamily;
export const INTER = inter("normal", { weights: ["400", "500", "700", "800"], subsets: C }).fontFamily;
export const HAND = caveat("normal", { weights: ["700"], subsets: C }).fontFamily;
export const MONT = montserrat("normal", { weights: ["800", "900"], subsets: C }).fontFamily;
export const SERIF = prata("normal", { subsets: C }).fontFamily;
export const RUSSO = russo("normal", { subsets: C }).fontFamily;
export const MONO = rubikMono("normal", { subsets: C }).fontFamily;

export const SAFE = { l: 35, t: 335, w: 1010, h: 1250 };

/* ───────── shared pieces ───────── */

export type Host = "ahu" | "alicja" | "kamilya" | "alsu";
export const Avatar: React.FC<{ host: Host; pose: string; h?: number; x?: number; mirror?: boolean; sticker?: string; glow?: string }> = ({ host, pose, h = 900, x = 540, mirror, sticker, glow }) => {
  const o = 6;
  const outline = sticker ? [`${o}px 0`, `-${o}px 0`, `0 ${o}px`, `0 -${o}px`, `${o}px ${o}px`, `-${o}px -${o}px`, `${o}px -${o}px`, `-${o}px ${o}px`].map((d) => `drop-shadow(${d} 0 ${sticker})`).join(" ") : "";
  const shadow = glow ? `drop-shadow(0 0 40px ${glow})` : "drop-shadow(0 30px 40px rgba(20,10,40,0.18))";
  return <Img src={staticFile(`quad/${host}/${pose}.png`)} style={{ position: "absolute", bottom: -50, left: x, height: h, width: "auto", transform: `translateX(-50%)${mirror ? " scaleX(-1)" : ""}`, filter: `${outline} ${shadow}`.trim(), zIndex: 5 }} />;
};

export const Logo: React.FC<{ y?: number; size?: number; color?: string }> = ({ y = SAFE.t + 10, size = 64, color }) => (
  <div style={{ position: "absolute", top: y, left: 540 - size / 2, width: size, height: size, zIndex: 6 }}>
    {color ? (
      <div style={{ width: size, height: size, background: color, WebkitMaskImage: `url(${staticFile("tatarverse/logo.svg")})`, WebkitMaskSize: "contain", WebkitMaskRepeat: "no-repeat", WebkitMaskPosition: "center" }} />
    ) : (
      <Img src={staticFile("tatarverse/logo.svg")} style={{ width: size, height: size, objectFit: "contain" }} />
    )}
  </div>
);

const STAR = "M12 0C13 8 16 11 24 12C16 13 13 16 12 24C11 16 8 13 0 12C8 11 11 8 12 0Z";
/** Sparkles: 4-point stars */
export const Sparkles: React.FC<{ items: [number, number, number][]; color: string; opacity?: number }> = ({ items, color, opacity = 1 }) => (
  <>
    {items.map(([x, y, s], i) => (
      <svg key={i} viewBox="0 0 24 24" width={s} height={s} style={{ position: "absolute", left: x - s / 2, top: y - s / 2, opacity, zIndex: 4 }}>
        <path d={STAR} fill={color} />
      </svg>
    ))}
  </>
);

/** Grid pattern faded by a radial mask */
export const GridPattern: React.FC<{ color: string; size?: number; at?: string }> = ({ color, size = 72, at = "50% 35%" }) => (
  <AbsoluteFill style={{ backgroundImage: `linear-gradient(${color} 1.5px, transparent 1.5px), linear-gradient(90deg, ${color} 1.5px, transparent 1.5px)`, backgroundSize: `${size}px ${size}px`, backgroundPosition: "center", maskImage: `radial-gradient(70% 45% at ${at}, #000 30%, transparent 100%)`, WebkitMaskImage: `radial-gradient(70% 45% at ${at}, #000 30%, transparent 100%)` }} />
);

/** Dot pattern */
export const DotPattern: React.FC<{ color: string; size?: number; r?: number; mask?: boolean }> = ({ color, size = 36, r = 2.5, mask = true }) => (
  <AbsoluteFill style={{ backgroundImage: `radial-gradient(${color} ${r}px, transparent ${r + 0.5}px)`, backgroundSize: `${size}px ${size}px`, ...(mask ? { maskImage: "radial-gradient(75% 55% at 50% 40%, #000 35%, transparent 100%)", WebkitMaskImage: "radial-gradient(75% 55% at 50% 40%, #000 35%, transparent 100%)" } : null) }} />
);

/** Ripple: concentric circles fading out */
export const Ripple: React.FC<{ x: number; y: number; color: string; n?: number; step?: number; base?: number }> = ({ x, y, color, n = 7, step = 130, base = 220 }) => (
  <>
    {Array.from({ length: n }, (_, i) => {
      const r = base + i * step;
      return <div key={i} style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: "50%", border: `2px solid ${color}`, background: i === 0 ? color.replace(/[\d.]+\)$/, "0.08)") : undefined, opacity: 1 - i / n }} />;
    })}
  </>
);

/** Meteors: thin diagonal streaks with a bright head */
export const Meteors: React.FC<{ items: [number, number, number][]; color: string }> = ({ items, color }) => (
  <>
    {items.map(([x, y, len], i) => (
      <div key={i} style={{ position: "absolute", left: x, top: y, width: len, height: 2, transform: "rotate(215deg)", transformOrigin: "0 0", background: `linear-gradient(90deg, ${color}, transparent)`, boxShadow: `0 0 10px ${color}` }}>
        <div style={{ position: "absolute", left: -3, top: -3, width: 8, height: 8, borderRadius: "50%", background: "#fff", boxShadow: `0 0 12px 3px ${color}` }} />
      </div>
    ))}
  </>
);

/** Retro grid: neon floor in perspective */
export const RetroGrid: React.FC<{ color: string; top?: number }> = ({ color, top = 980 }) => (
  <div style={{ position: "absolute", left: -600, right: -600, top, bottom: -200, perspective: 420, overflow: "hidden" }}>
    <div style={{ position: "absolute", inset: 0, transform: "rotateX(62deg)", transformOrigin: "50% 0", backgroundImage: `linear-gradient(${color} 2px, transparent 2px), linear-gradient(90deg, ${color} 2px, transparent 2px)`, backgroundSize: "90px 90px", maskImage: "linear-gradient(transparent, #000 25%)", WebkitMaskImage: "linear-gradient(transparent, #000 25%)" }} />
  </div>
);

/** Card with a border beam (a bright arc running along the rim) */
export const BeamCard: React.FC<{ style?: React.CSSProperties; beam: [string, string]; children: React.ReactNode }> = ({ style, beam, children }) => (
  <div style={{ position: "relative", borderRadius: 44, padding: 3, background: `conic-gradient(from 200deg, transparent 0 55%, ${beam[0]} 70%, ${beam[1]} 80%, transparent 92%)`, boxShadow: "0 40px 80px -30px rgba(60,20,90,0.45)", ...style }}>
    <div style={{ borderRadius: 41, background: "rgba(255,255,255,0.62)", backdropFilter: "blur(26px) saturate(1.6)", WebkitBackdropFilter: "blur(26px) saturate(1.6)", border: "1px solid rgba(255,255,255,0.8)", padding: "44px 48px" }}>{children}</div>
  </div>
);

export const grad = (g: string): React.CSSProperties => ({ backgroundImage: g, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" });

/* ───────── 1. Timer · V60 «Я на минутку» · Ahu ───────── */
const C1: React.FC = () => (
  <AbsoluteFill style={{ background: "linear-gradient(180deg, #FFFFFF 0%, #FFF3EC 60%, #FFE2D3 100%)" }}>
    <GridPattern color="rgba(224,104,63,0.16)" />
    <Ripple x={540} y={1560} color="rgba(224,104,63,0.35)" base={260} step={120} />
    {/* clock faces drifting in the back */}
    <Clock size={190} color="#E0683F" strokeWidth={1.2} style={{ position: "absolute", left: 60, top: 960, opacity: 0.18, transform: "rotate(-14deg)" }} />
    <Timer size={150} color="#E0683F" strokeWidth={1.2} style={{ position: "absolute", right: 70, top: 900, opacity: 0.2, transform: "rotate(12deg)" }} />
    <Logo color="#A9472A" size={56} />
    <div style={{ position: "absolute", top: 450, left: 0, right: 0, textAlign: "center", fontFamily: INTER, fontWeight: 500, fontSize: 64, color: "#3A2A24" }}>
      Я <span style={{ fontFamily: HAND, fontSize: 92, color: "#E0683F" }}>на минутку</span>
    </div>
    <div style={{ position: "absolute", top: 580, left: 0, right: 0, textAlign: "center", fontFamily: UNB, fontWeight: 500, fontSize: 70, color: "#B8A49C", textDecoration: "line-through", textDecorationColor: "#E5484D", textDecorationThickness: 8 }}>00:01</div>
    <div style={{ position: "absolute", top: 700, left: 0, right: 0, textAlign: "center", fontFamily: UNB, fontWeight: 900, fontSize: 150, letterSpacing: "-0.04em", lineHeight: 1, ...grad("linear-gradient(180deg, #E0683F, #A9472A)") }}>4:00:00</div>
    <Sparkles color="#E0683F" items={[[150, 700, 46], [930, 640, 36], [880, 900, 26]]} />
    <Avatar host="ahu" pose="laughing" h={880} />
  </AbsoluteFill>
);

/* ───────── 2. Sticker pop · V61 «Чак-чак в аэрогриле» · Alicja ───────── */
export const Honey: React.FC<{ x: number; y: number; s: number; r?: number }> = ({ x, y, s, r = 0 }) => (
  <svg viewBox="0 0 40 52" width={s} height={s * 1.3} style={{ position: "absolute", left: x, top: y, transform: `rotate(${r}deg)` }}>
    <path d="M20 2C20 2 4 24 4 34a16 16 0 0 0 32 0C36 24 20 2 20 2Z" fill="#F2A900" stroke="#1D1A14" strokeWidth="3" />
    <ellipse cx="13" cy="33" rx="3.5" ry="6" fill="#FFE07A" />
  </svg>
);
const C2: React.FC = () => (
  <AbsoluteFill style={{ background: "#FFD84D" }}>
    <DotPattern color="rgba(29,26,20,0.18)" size={40} r={3} mask={false} />
    {/* sunburst behind the title */}
    <svg viewBox="-100 -100 200 200" width={1500} height={1500} style={{ position: "absolute", left: -210, top: -40, opacity: 0.22 }}>
      {Array.from({ length: 24 }, (_, i) => <path key={i} d="M0 0 L-9 -100 L9 -100Z" fill="#fff" transform={`rotate(${i * 15})`} />)}
    </svg>
    <Honey x={70} y={560} s={64} r={-12} />
    <Honey x={920} y={520} s={56} r={14} />
    <Honey x={860} y={980} s={44} r={-6} />
    <div style={{ position: "absolute", top: 400, left: 0, right: 0, textAlign: "center", transform: "rotate(-4deg)" }}>
      <span style={{ fontFamily: MONO, fontSize: 132, color: "#1D1A14", WebkitTextStroke: "0px", textShadow: "6px 6px 0 #fff, -6px -6px 0 #fff, 6px -6px 0 #fff, -6px 6px 0 #fff, 0 6px 0 #fff, 0 -6px 0 #fff, 6px 0 0 #fff, -6px 0 0 #fff, 14px 16px 0 #1D1A14" }}>ЧАК-ЧАК</span>
    </div>
    <div style={{ position: "absolute", top: 610, left: 140, transform: "rotate(5deg)", background: "#FF4F8B", color: "#fff", fontFamily: MONT, fontWeight: 900, fontSize: 72, padding: "18px 40px", borderRadius: 28, border: "6px solid #1D1A14", boxShadow: "10px 12px 0 #1D1A14" }}>в аэрогриле?!</div>
    <div style={{ position: "absolute", top: 790, left: 650, width: 250, height: 250, borderRadius: "50%", background: "#fff", border: "6px solid #1D1A14", boxShadow: "8px 10px 0 #1D1A14", transform: "rotate(-10deg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: UNB, fontWeight: 900, color: "#1D1A14" }}>
      <div style={{ fontSize: 96, lineHeight: 1 }}>12</div>
      <div style={{ fontSize: 34, fontWeight: 700 }}>минут</div>
    </div>
    <div style={{ position: "absolute", top: 860, left: 120, transform: "rotate(-6deg)", background: "#1D1A14", color: "#FFD84D", fontFamily: HAND, fontSize: 64, padding: "6px 30px", borderRadius: 16 }}>позор рода</div>
    <Avatar host="alicja" pose="surprised" h={860} sticker="#FFFFFF" />
  </AbsoluteFill>
);

/* ───────── 3. Speech bubble · V62 «Ты поела?» · Kamilya ───────── */
const C3: React.FC = () => (
  <AbsoluteFill style={{ background: "radial-gradient(70% 50% at 20% 20%, #CFF3E0 0%, transparent 70%), radial-gradient(60% 45% at 90% 60%, #A8E2C6 0%, transparent 70%), #F2FBF6" }}>
    <DotPattern color="rgba(24,115,79,0.22)" size={34} />
    <Soup size={120} color="#2FA572" strokeWidth={1.3} style={{ position: "absolute", left: 70, top: 1000, opacity: 0.35, transform: "rotate(-10deg)" }} />
    <Heart size={90} color="#E5484D" fill="#E5484D" style={{ position: "absolute", right: 110, top: 1010, opacity: 0.85, transform: "rotate(14deg)" }} />
    <Heart size={54} color="#E5484D" fill="#E5484D" style={{ position: "absolute", right: 70, top: 930, opacity: 0.55, transform: "rotate(-8deg)" }} />
    <Logo color="#18734F" size={56} />
    <div style={{ position: "absolute", top: 530, left: 90, right: 90 }}>
      <div style={{ position: "relative", background: "#fff", borderRadius: 64, padding: "70px 40px 64px", textAlign: "center", boxShadow: "0 40px 70px -30px rgba(24,115,79,0.45)" }}>
        <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 116, letterSpacing: "-0.04em", lineHeight: 1, ...grad("linear-gradient(90deg, #2FA572, #18734F)") }}>Ашадыңмы</div>
        <div style={{ fontFamily: INTER, fontWeight: 500, fontSize: 44, color: "#6F8279", marginTop: 24 }}>вместо привет и как дела</div>
        <svg viewBox="0 0 80 70" width={110} height={96} style={{ position: "absolute", left: "50%", marginLeft: -55, bottom: -80 }}>
          <path d="M0 0 H80 L18 70 Z" fill="#fff" />
        </svg>
      </div>
    </div>
    <div style={{ position: "absolute", top: 420, left: 0, right: 0, textAlign: "center", fontFamily: HAND, fontSize: 70, color: "#18734F", transform: "rotate(-3deg)" }}>язык любви апы</div>
    <Avatar host="kamilya" pose="proud" h={860} />
  </AbsoluteFill>
);

/* ───────── 4. Ornament · V63 «Татарский за 20 секунд» · Alsu ───────── */
const TULIP = "M20 4C14 10 12 18 14 26c-4-4-10-5-14-3 2 8 9 14 18 14h4c9 0 16-6 18-14-4-2-10-1-14 3 2-8 0-16-6-22Z";
const C4: React.FC = () => (
  <AbsoluteFill style={{ background: "radial-gradient(80% 60% at 50% 35%, #7A1E36 0%, #4A0F22 70%, #3A0A1A 100%)" }}>
    {/* tulip pattern */}
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: 0.1 }}>
      <defs>
        <pattern id="tul" width="120" height="120" patternUnits="userSpaceOnUse">
          <path d={TULIP} fill="#E9C46A" transform="translate(20 30) scale(1.2)" />
          <path d={TULIP} fill="#E9C46A" transform="translate(80 90) scale(0.7)" />
        </pattern>
      </defs>
      <rect width="1080" height="1920" fill="url(#tul)" />
    </svg>
    {/* ornate frame inside the safe zone */}
    <div style={{ position: "absolute", left: 85, top: 380, width: 910, height: 700, border: "3px solid #E9C46A", borderRadius: 28 }} />
    <div style={{ position: "absolute", left: 105, top: 400, width: 870, height: 660, border: "1.5px solid rgba(233,196,106,0.55)", borderRadius: 20 }} />
    {[[85, 380], [995, 380], [85, 1080], [995, 1080]].map(([x, y], i) => (
      <svg key={i} viewBox="0 0 44 44" width={70} height={70} style={{ position: "absolute", left: x - 35, top: y - 35 }}>
        <circle cx="22" cy="22" r="20" fill="#4A0F22" stroke="#E9C46A" strokeWidth="2" />
        <path d={TULIP} fill="#E9C46A" transform="translate(9 8) scale(0.65)" />
      </svg>
    ))}
    <Logo color="#E9C46A" y={450} size={64} />
    <div style={{ position: "absolute", top: 560, left: 0, right: 0, textAlign: "center", fontFamily: SERIF, fontSize: 118, color: "#FBEFD9", lineHeight: 1 }}>Татарский</div>
    <div style={{ position: "absolute", top: 690, left: 0, right: 0, textAlign: "center", fontFamily: HAND, fontSize: 104, color: "#E9C46A", lineHeight: 1 }}>за 20 секунд</div>
    <div style={{ position: "absolute", top: 880, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 22 }}>
      {[["әйе", "да"], ["әни", "мама"]].map(([a, b]) => (
        <div key={a} style={{ border: "2px solid #E9C46A", borderRadius: 999, padding: "14px 34px", fontFamily: INTER, fontWeight: 500, fontSize: 40, color: "#FBEFD9" }}>
          <b style={{ color: "#E9C46A" }}>{a}</b> = {b}
        </div>
      ))}
    </div>
    <Sparkles color="#E9C46A" items={[[170, 1200, 34], [920, 1160, 28], [960, 1320, 18]]} opacity={0.8} />
    <Avatar host="alsu" pose="proud" h={820} glow="rgba(233,196,106,0.35)" />
  </AbsoluteFill>
);

/* ───────── 5. Form + stamp · V64 «Собеседование у апы» · Ahu ───────── */
const C5: React.FC = () => (
  <AbsoluteFill style={{ background: "#E9EEF6" }}>
    <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(70,100,160,0.14) 2px, transparent 2px)", backgroundSize: "100% 56px" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center", fontFamily: UNB, fontWeight: 900, fontSize: 84, color: "#1F2A44", lineHeight: 1.05 }}>
      Собеседование
      <div style={{ fontFamily: HAND, fontWeight: 700, fontSize: 96, color: "#C62828" }}>у апы</div>
    </div>
    <div style={{ position: "absolute", left: 120, top: 600, width: 840, transform: "rotate(-2.5deg)", background: "#FFFDF7", borderRadius: 20, padding: "40px 48px", boxShadow: "0 30px 60px -24px rgba(31,42,68,0.45)" }}>
      <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 30, letterSpacing: "0.22em", color: "#7A869A", marginBottom: 22 }}>АНКЕТА ЖЕНИХА</div>
      {[["Чей будешь", "Сафиных"], ["Из какой деревни", "Арча"], ["Дед по маме", "ищем"]].map(([q, a], i) => (
        <div key={q} style={{ display: "flex", alignItems: "baseline", gap: 18, borderBottom: "2px dashed #CBD3E1", padding: "14px 0" }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, border: "3px solid #1F2A44", flex: "none", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, color: "#2FA572", fontWeight: 800 }}>{i < 2 ? "✓" : ""}</div>
          <div style={{ fontFamily: INTER, fontWeight: 500, fontSize: 38, color: "#1F2A44", flex: 1 }}>{q}</div>
          <div style={{ fontFamily: HAND, fontSize: 54, color: "#2340A8" }}>{a}</div>
        </div>
      ))}
    </div>
    {/* stamp */}
    <div style={{ position: "absolute", left: 80, top: 1010, width: 230, height: 230, borderRadius: "50%", border: "8px solid rgba(198,40,40,0.85)", transform: "rotate(-16deg)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 0 0 6px rgba(255,255,255,0.6), inset 0 0 0 10px rgba(198,40,40,0.85)" }}>
      <div style={{ fontFamily: RUSSO, fontSize: 50, color: "rgba(198,40,40,0.9)", letterSpacing: "0.04em" }}>ПРИНЯТ</div>
    </div>
    <Avatar host="ahu" pose="skeptical" h={800} x={420} />
  </AbsoluteFill>
);

/* ───────── 6. Map · V69 «Спросила дорогу» · Alicja ───────── */
const C6: React.FC = () => (
  <AbsoluteFill style={{ background: "#EEF3E6" }}>
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      {/* river */}
      <path d="M-50 1150 C 200 1050, 300 1250, 560 1150 S 900 1000, 1130 1120" stroke="#A9D4F0" strokeWidth="70" fill="none" />
      {/* blocks */}
      {Array.from({ length: 30 }, (_, i) => {
        const x = (i % 6) * 190 - 20 + ((i * 37) % 30);
        const y = Math.floor(i / 6) * 230 + 250 + ((i * 53) % 40);
        return <rect key={i} x={x} y={y} width={150} height={170} rx={18} fill="#fff" opacity={0.75} />;
      })}
      {/* streets */}
      <path d="M-20 520 H1100 M-20 980 H1100 M300 200 V1700 M760 200 V1700" stroke="#FFFFFF" strokeWidth="26" />
      {/* the route */}
      <path d="M140 1450 C 140 1200, 420 1250, 430 1000 S 760 820, 840 640" stroke="#2FA37A" strokeWidth="12" strokeDasharray="4 26" strokeLinecap="round" fill="none" />
    </svg>
    <MapPin size={120} color="#fff" fill="#E5484D" strokeWidth={1.5} style={{ position: "absolute", left: 780, top: 520, filter: "drop-shadow(0 14px 14px rgba(0,0,0,0.25))" }} />
    <div style={{ position: "absolute", left: 640, top: 700, width: 140, height: 140, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 16px 30px -10px rgba(0,0,0,0.3)" }}>
      <Croissant size={86} color="#D19A2A" strokeWidth={1.8} />
    </div>
    <div style={{ position: "absolute", left: 90, top: 380, width: 640, background: "rgba(255,255,255,0.8)", backdropFilter: "blur(16px)", borderRadius: 40, padding: "40px 44px", boxShadow: "0 30px 60px -28px rgba(31,122,92,0.5)" }}>
      <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 82, color: "#123D2F", lineHeight: 1.02, letterSpacing: "-0.03em" }}>Спросила дорогу</div>
      <div style={{ fontFamily: HAND, fontSize: 66, color: "#2FA37A", marginTop: 12 }}>вернулась с пирожком</div>
    </div>
    <Avatar host="alicja" pose="laughing" h={840} x={560} />
  </AbsoluteFill>
);

/* ───────── 7. Big type · V66 «Возьми с собой» · Kamilya ───────── */
const C7: React.FC = () => (
  <AbsoluteFill style={{ background: "#FBF1EC" }}>
    <div style={{ position: "absolute", top: 460, left: 0, right: 0, textAlign: "center", fontFamily: UNB, fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 0.92, ...grad("linear-gradient(180deg, #D24A66 0%, #9C2F45 100%)") }}>
      <div style={{ fontSize: 158 }}>ВОЗЬМИ</div>
      <div style={{ fontSize: 158 }}>С СОБОЙ</div>
    </div>
    {/* bags piling up */}
    {[[90, 960, -12, 110], [180, 1080, 8, 140], [850, 980, 10, 120], [790, 1120, -6, 160]].map(([x, y, r, s], i) => (
      <div key={i} style={{ position: "absolute", left: x, top: y, transform: `rotate(${r}deg)`, background: "#fff", borderRadius: 30, padding: 18, boxShadow: "0 20px 40px -18px rgba(156,47,69,0.45)" }}>
        <ShoppingBag size={s} color="#9C2F45" strokeWidth={1.6} />
      </div>
    ))}
    <div style={{ position: "absolute", top: 380, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div style={{ fontFamily: HAND, fontSize: 64, color: "#3A1A22", background: "#fff", padding: "4px 30px", borderRadius: 18, transform: "rotate(-3deg)", boxShadow: "0 12px 30px -14px rgba(0,0,0,0.3)" }}>пришла на чай</div>
    </div>
    <Avatar host="kamilya" pose="holding-laugh" h={880} />
  </AbsoluteFill>
);

/* ───────── 8. Versus · V67 «Бабушка против доставки» · Alsu ───────── */
const VsCard: React.FC<{ x: number; color: string; title: string; icon: React.ReactNode; r: number }> = ({ x, color, title, icon, r }) => (
  <div style={{ position: "absolute", left: x, top: 640, width: 380, height: 330, borderRadius: 36, border: `3px solid ${color}`, background: "rgba(255,255,255,0.04)", boxShadow: `0 0 40px ${color}66, inset 0 0 40px ${color}33`, transform: `rotate(${r}deg)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
    {icon}
    <div style={{ fontFamily: RUSSO, fontSize: 76, color: "#fff", textShadow: `0 0 24px ${color}` }}>{title}</div>
  </div>
);
const C8: React.FC = () => (
  <AbsoluteFill style={{ background: "radial-gradient(60% 40% at 50% 40%, #2A1650 0%, #0E0B1A 70%)" }}>
    <Meteors color="#B48CF2" items={[[980, 360, 260], [760, 420, 180], [1060, 700, 220], [400, 340, 160]]} />
    <RetroGrid color="rgba(180,140,242,0.45)" top={1000} />
    <div style={{ position: "absolute", top: 380, left: 0, right: 0, textAlign: "center", fontFamily: INTER, fontWeight: 800, fontSize: 74, color: "#fff", lineHeight: 1.05, letterSpacing: "-0.02em" }}>
      Бабушка <span style={{ ...grad("linear-gradient(90deg, #FF4F8B, #F2A900)") }}>против</span>
      <br />доставки
    </div>
    <VsCard x={70} color="#FF4F8B" title="РОЛЛЫ" r={-5} icon={<svg viewBox="0 0 60 60" width={120} height={120}><circle cx="30" cy="30" r="26" fill="#fff" /><circle cx="30" cy="30" r="18" fill="#FF8FA3" /><circle cx="30" cy="30" r="8" fill="#9BE564" /></svg>} />
    <VsCard x={630} color="#F2A900" title="ПЛОВ" r={5} icon={<Flame size={120} color="#F2A900" strokeWidth={1.6} />} />
    <div style={{ position: "absolute", top: 720, left: 0, right: 0, textAlign: "center", fontFamily: RUSSO, fontSize: 130, color: "#fff", textShadow: "0 0 30px #B48CF2, 0 0 60px #7A4DFF", zIndex: 3 }}>VS</div>
    <Avatar host="alsu" pose="eye-roll" h={820} glow="rgba(180,140,242,0.55)" />
  </AbsoluteFill>
);

/* ───────── 9. Giant number · V72 «Скромная свадьба» · Ahu ───────── */
const C9: React.FC = () => {
  const confetti = Array.from({ length: 44 }, (_, i) => ({ x: (i * 211) % 1040 + 20, y: 340 + ((i * 397) % 800), r: (i * 47) % 180, c: ["#D6406B", "#F2A900", "#7A4DFF", "#2FA572"][i % 4], w: 12 + (i % 3) * 6 }));
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #FFF8F1 0%, #FCEEF2 100%)" }}>
      {confetti.map((p, i) => <div key={i} style={{ position: "absolute", left: p.x, top: p.y, width: p.w, height: p.w * 0.45, background: p.c, borderRadius: 3, transform: `rotate(${p.r}deg)`, opacity: 0.55 }} />)}
      <div style={{ position: "absolute", top: 360, left: 0, right: 0, textAlign: "center", fontFamily: INTER, fontWeight: 500, fontSize: 64, color: "#3A1A2A" }}>
        <span style={{ fontFamily: HAND, fontSize: 96, color: "#A3264B" }}>скромная</span> свадьба
      </div>
      <div style={{ position: "absolute", top: 470, left: 0, right: 0, textAlign: "center", fontFamily: UNB, fontWeight: 900, fontSize: 330, letterSpacing: "-0.06em", lineHeight: 1, ...grad("linear-gradient(180deg, #D6406B 10%, #A3264B 60%, rgba(163,38,75,0.15) 100%)") }}>300</div>
      <div style={{ position: "absolute", top: 880, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, background: "#A3264B", color: "#fff", fontFamily: INTER, fontWeight: 700, fontSize: 40, padding: "14px 34px", borderRadius: 999, boxShadow: "0 20px 40px -18px rgba(163,38,75,0.7)" }}>
          <Users size={40} color="#fff" /> только троюродные
        </div>
      </div>
      <Sparkles color="#F2A900" items={[[130, 560, 54], [960, 520, 40], [900, 860, 30]]} />
      <Avatar host="ahu" pose="shrug" h={860} />
    </AbsoluteFill>
  );
};

/* ───────── 10. Translator glass card · V74 «Перевод с мамского» · Kamilya ───────── */
const C10: React.FC = () => (
  <AbsoluteFill style={{ background: "#fff" }}>
    <AbsoluteFill style={{ top: 200, opacity: 0.85, maskImage: "linear-gradient(transparent, #000 25%)", WebkitMaskImage: "linear-gradient(transparent, #000 25%)" }}>
      <ShaderWarpCream colors={["#F9ECF3", "#E8B6D3", "#7A2E5C"]} />
    </AbsoluteFill>
    <Logo color="#7A2E5C" size={56} />
    <div style={{ position: "absolute", top: 440, left: 0, right: 0, textAlign: "center", fontFamily: INTER, fontWeight: 400, fontSize: 82, color: "#2A1424", letterSpacing: "-0.03em" }}>
      Перевод с <b style={{ fontWeight: 800, ...grad("linear-gradient(90deg, #B04A86, #7A2E5C)") }}>мамского</b>
    </div>
    <BeamCard beam={["#B04A86", "#F2A900"]} style={{ position: "absolute", left: 110, top: 600, width: 860 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: INTER, fontWeight: 700, fontSize: 28, letterSpacing: "0.12em", color: "#8A7684", marginBottom: 18 }}>
        <span>МАМСКИЙ</span>
        <span>⇄</span>
        <span>РУССКИЙ</span>
      </div>
      {[["Как хочешь", "Нет"], ["Я не обижаюсь", "Обиделась"]].map(([a, b]) => (
        <div key={a} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderTop: "1.5px solid rgba(122,46,92,0.15)" }}>
          <span style={{ fontFamily: INTER, fontWeight: 500, fontSize: 46, color: "#2A1424" }}>{a}</span>
          <span style={{ fontFamily: HAND, fontSize: 62, color: "#B04A86" }}>{b}</span>
        </div>
      ))}
    </BeamCard>
    <SparkIcon size={60} color="#F2A900" style={{ position: "absolute", left: 80, top: 560 }} />
    <Avatar host="kamilya" pose="wink" h={840} />
  </AbsoluteFill>
);

const COVERS: React.FC[] = [C1, C2, C3, C4, C5, C6, C7, C8, C9, C10];
export const COVER_LAB_NAMES = ["timer", "sticker", "bubble", "ornament", "form-stamp", "map", "big-type", "versus", "giant-number", "translator"];

export const CoverLab: React.FC<{ n: number; safe?: boolean }> = ({ n, safe }) => {
  const El = COVERS[Math.max(0, Math.min(COVERS.length - 1, n - 1))];
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <El />
      {safe && <div style={{ position: "absolute", left: SAFE.l, top: SAFE.t, width: SAFE.w, height: SAFE.h, outline: "4px dashed #00C2FF", zIndex: 50 }} />}
    </AbsoluteFill>
  );
};
