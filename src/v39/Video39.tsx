import React from "react";
import { AbsoluteFill } from "remotion";
import { Home, Users } from "lucide-react";
import { SPRING, ease, lerp, progress, springAt } from "../stage/motion";
import { ReelShell, pop, shake, type SceneDef, type Sfx } from "../kit/reel";
import { TatAvatar, type AvatarKey, type Emotion, type StanceKey } from "../kit/TatAvatar";
import { DotOrbitBg } from "../kit/DotOrbitBg";
import { HEADING, INK, PARAGRAPH, SURFACE } from "../kit/design";
import { GlassPlate } from "../catalog/own/glass";
import { F, VO } from "./timeline";
import { WORDS } from "./words";

// "Семейный словарь" (@the_tatarverse, RU, host preset 2 Alicja). 21 s.
// You speak Tatar at home without noticing -> Әни, кызым, ашарга on the fridge -> friends stare blankly -> it's your family dictionary, alive -> write your family's word -> let's build a shared one.
// Own kit only. Palette: terracotta (home, family). Dot Orbit variant 3 (output/bg-variant.txt).
const T = { main: "#A0432A", vivid: "#D2603F", glow: "#F2B09B", pale: "#FCEDE7" };
const PLATE_TERRACOTTA = "linear-gradient(135deg, #D2603F, #A0432A)";
const BG = <DotOrbitBg variant={3} />;
const GRAY = "#E9E4E2";
const GRAY2 = "#F2EEEC";

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

/* ───────── 1. Hook: a house full of talk, its language label flips from "русский" to "татарский" ───────── */

