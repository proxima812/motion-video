import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { BookOpen, CalendarDays, Dices, Heart, MessageCircle, Newspaper, Plus, Search, SendHorizontal, Store, TvMinimalPlay } from "lucide-react";
import { GridMontage } from "@/components/remocn/grid-montage";
import { ScreenshotTour, type TourStop } from "@/components/remocn/screenshot-tour";
import { ShardsToGrid } from "@/components/remocn/shards-to-grid";
import { GshFlat } from "@/lib/remocn/gsh/gsh-ground";
import { SPRING, ease, progress, springAt } from "../stage/motion";
import { Pointer, count, pop, type Range, type Sfx } from "../kit/reel";
import { TatAvatar, type AvatarKey } from "../kit/TatAvatar";
import { fontFamily } from "../ui/theme";
import { F, VO } from "./timeline";
import { WORDS } from "./words";

// tatarlar.kz presentation (@the_tatarverse, RU, 16:9 1920x1080). Accent = the site's own green + gold
// (tatarlar.kz styles: --letter-a-deep #0b5c45, --letter-a #0e7c5b, --gold #c9a24a).
const G = { main: "#0B5C45", vivid: "#0E7C5B", glow: "#7CC5A6", gold: "#C9A24A", goldPale: "#E9D39A", ink: "#2e2e2f", page: "#FBF7F0" };
const H = 1080;
const img = (name: string) => staticFile(`v18/img/${name}.jpg`);

/* ───────── Shared bits ───────── */

/** Words rise in at their spoken frame */
const Said: React.FC<{ frame: number; words: { w: string; at: number; hi?: boolean }[]; color?: string }> = ({ frame, words, color = G.main }) => (
  <>
    {words.map(({ w, at, hi }, i) => {
      const t = springAt(frame, at, SPRING.smooth);
      return (
        <span key={i} style={{ display: "inline-block", marginRight: "0.24em", color: hi ? color : undefined, opacity: Math.min(1, t * 1.3), transform: `translateY(${(1 - t) * 30}px)`, filter: `blur(${Math.max(0, (1 - t) * 8)}px)` }}>
          {w}
        </span>
      );
    })}
  </>
);

/** The site's wordmark: tatarlar.kz with a gold dot */
const Wordmark: React.FC<{ size: number; color?: string }> = ({ size, color = "#fff" }) => (
  <span style={{ fontSize: size, fontWeight: 800, letterSpacing: "-0.04em", color, whiteSpace: "nowrap" }}>
    tatarlar<span style={{ color: G.gold }}>.</span>
    <span style={{ color: G.goldPale }}>kz</span>
  </span>
);

/** Rotated-square ornament from the site header */
const Ornament: React.FC<{ x: number; y: number; size: number; spin: number; opacity?: number }> = ({ x, y, size, spin, opacity = 0.22 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ position: "absolute", left: x - size / 2, top: y - size / 2, opacity, transform: `rotate(${spin}deg)` }}>
    <g fill="none" stroke={G.gold} strokeWidth={0.8}>
      <rect x={15} y={15} width={70} height={70} transform="rotate(45 50 50)" />
      <rect x={25} y={25} width={50} height={50} />
      <circle cx={50} cy={50} r={9} />
    </g>
  </svg>
);

/* ───────── 1. Hook ───────── */

