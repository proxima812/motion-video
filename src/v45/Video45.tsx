import React from "react";
import { AbsoluteFill } from "remotion";
import { Eye, Forward, Send, Share2 } from "lucide-react";
import { SPRING, ease, lerp, progress, springAt } from "../stage/motion";
import { ReelShell, count, pop, shake, type SceneDef, type Sfx } from "../kit/reel";
import { TatAvatar, type AvatarKey, type Emotion, type StanceKey } from "../kit/TatAvatar";
import { DotOrbitBg } from "../kit/DotOrbitBg";
import { HEADING, INK, NUMBER, PARAGRAPH, SURFACE } from "../kit/design";
import { GlassPlate } from "../catalog/own/glass";
import { F, VO } from "./timeline";
import { WORDS } from "./words";

// "Семейный чат против афиши" (@the_tatarverse, RU, host preset 2 Alicja). ~20.3 s.
// Nobody opens your poster -> a cousin's meme opened in 0.8 s -> the beautiful poster is scrolled past -> people share funny, warm, about their own
// -> make a culture post worth dropping into the family chat -> send this reel there now.
// Own kit only. Palette: plum. Dot Orbit variant 3 (output/bg-variant.txt).
const T = { main: "#6A1E5A", vivid: "#9B2E85", glow: "#DDA3CF", pale: "#F9EAF5" };
const PLATE_PLUM = "linear-gradient(135deg, #9B2E85, #6A1E5A)";
const BG = <DotOrbitBg variant={3} />;
const GRAY = "#ECE8EE";
const GRAY2 = "#F4F1F5";

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

/** A round "face" (no icon): colored disc with two eyes */
const Face: React.FC<{ color: string; size: number; style?: React.CSSProperties }> = ({ color, size, style }) => (
  <div style={{ position: "absolute", width: size, height: size, borderRadius: size / 2, boxSizing: "border-box", background: color, border: `${Math.max(3, size * 0.05)}px solid #fff`, boxShadow: SURFACE.boxShadow, ...style }}>
    {[0.33, 0.58].map((x) => (
      <div key={x} style={{ position: "absolute", left: `${x * 100}%`, top: "40%", width: size * 0.09, height: size * 0.09, borderRadius: size, background: INK }} />
    ))}
  </div>
);

const Bar: React.FC<{ w: number | string; h?: number; c?: string; style?: React.CSSProperties }> = ({ w, h = 22, c = GRAY, style }) => <div style={{ width: w, height: h, borderRadius: h / 2, background: c, ...style }} />;

/** Tatar tulip ornament, drawn */
const Tulip: React.FC<{ s?: number; c?: string; c2?: string }> = ({ s = 1, c = "#fff", c2 = T.glow }) => (
  <svg width={160 * s} height={200 * s} viewBox="0 0 160 200">
    <path d="M80 190 V100" stroke={c2} strokeWidth={8} strokeLinecap="round" />
    <path d="M80 160 C 50 150 30 125 28 100 C 55 108 72 128 80 150 Z" fill={c2} />
    <path d="M80 160 C 110 150 130 125 132 100 C 105 108 88 128 80 150 Z" fill={c2} />
    <path d="M80 10 C 58 34 50 66 62 100 C 70 106 90 106 98 100 C 110 66 102 34 80 10 Z" fill={c} />
    <path d="M62 100 C 40 90 30 62 36 34 C 50 50 58 70 66 96 Z" fill={c} opacity={0.85} />
    <path d="M98 100 C 120 90 130 62 124 34 C 110 50 102 70 94 96 Z" fill={c} opacity={0.85} />
  </svg>
);

