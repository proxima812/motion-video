import React from "react";
import { AbsoluteFill } from "remotion";
import { Heart, Send } from "lucide-react";
import { SPRING, ease, lerp, progress, springAt } from "../stage/motion";
import { ReelShell, count, pop, shake, type SceneDef, type Sfx } from "../kit/reel";
import { TatAvatar, type AvatarKey, type Emotion, type StanceKey } from "../kit/TatAvatar";
import { DotOrbitBg } from "../kit/DotOrbitBg";
import { HEADING, INK, NUMBER, PARAGRAPH, SURFACE } from "../kit/design";
import { GlassPlate } from "../catalog/own/glass";
import { F, VO } from "./timeline";
import { WORDS } from "./words";

// "Татарский в обычном чате" (@the_tatarverse, RU, host preset 2 Alicja). ~20.5 s.
// Most people don't realise Tatar starts right in a chat -> we promise "someday" -> write mom one phrase today -> she answers, surprised -> small step beats a big promise.
// Own kit only. Palette: teal (everyday talk, messages). Dot Orbit variant 5 (output/bg-variant.txt).
const T = { main: "#0E6E73", vivid: "#14979E", glow: "#8ED3D6", pale: "#E6F6F7" };
const BG = <DotOrbitBg variant={5} />;
const GRAY = "#ECEEEE";
const MUTED = "#8A9192";

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

/** Chat window: white card with a header (contact circle + name line) */
const ChatCard: React.FC<{ top: number; height: number; style?: React.CSSProperties; children?: React.ReactNode }> = ({ top, height, style, children }) => (
  <div style={{ position: "absolute", top, left: 150, right: 150, height, ...SURFACE, overflow: "hidden", ...style }}>
    <div style={{ display: "flex", alignItems: "center", gap: 22, padding: 30, borderBottom: `2px solid ${GRAY}` }}>
      <div style={{ width: 70, height: 70, borderRadius: 35, background: `linear-gradient(135deg, ${T.glow}, ${T.vivid})` }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ width: 170, height: 16, borderRadius: 8, background: "#DDE2E2" }} />
        <div style={{ width: 100, height: 12, borderRadius: 6, background: GRAY }} />
      </div>
    </div>
    <div style={{ position: "relative", padding: 34, display: "flex", flexDirection: "column", gap: 24 }}>{children}</div>
  </div>
);

/** Message bubble: `me` = right, teal; otherwise left, light gray */
const Bubble: React.FC<{ me?: boolean; style?: React.CSSProperties; children: React.ReactNode }> = ({ me, style, children }) => (
  <div style={{ alignSelf: me ? "flex-end" : "flex-start", maxWidth: "86%", padding: "24px 30px", borderRadius: 30, ...(me ? { borderBottomRightRadius: 8, background: T.vivid, color: "#fff" } : { borderBottomLeftRadius: 8, background: GRAY, color: INK }), ...PARAGRAPH, fontSize: 48, lineHeight: 1.1, ...style }}>
    {children}
  </div>
);

/** Typing indicator: three dots bouncing in turn */
const Typing: React.FC<{ frame: number; style?: React.CSSProperties }> = ({ frame, style }) => (
  <Bubble style={{ display: "flex", gap: 12, padding: "30px 32px", ...style }}>
    {[0, 1, 2].map((i) => (
      <div key={i} style={{ width: 18, height: 18, borderRadius: 9, background: MUTED, transform: `translateY(${-8 * Math.max(0, Math.sin(frame / 6 - i * 0.9))}px)` }} />
    ))}
  </Bubble>
);

/** Gray placeholder message (an ordinary chat in some other language) */
const Ghost: React.FC<{ me?: boolean; w: number; style?: React.CSSProperties }> = ({ me, w, style }) => (
  <div style={{ alignSelf: me ? "flex-end" : "flex-start", width: w, height: 70, borderRadius: 30, ...(me ? { borderBottomRightRadius: 8, background: T.pale } : { borderBottomLeftRadius: 8, background: GRAY }), ...style }} />
);

/* ───────── 1. Hook: an ordinary chat, then a Tatar "сәлам" pops in ───────── */

