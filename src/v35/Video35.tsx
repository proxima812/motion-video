import React from "react";
import { AbsoluteFill } from "remotion";
import { MapPin, Phone } from "lucide-react";
import { SPRING, ease, lerp, progress, springAt } from "../stage/motion";
import { ReelShell, pop, shake, type SceneDef, type Sfx } from "../kit/reel";
import { TatAvatar, type AvatarKey, type Emotion, type StanceKey } from "../kit/TatAvatar";
import { DotOrbitBg } from "../kit/DotOrbitBg";
import { HEADING, INK, NUMBER, PARAGRAPH, SURFACE } from "../kit/design";
import { GlassPlate } from "../catalog/own/glass";
import { Strike } from "../catalog/own/text";
import { F, VO } from "./timeline";
import { WORDS } from "./words";

// "Когда-нибудь спрошу у бабушки" (@the_tatarverse, RU, host preset 2 Alicja). ~20 s.
// The real reason you still haven't asked: you think there is time -> the questions pile up (village, songs, surname)
// -> "someday" is not a date in the calendar -> pick one question and ask it today.
// Own kit only. Palette: amber (memory, family, warmth). Dot Orbit variant 5 (output/bg-variant.txt).
const B = { main: "#9A4A0B", vivid: "#D0701A", glow: "#F3BE8A", pale: "#FDF0E3" };
const BG = <DotOrbitBg variant={5} />;
const W = 1080;
const MUTED = "#B9B0A8";

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
        <span key={i} style={{ display: "inline-block", marginRight: i < all.length - 1 ? "0.24em" : 0, fontWeight: key ? 700 : 400, color: key ? B.main : undefined, opacity: Math.min(1, t * 1.3), transform: `translateY(${(1 - t) * 30}px)`, filter: `blur(${Math.max(0, (1 - t) * 8)}px)` }}>
          {raw}
        </span>
      );
    })}
  </div>
);

/** A few grey "handwriting" strokes - a note with a question on it, no words */
const Scribble: React.FC<{ w: number; rows?: number; color?: string }> = ({ w, rows = 3, color = "#E2D3C4" }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    {Array.from({ length: rows }, (_, i) => (
      <div key={i} style={{ width: w * [1, 0.78, 0.55, 0.7][i % 4], height: 12, borderRadius: 6, background: color }} />
    ))}
  </div>
);

/* ───────── 1. Hook: grandma's contact, the thumb hovers over "call" and backs off ───────── */

const Hook: React.FC<{ frame: number }> = ({ frame }) => {
  const outA = progress(frame, F.why - 14, F.why - 2);
  const card = pop(frame, 14, SPRING.smooth);
  // hesitation: the thumb comes close to the button and backs away, again and again
  const t = Math.max(0, frame - F.grandma + 6);
  const near = frame < F.grandma - 6 ? 0 : 0.5 - 0.5 * Math.cos(t / 11);
  const thumbY = lerp(300, 46, near);
  const ring = (frame % 50) / 50;
  return (
    <>
      {outA < 1 && <Title text="вот настоящая *причина*" frame={frame} at={[-30, -24, F.reason - 6]} size={96} style={{ opacity: 1 - outA }} />}
      {frame >= F.why - 4 && <Title text="почему ты все еще *не спросил*" frame={frame} at={[F.why, 112, 121, 135, F.asked - 6, F.asked]} size={92} />}
      <div style={{ position: "absolute", top: 520, left: 0, right: 0, display: "flex", justifyContent: "center", ...card.style }}>
        <div style={{ ...SURFACE, width: 640, padding: 48, display: "flex", flexDirection: "column", alignItems: "center", gap: 30, position: "relative" }}>
          <div style={{ width: 170, height: 170, borderRadius: 85, background: `linear-gradient(135deg, ${B.glow}, ${B.vivid})`, border: "8px solid #fff", boxShadow: `0 0 0 6px ${B.pale}` }} />
          <div style={{ ...PARAGRAPH, fontSize: 64, lineHeight: 1, fontWeight: 700 }}>бабушка</div>
          <div style={{ position: "relative", width: 140, height: 140, marginTop: 10 }}>
            <div style={{ position: "absolute", inset: -40 * ring, borderRadius: "50%", border: `5px solid ${B.glow}`, opacity: 1 - ring }} />
            <div style={{ position: "absolute", inset: 0, borderRadius: 70, background: B.vivid, display: "grid", placeItems: "center" }}>
              <Phone size={62} color="#fff" strokeWidth={2} />
            </div>
            {frame >= F.grandma - 6 && <div style={{ position: "absolute", left: 25, top: thumbY, width: 90, height: 90, borderRadius: 45, background: "rgba(37, 27, 58, 0.14)", border: "3px solid rgba(37, 27, 58, 0.18)" }} />}
          </div>
        </div>
      </div>
    </>
  );
};

