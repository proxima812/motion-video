import React from "react";
import { AbsoluteFill } from "remotion";
import { Users } from "lucide-react";
import { SPRING, ease, lerp, progress, springAt } from "../stage/motion";
import { ReelShell, pop, type SceneDef, type Sfx } from "../kit/reel";
import { TatAvatar, type AvatarKey, type Emotion, type StanceKey } from "../kit/TatAvatar";
import { DotOrbitBg } from "../kit/DotOrbitBg";
import { HEADING, INK, NUMBER, PARAGRAPH, SURFACE } from "../kit/design";
import { GlassPlate } from "../catalog/own/glass";
import { F, VO } from "./timeline";
import { WORDS } from "./words";

// "Твоя профессия тоже нужна культуре" (@the_tatarverse, RU, main host preset Ahu). ~20 s.
// Culture needs more than singers and poets -> designer, programmer, photographer? -> you can help: a poster, a club page, meetup photos.
// Own kit only. Palette: indigo (craft, skill, work). Dot Orbit variant 4 (output/bg-variant.txt).
const T = { main: "#2E2F8F", vivid: "#4B4DD1", glow: "#B0B1F0", pale: "#EDEDFC" };
const PLATE_INDIGO = "linear-gradient(135deg, #7173E6, #2E2F8F)";
const BG = <DotOrbitBg variant={4} />;
const GRAY = "#E6E6EE";

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

/* Drawn role glyphs (shapes, not icons), 120x120 */
const Swatches: React.FC = () => (
  <svg width={120} height={120}>
    <circle cx={45} cy={48} r={30} fill={T.glow} />
    <circle cx={75} cy={48} r={30} fill={T.vivid} opacity={0.85} />
    <circle cx={60} cy={76} r={30} fill={T.main} opacity={0.8} />
  </svg>
);
const Code: React.FC = () => (
  <svg width={120} height={120}>
    {[
      [14, 22, 60, T.main],
      [34, 44, 70, T.vivid],
      [34, 66, 44, T.glow],
      [14, 88, 52, T.main],
    ].map(([x, y, w, c], i) => (
      <rect key={i} x={x as number} y={y as number} width={w as number} height={12} rx={6} fill={c as string} />
    ))}
  </svg>
);
const Cam: React.FC = () => (
  <svg width={120} height={120}>
    <rect x={40} y={20} width={40} height={18} rx={6} fill={T.main} />
    <rect x={10} y={32} width={100} height={70} rx={16} fill={T.main} />
    <circle cx={60} cy={67} r={24} fill="#fff" />
    <circle cx={60} cy={67} r={14} fill={T.glow} />
  </svg>
);
const ROLES = [
  { w: "дизайнер", G: Swatches, at: F.designer },
  { w: "программист", G: Code, at: F.coder },
  { w: "фотограф", G: Cam, at: F.photographer },
];

/** Club poster (base 520x700): color block with an ornament, title, time */
const Poster: React.FC<{ frame: number; at?: number[]; blank?: boolean }> = ({ frame, at = [-99, -99, -99, -99], blank }) => {
  const [a, b, c, d] = at.map((x) => pop(frame, x, SPRING.bouncy));
  return (
    <div style={{ width: 520, ...SURFACE, padding: 36, display: "flex", flexDirection: "column", gap: 30, boxSizing: "border-box" }}>
      <div style={{ height: 330, borderRadius: 20, background: `linear-gradient(160deg, ${T.vivid}, ${T.main})`, position: "relative", overflow: "hidden", ...a.style }}>
        {[0, 1, 2, 3].map((k) => (
          <div key={k} style={{ position: "absolute", left: "50%", top: "50%", width: 80 + k * 90, height: 80 + k * 90, marginLeft: -(40 + k * 45), marginTop: -(40 + k * 45), borderRadius: "50%", border: `4px solid ${T.glow}`, opacity: 0.7 - k * 0.15 }} />
        ))}
      </div>
      {blank ? (
        <>
          <div style={{ width: 380, height: 46, borderRadius: 23, background: INK, opacity: 0.85 }} />
          <div style={{ width: 200, height: 46, borderRadius: 23, background: T.main }} />
          <div style={{ width: 160, height: 40, borderRadius: 20, background: T.glow }} />
        </>
      ) : (
        <>
      <div style={{ ...HEADING, fontSize: 66, lineHeight: 1, ...b.style }}>татарский</div>
      <div style={{ ...HEADING, fontSize: 66, lineHeight: 1, fontWeight: 700, color: T.main, marginTop: -14, ...c.style }}>клуб</div>
      <div style={{ ...NUMBER, fontSize: 56, color: T.vivid, ...d.style }}>19:00</div>
        </>
      )}
    </div>
  );
};