const HOOK = [
  { w: "Это", at: 4 },
  { w: "изменит", at: 19 },
  { w: "то,", at: 54 },
  { w: "как", at: 74 },
  { w: "ты", at: 83 },
  { w: "ищешь", at: 96 },
  { w: "своих", at: 111, hi: true },
  { w: "в", at: 137 },
  { w: "Казахстане", at: 142 },
];
const QUERY = "татары Казахстана";
const Hook: React.FC<{ frame: number }> = ({ frame }) => {
  const bar = pop(frame, 30, SPRING.smooth);
  const typed = QUERY.slice(0, Math.floor(Math.max(0, frame - 46) / 3.4));
  const caret = Math.floor(frame / 16) % 2 === 0;
  const pin = pop(frame, F.kz, SPRING.bouncy);
  const line = ease.out(progress(frame, F.svoih + 6, F.svoih + 30));
  return (
    <>
      <div style={{ position: "absolute", left: 150, top: 250, width: 1300, fontSize: 108, fontWeight: 800, letterSpacing: "-0.045em", lineHeight: 1.06, color: G.ink }}>
        {HOOK.map(({ w, at, hi }, i) => {
          // whole hook readable from frame 0 in light grey; each word darkens and lifts as it is spoken
          const t = springAt(frame, at, SPRING.smooth);
          const said = Math.min(1, t * 1.4);
          return (
            <span key={i} style={{ position: "relative", display: "inline-block", marginRight: "0.24em", color: said > 0.5 ? (hi ? G.main : G.ink) : "#D5D7DB", transform: `translateY(${-Math.sin(Math.min(t, 1) * Math.PI) * 10}px)` }}>
              {w}
              {hi && <span style={{ position: "absolute", left: 0, bottom: 2, height: 16, borderRadius: 8, width: `${line * 100}%`, background: G.glow, opacity: 0.55, zIndex: -1 }} />}
            </span>
          );
        })}
      </div>
      <div style={{ ...bar.style, position: "absolute", left: 150, top: 700, width: 1180, height: 120, borderRadius: 60, background: "#fff", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 40px 80px -40px rgba(0,0,0,0.25)", display: "flex", alignItems: "center", gap: 26, padding: "0 44px", boxSizing: "border-box" }}>
        <Search size={46} color={G.main} strokeWidth={2.4} />
        <span style={{ fontSize: 50, fontWeight: 500, color: typed ? G.ink : "#A3A6AC", whiteSpace: "nowrap" }}>
          {typed || "Где найти своих?"}
          <span style={{ display: "inline-block", width: 4, height: 52, marginLeft: 6, verticalAlign: "-8px", background: G.main, opacity: caret ? 1 : 0 }} />
        </span>
        <span style={{ ...pin.style, marginLeft: "auto", padding: "16px 30px", borderRadius: 999, background: G.main, color: "#fff", fontSize: 36, fontWeight: 600, whiteSpace: "nowrap" }}>📍 Весь Казахстан</span>
      </div>
    </>
  );
};

/* ───────── 2-6. Remocn scenes (each runs on its own local frame) ───────── */

// remocn components fill the frame; shift them left so the host has the right corner
const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ transform: "translateX(-130px) scale(0.88)" }}>{children}</AbsoluteFill>
);

const Overview: React.FC = () => (
  <Stage>
    <ShardsToGrid
      images={["r07", "events", "masters", "wedding", "chats", "culture", "games", "media", "home"].map(img)}
      title="tatarlar.kz"
      status="Весь Казахстан"
      headline="Все в одном месте"
      labels={["Татары Казахстана", "Афиша", "Мастера и бизнес", "Знакомства", "Чаты"]}
      branch="kz"
      action="Войти"
      meta="♥"
      logo={<span style={{ width: 22, height: 22, borderRadius: 7, background: G.main, display: "inline-block" }} />}
      theme="light"
      accent={G.main}
      font={fontFamily}
      speed={0.52}
    />
  </Stage>
);

// stops in CSS px of the 1600x900 captures; stop i starts at local frame (18 + i * framesPerStop) / speed
const Tour: React.FC<{ src: string; stops: TourStop[]; framesPerStop: number; speed: number }> = ({ src, stops, framesPerStop, speed }) => (
  <Stage>
    <ScreenshotTour src={img(src)} screenshotWidth={1600} screenshotHeight={900} stops={stops} framesPerStop={framesPerStop} speed={speed} pullBack={false} dim={0.5} theme="light" accent={G.main} font={fontFamily} />
  </Stage>
);

