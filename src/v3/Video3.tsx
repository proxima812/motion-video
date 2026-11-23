import React from "react";
import { TactileGlassWord, TactilePromptInput } from "tactile-glass-ui";
import { SPRING, ease, lerp, progress, springAt } from "../stage/motion";
import { Card, Center, GLASS, K, Pill, ReelShell, count, leave, pop } from "../kit/reel";
import { F as F3, VO as VO3 } from "./timeline";

// "Billion-dollar ChatGPT wrapper": shared by Video3 (RU) and Video4 (EN)
type T = typeof F3;

export const RU = {
  locale: "ru-RU",
  unicorn: "🦄 ЕДИНОРОГ",
  valuation: "Оценка стартапа",
  how: "Пошаговый план ↓",
  greet: "Привет! Чем могу помочь?",
  placeholder: "Спроси что угодно",
  secret: "🤫 под капотом: тот же ChatGPT",
  tagline: "Собственная нейросетевая инфраструктура",
  wire: "Входящий перевод",
  investors: ["FOMO Ventures", "Hype Capital", "Tvoi Dyadya LP"],
  stats: { val: "Оценка", raised: "Привлечено", users: "Пользователи", api: "Расходы на API" },
  cheap: "экономим",
  usersNote: "пока",
  headlines: (F: T) => [
    { from: 14, text: "Мой стартап стоит $1\u00a0млрд." },
    { from: F.showHow, text: "Сейчас покажу как." },
    { from: F.buildIn + 6, text: "Шаг 1. Обычный чат с ChatGPT." },
    { from: F.dress, text: "Шаг 2. Красивый интерфейс." },
    { from: F.logo, text: "+ анимированный логотип." },
    { from: F.pitchIn + 6, text: "Шаг 3. Назвал это инфраструктурой." },
    { from: F.raised, text: "Привлек $40\u00a0млн." },
    { from: F.dashIn + 6, text: "Пользователей пока нет." },
    { from: F.but, text: "Зато расходы на API:" },
  ],
};

export type Strings = typeof RU;

const money = (n: number, locale: string) => "$" + n.toLocaleString(locale).replace(/ | /g, " ");

/* ───────── Scenes ───────── */

const Intro = (F: T, S: Strings): React.FC<{ frame: number }> => ({ frame }) => {
  const badge = pop(frame, 6, SPRING.smooth);
  const label = pop(frame, 14, SPRING.smooth);
  const num = pop(frame, 20, SPRING.smooth);
  // Counter accelerates into the "billion" beat, then lands with a bounce
  const v = Math.round(lerp(0, 1e9, ease.in(progress(frame, 20, F.billion + 10))));
  const land = springAt(frame, F.billion + 10, SPRING.bouncy) * (1 - springAt(frame, F.billion + 18, SPRING.smooth));
  const how = pop(frame, F.showHow + 10, SPRING.bouncy);
  const bob = frame > F.showHow + 30 ? Math.sin((frame - F.showHow) / 9) * 8 : 0;
  return (
    <>
      <Center y={600}>
        <div style={{ ...badge.style, padding: "16px 32px", borderRadius: 999, background: K.elevated, fontSize: 34, fontWeight: 600, color: K.muted, letterSpacing: "0.06em" }}>{S.unicorn}</div>
      </Center>
      <Center y={740}>
        <div style={{ ...label.style, fontSize: 40, fontWeight: 500, color: K.muted }}>{S.valuation}</div>
      </Center>
      <Center y={800}>
        <div style={{ ...num.style, fontSize: 132, fontWeight: 800, letterSpacing: "-0.05em", fontVariantNumeric: "tabular-nums", transform: `${num.style.transform} scale(${1 + land * 0.06})`, whiteSpace: "nowrap" }}>
          {money(v, S.locale)}
        </div>
      </Center>
      <Center y={1060}>
        <div style={{ ...how.style, transform: `${how.style.transform} translateY(${bob}px)` }}>
          <Pill style={{ fontSize: 40, padding: "18px 36px", background: "#000", color: "#fff", fontWeight: 600 }}>{S.how}</Pill>
        </div>
      </Center>
    </>
  );
};