/** Club page in a browser (base 500x640) */
const Page: React.FC<{ frame: number; at?: number }> = ({ frame, at = -99 }) => (
  <div style={{ width: 500, height: 640, ...SURFACE, padding: 32, boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 26 }}>
    <div style={{ display: "flex", gap: 10 }}>
      {[0, 1, 2].map((k) => (
        <div key={k} style={{ width: 18, height: 18, borderRadius: 9, background: GRAY }} />
      ))}
      <div style={{ flex: 1, height: 18, borderRadius: 9, background: T.pale, marginLeft: 10 }} />
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 22, ...pop(frame, at, SPRING.bouncy).style }}>
      <div style={{ width: 96, height: 96, borderRadius: 48, background: `linear-gradient(160deg, ${T.vivid}, ${T.main})` }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ width: 200, height: 20, borderRadius: 10, background: T.main }} />
        <div style={{ width: 140, height: 16, borderRadius: 8, background: GRAY }} />
      </div>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, flex: 1 }}>
      {[0, 1, 2, 3].map((k) => (
        <div key={k} style={{ borderRadius: 16, background: [T.glow, T.pale, T.pale, T.glow][k], ...pop(frame, at + 8 + k * 6, SPRING.bouncy).style }} />
      ))}
    </div>
  </div>
);

