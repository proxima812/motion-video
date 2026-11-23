import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Building2, Globe, Handshake, Users } from "lucide-react";
import { AchievementPop } from "@/components/remocn/achievement-pop";
import { ContributionHeatmap } from "@/components/remocn/contribution-heatmap";
import { GitHubSponsors } from "@/components/remocn/github-sponsors";
import { TestimonialStack } from "@/components/remocn/testimonial-stack";
import { UnitGrid } from "@/components/remocn/unit-grid";
import { GshFlat } from "@/lib/remocn/gsh/gsh-ground";
import { DotOrbitBg } from "../kit/DotOrbitBg";
import { HEADING, INK, PARAGRAPH } from "../kit/design";
import { setClock } from "../fable/clock";
import { tokens, useEnginePaint } from "../kit/reel";
import { Header, Strike, Words } from "../catalog/own/text";
import { Chip } from "../catalog/own/surfaces";
import { InterScope, ScaleFill } from "../catalog/own/fx";

// Test reel (no VO): "Год tatarverse" built only from catalog components. @the_tatarverse look, RU, 9:16, 60 fps.
// <= 7 words per frame; the rest is told by the components (grids, cards, heatmap, hearts).
const ACCENT = "#6E33CC";
const FADE = 8;

type Scene = { len: number; El: React.FC<{ f: number }> };

const Hook: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: "150px 100px" }}>
    <div style={{ ...HEADING, fontSize: 120, textAlign: "center" }}>
      <Words text="Год *tatarverse*" frame={f} at={8} stagger={10} />
    </div>
    <div style={{ ...PARAGRAPH, fontSize: 48, marginTop: 36, opacity: interpolate(f, [40, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>в цифрах</div>
  </AbsoluteFill>
);

const NotSearch: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 40 }}>
    <div style={{ ...HEADING, fontSize: 104 }}>
      <Words text="Не" frame={f} at={6} /> <Strike frame={f} at={30}>искать</Strike>
    </div>
    <div style={{ ...HEADING, fontSize: 104 }}>
      <Words text="а *найти* своих" frame={f} at={90} stagger={6} />
    </div>
  </AbsoluteFill>
);

const CHIPS = [
  ["Центры", Building2],
  ["Общества", Users],
  ["Союзы", Handshake],
  ["Онлайн", Globe],
] as const;
const Filters: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill>
    <Header frame={f} at={4} top={560} size={96}>
      Ищи по <b>смыслу</b>
    </Header>
    <div style={{ position: "absolute", left: 100, right: 100, top: 820, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 22 }}>
      {CHIPS.map(([c, icon], i) => (
        <Chip key={c} frame={f} at={24 + i * 7} on={i === 3 ? 100 : undefined} accent={ACCENT} icon={icon} size={44}>
          {c}
        </Chip>
      ))}
    </div>
  </AbsoluteFill>
);

/** third-party full-frame scene: white GSH ground, Inter, own timeline from 0 */
const Remocn: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <GshFlat.Provider value="#FFFFFF">
    <InterScope>{children}</InterScope>
  </GshFlat.Provider>
);

