import React from "react";
import { AbsoluteFill } from "remotion";
import { CircleCheck } from "lucide-react";
import { SPRING, ease, lerp, progress, springAt } from "../stage/motion";
import { ReelShell, pop, shake, type SceneDef, type Sfx } from "../kit/reel";
import { TatAvatar, type AvatarKey, type Emotion, type StanceKey } from "../kit/TatAvatar";
import { DotOrbitBg } from "../kit/DotOrbitBg";
import { HEADING, INK, NUMBER, PARAGRAPH, SURFACE } from "../kit/design";
import { GlassPlate } from "../catalog/own/glass";
import { F, VO } from "./timeline";
import { WORDS } from "./words";

// "Татарский с акцентом" (@the_tatarverse, RU, main host preset Ahu). 20.9 s.
// We're shy to speak Tatar with an accent -> in English an accent is fine, you get praised -> in Tatar it's somehow shameful -> an accent only means you started -> say one phrase aloud today, any accent -> the native language gives no grades.
// Own kit only. Palette: cobalt (language, knowledge). Dot Orbit variant 6 (output/bg-variant.txt).
const T = { main: "#1F3FA0", vivid: "#3A5FD6", glow: "#A9B9F0", pale: "#ECF0FD" };
const PLATE_COBALT = "linear-gradient(135deg, #3A5FD6, #1F3FA0)";
const BG = <DotOrbitBg variant={6} />;
const GRAY = "#E3E5EC";

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

/** Live waveform: `n` bars, `level` 0..1 */
const Wave: React.FC<{ frame: number; n: number; h: number; w: number; gap: number; level: number; color: string; seed?: number }> = ({ frame, n, h, w, gap, level, color, seed = 0 }) => (
  <div style={{ display: "flex", alignItems: "center", gap, height: h }}>
    {Array.from({ length: n }, (_, i) => {
      const env = Math.sin((i / (n - 1)) * Math.PI) * 0.7 + 0.3;
      const k = Math.abs(Math.sin(frame / 5 + i * 1.3 + seed) * Math.cos(frame / 9 + i * 0.7));
      return <div key={i} style={{ width: w, height: Math.max(w, h * env * (0.25 + 0.75 * k) * level), borderRadius: w / 2, background: color }} />;
    })}
  </div>
);

/** Star shape (drawn) */
const Star: React.FC<{ size: number; fill: string }> = ({ size, fill }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <path d="M50 6 L62 37 L95 38 L69 58 L78 91 L50 72 L22 91 L31 58 L5 38 L38 37 Z" fill={fill} strokeLinejoin="round" stroke={fill} strokeWidth={6} />
  </svg>
);

/** A speech bubble with a language code chip and a waveform */
const LangBubble: React.FC<{ frame: number; code: string; level: number; dim?: boolean }> = ({ frame, code, level, dim }) => (
  <div style={{ position: "relative", ...SURFACE, borderRadius: 50, padding: 40, display: "flex", alignItems: "center", gap: 36 }}>
    <div style={{ width: 150, height: 150, borderRadius: 75, background: dim ? T.glow : `linear-gradient(135deg, ${T.vivid}, ${T.main})`, display: "grid", placeItems: "center", flex: "none" }}>
      <span style={{ ...NUMBER, fontSize: 64, color: "#fff" }}>{code}</span>
    </div>
    <Wave frame={frame} n={13} h={130} w={16} gap={12} level={level} color={dim ? T.glow : T.vivid} />
    <svg width={60} height={50} style={{ position: "absolute", left: 90, bottom: -44 }}>
      <path d="M0 0 H60 L10 48 Z" fill="#fff" />
    </svg>
  </div>
);

/* ───────── 1. Hook: the voice slider is dragged down on "стесняемся", the waveform goes quiet ───────── */

