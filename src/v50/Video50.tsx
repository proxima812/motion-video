import React from "react";
import { AbsoluteFill } from "remotion";
import { UserPlus } from "lucide-react";
import { SPRING, ease, lerp, progress, springAt } from "../stage/motion";
import { ReelShell, count, pop, shake, type SceneDef, type Sfx } from "../kit/reel";
import { TatAvatar, type AvatarKey, type Emotion, type StanceKey } from "../kit/TatAvatar";
import { DotOrbitBg } from "../kit/DotOrbitBg";
import { HEADING, INK, NUMBER, PARAGRAPH, SURFACE } from "../kit/design";
import { GlassPlate } from "../catalog/own/glass";
import { F, VO } from "./timeline";
import { WORDS } from "./words";

// "Мероприятие закончилось. А знакомство?" (@the_tatarverse, RU, main host preset Ahu). ~18.8 s.
// Never leave an event with just a group photo -> you met, laughed, took a picture -> and never met again
// -> community starts with the second meeting -> text the new acquaintance today "coffee?" -> one coffee and you're already friends.
// Own kit only. Palette: denim. Dot Orbit variant 2 (output/bg-variant.txt). Names on screen: Алия, Тимур.
const T = { main: "#2C5A85", vivid: "#3F7DB8", glow: "#A7C6E6", pale: "#EAF2FA" };
const PLATE_DENIM = "linear-gradient(135deg, #3F7DB8, #2C5A85)";
const BG = <DotOrbitBg variant={2} />;
const GRAY = "#E4E8EE";

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

/** A face: eyes look -1..1, mouth: smile -1..1, `laugh` opens the mouth */
const Face: React.FC<{ color: string; size: number; look?: [number, number]; smile?: number; laugh?: number; style?: React.CSSProperties }> = ({ color, size, look = [0, 0], smile = 0.4, laugh = 0, style }) => (
  <div style={{ position: "absolute", width: size, height: size, borderRadius: size / 2, boxSizing: "border-box", background: color, border: `${Math.max(3, size * 0.04)}px solid #fff`, boxShadow: SURFACE.boxShadow, ...style }}>
    {[0.33, 0.58].map((x) => (
      <div key={x} style={{ position: "absolute", left: `${(x + look[0] * 0.05) * 100}%`, top: `${(0.38 + look[1] * 0.05) * 100}%`, width: size * 0.09, height: size * (laugh > 0.5 ? 0.04 : 0.09), borderRadius: size, background: INK }} />
    ))}
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ position: "absolute", left: -size * 0.04, top: -size * 0.04 }}>
      {laugh > 0.05 ? (
        <path d={`M36 64 Q 50 ${64 + 22 * laugh} 64 64 Z`} fill={INK} />
      ) : (
        <path d={`M38 ${68 - smile * 2} Q 50 ${68 + smile * 12} 62 ${68 - smile * 2}`} fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />
      )}
    </svg>
  </div>
);

/** Small coffee cup, side view (drawn) */
const Cup: React.FC<{ frame: number; s?: number }> = ({ frame, s = 1 }) => (
  <svg width={140 * s} height={170 * s} viewBox="0 0 140 170">
    {[40, 68].map((x, i) => (
      <path key={x} d={`M${x} 56 q 12 -14 0 -26 q -12 -12 0 -26`} fill="none" stroke={T.glow} strokeWidth={6} strokeLinecap="round" opacity={0.6 + 0.4 * Math.sin(frame / 8 + i)} />
    ))}
    <path d="M10 70 H100 L 92 150 A 10 10 0 0 1 82 160 H 28 A 10 10 0 0 1 18 150 Z" fill={T.vivid} />
    <rect x={14} y={92} width={82} height={20} fill={T.pale} />
    <path d="M100 86 C 128 86 128 128 96 128" fill="none" stroke={T.vivid} strokeWidth={9} />
  </svg>
);

/* ───────── 1. Hook: a group polaroid develops - and that's all you leave with ───────── */

