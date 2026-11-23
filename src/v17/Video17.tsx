import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { ChatGpt } from "@/components/remocn/chat-gpt";
import { CompactStat } from "@/components/remocn/compact-stat";
import { CrashZoom } from "@/components/remocn/crash-zoom";
import { ExplodedView } from "@/components/remocn/exploded-view";
import { HookPunch } from "@/components/remocn/hook-punch";
import { ImpactShake } from "@/components/remocn/impact-shake";
import { LongVowel } from "@/components/remocn/long-vowel";
import { PovSetup } from "@/components/remocn/pov-setup";
import { PromptRestyle } from "@/components/remocn/prompt-restyle";
import { PromptToApp } from "@/components/remocn/prompt-to-app";
import { RankClimb } from "@/components/remocn/rank-climb";
import { SpeedrunTimer } from "@/components/remocn/speedrun-timer";
import { GshFlat } from "@/lib/remocn/gsh/gsh-ground";
import { SPRING, springAt } from "../stage/motion";
import { fontFamily } from "../ui/theme";
import { F, VO } from "./timeline";

// "Сколько вайб-проектов", gen Z cut: deadpan narrator vs an over-eager AI,
// a new Remocn beat every 1.5-2 s, full-bleed on white with an orange-red accent.

const INK = "#16161A";
const A = "#F0361C";
const A2 = "#FF7A1A";
const A3 = "#D90F3A";
const HOT = `linear-gradient(100deg, ${A2} 0%, ${A} 50%, ${A3} 100%)`;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const pop = (f: number, at: number) => springAt(f, at, SPRING.bouncy);

/** Hard cut in with a short punch-in (no slow fades: gen Z pacing) */
const Scene: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => (
  <Sequence from={from} durationInFrames={to - from}>
    <Punch>{children}</Punch>
  </Sequence>
);
const Punch: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const f = useCurrentFrame();
  const k = interpolate(f, [0, 7], [1.06, 1], clamp);
  return <AbsoluteFill style={{ transform: `scale(${k})` }}>{children}</AbsoluteFill>;
};

/** CRT switch-off (CSS take on remocn tv-power-off, whose canvas capture API is missing in the render browser):
 * picture squashes to a blown-out line, pinches to a dot, dot decays on black. */
const PowerOff: React.FC<{ at: number; len?: number; glow?: string; children: React.ReactNode }> = ({ at, len = 30, glow = "#FFD2B8", children }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + len], [0, 1], clamp);
  if (p <= 0) return <AbsoluteFill>{children}</AbsoluteFill>;
  const sy = interpolate(p, [0, 0.6], [1, 0.006], { ...clamp, easing: (x) => x * x });
  const sx = interpolate(p, [0.6, 0.82], [1, 0.012], clamp);
  const lit = interpolate(p, [0, 0.6], [1, 6], clamp);
  const dot = interpolate(p, [0.82, 1], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {p < 0.82 ? (
        <AbsoluteFill style={{ transform: `scale(${sx}, ${sy})`, filter: `brightness(${lit}) saturate(${1 / lit})`, boxShadow: `0 0 80px 30px ${glow}` }}>{children}</AbsoluteFill>
      ) : (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 26, height: 26, borderRadius: 13, background: "#fff", boxShadow: `0 0 60px 24px ${glow}`, opacity: dot }} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

/** Start a component part-way into its own timeline */
const Skip: React.FC<{ frames: number; children: React.ReactNode }> = ({ frames, children }) => (
  <Sequence from={-frames} layout="none">
    {children}
  </Sequence>
);

/** Zoom into the center of a component that is drawn for 16:9 */
const Zoom: React.FC<{ k: number; y?: number; children: React.ReactNode }> = ({ k, y = 0, children }) => (
  <AbsoluteFill style={{ transform: `translateY(${y}px) scale(${k})` }}>{children}</AbsoluteFill>
);

const Header: React.FC<{ frame: number; at: number; children: React.ReactNode; top?: number }> = ({ frame, at, children, top = 200 }) => {
  const p = pop(frame, at);
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        top,
        textAlign: "center",
        fontFamily,
        fontWeight: 800,
        fontSize: 68,
        lineHeight: 1.1,
        letterSpacing: "-0.035em",
        color: INK,
        opacity: Math.min(1, p),
        transform: `translateY(${(1 - p) * 40}px)`,
      }}
    >
      {children}
    </div>
  );
};

