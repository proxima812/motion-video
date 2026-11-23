import React from "react";
import { AbsoluteFill } from "remotion";
import type { LucideIcon } from "lucide-react";
import { MapPin } from "lucide-react";
import { Avatar, DotPattern, GridPattern, HAND, Honey, INTER, Logo, MONO, MONT, RUSSO, Ripple, Sparkles, UNB, grad, type Host } from "./CoverLab";

// @the_tatarverse cover styles (approved 2026-11-23, from the CoverLab concepts): timer, sticker, bubble, big-type,
// form-stamp, map, giant-number. Every reel takes a style different from the previous reel's.
// Rules: host at the bottom sunk 50 px (Avatar: bottom -50); everything else inside the safe zone 1010x1250 centered
// (x 35..1045, y 335..1585); text above the host's head (~y 1050); colors from the reel palette P; decorations by the
// meaning of the reel (lucide icons, own SVG). No punctuation on the cover (numbers and times are fine).

export type CoverPal = { main: string; vivid: string; glow: string; pale: string };
type Base = { host: Host; pose: string; P: CoverPal; avatarH?: number; avatarX?: number };
const tint = (hex: string, a: number) => `${hex}${Math.round(a * 255).toString(16).padStart(2, "0")}`;
const Icons: React.FC<{ items: [LucideIcon, number, number, number, number][]; color: string; opacity?: number; fill?: boolean }> = ({ items, color, opacity = 0.22, fill }) => (
  <>
    {items.map(([I, x, y, s, r], i) => (
      <I key={i} size={s} color={color} fill={fill ? color : "none"} strokeWidth={1.3} style={{ position: "absolute", left: x, top: y, opacity, transform: `rotate(${r}deg)`, zIndex: 1 }} />
    ))}
  </>
);
const ICON_SPOTS: [number, number, number, number][] = [[60, 960, 170, -14], [850, 900, 140, 12], [70, 560, 90, 8], [930, 620, 80, -10]];
const spots = (icons: LucideIcon[]) => icons.slice(0, 4).map((I, i) => [I, ...ICON_SPOTS[i]] as [LucideIcon, number, number, number, number]);

/* ───────── timer: lead line, struck small time, giant time ───────── */
export const TimerCover: React.FC<Base & { lead: string; leadAccent: string; struck: string; big: string; icons?: LucideIcon[] }> = ({ host, pose, P, avatarH = 880, avatarX, lead, leadAccent, struck, big, icons = [] }) => (
  <AbsoluteFill style={{ background: `linear-gradient(180deg, #FFFFFF 0%, ${P.pale} 60%, ${tint(P.glow, 0.7)} 100%)` }}>
    <GridPattern color={tint(P.vivid, 0.16)} />
    <Ripple x={540} y={1560} color={`rgba(${parseInt(P.vivid.slice(1, 3), 16)},${parseInt(P.vivid.slice(3, 5), 16)},${parseInt(P.vivid.slice(5, 7), 16)},0.35)`} base={260} step={120} />
    <Icons items={spots(icons)} color={P.vivid} />
    <Logo color={P.main} size={56} />
    <div style={{ position: "absolute", top: 450, left: 60, right: 60, textAlign: "center", fontFamily: INTER, fontWeight: 500, fontSize: 64, color: "#2A2024" }}>
      {lead} <span style={{ fontFamily: HAND, fontSize: 92, color: P.vivid }}>{leadAccent}</span>
    </div>
    <div style={{ position: "absolute", top: 585, left: 0, right: 0, textAlign: "center", fontFamily: UNB, fontWeight: 500, fontSize: 70, color: "#B3A7A2", textDecoration: "line-through", textDecorationColor: "#E5484D", textDecorationThickness: 8 }}>{struck}</div>
    <div style={{ position: "absolute", top: 700, left: 0, right: 0, textAlign: "center", fontFamily: UNB, fontWeight: 900, fontSize: big.length > 6 ? 150 : 190, letterSpacing: "-0.04em", lineHeight: 1, ...grad(`linear-gradient(180deg, ${P.vivid}, ${P.main})`) }}>{big}</div>
    <Sparkles color={P.vivid} items={[[150, 700, 46], [930, 640, 36], [880, 920, 26]]} />
    <Avatar host={host} pose={pose} h={avatarH} x={avatarX} />
  </AbsoluteFill>
);