// Spinning gradient blob - the "animated logo"
const Logo: React.FC<{ frame: number; size: number; t: number; at: number }> = ({ frame, size, t, at }) => {
  const spin = Math.max(0, frame - at) * 9;
  const pulse = 1 + Math.sin(Math.max(0, frame - at) / 4) * 0.08 * t;
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", position: "relative", flex: "none" }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#C9CBD0", opacity: 1 - t }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          opacity: t,
          background: "conic-gradient(from 0deg, #FF6A13, #FF2D87, #7C6CFF, #22C3FF, #FF6A13)",
          transform: `rotate(${spin}deg) scale(${pulse})`,
          boxShadow: `0 0 ${30 * t}px rgba(255,106,19,0.5)`,
        }}
      />
      <div style={{ position: "absolute", inset: size * 0.3, borderRadius: "50%", background: "#fff", opacity: t }} />
    </div>
  );
};

const Build = (F: T, S: Strings): React.FC<{ frame: number }> => ({ frame }) => {
  const card = pop(frame, F.buildIn + 4, SPRING.smooth);
  const dress = ease.inOut(progress(frame, F.dress, F.ui + 30));
  const logoT = springAt(frame, F.logo, SPRING.bouncy);
  const bubble = pop(frame, F.chatgpt, SPRING.smooth);
  const secret = pop(frame, F.logo + 50, SPRING.smooth);
  const name = dress > 0.5 ? "OMNIA" : "ChatGPT";
  const nameSwap = Math.abs(dress - 0.5) * 2;
  return (
    <>
      <Center y={540}>
        <Card
          style={{
            ...card.style,
            width: 900,
            padding: 44,
            borderRadius: lerp(16, 48, dress),
            background: dress > 0 ? `linear-gradient(160deg, rgba(255,255,255,1) 0%, rgba(255,240,230,${dress}) 55%, rgba(236,232,255,${dress}) 100%)` : "#F4F4F5",
            border: dress > 0 ? `2px solid rgba(255,106,19,${0.35 * dress})` : `1px solid ${K.border}`,
            boxShadow: `0 ${40 * dress}px ${100 * dress}px -40px rgba(255,106,19,${0.45 * dress}), 0 2px 6px rgba(0,0,0,0.04)`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <Logo frame={frame} size={lerp(56, 96, logoT)} t={Math.min(1, logoT)} at={F.logo} />
            <div style={{ fontSize: lerp(40, 64, dress), fontWeight: lerp(500, 800, dress), letterSpacing: dress > 0.5 ? "0.08em" : "-0.01em", opacity: nameSwap, color: K.text }}>{name}</div>
            {dress > 0.6 && <Pill style={{ marginLeft: "auto", background: "#000", color: "#fff", opacity: (dress - 0.6) / 0.4 }}>PRO ✦</Pill>}
          </div>
          <div style={{ marginTop: 34, display: "flex" }}>
            <div
              style={{
                ...bubble.style,
                padding: "24px 32px",
                borderRadius: 28,
                borderTopLeftRadius: 8,
                background: dress > 0.5 ? "rgba(255,255,255,0.85)" : "#E6E7EA",
                fontSize: 40,
                color: K.text,
              }}
            >
              {S.greet}
            </div>
          </div>
          <div style={{ marginTop: 40, height: 150, display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
            <div style={{ transform: "scale(1.38)", transformOrigin: "top center", width: 580 }}>
              <TactilePromptInput {...GLASS} value="" placeholder={S.placeholder} agentLabel={dress > 0.5 ? "Omnia Core™" : "ChatGPT"} modeLabel={dress > 0.5 ? "Quantum ✦" : "GPT"} />
            </div>
          </div>
        </Card>
      </Center>
      <Center y={1330}>
        <div style={{ ...secret.style, fontSize: 38, fontWeight: 500, color: K.muted }}>{S.secret}</div>
      </Center>
    </>
  );
};

const Pitch = (F: T, S: Strings): React.FC<{ frame: number }> => ({ frame }) => {
  const title = pop(frame, F.pitchIn + 4, SPRING.smooth);
  const tag = pop(frame, F.infra, SPRING.smooth);
  const boxes = ["Omnia Core™", "Neural Mesh™", "api.openai.com"];
  const wire = pop(frame, F.raised, SPRING.bouncy);
  const sum = count(frame, F.forty, F.forty + 40, 0, 40_000_000);
  const slideOut = leave(frame, F.raised - 6);
  return (
    <>
      <div style={{ position: "absolute", inset: 0, ...slideOut }}>
        <Center y={540}>
          <div style={{ ...title.style, display: "flex", alignItems: "center", gap: 28 }}>
            <Logo frame={frame} size={110} t={1} at={F.pitchIn - 200} />
            <div style={{ fontSize: 120, fontWeight: 800, letterSpacing: "0.06em" }}>OMNIA</div>
          </div>
        </Center>
        <Center y={700}>
          <div style={{ ...tag.style, fontSize: 44, fontWeight: 600, color: K.muted, maxWidth: 900, textAlign: "center" }}>{S.tagline}</div>
        </Center>
        {boxes.map((b, i) => {
          const p = pop(frame, F.infra + 20 + i * 16, SPRING.smooth);
          const last = i === boxes.length - 1;
          return (
            <Center key={b} y={830 + i * 190}>
              <div style={{ ...p.style, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div
                  style={{
                    width: last ? 360 : 640,
                    padding: last ? "16px 0" : "34px 0",
                    borderRadius: 28,
                    textAlign: "center",
                    fontSize: last ? 28 : 50,
                    fontWeight: last ? 500 : 700,
                    fontFamily: last ? K.mono : K.font,
                    background: last ? K.elevated : "#000",
                    color: last ? K.dim : "#fff",
                  }}
                >
                  {b}
                </div>
                {!last && <div style={{ fontSize: 44, color: K.dim, lineHeight: "70px" }}>↓</div>}
              </div>
            </Center>
          );
        })}
      </div>
      {frame >= F.raised - 2 && (
        <Center y={640}>
          <Card style={{ ...wire.style, width: 900, padding: "50px 56px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 34, color: K.muted, fontWeight: 500 }}>
              <span>{S.wire}</span>
              <span style={{ color: K.green, fontWeight: 600 }}>● SWIFT</span>
            </div>
            <div style={{ fontSize: 128, fontWeight: 800, letterSpacing: "-0.05em", color: K.green, fontVariantNumeric: "tabular-nums", marginTop: 18, whiteSpace: "nowrap" }}>
              +{money(sum, S.locale)}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 30 }}>
              {S.investors.map((n, i) => {
                const p = pop(frame, F.forty + 10 + i * 12, SPRING.bouncy);
                return (
                  <Pill key={n} style={{ ...p.style, fontSize: 32, color: K.text }}>
                    {n}
                  </Pill>
                );
              })}
            </div>
          </Card>
        </Center>
      )}
    </>
  );
};

const Tile: React.FC<{ style?: React.CSSProperties; label: string; children: React.ReactNode; tone?: string }> = ({ style, label, children, tone }) => (
  <Card style={{ width: 440, height: 300, padding: "34px 36px", display: "flex", flexDirection: "column", justifyContent: "space-between", ...style }}>
    <div style={{ fontSize: 32, fontWeight: 500, color: K.muted }}>{label}</div>
    <div style={{ fontSize: 68, fontWeight: 800, letterSpacing: "-0.04em", color: tone ?? K.text, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{children}</div>
  </Card>
);

const Dash = (F: T, S: Strings): React.FC<{ frame: number }> => ({ frame }) => {
  const a = pop(frame, F.dashIn + 4, SPRING.smooth);
  const b = pop(frame, F.dashIn + 12, SPRING.smooth);
  const users = pop(frame, F.zeroUsers, SPRING.bouncy);
  const api = pop(frame, F.api, SPRING.bouncy);
  const price = (count(frame, F.price, F.cents, 0, 482) / 100).toFixed(2);
  const cheap = pop(frame, F.cents + 20, SPRING.bouncy);
  const line = ease.inOut(progress(frame, F.zeroUsers + 6, F.zeroUsers + 60));
  return (
    <>
      <Center y={560} style={{ gap: 30 }}>
        <Tile label={S.stats.val} style={a.style}>
          $1B
        </Tile>
        <Tile label={S.stats.raised} style={b.style}>
          $40M
        </Tile>
      </Center>
      <Center y={900} style={{ gap: 30 }}>
        <Card style={{ ...users.style, width: 440, height: 300, padding: "34px 36px", position: "relative", overflow: "hidden" }}>
          <div style={{ fontSize: 32, fontWeight: 500, color: K.muted }}>{S.stats.users}</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
            <div style={{ fontSize: 120, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.1 }}>0</div>
            <div style={{ fontSize: 30, color: K.dim }}>{S.usersNote}</div>
          </div>
          <svg width={370} height={40} style={{ position: "absolute", bottom: 34, left: 36 }}>
            <line x1={0} y1={30} x2={370 * line} y2={30} stroke={K.red} strokeWidth={6} strokeLinecap="round" />
          </svg>
        </Card>
        <Card style={{ ...api.style, width: 440, height: 300, padding: "34px 36px", display: "flex", flexDirection: "column", justifyContent: "space-between", border: `2px solid ${K.green}` }}>
          <div style={{ fontSize: 32, fontWeight: 500, color: K.muted }}>{S.stats.api}</div>
          <div style={{ fontSize: 96, fontWeight: 800, letterSpacing: "-0.04em", color: K.green, fontVariantNumeric: "tabular-nums" }}>${price}</div>
        </Card>
      </Center>
      <Center y={1270}>
        <div style={{ ...cheap.style }}>
          <span style={{ fontSize: 120, fontWeight: 800, letterSpacing: "-0.04em" }}>
            <TactileGlassWord {...GLASS}>{S.cheap}</TactileGlassWord>
          </span>
        </div>
      </Center>
    </>
  );
};

/* ───────── Composition ───────── */

export const makeBillionReel = (F: T, VO: { src: string; from: number; dur: number }[], S: Strings): React.FC => {
  const scenes = [
    { range: [0, F.buildIn] as const, El: Intro(F, S) },
    { range: [F.buildIn, F.pitchIn] as const, El: Build(F, S) },
    { range: [F.pitchIn, F.dashIn] as const, El: Pitch(F, S) },
    { range: [F.dashIn, F.duration + 30] as const, El: Dash(F, S) },
  ];
  const sfx = [
    { src: "sfx/07_CineStrike.wav", from: 4, volume: 0.3 },
    { src: "sfx/04_Cyber_Shift.wav", from: 24, volume: 0.18 },
    { src: "sfx2/ding.mp3", from: F.billion + 10, volume: 0.5 },
    { src: "sfx2/pop.mp3", from: F.showHow + 12, volume: 0.45 },
    { src: "sfx2/whoosh.mp3", from: F.buildIn - 8, volume: 0.45 },
    { src: "sfx2/pop.mp3", from: F.chatgpt + 2, volume: 0.4 },
    { src: "sfx/01_Ripple_Textures.wav", from: F.dress, volume: 0.25 },
    { src: "sfx2/ding.mp3", from: F.logo + 2, volume: 0.4 },
    { src: "sfx2/whoosh.mp3", from: F.pitchIn - 8, volume: 0.45 },
    { src: "sfx2/pop.mp3", from: F.infra + 22, volume: 0.35 },
    { src: "sfx2/pop.mp3", from: F.infra + 38, volume: 0.35 },
    { src: "sfx2/pop.mp3", from: F.infra + 54, volume: 0.35 },
    { src: "sfx/07_CineStrike.wav", from: F.raised, volume: 0.28 },
    { src: "sfx2/ding.mp3", from: F.forty + 40, volume: 0.5 },
    { src: "sfx2/whoosh.mp3", from: F.dashIn - 8, volume: 0.45 },
    { src: "sfx2/crickets.mp3", from: F.zeroUsers + 30, volume: 0.5 },
    { src: "sfx2/pop.mp3", from: F.api + 2, volume: 0.45 },
    { src: "sfx2/rimshot.mp3", from: F.cents + 24, volume: 0.6 },
  ];
  const C: React.FC = () => (
    <ReelShell scenes={scenes} headlines={S.headlines(F)} vo={VO} sfx={sfx} duration={F.duration} shift={130} silences={[[F.zeroUsers + 30, F.but]]} />
  );
  return C;
};

export const Video3 = makeBillionReel(F3, VO3, RU);