const GROUP = [
  { x: 130, y: 110, c: T.glow },
  { x: 230, y: 90, c: T.vivid },
  { x: 330, y: 110, c: T.glow },
  { x: 80, y: 240, c: T.vivid },
  { x: 180, y: 230, c: T.main },
  { x: 280, y: 230, c: T.glow },
  { x: 380, y: 240, c: T.vivid },
];
const Polaroid: React.FC<{ frame: number; dev: number; w?: number }> = ({ frame, dev, w = 520 }) => {
  const k = w / 520;
  return (
    <div style={{ width: w, height: 620 * k, background: "#fff", borderRadius: 18 * k, boxShadow: SURFACE.boxShadow, padding: 30 * k, boxSizing: "border-box" }}>
      <div style={{ position: "relative", width: 460 * k, height: 440 * k, borderRadius: 8 * k, background: `linear-gradient(180deg, ${T.pale}, ${T.glow})`, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "#D9DEE5", opacity: 1 - dev }} />
        {GROUP.map((g, i) => (
          <Face key={i} color={g.c} size={110 * k} smile={0.8} look={[0, 0.2]} style={{ left: (g.x - 55) * k, top: g.y * k, opacity: dev, boxShadow: "none", transform: `translateY(${Math.sin(frame / 9 + i) * 2}px)` }} />
        ))}
      </div>
    </div>
  );
};
const Hook: React.FC<{ frame: number }> = ({ frame }) => {
  const first = fadeOut(frame, F.event - 8);
  const print = ease.out(progress(frame, 4, 60));
  const dev = ease.inOut(progress(frame, F.common - 10, F.photo + 20));
  const flash = 1 - progress(frame, F.photo, F.photo + 14);
  return (
    <>
      {first > 0 && <Title text="тебе никогда *не стоит*" frame={frame} at={[-30, -26, F.never + 30, F.leave - 18]} size={88} style={{ opacity: first }} />}
      {frame >= F.event - 8 && <Title text="уходить *с общим фото*" frame={frame} at={[F.event - 4, F.common - 20, F.common, F.photo]} size={88} />}
      {/* the camera slot, the polaroid comes out of it */}
      <div style={{ position: "absolute", left: 230, top: 400, width: 620, height: 40, borderRadius: 20, background: T.main }} />
      <div style={{ position: "absolute", left: 270, top: 420, width: 540, height: 760, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 10, top: lerp(-640, 40, print), transform: `rotate(${(1 - print) * 0 + Math.min(1, progress(frame, F.photo + 20, F.photo + 40)) * -3}deg)` }}>
          <Polaroid frame={frame} dev={dev} />
        </div>
      </div>
      {frame >= F.photo && <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: flash * 0.85 }} />}
    </>
  );
};

/* ───────── 2. You met, laughed, took a picture: name tags, a laugh, a flash in the viewfinder ───────── */

const Met: React.FC<{ frame: number }> = ({ frame }) => {
  const a = springAt(frame, F.metIn + 4, SPRING.bouncy);
  const b = springAt(frame, F.met + 6, SPRING.bouncy);
  const meet = ease.inOut(progress(frame, F.met, F.met + 30));
  const laugh = progress(frame, F.laughed - 4, F.laughed + 4) * (1 - progress(frame, F.took - 10, F.took));
  const shakeY = laugh > 0 ? Math.abs(Math.sin(frame / 3)) * 14 : 0;
  const view = pop(frame, F.took - 6, SPRING.smooth);
  const flash = frame >= F.shot ? 1 - progress(frame, F.shot, F.shot + 16) : 0;
  return (
    <>
      <Title text="познакомились посмеялись *снимок*" frame={frame} at={[F.met, F.laughed, F.shot]} size={68} />
      <div style={{ position: "absolute", left: lerp(160, 260, meet), top: 640 - shakeY, transform: `scale(${a})` }}>
        <Face color={T.vivid} size={240} look={[1, 0]} smile={0.6} laugh={laugh} style={{ position: "relative" }} />
        <div style={{ marginTop: 26, display: "flex", justifyContent: "center", width: 240 }}>
          <div style={{ ...SURFACE, borderRadius: 18, padding: "14px 28px", ...PARAGRAPH, fontWeight: 700, fontSize: 46, lineHeight: 1, color: T.main }}>Алия</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: lerp(680, 580, meet), top: 640 - shakeY * 0.8, transform: `scale(${b})` }}>
        <Face color={T.glow} size={240} look={[-1, 0]} smile={0.6} laugh={laugh} style={{ position: "relative" }} />
        <div style={{ marginTop: 26, display: "flex", justifyContent: "center", width: 240 }}>
          <div style={{ ...SURFACE, borderRadius: 18, padding: "14px 28px", ...PARAGRAPH, fontWeight: 700, fontSize: 46, lineHeight: 1, color: T.main }}>Тимур</div>
        </div>
      </div>
      {/* viewfinder corners */}
      {view.t > 0 && (
        <svg width={1080} height={1300} style={{ position: "absolute", inset: 0, ...view.style }}>
          {[
            [170, 520, 1, 1],
            [910, 520, -1, 1],
            [170, 1060, 1, -1],
            [910, 1060, -1, -1],
          ].map(([x, y, dx, dy], i) => (
            <path key={i} d={`M${x} ${y + dy * 90} V ${y} H ${x + dx * 90}`} fill="none" stroke={T.main} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
          ))}
          <circle cx={540} cy={790} r={10} fill={T.vivid} opacity={0.6} />
        </svg>
      )}
      {flash > 0 && <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: flash * 0.9 }} />}
    </>
  );
};