/** Meetup: four people around a table with tea (base 760x460) */
const Meetup: React.FC<{ frame: number; still?: boolean }> = ({ frame, still }) => {
  const people = [T.vivid, T.glow, T.main, "#8E8FE0"];
  return (
    <div style={{ position: "relative", width: 760, height: 460 }}>
      {people.map((c, i) => {
        const x = 110 + i * 180;
        const bob = still ? 0 : Math.sin((frame + i * 17) / 11) * 6;
        return (
          <div key={i} style={{ position: "absolute", left: x - 60, top: 70 + bob }}>
            <div style={{ width: 90, height: 90, borderRadius: 45, background: c, margin: "0 auto" }} />
            <div style={{ width: 130, height: 150, borderRadius: "60px 60px 20px 20px", background: c, opacity: 0.55, marginTop: 10, marginLeft: -20 }} />
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 20, right: 20, top: 300, height: 70, borderRadius: 24, background: "#fff", boxShadow: SURFACE.boxShadow }} />
      {[180, 380, 580].map((x) => (
        <div key={x} style={{ position: "absolute", left: x, top: 262, width: 54, height: 44, borderRadius: "6px 6px 20px 20px", background: T.pale, border: `5px solid ${T.vivid}` }} />
      ))}
    </div>
  );
};

/* ───────── 1. Hook: spotlight on singers and poets, empty seats around them ───────── */

const Hook: React.FC<{ frame: number }> = ({ frame }) => {
  const first = fadeOut(frame, F.culture - 14);
  const light = ease.out(progress(frame, 6, 40));
  const slots = [0, 1, 2].map((k) => pop(frame, F.poets + 10 + k * 6, SPRING.bouncy));
  return (
    <>
      {first > 0 && <Title text="никто не хочет *признавать*" frame={frame} at={[-30, -24, -18, F.admit - 6]} size={92} style={{ opacity: first }} />}
      {frame >= F.culture - 6 && <Title text="культуре нужны" frame={frame} at={[F.culture - 4, F.culture + 22]} size={92} />}
      {frame >= F.culture - 6 && <Title text="*не только*" frame={frame} at={[F.notOnly, F.notOnly + 8]} size={92} top={275} />}
      <svg width={1080} height={1300} style={{ position: "absolute", inset: 0, opacity: light }}>
        <defs>
          <linearGradient id="v34spot" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={T.glow} stopOpacity={0.0} />
            <stop offset="1" stopColor={T.glow} stopOpacity={0.55} />
          </linearGradient>
        </defs>
        <polygon points="470,380 610,380 900,860 180,860" fill="url(#v34spot)" />
      </svg>
      {[
        { w: "певцы", at: F.singers, x: 170 },
        { w: "поэты", at: F.poets, x: 560 },
      ].map((c) => {
        const p = pop(frame, c.at - 6, SPRING.bouncy);
        return (
          <div key={c.w} style={{ position: "absolute", left: c.x, top: 650, width: 350, height: 190, ...SURFACE, display: "grid", placeItems: "center", ...PARAGRAPH, fontWeight: 700, fontSize: 68, lineHeight: 1, color: T.main, ...p.style }}>
            {c.w}
          </div>
        );
      })}
      {slots.map((p, k) => (
        <div key={k} style={{ position: "absolute", left: 110 + k * 300, top: 920, width: 260, height: 160, borderRadius: 24, border: `5px dashed ${T.glow}`, display: "grid", placeItems: "center", ...p.style }}>
          <div style={{ position: "relative", width: 56, height: 56 }}>
            <div style={{ position: "absolute", left: 22, top: 0, width: 12, height: 56, borderRadius: 6, background: T.glow }} />
            <div style={{ position: "absolute", top: 22, left: 0, height: 12, width: 56, borderRadius: 6, background: T.glow }} />
          </div>
        </div>
      ))}
    </>
  );
};

/* ───────── 2. Designer, programmer or photographer? Three role tiles, a highlight jumps between them ───────── */

const Who: React.FC<{ frame: number }> = ({ frame }) => {
  const cur = ROLES.reduce((acc, r, i) => (frame >= r.at - 6 ? i : acc), -1);
  return (
    <>
      <Title text="а *ты*" frame={frame} at={[F.whoIn + 4, F.whoIn + 12]} size={100} />
      {ROLES.map((r, i) => {
        const p = pop(frame, r.at - 8, SPRING.bouncy);
        const on = i === cur;
        return (
          <div key={r.w} style={{ position: "absolute", left: 110, right: 110, top: 400 + i * 250, height: 200, ...SURFACE, padding: 40, boxSizing: "border-box", display: "flex", alignItems: "center", gap: 44, outline: on ? `6px solid ${T.glow}` : "none", ...p.style, transform: `${p.style.transform} scale(${on ? 1.03 : 1})` }}>
            <r.G />
            <span style={{ ...PARAGRAPH, fontSize: 68, lineHeight: 1, fontWeight: on ? 700 : 400, color: on ? T.main : INK }}>{r.w}</span>
          </div>
        );
      })}
    </>
  );
};

/* ───────── 3. You can surely help: the three tiles line up and each gets a check ───────── */

const Check: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: "absolute", right: -18, top: -18, width: 76, height: 76, borderRadius: 38, background: T.vivid, border: "6px solid #fff", display: "grid", placeItems: "center", transform: `scale(${t})` }}>
    <svg width={40} height={40}>
      <path d="M8 21 L17 30 L33 11" fill="none" stroke="#fff" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);
