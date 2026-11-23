import React from "react";
import { AbsoluteFill } from "remotion";
import { HeartHandshake } from "lucide-react";
import { SPRING, ease, lerp, progress, springAt } from "../stage/motion";
import { ReelShell, pop, shake, type SceneDef, type Sfx } from "../kit/reel";
import { TatAvatar, type AvatarKey, type Emotion, type StanceKey } from "../kit/TatAvatar";
import { DotOrbitBg } from "../kit/DotOrbitBg";
import { HEADING, INK, NUMBER, PARAGRAPH, SURFACE } from "../kit/design";
import { GlassPlate } from "../catalog/own/glass";
import { Strike } from "../catalog/own/text";
import { F, VO } from "./timeline";
import { WORDS } from "./words";

// "Друг, с которым можно учить язык" (@the_tatarverse, RU, main host preset Ahu). ~21 s.
// Language doesn't rest on textbooks -> one more textbook, or a person to text "сәлам"? -> 5 min a day, mistakes ok, no grades -> find a language friend, tag them.
// Own kit only. Palette: sky (conversation, openness). Dot Orbit variant 6 (output/bg-variant.txt).
const T = { main: "#0B5E8E", vivid: "#1A86C4", glow: "#9ACDEB", pale: "#E7F4FB" };
const PLATE_SKY = "linear-gradient(135deg, #3FA3DA, #0B5E8E)";
const BG = <DotOrbitBg variant={6} />;
const GRAY = "#E5E9EE";
const BOOKS = [T.main, T.glow, T.vivid, "#7FB6D6", T.main, "#C9DCE8", T.vivid, T.glow, "#5E9CC2", T.main, "#B4D3E6", T.vivid, T.glow];

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

/** A lying book seen from the side: colored cover with a spine band */
const Book: React.FC<{ w: number; h?: number; c: string; style?: React.CSSProperties }> = ({ w, h = 70, c, style }) => (
  <div style={{ width: w, height: h, borderRadius: 12, background: c, position: "relative", boxShadow: SURFACE.boxShadow, ...style }}>
    <div style={{ position: "absolute", right: 18, top: 0, bottom: 0, width: 16, background: "rgba(255,255,255,0.45)" }} />
    <div style={{ position: "absolute", left: 30, top: h / 2 - 5, width: w * 0.4, height: 10, borderRadius: 5, background: "rgba(255,255,255,0.6)" }} />
  </div>
);

/** A round "face" (no icon): colored disc with two eyes */
const Face: React.FC<{ color: string; size?: number; style?: React.CSSProperties }> = ({ color, size = 120, style }) => (
  <div style={{ width: size, height: size, borderRadius: size / 2, background: color, flex: "none", position: "relative", border: "6px solid #fff", boxShadow: SURFACE.boxShadow, ...style }}>
    {[0.33, 0.58].map((x) => (
      <div key={x} style={{ position: "absolute", left: `${x * 100}%`, top: "40%", width: size * 0.09, height: size * 0.09, borderRadius: size, background: INK }} />
    ))}
  </div>
);

/* ───────── 1. Hook: a tower of textbooks wobbles and slides apart on "не на учебниках" ───────── */

