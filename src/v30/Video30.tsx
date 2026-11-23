import React from "react";
import { AbsoluteFill } from "remotion";
import { MessageCircle } from "lucide-react";
import { SPRING, ease, lerp, progress, springAt } from "../stage/motion";
import { ReelShell, pop, type SceneDef, type Sfx } from "../kit/reel";
import { TatAvatar, type AvatarKey, type Emotion, type StanceKey } from "../kit/TatAvatar";
import { DotOrbitBg } from "../kit/DotOrbitBg";
import { HEADING, INK, NUMBER, PARAGRAPH, SURFACE } from "../kit/design";
import { GlassPlate } from "../catalog/own/glass";
import { F, VO } from "./timeline";
import { WORDS } from "./words";

// "Культурный проект начинается с трех человек" (@the_tatarverse, RU, main host preset Ahu). ~21 s.
// The whole truth: cultural projects start with three people -> one knows the language, one films -> one gathers everyone
// -> together that's a conversation club -> no fund, office or 100 members needed -> look around: who are your second and third?
// Own kit only. Palette: ochre (tradition, gatherings). Dot Orbit variant 6 (output/bg-variant.txt).
const O = { main: "#8A6100", vivid: "#C08A10", glow: "#EBCB7A", pale: "#FBF3DE" };
const PLATE_O = "linear-gradient(135deg, #DDA62A, #8A6100)";
const BG = <DotOrbitBg variant={6} />;
const W = 1080;
const MUTED = "#8A8792";
const LINE = "#EEEAE0";
const GREY = "#CFCBC3";
const TONE = [O.main, O.vivid, O.glow];

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
        <span key={i} style={{ display: "inline-block", marginRight: i < all.length - 1 ? "0.24em" : 0, fontWeight: key ? 700 : 400, color: key ? O.main : undefined, opacity: Math.min(1, t * 1.3), transform: `translateY(${(1 - t) * 30}px)`, filter: `blur(${Math.max(0, (1 - t) * 8)}px)` }}>
          {raw}
        </span>
      );
    })}
  </div>
);

/** Team member: round portrait (person silhouette) with an optional number badge; (x, y) = center */
const Member: React.FC<{ x: number; y: number; d: number; c: string; n?: number; badge?: number; t?: number; dashed?: boolean }> = ({ x, y, d, c, n, badge = 1, t = 1, dashed }) => (
  <div style={{ position: "absolute", left: x - d / 2, top: y - d / 2, width: d, height: d, transform: `scale(${t})`, opacity: Math.min(1, t * 1.5) }}>
    <div style={{ position: "absolute", inset: 0, borderRadius: "50%", overflow: "hidden", background: dashed ? "transparent" : O.pale, border: dashed ? `5px dashed ${GREY}` : `6px solid #fff`, boxShadow: dashed ? undefined : SURFACE.boxShadow }}>
      {!dashed && (
        <>
          <div style={{ position: "absolute", left: "50%", top: d * 0.2, width: d * 0.3, height: d * 0.3, marginLeft: -d * 0.15, borderRadius: "50%", background: c }} />
          <div style={{ position: "absolute", left: "50%", top: d * 0.55, width: d * 0.6, height: d * 0.6, marginLeft: -d * 0.3, borderRadius: "50%", background: c }} />
        </>
      )}
    </div>
    {n !== undefined && badge > 0 && (
      <div style={{ position: "absolute", right: -d * 0.04, top: -d * 0.04, width: d * 0.34, height: d * 0.34, borderRadius: "50%", background: O.main, border: "5px solid #fff", display: "grid", placeItems: "center", transform: `scale(${badge})` }}>
        <span style={{ ...NUMBER, fontSize: d * 0.18, color: "#fff" }}>{n}</span>
      </div>
    )}
  </div>
);

/* ───────── 1. Hook: three empty seats, on "трех" they fill with people 1-2-3 ───────── */