/* ───────── sticker: bright bg, tilted word sticker, pill, round badge, tag; host with a white outline ───────── */
export const StickerCover: React.FC<Base & { bg: string; word: string; pill: string; badgeBig: string; badgeSmall: string; tag: string; drops?: "honey" | LucideIcon }> = ({ host, pose, P, avatarH = 860, avatarX, bg, word, pill, badgeBig, badgeSmall, tag, drops = "honey" }) => {
  const ink = "#1D1A14";
  const D = drops === "honey" ? null : drops;
  const dropAt: [number, number, number, number][] = [[70, 560, 64, -12], [920, 520, 56, 14], [860, 1000, 44, -6]];
  return (
    <AbsoluteFill style={{ background: bg }}>
      <DotPattern color="rgba(29,26,20,0.18)" size={40} r={3} mask={false} />
      <svg viewBox="-100 -100 200 200" width={1500} height={1500} style={{ position: "absolute", left: -210, top: -40, opacity: 0.22 }}>
        {Array.from({ length: 24 }, (_, i) => <path key={i} d="M0 0 L-9 -100 L9 -100Z" fill="#fff" transform={`rotate(${i * 15})`} />)}
      </svg>
      {dropAt.map(([x, y, s, r], i) => (D ? <D key={i} size={s} color={ink} fill={P.vivid} strokeWidth={2.2} style={{ position: "absolute", left: x, top: y, transform: `rotate(${r}deg)` }} /> : <Honey key={i} x={x} y={y} s={s} r={r} />))}
      <div style={{ position: "absolute", top: 400, left: 0, right: 0, textAlign: "center", transform: "rotate(-4deg)" }}>
        <span style={{ fontFamily: MONO, fontSize: word.length > 8 ? 104 : 132, color: ink, textShadow: "6px 6px 0 #fff, -6px -6px 0 #fff, 6px -6px 0 #fff, -6px 6px 0 #fff, 0 6px 0 #fff, 0 -6px 0 #fff, 6px 0 0 #fff, -6px 0 0 #fff, 14px 16px 0 #1D1A14" }}>{word}</span>
      </div>
      <div style={{ position: "absolute", top: 610, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div style={{ transform: "rotate(5deg)", background: P.vivid, color: "#fff", fontFamily: MONT, fontWeight: 900, fontSize: 68, padding: "18px 40px", borderRadius: 28, border: `6px solid ${ink}`, boxShadow: `10px 12px 0 ${ink}`, whiteSpace: "nowrap" }}>{pill}</div>
      </div>
      <div style={{ position: "absolute", top: 790, left: 660, width: 250, height: 250, borderRadius: "50%", background: "#fff", border: `6px solid ${ink}`, boxShadow: `8px 10px 0 ${ink}`, transform: "rotate(-10deg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: UNB, fontWeight: 900, color: ink, zIndex: 6 }}>
        <div style={{ fontSize: badgeBig.length > 3 ? 64 : 96, lineHeight: 1 }}>{badgeBig}</div>
        <div style={{ fontSize: 32, fontWeight: 700 }}>{badgeSmall}</div>
      </div>
      <div style={{ position: "absolute", top: 860, left: 110, transform: "rotate(-6deg)", background: ink, color: bg, fontFamily: HAND, fontSize: 64, padding: "6px 30px", borderRadius: 16, zIndex: 6 }}>{tag}</div>
      <Avatar host={host} pose={pose} h={avatarH} x={avatarX} sticker="#FFFFFF" />
    </AbsoluteFill>
  );
};

/* ───────── bubble: kicker, a giant speech bubble pointing at the host, sub line ───────── */
export const BubbleCover: React.FC<Base & { kicker: string; bubble: string; sub: string; icons?: LucideIcon[]; hearts?: boolean }> = ({ host, pose, P, avatarH = 860, avatarX, kicker, bubble, sub, icons = [], hearts = true }) => (
  <AbsoluteFill style={{ background: `radial-gradient(70% 50% at 20% 20%, ${P.glow}AA 0%, transparent 70%), radial-gradient(60% 45% at 90% 60%, ${P.glow} 0%, transparent 70%), ${P.pale}` }}>
    <DotPattern color={tint(P.main, 0.22)} size={34} />
    <Icons items={spots(icons)} color={P.vivid} opacity={0.35} />
    {hearts && <Sparkles color={P.vivid} items={[[930, 1010, 50], [880, 940, 30], [140, 920, 34]]} opacity={0.7} />}
    <Logo color={P.main} size={56} />
    <div style={{ position: "absolute", top: 420, left: 0, right: 0, textAlign: "center", fontFamily: HAND, fontSize: 70, color: P.main, transform: "rotate(-3deg)" }}>{kicker}</div>
    <div style={{ position: "absolute", top: 530, left: 80, right: 80 }}>
      <div style={{ position: "relative", background: "#fff", borderRadius: 64, padding: "64px 40px 58px", textAlign: "center", boxShadow: `0 40px 70px -30px ${tint(P.main, 0.45)}` }}>
        <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: bubble.length > 12 ? 86 : 112, letterSpacing: "-0.04em", lineHeight: 1.02, ...grad(`linear-gradient(90deg, ${P.vivid}, ${P.main})`) }}>{bubble}</div>
        <div style={{ fontFamily: INTER, fontWeight: 500, fontSize: 44, color: "#6E6870", marginTop: 22 }}>{sub}</div>
        <svg viewBox="0 0 80 70" width={110} height={96} style={{ position: "absolute", left: "50%", marginLeft: -55, bottom: -80 }}>
          <path d="M0 0 H80 L18 70 Z" fill="#fff" />
        </svg>
      </div>
    </div>
    <Avatar host={host} pose={pose} h={avatarH} x={avatarX} />
  </AbsoluteFill>
);

/* ───────── big type: two huge lines, a handwritten sticker above, objects piling up at the sides ───────── */
export const BigTypeCover: React.FC<Base & { lines: [string, string]; chip: string; icon: LucideIcon; size?: number }> = ({ host, pose, P, avatarH = 880, avatarX, lines, chip, icon: I, size }) => {
  const fs = size ?? Math.min(170, Math.floor(940 / (Math.max(lines[0].length, lines[1].length) * 0.95)));
  return (
    <AbsoluteFill style={{ background: P.pale }}>
      <div style={{ position: "absolute", top: 380, left: 0, right: 0, display: "flex", justifyContent: "center", zIndex: 2 }}>
        <div style={{ fontFamily: HAND, fontSize: 64, color: "#2A1A20", background: "#fff", padding: "4px 30px", borderRadius: 18, transform: "rotate(-3deg)", boxShadow: "0 12px 30px -14px rgba(0,0,0,0.3)" }}>{chip}</div>
      </div>
      <div style={{ position: "absolute", top: 470, left: 0, right: 0, textAlign: "center", fontFamily: UNB, fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 0.95, fontSize: fs, ...grad(`linear-gradient(180deg, ${P.vivid} 0%, ${P.main} 100%)`) }}>
        <div>{lines[0]}</div>
        <div>{lines[1]}</div>
      </div>
      {[[90, 960, -12, 110], [180, 1080, 8, 140], [850, 980, 10, 120], [790, 1120, -6, 160]].map(([x, y, r, s], i) => (
        <div key={i} style={{ position: "absolute", left: x, top: y, transform: `rotate(${r}deg)`, background: "#fff", borderRadius: 30, padding: 18, boxShadow: `0 20px 40px -18px ${tint(P.main, 0.45)}` }}>
          <I size={s} color={P.main} strokeWidth={1.6} />
        </div>
      ))}
      <Avatar host={host} pose={pose} h={avatarH} x={avatarX} />
    </AbsoluteFill>
  );
};

/* ───────── form + stamp: title, a tilted paper form with checkboxes and handwritten answers, a round stamp ───────── */
export const FormCover: React.FC<Base & { title: string; accent: string; header: string; rows: [string, string, boolean][]; stamp: string }> = ({ host, pose, P, avatarH = 800, avatarX = 420, title, accent, header, rows, stamp }) => (
  <AbsoluteFill style={{ background: "#E9EEF6" }}>
    <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(70,100,160,0.14) 2px, transparent 2px)", backgroundSize: "100% 56px" }} />
    <div style={{ position: "absolute", left: 40, right: 40, top: 360, textAlign: "center", fontFamily: UNB, fontWeight: 900, fontSize: title.length > 13 ? 72 : 84, color: "#1F2A44", lineHeight: 1.05 }}>
      {title}
      <div style={{ fontFamily: `${HAND}, ${INTER}`, fontWeight: 700, fontSize: 96, color: P.vivid }}>{accent}</div>
    </div>
    <div style={{ position: "absolute", left: 120, top: 600, width: 840, transform: "rotate(-2.5deg)", background: "#FFFDF7", borderRadius: 20, padding: "40px 48px", boxShadow: "0 30px 60px -24px rgba(31,42,68,0.45)" }}>
      <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 30, letterSpacing: "0.22em", color: "#7A869A", marginBottom: 22 }}>{header}</div>
      {rows.map(([q, a, ok]) => (
        <div key={q} style={{ display: "flex", alignItems: "baseline", gap: 18, borderBottom: "2px dashed #CBD3E1", padding: "14px 0" }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, border: "3px solid #1F2A44", flex: "none", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, color: ok ? "#2FA572" : "#E5484D", fontWeight: 800 }}>{ok ? "✓" : "✕"}</div>
          <div style={{ fontFamily: INTER, fontWeight: 500, fontSize: 38, color: "#1F2A44", flex: 1 }}>{q}</div>
          <div style={{ fontFamily: HAND, fontSize: 54, color: "#2340A8", whiteSpace: "nowrap" }}>{a}</div>
        </div>
      ))}
    </div>
    <div style={{ position: "absolute", left: 80, top: 1010, width: 230, height: 230, borderRadius: "50%", border: "8px solid rgba(198,40,40,0.85)", transform: "rotate(-16deg)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 0 0 6px rgba(255,255,255,0.6), inset 0 0 0 10px rgba(198,40,40,0.85)", zIndex: 6 }}>
      <div style={{ fontFamily: RUSSO, fontSize: stamp.length > 6 ? 38 : 48, color: "rgba(198,40,40,0.9)", letterSpacing: "0.04em" }}>{stamp}</div>
    </div>
    <Avatar host={host} pose={pose} h={avatarH} x={avatarX} />
  </AbsoluteFill>
);