const TOURS = {
  events: {
    src: "events",
    framesPerStop: 90,
    speed: 0.66,
    stops: [
      { x: 224, y: 318, width: 346, height: 44, label: "Кичэ, концерты и курсы" },
      { x: 409, y: 442, width: 314, height: 94, label: "Татар Квиз в Алматы" },
      { x: 409, y: 574, width: 314, height: 276, label: "Уроки татарского каждое воскресенье" },
    ],
  },
  masters: {
    src: "masters",
    framesPerStop: 100,
    speed: 0.8,
    stops: [
      { x: 224, y: 128, width: 484, height: 80, label: "46 мастеров и бизнесов" },
      { x: 224, y: 252, width: 974, height: 46, label: "Тамада, чак-чак, никах, юрист" },
      { x: 225, y: 587, width: 371, height: 178, label: "Свои люди рядом" },
    ],
  },
  chats: { src: "chats", framesPerStop: 60, speed: 1.2, stops: [{ x: 224, y: 429, width: 1152, height: 131, label: "Чаты городов: ссылки проверены" }] },
  culture: {
    src: "culture",
    framesPerStop: 48,
    speed: 1,
    stops: [
      { x: 224, y: 450, width: 646, height: 262, label: "Слово дня" },
      { x: 928, y: 450, width: 447, height: 326, label: "Пословица недели" },
    ],
  },
  games: {
    src: "games",
    framesPerStop: 70,
    speed: 0.9,
    stops: [
      { x: 224, y: 144, width: 672, height: 128, label: "Викторина на татарском" },
      { x: 224, y: 586, width: 371, height: 275, label: "Для класса или Сабантуя" },
    ],
  },
} as const;

const Media: React.FC = () => (
  <Stage>
    <GridMontage images={["media", "r00", "r02", "r03", "r05", "r06", "r07", "r09", "r12", "r15", "news"].map(img)} beat={14} speed={0.48} theme="light" accent={G.main} />
  </Stage>
);

/* ───────── 7. Alive: the section grid fills up ───────── */