const SEATS = [270, 540, 810];
const Hook: React.FC<{ frame: number }> = ({ frame }) => {
  const out = progress(frame, F.start - 22, F.start - 6);
  return (
    <>
      {out < 1 && <Title text="вся правда о *культурных проектах*" frame={frame} at={[-30, -26, -22, F.culture - 6, F.culture + 20]} size={92} style={{ opacity: 1 - out }} />}
      {out > 0 && <Title text="начинаются с *трех* человек" frame={frame} at={[F.start - 4, F.three - 8, F.three, F.people]} size={92} />}
      {SEATS.map((x, i) => {
        const at = F.three + i * 10;
        const fill = springAt(frame, at, SPRING.bouncy);
        const pulse = 1 + 0.04 * Math.sin(frame / 8 + i);
        return (
          <React.Fragment key={x}>
            {fill < 0.5 && <Member x={x} y={760} d={220} c={TONE[i]} dashed t={springAt(frame, 12 + i * 6, SPRING.smooth) * pulse} />}
            {fill > 0 && <Member x={x} y={760} d={220} c={TONE[i]} n={i + 1} t={fill} badge={springAt(frame, at + 10, SPRING.bouncy)} />}
          </React.Fragment>
        );
      })}
    </>
  );
};

/* ───────── 2. The first knows the language, the second films: two role cards ───────── */

const Corner: React.FC<{ r: number }> = ({ r }) => (
  <div style={{ position: "absolute", width: 40, height: 40, borderColor: O.vivid, borderStyle: "solid", borderWidth: 0, ...(r === 0 ? { left: 0, top: 0, borderLeftWidth: 8, borderTopWidth: 8, borderTopLeftRadius: 14 } : r === 1 ? { right: 0, top: 0, borderRightWidth: 8, borderTopWidth: 8, borderTopRightRadius: 14 } : r === 2 ? { left: 0, bottom: 0, borderLeftWidth: 8, borderBottomWidth: 8, borderBottomLeftRadius: 14 } : { right: 0, bottom: 0, borderRightWidth: 8, borderBottomWidth: 8, borderBottomRightRadius: 14 }) }} />
);
const Roles: React.FC<{ frame: number }> = ({ frame }) => {
  const c1 = pop(frame, F.twoIn + 4, SPRING.smooth);
  const c2 = pop(frame, F.second - 6, SPRING.smooth);
  const bubble = pop(frame, F.lang - 8, SPRING.bouncy);
  const cam = pop(frame, F.film - 10, SPRING.bouncy);
  const rec = Math.floor(frame / 20) % 2 === 0;
  const card: React.CSSProperties = { ...SURFACE, position: "absolute", top: 380, width: 410, height: 760, display: "flex", flexDirection: "column", alignItems: "center", padding: 40, gap: 40 };
  return (
    <>
      <Title text="первый и *второй*" frame={frame} at={[F.twoIn + 2, F.second - 8, F.second]} size={96} />
      <div style={{ ...card, left: 110, ...c1.style }}>
        <div style={{ position: "relative", width: 230, height: 230 }}>
          <Member x={115} y={115} d={230} c={TONE[0]} n={1} />
        </div>
        <div style={{ height: 200, display: "grid", placeItems: "center", ...bubble.style }}>
          <div style={{ padding: "26px 36px", borderRadius: 32, borderBottomLeftRadius: 8, background: O.vivid, ...PARAGRAPH, fontSize: 56, lineHeight: 1, fontWeight: 700, color: "#fff" }}>сәлам</div>
        </div>
        <div style={{ ...PARAGRAPH, fontSize: 52, lineHeight: 1.1, textAlign: "center", marginTop: "auto" }}>
          знает <b style={{ color: O.main }}>язык</b>
        </div>
      </div>
      <div style={{ ...card, right: 110, ...c2.style }}>
        <div style={{ position: "relative", width: 230, height: 230 }}>
          <Member x={115} y={115} d={230} c={TONE[1]} n={2} />
        </div>
        <div style={{ height: 200, display: "grid", placeItems: "center", ...cam.style }}>
          <div style={{ position: "relative", width: 250, height: 170 }}>
            {[0, 1, 2, 3].map((r) => (
              <Corner key={r} r={r} />
            ))}
            <div style={{ position: "absolute", left: 30, top: 30, width: 26, height: 26, borderRadius: 13, background: O.main, opacity: rec ? 1 : 0.25 }} />
            <div style={{ position: "absolute", left: "50%", top: "50%", width: 70, height: 70, marginLeft: -35, marginTop: -35, borderRadius: 35, border: `6px solid ${O.glow}` }} />
          </div>
        </div>
        <div style={{ ...PARAGRAPH, fontSize: 52, lineHeight: 1.1, textAlign: "center", marginTop: "auto" }}>
          <b style={{ color: O.main }}>снимает</b>
        </div>
      </div>
    </>
  );
};