const BUBBLES = [
  { x: 120, y: 290, w: 170, flip: false },
  { x: 290, y: 380, w: 150, flip: true },
  { x: 140, y: 460, w: 130, flip: false },
];
const Hook: React.FC<{ frame: number }> = ({ frame }) => {
  const first = fadeOut(frame, F.home - 14);
  const house = pop(frame, 6, SPRING.smooth);
  const lit = ease.inOut(progress(frame, F.tatar - 4, F.tatar + 14));
  const chip = pop(frame, 30, SPRING.bouncy);
  const flip = ease.inOut(progress(frame, F.tatar - 6, F.tatar + 10));
  const s = shake(frame, F.tatar + 4, 8, 16);
  const W = 560;
  return (
    <>
      {first > 0 && <Title text="большинство *не понимает*" frame={frame} at={[-30, F.not - 4, F.get]} size={92} style={{ opacity: first }} />}
      {frame >= F.home - 8 && <Title text="дома говорит на *татарском*" frame={frame} at={[F.home - 4, F.speak, F.na, F.tatar]} size={92} />}
      <div style={{ position: "absolute", left: 540 - W / 2, top: 420, width: W, height: 570, ...house.style }}>
        <svg width={W} height={570} viewBox={`0 0 ${W} 570`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <path d="M60 230 L280 40 L500 230" fill="none" stroke={T.main} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" />
          <rect x={410} y={70} width={44} height={110} rx={8} fill={T.main} />
          <rect x={90} y={215} width={380} height={340} rx={28} fill="#fff" stroke={T.main} strokeWidth={10} />
          <rect x={360} y={400} width={80} height={155} rx={14} fill={T.pale} stroke={T.main} strokeWidth={8} />
          <circle cx={424} cy={480} r={7} fill={T.main} />
          {/* smoke from the chimney: the house is lived in */}
          {[0, 1, 2].map((k) => {
            const r = ((frame / 70 + k / 3) % 1 + 1) % 1;
            return <circle key={k} cx={432 + Math.sin(r * 6 + k) * 10} cy={60 - r * 90} r={12 + r * 16} fill={T.glow} opacity={(1 - r) * 0.8} />;
          })}
        </svg>
        {BUBBLES.map((b, i) => {
          const p = springAt(frame, 22 + i * 14, SPRING.bouncy);
          const wob = Math.sin(frame / 9 + i * 2) * 4;
          return (
            <div key={i} style={{ position: "absolute", left: b.x, top: b.y + wob, width: b.w, height: 66, borderRadius: 33, background: lit > 0.5 ? T.vivid : GRAY, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, transform: `scale(${p})`, transformOrigin: b.flip ? "100% 100%" : "0 100%" }}>
              {[0, 1, 2].map((d) => (
                <div key={d} style={{ width: 12, height: 12, borderRadius: 6, background: lit > 0.5 ? "#fff" : "#B9AFAB", opacity: 0.55 + 0.45 * Math.abs(Math.sin(frame / 8 + d)) }} />
              ))}
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1060, display: "flex", justifyContent: "center", ...chip.style }}>
        <div style={{ ...SURFACE, borderRadius: 60, height: 120, width: 520, position: "relative", overflow: "hidden", transform: `translateX(${s}px)` }}>
          <div style={{ position: "absolute", left: 44, top: 46, width: 28, height: 28, borderRadius: 14, background: flip > 0.5 ? T.vivid : "#B9AFAB" }} />
          {[
            { w: "русский", c: INK, k: 700, y: -flip },
            { w: "татарский", c: T.main, k: 700, y: 1 - flip },
          ].map((l) => (
            <div key={l.w} style={{ position: "absolute", left: 100, right: 40, top: 0, height: 120, display: "flex", alignItems: "center", justifyContent: "center", ...PARAGRAPH, fontSize: 60, lineHeight: 1, fontWeight: l.k, color: l.c, transform: `translateY(${l.y * 110}px)`, opacity: 1 - Math.abs(l.y) }}>
              {l.w}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

/* ───────── 2. Әни, кызым, ашарга: notes slap onto the fridge, "just home words" ───────── */

const NOTES = [
  { w: "Әни", at: F.ani, x: 50, y: 60, r: -6, fs: 84 },
  { w: "кызым", at: F.kyzym, x: 320, y: 330, r: 5, fs: 64 },
  { w: "ашарга", at: F.asharga, x: 60, y: 590, r: -3, fs: 58 },
];
const Fridge: React.FC<{ frame: number }> = ({ frame }) => {
  const fr = pop(frame, F.wordsIn + 2, SPRING.smooth);
  const warm = ease.inOut(progress(frame, F.homey - 6, F.homey + 20));
  return (
    <>
      {frame >= F.just - 10 && <Title text="просто *домашние* словечки" frame={frame} at={[F.just - 6, F.homey, F.slovechki]} size={88} />}
      <div style={{ position: "absolute", left: 540 - 420, top: 360, width: 840, height: 880, borderRadius: 440, background: `radial-gradient(circle, ${T.pale} 0%, rgba(252,237,231,0) 70%)`, opacity: warm }} />
      <div style={{ position: "absolute", left: 230, top: 400, width: 620, height: 860, ...SURFACE, borderRadius: 40, border: `6px solid ${T.glow}`, boxSizing: "border-box", ...fr.style }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 290, height: 6, background: T.glow }} />
        <div style={{ position: "absolute", right: 36, top: 120, width: 16, height: 120, borderRadius: 8, background: T.main }} />
        <div style={{ position: "absolute", right: 36, top: 340, width: 16, height: 200, borderRadius: 8, background: T.main }} />
        {NOTES.map((n, i) => {
          const p = springAt(frame, n.at - 4, SPRING.bouncy);
          const wig = warm * Math.sin(frame / 7 + i * 1.8) * 3;
          return (
            <div key={n.w} style={{ position: "absolute", left: n.x, top: n.y, width: 250, height: 230, borderRadius: 18, background: i === 1 ? T.glow : T.pale, boxShadow: SURFACE.boxShadow, display: "grid", placeItems: "center", opacity: Math.min(1, p * 2), transform: `rotate(${n.r + wig}deg) scale(${lerp(1.6, 1, Math.min(p, 1))})` }}>
              <div style={{ position: "absolute", top: -18, left: 107, width: 36, height: 36, borderRadius: 18, background: T.vivid, boxShadow: SURFACE.boxShadow }} />
              <span style={{ ...PARAGRAPH, fontSize: n.fs, lineHeight: 1, fontWeight: 700, color: T.main }}>{n.w}</span>
            </div>
          );
        })}
      </div>
    </>
  );
};

/* ───────── 3. Said to friends: their eyes go blank, little "loading" rings spin over their heads ───────── */

const PALS = [
  { x: 210, body: T.glow },
  { x: 540, body: T.vivid },
  { x: 870, body: T.main },
];
const Friends: React.FC<{ frame: number }> = ({ frame }) => {
  const bub = springAt(frame, F.said - 6, SPRING.bouncy);
  const blank = progress(frame, F.blank - 4, F.blank + 6);
  const load = progress(frame, F.eyes - 10, F.eyes + 4);
  return (
    <>
      <Title text="сказал *друзьям*" frame={frame} at={[F.said - 4, F.friends]} size={100} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 380, display: "flex", justifyContent: "center", opacity: Math.min(1, bub * 2), transform: `translateX(${(1 - Math.min(bub, 1)) * -400}px) rotate(${(1 - Math.min(bub, 1)) * -10}deg)` }}>
        <div style={{ position: "relative", ...SURFACE, borderRadius: 50, padding: "34px 60px" }}>
          <span style={{ ...PARAGRAPH, fontSize: 72, lineHeight: 1, fontWeight: 700, color: T.main }}>ашарга</span>
          <svg width={60} height={40} style={{ position: "absolute", left: "50%", marginLeft: -30, bottom: -36 }}>
            <path d="M0 0 H60 L30 38 Z" fill="#fff" />
          </svg>
        </div>
      </div>
      {PALS.map((p, i) => {
        const t = springAt(frame, F.friendsIn + 10 + i * 6, SPRING.bouncy);
        const turn = springAt(frame, F.said + 4 + i * 4, SPRING.smooth);
        const eye = 12 + 22 * blank;
        const blink = Math.abs(((frame - F.eyes - i * 9) % 70) - 35) < 3 ? 0.15 : 1;
        return (
          <div key={i} style={{ position: "absolute", left: p.x - 140, top: 720, width: 280, height: 470, transform: `scale(${t}) translateY(${(1 - Math.min(turn, 1)) * 20}px)`, transformOrigin: "50% 100%" }}>
            {load > 0 && (
              <svg width={90} height={90} viewBox="0 0 90 90" style={{ position: "absolute", left: 95, top: -10, opacity: load, transform: `rotate(${(frame - F.eyes) * 9}deg)` }}>
                <circle cx={45} cy={45} r={30} fill="none" stroke={T.pale} strokeWidth={10} />
                <path d="M45 15 A30 30 0 0 1 75 45" fill="none" stroke={T.vivid} strokeWidth={10} strokeLinecap="round" />
              </svg>
            )}
            <div style={{ position: "absolute", left: 50, top: 100, width: 180, height: 180, borderRadius: 90, background: T.pale, border: `6px solid ${p.body}`, boxSizing: "border-box" }}>
              {[56, 112].map((x) => (
                <div key={x} style={{ position: "absolute", left: x - eye / 2 + 6, top: 72 - eye / 2, width: eye, height: eye * blink, borderRadius: eye, background: blank > 0.5 ? "#fff" : INK, border: blank > 0.5 ? `4px solid ${INK}` : undefined, boxSizing: "border-box", display: "grid", placeItems: "center" }}>
                  {blank > 0.5 && <div style={{ width: 6, height: 6 * blink, borderRadius: 3, background: INK }} />}
                </div>
              ))}
              <div style={{ position: "absolute", left: 66, top: 124, width: 36 - 16 * blank, height: 6, borderRadius: 3, background: INK, marginLeft: 8 * blank }} />
            </div>
            <div style={{ position: "absolute", left: 20, top: 300, width: 240, height: 170, borderRadius: "120px 120px 24px 24px", background: p.body }} />
          </div>
        );
      })}
    </>
  );
};

/* ───────── 4. Your family dictionary: entries fill in, then it gets a heartbeat ───────── */

const ENTRIES = [
  { w: "әни", bars: [260, 180] },
  { w: "кызым", bars: [220, 150] },
  { w: "ашарга", bars: [240, 120] },
];
const Dictionary: React.FC<{ frame: number }> = ({ frame }) => {
  const card = pop(frame, F.dictIn + 4, SPRING.smooth);
  const beat = progress(frame, F.alive - 6, F.alive + 40);
  const pulse = frame > F.alive ? Math.max(0, Math.sin((frame - F.alive) / 9)) ** 6 : 0;
  const newRow = springAt(frame, F.alive + 10, SPRING.bouncy);
  const caret = Math.floor(frame / 15) % 2;
  const ecg = "M0 60 H180 L210 60 L235 10 L265 110 L290 30 L310 60 H470 L495 60 L520 20 L545 100 L565 60 H880";
  return (
    <>
      <Title text="твой *семейный словарь*" frame={frame} at={[F.your, F.family, F.dict]} size={92} />
      <div style={{ position: "absolute", left: 100, right: 100, top: 400, ...card.style, transform: `${card.style.transform} scale(${1 + 0.02 * pulse})` }}>
        <div style={{ ...SURFACE, padding: 40, overflow: "hidden" }}>
          <div style={{ height: 26, borderRadius: 13, background: `linear-gradient(90deg, ${T.vivid}, ${T.main})`, marginBottom: 30, width: 260 }} />
          {ENTRIES.map((e, i) => {
            const t = springAt(frame, F.dictIn + 14 + i * 12, SPRING.smooth);
            return (
              <div key={e.w} style={{ display: "flex", alignItems: "center", gap: 36, height: 130, borderTop: i ? `3px solid ${GRAY2}` : undefined, opacity: Math.min(1, t * 1.4), transform: `translateX(${(1 - t) * 60}px)` }}>
                <span style={{ ...PARAGRAPH, fontSize: 64, lineHeight: 1, fontWeight: 700, color: T.main, width: 270 }}>{e.w}</span>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ width: e.bars[0], height: 20, borderRadius: 10, background: GRAY }} />
                  <div style={{ width: e.bars[1], height: 16, borderRadius: 8, background: GRAY2 }} />
                </div>
              </div>
            );
          })}
          <div style={{ height: 130 * Math.min(1, newRow), overflow: "hidden", borderTop: `3px solid ${GRAY2}`, opacity: Math.min(1, newRow * 1.5) }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20, height: 130 }}>
              <div style={{ width: 210, height: 76, borderRadius: 38, border: `4px dashed ${T.glow}`, display: "flex", alignItems: "center", paddingLeft: 30, boxSizing: "border-box" }}>
                <div style={{ width: 4, height: 44, background: T.vivid, opacity: caret }} />
              </div>
            </div>
          </div>
          <svg width={880} height={120} viewBox="0 0 880 120" style={{ display: "block", marginTop: 10 }}>
            <path d={ecg} fill="none" stroke={T.pale} strokeWidth={8} strokeLinejoin="round" />
            <path d={ecg} fill="none" stroke={T.vivid} strokeWidth={8} strokeLinejoin="round" strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - beat} />
          </svg>
        </div>
      </div>
    </>
  );
};

/* ───────── 5. Write one word: a comment box types, "у вас дома" plate ───────── */

const Comment: React.FC<{ frame: number }> = ({ frame }) => {
  const box = pop(frame, F.ctaIn + 6, SPRING.smooth);
  const typed = ease.out(progress(frame, F.word - 4, F.word + 40));
  const caret = Math.floor(frame / 16) % 2;
  const sent = springAt(frame, F.saying, SPRING.bouncy);
  const plate = pop(frame, F.yours - 6, SPRING.bouncy);
  return (
    <>
      <Title text="напиши *одно слово*" frame={frame} at={[F.write, F.one, F.word]} size={100} />
      <div style={{ position: "absolute", left: 100, right: 100, top: 440, ...box.style }}>
        <div style={{ ...SURFACE, padding: 36, display: "flex", alignItems: "center", gap: 26 }}>
          <div style={{ width: 96, height: 96, borderRadius: 48, background: `linear-gradient(135deg, ${T.glow}, ${T.vivid})`, flex: "none" }} />
          <div style={{ flex: 1, height: 96, borderRadius: 48, background: T.pale, display: "flex", alignItems: "center", gap: 12, padding: "0 32px" }}>
            <div style={{ width: 260 * typed * (1 - Math.min(sent, 1)), height: 22, borderRadius: 11, background: T.vivid }} />
            <div style={{ width: 4, height: 50, borderRadius: 2, background: T.main, opacity: caret }} />
          </div>
        </div>
      </div>
      {/* the sent comment: one bold word chip lands under the box */}
      <div style={{ position: "absolute", left: 160, top: 640, display: "flex", alignItems: "center", gap: 22, opacity: Math.min(1, sent * 2), transform: `translateY(${(1 - Math.min(sent, 1)) * -60}px)` }}>
        <div style={{ width: 70, height: 70, borderRadius: 35, background: T.glow }} />
        <div style={{ ...SURFACE, borderRadius: 36, padding: "26px 36px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ width: 300, height: 22, borderRadius: 11, background: T.vivid }} />
          <div style={{ width: 200, height: 16, borderRadius: 8, background: GRAY }} />
        </div>
      </div>
      {[0, 1].map((k) => {
        const t = springAt(frame, F.saying + 24 + k * 16, SPRING.bouncy);
        return (
          <div key={k} style={{ position: "absolute", left: 160 + (k + 1) * 60, top: 820 + k * 120, display: "flex", alignItems: "center", gap: 18, opacity: Math.min(1, t * 2) * 0.8, transform: `scale(${t})`, transformOrigin: "0 50%" }}>
            <div style={{ width: 56, height: 56, borderRadius: 28, background: k ? T.vivid : T.pale, border: `4px solid ${T.glow}`, boxSizing: "border-box" }} />
            <div style={{ ...SURFACE, borderRadius: 30, padding: "22px 30px" }}>
              <div style={{ width: [220, 170][k], height: 18, borderRadius: 9, background: GRAY }} />
            </div>
          </div>
        );
      })}
      {plate.t > 0 && (
        <div style={{ position: "absolute", top: 1100, left: 0, right: 0, display: "flex", justifyContent: "center", ...plate.style }}>
          <div style={{ transform: "scale(2.2)", transformOrigin: "50% 0" }}>
            <GlassPlate bg={PLATE_TERRACOTTA}>
              <Home size={18} strokeWidth={2.4} /> у вас дома
            </GlassPlate>
          </div>
        </div>
      )}
    </>
  );
};

/* ───────── 6. Build it together: word chips fly in from every side, the shared book gets thicker ───────── */

const CHIPS = Array.from({ length: 12 }, (_, i) => {
  const a = (i / 12) * Math.PI * 2 + 0.4;
  return { a, at: F.togetherIn + 8 + i * 6, w: [140, 110, 170, 120][i % 4], c: [T.glow, T.vivid, T.pale, T.main][i % 4] };
});
const Together: React.FC<{ frame: number }> = ({ frame }) => {
  const book = pop(frame, F.togetherIn + 2, SPRING.smooth);
  const caught = CHIPS.filter((c) => frame >= c.at + 26).length;
  const bump = CHIPS.reduce((m, c) => Math.max(m, 1 - Math.min(1, Math.abs(frame - c.at - 28) / 6)), 0);
  const plate = pop(frame, F.together - 6, SPRING.bouncy);
  const CX = 540;
  const CY = 760;
  return (
    <>
      <Title text="соберем *общий словарь*" frame={frame} at={[F.build, F.shared, F.dictionary]} size={96} />
      {CHIPS.map((c, i) => {
        const f = ease.in(progress(frame, c.at, c.at + 26));
        if (f <= 0 || f >= 1) return null;
        const R = 720;
        const x = lerp(CX + Math.cos(c.a) * R, CX, f);
        const y = lerp(Math.max(480, CY + Math.sin(c.a) * R * 0.75), CY, f);
        return <div key={i} style={{ position: "absolute", left: x - c.w / 2, top: y - 30, width: c.w, height: 60, borderRadius: 30, background: c.c, boxShadow: SURFACE.boxShadow, transform: `scale(${1 - 0.6 * f}) rotate(${(1 - f) * 30}deg)` }} />;
      })}
      <div style={{ position: "absolute", left: CX - 210, top: CY - 260, width: 420 + caught * 4, height: 520, ...book.style, transform: `${book.style.transform} scale(${1 + 0.04 * bump})` }}>
        {/* page block grows thicker with every word */}
        <div style={{ position: "absolute", left: 30, top: 14, right: -caught * 3, bottom: 14, borderRadius: 24, background: "#fff", boxShadow: SURFACE.boxShadow, overflow: "hidden" }}>
          {Array.from({ length: caught }, (_, k) => (
            <div key={k} style={{ position: "absolute", right: 4 + k * 3, top: 10, bottom: 10, width: 2, background: GRAY }} />
          ))}
        </div>
        <div style={{ position: "absolute", left: 0, top: 0, width: 400, height: 520, borderRadius: 28, background: `linear-gradient(135deg, ${T.vivid}, ${T.main})`, boxShadow: SURFACE.boxShadow }}>
          <div style={{ position: "absolute", left: 34, top: 0, bottom: 0, width: 14, background: "rgba(255,255,255,0.25)" }} />
          <div style={{ position: "absolute", left: 100, right: 50, top: 150, height: 150, borderRadius: 20, border: "5px solid rgba(255,255,255,0.7)", display: "flex", flexDirection: "column", justifyContent: "center", gap: 18, padding: "0 30px" }}>
            <div style={{ height: 18, borderRadius: 9, background: "#fff" }} />
            <div style={{ height: 14, width: "60%", borderRadius: 7, background: T.glow }} />
          </div>
        </div>
      </div>
      {plate.t > 0 && (
        <div style={{ position: "absolute", top: 1100, left: 0, right: 0, display: "flex", justifyContent: "center", ...plate.style }}>
          <div style={{ transform: "scale(2.2)", transformOrigin: "50% 0" }}>
            <GlassPlate bg={PLATE_TERRACOTTA}>
              <Users size={18} strokeWidth={2.4} /> вместе
            </GlassPlate>
          </div>
        </div>
      )}
    </>
  );
};

/* ───────── Composition ───────── */

const SCENES: SceneDef[] = [
  { range: [0, F.wordsIn], El: Hook },
  { range: [F.wordsIn, F.friendsIn], El: Fridge },
  { range: [F.friendsIn, F.dictIn], El: Friends },
  { range: [F.dictIn, F.ctaIn], El: Dictionary },
  { range: [F.ctaIn, F.togetherIn], El: Comment },
  { range: [F.togetherIn, F.duration + 30], El: Together },
];

const SFX: Sfx[] = [
  { src: "sfx/07_CineStrike.wav", from: 2, volume: 0.16 },
  ...BUBBLES.map((_, i) => ({ src: "sfx2/pop.mp3", from: 22 + i * 14, volume: 0.16 })),
  { src: "sfx2/ding.mp3", from: F.tatar, volume: 0.2 },
  // scene changes: textures from the SFX/ library (no whoosh)
  { src: "sfx/01_Ripple_Textures.wav", from: F.wordsIn - 8, volume: 0.18 },
  { src: "sfx/04_Cyber_Shift.wav", from: F.friendsIn - 8, volume: 0.2 },
  { src: "sfx/06_Ripple_Textures_II.wav", from: F.dictIn - 8, volume: 0.2 },
  { src: "sfx/02_Alienated_Warpes.wav", from: F.ctaIn - 8, volume: 0.14 },
  { src: "sfx/01_Ripple_Textures.wav", from: F.togetherIn - 8, volume: 0.18 },
  // 2. notes slap onto the fridge
  ...NOTES.map((n) => ({ src: "sfx2/click.mp3", from: n.at - 2, volume: 0.22 })),
  // 3. blank eyes
  { src: "sfx2/pop.mp3", from: F.said - 4, volume: 0.2 },
  { src: "sfx/05_Distortion_Glitch.wav", from: F.blank - 2, volume: 0.04 },
  // 4. heartbeat
  { src: "sfx/03_Basscrack.wav", from: F.alive, volume: 0.1 },
  // 5. comment
  { src: "sfx2/click.mp3", from: F.saying, volume: 0.2 },
  { src: "sfx2/pop.mp3", from: F.yours - 6, volume: 0.24 },
  // 6. words land in the book
  ...[0, 3, 6, 9].map((k) => ({ src: "sfx2/pop.mp3", from: CHIPS[k].at + 26, volume: 0.12 })),
  { src: "sfx2/ding.mp3", from: F.together - 4, volume: 0.2 },
  { src: "sfx/07_CineStrike.wav", from: F.together + 20, volume: 0.1 },
];

// All 30 poses of the Alicja set, each at least once, by the meaning of the line; never the same photo twice in a row
const AVATAR_KEYS: AvatarKey[] = [
  // 1. hook: you don't even notice
  { at: 0, e: "arms-crossed" },
  { at: 35, e: "skeptical" },
  { at: 70, e: "puzzled" },
  { at: 105, e: "thinking" },
  { at: 150, e: "surprised" },
  // 2. Әни, кызым, ашарга
  { at: F.wordsIn, e: "heart-hands" },
  { at: 250, e: "smile-up" },
  { at: 300, e: "delighted" },
  { at: 355, e: "shrug" },
  { at: 405, e: "explaining" },
  { at: 455, e: "soft-smile" },
  // 3. friends, blank eyes
  { at: F.friendsIn, e: "waving" },
  { at: 545, e: "present-left" },
  { at: 580, e: "laughing" },
  { at: 615, e: "displeased" },
  { at: 645, e: "facepalm" },
  { at: 672, e: "disappointed" },
  // 4. your family dictionary, alive
  { at: F.dictIn, e: "point-down" },
  { at: 735, e: "hand-on-heart" },
  { at: 775, e: "dreamy" },
  { at: 815, e: "inspired" },
  { at: 850, e: "smile-up" },
  // 5. write one word
  { at: F.ctaIn, e: "point-up" },
  { at: 920, e: "stop" },
  { at: 960, e: "point-right" },
  { at: 1000, e: "listening" },
  { at: 1035, e: "shush" },
  { at: 1075, e: "pensive" },
  // 6. together
  { at: F.togetherIn, e: "thumbs-up" },
  { at: 1160, e: "victory" },
  { at: 1200, e: "clapping" },
];

const STANCES: StanceKey[] = [
  { at: 0, s: "center" },
  { at: F.wordsIn, s: "right" },
  { at: F.friendsIn, s: "left" },
  { at: F.dictIn, s: "right" },
  { at: F.ctaIn, s: "left" },
  { at: F.togetherIn, s: "center" },
];

// Alicja set photos: scale the wide-framed ones so every photo fills the 540x590 box by height (same as V37)
const SIZE: Record<string, [number, number]> = {
  pensive: [1129, 1393], dreamy: [1293, 1216], displeased: [1254, 1254], surprised: [1280, 1229], waving: [1312, 1199], inspired: [1199, 1312], explaining: [1312, 1199], delighted: [1312, 1199], skeptical: [1312, 1199], laughing: [1385, 1136],
  puzzled: [1129, 1393], disappointed: [1278, 1230], "smile-up": [1199, 1312], thinking: [1129, 1393], "soft-smile": [1164, 1351], "point-up": [1312, 1199], "point-down": [1312, 1199], "present-left": [1312, 1199], "point-right": [1312, 1199], shrug: [1312, 1199],
  "hand-on-heart": [1312, 1199], stop: [1312, 1199], shush: [1199, 1312], clapping: [1312, 1199], "thumbs-up": [1312, 1199], "arms-crossed": [1199, 1312], facepalm: [1312, 1199], "heart-hands": [1312, 1199], victory: [1312, 1199], listening: [1312, 1199],
};
const FIT = Object.fromEntries(Object.entries(SIZE).map(([e, [w, h]]) => [e, Math.max(1, w / h / (540 / 590))])) as Partial<Record<Emotion, number>>;

const Host: React.FC<{ frame: number }> = ({ frame }) => <TatAvatar frame={frame} keys={AVATAR_KEYS} words={WORDS} stances={STANCES} dir="v39/avatar" fit={FIT} />;

export const Video39: React.FC = () => (
  <AbsoluteFill style={{ background: "#fff", fontFamily: PARAGRAPH.fontFamily, color: INK }}>
    <ReelShell scenes={SCENES} headlines={[]} vo={VO} sfx={SFX} duration={F.duration} music="v39/music/bed.mp3" musicLevel={[0.045, 0.11]} overlay={Host} bg={BG} />
  </AbsoluteFill>
);
