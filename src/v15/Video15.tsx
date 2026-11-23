import React from "react";
import { Img, staticFile } from "remotion";
import { SPRING, ease, lerp, progress, springAt } from "../stage/motion";
import { Card, Center, K, Pill, ReelShell, pop, shake } from "../kit/reel";
import { TatAvatar, type AvatarKey } from "../kit/TatAvatar";
import { F, VO } from "./timeline";
import { WORDS } from "./words";

// "Почему молодежь не приходит" (@the_tatarverse, RU). Violet accent: youth, something new.
const G = { main: "#5A2FB8", vivid: "#7C4DFF", glow: "#CDB9FF", soft: "#F2EDFF", ink: "#2e2e2f" };

/** Line drawn across text from left to right over [at, at + 14] */
const Strike: React.FC<{ frame: number; at: number; color?: string; children: React.ReactNode }> = ({ frame, at, color = K.red, children }) => {
  const w = ease.out(progress(frame, at, at + 14));
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <span style={{ opacity: 1 - 0.55 * w }}>{children}</span>
      <span style={{ position: "absolute", left: -10, top: "52%", height: 10, borderRadius: 5, width: `calc(${w * 100}% + ${w * 20}px)`, background: color }} />
    </span>
  );
};

/** Rubber stamp that slams in at `at` */
const Stamp: React.FC<{ frame: number; at: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ frame, at, children, style }) => {
  const s = springAt(frame, at, SPRING.bouncy);
  return (
    <div
      style={{
        opacity: Math.min(1, s * 1.6),
        transform: `rotate(${lerp(-30, -10, s)}deg) scale(${lerp(1.8, 1, Math.min(s, 1.1))})`,
        padding: "14px 32px",
        border: `8px solid ${K.red}`,
        borderRadius: 24,
        color: K.red,
        fontSize: 54,
        fontWeight: 800,
        background: "rgba(255,255,255,0.92)",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/* ───────── Scenes ───────── */

// 1. Hook: the question word by word, "национальные центры" lands as a violet sticker, an empty row of chairs
const HOOK = ["почему", "молодежь", "не приходит в"];
const HOOK_AT = [100, F.youth, F.comeNot];
const Hook: React.FC<{ frame: number }> = ({ frame }) => {
  const top = pop(frame, 0, SPRING.smooth);
  const sticker = springAt(frame, F.centers - 4, SPRING.bouncy);
  return (
    <>
      <Center y={430}>
        <div style={{ ...top.style, fontSize: 76, fontWeight: 700, color: G.main, letterSpacing: "-0.04em" }}>Большинство не понимает,</div>
      </Center>
      <Center y={560}>
        <div style={{ maxWidth: 960, textAlign: "center", fontSize: 100, fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1.1, color: G.ink }}>
          {HOOK.map((w, i) => {
            const t = springAt(frame, HOOK_AT[i], SPRING.smooth);
            return (
              <span key={i} style={{ display: "inline-block", marginRight: "0.24em", opacity: Math.min(1, t * 1.3), transform: `translateY(${(1 - t) * 30}px)`, filter: `blur(${Math.max(0, (1 - t) * 8)}px)` }}>
                {w}
              </span>
            );
          })}
        </div>
      </Center>
      <Center y={900}>
        <div
          style={{
            opacity: Math.min(1, sticker * 1.6),
            transform: `rotate(${lerp(-18, -4, sticker)}deg) scale(${lerp(1.6, 1, Math.min(sticker, 1.1))})`,
            padding: "24px 54px",
            borderRadius: 40,
            background: G.vivid,
            color: "#fff",
            fontSize: 68,
            fontWeight: 800,
            letterSpacing: "-0.04em",
            whiteSpace: "nowrap",
            boxShadow: `0 30px 70px -20px ${G.glow}`,
          }}
        >
          🏛 национальные центры
        </div>
      </Center>
      <Center y={1120}>
        <div style={{ display: "flex", gap: 30 }}>
          {Array.from({ length: 5 }, (_, i) => {
            const p = pop(frame, F.centers + 16 + i * 5, SPRING.bouncy);
            return (
              <span key={i} style={{ ...p.style, fontSize: 84, filter: "grayscale(0.4)" }}>
                🪑
              </span>
            );
          })}
        </div>
      </Center>
    </>
  );
};

// 2. They don't even know it exists: a ghost building on a map, a pin with "а такое есть?"
const DontKnow: React.FC<{ frame: number }> = ({ frame }) => {
  const map = pop(frame, F.dontKnowIn + 4, SPRING.smooth);
  const ghost = 0.18 + 0.1 * Math.sin(frame / 14);
  const bubble = pop(frame, F.exist - 6, SPRING.bouncy);
  const q = springAt(frame, F.knowNot, SPRING.bouncy);
  return (
    <>
      <Center y={400}>
        <Card style={{ ...map.style, width: 820, height: 560, borderRadius: 44, position: "relative", overflow: "hidden", background: "#F6F6F8" }}>
          {/* streets */}
          {[140, 330].map((y) => (
            <div key={y} style={{ position: "absolute", left: 0, right: 0, top: y, height: 34, background: "#fff" }} />
          ))}
          {[230, 560].map((x) => (
            <div key={x} style={{ position: "absolute", top: 0, bottom: 0, left: x, width: 34, background: "#fff" }} />
          ))}
          {/* the center: dashed, barely visible */}
          <div
            style={{
              position: "absolute",
              left: 300,
              top: 200,
              width: 230,
              height: 110,
              borderRadius: 20,
              border: `5px dashed ${G.main}`,
              opacity: ghost,
              display: "grid",
              placeItems: "center",
              fontSize: 70,
            }}
          >
            🏛
          </div>
          <div style={{ position: "absolute", left: 385, top: 70, fontSize: 90, transform: `scale(${q}) translateY(${(1 - q) * -40}px)`, opacity: Math.min(1, q * 1.5) }}>📍</div>
          <div style={{ position: "absolute", left: 60, bottom: 40, fontSize: 30, fontWeight: 600, color: K.dim }}>вы здесь, в 10 минутах</div>
        </Card>
      </Center>
      <Center y={1010}>
        <div
          style={{
            ...bubble.style,
            padding: "26px 50px",
            borderRadius: 50,
            background: G.ink,
            color: "#fff",
            fontSize: 70,
            fontWeight: 700,
            letterSpacing: "-0.03em",
          }}
        >
          а такое есть? 🤔
        </div>
      </Center>
    </>
  );
};

// 3. The poster looks like it's only for the older generation: a dusty event poster, then a "50+" stamp
const Poster: React.FC<{ frame: number }> = ({ frame }) => {
  const card = pop(frame, F.info - 6, SPRING.bouncy);
  const lines = [F.events, F.looks, F.meant];
  return (
    <Center y={420}>
      <div style={{ position: "relative" }}>
        <Card style={{ ...card.style, width: 760, padding: "50px 56px", borderRadius: 30, background: "#F4EFE4", boxShadow: "0 30px 60px -30px rgba(0,0,0,0.35)" }}>
          <div style={{ textAlign: "center", fontSize: 40, letterSpacing: "0.2em", color: "#8C7B5E", fontWeight: 600 }}>🌹 АФИША 🌹</div>
          <div style={{ textAlign: "center", fontSize: 64, fontWeight: 800, color: "#6B5A3E", margin: "24px 0", lineHeight: 1.1 }}>
            Торжественный
            <br />
            вечер
          </div>
          {["вход по пригласительным", "начало в 14:00", "просьба не опаздывать"].map((t, i) => {
            const p = pop(frame, lines[i], SPRING.smooth);
            return (
              <div key={t} style={{ ...p.style, textAlign: "center", fontSize: 38, color: "#8C7B5E", fontWeight: 500, marginTop: 14 }}>
                {t}
              </div>
            );
          })}
          <div style={{ marginTop: 34, height: 110, borderRadius: 16, background: "#E4DCCB", display: "grid", placeItems: "center", fontSize: 30, color: "#A69676", fontWeight: 600, filter: "blur(0.6px)" }}>
            фото.jpg 640×480
          </div>
        </Card>
        <div style={{ position: "absolute", right: -50, bottom: -50 }}>
          <Stamp frame={frame} at={F.older + 6}>
            только 50+?
          </Stamp>
        </div>
      </div>
    </Center>
  );
};

// 4. Not only concerts: the concert pill shrinks, eight tiles pop in on each spoken word
const NEEDS = [
  { at: F.meet, icon: "🤝", text: "знакомства" },
  { at: F.clubs, icon: "🗣", text: "языковые клубы" },
  { at: F.lectures, icon: "🎓", text: "лекции" },
  { at: F.music, icon: "🎧", text: "музыка" },
  { at: F.cinema, icon: "🎬", text: "кино" },
  { at: F.sport, icon: "⚽", text: "спорт" },
  { at: F.volunteer, icon: "🙌", text: "волонтерство" },
  { at: F.modern, icon: "🚀", text: "современные проекты" },
];
const Need: React.FC<{ frame: number }> = ({ frame }) => {
  const pill = pop(frame, F.concerts - 30, SPRING.bouncy);
  const small = ease.inOut(progress(frame, F.meet - 16, F.meet + 4));
  return (
    <>
      <Center y={340}>
        <div style={{ ...pill.style, transform: `${pill.style.transform} scale(${1 - small * 0.4})`, opacity: (pill.style.opacity as number) * (1 - small * 0.45) }}>
          <Pill style={{ fontSize: 76, fontWeight: 700, padding: "20px 50px", color: G.main, background: G.soft }}>не только 🎤 концерты</Pill>
        </div>
      </Center>
      <Center y={470}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 440px)", gap: 22 }}>
          {NEEDS.map((n, i) => {
            const s = pop(frame, n.at - 4, SPRING.bouncy);
            const last = i === NEEDS.length - 1;
            return (
              <Card
                key={n.text}
                style={{
                  ...s.style,
                  height: 136,
                  padding: "0 30px",
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  borderRadius: 32,
                  background: last ? G.vivid : K.surface,
                  color: last ? "#fff" : K.text,
                }}
              >
                <span style={{ fontSize: 60 }}>{n.icon}</span>
                <span style={{ fontSize: 38, fontWeight: 600, lineHeight: 1.05 }}>{n.text}</span>
              </Card>
            );
          })}
        </div>
      </Center>
    </>
  );
};

// 5. The question flips: "почему не приходит?" is crossed out, "что мы ей предлагаем?" takes over, tatarverse projects
const ICONS = ["tt", "bs", "qt"];
const Ask: React.FC<{ frame: number }> = ({ frame }) => {
  const a = pop(frame, F.askIn + 16, SPRING.smooth);
  const down = ease.inOut(progress(frame, F.q2 - 4, F.q2 + 20));
  const sh = shake(frame, F.comeNot2 + 20, 10, 18);
  const b = pop(frame, F.what - 6, SPRING.bouncy);
  const line = ease.out(progress(frame, F.offer + 10, F.offer + 36));
  const row = springAt(frame, F.offer + 30, SPRING.smooth);
  return (
    <>
      <Center y={400}>
        <div style={{ ...a.style, transform: `${a.style.transform} translateX(${sh}px) scale(${1 - down * 0.35}) translateY(${-down * 60}px)`, opacity: (a.style.opacity as number) * (1 - down * 0.45) }}>
          <div style={{ textAlign: "center", fontSize: 84, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.1, color: G.ink }}>
            <Strike frame={frame} at={F.q2 + 4}>почему не приходит?</Strike>
          </div>
        </div>
      </Center>
      <Center y={640}>
        <div style={{ ...b.style, textAlign: "center", fontSize: 108, fontWeight: 800, letterSpacing: "-0.05em", lineHeight: 1.05, color: G.ink }}>
          что мы ей
          <br />
          <span style={{ position: "relative", color: G.main }}>
            предлагаем?
            <span style={{ position: "absolute", left: 0, bottom: -4, height: 14, borderRadius: 7, width: `${line * 100}%`, background: G.glow, opacity: 0.85 }} />
          </span>
        </div>
      </Center>
      <Center y={1010}>
        <div style={{ display: "flex", alignItems: "center", gap: lerp(200, 28, row), opacity: Math.min(1, row * 1.5) }}>
          {ICONS.map((k) => (
            <Card key={k} style={{ width: 120, height: 120, borderRadius: 34, display: "grid", placeItems: "center" }}>
              <Img src={staticFile(`tatarverse/icons/${k}.svg`)} style={{ width: 76, height: 76, objectFit: "contain" }} />
            </Card>
          ))}
        </div>
      </Center>
    </>
  );
};

/* ───────── Composition ───────── */

const SCENES = [
  { range: [0, F.dontKnowIn] as const, El: Hook },
  { range: [F.dontKnowIn, F.posterIn] as const, El: DontKnow },
  { range: [F.posterIn, F.needIn] as const, El: Poster },
  { range: [F.needIn, F.askIn] as const, El: Need },
  { range: [F.askIn, F.duration + 30] as const, El: Ask },
];

const HEADLINES = [
  { from: 0, text: "" },
  { from: F.dontKnowIn + 6, text: "Возможно, она просто" },
  { from: F.posterIn + 6, text: "Или афиша выглядит так" },
  { from: F.needIn + 6, text: "Молодежи нужны" },
  { from: F.askIn + 6, text: "Вопрос не только в том," },
  { from: F.q2 - 10, text: "Вопрос в том," },
];

const SFX = [
  { src: "sfx/07_CineStrike.wav", from: 2, volume: 0.22 },
  { src: "sfx/03_Basscrack.wav", from: F.centers - 2, volume: 0.14 },
  { src: "sfx2/pop.mp3", from: F.centers, volume: 0.3 },
  // scene transitions: textures from the SFX/ library, no whoosh
  { src: "sfx/06_Ripple_Textures_II.wav", from: F.dontKnowIn - 8, volume: 0.22 },
  { src: "sfx/04_Cyber_Shift.wav", from: F.posterIn - 8, volume: 0.25 },
  { src: "sfx/02_Alienated_Warpes.wav", from: F.needIn - 8, volume: 0.16 },
  { src: "sfx/01_Ripple_Textures.wav", from: F.askIn - 8, volume: 0.2 },
  { src: "sfx2/pop.mp3", from: F.knowNot, volume: 0.28 },
  { src: "sfx2/pop.mp3", from: F.exist - 4, volume: 0.3 },
  { src: "sfx/03_Basscrack.wav", from: F.older + 8, volume: 0.14 },
  { src: "sfx2/pop.mp3", from: F.concerts - 28, volume: 0.28 },
  ...NEEDS.map((n) => ({ src: "sfx2/click.mp3", from: n.at, volume: 0.25 })),
  { src: "sfx2/ding.mp3", from: F.modern + 2, volume: 0.28 },
  { src: "sfx/05_Distortion_Glitch.wav", from: F.q2 + 4, volume: 0.045 },
  { src: "sfx/07_CineStrike.wav", from: F.what - 6, volume: 0.2 },
  { src: "sfx2/ding.mp3", from: F.offer + 30, volume: 0.28 },
];

// Host emotion follows the voice, a swap every ~2 s; never the same photo twice in a row
const AVATAR_KEYS: AvatarKey[] = [
  { at: 0, e: "portrait-traditional" },
  { at: F.youth, e: "confident-emerald" },
  { at: F.dontKnowIn, e: "smile-green" },
  { at: F.exist - 10, e: "kalpak-green" },
  { at: F.posterIn, e: "portrait-green" },
  { at: F.looks, e: "confident-traditional" },
  { at: F.older, e: "smile-green" },
  { at: F.needIn, e: "kalpak-green" },
  { at: F.meet, e: "confident-emerald" },
  { at: F.lectures + 20, e: "smile-green" },
  { at: F.sport, e: "kalpak-green" },
  { at: F.modern, e: "portrait-green" },
  { at: F.askIn, e: "confident-traditional" },
  { at: F.comeNot2, e: "portrait-traditional" },
  { at: F.q2 + 30, e: "confident-emerald" },
  { at: F.offer + 40, e: "smile-green" },
];
const Host: React.FC<{ frame: number }> = ({ frame }) => <TatAvatar frame={frame} keys={AVATAR_KEYS} words={WORDS} color={G.main} />;

export const Video15: React.FC = () => (
  <ReelShell scenes={SCENES} headlines={HEADLINES} headlineSize={76} vo={VO} sfx={SFX} duration={F.duration} music="v15/music/bed.mp3" musicLevel={[0.045, 0.11]} shift={30} overlay={Host} />
);