const Help: React.FC<{ frame: number }> = ({ frame }) => {
  const checks = [F.surely, F.some, F.help];
  const fill = ease.out(progress(frame, F.surely, F.help + 20));
  return (
    <>
      <Title text="тебе точно есть чем *помочь*" frame={frame} at={[F.helpIn + 2, F.surely, F.some, F.some + 8, F.help]} size={92} />
      {ROLES.map((r, i) => {
        const p = pop(frame, F.helpIn + 4 + i * 5, SPRING.smooth);
        return (
          <div key={r.w} style={{ position: "absolute", left: 110 + i * 300, top: 600, width: 260, height: 260, ...SURFACE, display: "grid", placeItems: "center", ...p.style }}>
            <div style={{ transform: "scale(1.5)" }}>
              <r.G />
            </div>
            <Check t={springAt(frame, checks[i] - 4, SPRING.bouncy)} />
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 110, right: 110, top: 960, height: 28, borderRadius: 14, background: GRAY, overflow: "hidden" }}>
        <div style={{ width: `${fill * 100}%`, height: "100%", borderRadius: 14, background: `linear-gradient(90deg, ${T.glow}, ${T.vivid})` }} />
      </div>
    </>
  );
};

/* ───────── 4. Make a poster for a Tatar club... or its page online ───────── */

const PosterScene: React.FC<{ frame: number }> = ({ frame }) => {
  const s = ease.inOut(progress(frame, F.orPage - 8, F.orPage + 22));
  const first = fadeOut(frame, F.orPage - 10);
  const page = pop(frame, F.page - 12, SPRING.smooth);
  return (
    <>
      {first > 0 && <Title text="сделай *афишу*" frame={frame} at={[F.posterIn + 2, F.poster]} size={100} style={{ opacity: first }} />}
      {frame >= F.orPage - 6 && <Title text="или *страницу* в сети" frame={frame} at={[F.orPage - 4, F.page, F.online - 6, F.online]} size={92} />}
      <div style={{ position: "absolute", left: lerp(280, 100, s), top: lerp(400, 520, s), transform: `scale(${lerp(1, 0.66, s)})`, transformOrigin: "0 0" }}>
        <Poster frame={frame} at={[F.poster - 6, F.tatar - 4, F.club - 4, F.club + 18]} />
      </div>
      {page.t > 0 && (
        <div style={{ position: "absolute", left: 480, top: 470, ...page.style }}>
          <Page frame={frame} at={F.page} />
        </div>
      )}
    </>
  );
};

/* ───────── 5. Or just take photos at a meetup: viewfinder, flash, a print drops in ───────── */

const Corner: React.FC<{ x: number; y: number; r: number }> = ({ x, y, r }) => (
  <div style={{ position: "absolute", left: x, top: y, width: 70, height: 70, borderTop: `8px solid ${T.main}`, borderLeft: `8px solid ${T.main}`, borderRadius: "16px 0 0 0", transform: `rotate(${r}deg)` }} />
);
const PhotoScene: React.FC<{ frame: number }> = ({ frame }) => {
  const vf = pop(frame, F.photoIn + 6, SPRING.smooth);
  const flash = 1 - progress(frame, F.photo, F.photo + 16);
  const print = springAt(frame, F.meetup, SPRING.bouncy);
  const L = 120, R = 960, Tp = 430, B = 1000;
  return (
    <>
      <Title text="или просто *сними фото*" frame={frame} at={[F.photoIn + 2, F.just, F.shoot, F.photo - 6]} size={92} />
      <div style={{ position: "absolute", inset: 0, ...vf.style }}>
        <Corner x={L} y={Tp} r={0} />
        <Corner x={R - 70} y={Tp} r={90} />
        <Corner x={R - 70} y={B - 70} r={180} />
        <Corner x={L} y={B - 70} r={270} />
        <div style={{ position: "absolute", left: 160, top: 470, width: 26, height: 26, borderRadius: 13, background: "#FF3B30", opacity: Math.floor(frame / 20) % 2 ? 1 : 0.3 }} />
        <div style={{ position: "absolute", left: 160, top: 510 }}>
          <Meetup frame={frame} still={frame >= F.photo} />
        </div>
      </div>
      {frame >= F.photo && flash > 0 && <div style={{ position: "absolute", left: L, top: Tp, width: R - L, height: B - Tp, background: "#fff", opacity: flash, borderRadius: 16 }} />}
      {print > 0 && (
        <div style={{ position: "absolute", left: 560, top: 760, width: 400, ...SURFACE, padding: "22px 22px 70px", transform: `translateY(${(1 - print) * 300}px) rotate(${lerp(18, 6, Math.min(print, 1))}deg)`, opacity: Math.min(1, print * 2) }}>
          <div style={{ height: 250, borderRadius: 12, background: T.pale, overflow: "hidden", position: "relative" }}>
            <div style={{ position: "absolute", left: 4, top: -20, transform: "scale(0.47)", transformOrigin: "0 0" }}>
              <Meetup frame={frame} still />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

/* ───────── 6. Your profession is needed by culture too: poster, page, photo in one fan + "в команде" ───────── */

const Final: React.FC<{ frame: number }> = ({ frame }) => {
  const items = [
    { el: <Poster frame={frame} blank />, s: 0.5, r: -10, x: 150, y: 560, at: F.job },
    { el: <Page frame={frame} />, s: 0.55, r: 0, x: 400, y: 520, at: F.too },
    {
      el: (
        <div style={{ width: 460, ...SURFACE, padding: "24px 24px 80px" }}>
          <div style={{ height: 290, borderRadius: 12, background: T.pale, overflow: "hidden", position: "relative" }}>
            <div style={{ position: "absolute", left: 6, top: -16, transform: "scale(0.55)", transformOrigin: "0 0" }}>
              <Meetup frame={frame} still />
            </div>
          </div>
        </div>
      ),
      s: 0.6,
      r: 9,
      x: 650,
      y: 580,
      at: F.needed,
    },
  ];
  const plate = pop(frame, F.cultureEnd, SPRING.bouncy);
  return (
    <>
      <Title text="твоя профессия тоже нужна *культуре*" frame={frame} at={[F.finalIn + 2, F.job, F.too, F.needed, F.cultureEnd]} size={80} />
      {items.map((it, i) => {
        const t = springAt(frame, it.at - 10, SPRING.bouncy);
        return (
          <div key={i} style={{ position: "absolute", left: it.x, top: it.y, transform: `translateY(${(1 - t) * 160}px) rotate(${it.r * Math.min(t, 1.1)}deg) scale(${it.s})`, transformOrigin: "0 0", opacity: Math.min(1, t * 1.6) }}>
            {it.el}
          </div>
        );
      })}
      {plate.t > 0 && (
        <div style={{ position: "absolute", top: 1070, left: 0, right: 0, display: "flex", justifyContent: "center", ...plate.style }}>
          <div style={{ transform: "scale(2.3)" }}>
            <GlassPlate bg={PLATE_INDIGO}>
              <Users size={20} strokeWidth={2.2} /> в команде
            </GlassPlate>
          </div>
        </div>
      )}
    </>
  );
};

/* ───────── Composition ───────── */

const SCENES: SceneDef[] = [
  { range: [0, F.whoIn], El: Hook },
  { range: [F.whoIn, F.helpIn], El: Who },
  { range: [F.helpIn, F.posterIn], El: Help },
  { range: [F.posterIn, F.photoIn], El: PosterScene },
  { range: [F.photoIn, F.finalIn], El: PhotoScene },
  { range: [F.finalIn, F.duration + 30], El: Final },
];

const SFX: Sfx[] = [
  { src: "sfx/07_CineStrike.wav", from: 2, volume: 0.18 },
  { src: "sfx2/pop.mp3", from: F.singers - 6, volume: 0.22 },
  { src: "sfx2/pop.mp3", from: F.poets - 6, volume: 0.22 },
  { src: "sfx2/click.mp3", from: F.poets + 10, volume: 0.18 },
  // scene changes: textures from the SFX/ library (no whoosh)
  { src: "sfx/01_Ripple_Textures.wav", from: F.whoIn - 8, volume: 0.18 },
  { src: "sfx/04_Cyber_Shift.wav", from: F.helpIn - 8, volume: 0.2 },
  { src: "sfx/06_Ripple_Textures_II.wav", from: F.posterIn - 8, volume: 0.2 },
  { src: "sfx/02_Alienated_Warpes.wav", from: F.photoIn - 8, volume: 0.14 },
  { src: "sfx/01_Ripple_Textures.wav", from: F.finalIn - 8, volume: 0.18 },
  // 2. roles
  ...ROLES.map((r) => ({ src: "sfx2/click.mp3", from: r.at - 6, volume: 0.2 })),
  // 3. checks
  { src: "sfx2/pop.mp3", from: F.surely - 4, volume: 0.22 },
  { src: "sfx2/pop.mp3", from: F.some - 4, volume: 0.22 },
  { src: "sfx2/ding.mp3", from: F.help - 4, volume: 0.2 },
  // 4. poster, page
  { src: "sfx2/pop.mp3", from: F.poster - 6, volume: 0.22 },
  { src: "sfx2/click.mp3", from: F.club - 4, volume: 0.2 },
  { src: "sfx2/pop.mp3", from: F.page - 12, volume: 0.22 },
  // 5. shutter
  { src: "sfx/03_Basscrack.wav", from: F.photo, volume: 0.1 },
  { src: "sfx2/pop.mp3", from: F.meetup, volume: 0.2 },
  // 6. fan + plate
  { src: "sfx2/pop.mp3", from: F.job - 10, volume: 0.2 },
  { src: "sfx2/pop.mp3", from: F.too - 10, volume: 0.2 },
  { src: "sfx2/pop.mp3", from: F.needed - 10, volume: 0.2 },
  { src: "sfx/07_CineStrike.wav", from: F.cultureEnd, volume: 0.12 },
];

// All 30 poses of the main set, each at least once; a swap every ~0.7 s by the meaning of the line, never the same photo twice in a row
const AVATAR_KEYS: AvatarKey[] = [
  // 1. hook: nobody wants to admit
  { at: 0, e: "arms-crossed" },
  { at: 36, e: "displeased" },
  { at: 72, e: "shush" },
  { at: 108, e: "stop" },
  { at: 144, e: "point-up" },
  { at: 180, e: "disappointed" },
  { at: 215, e: "present-left" },
  { at: 252, e: "shrug" },
  // 2. designer, programmer, photographer?
  { at: F.whoIn, e: "puzzled" },
  { at: 325, e: "thinking" },
  { at: 360, e: "point-right" },
  { at: 395, e: "surprised" },
  { at: 430, e: "skeptical" },
  { at: 460, e: "listening" },
  // 3. you can surely help
  { at: F.helpIn, e: "facepalm" },
  { at: 525, e: "thumbs-up" },
  { at: 575, e: "hand-on-heart" },
  // 4. poster, page
  { at: F.posterIn, e: "inspired" },
  { at: 665, e: "point-down" },
  { at: 705, e: "explaining" },
  { at: 750, e: "delighted" },
  { at: 795, e: "pensive" },
  { at: 840, e: "soft-smile" },
  // 5. photos
  { at: F.photoIn, e: "laughing" },
  { at: 915, e: "waving" },
  { at: 955, e: "smile-up" },
  { at: 995, e: "clapping" },
  // 6. your profession is needed
  { at: F.finalIn, e: "heart-hands" },
  { at: 1075, e: "dreamy" },
  { at: 1120, e: "victory" },
];

const STANCES: StanceKey[] = [
  { at: 0, s: "right" },
  { at: F.whoIn, s: "left" },
  { at: F.helpIn, s: "center" },
  { at: F.posterIn, s: "right" },
  { at: F.photoIn, s: "left" },
  { at: F.finalIn, s: "center" },
];

// Main set photos: scale the wide-framed ones so every photo fills the 540x590 box by height (same as V24)
const SIZE: Record<string, [number, number]> = {
  pensive: [1312, 1199], dreamy: [1293, 1217], displeased: [1254, 1254], surprised: [1280, 1229], waving: [1312, 1199], inspired: [1199, 1312], explaining: [1312, 1199], delighted: [1312, 1199], skeptical: [1312, 1199], laughing: [1385, 1136],
  puzzled: [1152, 1366], disappointed: [1278, 1230], "smile-up": [1199, 1312], thinking: [1190, 1322], "soft-smile": [1218, 1291], "point-up": [1312, 1199], "point-down": [1312, 1199], "present-left": [1312, 1199], "point-right": [1312, 1199], shrug: [1312, 1199],
  "hand-on-heart": [1312, 1199], stop: [1312, 1199], shush: [1312, 1199], clapping: [1278, 1230], "thumbs-up": [1312, 1199], "arms-crossed": [1312, 1199], facepalm: [1312, 1199], "heart-hands": [1312, 1199], victory: [1312, 1199], listening: [1312, 1199],
};
const FIT = Object.fromEntries(Object.entries(SIZE).map(([e, [w, h]]) => [e, Math.max(1, w / h / (540 / 590))])) as Partial<Record<Emotion, number>>;

const Host: React.FC<{ frame: number }> = ({ frame }) => <TatAvatar frame={frame} keys={AVATAR_KEYS} words={WORDS} stances={STANCES} fit={FIT} />;

export const Video34: React.FC = () => (
  <AbsoluteFill style={{ background: "#fff", fontFamily: PARAGRAPH.fontFamily, color: INK }}>
    <ReelShell scenes={SCENES} headlines={[]} vo={VO} sfx={SFX} duration={F.duration} music="v34/music/bed.mp3" musicLevel={[0.045, 0.11]} overlay={Host} bg={BG} />
  </AbsoluteFill>
);
