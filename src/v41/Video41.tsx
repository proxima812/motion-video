import React from "react";
import { AbsoluteFill } from "remotion";
import { BadgeCheck, MessageCircle } from "lucide-react";
import { SPRING, ease, lerp, progress, springAt } from "../stage/motion";
import { ReelShell, pop, shake, type SceneDef, type Sfx } from "../kit/reel";
import { TatAvatar, type AvatarKey, type Emotion, type StanceKey } from "../kit/TatAvatar";
import { DotOrbitBg } from "../kit/DotOrbitBg";
import { HEADING, INK, PARAGRAPH, SURFACE } from "../kit/design";
import { GlassPlate } from "../catalog/own/glass";
import { F, VO } from "./timeline";
import { WORDS } from "./words";

// "Имя без сокращений" (@the_tatarverse, RU, host preset 2 Alicja). 20.9 s.
// Don't shorten your name for others' comfort -> Ильдар became Дима, Гульнара became Галя -> a name has a meaning (Гульнара = pomegranate flower), it was chosen for you -> do you know yours -> ask your parents, write name + meaning -> let them call you by your real name.
// Own kit only. Palette: coral rose (identity, warmth). Dot Orbit variant 5 (output/bg-variant.txt).
const T = { main: "#B23A48", vivid: "#E05565", glow: "#F6B3BA", pale: "#FDECEE" };
const PLATE_CORAL = "linear-gradient(135deg, #E05565, #B23A48)";
const BG = <DotOrbitBg variant={5} />;
const GRAY = "#ECE5E7";
const GRAY2 = "#F4EFF0";

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