const Hook: React.FC<{ frame: number }> = ({ frame }) => {
  const card = pop(frame, 6, SPRING.smooth);
  const typing = frame >= F.tatar - 6 && frame < F.chat - 8;
  const salam = pop(frame, F.chat - 8, SPRING.bouncy);
  const out = progress(frame, F.tatar - 22, F.tatar - 8);
  return (
    <>
      {out < 1 && <Title text="большинство даже не *понимает*" frame={frame} at={[-30, -26, -22, -18]} size={88} style={{ opacity: 1 - out }} />}
      {out > 0 && <Title text="татарский начинается в *чате*" frame={frame} at={[F.tatar - 6, F.starts - 4, F.starts + 20, F.chat - 6]} size={84} />}
      <ChatCard top={440} height={780} style={card.style}>
        <Ghost w={380} style={pop(frame, 18, SPRING.smooth).style} />
        <Ghost me w={300} style={pop(frame, 40, SPRING.smooth).style} />
        <Ghost w={460} style={pop(frame, 64, SPRING.smooth).style} />
        <Ghost me w={240} style={pop(frame, 86, SPRING.smooth).style} />
        {typing && <Typing frame={frame} style={{ alignSelf: "flex-end", background: T.pale }} />}
        {salam.t > 0 && (
          <Bubble me style={{ ...salam.style, fontSize: 60, fontWeight: 700 }}>
            сәлам
          </Bubble>
        )}
      </ChatCard>
    </>
  );
};

/* ───────── 2. "I'll learn it someday": an unchecked to-do whose deadline keeps sliding ───────── */

const Someday: React.FC<{ frame: number }> = ({ frame }) => {
  const card = pop(frame, F.promise - 4, SPRING.smooth);
  const year = count(frame, F.lang, F.momIn - 10, 2026, 2034, ease.in);
  // the year chip jolts each time it slides one more year
  const yf = lerp(2026, 2034, ease.in(progress(frame, F.lang, F.momIn - 10)));
  const jolt = Math.sin((yf % 1) * Math.PI) * (year > 2026 ? 1 : 0);
  return (
    <>
      <Title text="выучу *когда-нибудь*" frame={frame} at={[F.promiseIn + 4, F.someday - 4]} size={96} />
      <div style={{ position: "absolute", top: 520, left: 130, right: 130, ...SURFACE, padding: 50, display: "flex", flexDirection: "column", gap: 40, ...card.style }}>
        <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
          <div style={{ width: 76, height: 76, borderRadius: 20, border: `6px solid #D5DCDD`, flex: "none" }} />
          <div style={{ ...PARAGRAPH, fontSize: 56, lineHeight: 1 }}>
            выучить <b style={{ color: T.main }}>язык</b>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20, paddingLeft: 106 }}>
          <div style={{ padding: "18px 26px", borderRadius: 20, background: T.pale, ...NUMBER, fontSize: 56, color: T.main, transform: `translateY(${-10 * jolt}px) rotate(${-3 * jolt}deg)` }}>{year}</div>
          <div style={{ flex: 1, height: 14, borderRadius: 7, background: GRAY }} />
        </div>
      </div>
      {/* calendar pages flying off */}
      {Array.from({ length: 6 }, (_, i) => {
        const p = progress(frame, F.lang + 10 + i * 12, F.lang + 40 + i * 12);
        if (p <= 0 || p >= 1) return null;
        return <div key={i} style={{ position: "absolute", left: 660 + i * 14, top: 900, width: 150, height: 170, ...SURFACE, opacity: 1 - p, transform: `translate(${p * 260}px, ${-p * 340}px) rotate(${p * 40}deg)` }}><div style={{ height: 40, borderRadius: "24px 24px 0 0", background: T.glow }} /></div>;
      })}
    </>
  );
};

/* ───────── 3. Today, to mom: her contact, an empty message field ───────── */