/* ───────── 3. And never met again: they drift apart, the thread snaps, days keep counting ───────── */

const Apart: React.FC<{ frame: number }> = ({ frame }) => {
  const drift = ease.inOut(progress(frame, F.neverIn + 10, F.meet + 30));
  const snap = progress(frame, F.again + 10, F.again + 14);
  const days = count(frame, F.neverIn + 10, F.meet + 40, 1, 365, ease.inOut);
  const lx = lerp(400, 200, drift);
  const rx = lerp(680, 880, drift);
  const sx = shake(frame, F.meet, 10, 24);
  return (
    <>
      <Title text="ни разу не *встретились*" frame={frame} at={[F.again, F.again + 6, F.meet - 6, F.meet]} size={84} />
      <svg width={1080} height={1300} style={{ position: "absolute", inset: 0 }}>
        {snap < 1 ? (
          <line x1={lx} y1={600} x2={rx} y2={600} stroke={T.glow} strokeWidth={6} strokeDasharray="4 16" strokeLinecap="round" />
        ) : (
          <>
            <path d={`M${lx} 600 Q ${lx + 80} ${640 + 40 * drift} ${lx + 120} ${680 + 60 * drift}`} fill="none" stroke={T.glow} strokeWidth={6} strokeDasharray="4 16" strokeLinecap="round" />
            <path d={`M${rx} 600 Q ${rx - 80} ${640 + 40 * drift} ${rx - 120} ${680 + 60 * drift}`} fill="none" stroke={T.glow} strokeWidth={6} strokeDasharray="4 16" strokeLinecap="round" />
          </>
        )}
      </svg>
      <Face color={T.vivid} size={170} look={[-1, 0]} smile={lerp(0.6, -0.2, drift)} style={{ left: lx - 85, top: 515 }} />
      <Face color={T.glow} size={170} look={[1, 0]} smile={lerp(0.6, -0.2, drift)} style={{ left: rx - 85, top: 515 }} />
      <div style={{ position: "absolute", left: 250, right: 250, top: 790, height: 380, ...SURFACE, borderRadius: 40, overflow: "hidden", transform: `translateX(${sx}px)`, ...pop(frame, F.neverIn + 6, SPRING.smooth).style }}>
        <div style={{ height: 90, background: T.vivid }} />
        {[150, 230].map((x) => (
          <div key={x} style={{ position: "absolute", left: x, top: -20, width: 22, height: 70, borderRadius: 11, background: T.main, border: "5px solid #fff" }} />
        ))}
        <div style={{ position: "absolute", left: 0, right: 0, top: 120, textAlign: "center", ...NUMBER, fontSize: 150, color: T.main }}>{days}</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 290, textAlign: "center", ...PARAGRAPH, fontSize: 50, lineHeight: 1 }}>дней</div>
      </div>
    </>
  );
};

/* ───────── 4. A community starts with the second meeting: a big «2», faces gather into a ring ───────── */