/** Name badge (sticker with a colored band); `cut` 0..1 drops the tail "нара", negative = it flies back in */
const Badge: React.FC<{ frame: number; tail: { x: number; y: number; r: number; o: number }; scissors?: number; glow?: number }> = ({ frame, tail, scissors = 0, glow = 0 }) => {
  const open = scissors > 0 ? Math.abs(Math.sin(frame / 4)) * 18 * (scissors < 1 ? 1 : 0) : 18;
  return (
    <div style={{ ...SURFACE, width: 820, borderRadius: 40, overflow: "visible", position: "relative", boxShadow: `${SURFACE.boxShadow}${glow ? `, 0 0 ${60 * glow}px ${T.glow}` : ""}` }}>
      <div style={{ height: 110, borderRadius: "40px 40px 0 0", background: `linear-gradient(90deg, ${T.vivid}, ${T.main})`, display: "flex", alignItems: "center", justifyContent: "center", gap: 18 }}>
        {[0, 1, 2].map((k) => (
          <div key={k} style={{ width: k === 1 ? 160 : 60, height: 18, borderRadius: 9, background: "rgba(255,255,255,0.75)" }} />
        ))}
      </div>
      <div style={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center", ...PARAGRAPH, fontSize: 140, lineHeight: 1, fontWeight: 700, color: T.main }}>
        <span>Гуль</span>
        <span style={{ position: "relative", display: "inline-block", transform: `translate(${tail.x}px, ${tail.y}px) rotate(${tail.r}deg)`, opacity: tail.o }}>
          нара
        </span>
        {scissors > 0 && (
          <svg width={280} height={280} viewBox="-100 -100 200 200" style={{ position: "absolute", left: 410 - 140, top: 110 + lerp(-80, 300, Math.min(1, scissors)) - 140, transform: "rotate(90deg)" }}>
            <g transform={`rotate(${-open / 2})`}>
              <path d="M-10 -9 L96 -3 L96 3 L-10 9 Z" fill={INK} />
              <circle cx={-48} cy={-22} r={26} fill="#fff" stroke={T.vivid} strokeWidth={12} />
            </g>
            <g transform={`rotate(${open / 2})`}>
              <path d="M-10 -9 L96 -3 L96 3 L-10 9 Z" fill="#5A4E6E" />
              <circle cx={-48} cy={22} r={26} fill="#fff" stroke={T.main} strokeWidth={12} />
            </g>
            <circle r={8} fill={T.glow} />
          </svg>
        )}
      </div>
    </div>
  );
};

/* ───────── 1. Hook: scissors cut the name badge, the tail falls off ───────── */

const Hook: React.FC<{ frame: number }> = ({ frame }) => {
  const first = fadeOut(frame, F.so - 14);
  const card = pop(frame, 6, SPRING.smooth);
  const sc = progress(frame, F.cut - 4, F.cut + 34);
  const fall = ease.in(progress(frame, F.cut + 30, F.cut + 80));
  const s = shake(frame, F.easier, 10, 18);
  return (
    <>
      {first > 0 && <Title text="не стоит *сокращать* имя" frame={frame} at={[F.not - 6, F.should, F.cut, F.name]} size={96} style={{ opacity: first }} />}
      {frame >= F.so - 8 && <Title text="чтобы другим было *удобнее*" frame={frame} at={[F.so - 4, F.others, F.was, F.easier]} size={92} />}
      <div style={{ position: "absolute", left: 130, top: 520, ...card.style, transform: `${card.style.transform} translateX(${s}px)` }}>
        <Badge frame={frame} scissors={sc > 0 && sc < 1 ? sc : 0} tail={{ x: fall * 60, y: fall * 620, r: fall * 38, o: 1 - progress(frame, F.cut + 70, F.cut + 90) }} />
      </div>
    </>
  );
};

/* ───────── 2. Ильдар -> Дима, Гульнара -> Галя: split-flap boards flip the names ───────── */

const Flap: React.FC<{ frame: number; from: string; to: string; at: number; n: number }> = ({ frame, from, to, at, n }) => (
  <div style={{ display: "flex", gap: 10 }}>
    {Array.from({ length: n }, (_, i) => {
      const p = progress(frame, at + i * 3, at + i * 3 + 10);
      const ch = (p < 0.5 ? from[i] : to[i]) ?? "";
      const k = Math.abs(Math.cos(p * Math.PI));
      const on = p >= 0.5;
      return (
        <div key={i} style={{ width: on && i >= to.length ? 96 * (1 - progress(frame, at + n * 3 + 6, at + n * 3 + 18)) : 96, marginLeft: on && i >= to.length ? -10 * progress(frame, at + n * 3 + 6, at + n * 3 + 18) : 0, opacity: on && i >= to.length ? 1 - progress(frame, at + n * 3, at + n * 3 + 12) : 1, height: 136, borderRadius: 16, background: on ? T.main : INK, display: "grid", placeItems: "center", position: "relative", overflow: "hidden" }}>
          <span style={{ ...PARAGRAPH, fontSize: 84, lineHeight: 1, fontWeight: 700, color: "#fff", transform: `scaleY(${k})` }}>{ch}</span>
          <div style={{ position: "absolute", left: 0, right: 0, top: 67, height: 3, background: "rgba(255,255,255,0.18)" }} />
        </div>
      );
    })}
  </div>
);

const Swap: React.FC<{ frame: number }> = ({ frame }) => {
  const r1 = pop(frame, F.ildar - 4, SPRING.smooth);
  const r2 = pop(frame, F.gulnara - 8, SPRING.smooth);
  const ask = springAt(frame, F.asked - 6, SPRING.bouncy);
  return (
    <>
      {frame >= F.nobody - 10 && <Title text="никто даже *не спросил*" frame={frame} at={[F.nobody - 6, F.even, F.asked - 4, F.asked]} size={92} />}
      <div style={{ position: "absolute", left: 0, right: 0, top: 440, display: "flex", justifyContent: "center", ...r1.style }}>
        <div style={{ ...SURFACE, padding: 34 }}>
          <Flap frame={frame} from="Ильдар" to="Дима" at={F.dima - 10} n={6} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 700, display: "flex", justifyContent: "center", ...r2.style }}>
        <div style={{ ...SURFACE, padding: 34, transform: "scale(0.86)" }}>
          <Flap frame={frame} from="Гульнара" to="Галя" at={F.galya - 10} n={8} />
        </div>
      </div>
      {/* the empty "were you asked" checkbox, never ticked */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 990, display: "flex", justifyContent: "center", opacity: Math.min(1, ask * 2), transform: `scale(${ask})` }}>
        <div style={{ ...SURFACE, borderRadius: 30, padding: 30, display: "flex", alignItems: "center", gap: 26 }}>
          <div style={{ width: 70, height: 70, borderRadius: 16, border: `6px solid ${T.glow}`, boxSizing: "border-box" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ width: 260, height: 20, borderRadius: 10, background: GRAY }} />
            <div style={{ width: 170, height: 16, borderRadius: 8, background: GRAY2 }} />
          </div>
        </div>
      </div>
    </>
  );
};