/** The beautiful culture poster: plum gradient, ornament, text bars */
const Poster: React.FC<{ w: number; h: number; style?: React.CSSProperties }> = ({ w, h, style }) => (
  <div style={{ width: w, height: h, borderRadius: 28, overflow: "hidden", background: `linear-gradient(160deg, ${T.vivid}, ${T.main})`, position: "relative", ...style }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.08, display: "flex", justifyContent: "center" }}>
      <Tulip s={(h * 0.5) / 200} />
    </div>
    <div style={{ position: "absolute", left: w * 0.12, right: w * 0.12, bottom: h * 0.1, display: "flex", flexDirection: "column", alignItems: "center", gap: h * 0.035 }}>
      <Bar w="80%" h={h * 0.05} c="#fff" />
      <Bar w="55%" h={h * 0.035} c={T.glow} />
      <Bar w="40%" h={h * 0.035} c={T.glow} />
    </div>
  </div>
);

/* ───────── 1. Hook: a beautiful poster with 0 views, a spider comes down on "открывает" ───────── */

const Hook: React.FC<{ frame: number }> = ({ frame }) => {
  const card = pop(frame, 4, SPRING.smooth);
  const zero = springAt(frame, F.nobody, SPRING.bouncy);
  const sx = shake(frame, F.opens + 4, 14, 26);
  const drop = ease.out(progress(frame, F.opens - 4, F.opens + 30));
  const swing = Math.sin((frame - F.opens) / 14) * 4 * drop;
  const dim = progress(frame, F.nobody, F.nobody + 30);
  return (
    <>
      <Title text="почему твою *афишу*" frame={frame} at={[-30, -24, F.poster - 6]} size={80} />
      <Title text="никто не *открывает*" frame={frame} at={[F.nobody - 6, F.nobody + 6, F.opens]} size={80} top={275} />
      <div style={{ position: "absolute", left: 270, top: 450, transform: `${card.style.transform} rotate(-2deg)`, opacity: card.style.opacity, filter: `saturate(${1 - 0.55 * dim})` }}>
        <Poster w={540} h={700} style={{ boxShadow: SURFACE.boxShadow }} />
      </div>
      {/* the spider on its thread */}
      {drop > 0 && (
        <div style={{ position: "absolute", left: 740, top: 430, transformOrigin: "50% 0", transform: `rotate(${swing}deg) scale(1.7)` }}>
          <div style={{ width: 3, height: 40 + 230 * drop, background: INK, opacity: 0.6, marginLeft: 23 }} />
          <svg width={50} height={44} viewBox="0 0 50 44" style={{ display: "block", marginTop: -4 }}>
            {[-1, 1].map((d) =>
              [8, 16, 24].map((y) => <path key={`${d}${y}`} d={`M25 ${y + 4} Q ${25 + d * 18} ${y - 4} ${25 + d * 24} ${y + 8}`} fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" />),
            )}
            <circle cx={25} cy={22} r={13} fill={INK} />
            <circle cx={20} cy={20} r={3} fill="#fff" />
            <circle cx={30} cy={20} r={3} fill="#fff" />
          </svg>
        </div>
      )}
      {zero > 0 && (
        <div style={{ position: "absolute", left: 560, top: 1080, height: 120, padding: "0 40px", ...SURFACE, borderRadius: 60, display: "flex", alignItems: "center", gap: 22, transform: `translateX(${sx}px) scale(${Math.min(zero, 1.1)})` }}>
          <Eye size={56} color={T.main} strokeWidth={2.2} />
          <span style={{ ...NUMBER, fontSize: 80, color: T.main }}>0</span>
        </div>
      )}
    </>
  );
};

/* ───────── 2. A meme from the cousin: opened in 0.8 s ───────── */

const CatMeme: React.FC = () => (
  <svg width={300} height={250} viewBox="0 0 300 250">
    <path d="M70 90 L 82 20 L 130 64 Z" fill={T.glow} />
    <path d="M230 90 L 218 20 L 170 64 Z" fill={T.glow} />
    <ellipse cx={150} cy={140} rx={110} ry={92} fill={T.glow} />
    <path d="M98 120 q 16 -18 32 0" fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" />
    <path d="M170 120 q 16 -18 32 0" fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" />
    <ellipse cx={150} cy={175} rx={34} ry={28} fill={T.main} />
    <ellipse cx={150} cy={188} rx={18} ry={10} fill="#E57AA8" />
    <path d="M86 138 q -6 20 4 30" fill="none" stroke="#7FB8E8" strokeWidth={8} strokeLinecap="round" />
    <path d="M214 138 q 6 20 -4 30" fill="none" stroke="#7FB8E8" strokeWidth={8} strokeLinecap="round" />
    {[-1, 1].map((d) => (
      <path key={d} d={`M${150 + d * 50} 160 l ${d * 50} -6 M${150 + d * 50} 172 l ${d * 50} 6`} stroke={INK} strokeWidth={3} strokeLinecap="round" />
    ))}
  </svg>
);

const Meme: React.FC<{ frame: number }> = ({ frame }) => {
  const card = pop(frame, F.memeIn + 4, SPRING.smooth);
  const bubble = springAt(frame, F.memeIn + 30, SPRING.bouncy);
  const read = progress(frame, F.second - 4, F.second + 4);
  const tenths = count(frame, F.opened - 4, F.second + 6, 0, 8);
  const timer = pop(frame, F.opened - 8, SPRING.bouncy);
  const jiggle = Math.sin((frame - F.memeIn) / 5) * 2 * progress(frame, F.second, F.second + 10);
  return (
    <>
      <Title text="мем от *брата*" frame={frame} at={[F.memeIn + 2, F.memeIn + 18, F.cousin]} size={100} />
      <div style={{ position: "absolute", left: 140, right: 140, top: 340, height: 820, ...SURFACE, borderRadius: 40, ...card.style }}>
        <div style={{ display: "flex", alignItems: "center", gap: 26, padding: 34, borderBottom: `3px solid ${GRAY2}` }}>
          <Face color={T.vivid} size={90} style={{ position: "relative", boxShadow: "none" }} />
          <span style={{ ...PARAGRAPH, fontWeight: 700, fontSize: 52, lineHeight: 1 }}>брат</span>
        </div>
        <div style={{ position: "absolute", left: 40, top: 200, width: 440, padding: 30, borderRadius: 34, background: T.pale, boxSizing: "border-box", transformOrigin: "0 100%", transform: `scale(${bubble}) rotate(${jiggle}deg)`, opacity: Math.min(1, bubble * 2) }}>
          <div style={{ width: 380, height: 300, borderRadius: 22, background: "#fff", display: "grid", placeItems: "center" }}>
            <CatMeme />
          </div>
        </div>
        {/* read ticks (drawn) */}
        <svg width={90} height={50} viewBox="0 0 90 50" style={{ position: "absolute", left: 400, top: 590, opacity: bubble > 0.5 ? 1 : 0 }}>
          {[0, 26].map((dx) => (
            <path key={dx} d={`M${8 + dx} 26 l 14 14 l 28 -32`} fill="none" stroke={read > 0.5 ? T.vivid : "#C9C2CC"} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
          ))}
        </svg>
        {timer.t > 0 && (
          <div style={{ position: "absolute", left: 0, right: 0, top: 650, display: "flex", justifyContent: "center", alignItems: "baseline", gap: 18, ...timer.style }}>
            <span style={{ ...NUMBER, fontSize: 130, color: T.main }}>{`0.${tenths}`}</span>
            <span style={{ ...PARAGRAPH, fontSize: 60, lineHeight: 1 }}>сек</span>
          </div>
        )}
      </div>
    </>
  );
};

/* ───────── 3. The beautiful event poster in a feed: one fast swipe and it's gone ───────── */

const FEED = [
  { h: 260, poster: false },
  { h: 260, poster: false },
  { h: 560, poster: true },
  { h: 260, poster: false },
  { h: 260, poster: false },
  { h: 260, poster: false },
  { h: 260, poster: false },
  { h: 260, poster: false },
];
const FeedCard: React.FC<{ h: number; i: number }> = ({ h, i }) => (
  <div style={{ height: h, borderRadius: 24, background: GRAY2, padding: 28, boxSizing: "border-box", display: "flex", gap: 24 }}>
    <div style={{ width: 120, height: 120, borderRadius: 60, background: [GRAY, "#E9E1EC"][i % 2], flex: "none" }} />
    <div style={{ display: "flex", flexDirection: "column", gap: 18, paddingTop: 16, flex: 1 }}>
      <Bar w="85%" />
      <Bar w="60%" />
      <Bar w="70%" />
    </div>
  </div>
);
const Scroll: React.FC<{ frame: number }> = ({ frame }) => {
  const phone = pop(frame, F.scrollIn + 4, SPRING.smooth);
  // poster top inside the feed = 2 * (260 + 26) = 572; centered in the 820 window at F.event
  const slow = lerp(-140, 572 - 130, ease.inOut(progress(frame, F.scrollIn + 4, F.event + 10)));
  const swipe = ease.out(progress(frame, F.scrolled - 2, F.scrolled + 22));
  const y = slow + swipe * 1300;
  const speed = progress(frame, F.scrolled - 2, F.scrolled + 4) * (1 - progress(frame, F.scrolled + 6, F.scrolled + 20));
  const touch = progress(frame, F.scrolled - 10, F.scrolled - 4) * (1 - progress(frame, F.scrolled + 14, F.scrolled + 22));
  const ty = lerp(1160, 620, ease.out(progress(frame, F.scrolled - 2, F.scrolled + 16)));
  return (
    <>
      <Title text="красивую *афишу*" frame={frame} at={[F.beautiful - 4, F.poster2]} size={92} />
      <Title text="*пролистал*" frame={frame} at={F.scrolled} size={92} top={290} />
      <div style={{ position: "absolute", left: 230, top: 430, width: 620, height: 820, ...SURFACE, borderRadius: 52, overflow: "hidden", ...phone.style }}>
        <div style={{ position: "absolute", left: 26, right: 26, top: 26 - y, display: "flex", flexDirection: "column", gap: 26, filter: speed > 0.05 ? `blur(${speed * 10}px)` : undefined }}>
          {FEED.map((c, i) => (c.poster ? <Poster key={i} w={568} h={c.h} /> : <FeedCard key={i} h={c.h} i={i} />))}
        </div>
      </div>
      {touch > 0 && <div style={{ position: "absolute", left: 540 - 45, top: ty - 45, width: 90, height: 90, borderRadius: 45, background: "rgba(221,163,207,0.55)", border: "5px solid #fff", boxShadow: SURFACE.boxShadow, opacity: touch }} />}
    </>
  );
};

/* ───────── 4. What people share: three circles meet, the middle lights up ───────── */

const CIRCLES = [
  { x: 540, y: 640, at: F.funny - 8, c: "rgba(221,163,207,0.55)", w: "смешно", lx: 540, ly: 545 },
  { x: 410, y: 860, at: F.warm - 8, c: "rgba(155,46,133,0.28)", w: "тепло", lx: 335, ly: 905 },
  { x: 670, y: 860, at: F.own - 8, c: "rgba(106,30,90,0.22)", w: "про\nсвоих", lx: 750, ly: 880 },
];
const R = 210;
const Share: React.FC<{ frame: number }> = ({ frame }) => {
  const mid = springAt(frame, F.own + 22, SPRING.bouncy);
  const pulse = 0.5 + 0.5 * Math.sin((frame - F.own) / 7);
  return (
    <>
      <Title text="чем *делятся*" frame={frame} at={[F.shareIn + 2, F.share]} size={100} />
      {CIRCLES.map((c) => {
        const p = springAt(frame, c.at, SPRING.bouncy);
        return (
          <React.Fragment key={c.w}>
            <div style={{ position: "absolute", left: c.x - R, top: c.y - R, width: R * 2, height: R * 2, borderRadius: R, background: c.c, border: `5px solid ${T.glow}`, boxSizing: "border-box", transform: `scale(${p})`, mixBlendMode: "multiply" }} />
            <div style={{ position: "absolute", left: c.lx - 150, width: 300, top: c.ly - 40, textAlign: "center", ...PARAGRAPH, fontWeight: 700, fontSize: 50, lineHeight: 1.05, color: T.main, whiteSpace: "pre-line", opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - Math.min(p, 1)) * 20}px)` }}>{c.w}</div>
          </React.Fragment>
        );
      })}
      {mid > 0 && (
        <div style={{ position: "absolute", left: 540 - 70, top: 790 - 70, width: 140, height: 140, borderRadius: 70, background: T.vivid, display: "grid", placeItems: "center", transform: `scale(${mid})`, boxShadow: `0 0 ${30 + 30 * pulse}px ${T.glow}` }}>
          <Share2 size={64} color="#fff" strokeWidth={2.2} />
        </div>
      )}
    </>
  );
};

/* ───────── 5. A culture post flies into the family chat «Гаилә» ───────── */

const Post: React.FC<{ w: number }> = ({ w }) => (
  <div style={{ width: w, borderRadius: 28, background: "#fff", padding: w * 0.06, boxSizing: "border-box", boxShadow: SURFACE.boxShadow }}>
    <div style={{ height: w * 0.62, borderRadius: 20, background: T.pale, display: "grid", placeItems: "center" }}>
      <Tulip s={(w * 0.5) / 200} c={T.vivid} c2={T.glow} />
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: w * 0.04, marginTop: w * 0.06 }}>
      <Bar w="90%" h={w * 0.05} />
      <Bar w="65%" h={w * 0.05} />
    </div>
  </div>
);
const Family: React.FC<{ frame: number }> = ({ frame }) => {
  const first = fadeOut(frame, F.drop - 20);
  const post = pop(frame, F.postIn + 8, SPRING.smooth);
  const chat = pop(frame, F.culture, SPRING.smooth);
  const fly = ease.inOut(progress(frame, F.drop - 6, F.drop + 30));
  const land = springAt(frame, F.drop + 28, SPRING.bouncy);
  const plate = pop(frame, F.chat + 6, SPRING.bouncy);
  const x = lerp(130, 600, fly);
  const y = lerp(470, 760, fly) - Math.sin(fly * Math.PI) * 160;
  const w = lerp(380, 320, fly);
  return (
    <>
      {first > 0 && <Title text="пост о *культуре*" frame={frame} at={[F.post - 4, F.post + 8, F.culture]} size={96} style={{ opacity: first }} />}
      {frame >= F.drop - 14 && <Title text="в *семейный чат*" frame={frame} at={[F.drop - 6, F.family, F.chat]} size={96} />}
      <div style={{ position: "absolute", left: 560, top: 400, width: 410, height: 840, ...SURFACE, borderRadius: 40, overflow: "hidden", ...chat.style }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, padding: 28, borderBottom: `3px solid ${GRAY2}` }}>
          <div style={{ position: "relative", width: 110, height: 80, flex: "none" }}>
            <Face color={T.glow} size={62} style={{ left: 0, top: 10, boxShadow: "none" }} />
            <Face color={T.vivid} size={62} style={{ left: 26, top: 0, boxShadow: "none" }} />
            <Face color={T.main} size={62} style={{ left: 50, top: 16, boxShadow: "none" }} />
          </div>
          <span style={{ ...PARAGRAPH, fontWeight: 700, fontSize: 50, lineHeight: 1.1 }}>Гаилә</span>
        </div>
        <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ width: 250, padding: 22, borderRadius: 24, background: GRAY2, display: "flex", flexDirection: "column", gap: 14 }}>
            <Bar w="100%" h={18} />
            <Bar w="60%" h={18} />
          </div>
          <div style={{ width: 200, padding: 22, borderRadius: 24, background: GRAY2 }}>
            <Bar w="100%" h={18} />
          </div>
        </div>
        {/* family reactions under the landed post */}
        {[T.glow, T.vivid, T.main, "#E57AA8"].map((c, i) => {
          const p = springAt(frame, F.drop + 40 + i * 7, SPRING.bouncy);
          return <Face key={i} color={c} size={70} style={{ left: 40 + i * 58, top: 740, transform: `scale(${p})` }} />;
        })}
      </div>
      {post.t > 0 && (
        <div style={{ position: "absolute", left: x, top: y, transform: `${fly === 0 ? post.style.transform : ""} scale(${fly > 0.98 ? 0.9 + 0.1 * Math.min(land, 1.05) : 1}) rotate(${(1 - fly) * -3}deg)`, opacity: post.style.opacity }}>
          <Post w={w} />
        </div>
      )}
      {plate.t > 0 && (
        <div style={{ position: "absolute", left: 100, width: 440, top: 640, display: "flex", justifyContent: "center", ...plate.style }}>
          <div style={{ transform: "scale(2.1)" }}>
            <GlassPlate bg={PLATE_PLUM}>
              <Forward size={20} strokeWidth={2.2} /> переслано
            </GlassPlate>
          </div>
        </div>
      )}
    </>
  );
};

/* ───────── 6. Send this reel there right now: share sheet, «Гаилә» is picked, the reel flies in ───────── */

const CONTACTS = [
  { w: "мама", c: T.glow, x: 270 },
  { w: "брат", c: T.vivid, x: 540 },
  { w: "Гаилә", c: T.main, x: 810 },
];
const Send6: React.FC<{ frame: number }> = ({ frame }) => {
  const first = fadeOut(frame, F.send - 12);
  const reel = pop(frame, F.sendIn + 6, SPRING.smooth);
  const sheet = pop(frame, F.send - 10, SPRING.smooth);
  const pick = springAt(frame, F.there, SPRING.bouncy);
  const plate = pop(frame, F.now - 4, SPRING.bouncy);
  const press = progress(frame, F.now + 26, F.now + 30) * (1 - progress(frame, F.now + 32, F.now + 40));
  const fly = ease.in(progress(frame, F.now + 34, F.now + 62));
  const got = springAt(frame, F.now + 62, SPRING.bouncy);
  const rx = lerp(540, 810, fly);
  const ry = lerp(640, 1040, fly);
  return (
    <>
      {first > 0 && <Title text="а этот *ролик*" frame={frame} at={[F.sendIn + 2, F.sendIn + 7, F.reel]} size={100} style={{ opacity: first }} />}
      {frame >= F.send - 10 && <Title text="отправь *прямо сейчас*" frame={frame} at={[F.send - 6, F.right, F.now]} size={92} />}
      {fly < 1 && (
        <div style={{ position: "absolute", left: rx - 140, top: ry - 230, width: 280, height: 460, borderRadius: 36, background: `linear-gradient(160deg, ${T.vivid}, ${T.main})`, boxShadow: SURFACE.boxShadow, border: "8px solid #fff", display: "grid", placeItems: "center", transform: `${reel.style.transform} scale(${1 - 0.8 * fly}) rotate(${fly * 20 + 3}deg)`, opacity: (reel.style.opacity as number) * (1 - progress(fly, 0.85, 1)) }}>
          <svg width={110} height={110} viewBox="0 0 110 110">
            <circle cx={55} cy={55} r={52} fill="rgba(255,255,255,0.25)" />
            <path d="M44 32 L 80 55 L 44 78 Z" fill="#fff" />
          </svg>
        </div>
      )}
      {sheet.t > 0 && (
        <div style={{ position: "absolute", left: 110, right: 110, top: 930, height: 300, ...SURFACE, borderRadius: 40, ...sheet.style }}>
          {CONTACTS.map((c, i) => {
            const on = i === 2;
            const p = springAt(frame, F.send - 6 + i * 5, SPRING.bouncy);
            const ring = on ? Math.min(pick, 1) : 0;
            return (
              <div key={c.w} style={{ position: "absolute", left: c.x - 110 - 80, top: 40, width: 160, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, transform: `scale(${p * (1 + 0.1 * ring + (on ? 0.12 * Math.max(0, Math.min(got, 1.2) - 0.2) * (1 - progress(frame, F.now + 70, F.now + 90)) : 0))})` }}>
                <div style={{ position: "relative", width: 140, height: 140 }}>
                  <Face color={c.c} size={140} style={{ left: 0, top: 0, outline: ring > 0 ? `${8 * ring}px solid ${T.glow}` : undefined, outlineOffset: 4 }} />
                </div>
                <span style={{ ...PARAGRAPH, fontSize: 44, lineHeight: 1, fontWeight: on && ring > 0.5 ? 700 : 400, color: on && ring > 0.5 ? T.main : INK }}>{c.w}</span>
              </div>
            );
          })}
        </div>
      )}
      {plate.t > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 790, display: "flex", justifyContent: "center", ...plate.style }}>
          <div style={{ transform: `scale(${2.3 - 0.15 * press})` }}>
            <GlassPlate bg={PLATE_PLUM}>
              <Send size={20} strokeWidth={2.2} /> отправить
            </GlassPlate>
          </div>
        </div>
      )}
    </>
  );
};

/* ───────── Composition ───────── */

const SCENES: SceneDef[] = [
  { range: [0, F.memeIn], El: Hook },
  { range: [F.memeIn, F.scrollIn], El: Meme },
  { range: [F.scrollIn, F.shareIn], El: Scroll },
  { range: [F.shareIn, F.postIn], El: Share },
  { range: [F.postIn, F.sendIn], El: Family },
  { range: [F.sendIn, F.duration + 30], El: Send6 },
];

const SFX: Sfx[] = [
  { src: "sfx/07_CineStrike.wav", from: 2, volume: 0.18 },
  { src: "sfx2/pop.mp3", from: F.nobody, volume: 0.2 },
  { src: "sfx/03_Basscrack.wav", from: F.opens + 4, volume: 0.08 },
  // scene changes: textures from the SFX/ library (no whoosh)
  { src: "sfx/01_Ripple_Textures.wav", from: F.memeIn - 8, volume: 0.18 },
  { src: "sfx/04_Cyber_Shift.wav", from: F.scrollIn - 8, volume: 0.2 },
  { src: "sfx/06_Ripple_Textures_II.wav", from: F.shareIn - 8, volume: 0.2 },
  { src: "sfx/02_Alienated_Warpes.wav", from: F.postIn - 8, volume: 0.14 },
  { src: "sfx/01_Ripple_Textures.wav", from: F.sendIn - 8, volume: 0.18 },
  // 2. meme arrives, read in 0.8 s
  { src: "sfx2/pop.mp3", from: F.memeIn + 30, volume: 0.22 },
  { src: "sfx2/ding.mp3", from: F.second, volume: 0.18 },
  // 3. the swipe
  { src: "sfx/05_Distortion_Glitch.wav", from: F.scrolled, volume: 0.05 },
  // 4. circles
  ...CIRCLES.map((c) => ({ src: "sfx2/pop.mp3", from: c.at, volume: 0.2 })),
  { src: "sfx2/ding.mp3", from: F.own + 22, volume: 0.18 },
  // 5. into the family chat
  { src: "sfx2/click.mp3", from: F.drop - 6, volume: 0.18 },
  { src: "sfx2/pop.mp3", from: F.drop + 28, volume: 0.22 },
  { src: "sfx2/pop.mp3", from: F.chat + 6, volume: 0.2 },
  // 6. pick, send
  { src: "sfx2/click.mp3", from: F.there, volume: 0.2 },
  { src: "sfx2/pop.mp3", from: F.now - 4, volume: 0.22 },
  { src: "sfx2/click.mp3", from: F.now + 26, volume: 0.2 },
  { src: "sfx/07_CineStrike.wav", from: F.now + 62, volume: 0.12 },
];

// All 30 poses of the Alicja set, each at least once; never the same photo twice in a row
const AVATAR_KEYS: AvatarKey[] = [
  // 1. hook: nobody opens your poster
  { at: 0, e: "explaining" },
  { at: 40, e: "skeptical" },
  { at: 80, e: "displeased" },
  { at: 120, e: "disappointed" },
  { at: 155, e: "facepalm" },
  // 2. the cousin's meme
  { at: F.memeIn, e: "laughing" },
  { at: 235, e: "point-right" },
  { at: 280, e: "surprised" },
  { at: 320, e: "delighted" },
  // 3. the poster scrolled past
  { at: F.scrollIn, e: "pensive" },
  { at: 420, e: "present-left" },
  { at: 470, e: "shrug" },
  { at: 505, e: "arms-crossed" },
  { at: 535, e: "puzzled" },
  // 4. what people share
  { at: F.shareIn, e: "thinking" },
  { at: 610, e: "point-up" },
  { at: 650, e: "smile-up" },
  { at: 690, e: "soft-smile" },
  { at: 735, e: "hand-on-heart" },
  // 5. a post for the family chat
  { at: F.postIn, e: "inspired" },
  { at: 825, e: "listening" },
  { at: 870, e: "point-down" },
  { at: 910, e: "dreamy" },
  { at: 950, e: "heart-hands" },
  { at: 990, e: "clapping" },
  // 6. send it now
  { at: F.sendIn, e: "waving" },
  { at: 1060, e: "stop" },
  { at: 1090, e: "shush" },
  { at: 1120, e: "thumbs-up" },
  { at: 1155, e: "victory" },
];

const STANCES: StanceKey[] = [
  { at: 0, s: "center" },
  { at: F.memeIn, s: "right" },
  { at: F.scrollIn, s: "left" },
  { at: F.shareIn, s: "right" },
  { at: F.postIn, s: "left" },
  { at: F.sendIn, s: "center" },
];

// Alicja photos: scale the wide-framed ones so every photo fills the 540x590 box by height (same as V37)
const SIZE: Record<string, [number, number]> = {
  pensive: [1129, 1393], dreamy: [1293, 1216], displeased: [1254, 1254], surprised: [1280, 1229], waving: [1312, 1199], inspired: [1199, 1312], explaining: [1312, 1199], delighted: [1312, 1199], skeptical: [1312, 1199], laughing: [1385, 1136],
  puzzled: [1129, 1393], disappointed: [1278, 1230], "smile-up": [1199, 1312], thinking: [1129, 1393], "soft-smile": [1164, 1351], "point-up": [1312, 1199], "point-down": [1312, 1199], "present-left": [1312, 1199], "point-right": [1312, 1199], shrug: [1312, 1199],
  "hand-on-heart": [1312, 1199], stop: [1312, 1199], shush: [1199, 1312], clapping: [1312, 1199], "thumbs-up": [1312, 1199], "arms-crossed": [1199, 1312], facepalm: [1312, 1199], "heart-hands": [1312, 1199], victory: [1312, 1199], listening: [1312, 1199],
};
const FIT = Object.fromEntries(Object.entries(SIZE).map(([e, [w, h]]) => [e, Math.max(1, w / h / (540 / 590))])) as Partial<Record<Emotion, number>>;

const Host: React.FC<{ frame: number }> = ({ frame }) => <TatAvatar frame={frame} keys={AVATAR_KEYS} words={WORDS} stances={STANCES} dir="v45/avatar" fit={FIT} />;

export const Video45: React.FC = () => (
  <AbsoluteFill style={{ background: "#fff", fontFamily: PARAGRAPH.fontFamily, color: INK }}>
    <ReelShell scenes={SCENES} headlines={[]} vo={VO} sfx={SFX} duration={F.duration} music="v45/music/bed.mp3" musicLevel={[0.045, 0.11]} overlay={Host} bg={BG} />
  </AbsoluteFill>
);
