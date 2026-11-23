import React from "react";
import { AbsoluteFill } from "remotion";
import { Check } from "lucide-react";
import { SPRING, ease, progress, springAt } from "../stage/motion";
import { ReelShell, pop, type SceneDef, type Sfx } from "../kit/reel";
import { TatAvatar, type AvatarKey, type Emotion, type StanceKey } from "../kit/TatAvatar";
import { DotOrbitBg } from "../kit/DotOrbitBg";
import { HEADING, INK, NUMBER, PARAGRAPH, SURFACE } from "../kit/design";
import { GlassPlate } from "../catalog/own/glass";
import { Mark, Strike } from "../catalog/own/text";
import { F, VO } from "./timeline";
import { WORDS } from "./words";

// "Бабушкино голосовое" (@the_tatarverse, RU, main host preset Ahu). ~21 s.
// Grandma's voice won't save itself -> record a voice message, ask about her childhood -> her pronunciation, your family phrases
// -> not an interview, five minutes in the kitchen -> save it as "әби детство" -> one day the most precious sound.
// Own kit only. Palette: garnet (memory, family history). Dot Orbit variant 2 (output/bg-variant.txt).
const B = { main: "#7A1F35", vivid: "#B0304F", glow: "#E9A3B4", pale: "#FBEAEF" };
const PLATE_B = "linear-gradient(135deg, #D2566F, #7A1F35)";
const BG = <DotOrbitBg variant={2} />;
const W = 1080;
const MUTED = "#8A8792";
const LINE = "#ECE6E8";

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

const BARS = 30;
const barH = (i: number) => 18 + 74 * Math.abs(Math.sin(i * 1.7 + 0.4) * Math.cos(i * 0.55));

/** Voice message bubble: play button, waveform, duration. `played` 0..1 fills the bars, `gone` 0..1 dissolves them right to left */
const VoiceBubble: React.FC<{ frame: number; played?: number; gone?: number; time: string; playing?: boolean; scale?: number }> = ({ frame, played = 0, gone = 0, time, playing = false, scale = 1 }) => (
  <div style={{ ...SURFACE, borderBottomLeftRadius: 6, padding: 40, display: "flex", alignItems: "center", gap: 30, transform: `scale(${scale})` }}>
    <div style={{ width: 120, height: 120, borderRadius: 60, background: B.vivid, display: "grid", placeItems: "center", flex: "none" }}>
      {playing ? (
        <div style={{ display: "flex", gap: 12 }}>
          {[0, 1].map((k) => (
            <div key={k} style={{ width: 14, height: 46, borderRadius: 4, background: "#fff" }} />
          ))}
        </div>
      ) : (
        <svg width={50} height={56} viewBox="0 0 50 56" style={{ marginLeft: 8 }}>
          <path d="M4 4 L46 28 L4 52 Z" fill="#fff" stroke="#fff" strokeWidth={6} strokeLinejoin="round" />
        </svg>
      )}
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, height: 96 }}>
        {Array.from({ length: BARS }, (_, i) => {
          const k = i / BARS;
          // dissolve: the right end goes first, each bar drifts up and fades
          const g = Math.min(1, Math.max(0, (gone * 1.6 - (1 - k)) * 3));
          const live = playing ? 0.75 + 0.25 * Math.sin(frame / 4 + i) : 1;
          return <div key={i} style={{ width: 10, height: barH(i) * live, borderRadius: 5, background: k < played ? B.vivid : B.glow, opacity: 1 - g, transform: `translateY(${-g * 60}px) scale(${1 - g * 0.6})` }} />;
        })}
      </div>
      <div style={{ ...NUMBER, fontWeight: 500, fontSize: 40, color: MUTED }}>{time}</div>
    </div>
  </div>
);

/* ───────── 1. Hook: grandma's voice message dissolves if nobody saves it ───────── */