/* ───────── map: drawn city map, dashed route to a pin, a destination badge, glass title card ───────── */
export const MapCover: React.FC<Base & { title: string; sub: string; dest: LucideIcon; land?: string }> = ({ host, pose, P, avatarH = 840, avatarX = 560, title, sub, dest: D, land = "#EEF3E6" }) => (
  <AbsoluteFill style={{ background: land }}>
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <path d="M-50 1150 C 200 1050, 300 1250, 560 1150 S 900 1000, 1130 1120" stroke="#A9D4F0" strokeWidth="70" fill="none" />
      {Array.from({ length: 30 }, (_, i) => {
        const x = (i % 6) * 190 - 20 + ((i * 37) % 30);
        const y = Math.floor(i / 6) * 230 + 250 + ((i * 53) % 40);
        return <rect key={i} x={x} y={y} width={150} height={170} rx={18} fill="#fff" opacity={0.75} />;
      })}
      <path d="M-20 520 H1100 M-20 980 H1100 M300 200 V1700 M760 200 V1700" stroke="#FFFFFF" strokeWidth="26" />
      <path d="M140 1450 C 140 1200, 420 1250, 430 1000 S 760 820, 840 640" stroke={P.vivid} strokeWidth="12" strokeDasharray="4 26" strokeLinecap="round" fill="none" />
    </svg>
    <MapPin size={120} color="#fff" fill="#E5484D" strokeWidth={1.5} style={{ position: "absolute", left: 780, top: 520, filter: "drop-shadow(0 14px 14px rgba(0,0,0,0.25))" }} />
    <div style={{ position: "absolute", left: 640, top: 700, width: 140, height: 140, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 16px 30px -10px rgba(0,0,0,0.3)" }}>
      <D size={86} color={P.vivid} strokeWidth={1.8} />
    </div>
    <div style={{ position: "absolute", left: 90, top: 380, width: 640, background: "rgba(255,255,255,0.82)", backdropFilter: "blur(16px)", borderRadius: 40, padding: "40px 44px", boxShadow: `0 30px 60px -28px ${tint(P.main, 0.5)}` }}>
      <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 82, color: "#15202A", lineHeight: 1.02, letterSpacing: "-0.03em" }}>{title}</div>
      <div style={{ fontFamily: HAND, fontSize: 66, color: P.vivid, marginTop: 12 }}>{sub}</div>
    </div>
    <Avatar host={host} pose={pose} h={avatarH} x={avatarX} />
  </AbsoluteFill>
);