const Mom: React.FC<{ frame: number }> = ({ frame }) => {
  const card = pop(frame, F.today - 10, SPRING.bouncy);
  const field = pop(frame, F.phrase - 12, SPRING.smooth);
  const beat = 1 + 0.08 * Math.max(0, Math.sin((frame - F.mom) / 7)) * (frame > F.mom ? 1 : 0);
  const caret = Math.floor(frame / 18) % 2 === 0;
  return (
    <>
      <Title text="сегодня *маме*" frame={frame} at={[F.today - 4, F.mom - 4]} size={100} />
      <div style={{ position: "absolute", top: 470, left: 0, right: 0, display: "flex", justifyContent: "center", ...card.style }}>
        <div style={{ ...SURFACE, padding: 50, width: 640, display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
          <div style={{ width: 200, height: 200, borderRadius: 100, background: `linear-gradient(135deg, ${T.glow}, ${T.vivid})`, display: "grid", placeItems: "center", transform: `scale(${beat})` }}>
            <Heart size={92} color="#fff" fill="#fff" strokeWidth={1.6} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ ...PARAGRAPH, fontSize: 64, lineHeight: 1, fontWeight: 700 }}>мама</div>
            <div style={{ width: 22, height: 22, borderRadius: 11, background: "#3CC27A" }} />
          </div>
        </div>
      </div>
      {field.t > 0 && (
        <div style={{ position: "absolute", top: 960, left: 150, right: 150, ...SURFACE, padding: 34, display: "flex", alignItems: "center", gap: 22, ...field.style }}>
          <div style={{ width: 5, height: 60, borderRadius: 3, background: T.vivid, opacity: caret ? 1 : 0 }} />
          <div style={{ flex: 1 }} />
          <div style={{ padding: "14px 24px", borderRadius: 18, background: T.pale, ...NUMBER, fontSize: 44, color: T.main }}>
            1 <span style={{ ...PARAGRAPH, fontSize: 40, fontWeight: 700, color: T.main }}>фраза</span>
          </div>
        </div>
      )}
    </>
  );
};

/* ───────── 4. The phrase: "Әни ничек хәлләр" is typed word by word, then delivered ───────── */

const TATAR: [string, number][] = [["Әни", F.ani], ["ничек", F.nichek], ["хәлләр", F.hallar]];
const Tick: React.FC<{ x: number; on: number }> = ({ x, on }) => (
  <path d={`M${x} 22 l10 10 l20 -22`} fill="none" stroke={on > 0.5 ? T.vivid : "#C3CACB"} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
);
const Phrase: React.FC<{ frame: number }> = ({ frame }) => {
  const sent = springAt(frame, F.hallar + 36, SPRING.bouncy);
  const read = springAt(frame, F.dela - 10, SPRING.bouncy);
  const tr = pop(frame, F.mama - 6, SPRING.smooth);
  return (
    <>
      <ChatCard top={300} height={900}>
        <Ghost w={360} />
        <Ghost me w={260} />
        <div style={{ height: 20 }} />
        <Bubble me style={{ fontSize: 64, padding: "30px 38px", transform: `scale(${1 + 0.04 * Math.sin(Math.min(sent, 1) * Math.PI)})`, transformOrigin: "100% 100%" }}>
          {TATAR.map(([w, at], i) => {
            const t = springAt(frame, at - 6, SPRING.bouncy);
            return (
              <span key={w} style={{ display: "inline-block", marginRight: i < 2 ? "0.26em" : 0, fontWeight: i === 0 ? 700 : 500, opacity: Math.min(1, t * 1.5), transform: `translateY(${(1 - t) * 18}px) scale(${0.7 + 0.3 * t})` }}>
                {w}
              </span>
            );
          })}
        </Bubble>
        <svg width={70} height={40} style={{ alignSelf: "flex-end", marginTop: -10, opacity: Math.min(1, sent) }}>
          <Tick x={6} on={read} />
          <Tick x={26} on={read} />
        </svg>
        <div style={{ alignSelf: "flex-end", ...PARAGRAPH, fontSize: 52, color: MUTED, marginTop: 10, ...tr.style }}>мама как дела</div>
      </ChatCard>
    </>
  );
};

/* ───────── 5. She answers - and then sends three voice messages ───────── */