const Hook: React.FC<{ frame: number }> = ({ frame }) => {
  const out = progress(frame, F.voice - 22, F.voice - 6);
  const bubble = pop(frame, 14, SPRING.smooth);
  const gone = ease.inOut(progress(frame, F.save1 + 6, F.alone + 30));
  const sec = Math.round(47 * (1 - gone));
  return (
    <>
      {out < 1 && <Title text="никто об этом не *говорит*" frame={frame} at={[-30, -24, -18, -12, F.talk - 6]} size={92} style={{ opacity: 1 - out }} />}
      {out > 0 && <Title text="бабушкин *голос* не сохранится сам" frame={frame} at={[F.voice - 8, F.voice + 18, F.save1, F.save1 + 8, F.alone - 4]} size={92} />}
      <div style={{ position: "absolute", top: 640, left: 0, right: 0, display: "flex", justifyContent: "center", ...bubble.style }}>
        <VoiceBubble frame={frame} time={`0:${String(sec).padStart(2, "0")}`} gone={gone} />
      </div>
    </>
  );
};

/* ───────── 2. Record her voice message, ask one question ───────── */

const Record: React.FC<{ frame: number }> = ({ frame }) => {
  const btn = pop(frame, F.recIn + 4, SPRING.bouncy);
  const on = frame >= F.record + 18;
  const sec = on ? Math.floor((frame - F.record - 18) / 60) : 0;
  const q = pop(frame, F.ask + 8, SPRING.bouncy);
  const ring = (frame - F.record) / 50;
  return (
    <>
      <Title text="запиши *голосовое*" frame={frame} at={[F.record - 4, F.record + 26]} size={96} />
      <div style={{ position: "absolute", top: 360, left: 0, right: 0, height: 380, display: "grid", placeItems: "center", ...btn.style }}>
        {on &&
          [0, 0.5].map((k) => {
            const r = (ring + k) % 1;
            return <div key={k} style={{ position: "absolute", width: 220 + r * 160, height: 220 + r * 160, borderRadius: "50%", border: `5px solid ${B.glow}`, opacity: 1 - r }} />;
          })}
        <div style={{ ...SURFACE, width: 220, height: 220, borderRadius: 110, display: "grid", placeItems: "center" }}>
          <div style={{ width: on ? 84 : 130, height: on ? 84 : 130, borderRadius: on ? 18 : 65, background: B.vivid }} />
        </div>
      </div>
      <div style={{ position: "absolute", top: 760, left: 0, right: 0, textAlign: "center", ...NUMBER, fontWeight: 500, fontSize: 64, color: on ? B.main : MUTED, ...btn.style }}>
        00:{String(sec).padStart(2, "0")}
      </div>
      {q.t > 0 && (
        <div style={{ position: "absolute", top: 930, right: 100, ...SURFACE, borderBottomRightRadius: 6, padding: 40, ...PARAGRAPH, fontSize: 54, lineHeight: 1, whiteSpace: "nowrap", ...q.style }}>
          каким было твое{" "}
          <b style={{ color: B.main }}>
            <Mark frame={frame} at={F.child} color={B.main}>
              детство
            </Mark>
          </b>
        </div>
      )}
    </>
  );
};

/* ───────── 3. Her pronunciation (intonation line over the word), then family phrases as notes ───────── */

