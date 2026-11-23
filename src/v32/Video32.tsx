import React from "react";
import { AbsoluteFill } from "remotion";
import { Check } from "lucide-react";
import { SPRING, ease, lerp, progress, springAt } from "../stage/motion";
import { ReelShell, pop, shake, type SceneDef, type Sfx } from "../kit/reel";
import { TatAvatar, type AvatarKey, type Emotion, type StanceKey } from "../kit/TatAvatar";
import { DotOrbitBg } from "../kit/DotOrbitBg";
import { HEADING, INK, NUMBER, PARAGRAPH, SURFACE } from "../kit/design";
import { GlassPlate } from "../catalog/own/glass";
import { Strike } from "../catalog/own/text";
import { F, VO } from "./timeline";
import { WORDS } from "./words";

// "Приглашение, на которое хочется ответить" (@the_tatarverse, RU, main host preset Ahu). ~21 s.
// Nobody comes -> "we invite you to the event" says nothing -> be concrete: meet, tea with chak-chak, five phrases -> people see themselves at the table -> "I'll come".
// Own kit only. Palette: raspberry (warmth, invitation). Dot Orbit variant 2 (output/bg-variant.txt).
const B = { main: "#A3195B", vivid: "#D12F7A", glow: "#F2A6C8", pale: "#FCE9F2" };
const BG = <DotOrbitBg variant={2} />;
const W = 1080;
const GREY = "#E6E1E4";
const MUTED = "#8A8792";
const PLATE_BG = `linear-gradient(135deg, ${B.vivid}, ${B.main})`;

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

/** Side view of a chair (drawn), optionally with a guest sitting on it */
const Chair: React.FC<{ x: number; y: number; s?: number; guest?: number; color?: string; style?: React.CSSProperties }> = ({ x, y, s = 1, guest = 0, color = B.vivid, style }) => (
  <div style={{ position: "absolute", left: x - 60 * s, top: y - 170 * s, width: 120 * s, height: 170 * s, ...style }}>
    <svg width={120 * s} height={170 * s} viewBox="0 0 120 170" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      {guest > 0 && (
        <g transform={`translate(60 ${60 + (1 - Math.min(guest, 1)) * -40}) scale(${Math.min(guest, 1.1)})`} opacity={Math.min(1, guest * 1.5)}>
          <circle cx={0} cy={-38} r={24} fill={color} />
          <rect x={-32} y={-8} width={64} height={60} rx={26} fill={color} opacity={0.85} />
        </g>
      )}
      <rect x={20} y={10} width={14} height={104} rx={7} fill={GREY} />
      <rect x={20} y={96} width={86} height={18} rx={9} fill={GREY} />
      <rect x={24} y={112} width={10} height={56} rx={5} fill={GREY} />
      <rect x={92} y={112} width={10} height={56} rx={5} fill={GREY} />
    </svg>
  </div>
);

/** Tea cup (drawn) with rising steam */
const Cup: React.FC<{ frame: number; s?: number }> = ({ frame, s = 1 }) => (
  <svg width={120 * s} height={110 * s} viewBox="0 0 120 110" style={{ flex: "none", overflow: "visible" }}>
    {[0, 1, 2].map((k) => {
      const t = ((frame + k * 22) % 66) / 66;
      return <path key={k} d={`M ${36 + k * 18} ${40 - t * 30} q 8 -8 0 -16 q -8 -8 0 -16`} fill="none" stroke={B.glow} strokeWidth={5} strokeLinecap="round" opacity={Math.sin(t * Math.PI)} />;
    })}
    <path d="M 14 46 h 76 v 22 a 38 34 0 0 1 -76 0 z" fill={B.vivid} />
    <path d="M 90 54 a 14 14 0 0 1 0 28" fill="none" stroke={B.vivid} strokeWidth={8} />
    <rect x={2} y={98} width={104} height={10} rx={5} fill={B.glow} />
  </svg>
);

