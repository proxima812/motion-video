import React from "react";
import { AbsoluteFill } from "remotion";
import { BookOpen, CalendarDays, Check, Clock, Heart, Landmark, Megaphone, Music2, Palette, Rocket, Users, Languages, Sparkles, Theater, HandHeart } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/reui/badge";
import { Card } from "@/components/reui/luma/card";
import { IconTile } from "@/components/reui/icon-tile";
import { Progress } from "@/components/ui/progress";
import { SPRING, ease, lerp, progress, springAt } from "../stage/motion";
import { ReelShell, pop, type SceneDef, type Sfx } from "../kit/reel";
import { TatAvatar, type AvatarKey, type Emotion, type StanceKey } from "../kit/TatAvatar";
import { DotOrbitBg } from "../kit/DotOrbitBg";
import { HEADING, INK, INTER, NUMBER, PARAGRAPH, SURFACE } from "../kit/design";
import { GlassPlate, PLATE } from "../catalog/own/glass";
import { Mark, Strike } from "../catalog/own/text";
import { F, VO } from "./timeline";
import { WORDS } from "./words";

// "Почему национальные проекты остаются незамеченными" (@the_tatarverse, RU, host preset 2 Alicja).
// Projects exist but fade out of sight; the reasons one by one; promotion = delivering info; silence = invisible.
// ReUI (Card, IconTile, Badge, Avatar, Progress) + own kit. Accent: tatarverse brand green. Dot Orbit variant 5 (output/bg-variant.txt).
const G = { main: "#18734F", vivid: "#1C8259", glow: "#7CC5A6", pale: "#E8F5EE" };
const BG = <DotOrbitBg variant={5} />;
const W = 1080;
const UI = `${INTER}, sans-serif`;
const MUTED = "#8A8792";

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
const Title: React.FC<{ text: string; frame: number; at: number | number[]; stagger?: number; size?: number; top?: number; style?: React.CSSProperties }> = ({ text, frame, at, stagger = 3, size = 80, top = 170, style }) => (
  <div style={{ ...HEADING, position: "absolute", left: 100, right: 100, top, textAlign: "center", fontSize: size, ...style }}>
    {keyWords(text).map(([raw, key], i, all) => {
      const t = springAt(frame, Array.isArray(at) ? at[i] : at + i * stagger, SPRING.smooth);
      return (
        <span key={i} style={{ display: "inline-block", marginRight: i < all.length - 1 ? "0.24em" : 0, fontWeight: key ? 700 : 400, color: key ? G.main : undefined, opacity: Math.min(1, t * 1.3), transform: `translateY(${(1 - t) * 30}px)`, filter: `blur(${Math.max(0, (1 - t) * 8)}px)` }}>
          {raw}
        </span>
      );
    })}
  </div>
);

/** Web UI (ReUI, sized for 14-16 px) laid out at native width `w` and scaled by `s`; left = screen x (centered when omitted) */
const Zoom: React.FC<{ top: number; w: number; s: number; left?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ top, w, s, left, style, children }) => (
  <div style={{ position: "absolute", top, left: left ?? (W - w * s) / 2, width: w, transform: `scale(${s})`, transformOrigin: "0 0" }}>
    <div style={style}>{children}</div>
  </div>
);

/** The one design-system surface for web UI drawn small and scaled by `s` */
const webSurface = (s: number): React.CSSProperties => ({ background: "#fff", border: "none", borderRadius: 24 / s, boxShadow: `${-1 / s}px ${-6 / s}px ${55 / s}px ${-11 / s}px rgba(144, 142, 142, 0.2)`, color: INK });

const Bar: React.FC<{ w: number | string; h?: number; color?: string }> = ({ w, h = 6, color = "#E6E6EA" }) => <div style={{ width: w, height: h, borderRadius: h / 2, background: color }} />;

const tile = (color = G.vivid): React.CSSProperties => ({ color, borderColor: G.pale, background: "#fff" });

/** Big own-kit tile (SURFACE) with one icon */
const Tile: React.FC<{ icon: React.ElementType; size?: number; color?: string; style?: React.CSSProperties }> = ({ icon: Icon, size = 130, color = G.vivid, style }) => (
  <div style={{ ...SURFACE, width: size, height: size, display: "grid", placeItems: "center", ...style }}>
    <Icon size={size * 0.44} color={color} strokeWidth={1.8} />
  </div>
);