const SCENES: Scene[] = [
  { len: 150, El: Hook },
  { len: 190, El: NotSearch },
  { len: 230, El: () => <Remocn><UnitGrid total={100} highlighted={33} caption="онлайн" accent={ACCENT} theme="light" /></Remocn> },
  { len: 190, El: Filters },
  {
    len: 250,
    El: () => (
      <Remocn>
        <AchievementPop theme="light" accent={ACCENT} totalLabel="Итого" unit="" logo={false} speed={1.2} achievements={[{ label: "Добавлено", title: "410 центров", points: 410, icon: "trophy" }, { label: "Сделано", title: "Карта", points: 120, icon: "bolt" }, { label: "Новое", title: "EN-версия", points: 80, icon: "star" }]} />
      </Remocn>
    ),
  },
  {
    len: 260,
    El: () => (
      <Remocn>
        <TestimonialStack theme="light" accent={ACCENT} title="Что говорят" framesPerQuote={60} quotes={[{ text: "Нашла центр в Берлине за минуту", highlight: "за минуту", name: "Алсу", role: "Берлин", stars: 5 }, { text: "Все общины в одном месте", highlight: "в одном месте", name: "Рустем", role: "Сиэтл", stars: 5 }, { text: "Наш клуб добавили за день", highlight: "за день", name: "Ильдар", role: "Казань", stars: 5 }]} />
      </Remocn>
    ),
  },
  { len: 220, El: () => <Remocn><ScaleFill k={1.12}><ContributionHeatmap value={1240} label="правок благодаря вам" accent={ACCENT} theme="light" /></ScaleFill></Remocn> },
  {
    len: 330,
    El: () => (
      <Remocn>
        <ScaleFill k={1.22}>
          <GitHubSponsors theme="light" accentColor="#FF3040" thanks="Спасибо вам" caption="за подписку и поддержку" cta="Подписаться" link="instagram.com/the_tatarverse" sponsors={["alsu", "rustem", "ildar", "gulnara", "timur", "dinara", "aidar", "leysan", "kamil", "regina", "marat", "elvira", "azat", "nailya", "ruslan", "liliya", "bulat", "alina"].map((login) => ({ login, avatarUrl: "" }))} />
        </ScaleFill>
      </Remocn>
    ),
  },
];

const STARTS = SCENES.reduce<number[]>((acc, s, i) => [...acc, i === 0 ? 0 : acc[i - 1] + SCENES[i - 1].len], []);
export const TEST_FRAMES = STARTS[STARTS.length - 1] + SCENES[SCENES.length - 1].len;

// transitions: ripple between scenes, glitch on the strike, pops on chips, basscrack on the thank-you
const SFX: { src: string; at: number; volume: number }[] = [
  ...STARTS.slice(1).map((at, i) => ({ src: i % 2 ? "sfx/04_Cyber_Shift.wav" : "sfx/01_Ripple_Textures.wav", at, volume: 0.18 })),
  { src: "sfx/05_Distortion_Glitch.wav", at: STARTS[1] + 30, volume: 0.05 },
  ...CHIPS.map((_, i) => ({ src: "sfx2/pop.mp3", at: STARTS[3] + 24 + i * 7, volume: 0.3 })),
  { src: "sfx2/click.mp3", at: STARTS[3] + 100, volume: 0.4 },
  { src: "sfx/03_Basscrack.wav", at: STARTS[7] + 40, volume: 0.12 },
];

export const VideoTest: React.FC = () => {
  const frame = useCurrentFrame();
  setClock(frame, 60);
  useEnginePaint(frame);
  return (
    <AbsoluteFill style={{ ...tokens, background: "#fff", color: INK, fontFamily: PARAGRAPH.fontFamily, fontVariantNumeric: PARAGRAPH.fontVariantNumeric, WebkitFontSmoothing: "antialiased" }}>
      <DotOrbitBg variant={3} />
      {SCENES.map(({ len, El }, i) => {
        const at = STARTS[i];
        if (frame < at - FADE || frame >= at + len + FADE) return null;
        const o = interpolate(frame, [at - FADE, at, at + len - 1, at + len + FADE - 1], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <AbsoluteFill key={i} style={{ opacity: o }}>
            <Sequence from={at} durationInFrames={len + FADE} layout="none">
              <AbsoluteFill>
                <Local El={El} at={at} />
              </AbsoluteFill>
            </Sequence>
          </AbsoluteFill>
        );
      })}
      {SFX.map((s, i) => (
        <Sequence key={i} from={s.at} layout="none">
          <Audio src={staticFile(s.src)} volume={s.volume} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

/** scene sees its own frame (0 at its start) */
const Local: React.FC<{ El: Scene["El"]; at: number }> = ({ El }) => <El f={useCurrentFrame()} />;