const Hook: React.FC<{ frame: number }> = ({ frame }) => {
  const first = fadeOut(frame, F.but + 4);
  const fall = ease.in(progress(frame, F.textbooks + 6, F.textbooks + 36));
  return (
    <>
      {first > 0 && <Title text="никто об этом" frame={frame} at={[-30, -24, -18]} size={92} style={{ opacity: first }} />}
      {first > 0 && <Title text="*не говорит*" frame={frame} at={[F.talk - 4, F.talk + 2]} size={92} top={275} style={{ opacity: first }} />}
      {frame >= F.but + 8 && (
        <>
          <Title text="язык *держится*" frame={frame} at={[F.language - 4, F.holds]} size={92} />
          <div style={{ ...HEADING, position: "absolute", left: 60, right: 60, top: 280, textAlign: "center", fontSize: 92, ...pop(frame, F.notOn - 6, SPRING.smooth).style }}>
            не на{" "}
            <Strike frame={frame} at={F.textbooks}>
              учебниках
            </Strike>
          </div>
        </>
      )}
      {BOOKS.slice(0, 7).map((c, i) => {
        const p = springAt(frame, 4 + i * 5, SPRING.bouncy);
        const wob = Math.sin(frame / 9 + i * 0.5) * (4 + i * 1.5) * (frame > F.notOn - 10 ? 2 : 1) + shake(frame, F.notOn, 10, 20);
        const dir = i % 2 ? 1 : -1;
        const w = 420 + ((i * 53) % 110);
        return (
          <Book
            key={i}
            w={w}
            c={c}
            style={{ position: "absolute", left: 540 - w / 2 + wob + dir * fall * (200 + i * 40), top: 1130 - (i + 1) * 78 + fall * fall * i * 30, transform: `translateY(${(1 - Math.min(p, 1)) * -400}px) rotate(${dir * fall * (10 + i * 4) + wob * 0.2}deg)`, opacity: Math.min(1, p * 2) * (1 - fall * 0.7) }}
          />
        );
      })}
    </>
  );
};

/* ───────── 2. One more textbook? The shelf sags under book number 13 ───────── */

const Shelf: React.FC<{ frame: number }> = ({ frame }) => {
  const drop = springAt(frame, F.one - 6, SPRING.bouncy);
  const sag = 26 * Math.min(1, springAt(frame, F.book, SPRING.bouncy)) + shake(frame, F.book, 6, 20);
  const n = frame >= F.book ? 13 : 12;
  const cnt = pop(frame, F.really - 6, SPRING.bouncy);
  return (
    <>
      <Title text="еще *один* учебник" frame={frame} at={[F.need, F.one, F.book]} size={96} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 420, display: "flex", justifyContent: "center", ...cnt.style }}>
        <div style={{ ...NUMBER, fontSize: 150, color: T.main, transform: `scale(${1 + 0.18 * Math.max(0, 1 - progress(frame, F.book, F.book + 14))})` }}>{n}</div>
      </div>
      {/* shelf: books standing upright */}
      <div style={{ position: "absolute", left: 120, right: 120, top: 700, height: 300, display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 8 }}>
        {BOOKS.slice(0, 12).map((c, i) => {
          const p = springAt(frame, F.shelfIn + 4 + i * 2, SPRING.bouncy);
          const mid = 1 - Math.abs(i - 5.5) / 6;
          return <div key={i} style={{ width: 52, height: 200 + ((i * 37) % 80), borderRadius: 10, background: c, transform: `translateY(${sag * mid + (1 - Math.min(p, 1)) * 80}px) rotate(${i === 11 ? 8 : 0}deg)`, transformOrigin: "50% 100%", opacity: Math.min(1, p * 2) }} />;
        })}
      </div>
      <svg width={1080} height={1300} style={{ position: "absolute", inset: 0 }}>
        <path d={`M 110 1000 Q 540 ${1000 + sag * 2} 970 1000`} fill="none" stroke={INK} strokeOpacity={0.75} strokeWidth={16} strokeLinecap="round" />
      </svg>
      {drop > 0 && <Book w={300} c={T.vivid} style={{ position: "absolute", left: 390, top: lerp(-200, 610 + sag, Math.min(drop, 1)), transform: `rotate(${(1 - Math.min(drop, 1)) * 30 - 4}deg)` }} />}
    </>
  );
};

/* ───────── 3. Or a person you can text "сәлам": a chat, the word is typed and sent ───────── */