const SECTIONS = [
  { Icon: Heart, title: "Знакомства", n: 190, unit: "анкет", c: "#C23B64", bg: "#FBE6EC" },
  { Icon: CalendarDays, title: "Афиша", n: 3, unit: "события", c: "#8A6A1F", bg: "#F6EFDD" },
  { Icon: Store, title: "Мастера и бизнес", n: 46, unit: "мастеров", c: "#0E7C5B", bg: "#E2F1EA" },
  { Icon: Newspaper, title: "Новости", n: 706, unit: "фото", c: "#0E7C5B", bg: "#E2F1EA" },
  { Icon: MessageCircle, title: "Чаты", n: 3, unit: "группы", c: "#0E7C5B", bg: "#E2F1EA" },
  { Icon: BookOpen, title: "Язык и культура", n: 0, unit: "Слово дня: бабай", c: "#8A6A1F", bg: "#F6EFDD" },
  { Icon: TvMinimalPlay, title: "Медиа", n: 350, unit: "проектов", c: "#2F5D8A", bg: "#E5EDF6" },
  { Icon: Dices, title: "Игры", n: 0, unit: "Викторина", c: "#C23B64", bg: "#FBE6EC" },
];
const ALIVE = [
  { w: "Сайт", at: F.aliveIn + 37 },
  { w: "живой,", at: F.zhivoy, hi: true },
  { w: "когда", at: F.aliveIn + 117 },
  { w: "его", at: F.aliveIn + 135 },
  { w: "наполняем", at: F.napolnyaem },
  { w: "мы", at: F.napolnyaem + 40, hi: true },
];
const Alive: React.FC<{ frame: number }> = ({ frame }) => {
  const band = ease.out(progress(frame, F.aliveIn + 16, F.aliveIn + 46)); // after the cards start popping in
  return (
    <>
      <div style={{ position: "absolute", left: 150, top: 110, fontSize: 92, fontWeight: 800, letterSpacing: "-0.045em", color: G.ink, whiteSpace: "nowrap" }}>
        <Said frame={frame} words={ALIVE} />
      </div>
      <div style={{ position: "absolute", left: 120, top: 330, width: 1380 * band, height: 170, borderRadius: 24, background: G.main }} />
      <div style={{ position: "absolute", left: 150, top: 300, width: 1350, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
        {SECTIONS.map((s, i) => {
          const p = pop(frame, F.aliveIn + 10 + i * 4, SPRING.smooth);
          const fillAt = F.napolnyaem - 10 + i * 6;
          const fill = springAt(frame, fillAt, SPRING.bouncy);
          const on = Math.min(1, fill);
          const n = s.n ? count(frame, fillAt, fillAt + 40, 0, s.n) : 0;
          const breathe = 1 + 0.02 * Math.sin((frame - F.zhivoy) / 9) * (frame > F.zhivoy && frame < F.napolnyaem ? 1 : 0);
          return (
            <div key={s.title} style={{ ...p.style, transform: `${p.style.transform} scale(${breathe})`, height: 200, borderRadius: 26, boxSizing: "border-box", padding: "24px 26px", background: "#fff", border: `2px ${on > 0.5 ? "solid" : "dashed"} ${on > 0.5 ? "rgba(0,0,0,0.07)" : "#D9CDB4"}`, boxShadow: `0 30px 60px -36px rgba(0,0,0,${0.3 * on})`, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div style={{ width: 64, height: 64, borderRadius: 18, display: "grid", placeItems: "center", background: on > 0.5 ? s.bg : "#F1ECE4", transform: `scale(${0.9 + 0.1 * Math.min(fill, 1.15)})` }}>
                <s.Icon size={34} color={on > 0.5 ? s.c : "#B9B0A6"} strokeWidth={2} />
              </div>
              <div>
                <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-0.02em", color: on > 0.5 ? "#1C1917" : "#B9B0A6", whiteSpace: "nowrap" }}>{s.title}</div>
                <div style={{ fontSize: 26, fontWeight: 500, color: "#6B645F", opacity: on, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{s.n ? `${n} ${s.unit}` : s.unit}</div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

/* ───────── 8. Call to action ───────── */

const ACTIONS = [
  { at: F.addEvent, text: "Добавить событие", gold: true },
  { at: F.addMaster, text: "Предложить мастера" },
  { at: F.addChat, text: "Предложить чат" },
];
const BTN = (i: number) => ({ x: 150, y: 300 + i * 150 });
const MSG = "Сәлам! На сайте не хватает…";
const CURSOR = [
  { f: F.ctaIn, x: 900, y: 900 },
  ...ACTIONS.flatMap((a, i) => [{ f: a.at + 2, x: BTN(i).x + 470, y: BTN(i).y + 62 }, { f: a.at + 22, x: BTN(i).x + 470, y: BTN(i).y + 62 }]),
  { f: F.hvataet - 14, x: 1390, y: 735 },
  { f: F.finalIn, x: 1390, y: 735 },
];
const CLICKS = [...ACTIONS.map((a) => a.at + 6), F.hvataet + 4];

const Cta: React.FC<{ frame: number }> = ({ frame }) => {
  const head = pop(frame, F.ctaIn + 4, SPRING.smooth);
  const chat = pop(frame, F.napishite - 6, SPRING.smooth);
  const typed = MSG.slice(0, Math.floor(Math.max(0, frame - (F.razrab - 6)) / 2.4));
  const sent = springAt(frame, F.hvataet + 6, SPRING.bouncy);
  const ask = pop(frame, F.hvataet + 2, SPRING.bouncy);
  return (
    <>
      <div style={{ ...head.style, position: "absolute", left: 150, top: 110, fontSize: 92, fontWeight: 800, letterSpacing: "-0.045em", color: G.ink, whiteSpace: "nowrap" }}>
        Наполним <span style={{ color: G.main }}>вместе</span>
      </div>
      {ACTIONS.map((a, i) => {
        const p = pop(frame, a.at - 8, SPRING.bouncy);
        const done = springAt(frame, a.at + 8, SPRING.bouncy);
        const { x, y } = BTN(i);
        return (
          <div key={a.text} style={{ ...p.style, position: "absolute", left: x, top: y, width: 600, height: 120, borderRadius: 30, boxSizing: "border-box", padding: "0 36px", display: "flex", alignItems: "center", gap: 22, background: a.gold ? G.gold : "#fff", border: a.gold ? "none" : "2px solid rgba(0,0,0,0.08)", boxShadow: "0 30px 60px -36px rgba(0,0,0,0.35)", color: a.gold ? "#1C1917" : G.main, fontSize: 42, fontWeight: 700, letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>
            <Plus size={44} strokeWidth={2.6} style={{ transform: `rotate(${done * 90}deg)` }} />
            {a.text}
          </div>
        );
      })}
      {/* message to the developer (the site's WhatsApp link) */}
      <div style={{ ...chat.style, position: "absolute", left: 830, top: 300, width: 660, height: 520, borderRadius: 36, background: "#fff", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 40px 80px -40px rgba(0,0,0,0.3)", overflow: "hidden" }}>
        <div style={{ height: 110, background: G.main, display: "flex", alignItems: "center", gap: 20, padding: "0 30px" }}>
          <div style={{ width: 62, height: 62, borderRadius: 31, background: G.goldPale, display: "grid", placeItems: "center", fontSize: 30, fontWeight: 800, color: G.main }}>T</div>
          <div>
            <div style={{ fontSize: 32, fontWeight: 700, color: "#fff" }}>Разработчик tatarlar.kz</div>
            <div style={{ fontSize: 24, color: "#CFE0D9" }}>WhatsApp · обычно отвечает быстро</div>
          </div>
        </div>
        <div style={{ position: "absolute", left: 30, right: 30, top: 150, display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ alignSelf: "flex-start", maxWidth: 480, padding: "18px 26px", borderRadius: "26px 26px 26px 8px", background: "#F1ECE4", fontSize: 30, color: "#1C1917" }}>Чего не хватает на сайте? Пишите 🙌</div>
          {sent > 0.02 && (
            <div style={{ alignSelf: "flex-end", maxWidth: 480, padding: "18px 26px", borderRadius: "26px 26px 8px 26px", background: "#DCF3E6", fontSize: 30, color: "#1C1917", opacity: Math.min(1, sent * 1.5), transform: `translateY(${(1 - sent) * 30}px) scale(${0.9 + 0.1 * Math.min(sent, 1)})`, transformOrigin: "100% 100%" }}>
              {MSG} <span style={{ color: G.vivid, fontSize: 24 }}>✓✓</span>
            </div>
          )}
        </div>
        <div style={{ position: "absolute", left: 24, right: 24, bottom: 24, height: 84, borderRadius: 42, background: G.page, display: "flex", alignItems: "center", padding: "0 12px 0 30px", gap: 16 }}>
          <span style={{ flex: 1, fontSize: 30, color: sent > 0.02 ? "#A3A6AC" : typed ? "#1C1917" : "#A3A6AC", whiteSpace: "nowrap", overflow: "hidden" }}>{sent > 0.02 || !typed ? "Сообщение" : typed}</span>
          <div style={{ width: 62, height: 62, borderRadius: 31, background: G.main, display: "grid", placeItems: "center" }}>
            <SendHorizontal size={30} color="#fff" />
          </div>
        </div>
      </div>
      <div style={{ ...ask.style, position: "absolute", left: 830, top: 860, width: 660, textAlign: "center", fontSize: 44, fontWeight: 700, color: G.main }}>Чего не хватает? Напишите</div>
      <Pointer frame={frame} keys={CURSOR} clicks={CLICKS} show={[F.addEvent - 20, F.finalIn]} />
    </>
  );
};

/* ───────── 9. Final: wordmark on the site's green ───────── */

const Final: React.FC<{ frame: number }> = ({ frame }) => {
  const bg = ease.out(progress(frame, F.finalIn - 6, F.finalIn + 18));
  const mark = pop(frame, F.finalIn + 2, SPRING.bouncy);
  const sub = pop(frame, F.finalIn + 40, SPRING.smooth);
  const together = pop(frame, F.stroim - 4, SPRING.bouncy);
  const spin = (frame - F.finalIn) * 0.08;
  return (
    <AbsoluteFill style={{ background: G.main, clipPath: `circle(${bg * 130}% at 50% 50%)` }}>
      <Ornament x={1640} y={210} size={520} spin={spin} />
      <Ornament x={170} y={900} size={380} spin={-spin} opacity={0.16} />
      <div style={{ position: "absolute", left: 150, top: 300 }}>
        <div style={mark.style}>
          <Wordmark size={210} />
        </div>
        <div style={{ ...sub.style, marginTop: 6, fontSize: 46, fontWeight: 500, color: "#CFE0D9" }}>Казакъстан татарлары · все в одном месте</div>
        <div style={{ ...together.style, marginTop: 70, display: "inline-block", padding: "22px 48px", borderRadius: 999, background: G.gold, fontSize: 64, fontWeight: 800, letterSpacing: "-0.03em", color: "#1C1917" }}>Строим вместе</div>
      </div>
    </AbsoluteFill>
  );
};

/* ───────── Composition ───────── */

type Scene = { range: Range; El?: React.FC<{ frame: number }>; Local?: React.FC };
const SCENES: Scene[] = [
  { range: [0, F.allIn], El: Hook },
  { range: [F.allIn, F.eventsIn], Local: Overview },
  { range: [F.eventsIn, F.mastersIn], Local: () => <Tour {...TOURS.events} stops={[...TOURS.events.stops]} /> },
  { range: [F.mastersIn, F.chatsIn], Local: () => <Tour {...TOURS.masters} stops={[...TOURS.masters.stops]} /> },
  { range: [F.chatsIn, F.cultureIn], Local: () => <Tour {...TOURS.chats} stops={[...TOURS.chats.stops]} /> },
  { range: [F.cultureIn, F.gamesIn], Local: () => <Tour {...TOURS.culture} stops={[...TOURS.culture.stops]} /> },
  { range: [F.gamesIn, F.mediaIn], Local: () => <Tour {...TOURS.games} stops={[...TOURS.games.stops]} /> },
  { range: [F.mediaIn, F.aliveIn], Local: Media },
  { range: [F.aliveIn, F.ctaIn], El: Alive },
  { range: [F.ctaIn, F.finalIn], El: Cta },
  { range: [F.finalIn, F.duration + 30], El: Final },
];

const sceneStyle = (frame: number, [a, b]: Range): React.CSSProperties => {
  const inT = a === 0 ? 1 : springAt(frame, a, SPRING.smooth);
  const out = progress(frame, b - 8, b + 3);
  return {
    opacity: Math.min(1, inT * 1.5) * (1 - out),
    transform: `translateY(${(1 - inT) * 40 - out * 30}px) scale(${1 - out * 0.04})`,
    filter: out > 0 || inT < 0.98 ? `blur(${Math.max(out * 16, (1 - Math.min(inT, 1)) * 12)}px)` : undefined,
  };
};

// tour stop frames (absolute) for soft clicks
const tourStops = (at: number, t: { framesPerStop: number; speed: number; stops: readonly unknown[] }) => t.stops.map((_, i) => at + Math.round((18 + i * t.framesPerStop + 8) / t.speed));

const SFX: Sfx[] = [
  { src: "sfx/07_CineStrike.wav", from: 2, volume: 0.2 },
  { src: "sfx2/typing.mp3", from: 46, volume: 0.12 },
  { src: "sfx2/pop.mp3", from: F.kz + 2, volume: 0.3 },
  // scene transitions: textures from the SFX/ library, alternating
  { src: "sfx/06_Ripple_Textures_II.wav", from: F.allIn - 8, volume: 0.2 },
  { src: "sfx/03_Basscrack.wav", from: F.allIn + 160, volume: 0.1 },
  { src: "sfx/04_Cyber_Shift.wav", from: F.eventsIn - 8, volume: 0.22 },
  { src: "sfx/02_Alienated_Warpes.wav", from: F.mastersIn - 8, volume: 0.14 },
  { src: "sfx/01_Ripple_Textures.wav", from: F.chatsIn - 8, volume: 0.18 },
  { src: "sfx/06_Ripple_Textures_II.wav", from: F.cultureIn - 8, volume: 0.16 },
  { src: "sfx/04_Cyber_Shift.wav", from: F.gamesIn - 8, volume: 0.18 },
  { src: "sfx/01_Ripple_Textures.wav", from: F.mediaIn - 8, volume: 0.2 },
  { src: "sfx/02_Alienated_Warpes.wav", from: F.aliveIn - 8, volume: 0.14 },
  { src: "sfx/06_Ripple_Textures_II.wav", from: F.ctaIn - 8, volume: 0.2 },
  { src: "sfx/07_CineStrike.wav", from: F.finalIn - 4, volume: 0.2 },
  ...[
    ...tourStops(F.eventsIn, TOURS.events),
    ...tourStops(F.mastersIn, TOURS.masters),
    ...tourStops(F.cultureIn, TOURS.culture).slice(1),
    ...tourStops(F.gamesIn, TOURS.games),
  ].map((from) => ({ src: "sfx2/click.mp3", from, volume: 0.16 })),
  { src: "sfx/03_Basscrack.wav", from: F.sem, volume: 0.1 },
  ...SECTIONS.filter((_, i) => i % 2 === 0).map((_, k) => ({ src: "sfx2/pop.mp3", from: F.napolnyaem - 8 + k * 12, volume: 0.22 })),
  { src: "sfx2/ding.mp3", from: F.napolnyaem + 46, volume: 0.25 },
  ...CLICKS.map((from) => ({ src: "sfx2/click.mp3", from, volume: 0.3 })),
  { src: "sfx2/pop.mp3", from: F.hvataet + 6, volume: 0.32 },
  { src: "sfx2/ding.mp3", from: F.stroim + 2, volume: 0.25 },
];

// Host emotion follows the voice, a swap every ~2 s; never the same photo twice in a row
const AVATAR_KEYS: AvatarKey[] = [
  { at: 0, e: "portrait-green" },
  { at: F.svoih, e: "smile-green" },
  { at: 226, e: "confident-emerald" },
  { at: F.oneMesto, e: "smile-green" },
  { at: 480, e: "portrait-traditional" },
  { at: 600, e: "kalpak-green" },
  { at: F.eventsIn, e: "smile-green" },
  { at: 840, e: "confident-traditional" },
  { at: 960, e: "portrait-green" },
  { at: 1076, e: "smile-green" },
  { at: F.mastersIn, e: "confident-emerald" },
  { at: 1282, e: "kalpak-green" },
  { at: 1410, e: "portrait-traditional" },
  { at: 1460, e: "smile-green" },
  { at: F.chatsIn, e: "confident-traditional" },
  { at: 1674, e: "portrait-green" },
  { at: 1785, e: "kalpak-green" },
  { at: 1885, e: "smile-green" },
  { at: F.mediaIn, e: "confident-emerald" },
  { at: 2060, e: "portrait-traditional" },
  { at: F.sem, e: "smile-green" },
  { at: F.aliveIn, e: "portrait-green" },
  { at: F.napolnyaem, e: "confident-traditional" },
  { at: F.ctaIn, e: "smile-green" },
  { at: F.addChat, e: "confident-emerald" },
  { at: F.hvataet, e: "kalpak-green" },
  { at: F.finalIn, e: "portrait-green" },
  { at: F.stroim, e: "smile-green" },
];

/** Music bed ducked under the voice */
const musicVolume = (f: number) => {
  const talking = VO.some((v) => f >= v.from - 6 && f < v.from + v.dur);
  const fadeIn = interpolate(f, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(f, [F.duration - 30, F.duration], [1, 0], { extrapolateLeft: "clamp" });
  return (talking ? 0.045 : 0.11) * fadeIn * fadeOut;
};

export const Video18: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#fff", color: G.ink, fontFamily, WebkitFontSmoothing: "antialiased" }}>
      <GshFlat.Provider value="#FFFFFF">
        {SCENES.map(({ range, El, Local }, i) =>
          frame >= range[0] - 2 && frame < range[1] + 6 ? (
            <AbsoluteFill key={i} style={sceneStyle(frame, range)}>
              {El && <El frame={frame} />}
              {Local && (
                <Sequence from={range[0]} layout="none">
                  <Local />
                </Sequence>
              )}
            </AbsoluteFill>
          ) : null,
        )}
      </GshFlat.Provider>
      <TatAvatar frame={frame} keys={AVATAR_KEYS} words={WORDS} color={G.main} cx={1730} scale={0.7} frameH={H} pillsLeft />

      <Audio loop src={staticFile("v18/music/bed.mp3")} volume={musicVolume} />
      {VO.map((v) => (
        <Sequence key={v.src} from={v.from} layout="none">
          <Audio src={staticFile(v.src)} volume={1} />
        </Sequence>
      ))}
      {SFX.map((s, i) => (
        <Sequence key={i} from={s.from} layout="none">
          <Audio src={staticFile(s.src)} volume={s.volume} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