const RING = 8;
const Second: React.FC<{ frame: number }> = ({ frame }) => {
  const two = springAt(frame, F.second - 4, SPRING.bouncy);
  const one = springAt(frame, F.commIn + 6, SPRING.smooth);
  const gather = ease.inOut(progress(frame, F.meeting - 10, F.meeting + 30));
  const CX = 540;
  const CY = 800;
  return (
    <>
      <Title text="*сообщество*" frame={frame} at={F.commIn + 2} size={100} />
      <Title text="со второй *встречи*" frame={frame} at={[F.second - 8, F.second, F.meeting]} size={84} top={290} />
      <div style={{ position: "absolute", left: CX - 160, top: CY - 160, width: 320, height: 320, borderRadius: 160, ...SURFACE, display: "grid", placeItems: "center", transform: `scale(${Math.min(one, 1)})` }}>
        <span style={{ ...NUMBER, fontSize: 220, color: two > 0.5 ? T.main : GRAY, transform: `scale(${two > 0 ? Math.min(two, 1.15) : 1})` }}>{two > 0.5 ? "2" : "1"}</span>
      </div>
      {Array.from({ length: RING }, (_, i) => {
        const a = (i / RING) * Math.PI * 2 - Math.PI / 2;
        const far = [
          [160, 480], [920, 520], [150, 900], [930, 1000], [260, 1150], [820, 1150], [540, 450], [540, 1170],
        ][i];
        const tx = CX + Math.cos(a) * 300;
        const ty = CY + Math.sin(a) * 300;
        const x = lerp(far[0], tx, gather);
        const y = lerp(far[1], ty, gather);
        const p = springAt(frame, F.starts + i * 4, SPRING.bouncy);
        return <Face key={i} color={[T.glow, T.vivid, T.main][i % 3]} size={110} smile={lerp(0.2, 0.8, gather)} look={[Math.sign(CX - x) * 0.8, Math.sign(CY - y) * 0.8]} style={{ left: x - 55, top: y - 55, transform: `scale(${p})` }} />;
      })}
      <svg width={1080} height={1300} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <circle cx={CX} cy={CY} r={300} fill="none" stroke={T.glow} strokeWidth={6} strokeDasharray="6 18" strokeLinecap="round" opacity={progress(gather, 0.8, 1)} />
      </svg>
    </>
  );
};

/* ───────── 5. Text the new acquaintance today: "пойдем на кофе" is sent, Тимур answers ───────── */

const MSG = "пойдем на кофе";
const Text: React.FC<{ frame: number }> = ({ frame }) => {
  const card = pop(frame, F.textIn + 6, SPRING.smooth);
  const typed = Math.round(lerp(0, MSG.length, progress(frame, F.go - 10, F.coffee + 6)));
  const sent = springAt(frame, F.coffee + 10, SPRING.bouncy);
  const reply = springAt(frame, F.coffee + 32, SPRING.bouncy);
  return (
    <>
      <Title text="напиши *сегодня*" frame={frame} at={[F.textIn + 2, F.today]} size={100} />
      <div style={{ position: "absolute", left: 150, right: 150, top: 400, height: 820, ...SURFACE, borderRadius: 48, overflow: "hidden", ...card.style }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24, padding: 34, borderBottom: `3px solid ${T.pale}` }}>
          <Face color={T.glow} size={96} smile={0.5} style={{ position: "relative", boxShadow: "none" }} />
          <span style={{ ...PARAGRAPH, fontWeight: 700, fontSize: 54, lineHeight: 1 }}>Тимур</span>
        </div>
        {sent > 0 && (
          <div style={{ position: "absolute", right: 34, top: 230, padding: "26px 36px", borderRadius: "36px 36px 8px 36px", background: T.vivid, ...PARAGRAPH, color: "#fff", fontSize: 52, lineHeight: 1.1, transform: `scale(${Math.min(sent, 1.05)})`, transformOrigin: "100% 100%" }}>{MSG}</div>
        )}
        {reply > 0 && (
          <div style={{ position: "absolute", left: 34, top: 390, padding: "26px 36px", borderRadius: "36px 36px 36px 8px", background: T.pale, ...PARAGRAPH, fontWeight: 700, fontSize: 52, lineHeight: 1.1, color: T.main, transform: `scale(${Math.min(reply, 1.05)})`, transformOrigin: "0 100%" }}>давай</div>
        )}
        {/* input field */}
        <div style={{ position: "absolute", left: 34, right: 34, bottom: 34, height: 120, borderRadius: 60, background: T.pale, display: "flex", alignItems: "center", padding: "0 40px", ...PARAGRAPH, fontSize: 50, lineHeight: 1 }}>
          {sent > 0 ? "" : MSG.slice(0, typed)}
          <span style={{ display: "inline-block", width: 4, height: 50, marginLeft: 4, background: T.vivid, opacity: Math.floor(frame / 12) % 2 }} />
        </div>
      </div>
    </>
  );
};

/* ───────── 6. One coffee and you're already friends: the cups clink, the two faces come together ───────── */