const Person: React.FC<{ frame: number }> = ({ frame }) => {
  const phone = pop(frame, F.personIn + 6, SPRING.smooth);
  const typed = "сәлам".slice(0, Math.max(0, Math.min(5, Math.floor((frame - F.write) / 6))));
  const sent = springAt(frame, F.salam + 6, SPRING.bouncy);
  const reply = pop(frame, F.salam + 34, SPRING.bouncy);
  return (
    <>
      <Title text="или *человек*" frame={frame} at={[F.personIn + 2, F.person]} size={100} />
      <div style={{ position: "absolute", left: 160, right: 160, top: 400, height: 760, ...SURFACE, borderRadius: 48, padding: 40, boxSizing: "border-box", display: "flex", flexDirection: "column", ...phone.style }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24, paddingBottom: 30, borderBottom: `3px solid ${GRAY}` }}>
          <Face color={T.glow} size={100} style={{ border: "none", boxShadow: "none" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ width: 200, height: 22, borderRadius: 11, background: INK, opacity: 0.8 }} />
            <div style={{ width: 120, height: 16, borderRadius: 8, background: T.glow }} />
          </div>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 24 }}>
          {sent > 0 && (
            <div style={{ alignSelf: "flex-end", padding: "28px 38px", borderRadius: 32, borderBottomRightRadius: 8, background: T.vivid, color: "#fff", ...PARAGRAPH, fontSize: 64, lineHeight: 1, fontWeight: 700, transform: `scale(${0.7 + 0.3 * Math.min(sent, 1.1)}) translateY(${(1 - Math.min(sent, 1)) * 80}px)`, transformOrigin: "100% 100%" }}>сәлам</div>
          )}
          {reply.t > 0 && (
            <div style={{ alignSelf: "flex-start", padding: "26px 34px", borderRadius: 32, borderBottomLeftRadius: 8, background: T.pale, display: "flex", gap: 12, ...reply.style }}>
              {[0, 1, 2].map((k) => (
                <span key={k} style={{ width: 16, height: 16, borderRadius: 8, background: T.vivid, transform: `translateY(${Math.sin((frame - k * 6) / 6) * 5}px)` }} />
              ))}
            </div>
          )}
        </div>
        <div style={{ marginTop: 30, height: 100, borderRadius: 50, background: T.pale, display: "flex", alignItems: "center", padding: "0 36px", ...PARAGRAPH, fontSize: 52, lineHeight: 1, color: INK }}>
          {sent > 0 ? "" : typed}
          {sent <= 0 && frame >= F.write - 20 && <span style={{ width: 4, height: 54, marginLeft: 4, background: T.vivid, opacity: Math.floor(frame / 15) % 2 }} />}
        </div>
      </div>
    </>
  );
};

/* ───────── 4. Five minutes a day: a timer runs down, then three rules pop ───────── */

const RULES = [
  { w: "на татарском", at: F.inTatar },
  { w: "с ошибками", at: F.mistakes },
];
const Five: React.FC<{ frame: number }> = ({ frame }) => {
  const first = fadeOut(frame, F.inTatar - 12);
  const run = progress(frame, F.minutes, F.inTatar + 120);
  const left = Math.round(300 * (1 - run));
  const mm = Math.floor(left / 60);
  const ss = String(left % 60).padStart(2, "0");
  const R = 170;
  const C = 2 * Math.PI * R;
  const ring = pop(frame, F.fiveIn + 6, SPRING.smooth);
  const up = ease.inOut(progress(frame, F.inTatar - 14, F.inTatar + 10));
  const plate = pop(frame, F.noGrades - 4, SPRING.bouncy);
  return (
    <>
      {first > 0 && <Title text="*5 минут* в день" frame={frame} at={[F.fiveIn + 2, F.minutes, F.perDay - 6, F.perDay]} size={100} style={{ opacity: first }} />}
      <div style={{ position: "absolute", left: 540 - 210, top: lerp(450, 220, up), width: 420, height: 420, transform: `scale(${lerp(1, 0.75, up)})`, ...ring.style }}>
        <svg width={420} height={420} style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
          <circle cx={210} cy={210} r={R} fill="#fff" stroke={T.pale} strokeWidth={34} />
          <circle cx={210} cy={210} r={R} fill="none" stroke={T.vivid} strokeWidth={34} strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * run} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", ...NUMBER, fontSize: 110, color: T.main }}>
          {mm}:{ss}
        </div>
      </div>
      {RULES.map((r, i) => {
        const p = pop(frame, r.at - 6, SPRING.bouncy);
        return (
          p.t > 0 && (
            <div key={r.w} style={{ position: "absolute", left: 140, right: 140, top: 640 + i * 170, height: 140, ...SURFACE, display: "flex", alignItems: "center", gap: 30, padding: "0 44px", boxSizing: "border-box", ...p.style }}>
              <div style={{ width: 26, height: 26, borderRadius: 13, background: T.vivid, flex: "none" }} />
              <span style={{ ...PARAGRAPH, fontSize: 60, lineHeight: 1 }}>{r.w}</span>
            </div>
          )
        );
      })}
      {plate.t > 0 && (
        <div style={{ position: "absolute", top: 1010, left: 0, right: 0, display: "flex", justifyContent: "center", ...plate.style }}>
          <div style={{ transform: "scale(2.3)" }}>
            <GlassPlate bg={PLATE_SKY}>без оценок</GlassPlate>
          </div>
        </div>
      )}
    </>
  );
};