const Wave: React.FC<{ frame: number; seed: number }> = ({ frame, seed }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 7, height: 56 }}>
    <div style={{ width: 48, height: 48, borderRadius: 24, background: T.vivid, marginRight: 10, display: "grid", placeItems: "center" }}>
      <div style={{ width: 0, height: 0, borderTop: "11px solid transparent", borderBottom: "11px solid transparent", borderLeft: "17px solid #fff", marginLeft: 5 }} />
    </div>
    {Array.from({ length: 16 }, (_, i) => (
      <div key={i} style={{ width: 8, height: 12 + 36 * Math.abs(Math.sin(i * 1.7 + seed) * Math.cos(i * 0.6 + seed)), borderRadius: 4, background: i < ((frame / 3) % 16) ? T.main : "#BFC7C8" }} />
    ))}
  </div>
);
const VOICES = [F.surprise - 6, F.surprise + 16, F.surprise + 38];
const Reply: React.FC<{ frame: number }> = ({ frame }) => {
  const typing = frame >= F.replyIn + 4 && frame < F.answer + 8;
  const ans = pop(frame, F.answer + 8, SPRING.bouncy);
  return (
    <>
      <Title text="она *ответит*" frame={frame} at={[F.replyIn + 2, F.answer - 4]} size={100} />
      <ChatCard top={400} height={850}>
        <Bubble me style={{ fontSize: 46 }}>
          <b>Әни</b> ничек хәлләр
        </Bubble>
        {typing && <Typing frame={frame} />}
        {ans.t > 0 && (
          <Bubble style={{ ...ans.style, fontSize: 54 }}>
            әйбәт <b style={{ color: T.main }}>кызым</b>
          </Bubble>
        )}
        {VOICES.map((at, i) => {
          const p = pop(frame, at, SPRING.bouncy);
          return p.t > 0 ? (
            <Bubble key={i} style={{ ...p.style, padding: "20px 26px" }}>
              <Wave frame={frame} seed={i * 2.3} />
            </Bubble>
          ) : null;
        })}
      </ChatCard>
    </>
  );
};

/* ───────── 6. Small step vs big promise, then "send" ───────── */

const Step: React.FC<{ frame: number }> = ({ frame }) => {
  const out = ease.inOut(progress(frame, F.write - 20, F.write - 4));
  const small = springAt(frame, F.step - 6, SPRING.bouncy);
  const tower = springAt(frame, F.stepIn + 30, SPRING.smooth);
  // the big promise wobbles and sags on "обещания"
  const sag = ease.inOut(progress(frame, F.bigPromise, F.bigPromise + 40));
  const wob = shake(frame, F.bigPromise, 6, 40);
  const plate = pop(frame, F.write - 6, SPRING.bouncy);
  const press = springAt(frame, F.now + 4, SPRING.bouncy);
  const dip = 1 - 0.1 * Math.sin(Math.min(press, 1) * Math.PI);
  const ring = progress(frame, F.now + 6, F.now + 50);
  return (
    <>
      {out < 1 && <Title text="маленький *шаг*" frame={frame} at={[F.stepIn + 2, F.step - 4]} size={100} style={{ opacity: 1 - out }} />}
      {out > 0 && <Title text="напиши *сейчас*" frame={frame} at={[F.write - 4, F.now - 4]} size={100} />}
      {out < 1 && (
        <div style={{ position: "absolute", left: 160, right: 160, top: 400, height: 780, opacity: 1 - out }}>
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 10, borderRadius: 5, background: GRAY }} />
          <div style={{ position: "absolute", bottom: 10, left: 40, width: 280, height: 170, borderRadius: 24, background: T.vivid, boxShadow: `0 0 0 ${10 * Math.min(small, 1)}px ${T.pale}`, transform: `scaleY(${small})`, transformOrigin: "50% 100%", display: "grid", placeItems: "center" }}>
            <div style={{ ...NUMBER, fontSize: 56, color: "#fff" }}>
              1 <span style={{ ...PARAGRAPH, fontSize: 48, fontWeight: 700, color: "#fff" }}>фраза</span>
            </div>
          </div>
          <div style={{ position: "absolute", bottom: 10, right: 30, width: 300, height: 640 * (1 - 0.35 * sag), borderRadius: 24, border: `5px dashed #C9D0D1`, background: "rgba(236,238,238,0.6)", transform: `scaleY(${tower}) translateX(${wob}px) rotate(${sag * 7}deg)`, transformOrigin: "50% 100%", display: "grid", placeItems: "center", opacity: 1 - 0.4 * sag }}>
            <div style={{ ...PARAGRAPH, fontSize: 46, color: MUTED, transform: "rotate(-90deg)", whiteSpace: "nowrap" }}>обещание</div>
          </div>
        </div>
      )}
      {plate.t > 0 && (
        <div style={{ position: "absolute", top: 470, left: 150, right: 150, display: "flex", justifyContent: "center", ...plate.style }}>
          <div style={{ ...SURFACE, padding: 36, ...PARAGRAPH, fontSize: 56, lineHeight: 1, whiteSpace: "nowrap", transform: `translateY(${-140 * ring}px)`, opacity: 1 - ring, background: ring > 0 ? T.vivid : "#fff", color: ring > 0 ? "#fff" : INK }}>
            <b>Әни</b> ничек хәлләр
          </div>
        </div>
      )}
      {plate.t > 0 && (
        <div style={{ position: "absolute", top: 760, left: 0, right: 0, display: "flex", justifyContent: "center", ...plate.style }}>
          {ring > 0 && ring < 1 && <div style={{ position: "absolute", top: 60 - 140 * ring, left: "50%", width: 420 + 300 * ring, height: 120 + 280 * ring, marginLeft: -(210 + 150 * ring), borderRadius: 9999, border: `6px solid ${T.glow}`, opacity: 1 - ring }} />}
          <div style={{ transform: `scale(${2.4 * dip})` }}>
            <GlassPlate bg={`linear-gradient(135deg, #2FB3BA, ${T.main})`}>
              <Send size={18} strokeWidth={2.2} /> отправить
            </GlassPlate>
          </div>
        </div>
      )}
    </>
  );
};

