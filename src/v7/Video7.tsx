import React from "react";
import { TactileGlassWord, TactileSwitch } from "tactile-glass-ui";
import { SPRING, ease, lerp, progress, springAt } from "../stage/motion";
import { Card, Center, GLASS, K, Pill, ReelShell, Vo, count, leave, pop } from "../kit/reel";
import { F as F7, VO as VO7 } from "./timeline";

// "Meetingless AI": shared by Video7 (RU) and Video8 (EN)
type T = typeof F7;

export const RU = {
  call: "Еженедельный синк",
  people: ["Аня", "Олег", "Марина", "Дима"],
  decisions: "Решения",
  notes: ["обсудить позже", "назначить еще встречу", "все согласны"],
  setting: "Агенты сами назначают встречи",
  on: "Вкл",
  off: "Выкл",
  invite: "Синк по поводу синка",
  invitedBy: "Agent-3 пригласил: Agent-1, Agent-2, Agent-4",
  days: ["Пн", "Вт", "Ср", "Чт", "Пт"],
  today: "встреч сегодня",
  transcript: "Расшифровка · встреча №400",
  quotes: ["Вернемся к этому позже.", "Отлично.", "Давайте назначим встречу.", "Отличная идея."],
  kpi: "Продуктивность",
  kpiNote: "по сравнению с прошлым кварталом",
  headlines: (F: T) => [
    { from: 14, text: "Людей на созвонах заменили ИИ." },
    { from: F.agentsIn + 6, text: "Агенты ходят на звонки и пишут решения." },
    { from: F.permIn + 6, text: "Потом им разрешили назначать встречи." },
    { from: F.weekIn + 6, text: "Через неделю:" },
    { from: F.n400, text: "400 совещаний в день." },
    { from: F.lookIn + 6, text: "О чем они говорят?" },
    { from: F.q1, text: "" },
    { from: F.prodIn + 4, text: "Продуктивность выросла на:" },
  ],
};

export type Strings = typeof RU;

const HUES = ["#FFB199", "#9FC3FF", "#C7B3FF", "#9EE6B8"];

/* ───────── Scenes ───────── */

const Tile: React.FC<{ frame: number; i: number; name: string; flipAt: number; enter: number }> = ({ frame, i, name, flipAt, enter }) => {
  const p = pop(frame, enter, SPRING.smooth);
  const flip = Math.min(1, springAt(frame, flipAt, SPRING.snappy));
  const bot = flip > 0.5;
  const talk = bot && Math.sin((frame + i * 23) / 6) > 0.3;
  return (
    <div style={{ ...p.style, width: 430, height: 330, perspective: 1200 }}>
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 36,
          transform: `rotateY(${flip * 180}deg)`,
          background: bot ? "#16171C" : "#F1F1F3",
          position: "relative",
          boxShadow: talk ? "0 0 0 6px #1FA855" : "0 20px 50px -30px rgba(0,0,0,0.25)",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", inset: 0, transform: bot ? "scaleX(-1)" : undefined, display: "grid", placeItems: "center" }}>
          {bot ? (
            <div style={{ fontSize: 130, transform: `translateY(${talk ? -6 : 0}px)` }}>🤖</div>
          ) : (
            <div style={{ width: 150, height: 150, borderRadius: 75, background: HUES[i], display: "grid", placeItems: "center", fontSize: 70, fontWeight: 700, color: "#fff" }}>{name[0]}</div>
          )}
          <div
            style={{
              position: "absolute",
              left: 22,
              bottom: 20,
              padding: "6px 16px",
              borderRadius: 12,
              background: bot ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.06)",
              color: bot ? "#fff" : K.text,
              fontSize: 28,
              fontWeight: 600,
            }}
          >
            {bot ? `Agent-${i + 1}` : name}
          </div>
        </div>
      </div>
    </div>
  );
};