const NOTES = [
  { at: F.family + 4, x: 150, y: 520, r: -6, c: B.pale },
  { at: F.phrases - 6, x: 420, y: 470, r: 4, c: "#fff" },
  { at: F.phrases + 14, x: 690, y: 540, r: -3, c: B.pale },
];
const Say: React.FC<{ frame: number }> = ({ frame }) => {
  const swap = progress(frame, F.family - 20, F.family - 4);
  const card = pop(frame, F.sayIn + 10, SPRING.bouncy);
  const draw = ease.inOut(progress(frame, F.say, F.say + 50));
  const curve = "M40 150 C 140 40, 220 40, 300 120 S 460 200, 560 70";
  return (
    <>
      {swap < 1 && (
        <div style={{ opacity: 1 - swap }}>
          <Title text="как она *произносит*" frame={frame} at={[F.sayIn + 2, F.sayIn + 10, F.say]} size={96} />
          <div style={{ position: "absolute", top: 470, left: 0, right: 0, display: "flex", justifyContent: "center", ...card.style }}>
            <div style={{ ...SURFACE, padding: 60, width: 640, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <svg width={600} height={200} viewBox="0 0 600 200">
                <path d={curve} fill="none" stroke={B.glow} strokeWidth={10} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} />
                {[0.25, 0.5, 0.75].map((k) => (k < draw ? <circle key={k} cx={40 + 520 * k} cy={k === 0.5 ? 120 : k === 0.25 ? 68 : 158} r={12} fill={B.vivid} /> : null))}
              </svg>
              <div style={{ ...HEADING, fontSize: 150, lineHeight: 1, fontWeight: 700, color: B.main }}>әби</div>
            </div>
          </div>
        </div>
      )}
      {swap > 0 && (
        <>
          <Title text="ваши *семейные* выражения" frame={frame} at={[F.family - 4, F.family + 10, F.phrases]} size={92} />
          {NOTES.map((n, i) => {
            const p = springAt(frame, n.at, SPRING.bouncy);
            const heart = springAt(frame, F.phrases + 40 + i * 6, SPRING.bouncy);
            return (
              <div key={i} style={{ position: "absolute", left: n.x, top: n.y + 200, width: 260, height: 300, ...SURFACE, background: n.c, padding: 34, display: "flex", flexDirection: "column", gap: 22, transform: `rotate(${n.r}deg) scale(${p})`, opacity: Math.min(1, p * 1.5) }}>
                {[0.9, 0.7, 0.8, 0.45].map((wd, k) => (
                  <div key={k} style={{ width: `${wd * 100}%`, height: 18, borderRadius: 9, background: k === 0 ? B.glow : LINE }} />
                ))}
                <svg width={56} height={50} viewBox="0 0 24 22" style={{ marginTop: "auto", alignSelf: "flex-end", transform: `scale(${heart})` }}>
                  <path d="M12 21 C 5 15, 1 11, 1 6.5 A 5.5 5.5 0 0 1 12 4 A 5.5 5.5 0 0 1 23 6.5 C 23 11, 19 15, 12 21 Z" fill={B.vivid} />
                </svg>
              </div>
            );
          })}
        </>
      )}
    </>
  );
};

/* ───────── 4. Not an interview (the question sheet is struck), five minutes in the kitchen: two cups and steam ───────── */

const Cup: React.FC<{ x: number; c: string; t: number }> = ({ x, c, t }) => (
  <div style={{ position: "absolute", left: x, top: 900, width: 200, height: 170, transform: `scale(${t})`, transformOrigin: "50% 100%" }}>
    <div style={{ position: "absolute", right: -46, top: 34, width: 80, height: 80, borderRadius: 40, border: `16px solid ${c}` }} />
    <div style={{ position: "absolute", inset: 0, background: c, borderRadius: "16px 16px 70px 70px" }} />
  </div>
);
const Kitchen: React.FC<{ frame: number }> = ({ frame }) => {
  const sheet = pop(frame, F.kitchenIn + 4, SPRING.smooth);
  const away = ease.inOut(progress(frame, F.five - 24, F.five));
  const table = pop(frame, F.five - 6, SPRING.smooth);
  const ring = ease.inOut(progress(frame, F.five, F.kitchen + 30));
  const mins = Math.floor(ring * 5);
  return (
    <>
      {away < 1 && (
        <div style={{ position: "absolute", inset: 0, opacity: 1 - away, transform: `translateX(${-away * 300}px) rotate(${-away * 8}deg)` }}>
          <div style={{ ...HEADING, position: "absolute", top: 180, left: 0, right: 0, textAlign: "center", fontSize: 100 }}>
            <Strike frame={frame} at={F.interview}>
              интервью
            </Strike>
          </div>
          <div style={{ position: "absolute", top: 420, left: 240, right: 240, ...SURFACE, padding: 50, display: "flex", flexDirection: "column", gap: 34, ...sheet.style }}>
            {[1, 2, 3, 4].map((n) => (
              <div key={n} style={{ display: "flex", alignItems: "center", gap: 24 }}>
                <span style={{ ...NUMBER, fontSize: 44, color: B.vivid, width: 30 }}>{n}</span>
                <div style={{ flex: 1, height: 18, borderRadius: 9, background: LINE }} />
              </div>
            ))}
          </div>
        </div>
      )}
      {away > 0 && (
        <>
          <Title text="*5 минут* на кухне" frame={frame} at={[F.five - 4, F.five + 10, F.kitchen - 6, F.kitchen]} size={96} />
          <div style={{ position: "absolute", top: 400, left: 0, right: 0, display: "flex", justifyContent: "center", ...table.style }}>
            <svg width={320} height={320} viewBox="0 0 320 320">
              <circle cx={160} cy={160} r={130} fill="#fff" stroke={LINE} strokeWidth={22} />
              <circle cx={160} cy={160} r={130} fill="none" stroke={B.vivid} strokeWidth={22} strokeLinecap="round" pathLength={1} strokeDasharray={`${ring} 1`} transform="rotate(-90 160 160)" />
              <text x={160} y={186} textAnchor="middle" style={{ ...NUMBER, fontSize: 84 }} fill={B.main}>
                {mins}:00
              </text>
            </svg>
          </div>
          <svg width={W} height={1300} style={{ position: "absolute", inset: 0 }}>
            {[290, 330, 700, 740].map((x, i) => {
              const s = (frame - F.five + i * 9) / 60;
              const y0 = 880 - ((s * 40) % 40);
              return <path key={i} d={`M${x} ${y0} q 18 -20 0 -40 q -18 -20 0 -40`} fill="none" stroke={B.glow} strokeWidth={7} strokeLinecap="round" opacity={0.5 + 0.5 * Math.sin(s * 3 + i) * table.t} />;
            })}
          </svg>
          <Cup x={220} c={B.vivid} t={table.t} />
          <Cup x={630} c={B.glow} t={springAt(frame, F.five + 4, SPRING.bouncy)} />
          <div style={{ position: "absolute", top: 1068, left: 140, right: 140, height: 18, borderRadius: 9, background: LINE, ...table.style }} />
        </>
      )}
    </>
  );
};

/* ───────── 5. Save and label it: a new file at the top of the list, the name types itself ───────── */

const NAME = "әби детство";
const Save: React.FC<{ frame: number }> = ({ frame }) => {
  const list = pop(frame, F.saveIn + 4, SPRING.smooth);
  const row = springAt(frame, F.saveIn + 30, SPRING.smooth);
  const typed = Math.floor(NAME.length * progress(frame, F.abi - 14, F.childhood + 26));
  const caret = Math.floor(frame / 15) % 2 === 0 && typed < NAME.length && frame > F.sign;
  const done = pop(frame, F.childhood + 40, SPRING.bouncy);
  return (
    <>
      <Title text="сохрани и *подпиши*" frame={frame} at={[F.saveIn + 2, F.sign - 12, F.sign]} size={96} />
      <div style={{ position: "absolute", top: 400, left: 120, right: 120, ...SURFACE, padding: 40, display: "flex", flexDirection: "column", gap: 30, ...list.style }}>
        <div style={{ display: "flex", alignItems: "center", gap: 28, height: 104 * row, opacity: row, overflow: "hidden" }}>
          <div style={{ width: 100, height: 100, borderRadius: 50, background: B.vivid, flex: "none", display: "grid", placeItems: "center" }}>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              {[22, 40, 28, 46, 20].map((h, k) => (
                <div key={k} style={{ width: 7, height: h, borderRadius: 4, background: "#fff" }} />
              ))}
            </div>
          </div>
          <div style={{ ...PARAGRAPH, fontSize: 60, lineHeight: 1, fontWeight: 700, color: INK, whiteSpace: "nowrap" }}>
            {NAME.slice(0, typed)}
            <span style={{ display: "inline-block", width: 5, height: 60, marginLeft: 4, verticalAlign: "-8px", background: caret ? B.vivid : "transparent" }} />
          </div>
        </div>
        {[0.62, 0.48, 0.55].map((wd, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 28, opacity: 0.8 }}>
            <div style={{ width: 100, height: 100, borderRadius: 50, background: LINE, flex: "none" }} />
            <div style={{ width: `${wd * 100}%`, height: 22, borderRadius: 11, background: LINE }} />
          </div>
        ))}
      </div>
      {done.t > 0 && (
        <div style={{ position: "absolute", top: 1010, left: 0, right: 0, display: "flex", justifyContent: "center", ...done.style }}>
          <div style={{ transform: "scale(2.1)" }}>
            <GlassPlate bg={PLATE_B}>
              <Check size={18} strokeWidth={2.6} /> сохранено
            </GlassPlate>
          </div>
        </div>
      )}
    </>
  );
};