/* ───────── Composition ───────── */

const SCENES: SceneDef[] = [
  { range: [0, F.promiseIn], El: Hook },
  { range: [F.promiseIn, F.momIn], El: Someday },
  { range: [F.momIn, F.phraseIn], El: Mom },
  { range: [F.phraseIn, F.replyIn], El: Phrase },
  { range: [F.replyIn, F.stepIn], El: Reply },
  { range: [F.stepIn, F.duration + 30], El: Step },
];

const SFX: Sfx[] = [
  { src: "sfx/07_CineStrike.wav", from: 2, volume: 0.18 },
  { src: "sfx2/click.mp3", from: 40, volume: 0.16 },
  { src: "sfx2/click.mp3", from: 86, volume: 0.16 },
  { src: "sfx2/pop.mp3", from: F.chat - 8, volume: 0.26 },
  // scene changes: textures from the SFX/ library (no whoosh)
  { src: "sfx/01_Ripple_Textures.wav", from: F.promiseIn - 8, volume: 0.18 },
  { src: "sfx/04_Cyber_Shift.wav", from: F.momIn - 8, volume: 0.2 },
  { src: "sfx/06_Ripple_Textures_II.wav", from: F.phraseIn - 8, volume: 0.2 },
  { src: "sfx/02_Alienated_Warpes.wav", from: F.replyIn - 8, volume: 0.14 },
  { src: "sfx/01_Ripple_Textures.wav", from: F.stepIn - 8, volume: 0.18 },
  // 2. the deadline slides
  { src: "sfx/05_Distortion_Glitch.wav", from: F.someday, volume: 0.04 },
  // 3. mom, the field
  { src: "sfx2/pop.mp3", from: F.today - 8, volume: 0.24 },
  { src: "sfx2/click.mp3", from: F.phrase - 10, volume: 0.2 },
  // 4. phrase typed, delivered, read
  ...TATAR.map(([, at]) => ({ src: "sfx2/click.mp3", from: at - 4, volume: 0.18 })),
  { src: "sfx2/pop.mp3", from: F.hallar + 36, volume: 0.22 },
  { src: "sfx2/ding.mp3", from: F.dela - 8, volume: 0.2 },
  // 5. reply + voice messages
  { src: "sfx2/pop.mp3", from: F.answer + 8, volume: 0.26 },
  ...VOICES.map((at) => ({ src: "sfx2/pop.mp3", from: at, volume: 0.2 })),
  // 6. big promise sags, send
  { src: "sfx/03_Basscrack.wav", from: F.bigPromise + 4, volume: 0.1 },
  { src: "sfx2/ding.mp3", from: F.now + 4, volume: 0.24 },
  { src: "sfx/07_CineStrike.wav", from: F.now + 20, volume: 0.12 },
];