/* ───────── 2. You think you'll make it: the task keeps getting postponed ───────── */

const CHIPS: [string, number][] = [["сегодня", 0], ["завтра", F.make], ["потом", F.make + 34], ["когда-нибудь", F.someday]];
const Later: React.FC<{ frame: number }> = ({ frame }) => {
  const card = pop(frame, F.laterIn + 6, SPRING.smooth);
  const k = CHIPS.reduce((m, [, at], i) => (frame >= at ? i : m), 0);
  const chip = pop(frame, CHIPS[k][1], SPRING.bouncy);
  const nudge = CHIPS.slice(1).reduce((s, [, at]) => s + shake(frame, at, 10, 16), 0);
  // days roll by under the task
  const roll = ease.out(progress(frame, F.make, F.later + 30)) * 4;
  const fade = k / 3;
  return (
    <>
      <Title text="ты думаешь что *успеешь*" frame={frame} at={[F.laterIn + 2, F.think, 288, F.make]} size={92} />
      <div style={{ position: "absolute", top: 560, left: 100, right: 100, ...card.style }}>
        <div style={{ ...SURFACE, padding: 44, display: "flex", alignItems: "center", gap: 30, transform: `translateX(${nudge}px)` }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, border: `5px solid ${MUTED}`, flex: "none" }} />
          <div style={{ ...PARAGRAPH, fontSize: 52, lineHeight: 1, flex: 1 }}>
            спросить <b>бабушку</b>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 28 }}>
          <div style={{ ...SURFACE, borderRadius: 999, padding: "22px 34px", ...PARAGRAPH, fontSize: 46, lineHeight: 1, fontWeight: 700, color: k === 0 ? B.main : INK, background: k === 0 ? B.pale : "#fff", opacity: 1 - 0.35 * fade, ...chip.style }}>
            {CHIPS[k][0]}
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", top: 1000, left: 100, right: 100, height: 150, overflow: "hidden" }}>
        <div style={{ display: "flex", gap: 24, transform: `translateX(${-roll * 144}px)`, ...card.style }}>
          {Array.from({ length: 11 }, (_, i) => {
            const day = 15 + i;
            const past = i < roll;
            return (
              <div key={i} style={{ ...SURFACE, flex: "none", width: 120, height: 130, display: "grid", placeItems: "center", ...NUMBER, fontSize: 52, fontWeight: 400, color: past ? MUTED : INK, background: i === 0 && !past ? B.pale : "#fff" }}>
                {day}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

/* ───────── 3. The questions pile up: blank notes drop on a stack, then the first one turns over ───────── */

const NOTES = [0, 18, 33, 46, 57, 66, 74, 81].map((d, i) => ({ at: F.questions + 8 + d, x: [0, -60, 50, -30, 70, -80, 20, -10][i], r: [-6, 5, -3, 8, -9, 4, -5, 7][i] }));
const Pile: React.FC<{ frame: number }> = ({ frame }) => {
  const front = pop(frame, F.how - 4, SPRING.bouncy);
  const dim = progress(frame, F.how - 4, F.how + 16);
  const pin = springAt(frame, F.village - 4, SPRING.bouncy);
  const n = NOTES.filter((m) => frame >= m.at + 10).length;
  return (
    <>
      <Title text="вопросы *копятся*" frame={frame} at={[F.questions, F.pile]} size={100} />
      <div style={{ position: "absolute", inset: 0, opacity: 1 - 0.55 * dim, transform: `translateY(${dim * 60}px) scale(${1 - 0.1 * dim})`, transformOrigin: "50% 100%" }}>
        {NOTES.map((m, i) => {
          const drop = springAt(frame, m.at, SPRING.bouncy);
          const y = 1130 - i * 46;
          return (
            <div key={i} style={{ position: "absolute", left: W / 2 - 170 + m.x, top: lerp(-400, y - 300, Math.min(drop, 1.08)), width: 340, height: 300, ...SURFACE, borderRadius: 20, background: i % 2 ? "#fff" : B.pale, padding: 40, transform: `rotate(${m.r}deg)`, opacity: drop > 0 ? 1 : 0 }}>
              <Scribble w={240} />
            </div>
          );
        })}
        <div style={{ position: "absolute", left: 790, top: 470, width: 130, height: 130, borderRadius: 65, background: B.vivid, display: "grid", placeItems: "center", ...NUMBER, fontSize: 64, color: "#fff", transform: `scale(${(n ? 1 + 0.15 * Math.max(0, 1 - (frame - NOTES[n - 1].at - 10) / 10) : 0) * (1 - dim)})` }}>{n}</div>
      </div>
      {front.t > 0 && (
        <div style={{ position: "absolute", top: 520, left: 0, right: 0, display: "flex", justifyContent: "center", ...front.style }}>
          <div style={{ ...SURFACE, width: 620, padding: 48, display: "flex", flexDirection: "column", alignItems: "center", gap: 34, transform: `rotate(${-2 + 2 * Math.min(front.t, 1)}deg)` }}>
            <div style={{ width: 130, height: 130, borderRadius: 65, background: B.pale, display: "grid", placeItems: "center", transform: `scale(${0.6 + 0.4 * Math.min(pin, 1.1)}) translateY(${(1 - Math.min(pin, 1)) * -20}px)` }}>
              <MapPin size={70} color={B.vivid} strokeWidth={2} />
            </div>
            <div style={{ ...HEADING, fontSize: 76, lineHeight: 1 }}>
              наша <b style={{ color: B.main }}>деревня</b>
            </div>
            <Scribble w={360} rows={2} />
          </div>
        </div>
      )}
    </>
  );
};

/* ───────── 4. What did they sing at home -> where is the surname from ───────── */

const Song: React.FC<{ frame: number }> = ({ frame }) => {
  const tape = pop(frame, F.songIn + 6, SPRING.smooth);
  const swap = ease.inOut(progress(frame, F.whence - 16, F.whence + 4));
  const spin = (frame - F.songIn) * 4;
  const surname = pop(frame, F.whence + 8, SPRING.bouncy);
  const LEVELS = [
    { at: F.surname - 18, n: 2, y: 780, r: 46 },
    { at: F.surname + 6, n: 4, y: 950, r: 34 },
    { at: F.surname + 26, n: 8, y: 1100, r: 24 },
  ];
  return (
    <>
      {swap < 1 && <Title text="что пели *дома*" frame={frame} at={[F.songIn + 2, F.sang, F.home]} size={100} style={{ opacity: 1 - swap }} />}
      {swap > 0 && <Title text="откуда наша *фамилия*" frame={frame} at={[F.whence, 758, F.surname]} size={92} />}
      {swap < 1 && (
        <div style={{ position: "absolute", top: 520, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 60, ...tape.style, opacity: (tape.style.opacity as number) * (1 - swap), transform: `${tape.style.transform} translateY(${swap * -80}px)` }}>
          {/* cassette: two reels turning */}
          <div style={{ ...SURFACE, width: 600, height: 360, padding: 40, display: "flex", flexDirection: "column", gap: 30 }}>
            <div style={{ height: 70, borderRadius: 14, background: B.pale }} />
            <div style={{ flex: 1, borderRadius: 18, background: "#F6F1EC", display: "flex", justifyContent: "space-around", alignItems: "center" }}>
              {[0, 1].map((k) => (
                <div key={k} style={{ width: 120, height: 120, borderRadius: 60, border: `14px solid ${k ? B.main : B.vivid}`, position: "relative", transform: `rotate(${spin + k * 30}deg)` }}>
                  {[0, 60, 120].map((a) => (
                    <div key={a} style={{ position: "absolute", left: 40, top: 4, width: 12, height: 84, borderRadius: 6, background: k ? B.main : B.vivid, transformOrigin: "6px 42px", transform: `rotate(${a}deg) translateX(-2px)` }} />
                  ))}
                </div>
              ))}
            </div>
          </div>
          {/* the melody: equalizer bars */}
          <div style={{ display: "flex", gap: 18, alignItems: "flex-end", height: 160 }}>
            {Array.from({ length: 9 }, (_, i) => {
              const h = 40 + 110 * (0.5 + 0.5 * Math.sin((frame - F.sang) / 6 + i * 1.3)) * progress(frame, F.sang - 6, F.sang + 10);
              return <div key={i} style={{ width: 30, height: h, borderRadius: 15, background: i % 2 ? B.glow : B.vivid }} />;
            })}
          </div>
        </div>
      )}
      {swap > 0 && (
        <>
          <svg width={W} height={1300} style={{ position: "absolute", inset: 0 }}>
            {LEVELS.map((lv, li) => {
              const g = ease.out(progress(frame, lv.at - 8, lv.at + 10));
              const prev = li === 0 ? { n: 1, y: 600 } : LEVELS[li - 1];
              return Array.from({ length: lv.n }, (_, i) => {
                const x = W / 2 + (i - (lv.n - 1) / 2) * (760 / lv.n);
                const p = Math.floor(i / 2);
                const px = W / 2 + (p - (prev.n - 1) / 2) * (760 / prev.n);
                return <line key={`${li}-${i}`} x1={px} y1={prev.y} x2={lerp(px, x, g)} y2={lerp(prev.y, lv.y, g)} stroke={B.glow} strokeWidth={5} strokeDasharray="3 14" strokeLinecap="round" />;
              });
            })}
          </svg>
          {LEVELS.map((lv, li) =>
            Array.from({ length: lv.n }, (_, i) => {
              const x = W / 2 + (i - (lv.n - 1) / 2) * (760 / lv.n);
              const s = springAt(frame, lv.at + i * 2, SPRING.bouncy);
              const unknown = li === 2;
              return <div key={`${li}-${i}`} style={{ position: "absolute", left: x - lv.r, top: lv.y - lv.r, width: lv.r * 2, height: lv.r * 2, borderRadius: lv.r, background: unknown ? "#fff" : [B.vivid, B.glow][li], border: unknown ? `4px dashed ${MUTED}` : "6px solid #fff", boxShadow: SURFACE.boxShadow, transform: `scale(${s})` }} />;
            }),
          )}
          {surname.t > 0 && (
            <div style={{ position: "absolute", top: 520, left: 0, right: 0, display: "flex", justifyContent: "center", ...surname.style }}>
              <div style={{ ...SURFACE, padding: "36px 56px", ...HEADING, fontSize: 72, lineHeight: 1, fontWeight: 700, color: B.main }}>Гарипова</div>
            </div>
          )}
        </>
      )}
    </>
  );
};

/* ───────── 5. "Someday" is not a date: a scanner runs through the month and finds no such day ───────── */

const Calendar: React.FC<{ frame: number }> = ({ frame }) => {
  const a = pop(frame, F.calIn + 2, SPRING.smooth);
  const b = pop(frame, F.not - 4, SPRING.smooth);
  const cal = pop(frame, F.calIn + 14, SPRING.smooth);
  // the selection hops through all 30 days, finds nothing, then lands on today (15)
  const scan = Math.floor(progress(frame, F.calIn + 30, F.calendar + 10) * 30);
  const scanning = frame >= F.calIn + 30 && frame < F.calendar + 10;
  const today = springAt(frame, F.calendar + 20, SPRING.bouncy);
  const s = shake(frame, F.calendar + 10, 12, 18);
  return (
    <>
      <div style={{ ...HEADING, position: "absolute", top: 170, left: 0, right: 0, textAlign: "center", fontSize: 92, lineHeight: 1.25 }}>
        <div style={a.style}>
          <Strike frame={frame} at={F.not - 10}>
            когда-нибудь
          </Strike>
        </div>
        <div style={b.style}>
          не <b style={{ color: B.main }}>дата</b>
        </div>
      </div>
      <div style={{ position: "absolute", top: 520, left: 130, right: 130, ...cal.style }}>
        <div style={{ ...SURFACE, padding: 40, transform: `translateX(${s}px)` }}>
          <div style={{ ...HEADING, fontSize: 52, fontWeight: 700, color: B.main, marginBottom: 26, textAlign: "center" }}>ноябрь</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10 }}>
            {Array.from({ length: 36 }, (_, i) => {
              const d = i - 5; // Nov 1 2026 is a Sunday: 6 empty cells first (Mon-start)
              if (d < 1 || d > 30) return <div key={i} />;
              const hot = scanning && d - 1 === scan;
              const isToday = d === 15 && today > 0;
              return (
                <div key={i} style={{ height: 80, borderRadius: 16, display: "grid", placeItems: "center", ...NUMBER, fontSize: 36, fontWeight: isToday ? 700 : 400, color: isToday ? "#fff" : hot ? B.main : INK, background: isToday ? B.vivid : hot ? B.pale : "transparent", outline: hot ? `3px solid ${B.glow}` : undefined, transform: isToday ? `scale(${0.7 + 0.3 * Math.min(today, 1.15)})` : undefined }}>
                  {d}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

/* ───────── 6. Pick one question and ask it today ───────── */

const CARDS = [
  { label: "деревня", r: -11, x: -250 },
  { label: "песни", r: 0, x: 0 },
  { label: "фамилия", r: 11, x: 250 },
];
const Pick: React.FC<{ frame: number }> = ({ frame }) => {
  const pick = ease.inOut(progress(frame, F.question, F.question + 30));
  const plate = pop(frame, F.today - 6, SPRING.bouncy);
  return (
    <>
      <Title text="выбери *один* вопрос" frame={frame} at={[F.pickIn + 2, F.one, F.question - 6]} size={96} />
      {CARDS.map((c, i) => {
        const p = springAt(frame, F.pickIn + 8 + i * 6, SPRING.bouncy);
        const chosen = i === 0;
        const x = chosen ? lerp(c.x, 0, pick) : c.x;
        const y = chosen ? lerp(0, -30, pick) : lerp(0, 160, pick);
        const r = chosen ? lerp(c.r, 0, pick) : c.r;
        const sc = chosen ? 1 + 0.22 * pick : 1 - 0.15 * pick;
        const op = chosen ? 1 : 1 - pick;
        return (
          <div key={c.label} style={{ position: "absolute", left: W / 2 - 160 + x, top: 560 + y + (1 - Math.min(p, 1)) * 200, width: 320, height: 380, ...SURFACE, padding: 36, display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "flex-start", transform: `rotate(${r}deg) scale(${sc * Math.min(1, p)})`, transformOrigin: "50% 100%", opacity: op * Math.min(1, p * 1.5), zIndex: chosen ? 2 : 1, background: chosen && pick > 0.5 ? B.pale : "#fff" }}>
            <Scribble w={220} />
            <div style={{ ...PARAGRAPH, fontSize: 50, lineHeight: 1, fontWeight: 700, color: chosen ? B.main : INK }}>{c.label}</div>
          </div>
        );
      })}
      {plate.t > 0 && (
        <div style={{ position: "absolute", top: 1100, left: 0, right: 0, display: "flex", justifyContent: "center", ...plate.style }}>
          <div style={{ transform: "scale(2.3)" }}>
            <GlassPlate bg={`linear-gradient(135deg, ${B.vivid}, ${B.main})`}>
              <Phone size={18} strokeWidth={2.2} /> сегодня
            </GlassPlate>
          </div>
        </div>
      )}
    </>
  );
};

/* ───────── Composition ───────── */

const SCENES: SceneDef[] = [
  { range: [0, F.laterIn], El: Hook },
  { range: [F.laterIn, F.pileIn], El: Later },
  { range: [F.pileIn, F.songIn], El: Pile },
  { range: [F.songIn, F.calIn], El: Song },
  { range: [F.calIn, F.pickIn], El: Calendar },
  { range: [F.pickIn, F.duration + 30], El: Pick },
];

const SFX: Sfx[] = [
  { src: "sfx/07_CineStrike.wav", from: 2, volume: 0.16 },
  { src: "sfx2/pop.mp3", from: 14, volume: 0.22 },
  // scene changes: textures from the SFX/ library (no whoosh)
  { src: "sfx/06_Ripple_Textures_II.wav", from: F.laterIn - 8, volume: 0.2 },
  { src: "sfx/02_Alienated_Warpes.wav", from: F.pileIn - 8, volume: 0.14 },
  { src: "sfx/01_Ripple_Textures.wav", from: F.songIn - 8, volume: 0.18 },
  { src: "sfx/04_Cyber_Shift.wav", from: F.calIn - 8, volume: 0.2 },
  { src: "sfx/06_Ripple_Textures_II.wav", from: F.pickIn - 8, volume: 0.2 },
  // 2. the date chip flips
  ...CHIPS.slice(1).map(([, at]) => ({ src: "sfx2/click.mp3", from: at, volume: 0.2 })),
  // 3. notes drop, the village card
  ...NOTES.filter((_, i) => i % 2 === 0).map((m) => ({ src: "sfx2/pop.mp3", from: m.at + 6, volume: 0.16 })),
  { src: "sfx2/ding.mp3", from: F.how - 2, volume: 0.2 },
  // 4. surname
  { src: "sfx2/pop.mp3", from: F.whence + 8, volume: 0.22 },
  // 5. strike, no such day, today
  { src: "sfx/05_Distortion_Glitch.wav", from: F.not + 20, volume: 0.05 },
  { src: "sfx/03_Basscrack.wav", from: F.calendar + 10, volume: 0.1 },
  { src: "sfx2/ding.mp3", from: F.calendar + 20, volume: 0.2 },
  // 6. pick, today
  { src: "sfx2/click.mp3", from: F.question + 2, volume: 0.2 },
  { src: "sfx/07_CineStrike.wav", from: F.today - 4, volume: 0.12 },
];

// All 30 poses of the Alicja set, each at least once; a swap every ~0.7 s by the meaning of the line, never the same photo twice in a row
const AVATAR_KEYS: AvatarKey[] = [
  // 1. hook
  { at: 0, e: "point-up" },
  { at: 40, e: "explaining" },
  { at: 85, e: "skeptical" },
  { at: 125, e: "puzzled" },
  { at: 165, e: "shrug" },
  { at: 205, e: "arms-crossed" },
  // 2. someday, later
  { at: F.laterIn, e: "dreamy" },
  { at: 290, e: "smile-up" },
  { at: 330, e: "soft-smile" },
  { at: 365, e: "pensive" },
  { at: 405, e: "laughing" },
  // 3. questions pile up
  { at: F.pileIn, e: "thinking" },
  { at: 490, e: "surprised" },
  { at: 530, e: "point-down" },
  { at: 575, e: "present-left" },
  { at: 620, e: "listening" },
  // 4. songs, surname
  { at: F.songIn, e: "inspired" },
  { at: 700, e: "hand-on-heart" },
  { at: 740, e: "point-right" },
  { at: 790, e: "delighted" },
  // 5. not a date
  { at: F.calIn, e: "stop" },
  { at: 875, e: "displeased" },
  { at: 915, e: "facepalm" },
  { at: 950, e: "disappointed" },
  { at: 990, e: "shush" },
  // 6. ask today
  { at: F.pickIn, e: "thumbs-up" },
  { at: 1068, e: "victory" },
  { at: 1100, e: "clapping" },
  { at: 1140, e: "heart-hands" },
  { at: 1180, e: "waving" },
];

const STANCES: StanceKey[] = [
  { at: 0, s: "center" },
  { at: F.laterIn, s: "right" },
  { at: F.pileIn, s: "left" },
  { at: F.songIn, s: "right" },
  { at: F.calIn, s: "left" },
  { at: F.pickIn, s: "center" },
];

// Alicja photos: scale the wide-framed ones so every photo fills the 540x590 box by height (same as V25)
const SIZE: Record<string, [number, number]> = {
  pensive: [1129, 1393], dreamy: [1293, 1216], displeased: [1254, 1254], surprised: [1280, 1229], waving: [1312, 1199], inspired: [1199, 1312], explaining: [1312, 1199], delighted: [1312, 1199], skeptical: [1312, 1199], laughing: [1385, 1136],
  puzzled: [1129, 1393], disappointed: [1278, 1230], "smile-up": [1199, 1312], thinking: [1129, 1393], "soft-smile": [1164, 1351], "point-up": [1312, 1199], "point-down": [1312, 1199], "present-left": [1312, 1199], "point-right": [1312, 1199], shrug: [1312, 1199],
  "hand-on-heart": [1312, 1199], stop: [1312, 1199], shush: [1199, 1312], clapping: [1312, 1199], "thumbs-up": [1312, 1199], "arms-crossed": [1199, 1312], facepalm: [1312, 1199], "heart-hands": [1312, 1199], victory: [1312, 1199], listening: [1312, 1199],
};
const FIT = Object.fromEntries(Object.entries(SIZE).map(([e, [w, h]]) => [e, Math.max(1, w / h / (540 / 590))])) as Partial<Record<Emotion, number>>;

const Host: React.FC<{ frame: number }> = ({ frame }) => <TatAvatar frame={frame} keys={AVATAR_KEYS} words={WORDS} stances={STANCES} dir="v35/avatar" fit={FIT} />;

export const Video35: React.FC = () => (
  <AbsoluteFill style={{ background: "#fff", fontFamily: PARAGRAPH.fontFamily, color: INK }}>
    <ReelShell scenes={SCENES} headlines={[]} vo={VO} sfx={SFX} duration={F.duration} music="v35/music/bed.mp3" musicLevel={[0.045, 0.11]} overlay={Host} bg={BG} />
  </AbsoluteFill>
);