/* ───────── 3. The third always gathers everyone: dots fly in from every side, the counter grows ───────── */

const GUESTS = Array.from({ length: 12 }, (_, i) => {
  const a = (i / 12) * Math.PI * 2 + 0.3;
  return { a, from: { x: 540 + Math.cos(a) * 760, y: 720 + Math.sin(a) * 760 }, at: F.always + 6 + i * 6 + (i % 3) * 4 };
});
const Third: React.FC<{ frame: number }> = ({ frame }) => {
  const arrived = GUESTS.filter((g) => frame >= g.at + 30).length;
  const chip = pop(frame, GUESTS[0].at + 30, SPRING.bouncy);
  return (
    <>
      <Title text="третий всех *собирает*" frame={frame} at={[F.thirdIn + 2, F.everyone, F.gathers]} size={96} />
      {GUESTS.map((g, i) => {
        const t = ease.out(progress(frame, g.at, g.at + 30));
        const to = { x: 540 + Math.cos(g.a) * 250, y: 720 + Math.sin(g.a) * 250 };
        const x = lerp(g.from.x, to.x, t);
        const y = lerp(g.from.y, to.y, t);
        const land = springAt(frame, g.at + 30, SPRING.bouncy);
        return t > 0 ? <div key={i} style={{ position: "absolute", left: x - 34, top: y - 34, width: 68, height: 68, borderRadius: 34, background: i % 3 === 0 ? O.vivid : i % 3 === 1 ? O.glow : O.main, border: "6px solid #fff", transform: `scale(${land > 0 ? 0.9 + 0.1 * Math.min(land, 1.2) : 0.9})` }} /> : null;
      })}
      <Member x={540} y={720} d={300} c={TONE[2]} n={3} t={springAt(frame, F.thirdIn + 4, SPRING.bouncy)} />
      {chip.t > 0 && (
        <div style={{ position: "absolute", left: 640, top: 1020, ...SURFACE, padding: 28, ...NUMBER, fontSize: 64, color: O.main, ...chip.style }}>+{arrived}</div>
      )}
    </>
  );
};

/* ───────── 4. Together: the three gather into a triangle and start talking -> a conversation club ───────── */