/* ───────── 3. A name has a meaning: a pomegranate flower blooms; it was chosen for you: one name circled on a shortlist ───────── */

const Flower: React.FC<{ t: number; frame: number }> = ({ t, frame }) => (
  <svg width={360} height={360} viewBox="-180 -180 360 360">
    <g transform={`rotate(${frame * 0.2})`}>
      {Array.from({ length: 6 }, (_, i) => {
        const k = Math.max(0, Math.min(1, t * 1.6 - i * 0.1));
        return <ellipse key={i} cx={0} cy={-80 * k} rx={44 * k} ry={80 * k} fill={i % 2 ? T.vivid : T.main} transform={`rotate(${i * 60})`} opacity={0.92} />;
      })}
    </g>
    <circle r={50 * Math.min(1, t * 1.4)} fill={T.glow} />
    {Array.from({ length: 7 }, (_, i) => {
      const a = (i / 7) * Math.PI * 2;
      return <circle key={i} cx={Math.cos(a) * 24 * t} cy={Math.sin(a) * 24 * t} r={7 * Math.min(1, t)} fill={T.main} />;
    })}
  </svg>
);

const Meaning: React.FC<{ frame: number }> = ({ frame }) => {
  const outA = progress(frame, F.chosen - 14, F.chosen - 2);
  const bloom = ease.out(progress(frame, F.meaning - 20, F.meaning + 30));
  const nm = pop(frame, F.nameHas - 4, SPRING.smooth);
  const chip = pop(frame, F.meaning + 4, SPRING.bouncy);
  const list = pop(frame, F.chosen - 4, SPRING.smooth);
  const circle = ease.inOut(progress(frame, F.forYou - 6, F.you + 14));
  const heart = springAt(frame, F.you + 10, SPRING.bouncy);
  return (
    <>
      {outA < 1 && (
        <div style={{ opacity: 1 - outA, filter: `blur(${outA * 10}px)` }}>
          <Title text="у имени есть *смысл*" frame={frame} at={[F.meanIn + 2, F.nameHas, F.meaning - 10, F.meaning]} size={96} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 410, display: "flex", justifyContent: "center" }}>
            <Flower t={bloom} frame={frame} />
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 800, textAlign: "center", ...PARAGRAPH, fontSize: 110, lineHeight: 1, fontWeight: 700, color: T.main, ...nm.style }}>Гульнара</div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 960, display: "flex", justifyContent: "center", ...chip.style }}>
            <div style={{ ...SURFACE, borderRadius: 50, padding: "28px 50px", ...PARAGRAPH, fontSize: 56, lineHeight: 1 }}>
              цветок <b style={{ color: T.main }}>граната</b>
            </div>
          </div>
        </div>
      )}
      {list.t > 0 && (
        <>
          <Title text="выбирали *для тебя*" frame={frame} at={[F.chosen, F.forYou, F.you]} size={100} />
          <div style={{ position: "absolute", left: 190, right: 190, top: 450, ...list.style }}>
            <div style={{ ...SURFACE, padding: 50, display: "flex", flexDirection: "column", gap: 44, position: "relative" }}>
              {[260, 330, 220, 280].map((w, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 26, opacity: i === 1 ? 1 : 0.55 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 17, background: i === 1 ? T.vivid : GRAY, flex: "none" }} />
                  <div style={{ width: w, height: 26, borderRadius: 13, background: i === 1 ? T.main : GRAY }} />
                </div>
              ))}
              <svg width={600} height={170} viewBox="0 0 600 170" style={{ position: "absolute", left: 0, top: 70 }}>
                <ellipse cx={270} cy={85} rx={250} ry={62} fill="none" stroke={T.vivid} strokeWidth={8} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - circle} transform="rotate(-3 270 85)" />
              </svg>
              <svg width={90} height={80} viewBox="0 0 90 80" style={{ position: "absolute", right: 14, top: 72, transform: `scale(${heart})`, opacity: Math.min(1, heart * 2) }}>
                <path d="M45 76 C 10 50 0 34 0 20 C 0 6 12 0 22 0 C 32 0 40 6 45 14 C 50 6 58 0 68 0 C 78 0 90 6 90 20 C 90 34 80 50 45 76 Z" fill={T.vivid} />
              </svg>
            </div>
          </div>
        </>
      )}
    </>
  );
};