/* ───────── 6. One day the most precious sound: the bubble plays inside a heart that draws itself ───────── */

const HEART = "M540 1150 C 300 990, 120 840, 120 640 A 210 210 0 0 1 540 520 A 210 210 0 0 1 960 640 C 960 840, 780 990, 540 1150 Z";
const Sound: React.FC<{ frame: number }> = ({ frame }) => {
  const bubble = pop(frame, F.soundIn + 6, SPRING.smooth);
  const played = progress(frame, F.soundIn + 20, F.duration);
  const heart = ease.inOut(progress(frame, F.dear - 20, F.sound + 30));
  const glow = springAt(frame, F.sound + 20, SPRING.soft);
  const sec = Math.floor(played * 47);
  return (
    <>
      <Title text="однажды самый *дорогой* звук" frame={frame} at={[F.soundIn + 2, F.most, F.dear, F.sound]} size={88} />
      <svg width={W} height={1300} style={{ position: "absolute", inset: 0 }}>
        <path transform="translate(54 160) scale(0.9)" d={HEART} fill={B.pale} fillOpacity={Math.min(1, glow)} stroke={B.vivid} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - heart} opacity={heart > 0 ? 1 : 0} />
      </svg>
      <div style={{ position: "absolute", top: 760, left: 0, right: 0, display: "flex", justifyContent: "center", ...bubble.style }}>
        <VoiceBubble frame={frame} time={`0:${String(sec).padStart(2, "0")}`} played={played} playing scale={0.82} />
      </div>
    </>
  );
};