/* ───────── 1. Hook: projects exist, then fade almost out of sight ───────── */

const PROJECTS = [Landmark, Music2, BookOpen, Users, Languages, Palette, Theater, HandHeart, CalendarDays];
const Hook: React.FC<{ frame: number }> = ({ frame }) => {
  const swap = progress(frame, F.invisible - 30, F.invisible - 18);
  return (
    <>
      <Title text="проекты *есть*" frame={frame} at={[-40, -30]} size={96} style={{ opacity: 1 - swap }} />
      {swap > 0 && <Title text="но их *не видно*" frame={frame} at={F.invisible - 24} size={96} />}
      <div style={{ position: "absolute", top: 420, left: 170, width: 740, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", rowGap: 50, justifyItems: "center" }}>
        {PROJECTS.map((icon, i) => {
          const p = springAt(frame, -60 + i * 4, SPRING.bouncy);
          // each card fades with its own small delay, down to a ghost
          const f = ease.inOut(progress(frame, F.invisible - 20 + (i % 3) * 5, F.invisible + 20 + (i % 3) * 5));
          return <Tile key={i} icon={icon} size={190} style={{ transform: `scale(${p})`, opacity: lerp(1, 0.1, f), filter: f > 0 ? `blur(${f * 10}px) grayscale(${f})` : undefined }} />;
        })}
      </div>
    </>
  );
};

/* ───────── 2. All over the world: a dotted world lights up, three kinds of projects ───────── */

// pins on an abstract dot world, x/y in the 320 x 170 card space
const PINS = [
  { x: 214, y: 54 }, { x: 196, y: 50 }, { x: 226, y: 62 }, { x: 160, y: 46 }, { x: 150, y: 56 }, { x: 172, y: 70 },
  { x: 250, y: 74 }, { x: 236, y: 82 }, { x: 70, y: 60 }, { x: 46, y: 50 }, { x: 140, y: 40 }, { x: 278, y: 120 },
];
const KINDS = [
  { at: F.centers, w: "центры" },
  { at: F.societies, w: "общества" },
  { at: F.clubs, w: "клубы" },
];
const World: React.FC<{ frame: number }> = ({ frame }) => {
  const s = 2.75;
  const card = pop(frame, F.worldIn + 4, SPRING.smooth);
  return (
    <>
      <Title text="по всему *миру*" frame={frame} at={[F.worldIn + 6, F.worldIn + 14, F.world]} />
      <Zoom top={380} w={320} s={s} style={card.style}>
        <Card style={{ ...webSurface(s), padding: 0, gap: 0, overflow: "hidden" }}>
          <div style={{ position: "relative", width: 320, height: 170, background: "#F8F8FA" }}>
            <svg width={320} height={170} viewBox="0 0 320 170" style={{ position: "absolute", inset: 0 }}>
              {Array.from({ length: 32 * 17 }, (_, i) => {
                const x = 5 + (i % 32) * 10;
                const y = 5 + Math.floor(i / 32) * 10;
                // rough continents: Americas, Europe/Africa, Asia, Australia
                const land =
                  ((x - 60) / 36) ** 2 + ((y - 55) / 30) ** 2 < 1 || ((x - 85) / 18) ** 2 + ((y - 120) / 34) ** 2 < 1 || ((x - 160) / 26) ** 2 + ((y - 52) / 20) ** 2 < 1 ||
                  ((x - 165) / 22) ** 2 + ((y - 110) / 36) ** 2 < 1 || ((x - 230) / 52) ** 2 + ((y - 60) / 32) ** 2 < 1 || ((x - 275) / 22) ** 2 + ((y - 128) / 14) ** 2 < 1;
                return <circle key={i} cx={x} cy={y} r={land ? 2.1 : 1.1} fill={land ? "#D6D9DE" : "#EEEEF1"} />;
              })}
            </svg>
            {PINS.map((p, i) => {
              const t = springAt(frame, F.world + 6 + i * 9, SPRING.bouncy);
              return <div key={i} style={{ position: "absolute", left: p.x - 5, top: p.y - 5, width: 10, height: 10, borderRadius: 5, background: G.vivid, border: "2px solid #fff", transform: `scale(${t})`, boxShadow: `0 0 0 ${3 * Math.min(t, 1)}px ${G.glow}55` }} />;
            })}
          </div>
        </Card>
      </Zoom>
      <div style={{ position: "absolute", top: 940, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 26 }}>
        {KINDS.map((k) => {
          const p = pop(frame, k.at - 4, SPRING.bouncy);
          return (
            <div key={k.w} style={{ ...p.style, transform: `${p.style.transform}` }}>
              <div style={{ transform: "scale(3.2)", transformOrigin: "50% 0", margin: "0 100px" }}>
                <Badge variant="outline" style={{ background: "#fff", borderColor: G.pale, color: G.main, fontFamily: UI, fontWeight: 500 }}>
                  {k.w}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

/* ───────── 3. People learn by chance: a message from a friend, the event is already over ───────── */

const Chance: React.FC<{ frame: number }> = ({ frame }) => {
  const s = 2.7;
  const msg = pop(frame, F.friends - 8, SPRING.bouncy);
  const ev = pop(frame, F.after - 10, SPRING.smooth);
  const over = springAt(frame, F.after + 22, SPRING.bouncy);
  return (
    <>
      <Title text="узнают *случайно*" frame={frame} at={[F.chanceIn + 6, F.chance]} />
      <Zoom top={400} w={300} s={s} style={msg.style}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
          <Avatar style={{ width: 30, height: 30 }}>
            <AvatarFallback style={{ background: G.pale, color: INK, fontFamily: UI, fontSize: 10 }}>РШ</AvatarFallback>
          </Avatar>
          <div style={{ ...webSurface(s), borderRadius: 16, borderBottomLeftRadius: 4, padding: "10px 14px", fontFamily: PARAGRAPH.fontFamily, fontSize: 16 }}>ты был вчера 🎉</div>
        </div>
      </Zoom>
      <Zoom top={640} w={300} s={s} style={ev.style}>
        <Card style={{ ...webSurface(s), padding: 14, gap: 10, flexDirection: "row", display: "flex", alignItems: "center" }}>
          <IconTile variant="outline" style={tile(over > 0.5 ? MUTED : G.vivid)}>
            <CalendarDays />
          </IconTile>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5, opacity: 1 - over * 0.5 }}>
            <Bar w="80%" />
            <span style={{ ...NUMBER, fontWeight: 500, fontSize: 13, color: MUTED }}>14.11 · 18:00</span>
          </div>
          <Badge variant="secondary" style={{ fontFamily: UI, transform: `scale(${over})`, opacity: Math.min(1, over * 1.5) }}>
            <Clock /> прошло
          </Badge>
        </Card>
      </Zoom>
    </>
  );
};

/* ───────── 4. Creating is hard, then telling about it never ends: launch done, a looping conveyor of chores ───────── */

const CHORES = ["объяснять", "показывать", "публиковать", "повторять", "напоминать"];
const Hard: React.FC<{ frame: number }> = ({ frame }) => {
  const s = 2.7;
  const launch = pop(frame, F.hardIn + 6, SPRING.smooth);
  const done = springAt(frame, F.hard, SPRING.bouncy);
  const belt = pop(frame, F.tell - 6, SPRING.smooth);
  // endless belt: chips slide left forever ("постоянно")
  const shift = Math.max(0, frame - F.tell) * 4.2;
  const CHIP = 360;
  return (
    <>
      <Zoom top={330} w={260} s={s} style={launch.style}>
        <Card style={{ ...webSurface(s), padding: 14, gap: 0, flexDirection: "row", display: "flex", alignItems: "center" }}>
          <IconTile variant={done > 0.5 ? "solid" : "outline"} style={done > 0.5 ? { background: G.vivid, color: "#fff", borderColor: G.vivid } : tile()}>
            {done > 0.5 ? <Check /> : <Rocket />}
          </IconTile>
          <span style={{ marginLeft: 12, fontFamily: UI, fontWeight: 600, fontSize: 18, color: INK }}>запуск</span>
          <span style={{ marginLeft: "auto", ...NUMBER, fontSize: 13, color: done > 0.5 ? G.main : MUTED }}>{done > 0.5 ? "100%" : `${Math.round(100 * progress(frame, F.hardIn + 10, F.hard))}%`}</span>
        </Card>
      </Zoom>
      <div style={{ position: "absolute", top: 700, left: 0, width: W, height: 360, overflow: "hidden", ...belt.style, maskImage: "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)", WebkitMaskImage: "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)" }}>
        {Array.from({ length: 12 }, (_, i) => {
          const x = (((i * CHIP - shift) % (CHIP * 10)) + CHIP * 10) % (CHIP * 10) - CHIP;
          const row = i % 2;
          return (
            <div key={i} style={{ position: "absolute", left: x + row * CHIP * 0.5, top: 40 + row * 150, ...SURFACE, padding: "26px 34px", ...PARAGRAPH, fontSize: 42, lineHeight: 1, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 14 }}>
              <Megaphone size={34} color={G.vivid} /> {CHORES[i % 5]}
            </div>
          );
        })}
      </div>
    </>
  );
};

/* ───────── 5. One post is not enough: a single post, reach barely moves ───────── */

const Post: React.FC<{ frame: number }> = ({ frame }) => {
  const s = 2.6;
  const card = pop(frame, F.postIn + 4, SPRING.smooth);
  const reach = 3 * ease.out(progress(frame, F.postIn + 20, F.notEnough));
  return (
    <>
      <Title text="одной публикации *недостаточно*" frame={frame} at={[F.postIn + 6, F.postIn + 14, F.notEnough]} size={72} />
      <Zoom top={420} w={300} s={s} style={card.style}>
        <Card style={{ ...webSurface(s), padding: 14, gap: 10 }}>
          <div style={{ height: 120, borderRadius: 12, background: `linear-gradient(135deg, ${G.pale}, #F6F6F8)`, display: "grid", placeItems: "center" }}>
            <Sparkles size={40} color={G.glow} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Heart size={14} color={MUTED} />
            <span style={{ ...NUMBER, fontWeight: 500, fontSize: 13, color: MUTED }}>3</span>
            <span style={{ marginLeft: "auto", ...NUMBER, fontSize: 18, color: INK }}>{reach.toFixed(0)}%</span>
          </div>
          <Progress value={reach} className="h-2" style={{ background: G.pale }} />
        </Card>
      </Zoom>
    </>
  );
};

/* ───────── 6. Everyone works alone: four city islands, the links between them never connect ───────── */

const CITIES = [
  { x: 270, y: 470, n: "Казань", icon: Landmark },
  { x: 810, y: 520, n: "Уфа", icon: Music2 },
  { x: 290, y: 940, n: "Москва", icon: BookOpen },
  { x: 800, y: 980, n: "Алматы", icon: Users },
];
const Alone: React.FC<{ frame: number }> = ({ frame }) => {
  const tryAt = F.center;
  return (
    <>
      <Title text="каждый *отдельно*" frame={frame} at={[F.aloneIn + 6, F.alone]} />
      <svg width={W} height={1300} style={{ position: "absolute", inset: 0 }}>
        {[
          [0, 1],
          [0, 2],
          [1, 3],
          [2, 3],
        ].map(([a, b], i) => {
          // the link reaches halfway and breaks
          const t = ease.out(progress(frame, tryAt + i * 6, tryAt + 30 + i * 6));
          const back = progress(frame, F.other + 6, F.other + 24);
          const A = CITIES[a];
          const B = CITIES[b];
          const len = 0.42 * t * (1 - back);
          return <line key={i} x1={A.x} y1={A.y} x2={A.x + (B.x - A.x) * len} y2={A.y + (B.y - A.y) * len} stroke={G.glow} strokeWidth={6} strokeDasharray="14 12" strokeLinecap="round" />;
        })}
      </svg>
      {CITIES.map((c, i) => {
        const p = pop(frame, F.aloneIn + 10 + i * 8, SPRING.bouncy);
        return (
          <div key={c.n} style={{ position: "absolute", left: c.x - 110, top: c.y - 110, width: 220, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, ...p.style }}>
            <Tile icon={c.icon} size={150} />
            <div style={{ ...PARAGRAPH, fontSize: 40, lineHeight: 1 }}>{c.n}</div>
          </div>
        );
      })}
    </>
  );
};

/* ───────── 7. "People will find it themselves" - the visitor counter stays at zero ───────── */

const Find: React.FC<{ frame: number }> = ({ frame }) => {
  const s = 2.7;
  const card = pop(frame, F.findIn + 6, SPRING.smooth);
  const spin = (frame - F.findIn) * 3;
  return (
    <>
      <div style={{ ...HEADING, position: "absolute", top: 180, left: 0, right: 0, textAlign: "center", fontSize: 84 }}>
        <span style={pop(frame, F.findIn + 6, SPRING.smooth).style}>
          люди найдут{" "}
          <Strike frame={frame} at={F.wont} color={G.main}>
            <b>сами</b>
          </Strike>
        </span>
      </div>
      <Zoom top={460} w={260} s={s} style={card.style}>
        <Card style={{ ...webSurface(s), padding: 16, gap: 10, alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <IconTile variant="outline" style={tile()}>
              <Users />
            </IconTile>
            <span style={{ ...NUMBER, fontSize: 54 }}>0</span>
            <span style={{ display: "inline-flex", transform: `rotate(${spin}deg)` }}>
              <Clock size={22} color={MUTED} />
            </span>
          </div>
          <Badge variant="secondary" style={{ fontFamily: UI }}>ждем</Badge>
        </Card>
      </Zoom>
    </>
  );
};

/* ───────── 8. Promotion is not bragging: the info travels to the people who need it ───────── */

const PEOPLE = [
  { x: 180, y: 900 }, { x: 360, y: 1040 }, { x: 540, y: 1090 }, { x: 720, y: 1040 }, { x: 900, y: 900 },
];
const Promo: React.FC<{ frame: number }> = ({ frame }) => {
  const head = pop(frame, F.promoIn + 4, SPRING.smooth);
  const plate = pop(frame, F.deliver - 8, SPRING.bouncy);
  const src = { x: 540, y: 640 };
  return (
    <>
      <div style={{ ...HEADING, position: "absolute", top: 170, left: 0, right: 0, textAlign: "center", fontSize: 84, lineHeight: 1.25, ...head.style }}>
        <b style={{ color: G.main }}>продвижение</b>
        <br />
        <Strike frame={frame} at={F.brag - 4} color="#E5484D">
          хвастовство
        </Strike>
      </div>
      {plate.t > 0 && (
        <div style={{ position: "absolute", top: src.y - 50, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <div style={{ ...plate.style, transform: `${plate.style.transform} scale(2.2)`, transformOrigin: "50% 0" }}>
            <GlassPlate bg={PLATE.emerald}>
              <Megaphone size={18} strokeWidth={2.2} /> донести
            </GlassPlate>
          </div>
        </div>
      )}
      <svg width={W} height={1300} style={{ position: "absolute", inset: 0 }}>
        {PEOPLE.map((p, i) => {
          const t = ease.inOut(progress(frame, F.deliver + 10 + i * 10, F.deliver + 40 + i * 10));
          return <line key={i} x1={src.x} y1={src.y + 80} x2={lerp(src.x, p.x, t)} y2={lerp(src.y + 80, p.y - 60, t)} stroke={G.vivid} strokeWidth={5} strokeLinecap="round" opacity={t > 0 ? 1 : 0} />;
        })}
      </svg>
      {PEOPLE.map((p, i) => {
        const pp = springAt(frame, F.promoIn + 20 + i * 5, SPRING.bouncy);
        const lit = springAt(frame, F.deliver + 40 + i * 10, SPRING.bouncy);
        return (
          <div key={i} style={{ position: "absolute", left: p.x - 60, top: p.y - 60, width: 120, height: 120, borderRadius: 60, background: lit > 0.5 ? G.pale : "#fff", boxShadow: lit > 0.5 ? `0 0 0 6px ${G.vivid}` : SURFACE.boxShadow, display: "grid", placeItems: "center", transform: `scale(${pp * (1 + 0.1 * Math.min(lit, 1))})` }}>
            <Users size={52} color={lit > 0.5 ? G.main : MUTED} />
          </div>
        );
      })}
    </>
  );
};

/* ───────── 9. Silence: "скромным" struck out, the project card fades to "незаметным" ───────── */

const Silence: React.FC<{ frame: number }> = ({ frame }) => {
  const a = pop(frame, F.silenceIn + 4, SPRING.smooth);
  const b = pop(frame, F.modest - 14, SPRING.smooth);
  const c = pop(frame, F.unseen - 10, SPRING.bouncy);
  const fade = ease.inOut(progress(frame, F.unseen, F.unseen + 40));
  return (
    <>
      <div style={{ ...HEADING, position: "absolute", top: 200, left: 100, right: 100, textAlign: "center", fontSize: 104, lineHeight: 1.3 }}>
        <div style={a.style}>
          <b>молчание</b>
        </div>
        <div style={b.style}>
          <Strike frame={frame} at={F.modest + 6} color="#E5484D">
            скромным
          </Strike>
        </div>
        <div style={c.style}>
          <Mark frame={frame} at={F.unseen + 4} color={G.main}>
            незаметным
          </Mark>
        </div>
      </div>
      <div style={{ position: "absolute", top: 820, left: 0, right: 0, display: "flex", justifyContent: "center", ...a.style }}>
        <div style={{ opacity: lerp(1, 0.08, fade), filter: fade > 0 ? `blur(${fade * 12}px) grayscale(${fade})` : undefined }}>
          <Tile icon={Landmark} size={260} />
        </div>
      </div>
    </>
  );
};

/* ───────── Composition ───────── */

const SCENES: SceneDef[] = [
  { range: [0, F.worldIn], El: Hook },
  { range: [F.worldIn, F.chanceIn], El: World },
  { range: [F.chanceIn, F.hardIn], El: Chance },
  { range: [F.hardIn, F.postIn], El: Hard },
  { range: [F.postIn, F.aloneIn], El: Post },
  { range: [F.aloneIn, F.findIn], El: Alone },
  { range: [F.findIn, F.promoIn], El: Find },
  { range: [F.promoIn, F.silenceIn], El: Promo },
  { range: [F.silenceIn, F.duration + 30], El: Silence },
];

const SFX: Sfx[] = [
  { src: "sfx/07_CineStrike.wav", from: 2, volume: 0.18 },
  { src: "sfx/01_Ripple_Textures.wav", from: F.invisible - 16, volume: 0.18 },
  // scene changes: textures from the SFX/ library (no whoosh)
  { src: "sfx/06_Ripple_Textures_II.wav", from: F.worldIn - 8, volume: 0.2 },
  { src: "sfx/04_Cyber_Shift.wav", from: F.chanceIn - 8, volume: 0.2 },
  { src: "sfx/02_Alienated_Warpes.wav", from: F.hardIn - 8, volume: 0.14 },
  { src: "sfx/01_Ripple_Textures.wav", from: F.postIn - 8, volume: 0.18 },
  { src: "sfx/04_Cyber_Shift.wav", from: F.aloneIn - 8, volume: 0.2 },
  { src: "sfx/06_Ripple_Textures_II.wav", from: F.findIn - 8, volume: 0.2 },
  { src: "sfx/02_Alienated_Warpes.wav", from: F.promoIn - 8, volume: 0.14 },
  { src: "sfx/01_Ripple_Textures.wav", from: F.silenceIn - 8, volume: 0.18 },
  // 2. pins, kinds
  ...KINDS.map((k) => ({ src: "sfx2/pop.mp3", from: k.at, volume: 0.24 })),
  // 3. message, event over
  { src: "sfx2/pop.mp3", from: F.friends - 6, volume: 0.28 },
  { src: "sfx2/click.mp3", from: F.after + 22, volume: 0.2 },
  // 4. launch done
  { src: "sfx2/ding.mp3", from: F.hard + 2, volume: 0.24 },
  // 5. reach stuck
  { src: "sfx/03_Basscrack.wav", from: F.notEnough + 4, volume: 0.1 },
  // 6. links break
  { src: "sfx/05_Distortion_Glitch.wav", from: F.other + 6, volume: 0.04 },
  // 7. strike
  { src: "sfx/05_Distortion_Glitch.wav", from: F.wont + 30, volume: 0.04 },
  // 8. strike, plate, people light up
  { src: "sfx/05_Distortion_Glitch.wav", from: F.brag + 26, volume: 0.04 },
  { src: "sfx2/pop.mp3", from: F.deliver - 6, volume: 0.28 },
  ...PEOPLE.map((_, i) => ({ src: "sfx2/click.mp3", from: F.deliver + 40 + i * 10, volume: 0.16 })),
  // 9. final
  { src: "sfx/05_Distortion_Glitch.wav", from: F.modest + 36, volume: 0.04 },
  { src: "sfx/03_Basscrack.wav", from: F.unseen + 2, volume: 0.12 },
];

// Host emotion follows the voice, a swap every ~2 s; never the same photo twice in a row
const AVATAR_KEYS: AvatarKey[] = [
  { at: 0, e: "explaining" },
  { at: 100, e: "skeptical" },
  { at: F.worldIn, e: "smile-up" },
  { at: F.societies, e: "explaining" },
  { at: F.chanceIn, e: "puzzled" },
  { at: F.friends - 15, e: "soft-smile" },
  { at: F.after, e: "disappointed" },
  { at: F.hardIn, e: "thinking" },
  { at: F.tell, e: "explaining" },
  { at: F.postIn, e: "skeptical" },
  { at: F.aloneIn, e: "pensive" },
  { at: F.center, e: "displeased" },
  { at: F.findIn, e: "dreamy" },
  { at: F.wont, e: "skeptical" },
  { at: F.promoIn, e: "explaining" },
  { at: 1600, e: "inspired" },
  { at: F.silenceIn, e: "pensive" },
  { at: F.unseen - 50, e: "soft-smile" },
];

const STANCES: StanceKey[] = [
  { at: 0, s: "center" },
  { at: F.worldIn, s: "right" },
  { at: F.chanceIn, s: "left" },
  { at: F.hardIn, s: "right" },
  { at: F.postIn, s: "left" },
  { at: F.aloneIn, s: "center" },
  { at: F.findIn, s: "right" },
  { at: F.promoIn, s: "left" },
  { at: F.silenceIn, s: "center" },
];

// Alicja photos: scale the wide-framed ones so every photo fills the 540x590 box by height (same as V21)
const SIZE: Record<string, [number, number]> = {
  delighted: [1312, 1199], disappointed: [1278, 1230], displeased: [1254, 1254], dreamy: [1293, 1216], explaining: [1312, 1199], inspired: [1199, 1312], laughing: [1385, 1136], pensive: [1129, 1393],
  puzzled: [1129, 1393], skeptical: [1312, 1199], "smile-up": [1199, 1312], "soft-smile": [1164, 1351], surprised: [1280, 1229], thinking: [1129, 1393], waving: [1312, 1199],
};
const FIT = Object.fromEntries(Object.entries(SIZE).map(([e, [w, h]]) => [e, Math.max(1, w / h / (540 / 590))])) as Partial<Record<Emotion, number>>;

const Host: React.FC<{ frame: number }> = ({ frame }) => <TatAvatar frame={frame} keys={AVATAR_KEYS} words={WORDS} stances={STANCES} dir="v23/avatar" fit={FIT} />;

// ReUI: Inter inside the UI, accent progress, no CSS transitions/animations (every frame is a pure function of `frame`)
const Scope = () => <style>{`.v23-ui [data-slot], .v23-ui [data-slot] * { font-family: ${UI}; } .v23-ui [data-slot=progress-indicator] { background: ${G.vivid}; } .v23-ui *, .v23-ui *::before, .v23-ui *::after { transition: none !important; animation: none !important; }`}</style>;

export const Video23: React.FC = () => (
  <AbsoluteFill className="v23-ui" style={{ background: "#fff", fontFamily: PARAGRAPH.fontFamily }}>
    <Scope />
    <ReelShell scenes={SCENES} headlines={[]} vo={VO} sfx={SFX} duration={F.duration} music="v23/music/bed.mp3" musicLevel={[0.045, 0.11]} overlay={Host} bg={BG} />
  </AbsoluteFill>
);