const Friends: React.FC<{ frame: number }> = ({ frame }) => {
  const cups = ease.inOut(progress(frame, F.oneIn + 6, F.coffee2 + 6));
  const clink = springAt(frame, F.coffee2 + 4, SPRING.bouncy);
  const close = ease.inOut(progress(frame, F.you - 10, F.own));
  const plate = pop(frame, F.own + 4, SPRING.bouncy);
  const tilt = Math.min(clink, 1) * 10;
  return (
    <>
      <Title text="один *кофе*" frame={frame} at={[F.oneIn + 2, F.coffee2]} size={96} />
      <Title text="и вы *уже свои*" frame={frame} at={[F.you - 8, F.you, F.already, F.own]} size={84} top={290} />
      <Face color={T.vivid} size={220} look={[1, 0]} smile={lerp(0.5, 0.9, close)} style={{ left: lerp(130, 270, close), top: 520 }} />
      <Face color={T.glow} size={220} look={[-1, 0]} smile={lerp(0.5, 0.9, close)} style={{ left: lerp(730, 590, close), top: 520 }} />
      <div style={{ position: "absolute", left: lerp(160, 370, cups), top: 820, transformOrigin: "50% 100%", transform: `rotate(${tilt}deg)` }}>
        <Cup frame={frame} s={1.4} />
      </div>
      <div style={{ position: "absolute", left: lerp(720, 512, cups), top: 820, transformOrigin: "50% 100%", transform: `scaleX(-1) rotate(${tilt}deg)` }}>
        <Cup frame={frame} s={1.4} />
      </div>
      {clink > 0 &&
        [0, 1, 2, 3, 4].map((i) => {
          const a = -Math.PI / 2 + (i - 2) * 0.45;
          const r = 60 + 70 * Math.min(1, clink);
          return <div key={i} style={{ position: "absolute", left: 540 + Math.cos(a) * r - 6, top: 840 + Math.sin(a) * r - 18, width: 12, height: 36, borderRadius: 6, background: T.glow, transform: `rotate(${(a * 180) / Math.PI + 90}deg)`, opacity: 1 - progress(frame, F.coffee2 + 20, F.coffee2 + 40) }} />;
        })}
      {plate.t > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 1130, display: "flex", justifyContent: "center", ...plate.style }}>
          <div style={{ transform: "scale(2.2)" }}>
            <GlassPlate bg={PLATE_DENIM}>
              <UserPlus size={20} strokeWidth={2.2} /> +1 друг
            </GlassPlate>
          </div>
        </div>
      )}
    </>
  );
};

/* ───────── Composition ───────── */

const SCENES: SceneDef[] = [
  { range: [0, F.metIn], El: Hook },
  { range: [F.metIn, F.neverIn], El: Met },
  { range: [F.neverIn, F.commIn], El: Apart },
  { range: [F.commIn, F.textIn], El: Second },
  { range: [F.textIn, F.oneIn], El: Text },
  { range: [F.oneIn, F.duration + 30], El: Friends },
];

const SFX: Sfx[] = [
  { src: "sfx/07_CineStrike.wav", from: 2, volume: 0.18 },
  { src: "sfx2/click.mp3", from: F.photo - 2, volume: 0.24 },
  // scene changes: textures from the SFX/ library (no whoosh)
  { src: "sfx/01_Ripple_Textures.wav", from: F.metIn - 8, volume: 0.18 },
  { src: "sfx/04_Cyber_Shift.wav", from: F.neverIn - 8, volume: 0.2 },
  { src: "sfx/06_Ripple_Textures_II.wav", from: F.commIn - 8, volume: 0.2 },
  { src: "sfx/02_Alienated_Warpes.wav", from: F.textIn - 8, volume: 0.14 },
  { src: "sfx/01_Ripple_Textures.wav", from: F.oneIn - 8, volume: 0.18 },
  // 2. met, laughed, the shot
  { src: "sfx2/pop.mp3", from: F.met + 6, volume: 0.2 },
  { src: "sfx2/pop.mp3", from: F.laughed, volume: 0.16 },
  { src: "sfx2/click.mp3", from: F.shot - 2, volume: 0.26 },
  // 3. the thread snaps
  { src: "sfx/05_Distortion_Glitch.wav", from: F.again + 10, volume: 0.04 },
  { src: "sfx/03_Basscrack.wav", from: F.meet, volume: 0.07 },
  // 4. the 2, the ring
  { src: "sfx2/pop.mp3", from: F.second - 4, volume: 0.22 },
  { src: "sfx2/ding.mp3", from: F.meeting + 26, volume: 0.18 },
  // 5. send, reply
  { src: "sfx2/click.mp3", from: F.coffee + 10, volume: 0.2 },
  { src: "sfx2/pop.mp3", from: F.coffee + 32, volume: 0.22 },
  // 6. clink, friends
  { src: "sfx2/ding.mp3", from: F.coffee2 + 4, volume: 0.2 },
  { src: "sfx2/pop.mp3", from: F.own + 4, volume: 0.22 },
  { src: "sfx/07_CineStrike.wav", from: F.own + 10, volume: 0.1 },
];