const Hook: React.FC<{ frame: number }> = ({ frame }) => {
  const first = fadeOut(frame, F.but - 6);
  const card = pop(frame, 6, SPRING.smooth);
  const down = ease.inOut(progress(frame, F.ashamed - 4, F.ashamed + 40));
  const level = lerp(1, 0.1, down);
  const pct = Math.round(lerp(100, 10, down));
  const s = shake(frame, F.accent, 10, 18);
  return (
    <>
      {first > 0 && <Title text="никто не хочет *признавать*" frame={frame} at={[-30, -24, F.wants, F.admit]} size={92} style={{ opacity: first }} />}
      {frame >= F.but && <Title text="стесняемся *акцента*" frame={frame} at={[F.ashamed - 4, F.accent]} size={100} />}
      <div style={{ position: "absolute", left: 100, right: 100, top: 470, ...card.style, transform: `${card.style.transform} translateX(${s}px)` }}>
        <div style={{ ...SURFACE, borderRadius: 40, height: 380, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Wave frame={frame} n={21} h={280} w={22} gap={14} level={level} color={T.vivid} />
        </div>
        <div style={{ ...SURFACE, borderRadius: 40, marginTop: 40, padding: 44, display: "flex", alignItems: "center", gap: 40 }}>
          <div style={{ position: "relative", flex: 1, height: 26, borderRadius: 13, background: GRAY }}>
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct}%`, borderRadius: 13, background: `linear-gradient(90deg, ${T.glow}, ${T.vivid})` }} />
            <div style={{ position: "absolute", left: `calc(${pct}% - 34px)`, top: -21, width: 68, height: 68, borderRadius: 34, background: "#fff", border: `8px solid ${T.main}`, boxSizing: "border-box", boxShadow: SURFACE.boxShadow }} />
          </div>
          <span style={{ ...NUMBER, fontSize: 76, width: 200, textAlign: "right", color: T.main }}>{pct}%</span>
        </div>
      </div>
    </>
  );
};

/* ───────── 2. English with an accent: fine, hearts float up, five stars ───────── */

const English: React.FC<{ frame: number }> = ({ frame }) => {
  const first = fadeOut(frame, F.youObj - 14);
  const b = pop(frame, F.enIn + 4, SPRING.smooth);
  return (
    <>
      {first > 0 && <Title text="с акцентом *нормально*" frame={frame} at={[F.english, F.english + 6, F.fine]} size={96} style={{ opacity: first }} />}
      {frame >= F.youObj - 8 && <Title text="тебя *хвалят*" frame={frame} at={[F.youObj - 4, F.praise]} size={104} />}
      <div style={{ position: "absolute", left: 110, right: 110, top: 520, ...b.style }}>
        <LangBubble frame={frame} code="EN" level={1} />
      </div>
      {/* hearts float up while you try */}
      {Array.from({ length: 6 }, (_, k) => {
        const st = F.trying + k * 9;
        const r = progress(frame, st, st + 70);
        if (r <= 0 || r >= 1) return null;
        return (
          <svg key={k} width={60} height={54} viewBox="0 0 90 80" style={{ position: "absolute", left: 760 + Math.sin(k * 2.1 + r * 6) * 60, top: 560 - r * 220, opacity: 1 - r, transform: `scale(${0.6 + 0.6 * Math.sin(r * Math.PI)})` }}>
            <path d="M45 76 C 10 50 0 34 0 20 C 0 6 12 0 22 0 C 32 0 40 6 45 14 C 50 6 58 0 68 0 C 78 0 90 6 90 20 C 90 34 80 50 45 76 Z" fill={k % 2 ? T.vivid : T.glow} />
          </svg>
        );
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: 880, display: "flex", justifyContent: "center", gap: 22 }}>
        {[0, 1, 2, 3, 4].map((k) => {
          const t = springAt(frame, F.praise - 8 + k * 5, SPRING.bouncy);
          return (
            <div key={k} style={{ position: "relative", width: 140, height: 140 }}>
              <div style={{ position: "absolute", inset: 0 }}>
                <Star size={140} fill={GRAY} />
              </div>
              <div style={{ position: "absolute", inset: 0, transform: `scale(${t})` }}>
                <Star size={140} fill={T.vivid} />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

/* ───────── 3. In Tatar it's somehow shameful: the stars stay grey, the bubble shrinks and trembles ───────── */

const Tatar: React.FC<{ frame: number }> = ({ frame }) => {
  const b = pop(frame, F.ttIn + 4, SPRING.smooth);
  const shrink = ease.inOut(progress(frame, F.shame - 6, F.shame + 24));
  const tremble = frame > F.shame ? Math.sin(frame * 1.7) * 4 * shrink : 0;
  const drop = progress(frame, F.shame + 10, F.shame + 50);
  return (
    <>
      <Title text="а на татарском *стыдно*" frame={frame} at={[F.ttIn + 2, F.ttIn + 6, F.tatar, F.shame]} size={96} />
      <div style={{ position: "absolute", left: 110, right: 110, top: 520, transformOrigin: "20% 100%", ...b.style, transform: `${b.style.transform} scale(${1 - 0.35 * shrink}) translateX(${tremble}px)` }}>
        <LangBubble frame={frame} code="TT" level={lerp(1, 0.15, shrink)} dim={shrink > 0.5} />
        {drop > 0 && (
          <svg width={40} height={56} viewBox="0 0 40 56" style={{ position: "absolute", right: 30, top: -40 + drop * 30, opacity: 1 - Math.max(0, drop - 0.7) / 0.3 }}>
            <path d="M20 2 Q 38 30 34 40 A 14 14 0 0 1 6 40 Q 2 30 20 2 Z" fill={T.glow} />
          </svg>
        )}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 880, display: "flex", justifyContent: "center", gap: 22, opacity: 0.9 }}>
        {[0, 1, 2, 3, 4].map((k) => {
          const t = springAt(frame, F.ttIn + 10 + k * 4, SPRING.smooth);
          const fall = ease.in(progress(frame, F.somehow + k * 6, F.somehow + k * 6 + 30));
          return (
            <div key={k} style={{ transform: `scale(${t}) translateY(${fall * 40}px) rotate(${fall * (k % 2 ? 14 : -14)}deg)`, opacity: 1 - fall * 0.5 }}>
              <Star size={140} fill={GRAY} />
            </div>
          );
        })}
      </div>
    </>
  );
};

/* ───────── 4. An accent only means one thing: you crossed the start line ───────── */

const Start: React.FC<{ frame: number }> = ({ frame }) => {
  const first = fadeOut(frame, F.youStart - 14);
  const track = pop(frame, F.meansIn + 4, SPRING.smooth);
  const one = springAt(frame, F.one - 4, SPRING.bouncy);
  const go = ease.inOut(progress(frame, F.started - 4, F.speaking + 20));
  const x = lerp(230, 720, go);
  const hop = Math.abs(Math.sin(go * Math.PI * 4)) * 40 * (go > 0 && go < 1 ? 1 : 0);
  const Y = 880;
  return (
    <>
      {first > 0 && <Title text="акцент значит *одно*" frame={frame} at={[F.accentW, F.means, F.one]} size={100} style={{ opacity: first }} />}
      {frame >= F.youStart - 8 && <Title text="ты *начал говорить*" frame={frame} at={[F.youStart - 4, F.started, F.speaking]} size={100} />}
      <div style={{ position: "absolute", inset: 0, ...track.style }}>
        <div style={{ position: "absolute", left: 120, right: 120, top: Y + 70, height: 18, borderRadius: 9, background: GRAY }} />
        <div style={{ position: "absolute", left: 360, width: (x - 360) > 0 ? x - 360 : 0, top: Y + 70, height: 18, borderRadius: 9, background: `linear-gradient(90deg, ${T.glow}, ${T.vivid})` }} />
        {/* start line + flag */}
        <svg width={200} height={400} viewBox="0 0 200 400" style={{ position: "absolute", left: 340, top: Y - 300 }}>
          <rect x={14} y={20} width={12} height={380} rx={6} fill={INK} />
          <path d="M26 24 H170 L140 74 L170 124 H26 Z" fill={T.vivid} />
          {[0, 1, 2, 3].map((r) => [0, 1, 2, 3, 4].map((c) => ((r + c) % 2 ? null : <rect key={`${r}-${c}`} x={30 + c * 26} y={28 + r * 24} width={26} height={24} fill={T.main} opacity={0.55} />)))}
        </svg>
        {/* footprints left behind */}
        {Array.from({ length: 8 }, (_, k) => {
          const fx = 400 + k * 42;
          if (fx > x - 40) return null;
          return <div key={k} style={{ position: "absolute", left: fx, top: Y + 30 + (k % 2 ? -14 : 14), width: 26, height: 16, borderRadius: 8, background: T.glow }} />;
        })}
        <div style={{ position: "absolute", left: x - 60, top: Y - 60 - hop, width: 120, height: 120, borderRadius: 60, background: `linear-gradient(135deg, ${T.vivid}, ${T.main})`, border: "8px solid #fff", boxShadow: SURFACE.boxShadow }} />
        {one > 0 && (
          <div style={{ position: "absolute", left: 540 - 100 + 200, top: 430, width: 200, height: 200, borderRadius: 100, ...SURFACE, display: "grid", placeItems: "center", transform: `scale(${one})`, opacity: first }}>
            <span style={{ ...NUMBER, fontSize: 130, color: T.main }}>1</span>
          </div>
        )}
      </div>
    </>
  );
};

/* ───────── 5. Say one phrase aloud: the record button, "Рәхмәт", live waveform, any accent ───────── */

const Say: React.FC<{ frame: number }> = ({ frame }) => {
  const btn = pop(frame, F.ctaIn + 4, SPRING.bouncy);
  const card = pop(frame, F.phrase - 6, SPRING.smooth);
  const live = progress(frame, F.aloud - 6, F.aloud + 6);
  const plate = pop(frame, F.any - 6, SPRING.bouncy);
  return (
    <>
      <Title text="скажи *одну фразу*" frame={frame} at={[F.say, F.onePhrase, F.phrase]} size={100} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 380, display: "flex", justifyContent: "center", ...btn.style }}>
        <div style={{ position: "relative", width: 300, height: 300 }}>
          {live > 0 &&
            [0, 0.5].map((k) => {
              const r = ((frame - F.aloud) / 50 + k + 2) % 1;
              return <div key={k} style={{ position: "absolute", left: -r * 80, top: -r * 80, right: -r * 80, bottom: -r * 80, borderRadius: "50%", border: `8px solid ${T.glow}`, opacity: (1 - r) * live }} />;
            })}
          <div style={{ position: "absolute", inset: 0, borderRadius: 150, background: `linear-gradient(135deg, ${T.vivid}, ${T.main})`, display: "grid", placeItems: "center", boxShadow: SURFACE.boxShadow, transform: `scale(${1 - 0.06 * live + 0.03 * live * Math.sin(frame / 5)})` }}>
            <svg width={130} height={170} viewBox="0 0 130 170">
              <rect x={37} y={6} width={56} height={96} rx={28} fill="#fff" />
              <path d="M17 76 Q 17 128 65 128 Q 113 128 113 76" fill="none" stroke="#fff" strokeWidth={10} strokeLinecap="round" />
              <rect x={60} y={128} width={10} height={26} fill="#fff" />
              <rect x={35} y={152} width={60} height={10} rx={5} fill="#fff" />
            </svg>
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 140, right: 140, top: 760, ...card.style }}>
        <div style={{ ...SURFACE, borderRadius: 40, padding: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
          <span style={{ ...PARAGRAPH, fontSize: 110, lineHeight: 1, fontWeight: 700, color: T.main }}>Рәхмәт</span>
          <Wave frame={frame} n={19} h={90} w={12} gap={10} level={0.15 + 0.85 * live} color={live > 0.5 ? T.vivid : T.glow} seed={3} />
        </div>
      </div>
      {plate.t > 0 && (
        <div style={{ position: "absolute", top: 1130, left: 0, right: 0, display: "flex", justifyContent: "center", ...plate.style }}>
          <div style={{ transform: "scale(2.1)", transformOrigin: "50% 0" }}>
            <GlassPlate bg={PLATE_COBALT}>
              <CircleCheck size={18} strokeWidth={2.4} /> любой акцент
            </GlassPlate>
          </div>
        </div>
      )}
    </>
  );
};

/* ───────── 6. No grades: the numbers in the grade cells fall out, hearts take their place ───────── */

const GRADES = ["3", "4", "2"];
const Grades: React.FC<{ frame: number }> = ({ frame }) => {
  const card = pop(frame, F.gradesIn + 2, SPRING.smooth);
  return (
    <>
      <Title text="родной язык *не ставит оценок*" frame={frame} at={[F.nativeL, F.lang, F.not, F.gives, F.grades]} size={92} />
      <div style={{ position: "absolute", left: 120, right: 120, top: 520, ...card.style }}>
        <div style={{ ...SURFACE, borderRadius: 40, padding: 44 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 36 }}>
            <div style={{ width: 360, height: 24, borderRadius: 12, background: GRAY }} />
            <div style={{ width: 220, height: 18, borderRadius: 9, background: "#EEF0F5" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            {GRADES.map((g, k) => {
              const fall = ease.in(progress(frame, F.not + k * 6, F.not + k * 6 + 30));
              const h = springAt(frame, F.grades + k * 7, SPRING.bouncy);
              return (
                <div key={k} style={{ position: "relative", width: 230, height: 230, borderRadius: 30, border: `6px solid ${T.glow}`, boxSizing: "border-box", display: "grid", placeItems: "center", background: h > 0.5 ? T.pale : "#fff" }}>
                  <span style={{ ...NUMBER, fontSize: 150, color: INK, opacity: 1 - fall, transform: `translateY(${fall * 200}px) rotate(${fall * (k - 1) * 40 + fall * 20}deg)` }}>{g}</span>
                  <svg width={130} height={116} viewBox="0 0 90 80" style={{ position: "absolute", transform: `scale(${h})`, opacity: Math.min(1, h * 2) }}>
                    <path d="M45 76 C 10 50 0 34 0 20 C 0 6 12 0 22 0 C 32 0 40 6 45 14 C 50 6 58 0 68 0 C 78 0 90 6 90 20 C 90 34 80 50 45 76 Z" fill={T.vivid} />
                  </svg>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

/* ───────── Composition ───────── */

const SCENES: SceneDef[] = [
  { range: [0, F.enIn], El: Hook },
  { range: [F.enIn, F.ttIn], El: English },
  { range: [F.ttIn, F.meansIn], El: Tatar },
  { range: [F.meansIn, F.ctaIn], El: Start },
  { range: [F.ctaIn, F.gradesIn], El: Say },
  { range: [F.gradesIn, F.duration + 30], El: Grades },
];

const SFX: Sfx[] = [
  { src: "sfx/07_CineStrike.wav", from: 2, volume: 0.16 },
  { src: "sfx2/click.mp3", from: F.ashamed - 4, volume: 0.22 },
  { src: "sfx/05_Distortion_Glitch.wav", from: F.accent, volume: 0.04 },
  // scene changes: textures from the SFX/ library (no whoosh)
  { src: "sfx/04_Cyber_Shift.wav", from: F.enIn - 8, volume: 0.2 },
  { src: "sfx/01_Ripple_Textures.wav", from: F.ttIn - 8, volume: 0.18 },
  { src: "sfx/06_Ripple_Textures_II.wav", from: F.meansIn - 8, volume: 0.2 },
  { src: "sfx/02_Alienated_Warpes.wav", from: F.ctaIn - 8, volume: 0.14 },
  { src: "sfx/04_Cyber_Shift.wav", from: F.gradesIn - 8, volume: 0.2 },
  // 2. stars
  ...[0, 2, 4].map((k) => ({ src: "sfx2/pop.mp3", from: F.praise - 8 + k * 5, volume: 0.18 })),
  { src: "sfx2/ding.mp3", from: F.praise + 18, volume: 0.18 },
  // 3. shame
  { src: "sfx/03_Basscrack.wav", from: F.shame, volume: 0.1 },
  // 4. the "1", the start line
  { src: "sfx2/pop.mp3", from: F.one - 4, volume: 0.22 },
  { src: "sfx2/click.mp3", from: F.started, volume: 0.2 },
  { src: "sfx2/ding.mp3", from: F.speaking + 10, volume: 0.18 },
  // 5. record, any accent
  { src: "sfx2/click.mp3", from: F.aloud - 6, volume: 0.22 },
  { src: "sfx2/pop.mp3", from: F.any - 6, volume: 0.24 },
  // 6. grades fall, hearts pop
  { src: "sfx/05_Distortion_Glitch.wav", from: F.not, volume: 0.04 },
  ...GRADES.map((_, k) => ({ src: "sfx2/pop.mp3", from: F.grades + k * 7, volume: 0.18 })),
  { src: "sfx/07_CineStrike.wav", from: F.grades + 20, volume: 0.1 },
];

// All 30 poses of the main set, each at least once, by the meaning of the line; never the same photo twice in a row
const AVATAR_KEYS: AvatarKey[] = [
  // 1. hook: nobody admits it, we're shy
  { at: 0, e: "shush" },
  { at: 45, e: "arms-crossed" },
  { at: 95, e: "skeptical" },
  { at: 135, e: "facepalm" },
  { at: 180, e: "disappointed" },
  { at: 225, e: "displeased" },
  { at: 260, e: "pensive" },
  // 2. English with an accent: fine, praised
  { at: F.enIn, e: "explaining" },
  { at: 340, e: "present-left" },
  { at: 380, e: "thumbs-up" },
  { at: 420, e: "delighted" },
  { at: 470, e: "clapping" },
  // 3. Tatar: shameful
  { at: F.ttIn, e: "puzzled" },
  { at: 555, e: "thinking" },
  { at: 590, e: "shrug" },
  { at: 625, e: "surprised" },
  // 4. accent = you started
  { at: F.meansIn, e: "point-up" },
  { at: 700, e: "inspired" },
  { at: 730, e: "smile-up" },
  { at: 772, e: "point-right" },
  { at: 810, e: "victory" },
  // 5. say one phrase aloud
  { at: F.ctaIn, e: "point-down" },
  { at: 890, e: "listening" },
  { at: 930, e: "dreamy" },
  { at: 970, e: "laughing" },
  { at: 1005, e: "hand-on-heart" },
  { at: 1040, e: "soft-smile" },
  // 6. no grades
  { at: F.gradesIn, e: "heart-hands" },
  { at: 1140, e: "stop" },
  { at: 1190, e: "waving" },
];

const STANCES: StanceKey[] = [
  { at: 0, s: "center" },
  { at: F.enIn, s: "right" },
  { at: F.ttIn, s: "left" },
  { at: F.meansIn, s: "right" },
  { at: F.ctaIn, s: "left" },
  { at: F.gradesIn, s: "center" },
];

// Main set photos: scale the wide-framed ones so every photo fills the 540x590 box by height (same as V38)
const SIZE: Record<string, [number, number]> = {
  pensive: [1312, 1199], dreamy: [1293, 1217], displeased: [1254, 1254], surprised: [1280, 1229], waving: [1312, 1199], inspired: [1199, 1312], explaining: [1312, 1199], delighted: [1312, 1199], skeptical: [1312, 1199], laughing: [1385, 1136],
  puzzled: [1152, 1366], disappointed: [1278, 1230], "smile-up": [1199, 1312], thinking: [1190, 1322], "soft-smile": [1218, 1291], "point-up": [1312, 1199], "point-down": [1312, 1199], "present-left": [1312, 1199], "point-right": [1312, 1199], shrug: [1312, 1199],
  "hand-on-heart": [1312, 1199], stop: [1312, 1199], shush: [1312, 1199], clapping: [1278, 1230], "thumbs-up": [1312, 1199], "arms-crossed": [1312, 1199], facepalm: [1312, 1199], "heart-hands": [1312, 1199], victory: [1312, 1199], listening: [1312, 1199],
};
const FIT = Object.fromEntries(Object.entries(SIZE).map(([e, [w, h]]) => [e, Math.max(1, w / h / (540 / 590))])) as Partial<Record<Emotion, number>>;

const Host: React.FC<{ frame: number }> = ({ frame }) => <TatAvatar frame={frame} keys={AVATAR_KEYS} words={WORDS} stances={STANCES} fit={FIT} />;

export const Video42: React.FC = () => (
  <AbsoluteFill style={{ background: "#fff", fontFamily: PARAGRAPH.fontFamily, color: INK }}>
    <ReelShell scenes={SCENES} headlines={[]} vo={VO} sfx={SFX} duration={F.duration} music="v42/music/bed.mp3" musicLevel={[0.045, 0.11]} overlay={Host} bg={BG} />
  </AbsoluteFill>
);