const FROM = [{ x: 230, y: 700 }, { x: 540, y: 700 }, { x: 850, y: 700 }];
const TO = [{ x: 540, y: 520 }, { x: 350, y: 820 }, { x: 730, y: 820 }];
const Club: React.FC<{ frame: number }> = ({ frame }) => {
  const join = ease.inOut(progress(frame, F.clubIn + 10, F.already + 10));
  const pts = FROM.map((a, i) => ({ x: lerp(a.x, TO[i].x, join), y: lerp(a.y, TO[i].y, join) }));
  const plate = pop(frame, F.club - 4, SPRING.bouncy);
  const talker = frame >= F.already + 20 ? Math.floor((frame - F.already - 20) / 24) % 3 : -1;
  return (
    <>
      <Title text="вместе это уже *клуб*" frame={frame} at={[F.clubIn + 2, F.clubIn + 14, F.already, F.club - 4]} size={96} />
      <svg width={W} height={1300} style={{ position: "absolute", inset: 0 }}>
        {[0, 1, 2].map((i) => {
          const a = pts[i];
          const b = pts[(i + 1) % 3];
          return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={O.glow} strokeWidth={8} strokeLinecap="round" opacity={join} />;
        })}
      </svg>
      {pts.map((p, i) => (
        <React.Fragment key={i}>
          <Member x={p.x} y={p.y} d={190} c={TONE[i]} n={i + 1} t={springAt(frame, F.clubIn + i * 4, SPRING.smooth)} />
          {talker === i && (
            <div style={{ position: "absolute", left: p.x + 40, top: p.y - 170, ...SURFACE, borderBottomLeftRadius: 6, padding: "22px 26px", display: "flex", gap: 10 }}>
              {[0, 1, 2].map((k) => (
                <div key={k} style={{ width: 16, height: 16, borderRadius: 8, background: O.vivid, transform: `translateY(${-6 * Math.max(0, Math.sin(frame / 5 - k))}px)` }} />
              ))}
            </div>
          )}
        </React.Fragment>
      ))}
      {plate.t > 0 && (
        <div style={{ position: "absolute", top: 1060, left: 0, right: 0, display: "flex", justifyContent: "center", ...plate.style }}>
          <div style={{ transform: "scale(2.2)" }}>
            <GlassPlate bg={PLATE_O}>
              <MessageCircle size={18} strokeWidth={2.2} /> разговорный клуб
            </GlassPlate>
          </div>
        </div>
      )}
    </>
  );
};

/* ───────── 5. No fund, no office, no 100 members: each line gets crossed out ───────── */

const NOPE: { label: React.ReactNode; at: number }[] = [
  { label: "фонд", at: F.fund },
  { label: "офис", at: F.office },
  { label: <><span style={{ ...NUMBER, fontSize: 64 }}>100</span> участников</>, at: F.hundred + 10 },
];
const No: React.FC<{ frame: number }> = ({ frame }) => (
  <>
    <Title text="не *нужен*" frame={frame} at={[F.noIn + 2, F.noIn + 10]} size={110} />
    <div style={{ position: "absolute", top: 440, left: 170, right: 170, ...SURFACE, padding: 50, display: "flex", flexDirection: "column", gap: 44, ...pop(frame, F.noIn + 6, SPRING.smooth).style }}>
      {NOPE.map((r, i) => {
        const p = pop(frame, r.at - 14, SPRING.smooth);
        const line = ease.inOut(progress(frame, r.at + 10, r.at + 26));
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 30, opacity: (p.style.opacity as number) * (1 - 0.5 * line), transform: `${p.style.transform} translateX(${line * 16}px)` }}>
            <div style={{ width: 60, height: 60, borderRadius: 16, border: `6px solid ${GREY}`, flex: "none" }} />
            <div style={{ position: "relative", ...PARAGRAPH, fontSize: 64, lineHeight: 1, color: line > 0.5 ? MUTED : INK, whiteSpace: "nowrap" }}>
              {r.label}
              <div style={{ position: "absolute", left: -8, right: -8, top: "54%", height: 9, borderRadius: 5, background: O.vivid, transform: `scaleX(${line})`, transformOrigin: "0 50%" }} />
            </div>
          </div>
        );
      })}
    </div>
  </>
);

/* ───────── 6. Look around: your contacts, two of them light up as 2 and 3 ───────── */