/* ───────── 5. Find a language friend; tag them in the comments ───────── */

const Find: React.FC<{ frame: number }> = ({ frame }) => {
  const first = fadeOut(frame, F.tag - 12);
  const link = ease.inOut(progress(frame, F.friend, F.lang + 20));
  const card = pop(frame, F.comments - 8, SPRING.smooth);
  const at = Math.max(0, Math.min(6, Math.floor((frame - F.whom) / 5)));
  const handle = "@aigul".slice(0, at);
  const send = pop(frame, F.start, SPRING.bouncy);
  const shrink = ease.inOut(progress(frame, F.tag - 14, F.tag + 10));
  return (
    <>
      {first > 0 && <Title text="найди *друга* по языку" frame={frame} at={[F.findIn + 2, F.friend, F.lang - 6, F.lang]} size={92} style={{ opacity: first }} />}
      {frame >= F.tag - 8 && <Title text="отметь в *комментариях*" frame={frame} at={[F.tag - 6, F.comments - 8, F.comments]} size={92} />}
      {/* two faces connect */}
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${lerp(0, -120, shrink)}px) scale(${lerp(1, 0.7, shrink)})`, transformOrigin: "50% 40%", opacity: 1 - 0.3 * shrink }}>
        <svg width={1080} height={1300} style={{ position: "absolute", inset: 0 }}>
          <line x1={300} y1={640} x2={lerp(300, 780, link)} y2={640} stroke={T.glow} strokeWidth={10} strokeDasharray="4 22" strokeLinecap="round" />
        </svg>
        <Face color={T.vivid} size={220} style={{ position: "absolute", left: 190, top: 530, transform: `scale(${springAt(frame, F.findIn + 6, SPRING.bouncy)})` }} />
        <Face color={T.glow} size={220} style={{ position: "absolute", left: 670, top: 530, transform: `scale(${springAt(frame, F.friend - 4, SPRING.bouncy)})` }} />
      </div>
      {card.t > 0 && (
        <div style={{ position: "absolute", left: 120, right: 120, top: 860, ...SURFACE, padding: 44, display: "flex", alignItems: "center", gap: 30, ...card.style }}>
          <Face color={T.main} size={110} style={{ border: "none", boxShadow: "none" }} />
          <div style={{ flex: 1, ...PARAGRAPH, fontSize: 60, lineHeight: 1, fontWeight: 700, color: T.main, minHeight: 60 }}>
            {handle}
            {frame < F.start && <span style={{ display: "inline-block", width: 4, height: 54, marginLeft: 4, verticalAlign: "middle", background: T.vivid, opacity: Math.floor(frame / 15) % 2 }} />}
          </div>
          {send.t > 0 && (
            <div style={{ width: 90, height: 90, borderRadius: 45, background: T.vivid, display: "grid", placeItems: "center", ...send.style }}>
              <svg width={44} height={44}>
                <path d="M10 22 L34 22 M24 12 L34 22 L24 32" fill="none" stroke="#fff" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
        </div>
      )}
    </>
  );
};

/* ───────── 6. Together it's easier: two streaks climb side by side ───────── */

const Duo: React.FC<{ frame: number }> = ({ frame }) => {
  const plate = pop(frame, F.easier + 4, SPRING.bouncy);
  const grow = ease.out(progress(frame, F.duoIn + 10, F.easier + 20));
  const DAYS = 10;
  return (
    <>
      <Title text="вдвоем *легче*" frame={frame} at={[F.together, F.easier]} size={110} />
      {[T.vivid, T.glow].map((c, row) => (
        <div key={row} style={{ position: "absolute", left: 120, right: 120, top: 470 + row * 210, height: 170, ...SURFACE, padding: "0 36px", boxSizing: "border-box", display: "flex", alignItems: "center", gap: 18, ...pop(frame, F.duoIn + 4 + row * 6, SPRING.smooth).style }}>
          <Face color={c} size={100} style={{ border: "none", boxShadow: "none" }} />
          <div style={{ display: "flex", gap: 12, marginLeft: 12 }}>
            {Array.from({ length: DAYS }, (_, i) => {
              const on = grow * DAYS > i + (row ? 0.4 : 0);
              return <div key={i} style={{ width: 44, height: 44, borderRadius: 14, background: on ? (row ? T.vivid : T.main) : GRAY, transform: `scale(${on ? 1 : 0.8})` }} />;
            })}
          </div>
        </div>
      ))}
      {plate.t > 0 && (
        <div style={{ position: "absolute", top: 960, left: 0, right: 0, display: "flex", justifyContent: "center", ...plate.style }}>
          <div style={{ transform: "scale(2.3)" }}>
            <GlassPlate bg={PLATE_SKY}>
              <HeartHandshake size={20} strokeWidth={2.2} /> друг по языку
            </GlassPlate>
          </div>
        </div>
      )}
    </>
  );
};

/* ───────── Composition ───────── */

const SCENES: SceneDef[] = [
  { range: [0, F.shelfIn], El: Hook },
  { range: [F.shelfIn, F.personIn], El: Shelf },
  { range: [F.personIn, F.fiveIn], El: Person },
  { range: [F.fiveIn, F.findIn], El: Five },
  { range: [F.findIn, F.duoIn], El: Find },
  { range: [F.duoIn, F.duration + 30], El: Duo },
];

const SFX: Sfx[] = [
  { src: "sfx/07_CineStrike.wav", from: 2, volume: 0.18 },
  { src: "sfx/05_Distortion_Glitch.wav", from: F.textbooks + 24, volume: 0.05 },
  { src: "sfx/03_Basscrack.wav", from: F.textbooks + 20, volume: 0.08 },
  // scene changes: textures from the SFX/ library (no whoosh)
  { src: "sfx/01_Ripple_Textures.wav", from: F.shelfIn - 8, volume: 0.18 },
  { src: "sfx/04_Cyber_Shift.wav", from: F.personIn - 8, volume: 0.2 },
  { src: "sfx/06_Ripple_Textures_II.wav", from: F.fiveIn - 8, volume: 0.2 },
  { src: "sfx/02_Alienated_Warpes.wav", from: F.findIn - 8, volume: 0.14 },
  { src: "sfx/01_Ripple_Textures.wav", from: F.duoIn - 8, volume: 0.18 },
  // 2. book lands, shelf sags
  { src: "sfx2/pop.mp3", from: F.book - 2, volume: 0.22 },
  // 3. typing, sent
  { src: "sfx2/click.mp3", from: F.write, volume: 0.16 },
  { src: "sfx2/click.mp3", from: F.write + 18, volume: 0.16 },
  { src: "sfx2/ding.mp3", from: F.salam + 6, volume: 0.2 },
  // 4. rules
  ...RULES.map((r) => ({ src: "sfx2/pop.mp3", from: r.at - 6, volume: 0.22 })),
  { src: "sfx2/pop.mp3", from: F.noGrades - 4, volume: 0.24 },
  // 5. faces connect, tag sent
  { src: "sfx2/pop.mp3", from: F.friend - 4, volume: 0.22 },
  { src: "sfx2/click.mp3", from: F.whom, volume: 0.18 },
  { src: "sfx2/ding.mp3", from: F.start, volume: 0.2 },
  // 6. together
  { src: "sfx/07_CineStrike.wav", from: F.easier + 4, volume: 0.12 },
];

// All 30 poses of the main set, each at least once; a swap every ~0.7 s by the meaning of the line, never the same photo twice in a row
const AVATAR_KEYS: AvatarKey[] = [
  // 1. hook
  { at: 0, e: "shush" },
  { at: 40, e: "point-up" },
  { at: 80, e: "explaining" },
  { at: 120, e: "displeased" },
  { at: 160, e: "skeptical" },
  { at: 195, e: "stop" },
  { at: 225, e: "arms-crossed" },
  // 2. one more textbook?
  { at: F.shelfIn, e: "puzzled" },
  { at: 285, e: "disappointed" },
  { at: 320, e: "facepalm" },
  { at: 360, e: "shrug" },
  // 3. a person, "сәлам"
  { at: F.personIn, e: "thinking" },
  { at: 450, e: "inspired" },
  { at: 490, e: "smile-up" },
  { at: 530, e: "waving" },
  // 4. five minutes, mistakes, no grades
  { at: F.fiveIn, e: "present-left" },
  { at: 620, e: "point-right" },
  { at: 660, e: "listening" },
  { at: 700, e: "laughing" },
  { at: 745, e: "soft-smile" },
  { at: 790, e: "thumbs-up" },
  // 5. find a friend, tag them
  { at: F.findIn, e: "delighted" },
  { at: 870, e: "surprised" },
  { at: 930, e: "point-down" },
  { at: 975, e: "pensive" },
  { at: 1015, e: "dreamy" },
  { at: 1050, e: "hand-on-heart" },
  // 6. together
  { at: F.duoIn, e: "heart-hands" },
  { at: 1120, e: "clapping" },
  { at: 1165, e: "victory" },
];

const STANCES: StanceKey[] = [
  { at: 0, s: "center" },
  { at: F.shelfIn, s: "right" },
  { at: F.personIn, s: "left" },
  { at: F.fiveIn, s: "right" },
  { at: F.findIn, s: "left" },
  { at: F.duoIn, s: "center" },
];

// Main set photos: scale the wide-framed ones so every photo fills the 540x590 box by height (same as V24)
const SIZE: Record<string, [number, number]> = {
  pensive: [1312, 1199], dreamy: [1293, 1217], displeased: [1254, 1254], surprised: [1280, 1229], waving: [1312, 1199], inspired: [1199, 1312], explaining: [1312, 1199], delighted: [1312, 1199], skeptical: [1312, 1199], laughing: [1385, 1136],
  puzzled: [1152, 1366], disappointed: [1278, 1230], "smile-up": [1199, 1312], thinking: [1190, 1322], "soft-smile": [1218, 1291], "point-up": [1312, 1199], "point-down": [1312, 1199], "present-left": [1312, 1199], "point-right": [1312, 1199], shrug: [1312, 1199],
  "hand-on-heart": [1312, 1199], stop: [1312, 1199], shush: [1312, 1199], clapping: [1278, 1230], "thumbs-up": [1312, 1199], "arms-crossed": [1312, 1199], facepalm: [1312, 1199], "heart-hands": [1312, 1199], victory: [1312, 1199], listening: [1312, 1199],
};
const FIT = Object.fromEntries(Object.entries(SIZE).map(([e, [w, h]]) => [e, Math.max(1, w / h / (540 / 590))])) as Partial<Record<Emotion, number>>;

const Host: React.FC<{ frame: number }> = ({ frame }) => <TatAvatar frame={frame} keys={AVATAR_KEYS} words={WORDS} stances={STANCES} fit={FIT} />;

export const Video36: React.FC = () => (
  <AbsoluteFill style={{ background: "#fff", fontFamily: PARAGRAPH.fontFamily, color: INK }}>
    <ReelShell scenes={SCENES} headlines={[]} vo={VO} sfx={SFX} duration={F.duration} music="v36/music/bed.mp3" musicLevel={[0.045, 0.11]} overlay={Host} bg={BG} />
  </AbsoluteFill>
);