// All 30 poses of the Alicja set, each at least once; a swap every ~0.6 s by the meaning of the line, never the same photo twice in a row
const AVATAR_KEYS: AvatarKey[] = [
  // 1. hook
  { at: 0, e: "explaining" },
  { at: 40, e: "shush" },
  { at: 80, e: "point-up" },
  { at: 120, e: "surprised" },
  { at: 160, e: "smile-up" },
  { at: 200, e: "point-right" },
  // 2. someday
  { at: F.promiseIn, e: "pensive" },
  { at: 285, e: "dreamy" },
  { at: 325, e: "shrug" },
  { at: 362, e: "skeptical" },
  { at: 398, e: "facepalm" },
  // 3. today, mom
  { at: F.momIn, e: "thinking" },
  { at: 468, e: "inspired" },
  { at: 506, e: "hand-on-heart" },
  { at: 550, e: "point-down" },
  { at: 580, e: "present-left" },
  // 4. the phrase
  { at: F.phraseIn, e: "waving" },
  { at: 650, e: "soft-smile" },
  { at: 705, e: "laughing" },
  { at: 750, e: "delighted" },
  // 5. reply
  { at: F.replyIn, e: "listening" },
  { at: 840, e: "clapping" },
  { at: 880, e: "heart-hands" },
  { at: 925, e: "victory" },
  // 6. small step
  { at: F.stepIn, e: "arms-crossed" },
  { at: 1005, e: "puzzled" },
  { at: 1040, e: "displeased" },
  { at: 1075, e: "disappointed" },
  { at: 1108, e: "stop" },
  { at: 1140, e: "thumbs-up" },
  { at: 1185, e: "point-down" },
];

const STANCES: StanceKey[] = [
  { at: 0, s: "center" },
  { at: F.promiseIn, s: "right" },
  { at: F.momIn, s: "left" },
  { at: F.phraseIn, s: "right" },
  { at: F.replyIn, s: "left" },
  { at: F.stepIn, s: "center" },
];

// Alicja photos: scale the wide-framed ones so every photo fills the 540x590 box by height (same as V21-V25)
const SIZE: Record<string, [number, number]> = {
  pensive: [1129, 1393], dreamy: [1293, 1216], displeased: [1254, 1254], surprised: [1280, 1229], waving: [1312, 1199], inspired: [1199, 1312], explaining: [1312, 1199], delighted: [1312, 1199], skeptical: [1312, 1199], laughing: [1385, 1136],
  puzzled: [1129, 1393], disappointed: [1278, 1230], "smile-up": [1199, 1312], thinking: [1129, 1393], "soft-smile": [1164, 1351], "point-up": [1312, 1199], "point-down": [1312, 1199], "present-left": [1312, 1199], "point-right": [1312, 1199], shrug: [1312, 1199],
  "hand-on-heart": [1312, 1199], stop: [1312, 1199], shush: [1199, 1312], clapping: [1312, 1199], "thumbs-up": [1312, 1199], "arms-crossed": [1199, 1312], facepalm: [1312, 1199], "heart-hands": [1312, 1199], victory: [1312, 1199], listening: [1312, 1199],
};
const FIT = Object.fromEntries(Object.entries(SIZE).map(([e, [w, h]]) => [e, Math.max(1, w / h / (540 / 590))])) as Partial<Record<Emotion, number>>;

const Host: React.FC<{ frame: number }> = ({ frame }) => <TatAvatar frame={frame} keys={AVATAR_KEYS} words={WORDS} stances={STANCES} dir="v29/avatar" fit={FIT} />;

export const Video29: React.FC = () => (
  <AbsoluteFill style={{ background: "#fff", fontFamily: PARAGRAPH.fontFamily, color: INK }}>
    <ReelShell scenes={SCENES} headlines={[]} vo={VO} sfx={SFX} duration={F.duration} music="v29/music/bed.mp3" musicLevel={[0.045, 0.11]} overlay={Host} bg={BG} />
  </AbsoluteFill>
);