const PICK = [
  { i: 5, n: 2, at: F.secondQ },
  { i: 10, n: 3, at: F.thirdQ },
];
const Look: React.FC<{ frame: number }> = ({ frame }) => {
  const out = progress(frame, F.who - 20, F.who - 6);
  const scan = progress(frame, F.around, F.secondQ - 6);
  const scanI = Math.floor(scan * 11.99);
  const pos = (i: number) => ({ x: 180 + 75 + (i % 4) * 190, y: 470 + 75 + Math.floor(i / 4) * 190 });
  return (
    <>
      {out < 1 && <Title text="посмотри *вокруг*" frame={frame} at={[F.lookIn + 2, F.around]} size={100} style={{ opacity: 1 - out }} />}
      {out > 0 && <Title text="кто *второй* и *третий*" frame={frame} at={[F.who - 4, F.secondQ, F.thirdQ - 12, F.thirdQ]} size={96} />}
      {Array.from({ length: 12 }, (_, i) => {
        const p = pos(i);
        const pick = PICK.find((k) => k.i === i);
        const on = pick ? springAt(frame, pick.at, SPRING.bouncy) : 0;
        const t = springAt(frame, F.lookIn + 6 + i * 2, SPRING.bouncy);
        return on > 0 ? (
          <Member key={i} x={p.x} y={p.y} d={150 * (1 + 0.12 * Math.min(on, 1))} c={TONE[pick!.n - 1]} n={pick!.n} badge={on} />
        ) : (
          <div key={i} style={{ position: "absolute", left: p.x - 75, top: p.y - 75, width: 150, height: 150, borderRadius: 75, background: LINE, overflow: "hidden", transform: `scale(${t})`, opacity: frame > F.secondQ ? 0.6 : 1 }}>
            <div style={{ position: "absolute", left: 52, top: 30, width: 46, height: 46, borderRadius: 23, background: GREY }} />
            <div style={{ position: "absolute", left: 30, top: 84, width: 90, height: 90, borderRadius: 45, background: GREY }} />
          </div>
        );
      })}
      {scan > 0 && scan < 1 && <div style={{ position: "absolute", left: pos(scanI).x - 90, top: pos(scanI).y - 90, width: 180, height: 180, borderRadius: 90, border: `7px solid ${O.vivid}` }} />}
    </>
  );
};

/* ───────── Composition ───────── */

const SCENES: SceneDef[] = [
  { range: [0, F.twoIn], El: Hook },
  { range: [F.twoIn, F.thirdIn], El: Roles },
  { range: [F.thirdIn, F.clubIn], El: Third },
  { range: [F.clubIn, F.noIn], El: Club },
  { range: [F.noIn, F.lookIn], El: No },
  { range: [F.lookIn, F.duration + 30], El: Look },
];

const SFX: Sfx[] = [
  { src: "sfx/07_CineStrike.wav", from: 2, volume: 0.18 },
  ...SEATS.map((_, i) => ({ src: "sfx2/pop.mp3", from: F.three + i * 10, volume: 0.22 })),
  // scene changes: textures from the SFX/ library (no whoosh)
  { src: "sfx/01_Ripple_Textures.wav", from: F.twoIn - 8, volume: 0.18 },
  { src: "sfx/06_Ripple_Textures_II.wav", from: F.thirdIn - 8, volume: 0.2 },
  { src: "sfx/04_Cyber_Shift.wav", from: F.clubIn - 8, volume: 0.2 },
  { src: "sfx/02_Alienated_Warpes.wav", from: F.noIn - 8, volume: 0.14 },
  { src: "sfx/01_Ripple_Textures.wav", from: F.lookIn - 8, volume: 0.18 },
  // 2. roles
  { src: "sfx2/pop.mp3", from: F.lang - 8, volume: 0.22 },
  { src: "sfx2/click.mp3", from: F.film - 10, volume: 0.22 },
  // 3. guests arrive
  ...GUESTS.filter((_, i) => i % 3 === 0).map((g) => ({ src: "sfx2/pop.mp3", from: g.at + 28, volume: 0.16 })),
  // 4. club
  { src: "sfx2/ding.mp3", from: F.club - 2, volume: 0.22 },
  // 5. crossed out
  ...NOPE.map((r) => ({ src: "sfx2/click.mp3", from: r.at + 10, volume: 0.2 })),
  { src: "sfx/05_Distortion_Glitch.wav", from: F.hundred + 30, volume: 0.04 },
  // 6. second and third found
  { src: "sfx2/pop.mp3", from: F.secondQ, volume: 0.24 },
  { src: "sfx/07_CineStrike.wav", from: F.thirdQ, volume: 0.12 },
];