/* ───────── giant number: line with a handwritten accent, a huge gradient number, a chip; confetti ───────── */
export const GiantNumberCover: React.FC<Base & { accent: string; rest: string; number: string; chip: string; chipIcon: LucideIcon; confetti?: boolean }> = ({ host, pose, P, avatarH = 860, avatarX, accent, rest, number, chip, chipIcon: CI, confetti = true }) => {
  const bits = Array.from({ length: 44 }, (_, i) => ({ x: (i * 211) % 1040 + 20, y: 340 + ((i * 397) % 800), r: (i * 47) % 180, c: [P.vivid, "#F2A900", "#7A4DFF", "#2FA572"][i % 4], w: 12 + (i % 3) * 6 }));
  const fs = Math.min(330, Math.floor(960 / (number.length * 0.82)));
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, #FFF9F3 0%, ${P.pale} 100%)` }}>
      {confetti && bits.map((p, i) => <div key={i} style={{ position: "absolute", left: p.x, top: p.y, width: p.w, height: p.w * 0.45, background: p.c, borderRadius: 3, transform: `rotate(${p.r}deg)`, opacity: 0.55 }} />)}
      <div style={{ position: "absolute", top: 360, left: 40, right: 40, textAlign: "center", fontFamily: INTER, fontWeight: 500, fontSize: 64, color: "#2A1A22" }}>
        <span style={{ fontFamily: HAND, fontSize: 96, color: P.main }}>{accent}</span> {rest}
      </div>
      <div style={{ position: "absolute", top: 470, left: 0, right: 0, textAlign: "center", fontFamily: UNB, fontWeight: 900, fontSize: fs, letterSpacing: "-0.06em", lineHeight: 1, ...grad(`linear-gradient(180deg, ${P.vivid} 10%, ${P.main} 60%, ${tint(P.main, 0.15)} 100%)`) }}>{number}</div>
      <div style={{ position: "absolute", top: 880, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, background: P.main, color: "#fff", fontFamily: INTER, fontWeight: 700, fontSize: 40, padding: "14px 34px", borderRadius: 999, boxShadow: `0 20px 40px -18px ${tint(P.main, 0.7)}` }}>
          <CI size={40} color="#fff" /> {chip}
        </div>
      </div>
      <Sparkles color="#F2A900" items={[[130, 560, 54], [960, 520, 40], [900, 860, 30]]} />
      <Avatar host={host} pose={pose} h={avatarH} x={avatarX} />
    </AbsoluteFill>
  );
};
