import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { BookOpen, CalendarDays, Check, Clock, Lock, LocateFixed, MapPin, MessageCircle, Music2, Newspaper, Search, SearchX, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar";
import { Badge } from "@/components/reui/badge";
import { Card } from "@/components/reui/luma/card";
import { Frame, FramePanel } from "@/components/reui/frame";
import { IconTile } from "@/components/reui/icon-tile";
import { SPRING, ease, lerp, progress, springAt } from "../stage/motion";
import { Pointer, ReelShell, pop, type SceneDef, type Sfx } from "../kit/reel";
import { TatAvatar, type AvatarKey, type Emotion, type StanceKey } from "../kit/TatAvatar";
import { DotOrbitBg } from "../kit/DotOrbitBg";
import { HEADING, INK, INTER, NUMBER, PARAGRAPH } from "../kit/design";
import { GlassPlate, PLATE } from "../catalog/own/glass";
import { Strike } from "../catalog/own/text";
import { F, VO } from "./timeline";
import { WORDS } from "./words";

// "Почему люди не знают о национальных центрах в своем городе" (@the_tatarverse, RU, host preset 2 Alicja).
// A city map where the center is there but faded out; the info hides in old groups/chats/posts; search finds nothing;
// the map comes back with the route; Tatarverse is the open catalog. ReUI components (radix-luma) + own kit.
// Accent: blue (language, connection between people), not the @const_proxima #1E6FE8. Dot Orbit variant 4 (output/bg-variant.txt).
const B = { main: "#2B44C9", vivid: "#3D5AFE", glow: "#8FA2FF", pale: "#ECEFFF" };
const BG = <DotOrbitBg variant={4} />;
const W = 1080;
const UI = `${INTER}, sans-serif`;

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
        <span key={i} style={{ display: "inline-block", marginRight: i < all.length - 1 ? "0.24em" : 0, fontWeight: key ? 700 : 400, color: key ? B.main : undefined, opacity: Math.min(1, t * 1.3), transform: `translateY(${(1 - t) * 30}px)`, filter: `blur(${Math.max(0, (1 - t) * 8)}px)` }}>
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

const Logo: React.FC<{ size: number }> = ({ size }) => <Img src={staticFile("tatarverse/logo.svg")} style={{ width: size, height: size, objectFit: "contain" }} />;

const Bar: React.FC<{ w: number | string; h?: number; color?: string }> = ({ w, h = 6, color = "#E6E6EA" }) => <div style={{ width: w, height: h, borderRadius: h / 2, background: color }} />;

/* ───────── City map (scenes 1 and 5): you + the center, faded until it is "found" ───────── */

const YOU = { x: 82, y: 168 };
const CENTER = { x: 246, y: 62 };
const MS = 2.75; // map scale: 320 x 220 native -> 880 x 605
const CityMap: React.FC<{ frame: number; found: number; route: number; km: number; ghost: number }> = ({ frame, found, route, km, ghost }) => {
  const ping = (frame % 70) / 70;
  const midX = (YOU.x + CENTER.x) / 2;
  const midY = (YOU.y + CENTER.y) / 2;
  return (
    <Card style={{ ...webSurface(MS), padding: 0, gap: 0, overflow: "hidden" }}>
      <div style={{ position: "relative", width: 320, height: 220, background: "#F7F7F9" }}>
        <svg width={320} height={220} viewBox="0 0 320 220" style={{ position: "absolute", inset: 0 }}>
          {/* park, river, blocks of streets */}
          <path d="M-10,150 C60,130 90,200 170,190 S290,150 340,170 L340,240 L-10,240 Z" fill="#E4EAF7" />
          <ellipse cx={150} cy={70} rx={46} ry={26} fill="#E5F1E8" />
          {[30, 75, 120, 165, 210, 255, 300].map((x) => (
            <line key={`v${x}`} x1={x} y1={0} x2={x - 20} y2={220} stroke="#fff" strokeWidth={5} />
          ))}
          {[25, 60, 100, 140].map((y) => (
            <line key={`h${y}`} x1={0} y1={y} x2={320} y2={y + 14} stroke="#fff" strokeWidth={5} />
          ))}
          <line x1={0} y1={110} x2={320} y2={40} stroke="#fff" strokeWidth={9} />
          {/* route you -> center */}
          <path d={`M${YOU.x},${YOU.y} Q${YOU.x + 40},${CENTER.y + 20} ${CENTER.x},${CENTER.y}`} fill="none" stroke={B.vivid} strokeWidth={3} strokeDasharray="6 5" strokeLinecap="round" pathLength={1} style={{ strokeDasharray: `${route} 1` }} opacity={route > 0 ? 1 : 0} />
        </svg>
        {/* the center pin: faded out ("nobody sees it") until found */}
        <div style={{ position: "absolute", left: CENTER.x, top: CENTER.y, transform: "translate(-50%, -100%)", display: "flex", flexDirection: "column", alignItems: "center", opacity: lerp(ghost, 1, found), filter: found < 0.99 ? `blur(${(1 - found) * 1.6}px) grayscale(${1 - found})` : undefined }}>
          <span style={{ fontFamily: UI, fontSize: 9, fontWeight: 600, padding: "3px 7px", borderRadius: 7, background: B.vivid, color: "#fff", whiteSpace: "nowrap", marginBottom: 3 }}>татарский центр</span>
          <MapPin size={22} color={B.vivid} fill={B.pale} strokeWidth={2.2} />
        </div>
        {found > 0.5 && <div style={{ position: "absolute", left: CENTER.x - 16 - ping * 10, top: CENTER.y - 6 - ping * 10, width: 32 + ping * 20, height: 32 + ping * 20, borderRadius: "50%", border: `1.5px solid ${B.vivid}`, opacity: (1 - ping) * found, transform: "translateY(-50%)" }} />}
        {/* you */}
        <div style={{ position: "absolute", left: YOU.x - 9, top: YOU.y - 9, width: 18, height: 18, borderRadius: 9, background: B.vivid, border: "3px solid #fff", boxShadow: `0 0 0 ${4 + Math.sin(frame / 10) * 2}px ${B.glow}66` }} />
        <span style={{ position: "absolute", left: YOU.x + 14, top: YOU.y - 8, fontFamily: UI, fontSize: 10, fontWeight: 600, color: INK }}>ты</span>
        {km > 0 && (
          <div style={{ position: "absolute", left: midX - 6, top: midY + 18, transform: `translate(-50%, -50%) scale(${Math.min(1, km * 3)})`, ...NUMBER, fontSize: 13, padding: "4px 8px", borderRadius: 8, background: "#fff", boxShadow: "0 2px 10px rgba(0,0,0,0.08)", whiteSpace: "nowrap" }}>
            {(1.2 * km).toFixed(1)} км
          </div>
        )}
      </div>
    </Card>
  );
};

/* ───────── 1. Hook: there is a center in your city, nobody sees it ───────── */

const Hook: React.FC<{ frame: number }> = ({ frame }) => {
  const map = pop(frame, -30, SPRING.smooth);
  // the center shows for a blink on "татарский центр", then fades back - it is there, but invisible
  const glimpse = springAt(frame, F.center - 6, SPRING.smooth) * 0.55;
  return (
    <>
      <Title text="в твоем городе есть *татарский центр*" frame={frame} at={[-40, -40, -40, -40, F.tatar - 4, F.center - 4]} size={76} />
      <Zoom top={400} w={320} s={MS} style={{ opacity: Math.max(0.7, map.style.opacity as number) }}>
        <CityMap frame={frame} found={glimpse} route={0} km={0} ghost={0.12} />
      </Zoom>
    </>
  );
};

/* ───────── 2. It exists, events happen ───────── */

const EVENTS = [
  { at: F.events, icon: Music2, d: "12.12" },
  { at: F.events + 16, icon: BookOpen, d: "14.12" },
  { at: F.pass, icon: Users, d: "20.12" },
];
const Exists: React.FC<{ frame: number }> = ({ frame }) => {
  const s = 2.7;
  const card = pop(frame, F.existsIn + 4, SPRING.smooth);
  const open = springAt(frame, F.exists + 4, SPRING.bouncy);
  return (
    <>
      <Title text="центр *существует*" frame={frame} at={[F.existsIn + 6, F.exists]} />
      <Zoom top={400} w={300} s={s} style={card.style}>
        <Card style={{ ...webSurface(s), padding: 16, gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <IconTile variant="outline" style={{ color: B.vivid, borderColor: B.pale, background: "#fff" }}>
              <Logo size={18} />
            </IconTile>
            <div style={{ flex: 1, fontFamily: UI, fontWeight: 600, fontSize: 15, color: INK }}>Татарский центр</div>
            <Badge variant="success-light" style={{ fontFamily: UI, transform: `scale(${open})`, opacity: Math.min(1, open * 1.5) }}>
              <span style={{ width: 6, height: 6, borderRadius: 3, background: "currentColor" }} /> открыт
            </Badge>
          </div>
          {EVENTS.map((e) => {
            const p = springAt(frame, e.at, SPRING.bouncy);
            const Icon = e.icon;
            return (
              <div key={e.d} style={{ display: "flex", alignItems: "center", gap: 10, padding: 8, borderRadius: 12, background: "#F7F7F9", opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * 14}px)` }}>
                <IconTile variant="outline" size="sm" style={{ color: B.vivid, borderColor: B.pale, background: "#fff" }}>
                  <Icon />
                </IconTile>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                  <Bar w="70%" />
                  <Bar w="40%" color="#EFEFF2" />
                </div>
                <span style={{ ...NUMBER, fontWeight: 500, fontSize: 13, color: "#6E6A78" }}>{e.d}</span>
              </div>
            );
          })}
        </Card>
      </Zoom>
    </>
  );
};

/* ───────── 3. Where the info lives: an old group, a closed chat, a post from 2023 - all covered in dust ───────── */

const PLACES = [
  { at: F.group, icon: Users, label: "старая группа", meta: "2019" },
  { at: F.chat, icon: Lock, label: "закрытый чат", meta: "по ссылке" },
  { at: F.post, icon: Newspaper, label: "пост 2023", meta: "3 года" },
];
const Hidden: React.FC<{ frame: number }> = ({ frame }) => {
  const s = 2.6;
  return (
    <>
      {PLACES.map((p, i) => {
        const t = pop(frame, p.at - 10, SPRING.bouncy);
        // each card greys out a moment after it lands: stale info
        const stale = progress(frame, p.at + 20, p.at + 50);
        const Icon = p.icon;
        return (
          <Zoom key={p.label} top={300 + i * 300} w={300} s={s} style={{ ...t.style, filter: `${t.style.filter ?? ""} grayscale(${stale})`.trim() }}>
            <Card style={{ ...webSurface(s), padding: 14, gap: 0, flexDirection: "row", alignItems: "center", display: "flex" }}>
              <IconTile variant="outline" style={{ color: stale > 0.5 ? "#9A97A3" : B.vivid, borderColor: B.pale, background: "#fff" }}>
                <Icon />
              </IconTile>
              <div style={{ flex: 1, marginLeft: 12, fontFamily: UI, fontWeight: 600, fontSize: 17, color: INK, opacity: 1 - stale * 0.45 }}>{p.label}</div>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: UI, fontSize: 11, color: "#8A8792" }}>
                <Clock size={11} /> {p.meta}
              </span>
            </Card>
          </Zoom>
        );
      })}
    </>
  );
};

/* ───────── 4. "Nothing in my city": search, zero results ───────── */

const QUERY = "татарский центр рядом";
const Think: React.FC<{ frame: number }> = ({ frame }) => {
  const s = 2.6;
  const bar = pop(frame, F.thinkIn + 6, SPRING.smooth);
  const typed = QUERY.slice(0, Math.round(QUERY.length * progress(frame, F.thinkIn + 20, F.maybe)));
  const empty = pop(frame, F.nothing - 20, SPRING.bouncy);
  return (
    <>
      <Zoom top={330} w={340} s={s} style={bar.style}>
        <Frame style={{ ...webSurface(s), padding: 6 }}>
          <FramePanel style={{ display: "flex", alignItems: "center", gap: 10, padding: 12, border: "none", boxShadow: "none", background: "#F7F7F9", borderRadius: 10 }}>
            <Search size={18} color="#8A8792" />
            <span style={{ fontFamily: UI, fontSize: 15, color: INK, whiteSpace: "nowrap" }}>
              {typed}
              {frame < F.maybe + 10 && Math.floor(frame / 18) % 2 === 0 && <span style={{ display: "inline-block", width: 1.5, height: 16, background: B.vivid, marginLeft: 1, verticalAlign: "-3px" }} />}
            </span>
          </FramePanel>
        </Frame>
      </Zoom>
      <div style={{ position: "absolute", top: 640, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 40, ...empty.style }}>
        <div style={{ width: 200, height: 200, borderRadius: 48, background: "#fff", boxShadow: "-1px -6px 55px -11px rgba(144, 142, 142, 0.2)", display: "grid", placeItems: "center" }}>
          <SearchX size={104} color="#9A97A3" strokeWidth={1.6} />
        </div>
        <div style={{ ...HEADING, fontSize: 92 }}>
          <Strike frame={frame} at={F.nothing + 30} color={B.vivid}>
            ничего нет
          </Strike>
        </div>
      </div>
    </>
  );
};

/* ───────── 5. The community is a few km away: the map comes back, the center lights up, the route draws ───────── */

const Near: React.FC<{ frame: number }> = ({ frame }) => {
  const map = pop(frame, F.nearIn + 2, SPRING.smooth);
  const found = springAt(frame, F.community, SPRING.smooth);
  const route = ease.inOut(progress(frame, F.community + 20, F.km + 6));
  const km = ease.out(progress(frame, F.km - 6, F.km + 30));
  return (
    <>
      <Title text="а сообщество *рядом*" frame={frame} at={[F.nearIn + 6, F.community, F.km]} />
      <Zoom top={400} w={320} s={MS} style={map.style}>
        <CityMap frame={frame} found={Math.min(1, found)} route={route} km={km} ghost={0.12} />
      </Zoom>
    </>
  );
};

/* ───────── 6. Tatarverse: the open catalog of tatar, bashkir and crimean tatar centers ───────── */

const ROWS = [
  { at: F.tatars, logo: "tt", n: 410 },
  { at: F.bashkirs, logo: "bs", n: 0 },
  { at: F.crimean, logo: "qt", n: 0 },
];
const Catalog: React.FC<{ frame: number }> = ({ frame }) => {
  const s = 2.6;
  const brand = pop(frame, F.tatarverse - 6, SPRING.bouncy);
  const card = pop(frame, F.open - 6, SPRING.smooth);
  return (
    <>
      <div style={{ position: "absolute", top: 180, left: 0, right: 0, display: "flex", justifyContent: "center", ...brand.style }}>
        <div style={{ transform: "scale(2.2)", transformOrigin: "50% 0" }}>
          <GlassPlate bg={PLATE.ocean}>tatarverse.cc</GlassPlate>
        </div>
      </div>
      <Title text="открытый *каталог*" frame={frame} at={[F.open, F.catalog]} top={360} />
      <Zoom top={540} w={300} s={s} style={card.style}>
        <Card style={{ ...webSurface(s), padding: 14, gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Search size={14} color="#8A8792" />
            <Bar w={120} color="#EFEFF2" />
            <div style={{ marginLeft: "auto" }}>
              <AvatarGroup>
                {["АЛ", "РК", "ЗМ"].map((n, i) => (
                  <Avatar key={n} style={{ width: 22, height: 22 }}>
                    <AvatarFallback style={{ background: [B.pale, "#EAF4EF", "#FFF4E5"][i], color: INK, fontFamily: UI, fontSize: 8 }}>{n}</AvatarFallback>
                  </Avatar>
                ))}
              </AvatarGroup>
            </div>
          </div>
          {ROWS.map((r) => {
            const p = springAt(frame, r.at - 4, SPRING.bouncy);
            const on = springAt(frame, r.at + 10, SPRING.bouncy);
            return (
              <div key={r.logo} style={{ display: "flex", alignItems: "center", gap: 10, padding: 8, borderRadius: 12, background: "#F7F7F9", opacity: Math.min(1, p * 1.5), transform: `translateX(${(1 - p) * 40}px)` }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: "#fff", display: "grid", placeItems: "center" }}>
                  <Img src={staticFile(`tatarverse/icons/${r.logo}.svg`)} style={{ width: 22, height: 22, objectFit: "contain" }} />
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                  <Bar w="72%" />
                  <Bar w="44%" color="#EFEFF2" />
                </div>
                <span style={{ width: 20, height: 20, borderRadius: 10, background: B.vivid, color: "#fff", display: "grid", placeItems: "center", transform: `scale(${on})` }}>
                  <Check size={12} strokeWidth={3} />
                </span>
              </div>
            );
          })}
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: UI, fontSize: 11, color: "#6E6A78" }}>
            <MapPin size={12} color={B.vivid} />
            <span style={{ ...NUMBER, fontSize: 12, color: INK }}>410</span>
            <MessageCircle size={12} color={B.vivid} style={{ marginLeft: 8 }} />
            <span style={{ ...NUMBER, fontSize: 12, color: INK }}>53</span>
            <CalendarDays size={12} color={B.vivid} style={{ marginLeft: 8 }} />
          </div>
        </Card>
      </Zoom>
    </>
  );
};

/* ───────── 7. Find yours nearby: CTA plate pressed, the logo ───────── */

const Final: React.FC<{ frame: number }> = ({ frame }) => {
  const logo = pop(frame, F.finalIn + 2, SPRING.smooth);
  const cta = pop(frame, F.near - 6, SPRING.bouncy);
  const press = springAt(frame, F.near + 22, SPRING.snappy) * (1 - springAt(frame, F.near + 30, SPRING.snappy));
  return (
    <>
      <div style={{ position: "absolute", top: 300, left: 0, right: 0, display: "flex", justifyContent: "center", ...logo.style }}>
        <Logo size={110} />
      </div>
      <Title text="найди своих *рядом*" frame={frame} at={[F.find, F.find + 10, F.near]} top={480} size={100} />
      {cta.t > 0 && (
        <div style={{ position: "absolute", top: 760, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <div style={{ ...cta.style, transform: `${cta.style.transform} scale(${2.3 * (1 - 0.08 * press)})`, transformOrigin: "50% 0" }}>
            <GlassPlate bg={PLATE.ocean}>
              <LocateFixed size={18} strokeWidth={2.2} /> Найти рядом
            </GlassPlate>
          </div>
        </div>
      )}
      <Pointer frame={frame} keys={[{ f: F.near, x: 880, y: 1150 }, { f: F.near + 18, x: 600, y: 820 }]} clicks={[F.near + 26]} show={[F.near - 4, F.duration + 30]} />
    </>
  );
};

/* ───────── Composition ───────── */

const SCENES: SceneDef[] = [
  { range: [0, F.existsIn], El: Hook },
  { range: [F.existsIn, F.hiddenIn], El: Exists },
  { range: [F.hiddenIn, F.thinkIn], El: Hidden },
  { range: [F.thinkIn, F.nearIn], El: Think },
  { range: [F.nearIn, F.tvIn], El: Near },
  { range: [F.tvIn, F.finalIn], El: Catalog },
  { range: [F.finalIn, F.duration + 30], El: Final },
];

const SFX: Sfx[] = [
  { src: "sfx/07_CineStrike.wav", from: 2, volume: 0.2 },
  { src: "sfx2/ding.mp3", from: F.center, volume: 0.2 },
  // scene changes: textures from the SFX/ library (no whoosh)
  { src: "sfx/06_Ripple_Textures_II.wav", from: F.existsIn - 8, volume: 0.2 },
  { src: "sfx/04_Cyber_Shift.wav", from: F.hiddenIn - 8, volume: 0.22 },
  { src: "sfx/02_Alienated_Warpes.wav", from: F.thinkIn - 8, volume: 0.14 },
  { src: "sfx/01_Ripple_Textures.wav", from: F.nearIn - 8, volume: 0.18 },
  { src: "sfx/04_Cyber_Shift.wav", from: F.tvIn - 8, volume: 0.22 },
  { src: "sfx/06_Ripple_Textures_II.wav", from: F.finalIn - 8, volume: 0.2 },
  // 2. open badge, events
  { src: "sfx2/pop.mp3", from: F.exists + 6, volume: 0.28 },
  ...EVENTS.map((e) => ({ src: "sfx2/click.mp3", from: e.at + 2, volume: 0.18 })),
  // 3. stale places
  ...PLACES.map((p) => ({ src: "sfx/03_Basscrack.wav", from: p.at - 6, volume: 0.1 })),
  // 4. typing, nothing, strike
  { src: "sfx2/typing.mp3", from: F.thinkIn + 20, volume: 0.1 },
  { src: "sfx/05_Distortion_Glitch.wav", from: F.nothing + 58, volume: 0.04 },
  // 5. found, route
  { src: "sfx2/ding.mp3", from: F.community + 4, volume: 0.26 },
  { src: "sfx2/pop.mp3", from: F.km, volume: 0.28 },
  // 6. brand, rows
  { src: "sfx/07_CineStrike.wav", from: F.tatarverse - 4, volume: 0.16 },
  ...ROWS.map((r) => ({ src: "sfx2/pop.mp3", from: r.at, volume: 0.24 })),
  // 7. CTA
  { src: "sfx2/pop.mp3", from: F.near - 4, volume: 0.28 },
  { src: "sfx2/click.mp3", from: F.near + 26, volume: 0.32 },
];

// Host emotion follows the voice, a swap every ~2 s; never the same photo twice in a row
const AVATAR_KEYS: AvatarKey[] = [
  { at: 0, e: "puzzled" },
  { at: 130, e: "surprised" },
  { at: F.existsIn, e: "soft-smile" },
  { at: F.events, e: "explaining" },
  { at: F.hiddenIn, e: "skeptical" },
  { at: F.chat, e: "displeased" },
  { at: F.post, e: "disappointed" },
  { at: F.thinkIn, e: "pensive" },
  { at: F.maybe + 20, e: "thinking" },
  { at: F.nothing, e: "puzzled" },
  { at: F.nearIn, e: "smile-up" },
  { at: F.km, e: "delighted" },
  { at: F.tvIn, e: "inspired" },
  { at: F.tatarverse, e: "waving" },
  { at: F.catalog, e: "explaining" },
  { at: F.bashkirs, e: "laughing" },
  { at: F.finalIn, e: "delighted" },
];

const STANCES: StanceKey[] = [
  { at: 0, s: "center" },
  { at: F.existsIn, s: "right" },
  { at: F.hiddenIn, s: "left" },
  { at: F.thinkIn, s: "right" },
  { at: F.nearIn, s: "left" },
  { at: F.tvIn, s: "right" },
  { at: F.finalIn, s: "center" },
];

// Alicja photos: scale the wide-framed ones so every photo fills the 540x590 box by height (same as V21)
const SIZE: Record<string, [number, number]> = {
  delighted: [1312, 1199], disappointed: [1278, 1230], displeased: [1254, 1254], dreamy: [1293, 1216], explaining: [1312, 1199], inspired: [1199, 1312], laughing: [1385, 1136], pensive: [1129, 1393],
  puzzled: [1129, 1393], skeptical: [1312, 1199], "smile-up": [1199, 1312], "soft-smile": [1164, 1351], surprised: [1280, 1229], thinking: [1129, 1393], waving: [1312, 1199],
};
const FIT = Object.fromEntries(Object.entries(SIZE).map(([e, [w, h]]) => [e, Math.max(1, w / h / (540 / 590))])) as Partial<Record<Emotion, number>>;

const Host: React.FC<{ frame: number }> = ({ frame }) => <TatAvatar frame={frame} keys={AVATAR_KEYS} words={WORDS} stances={STANCES} dir="v22/avatar" fit={FIT} />;

// ReUI: Inter inside the UI, no CSS transitions/animations (every frame is a pure function of `frame`)
const Scope = () => <style>{`.v22-ui [data-slot], .v22-ui [data-slot] * { font-family: ${UI}; } .v22-ui *, .v22-ui *::before, .v22-ui *::after { transition: none !important; animation: none !important; }`}</style>;

export const Video22: React.FC = () => (
  <AbsoluteFill className="v22-ui" style={{ background: "#fff", fontFamily: PARAGRAPH.fontFamily }}>
    <Scope />
    <ReelShell scenes={SCENES} headlines={[]} vo={VO} sfx={SFX} duration={F.duration} music="v22/music/bed.mp3" musicLevel={[0.045, 0.11]} overlay={Host} bg={BG} />
  </AbsoluteFill>
);