/* ───────── 4. Do you know what your name means: a magnifier searches a blank name card ───────── */

const Know: React.FC<{ frame: number }> = ({ frame }) => {
  const card = pop(frame, F.knowIn + 4, SPRING.smooth);
  const sweep = (frame - F.knowIn) / 40;
  const mx = 540 + Math.sin(sweep) * 240;
  const my = 760 + Math.sin(sweep * 2) * 90;
  const slot = frame > F.nameQ ? 0.5 + 0.5 * Math.sin((frame - F.nameQ) / 6) : 0;
  return (
    <>
      <Title text="что значит *твое имя*" frame={frame} at={[F.what, F.means, F.yourName, F.nameQ]} size={96} />
      <div style={{ position: "absolute", left: 140, right: 140, top: 450, ...card.style }}>
        <div style={{ ...SURFACE, padding: 50, display: "flex", flexDirection: "column", gap: 40 }}>
          <div style={{ height: 150, borderRadius: 30, border: `6px dashed ${T.glow}`, background: slot ? T.pale : "#fff", boxShadow: `0 0 0 ${12 * slot}px ${T.pale}` }} />
          {[620, 520, 580].map((w, i) => (
            <div key={i} style={{ width: w, maxWidth: "100%", height: 24, borderRadius: 12, background: GRAY, filter: "blur(3px)" }} />
          ))}
        </div>
      </div>
      <svg width={260} height={260} viewBox="0 0 260 260" style={{ position: "absolute", left: mx - 100, top: my - 100, opacity: card.style.opacity as number }}>
        <circle cx={100} cy={100} r={74} fill="rgba(253,236,238,0.45)" stroke={T.main} strokeWidth={16} />
        <path d="M156 156 L232 232" stroke={T.main} strokeWidth={26} strokeLinecap="round" />
        <path d="M60 80 Q 70 58 94 52" fill="none" stroke="#fff" strokeWidth={10} strokeLinecap="round" />
      </svg>
    </>
  );
};

/* ───────── 5. Ask your parents (a family tree lights up), write name + meaning ───────── */