// All 30 poses of the main set, each at least once; never the same photo twice in a row
const AVATAR_KEYS: AvatarKey[] = [
  // 1. hook: never leave with just a photo
  { at: 0, e: "stop" },
  { at: 40, e: "explaining" },
  { at: 85, e: "skeptical" },
  { at: 130, e: "point-down" },
  { at: 175, e: "displeased" },
  { at: 215, e: "disappointed" },
  // 2. met, laughed, took a picture
  { at: F.metIn, e: "waving" },
  { at: 300, e: "delighted" },
  { at: 345, e: "laughing" },
  { at: 390, e: "present-left" },
  { at: 420, e: "smile-up" },
  // 3. never again
  { at: F.neverIn, e: "pensive" },
  { at: 480, e: "arms-crossed" },
  { at: 510, e: "shrug" },
  { at: 540, e: "facepalm" },
  { at: 570, e: "puzzled" },
  // 4. the second meeting
  { at: F.commIn, e: "thinking" },
  { at: 640, e: "point-up" },
  { at: 685, e: "inspired" },
  { at: 725, e: "hand-on-heart" },
  // 5. text today
  { at: F.textIn, e: "point-right" },
  { at: 805, e: "listening" },
  { at: 840, e: "shush" },
  { at: 870, e: "dreamy" },
  { at: 900, e: "surprised" },
  { at: 930, e: "thumbs-up" },
  // 6. already friends
  { at: F.oneIn, e: "heart-hands" },
  { at: 995, e: "soft-smile" },
  { at: 1030, e: "clapping" },
  { at: 1070, e: "victory" },
];

const STANCES: StanceKey[] = [
  { at: 0, s: "center" },
  { at: F.metIn, s: "right" },
  { at: F.neverIn, s: "left" },
  { at: F.commIn, s: "right" },
  { at: F.textIn, s: "left" },
  { at: F.oneIn, s: "center" },
];

// Main set photos: scale the wide-framed ones so every photo fills the 540x590 box by height (same as V38)
const SIZE: Record<string, [number, number]> = {
  pensive: [1312, 1199], dreamy: [1293, 1217], displeased: [1254, 1254], surprised: [1280, 1229], waving: [1312, 1199], inspired: [1199, 1312], explaining: [1312, 1199], delighted: [1312, 1199], skeptical: [1312, 1199], laughing: [1385, 1136],
  puzzled: [1152, 1366], disappointed: [1278, 1230], "smile-up": [1199, 1312], thinking: [1190, 1322], "soft-smile": [1218, 1291], "point-up": [1312, 1199], "point-down": [1312, 1199], "present-left": [1312, 1199], "point-right": [1312, 1199], shrug: [1312, 1199],
  "hand-on-heart": [1312, 1199], stop: [1312, 1199], shush: [1312, 1199], clapping: [1278, 1230], "thumbs-up": [1312, 1199], "arms-crossed": [1312, 1199], facepalm: [1312, 1199], "heart-hands": [1312, 1199], victory: [1312, 1199], listening: [1312, 1199],
};
const FIT = Object.fromEntries(Object.entries(SIZE).map(([e, [w, h]]) => [e, Math.max(1, w / h / (540 / 590))])) as Partial<Record<Emotion, number>>;

const Host: React.FC<{ frame: number }> = ({ frame }) => <TatAvatar frame={frame} keys={AVATAR_KEYS} words={WORDS} stances={STANCES} fit={FIT} />;

export const Video50: React.FC = () => (
  <AbsoluteFill style={{ background: "#fff", fontFamily: PARAGRAPH.fontFamily, color: INK }}>
    <ReelShell scenes={SCENES} headlines={[]} vo={VO} sfx={SFX} duration={F.duration} music="v50/music/bed.mp3" musicLevel={[0.045, 0.11]} overlay={Host} bg={BG} />
  </AbsoluteFill>
);