const Call = (F: T, S: Strings): React.FC<{ frame: number }> => ({ frame }) => {
  const bar = pop(frame, 4, SPRING.smooth);
  const notes = pop(frame, F.notes - 8, SPRING.smooth);
  const sec = 47 * 60 + 12 + Math.floor(frame / 60);
  // Grid slides up once the notes card arrives
  const lift = ease.inOut(progress(frame, F.notes - 20, F.notes + 10)) * 120;
  return (
    <div style={{ position: "absolute", inset: 0, transform: `translateY(${-lift}px)` }}>
      <Center y={540}>
        <div style={{ ...bar.style, display: "flex", alignItems: "center", gap: 18, fontSize: 36, fontWeight: 600 }}>
          <span style={{ width: 18, height: 18, borderRadius: 9, background: K.red, opacity: frame % 60 < 40 ? 1 : 0.3 }} />
          {S.call}
          <span style={{ color: K.muted, fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>· {Math.floor(sec / 60)}:{String(sec % 60).padStart(2, "0")}</span>
        </div>
      </Center>
      <Center y={630}>
        <div style={{ display: "grid", gridTemplateColumns: "430px 430px", gap: 26 }}>
          {S.people.map((n, i) => (
            <Tile key={n} frame={frame} i={i} name={n} enter={8 + i * 6} flipAt={F.ai + i * 9} />
          ))}
        </div>
      </Center>
      {frame >= F.notes - 10 && (
        <Center y={1360}>
          <Card style={{ ...notes.style, width: 886, padding: "34px 44px" }}>
            <div style={{ fontSize: 32, fontWeight: 600, color: K.muted, marginBottom: 10 }}>📝 {S.decisions}</div>
            {S.notes.map((n, i) => {
              const at = F.notes + 6 + i * 18;
              const typed = n.slice(0, Math.round(n.length * progress(frame, at, at + 16)));
              return (
                <div key={n} style={{ fontSize: 40, fontWeight: 500, lineHeight: "60px", opacity: frame >= at ? 1 : 0 }}>
                  • {typed}
                </div>
              );
            })}
          </Card>
        </Center>
      )}
    </div>
  );
};

const Perm = (F: T, S: Strings): React.FC<{ frame: number }> => ({ frame }) => {
  const on = frame >= F.allow;
  const knock = springAt(frame, F.allow, SPRING.bouncy) * (1 - springAt(frame, F.allow + 5, SPRING.smooth));
  const invite = pop(frame, F.schedule, SPRING.bouncy);
  return (
    <>
      <Center y={560}>
        <Card style={{ width: 900, padding: "40px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
          <div>
            <div style={{ fontSize: 44, fontWeight: 600, letterSpacing: "-0.02em", maxWidth: 560, lineHeight: 1.15 }}>{S.setting}</div>
            <div style={{ fontSize: 30, color: on ? K.green : K.muted, marginTop: 10, fontWeight: 500 }}>{on ? S.on : S.off}</div>
          </div>
          <div style={{ width: 230, height: 124, display: "grid", placeItems: "center", flex: "none" }}>
            <div style={{ transform: `scale(${2.2 * (1 + knock * 0.06)})` }}>
              <TactileSwitch {...GLASS} checked={on} />
            </div>
          </div>
        </Card>
      </Center>
      {frame >= F.schedule - 2 && (
        <Center y={880}>
          <Card style={{ ...invite.style, width: 900, padding: "36px 44px", display: "flex", gap: 30, alignItems: "center" }}>
            <div style={{ width: 120, height: 130, borderRadius: 24, overflow: "hidden", flex: "none", textAlign: "center", border: `1px solid ${K.border}` }}>
              <div style={{ background: K.red, color: "#fff", fontSize: 26, fontWeight: 700, padding: "6px 0" }}>{S.days[0]}</div>
              <div style={{ fontSize: 60, fontWeight: 700, lineHeight: "88px" }}>17</div>
            </div>
            <div>
              <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: "-0.02em" }}>{S.invite}</div>
              <div style={{ fontSize: 28, color: K.muted, marginTop: 8 }}>{S.invitedBy}</div>
            </div>
          </Card>
        </Center>
      )}
    </>
  );
};

// Pseudo-random but deterministic meeting blocks for the week grid
const BLOCKS = Array.from({ length: 120 }, (_, i) => {
  const r = (n: number) => ((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1;
  return { col: i % 5, row: Math.floor(r(1) * 18), w: 0.5 + r(2) * 0.5, x: r(3) * 0.5, hue: Math.floor(r(4) * 4), order: r(5) };
}).sort((a, b) => a.order - b.order);

const Week = (F: T, S: Strings): React.FC<{ frame: number }> => ({ frame }) => {
  const card = pop(frame, F.weekIn + 2, SPRING.smooth);
  const fill = ease.in(progress(frame, F.weekIn + 10, F.day + 10));
  const shown = Math.round(fill * BLOCKS.length);
  const n = count(frame, F.weekIn + 10, F.n400 + 30, 0, 400, ease.in);
  const counter = pop(frame, F.weekIn + 14, SPRING.smooth);
  const W = 900;
  const colW = (W - 80) / 5;
  return (
    <>
      <Center y={520}>
        <Card style={{ ...card.style, width: W, padding: "30px 40px", height: 760, position: "relative", overflow: "hidden" }}>
          <div style={{ display: "flex" }}>
            {S.days.map((d) => (
              <div key={d} style={{ width: colW, textAlign: "center", fontSize: 30, fontWeight: 600, color: K.muted }}>
                {d}
              </div>
            ))}
          </div>
          <div style={{ position: "relative", height: 640, marginTop: 20 }}>
            {BLOCKS.slice(0, shown).map((b, i) => {
              const t = Math.min(1, (fill * BLOCKS.length - i) / 3);
              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: b.col * colW + b.x * colW * 0.5 + 4,
                    top: b.row * 34,
                    width: colW * b.w - 8,
                    height: 30,
                    borderRadius: 8,
                    background: HUES[b.hue],
                    opacity: 0.9 * t,
                    transform: `scale(${0.6 + 0.4 * t})`,
                  }}
                />
              );
            })}
          </div>
        </Card>
      </Center>
      <Center y={1320}>
        <div style={{ ...counter.style, display: "flex", alignItems: "baseline", gap: 22 }}>
          <span style={{ fontSize: 150, fontWeight: 800, letterSpacing: "-0.05em", fontVariantNumeric: "tabular-nums", color: frame >= F.n400 ? K.red : K.text }}>{n}</span>
          <span style={{ fontSize: 44, fontWeight: 600, color: K.muted }}>{S.today}</span>
        </div>
      </Center>
    </>
  );
};

const Transcript = (F: T, S: Strings): React.FC<{ frame: number }> => ({ frame }) => {
  const head = pop(frame, F.lookIn + 4, SPRING.smooth);
  const at = [F.q1, F.q2, F.q3, F.q4];
  const typing = frame >= F.look && frame < F.q1;
  return (
    <>
      <Center y={300}>
        <div style={{ ...head.style }}>
          <Pill style={{ fontSize: 34, padding: "14px 30px" }}>🎙 {S.transcript}</Pill>
        </div>
      </Center>
      {S.quotes.map((q, i) => {
        const b = pop(frame, at[i] - 2, SPRING.bouncy);
        if (b.t <= 0) return null;
        const right = i % 2 === 1;
        return (
          <div key={q} style={{ position: "absolute", top: 470 + i * 230, left: right ? undefined : 70, right: right ? 70 : undefined, display: "flex", flexDirection: "column", alignItems: right ? "flex-end" : "flex-start", gap: 12, ...b.style }}>
            <div style={{ fontSize: 28, fontWeight: 600, color: K.muted, margin: "0 16px" }}>🤖 Agent-{[1, 3, 2, 4][i]}</div>
            <Card style={{ padding: "28px 40px", borderRadius: 48, [right ? "borderBottomRightRadius" : "borderBottomLeftRadius"]: 12, background: right ? "#000" : "#fff", color: right ? "#fff" : K.text, fontSize: 50, fontWeight: 600, letterSpacing: "-0.02em", maxWidth: 860 }}>
              {q}
            </Card>
          </div>
        );
      })}
      {typing && (
        <div style={{ position: "absolute", top: 520, left: 70, display: "flex", gap: 12, padding: "30px 40px", borderRadius: 48, background: K.elevated }}>
          {[0, 1, 2].map((d) => (
            <span key={d} style={{ width: 20, height: 20, borderRadius: 10, background: K.dim, transform: `translateY(${Math.sin((frame - d * 6) / 5) * 6}px)` }} />
          ))}
        </div>
      )}
    </>
  );
};

const Prod = (F: T, S: Strings): React.FC<{ frame: number }> => ({ frame }) => {
  const card = pop(frame, F.prodIn + 4, SPRING.smooth);
  const draw = ease.inOut(progress(frame, F.prodIn + 10, F.zero));
  const zero = pop(frame, F.zero, SPRING.bouncy);
  const W = 800;
  // Wobbly line that ends exactly where it started
  const pts = Array.from({ length: 41 }, (_, i) => {
    const x = (i / 40) * W;
    const y = 120 + Math.sin(i * 0.9) * 26 * Math.sin((i / 40) * Math.PI);
    return `${i ? "L" : "M"} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");
  return (
    <>
      <Center y={540}>
        <Card style={{ ...card.style, width: 900, padding: "40px 50px" }}>
          <div style={{ fontSize: 36, fontWeight: 600 }}>{S.kpi}</div>
          <div style={{ fontSize: 28, color: K.muted, marginTop: 6 }}>{S.kpiNote}</div>
          <svg width={W} height={240} style={{ marginTop: 20 }}>
            <line x1={0} y1={120} x2={W} y2={120} stroke={K.border} strokeWidth={3} strokeDasharray="10 10" />
            <path d={pts} fill="none" stroke={K.text} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
            {draw >= 1 && <circle cx={W} cy={120} r={14 * Math.min(1, zero.t)} fill={K.text} />}
          </svg>
        </Card>
      </Center>
      <Center y={980}>
        <div style={{ ...zero.style, fontSize: 300, fontWeight: 800, letterSpacing: "-0.06em", lineHeight: 1 }}>
          <TactileGlassWord {...GLASS}>+0%</TactileGlassWord>
        </div>
      </Center>
    </>
  );
};

/* ───────── Composition ───────── */

export const makeMeetingReel = (F: T, VO: Vo[], S: Strings): React.FC => {
  const scenes = [
    { range: [0, F.permIn] as const, El: Call(F, S) },
    { range: [F.permIn, F.weekIn] as const, El: Perm(F, S) },
    { range: [F.weekIn, F.lookIn] as const, El: Week(F, S) },
    { range: [F.lookIn, F.prodIn] as const, El: Transcript(F, S) },
    { range: [F.prodIn, F.duration + 30] as const, El: Prod(F, S) },
  ];
  const sfx = [
    { src: "sfx/07_CineStrike.wav", from: 4, volume: 0.3 },
    ...[0, 1, 2, 3].map((i) => ({ src: "sfx2/pop.mp3", from: 10 + i * 6, volume: 0.3 })),
    { src: "sfx/05_Distortion_Glitch.wav", from: F.ai - 2, volume: 0.22 },
    ...[0, 1, 2, 3].map((i) => ({ src: "sfx2/click.mp3", from: F.ai + i * 9, volume: 0.45 })),
    { src: "sfx2/typing.mp3", from: F.notes + 6, volume: 0.45 },
    { src: "sfx2/whoosh.mp3", from: F.permIn - 8, volume: 0.45 },
    { src: "sfx2/click.mp3", from: F.allow - 2, volume: 0.7 },
    { src: "sfx2/ding.mp3", from: F.schedule, volume: 0.45 },
    { src: "sfx2/whoosh.mp3", from: F.weekIn - 8, volume: 0.45 },
    ...Array.from({ length: 8 }, (_, i) => ({ src: "sfx2/pop.mp3", from: Math.round(lerp(F.weekIn + 30, F.day, Math.sqrt(i / 7))), volume: 0.25 })),
    { src: "sfx/03_Basscrack.wav", from: F.n400 + 30, volume: 0.3 },
    { src: "sfx2/whoosh.mp3", from: F.lookIn - 8, volume: 0.45 },
    { src: "sfx2/pop.mp3", from: F.q1, volume: 0.45 },
    { src: "sfx2/pop.mp3", from: F.q2, volume: 0.45 },
    { src: "sfx2/pop.mp3", from: F.q3, volume: 0.45 },
    { src: "sfx2/pop.mp3", from: F.q4, volume: 0.45 },
    { src: "sfx2/whoosh.mp3", from: F.prodIn - 8, volume: 0.45 },
    { src: "sfx2/crickets.mp3", from: F.zero + 20, volume: 0.45 },
    { src: "sfx2/rimshot.mp3", from: F.zero + 70, volume: 0.6 },
  ];
  const C: React.FC = () => <ReelShell scenes={scenes} headlines={S.headlines(F)} vo={VO} sfx={sfx} duration={F.duration} shift={130} />;
  return C;
};

export const Video7 = makeMeetingReel(F7, VO7, RU);