/** Three overlapping faces = "we'll get acquainted" */
const Faces: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <svg width={120 * s} height={110 * s} viewBox="0 0 120 110" style={{ flex: "none" }}>
    {[
      [30, B.glow],
      [90, B.main],
      [60, B.vivid],
    ].map(([cx, c], i) => (
      <g key={i}>
        <circle cx={cx as number} cy={42} r={20} fill={c as string} stroke="#fff" strokeWidth={5} />
        <rect x={(cx as number) - 24} y={66} width={48} height={40} rx={20} fill={c as string} stroke="#fff" strokeWidth={5} />
      </g>
    ))}
  </svg>
);

/* ───────── 1. Hook: why nobody comes - rows of empty chairs, a zero ───────── */

const ROW_X = [180, 360, 540, 720, 900];
const Hook: React.FC<{ frame: number }> = ({ frame }) => {
  const zero = pop(frame, F.nobody - 6, SPRING.bouncy);
  const s = shake(frame, F.come + 6, 10, 18);
  // a lone draft rocks the last chair: a small gentle joke
  const rock = Math.sin((frame - F.come) / 9) * 3 * progress(frame, F.come, F.come + 20);
  return (
    <>
      <Title text="почему никто не *приходит*" frame={frame} at={[-30, -24, -18, -12]} size={92} />
      {[600, 860].map((y, r) =>
        ROW_X.map((x, i) => {
          const p = springAt(frame, F.meets - 20 + (r * 5 + i) * 3, SPRING.bouncy);
          return <Chair key={`${r}-${i}`} x={x} y={y} s={0.95} style={{ opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * 40}px) rotate(${r === 1 && i === 4 ? rock : 0}deg)`, transformOrigin: "50% 100%" }} />;
        }),
      )}
      {zero.t > 0 && (
        <div style={{ position: "absolute", top: 940, left: 0, right: 0, display: "flex", justifyContent: "center", ...zero.style }}>
          <div style={{ ...SURFACE, width: 220, height: 220, borderRadius: 110, display: "grid", placeItems: "center", transform: `translateX(${s}px)` }}>
            <span style={{ ...NUMBER, fontSize: 130, color: B.main }}>0</span>
          </div>
        </div>
      )}
    </>
  );
};

/* ───────── 2. "We invite you to the event": a grey, faceless flyer -> what's in it for me ───────── */

const Flyer: React.FC<{ frame: number }> = ({ frame }) => {
  const card = pop(frame, F.flyerIn + 4, SPRING.smooth);
  const dim = ease.inOut(progress(frame, F.what - 6, F.what + 24));
  const q = pop(frame, F.me - 8, SPRING.bouncy);
  const wob = Math.sin((frame - F.me) / 7) * 8 * Math.min(1, q.t);
  return (
    <>
      {dim > 0 && <Title text="что для *меня*" frame={frame} at={[F.what, F.what + 10, F.me]} size={100} />}
      <div style={{ position: "absolute", top: 440, left: 170, right: 170, ...card.style }}>
        <div style={{ ...SURFACE, padding: 44, display: "flex", flexDirection: "column", gap: 30, transform: `rotate(${-4 * dim}deg) scale(${1 - 0.08 * dim})`, transformOrigin: "50% 100%", filter: `grayscale(${dim})` }}>
          <div style={{ height: 220, borderRadius: 18, background: GREY }} />
          <div style={{ ...PARAGRAPH, fontSize: 56, lineHeight: 1.15, textAlign: "center" }}>
            приглашаем на
            <br />
            <Strike frame={frame} at={F.what + 14}>
              мероприятие
            </Strike>
          </div>
          {[1, 0.7].map((w, i) => (
            <div key={i} style={{ height: 16, width: `${w * 100}%`, alignSelf: "center", borderRadius: 8, background: GREY }} />
          ))}
        </div>
      </div>
      {q.t > 0 && (
        <div style={{ position: "absolute", top: 380, left: 790, ...q.style }}>
          <div style={{ ...SURFACE, width: 150, height: 150, borderRadius: 75, display: "grid", placeItems: "center", transform: `rotate(${wob}deg)` }}>
            <div style={{ display: "flex", gap: 12 }}>
              {[0, 1, 2].map((k) => (
                <div key={k} style={{ width: 22, height: 22, borderRadius: 11, background: B.vivid, transform: `translateY(${-8 * Math.max(0, Math.sin(frame / 6 - k * 0.9))}px)` }} />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

/* ───────── 3. Be concrete: an invitation card fills with real plans ───────── */

const Concrete: React.FC<{ frame: number }> = ({ frame }) => {
  const card = pop(frame, F.concrete - 4, SPRING.smooth);
  const rows = [
    { at: F.meet, art: <Faces />, text: <b style={{ color: B.main }}>познакомимся</b> },
    { at: F.tea, art: <Cup frame={frame} />, text: (
      <>
        чай с <b style={{ color: B.main }}>чак-чаком</b>
      </>
    ) },
  ];
  return (
    <>
      <Title text="напиши *конкретно*" frame={frame} at={[F.concreteIn + 4, F.concrete]} size={100} />
      <div style={{ position: "absolute", top: 450, left: 110, right: 110, ...card.style }}>
        <div style={{ ...SURFACE, padding: 48, display: "flex", flexDirection: "column", gap: 44 }}>
          {rows.map((r, i) => {
            const p = pop(frame, r.at - 8, SPRING.bouncy);
            const tick = springAt(frame, r.at + 20, SPRING.bouncy);
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 34, ...p.style }}>
                {r.art}
                <div style={{ ...PARAGRAPH, fontSize: 58, lineHeight: 1.1, flex: 1, whiteSpace: "nowrap" }}>{r.text}</div>
                <div style={{ width: 56, height: 56, borderRadius: 28, background: B.pale, border: `4px solid ${B.glow}`, display: "grid", placeItems: "center", flex: "none" }}>
                  <div style={{ width: 24, height: 24, borderRadius: 12, background: B.vivid, transform: `scale(${tick})` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

/* ───────── 4. Learn five phrases together: a hand of five cards fans out ───────── */

const FAN = [-16, -8, 0, 8, 16];
const Five: React.FC<{ frame: number }> = ({ frame }) => {
  const deal = pop(frame, F.fiveIn + 6, SPRING.smooth);
  const spread = springAt(frame, F.five - 6, SPRING.bouncy);
  const word = pop(frame, F.tatar - 4, SPRING.bouncy);
  const order = [0, 4, 1, 3, 2];
  return (
    <>
      <Title text="выучим *5* фраз" frame={frame} at={[F.fiveIn + 6, F.five, F.five + 12]} size={100} />
      <div style={{ position: "absolute", left: W / 2 - 140, top: 520, width: 280, height: 380, ...deal.style }}>
        {order.map((i) => {
          const a = FAN[i] * spread;
          const mid = i === 2;
          return (
            <div key={i} style={{ ...SURFACE, position: "absolute", inset: 0, transform: `translateX(${FAN[i] * 5 * spread}px) rotate(${a}deg)`, transformOrigin: "50% 160%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 32, background: mid ? B.pale : "#fff" }}>
              <span style={{ ...NUMBER, fontSize: 64, color: mid ? B.main : B.glow, alignSelf: i > 2 ? "flex-end" : "flex-start" }}>{i + 1}</span>
              {mid && (
                <div style={{ ...HEADING, fontSize: 64, fontWeight: 700, color: B.main, textAlign: "center", ...word.style }}>сәлам</div>
              )}
              <div style={{ height: 14, width: "60%", borderRadius: 7, background: mid ? B.glow : GREY, alignSelf: "flex-end" }} />
            </div>
          );
        })}
      </div>
    </>
  );
};

/* ───────── 5. They see themselves at the table: one free seat lights up for "you" ───────── */

const TC = { x: 540, y: 820 };
const SEATS = [-90, -30, 30, 90, 150, 210];
const Table: React.FC<{ frame: number }> = ({ frame }) => {
  const table = pop(frame, F.tableIn + 4, SPRING.smooth);
  const me = springAt(frame, F.self - 4, SPRING.bouncy);
  const ring = (frame - F.self) / 40;
  return (
    <>
      <Title text="видит *себя* за столом" frame={frame} at={[F.sees - 8, F.self, F.table - 6, F.table]} size={92} />
      <div style={{ position: "absolute", inset: 0, ...table.style }}>
        <div style={{ ...SURFACE, position: "absolute", left: TC.x - 220, top: TC.y - 220, width: 440, height: 440, borderRadius: 220, background: B.pale, boxShadow: `0 0 0 14px #fff, ${SURFACE.boxShadow}` }} />
        {SEATS.map((deg, i) => {
          const r = (deg * Math.PI) / 180;
          const cx = TC.x + Math.cos(r) * 150;
          const cy = TC.y + Math.sin(r) * 150;
          return <div key={`c${i}`} style={{ position: "absolute", left: cx - 26, top: cy - 26, width: 52, height: 52, borderRadius: 26, background: "#fff", border: `6px solid ${i === 1 ? B.vivid : B.glow}` }} />;
        })}
        <div style={{ position: "absolute", left: TC.x - 54, top: TC.y - 54, width: 108, height: 108, borderRadius: 54, background: B.glow, display: "grid", placeItems: "center" }}>
          <div style={{ width: 60, height: 60, borderRadius: 30, background: B.vivid }} />
        </div>
      </div>
      {SEATS.map((deg, i) => {
        const r = (deg * Math.PI) / 180;
        const x = TC.x + Math.cos(r) * 310;
        const y = TC.y + Math.sin(r) * 310;
        const you = i === 1;
        const p = you ? me : springAt(frame, F.tableIn + 16 + i * 6, SPRING.bouncy);
        return (
          <React.Fragment key={i}>
            {you && frame >= F.self && [0, 0.5].map((k) => {
              const q = (ring + k) % 1;
              return <div key={k} style={{ position: "absolute", left: x - 60 - q * 50, top: y - 60 - q * 50, width: 120 + q * 100, height: 120 + q * 100, borderRadius: 999, border: `5px solid ${B.glow}`, opacity: 1 - q }} />;
            })}
            {you && <div style={{ position: "absolute", left: x - 60, top: y - 60, width: 120, height: 120, borderRadius: 60, border: `5px dashed ${B.glow}`, opacity: 1 - Math.min(1, me) }} />}
            <div style={{ position: "absolute", left: x - 60, top: y - 60, width: 120, height: 120, borderRadius: 60, background: you ? B.vivid : [B.glow, B.main, B.glow, B.main, B.glow, B.main][i], border: "8px solid #fff", boxShadow: SURFACE.boxShadow, transform: `scale(${p})`, display: "grid", placeItems: "center" }}>
              {you && <span style={{ ...HEADING, fontSize: 48, fontWeight: 700, color: "#fff" }}>ты</span>}
            </div>
          </React.Fragment>
        );
      })}
    </>
  );
};

/* ───────── 6. You want to answer: the RSVP button is pressed, the chairs fill up ───────── */

const Reply: React.FC<{ frame: number }> = ({ frame }) => {
  const card = pop(frame, F.invite - 10, SPRING.smooth);
  const press = springAt(frame, F.come2 - 4, SPRING.bouncy);
  const dip = 1 - 0.12 * Math.sin(Math.min(1, progress(frame, F.come2 - 8, F.come2 + 6)) * Math.PI);
  const later = 1 - ease.out(progress(frame, F.come2, F.come2 + 14));
  return (
    <>
      <Title text="хочется *ответить*" frame={frame} at={[F.replyIn + 6, F.answer]} size={100} />
      <div style={{ position: "absolute", top: 430, left: 150, right: 150, ...card.style }}>
        <div style={{ ...SURFACE, padding: 44, display: "flex", flexDirection: "column", alignItems: "center", gap: 36 }}>
          <div style={{ display: "flex", gap: 30, alignItems: "center" }}>
            <Faces s={0.9} />
            <Cup frame={frame} s={0.9} />
            <span style={{ ...NUMBER, fontSize: 84, color: B.main }}>5</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 28, height: 110 }}>
            <div style={{ ...PARAGRAPH, fontSize: 40, color: MUTED, padding: "22px 30px", borderRadius: 9999, background: "#F3F0F2", opacity: 0.35 + 0.65 * later }}>позже</div>
            <div style={{ transform: `scale(${2.1 * dip})`, transformOrigin: "50% 50%", margin: "0 70px" }}>
              <GlassPlate bg={PLATE_BG}>
                <Check size={18} strokeWidth={2.6} /> я приду
              </GlassPlate>
            </div>
          </div>
        </div>
      </div>
      {ROW_X.map((x, i) => (
        <Chair key={i} x={x} y={1210} s={0.85} guest={press > 0.3 ? springAt(frame, F.come2 + 6 + i * 6, SPRING.bouncy) : 0} color={i % 2 ? B.main : B.vivid} />
      ))}
      {frame >= F.come2 &&
        Array.from({ length: 14 }, (_, i) => {
          const t = progress(frame, F.come2, F.come2 + 40);
          const a = (i / 14) * Math.PI * 2;
          const d = lerp(40, 340, ease.out(t));
          return <div key={i} style={{ position: "absolute", left: 540 + 120 + Math.cos(a) * d - 9, top: 760 + Math.sin(a) * d * 0.7 - 9, width: 18, height: 18, borderRadius: 9, background: i % 2 ? B.vivid : B.glow, opacity: 1 - t }} />;
        })}
    </>
  );
};

/* ───────── Composition ───────── */

const SCENES: SceneDef[] = [
  { range: [0, F.flyerIn], El: Hook },
  { range: [F.flyerIn, F.concreteIn], El: Flyer },
  { range: [F.concreteIn, F.fiveIn], El: Concrete },
  { range: [F.fiveIn, F.tableIn], El: Five },
  { range: [F.tableIn, F.replyIn], El: Table },
  { range: [F.replyIn, F.duration + 30], El: Reply },
];

const SFX: Sfx[] = [
  { src: "sfx/07_CineStrike.wav", from: 2, volume: 0.18 },
  { src: "sfx/03_Basscrack.wav", from: F.nobody - 4, volume: 0.12 },
  // scene changes: textures from the SFX/ library (no whoosh)
  { src: "sfx/04_Cyber_Shift.wav", from: F.flyerIn - 8, volume: 0.2 },
  { src: "sfx/01_Ripple_Textures.wav", from: F.concreteIn - 8, volume: 0.18 },
  { src: "sfx/06_Ripple_Textures_II.wav", from: F.fiveIn - 8, volume: 0.2 },
  { src: "sfx/02_Alienated_Warpes.wav", from: F.tableIn - 8, volume: 0.14 },
  { src: "sfx/01_Ripple_Textures.wav", from: F.replyIn - 8, volume: 0.18 },
  // 2. flyer struck, question
  { src: "sfx/05_Distortion_Glitch.wav", from: F.what + 44, volume: 0.05 },
  { src: "sfx2/pop.mp3", from: F.me - 6, volume: 0.24 },
  // 3. plans tick in
  { src: "sfx2/pop.mp3", from: F.meet - 6, volume: 0.22 },
  { src: "sfx2/click.mp3", from: F.meet + 22, volume: 0.2 },
  { src: "sfx2/pop.mp3", from: F.tea - 6, volume: 0.22 },
  { src: "sfx2/click.mp3", from: F.tea + 22, volume: 0.2 },
  // 4. the cards fan out
  { src: "sfx2/click.mp3", from: F.five - 4, volume: 0.2 },
  { src: "sfx2/pop.mp3", from: F.tatar - 2, volume: 0.24 },
  // 5. your seat
  { src: "sfx2/ding.mp3", from: F.self, volume: 0.22 },
  // 6. "I'll come"
  { src: "sfx2/click.mp3", from: F.come2 - 6, volume: 0.24 },
  { src: "sfx/07_CineStrike.wav", from: F.come2, volume: 0.12 },
];

// All 30 poses of the main set, each at least once; a swap every ~0.7 s by the meaning of the line, never the same photo twice in a row
const AVATAR_KEYS: AvatarKey[] = [
  // 1. hook: why nobody comes
  { at: 0, e: "shush" },
  { at: 36, e: "point-up" },
  { at: 70, e: "thinking" },
  { at: 100, e: "puzzled" },
  { at: 126, e: "facepalm" },
  { at: 166, e: "disappointed" },
  // 2. "we invite you to the event"
  { at: F.flyerIn, e: "present-left" },
  { at: 240, e: "listening" },
  { at: 280, e: "displeased" },
  { at: 333, e: "stop" },
  { at: 365, e: "skeptical" },
  { at: 398, e: "shrug" },
  { at: 422, e: "arms-crossed" },
  // 3. be concrete
  { at: F.concreteIn, e: "point-down" },
  { at: 478, e: "explaining" },
  { at: 514, e: "waving" },
  { at: 570, e: "smile-up" },
  { at: 615, e: "delighted" },
  // 4. five phrases
  { at: F.fiveIn, e: "inspired" },
  { at: 712, e: "point-right" },
  { at: 748, e: "surprised" },
  { at: 790, e: "thumbs-up" },
  // 5. at the table
  { at: F.tableIn, e: "dreamy" },
  { at: 885, e: "pensive" },
  { at: 924, e: "hand-on-heart" },
  { at: 964, e: "soft-smile" },
  // 6. "I'll come"
  { at: F.replyIn, e: "heart-hands" },
  { at: 1070, e: "laughing" },
  { at: 1120, e: "clapping" },
  { at: 1170, e: "victory" },
];

const STANCES: StanceKey[] = [
  { at: 0, s: "center" },
  { at: F.flyerIn, s: "right" },
  { at: F.concreteIn, s: "left" },
  { at: F.fiveIn, s: "right" },
  { at: F.tableIn, s: "left" },
  { at: F.replyIn, s: "center" },
];

// Main set photos: scale the wide-framed ones so every photo fills the 540x590 box by height (same table as V24)
const SIZE: Record<string, [number, number]> = {
  pensive: [1312, 1199], dreamy: [1293, 1217], displeased: [1254, 1254], surprised: [1280, 1229], waving: [1312, 1199], inspired: [1199, 1312], explaining: [1312, 1199], delighted: [1312, 1199], skeptical: [1312, 1199], laughing: [1385, 1136],
  puzzled: [1152, 1366], disappointed: [1278, 1230], "smile-up": [1199, 1312], thinking: [1190, 1322], "soft-smile": [1218, 1291], "point-up": [1312, 1199], "point-down": [1312, 1199], "present-left": [1312, 1199], "point-right": [1312, 1199], shrug: [1312, 1199],
  "hand-on-heart": [1312, 1199], stop: [1312, 1199], shush: [1312, 1199], clapping: [1278, 1230], "thumbs-up": [1312, 1199], "arms-crossed": [1312, 1199], facepalm: [1312, 1199], "heart-hands": [1312, 1199], victory: [1312, 1199], listening: [1312, 1199],
};
const FIT = Object.fromEntries(Object.entries(SIZE).map(([e, [w, h]]) => [e, Math.max(1, w / h / (540 / 590))])) as Partial<Record<Emotion, number>>;

const Host: React.FC<{ frame: number }> = ({ frame }) => <TatAvatar frame={frame} keys={AVATAR_KEYS} words={WORDS} stances={STANCES} fit={FIT} />;

export const Video32: React.FC = () => (
  <AbsoluteFill style={{ background: "#fff", fontFamily: PARAGRAPH.fontFamily, color: INK }}>
    <ReelShell scenes={SCENES} headlines={[]} vo={VO} sfx={SFX} duration={F.duration} music="v32/music/bed.mp3" musicLevel={[0.045, 0.11]} overlay={Host} bg={BG} />
  </AbsoluteFill>
);