// All 30 poses of the main set, each at least once; swaps by the meaning of the line, never the same photo twice in a row
const AVATAR_KEYS: AvatarKey[] = [
  // 1. hook: the whole truth, three people
  { at: 0, e: "shush" },
  { at: 40, e: "point-up" },
  { at: 80, e: "explaining" },
  { at: 125, e: "thinking" },
  { at: 170, e: "surprised" },
  { at: 215, e: "victory" },
  // 2. language, filming
  { at: F.twoIn, e: "point-right" },
  { at: 300, e: "smile-up" },
  { at: 340, e: "present-left" },
  { at: 380, e: "delighted" },
  { at: 420, e: "soft-smile" },
  // 3. gathers everyone
  { at: F.thirdIn, e: "laughing" },
  { at: 510, e: "waving" },
  { at: 550, e: "facepalm" },
  { at: 585, e: "clapping" },
  // 4. conversation club
  { at: F.clubIn, e: "heart-hands" },
  { at: 660, e: "hand-on-heart" },
  { at: 700, e: "inspired" },
  { at: 745, e: "thumbs-up" },
  // 5. no fund, office, 100 members
  { at: F.noIn, e: "stop" },
  { at: 835, e: "skeptical" },
  { at: 870, e: "displeased" },
  { at: 905, e: "arms-crossed" },
  { at: 940, e: "shrug" },
  { at: 970, e: "disappointed" },
  // 6. look around
  { at: F.lookIn, e: "dreamy" },
  { at: 1030, e: "listening" },
  { at: 1065, e: "puzzled" },
  { at: 1105, e: "pensive" },
  { at: 1145, e: "point-down" },
  { at: 1195, e: "waving" },
];

const STANCES: StanceKey[] = [
  { at: 0, s: "center" },
  { at: F.twoIn, s: "right" },
  { at: F.thirdIn, s: "left" },
  { at: F.clubIn, s: "right" },
  { at: F.noIn, s: "left" },
  { at: F.lookIn, s: "center" },
];

// Main set photos: scale the wide-framed ones so every photo fills the 540x590 box by height (as in V24)
const SIZE: Record<string, [number, number]> = {
  pensive: [1312, 1199], dreamy: [1293, 1217], displeased: [1254, 1254], surprised: [1280, 1229], waving: [1312, 1199], inspired: [1199, 1312], explaining: [1312, 1199], delighted: [1312, 1199], skeptical: [1312, 1199], laughing: [1385, 1136],
  puzzled: [1152, 1366], disappointed: [1278, 1230], "smile-up": [1199, 1312], thinking: [1190, 1322], "soft-smile": [1218, 1291], "point-up": [1312, 1199], "point-down": [1312, 1199], "present-left": [1312, 1199], "point-right": [1312, 1199], shrug: [1312, 1199],
  "hand-on-heart": [1312, 1199], stop: [1312, 1199], shush: [1312, 1199], clapping: [1278, 1230], "thumbs-up": [1312, 1199], "arms-crossed": [1312, 1199], facepalm: [1312, 1199], "heart-hands": [1312, 1199], victory: [1312, 1199], listening: [1312, 1199],
};
const FIT = Object.fromEntries(Object.entries(SIZE).map(([e, [w, h]]) => [e, Math.max(1, w / h / (540 / 590))])) as Partial<Record<Emotion, number>>;

const Host: React.FC<{ frame: number }> = ({ frame }) => <TatAvatar frame={frame} keys={AVATAR_KEYS} words={WORDS} stances={STANCES} fit={FIT} />;

export const Video30: React.FC = () => (
  <AbsoluteFill style={{ background: "#fff", fontFamily: PARAGRAPH.fontFamily, color: INK }}>
    <ReelShell scenes={SCENES} headlines={[]} vo={VO} sfx={SFX} duration={F.duration} music="v30/music/bed.mp3" musicLevel={[0.045, 0.11]} overlay={Host} bg={BG} />
  </AbsoluteFill>
);