const NODES = [
  { x: 340, y: 560, c: T.vivid },
  { x: 740, y: 560, c: T.main },
  { x: 540, y: 900, c: T.glow },
];
const Ask: React.FC<{ frame: number }> = ({ frame }) => {
  const outA = progress(frame, F.write - 14, F.write - 2);
  const tree = pop(frame, F.ctaIn + 4, SPRING.smooth);
  const sig = ((frame - F.parents) / 40) % 1;
  const box = pop(frame, F.write - 2, SPRING.smooth);
  const t1 = ease.out(progress(frame, F.myName - 6, F.myName + 26));
  const t2 = ease.out(progress(frame, F.value - 10, F.value + 30));
  const plate = pop(frame, F.comments - 4, SPRING.bouncy);
  const caret = Math.floor(frame / 16) % 2;
  return (
    <>
      {outA < 1 && (
        <div style={{ opacity: 1 - outA, filter: `blur(${outA * 10}px)` }}>
          <Title text="узнай у *родителей*" frame={frame} at={[F.ask, F.parents - 4, F.parents]} size={100} />
          <div style={{ position: "absolute", inset: 0, ...tree.style }}>
            <svg width={1080} height={1300} style={{ position: "absolute", inset: 0 }}>
              <path d={`M340 560 V 730 H 740 V 560 M 540 730 V 900`} fill="none" stroke={T.glow} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
              {frame > F.parents &&
                [0, 1].map((k) => {
                  const p = sig;
                  const x = k ? lerp(540, 740, Math.max(0, p * 2 - 1)) : lerp(540, 340, Math.max(0, p * 2 - 1));
                  const y = p < 0.5 ? lerp(900, 730, p * 2) : lerp(730, 560, Math.min(1, (p - 0.5) * 4));
                  return <circle key={k} cx={x} cy={y} r={16} fill={T.vivid} />;
                })}
            </svg>
            {NODES.map((n, i) => {
              const p = springAt(frame, F.ctaIn + 8 + i * 6, SPRING.bouncy);
              const sz = i === 2 ? 170 : 150;
              return (
                <div key={i} style={{ position: "absolute", left: n.x - sz / 2, top: n.y - sz / 2, width: sz, height: sz, borderRadius: sz, background: n.c, border: "8px solid #fff", boxShadow: SURFACE.boxShadow, transform: `scale(${p})`, display: "grid", placeItems: "center" }}>
                  <div style={{ width: sz * 0.3, height: sz * 0.3, borderRadius: sz, background: "rgba(255,255,255,0.8)", marginTop: -sz * 0.18 }} />
                </div>
              );
            })}
          </div>
        </div>
      )}
      {box.t > 0 && (
        <>
          <Title text="напиши *имя и значение*" frame={frame} at={[F.write, F.myName, F.itsName, F.value]} size={96} />
          <div style={{ position: "absolute", left: 100, right: 100, top: 460, ...box.style }}>
            <div style={{ ...SURFACE, padding: 40, display: "flex", flexDirection: "column", gap: 26 }}>
              <div style={{ height: 110, borderRadius: 55, background: T.pale, display: "flex", alignItems: "center", gap: 12, padding: "0 40px" }}>
                <div style={{ width: 300 * t1, height: 30, borderRadius: 15, background: T.main }} />
                {t1 < 1 && <div style={{ width: 4, height: 54, background: T.main, opacity: caret }} />}
              </div>
              <div style={{ height: 160, borderRadius: 40, background: GRAY2, display: "flex", flexDirection: "column", justifyContent: "center", gap: 20, padding: "0 40px" }}>
                <div style={{ width: 560 * t2, height: 22, borderRadius: 11, background: T.glow }} />
                <div style={{ width: 380 * Math.max(0, t2 * 2 - 1), height: 22, borderRadius: 11, background: T.glow }} />
              </div>
            </div>
          </div>
          {plate.t > 0 && (
            <div style={{ position: "absolute", top: 940, left: 0, right: 0, display: "flex", justifyContent: "center", ...plate.style }}>
              <div style={{ transform: "scale(2.2)", transformOrigin: "50% 0" }}>
                <GlassPlate bg={PLATE_CORAL}>
                  <MessageCircle size={18} strokeWidth={2.4} /> в комментарии
                </GlassPlate>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};

/* ───────── 6. Call you by your real name: the cut tail flies back, the badge is whole ───────── */

const Real: React.FC<{ frame: number }> = ({ frame }) => {
  const card = pop(frame, F.realIn + 2, SPRING.smooth);
  const back = springAt(frame, F.call - 6, SPRING.bouncy);
  const k = 1 - Math.min(1, back);
  const glow = progress(frame, F.real, F.real + 20);
  const plate = pop(frame, F.real + 16, SPRING.bouncy);
  return (
    <>
      <Title text="зовут *по-настоящему*" frame={frame} at={[F.call, F.real]} size={100} />
      <div style={{ position: "absolute", left: 130, top: 470, ...card.style }}>
        <Badge frame={frame} tail={{ x: k * 80, y: k * 560, r: k * 40, o: Math.min(1, back * 2) }} glow={glow} />
      </div>
      {plate.t > 0 && (
        <div style={{ position: "absolute", top: 1000, left: 0, right: 0, display: "flex", justifyContent: "center", ...plate.style }}>
          <div style={{ transform: "scale(2.2)", transformOrigin: "50% 0" }}>
            <GlassPlate bg={PLATE_CORAL}>
              <BadgeCheck size={18} strokeWidth={2.4} /> полное имя
            </GlassPlate>
          </div>
        </div>
      )}
    </>
  );
};

/* ───────── Composition ───────── */

const SCENES: SceneDef[] = [
  { range: [0, F.swapIn], El: Hook },
  { range: [F.swapIn, F.meanIn], El: Swap },
  { range: [F.meanIn, F.knowIn], El: Meaning },
  { range: [F.knowIn, F.ctaIn], El: Know },
  { range: [F.ctaIn, F.realIn], El: Ask },
  { range: [F.realIn, F.duration + 30], El: Real },
];

const SFX: Sfx[] = [
  { src: "sfx/07_CineStrike.wav", from: 2, volume: 0.16 },
  { src: "sfx2/click.mp3", from: F.cut, volume: 0.2 },
  { src: "sfx2/click.mp3", from: F.cut + 16, volume: 0.2 },
  { src: "sfx/05_Distortion_Glitch.wav", from: F.cut + 30, volume: 0.05 },
  // scene changes: textures from the SFX/ library (no whoosh)
  { src: "sfx/02_Alienated_Warpes.wav", from: F.swapIn - 8, volume: 0.14 },
  { src: "sfx/01_Ripple_Textures.wav", from: F.meanIn - 8, volume: 0.18 },
  { src: "sfx/04_Cyber_Shift.wav", from: F.knowIn - 8, volume: 0.2 },
  { src: "sfx/06_Ripple_Textures_II.wav", from: F.ctaIn - 8, volume: 0.2 },
  { src: "sfx/01_Ripple_Textures.wav", from: F.realIn - 8, volume: 0.18 },
  // 2. split-flap flips
  { src: "sfx2/click.mp3", from: F.dima - 10, volume: 0.18 },
  { src: "sfx2/click.mp3", from: F.galya - 10, volume: 0.18 },
  { src: "sfx/03_Basscrack.wav", from: F.asked, volume: 0.08 },
  // 3. bloom, circle, heart
  { src: "sfx2/ding.mp3", from: F.meaning, volume: 0.18 },
  { src: "sfx2/pop.mp3", from: F.you + 10, volume: 0.2 },
  // 5. tree, comment
  { src: "sfx2/pop.mp3", from: F.ctaIn + 8, volume: 0.18 },
  { src: "sfx2/pop.mp3", from: F.comments - 4, volume: 0.24 },
  // 6. the tail flies back
  { src: "sfx2/pop.mp3", from: F.call - 6, volume: 0.2 },
  { src: "sfx2/ding.mp3", from: F.real + 16, volume: 0.2 },
  { src: "sfx/07_CineStrike.wav", from: F.real + 2, volume: 0.1 },
];

// All 30 poses of the Alicja set, each at least once, by the meaning of the line; never the same photo twice in a row
const AVATAR_KEYS: AvatarKey[] = [
  // 1. hook: never shorten your name
  { at: 0, e: "shush" },
  { at: 35, e: "stop" },
  { at: 80, e: "displeased" },
  { at: 125, e: "explaining" },
  { at: 165, e: "shrug" },
  { at: 205, e: "arms-crossed" },
  // 2. Ильдар -> Дима, Гульнара -> Галя
  { at: F.swapIn, e: "present-left" },
  { at: 290, e: "surprised" },
  { at: 335, e: "puzzled" },
  { at: 375, e: "disappointed" },
  { at: 420, e: "skeptical" },
  { at: 460, e: "facepalm" },
  // 3. a name has a meaning, chosen for you
  { at: F.meanIn, e: "inspired" },
  { at: 560, e: "dreamy" },
  { at: 600, e: "hand-on-heart" },
  { at: 650, e: "heart-hands" },
  { at: 685, e: "soft-smile" },
  // 4. do you know what it means
  { at: F.knowIn, e: "pensive" },
  { at: 760, e: "thinking" },
  { at: 805, e: "point-up" },
  // 5. ask your parents, write it
  { at: F.ctaIn, e: "listening" },
  { at: 890, e: "smile-up" },
  { at: 924, e: "point-right" },
  { at: 965, e: "point-down" },
  { at: 1005, e: "delighted" },
  { at: 1045, e: "laughing" },
  { at: 1075, e: "thumbs-up" },
  // 6. your real name
  { at: F.realIn, e: "waving" },
  { at: 1150, e: "clapping" },
  { at: 1200, e: "victory" },
];

const STANCES: StanceKey[] = [
  { at: 0, s: "center" },
  { at: F.swapIn, s: "right" },
  { at: F.meanIn, s: "left" },
  { at: F.knowIn, s: "right" },
  { at: F.ctaIn, s: "left" },
  { at: F.realIn, s: "center" },
];

// Alicja set photos: scale the wide-framed ones so every photo fills the 540x590 box by height (same as V37)
const SIZE: Record<string, [number, number]> = {
  pensive: [1129, 1393], dreamy: [1293, 1216], displeased: [1254, 1254], surprised: [1280, 1229], waving: [1312, 1199], inspired: [1199, 1312], explaining: [1312, 1199], delighted: [1312, 1199], skeptical: [1312, 1199], laughing: [1385, 1136],
  puzzled: [1129, 1393], disappointed: [1278, 1230], "smile-up": [1199, 1312], thinking: [1129, 1393], "soft-smile": [1164, 1351], "point-up": [1312, 1199], "point-down": [1312, 1199], "present-left": [1312, 1199], "point-right": [1312, 1199], shrug: [1312, 1199],
  "hand-on-heart": [1312, 1199], stop: [1312, 1199], shush: [1199, 1312], clapping: [1312, 1199], "thumbs-up": [1312, 1199], "arms-crossed": [1199, 1312], facepalm: [1312, 1199], "heart-hands": [1312, 1199], victory: [1312, 1199], listening: [1312, 1199],
};
const FIT = Object.fromEntries(Object.entries(SIZE).map(([e, [w, h]]) => [e, Math.max(1, w / h / (540 / 590))])) as Partial<Record<Emotion, number>>;

const Host: React.FC<{ frame: number }> = ({ frame }) => <TatAvatar frame={frame} keys={AVATAR_KEYS} words={WORDS} stances={STANCES} dir="v41/avatar" fit={FIT} />;

export const Video41: React.FC = () => (
  <AbsoluteFill style={{ background: "#fff", fontFamily: PARAGRAPH.fontFamily, color: INK }}>
    <ReelShell scenes={SCENES} headlines={[]} vo={VO} sfx={SFX} duration={F.duration} music="v41/music/bed.mp3" musicLevel={[0.045, 0.11]} overlay={Host} bg={BG} />
  </AbsoluteFill>
);