/* ───────── Composition ───────── */

const SCENES: SceneDef[] = [
  { range: [0, F.recIn], El: Hook },
  { range: [F.recIn, F.sayIn], El: Record },
  { range: [F.sayIn, F.kitchenIn], El: Say },
  { range: [F.kitchenIn, F.saveIn], El: Kitchen },
  { range: [F.saveIn, F.soundIn], El: Save },
  { range: [F.soundIn, F.duration + 30], El: Sound },
];

const SFX: Sfx[] = [
  { src: "sfx/07_CineStrike.wav", from: 2, volume: 0.18 },
  { src: "sfx2/pop.mp3", from: 14, volume: 0.24 },
  { src: "sfx/02_Alienated_Warpes.wav", from: F.save1 + 6, volume: 0.1 },
  // scene changes: textures from the SFX/ library (no whoosh)
  { src: "sfx/01_Ripple_Textures.wav", from: F.recIn - 8, volume: 0.18 },
  { src: "sfx/04_Cyber_Shift.wav", from: F.sayIn - 8, volume: 0.2 },
  { src: "sfx/06_Ripple_Textures_II.wav", from: F.kitchenIn - 8, volume: 0.2 },
  { src: "sfx/01_Ripple_Textures.wav", from: F.saveIn - 8, volume: 0.18 },
  { src: "sfx/06_Ripple_Textures_II.wav", from: F.soundIn - 8, volume: 0.2 },
  // 2. record, question
  { src: "sfx2/click.mp3", from: F.record + 16, volume: 0.22 },
  { src: "sfx2/pop.mp3", from: F.ask + 8, volume: 0.24 },
  // 3. notes
  ...NOTES.map((n) => ({ src: "sfx2/pop.mp3", from: n.at, volume: 0.2 })),
  // 4. interview struck, kitchen
  { src: "sfx/05_Distortion_Glitch.wav", from: F.interview + 30, volume: 0.05 },
  { src: "sfx2/pop.mp3", from: F.five - 4, volume: 0.22 },
  // 5. saved
  { src: "sfx2/ding.mp3", from: F.childhood + 40, volume: 0.22 },
  // 6. heart closes
  { src: "sfx/07_CineStrike.wav", from: F.sound + 20, volume: 0.12 },
];