const Badge: React.FC<{ frame: number; at: number; y: number; children: React.ReactNode; rot?: number }> = ({ frame, at, y, children, rot = -3 }) => {
  if (frame < at) return null;
  const p = pop(frame, at);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          fontFamily,
          fontWeight: 800,
          fontSize: 54,
          letterSpacing: "-0.02em",
          color: "#fff",
          background: HOT,
          padding: "18px 38px",
          borderRadius: 999,
          boxShadow: "0 18px 40px rgba(240,54,28,0.35)",
          transform: `scale(${p}) rotate(${rot}deg)`,
          whiteSpace: "nowrap",
        }}
      >
        {children}
      </div>
    </div>
  );
};

/** The over-eager AI talking: assistant bubble at the bottom, words pop in with the voice */
const AiBubble: React.FC<{ frame: number; at: number; until: number; text: string; y?: number }> = ({ frame, at, until, text, y = 1530 }) => {
  if (frame < at || frame > until) return null;
  const p = pop(frame, at);
  const out = interpolate(frame, [until - 6, until], [1, 0], clamp);
  const words = text.split(" ");
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: y, display: "flex", alignItems: "flex-end", gap: 18, opacity: out, transform: `scale(${0.6 + 0.4 * p})`, transformOrigin: "0% 100%" }}>
      <div style={{ width: 84, height: 84, borderRadius: 42, flex: "none", background: HOT, color: "#fff", fontFamily, fontWeight: 800, fontSize: 32, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 26px rgba(240,54,28,0.35)" }}>
        ИИ
      </div>
      <div style={{ background: "#F2F1EE", borderRadius: "34px 34px 34px 8px", padding: "22px 30px", fontFamily, fontWeight: 700, fontSize: 48, lineHeight: 1.15, letterSpacing: "-0.02em", color: INK }}>
        {words.map((w, i) => {
          const wp = interpolate(frame, [at + i * 5, at + i * 5 + 6], [0, 1], clamp);
          return (
            <span key={i} style={{ opacity: wp, display: "inline-block", transform: `translateY(${(1 - wp) * 14}px)` }}>
              {w}
              {i < words.length - 1 ? " " : ""}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// ---------- scenes ----------

const HookScene: React.FC = () => (
  <HookPunch theme="light" stop="Никто" scroll="не признает," lead="но твой стартап —" payoff="обертка." speed={0.51} fit={0.52} stage="#FFFFFF" />
);

const PovScene: React.FC = () => <PovSetup theme="light" setup="ты вайб-кодер" lead="есть" punch="идея." speed={1.8} fit={1.25} stage="#FFFFFF" />;

const ChatScene: React.FC = () => (
  <Zoom k={1.42} y={-60}>
    <ChatGpt textScale={2} greeting="Чем помочь?" placeholder="Спросите что-нибудь" prompt="сделай Uber для котов" accentColor={A} />
  </Zoom>
);

const AppScene: React.FC = () => {
  const f = useCurrentFrame() + F.app;
  return (
    <AbsoluteFill>
      <Skip frames={15}>
        <PromptToApp
          speed={3.5}
          accent={A}
          prompt="сделай Uber для котов"
          plan="Сделаю лендинг: градиент, кнопка и котики."
          files={["Hero.tsx", "Gradient.tsx", "Button.tsx", "page.tsx"]}
          doneMessage="Котобер готов. Пользователей пока нет."
          projectName="kotober"
          deployUrl="kotober.vercel.app"
          siteName="Котобер"
          siteEyebrow="Такси для котов · 24/7"
          siteHeadline="Uber, но для котов."
          siteBody="Мяукни в приложении, и кот-водитель уже едет."
          siteLinks={["Тарифы", "Коты", "Водители", "FAQ"]}
          pours={[
            { name: "Эконом", origin: "Коробка, без кондиционера", price: "99 ₽", tone: ["#FFB36B", A2] },
            { name: "Комфорт", origin: "Плед и вкусняшка", price: "199 ₽", tone: ["#FF7A5C", A] },
            { name: "Бизнес", origin: "Личный кот-водитель", price: "999 ₽", tone: ["#E8456B", A3] },
          ]}
        />
      </Skip>
      <AiBubble frame={f} at={F.app + 2} until={F.restyle} text="Отличная идея! Вот ваш стартап!" />
    </AbsoluteFill>
  );
};

const RestyleScene: React.FC = () => {
  const f = useCurrentFrame() + F.restyle;
  const local = (abs: number) => (abs - F.restyle) / 2;
  return (
    <AbsoluteFill>
      <PromptRestyle
        theme="light"
        background="#FFFFFF"
        accent={A}
        hero={HOT}
        headline="Котобер изменит мир"
        highlight="изменит мир"
        instructions={["сделай красивее", "еще красивее", "добавь градиент"]}
        starts={[0, local(F.prettier) - 4, local(F.ready) - 12]}
      />
      <AiBubble frame={f} at={F.ready} until={F.stack} text="Готово! Это шедевр!" y={1250} />
    </AbsoluteFill>
  );
};

const StackScene: React.FC = () => {
  const f = useCurrentFrame() + F.stack;
  const local = (abs: number) => (abs - F.stack) / 2 - 4;
  return (
    <AbsoluteFill>
      <ExplodedView
        portrait
        layers={4}
        labels={["Градиент", "ChatGPT", "Еще ChatGPT", "Надежда"]}
        highlight={3}
        labelAt={[local(F.gradient), local(F.gpt), local(F.gpt2), local(F.hope)]}
        closeAt={(F.speedrun - F.stack) / 2 - 8}
        shadowOpacity={0.1}
        colors={{ background: "#FFFFFF", top: "#F1EEEA", left: "#D3CDC6", right: "#B3ACA4", highlightTop: A, highlightLeft: "#C42A14", highlightRight: "#9E1F0E", line: INK, label: INK }}
      />
      <Header frame={f} at={F.stack + 4}>
        Стек вайб-проекта
      </Header>
    </AbsoluteFill>
  );
};

const SpeedrunScene: React.FC = () => {
  const f = useCurrentFrame() + F.speedrun;
  return (
    <AbsoluteFill>
      <Zoom k={1}>
        <SpeedrunTimer
          theme="light"
          stage="#FFFFFF"
          accent={A}
          speed={2.19}
          category="Стартап · Any%"
          banner="Мировой рекорд"
          splits={[
            { name: "Промпт", time: 20, pb: 60 },
            { name: "Градиент", time: 90, pb: 120 },
            { name: "Деплой", time: 240, pb: 600 },
          ]}
        />
      </Zoom>
      <AiBubble frame={f} at={F.record} until={F.many} text="Мировой рекорд!" y={1560} />
    </AbsoluteFill>
  );
};

const ManyScene: React.FC = () => {
  const f = useCurrentFrame() + F.many;
  return (
    <AbsoluteFill>
      <LongVowel word="Очень" letter="О" repeat={6} rest="много." theme="light" background="#FFFFFF" accent={A} ramp={[INK, "#7A1D10", A, A2, "#FFB24D"]} />
      <Header frame={f} at={F.many + 4}>
        Таких уже
      </Header>
    </AbsoluteFill>
  );
};

const StatScene: React.FC = () => (
  <Skip frames={104 - (F.million - F.stat)}>
    <CompactStat
      value={12000000}
      decimals={0}
      suffix=" млн"
      label="вайб-проектов"
      theme="light"
      background="#FFFFFF"
      accent={A}
      fill={`linear-gradient(170deg, #7A1D10 0%, ${A} 48%, ${A2} 100%)`}
    />
  </Skip>
);

const CrashScene: React.FC = () => (
  <AbsoluteFill>
    <CrashZoom theme="light" tease="Пользователей…" reveal="1." tagline="" speed={1.68} />
    <Sequence from={F.mom - F.crash - 14} layout="none">
      <AbsoluteFill style={{ transform: "translateY(520px)" }}>
        <ImpactShake text="МАМА." textScale={0.55} backgroundColor="transparent" foregroundColor={A} intensity={1.3} />
      </AbsoluteFill>
    </Sequence>
  </AbsoluteFill>
);

const RankScene: React.FC = () => {
  const f = useCurrentFrame() + F.rank;
  return (
    <PowerOff at={F.powerOff - F.rank}>
      <AbsoluteFill style={{ background: "#fff" }}>
        <RankClimb
          portrait
          theme="light"
          background="#FFFFFF"
          accent={A}
          paint={`linear-gradient(172deg, ${A3} 8%, ${A} 45%, ${A2} 90%)`}
          speed={3.4}
          brand="Котобер"
          from={6}
          to={1}
          eyebrow="Вайб-проект дня"
          caption="место в рейтинге"
          items={[
            { label: "ChatGPT-обертка", value: 1 },
            { label: "To-do с ИИ", value: 1 },
            { label: "ИИ-гороскоп", value: 1 },
            { label: "Лендинг «скоро»", value: 1 },
            { label: "Еще ChatGPT-обертка", value: 1 },
            { label: "Котобер", value: 2 },
          ]}
        />
        <Badge frame={f} at={F.numberOne + 8} y={1500}>
          голоса: мой + мамин
        </Badge>
      </AbsoluteFill>
    </PowerOff>
  );
};

const SFX = [
  { src: "sfx/07_CineStrike.wav", from: 2, volume: 0.16 },
  { src: "sfx2/pop.mp3", from: 26, volume: 0.3 },
  { src: "sfx/08_Meme_Boom.mp3", from: F.wrapper - 2, volume: 0.28 },
  { src: "sfx2/pop.mp3", from: F.pov, volume: 0.3 },
  { src: "sfx2/pop.mp3", from: F.pov + 60, volume: 0.3 },
  { src: "sfx2/typing.mp3", from: F.write - 6, volume: 0.3 },
  { src: "sfx2/click.mp3", from: F.app - 4, volume: 0.35 },
  { src: "sfx/04_Cyber_Shift.wav", from: F.app + 6, volume: 0.12 },
  { src: "sfx2/ding.mp3", from: F.startup, volume: 0.3 },
  { src: "sfx2/typing.mp3", from: F.restyle, volume: 0.22 },
  { src: "sfx2/typing.mp3", from: F.prettier - 8, volume: 0.22 },
  { src: "sfx2/ding.mp3", from: F.ready, volume: 0.3 },
  { src: "sfx/01_Ripple_Textures.wav", from: F.stack - 4, volume: 0.14 },
  { src: "sfx2/click.mp3", from: F.gradient - 4, volume: 0.35 },
  { src: "sfx2/click.mp3", from: F.gpt - 4, volume: 0.35 },
  { src: "sfx2/click.mp3", from: F.gpt2 - 4, volume: 0.35 },
  { src: "sfx/08_Meme_Boom.mp3", from: F.hope - 2, volume: 0.24 },
  { src: "sfx/06_Ripple_Textures_II.wav", from: F.speedrun - 4, volume: 0.12 },
  { src: "sfx2/click.mp3", from: F.speedrun + 28, volume: 0.25 },
  { src: "sfx2/click.mp3", from: F.speedrun + 46, volume: 0.25 },
  { src: "sfx2/click.mp3", from: F.speedrun + 61, volume: 0.25 },
  { src: "sfx/07_CineStrike.wav", from: F.record - 2, volume: 0.16 },
  { src: "sfx/02_Alienated_Warpes.wav", from: F.many - 4, volume: 0.12 },
  { src: "sfx2/pop.mp3", from: F.ochen, volume: 0.3 },
  { src: "sfx/03_Basscrack.wav", from: F.million - 2, volume: 0.2 },
  { src: "sfx/09_Record_Scratch.mp3", from: F.crash - 6, volume: 0.28 },
  { src: "sfx/03_Basscrack.wav", from: F.one - 2, volume: 0.2 },
  { src: "sfx/08_Meme_Boom.mp3", from: F.mom - 2, volume: 0.3 },
  { src: "sfx/04_Cyber_Shift.wav", from: F.rank - 4, volume: 0.12 },
  ...[0, 1, 2, 3, 4].map((k) => ({ src: "sfx2/click.mp3", from: F.rank + 18 + k * 7, volume: 0.22 })),
  { src: "sfx2/ding.mp3", from: F.numberOne, volume: 0.3 },
  { src: "sfx2/pop.mp3", from: F.numberOne + 8, volume: 0.3 },
  { src: "sfx/05_Distortion_Glitch.wav", from: F.powerOff, volume: 0.05 },
];

export const Video17: React.FC = () => (
  <AbsoluteFill style={{ background: "#fff" }}>
    <GshFlat.Provider value="#FFFFFF">
      <AbsoluteFill style={{ background: "#FFFFFF" }}>
            <Scene from={F.hook} to={F.pov}>
              <HookScene />
            </Scene>
            <Scene from={F.pov} to={F.chat}>
              <PovScene />
            </Scene>
            <Scene from={F.chat} to={F.app}>
              <ChatScene />
            </Scene>
            <Scene from={F.app} to={F.restyle}>
              <AppScene />
            </Scene>
            <Scene from={F.restyle} to={F.stack}>
              <RestyleScene />
            </Scene>
            <Scene from={F.stack} to={F.speedrun}>
              <StackScene />
            </Scene>
            <Scene from={F.speedrun} to={F.many}>
              <SpeedrunScene />
            </Scene>
            <Scene from={F.many} to={F.stat}>
              <ManyScene />
            </Scene>
            <Scene from={F.stat} to={F.crash}>
              <StatScene />
            </Scene>
            <Scene from={F.crash} to={F.rank}>
              <CrashScene />
            </Scene>
            <Scene from={F.rank} to={F.duration}>
              <RankScene />
            </Scene>
      </AbsoluteFill>
    </GshFlat.Provider>
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