// All 30 poses of the main set, each at least once; swaps by the meaning of the line, never the same photo twice in a row
const AVATAR_KEYS: AvatarKey[] = [
  // 1. hook
  { at: 0, e: "shush" },
  { at: 40, e: "point-up" },
  { at: 80, e: "thinking" },
  { at: 120, e: "soft-smile" },
  { at: 155, e: "pensive" },
  { at: 190, e: "displeased" },
  { at: 225, e: "disappointed" },
  // 2. record, ask
  { at: F.recIn, e: "point-down" },
  { at: 305, e: "explaining" },
  { at: 345, e: "listening" },
  { at: 385, e: "puzzled" },
  { at: 425, e: "dreamy" },
  { at: 462, e: "smile-up" },
  // 3. pronunciation, family phrases
  { at: F.sayIn, e: "point-right" },
  { at: 535, e: "surprised" },
  { at: 575, e: "laughing" },
  { at: 615, e: "delighted" },
  { at: 655, e: "inspired" },
  // 4. not an interview, kitchen
  { at: F.kitchenIn, e: "stop" },
  { at: 740, e: "skeptical" },
  { at: 772, e: "facepalm" },
  { at: 800, e: "shrug" },
  { at: 832, e: "present-left" },
  // 5. save
  { at: F.saveIn, e: "thumbs-up" },
  { at: 900, e: "arms-crossed" },
  { at: 940, e: "clapping" },
  { at: 985, e: "victory" },
  // 6. precious sound
  { at: F.soundIn, e: "hand-on-heart" },
  { at: 1100, e: "heart-hands" },
  { at: 1150, e: "soft-smile" },
  { at: 1200, e: "waving" },
];

const STANCES: StanceKey[] = [
  { at: 0, s: "center" },
  { at: F.recIn, s: "right" },
  { at: F.sayIn, s: "left" },
  { at: F.kitchenIn, s: "right" },
  { at: F.saveIn, s: "left" },
  { at: F.soundIn, s: "center" },
];

// Main set photos: scale the wide-framed ones so every photo fills the 540x590 box by height (as in V24)
const SIZE: Record<string, [number, number]> = {
  pensive: [1312, 1199], dreamy: [1293, 1217], displeased: [1254, 1254], surprised: [1280, 1229], waving: [1312, 1199], inspired: [1199, 1312], explaining: [1312, 1199], delighted: [1312, 1199], skeptical: [1312, 1199], laughing: [1385, 1136],
  puzzled: [1152, 1366], disappointed: [1278, 1230], "smile-up": [1199, 1312], thinking: [1190, 1322], "soft-smile": [1218, 1291], "point-up": [1312, 1199], "point-down": [1312, 1199], "present-left": [1312, 1199], "point-right": [1312, 1199], shrug: [1312, 1199],
  "hand-on-heart": [1312, 1199], stop: [1312, 1199], shush: [1312, 1199], clapping: [1278, 1230], "thumbs-up": [1312, 1199], "arms-crossed": [1312, 1199], facepalm: [1312, 1199], "heart-hands": [1312, 1199], victory: [1312, 1199], listening: [1312, 1199],
};
const FIT = Object.fromEntries(Object.entries(SIZE).map(([e, [w, h]]) => [e, Math.max(1, w / h / (540 / 590))])) as Partial<Record<Emotion, number>>;

const Host: React.FC<{ frame: number }> = ({ frame }) => <TatAvatar frame={frame} keys={AVATAR_KEYS} words={WORDS} stances={STANCES} fit={FIT} />;

export const Video26: React.FC = () => (
  <AbsoluteFill style={{ background: "#fff", fontFamily: PARAGRAPH.fontFamily, color: INK }}>
    <ReelShell scenes={SCENES} headlines={[]} vo={VO} sfx={SFX} duration={F.duration} music="v26/music/bed.mp3" musicLevel={[0.045, 0.11]} overlay={Host} bg={BG} />
  </AbsoluteFill>
);
